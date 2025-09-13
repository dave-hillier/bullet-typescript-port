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
 * TypeScript port of Bullet3Common/b3Vector3.h
 * 3D vector mathematics for the Bullet3 physics engine
 */

import { b3Scalar, b3Sqrt, b3Fabs, b3Cos, b3Sin, b3Acos, b3Assert, B3_EPSILON, B3_INFINITY, B3_SQRT12 } from './b3Scalar';
import { b3SetMax, b3SetMin } from './b3MinMax';

/**
 * Serialization data structures
 */
export interface b3Vector3FloatData {
    m_floats: number[];
}

export interface b3Vector3DoubleData {
    m_floats: number[];
}

export type b3Vector3Data = b3Vector3FloatData;

/**
 * b3Vector3 can be used to represent 3D points and vectors.
 * It has an un-used w component to suit 16-byte alignment when b3Vector3 is stored in containers.
 * This extra component can be used by derived classes (Quaternion?) or by user
 */
export class b3Vector3 {
    private m_floats: b3Scalar[] = [0, 0, 0, 0];

    constructor(x: b3Scalar = 0, y: b3Scalar = 0, z: b3Scalar = 0, w: b3Scalar = 0) {
        this.m_floats[0] = x;
        this.m_floats[1] = y;
        this.m_floats[2] = z;
        this.m_floats[3] = w;
    }

    // Accessors
    get x(): b3Scalar { return this.m_floats[0]; }
    set x(value: b3Scalar) { this.m_floats[0] = value; }
    
    get y(): b3Scalar { return this.m_floats[1]; }
    set y(value: b3Scalar) { this.m_floats[1] = value; }
    
    get z(): b3Scalar { return this.m_floats[2]; }
    set z(value: b3Scalar) { this.m_floats[2] = value; }
    
    get w(): b3Scalar { return this.m_floats[3]; }
    set w(value: b3Scalar) { this.m_floats[3] = value; }

    /**
     * Array-like access
     */
    get(index: number): b3Scalar {
        return this.m_floats[index];
    }

    set(index: number, value: b3Scalar): void {
        this.m_floats[index] = value;
    }

    /**
     * Add a vector to this one
     */
    addAssign(v: b3Vector3): b3Vector3 {
        this.m_floats[0] += v.m_floats[0];
        this.m_floats[1] += v.m_floats[1];
        this.m_floats[2] += v.m_floats[2];
        return this;
    }

    /**
     * Subtract a vector from this one
     */
    subtractAssign(v: b3Vector3): b3Vector3 {
        this.m_floats[0] -= v.m_floats[0];
        this.m_floats[1] -= v.m_floats[1];
        this.m_floats[2] -= v.m_floats[2];
        return this;
    }

    /**
     * Scale the vector
     */
    multiplyAssign(s: b3Scalar): b3Vector3 {
        this.m_floats[0] *= s;
        this.m_floats[1] *= s;
        this.m_floats[2] *= s;
        return this;
    }

    /**
     * Inversely scale the vector
     */
    divideAssign(s: b3Scalar): b3Vector3 {
        b3Assert(s !== 0.0);
        return this.multiplyAssign(1.0 / s);
    }

    /**
     * Return the dot product
     */
    dot(v: b3Vector3): b3Scalar {
        return this.m_floats[0] * v.m_floats[0] +
               this.m_floats[1] * v.m_floats[1] +
               this.m_floats[2] * v.m_floats[2];
    }

    /**
     * Return the length of the vector squared
     */
    length2(): b3Scalar {
        return this.dot(this);
    }

    /**
     * Return the length of the vector
     */
    length(): b3Scalar {
        return b3Sqrt(this.length2());
    }

    /**
     * Return the distance squared between the ends of this and another vector
     */
    distance2(v: b3Vector3): b3Scalar {
        return v.subtract(this).length2();
    }

    /**
     * Return the distance between the ends of this and another vector
     */
    distance(v: b3Vector3): b3Scalar {
        return v.subtract(this).length();
    }

    /**
     * Safely normalize this vector
     */
    safeNormalize(): b3Vector3 {
        const l2 = this.length2();
        if (l2 >= B3_EPSILON * B3_EPSILON) {
            this.divideAssign(b3Sqrt(l2));
        } else {
            this.setValue(1, 0, 0);
        }
        return this;
    }

    /**
     * Normalize this vector
     */
    normalize(): b3Vector3 {
        return this.divideAssign(this.length());
    }

    /**
     * Return a normalized version of this vector
     */
    normalized(): b3Vector3 {
        const result = this.clone();
        return result.normalize();
    }

