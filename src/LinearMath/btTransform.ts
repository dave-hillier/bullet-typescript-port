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

import { btMatrix3x3, multiplyMatrices, multiplyMatrixVector } from './btMatrix3x3';
import { btVector3 } from './btVector3';
import { btQuaternion } from './btQuaternion';

/**
 * The btTransform class supports rigid transforms with only translation and rotation and no scaling/shear.
 * It can be used in combination with btVector3, btQuaternion and btMatrix3x3 linear algebra classes.
 * 
 * TypeScript port removes SIMD optimizations, memory alignment directives, and uses scalar implementations only.
 */
export class btTransform {
    /** Storage for the rotation */
    private m_basis: btMatrix3x3;
    /** Storage for the translation */
    private m_origin: btVector3;

    /**
     * No initialization constructor
     */
    constructor();
    /**
     * Constructor from btQuaternion (optional btVector3)
     * @param q Rotation from quaternion 
     * @param c Translation from Vector (default 0,0,0)
     */
    constructor(q: btQuaternion, c?: btVector3);
    /**
     * Constructor from btMatrix3x3 (optional btVector3)
     * @param b Rotation from Matrix 
     * @param c Translation from Vector (default 0,0,0)
     */
    constructor(b: btMatrix3x3, c?: btVector3);
    /**
     * Copy constructor
     * @param other Transform to copy from
     */
    constructor(other: btTransform);
    constructor(qOrBOrOther?: btQuaternion | btMatrix3x3 | btTransform, c?: btVector3) {
        if (qOrBOrOther === undefined) {
            // No initialization constructor
            this.m_basis = new btMatrix3x3();
            this.m_origin = new btVector3(0, 0, 0);
        } else if (qOrBOrOther instanceof btQuaternion) {
            // Constructor from quaternion
            this.m_basis = new btMatrix3x3(qOrBOrOther);
            this.m_origin = c ? new btVector3(c.x(), c.y(), c.z()) : new btVector3(0, 0, 0);
        } else if (qOrBOrOther instanceof btMatrix3x3) {
            // Constructor from matrix
            this.m_basis = new btMatrix3x3(qOrBOrOther);
            this.m_origin = c ? new btVector3(c.x(), c.y(), c.z()) : new btVector3(0, 0, 0);
        } else {
            // Copy constructor
            this.m_basis = new btMatrix3x3(qOrBOrOther.m_basis);
            this.m_origin = new btVector3(qOrBOrOther.m_origin.x(), qOrBOrOther.m_origin.y(), qOrBOrOther.m_origin.z());
        }
    }

    /**
     * Assignment - set this transform to be equal to another
     * @param other The other transform
     * @returns This transform for chaining
     */
    assign(other: btTransform): btTransform {
        this.m_basis = new btMatrix3x3(other.m_basis);
        this.m_origin = new btVector3(other.m_origin.x(), other.m_origin.y(), other.m_origin.z());
        return this;
    }

    /**
     * Set the current transform as the value of the product of two transforms
     * @param t1 Transform 1
     * @param t2 Transform 2
     * This = Transform1 * Transform2
     */
    mult(t1: btTransform, t2: btTransform): void {
        this.m_basis = multiplyMatrices(t1.m_basis, t2.m_basis);
        this.m_origin = t1.transformPoint(t2.m_origin);
    }

    /**
     * Return the transform of the vector
     * Equivalent to C++ operator()(const btVector3& x)
     * @param x The vector to transform
     * @returns The transformed vector
     */
    transformPoint(x: btVector3): btVector3 {
        return x.dot3(this.m_basis.getRow(0), this.m_basis.getRow(1), this.m_basis.getRow(2)).add(this.m_origin);
    }

    /**
     * Return the transform of the vector (same as transformPoint)
     * Equivalent to C++ operator*(const btVector3& x)
     * @param x The vector to transform
     * @returns The transformed vector
     */
    multiplyVector(x: btVector3): btVector3 {
        return this.transformPoint(x);
    }

    /**
     * Return the transform of the btQuaternion
     * Equivalent to C++ operator*(const btQuaternion& q)
     * @param q The quaternion to transform
     * @returns The transformed quaternion
     */
    multiplyQuaternion(q: btQuaternion): btQuaternion {
        return this.getRotation().multiplyQuaternion(q);
    }

    /**
     * Return the basis matrix for the rotation
     * @returns Reference to the rotation matrix
     */
    getBasis(): btMatrix3x3 {
        return this.m_basis;
    }

    /**
     * Return the basis matrix for the rotation (const version)
     * @returns The rotation matrix
     */
    getBasisConst(): btMatrix3x3 {
        return new btMatrix3x3(this.m_basis);
    }

    /**
     * Return the origin vector translation
     * @returns Reference to the translation vector
     */
    getOrigin(): btVector3 {
        return this.m_origin;
    }

    /**
     * Return the origin vector translation (const version)
     * @returns The translation vector
     */
    getOriginConst(): btVector3 {
        return new btVector3(this.m_origin.x(), this.m_origin.y(), this.m_origin.z());
    }

    /**
     * Return a quaternion representing the rotation
     * @returns The rotation as a quaternion
     */
    getRotation(): btQuaternion {
        const q = new btQuaternion();
        this.m_basis.getRotation(q);
        return q;
    }

    /**
     * Set from an array 
     * @param m A 16 element array (12 rotation(row major padded on the right by 1), and 3 translation)
     */
    setFromOpenGLMatrix(m: number[]): void {
        this.m_basis.setFromOpenGLSubMatrix(m);
        this.m_origin.setValue(m[12], m[13], m[14]);
    }

