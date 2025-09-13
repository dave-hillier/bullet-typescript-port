/**
 * Unit tests for b3Scalar.ts
 * Tests the core scalar types and mathematical functions
 */

import {
    B3_BULLET_VERSION,
    b3GetVersion,
    B3_LARGE_FLOAT,
    B3_EPSILON,
    B3_INFINITY,
    B3_2_PI,
    B3_PI,
    B3_HALF_PI,
    B3_RADS_PER_DEG,
    B3_DEGS_PER_RAD,
    B3_SQRT12,
    b3Assert,
    b3Sqrt,
    b3Fabs,
    b3Cos,
    b3Sin,
    b3Tan,
    b3Acos,
    b3Asin,
    b3Atan,
    b3Atan2,
    b3Exp,
    b3Log,
    b3Pow,
    b3Fmod,
    b3RecipSqrt,
    b3Atan2Fast,
    b3FuzzyZero,
    b3Equal,
    b3GreaterEqual,
    b3IsNegative,
    b3Radians,
    b3Degrees,
    b3Fsel,
    b3Fsels,
    b3MachineIsLittleEndian,
    b3Select,
    b3SelectFloat,
    b3Swap,
    b3SwapEndian,
    b3SwapEndianShort,
    b3SwapEndianFloat,
    b3UnswapEndianFloat,
    b3NormalizeAngle,
    b3TypedObject,
    b3AlignNumber
} from './b3Scalar';

