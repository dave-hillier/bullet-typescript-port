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

import { btQuadWord } from './btQuadWord';
import { btVector3, btPlaneSpace1 } from './btVector3';
import { 
    btSqrt, 
    btCos, 
    btSin, 
    btAcos,
    btAsin, 
    btAtan2,
    btFabs,
    btAssert,
    SIMD_PI,
    SIMD_EPSILON
} from './btScalar';

/**
 * The btQuaternion implements quaternion to perform linear algebra rotations in combination with btMatrix3x3, btVector3 and btTransform.
 * TypeScript port removes SIMD optimizations and uses scalar implementations only.
 */
export class btQuaternion extends btQuadWord {

    /**
     * No initialization constructor
     */
    constructor();
    /**
     * Constructor from scalars
     * @param x X component
     * @param y Y component  
     * @param z Z component
     * @param w W component
     */
    constructor(x: number, y: number, z: number, w: number);
    /**
     * Axis angle constructor
     * @param axis The axis which the rotation is around
     * @param angle The magnitude of the rotation around the angle (Radians)
     */
    constructor(axis: btVector3, angle: number);
    /**
     * Constructor from Euler angles
     * @param yaw Angle around Y (or Z if BT_EULER_DEFAULT_ZYX defined)
     * @param pitch Angle around X (or Y if BT_EULER_DEFAULT_ZYX defined) 
     * @param roll Angle around Z (or X if BT_EULER_DEFAULT_ZYX defined)
     */
    constructor(yaw: number, pitch: number, roll: number);
    /**
     * Copy constructor
     * @param other Quaternion to copy
     */
    constructor(other: btQuaternion);
    constructor(x?: number | btVector3 | btQuaternion, y?: number, z?: number, w?: number) {
        if (x instanceof btQuaternion) {
            // Copy constructor
            super(x.getX(), x.getY(), x.getZ(), x.getW());
        } else if (x instanceof btVector3 && typeof y === 'number') {
            // Axis-angle constructor
            super();
            this.setRotation(x, y);
        } else if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
            if (typeof w === 'number') {
                // Four scalar constructor
                super(x, y, z, w);
            } else {
                // Euler angles constructor (yaw, pitch, roll)
                super();
                this.setEulerZYX(x, y, z); // Use ZYX as default for TypeScript port
            }
        } else {
            // No initialization constructor
            super();
        }
    }

    // ========== Rotation Setup Methods ==========

    /**
     * Set the rotation using axis angle notation
     * @param axis The axis around which to rotate
     * @param angle The magnitude of the rotation in Radians
     */
    setRotation(axis: btVector3, angle: number): void {
        const d = axis.length();
        btAssert(d !== 0.0, "Axis cannot be zero length");
        const s = btSin(angle * 0.5) / d;
        this.setValue(
            axis.x() * s, 
            axis.y() * s, 
            axis.z() * s,
            btCos(angle * 0.5)
        );
    }

    /**
     * Set the quaternion using Euler angles (YXZ order)
     * @param yaw Angle around Y
     * @param pitch Angle around X  
     * @param roll Angle around Z
     */
    setEuler(yaw: number, pitch: number, roll: number): void {
        const halfYaw = yaw * 0.5;
        const halfPitch = pitch * 0.5;
        const halfRoll = roll * 0.5;
        const cosYaw = btCos(halfYaw);
        const sinYaw = btSin(halfYaw);
        const cosPitch = btCos(halfPitch);
        const sinPitch = btSin(halfPitch);
        const cosRoll = btCos(halfRoll);
        const sinRoll = btSin(halfRoll);
        
        this.setValue(
            cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw,
            cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw,
            sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw,
            cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw
        );
    }

    /**
     * Set the quaternion using euler angles (ZYX order)
     * @param yawZ Angle around Z
     * @param pitchY Angle around Y
     * @param rollX Angle around X
     */
    setEulerZYX(yawZ: number, pitchY: number, rollX: number): void {
        const halfYaw = yawZ * 0.5;
        const halfPitch = pitchY * 0.5;
        const halfRoll = rollX * 0.5;
        const cosYaw = btCos(halfYaw);
        const sinYaw = btSin(halfYaw);
        const cosPitch = btCos(halfPitch);
        const sinPitch = btSin(halfPitch);
        const cosRoll = btCos(halfRoll);
        const sinRoll = btSin(halfRoll);
        
        this.setValue(
            sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw,   // x
            cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw,   // y  
            cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw,   // z
            cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw    // w
        );
    }

    /**
     * Get the euler angles from this quaternion (ZYX order)
     * @param yawZ Output angle around Z
     * @param pitchY Output angle around Y
     * @param rollX Output angle around X
     */
    getEulerZYX(yawZ: { value: number }, pitchY: { value: number }, rollX: { value: number }): void {
        const sqx = this.m_floats[0] * this.m_floats[0];
        const sqy = this.m_floats[1] * this.m_floats[1];
        const sqz = this.m_floats[2] * this.m_floats[2];
        const squ = this.m_floats[3] * this.m_floats[3];
        const sarg = -2.0 * (this.m_floats[0] * this.m_floats[2] - this.m_floats[3] * this.m_floats[1]);

        // If the pitch angle is PI/2 or -PI/2, we can only compute
        // the sum roll + yaw. However, any combination that gives
        // the right sum will produce the correct orientation, so we
        // set rollX = 0 and compute yawZ.
        if (sarg <= -0.99999) {
            pitchY.value = -0.5 * SIMD_PI;
            rollX.value = 0;
            yawZ.value = 2 * btAtan2(this.m_floats[0], -this.m_floats[1]);
        } else if (sarg >= 0.99999) {
            pitchY.value = 0.5 * SIMD_PI;
            rollX.value = 0;
            yawZ.value = 2 * btAtan2(-this.m_floats[0], this.m_floats[1]);
        } else {
            pitchY.value = btAsin(sarg);
            rollX.value = btAtan2(2 * (this.m_floats[1] * this.m_floats[2] + this.m_floats[3] * this.m_floats[0]), squ - sqx - sqy + sqz);
            yawZ.value = btAtan2(2 * (this.m_floats[0] * this.m_floats[1] + this.m_floats[3] * this.m_floats[2]), squ + sqx - sqy - sqz);
        }
    }

    // ========== Arithmetic Operations ==========

    /**
     * Add a quaternion to this one
     * @param q The quaternion to add to this one
     * @returns Reference to this quaternion
     */
    addAssign(q: btQuaternion): btQuaternion {
        this.m_floats[0] += q.x();
        this.m_floats[1] += q.y();
        this.m_floats[2] += q.z();
        this.m_floats[3] += q.m_floats[3];
        return this;
    }

    /**
     * Subtract out a quaternion
     * @param q The quaternion to subtract from this one
     * @returns Reference to this quaternion
     */
    subtractAssign(q: btQuaternion): btQuaternion {
        this.m_floats[0] -= q.x();
        this.m_floats[1] -= q.y();
        this.m_floats[2] -= q.z();
        this.m_floats[3] -= q.m_floats[3];
        return this;
    }

    /**
     * Scale this quaternion
     * @param s The scalar to scale by
     * @returns Reference to this quaternion
     */
    multiplyAssign(s: number): btQuaternion {
        this.m_floats[0] *= s;
        this.m_floats[1] *= s;
        this.m_floats[2] *= s;
        this.m_floats[3] *= s;
        return this;
    }

    /**
     * Multiply this quaternion by q on the right
     * @param q The other quaternion
     * @returns Reference to this quaternion (this = this * q)
     */
    multiplyAssignQuaternion(q: btQuaternion): btQuaternion {
        this.setValue(
            this.m_floats[3] * q.x() + this.m_floats[0] * q.m_floats[3] + this.m_floats[1] * q.z() - this.m_floats[2] * q.y(),
            this.m_floats[3] * q.y() + this.m_floats[1] * q.m_floats[3] + this.m_floats[2] * q.x() - this.m_floats[0] * q.z(),
            this.m_floats[3] * q.z() + this.m_floats[2] * q.m_floats[3] + this.m_floats[0] * q.y() - this.m_floats[1] * q.x(),
            this.m_floats[3] * q.m_floats[3] - this.m_floats[0] * q.x() - this.m_floats[1] * q.y() - this.m_floats[2] * q.z()
        );
        return this;
    }

    /**
     * Inversely scale this quaternion
     * @param s The scale factor to divide by
     * @returns Reference to this quaternion
     */
    divideAssign(s: number): btQuaternion {
        btAssert(s !== 0.0, "Division by zero");
        return this.multiplyAssign(1.0 / s);
    }

    /**
     * Add two quaternions
     * @param q The quaternion to add
     * @returns New quaternion containing the sum
     */
    add(q: btQuaternion): btQuaternion {
        const q1 = this;
        return new btQuaternion(
            q1.x() + q.x(), 
            q1.y() + q.y(), 
            q1.z() + q.z(), 
            q1.m_floats[3] + q.m_floats[3]
        );
    }

    /**
     * Subtract a quaternion from this one
     * @param q The quaternion to subtract
     * @returns New quaternion containing the difference
     */
    subtract(q: btQuaternion): btQuaternion {
        const q1 = this;
        return new btQuaternion(
            q1.x() - q.x(), 
            q1.y() - q.y(), 
            q1.z() - q.z(), 
            q1.m_floats[3] - q.m_floats[3]
        );
    }

    /**
     * Return a scaled version of this quaternion
     * @param s The scale factor
     * @returns New scaled quaternion
     */
    multiply(s: number): btQuaternion {
        return new btQuaternion(this.x() * s, this.y() * s, this.z() * s, this.m_floats[3] * s);
    }

    /**
     * Multiply this quaternion by another quaternion
     * @param q The other quaternion
     * @returns New quaternion result (this * q)
     */
    multiplyQuaternion(q: btQuaternion): btQuaternion {
        return new btQuaternion(
            this.m_floats[3] * q.x() + this.m_floats[0] * q.m_floats[3] + this.m_floats[1] * q.z() - this.m_floats[2] * q.y(),
            this.m_floats[3] * q.y() + this.m_floats[1] * q.m_floats[3] + this.m_floats[2] * q.x() - this.m_floats[0] * q.z(),
            this.m_floats[3] * q.z() + this.m_floats[2] * q.m_floats[3] + this.m_floats[0] * q.y() - this.m_floats[1] * q.x(),
            this.m_floats[3] * q.m_floats[3] - this.m_floats[0] * q.x() - this.m_floats[1] * q.y() - this.m_floats[2] * q.z()
        );
    }

    /**
     * Multiply this quaternion by a vector (as pure quaternion)
     * @param w The vector
     * @returns New quaternion result
     */
    multiplyVector(w: btVector3): btQuaternion {
        return new btQuaternion(
            this.w() * w.x() + this.y() * w.z() - this.z() * w.y(),
            this.w() * w.y() + this.z() * w.x() - this.x() * w.z(),
            this.w() * w.z() + this.x() * w.y() - this.y() * w.x(),
            -this.x() * w.x() - this.y() * w.y() - this.z() * w.z()
        );
    }

    /**
     * Return an inversely scaled version of this quaternion
     * @param s The inverse scale factor
     * @returns New quaternion divided by scalar
     */
    divide(s: number): btQuaternion {
        btAssert(s !== 0.0, "Division by zero");
        return this.multiply(1.0 / s);
    }

    /**
     * Return the negative of this quaternion
     * @returns New negated quaternion
     */
    negate(): btQuaternion {
        const q2 = this;
        return new btQuaternion(-q2.x(), -q2.y(), -q2.z(), -q2.m_floats[3]);
    }

    // ========== Quaternion Operations ==========

    /**
     * Return the dot product between this quaternion and another
     * @param q The other quaternion
     * @returns Dot product result
     */
    dot(q: btQuaternion): number {
        return this.m_floats[0] * q.x() +
               this.m_floats[1] * q.y() +
               this.m_floats[2] * q.z() +
               this.m_floats[3] * q.m_floats[3];
    }

    /**
     * Return the length squared of the quaternion
     * @returns Length squared
     */
    length2(): number {
        return this.dot(this);
    }

    /**
     * Return the length of the quaternion
     * @returns Quaternion length
     */
    length(): number {
        return btSqrt(this.length2());
    }

    /**
     * Safely normalize the quaternion
     * @returns Reference to this quaternion
     */
    safeNormalize(): btQuaternion {
        const l2 = this.length2();
        if (l2 > SIMD_EPSILON) {
            this.normalize();
        }
        return this;
    }

    /**
     * Normalize the quaternion
     * Such that x^2 + y^2 + z^2 + w^2 = 1
     * @returns Reference to this quaternion
     */
    normalize(): btQuaternion {
        return this.divideAssign(this.length());
    }

    /**
     * Return a normalized version of this quaternion
     * @returns New normalized quaternion
     */
    normalized(): btQuaternion {
        return this.divide(this.length());
    }

    /**
     * Return the angle between this quaternion and the other
     * @param q The other quaternion
     * @returns Half angle between quaternions
     */
    angle(q: btQuaternion): number {
        const s = btSqrt(this.length2() * q.length2());
        btAssert(s !== 0.0, "Cannot compute angle with zero-length quaternion");
        return btAcos(this.dot(q) / s);
    }

    /**
     * Return the angle between this quaternion and the other along the shortest path
     * @param q The other quaternion
     * @returns Full angle between quaternions along shortest path
     */
    angleShortestPath(q: btQuaternion): number {
        const s = btSqrt(this.length2() * q.length2());
        btAssert(s !== 0.0, "Cannot compute angle with zero-length quaternion");
        if (this.dot(q) < 0) { // Take care of long angle case see http://en.wikipedia.org/wiki/Slerp
            return btAcos(this.dot(q.negate()) / s) * 2.0;
        } else {
            return btAcos(this.dot(q) / s) * 2.0;
        }
    }

    /**
     * Return the angle [0, 2Pi] of rotation represented by this quaternion
     * @returns Rotation angle
     */
    getAngle(): number {
        return 2.0 * btAcos(this.m_floats[3]);
    }

    /**
     * Return the angle [0, Pi] of rotation represented by this quaternion along the shortest path
     * @returns Shortest path rotation angle
     */
    getAngleShortestPath(): number {
        let s: number;
        if (this.m_floats[3] >= 0) {
            s = 2.0 * btAcos(this.m_floats[3]);
        } else {
            s = 2.0 * btAcos(-this.m_floats[3]);
        }
        return s;
    }

    /**
     * Return the axis of the rotation represented by this quaternion
     * @returns Rotation axis (unit vector)
     */
    getAxis(): btVector3 {
        const s_squared = 1.0 - this.m_floats[3] * this.m_floats[3];

        if (s_squared < 10.0 * SIMD_EPSILON) { // Check for divide by zero
            return new btVector3(1.0, 0.0, 0.0); // Arbitrary
        }
        const s = 1.0 / btSqrt(s_squared);
        return new btVector3(this.m_floats[0] * s, this.m_floats[1] * s, this.m_floats[2] * s);
    }

    /**
     * Return the inverse of this quaternion
     * @returns Inverse quaternion
     */
    inverse(): btQuaternion {
        return new btQuaternion(-this.m_floats[0], -this.m_floats[1], -this.m_floats[2], this.m_floats[3]);
    }

    /**
     * Return the farthest quaternion representation (for interpolation)
     * @param qd The destination quaternion
     * @returns Farthest quaternion
     */
    farthest(qd: btQuaternion): btQuaternion {
        const diff = this.subtract(qd);
        const sum = this.add(qd);
        if (diff.dot(diff) > sum.dot(sum)) {
            return qd;
        }
        return qd.negate();
    }

    /**
     * Return the nearest quaternion representation (for interpolation)
     * @param qd The destination quaternion
     * @returns Nearest quaternion
     */
    nearest(qd: btQuaternion): btQuaternion {
        const diff = this.subtract(qd);
        const sum = this.add(qd);
        if (diff.dot(diff) < sum.dot(sum)) {
            return qd;
        }
        return qd.negate();
    }

    /**
     * Return the quaternion which is the result of Spherical Linear Interpolation between this and the other quaternion
     * @param q The other quaternion to interpolate with
     * @param t The ratio between this and q to interpolate. If t = 0 the result is this, if t=1 the result is q.
     * @returns Interpolated quaternion
     */
    slerp(q: btQuaternion, t: number): btQuaternion {
        const magnitude = btSqrt(this.length2() * q.length2());
        btAssert(magnitude > 0, "Cannot slerp with zero-length quaternions");

        const product = this.dot(q) / magnitude;
        const absproduct = btFabs(product);

        if (absproduct < 1.0 - SIMD_EPSILON) {
            // Take care of long angle case see http://en.wikipedia.org/wiki/Slerp
            const theta = btAcos(absproduct);
            const d = btSin(theta);
            btAssert(d > 0, "Division by zero in slerp");

            const sign = (product < 0) ? -1.0 : 1.0;
            const s0 = btSin((1.0 - t) * theta) / d;
            const s1 = btSin(sign * t * theta) / d;

            return new btQuaternion(
                (this.m_floats[0] * s0 + q.x() * s1),
                (this.m_floats[1] * s0 + q.y() * s1),
                (this.m_floats[2] * s0 + q.z() * s1),
                (this.m_floats[3] * s0 + q.w() * s1)
            );
        } else {
            return new btQuaternion(this);
        }
    }

    // ========== btQuadWord Overrides ==========

    /**
     * Get the W component
     * @returns W value
     */
    getW(): number {
        return this.m_floats[3];
    }

    /**
     * Create a copy of this btQuaternion
     * @returns A new btQuaternion with the same values
     */
    clone(): btQuaternion {
        return new btQuaternion(this.m_floats[0], this.m_floats[1], this.m_floats[2], this.m_floats[3]);
    }

    /**
     * Copy values from another btQuaternion
     * @param other The btQuaternion to copy from
     */
    copy(other: btQuaternion): void {
        this.m_floats[0] = other.m_floats[0];
        this.m_floats[1] = other.m_floats[1];
        this.m_floats[2] = other.m_floats[2];
        this.m_floats[3] = other.m_floats[3];
    }

    // ========== Static Methods and Constants ==========

    /**
     * Get the identity quaternion
     * @returns Identity quaternion (0, 0, 0, 1)
     */
    static getIdentity(): btQuaternion {
        return new btQuaternion(0.0, 0.0, 0.0, 1.0);
    }

    /**
     * Add two quaternions (static version)
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @returns Sum of the two quaternions
     */
    static add(q1: btQuaternion, q2: btQuaternion): btQuaternion {
        return q1.add(q2);
    }

    /**
     * Subtract two quaternions (static version)
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @returns Difference of the two quaternions
     */
    static subtract(q1: btQuaternion, q2: btQuaternion): btQuaternion {
        return q1.subtract(q2);
    }

    /**
     * Multiply quaternion by scalar (static version)
     * @param q Quaternion
     * @param s Scalar
     * @returns Scaled quaternion
     */
    static multiply(q: btQuaternion, s: number): btQuaternion;
    static multiply(s: number, q: btQuaternion): btQuaternion;
    static multiply(q1: btQuaternion, q2: btQuaternion): btQuaternion;
    static multiply(q: btQuaternion, v: btVector3): btQuaternion;
    static multiply(v: btVector3, q: btQuaternion): btQuaternion;
    static multiply(arg1: btQuaternion | number | btVector3, arg2: btQuaternion | number | btVector3): btQuaternion {
        if (typeof arg1 === 'number' && arg2 instanceof btQuaternion) {
            return arg2.multiply(arg1);
        } else if (arg1 instanceof btQuaternion && typeof arg2 === 'number') {
            return arg1.multiply(arg2);
        } else if (arg1 instanceof btQuaternion && arg2 instanceof btQuaternion) {
            return arg1.multiplyQuaternion(arg2);
        } else if (arg1 instanceof btQuaternion && arg2 instanceof btVector3) {
            return arg1.multiplyVector(arg2);
        } else if (arg1 instanceof btVector3 && arg2 instanceof btQuaternion) {
            return btQuaternion.multiplyVectorQuaternion(arg1, arg2);
        } else {
            throw new Error("Invalid arguments for btQuaternion.multiply");
        }
    }

    /**
     * Multiply vector by quaternion (static helper)
     * @param w Vector
     * @param q Quaternion
     * @returns Result quaternion
     */
    private static multiplyVectorQuaternion(w: btVector3, q: btQuaternion): btQuaternion {
        return new btQuaternion(
            w.x() * q.w() + w.y() * q.z() - w.z() * q.y(),
            w.y() * q.w() + w.z() * q.x() - w.x() * q.z(),
            w.z() * q.w() + w.x() * q.y() - w.y() * q.x(),
            -w.x() * q.x() - w.y() * q.y() - w.z() * q.z()
        );
    }

    /**
     * Divide quaternion by scalar (static version)
     * @param q Quaternion
     * @param s Scalar
     * @returns Divided quaternion
     */
    static divide(q: btQuaternion, s: number): btQuaternion {
        return q.divide(s);
    }

    /**
     * Negate quaternion (static version)
     * @param q Quaternion to negate
     * @returns Negated quaternion
     */
    static negate(q: btQuaternion): btQuaternion {
        return q.negate();
    }

    /**
     * Dot product (static version)
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @returns Dot product
     */
    static dot(q1: btQuaternion, q2: btQuaternion): number {
        return q1.dot(q2);
    }

    /**
     * Length (static version)
     * @param q Quaternion
     * @returns Quaternion length
     */
    static getLength(q: btQuaternion): number {
        return q.length();
    }

    /**
     * Angle between quaternions (static version)
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @returns Angle between quaternions
     */
    static angle(q1: btQuaternion, q2: btQuaternion): number {
        return q1.angle(q2);
    }

    /**
     * Inverse (static version)
     * @param q Quaternion to invert
     * @returns Inverse quaternion
     */
    static inverse(q: btQuaternion): btQuaternion {
        return q.inverse();
    }

    /**
     * Spherical linear interpolation (static version)
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @param t Interpolation parameter
     * @returns Interpolated quaternion
     */
    static slerp(q1: btQuaternion, q2: btQuaternion, t: number): btQuaternion {
        return q1.slerp(q2, t);
    }
}

