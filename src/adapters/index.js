import * as claude from './claude.js';
import * as cursor from './cursor.js';
import * as windsurf from './windsurf.js';
import * as antigravity from './antigravity.js';
import { loadPlugins } from '../core/plugins.js';

const adapters = {
  claude,
  cursor,
  windsurf,
  antigravity,
};

export function getAdapter(name) {
  const adapter = adapters[name];
  if (!adapter) {
    throw new Error(`Unknown target: "${name}". Available: ${Object.keys(adapters).join(', ')}`);
  }
  return adapter;
}

/**
 * Load custom adapters from project config and merge into the registry.
 * Custom adapters do not overwrite built-in adapters.
 *
 * @param {string} projectDir - absolute path to the project root
 * @returns {Promise<Record<string, object>>} merged adapter map (built-in + custom)
 */
export async function loadCustomAdapters(projectDir) {
  const custom = await loadPlugins(projectDir);
  return { ...custom, ...adapters };
}

/**
 * Get an adapter by name, checking built-in adapters first, then plugins.
 *
 * @param {string} name - adapter name
 * @param {string} projectDir - absolute path to the project root
 * @returns {Promise<object>} the adapter module
 */
export async function getAdapterWithPlugins(name, projectDir) {
  if (adapters[name]) {
    return adapters[name];
  }

  const custom = await loadPlugins(projectDir);
  if (custom[name]) {
    return custom[name];
  }

  const allNames = [...Object.keys(adapters), ...Object.keys(custom)];
  throw new Error(`Unknown target: "${name}". Available: ${allNames.join(', ')}`);
}

export async function detectTargets(projectDir) {
  const detected = [];
  for (const [name, adapter] of Object.entries(adapters)) {
    if (await adapter.detect(projectDir)) {
      detected.push(name);
    }
  }
  return detected;
}

export function getAllTargetNames() {
  return Object.keys(adapters);
}
