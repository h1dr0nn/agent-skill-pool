import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { loadTracker, isInstalled, getInstalledVersion } from '../../src/core/tracker.js';
import { install } from '../../src/adapters/claude.js';
import { loadManifest } from '../../src/core/manifest.js';

describe('tracker (marker-based)', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'sp-tracker-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns empty installed when no files exist', async () => {
    const tracker = await loadTracker(tmpDir);
    expect(tracker.installed).toEqual({});
  });

  it('detects installed packs from markers', async () => {
    const manifest = await loadManifest('common');
    await install(manifest, tmpDir);

    const tracker = await loadTracker(tmpDir);
    expect(isInstalled(tracker, 'common')).toBe(true);
    expect(isInstalled(tracker, 'unity')).toBe(false);
    expect(getInstalledVersion(tracker, 'common')).toBe(manifest.version);
  });

  it('detects multiple packs', async () => {
    const common = await loadManifest('common');
    const unity = await loadManifest('unity');
    await install(common, tmpDir);
    await install(unity, tmpDir);

    const tracker = await loadTracker(tmpDir);
    expect(Object.keys(tracker.installed)).toContain('common');
    expect(Object.keys(tracker.installed)).toContain('unity');
  });
});
