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

function parseMarker(line) {
  if (!line.startsWith(MARKER_PREFIX)) return null;
  const inner = line.slice(MARKER_PREFIX.length, line.indexOf(MARKER_SUFFIX));
  const [pack, version] = inner.split(':');
  return { pack, version };
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

export async function detect(projectDir) {
  return fileExists(path.join(projectDir, '.agent'));
}

export async function install(manifest, projectDir) {
  const installed = [];
  const skillsDir = getSkillsDir();
  const marker = makeMarker(manifest.name, manifest.version);

  // Rules -> .agent/rules/<pack>-<name>.md
  if (manifest.rules.length > 0) {
    const rulesDir = path.join(projectDir, '.agent', 'rules');
    await ensureDir(rulesDir);
    const registry = await loadMarkersJson(rulesDir);

    for (const rulePath of manifest.rules) {
      const srcPath = path.join(skillsDir, manifest.name, rulePath);
      const content = await readFileContent(srcPath);
      const basename = path.basename(rulePath, path.extname(rulePath));
      const filename = `${manifest.name}-${basename}.md`;
      const destPath = path.join(rulesDir, filename);
      await writeFileAtomic(destPath, content);
      registry[filename] = { pack: manifest.name, version: manifest.version };
      installed.push(destPath);
    }

    await saveMarkersJson(rulesDir, registry);
  }

  // Skills -> .agent/skills/<pack>-<name>/
  for (const skillPath of manifest.skills) {
    const srcPath = path.join(skillsDir, manifest.name, skillPath);
    const basename = path.basename(skillPath, path.extname(skillPath));
    const destDir = path.join(projectDir, '.agent', 'skills', `${manifest.name}-${basename}`);

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

  // Agents -> .agent/agents/<pack>-<name>.md
  if (manifest.agents.length > 0) {
    const agentsDir = path.join(projectDir, '.agent', 'agents');
    await ensureDir(agentsDir);
    const registry = await loadMarkersJson(agentsDir);

    for (const agentPath of manifest.agents) {
      const srcPath = path.join(skillsDir, manifest.name, agentPath);
      const content = await readFileContent(srcPath);
      const basename = path.basename(agentPath, path.extname(agentPath));
      const filename = `${manifest.name}-${basename}.md`;
      const destPath = path.join(agentsDir, filename);
      await writeFileAtomic(destPath, content);
      registry[filename] = { pack: manifest.name, version: manifest.version };
      installed.push(destPath);
    }

    await saveMarkersJson(agentsDir, registry);
  }

  return installed;
}

export async function remove(packName, projectDir) {
  const removed = [];

  // Remove rules
  await removeRegisteredFiles(path.join(projectDir, '.agent', 'rules'), packName, removed);

  // Remove agents
  await removeRegisteredFiles(path.join(projectDir, '.agent', 'agents'), packName, removed);

  // Remove skills
  const skillsBase = path.join(projectDir, '.agent', 'skills');
  const skillDirs = await listDir(skillsBase);
  for (const dir of skillDirs) {
    const markerPath = path.join(skillsBase, dir, MARKER_FILE);
    if (await fileExists(markerPath)) {
      const content = await readFileContent(markerPath);
      const parsed = parseMarker(content.split('\n')[0]);
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

  // List rules
  await listRegisteredFiles(path.join(projectDir, '.agent', 'rules'), 'rule', results);

  // List agents
  await listRegisteredFiles(path.join(projectDir, '.agent', 'agents'), 'agent', results);

  // List skills
  const skillsBase = path.join(projectDir, '.agent', 'skills');
  const skillDirs = await listDir(skillsBase);
  for (const dir of skillDirs) {
    const markerPath = path.join(skillsBase, dir, MARKER_FILE);
    if (await fileExists(markerPath)) {
      const content = await readFileContent(markerPath);
      const parsed = parseMarker(content.split('\n')[0]);
      if (parsed) results.push({ ...parsed, file: dir, type: 'skill' });
    }
  }

  return results;
}

async function listRegisteredFiles(dirPath, type, results) {
  const registry = await loadMarkersJson(dirPath);
  for (const [filename, info] of Object.entries(registry)) {
    results.push({ pack: info.pack, version: info.version, file: filename, type });
  }
}
