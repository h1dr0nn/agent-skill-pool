import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { install, remove, list } from '../../src/adapters/windsurf.js';
import { loadManifest } from '../../src/core/manifest.js';
import { fileExists } from '../../src/utils/fs.js';

describe('windsurf adapter', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'sp-windsurf-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('install creates skills in .windsurf/', async () => {
    const manifest = await loadManifest('common');
    const files = await install(manifest, tmpDir);
    expect(files.length).toBeGreaterThanOrEqual(1);

    const skillDir = path.join(tmpDir, '.windsurf', 'skills');
    expect(await fileExists(skillDir)).toBe(true);
  });

  it('remove deletes all pack files', async () => {
    const manifest = await loadManifest('common');
    await install(manifest, tmpDir);

    await remove('common', tmpDir);
    const remaining = await list(tmpDir);
    expect(remaining).toHaveLength(0);
  });
});
