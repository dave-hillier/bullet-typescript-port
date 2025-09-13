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
import { btQuadWord } from './btQuadWord';
import { btSqrt, btCos, btSin, btAcos, btFabs, btAssert, SIMD_EPSILON, SIMD_INFINITY } from './btScalar';
import { btMax, btMin } from './btMinMax';
/**
 * btVector3 can be used to represent 3D points and vectors.
 * It has an unused w component to suit 16-byte alignment when btVector3 is stored in containers.
 * This extra component can be used by derived classes (Quaternion?) or by user
 *
 * TypeScript port removes SIMD optimizations and uses scalar implementations.
 */
export class btVector3 extends btQuadWord {
    constructor(x, y, z) {
        if (x instanceof btVector3) {
            // Copy constructor
            super(x.getX(), x.getY(), x.getZ(), x.getW());
        }
        else if (x !== undefined && y !== undefined && z !== undefined) {
            // Three parameter constructor
            super(x, y, z, 0.0);
        }
        else {
            // No initialization constructor
            super();
        }
    }
    // ========== Arithmetic Operations ==========
    /**
     * Add a vector to this one
     * @param v The vector to add to this one
     * @returns Reference to this vector
     */
    addAssign(v) {
        this.m_floats[0] += v.m_floats[0];
        this.m_floats[1] += v.m_floats[1];
        this.m_floats[2] += v.m_floats[2];
        return this;
    }
    /**
     * Subtract a vector from this one
     * @param v The vector to subtract
     * @returns Reference to this vector
     */
    subtractAssign(v) {
        this.m_floats[0] -= v.m_floats[0];
        this.m_floats[1] -= v.m_floats[1];
        this.m_floats[2] -= v.m_floats[2];
        return this;
    }
    /**
     * Scale the vector
     * @param s Scale factor
     * @returns Reference to this vector
     */
    multiplyAssign(s) {
        this.m_floats[0] *= s;
        this.m_floats[1] *= s;
        this.m_floats[2] *= s;
        return this;
    }
    /**
     * Elementwise multiply this vector by another vector
     * @param v The other vector
     * @returns Reference to this vector
     */
    multiplyAssignVector(v) {
        this.m_floats[0] *= v.m_floats[0];
        this.m_floats[1] *= v.m_floats[1];
        this.m_floats[2] *= v.m_floats[2];
        return this;
    }
    /**
     * Inversely scale the vector
     * @param s Scale factor to divide by
     * @returns Reference to this vector
     */
    divideAssign(s) {
        btAssert(s !== 0.0, "Division by zero");
        return this.multiplyAssign(1.0 / s);
    }
    /**
     * Add two vectors
     * @param v The vector to add
     * @returns New vector containing the sum
     */
    add(v) {
        return new btVector3(this.m_floats[0] + v.m_floats[0], this.m_floats[1] + v.m_floats[1], this.m_floats[2] + v.m_floats[2]);
    }
    /**
     * Subtract a vector from this one
     * @param v The vector to subtract
     * @returns New vector containing the difference
     */
    subtract(v) {
        return new btVector3(this.m_floats[0] - v.m_floats[0], this.m_floats[1] - v.m_floats[1], this.m_floats[2] - v.m_floats[2]);
    }
    /**
     * Scale the vector
     * @param s Scale factor
     * @returns New scaled vector
     */
    multiply(s) {
        return new btVector3(this.m_floats[0] * s, this.m_floats[1] * s, this.m_floats[2] * s);
    }
    /**
     * Elementwise multiply by another vector
     * @param v The other vector
     * @returns New vector containing elementwise product
     */
    multiplyVector(v) {
        return new btVector3(this.m_floats[0] * v.m_floats[0], this.m_floats[1] * v.m_floats[1], this.m_floats[2] * v.m_floats[2]);
    }
    /**
     * Divide by a scalar
     * @param s Divisor
     * @returns New vector divided by scalar
     */
    divide(s) {
        btAssert(s !== 0.0, "Division by zero");
        return this.multiply(1.0 / s);
    }
    /**
     * Negate the vector
     * @returns New negated vector
     */
    negate() {
        return new btVector3(-this.m_floats[0], -this.m_floats[1], -this.m_floats[2]);
    }
    // ========== Vector Operations ==========
    /**
     * Return the dot product
     * @param v The other vector in the dot product
     * @returns Dot product result
     */
    dot(v) {
        return this.m_floats[0] * v.m_floats[0] +
            this.m_floats[1] * v.m_floats[1] +
            this.m_floats[2] * v.m_floats[2];
    }
    /**
     * Return the length of the vector squared
     * @returns Length squared
     */
    length2() {
        return this.dot(this);
    }
    /**
     * Return the length of the vector
     * @returns Vector length
     */
    length() {
        return btSqrt(this.length2());
    }
    /**
     * Return the norm (length) of the vector
     * @returns Vector norm
     */
    norm() {
        return this.length();
    }
    /**
     * Return the norm (length) of the vector, handling very small vectors safely
     * @returns Safe vector norm
     */
    safeNorm() {
        const d = this.length2();
        // Workaround for some clang/gcc issue of sqrtf(tiny number) = -INF
        if (d > SIMD_EPSILON) {
            return btSqrt(d);
        }
        return 0.0;
    }
    /**
     * Return the distance squared between the ends of this and another vector
     * This is semantically treating the vector like a point
     * @param v The other vector
     * @returns Distance squared
     */
    distance2(v) {
        return v.subtract(this).length2();
    }
    /**
     * Return the distance between the ends of this and another vector
     * This is semantically treating the vector like a point
     * @param v The other vector
     * @returns Distance
     */
    distance(v) {
        return v.subtract(this).length();
    }
    /**
     * Safely normalize this vector
     * @returns Reference to this vector
     */
    safeNormalize() {
        const l2 = this.length2();
        // triNormal.normalize();
        if (l2 >= SIMD_EPSILON * SIMD_EPSILON) {
            this.divideAssign(btSqrt(l2));
        }
        else {
            this.setValue(1, 0, 0);
        }
        return this;
    }
    /**
     * Normalize this vector
     * x^2 + y^2 + z^2 = 1
     * @returns Reference to this vector
     */
    normalize() {
        btAssert(!this.fuzzyZero(), "Cannot normalize zero vector");
        return this.divideAssign(this.length());
    }
    /**
     * Return a normalized version of this vector
     * @returns New normalized vector
     */
    normalized() {
        const nrm = this.clone();
        return nrm.normalize();
    }
    /**
     * Return the cross product between this and another vector
     * @param v The other vector
     * @returns Cross product result
     */
    cross(v) {
        return new btVector3(this.m_floats[1] * v.m_floats[2] - this.m_floats[2] * v.m_floats[1], this.m_floats[2] * v.m_floats[0] - this.m_floats[0] * v.m_floats[2], this.m_floats[0] * v.m_floats[1] - this.m_floats[1] * v.m_floats[0]);
    }
    /**
     * Return the scalar triple product of three vectors: this · (v1 × v2)
     * @param v1 First vector of the cross product
     * @param v2 Second vector of the cross product
     * @returns Scalar triple product
     */
    triple(v1, v2) {
        return this.m_floats[0] * (v1.m_floats[1] * v2.m_floats[2] - v1.m_floats[2] * v2.m_floats[1]) +
            this.m_floats[1] * (v1.m_floats[2] * v2.m_floats[0] - v1.m_floats[0] * v2.m_floats[2]) +
            this.m_floats[2] * (v1.m_floats[0] * v2.m_floats[1] - v1.m_floats[1] * v2.m_floats[0]);
    }
    // ========== Utility Methods ==========
    /**
     * Return the angle between this and another vector
     * @param v The other vector
     * @returns Angle in radians
     */
    angle(v) {
        const s = btSqrt(this.length2() * v.length2());
        btAssert(s !== 0.0, "Cannot compute angle with zero-length vector");
        return btAcos(this.dot(v) / s);
    }
    /**
     * Return a vector with the absolute values of each element
     * @returns New vector with absolute values
     */
    absolute() {
        return new btVector3(btFabs(this.m_floats[0]), btFabs(this.m_floats[1]), btFabs(this.m_floats[2]));
    }
    /**
     * Return the axis with the smallest value
     * Note: return values are 0,1,2 for x, y, or z
     * @returns Index of minimum axis
     */
    minAxis() {
        return this.m_floats[0] < this.m_floats[1] ?
            (this.m_floats[0] < this.m_floats[2] ? 0 : 2) :
            (this.m_floats[1] < this.m_floats[2] ? 1 : 2);
    }
    /**
     * Return the axis with the largest value
     * Note: return values are 0,1,2 for x, y, or z
     * @returns Index of maximum axis
     */
    maxAxis() {
        return this.m_floats[0] < this.m_floats[1] ?
            (this.m_floats[1] < this.m_floats[2] ? 2 : 1) :
            (this.m_floats[0] < this.m_floats[2] ? 2 : 0);
    }
    /**
     * Return the axis with the smallest absolute value
     * @returns Index of furthest axis (smallest absolute value)
     */
    furthestAxis() {
        return this.absolute().minAxis();
    }
    /**
     * Return the axis with the largest absolute value
     * @returns Index of closest axis (largest absolute value)
     */
    closestAxis() {
        return this.absolute().maxAxis();
    }
    /**
     * Set this vector to the interpolation between two other vectors
     * @param v0 First vector
     * @param v1 Second vector
     * @param rt Interpolation parameter (0 = v0, 1 = v1)
     */
    setInterpolate3(v0, v1, rt) {
        const s = 1.0 - rt;
        this.m_floats[0] = s * v0.m_floats[0] + rt * v1.m_floats[0];
        this.m_floats[1] = s * v0.m_floats[1] + rt * v1.m_floats[1];
        this.m_floats[2] = s * v0.m_floats[2] + rt * v1.m_floats[2];
        // Don't do the unused w component
        // this.m_floats[3] = s * v0.m_floats[3] + rt * v1.m_floats[3];
    }
    /**
     * Return the linear interpolation between this and another vector
     * @param v The other vector
     * @param t The ratio of this to v (t = 0 => return this, t=1 => return other)
     * @returns Interpolated vector
     */
    lerp(v, t) {
        return new btVector3(this.m_floats[0] + (v.m_floats[0] - this.m_floats[0]) * t, this.m_floats[1] + (v.m_floats[1] - this.m_floats[1]) * t, this.m_floats[2] + (v.m_floats[2] - this.m_floats[2]) * t);
    }
    /**
     * Return a rotated version of this vector
     * @param wAxis The axis to rotate about (must be unit length)
     * @param angle The angle to rotate by
     * @returns Rotated vector
     */
    rotate(wAxis, angle) {
        // wAxis must be a unit length vector
        const o = wAxis.multiply(wAxis.dot(this));
        const x = this.subtract(o);
        const y = wAxis.cross(this);
        return o.add(x.multiply(btCos(angle))).add(y.multiply(btSin(angle)));
    }
    /**
     * Set each element to the max of the current values and the values of another btVector3
     * @param other The other btVector3 to compare with
     */
    setMax(other) {
        this.m_floats[0] = btMax(this.m_floats[0], other.m_floats[0]);
        this.m_floats[1] = btMax(this.m_floats[1], other.m_floats[1]);
        this.m_floats[2] = btMax(this.m_floats[2], other.m_floats[2]);
        this.m_floats[3] = btMax(this.m_floats[3], other.w());
    }
    /**
     * Set each element to the min of the current values and the values of another btVector3
     * @param other The other btVector3 to compare with
     */
    setMin(other) {
        this.m_floats[0] = btMin(this.m_floats[0], other.m_floats[0]);
        this.m_floats[1] = btMin(this.m_floats[1], other.m_floats[1]);
        this.m_floats[2] = btMin(this.m_floats[2], other.m_floats[2]);
        this.m_floats[3] = btMin(this.m_floats[3], other.w());
    }
    /**
     * Set the vector to zero
     */
    setZero() {
        this.setValue(0.0, 0.0, 0.0);
    }
    /**
     * Test if the vector is zero
     * @returns True if all components are exactly zero
     */
    isZero() {
        return this.m_floats[0] === 0.0 && this.m_floats[1] === 0.0 && this.m_floats[2] === 0.0;
    }
    /**
     * Test if the vector is approximately zero
     * @returns True if the length squared is very small
     */
    fuzzyZero() {
        return this.length2() < SIMD_EPSILON * SIMD_EPSILON;
    }
    /**
     * Create skew symmetric matrix from this vector
     * Returns three vectors representing the skew symmetric matrix
     * @param v0 Output first row of skew symmetric matrix
     * @param v1 Output second row of skew symmetric matrix
     * @param v2 Output third row of skew symmetric matrix
     */
    getSkewSymmetricMatrix(v0, v1, v2) {
        v0.setValue(0.0, -this.z(), this.y());
        v1.setValue(this.z(), 0.0, -this.x());
        v2.setValue(-this.y(), this.x(), 0.0);
    }
    /**
     * Returns index of maximum dot product between this and vectors in array
     * @param array The other vectors
     * @param dotOut Output parameter for the maximum dot product
     * @returns Index of the vector with maximum dot product
     */
    maxDot(array, dotOut) {
        let maxDot1 = -SIMD_INFINITY;
        let ptIndex = -1;
        for (let i = 0; i < array.length; i++) {
            const dot = array[i].dot(this);
            if (dot > maxDot1) {
                maxDot1 = dot;
                ptIndex = i;
            }
        }
        dotOut.value = maxDot1;
        return ptIndex;
    }
    /**
     * Returns index of minimum dot product between this and vectors in array
     * @param array The other vectors
     * @param dotOut Output parameter for the minimum dot product
     * @returns Index of the vector with minimum dot product
     */
    minDot(array, dotOut) {
        let minDot1 = SIMD_INFINITY;
        let ptIndex = -1;
        for (let i = 0; i < array.length; i++) {
            const dot = array[i].dot(this);
            if (dot < minDot1) {
                minDot1 = dot;
                ptIndex = i;
            }
        }
        dotOut.value = minDot1;
        return ptIndex;
    }
    /**
     * Create a vector as btVector3(this.dot(v0), this.dot(v1), this.dot(v2))
     * @param v0 First vector
     * @param v1 Second vector
     * @param v2 Third vector
     * @returns Vector containing dot products
     */
    dot3(v0, v1, v2) {
        return new btVector3(this.dot(v0), this.dot(v1), this.dot(v2));
    }
    // ========== btQuadWord Overrides ==========
    /**
     * Create a copy of this btVector3
     * @returns A new btVector3 with the same values
     */
    clone() {
        return new btVector3(this.m_floats[0], this.m_floats[1], this.m_floats[2]);
    }
    /**
     * Copy values from another btVector3
     * @param other The btVector3 to copy from
     */
    copy(other) {
        this.m_floats[0] = other.m_floats[0];
        this.m_floats[1] = other.m_floats[1];
        this.m_floats[2] = other.m_floats[2];
        this.m_floats[3] = other.m_floats[3];
    }
    // ========== Static Methods ==========
    /**
     * Add two vectors (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Sum of the two vectors
     */
    static add(v1, v2) {
        return v1.add(v2);
    }
    /**
     * Subtract two vectors (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Difference of the two vectors
     */
    static subtract(v1, v2) {
        return v1.subtract(v2);
    }
    static multiply(arg1, arg2) {
        if (typeof arg1 === 'number' && arg2 instanceof btVector3) {
            return arg2.multiply(arg1);
        }
        else if (arg1 instanceof btVector3 && typeof arg2 === 'number') {
            return arg1.multiply(arg2);
        }
        else if (arg1 instanceof btVector3 && arg2 instanceof btVector3) {
            return arg1.multiplyVector(arg2);
        }
        else {
            throw new Error("Invalid arguments for btVector3.multiply");
        }
    }
    static divide(v1, arg2) {
        if (typeof arg2 === 'number') {
            return v1.divide(arg2);
        }
        else {
            return new btVector3(v1.m_floats[0] / arg2.m_floats[0], v1.m_floats[1] / arg2.m_floats[1], v1.m_floats[2] / arg2.m_floats[2]);
        }
    }
    /**
     * Negate vector (static version)
     * @param v Vector to negate
     * @returns Negated vector
     */
    static negate(v) {
        return v.negate();
    }
    /**
     * Dot product (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Dot product
     */
    static dot(v1, v2) {
        return v1.dot(v2);
    }
    /**
     * Distance squared (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Distance squared
     */
    static distance2(v1, v2) {
        return v1.distance2(v2);
    }
    /**
     * Distance (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Distance
     */
    static distance(v1, v2) {
        return v1.distance(v2);
    }
    /**
     * Angle (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Angle between vectors
     */
    static angle(v1, v2) {
        return v1.angle(v2);
    }
    /**
     * Cross product (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Cross product
     */
    static cross(v1, v2) {
        return v1.cross(v2);
    }
    /**
     * Scalar triple product (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @param v3 Third vector
     * @returns Scalar triple product v1 · (v2 × v3)
     */
    static triple(v1, v2, v3) {
        return v1.triple(v2, v3);
    }
    /**
     * Linear interpolation (static version)
     * @param v1 First vector
     * @param v2 Second vector
     * @param t Interpolation parameter
     * @returns Interpolated vector
     */
    static lerp(v1, v2, t) {
        return v1.lerp(v2, t);
    }
}
// ========== Global Helper Functions ==========
/**
 * Return the dot product between two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Dot product
 */
