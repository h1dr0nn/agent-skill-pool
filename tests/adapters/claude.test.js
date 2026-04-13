import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { install, remove, list } from '../../src/adapters/claude.js';
import { loadManifest } from '../../src/core/manifest.js';
import { fileExists } from '../../src/utils/fs.js';

describe('claude adapter', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'sp-claude-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('install creates skill directories with marker file', async () => {
    const manifest = await loadManifest('common');
    const files = await install(manifest, tmpDir);
    expect(files.length).toBeGreaterThanOrEqual(1);

    const skillDir = path.join(tmpDir, '.claude', 'skills');
    expect(await fileExists(skillDir)).toBe(true);
  });

  it('install adds marker comments to skills', async () => {
    const manifest = await loadManifest('common');
    await install(manifest, tmpDir);

    const markerFile = path.join(
      tmpDir, '.claude', 'skills', 'common-skill-feedback', '.skill-pool-marker'
    );
    const content = await readFile(markerFile, 'utf-8');
    expect(content).toContain('<!-- skill-pool:common:');
  });

  it('remove deletes all files for a pack', async () => {
    const manifest = await loadManifest('common');
    await install(manifest, tmpDir);

    await remove('common', tmpDir);
    const remaining = await list(tmpDir);
    expect(remaining).toHaveLength(0);
  });

  it('list returns items with types', async () => {
    const manifest = await loadManifest('common');
    await install(manifest, tmpDir);

    const items = await list(tmpDir);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].pack).toBe('common');
    expect(items[0].type).toBe('skill');
  });
});
