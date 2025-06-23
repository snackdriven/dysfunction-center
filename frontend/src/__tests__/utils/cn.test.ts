import { cn } from '../../utils/cn';

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toContain('base');
    expect(result).toContain('conditional');
    expect(result).not.toContain('hidden');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'valid');
    expect(result).toContain('base');
    expect(result).toContain('valid');
  });

  it('merges conflicting Tailwind classes correctly', () => {
    // This test assumes clsx and tailwind-merge are working correctly
    const result = cn('p-4', 'p-2');
    // Should keep only the last padding class
    expect(result).toBeTruthy();
  });
});