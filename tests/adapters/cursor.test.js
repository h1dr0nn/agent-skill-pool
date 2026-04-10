import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
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

  it('install creates .mdc rules and skill directories', async () => {
    const manifest = await loadManifest('common');
    const files = await install(manifest, tmpDir);

    const mdcFile = files.find((f) => typeof f === 'string' && f.endsWith('.mdc'));
    expect(mdcFile).toBeDefined();

    const content = await readFile(mdcFile, 'utf-8');
    expect(content).toMatch(/^---\n/);
    expect(content).toContain('alwaysApply: true');

    const skillsDir = path.join(tmpDir, '.cursor', 'skills');
    expect(await fileExists(skillsDir)).toBe(true);
  });

  it('remove deletes all pack files', async () => {
    const common = await loadManifest('common');
    const unity = await loadManifest('unity');
    await install(common, tmpDir);
    await install(unity, tmpDir);

    await remove('unity', tmpDir);
    const remaining = await list(tmpDir);
    expect(remaining.every((r) => r.pack === 'common')).toBe(true);
  });
});
