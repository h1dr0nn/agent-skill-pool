import { execFile } from 'node:child_process';

/**
 * Run a git command and return stdout.
 * @param {string[]} args - git subcommand and arguments
 * @param {object} [options] - execFile options (cwd, etc.)
 * @returns {Promise<string>}
 */
function runGit(args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { timeout: 60_000, ...options }, (error, stdout, stderr) => {
      if (error) {
        const message = stderr?.trim() || error.message;
        reject(new Error(`git ${args[0]} failed: ${message}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Clone a repository with --depth 1.
 * @param {string} url - Repository URL
 * @param {string} dest - Destination directory
 * @param {string} [branch] - Optional branch or tag to clone
 * @returns {Promise<void>}
 */
export async function cloneRepo(url, dest, branch) {
  const args = ['clone', '--depth', '1'];

  if (branch) {
    args.push('--branch', branch);
  }

  args.push(url, dest);

  await runGit(args);
}

/**
 * Check whether git is available on the system.
 * @returns {Promise<boolean>}
 */
export async function isGitAvailable() {
  try {
    await runGit(['--version']);
    return true;
  } catch {
    return false;
  }
}
