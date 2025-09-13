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
 * TypeScript port of Bullet3Common/shared/b3Int4.h
 * 4-component integer vector for SIMD-friendly operations
 */

/**
 * 4-component unsigned integer vector
 */
export class b3UnsignedInt4 {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x >>> 0; // Ensure unsigned 32-bit integer
        this.y = y >>> 0;
        this.z = z >>> 0;
        this.w = w >>> 0;
    }

    /**
     * Get component by index
     */
    get(index: number): number {
        switch (index) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            case 3: return this.w;
            default: throw new Error(`Invalid index ${index} for b3UnsignedInt4`);
        }
    }

    /**
     * Set component by index
     */
    set(index: number, value: number): void {
        const unsignedValue = value >>> 0;
        switch (index) {
            case 0: this.x = unsignedValue; break;
            case 1: this.y = unsignedValue; break;
            case 2: this.z = unsignedValue; break;
            case 3: this.w = unsignedValue; break;
            default: throw new Error(`Invalid index ${index} for b3UnsignedInt4`);
        }
    }

    /**
     * Convert to array
     */
    toArray(): number[] {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Set all components
     */
    setValue(x: number, y: number, z: number, w: number = 0): void {
        this.x = x >>> 0;
        this.y = y >>> 0;
        this.z = z >>> 0;
        this.w = w >>> 0;
    }

    /**
     * Clone this vector
     */
    clone(): b3UnsignedInt4 {
        return new b3UnsignedInt4(this.x, this.y, this.z, this.w);
    }
}

/**
 * 4-component signed integer vector
 */
export class b3Int4 {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x | 0; // Ensure signed 32-bit integer
        this.y = y | 0;
        this.z = z | 0;
        this.w = w | 0;
    }

    /**
     * Get component by index
     */
    get(index: number): number {
        switch (index) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            case 3: return this.w;
            default: throw new Error(`Invalid index ${index} for b3Int4`);
        }
    }

    /**
     * Set component by index
     */
    set(index: number, value: number): void {
        const signedValue = value | 0;
        switch (index) {
            case 0: this.x = signedValue; break;
            case 1: this.y = signedValue; break;
            case 2: this.z = signedValue; break;
            case 3: this.w = signedValue; break;
            default: throw new Error(`Invalid index ${index} for b3Int4`);
        }
    }

    /**
     * Convert to array
     */
    toArray(): number[] {
        return [this.x, this.y, this.z, this.w];
    }

    /**
     * Set all components
     */
    setValue(x: number, y: number, z: number, w: number = 0): void {
        this.x = x | 0;
        this.y = y | 0;
        this.z = z | 0;
        this.w = w | 0;
    }

    /**
     * Clone this vector
     */
    clone(): b3Int4 {
        return new b3Int4(this.x, this.y, this.z, this.w);
    }
}

/**
 * Factory functions for creating vectors
 */
export function b3MakeInt4(x: number, y: number, z: number, w: number = 0): b3Int4 {
    return new b3Int4(x, y, z, w);
}

export function b3MakeUnsignedInt4(x: number, y: number, z: number, w: number = 0): b3UnsignedInt4 {
    return new b3UnsignedInt4(x, y, z, w);
}