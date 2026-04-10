import { describe, it, expect } from 'vitest';
import { loadManifest, listAvailablePacks } from '../../src/core/manifest.js';

describe('loadManifest', () => {
  it('loads common manifest with rules, skills, and agents', async () => {
    const manifest = await loadManifest('common');
    expect(manifest.name).toBe('common');
    expect(manifest.depends).toEqual([]);
    expect(manifest.rules.length).toBeGreaterThan(0);
    expect(manifest.skills.length).toBeGreaterThan(0);
    expect(manifest.agents.length).toBeGreaterThan(0);
  });

  it('loads unity manifest with dependency on common', async () => {
    const manifest = await loadManifest('unity');
    expect(manifest.name).toBe('unity');
    expect(manifest.depends).toEqual(['common']);
    expect(manifest.skills.length).toBeGreaterThan(0);
  });

  it('throws for non-existent pack', async () => {
    await expect(loadManifest('nonexistent')).rejects.toThrow();
  });
});

describe('listAvailablePacks', () => {
  it('returns all packs', async () => {
    const packs = await listAvailablePacks();
    const names = packs.map((p) => p.name);
    expect(names).toContain('common');
    expect(names).toContain('unity');
    expect(names).toContain('web');
    expect(names).toContain('api');
    expect(names).toContain('python');
  });
});
