import { describe, it, expect } from 'vitest';
import { resolveDependencies } from '../../src/core/resolver.js';

describe('resolveDependencies', () => {
  it('resolves common to just [common]', async () => {
    const result = await resolveDependencies('common');
    expect(result).toEqual(['common']);
  });

  it('throws for non-existent pack', async () => {
    await expect(resolveDependencies('nonexistent')).rejects.toThrow();
  });
});
