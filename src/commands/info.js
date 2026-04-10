import chalk from 'chalk';
import { loadManifest } from '../core/manifest.js';
import { loadTracker } from '../core/tracker.js';
import { resolveDependencies } from '../core/resolver.js';

export async function infoCommand(packName) {
  const manifest = await loadManifest(packName);

  const projectDir = process.cwd();
  const tracker = await loadTracker(projectDir);
  const installInfo = tracker.installed[packName] || null;

  // Header
  console.log(chalk.bold(`\n${manifest.name}`) + chalk.gray(`@${manifest.version}`));
  if (manifest.description) {
    console.log(chalk.gray(manifest.description));
  }
  console.log('');

  // Tags
  if (manifest.tags.length > 0) {
    console.log(chalk.bold('Tags:'));
    console.log(`  ${manifest.tags.map((t) => chalk.cyan(t)).join(', ')}`);
    console.log('');
  }

  // Dependencies
  console.log(chalk.bold('Dependencies:'));
  if (manifest.depends.length === 0) {
    console.log(chalk.gray('  None'));
  } else {
    const resolved = await resolveDependencies(packName);
    // Remove the pack itself from the resolved chain
    const chain = resolved.filter((d) => d !== packName);
    console.log(`  Direct: ${manifest.depends.map((d) => chalk.cyan(d)).join(', ')}`);
    if (chain.length > manifest.depends.length) {
      console.log(`  Resolved chain: ${chain.map((d) => chalk.cyan(d)).join(' → ')}`);
    }
  }
  console.log('');

  // Rules
  console.log(chalk.bold(`Rules (${manifest.rules.length}):`));
  if (manifest.rules.length === 0) {
    console.log(chalk.gray('  None'));
  } else {
    for (const rule of manifest.rules) {
      console.log(`  ${chalk.white(rule)}`);
    }
  }
  console.log('');

  // Skills
  console.log(chalk.bold(`Skills (${manifest.skills.length}):`));
  if (manifest.skills.length === 0) {
    console.log(chalk.gray('  None'));
  } else {
    for (const skill of manifest.skills) {
      const isDir = !skill.endsWith('.md');
      const label = isDir ? chalk.white(skill) + chalk.gray(' (directory)') : chalk.white(skill);
      console.log(`  ${label}`);
    }
  }
  console.log('');

  // Agents
  console.log(chalk.bold(`Agents (${manifest.agents.length}):`));
  if (manifest.agents.length === 0) {
    console.log(chalk.gray('  None'));
  } else {
    for (const agent of manifest.agents) {
      console.log(`  ${chalk.white(agent)}`);
    }
  }
  console.log('');

  // Install status
  console.log(chalk.bold('Install status:'));
  if (installInfo) {
    const date = new Date(installInfo.installedAt).toLocaleDateString();
    const targets = installInfo.targets ? installInfo.targets.join(', ') : 'N/A';
    console.log(`  ${chalk.green('Installed')} v${installInfo.version} on ${date}`);
    console.log(`  Targets: ${targets}`);
  } else {
    console.log(chalk.gray('  Not installed'));
  }
  console.log('');
}
