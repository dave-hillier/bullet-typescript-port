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

import { 
    btMatrix3x3, 
    multiplyMatrixScalar, 
    addMatrices, 
    multiplyMatrixVector, 
    multiplyVectorMatrix, 
    multiplyMatrices, 
    matricesEqual 
} from './btMatrix3x3';
import { btVector3 } from './btVector3';
import { btQuaternion } from './btQuaternion';
import { SIMD_HALF_PI } from './btScalar';

/**
 * Helper function to check if two numbers are approximately equal
 * @param a First number
 * @param b Second number
 * @param tolerance Tolerance for comparison
 * @returns True if numbers are approximately equal
 */
function approxEqual(a: number, b: number, tolerance: number = 1e-6): boolean {
    return Math.abs(a - b) < tolerance;
}

/**
 * Helper function to check if two vectors are approximately equal
 * @param v1 First vector
 * @param v2 Second vector
 * @param tolerance Tolerance for comparison
 * @returns True if vectors are approximately equal
 */
function vectorsApproxEqual(v1: btVector3, v2: btVector3, tolerance: number = 1e-6): boolean {
    return approxEqual(v1.getX(), v2.getX(), tolerance) &&
           approxEqual(v1.getY(), v2.getY(), tolerance) &&
           approxEqual(v1.getZ(), v2.getZ(), tolerance);
}

/**
 * Helper function to check if two matrices are approximately equal
 * @param m1 First matrix
 * @param m2 Second matrix
 * @param tolerance Tolerance for comparison
 * @returns True if matrices are approximately equal
 */
function matricesApproxEqual(m1: btMatrix3x3, m2: btMatrix3x3, tolerance: number = 1e-6): boolean {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (!approxEqual(m1.getValue(i, j), m2.getValue(i, j), tolerance)) {
                return false;
            }
        }
    }
    return true;
}

