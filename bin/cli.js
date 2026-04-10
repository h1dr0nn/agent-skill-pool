#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { installCommand } from '../src/commands/install.js';
import { removeCommand } from '../src/commands/remove.js';
import { listCommand } from '../src/commands/list.js';
import { updateCommand } from '../src/commands/update.js';
import { infoCommand } from '../src/commands/info.js';
import { targetsCommand } from '../src/commands/targets.js';
import { diffCommand } from '../src/commands/diff.js';
import { initCommand } from '../src/commands/init.js';
import { createCommand } from '../src/commands/create.js';
import { addCommand } from '../src/commands/add.js';

const program = new Command();

program
  .name('skill-pool')
  .description('Install AI coding skills per-project')
  .version('0.1.0');

program
  .command('install')
  .description('Install skill pack(s) into the current project')
  .argument('<packs...>', 'pack name(s) to install')
  .option('--target <targets>', 'comma-separated targets: claude,cursor,windsurf')
  .action(async (packs, options) => {
    try {
      await installCommand(packs, options);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('remove')
  .description('Remove skill pack(s) from the current project')
  .argument('[pack]', 'pack name to remove')
  .option('--all', 'remove all installed packs')
  .action(async (pack, options) => {
    try {
      await removeCommand(pack, options);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available or installed skill packs')
  .option('--installed', 'show only installed packs')
  .action(async (options) => {
    try {
      await listCommand(options);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update installed skill pack(s) to latest version')
  .argument('[pack]', 'pack name to update (omit for all)')
  .action(async (pack) => {
    try {
      await updateCommand(pack);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('info')
  .description('Show detailed info about a skill pack')
  .argument('<pack>', 'pack name')
  .action(async (pack) => {
    try {
      await infoCommand(pack);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('targets')
  .description('List supported AI tools and detect which are present')
  .action(async () => {
    try {
      await targetsCommand();
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('diff')
  .description('Show changes between installed and latest version of a pack')
  .argument('<pack>', 'pack name')
  .action(async (pack) => {
    try {
      await diffCommand(pack);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Auto-detect project type and install suggested packs')
  .argument('[packs...]', 'optional pack names to install')
  .option('--target <targets>', 'comma-separated targets')
  .action(async (packs, options) => {
    try {
      await initCommand(packs, options);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('create')
  .description('Scaffold a new skill pack')
  .argument('<name>', 'pack name')
  .option('--path <dir>', 'directory to create pack in', '.')
  .action(async (name, options) => {
    try {
      await createCommand(name, options);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('add')
  .description('Install skill pack from a GitHub repository')
  .argument('<url>', 'GitHub repository URL (e.g., https://github.com/user/repo)')
  .option('--target <targets>', 'comma-separated targets: claude,cursor,windsurf')
  .action(async (url, options) => {
    try {
      await addCommand(url, options);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

program.parse();
