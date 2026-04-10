import chalk from 'chalk';
import { loadTracker, isInstalled, getInstalledTargets } from '../core/tracker.js';
import { loadManifest } from '../core/manifest.js';
import { getAdapter, getAllTargetNames } from '../adapters/index.js';

async function findDependents(packName, tracker) {
  const dependents = [];
  const installedPacks = Object.keys(tracker.installed);

  for (const installed of installedPacks) {
    if (installed === packName) continue;
    try {
      const manifest = await loadManifest(installed);
      if (manifest.depends.includes(packName)) {
        dependents.push(installed);
      }
    } catch {
      // skip
    }
  }

  return dependents;
}

async function removeFromAllTargets(packName, targets, projectDir) {
  let totalRemoved = 0;
  for (const targetName of targets) {
    try {
      const adapter = getAdapter(targetName);
      const removed = await adapter.remove(packName, projectDir);
      totalRemoved += removed.length;
    } catch {
      // adapter might not have files
    }
  }
  return totalRemoved;
}

export async function removeCommand(packName, options) {
  const projectDir = process.cwd();
  const tracker = await loadTracker(projectDir);

  if (options.all) {
    const installedPacks = Object.keys(tracker.installed);
    if (installedPacks.length === 0) {
      console.log(chalk.yellow('No packs installed.'));
      return;
    }

    for (const name of installedPacks) {
      const targets = getInstalledTargets(tracker, name);
      const count = await removeFromAllTargets(name, targets.length > 0 ? targets : getAllTargetNames(), projectDir);
      console.log(
        chalk.red(`  - ${name}`) + chalk.gray(` (${count} files removed)`)
      );
    }

    console.log(chalk.green('\nAll packs removed.'));
    return;
  }

  if (!packName) {
    console.error(chalk.red('Please specify a pack name or use --all'));
    process.exit(1);
  }

  if (!isInstalled(tracker, packName)) {
    console.log(chalk.yellow(`Pack "${packName}" is not installed.`));
    return;
  }

  const dependents = await findDependents(packName, tracker);
  if (dependents.length > 0) {
    console.log(
      chalk.yellow(
        `Warning: pack(s) ${dependents.map((d) => `"${d}"`).join(', ')} depend on "${packName}". Consider removing them first.`
      )
    );
  }

  const targets = getInstalledTargets(tracker, packName);
  const count = await removeFromAllTargets(packName, targets.length > 0 ? targets : getAllTargetNames(), projectDir);

  console.log(
    chalk.red(`  - ${packName}`) + chalk.gray(` (${count} files removed)`)
  );
}
