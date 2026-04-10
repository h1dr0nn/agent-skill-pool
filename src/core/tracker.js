import { getAdapter, getAllTargetNames } from '../adapters/index.js';

/**
 * Scan installed files across all adapters to build tracker state from markers.
 * No .skillpool.json needed.
 */
export async function loadTracker(projectDir) {
  const installed = {};
  const targetNames = getAllTargetNames();

  for (const targetName of targetNames) {
    const adapter = getAdapter(targetName);
    try {
      const items = await adapter.list(projectDir);
      for (const item of items) {
        if (!installed[item.pack]) {
          installed[item.pack] = {
            version: item.version,
            targets: [],
          };
        }
        if (!installed[item.pack].targets.includes(targetName)) {
          installed[item.pack].targets.push(targetName);
        }
        // Use latest version found
        if (item.version > installed[item.pack].version) {
          installed[item.pack].version = item.version;
        }
      }
    } catch {
      // adapter dir doesn't exist, skip
    }
  }

  return { installed };
}

export function isInstalled(trackerData, packName) {
  return packName in trackerData.installed;
}

export function getInstalledVersion(trackerData, packName) {
  return trackerData.installed[packName]?.version || null;
}

export function getInstalledTargets(trackerData, packName) {
  return trackerData.installed[packName]?.targets || [];
}