    /**
     * Return a rotated version of this vector
     */
    rotate(wAxis: b3Vector3, angle: b3Scalar): b3Vector3 {
        // wAxis must be a unit length vector
        const o = wAxis.scale(wAxis.dot(this));
        const x = this.subtract(o);
        const y = wAxis.cross(this);
        
        return o.add(x.scale(b3Cos(angle))).add(y.scale(b3Sin(angle)));
    }

    /**
     * Return the angle between this and another vector
     */
    angle(v: b3Vector3): b3Scalar {
        const s = b3Sqrt(this.length2() * v.length2());
        b3Assert(s !== 0.0);
        return b3Acos(this.dot(v) / s);
    }

    /**
     * Return a vector with the absolute values of each element
     */
    absolute(): b3Vector3 {
        return new b3Vector3(
            b3Fabs(this.m_floats[0]),
            b3Fabs(this.m_floats[1]),
            b3Fabs(this.m_floats[2])
        );
    }

    /**
     * Return the cross product between this and another vector
     */
    cross(v: b3Vector3): b3Vector3 {
        return new b3Vector3(
            this.m_floats[1] * v.m_floats[2] - this.m_floats[2] * v.m_floats[1],
            this.m_floats[2] * v.m_floats[0] - this.m_floats[0] * v.m_floats[2],
            this.m_floats[0] * v.m_floats[1] - this.m_floats[1] * v.m_floats[0]
        );
    }

    /**
     * Triple product
     */
    triple(v1: b3Vector3, v2: b3Vector3): b3Scalar {
        return this.m_floats[0] * (v1.m_floats[1] * v2.m_floats[2] - v1.m_floats[2] * v2.m_floats[1]) +
               this.m_floats[1] * (v1.m_floats[2] * v2.m_floats[0] - v1.m_floats[0] * v2.m_floats[2]) +
               this.m_floats[2] * (v1.m_floats[0] * v2.m_floats[1] - v1.m_floats[1] * v2.m_floats[0]);
    }

    /**
     * Return the axis with the smallest value
     */
    minAxis(): number {
        return this.m_floats[0] < this.m_floats[1] ? 
               (this.m_floats[0] < this.m_floats[2] ? 0 : 2) : 
               (this.m_floats[1] < this.m_floats[2] ? 1 : 2);
    }

    /**
     * Return the axis with the largest value
     */
    maxAxis(): number {
        return this.m_floats[0] < this.m_floats[1] ? 
               (this.m_floats[1] < this.m_floats[2] ? 2 : 1) : 
               (this.m_floats[0] < this.m_floats[2] ? 2 : 0);
    }

    furthestAxis(): number {
        return this.absolute().minAxis();
    }

    closestAxis(): number {
        return this.absolute().maxAxis();
    }

    /**
     * Set interpolation between two vectors
     */
    setInterpolate3(v0: b3Vector3, v1: b3Vector3, rt: b3Scalar): void {
        const s = 1.0 - rt;
        this.m_floats[0] = s * v0.m_floats[0] + rt * v1.m_floats[0];
        this.m_floats[1] = s * v0.m_floats[1] + rt * v1.m_floats[1];
        this.m_floats[2] = s * v0.m_floats[2] + rt * v1.m_floats[2];
    }

    /**
     * Return the linear interpolation between this and another vector
     */
    lerp(v: b3Vector3, t: b3Scalar): b3Vector3 {
        return new b3Vector3(
            this.m_floats[0] + (v.m_floats[0] - this.m_floats[0]) * t,
            this.m_floats[1] + (v.m_floats[1] - this.m_floats[1]) * t,
            this.m_floats[2] + (v.m_floats[2] - this.m_floats[2]) * t
        );
    }

    /**
     * Elementwise multiply this vector by another
     */
    multiplyElementwise(v: b3Vector3): b3Vector3 {
        this.m_floats[0] *= v.m_floats[0];
        this.m_floats[1] *= v.m_floats[1];
        this.m_floats[2] *= v.m_floats[2];
        return this;
    }

    // Getters for individual components
    getX(): b3Scalar { return this.m_floats[0]; }
    getY(): b3Scalar { return this.m_floats[1]; }
    getZ(): b3Scalar { return this.m_floats[2]; }
    getW(): b3Scalar { return this.m_floats[3]; }

    // Setters for individual components
    setX(x: b3Scalar): void { this.m_floats[0] = x; }
    setY(y: b3Scalar): void { this.m_floats[1] = y; }
    setZ(z: b3Scalar): void { this.m_floats[2] = z; }
    setW(w: b3Scalar): void { this.m_floats[3] = w; }

