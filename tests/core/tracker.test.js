import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  loadTracker,
  saveTracker,
  isInstalled,
  recordInstall,
  recordRemove,
} from '../../src/core/tracker.js';

describe('tracker', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'sp-test-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns default tracker when no file exists', async () => {
    const tracker = await loadTracker(tmpDir);
    expect(tracker.version).toBe('1.0.0');
    expect(tracker.installed).toEqual({});
  });

  it('round-trips save and load', async () => {
    const data = recordInstall(
      { version: '1.0.0', installed: {} },
      'unity',
      '0.1.0',
      ['claude']
    );
    await saveTracker(tmpDir, data);
    const loaded = await loadTracker(tmpDir);
    expect(loaded.installed.unity.version).toBe('0.1.0');
    expect(loaded.installed.unity.targets).toEqual(['claude']);
  });

  it('isInstalled returns correct values', () => {
    const data = { version: '1.0.0', installed: { unity: { version: '0.1.0' } } };
    expect(isInstalled(data, 'unity')).toBe(true);
    expect(isInstalled(data, 'web')).toBe(false);
  });

  it('recordRemove removes the pack', () => {
    const data = {
      version: '1.0.0',
      installed: {
        common: { version: '0.1.0' },
        unity: { version: '0.1.0' },
      },
    };
    const updated = recordRemove(data, 'unity');
    expect(updated.installed).toHaveProperty('common');
    expect(updated.installed).not.toHaveProperty('unity');
  });
});
