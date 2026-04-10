import path from 'node:path';
import os from 'node:os';
import chalk from 'chalk';
import yaml from 'js-yaml';
import { cloneRepo, isGitAvailable } from '../utils/git.js';
import { fileExists, readFileContent, copyDir, removeDir, ensureDir } from '../utils/fs.js';
import { loadTracker, getInstalledVersion } from '../core/tracker.js';
import { getAdapter, detectTargets } from '../adapters/index.js';

/**
 * Parse a GitHub URL into { url, branch, repoName }.
 * Accepts:
 *   https://github.com/user/repo
 *   github.com/user/repo
 *   https://github.com/user/repo#branch
 *   https://github.com/user/repo.git
 *
 * @param {string} raw
 * @returns {{ url: string, branch: string | null, repoName: string }}
 */
function parseGithubUrl(raw) {
  let input = raw.trim();

  // Split off #branch fragment
  let branch = null;
  const hashIndex = input.indexOf('#');
  if (hashIndex !== -1) {
    branch = input.slice(hashIndex + 1);
    input = input.slice(0, hashIndex);
  }

  // Normalise: add https:// if missing
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    input = `https://${input}`;
  }

  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new Error(`Invalid URL: "${raw}"`);
  }

  if (!parsed.hostname.includes('github.com')) {
    throw new Error(
      `Only GitHub URLs are supported. Got: "${parsed.hostname}"`
    );
  }

  // pathname looks like /user/repo or /user/repo.git
  const segments = parsed.pathname.replace(/\.git$/, '').split('/').filter(Boolean);

  if (segments.length < 2) {
    throw new Error(
      `Cannot extract owner/repo from URL: "${raw}". Expected format: github.com/owner/repo`
    );
  }

  const repoName = segments[1];

  return { url: input, branch, repoName };
}

/**
 * Locate manifest.yaml in a cloned directory.
 * Checks root first, then skills/ subdirectory.
 *
 * @param {string} cloneDir
 * @returns {Promise<{ manifestPath: string, packRoot: string } | null>}
 */
async function findManifest(cloneDir) {
  // Check root
  const rootManifest = path.join(cloneDir, 'manifest.yaml');
  if (await fileExists(rootManifest)) {
    return { manifestPath: rootManifest, packRoot: cloneDir };
  }

  // Check skills/ subdirectory
  const skillsManifest = path.join(cloneDir, 'skills', 'manifest.yaml');
  if (await fileExists(skillsManifest)) {
    return { manifestPath: skillsManifest, packRoot: path.join(cloneDir, 'skills') };
  }

  return null;
}

/**
 * Load and validate a manifest from a file path.
 * @param {string} manifestPath
 * @returns {Promise<object>}
 */
async function loadManifestFromPath(manifestPath) {
  const content = await readFileContent(manifestPath);
  const manifest = yaml.load(content);

  if (!manifest || typeof manifest !== 'object') {
    throw new Error('manifest.yaml is empty or invalid');
  }

  if (!manifest.name) {
    throw new Error('manifest.yaml is missing required field: name');
  }

  const hasContent =
    (manifest.rules && manifest.rules.length > 0) ||
    (manifest.skills && manifest.skills.length > 0) ||
    (manifest.agents && manifest.agents.length > 0);

  if (!hasContent) {
    throw new Error('manifest.yaml must have at least one of: rules, skills, agents');
  }

  return {
    name: manifest.name,
    version: manifest.version || '0.0.0',
    description: manifest.description || '',
    depends: manifest.depends || [],
    tags: manifest.tags || [],
    rules: manifest.rules || [],
    skills: manifest.skills || [],
    agents: manifest.agents || [],
  };
}

/**
 * Resolve target adapters (same logic as install command).
 * @param {string} projectDir
 * @param {string | undefined} targetOption
 * @returns {Promise<string[]>}
 */
async function resolveTargets(projectDir, targetOption) {
  if (targetOption) {
    const names = targetOption.split(',').map((t) => t.trim());
    names.forEach((n) => getAdapter(n));
    return names;
  }

  const detected = await detectTargets(projectDir);
  if (detected.length > 0) return detected;

  return ['claude'];
}

/**
 * Install a skill pack from a GitHub repository URL.
 *
 * @param {string} rawUrl - GitHub repository URL, optionally with #branch
 * @param {object} [options]
 * @param {string} [options.target] - Comma-separated target names
 */
export async function addCommand(rawUrl, options = {}) {
  // 1. Verify git is available
  if (!(await isGitAvailable())) {
    throw new Error(
      'git is not installed or not in PATH. Install git and try again.'
    );
  }

  // 2. Parse URL
  const { url, branch, repoName } = parseGithubUrl(rawUrl);

  console.log(
    chalk.gray(`Repository: ${url}${branch ? ` (branch: ${branch})` : ''}`)
  );

  // 3. Clone into temp directory
  const tmpDir = path.join(
    os.tmpdir(),
    `sp-clone-${repoName}-${Date.now()}`
  );

  console.log(chalk.gray('Cloning repository...'));

  try {
    await cloneRepo(url, tmpDir, branch);
  } catch (err) {
    throw new Error(
      `Failed to clone repository: ${err.message}`
    );
  }

  try {
    // 4. Find manifest.yaml
    const found = await findManifest(tmpDir);

    if (!found) {
      throw new Error(
        `No manifest.yaml found in repository root or skills/ subdirectory`
      );
    }

    const { manifestPath, packRoot } = found;

    // 5. Load and validate manifest
    const manifest = await loadManifestFromPath(manifestPath);

    console.log(
      chalk.gray(`Found pack: ${manifest.name}@${manifest.version}`)
    );

    // 6. Copy pack to local cache
    const projectDir = process.cwd();
    const cacheDir = path.join(projectDir, '.skill-pool-cache', '_external', repoName);

    await ensureDir(path.dirname(cacheDir));
    // Remove existing cache for this pack if present
    await removeDir(cacheDir);
    await copyDir(packRoot, cacheDir);

    console.log(chalk.gray(`Cached to .skill-pool-cache/_external/${repoName}/`));

    // 7. Resolve targets
    const targets = await resolveTargets(projectDir, options.target);
    console.log(chalk.gray(`Targets: ${targets.join(', ')}\n`));

    // 8. Check if already installed at same version
    let tracker = await loadTracker(projectDir);
    const currentVersion = getInstalledVersion(tracker, manifest.name);

    if (currentVersion === manifest.version) {
      console.log(
        chalk.yellow(`${manifest.name}@${manifest.version} already installed, skipping`)
      );
      return;
    }

    // 9. Run install via adapters
    let totalFiles = 0;
    for (const targetName of targets) {
      const adapter = getAdapter(targetName);
      const files = await adapter.install(manifest, projectDir);
      totalFiles += files.length;
    }

    console.log(
      chalk.green(`  + ${manifest.name}@${manifest.version}`) +
        chalk.gray(` (${totalFiles} files, source: github)`)
    );
    console.log(chalk.green(`\nInstalled 1 pack for ${targets.join(', ')}.`));
  } finally {
    // 11. Cleanup temp directory
    await removeDir(tmpDir);
  }
}
