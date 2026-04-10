import path from 'node:path';
import { readFileContent } from '../utils/fs.js';

const CONFIG_FILES = ['.skillpoolrc.json', 'skillpool.config.js'];

/**
 * Load plugin configuration from project root.
 * Looks for .skillpoolrc.json or skillpool.config.js.
 *
 * @param {string} projectDir - absolute path to the project root
 * @returns {Promise<{ adapters: Record<string, string> }>}
 */
async function loadConfig(projectDir) {
  // Try .skillpoolrc.json first
  try {
    const jsonPath = path.join(projectDir, CONFIG_FILES[0]);
    const content = await readFileContent(jsonPath);
    const config = JSON.parse(content);
    return { adapters: config.adapters || {} };
  } catch {
    // not found or invalid, try next
  }

  // Try skillpool.config.js
  try {
    const jsPath = path.join(projectDir, CONFIG_FILES[1]);
    const fileUrl = 'file:///' + jsPath.replace(/\\/g, '/');
    const mod = await import(fileUrl);
    const config = mod.default || mod;
    return { adapters: config.adapters || {} };
  } catch {
    // not found or invalid
  }

  return { adapters: {} };
}

const REQUIRED_METHODS = ['detect', 'install', 'remove', 'list'];

/**
 * Validate that a custom adapter exports the required interface.
 *
 * @param {object} adapter - the imported adapter module
 * @param {string} name - adapter name for error messages
 */
function validateAdapter(adapter, name) {
  for (const method of REQUIRED_METHODS) {
    if (typeof adapter[method] !== 'function') {
      throw new Error(
        `Custom adapter "${name}" is missing required method: ${method}`
      );
    }
  }
}

/**
 * Load custom adapters defined in the project config file.
 *
 * @param {string} projectDir - absolute path to the project root
 * @returns {Promise<Record<string, object>>} map of adapter name to adapter module
 */
export async function loadPlugins(projectDir) {
  const config = await loadConfig(projectDir);
  const customAdapters = {};

  for (const [name, adapterPath] of Object.entries(config.adapters)) {
    const resolvedPath = path.resolve(projectDir, adapterPath);
    const fileUrl = 'file:///' + resolvedPath.replace(/\\/g, '/');

    try {
      const mod = await import(fileUrl);
      const adapter = mod.default || mod;
      validateAdapter(adapter, name);
      customAdapters[name] = adapter;
    } catch (err) {
      if (err.message.includes('missing required method')) {
        throw err;
      }
      throw new Error(
        `Failed to load custom adapter "${name}" from ${adapterPath}: ${err.message}`
      );
    }
  }

  return customAdapters;
}
