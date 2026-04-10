import chalk from 'chalk';
import { loadManifest } from '../core/manifest.js';
import {
  loadTracker,
  saveTracker,
  recordInstall,
} from '../core/tracker.js';
import { getAdapter } from '../adapters/index.js';

export async function updateCommand(packName) {
  const projectDir = process.cwd();
  let tracker = await loadTracker(projectDir);
  const installedPacks = Object.keys(tracker.installed);

  if (installedPacks.length === 0) {
    console.log(chalk.yellow('No packs installed.'));
    return;
  }

  const toUpdate = packName ? [packName] : installedPacks;
  let updatedCount = 0;

  for (const name of toUpdate) {
    const info = tracker.installed[name];
    if (!info) {
      console.log(chalk.yellow(`Pack "${name}" is not installed.`));
      continue;
    }

    const manifest = await loadManifest(name);
    const targets = info.targets || ['claude'];

    // Re-install to pick up content changes
    let totalFiles = 0;
    for (const targetName of targets) {
      const adapter = getAdapter(targetName);
      const files = await adapter.install(manifest, projectDir);
      totalFiles += files.length;
    }

    tracker = recordInstall(tracker, name, manifest.version, targets);
    updatedCount++;

    const versionChanged = info.version !== manifest.version;
    const label = versionChanged
      ? `${info.version} -> ${manifest.version}`
      : manifest.version;

    console.log(
      chalk.green(`  ~ ${name}@${label}`) +
        chalk.gray(` (${totalFiles} rules)`)
    );
  }

  await saveTracker(projectDir, tracker);
  console.log(chalk.green(`\nUpdated ${updatedCount} pack(s).`));
}