    /**
     * Equality comparison
     */
    equals(other: b3Vector3): boolean {
        return (this.m_floats[3] === other.m_floats[3]) &&
               (this.m_floats[2] === other.m_floats[2]) &&
               (this.m_floats[1] === other.m_floats[1]) &&
               (this.m_floats[0] === other.m_floats[0]);
    }

    /**
     * Set each element to the max of the current values and the values of another b3Vector3
     */
    setMax(other: b3Vector3): void {
        b3SetMax({ value: this.m_floats[0] }, other.m_floats[0]);
        b3SetMax({ value: this.m_floats[1] }, other.m_floats[1]);
        b3SetMax({ value: this.m_floats[2] }, other.m_floats[2]);
        b3SetMax({ value: this.m_floats[3] }, other.m_floats[3]);
    }

    /**
     * Set each element to the min of the current values and the values of another b3Vector3
     */
    setMin(other: b3Vector3): void {
        b3SetMin({ value: this.m_floats[0] }, other.m_floats[0]);
        b3SetMin({ value: this.m_floats[1] }, other.m_floats[1]);
        b3SetMin({ value: this.m_floats[2] }, other.m_floats[2]);
        b3SetMin({ value: this.m_floats[3] }, other.m_floats[3]);
    }

    setValue(x: b3Scalar, y: b3Scalar, z: b3Scalar): void {
        this.m_floats[0] = x;
        this.m_floats[1] = y;
        this.m_floats[2] = z;
        this.m_floats[3] = 0.0;
    }

    /**
     * Get skew symmetric matrix
     */
    getSkewSymmetricMatrix(v0: b3Vector3, v1: b3Vector3, v2: b3Vector3): void {
        v0.setValue(0, -this.getZ(), this.getY());
        v1.setValue(this.getZ(), 0, -this.getX());
        v2.setValue(-this.getY(), this.getX(), 0);
    }

    setZero(): void {
        this.setValue(0, 0, 0);
    }

    isZero(): boolean {
        return this.m_floats[0] === 0 && this.m_floats[1] === 0 && this.m_floats[2] === 0;
    }

    fuzzyZero(): boolean {
        return this.length2() < B3_EPSILON;
    }

    /**
     * Serialization functions
     */
    serialize(dataOut: b3Vector3Data): void {
        dataOut.m_floats = [...this.m_floats];
    }

    deSerialize(dataIn: b3Vector3Data): void {
        this.m_floats = [...dataIn.m_floats];
    }

    serializeFloat(dataOut: b3Vector3FloatData): void {
        dataOut.m_floats = this.m_floats.map(f => f);
    }

    deSerializeFloat(dataIn: b3Vector3FloatData): void {
        this.m_floats = [...dataIn.m_floats];
    }

    serializeDouble(dataOut: b3Vector3DoubleData): void {
        dataOut.m_floats = this.m_floats.map(f => f);
    }

    deSerializeDouble(dataIn: b3Vector3DoubleData): void {
        this.m_floats = [...dataIn.m_floats];
    }

    /**
     * Find maximum dot product
     */
    maxDot(array: b3Vector3[], arrayCount: number): { index: number; dot: b3Scalar } {
        let maxDot = -B3_INFINITY;
        let ptIndex = -1;
        
        for (let i = 0; i < arrayCount && i < array.length; i++) {
            const dot = array[i].dot(this);
            if (dot > maxDot) {
                maxDot = dot;
                ptIndex = i;
            }
        }
        
        b3Assert(ptIndex >= 0);
        if (ptIndex < 0) {
            ptIndex = 0;
        }
        
        return { index: ptIndex, dot: maxDot };
    }

    /**
     * Find minimum dot product
     */
    minDot(array: b3Vector3[], arrayCount: number): { index: number; dot: b3Scalar } {
        let minDot = B3_INFINITY;
        let ptIndex = -1;
        
        for (let i = 0; i < arrayCount && i < array.length; i++) {
            const dot = array[i].dot(this);
            if (dot < minDot) {
                minDot = dot;
                ptIndex = i;
            }
        }
        
        return { index: ptIndex, dot: minDot };
    }

    /**
     * Create a vector as b3Vector3(this.dot(v0), this.dot(v1), this.dot(v2))
     */
    dot3(v0: b3Vector3, v1: b3Vector3, v2: b3Vector3): b3Vector3 {
        return new b3Vector3(this.dot(v0), this.dot(v1), this.dot(v2));
    }

    // Helper methods for creating copies and operations
    add(v: b3Vector3): b3Vector3 {
        return new b3Vector3(
            this.m_floats[0] + v.m_floats[0],
            this.m_floats[1] + v.m_floats[1],
            this.m_floats[2] + v.m_floats[2]
        );
    }

