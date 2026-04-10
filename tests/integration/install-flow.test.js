import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { loadManifest } from '../../src/core/manifest.js';
import { resolveDependencies } from '../../src/core/resolver.js';
import {
  loadTracker,
  saveTracker,
  recordInstall,
  recordRemove,
} from '../../src/core/tracker.js';
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
    // Resolve deps
    const deps = await resolveDependencies('unity');
    expect(deps).toEqual(['common', 'unity']);

    // Install all deps
    let tracker = { version: '1.0.0', installed: {} };
    let totalFiles = 0;
    for (const packName of deps) {
      const manifest = await loadManifest(packName);
      const files = await claude.install(manifest, tmpDir);
      tracker = recordInstall(tracker, packName, manifest.version, ['claude']);
      totalFiles += files.length;
    }
    await saveTracker(tmpDir, tracker);

    // Verify rules exist
    const rulesDir = path.join(tmpDir, '.claude', 'rules');
    const ruleFiles = await readdir(rulesDir);
    expect(ruleFiles.length).toBeGreaterThan(0);

    // Verify skills exist
    const skillsDir = path.join(tmpDir, '.claude', 'skills');
    expect(await fileExists(skillsDir)).toBe(true);

    // Verify agents exist (from unity)
    const agentsDir = path.join(tmpDir, '.claude', 'agents');
    expect(await fileExists(agentsDir)).toBe(true);

    // Verify tracker
    const loaded = await loadTracker(tmpDir);
    expect(Object.keys(loaded.installed)).toHaveLength(2);

    // Remove unity
    await claude.remove('unity', tmpDir);
    tracker = recordRemove(tracker, 'unity');

    // Verify only common remains
    const remaining = await claude.list(tmpDir);
    expect(remaining.every((r) => r.pack === 'common')).toBe(true);

    // Remove common
    await claude.remove('common', tmpDir);
    tracker = recordRemove(tracker, 'common');

    const empty = await claude.list(tmpDir);
    expect(empty).toHaveLength(0);
  });
});
