import chalk from 'chalk';
import { listAvailablePacks } from '../core/manifest.js';
import { loadTracker } from '../core/tracker.js';

export async function listCommand(options) {
  if (options.installed) {
    await listInstalled();
  } else {
    await listAvailable();
  }
}

async function listAvailable() {
  const packs = await listAvailablePacks();

  if (packs.length === 0) {
    console.log(chalk.yellow('No packs available.'));
    return;
  }

  console.log(chalk.bold('\nAvailable packs:\n'));

  for (const pack of packs) {
    const deps = pack.depends.length > 0 ? chalk.gray(` (requires: ${pack.depends.join(', ')})`) : '';
    console.log(`  ${chalk.cyan(pack.name)}@${pack.version}${deps}`);
    if (pack.description) {
      console.log(`    ${chalk.gray(pack.description)}`);
    }
  }

  console.log('');
}

async function listInstalled() {
  const projectDir = process.cwd();
  const tracker = await loadTracker(projectDir);
  const installed = Object.entries(tracker.installed);

  if (installed.length === 0) {
    console.log(chalk.yellow('No packs installed in this project.'));
    return;
  }

  console.log(chalk.bold('\nInstalled packs:\n'));

  for (const [name, info] of installed) {
    const date = new Date(info.installedAt).toLocaleDateString();
    const targets = info.targets.join(', ');
    console.log(`  ${chalk.cyan(name)}@${info.version}`);
    console.log(`    ${chalk.gray(`installed: ${date} | targets: ${targets}`)}`);
  }

  console.log('');
}
