/*
Copyright (c) 2003-2013 Gino van den Bergen / Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

/**
 * TypeScript port of Bullet3Common/shared/b3Mat3x3.h
 * 3x3 matrix operations for SIMD-friendly operations
 */

import { b3Float4, b3MakeFloat4, b3Dot3F4 } from './b3Float4';
import { b3Scalar } from '../b3Scalar';

/**
 * 3x3 matrix represented as 3 rows of b3Float4 vectors
 */
export class b3Mat3x3 {
    public m_row: b3Float4[] = [
        new b3Float4(1, 0, 0, 0),
        new b3Float4(0, 1, 0, 0),
        new b3Float4(0, 0, 1, 0)
    ];

    constructor(
        m00: b3Scalar = 1, m01: b3Scalar = 0, m02: b3Scalar = 0,
        m10: b3Scalar = 0, m11: b3Scalar = 1, m12: b3Scalar = 0,
        m20: b3Scalar = 0, m21: b3Scalar = 0, m22: b3Scalar = 1
    ) {
        this.m_row[0] = new b3Float4(m00, m01, m02, 0);
        this.m_row[1] = new b3Float4(m10, m11, m12, 0);
        this.m_row[2] = new b3Float4(m20, m21, m22, 0);
    }

    /**
     * Create from quaternion (forward declaration for now)
     * This will be properly implemented when we have b3Quat
     */
    static fromQuaternion(_quat: any): b3Mat3x3 {
        // Placeholder implementation
        return new b3Mat3x3();
    }

    /**
     * Get row vector
     */
    getRow(row: number): b3Float4 {
        return this.m_row[row].clone();
    }

    /**
     * Set row vector
     */
    setRow(row: number, vector: b3Float4): void {
        this.m_row[row] = vector.clone();
    }

    /**
     * Get column vector
     */
    getColumn(col: number): b3Float4 {
        return b3MakeFloat4(
            this.m_row[0].get(col),
            this.m_row[1].get(col),
            this.m_row[2].get(col),
            0
        );
    }

    /**
     * Set column vector
     */
    setColumn(col: number, vector: b3Float4): void {
        this.m_row[0].set(col, vector.x);
        this.m_row[1].set(col, vector.y);
        this.m_row[2].set(col, vector.z);
    }

    /**
     * Get element at row, column
     */
    getElement(row: number, col: number): b3Scalar {
        return this.m_row[row].get(col);
    }

    /**
     * Set element at row, column
     */
    setElement(row: number, col: number, value: b3Scalar): void {
        this.m_row[row].set(col, value);
    }

    /**
     * Matrix multiplication
     */
    multiply(other: b3Mat3x3): b3Mat3x3 {
        const transB = other.transpose();
        const result = new b3Mat3x3();
        
        // Ensure w components are zero
        this.m_row[0].w = 0;
        this.m_row[1].w = 0;
        this.m_row[2].w = 0;
        
        for (let i = 0; i < 3; i++) {
            result.m_row[i].x = b3Dot3F4(this.m_row[i], transB.m_row[0]);
            result.m_row[i].y = b3Dot3F4(this.m_row[i], transB.m_row[1]);
            result.m_row[i].z = b3Dot3F4(this.m_row[i], transB.m_row[2]);
            result.m_row[i].w = 0;
        }
        
        return result;
    }

    /**
     * Matrix-vector multiplication (matrix * vector)
     */
    multiplyVector(vector: b3Float4): b3Float4 {
        return b3MakeFloat4(
            b3Dot3F4(this.m_row[0], vector),
            b3Dot3F4(this.m_row[1], vector),
            b3Dot3F4(this.m_row[2], vector),
            0
        );
    }