describe('b3Scalar', () => {
    describe('Constants and Version', () => {
        test('should have correct version', () => {
            expect(B3_BULLET_VERSION).toBe(300);
            expect(b3GetVersion()).toBe(300);
        });

        test('should have correct mathematical constants', () => {
            expect(B3_LARGE_FLOAT).toBe(1e18);
            expect(B3_EPSILON).toBe(Number.EPSILON);
            expect(B3_INFINITY).toBe(Number.POSITIVE_INFINITY);
            
            expect(B3_2_PI).toBeCloseTo(6.283185307179586232, 10);
            expect(B3_PI).toBeCloseTo(Math.PI, 10);
            expect(B3_HALF_PI).toBeCloseTo(Math.PI / 2, 10);
            expect(B3_RADS_PER_DEG).toBeCloseTo(Math.PI / 180, 10);
            expect(B3_DEGS_PER_RAD).toBeCloseTo(180 / Math.PI, 10);
            expect(B3_SQRT12).toBeCloseTo(Math.sqrt(2) / 2, 10);
        });
    });

    describe('Mathematical Functions', () => {
        test('b3Sqrt should work correctly', () => {
            expect(b3Sqrt(4)).toBe(2);
            expect(b3Sqrt(9)).toBe(3);
            expect(b3Sqrt(0)).toBe(0);
            expect(b3Sqrt(2)).toBeCloseTo(Math.sqrt(2), 10);
        });

        test('b3Fabs should work correctly', () => {
            expect(b3Fabs(5)).toBe(5);
            expect(b3Fabs(-5)).toBe(5);
            expect(b3Fabs(0)).toBe(0);
            expect(b3Fabs(-3.14)).toBeCloseTo(3.14, 10);
        });

        test('trigonometric functions should work correctly', () => {
            expect(b3Cos(0)).toBeCloseTo(1, 10);
            expect(b3Cos(B3_PI)).toBeCloseTo(-1, 10);
            expect(b3Sin(0)).toBeCloseTo(0, 10);
            expect(b3Sin(B3_HALF_PI)).toBeCloseTo(1, 10);
            expect(b3Tan(0)).toBeCloseTo(0, 10);
            expect(b3Tan(B3_PI / 4)).toBeCloseTo(1, 10);
        });

        test('inverse trigonometric functions should work correctly', () => {
            expect(b3Acos(1)).toBeCloseTo(0, 10);
            expect(b3Acos(-1)).toBeCloseTo(B3_PI, 10);
            expect(b3Asin(0)).toBeCloseTo(0, 10);
            expect(b3Asin(1)).toBeCloseTo(B3_HALF_PI, 10);
            expect(b3Atan(0)).toBeCloseTo(0, 10);
            expect(b3Atan(1)).toBeCloseTo(B3_PI / 4, 10);
        });

        test('b3Acos and b3Asin should clamp input values', () => {
            expect(b3Acos(1.5)).toBeCloseTo(0, 10); // Should clamp to 1
            expect(b3Acos(-1.5)).toBeCloseTo(B3_PI, 10); // Should clamp to -1
            expect(b3Asin(1.5)).toBeCloseTo(B3_HALF_PI, 10); // Should clamp to 1
            expect(b3Asin(-1.5)).toBeCloseTo(-B3_HALF_PI, 10); // Should clamp to -1
        });

        test('b3Atan2 should work correctly', () => {
            expect(b3Atan2(0, 1)).toBeCloseTo(0, 10);
            expect(b3Atan2(1, 0)).toBeCloseTo(B3_HALF_PI, 10);
            expect(b3Atan2(1, 1)).toBeCloseTo(B3_PI / 4, 10);
        });

        test('logarithmic and exponential functions should work correctly', () => {
            expect(b3Exp(0)).toBeCloseTo(1, 10);
            expect(b3Exp(1)).toBeCloseTo(Math.E, 10);
            expect(b3Log(1)).toBeCloseTo(0, 10);
            expect(b3Log(Math.E)).toBeCloseTo(1, 10);
            expect(b3Pow(2, 3)).toBe(8);
            expect(b3Pow(3, 2)).toBe(9);
        });

        test('b3Fmod should work correctly', () => {
            expect(b3Fmod(5, 3)).toBeCloseTo(2, 10);
            expect(b3Fmod(7.5, 2.5)).toBeCloseTo(0, 10); // 7.5 % 2.5 = 0
        });

        test('b3RecipSqrt should work correctly', () => {
            expect(b3RecipSqrt(4)).toBeCloseTo(0.5, 10);
            expect(b3RecipSqrt(1)).toBeCloseTo(1, 10);
        });
    });

    describe('Utility Functions', () => {
        test('b3Atan2Fast should approximate b3Atan2', () => {
            const cases = [
                [0, 1],
                [1, 0],
                [1, 1],
                [-1, 1],
                [1, -1]
            ];
            
            cases.forEach(([y, x]) => {
                const exact = b3Atan2(y, x);
                const fast = b3Atan2Fast(y, x);
                expect(fast).toBeCloseTo(exact, 1); // Fast approximation, lower precision
            });
        });

        test('b3FuzzyZero should detect near-zero values', () => {
            expect(b3FuzzyZero(0)).toBe(true);
            expect(b3FuzzyZero(B3_EPSILON / 2)).toBe(true);
            expect(b3FuzzyZero(B3_EPSILON * 2)).toBe(false);
            expect(b3FuzzyZero(1)).toBe(false);
        });

        test('b3Equal should work correctly', () => {
            expect(b3Equal(0, 0.1)).toBe(true); // 0 <= 0.1
            expect(b3Equal(0.1, 0.1)).toBe(true);
            expect(b3Equal(-0.05, 0.1)).toBe(true);
            expect(b3Equal(-0.2, 0.1)).toBe(false);
        });

        test('b3GreaterEqual should work correctly', () => {
            expect(b3GreaterEqual(0.2, 0.1)).toBe(true);
            expect(b3GreaterEqual(0.1, 0.1)).toBe(false);
            expect(b3GreaterEqual(0, 0.1)).toBe(false);
        });

        test('b3IsNegative should work correctly', () => {
            expect(b3IsNegative(-1)).toBe(1);
            expect(b3IsNegative(0)).toBe(0);
            expect(b3IsNegative(1)).toBe(0);
        });

        test('angle conversions should work correctly', () => {
            expect(b3Radians(180)).toBeCloseTo(B3_PI, 10);
            expect(b3Radians(90)).toBeCloseTo(B3_HALF_PI, 10);
            expect(b3Degrees(B3_PI)).toBeCloseTo(180, 10);
            expect(b3Degrees(B3_HALF_PI)).toBeCloseTo(90, 10);
        });

        test('b3Fsel should work correctly', () => {
            expect(b3Fsel(1, 10, 20)).toBe(10);
            expect(b3Fsel(0, 10, 20)).toBe(10);
            expect(b3Fsel(-1, 10, 20)).toBe(20);
        });

        test('b3Fsels should be alias for b3Fsel', () => {
            expect(b3Fsels(1, 10, 20)).toBe(b3Fsel(1, 10, 20));
            expect(b3Fsels(-1, 10, 20)).toBe(b3Fsel(-1, 10, 20));
        });
    });

    describe('Selection Functions', () => {
        test('b3Select should work correctly', () => {
            expect(b3Select(1, 10, 20)).toBe(10);
            expect(b3Select(0, 10, 20)).toBe(20);
            expect(b3Select(5, 10, 20)).toBe(10);
        });

        test('b3SelectFloat should work correctly', () => {
            expect(b3SelectFloat(1, 3.14, 2.71)).toBeCloseTo(3.14, 10);
            expect(b3SelectFloat(0, 3.14, 2.71)).toBeCloseTo(2.71, 10);
        });
    });

    describe('Endian Functions', () => {
        test('b3MachineIsLittleEndian should return boolean', () => {
            expect(typeof b3MachineIsLittleEndian()).toBe('boolean');
        });

        test('b3SwapEndian should swap endianness', () => {
            const value = 0x12345678;
            const swapped = b3SwapEndian(value);
            expect(swapped).toBe(0x78563412);
        });

        test('b3SwapEndianShort should swap endianness for shorts', () => {
            const value = 0x1234;
            const swapped = b3SwapEndianShort(value);
            expect(swapped).toBe(0x3412);
        });

        test('endian float swapping should be reversible', () => {
            const original = 3.14159;
            const swapped = b3SwapEndianFloat(original);
            const unswapped = b3UnswapEndianFloat(swapped);
            expect(unswapped).toBeCloseTo(original, 5);
        });
    });

    describe('b3Swap', () => {
        test('should swap values correctly', () => {
            const a = { value: 10 };
            const b = { value: 20 };
            
            b3Swap(a, b);
            
            expect(a.value).toBe(20);
            expect(b.value).toBe(10);
        });
    });

    describe('b3NormalizeAngle', () => {
        test('should normalize angles to [-PI, PI] range', () => {
            expect(b3NormalizeAngle(0)).toBeCloseTo(0, 10);
            expect(b3NormalizeAngle(B3_PI)).toBeCloseTo(B3_PI, 10);
            expect(b3NormalizeAngle(-B3_PI)).toBeCloseTo(-B3_PI, 10);
            expect(b3NormalizeAngle(3 * B3_PI)).toBeCloseTo(B3_PI, 10); // 3*PI % 2*PI = PI
            expect(b3NormalizeAngle(-3 * B3_PI)).toBeCloseTo(-B3_PI, 10); // -3*PI % 2*PI = -PI
            expect(b3NormalizeAngle(5 * B3_PI)).toBeCloseTo(B3_PI, 10); // 5*PI % 2*PI = PI
        });
    });

    describe('b3TypedObject', () => {
        test('should store and return object type', () => {
            const obj = new b3TypedObject(42);
            expect(obj.getObjectType()).toBe(42);
        });
    });

    describe('b3AlignNumber', () => {
        test('should align numbers correctly', () => {
            expect(b3AlignNumber(10, 4)).toBe(12); // 10 aligned to 4-byte boundary
            expect(b3AlignNumber(12, 4)).toBe(12); // already aligned
            expect(b3AlignNumber(13, 4)).toBe(16); // 13 aligned to 4-byte boundary
            expect(b3AlignNumber(15, 8)).toBe(16); // 15 aligned to 8-byte boundary
        });
    });

    describe('b3Assert', () => {
        test('should not throw for true conditions', () => {
            expect(() => b3Assert(true)).not.toThrow();
            expect(() => b3Assert(1 === 1)).not.toThrow();
        });

        test('should throw for false conditions', () => {
            expect(() => b3Assert(false)).toThrow();
            expect(() => b3Assert(false, "Test failure")).toThrow();
        });

        test('should throw with custom message', () => {
            expect(() => b3Assert(false, 'Custom error message')).toThrow('Custom error message');
        });
    });
});