import path from 'node:path';
import {
  ensureDir,
  writeFileAtomic,
  readFileContent,
  removeFile,
  fileExists,
  listDir,
  copyDir,
  removeDir,
  isDirectory,
} from '../utils/fs.js';
import { getSkillsDir } from '../core/manifest.js';

const MARKER_PREFIX = '<!-- skill-pool:';
const MARKER_SUFFIX = ' -->';
const MARKER_FILE = '.skill-pool-marker';
const MARKERS_JSON = '.skill-pool-markers.json';

function makeMarker(packName, version) {
  return `${MARKER_PREFIX}${packName}:${version}${MARKER_SUFFIX}`;
}

function parseMarker(content) {
  const match = content.match(/<!-- skill-pool:([^:]+):([^ ]+) -->/);
  if (!match) return null;
  return { pack: match[1], version: match[2] };
}

async function loadMarkersJson(dirPath) {
  const jsonPath = path.join(dirPath, MARKERS_JSON);
  if (await fileExists(jsonPath)) {
    const raw = await readFileContent(jsonPath);
    return JSON.parse(raw);
  }
  return {};
}

async function saveMarkersJson(dirPath, data) {
  const jsonPath = path.join(dirPath, MARKERS_JSON);
  await writeFileAtomic(jsonPath, JSON.stringify(data, null, 2));
}

function buildMdcFrontmatter(packName) {
  return [
    '---',
    `description: "skill-pool: ${packName} rules"`,
    'globs: ""',
    'alwaysApply: true',
    '---',
  ].join('\n');
}

export async function detect(projectDir) {
  return fileExists(path.join(projectDir, '.cursor'));
}

export async function install(manifest, projectDir) {
  const installed = [];
  const skillsDir = getSkillsDir();
  const marker = makeMarker(manifest.name, manifest.version);

  // Rules -> .cursor/rules/<pack>-<name>.mdc
  if (manifest.rules.length > 0) {
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    await ensureDir(rulesDir);
    const registry = await loadMarkersJson(rulesDir);

    for (const rulePath of manifest.rules) {
      const srcPath = path.join(skillsDir, manifest.name, rulePath);
      const content = await readFileContent(srcPath);
      const basename = path.basename(rulePath, path.extname(rulePath));
      const filename = `${manifest.name}-${basename}.mdc`;
      const destPath = path.join(rulesDir, filename);
      const frontmatter = buildMdcFrontmatter(manifest.name);
      await writeFileAtomic(destPath, `${frontmatter}\n\n${content}`);
      registry[filename] = { pack: manifest.name, version: manifest.version };
      installed.push(destPath);
    }

    await saveMarkersJson(rulesDir, registry);
  }

  // Skills -> .cursor/skills/<pack>-<name>/
  for (const skillPath of manifest.skills) {
    const srcPath = path.join(skillsDir, manifest.name, skillPath);
    const basename = path.basename(skillPath, path.extname(skillPath));
    const destDir = path.join(projectDir, '.cursor', 'skills', `${manifest.name}-${basename}`);

    if (await isDirectory(srcPath)) {
      await copyDir(srcPath, destDir);
    } else {
      await ensureDir(destDir);
      const content = await readFileContent(srcPath);
      await writeFileAtomic(path.join(destDir, 'SKILL.md'), content);
    }
    await writeFileAtomic(path.join(destDir, MARKER_FILE), marker);
    installed.push(destDir);
  }

  // Agents -> .cursor/rules/<pack>-agent-<name>.mdc
  if (manifest.agents.length > 0) {
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    await ensureDir(rulesDir);
    const registry = await loadMarkersJson(rulesDir);

    for (const agentPath of manifest.agents) {
      const srcPath = path.join(skillsDir, manifest.name, agentPath);
      const content = await readFileContent(srcPath);
      const basename = path.basename(agentPath, path.extname(agentPath));
      const filename = `${manifest.name}-agent-${basename}.mdc`;
      const destPath = path.join(rulesDir, filename);
      const frontmatter = buildMdcFrontmatter(manifest.name);
      await writeFileAtomic(destPath, `${frontmatter}\n\n${content}`);
      registry[filename] = { pack: manifest.name, version: manifest.version };
      installed.push(destPath);
    }

    await saveMarkersJson(rulesDir, registry);
  }

  return installed;
}

export async function remove(packName, projectDir) {
  const removed = [];

  // Remove rules + agent .mdc files
  await removeRegisteredFiles(path.join(projectDir, '.cursor', 'rules'), packName, removed);

  // Remove skills
  const skillsBase = path.join(projectDir, '.cursor', 'skills');
  const skillDirs = await listDir(skillsBase);
  for (const dir of skillDirs) {
    const markerPath = path.join(skillsBase, dir, MARKER_FILE);
    if (await fileExists(markerPath)) {
      const content = await readFileContent(markerPath);
      const parsed = parseMarker(content);
      if (parsed && parsed.pack === packName) {
        await removeDir(path.join(skillsBase, dir));
        removed.push(path.join(skillsBase, dir));
      }
    }
  }

  return removed;
}

async function removeRegisteredFiles(dirPath, packName, removed) {
  const registry = await loadMarkersJson(dirPath);
  let changed = false;

  for (const [filename, info] of Object.entries(registry)) {
    if (info.pack === packName) {
      const filePath = path.join(dirPath, filename);
      if (await fileExists(filePath)) {
        await removeFile(filePath);
      }
      removed.push(filePath);
      delete registry[filename];
      changed = true;
    }
  }

  if (changed) {
    if (Object.keys(registry).length === 0) {
      const jsonPath = path.join(dirPath, MARKERS_JSON);
      if (await fileExists(jsonPath)) await removeFile(jsonPath);
    } else {
      await saveMarkersJson(dirPath, registry);
    }
  }
}

export async function list(projectDir) {
  const results = [];

  // List rules + agents from registry
  const rulesDir = path.join(projectDir, '.cursor', 'rules');
  const registry = await loadMarkersJson(rulesDir);
  for (const [filename, info] of Object.entries(registry)) {
    const type = filename.includes('-agent-') ? 'agent' : 'rule';
    results.push({ pack: info.pack, version: info.version, file: filename, type });
  }

  // List skills
  const skillsBase = path.join(projectDir, '.cursor', 'skills');
  const skillDirs = await listDir(skillsBase);
  for (const dir of skillDirs) {
    const markerPath = path.join(skillsBase, dir, MARKER_FILE);
    if (await fileExists(markerPath)) {
      const content = await readFileContent(markerPath);
      const parsed = parseMarker(content);
      if (parsed) results.push({ ...parsed, file: dir, type: 'skill' });
    }
  }

  return results;
}
