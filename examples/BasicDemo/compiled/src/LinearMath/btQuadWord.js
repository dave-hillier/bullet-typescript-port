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
import { btMax, btMin } from './btMinMax';
/**
 * The btQuadWord class is base class for btVector3 and btQuaternion.
 * This TypeScript version removes SIMD optimizations and uses a simple array-based implementation.
 */
export class btQuadWord {
    constructor(x, y, z, w) {
        this.m_floats = new Array(4);
        if (x !== undefined && y !== undefined && z !== undefined) {
            this.m_floats[0] = x;
            this.m_floats[1] = y;
            this.m_floats[2] = z;
            this.m_floats[3] = w !== undefined ? w : 0.0;
        }
        else {
            // No initialization - leave uninitialized for performance
            // Values will be set explicitly when needed
        }
    }
    /**
     * Return the x value
     */
    getX() {
        return this.m_floats[0];
    }
    /**
     * Return the y value
     */
    getY() {
        return this.m_floats[1];
    }
    /**
     * Return the z value
     */
    getZ() {
        return this.m_floats[2];
    }
    /**
     * Return the w value
     */
    getW() {
        return this.m_floats[3];
    }
    /**
     * Set the x value
     */
    setX(x) {
        this.m_floats[0] = x;
    }
    /**
     * Set the y value
     */
    setY(y) {
        this.m_floats[1] = y;
    }
    /**
     * Set the z value
     */
    setZ(z) {
        this.m_floats[2] = z;
    }
    /**
     * Set the w value
     */
    setW(w) {
        this.m_floats[3] = w;
    }
    /**
     * Return the x value (shorter accessor)
     */
    x() {
        return this.m_floats[0];
    }
    /**
     * Return the y value (shorter accessor)
     */
    y() {
        return this.m_floats[1];
    }
    /**
     * Return the z value (shorter accessor)
     */
    z() {
        return this.m_floats[2];
    }
    /**
     * Return the w value (shorter accessor)
     */
    w() {
        return this.m_floats[3];
    }
    /**
     * Array access operator - get value at index
     * @param i Index (0=x, 1=y, 2=z, 3=w)
     * @returns The value at the specified index
     */
    getAt(i) {
        return this.m_floats[i];
    }
    /**
     * Array access operator - set value at index
     * @param i Index (0=x, 1=y, 2=z, 3=w)
     * @param value The value to set
     */
    setAt(i, value) {
        this.m_floats[i] = value;
    }
    /**
     * Get the internal array (for compatibility with C++ operator btScalar*)
     * @returns The internal float array
     */
    getFloatArray() {
        return this.m_floats;
    }
    /**
     * Get a read-only copy of the internal array
     * @returns A copy of the internal float array
     */
    getFloatArrayConst() {
        return this.m_floats;
    }
    /**
     * Equality comparison
     * @param other The other btQuadWord to compare with
     * @returns True if all components are equal
     */
    equals(other) {
        return (this.m_floats[0] === other.m_floats[0] &&
            this.m_floats[1] === other.m_floats[1] &&
            this.m_floats[2] === other.m_floats[2] &&
            this.m_floats[3] === other.m_floats[3]);
    }
    /**
     * Inequality comparison
     * @param other The other btQuadWord to compare with
     * @returns True if any components are not equal
     */
    notEquals(other) {
        return !this.equals(other);
    }
    setValue(x, y, z, w) {
        this.m_floats[0] = x;
        this.m_floats[1] = y;
        this.m_floats[2] = z;
        this.m_floats[3] = w !== undefined ? w : 0.0;
    }
    /**
     * Set each element to the max of the current values and the values of another btQuadWord
     * @param other The other btQuadWord to compare with
     */
    setMax(other) {
        this.m_floats[0] = btMax(this.m_floats[0], other.m_floats[0]);
        this.m_floats[1] = btMax(this.m_floats[1], other.m_floats[1]);
        this.m_floats[2] = btMax(this.m_floats[2], other.m_floats[2]);
        this.m_floats[3] = btMax(this.m_floats[3], other.m_floats[3]);
    }
    /**
     * Set each element to the min of the current values and the values of another btQuadWord
     * @param other The other btQuadWord to compare with
     */
    setMin(other) {
        this.m_floats[0] = btMin(this.m_floats[0], other.m_floats[0]);
        this.m_floats[1] = btMin(this.m_floats[1], other.m_floats[1]);
        this.m_floats[2] = btMin(this.m_floats[2], other.m_floats[2]);
        this.m_floats[3] = btMin(this.m_floats[3], other.m_floats[3]);
    }
    /**
     * Create a copy of this btQuadWord
     * @returns A new btQuadWord with the same values
     */
    clone() {
        const result = new btQuadWord();
        result.m_floats[0] = this.m_floats[0];
        result.m_floats[1] = this.m_floats[1];
        result.m_floats[2] = this.m_floats[2];
        result.m_floats[3] = this.m_floats[3];
        return result;
    }
    /**
     * Copy values from another btQuadWord
     * @param other The btQuadWord to copy from
     */
    copy(other) {
        this.m_floats[0] = other.m_floats[0];
        this.m_floats[1] = other.m_floats[1];
        this.m_floats[2] = other.m_floats[2];
        this.m_floats[3] = other.m_floats[3];
    }
    /**
     * Returns a string representation of the quad word
     * @returns String representation
     */
    toString() {
        return `[${this.m_floats[0]}, ${this.m_floats[1]}, ${this.m_floats[2]}, ${this.m_floats[3]}]`;
    }
}