export function btDot(v1, v2) {
    return v1.dot(v2);
}
/**
 * Return the distance squared between two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Distance squared
 */
export function btDistance2(v1, v2) {
    return v1.distance2(v2);
}
/**
 * Return the distance between two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Distance
 */
export function btDistance(v1, v2) {
    return v1.distance(v2);
}
/**
 * Return the angle between two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Angle in radians
 */
export function btAngle(v1, v2) {
    return v1.angle(v2);
}
/**
 * Return the cross product of two vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @returns Cross product
 */
export function btCross(v1, v2) {
    return v1.cross(v2);
}
/**
 * Return the scalar triple product of three vectors
 * @param v1 First vector
 * @param v2 Second vector
 * @param v3 Third vector
 * @returns Scalar triple product
 */
export function btTriple(v1, v2, v3) {
    return v1.triple(v2, v3);
}
/**
 * Return the linear interpolation between two vectors
 * @param v1 One vector
 * @param v2 The other vector
 * @param t The ratio of this to v (t = 0 => return v1, t=1 => return v2)
 * @returns Interpolated vector
 */
export function lerp(v1, v2, t) {
    return v1.lerp(v2, t);
}
/**
 * Template function btPlaneSpace1 - computes two orthogonal vectors to a given normal vector
 * @param n Normal vector (should be unit length)
 * @param p Output first orthogonal vector
 * @param q Output second orthogonal vector
 */