// ========== Global Helper Functions ==========

/**
 * Return the product of two quaternions
 * @param q1 First quaternion
 * @param q2 Second quaternion
 * @returns Product quaternion
 */
export function btMultiplyQuaternion(q1: btQuaternion, q2: btQuaternion): btQuaternion {
    return q1.multiplyQuaternion(q2);
}

/**
 * Return the product of a quaternion and a vector
 * @param q Quaternion
 * @param w Vector (treated as pure quaternion)
 * @returns Product quaternion
 */
export function btMultiplyQuaternionVector(q: btQuaternion, w: btVector3): btQuaternion {
    return q.multiplyVector(w);
}

/**
 * Return the product of a vector and a quaternion
 * @param w Vector (treated as pure quaternion)
 * @param q Quaternion
 * @returns Product quaternion
 */
export function btMultiplyVectorQuaternion(w: btVector3, q: btQuaternion): btQuaternion {
    return btQuaternion.multiply(w, q);
}

/**
 * Calculate the dot product between two quaternions
 * @param q1 First quaternion
 * @param q2 Second quaternion
 * @returns Dot product
 */
export function btDot(q1: btQuaternion, q2: btQuaternion): number {
    return q1.dot(q2);
}

/**
 * Return the length of a quaternion
 * @param q Quaternion
 * @returns Length
 */
