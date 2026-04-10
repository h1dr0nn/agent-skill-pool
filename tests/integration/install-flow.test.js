import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
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

  it('installs unity with deps, creates rules + skills + agents, then removes', async () => {
    const deps = await resolveDependencies('unity');
    expect(deps).toEqual(['common', 'unity']);

    // Install all deps
    for (const packName of deps) {
      const manifest = await loadManifest(packName);
      await claude.install(manifest, tmpDir);
    }

    // Verify rules exist
    const rulesDir = path.join(tmpDir, '.claude', 'rules');
    const ruleFiles = await readdir(rulesDir);
    expect(ruleFiles.length).toBeGreaterThan(0);

    // Verify skills exist
    expect(await fileExists(path.join(tmpDir, '.claude', 'skills'))).toBe(true);

    // Verify agents exist
    expect(await fileExists(path.join(tmpDir, '.claude', 'agents'))).toBe(true);

    // Verify tracker reads from markers (no .skillpool.json)
    const tracker = await loadTracker(tmpDir);
    expect(Object.keys(tracker.installed)).toContain('common');
    expect(Object.keys(tracker.installed)).toContain('unity');
    expect(await fileExists(path.join(tmpDir, '.skillpool.json'))).toBe(false);

    // Remove unity
    await claude.remove('unity', tmpDir);
    const remaining = await claude.list(tmpDir);
    expect(remaining.every((r) => r.pack === 'common')).toBe(true);

    // Remove common
    await claude.remove('common', tmpDir);
    const empty = await claude.list(tmpDir);
    expect(empty).toHaveLength(0);
  });
});
