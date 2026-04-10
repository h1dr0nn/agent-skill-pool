import path from 'node:path';
import { readFileContent, writeFileAtomic, fileExists } from '../utils/fs.js';

const TRACKER_FILE = '.skillpool.json';

function defaultTracker() {
  return { version: '1.0.0', installed: {} };
}

export async function loadTracker(projectDir) {
  const filePath = path.join(projectDir, TRACKER_FILE);
  if (!(await fileExists(filePath))) {
    return defaultTracker();
  }
  const content = await readFileContent(filePath);
  return JSON.parse(content);
}

export async function saveTracker(projectDir, data) {
  const filePath = path.join(projectDir, TRACKER_FILE);
  await writeFileAtomic(filePath, JSON.stringify(data, null, 2) + '\n');
}

export function isInstalled(trackerData, packName) {
  return packName in trackerData.installed;
}

export function getInstalledVersion(trackerData, packName) {
  return trackerData.installed[packName]?.version || null;
}

export function recordInstall(trackerData, packName, version, targets) {
  return {
    ...trackerData,
    installed: {
      ...trackerData.installed,
      [packName]: {
        version,
        installedAt: new Date().toISOString(),
        targets,
      },
    },
  };
}

export function recordRemove(trackerData, packName) {
  const { [packName]: _, ...rest } = trackerData.installed;
  return { ...trackerData, installed: rest };
}
