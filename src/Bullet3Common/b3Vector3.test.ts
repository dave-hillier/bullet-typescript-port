/**
 * Unit tests for b3Vector3.ts
 * Tests the 3D vector mathematics implementation
 */

import {
    b3Vector3,
    b3Vector4,
    b3MakeVector3,
    b3MakeVector4,
    b3Dot,
    b3Cross,
    b3Distance,
    b3Lerp
} from './b3Vector3';

describe('b3Vector3', () => {
    describe('Constructor and Basic Properties', () => {
        test('should create vector with default values', () => {
            const v = new b3Vector3();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
            expect(v.z).toBe(0);
            expect(v.w).toBe(0);
        });

        test('should create vector with specified values', () => {
            const v = new b3Vector3(1, 2, 3, 4);
            expect(v.x).toBe(1);
            expect(v.y).toBe(2);
            expect(v.z).toBe(3);
            expect(v.w).toBe(4);
        });

        test('should provide getters and setters', () => {
            const v = new b3Vector3();
            v.setX(1);
            v.setY(2);
            v.setZ(3);
            v.setW(4);
            
            expect(v.getX()).toBe(1);
            expect(v.getY()).toBe(2);
            expect(v.getZ()).toBe(3);
            expect(v.getW()).toBe(4);
        });

        test('should allow array-like access', () => {
            const v = new b3Vector3(1, 2, 3, 4);
            expect(v.get(0)).toBe(1);
            expect(v.get(1)).toBe(2);
            expect(v.get(2)).toBe(3);
            expect(v.get(3)).toBe(4);
            
            v.set(0, 10);
            expect(v.get(0)).toBe(10);
        });

        test('should support setValue method', () => {
            const v = new b3Vector3();
            v.setValue(5, 6, 7);
            expect(v.x).toBe(5);
            expect(v.y).toBe(6);
            expect(v.z).toBe(7);
            expect(v.w).toBe(0); // w should be set to 0
        });
    });

    describe('Vector Operations', () => {
        test('should add vectors correctly', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(4, 5, 6);
            const result = v1.add(v2);
            
            expect(result.x).toBe(5);
            expect(result.y).toBe(7);
            expect(result.z).toBe(9);
        });

        test('should subtract vectors correctly', () => {
            const v1 = new b3Vector3(4, 5, 6);
            const v2 = new b3Vector3(1, 2, 3);
            const result = v1.subtract(v2);
            
            expect(result.x).toBe(3);
            expect(result.y).toBe(3);
            expect(result.z).toBe(3);
        });

        test('should scale vectors correctly', () => {
            const v = new b3Vector3(1, 2, 3);
            const result = v.scale(2);
            
            expect(result.x).toBe(2);
            expect(result.y).toBe(4);
            expect(result.z).toBe(6);
        });

        test('should negate vectors correctly', () => {
            const v = new b3Vector3(1, -2, 3);
            const result = v.negate();
            
            expect(result.x).toBe(-1);
            expect(result.y).toBe(2);
            expect(result.z).toBe(-3);
        });

        test('should perform in-place operations', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(4, 5, 6);
            
            v1.addAssign(v2);
            expect(v1.x).toBe(5);
            expect(v1.y).toBe(7);
            expect(v1.z).toBe(9);
            
            v1.multiplyAssign(2);
            expect(v1.x).toBe(10);
            expect(v1.y).toBe(14);
            expect(v1.z).toBe(18);
        });
    });

    describe('Dot Product', () => {
        test('should calculate dot product correctly', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(4, 5, 6);
            const result = v1.dot(v2);
            
            expect(result).toBe(32); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        });

        test('should calculate dot product with orthogonal vectors', () => {
            const v1 = new b3Vector3(1, 0, 0);
            const v2 = new b3Vector3(0, 1, 0);
            const result = v1.dot(v2);
            
            expect(result).toBe(0);
        });

        test('should calculate dot product with parallel vectors', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(2, 4, 6);
            const result = v1.dot(v2);
            
            // 1*2 + 2*4 + 3*6 = 2 + 8 + 18 = 28
            expect(result).toBe(28);
        });
    });

    describe('Cross Product', () => {
        test('should calculate cross product correctly', () => {
            const v1 = new b3Vector3(1, 0, 0);
            const v2 = new b3Vector3(0, 1, 0);
            const result = v1.cross(v2);
            
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
            expect(result.z).toBe(1);
        });

        test('should calculate cross product with general vectors', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(4, 5, 6);
            const result = v1.cross(v2);
            
            // Cross product formula: (a2*b3 - a3*b2, a3*b1 - a1*b3, a1*b2 - a2*b1)
            // (2*6 - 3*5, 3*4 - 1*6, 1*5 - 2*4) = (12-15, 12-6, 5-8) = (-3, 6, -3)
            expect(result.x).toBe(-3);
            expect(result.y).toBe(6);
            expect(result.z).toBe(-3);
        });

        test('cross product of parallel vectors should be zero', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(2, 4, 6);
            const result = v1.cross(v2);
            
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
            expect(result.z).toBe(0);
        });
    });

    describe('Length and Distance', () => {
        test('should calculate length correctly', () => {
            const v = new b3Vector3(3, 4, 0);
            expect(v.length()).toBe(5);
            
            const v2 = new b3Vector3(1, 1, 1);
            expect(v2.length()).toBeCloseTo(Math.sqrt(3), 10);
        });

        test('should calculate length squared correctly', () => {
            const v = new b3Vector3(3, 4, 0);
            expect(v.length2()).toBe(25);
            
            const v2 = new b3Vector3(1, 2, 3);
            expect(v2.length2()).toBe(14); // 1 + 4 + 9 = 14
        });

        test('should calculate distance correctly', () => {
            const v1 = new b3Vector3(0, 0, 0);
            const v2 = new b3Vector3(3, 4, 0);
            
            expect(v1.distance(v2)).toBe(5);
            expect(v2.distance(v1)).toBe(5);
        });

        test('should calculate distance squared correctly', () => {
            const v1 = new b3Vector3(0, 0, 0);
            const v2 = new b3Vector3(3, 4, 0);
            
            expect(v1.distance2(v2)).toBe(25);
            expect(v2.distance2(v1)).toBe(25);
        });
    });

    describe('Normalization', () => {
        test('should normalize vectors correctly', () => {
            const v = new b3Vector3(3, 4, 0);
            const normalized = v.normalized();
            
            expect(normalized.length()).toBeCloseTo(1, 10);
            expect(normalized.x).toBeCloseTo(0.6, 10);
            expect(normalized.y).toBeCloseTo(0.8, 10);
            expect(normalized.z).toBe(0);
        });

        test('should normalize in place', () => {
            const v = new b3Vector3(3, 4, 0);
            v.normalize();
            
            expect(v.length()).toBeCloseTo(1, 10);
            expect(v.x).toBeCloseTo(0.6, 10);
            expect(v.y).toBeCloseTo(0.8, 10);
        });

        test('should safely normalize zero vector', () => {
            const v = new b3Vector3(0, 0, 0);
            v.safeNormalize();
            
            // Should default to (1, 0, 0)
            expect(v.x).toBe(1);
            expect(v.y).toBe(0);
            expect(v.z).toBe(0);
        });
    });

    describe('Utility Methods', () => {
        test('should find min and max axis', () => {
            const v = new b3Vector3(3, 1, 5);
            expect(v.minAxis()).toBe(1); // y-axis has minimum value
            expect(v.maxAxis()).toBe(2); // z-axis has maximum value
        });

        test('should calculate absolute values', () => {
            const v = new b3Vector3(-3, 4, -5);
            const abs = v.absolute();
            
            expect(abs.x).toBe(3);
            expect(abs.y).toBe(4);
            expect(abs.z).toBe(5);
        });

        test('should check equality', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(1, 2, 3);
            const v3 = new b3Vector3(1, 2, 4);
            
            expect(v1.equals(v2)).toBe(true);
            expect(v1.equals(v3)).toBe(false);
        });

        test('should check if zero', () => {
            const zero = new b3Vector3(0, 0, 0);
            const nonZero = new b3Vector3(1, 0, 0);
            
            expect(zero.isZero()).toBe(true);
            expect(nonZero.isZero()).toBe(false);
        });

        test('should check if fuzzy zero', () => {
            const zero = new b3Vector3(0, 0, 0);
            const nearZero = new b3Vector3(1e-10, 1e-10, 1e-10);
            const notZero = new b3Vector3(0.1, 0, 0);
            
            expect(zero.fuzzyZero()).toBe(true);
            expect(nearZero.fuzzyZero()).toBe(true);
            expect(notZero.fuzzyZero()).toBe(false);
        });
    });

    describe('Linear Interpolation', () => {
        test('should interpolate between vectors', () => {
            const v1 = new b3Vector3(0, 0, 0);
            const v2 = new b3Vector3(10, 10, 10);
            
            const halfway = v1.lerp(v2, 0.5);
            expect(halfway.x).toBe(5);
            expect(halfway.y).toBe(5);
            expect(halfway.z).toBe(5);
            
            const start = v1.lerp(v2, 0);
            expect(start.equals(v1)).toBe(true);
            
            const end = v1.lerp(v2, 1);
            expect(end.equals(v2)).toBe(true);
        });
    });

    describe('Factory Functions', () => {
        test('b3MakeVector3 should create vectors', () => {
            const v = b3MakeVector3(1, 2, 3);
            expect(v.x).toBe(1);
            expect(v.y).toBe(2);
            expect(v.z).toBe(3);
            expect(v.w).toBe(0);
        });

        test('b3MakeVector4 should create vector4', () => {
            const v = b3MakeVector4(1, 2, 3, 4);
            expect(v.getX()).toBe(1);
            expect(v.getY()).toBe(2);
            expect(v.getZ()).toBe(3);
            expect(v.getW()).toBe(4);
        });
    });

    describe('Global Utility Functions', () => {
        test('b3Dot should calculate dot product', () => {
            const v1 = new b3Vector3(1, 2, 3);
            const v2 = new b3Vector3(4, 5, 6);
            expect(b3Dot(v1, v2)).toBe(32);
        });

        test('b3Cross should calculate cross product', () => {
            const v1 = new b3Vector3(1, 0, 0);
            const v2 = new b3Vector3(0, 1, 0);
            const result = b3Cross(v1, v2);
            expect(result.z).toBe(1);
        });

        test('b3Distance should calculate distance', () => {
            const v1 = new b3Vector3(0, 0, 0);
            const v2 = new b3Vector3(3, 4, 0);
            expect(b3Distance(v1, v2)).toBe(5);
        });

        test('b3Lerp should interpolate', () => {
            const v1 = new b3Vector3(0, 0, 0);
            const v2 = new b3Vector3(10, 10, 10);
            const result = b3Lerp(v1, v2, 0.5);
            expect(result.x).toBe(5);
        });
    });

    describe('b3Vector4', () => {
        test('should extend b3Vector3 functionality', () => {
            const v = new b3Vector4();
            v.setValue4(1, 2, 3, 4);
            
            expect(v.getX()).toBe(1);
            expect(v.getY()).toBe(2);
            expect(v.getZ()).toBe(3);
            expect(v.getW()).toBe(4);
        });

        test('should find max axis in 4D', () => {
            const v = new b3Vector4();
            v.setValue4(1, 5, 3, 2);
            expect(v.maxAxis4()).toBe(1); // y-axis has maximum value
        });

        test('should find min axis in 4D', () => {
            const v = new b3Vector4();
            v.setValue4(1, 5, 3, 2);
            expect(v.minAxis4()).toBe(0); // x-axis has minimum value
        });

        test('should calculate absolute values in 4D', () => {
            const v = new b3Vector4();
            v.setValue4(-1, 5, -3, 2);
            const abs = v.absolute4();
            
            expect(abs.getX()).toBe(1);
            expect(abs.getY()).toBe(5);
            expect(abs.getZ()).toBe(3);
            expect(abs.getW()).toBe(2);
        });
    });
});