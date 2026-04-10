import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { getAdapter, detectTargets, getAllTargetNames } from '../../src/adapters/index.js';

describe('adapter registry', () => {
  let tmpDir;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'sp-registry-'));
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('getAdapter returns valid adapters', () => {
    expect(getAdapter('claude')).toBeDefined();
    expect(getAdapter('cursor')).toBeDefined();
    expect(getAdapter('windsurf')).toBeDefined();
    expect(getAdapter('antigravity')).toBeDefined();
  });

  it('getAdapter throws for unknown target', () => {
    expect(() => getAdapter('vscode')).toThrow('Unknown target');
  });

  it('getAllTargetNames returns all four', () => {
    const names = getAllTargetNames();
    expect(names).toContain('claude');
    expect(names).toContain('cursor');
    expect(names).toContain('windsurf');
    expect(names).toContain('antigravity');
  });

  it('detectTargets finds .agent directory for antigravity', async () => {
    await mkdir(path.join(tmpDir, '.agent'));
    const detected = await detectTargets(tmpDir);
    expect(detected).toContain('antigravity');
  });

  it('detectTargets finds .claude directory', async () => {
    await mkdir(path.join(tmpDir, '.claude'));
    const detected = await detectTargets(tmpDir);
    expect(detected).toContain('claude');
    expect(detected).not.toContain('cursor');
  });

  it('detectTargets finds multiple targets', async () => {
    await mkdir(path.join(tmpDir, '.claude'));
    await mkdir(path.join(tmpDir, '.cursor'));
    const detected = await detectTargets(tmpDir);
    expect(detected).toContain('claude');
    expect(detected).toContain('cursor');
  });

  it('detectTargets returns empty for clean directory', async () => {
    const detected = await detectTargets(tmpDir);
    expect(detected).toEqual([]);
  });
});
