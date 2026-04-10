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

function parseMarker(line) {
  if (!line.startsWith(MARKER_PREFIX)) return null;
  const inner = line.slice(MARKER_PREFIX.length, line.indexOf(MARKER_SUFFIX));
  const [pack, version] = inner.split(':');
  return { pack, version };
}

function contentHasMarker(content, packName) {
  const firstLine = content.split('\n')[0];
  const parsed = parseMarker(firstLine);
  return parsed && parsed.pack === packName;
}

export async function detect(projectDir) {
  return fileExists(path.join(projectDir, '.agent'));
}

export async function install(manifest, projectDir) {
  const installed = [];
  const skillsDir = getSkillsDir();
  const marker = makeMarker(manifest.name, manifest.version);

  // Rules -> .agent/rules/<pack>-<name>.md
  for (const rulePath of manifest.rules) {
    const srcPath = path.join(skillsDir, manifest.name, rulePath);
    const content = await readFileContent(srcPath);
    const basename = path.basename(rulePath, path.extname(rulePath));
    const rulesDir = path.join(projectDir, '.agent', 'rules');
    await ensureDir(rulesDir);
    const destPath = path.join(rulesDir, `${manifest.name}-${basename}.md`);
    await writeFileAtomic(destPath, `${marker}\n\n${content}`);
    installed.push(destPath);
  }

  // Skills -> .agent/skills/<pack>-<name>/
  for (const skillPath of manifest.skills) {
    const srcPath = path.join(skillsDir, manifest.name, skillPath);
    const basename = path.basename(skillPath, path.extname(skillPath));
    const destDir = path.join(projectDir, '.agent', 'skills', `${manifest.name}-${basename}`);

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

  // Agents -> .agent/agents/<pack>-<name>.md
  for (const agentPath of manifest.agents) {
    const srcPath = path.join(skillsDir, manifest.name, agentPath);
    const content = await readFileContent(srcPath);
    const basename = path.basename(agentPath, path.extname(agentPath));
    const agentsDir = path.join(projectDir, '.agent', 'agents');
    await ensureDir(agentsDir);
    const destPath = path.join(agentsDir, `${manifest.name}-${basename}.md`);
    await writeFileAtomic(destPath, `${marker}\n\n${content}`);
    installed.push(destPath);
  }

  return installed;
}

export async function remove(packName, projectDir) {
  const removed = [];

  // Remove rules
  await removeMarkedFiles(path.join(projectDir, '.agent', 'rules'), packName, removed);

  // Remove agents
  await removeMarkedFiles(path.join(projectDir, '.agent', 'agents'), packName, removed);

  // Remove skills
  const skillsBase = path.join(projectDir, '.agent', 'skills');
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

async function removeMarkedFiles(dirPath, packName, removed) {
  const files = await listDir(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (await isDirectory(filePath)) continue;
    const content = await readFileContent(filePath);
    if (contentHasMarker(content, packName)) {
      await removeFile(filePath);
      removed.push(filePath);
    }
  }
}

export async function list(projectDir) {
  const results = [];

  // List rules
  await listMarkedFiles(path.join(projectDir, '.agent', 'rules'), 'rule', results);

  // List agents
  await listMarkedFiles(path.join(projectDir, '.agent', 'agents'), 'agent', results);

  // List skills
  const skillsBase = path.join(projectDir, '.agent', 'skills');
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

async function listMarkedFiles(dirPath, type, results) {
  const files = await listDir(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    if (await isDirectory(filePath)) continue;
    const content = await readFileContent(filePath);
    const firstLine = content.split('\n')[0];
    const parsed = parseMarker(firstLine);
    if (parsed) results.push({ ...parsed, file, type });
  }
}
