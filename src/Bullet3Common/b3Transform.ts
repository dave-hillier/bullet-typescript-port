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
 * TypeScript port of Bullet3Common/b3Transform.h
 * Transform representation for the Bullet3 physics engine
 */

import { b3Vector3, b3MakeVector3, b3Vector3FloatData, b3Vector3DoubleData } from './b3Vector3';
import { b3Scalar } from './b3Scalar';

// Forward declarations for types that will be implemented later
export interface b3Matrix3x3FloatData {
    m_el: number[][];
}

export interface b3Matrix3x3DoubleData {
    m_el: number[][];
}

export type b3Matrix3x3Data = b3Matrix3x3FloatData;

export interface b3Quaternion {
    x: b3Scalar;
    y: b3Scalar;
    z: b3Scalar;
    w: b3Scalar;
}

// Placeholder Matrix3x3 class - this will be replaced when we port the full b3Matrix3x3
class b3Matrix3x3 {
    private m_el: b3Scalar[][] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ];

    constructor(
        m00: b3Scalar = 1, m01: b3Scalar = 0, m02: b3Scalar = 0,
        m10: b3Scalar = 0, m11: b3Scalar = 1, m12: b3Scalar = 0,
        m20: b3Scalar = 0, m21: b3Scalar = 0, m22: b3Scalar = 1
    ) {
        this.m_el[0][0] = m00; this.m_el[0][1] = m01; this.m_el[0][2] = m02;
        this.m_el[1][0] = m10; this.m_el[1][1] = m11; this.m_el[1][2] = m12;
        this.m_el[2][0] = m20; this.m_el[2][1] = m21; this.m_el[2][2] = m22;
    }

    static fromQuaternion(_q: b3Quaternion): b3Matrix3x3 {
        // Placeholder - will be properly implemented when we have full quaternion support
        return new b3Matrix3x3();
    }

    get(row: number): b3Vector3 {
        return new b3Vector3(this.m_el[row][0], this.m_el[row][1], this.m_el[row][2]);
    }

    getRow(row: number): b3Vector3 {
        return new b3Vector3(this.m_el[row][0], this.m_el[row][1], this.m_el[row][2]);
    }

    multiply(other: b3Matrix3x3): b3Matrix3x3 {
        const result = new b3Matrix3x3();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                result.m_el[i][j] = 0;
                for (let k = 0; k < 3; k++) {
                    result.m_el[i][j] += this.m_el[i][k] * other.m_el[k][j];
                }
            }
        }
        return result;
    }

    multiplyVector(v: b3Vector3): b3Vector3 {
        return new b3Vector3(
            this.m_el[0][0] * v.x + this.m_el[0][1] * v.y + this.m_el[0][2] * v.z,
            this.m_el[1][0] * v.x + this.m_el[1][1] * v.y + this.m_el[1][2] * v.z,
            this.m_el[2][0] * v.x + this.m_el[2][1] * v.y + this.m_el[2][2] * v.z
        );
    }

    transpose(): b3Matrix3x3 {
        return new b3Matrix3x3(
            this.m_el[0][0], this.m_el[1][0], this.m_el[2][0],
            this.m_el[0][1], this.m_el[1][1], this.m_el[2][1],
            this.m_el[0][2], this.m_el[1][2], this.m_el[2][2]
        );
    }

    setIdentity(): void {
        this.m_el = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];
    }

    setRotation(_q: b3Quaternion): void {
        // Placeholder - will be properly implemented
        this.setIdentity();
    }

    getRotation(q: b3Quaternion): void {
        // Placeholder - will be properly implemented
        q.x = 0; q.y = 0; q.z = 0; q.w = 1;
    }

    setFromOpenGLSubMatrix(m: b3Scalar[]): void {
        this.m_el[0][0] = m[0]; this.m_el[0][1] = m[4]; this.m_el[0][2] = m[8];
        this.m_el[1][0] = m[1]; this.m_el[1][1] = m[5]; this.m_el[1][2] = m[9];
        this.m_el[2][0] = m[2]; this.m_el[2][1] = m[6]; this.m_el[2][2] = m[10];
    }

    getOpenGLSubMatrix(m: b3Scalar[]): void {
        m[0] = this.m_el[0][0]; m[4] = this.m_el[0][1]; m[8] = this.m_el[0][2]; m[12] = 0;
        m[1] = this.m_el[1][0]; m[5] = this.m_el[1][1]; m[9] = this.m_el[1][2]; m[13] = 0;
        m[2] = this.m_el[2][0]; m[6] = this.m_el[2][1]; m[10] = this.m_el[2][2]; m[14] = 0;
        m[3] = 0; m[7] = 0; m[11] = 0; m[15] = 1;
    }

    equals(other: b3Matrix3x3): boolean {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.m_el[i][j] !== other.m_el[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    transposeTimes(other: b3Matrix3x3): b3Matrix3x3 {
        return this.transpose().multiply(other);
    }

    /**
     * Return a matrix with the absolute values of each element
     */
    absolute(): b3Matrix3x3 {
        return new b3Matrix3x3(
            Math.abs(this.m_el[0][0]), Math.abs(this.m_el[0][1]), Math.abs(this.m_el[0][2]),
            Math.abs(this.m_el[1][0]), Math.abs(this.m_el[1][1]), Math.abs(this.m_el[1][2]),
            Math.abs(this.m_el[2][0]), Math.abs(this.m_el[2][1]), Math.abs(this.m_el[2][2])
        );
    }

    static getIdentity(): b3Matrix3x3 {
        return new b3Matrix3x3();
    }

    // Placeholder serialization methods
    serialize(dataOut: b3Matrix3x3Data): void {
        dataOut.m_el = this.m_el.map(row => [...row]);
    }

    serializeFloat(dataOut: b3Matrix3x3FloatData): void {
        dataOut.m_el = this.m_el.map(row => [...row]);
    }

    deSerialize(dataIn: b3Matrix3x3Data): void {
        this.m_el = dataIn.m_el.map(row => [...row]);
    }

    deSerializeFloat(dataIn: b3Matrix3x3FloatData): void {
        this.m_el = dataIn.m_el.map(row => [...row]);
    }

    deSerializeDouble(dataIn: b3Matrix3x3DoubleData): void {
        this.m_el = dataIn.m_el.map(row => [...row]);
    }
}

/**
 * Serialization data structures
 */
export interface b3TransformFloatData {
    m_basis: b3Matrix3x3FloatData;
    m_origin: b3Vector3FloatData;
}

export interface b3TransformDoubleData {
    m_basis: b3Matrix3x3DoubleData;
    m_origin: b3Vector3DoubleData;
}

export type b3TransformData = b3TransformFloatData;

/**
 * The b3Transform class supports rigid transforms with only translation and rotation and no scaling/shear.
 * It can be used in combination with b3Vector3, b3Quaternion and b3Matrix3x3 linear algebra classes.
 */
export class b3Transform {
    private m_basis: b3Matrix3x3;
    private m_origin: b3Vector3;

    /**
     * Default constructor (no initialization)
     */
    constructor();
    
    /**
     * Constructor from quaternion and optional translation vector
     */
    constructor(q: b3Quaternion, c?: b3Vector3);
    
    /**
     * Constructor from matrix and optional translation vector
     */
    constructor(b: b3Matrix3x3, c?: b3Vector3);
    
    /**
     * Copy constructor
     */
    constructor(other: b3Transform);

    constructor(arg1?: b3Quaternion | b3Matrix3x3 | b3Transform, arg2?: b3Vector3) {
        if (arg1 === undefined) {
            // Default constructor
            this.m_basis = new b3Matrix3x3();
            this.m_origin = b3MakeVector3(0, 0, 0);
        } else if (arg1 instanceof b3Transform) {
            // Copy constructor
            this.m_basis = arg1.m_basis;
            this.m_origin = arg1.m_origin.clone();
        } else if ('x' in arg1 && 'y' in arg1 && 'z' in arg1 && 'w' in arg1) {
            // Quaternion constructor
            this.m_basis = b3Matrix3x3.fromQuaternion(arg1 as b3Quaternion);
            this.m_origin = arg2 ? arg2.clone() : b3MakeVector3(0, 0, 0);
        } else {
            // Matrix constructor
            this.m_basis = arg1 as b3Matrix3x3;
            this.m_origin = arg2 ? arg2.clone() : b3MakeVector3(0, 0, 0);
        }
    }

    /**
     * Assignment operator
     */
    assign(other: b3Transform): b3Transform {
        this.m_basis = other.m_basis;
        this.m_origin = other.m_origin.clone();
        return this;
    }

    /**
     * Set the current transform as the value of the product of two transforms
     */
    mult(t1: b3Transform, t2: b3Transform): void {
        this.m_basis = t1.m_basis.multiply(t2.m_basis);
        this.m_origin = t1.transformVector(t2.m_origin);
    }

    /**
     * Return the transform of the vector
     */
    transformVector(x: b3Vector3): b3Vector3 {
        return x.dot3(this.m_basis.getRow(0), this.m_basis.getRow(1), this.m_basis.getRow(2)).add(this.m_origin);
    }

    /**
     * Return the transform of the vector (operator() equivalent)
     */
    apply(x: b3Vector3): b3Vector3 {
        return this.transformVector(x);
    }

    /**
     * Return the transform of the quaternion
     */
    transformQuaternion(_q: b3Quaternion): b3Quaternion {
        const rotation = this.getRotation();
        // Placeholder multiplication - will be properly implemented when we have quaternion math
        return rotation;
    }

    /**
     * Return the basis matrix for the rotation
     */
    getBasis(): b3Matrix3x3 {
        return this.m_basis;
    }

    /**
     * Set the basis matrix
     */
    setBasis(basis: b3Matrix3x3): void {
        this.m_basis = basis;
    }

    /**
     * Return the origin vector translation
     */
    getOrigin(): b3Vector3 {
        return this.m_origin;
    }

    /**
     * Set the origin vector translation
     */
    setOrigin(origin: b3Vector3): void {
        this.m_origin = origin.clone();
    }

    /**
     * Return a quaternion representing the rotation
     */
    getRotation(): b3Quaternion {
        const q: b3Quaternion = { x: 0, y: 0, z: 0, w: 1 };
        this.m_basis.getRotation(q);
        return q;
    }

    /**
     * Set the rotational element by quaternion
     */
    setRotation(q: b3Quaternion): void {
        this.m_basis.setRotation(q);
    }

    /**
     * Set from an OpenGL matrix array
     */
    setFromOpenGLMatrix(m: b3Scalar[]): void {
        this.m_basis.setFromOpenGLSubMatrix(m);
        this.m_origin.setValue(m[12], m[13], m[14]);
    }

    /**
     * Fill an OpenGL matrix array
     */
    getOpenGLMatrix(m: b3Scalar[]): void {
        this.m_basis.getOpenGLSubMatrix(m);
        m[12] = this.m_origin.getX();
        m[13] = this.m_origin.getY();
        m[14] = this.m_origin.getZ();
        m[15] = 1.0;
    }

    /**
     * Inverse transform of a vector
     */
    invXform(inVec: b3Vector3): b3Vector3 {
        const v = inVec.subtract(this.m_origin);
        return this.m_basis.transpose().multiplyVector(v);
    }

    /**
     * Set this transformation to the identity
     */
    setIdentity(): void {
        this.m_basis.setIdentity();
        this.m_origin.setValue(0, 0, 0);
    }

    /**
     * Multiply this Transform by another (this = this * another)
     */
    multiplyAssign(t: b3Transform): b3Transform {
        this.m_origin.addAssign(this.m_basis.multiplyVector(t.m_origin));
        this.m_basis = this.m_basis.multiply(t.m_basis);
        return this;
    }

    /**
     * Return the inverse of this transform
     */
    inverse(): b3Transform {
        const inv = this.m_basis.transpose();
        return new b3Transform(inv, inv.multiplyVector(this.m_origin.negate()));
    }

    /**
     * Return the inverse of this transform times the other transform
     */
    inverseTimes(t: b3Transform): b3Transform {
        const v = t.getOrigin().subtract(this.m_origin);
        return new b3Transform(
            this.m_basis.transposeTimes(t.m_basis),
            this.m_basis.transpose().multiplyVector(v)
        );
    }

    /**
     * Return the product of this transform and the other
     */
    multiply(t: b3Transform): b3Transform {
        return new b3Transform(
            this.m_basis.multiply(t.m_basis),
            this.transformVector(t.m_origin)
        );
    }

    /**
     * Test equality with another transform
     */
    equals(other: b3Transform): boolean {
        return this.m_basis.equals(other.m_basis) && this.m_origin.equals(other.m_origin);
    }

    /**
     * Return an identity transform
     */
    static getIdentity(): b3Transform {
        const identity = new b3Transform();
        identity.setIdentity();
        return identity;
    }

    /**
     * Clone this transform
     */
    clone(): b3Transform {
        return new b3Transform(this);
    }

    /**
     * Serialization functions
     */
    serialize(dataOut: b3TransformData): void {
        this.m_basis.serialize(dataOut.m_basis);
        this.m_origin.serialize(dataOut.m_origin);
    }

    serializeFloat(dataOut: b3TransformFloatData): void {
        this.m_basis.serializeFloat(dataOut.m_basis);
        this.m_origin.serializeFloat(dataOut.m_origin);
    }

    deSerialize(dataIn: b3TransformData): void {
        this.m_basis.deSerialize(dataIn.m_basis);
        this.m_origin.deSerialize(dataIn.m_origin);
    }

    deSerializeFloat(dataIn: b3TransformFloatData): void {
        this.m_basis.deSerializeFloat(dataIn.m_basis);
        this.m_origin.deSerializeFloat(dataIn.m_origin);
    }

    deSerializeDouble(dataIn: b3TransformDoubleData): void {
        this.m_basis.deSerializeDouble(dataIn.m_basis);
        this.m_origin.deSerializeDouble(dataIn.m_origin);
    }
}

/**
 * Global utility functions
 */
export function b3TransformEquals(t1: b3Transform, t2: b3Transform): boolean {
    return t1.equals(t2);
}