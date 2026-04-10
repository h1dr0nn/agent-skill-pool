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

  it('install creates rule files with marker comments', async () => {
    const manifest = await loadManifest('common');
    const files = await install(manifest, tmpDir);
    expect(files.length).toBeGreaterThanOrEqual(3);

    const ruleFile = files.find((f) => typeof f === 'string' && f.includes('rules') && f.endsWith('.md'));
    const content = await readFile(ruleFile, 'utf-8');
    expect(content).toContain('<!-- skill-pool:common:');
  });

  it('install creates skill directories with marker file', async () => {
    const manifest = await loadManifest('common');
    await install(manifest, tmpDir);

    const skillDir = path.join(tmpDir, '.claude', 'skills');
    expect(await fileExists(skillDir)).toBe(true);
  });

  it('install creates agent files for unity pack', async () => {
    const manifest = await loadManifest('unity');
    const files = await install(manifest, tmpDir);

    const agentFile = files.find((f) => typeof f === 'string' && f.includes('agents'));
    expect(agentFile).toBeDefined();
  });

  it('remove deletes rules, skills, and agents for a pack', async () => {
    const common = await loadManifest('common');
    const unity = await loadManifest('unity');
    await install(common, tmpDir);
    await install(unity, tmpDir);

    await remove('unity', tmpDir);
    const remaining = await list(tmpDir);
    expect(remaining.every((r) => r.pack === 'common')).toBe(true);
  });

  it('list returns items with types', async () => {
    const manifest = await loadManifest('unity');
    await install(manifest, tmpDir);

    const items = await list(tmpDir);
    const types = [...new Set(items.map((i) => i.type))];
    expect(types).toContain('rule');
    expect(types).toContain('skill');
    expect(types).toContain('agent');
  });
});
