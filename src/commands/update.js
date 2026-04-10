import chalk from 'chalk';
import { loadManifest } from '../core/manifest.js';
import { loadTracker, getInstalledTargets } from '../core/tracker.js';
import { getAdapter } from '../adapters/index.js';

export async function updateCommand(packName) {
  const projectDir = process.cwd();
  const tracker = await loadTracker(projectDir);
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
    const targets = getInstalledTargets(tracker, name);
    if (targets.length === 0) targets.push('claude');

    let totalFiles = 0;
    for (const targetName of targets) {
      const adapter = getAdapter(targetName);
      const files = await adapter.install(manifest, projectDir);
      totalFiles += files.length;
    }

    updatedCount++;

    const versionChanged = info.version !== manifest.version;
    const label = versionChanged
      ? `${info.version} -> ${manifest.version}`
      : manifest.version;

    console.log(
      chalk.green(`  ~ ${name}@${label}`) +
        chalk.gray(` (${totalFiles} files)`)
    );
  }

  console.log(chalk.green(`\nUpdated ${updatedCount} pack(s).`));
}
