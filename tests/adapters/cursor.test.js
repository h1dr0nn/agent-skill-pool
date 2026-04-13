import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { install, remove, list } from '../../src/adapters/cursor.js';
import { loadManifest } from '../../src/core/manifest.js';
import { fileExists } from '../../src/utils/fs.js';

describe('cursor adapter', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'sp-cursor-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('install creates skill directories', async () => {
    const manifest = await loadManifest('common');
    const files = await install(manifest, tmpDir);
    expect(files.length).toBeGreaterThanOrEqual(1);

    const skillsDir = path.join(tmpDir, '.cursor', 'skills');
    expect(await fileExists(skillsDir)).toBe(true);
  });

  it('remove deletes all pack files', async () => {
    const manifest = await loadManifest('common');
    await install(manifest, tmpDir);

    await remove('common', tmpDir);
    const remaining = await list(tmpDir);
    expect(remaining).toHaveLength(0);
  });
});
