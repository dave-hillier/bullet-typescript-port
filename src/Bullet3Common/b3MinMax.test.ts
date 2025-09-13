/**
 * Unit tests for b3MinMax.ts
 * Tests the min/max utility functions
 */

import {
    b3Min,
    b3Max,
    b3Clamped,
    b3SetMin,
    b3SetMax,
    b3Clamp,
    b3MinScalar,
    b3MaxScalar,
    b3ClampedScalar
} from './b3MinMax';

describe('b3MinMax', () => {
    describe('Generic Functions', () => {
        test('b3Min should return minimum of two values', () => {
            expect(b3Min(5, 3)).toBe(3);
            expect(b3Min(3, 5)).toBe(3);
            expect(b3Min(5, 5)).toBe(5);
            expect(b3Min(-2, 1)).toBe(-2);
            expect(b3Min(0, 0)).toBe(0);
            
            // Test with strings
            expect(b3Min('apple', 'banana')).toBe('apple');
            expect(b3Min('zebra', 'alpha')).toBe('alpha');
        });

        test('b3Max should return maximum of two values', () => {
            expect(b3Max(5, 3)).toBe(5);
            expect(b3Max(3, 5)).toBe(5);
            expect(b3Max(5, 5)).toBe(5);
            expect(b3Max(-2, 1)).toBe(1);
            expect(b3Max(0, 0)).toBe(0);
            
            // Test with strings
            expect(b3Max('apple', 'banana')).toBe('banana');
            expect(b3Max('zebra', 'alpha')).toBe('zebra');
        });

        test('b3Clamped should clamp values between bounds', () => {
            expect(b3Clamped(5, 1, 10)).toBe(5);
            expect(b3Clamped(0, 1, 10)).toBe(1);
            expect(b3Clamped(15, 1, 10)).toBe(10);
            expect(b3Clamped(1, 1, 10)).toBe(1);
            expect(b3Clamped(10, 1, 10)).toBe(10);
            
            // Test with negative bounds
            expect(b3Clamped(-5, -10, -1)).toBe(-5);
            expect(b3Clamped(-15, -10, -1)).toBe(-10);
            expect(b3Clamped(5, -10, -1)).toBe(-1);
        });

        test('b3SetMin should set value to minimum', () => {
            const a = { value: 5 };
            b3SetMin(a, 3);
            expect(a.value).toBe(3);
            
            const b = { value: 3 };
            b3SetMin(b, 5);
            expect(b.value).toBe(3); // Should not change
            
            const c = { value: 5 };
            b3SetMin(c, 5);
            expect(c.value).toBe(5); // Should not change
        });

        test('b3SetMax should set value to maximum', () => {
            const a = { value: 3 };
            b3SetMax(a, 5);
            expect(a.value).toBe(5);
            
            const b = { value: 5 };
            b3SetMax(b, 3);
            expect(b.value).toBe(5); // Should not change
            
            const c = { value: 5 };
            b3SetMax(c, 5);
            expect(c.value).toBe(5); // Should not change
        });

        test('b3Clamp should clamp value in-place', () => {
            const a = { value: 5 };
            b3Clamp(a, 1, 10);
            expect(a.value).toBe(5); // Should not change
            
            const b = { value: 0 };
            b3Clamp(b, 1, 10);
            expect(b.value).toBe(1); // Should clamp to lower bound
            
            const c = { value: 15 };
            b3Clamp(c, 1, 10);
            expect(c.value).toBe(10); // Should clamp to upper bound
            
            const d = { value: 1 };
            b3Clamp(d, 1, 10);
            expect(d.value).toBe(1); // At lower bound, should not change
            
            const e = { value: 10 };
            b3Clamp(e, 1, 10);
            expect(e.value).toBe(10); // At upper bound, should not change
        });
    });

    describe('Scalar-Specific Functions', () => {
        test('b3MinScalar should return minimum using Math.min', () => {
            expect(b3MinScalar(5.5, 3.3)).toBeCloseTo(3.3, 10);
            expect(b3MinScalar(3.3, 5.5)).toBeCloseTo(3.3, 10);
            expect(b3MinScalar(-2.7, 1.1)).toBeCloseTo(-2.7, 10);
            expect(b3MinScalar(0, 0)).toBe(0);
            
            // Test with special values
            expect(b3MinScalar(Number.POSITIVE_INFINITY, 5)).toBe(5);
            expect(b3MinScalar(Number.NEGATIVE_INFINITY, 5)).toBe(Number.NEGATIVE_INFINITY);
            expect(b3MinScalar(NaN, 5)).toBeNaN();
        });

        test('b3MaxScalar should return maximum using Math.max', () => {
            expect(b3MaxScalar(5.5, 3.3)).toBeCloseTo(5.5, 10);
            expect(b3MaxScalar(3.3, 5.5)).toBeCloseTo(5.5, 10);
            expect(b3MaxScalar(-2.7, 1.1)).toBeCloseTo(1.1, 10);
            expect(b3MaxScalar(0, 0)).toBe(0);
            
            // Test with special values
            expect(b3MaxScalar(Number.POSITIVE_INFINITY, 5)).toBe(Number.POSITIVE_INFINITY);
            expect(b3MaxScalar(Number.NEGATIVE_INFINITY, 5)).toBe(5);
            expect(b3MaxScalar(NaN, 5)).toBeNaN();
        });

        test('b3ClampedScalar should clamp using Math functions', () => {
            expect(b3ClampedScalar(5.5, 1.1, 10.9)).toBeCloseTo(5.5, 10);
            expect(b3ClampedScalar(0.5, 1.1, 10.9)).toBeCloseTo(1.1, 10);
            expect(b3ClampedScalar(15.5, 1.1, 10.9)).toBeCloseTo(10.9, 10);
            expect(b3ClampedScalar(1.1, 1.1, 10.9)).toBeCloseTo(1.1, 10);
            expect(b3ClampedScalar(10.9, 1.1, 10.9)).toBeCloseTo(10.9, 10);
            
            // Test with negative values
            expect(b3ClampedScalar(-5.5, -10.9, -1.1)).toBeCloseTo(-5.5, 10);
            expect(b3ClampedScalar(-15.5, -10.9, -1.1)).toBeCloseTo(-10.9, 10);
            expect(b3ClampedScalar(5.5, -10.9, -1.1)).toBeCloseTo(-1.1, 10);
            
            // Test with special values
            expect(b3ClampedScalar(Number.POSITIVE_INFINITY, 1, 10)).toBe(10);
            expect(b3ClampedScalar(Number.NEGATIVE_INFINITY, 1, 10)).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        test('should handle equal bounds in clamping functions', () => {
            expect(b3Clamped(5, 3, 3)).toBe(3);
            expect(b3Clamped(1, 3, 3)).toBe(3);
            expect(b3ClampedScalar(5.5, 3.3, 3.3)).toBeCloseTo(3.3, 10);
            
            const a = { value: 5 };
            b3Clamp(a, 3, 3);
            expect(a.value).toBe(3);
        });

        test('should handle zero values correctly', () => {
            expect(b3Min(0, -0)).toBe(-0); // JavaScript distinguishes +0 and -0
            expect(b3Max(0, -0)).toBe(-0); // Max can return either, both are zero
            expect(b3Clamped(0, -1, 1)).toBe(0);
            expect(b3ClampedScalar(0, -1, 1)).toBe(0);
        });

        test('should handle very small and large numbers', () => {
            const tiny = Number.MIN_VALUE;
            const huge = Number.MAX_VALUE;
            
            expect(b3Min(tiny, huge)).toBe(tiny);
            expect(b3Max(tiny, huge)).toBe(huge);
            expect(b3Clamped(huge, tiny, huge)).toBe(huge);
            expect(b3ClampedScalar(huge, tiny, huge)).toBe(huge);
        });

        test('should work with floating point precision', () => {
            const a = 0.1 + 0.2; // 0.30000000000000004
            const b = 0.3;
            
            // These might not be exactly equal due to floating point precision
            const min = b3Min(a, b);
            const max = b3Max(a, b);
            
            expect(min).toBe(b); // b is smaller
            expect(max).toBe(a); // a is larger
        });
    });
});