export function btLength(q: btQuaternion): number {
    return q.length();
}

/**
 * Return the angle between two quaternions
 * @param q1 First quaternion
 * @param q2 Second quaternion
 * @returns Angle between quaternions
 */
export function btAngle(q1: btQuaternion, q2: btQuaternion): number {
    return q1.angle(q2);
}

/**
 * Return the inverse of a quaternion
 * @param q Quaternion to invert
 * @returns Inverse quaternion
 */
export function btInverse(q: btQuaternion): btQuaternion {
    return q.inverse();
}

/**
 * Return the result of spherical linear interpolation between two quaternions
 * @param q1 The first quaternion
 * @param q2 The second quaternion
 * @param t The ratio between q1 and q2. t = 0 return q1, t=1 returns q2
 * @returns Interpolated quaternion
 */
export function btSlerp(q1: btQuaternion, q2: btQuaternion, t: number): btQuaternion {
    return q1.slerp(q2, t);
}

/**
 * Rotate a vector by a quaternion
 * @param rotation The quaternion rotation
 * @param v The vector to rotate
 * @returns Rotated vector
 */
export function btQuatRotate(rotation: btQuaternion, v: btVector3): btVector3 {
    const q = rotation.multiplyVector(v);
    const result = q.multiplyQuaternion(rotation.inverse());
    return new btVector3(result.getX(), result.getY(), result.getZ());
}

