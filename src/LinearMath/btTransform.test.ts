/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.

Original software license:
This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btTransform, btTransformEquals } from './btTransform';
import { btVector3 } from './btVector3';
import { btQuaternion } from './btQuaternion';
import { btMatrix3x3 } from './btMatrix3x3';
import { SIMD_PI, SIMD_HALF_PI } from './btScalar';

describe('btTransform', () => {
    const EPSILON = 1e-6;

    function expectVectorNear(actual: btVector3, expected: btVector3, epsilon = EPSILON): void {
        expect(Math.abs(actual.x() - expected.x())).toBeLessThan(epsilon);
        expect(Math.abs(actual.y() - expected.y())).toBeLessThan(epsilon);
        expect(Math.abs(actual.z() - expected.z())).toBeLessThan(epsilon);
    }

    function expectTransformNear(actual: btTransform, expected: btTransform, epsilon = EPSILON): void {
        expectVectorNear(actual.getOrigin(), expected.getOrigin(), epsilon);
        // Compare rotations by converting both to quaternions
        const actualQ = actual.getRotation();
        const expectedQ = expected.getRotation();
        expect(Math.abs(actualQ.x() - expectedQ.x())).toBeLessThan(epsilon);
        expect(Math.abs(actualQ.y() - expectedQ.y())).toBeLessThan(epsilon);
        expect(Math.abs(actualQ.z() - expectedQ.z())).toBeLessThan(epsilon);
        expect(Math.abs(actualQ.w() - expectedQ.w())).toBeLessThan(epsilon);
    }

    describe('Construction', () => {
        it('should create with no initialization constructor', () => {
            const t = new btTransform();
            expect(t).toBeDefined();
            expect(t.getOrigin()).toBeDefined();
            expect(t.getBasis()).toBeDefined();
        });

        it('should create from quaternion', () => {
            const q = new btQuaternion(0, 0, 0, 1); // Identity quaternion
            const origin = new btVector3(1, 2, 3);
            const t = new btTransform(q, origin);
            
            expectVectorNear(t.getOrigin(), origin);
            const resultQ = t.getRotation();
            expect(Math.abs(resultQ.x())).toBeLessThan(EPSILON);
            expect(Math.abs(resultQ.y())).toBeLessThan(EPSILON);
            expect(Math.abs(resultQ.z())).toBeLessThan(EPSILON);
            expect(Math.abs(resultQ.w() - 1)).toBeLessThan(EPSILON);
        });

        it('should create from quaternion with default origin', () => {
            const q = new btQuaternion(0, 0, 0, 1);
            const t = new btTransform(q);
            
            expectVectorNear(t.getOrigin(), new btVector3(0, 0, 0));
        });

        it('should create from matrix', () => {
            const basis = btMatrix3x3.getIdentity();
            const origin = new btVector3(4, 5, 6);
            const t = new btTransform(basis, origin);
            
            expectVectorNear(t.getOrigin(), origin);
            expect(t.getBasis().equals(basis)).toBe(true);
        });

        it('should create from matrix with default origin', () => {
            const basis = btMatrix3x3.getIdentity();
            const t = new btTransform(basis);
            
            expectVectorNear(t.getOrigin(), new btVector3(0, 0, 0));
        });

        it('should create copy constructor', () => {
            const original = new btTransform(new btQuaternion(0.1, 0.2, 0.3, 0.9), new btVector3(7, 8, 9));
            const copy = new btTransform(original);
            
            expect(copy.equals(original)).toBe(true);
            expectVectorNear(copy.getOrigin(), original.getOrigin());
        });
    });

    describe('Static factory methods', () => {
        it('should create identity transform', () => {
            const identity = btTransform.getIdentity();
            expectVectorNear(identity.getOrigin(), new btVector3(0, 0, 0));
            expect(identity.getBasis().equals(btMatrix3x3.getIdentity())).toBe(true);
        });

        it('should create from quaternion', () => {
            const q = new btQuaternion(0, 0, 0.7071, 0.7071); // 90 degree rotation around Z
            const origin = new btVector3(1, 2, 3);
            const t = btTransform.fromQuaternion(q, origin);
            
            expectVectorNear(t.getOrigin(), origin);
            const resultQ = t.getRotation();
            expect(Math.abs(resultQ.z() - 0.7071)).toBeLessThan(1e-4);
            expect(Math.abs(resultQ.w() - 0.7071)).toBeLessThan(1e-4);
        });

        it('should create from translation only', () => {
            const origin = new btVector3(10, 20, 30);
            const t = btTransform.fromTranslation(origin);
            
            expectVectorNear(t.getOrigin(), origin);
            expect(t.getBasis().equals(btMatrix3x3.getIdentity())).toBe(true);
        });

        it('should create from rotation only', () => {
            const q = new btQuaternion(0, 0, 0.7071, 0.7071);
            const t = btTransform.fromRotation(q);
            
            expectVectorNear(t.getOrigin(), new btVector3(0, 0, 0));
            const resultQ = t.getRotation();
            expect(Math.abs(resultQ.z() - 0.7071)).toBeLessThan(1e-4);
            expect(Math.abs(resultQ.w() - 0.7071)).toBeLessThan(1e-4);
        });
    });

    describe('Transform operations', () => {
        it('should transform a point correctly', () => {
            // Create a transform with translation (1, 0, 0) and 90-degree rotation around Z
            const q = new btQuaternion(0, 0, Math.sin(SIMD_HALF_PI / 2), Math.cos(SIMD_HALF_PI / 2));
            const t = new btTransform(q, new btVector3(1, 0, 0));
            
            const point = new btVector3(1, 0, 0);
            const transformed = t.transformPoint(point);
            
            // After rotation, (1,0,0) becomes (0,1,0), then translation adds (1,0,0)
            expectVectorNear(transformed, new btVector3(1, 1, 0), 1e-5);
        });

        it('should transform point using multiplyVector', () => {
            const t = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(2, 3, 4));
            const point = new btVector3(1, 1, 1);
            const transformed = t.multiplyVector(point);
            
            expectVectorNear(transformed, new btVector3(3, 4, 5));
        });

        it('should perform inverse transform correctly', () => {
            const original = new btTransform(
                new btQuaternion(0, 0, 0.7071, 0.7071),
                new btVector3(5, 10, 15)
            );
            
            const inverse = original.inverse();
            const identity = original.multiply(inverse);
            
            expectTransformNear(identity, btTransform.getIdentity(), 1e-5);
        });

        it('should perform inverse transform of vector correctly', () => {
            const t = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            const point = new btVector3(4, 5, 6);
            
            const transformed = t.transformPoint(point);
            const inverseTransformed = t.invXform(transformed);
            
            expectVectorNear(inverseTransformed, point);
        });
    });

    describe('Transform multiplication', () => {
        it('should multiply transforms correctly', () => {
            const t1 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 0, 0));
            const t2 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(0, 1, 0));
            
            const result = t1.multiply(t2);
            expectVectorNear(result.getOrigin(), new btVector3(1, 1, 0));
        });

        it('should multiply assign correctly', () => {
            const t1 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 0, 0));
            const t2 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(0, 1, 0));
            
            t1.multiplyAssign(t2);
            expectVectorNear(t1.getOrigin(), new btVector3(1, 1, 0));
        });

        it('should compute inverseTimes correctly', () => {
            const t1 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            const t2 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(4, 5, 6));
            
            const result = t1.inverseTimes(t2);
            const expected = t1.inverse().multiply(t2);
            
            expectTransformNear(result, expected);
        });

        it('should use mult method correctly', () => {
            const t1 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 1, 1));
            const t2 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(2, 2, 2));
            const result = new btTransform();
            
            result.mult(t1, t2);
            expectVectorNear(result.getOrigin(), new btVector3(3, 3, 3));
        });
    });

    describe('Quaternion operations', () => {
        it('should multiply quaternion correctly', () => {
            const q1 = new btQuaternion(0, 0, 0.7071, 0.7071); // 90 degrees around Z
            const t = btTransform.fromRotation(q1);
            
            const q2 = new btQuaternion(0.7071, 0, 0, 0.7071); // 90 degrees around X
            const result = t.multiplyQuaternion(q2);
            
            // This should be a composed rotation
            expect(result).toBeDefined();
        });

        it('should get rotation as quaternion correctly', () => {
            const originalQ = new btQuaternion(0.1, 0.2, 0.3, 0.9);
            originalQ.normalize();
            
            const t = new btTransform(originalQ);
            const resultQ = t.getRotation();
            
            expect(Math.abs(resultQ.x() - originalQ.x())).toBeLessThan(EPSILON);
            expect(Math.abs(resultQ.y() - originalQ.y())).toBeLessThan(EPSILON);
            expect(Math.abs(resultQ.z() - originalQ.z())).toBeLessThan(EPSILON);
            expect(Math.abs(resultQ.w() - originalQ.w())).toBeLessThan(EPSILON);
        });
    });

    describe('Property access', () => {
        it('should set and get origin correctly', () => {
            const t = new btTransform();
            const origin = new btVector3(7, 8, 9);
            
            t.setOrigin(origin);
            expectVectorNear(t.getOrigin(), origin);
        });

        it('should set and get basis correctly', () => {
            const t = new btTransform();
            const basis = new btMatrix3x3(new btQuaternion(0.1, 0.2, 0.3, 0.9));
            
            t.setBasis(basis);
            expect(t.getBasis().equals(basis)).toBe(true);
        });

        it('should set rotation by quaternion correctly', () => {
            const t = new btTransform();
            const q = new btQuaternion(0, 0, 0.7071, 0.7071);
            
            t.setRotation(q);
            const resultQ = t.getRotation();
            
            expect(Math.abs(resultQ.z() - 0.7071)).toBeLessThan(1e-4);
            expect(Math.abs(resultQ.w() - 0.7071)).toBeLessThan(1e-4);
        });

        it('should set identity correctly', () => {
            const t = new btTransform(new btQuaternion(0.1, 0.2, 0.3, 0.9), new btVector3(1, 2, 3));
            
            t.setIdentity();
            expectTransformNear(t, btTransform.getIdentity());
        });

        it('should provide const getters', () => {
            const t = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            
            const origin = t.getOriginConst();
            const basis = t.getBasisConst();
            
            expectVectorNear(origin, new btVector3(1, 2, 3));
            expect(basis).toBeDefined();
        });
    });

    describe('OpenGL matrix operations', () => {
        it('should convert to/from OpenGL matrix correctly', () => {
            const original = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            const matrix = new Array(16).fill(0);
            
            original.getOpenGLMatrix(matrix);
            
            // Check translation components
            expect(matrix[12]).toBeCloseTo(1);
            expect(matrix[13]).toBeCloseTo(2);
            expect(matrix[14]).toBeCloseTo(3);
            expect(matrix[15]).toBeCloseTo(1);
            
            // Create new transform from matrix
            const restored = new btTransform();
            restored.setFromOpenGLMatrix(matrix);
            
            expectTransformNear(restored, original);
        });

        it('should handle rotation in OpenGL matrix', () => {
            const q = new btQuaternion(0, 0, 0.7071, 0.7071); // 90 degrees around Z
            const original = new btTransform(q, new btVector3(0, 0, 0));
            const matrix = new Array(16).fill(0);
            
            original.getOpenGLMatrix(matrix);
            
            const restored = new btTransform();
            restored.setFromOpenGLMatrix(matrix);
            
            expectTransformNear(restored, original, 1e-4);
        });
    });

    describe('Equality and comparison', () => {
        it('should test equality correctly', () => {
            const t1 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            const t2 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            const t3 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 4));
            
            expect(t1.equals(t2)).toBe(true);
            expect(t1.equals(t3)).toBe(false);
        });

        it('should test equality using global function', () => {
            const t1 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            const t2 = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            
            expect(btTransformEquals(t1, t2)).toBe(true);
        });
    });

    describe('Cloning and assignment', () => {
        it('should clone correctly', () => {
            const original = new btTransform(new btQuaternion(0.1, 0.2, 0.3, 0.9), new btVector3(4, 5, 6));
            const clone = original.clone();
            
            expect(clone.equals(original)).toBe(true);
            expect(clone).not.toBe(original); // Different objects
        });

        it('should assign correctly', () => {
            const t1 = new btTransform(new btQuaternion(0.1, 0.2, 0.3, 0.9), new btVector3(1, 2, 3));
            const t2 = new btTransform();
            
            t2.assign(t1);
            expect(t2.equals(t1)).toBe(true);
        });
    });

    describe('Complex transformations', () => {
        it('should handle combined rotation and translation correctly', () => {
            // Create a 90-degree rotation around Z-axis and translate by (1, 0, 0)
            const q = new btQuaternion(0, 0, Math.sin(SIMD_PI/4), Math.cos(SIMD_PI/4));
            const t = new btTransform(q, new btVector3(1, 0, 0));
            
            // Transform point (1, 0, 0)
            const point = new btVector3(1, 0, 0);
            const result = t.transformPoint(point);
            
            // Should be approximately (1, 1, 0)
            expect(Math.abs(result.x() - 1)).toBeLessThan(1e-5);
            expect(Math.abs(result.y() - 1)).toBeLessThan(1e-5);
            expect(Math.abs(result.z())).toBeLessThan(1e-5);
        });

        it('should maintain transform properties under composition', () => {
            const t1 = new btTransform(
                new btQuaternion(0, 0, 0.7071, 0.7071),
                new btVector3(1, 0, 0)
            );
            const t2 = new btTransform(
                new btQuaternion(0.7071, 0, 0, 0.7071),
                new btVector3(0, 1, 0)
            );
            
            const composed = t1.multiply(t2);
            const inverse = composed.inverse();
            const shouldBeIdentity = composed.multiply(inverse);
            
            expectTransformNear(shouldBeIdentity, btTransform.getIdentity(), 1e-5);
        });

        it('should handle transform chains correctly', () => {
            const t1 = btTransform.fromTranslation(new btVector3(1, 0, 0));
            const t2 = btTransform.fromTranslation(new btVector3(0, 1, 0));
            const t3 = btTransform.fromTranslation(new btVector3(0, 0, 1));
            
            const combined = t1.multiply(t2).multiply(t3);
            const point = new btVector3(0, 0, 0);
            const result = combined.transformPoint(point);
            
            expectVectorNear(result, new btVector3(1, 1, 1));
        });
    });

    describe('String representation', () => {
        it('should provide string representation', () => {
            const t = new btTransform(new btQuaternion(0, 0, 0, 1), new btVector3(1, 2, 3));
            const str = t.toString();
            
            expect(str).toContain('btTransform');
            expect(str).toContain('basis');
            expect(str).toContain('origin');
        });
    });
});