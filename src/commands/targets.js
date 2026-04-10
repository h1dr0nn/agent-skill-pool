import chalk from 'chalk';
import { getAllTargetNames, detectTargets } from '../adapters/index.js';

const CONFIG_DIRS = {
  claude: '.claude/',
  cursor: '.cursor/',
  windsurf: '.windsurf/',
  antigravity: '.agent/',
};

export async function targetsCommand() {
  const allTargets = getAllTargetNames();
  const detected = await detectTargets(process.cwd());
  const detectedSet = new Set(detected);

  const maxNameLen = Math.max(...allTargets.map((name) => name.length));

  console.log(chalk.bold('\nSupported targets:\n'));

  for (const name of allTargets) {
    const isDetected = detectedSet.has(name);
    const icon = isDetected ? chalk.green('\u2713') : chalk.gray('-');
    const displayName = isDetected ? chalk.white(name) : chalk.gray(name);
    const configDir = CONFIG_DIRS[name] || 'unknown';
    const displayDir = isDetected ? chalk.white(configDir) : chalk.gray(configDir);
    const padding = ' '.repeat(maxNameLen - name.length);

    console.log(`  ${icon} ${displayName}${padding}    ${displayDir}`);
  }

  console.log('');
}