    /**
     * Fill an array representation
     * @param m A 16 element array to fill (12 rotation(row major padded on the right by 1), and 3 translation)
     */
    getOpenGLMatrix(m: number[]): void {
        this.m_basis.getOpenGLSubMatrix(m);
        m[12] = this.m_origin.x();
        m[13] = this.m_origin.y();
        m[14] = this.m_origin.z();
        m[15] = 1.0;
    }

    /**
     * Set the translational element
     * @param origin The vector to set the translation to
     */
    setOrigin(origin: btVector3): void {
        this.m_origin.setValue(origin.x(), origin.y(), origin.z());
    }

    /**
     * Inverse transform of a vector
     * @param inVec The vector to inverse transform
     * @returns The inverse transformed vector
     */
    invXform(inVec: btVector3): btVector3 {
        const v = inVec.subtract(this.m_origin);
        return multiplyMatrixVector(this.m_basis.transpose(), v);
    }

    /**
     * Set the rotational element by btMatrix3x3
     * @param basis The rotation matrix to set
     */
    setBasis(basis: btMatrix3x3): void {
        this.m_basis = new btMatrix3x3(basis);
    }

    /**
     * Set the rotational element by btQuaternion
     * @param q The quaternion to set the rotation to
     */
    setRotation(q: btQuaternion): void {
        this.m_basis.setRotation(q);
    }

    /**
     * Set this transformation to the identity
     */
    setIdentity(): void {
        this.m_basis.setIdentity();
        this.m_origin.setValue(0.0, 0.0, 0.0);
    }

    /**
     * Multiply this Transform by another (this = this * another) 
     * Equivalent to C++ operator*=(const btTransform& t)
     * @param t The other transform
     * @returns This transform for chaining
     */
    multiplyAssign(t: btTransform): btTransform {
        this.m_origin.addAssign(multiplyMatrixVector(this.m_basis, t.m_origin));
        this.m_basis.multiplyAssign(t.m_basis);
        return this;
    }

    /**
     * Return the inverse of this transform
     * @returns The inverse transform
     */
    inverse(): btTransform {
        const inv = this.m_basis.transpose();
        return new btTransform(inv, multiplyMatrixVector(inv, this.m_origin.negate()));
    }

    /**
     * Return the inverse of this transform times the other transform
     * @param t The other transform 
     * @returns this.inverse() * the other
     */
    inverseTimes(t: btTransform): btTransform {
        const v = t.getOrigin().subtract(this.m_origin);
        return new btTransform(
            this.m_basis.transposeTimes(t.m_basis),
            multiplyMatrixVector(this.m_basis.transpose(), v)
        );
    }

    /**
     * Return the product of this transform and the other
     * Equivalent to C++ operator*(const btTransform& t)
     * @param t The other transform
     * @returns The product transform
     */
    multiply(t: btTransform): btTransform {
        return new btTransform(
            multiplyMatrices(this.m_basis, t.m_basis),
            this.transformPoint(t.m_origin)
        );
    }

    /**
     * Test if two transforms have all elements equal
     * @param other The other transform to compare with
     * @returns True if transforms are equal
     */
    equals(other: btTransform): boolean {
        return this.m_basis.equals(other.m_basis) && this.m_origin.equals(other.m_origin);
    }

    /**
     * Return an identity transform
     * @returns The identity transform
     */
    static getIdentity(): btTransform {
        return new btTransform(btMatrix3x3.getIdentity(), new btVector3(0, 0, 0));
    }

    /**
     * Create a new transform from a quaternion and optional translation
     * @param q The rotation quaternion
     * @param origin The translation vector (default: zero vector)
     * @returns New transform
     */
    static fromQuaternion(q: btQuaternion, origin?: btVector3): btTransform {
        return new btTransform(q, origin);
    }

    /**
     * Create a new transform from a matrix and optional translation
     * @param basis The rotation matrix
     * @param origin The translation vector (default: zero vector)
     * @returns New transform
     */
    static fromMatrix(basis: btMatrix3x3, origin?: btVector3): btTransform {
        return new btTransform(basis, origin);
    }

    /**
     * Create a transform with only translation (identity rotation)
     * @param origin The translation vector
     * @returns New transform with identity rotation and given translation
     */
    static fromTranslation(origin: btVector3): btTransform {
        return new btTransform(btMatrix3x3.getIdentity(), origin);
    }

    /**
     * Create a transform with only rotation (zero translation)
     * @param q The rotation quaternion
     * @returns New transform with given rotation and zero translation
     */
    static fromRotation(q: btQuaternion): btTransform {
        return new btTransform(q, new btVector3(0, 0, 0));
    }

    /**
     * Create a transform with only rotation (zero translation)
     * @param basis The rotation matrix
     * @returns New transform with given rotation and zero translation
     */
    static fromRotationMatrix(basis: btMatrix3x3): btTransform {
        return new btTransform(basis, new btVector3(0, 0, 0));
    }

    /**
     * Clone this transform
     * @returns A new transform identical to this one
     */
    clone(): btTransform {
        return new btTransform(this);
    }

    /**
     * String representation for debugging
     * @returns String representation of the transform
     */
    toString(): string {
        return `btTransform(basis: ${this.m_basis.toString()}, origin: ${this.m_origin.toString()})`;
    }
}

/**
 * Test if two transforms have all elements equal
 * @param t1 First transform
 * @param t2 Second transform
 * @returns True if transforms are equal
 */
export function btTransformEquals(t1: btTransform, t2: btTransform): boolean {
    return t1.equals(t2);
}