import { loadManifest } from './manifest.js';

export async function resolveDependencies(packName) {
  const resolved = [];
  const visited = new Set();
  const visiting = new Set();

  async function visit(name) {
    if (resolved.includes(name)) return;

    if (visiting.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    visiting.add(name);
    const manifest = await loadManifest(name);

    for (const dep of manifest.depends) {
      await visit(dep);
    }

    visiting.delete(name);
    visited.add(name);
    resolved.push(name);
  }

  await visit(packName);
  return resolved;
}

/**
 * Check for version conflicts across multiple packs' dependency trees.
 *
 * For each requested pack, resolves its full dependency tree and records
 * which version each dependency has. If a dependency appears in multiple
 * trees with different versions, it is reported as a conflict.
 *
 * @param {string[]} packNames - list of top-level pack names to install
 * @returns {Promise<Array<{ dep: string, versions: string[], requestedBy: string[] }>>}
 */
export async function checkConflicts(packNames) {
  // Map: dep name -> Map<version, Set<requestedBy>>
  const depVersions = new Map();

  for (const packName of packNames) {
    const deps = await resolveDependencies(packName);

    for (const depName of deps) {
      const manifest = await loadManifest(depName);
      const version = manifest.version;

      if (!depVersions.has(depName)) {
        depVersions.set(depName, new Map());
      }

      const versionMap = depVersions.get(depName);
      if (!versionMap.has(version)) {
        versionMap.set(version, new Set());
      }
      versionMap.get(version).add(packName);
    }
  }

  const conflicts = [];

  for (const [dep, versionMap] of depVersions) {
    if (versionMap.size > 1) {
      const versions = [...versionMap.keys()].sort();
      const requestedBy = new Set();
      for (const requesterSet of versionMap.values()) {
        for (const requester of requesterSet) {
          requestedBy.add(requester);
        }
      }
      conflicts.push({
        dep,
        versions,
        requestedBy: [...requestedBy],
      });
    }
  }

  return conflicts;
}