/**
 * Return the shortest arc quaternion to rotate vector v0 to v1
 * @param v0 From vector (should be normalized)
 * @param v1 To vector (should be normalized)
 * @returns Shortest arc rotation quaternion
 */
export function btShortestArcQuat(v0: btVector3, v1: btVector3): btQuaternion {
    const c = v0.cross(v1);
    const d = v0.dot(v1);

    if (d < -1.0 + SIMD_EPSILON) {
        // vectors are opposite, pick any orthogonal vector
        const n = new btVector3();
        const unused = new btVector3();
        btPlaneSpace1(v0, n, unused);
        return new btQuaternion(n.x(), n.y(), n.z(), 0.0);
    }

    const s = btSqrt((1.0 + d) * 2.0);
    const rs = 1.0 / s;

    return new btQuaternion(c.getX() * rs, c.getY() * rs, c.getZ() * rs, s * 0.5);
}

/**
 * Return the shortest arc quaternion to rotate vector v0 to v1 (with normalization)
 * @param v0 From vector (will be normalized)
 * @param v1 To vector (will be normalized)
 * @returns Shortest arc rotation quaternion
 */
export function btShortestArcQuatNormalize2(v0: btVector3, v1: btVector3): btQuaternion {
    v0.normalize();
    v1.normalize();
    return btShortestArcQuat(v0, v1);
}