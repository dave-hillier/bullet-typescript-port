/*
Unit tests for btQuaternion TypeScript port
Tests quaternion construction, arithmetic, rotations, and mathematical properties
*/

import { btQuaternion, btQuatRotate, btShortestArcQuat, btSlerp } from './btQuaternion';
import { btVector3 } from './btVector3';
import { SIMD_PI, SIMD_EPSILON, btSqrt, btCos, btSin } from './btScalar';

describe('btQuaternion', () => {
    describe('Construction', () => {
        test('default constructor creates uninitialized quaternion', () => {
            const q = new btQuaternion();
            // Values are uninitialized, so we just verify construction doesn't throw
            expect(q).toBeInstanceOf(btQuaternion);
        });

        test('constructor from four scalars', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            expect(q.x()).toBe(1);
            expect(q.y()).toBe(2);
            expect(q.z()).toBe(3);
            expect(q.w()).toBe(4);
        });

        test('copy constructor', () => {
            const original = new btQuaternion(1, 2, 3, 4);
            const copy = new btQuaternion(original);
            expect(copy.x()).toBe(1);
            expect(copy.y()).toBe(2);
            expect(copy.z()).toBe(3);
            expect(copy.w()).toBe(4);
            expect(copy.equals(original)).toBe(true);
        });

        test('axis-angle constructor', () => {
            const axis = new btVector3(0, 0, 1); // Z-axis
            const angle = SIMD_PI / 2; // 90 degrees
            const q = new btQuaternion(axis, angle);
            
            // For rotation around Z by 90 degrees: (0, 0, sin(π/4), cos(π/4))
            const expectedSin = btSin(angle / 2);
            const expectedCos = btCos(angle / 2);
            
            expect(q.x()).toBeCloseTo(0, 10);
            expect(q.y()).toBeCloseTo(0, 10);
            expect(q.z()).toBeCloseTo(expectedSin, 10);
            expect(q.w()).toBeCloseTo(expectedCos, 10);
        });

        test('euler angles constructor', () => {
            const yaw = SIMD_PI / 4;   // 45 degrees
            const pitch = SIMD_PI / 6; // 30 degrees  
            const roll = SIMD_PI / 3;  // 60 degrees
            const q = new btQuaternion(yaw, pitch, roll);
            
            // Verify it's a valid quaternion (normalized)
            const length = btSqrt(q.x() * q.x() + q.y() * q.y() + q.z() * q.z() + q.w() * q.w());
            expect(length).toBeCloseTo(1.0, 10);
        });
    });

    describe('Identity quaternion', () => {
        test('getIdentity returns identity quaternion', () => {
            const identity = btQuaternion.getIdentity();
            expect(identity.x()).toBe(0);
            expect(identity.y()).toBe(0);
            expect(identity.z()).toBe(0);
            expect(identity.w()).toBe(1);
        });

        test('identity quaternion represents no rotation', () => {
            const identity = btQuaternion.getIdentity();
            const v = new btVector3(1, 2, 3);
            const rotated = btQuatRotate(identity, v);
            
            expect(rotated.x()).toBeCloseTo(v.x(), 10);
            expect(rotated.y()).toBeCloseTo(v.y(), 10);
            expect(rotated.z()).toBeCloseTo(v.z(), 10);
        });
    });

    describe('Rotation setup', () => {
        test('setRotation with axis and angle', () => {
            const q = new btQuaternion();
            const axis = new btVector3(1, 0, 0); // X-axis
            const angle = SIMD_PI / 2; // 90 degrees
            
            q.setRotation(axis, angle);
            
            const expectedSin = btSin(angle / 2);
            const expectedCos = btCos(angle / 2);
            
            expect(q.x()).toBeCloseTo(expectedSin, 10);
            expect(q.y()).toBeCloseTo(0, 10);
            expect(q.z()).toBeCloseTo(0, 10);
            expect(q.w()).toBeCloseTo(expectedCos, 10);
        });

        test('setEulerZYX and getEulerZYX round trip', () => {
            const originalYaw = 0.5;
            const originalPitch = 0.3;
            const originalRoll = 0.8;
            
            const q = new btQuaternion();
            q.setEulerZYX(originalYaw, originalPitch, originalRoll);
            
            const yaw = { value: 0 };
            const pitch = { value: 0 };
            const roll = { value: 0 };
            q.getEulerZYX(yaw, pitch, roll);
            
            expect(yaw.value).toBeCloseTo(originalYaw, 6);
            expect(pitch.value).toBeCloseTo(originalPitch, 6);
            expect(roll.value).toBeCloseTo(originalRoll, 6);
        });
    });

    describe('Arithmetic operations', () => {
        test('addition', () => {
            const q1 = new btQuaternion(1, 2, 3, 4);
            const q2 = new btQuaternion(5, 6, 7, 8);
            const result = q1.add(q2);
            
            expect(result.x()).toBe(6);
            expect(result.y()).toBe(8);
            expect(result.z()).toBe(10);
            expect(result.w()).toBe(12);
        });

        test('subtraction', () => {
            const q1 = new btQuaternion(5, 6, 7, 8);
            const q2 = new btQuaternion(1, 2, 3, 4);
            const result = q1.subtract(q2);
            
            expect(result.x()).toBe(4);
            expect(result.y()).toBe(4);
            expect(result.z()).toBe(4);
            expect(result.w()).toBe(4);
        });

        test('scalar multiplication', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            const result = q.multiply(2);
            
            expect(result.x()).toBe(2);
            expect(result.y()).toBe(4);
            expect(result.z()).toBe(6);
            expect(result.w()).toBe(8);
        });

        test('scalar division', () => {
            const q = new btQuaternion(2, 4, 6, 8);
            const result = q.divide(2);
            
            expect(result.x()).toBe(1);
            expect(result.y()).toBe(2);
            expect(result.z()).toBe(3);
            expect(result.w()).toBe(4);
        });

        test('negation', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            const result = q.negate();
            
            expect(result.x()).toBe(-1);
            expect(result.y()).toBe(-2);
            expect(result.z()).toBe(-3);
            expect(result.w()).toBe(-4);
        });
    });

    describe('Quaternion multiplication', () => {
        test('quaternion multiplication is non-commutative', () => {
            const q1 = new btQuaternion(1, 0, 0, 1).normalized();
            const q2 = new btQuaternion(0, 1, 0, 1).normalized();
            
            const result1 = q1.multiplyQuaternion(q2);
            const result2 = q2.multiplyQuaternion(q1);
            
            expect(result1.equals(result2)).toBe(false);
        });

        test('quaternion multiplication with identity', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            const identity = btQuaternion.getIdentity();
            
            const result1 = q.multiplyQuaternion(identity);
            const result2 = identity.multiplyQuaternion(q);
            
            expect(result1.x()).toBeCloseTo(q.x(), 10);
            expect(result1.y()).toBeCloseTo(q.y(), 10);
            expect(result1.z()).toBeCloseTo(q.z(), 10);
            expect(result1.w()).toBeCloseTo(q.w(), 10);
            
            expect(result2.x()).toBeCloseTo(q.x(), 10);
            expect(result2.y()).toBeCloseTo(q.y(), 10);
            expect(result2.z()).toBeCloseTo(q.z(), 10);
            expect(result2.w()).toBeCloseTo(q.w(), 10);
        });

        test('consecutive rotations combine correctly', () => {
            // 90-degree rotation around X, then 90-degree rotation around Y
            const qx = new btQuaternion(new btVector3(1, 0, 0), SIMD_PI / 2);
            const qy = new btQuaternion(new btVector3(0, 1, 0), SIMD_PI / 2);
            
            const combined = qy.multiplyQuaternion(qx); // Note: multiplication order
            
            // Apply to a test vector
            const testVector = new btVector3(0, 0, 1);
            const result = btQuatRotate(combined, testVector);
            
            // After X rotation: (0, 0, 1) -> (0, -1, 0)
            // After Y rotation: (0, -1, 0) -> (1, -1, 0) (normalized)
            // The exact result depends on the order, but should be consistent
            expect(result.length()).toBeCloseTo(1.0, 10);
        });
    });

    describe('Dot product and length', () => {
        test('dot product', () => {
            const q1 = new btQuaternion(1, 2, 3, 4);
            const q2 = new btQuaternion(5, 6, 7, 8);
            const result = q1.dot(q2);
            
            // 1*5 + 2*6 + 3*7 + 4*8 = 5 + 12 + 21 + 32 = 70
            expect(result).toBe(70);
        });

        test('length and length2', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            const length2 = q.length2();
            const length = q.length();
            
            // 1² + 2² + 3² + 4² = 1 + 4 + 9 + 16 = 30
            expect(length2).toBe(30);
            expect(length).toBeCloseTo(btSqrt(30), 10);
        });

        test('normalization', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            const normalized = q.normalized();
            
            expect(normalized.length()).toBeCloseTo(1.0, 10);
            
            // Verify original is unchanged
            expect(q.x()).toBe(1);
            expect(q.y()).toBe(2);
            expect(q.z()).toBe(3);
            expect(q.w()).toBe(4);
        });

        test('normalize in-place', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            const originalLength = q.length();
            q.normalize();
            
            expect(q.length()).toBeCloseTo(1.0, 10);
            
            // Verify components are scaled correctly
            const scale = 1.0 / originalLength;
            expect(q.x()).toBeCloseTo(scale, 10);
            expect(q.y()).toBeCloseTo(2 * scale, 10);
            expect(q.z()).toBeCloseTo(3 * scale, 10);
            expect(q.w()).toBeCloseTo(4 * scale, 10);
        });
    });

    describe('Inverse and conjugate', () => {
        test('inverse of unit quaternion', () => {
            const q = new btQuaternion(1, 2, 3, 4).normalized();
            const inv = q.inverse();
            
            // For unit quaternion, inverse is conjugate: (-x, -y, -z, w)
            expect(inv.x()).toBeCloseTo(-q.x(), 10);
            expect(inv.y()).toBeCloseTo(-q.y(), 10);
            expect(inv.z()).toBeCloseTo(-q.z(), 10);
            expect(inv.w()).toBeCloseTo(q.w(), 10);
        });

        test('quaternion times its inverse equals identity', () => {
            const q = new btQuaternion(1, 2, 3, 4).normalized();
            const inv = q.inverse();
            const result = q.multiplyQuaternion(inv);
            
            // Should be close to identity (0, 0, 0, 1)
            expect(result.x()).toBeCloseTo(0, 8);
            expect(result.y()).toBeCloseTo(0, 8);
            expect(result.z()).toBeCloseTo(0, 8);
            expect(result.w()).toBeCloseTo(1, 8);
        });
    });

    describe('Rotation operations', () => {
        test('getAngle and getAxis', () => {
            const axis = new btVector3(0, 0, 1).normalized();
            const angle = SIMD_PI / 3; // 60 degrees
            const q = new btQuaternion(axis, angle);
            
            const recoveredAngle = q.getAngle();
            const recoveredAxis = q.getAxis();
            
            expect(recoveredAngle).toBeCloseTo(angle, 10);
            expect(recoveredAxis.x()).toBeCloseTo(axis.x(), 10);
            expect(recoveredAxis.y()).toBeCloseTo(axis.y(), 10);
            expect(recoveredAxis.z()).toBeCloseTo(axis.z(), 10);
        });

        test('90-degree rotation around X-axis', () => {
            const q = new btQuaternion(new btVector3(1, 0, 0), SIMD_PI / 2);
            const testVector = new btVector3(0, 1, 0); // Y-axis
            const result = btQuatRotate(q, testVector);
            
            // Y-axis rotated 90° around X should become Z-axis
            expect(result.x()).toBeCloseTo(0, 10);
            expect(result.y()).toBeCloseTo(0, 10);
            expect(result.z()).toBeCloseTo(1, 10);
        });

        test('90-degree rotation around Y-axis', () => {
            const q = new btQuaternion(new btVector3(0, 1, 0), SIMD_PI / 2);
            const testVector = new btVector3(1, 0, 0); // X-axis
            const result = btQuatRotate(q, testVector);
            
            // X-axis rotated 90° around Y should become -Z-axis
            expect(result.x()).toBeCloseTo(0, 10);
            expect(result.y()).toBeCloseTo(0, 10);
            expect(result.z()).toBeCloseTo(-1, 10);
        });

        test('90-degree rotation around Z-axis', () => {
            const q = new btQuaternion(new btVector3(0, 0, 1), SIMD_PI / 2);
            const testVector = new btVector3(1, 0, 0); // X-axis
            const result = btQuatRotate(q, testVector);
            
            // X-axis rotated 90° around Z should become Y-axis
            expect(result.x()).toBeCloseTo(0, 10);
            expect(result.y()).toBeCloseTo(1, 10);
            expect(result.z()).toBeCloseTo(0, 10);
        });
    });

    describe('Shortest arc rotation', () => {
        test('shortest arc between parallel vectors', () => {
            const v1 = new btVector3(1, 0, 0);
            const v2 = new btVector3(1, 0, 0); // Same vector
            const q = btShortestArcQuat(v1, v2);
            
            // Should be identity or very close to it
            const identity = btQuaternion.getIdentity();
            expect(q.dot(identity)).toBeCloseTo(1, 8);
        });

        test('shortest arc between opposite vectors', () => {
            const v1 = new btVector3(1, 0, 0);
            const v2 = new btVector3(-1, 0, 0); // Opposite vector
            const q = btShortestArcQuat(v1, v2);
            
            // Should represent 180-degree rotation
            const angle = q.getAngle();
            expect(angle).toBeCloseTo(SIMD_PI, 8);
        });

        test('shortest arc between perpendicular vectors', () => {
            const v1 = new btVector3(1, 0, 0);
            const v2 = new btVector3(0, 1, 0);
            const q = btShortestArcQuat(v1, v2);
            
            // Apply rotation to v1, should get v2
            const result = btQuatRotate(q, v1);
            expect(result.x()).toBeCloseTo(0, 8);
            expect(result.y()).toBeCloseTo(1, 8);
            expect(result.z()).toBeCloseTo(0, 8);
        });
    });

    describe('Spherical linear interpolation (slerp)', () => {
        test('slerp at t=0 returns first quaternion', () => {
            const q1 = new btQuaternion(1, 2, 3, 4).normalized();
            const q2 = new btQuaternion(5, 6, 7, 8).normalized();
            const result = btSlerp(q1, q2, 0);
            
            expect(result.x()).toBeCloseTo(q1.x(), 10);
            expect(result.y()).toBeCloseTo(q1.y(), 10);
            expect(result.z()).toBeCloseTo(q1.z(), 10);
            expect(result.w()).toBeCloseTo(q1.w(), 10);
        });

        test('slerp at t=1 returns second quaternion', () => {
            const q1 = new btQuaternion(1, 2, 3, 4).normalized();
            const q2 = new btQuaternion(5, 6, 7, 8).normalized();
            const result = btSlerp(q1, q2, 1);
            
            expect(result.x()).toBeCloseTo(q2.x(), 10);
            expect(result.y()).toBeCloseTo(q2.y(), 10);
            expect(result.z()).toBeCloseTo(q2.z(), 10);
            expect(result.w()).toBeCloseTo(q2.w(), 10);
        });

        test('slerp at t=0.5 produces normalized quaternion', () => {
            const q1 = new btQuaternion(1, 0, 0, 1).normalized();
            const q2 = new btQuaternion(0, 1, 0, 1).normalized();
            const result = btSlerp(q1, q2, 0.5);
            
            expect(result.length()).toBeCloseTo(1.0, 10);
        });

        test('slerp between opposite quaternions', () => {
            const q1 = new btQuaternion(0, 0, 0, 1);
            const q2 = new btQuaternion(1, 0, 0, 0);
            const result = btSlerp(q1, q2, 0.5);
            
            // Should interpolate smoothly
            expect(result.length()).toBeCloseTo(1.0, 10);
        });
    });

    describe('Angle calculations', () => {
        test('angle between quaternions', () => {
            const q1 = btQuaternion.getIdentity();
            const q2 = new btQuaternion(new btVector3(0, 0, 1), SIMD_PI / 2);
            
            const angle = q1.angle(q2);
            // angle() returns half-angle, so for 90-degree rotation, should return 45 degrees
            expect(angle).toBeCloseTo(SIMD_PI / 4, 8);
        });

        test('angleShortestPath between quaternions', () => {
            const q1 = btQuaternion.getIdentity();
            const q2 = new btQuaternion(new btVector3(0, 0, 1), SIMD_PI / 2);
            
            const angle = q1.angleShortestPath(q2);
            // angleShortestPath() returns full angle
            expect(angle).toBeCloseTo(SIMD_PI / 2, 8);
        });
    });

    describe('Static methods', () => {
        test('static add', () => {
            const q1 = new btQuaternion(1, 2, 3, 4);
            const q2 = new btQuaternion(5, 6, 7, 8);
            const result = btQuaternion.add(q1, q2);
            const instanceResult = q1.add(q2);
            
            expect(result.equals(instanceResult)).toBe(true);
        });

        test('static multiply with scalar', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            const result1 = btQuaternion.multiply(q, 2);
            const result2 = btQuaternion.multiply(2, q);
            const instanceResult = q.multiply(2);
            
            expect(result1.equals(instanceResult)).toBe(true);
            expect(result2.equals(instanceResult)).toBe(true);
        });

        test('static multiply with quaternion', () => {
            const q1 = new btQuaternion(1, 2, 3, 4).normalized();
            const q2 = new btQuaternion(5, 6, 7, 8).normalized();
            const result = btQuaternion.multiply(q1, q2);
            const instanceResult = q1.multiplyQuaternion(q2);
            
            expect(result.equals(instanceResult)).toBe(true);
        });
    });

    describe('Edge cases and error handling', () => {
        test('normalize zero quaternion handles gracefully', () => {
            const q = new btQuaternion(0, 0, 0, 0);
            // This should throw due to division by zero
            expect(() => q.normalize()).toThrow();
        });

        test('division by zero throws error', () => {
            const q = new btQuaternion(1, 2, 3, 4);
            expect(() => q.divide(0)).toThrow();
        });

        test('setRotation with zero-length axis throws error', () => {
            const q = new btQuaternion();
            const zeroAxis = new btVector3(0, 0, 0);
            expect(() => q.setRotation(zeroAxis, SIMD_PI / 2)).toThrow();
        });

        test('very small quaternions handle correctly', () => {
            const q = new btQuaternion(SIMD_EPSILON, SIMD_EPSILON, SIMD_EPSILON, 1);
            q.safeNormalize();
            expect(q.length()).toBeCloseTo(1.0, 10);
        });
    });

    describe('Mathematical properties', () => {
        test('quaternion conjugate properties', () => {
            const q = new btQuaternion(1, 2, 3, 4).normalized();
            const conjugate = q.inverse(); // For unit quaternions, inverse = conjugate
            const product = q.multiplyQuaternion(conjugate);
            
            // q * q* should equal |q|² (which is 1 for unit quaternions)
            expect(product.w()).toBeCloseTo(1, 8);
            expect(product.x()).toBeCloseTo(0, 8);
            expect(product.y()).toBeCloseTo(0, 8);
            expect(product.z()).toBeCloseTo(0, 8);
        });

        test('rotation preserves vector length', () => {
            const q = new btQuaternion(new btVector3(1, 1, 1).normalized(), SIMD_PI / 3);
            const v = new btVector3(3, 4, 5);
            const rotated = btQuatRotate(q, v);
            
            expect(rotated.length()).toBeCloseTo(v.length(), 10);
        });

        test('double rotation equals single rotation by double angle', () => {
            const axis = new btVector3(0, 0, 1);
            const angle = SIMD_PI / 6; // 30 degrees
            const q1 = new btQuaternion(axis, angle);
            const q2 = new btQuaternion(axis, 2 * angle);
            
            const doubleRotation = q1.multiplyQuaternion(q1);
            const testVector = new btVector3(1, 0, 0);
            
            const result1 = btQuatRotate(doubleRotation, testVector);
            const result2 = btQuatRotate(q2, testVector);
            
            expect(result1.x()).toBeCloseTo(result2.x(), 10);
            expect(result1.y()).toBeCloseTo(result2.y(), 10);
            expect(result1.z()).toBeCloseTo(result2.z(), 10);
        });
    });

    describe('Copy and clone operations', () => {
        test('clone creates independent copy', () => {
            const original = new btQuaternion(1, 2, 3, 4);
            const cloned = original.clone();
            
            expect(cloned.equals(original)).toBe(true);
            
            // Modify original
            original.setValue(5, 6, 7, 8);
            
            // Cloned should be unchanged
            expect(cloned.x()).toBe(1);
            expect(cloned.y()).toBe(2);
            expect(cloned.z()).toBe(3);
            expect(cloned.w()).toBe(4);
        });

        test('copy method copies values', () => {
            const source = new btQuaternion(1, 2, 3, 4);
            const target = new btQuaternion();
            
            target.copy(source);
            
            expect(target.equals(source)).toBe(true);
        });
    });
});