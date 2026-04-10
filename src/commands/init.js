import path from 'node:path';
import chalk from 'chalk';
import { fileExists, listDir, ensureDir, readFileContent } from '../utils/fs.js';
import { detectTargets } from '../adapters/index.js';
import { listAvailablePacks } from '../core/manifest.js';
import { installCommand } from './install.js';

const PROJECT_DETECTORS = [
  {
    pack: 'unity',
    files: ['*.unity'],
    extensions: ['.cs'],
    description: 'Unity project detected',
  },
  {
    pack: 'unreal',
    files: ['*.uproject'],
    extensions: [],
    description: 'Unreal Engine project detected',
  },
  {
    pack: 'web',
    files: ['package.json'],
    extensions: [],
    packageJsonMatch: /["'](?:react|next|vue|nuxt|svelte|astro)["']/,
    description: 'Web/frontend project detected',
  },
  {
    pack: 'python',
    files: ['requirements.txt', 'pyproject.toml', 'setup.py'],
    extensions: ['.py'],
    description: 'Python project detected',
  },
  {
    pack: 'django',
    files: ['manage.py'],
    extensions: [],
    requirementsMatch: /django/i,
    description: 'Django project detected',
  },
  {
    pack: 'go',
    files: ['go.mod'],
    extensions: [],
    description: 'Go project detected',
  },
  {
    pack: 'rust',
    files: ['Cargo.toml'],
    extensions: [],
    description: 'Rust project detected',
  },
  {
    pack: 'swift',
    files: ['Package.swift'],
    extensions: ['.swift'],
    description: 'Swift project detected',
  },
  {
    pack: 'kotlin',
    files: ['build.gradle', 'build.gradle.kts'],
    extensions: ['.kt'],
    description: 'Kotlin project detected',
  },
  {
    pack: 'java',
    files: ['pom.xml'],
    extensions: ['.java'],
    description: 'Java project detected',
  },
  {
    pack: 'laravel',
    files: ['composer.json'],
    extensions: [],
    description: 'Laravel/PHP project detected',
  },
  {
    pack: 'devops',
    files: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
    extensions: [],
    description: 'Docker/DevOps project detected',
  },
  {
    pack: 'dotnet',
    files: ['*.sln'],
    extensions: ['.csproj'],
    description: '.NET project detected',
  },
  {
    pack: 'cpp',
    files: ['CMakeLists.txt'],
    extensions: ['.cpp', '.cc', '.cxx'],
    description: 'C++ project detected',
  },
];

async function hasFileWithExtension(projectDir, extensions) {
  const entries = await listDir(projectDir);
  return entries.some((entry) =>
    extensions.some((ext) => entry.endsWith(ext))
  );
}

async function hasMatchingFile(projectDir, patterns) {
  const entries = await listDir(projectDir);
  for (const pattern of patterns) {
    if (pattern.startsWith('*')) {
      const ext = pattern.slice(1);
      if (entries.some((entry) => entry.endsWith(ext))) {
        return true;
      }
    } else {
      if (entries.includes(pattern)) {
        return true;
      }
    }
  }
  return false;
}

async function detectProjectPacks(projectDir) {
  const detected = [];

  for (const detector of PROJECT_DETECTORS) {
    let matched = false;

    if (detector.files.length > 0) {
      matched = await hasMatchingFile(projectDir, detector.files);
    }

    if (!matched && detector.extensions && detector.extensions.length > 0) {
      matched = await hasFileWithExtension(projectDir, detector.extensions);
    }

    if (matched && detector.packageJsonMatch) {
      const pkgPath = path.join(projectDir, 'package.json');
      if (await fileExists(pkgPath)) {
        const content = await readFileContent(pkgPath);
        matched = detector.packageJsonMatch.test(content);
      } else {
        matched = false;
      }
    }

    if (matched && detector.requirementsMatch) {
      const reqPath = path.join(projectDir, 'requirements.txt');
      if (await fileExists(reqPath)) {
        const content = await readFileContent(reqPath);
        matched = detector.requirementsMatch.test(content);
      } else {
        matched = false;
      }
    }

    if (matched) {
      detected.push({ pack: detector.pack, description: detector.description });
    }
  }

  return detected;
}

export async function initCommand(packs = [], options = {}) {
  const projectDir = process.cwd();

  console.log(chalk.bold('\nSkill Pool - Project Init\n'));

  // Detect AI tool targets
  let targets = await detectTargets(projectDir);
  if (targets.length === 0) {
    console.log(chalk.yellow('No AI tool directories detected. Creating .claude/ as default target.'));
    await ensureDir(path.join(projectDir, '.claude'));
    targets = ['claude'];
  } else {
    console.log(chalk.green(`Detected targets: ${targets.join(', ')}`));
  }

  // Get available packs
  const availablePacks = await listAvailablePacks();
  const availableNames = availablePacks.map((p) => p.name);

  // Determine which packs to install
  let packsToInstall = [];

  if (packs.length > 0) {
    // Validate user-provided pack names
    const invalid = packs.filter((p) => !availableNames.includes(p));
    if (invalid.length > 0) {
      console.error(chalk.red(`\nUnknown pack(s): ${invalid.join(', ')}`));
      console.log(chalk.gray(`Available: ${availableNames.join(', ')}`));
      process.exit(1);
    }
    packsToInstall = packs;
  } else {
    // Auto-detect project type
    const detected = await detectProjectPacks(projectDir);

    if (detected.length > 0) {
      console.log(chalk.cyan('\nDetected project types:'));
      for (const d of detected) {
        console.log(chalk.cyan(`  - ${d.description} → ${chalk.bold(d.pack)}`));
      }
      packsToInstall = detected.map((d) => d.pack);
    } else {
      console.log(chalk.yellow('\nNo project type detected automatically.'));
      console.log(chalk.gray(`Available packs: ${availableNames.join(', ')}`));
      console.log(chalk.gray('Run: skill-pool init <pack1> <pack2> ...'));
      return;
    }
  }

  // Always include common pack if available and not already listed
  if (availableNames.includes('common') && !packsToInstall.includes('common')) {
    packsToInstall.unshift('common');
  }

  console.log(chalk.bold(`\nInstalling packs: ${packsToInstall.join(', ')}\n`));

  await installCommand(packsToInstall, {
    target: options.target || targets.join(','),
  });

  console.log(chalk.green('\nProject initialized successfully.'));
}
