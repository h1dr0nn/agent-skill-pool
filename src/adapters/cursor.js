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

function makeMarker(packName, version) {
  return `${MARKER_PREFIX}${packName}:${version}${MARKER_SUFFIX}`;
}

function parseMarker(content) {
  const match = content.match(/<!-- skill-pool:([^:]+):([^ ]+) -->/);
  if (!match) return null;
  return { pack: match[1], version: match[2] };
}

function contentHasMarker(content, packName) {
  const parsed = parseMarker(content);
  return parsed && parsed.pack === packName;
}

function buildMdcContent(marker, packName, ruleContent) {
  const frontmatter = [
    '---',
    `description: "skill-pool: ${packName} rules"`,
    'globs: ""',
    'alwaysApply: true',
    '---',
  ].join('\n');
  return `${frontmatter}\n${marker}\n\n${ruleContent}`;
}

export async function detect(projectDir) {
  return fileExists(path.join(projectDir, '.cursor'));
}

export async function install(manifest, projectDir) {
  const installed = [];
  const skillsDir = getSkillsDir();
  const marker = makeMarker(manifest.name, manifest.version);

  // Rules -> .cursor/rules/<pack>-<name>.mdc
  for (const rulePath of manifest.rules) {
    const srcPath = path.join(skillsDir, manifest.name, rulePath);
    const content = await readFileContent(srcPath);
    const basename = path.basename(rulePath, path.extname(rulePath));
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    await ensureDir(rulesDir);
    const destPath = path.join(rulesDir, `${manifest.name}-${basename}.mdc`);
    await writeFileAtomic(destPath, buildMdcContent(marker, manifest.name, content));
    installed.push(destPath);
  }

  // Skills -> .cursor/skills/<pack>-<name>/
  for (const skillPath of manifest.skills) {
    const srcPath = path.join(skillsDir, manifest.name, skillPath);
    const basename = path.basename(skillPath, path.extname(skillPath));
    const destDir = path.join(projectDir, '.cursor', 'skills', `${manifest.name}-${basename}`);

    if (await isDirectory(srcPath)) {
      await copyDir(srcPath, destDir);
      await writeFileAtomic(path.join(destDir, MARKER_FILE), marker);
      installed.push(destDir);
    } else {
      await ensureDir(destDir);
      const content = await readFileContent(srcPath);
      await writeFileAtomic(path.join(destDir, 'SKILL.md'), `${marker}\n\n${content}`);
      await writeFileAtomic(path.join(destDir, MARKER_FILE), marker);
      installed.push(destDir);
    }
  }

  // Agents -> .cursor/rules/<pack>-agent-<name>.mdc
  for (const agentPath of manifest.agents) {
    const srcPath = path.join(skillsDir, manifest.name, agentPath);
    const content = await readFileContent(srcPath);
    const basename = path.basename(agentPath, path.extname(agentPath));
    const rulesDir = path.join(projectDir, '.cursor', 'rules');
    await ensureDir(rulesDir);
    const destPath = path.join(rulesDir, `${manifest.name}-agent-${basename}.mdc`);
    await writeFileAtomic(destPath, buildMdcContent(marker, manifest.name, content));
    installed.push(destPath);
  }

  return installed;
}

export async function remove(packName, projectDir) {
  const removed = [];

  // Remove rules + agent .mdc files
  const rulesDir = path.join(projectDir, '.cursor', 'rules');
  const ruleFiles = await listDir(rulesDir);
  for (const file of ruleFiles) {
    const filePath = path.join(rulesDir, file);
    if (await isDirectory(filePath)) continue;
    const content = await readFileContent(filePath);
    if (contentHasMarker(content, packName)) {
      await removeFile(filePath);
      removed.push(filePath);
    }
  }

  // Remove skills
  const skillsBase = path.join(projectDir, '.cursor', 'skills');
  const skillDirs = await listDir(skillsBase);
  for (const dir of skillDirs) {
    const markerPath = path.join(skillsBase, dir, MARKER_FILE);
    if (await fileExists(markerPath)) {
      const content = await readFileContent(markerPath);
      if (contentHasMarker(content, packName)) {
        await removeDir(path.join(skillsBase, dir));
        removed.push(path.join(skillsBase, dir));
      }
    }
  }

  return removed;
}

export async function list(projectDir) {
  const results = [];

  const rulesDir = path.join(projectDir, '.cursor', 'rules');
  const ruleFiles = await listDir(rulesDir);
  for (const file of ruleFiles) {
    const filePath = path.join(rulesDir, file);
    if (await isDirectory(filePath)) continue;
    const content = await readFileContent(filePath);
    const parsed = parseMarker(content);
    if (parsed) {
      const type = file.includes('-agent-') ? 'agent' : 'rule';
      results.push({ ...parsed, file, type });
    }
  }

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
