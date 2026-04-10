import chalk from 'chalk';
import { resolveDependencies, checkConflicts } from '../core/resolver.js';
import { loadManifest } from '../core/manifest.js';
import { loadTracker, getInstalledVersion } from '../core/tracker.js';
import { getAdapter, detectTargets } from '../adapters/index.js';

async function resolveTargets(projectDir, targetOption) {
  if (targetOption) {
    const names = targetOption.split(',').map((t) => t.trim());
    names.forEach((n) => getAdapter(n));
    return names;
  }

  const detected = await detectTargets(projectDir);
  if (detected.length > 0) return detected;

  return ['claude'];
}

export async function installCommand(packNames, options = {}) {
  const projectDir = process.cwd();
  const targets = await resolveTargets(projectDir, options.target);
  const tracker = await loadTracker(projectDir);

  console.log(chalk.gray(`Targets: ${targets.join(', ')}\n`));

  if (packNames.length > 1) {
    const conflicts = await checkConflicts(packNames);
    if (conflicts.length > 0) {
      console.log(chalk.yellow('Dependency version conflicts detected:\n'));
      for (const conflict of conflicts) {
        console.log(
          chalk.yellow(
            `  "${conflict.dep}" has versions [${conflict.versions.join(', ')}] ` +
            `(requested by: ${conflict.requestedBy.join(', ')})`
          )
        );
      }
      console.log(chalk.yellow('\n  Using latest version for each.\n'));
    }
  }

  const allPacks = new Set();
  for (const name of packNames) {
    const deps = await resolveDependencies(name);
    deps.forEach((d) => allPacks.add(d));
  }

  const toInstall = [...allPacks];
  let installedCount = 0;

  for (const packName of toInstall) {
    const manifest = await loadManifest(packName);
    const currentVersion = getInstalledVersion(tracker, packName);

    if (currentVersion === manifest.version) {
      console.log(chalk.gray(`  ${packName}@${manifest.version} already installed, skipping`));
      continue;
    }

    let totalFiles = 0;
    for (const targetName of targets) {
      const adapter = getAdapter(targetName);
      const files = await adapter.install(manifest, projectDir);
      totalFiles += files.length;
    }

    installedCount++;
    console.log(
      chalk.green(`  + ${packName}@${manifest.version}`) +
        chalk.gray(` (${totalFiles} files)`)
    );
  }

  if (installedCount === 0) {
    console.log(chalk.yellow('\nAll packs already up to date.'));
  } else {
    console.log(chalk.green(`\nInstalled ${installedCount} pack(s) for ${targets.join(', ')}.`));
  }
}
