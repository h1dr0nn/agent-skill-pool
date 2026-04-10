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

  it('install creates rules and skills in .windsurf/', async () => {
    const manifest = await loadManifest('common');
    const files = await install(manifest, tmpDir);

    const ruleFile = files.find((f) => typeof f === 'string' && f.includes('.windsurf') && f.includes('rules'));
    expect(ruleFile).toBeDefined();

    const skillDir = path.join(tmpDir, '.windsurf', 'skills');
    expect(await fileExists(skillDir)).toBe(true);
  });

  it('install creates agents as rules in .windsurf/rules/ for unity', async () => {
    const manifest = await loadManifest('unity');
    const files = await install(manifest, tmpDir);

    const agentFile = files.find((f) => typeof f === 'string' && f.includes('-agent-'));
    expect(agentFile).toBeDefined();
    expect(agentFile).toContain('.windsurf');
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