export function btPlaneSpace1(n, p, q) {
    if (btFabs(n.z()) > 0.7071067811865475244008443621048490) { // SIMDSQRT12
        // Choose p in y-z plane
        const a = n.y() * n.y() + n.z() * n.z();
        const k = 1.0 / btSqrt(a);
        p.setValue(0, -n.z() * k, n.y() * k);
        // Set q = n × p
        q.setValue(a * k, -n.x() * p.z(), n.x() * p.y());
    }
    else {
        // Choose p in x-y plane
        const a = n.x() * n.x() + n.y() * n.y();
        const k = 1.0 / btSqrt(a);
        p.setValue(-n.y() * k, n.x() * k, 0);
        // Set q = n × p
        q.setValue(-n.z() * p.y(), n.z() * p.x(), a * k);
    }
}
/**
 * btVector4 extends btVector3 with a fourth component
 * This is kept as a simple extension for compatibility with C++ API
 */
export class btVector4 extends btVector3 {
    constructor(x, y, z, w) {
        if (x instanceof btVector3) {
            super(x);
        }
        else if (x !== undefined && y !== undefined && z !== undefined && w !== undefined) {
            super(x, y, z);
            this.m_floats[3] = w;
        }
        else {
            super();
        }
    }
    /**
     * Return a vector with the absolute values of each element (including w)
     * @returns New vector with absolute values
     */
    absolute4() {
        return new btVector4(btFabs(this.m_floats[0]), btFabs(this.m_floats[1]), btFabs(this.m_floats[2]), btFabs(this.m_floats[3]));
    }
    /**
     * Get the W component
     * @returns W value
     */
    getW() {
        return this.m_floats[3];
    }
    /**
     * Return the axis with the largest value (including w)
     * Note: return values are 0,1,2,3 for x, y, z, or w
     * @returns Index of maximum axis
     */
    maxAxis4() {
        let maxIndex = -1;
        let maxVal = -1e30;
        if (this.m_floats[0] > maxVal) {
            maxIndex = 0;
            maxVal = this.m_floats[0];
        }
        if (this.m_floats[1] > maxVal) {
            maxIndex = 1;
            maxVal = this.m_floats[1];
        }
        if (this.m_floats[2] > maxVal) {
            maxIndex = 2;
            maxVal = this.m_floats[2];
        }
        if (this.m_floats[3] > maxVal) {
            maxIndex = 3;
        }
        return maxIndex;
    }
    /**
     * Return the axis with the smallest value (including w)
     * Note: return values are 0,1,2,3 for x, y, z, or w
     * @returns Index of minimum axis
     */
    minAxis4() {
        let minIndex = -1;
        let minVal = 1e30;
        if (this.m_floats[0] < minVal) {
            minIndex = 0;
            minVal = this.m_floats[0];
        }
        if (this.m_floats[1] < minVal) {
            minIndex = 1;
            minVal = this.m_floats[1];
        }
        if (this.m_floats[2] < minVal) {
            minIndex = 2;
            minVal = this.m_floats[2];
        }
        if (this.m_floats[3] < minVal) {
            minIndex = 3;
        }
        return minIndex;
    }
    /**
     * Return the axis with the largest absolute value (including w)
     * @returns Index of closest axis (largest absolute value)
     */
    closestAxis4() {
        return this.absolute4().maxAxis4();
    }
    /**
     * Set the values
     * @param x Value of x
     * @param y Value of y
     * @param z Value of z
     * @param w Value of w
     */
    setValue(x, y, z, w) {
        this.m_floats[0] = x;
        this.m_floats[1] = y;
        this.m_floats[2] = z;
        this.m_floats[3] = w !== undefined ? w : 0.0;
    }
}
