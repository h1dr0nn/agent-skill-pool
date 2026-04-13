import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { readFileContent, listDir } from '../utils/fs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.resolve(__dirname, '..', '..', 'skills');

export function getSkillsDir() {
  return SKILLS_DIR;
}

export async function loadManifest(packName) {
  const manifestPath = path.join(SKILLS_DIR, packName, 'manifest.yaml');
  const content = await readFileContent(manifestPath);
  const manifest = yaml.load(content);

  if (!manifest.name) {
    throw new Error(`Manifest for "${packName}" is missing required field: name`);
  }

  const hasContent =
    (manifest.rules && manifest.rules.length > 0) ||
    (manifest.skills && manifest.skills.length > 0) ||
    (manifest.agents && manifest.agents.length > 0);

  if (!hasContent) {
    throw new Error(`Manifest for "${packName}" must have at least one of: rules, skills, agents`);
  }

  const type = manifest.type || 'universal';
  const validTypes = ['universal', 'claude', 'cursor', 'windsurf', 'antigravity'];
  if (!validTypes.includes(type)) {
    throw new Error(
      `Manifest for "${packName}" has invalid type: "${type}". ` +
      `Valid types: ${validTypes.join(', ')}`
    );
  }

  return {
    name: manifest.name,
    version: manifest.version || '0.0.0',
    description: manifest.description || '',
    type,
    depends: manifest.depends || [],
    tags: manifest.tags || [],
    rules: manifest.rules || [],
    skills: manifest.skills || [],
    agents: manifest.agents || [],
  };
}

export async function listAvailablePacks() {
  const entries = await listDir(SKILLS_DIR);
  const packs = [];

  for (const entry of entries) {
    try {
      const manifest = await loadManifest(entry);
      packs.push(manifest);
    } catch {
      // skip directories without valid manifests
    }
  }

  return packs;
}