    subtract(v: b3Vector3): b3Vector3 {
        return new b3Vector3(
            this.m_floats[0] - v.m_floats[0],
            this.m_floats[1] - v.m_floats[1],
            this.m_floats[2] - v.m_floats[2]
        );
    }

    scale(s: b3Scalar): b3Vector3 {
        return new b3Vector3(this.m_floats[0] * s, this.m_floats[1] * s, this.m_floats[2] * s);
    }

    divide(s: b3Scalar): b3Vector3 {
        b3Assert(s !== 0.0);
        return this.scale(1.0 / s);
    }

    negate(): b3Vector3 {
        return new b3Vector3(-this.m_floats[0], -this.m_floats[1], -this.m_floats[2]);
    }

    clone(): b3Vector3 {
        return new b3Vector3(this.m_floats[0], this.m_floats[1], this.m_floats[2], this.m_floats[3]);
    }

    toArray(): b3Scalar[] {
        return [...this.m_floats];
    }
}

/**
 * b3Vector4 extends b3Vector3 with 4D operations
 */
export class b3Vector4 extends b3Vector3 {
    absolute4(): b3Vector4 {
        const result = new b3Vector4();
        result.setValue4(
            b3Fabs(this.getX()),
            b3Fabs(this.getY()),
            b3Fabs(this.getZ()),
            b3Fabs(this.getW())
        );
        return result;
    }

    maxAxis4(): number {
        let maxIndex = -1;
        let maxVal = -Infinity;
        
        for (let i = 0; i < 4; i++) {
            if (this.get(i) > maxVal) {
                maxIndex = i;
                maxVal = this.get(i);
            }
        }
        
        return maxIndex;
    }

    minAxis4(): number {
        let minIndex = -1;
        let minVal = Infinity;
        
        for (let i = 0; i < 4; i++) {
            if (this.get(i) < minVal) {
                minIndex = i;
                minVal = this.get(i);
            }
        }
        
        return minIndex;
    }

    closestAxis4(): number {
        return this.absolute4().maxAxis4();
    }

    setValue4(x: b3Scalar, y: b3Scalar, z: b3Scalar, w: b3Scalar): void {
        this.setX(x);
        this.setY(y);
        this.setZ(z);
        this.setW(w);
    }
}

// Factory functions
export function b3MakeVector3(x: b3Scalar, y: b3Scalar, z: b3Scalar, w: b3Scalar = 0): b3Vector3 {
    return new b3Vector3(x, y, z, w);
}

export function b3MakeVector4(x: b3Scalar, y: b3Scalar, z: b3Scalar, w: b3Scalar): b3Vector4 {
    const v = new b3Vector4();
    v.setValue4(x, y, z, w);
    return v;
}

// Global utility functions
export function b3Dot(v1: b3Vector3, v2: b3Vector3): b3Scalar {
    return v1.dot(v2);
}

export function b3Distance2(v1: b3Vector3, v2: b3Vector3): b3Scalar {
    return v1.distance2(v2);
}

export function b3Distance(v1: b3Vector3, v2: b3Vector3): b3Scalar {
    return v1.distance(v2);
}

export function b3Angle(v1: b3Vector3, v2: b3Vector3): b3Scalar {
    return v1.angle(v2);
}

export function b3Cross(v1: b3Vector3, v2: b3Vector3): b3Vector3 {
    return v1.cross(v2);
}

export function b3Triple(v1: b3Vector3, v2: b3Vector3, v3: b3Vector3): b3Scalar {
    return v1.triple(v2, v3);
}

export function b3Lerp(v1: b3Vector3, v2: b3Vector3, t: b3Scalar): b3Vector3 {
    return v1.lerp(v2, t);
}

/**
 * Plane space generation
 */
export function b3PlaneSpace1<T extends b3Vector3>(n: T, p: T, q: T): void {
    if (b3Fabs(n.get(2)) > B3_SQRT12) {
        // choose p in y-z plane
        const a = n.get(1) * n.get(1) + n.get(2) * n.get(2);
        const k = 1.0 / b3Sqrt(a);
        p.setValue(0, -n.get(2) * k, n.get(1) * k);
        // set q = n x p
        q.setValue(a * k, -n.get(0) * p.get(2), n.get(0) * p.get(1));
    } else {
        // choose p in x-y plane
        const a = n.get(0) * n.get(0) + n.get(1) * n.get(1);
        const k = 1.0 / b3Sqrt(a);
        p.setValue(-n.get(1) * k, n.get(0) * k, 0);
        // set q = n x p
        q.setValue(-n.get(2) * p.get(1), n.get(2) * p.get(0), a * k);
    }
}