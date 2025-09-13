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
 * TypeScript port of Bullet3Common/shared/b3Float4.h
 * 4-component float vector for SIMD-friendly operations
 * 
 * In the original Bullet3, b3Float4 is an alias for b3Vector3 in C++ mode.
 * For the TypeScript port, we'll create a proper 4-component float vector
 * and provide compatibility functions.
 */

import { b3Scalar, b3Fabs, B3_INFINITY } from '../b3Scalar';

/**
 * 4-component float vector
 */
export class b3Float4 {
    public x: b3Scalar;
    public y: b3Scalar;
    public z: b3Scalar;
    public w: b3Scalar;

    constructor(x: b3Scalar = 0, y: b3Scalar = 0, z: b3Scalar = 0, w: b3Scalar = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Get component by index
     */
    get(index: number): b3Scalar {
        switch (index) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            case 3: return this.w;
            default: throw new Error(`Invalid index ${index} for b3Float4`);
        }
    }

    /**
     * Set component by index
     */
    set(index: number, value: b3Scalar): void {
        switch (index) {
            case 0: this.x = value; break;
            case 1: this.y = value; break;
            case 2: this.z = value; break;
            case 3: this.w = value; break;
            default: throw new Error(`Invalid index ${index} for b3Float4`);
        }
    }

    /**
     * Set all components
     */
    setValue(x: b3Scalar, y: b3Scalar, z: b3Scalar, w: b3Scalar = 0): void {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Convert to array
     */
    toArray(): b3Scalar[] {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Clone this vector
     */
    clone(): b3Float4 {
        return new b3Float4(this.x, this.y, this.z, this.w);
    }

    /**
     * Add another vector to this one
     */
    add(v: b3Float4): b3Float4 {
        return new b3Float4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    /**
     * Subtract another vector from this one
     */
    subtract(v: b3Float4): b3Float4 {
        return new b3Float4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    /**
     * Multiply this vector by a scalar
     */
    scale(s: b3Scalar): b3Float4 {
        return new b3Float4(this.x * s, this.y * s, this.z * s, this.w * s);
    }

    /**
     * Element-wise multiply
     */
    multiply(v: b3Float4): b3Float4 {
        return new b3Float4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
    }

    /**
     * 3D dot product (ignoring w component)
     */
    dot3(v: b3Float4): b3Scalar {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * 4D dot product
     */
    dot4(v: b3Float4): b3Scalar {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    /**
     * 3D cross product (ignoring w component)
     */
    cross3(v: b3Float4): b3Float4 {
        return new b3Float4(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x,
            0
        );
    }

    /**
     * Length squared (3D, ignoring w)
     */
    length2(): b3Scalar {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Length (3D, ignoring w)
     */
    length(): b3Scalar {
        return Math.sqrt(this.length2());
    }

    /**
     * Normalize this vector (3D, w component unchanged)
     */
    normalize(): b3Float4 {
        const len = this.length();
        if (len > 0) {
            const invLen = 1.0 / len;
            return new b3Float4(this.x * invLen, this.y * invLen, this.z * invLen, this.w);
        }
        return new b3Float4(1, 0, 0, this.w);
    }

    /**
     * Return normalized copy of this vector
     */
    normalized(): b3Float4 {
        return this.normalize();
    }

    /**
     * Set each element to the max of the current values and the values of another vector
     */
    setMax(other: b3Float4): void {
        this.x = Math.max(this.x, other.x);
        this.y = Math.max(this.y, other.y);
        this.z = Math.max(this.z, other.z);
        this.w = Math.max(this.w, other.w);
    }

    /**
     * Set each element to the min of the current values and the values of another vector
     */
    setMin(other: b3Float4): void {
        this.x = Math.min(this.x, other.x);
        this.y = Math.min(this.y, other.y);
        this.z = Math.min(this.z, other.z);
        this.w = Math.min(this.w, other.w);
    }

    /**
     * Return absolute values of all components
     */
    absolute(): b3Float4 {
        return new b3Float4(
            Math.abs(this.x),
            Math.abs(this.y),
            Math.abs(this.z),
            Math.abs(this.w)
        );
    }
}

/**
 * Type alias for compatibility with b3Vector3-based code
 */
export type b3Float4ConstArg = b3Float4;

/**
 * Factory function for creating b3Float4
 */
export function b3MakeFloat4(x: b3Scalar, y: b3Scalar, z: b3Scalar, w: b3Scalar = 0): b3Float4 {
    return new b3Float4(x, y, z, w);
}

/**
 * Utility functions
 */
export function b3Dot3F4(v0: b3Float4ConstArg, v1: b3Float4ConstArg): b3Scalar {
    return v0.dot3(v1);
}

export function b3Cross3(v0: b3Float4ConstArg, v1: b3Float4ConstArg): b3Float4 {
    return v0.cross3(v1);
}

export function b3Normalized(vec: b3Float4ConstArg): b3Float4 {
    return vec.normalized();
}

export function b3FastNormalized3(v: b3Float4ConstArg): b3Float4 {
    return v.normalized();
}

export function b3MaxFloat4(a: b3Float4, b: b3Float4): b3Float4 {
    const result = a.clone();
    result.setMax(b);
    return result;
}

export function b3MinFloat4(a: b3Float4, b: b3Float4): b3Float4 {
    const result = a.clone();
    result.setMin(b);
    return result;
}

/**
 * Check if vector is almost zero (3D components only)
 */
export function b3IsAlmostZero(v: b3Float4ConstArg): boolean {
    const epsilon = 1e-6;
    return b3Fabs(v.x) <= epsilon && b3Fabs(v.y) <= epsilon && b3Fabs(v.z) <= epsilon;
}

/**
 * Find the vector in an array with maximum dot product with the given vector
 */
export function b3MaxDot(vec: b3Float4ConstArg, vecArray: b3Float4[], vecLen: number): { index: number; dot: b3Scalar } {
    let maxDot = -B3_INFINITY;
    let ptIndex = -1;
    
    for (let i = 0; i < vecLen && i < vecArray.length; i++) {
        const dot = b3Dot3F4(vecArray[i], vec);
        
        if (dot > maxDot) {
            maxDot = dot;
            ptIndex = i;
        }
    }
    
    if (ptIndex < 0) {
        ptIndex = 0;
    }
    
    return { index: ptIndex, dot: maxDot };
}