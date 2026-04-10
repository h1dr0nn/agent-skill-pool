import chalk from 'chalk';
import { loadManifest } from '../core/manifest.js';
import { loadTracker, isInstalled } from '../core/tracker.js';

export async function diffCommand(packName) {
  const projectDir = process.cwd();
  const tracker = await loadTracker(projectDir);

  if (!isInstalled(tracker, packName)) {
    console.log(
      chalk.yellow(`Pack "${packName}" is not installed. Use \`skill-pool install ${packName}\` first.`)
    );
    return;
  }

  let manifest;
  try {
    manifest = await loadManifest(packName);
  } catch {
    console.log(chalk.red(`Could not load manifest for "${packName}". Pack may no longer exist.`));
    return;
  }

  const installed = tracker.installed[packName];
  const installedVersion = installed.version;
  const availableVersion = manifest.version;
  const installedDate = new Date(installed.installedAt).toLocaleDateString();

  console.log(chalk.bold(`\nDiff for ${packName}:\n`));

  console.log(`  Installed: ${chalk.cyan(installedVersion)} (${installedDate})`);
  console.log(`  Available: ${chalk.cyan(availableVersion)}`);

  if (installedVersion === availableVersion) {
    console.log(chalk.green('\n  Same version - no update available.\n'));
  } else {
    console.log(chalk.yellow(`\n  Version change: ${installedVersion} -> ${availableVersion}\n`));
  }

  const installedTargets = installed.targets || [];
  const manifestItems = collectItems(manifest);

  console.log(chalk.bold('  Contents in latest manifest:\n'));

  if (manifestItems.length === 0) {
    console.log(chalk.gray('    (no items)'));
  } else {
    for (const item of manifestItems) {
      const symbol = installedVersion === availableVersion
        ? chalk.gray('  ')
        : chalk.yellow('~ ');
      console.log(`    ${symbol}${chalk.white(item.path)} ${chalk.gray(`(${item.type})`)}`);
    }
  }

  if (installedTargets.length > 0) {
    console.log(chalk.bold('\n  Installed targets:'));
    console.log(`    ${chalk.gray(installedTargets.join(', '))}`);
  }

  console.log('');
}

function collectItems(manifest) {
  const items = [];

  for (const rule of manifest.rules) {
    items.push({ path: rule, type: 'rule' });
  }
  for (const skill of manifest.skills) {
    items.push({ path: skill, type: 'skill' });
  }
  for (const agent of manifest.agents) {
    items.push({ path: agent, type: 'agent' });
  }

  return items;
}
