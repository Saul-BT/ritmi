import { cn } from '../utils';

describe('cn utility function', () => {
  test('should merge className strings', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  test('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    
    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    );
    
    expect(result).toContain('base-class');
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
    expect(result).toBe('base-class active');
  });

  test('should handle undefined, null and false values', () => {
    const result = cn('base-class', undefined, null, false, 'valid-class');
    expect(result).toBe('base-class valid-class');
  });

  test('should properly merge Tailwind utility classes', () => {
    // Tailwind utility conflict where p-4 should override p-2
    const result = cn('p-2 text-red-500', 'p-4 text-blue-500');
    
    // The merging behavior depends on tailwind-merge
    // It should keep the last conflicting utility (p-4) and merge the rest
    expect(result).toContain('p-4');
    expect(result).not.toContain('p-2');
    expect(result).toContain('text-blue-500');
    expect(result).not.toContain('text-red-500');
  });

  test('should handle object notation for conditional classes', () => {
    const result = cn({
      'base-class': true,
      'active': true,
      'disabled': false,
      'hidden': undefined,
    });
    
    expect(result).toContain('base-class');
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
    expect(result).not.toContain('hidden');
  });

  test('should handle array inputs', () => {
    const result = cn(['base-class', 'flex'], [null, 'p-4']);
    expect(result).toBe('base-class flex p-4');
  });
});
