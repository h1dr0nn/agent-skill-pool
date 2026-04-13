import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { loadManifest } from '../../src/core/manifest.js';
import { resolveDependencies } from '../../src/core/resolver.js';
import { loadTracker } from '../../src/core/tracker.js';
import * as claude from '../../src/adapters/claude.js';
import { fileExists } from '../../src/utils/fs.js';

describe('full install/remove flow', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'sp-integration-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('installs common, creates skills, then removes cleanly', async () => {
    const deps = await resolveDependencies('common');
    expect(deps).toEqual(['common']);

    for (const packName of deps) {
      const manifest = await loadManifest(packName);
      await claude.install(manifest, tmpDir);
    }

    // Verify skills exist
    expect(await fileExists(path.join(tmpDir, '.claude', 'skills'))).toBe(true);

    // Verify tracker reads from markers
    const tracker = await loadTracker(tmpDir);
    expect(Object.keys(tracker.installed)).toContain('common');
    expect(await fileExists(path.join(tmpDir, '.skillpool.json'))).toBe(false);

    // Remove common
    await claude.remove('common', tmpDir);
    const empty = await claude.list(tmpDir);
    expect(empty).toHaveLength(0);
  });
});
