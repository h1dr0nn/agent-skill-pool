import { describe, it, expect } from 'vitest';
import { loadManifest, listAvailablePacks } from '../../src/core/manifest.js';

describe('loadManifest', () => {
  it('loads common manifest with skills', async () => {
    const manifest = await loadManifest('common');
    expect(manifest.name).toBe('common');
    expect(manifest.depends).toEqual([]);
    expect(manifest.skills.length).toBeGreaterThan(0);
    expect(manifest.type).toBe('universal');
  });

  it('throws for non-existent pack', async () => {
    await expect(loadManifest('nonexistent')).rejects.toThrow();
  });
});

describe('listAvailablePacks', () => {
  it('returns available packs', async () => {
    const packs = await listAvailablePacks();
    const names = packs.map((p) => p.name);
    expect(names).toContain('common');
    expect(packs.length).toBeGreaterThanOrEqual(1);
  });
});
