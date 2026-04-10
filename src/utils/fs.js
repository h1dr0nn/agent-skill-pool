import { mkdir, writeFile, readFile, unlink, stat, readdir, rm, cp } from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function writeFileAtomic(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, 'utf-8');
}

export async function readFileContent(filePath) {
  return readFile(filePath, 'utf-8');
}

export async function removeFile(filePath) {
  try {
    await unlink(filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

export async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listDir(dirPath) {
  try {
    return await readdir(dirPath);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function copyDir(src, dest) {
  await cp(src, dest, { recursive: true });
}

export async function removeDir(dirPath) {
  try {
    await rm(dirPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(filePath) {
  try {
    const s = await stat(filePath);
    return s.isDirectory();
  } catch {
    return false;
  }
}

export async function listDirRecursive(dirPath) {
  const results = [];
  const entries = await listDir(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    if (await isDirectory(fullPath)) {
      const subEntries = await listDirRecursive(fullPath);
      results.push(...subEntries);
    } else {
      results.push(fullPath);
    }
  }
  return results;
}
