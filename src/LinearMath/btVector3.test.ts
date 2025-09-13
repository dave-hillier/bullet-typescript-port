/*
Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btVector3, btVector4, btDot, btDistance, btCross, btAngle, btTriple, lerp, btPlaneSpace1 } from './btVector3';
import { SIMD_EPSILON, SIMD_PI } from './btScalar';

/**
 * Approximately equal comparison for floating point values
 */
function expectNear(actual: number, expected: number, tolerance: number = 1e-6): void {
    const diff = Math.abs(actual - expected);
    if (diff > tolerance) {
        throw new Error(`Expected ${actual} to be within ${tolerance} of ${expected}, but diff was ${diff}`);
    }
}

/**
 * Approximately equal comparison for vectors
 */
function expectVectorNear(actual: btVector3, expected: btVector3, tolerance: number = 1e-6): void {
    expectNear(actual.x(), expected.x(), tolerance);
    expectNear(actual.y(), expected.y(), tolerance);
    expectNear(actual.z(), expected.z(), tolerance);
}

describe('btVector3', () => {
    describe('Constructor', () => {
        test('default constructor creates uninitialized vector', () => {
            const v = new btVector3();
            expect(v).toBeInstanceOf(btVector3);
        });

        test('three parameter constructor sets x, y, z values and zeros w', () => {
            const v = new btVector3(1.0, 2.0, 3.0);
            expect(v.x()).toBe(1.0);
            expect(v.y()).toBe(2.0);
            expect(v.z()).toBe(3.0);
            expect(v.w()).toBe(0.0);
        });

        test('copy constructor creates identical vector', () => {
            const original = new btVector3(4.0, 5.0, 6.0);
            const copy = new btVector3(original);
            expect(copy.x()).toBe(4.0);
            expect(copy.y()).toBe(5.0);
            expect(copy.z()).toBe(6.0);
            expect(copy.w()).toBe(0.0);
        });
    });

    describe('Basic arithmetic operations', () => {
        test('addAssign modifies vector in place', () => {
            const v1 = new btVector3(1.0, 2.0, 3.0);
            const v2 = new btVector3(4.0, 5.0, 6.0);
            const result = v1.addAssign(v2);
            
            expect(result).toBe(v1); // Should return reference to self
            expect(v1.x()).toBe(5.0);
            expect(v1.y()).toBe(7.0);
            expect(v1.z()).toBe(9.0);
        });

        test('subtractAssign modifies vector in place', () => {
            const v1 = new btVector3(5.0, 7.0, 9.0);
            const v2 = new btVector3(1.0, 2.0, 3.0);
            v1.subtractAssign(v2);
            
            expect(v1.x()).toBe(4.0);
            expect(v1.y()).toBe(5.0);
            expect(v1.z()).toBe(6.0);
        });

        test('multiplyAssign scales vector in place', () => {
            const v = new btVector3(2.0, 3.0, 4.0);
            v.multiplyAssign(2.0);
            
            expect(v.x()).toBe(4.0);
            expect(v.y()).toBe(6.0);
            expect(v.z()).toBe(8.0);
        });

        test('divideAssign scales vector inversely in place', () => {
            const v = new btVector3(4.0, 6.0, 8.0);
            v.divideAssign(2.0);
            
            expect(v.x()).toBe(2.0);
            expect(v.y()).toBe(3.0);
            expect(v.z()).toBe(4.0);
        });

        test('divideAssign throws on division by zero', () => {
            const v = new btVector3(1.0, 2.0, 3.0);
            expect(() => v.divideAssign(0.0)).toThrow('Division by zero');
        });

        test('add creates new vector', () => {
            const v1 = new btVector3(1.0, 2.0, 3.0);
            const v2 = new btVector3(4.0, 5.0, 6.0);
            const result = v1.add(v2);
            
            expect(result).not.toBe(v1);
            expect(result).not.toBe(v2);
            expectVectorNear(result, new btVector3(5.0, 7.0, 9.0));
        });

        test('subtract creates new vector', () => {
            const v1 = new btVector3(5.0, 7.0, 9.0);
            const v2 = new btVector3(1.0, 2.0, 3.0);
            const result = v1.subtract(v2);
            
            expectVectorNear(result, new btVector3(4.0, 5.0, 6.0));
        });

        test('multiply by scalar creates new vector', () => {
            const v = new btVector3(2.0, 3.0, 4.0);
            const result = v.multiply(2.5);
            
            expectVectorNear(result, new btVector3(5.0, 7.5, 10.0));
        });

        test('negate creates new vector', () => {
            const v = new btVector3(1.0, -2.0, 3.0);
            const result = v.negate();
            
            expectVectorNear(result, new btVector3(-1.0, 2.0, -3.0));
        });
    });

    describe('Vector operations', () => {
        test('dot product calculation', () => {
            const v1 = new btVector3(1.0, 2.0, 3.0);
            const v2 = new btVector3(4.0, 5.0, 6.0);
            const dot = v1.dot(v2);
            
            expect(dot).toBe(32.0); // 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        });

        test('dot product with self gives length squared', () => {
            const v = new btVector3(3.0, 4.0, 5.0);
            const dot = v.dot(v);
            const length2 = v.length2();
            
            expect(dot).toBe(length2);
            expect(dot).toBe(50.0); // 9 + 16 + 25 = 50
        });

        test('length calculation', () => {
            const v = new btVector3(3.0, 4.0, 0.0);
            const length = v.length();
            
            expect(length).toBe(5.0); // Pythagorean theorem: sqrt(9 + 16) = 5
        });

        test('normalize creates unit vector', () => {
            const v = new btVector3(3.0, 4.0, 0.0);
            v.normalize();
            
            expectNear(v.length(), 1.0);
            expectVectorNear(v, new btVector3(0.6, 0.8, 0.0));
        });

        test('normalized returns new unit vector', () => {
            const v = new btVector3(3.0, 4.0, 0.0);
            const normalized = v.normalized();
            
            // Original should be unchanged
            expectVectorNear(v, new btVector3(3.0, 4.0, 0.0));
            
            // Normalized should be unit length
            expectNear(normalized.length(), 1.0);
            expectVectorNear(normalized, new btVector3(0.6, 0.8, 0.0));
        });

        test('cross product calculation', () => {
            const v1 = new btVector3(1.0, 0.0, 0.0);
            const v2 = new btVector3(0.0, 1.0, 0.0);
            const cross = v1.cross(v2);
            
            expectVectorNear(cross, new btVector3(0.0, 0.0, 1.0));
        });

        test('cross product is anti-commutative', () => {
            const v1 = new btVector3(2.0, 3.0, 1.0);
            const v2 = new btVector3(1.0, 0.0, 4.0);
            const cross1 = v1.cross(v2);
            const cross2 = v2.cross(v1);
            
            expectVectorNear(cross1, cross2.negate());
        });

        test('cross product orthogonality', () => {
            const v1 = new btVector3(1.0, 2.0, 3.0);
            const v2 = new btVector3(4.0, 5.0, 6.0);
            const cross = v1.cross(v2);
            
            // Cross product should be orthogonal to both input vectors
            expectNear(cross.dot(v1), 0.0, 1e-10);
            expectNear(cross.dot(v2), 0.0, 1e-10);
        });

        test('triple scalar product', () => {
            const v1 = new btVector3(1.0, 0.0, 0.0);
            const v2 = new btVector3(0.0, 1.0, 0.0);
            const v3 = new btVector3(0.0, 0.0, 1.0);
            const triple = v1.triple(v2, v3);
            
            expect(triple).toBe(1.0); // Volume of unit cube
        });
    });

    describe('Utility methods', () => {
        test('angle between vectors', () => {
            const v1 = new btVector3(1.0, 0.0, 0.0);
            const v2 = new btVector3(0.0, 1.0, 0.0);
            const angle = v1.angle(v2);
            
            expectNear(angle, SIMD_PI / 2.0); // 90 degrees
        });

        test('angle between parallel vectors', () => {
            const v1 = new btVector3(1.0, 2.0, 3.0);
            const v2 = new btVector3(2.0, 4.0, 6.0);
            const angle = v1.angle(v2);
            
            expectNear(angle, 0.0); // Parallel vectors
        });

        test('angle between opposite vectors', () => {
            const v1 = new btVector3(1.0, 0.0, 0.0);
            const v2 = new btVector3(-1.0, 0.0, 0.0);
            const angle = v1.angle(v2);
            
            expectNear(angle, SIMD_PI); // 180 degrees
        });

        test('distance calculation', () => {
            const v1 = new btVector3(0.0, 0.0, 0.0);
            const v2 = new btVector3(3.0, 4.0, 0.0);
            const distance = v1.distance(v2);
            
            expect(distance).toBe(5.0); // Pythagorean theorem
        });

        test('distance squared calculation', () => {
            const v1 = new btVector3(0.0, 0.0, 0.0);
            const v2 = new btVector3(3.0, 4.0, 0.0);
            const distance2 = v1.distance2(v2);
            
            expect(distance2).toBe(25.0);
        });

        test('absolute value of vector', () => {
            const v = new btVector3(-1.0, -2.5, 3.0);
            const abs = v.absolute();
            
            expectVectorNear(abs, new btVector3(1.0, 2.5, 3.0));
        });

        test('lerp interpolation', () => {
            const v1 = new btVector3(0.0, 0.0, 0.0);
            const v2 = new btVector3(10.0, 20.0, 30.0);
            
            const lerp0 = v1.lerp(v2, 0.0);
            const lerp1 = v1.lerp(v2, 1.0);
            const lerp05 = v1.lerp(v2, 0.5);
            
            expectVectorNear(lerp0, v1);
            expectVectorNear(lerp1, v2);
            expectVectorNear(lerp05, new btVector3(5.0, 10.0, 15.0));
        });

        test('axis identification', () => {
            const v = new btVector3(1.0, 3.0, 2.0);
            
            expect(v.minAxis()).toBe(0); // X is smallest (1.0)
            expect(v.maxAxis()).toBe(1); // Y is largest (3.0)
        });

        test('furthest and closest axis', () => {
            const v = new btVector3(-0.5, 3.0, -2.0);
            
            expect(v.furthestAxis()).toBe(0); // X has smallest absolute value (0.5)
            expect(v.closestAxis()).toBe(1);  // Y has largest absolute value (3.0)
        });

        test('setMax and setMin operations', () => {
            const v1 = new btVector3(1.0, 5.0, 3.0);
            const v2 = new btVector3(2.0, 4.0, 6.0);
            
            v1.setMax(v2);
            expectVectorNear(v1, new btVector3(2.0, 5.0, 6.0));
            
            v1.setValue(1.0, 5.0, 3.0);
            v1.setMin(v2);
            expectVectorNear(v1, new btVector3(1.0, 4.0, 3.0));
        });

        test('rotation around axis', () => {
            const v = new btVector3(1.0, 0.0, 0.0);
            const axis = new btVector3(0.0, 0.0, 1.0); // Z-axis
            const rotated = v.rotate(axis, SIMD_PI / 2.0); // 90 degrees
            
            expectVectorNear(rotated, new btVector3(0.0, 1.0, 0.0), 1e-6);
        });

        test('fuzzyZero detection', () => {
            const zero = new btVector3(0.0, 0.0, 0.0);
            const nearZero = new btVector3(SIMD_EPSILON * 0.5, 0.0, 0.0);
            const notZero = new btVector3(0.1, 0.0, 0.0);
            
            expect(zero.fuzzyZero()).toBe(true);
            expect(nearZero.fuzzyZero()).toBe(true);
            expect(notZero.fuzzyZero()).toBe(false);
        });

        test('isZero detection', () => {
            const zero = new btVector3(0.0, 0.0, 0.0);
            const nearZero = new btVector3(SIMD_EPSILON, 0.0, 0.0);
            
            expect(zero.isZero()).toBe(true);
            expect(nearZero.isZero()).toBe(false);
        });
    });

    describe('Static methods', () => {
        test('static add', () => {
            const v1 = new btVector3(1.0, 2.0, 3.0);
            const v2 = new btVector3(4.0, 5.0, 6.0);
            const result = btVector3.add(v1, v2);
            
            expectVectorNear(result, new btVector3(5.0, 7.0, 9.0));
        });

        test('static multiply overloads', () => {
            const v = new btVector3(1.0, 2.0, 3.0);
            const scalar = 2.0;
            
            const result1 = btVector3.multiply(v, scalar);
            const result2 = btVector3.multiply(scalar, v);
            
            expectVectorNear(result1, new btVector3(2.0, 4.0, 6.0));
            expectVectorNear(result2, new btVector3(2.0, 4.0, 6.0));
        });

        test('static vector multiplication', () => {
            const v1 = new btVector3(2.0, 3.0, 4.0);
            const v2 = new btVector3(1.0, 2.0, 3.0);
            const result = btVector3.multiply(v1, v2);
            
            expectVectorNear(result, new btVector3(2.0, 6.0, 12.0));
        });

        test('static division', () => {
            const v1 = new btVector3(6.0, 8.0, 10.0);
            const v2 = new btVector3(2.0, 4.0, 5.0);
            
            const scalarDiv = btVector3.divide(v1, 2.0);
            const vectorDiv = btVector3.divide(v1, v2);
            
            expectVectorNear(scalarDiv, new btVector3(3.0, 4.0, 5.0));
            expectVectorNear(vectorDiv, new btVector3(3.0, 2.0, 2.0));
        });
    });

    describe('Global helper functions', () => {
        test('btDot function', () => {
            const v1 = new btVector3(1.0, 2.0, 3.0);
            const v2 = new btVector3(4.0, 5.0, 6.0);
            
            expect(btDot(v1, v2)).toBe(32.0);
        });

        test('btDistance function', () => {
            const v1 = new btVector3(0.0, 0.0, 0.0);
            const v2 = new btVector3(3.0, 4.0, 0.0);
            
            expect(btDistance(v1, v2)).toBe(5.0);
        });

        test('btCross function', () => {
            const v1 = new btVector3(1.0, 0.0, 0.0);
            const v2 = new btVector3(0.0, 1.0, 0.0);
            const cross = btCross(v1, v2);
            
            expectVectorNear(cross, new btVector3(0.0, 0.0, 1.0));
        });

        test('btAngle function', () => {
            const v1 = new btVector3(1.0, 0.0, 0.0);
            const v2 = new btVector3(0.0, 1.0, 0.0);
            
            expectNear(btAngle(v1, v2), SIMD_PI / 2.0);
        });

        test('btTriple function', () => {
            const v1 = new btVector3(1.0, 0.0, 0.0);
            const v2 = new btVector3(0.0, 1.0, 0.0);
            const v3 = new btVector3(0.0, 0.0, 1.0);
            
            expect(btTriple(v1, v2, v3)).toBe(1.0);
        });

        test('lerp function', () => {
            const v1 = new btVector3(0.0, 0.0, 0.0);
            const v2 = new btVector3(10.0, 20.0, 30.0);
            const result = lerp(v1, v2, 0.3);
            
            expectVectorNear(result, new btVector3(3.0, 6.0, 9.0));
        });

        test('btPlaneSpace1 function', () => {
            const n = new btVector3(0.0, 0.0, 1.0);
            const p = new btVector3();
            const q = new btVector3();
            
            btPlaneSpace1(n, p, q);
            
            // p and q should be orthogonal to n and to each other
            expectNear(n.dot(p), 0.0, 1e-10);
            expectNear(n.dot(q), 0.0, 1e-10);
            expectNear(p.dot(q), 0.0, 1e-10);
            
            // p and q should be unit vectors
            expectNear(p.length(), 1.0);
            expectNear(q.length(), 1.0);
        });
    });

    describe('Advanced vector operations', () => {
        test('safe normalization of zero vector', () => {
            const zero = new btVector3(0.0, 0.0, 0.0);
            zero.safeNormalize();
            
            expectVectorNear(zero, new btVector3(1.0, 0.0, 0.0));
        });

        test('safe normalization of very small vector', () => {
            const small = new btVector3(1e-10, 1e-10, 1e-10);
            const original = small.clone();
            small.safeNormalize();
            
            // For vectors that are too small, safeNormalize should set to (1,0,0)
            if (original.length2() < SIMD_EPSILON * SIMD_EPSILON) {
                expectVectorNear(small, new btVector3(1.0, 0.0, 0.0));
            } else {
                // Otherwise it should normalize normally
                expectNear(small.length(), 1.0);
            }
        });

        test('safe norm calculation', () => {
            const zero = new btVector3(0.0, 0.0, 0.0);
            const small = new btVector3(1e-10, 1e-10, 1e-10);
            const normal = new btVector3(3.0, 4.0, 0.0);
            
            expect(zero.safeNorm()).toBe(0.0);
            expect(small.safeNorm()).toBe(0.0);
            expect(normal.safeNorm()).toBe(5.0);
        });

        test('setInterpolate3 function', () => {
            const result = new btVector3();
            const v0 = new btVector3(0.0, 0.0, 0.0);
            const v1 = new btVector3(10.0, 20.0, 30.0);
            
            result.setInterpolate3(v0, v1, 0.7);
            expectVectorNear(result, new btVector3(7.0, 14.0, 21.0));
        });

        test('dot3 function computes multiple dot products', () => {
            const v = new btVector3(1.0, 2.0, 3.0);
            const v0 = new btVector3(1.0, 0.0, 0.0);
            const v1 = new btVector3(0.0, 1.0, 0.0);
            const v2 = new btVector3(0.0, 0.0, 1.0);
            
            const result = v.dot3(v0, v1, v2);
            expectVectorNear(result, new btVector3(1.0, 2.0, 3.0));
        });

        test('maxDot and minDot functions', () => {
            const v = new btVector3(1.0, 0.0, 0.0);
            const array = [
                new btVector3(1.0, 0.0, 0.0),   // dot = 1.0
                new btVector3(0.0, 1.0, 0.0),   // dot = 0.0
                new btVector3(-1.0, 0.0, 0.0),  // dot = -1.0
                new btVector3(2.0, 0.0, 0.0)    // dot = 2.0
            ];
            
            const maxDotOut = { value: 0 };
            const minDotOut = { value: 0 };
            
            const maxIndex = v.maxDot(array, maxDotOut);
            const minIndex = v.minDot(array, minDotOut);
            
            expect(maxIndex).toBe(3);
            expect(maxDotOut.value).toBe(2.0);
            expect(minIndex).toBe(2);
            expect(minDotOut.value).toBe(-1.0);
        });

        test('getSkewSymmetricMatrix function', () => {
            const v = new btVector3(1.0, 2.0, 3.0);
            const v0 = new btVector3();
            const v1 = new btVector3();
            const v2 = new btVector3();
            
            v.getSkewSymmetricMatrix(v0, v1, v2);
            
            expectVectorNear(v0, new btVector3(0.0, -3.0, 2.0));
            expectVectorNear(v1, new btVector3(3.0, 0.0, -1.0));
            expectVectorNear(v2, new btVector3(-2.0, 1.0, 0.0));
            
            // Verify skew symmetric property: v × u should equal skew(v) * u
            const u = new btVector3(4.0, 5.0, 6.0);
            const crossProduct = v.cross(u);
            const skewProduct = new btVector3(
                v0.dot(u),
                v1.dot(u),
                v2.dot(u)
            );
            
            expectVectorNear(crossProduct, skewProduct);
        });
    });

    describe('Physics calculations', () => {
        test('projectile motion calculation', () => {
            // Test projectile fired at 45 degrees
            const initialVelocity = 100.0; // m/s
            const angle = SIMD_PI / 4.0; // 45 degrees
            
            const velocity = new btVector3(
                initialVelocity * Math.cos(angle),
                initialVelocity * Math.sin(angle),
                0.0
            );
            
            // At 45 degrees, x and y components should be equal
            expectNear(velocity.x(), velocity.y(), 1e-10);
            expectNear(velocity.length(), initialVelocity);
        });

        test('collision normal calculation', () => {
            // Two spheres colliding
            const center1 = new btVector3(0.0, 0.0, 0.0);
            const center2 = new btVector3(3.0, 4.0, 0.0);
            
            const normal = center2.subtract(center1).normalized();
            
            expectVectorNear(normal, new btVector3(0.6, 0.8, 0.0));
            expectNear(normal.length(), 1.0);
        });

        test('torque calculation using cross product', () => {
            const force = new btVector3(10.0, 0.0, 0.0);
            const leverArm = new btVector3(0.0, 2.0, 0.0);
            
            // Torque = leverArm × force
            const torque = leverArm.cross(force);
            
            // leverArm (0,2,0) × force (10,0,0) = (2*0 - 0*0, 0*10 - 0*0, 0*0 - 2*10) = (0,0,-20)
            expectVectorNear(torque, new btVector3(0.0, 0.0, -20.0));
            expect(torque.length()).toBe(20.0);
        });

        test('reflection calculation', () => {
            const incident = new btVector3(1.0, -1.0, 0.0).normalized();
            const normal = new btVector3(0.0, 1.0, 0.0);
            
            // Reflection formula: r = d - 2(d·n)n
            const dotProduct = incident.dot(normal);
            const reflection = incident.subtract(normal.multiply(2.0 * dotProduct));
            
            expectVectorNear(reflection, new btVector3(1.0, 1.0, 0.0).normalized());
        });

        test('center of mass calculation', () => {
            const positions = [
                new btVector3(0.0, 0.0, 0.0),
                new btVector3(2.0, 0.0, 0.0),
                new btVector3(0.0, 2.0, 0.0),
                new btVector3(2.0, 2.0, 0.0)
            ];
            const masses = [1.0, 1.0, 1.0, 1.0];
            
            let centerOfMass = new btVector3(0.0, 0.0, 0.0);
            let totalMass = 0.0;
            
            for (let i = 0; i < positions.length; i++) {
                centerOfMass.addAssign(positions[i].multiply(masses[i]));
                totalMass += masses[i];
            }
            centerOfMass.divideAssign(totalMass);
            
            expectVectorNear(centerOfMass, new btVector3(1.0, 1.0, 0.0));
        });
    });
});

describe('btVector4', () => {
    test('constructor with four components', () => {
        const v4 = new btVector4(1.0, 2.0, 3.0, 4.0);
        
        expect(v4.x()).toBe(1.0);
        expect(v4.y()).toBe(2.0);
        expect(v4.z()).toBe(3.0);
        expect(v4.getW()).toBe(4.0);
    });

    test('copy constructor from btVector3', () => {
        const v3 = new btVector3(1.0, 2.0, 3.0);
        const v4 = new btVector4(v3);
        
        expect(v4.x()).toBe(1.0);
        expect(v4.y()).toBe(2.0);
        expect(v4.z()).toBe(3.0);
        expect(v4.getW()).toBe(0.0);
    });

    test('absolute4 includes w component', () => {
        const v4 = new btVector4(-1.0, -2.0, -3.0, -4.0);
        const abs = v4.absolute4();
        
        expect(abs.x()).toBe(1.0);
        expect(abs.y()).toBe(2.0);
        expect(abs.z()).toBe(3.0);
        expect(abs.getW()).toBe(4.0);
    });

    test('maxAxis4 considers w component', () => {
        const v4 = new btVector4(1.0, 2.0, 3.0, 5.0);
        expect(v4.maxAxis4()).toBe(3); // W component is largest
    });

    test('minAxis4 considers w component', () => {
        const v4 = new btVector4(5.0, 2.0, 3.0, 1.0);
        expect(v4.minAxis4()).toBe(3); // W component is smallest
    });

    test('closestAxis4 uses absolute values', () => {
        const v4 = new btVector4(1.0, 2.0, 3.0, -6.0);
        expect(v4.closestAxis4()).toBe(3); // |W| = 6 is largest
    });
});