describe('btMatrix3x3', () => {
    
    describe('Constructors', () => {
        test('default constructor creates zero matrix', () => {
            const m = new btMatrix3x3();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    expect(m.getValue(i, j)).toBe(0.0);
                }
            }
        });

        test('constructor from 9 values', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            expect(m.getValue(0, 0)).toBe(1);
            expect(m.getValue(0, 1)).toBe(2);
            expect(m.getValue(0, 2)).toBe(3);
            expect(m.getValue(1, 0)).toBe(4);
            expect(m.getValue(1, 1)).toBe(5);
            expect(m.getValue(1, 2)).toBe(6);
            expect(m.getValue(2, 0)).toBe(7);
            expect(m.getValue(2, 1)).toBe(8);
            expect(m.getValue(2, 2)).toBe(9);
        });

        test('constructor from three vectors', () => {
            const v0 = new btVector3(1, 2, 3);
            const v1 = new btVector3(4, 5, 6);
            const v2 = new btVector3(7, 8, 9);
            const m = new btMatrix3x3(v0, v1, v2);
            
            expect(vectorsApproxEqual(m.getRow(0), v0)).toBe(true);
            expect(vectorsApproxEqual(m.getRow(1), v1)).toBe(true);
            expect(vectorsApproxEqual(m.getRow(2), v2)).toBe(true);
        });

        test('copy constructor', () => {
            const original = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const copy = new btMatrix3x3(original);
            
            expect(matricesApproxEqual(original, copy)).toBe(true);
        });

        test('constructor from quaternion creates rotation matrix', () => {
            // Test identity quaternion creates identity matrix
            const q = new btQuaternion(0, 0, 0, 1);
            const m = new btMatrix3x3(q);
            const identity = btMatrix3x3.getIdentity();
            
            expect(matricesApproxEqual(m, identity)).toBe(true);
        });

        test('constructor from quaternion - 90 degree rotation around Z', () => {
            // 90 degree rotation around Z axis
            const q = new btQuaternion(0, 0, Math.sin(SIMD_HALF_PI / 2), Math.cos(SIMD_HALF_PI / 2));
            const m = new btMatrix3x3(q);
            
            // Expected rotation matrix for 90 degrees around Z:
            // [0, -1,  0]
            // [1,  0,  0] 
            // [0,  0,  1]
            expect(approxEqual(m.getValue(0, 0), 0, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(0, 1), -1, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(0, 2), 0, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(1, 0), 1, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(1, 1), 0, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(1, 2), 0, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(2, 0), 0, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(2, 1), 0, 1e-6)).toBe(true);
            expect(approxEqual(m.getValue(2, 2), 1, 1e-6)).toBe(true);
        });
    });

    describe('Matrix Access Methods', () => {
        test('getRow returns correct row vectors', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            
            const row0 = m.getRow(0);
            const row1 = m.getRow(1);
            const row2 = m.getRow(2);
            
            expect(vectorsApproxEqual(row0, new btVector3(1, 2, 3))).toBe(true);
            expect(vectorsApproxEqual(row1, new btVector3(4, 5, 6))).toBe(true);
            expect(vectorsApproxEqual(row2, new btVector3(7, 8, 9))).toBe(true);
        });

        test('getColumn returns correct column vectors', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            
            const col0 = m.getColumn(0);
            const col1 = m.getColumn(1);
            const col2 = m.getColumn(2);
            
            expect(vectorsApproxEqual(col0, new btVector3(1, 4, 7))).toBe(true);
            expect(vectorsApproxEqual(col1, new btVector3(2, 5, 8))).toBe(true);
            expect(vectorsApproxEqual(col2, new btVector3(3, 6, 9))).toBe(true);
        });

        test('getValue returns correct element', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            
            expect(m.getValue(1, 2)).toBe(6);
            expect(m.getValue(2, 0)).toBe(7);
        });
    });

    describe('Matrix Setting Methods', () => {
        test('setValue sets matrix elements correctly', () => {
            const m = new btMatrix3x3();
            m.setValue(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            
            expect(m.getValue(0, 0)).toBe(1);
            expect(m.getValue(1, 1)).toBe(5);
            expect(m.getValue(2, 2)).toBe(9);
        });

        test('setIdentity creates identity matrix', () => {
            const m = new btMatrix3x3();
            m.setIdentity();
            
            expect(m.getValue(0, 0)).toBe(1);
            expect(m.getValue(1, 1)).toBe(1);
            expect(m.getValue(2, 2)).toBe(1);
            expect(m.getValue(0, 1)).toBe(0);
            expect(m.getValue(1, 0)).toBe(0);
            expect(m.getValue(2, 1)).toBe(0);
        });

        test('setZero creates zero matrix', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            m.setZero();
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    expect(m.getValue(i, j)).toBe(0);
                }
            }
        });

        test('setFromOpenGLSubMatrix works correctly', () => {
            const m = new btMatrix3x3();
            const glMatrix = [
                1, 4, 7, 0,  // column 0
                2, 5, 8, 0,  // column 1
                3, 6, 9, 0,  // column 2
                0, 0, 0, 1   // unused
            ];
            m.setFromOpenGLSubMatrix(glMatrix);
            
            // OpenGL matrices are column-major, so this should create:
            // [1, 2, 3]
            // [4, 5, 6] 
            // [7, 8, 9]
            expect(m.getValue(0, 0)).toBe(1);
            expect(m.getValue(0, 1)).toBe(2);
            expect(m.getValue(0, 2)).toBe(3);
            expect(m.getValue(1, 0)).toBe(4);
            expect(m.getValue(1, 1)).toBe(5);
            expect(m.getValue(1, 2)).toBe(6);
            expect(m.getValue(2, 0)).toBe(7);
            expect(m.getValue(2, 1)).toBe(8);
            expect(m.getValue(2, 2)).toBe(9);
        });
    });

    describe('Matrix Operations', () => {
        test('determinant calculation', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                0, 1, 4,
                5, 6, 0
            );
            
            // det = 1*(1*0 - 4*6) - 2*(0*0 - 4*5) + 3*(0*6 - 1*5)
            //     = 1*(-24) - 2*(-20) + 3*(-5)
            //     = -24 + 40 - 15 = 1
            expect(m.determinant()).toBe(1);
        });

        test('transpose creates correct transpose', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const transpose = m.transpose();
            
            expect(transpose.getValue(0, 0)).toBe(1);
            expect(transpose.getValue(0, 1)).toBe(4);
            expect(transpose.getValue(0, 2)).toBe(7);
            expect(transpose.getValue(1, 0)).toBe(2);
            expect(transpose.getValue(1, 1)).toBe(5);
            expect(transpose.getValue(1, 2)).toBe(8);
            expect(transpose.getValue(2, 0)).toBe(3);
            expect(transpose.getValue(2, 1)).toBe(6);
            expect(transpose.getValue(2, 2)).toBe(9);
        });

        test('inverse of identity is identity', () => {
            const identity = btMatrix3x3.getIdentity();
            const inverse = identity.inverse();
            
            expect(matricesApproxEqual(inverse, identity)).toBe(true);
        });

        test('inverse multiplication gives identity', () => {
            const m = new btMatrix3x3(
                2, 0, 0,
                0, 3, 0,
                0, 0, 4
            );
            const inverse = m.inverse();
            const product = multiplyMatrices(m, inverse);
            const identity = btMatrix3x3.getIdentity();
            
            expect(matricesApproxEqual(product, identity)).toBe(true);
        });

        test('absolute creates matrix with absolute values', () => {
            const m = new btMatrix3x3(
                -1, 2, -3,
                4, -5, 6,
                -7, 8, -9
            );
            const abs = m.absolute();
            
            expect(abs.getValue(0, 0)).toBe(1);
            expect(abs.getValue(0, 1)).toBe(2);
            expect(abs.getValue(0, 2)).toBe(3);
            expect(abs.getValue(1, 0)).toBe(4);
            expect(abs.getValue(1, 1)).toBe(5);
            expect(abs.getValue(1, 2)).toBe(6);
            expect(abs.getValue(2, 0)).toBe(7);
            expect(abs.getValue(2, 1)).toBe(8);
            expect(abs.getValue(2, 2)).toBe(9);
        });

        test('scaled creates properly scaled matrix', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const scale = new btVector3(2, 3, 4);
            const scaled = m.scaled(scale);
            
            // Each column should be scaled by the corresponding scale component
            expect(scaled.getValue(0, 0)).toBe(2);  // 1 * 2
            expect(scaled.getValue(0, 1)).toBe(6);  // 2 * 3
            expect(scaled.getValue(0, 2)).toBe(12); // 3 * 4
            expect(scaled.getValue(1, 0)).toBe(8);  // 4 * 2
            expect(scaled.getValue(1, 1)).toBe(15); // 5 * 3
            expect(scaled.getValue(1, 2)).toBe(24); // 6 * 4
        });
    });

    describe('Matrix Arithmetic', () => {
        test('multiplyAssign works correctly', () => {
            const m1 = new btMatrix3x3(
                1, 0, 0,
                0, 2, 0,
                0, 0, 3
            );
            const m2 = new btMatrix3x3(
                2, 0, 0,
                0, 3, 0,
                0, 0, 4
            );
            
            m1.multiplyAssign(m2);
            
            expect(m1.getValue(0, 0)).toBe(2);  // 1 * 2
            expect(m1.getValue(1, 1)).toBe(6);  // 2 * 3
            expect(m1.getValue(2, 2)).toBe(12); // 3 * 4
        });

        test('addAssign works correctly', () => {
            const m1 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const m2 = new btMatrix3x3(
                9, 8, 7,
                6, 5, 4,
                3, 2, 1
            );
            
            m1.addAssign(m2);
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    expect(m1.getValue(i, j)).toBe(10); // All elements should be 10
                }
            }
        });

        test('subtractAssign works correctly', () => {
            const m1 = new btMatrix3x3(
                5, 5, 5,
                5, 5, 5,
                5, 5, 5
            );
            const m2 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            
            m1.subtractAssign(m2);
            
            expect(m1.getValue(0, 0)).toBe(4);  // 5 - 1
            expect(m1.getValue(0, 1)).toBe(3);  // 5 - 2
            expect(m1.getValue(2, 2)).toBe(-4); // 5 - 9
        });
    });

    describe('Rotation Conversions', () => {
        test('setRotation from quaternion and getRotation roundtrip', () => {
            const originalQ = new btQuaternion(0.1, 0.2, 0.3, 0.9);
            originalQ.normalize();
            
            const m = new btMatrix3x3();
            m.setRotation(originalQ);
            
            const extractedQ = new btQuaternion();
            m.getRotation(extractedQ);
            
            // Quaternions can have opposite signs for same rotation
            const dotProduct = originalQ.getX() * extractedQ.getX() + 
                             originalQ.getY() * extractedQ.getY() + 
                             originalQ.getZ() * extractedQ.getZ() + 
                             originalQ.getW() * extractedQ.getW();
            
            expect(Math.abs(Math.abs(dotProduct) - 1.0) < 1e-6).toBe(true);
        });

        test('setEulerZYX and getEulerZYX roundtrip', () => {
            const originalX = 0.1;
            const originalY = 0.2;
            const originalZ = 0.3;
            
            const m = new btMatrix3x3();
            m.setEulerZYX(originalX, originalY, originalZ);
            
            const extracted = m.getEulerZYX(1);
            
            expect(approxEqual(extracted.roll, originalX, 1e-6)).toBe(true);
            expect(approxEqual(extracted.pitch, originalY, 1e-6)).toBe(true);
            expect(approxEqual(extracted.yaw, originalZ, 1e-6)).toBe(true);
        });

        test('setEulerYPR and getEulerYPR roundtrip', () => {
            const originalYaw = 0.1;
            const originalPitch = 0.2;
            const originalRoll = 0.3;
            
            const m = new btMatrix3x3();
            m.setEulerYPR(originalYaw, originalPitch, originalRoll);
            
            const extracted = m.getEulerYPR();
            
            expect(approxEqual(extracted.yaw, originalYaw, 1e-6)).toBe(true);
            expect(approxEqual(extracted.pitch, originalPitch, 1e-6)).toBe(true);
            expect(approxEqual(extracted.roll, originalRoll, 1e-6)).toBe(true);
        });
    });

    describe('Utility Methods', () => {
        test('tdotx, tdoty, tdotz work correctly', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const v = new btVector3(1, 2, 3);
            
            // tdotx computes dot product of first column with v
            expect(m.tdotx(v)).toBe(1*1 + 4*2 + 7*3); // 1 + 8 + 21 = 30
            
            // tdoty computes dot product of second column with v  
            expect(m.tdoty(v)).toBe(2*1 + 5*2 + 8*3); // 2 + 10 + 24 = 36
            
            // tdotz computes dot product of third column with v
            expect(m.tdotz(v)).toBe(3*1 + 6*2 + 9*3); // 3 + 12 + 27 = 42
        });

        test('cofac calculation works correctly', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            
            // cofac(0, 0, 1, 1) = m[0][0] * m[1][1] - m[0][1] * m[1][0]
            // = 1 * 5 - 2 * 4 = 5 - 8 = -3
            expect(m.cofac(0, 0, 1, 1)).toBe(-3);
        });

        test('solve33 works for simple system', () => {
            // Create a simple diagonal system
            const m = new btMatrix3x3(
                2, 0, 0,
                0, 3, 0,
                0, 0, 4
            );
            const b = new btVector3(4, 9, 12);
            const x = m.solve33(b);
            
            // Solution should be [2, 3, 3]
            expect(approxEqual(x.getX(), 2, 1e-6)).toBe(true);
            expect(approxEqual(x.getY(), 3, 1e-6)).toBe(true);
            expect(approxEqual(x.getZ(), 3, 1e-6)).toBe(true);
        });
    });

    describe('Static Functions and Operators', () => {
        test('multiplyMatrixScalar works correctly', () => {
            const m = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const scaled = multiplyMatrixScalar(m, 2);
            
            expect(scaled.getValue(0, 0)).toBe(2);
            expect(scaled.getValue(1, 1)).toBe(10);
            expect(scaled.getValue(2, 2)).toBe(18);
        });

        test('addMatrices works correctly', () => {
            const m1 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const m2 = new btMatrix3x3(
                9, 8, 7,
                6, 5, 4,
                3, 2, 1
            );
            const sum = addMatrices(m1, m2);
            
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    expect(sum.getValue(i, j)).toBe(10);
                }
            }
        });

        test('multiplyMatrixVector works correctly', () => {
            const m = new btMatrix3x3(
                1, 0, 0,
                0, 2, 0,
                0, 0, 3
            );
            const v = new btVector3(2, 3, 4);
            const result = multiplyMatrixVector(m, v);
            
            expect(vectorsApproxEqual(result, new btVector3(2, 6, 12))).toBe(true);
        });

        test('multiplyVectorMatrix works correctly', () => {
            const v = new btVector3(2, 3, 4);
            const m = new btMatrix3x3(
                1, 0, 0,
                0, 2, 0,
                0, 0, 3
            );
            const result = multiplyVectorMatrix(v, m);
            
            expect(vectorsApproxEqual(result, new btVector3(2, 6, 12))).toBe(true);
        });

        test('multiplyMatrices works correctly', () => {
            const m1 = new btMatrix3x3(
                1, 0, 0,
                0, 2, 0,
                0, 0, 3
            );
            const m2 = new btMatrix3x3(
                2, 0, 0,
                0, 3, 0,
                0, 0, 4
            );
            const product = multiplyMatrices(m1, m2);
            
            expect(product.getValue(0, 0)).toBe(2);
            expect(product.getValue(1, 1)).toBe(6);
            expect(product.getValue(2, 2)).toBe(12);
        });
    });

    describe('Advanced Matrix Operations', () => {
        test('transposeTimes works correctly', () => {
            const m1 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const m2 = new btMatrix3x3(
                9, 8, 7,
                6, 5, 4,
                3, 2, 1
            );
            
            const result = m1.transposeTimes(m2);
            const expected = multiplyMatrices(m1.transpose(), m2);
            
            expect(matricesApproxEqual(result, expected)).toBe(true);
        });

        test('timesTranspose works correctly', () => {
            const m1 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const m2 = new btMatrix3x3(
                9, 8, 7,
                6, 5, 4,
                3, 2, 1
            );
            
            const result = m1.timesTranspose(m2);
            const expected = multiplyMatrices(m1, m2.transpose());
            
            expect(matricesApproxEqual(result, expected)).toBe(true);
        });
    });

    describe('Matrix Properties', () => {
        test('rotation matrix determinant is 1', () => {
            const q = new btQuaternion(0.1, 0.2, 0.3, 0.9);
            q.normalize();
            const m = new btMatrix3x3(q);
            
            expect(approxEqual(m.determinant(), 1.0, 1e-6)).toBe(true);
        });

        test('orthogonal matrix inverse equals transpose', () => {
            const q = new btQuaternion(0.1, 0.2, 0.3, 0.9);
            q.normalize();
            const m = new btMatrix3x3(q);
            
            const inverse = m.inverse();
            const transpose = m.transpose();
            
            expect(matricesApproxEqual(inverse, transpose, 1e-6)).toBe(true);
        });

        test('identity matrix properties', () => {
            const identity = btMatrix3x3.getIdentity();
            
            // Determinant of identity is 1
            expect(identity.determinant()).toBe(1);
            
            // Inverse of identity is identity
            const inverse = identity.inverse();
            expect(matricesApproxEqual(inverse, identity)).toBe(true);
            
            // Transpose of identity is identity
            const transpose = identity.transpose();
            expect(matricesApproxEqual(transpose, identity)).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        test('matrix equality comparison', () => {
            const m1 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const m2 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 9
            );
            const m3 = new btMatrix3x3(
                1, 2, 3,
                4, 5, 6,
                7, 8, 10
            );
            
            expect(matricesEqual(m1, m2)).toBe(true);
            expect(matricesEqual(m1, m3)).toBe(false);
        });

        test('near-singular matrix handling', () => {
            // Create a nearly singular matrix (determinant close to 0)
            const m = new btMatrix3x3(
                1, 2, 3,
                2, 4, 6.000001, // Almost linearly dependent
                7, 8, 9
            );
            
            // Should still be able to compute determinant
            const det = m.determinant();
            expect(Math.abs(det) < 1e-5).toBe(true);
        });
    });
});