    /**
     * Vector-matrix multiplication (vector * matrix)
     */
    multiplyByVector(vector: b3Float4): b3Float4 {
        const colx = b3MakeFloat4(this.m_row[0].x, this.m_row[1].x, this.m_row[2].x, 0);
        const coly = b3MakeFloat4(this.m_row[0].y, this.m_row[1].y, this.m_row[2].y, 0);
        const colz = b3MakeFloat4(this.m_row[0].z, this.m_row[1].z, this.m_row[2].z, 0);

        return b3MakeFloat4(
            b3Dot3F4(vector, colx),
            b3Dot3F4(vector, coly),
            b3Dot3F4(vector, colz),
            0
        );
    }

    /**
     * Matrix transpose
     */
    transpose(): b3Mat3x3 {
        const result = new b3Mat3x3();
        result.m_row[0] = b3MakeFloat4(this.m_row[0].x, this.m_row[1].x, this.m_row[2].x, 0);
        result.m_row[1] = b3MakeFloat4(this.m_row[0].y, this.m_row[1].y, this.m_row[2].y, 0);
        result.m_row[2] = b3MakeFloat4(this.m_row[0].z, this.m_row[1].z, this.m_row[2].z, 0);
        return result;
    }

    /**
     * Matrix absolute (element-wise absolute value)
     */
    absolute(): b3Mat3x3 {
        const result = new b3Mat3x3();
        result.m_row[0] = this.m_row[0].absolute();
        result.m_row[1] = this.m_row[1].absolute();
        result.m_row[2] = this.m_row[2].absolute();
        return result;
    }

    /**
     * Set to zero matrix
     */
    setZero(): void {
        this.m_row[0] = new b3Float4(0, 0, 0, 0);
        this.m_row[1] = new b3Float4(0, 0, 0, 0);
        this.m_row[2] = new b3Float4(0, 0, 0, 0);
    }

    /**
     * Set to identity matrix
     */
    setIdentity(): void {
        this.m_row[0] = new b3Float4(1, 0, 0, 0);
        this.m_row[1] = new b3Float4(0, 1, 0, 0);
        this.m_row[2] = new b3Float4(0, 0, 1, 0);
    }

    /**
     * Clone this matrix
     */
    clone(): b3Mat3x3 {
        const result = new b3Mat3x3();
        result.m_row[0] = this.m_row[0].clone();
        result.m_row[1] = this.m_row[1].clone();
        result.m_row[2] = this.m_row[2].clone();
        return result;
    }
}

// Type alias for const arguments
export type b3Mat3x3ConstArg = b3Mat3x3;

/**
 * Factory functions
 */
export function b3MakeZeroMat3x3(): b3Mat3x3 {
    const m = new b3Mat3x3();
    m.setZero();
    return m;
}

export function b3MakeIdentityMat3x3(): b3Mat3x3 {
    const m = new b3Mat3x3();
    m.setIdentity();
    return m;
}

/**
 * Global utility functions
 */
export function mtZero(): b3Mat3x3 {
    return b3MakeZeroMat3x3();
}

export function mtIdentity(): b3Mat3x3 {
    return b3MakeIdentityMat3x3();
}

export function mtTranspose(m: b3Mat3x3): b3Mat3x3 {
    return m.transpose();
}

export function mtMul(a: b3Mat3x3, b: b3Mat3x3): b3Mat3x3 {
    return a.multiply(b);
}

export function mtMul1(a: b3Mat3x3, b: b3Float4): b3Float4 {
    return a.multiplyVector(b);
}

export function mtMul3(a: b3Float4, b: b3Mat3x3): b3Float4 {
    return b.multiplyByVector(a);
}

export function b3AbsoluteMat3x3(mat: b3Mat3x3ConstArg): b3Mat3x3 {
    return mat.absolute();
}

export function b3GetRow(m: b3Mat3x3, row: number): b3Float4 {
    return m.getRow(row);
}

/**
 * Quaternion to rotation matrix conversion
 * This is a placeholder that will be properly implemented when we have b3Quat
 */
export function b3QuatGetRotationMatrix(_quat: any): b3Mat3x3 {
    // This will need to be implemented when we have the quaternion class
    // For now, return identity
    return b3MakeIdentityMat3x3();
}