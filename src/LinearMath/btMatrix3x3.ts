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

import { btVector3, btDot, btCross, btTriple } from './btVector3';
import { btQuaternion } from './btQuaternion';
import { 
    btSqrt, 
    btCos, 
    btSin, 
    btAsin,
    btAtan2,
    btFabs,
    btAssert,
    SIMD_PI,
    SIMD_HALF_PI,
    SIMD_EPSILON
} from './btScalar';

/**
 * The btMatrix3x3 class implements a 3x3 rotation matrix, to perform linear algebra 
 * in combination with btQuaternion, btTransform and btVector3.
 * Make sure to only include a pure orthogonal matrix without scaling.
 * 
 * TypeScript port removes SIMD optimizations and uses scalar implementations only.
 */
export class btMatrix3x3 {
    /** Data storage for the matrix, each vector is a row of the matrix */
    private readonly m_el: [btVector3, btVector3, btVector3];

    /**
     * No initialization constructor
     */
    constructor();
    /**
     * Constructor from Quaternion
     * @param q Quaternion to create matrix from
     */
    constructor(q: btQuaternion);
    /**
     * Constructor with row major formatting
     * @param xx Element (0,0)
     * @param xy Element (0,1)
     * @param xz Element (0,2)
     * @param yx Element (1,0)
     * @param yy Element (1,1)
     * @param yz Element (1,2)
     * @param zx Element (2,0)
     * @param zy Element (2,1)
     * @param zz Element (2,2)
     */
    constructor(
        xx: number, xy: number, xz: number,
        yx: number, yy: number, yz: number,
        zx: number, zy: number, zz: number
    );
    /**
     * Constructor from three row vectors
     * @param v0 First row vector
     * @param v1 Second row vector
     * @param v2 Third row vector
     */
    constructor(v0: btVector3, v1: btVector3, v2: btVector3);
    /**
     * Copy constructor
     * @param other Matrix to copy from
     */
    constructor(other: btMatrix3x3);
    constructor(
        arg0?: btQuaternion | btMatrix3x3 | btVector3 | number,
        arg1?: btVector3 | number,
        arg2?: btVector3 | number,
        arg3?: number,
        arg4?: number,
        arg5?: number,
        arg6?: number,
        arg7?: number,
        arg8?: number
    ) {
        this.m_el = [new btVector3(0, 0, 0), new btVector3(0, 0, 0), new btVector3(0, 0, 0)];

        if (arg0 instanceof btQuaternion) {
            // Constructor from quaternion
            this.setRotation(arg0);
        } else if (arg0 instanceof btMatrix3x3) {
            // Copy constructor
            this.m_el[0] = new btVector3(arg0.m_el[0]);
            this.m_el[1] = new btVector3(arg0.m_el[1]);
            this.m_el[2] = new btVector3(arg0.m_el[2]);
        } else if (arg0 instanceof btVector3 && arg1 instanceof btVector3 && arg2 instanceof btVector3) {
            // Constructor from three vectors
            this.m_el[0] = new btVector3(arg0);
            this.m_el[1] = new btVector3(arg1);
            this.m_el[2] = new btVector3(arg2);
        } else if (
            typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number' &&
            typeof arg3 === 'number' && typeof arg4 === 'number' && typeof arg5 === 'number' &&
            typeof arg6 === 'number' && typeof arg7 === 'number' && typeof arg8 === 'number'
        ) {
            // Constructor with 9 scalars
            this.setValue(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
        }
        // Else: default constructor - already initialized with zero vectors
    }

    // ========== Matrix Access Methods ==========

    /**
     * Get a column of the matrix as a vector
     * @param i Column number 0 indexed
     * @returns Column vector
     */
    getColumn(i: number): btVector3 {
        btAssert(0 <= i && i < 3);
        if (i === 0) {
            return new btVector3(this.m_el[0].getX(), this.m_el[1].getX(), this.m_el[2].getX());
        } else if (i === 1) {
            return new btVector3(this.m_el[0].getY(), this.m_el[1].getY(), this.m_el[2].getY());
        } else {
            return new btVector3(this.m_el[0].getZ(), this.m_el[1].getZ(), this.m_el[2].getZ());
        }
    }

    /**
     * Get a row of the matrix as a vector
     * @param i Row number 0 indexed
     * @returns Row vector (const reference)
     */
    getRow(i: number): btVector3 {
        btAssert(0 <= i && i < 3);
        return this.m_el[i];
    }

    /**
     * Get a mutable reference to a row of the matrix as a vector
     * @param i Row number 0 indexed
     * @returns Mutable row vector
     */
    getElement(i: number): btVector3 {
        btAssert(0 <= i && i < 3);
        return this.m_el[i];
    }

    /**
     * Get element at row i, column j
     * @param i Row index
     * @param j Column index
     * @returns Element value
     */
    getValue(i: number, j: number): number {
        btAssert(0 <= i && i < 3);
        btAssert(0 <= j && j < 3);
        if (j === 0) return this.m_el[i].getX();
        if (j === 1) return this.m_el[i].getY();
        return this.m_el[i].getZ();
    }

    /**
     * Set element at row i, column j
     * @param i Row index
     * @param j Column index
     * @param value Value to set
     */
    private setMatrixElement(i: number, j: number, value: number): void {
        btAssert(0 <= i && i < 3);
        btAssert(0 <= j && j < 3);
        if (j === 0) {
            this.m_el[i].setX(value);
        } else if (j === 1) {
            this.m_el[i].setY(value);
        } else {
            this.m_el[i].setZ(value);
        }
    }

    // ========== Matrix Assignment Operations ==========

    /**
     * Multiply by the target matrix on the right
     * @param m Rotation matrix to be applied
     * @returns This matrix (equivalent to this = this * m)
     */
    multiplyAssign(m: btMatrix3x3): btMatrix3x3 {
        this.setValue(
            m.tdotx(this.m_el[0]), m.tdoty(this.m_el[0]), m.tdotz(this.m_el[0]),
            m.tdotx(this.m_el[1]), m.tdoty(this.m_el[1]), m.tdotz(this.m_el[1]),
            m.tdotx(this.m_el[2]), m.tdoty(this.m_el[2]), m.tdotz(this.m_el[2])
        );
        return this;
    }

    /**
     * Add by the target matrix on the right
     * @param m Matrix to be applied
     * @returns This matrix (equivalent to this = this + m)
     */
    addAssign(m: btMatrix3x3): btMatrix3x3 {
        this.setValue(
            this.m_el[0].getX() + m.m_el[0].getX(),
            this.m_el[0].getY() + m.m_el[0].getY(),
            this.m_el[0].getZ() + m.m_el[0].getZ(),
            this.m_el[1].getX() + m.m_el[1].getX(),
            this.m_el[1].getY() + m.m_el[1].getY(),
            this.m_el[1].getZ() + m.m_el[1].getZ(),
            this.m_el[2].getX() + m.m_el[2].getX(),
            this.m_el[2].getY() + m.m_el[2].getY(),
            this.m_el[2].getZ() + m.m_el[2].getZ()
        );
        return this;
    }

    /**
     * Subtract by the target matrix on the right
     * @param m Matrix to be applied
     * @returns This matrix (equivalent to this = this - m)
     */
    subtractAssign(m: btMatrix3x3): btMatrix3x3 {
        this.setValue(
            this.m_el[0].getX() - m.m_el[0].getX(),
            this.m_el[0].getY() - m.m_el[0].getY(),
            this.m_el[0].getZ() - m.m_el[0].getZ(),
            this.m_el[1].getX() - m.m_el[1].getX(),
            this.m_el[1].getY() - m.m_el[1].getY(),
            this.m_el[1].getZ() - m.m_el[1].getZ(),
            this.m_el[2].getX() - m.m_el[2].getX(),
            this.m_el[2].getY() - m.m_el[2].getY(),
            this.m_el[2].getZ() - m.m_el[2].getZ()
        );
        return this;
    }

    // ========== Matrix Setting Methods ==========

    /**
     * Set from the rotational part of a 4x4 OpenGL matrix
     * @param m A pointer to the beginning of the array of scalars
     */
    setFromOpenGLSubMatrix(m: number[]): void {
        this.m_el[0].setValue(m[0], m[4], m[8]);
        this.m_el[1].setValue(m[1], m[5], m[9]);
        this.m_el[2].setValue(m[2], m[6], m[10]);
    }

    /**
     * Set the values of the matrix explicitly (row major)
     * @param xx Top left
     * @param xy Top Middle
     * @param xz Top Right
     * @param yx Middle Left
     * @param yy Middle Middle
     * @param yz Middle Right
     * @param zx Bottom Left
     * @param zy Bottom Middle
     * @param zz Bottom Right
     */
    setValue(
        xx: number, xy: number, xz: number,
        yx: number, yy: number, yz: number,
        zx: number, zy: number, zz: number
    ): void {
        this.m_el[0].setValue(xx, xy, xz);
        this.m_el[1].setValue(yx, yy, yz);
        this.m_el[2].setValue(zx, zy, zz);
    }

    /**
     * Set the matrix from a quaternion
     * @param q The Quaternion to match
     */
    setRotation(q: btQuaternion): void {
        const d = q.length2();
        btAssert(d !== 0.0);
        const s = 2.0 / d;

        const xs = q.getX() * s;
        const ys = q.getY() * s;
        const zs = q.getZ() * s;
        const wx = q.getW() * xs;
        const wy = q.getW() * ys;
        const wz = q.getW() * zs;
        const xx = q.getX() * xs;
        const xy = q.getX() * ys;
        const xz = q.getX() * zs;
        const yy = q.getY() * ys;
        const yz = q.getY() * zs;
        const zz = q.getZ() * zs;

        this.setValue(
            1.0 - (yy + zz), xy - wz, xz + wy,
            xy + wz, 1.0 - (xx + zz), yz - wx,
            xz - wy, yz + wx, 1.0 - (xx + yy)
        );
    }

    /**
     * Set the matrix from euler angles using YPR around YXZ respectively
     * @param yaw Yaw about Y axis
     * @param pitch Pitch about X axis
     * @param roll Roll about Z axis
     */
    setEulerYPR(yaw: number, pitch: number, roll: number): void {
        this.setEulerZYX(roll, pitch, yaw);
    }

    /**
     * Set the matrix from euler angles YPR around ZYX axes
     * @param eulerX Roll about X axis
     * @param eulerY Pitch around Y axis
     * @param eulerZ Yaw about Z axis
     */
    setEulerZYX(eulerX: number, eulerY: number, eulerZ: number): void {
        const ci = btCos(eulerX);
        const cj = btCos(eulerY);
        const ch = btCos(eulerZ);
        const si = btSin(eulerX);
        const sj = btSin(eulerY);
        const sh = btSin(eulerZ);
        const cc = ci * ch;
        const cs = ci * sh;
        const sc = si * ch;
        const ss = si * sh;

        this.setValue(
            cj * ch, sj * sc - cs, sj * cc + ss,
            cj * sh, sj * ss + cc, sj * cs - sc,
            -sj, cj * si, cj * ci
        );
    }

    /**
     * Set the matrix to the identity
     */
    setIdentity(): void {
        this.setValue(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        );
    }

    /**
     * Set the matrix to zero
     */
    setZero(): void {
        this.setValue(
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0
        );
    }

    /**
     * Get the identity matrix
     * @returns Identity matrix
     */
    static getIdentity(): btMatrix3x3 {
        const identityMatrix = new btMatrix3x3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
        );
        return identityMatrix;
    }

    // ========== OpenGL Conversion ==========

    /**
     * Fill the rotational part of an OpenGL matrix and clear the shear/perspective
     * @param m The array to be filled
     */
    getOpenGLSubMatrix(m: number[]): void {
        m[0] = this.m_el[0].getX();
        m[1] = this.m_el[1].getX();
        m[2] = this.m_el[2].getX();
        m[3] = 0.0;
        m[4] = this.m_el[0].getY();
        m[5] = this.m_el[1].getY();
        m[6] = this.m_el[2].getY();
        m[7] = 0.0;
        m[8] = this.m_el[0].getZ();
        m[9] = this.m_el[1].getZ();
        m[10] = this.m_el[2].getZ();
        m[11] = 0.0;
    }

    // ========== Rotation Extraction ==========

    /**
     * Get the matrix represented as a quaternion
     * @param q The quaternion which will be set
     */
    getRotation(q: btQuaternion): void {
        const trace = this.m_el[0].getX() + this.m_el[1].getY() + this.m_el[2].getZ();
        const temp: number[] = [0, 0, 0, 0];

        if (trace > 0.0) {
            const s = btSqrt(trace + 1.0);
            temp[3] = s * 0.5;
            const s_inv = 0.5 / s;

            temp[0] = (this.m_el[2].getY() - this.m_el[1].getZ()) * s_inv;
            temp[1] = (this.m_el[0].getZ() - this.m_el[2].getX()) * s_inv;
            temp[2] = (this.m_el[1].getX() - this.m_el[0].getY()) * s_inv;
        } else {
            const i = this.m_el[0].getX() < this.m_el[1].getY() ? 
                (this.m_el[1].getY() < this.m_el[2].getZ() ? 2 : 1) : 
                (this.m_el[0].getX() < this.m_el[2].getZ() ? 2 : 0);
            const j = (i + 1) % 3;
            const k = (i + 2) % 3;

            const s = btSqrt(this.getValue(i, i) - this.getValue(j, j) - this.getValue(k, k) + 1.0);
            temp[i] = s * 0.5;
            const s_inv = 0.5 / s;

            temp[3] = (this.getValue(k, j) - this.getValue(j, k)) * s_inv;
            temp[j] = (this.getValue(j, i) + this.getValue(i, j)) * s_inv;
            temp[k] = (this.getValue(k, i) + this.getValue(i, k)) * s_inv;
        }
        q.setValue(temp[0], temp[1], temp[2], temp[3]);
    }

    /**
     * Get the matrix represented as euler angles around YXZ, roundtrip with setEulerYPR
     * @param yaw Yaw around Y axis
     * @param pitch Pitch around X axis
     * @param roll around Z axis
     */
    getEulerYPR(): { yaw: number; pitch: number; roll: number } {
        // first use the normal calculus
        let yaw = btAtan2(this.m_el[1].getX(), this.m_el[0].getX());
        let pitch = btAsin(-this.m_el[2].getX());
        let roll = btAtan2(this.m_el[2].getY(), this.m_el[2].getZ());

        // on pitch = +/-HalfPI
        if (btFabs(pitch) === SIMD_HALF_PI) {
            if (yaw > 0) {
                yaw -= SIMD_PI;
            } else {
                yaw += SIMD_PI;
            }

            if (roll > 0) {
                roll -= SIMD_PI;
            } else {
                roll += SIMD_PI;
            }
        }

        return { yaw, pitch, roll };
    }

    /**
     * Get the matrix represented as euler angles around ZYX
     * @param solutionNumber Which solution of two possible solutions (1 or 2)
     * @returns Object with yaw, pitch, roll values
     */
    getEulerZYX(solutionNumber: number = 1): { yaw: number; pitch: number; roll: number } {
        interface Euler {
            yaw: number;
            pitch: number;
            roll: number;
        }

        let eulerOut: Euler = { yaw: 0, pitch: 0, roll: 0 };
        let eulerOut2: Euler = { yaw: 0, pitch: 0, roll: 0 };

        // Check that pitch is not at a singularity
        if (btFabs(this.m_el[2].getX()) >= 1) {
            eulerOut.yaw = 0;
            eulerOut2.yaw = 0;

            // From difference of angles formula
            const delta = btAtan2(this.m_el[0].getX(), this.m_el[0].getZ());
            if (this.m_el[2].getX() > 0) { // gimbal locked up
                eulerOut.pitch = SIMD_PI / 2.0;
                eulerOut2.pitch = SIMD_PI / 2.0;
                eulerOut.roll = eulerOut.pitch + delta;
                eulerOut2.roll = eulerOut.pitch + delta;
            } else { // gimbal locked down
                eulerOut.pitch = -SIMD_PI / 2.0;
                eulerOut2.pitch = -SIMD_PI / 2.0;
                eulerOut.roll = -eulerOut.pitch + delta;
                eulerOut2.roll = -eulerOut.pitch + delta;
            }
        } else {
            eulerOut.pitch = -btAsin(this.m_el[2].getX());
            eulerOut2.pitch = SIMD_PI - eulerOut.pitch;

            eulerOut.roll = btAtan2(
                this.m_el[2].getY() / btCos(eulerOut.pitch),
                this.m_el[2].getZ() / btCos(eulerOut.pitch)
            );
            eulerOut2.roll = btAtan2(
                this.m_el[2].getY() / btCos(eulerOut2.pitch),
                this.m_el[2].getZ() / btCos(eulerOut2.pitch)
            );

            eulerOut.yaw = btAtan2(
                this.m_el[1].getX() / btCos(eulerOut.pitch),
                this.m_el[0].getX() / btCos(eulerOut.pitch)
            );
            eulerOut2.yaw = btAtan2(
                this.m_el[1].getX() / btCos(eulerOut2.pitch),
                this.m_el[0].getX() / btCos(eulerOut2.pitch)
            );
        }

        if (solutionNumber === 1) {
            return eulerOut;
        } else {
            return eulerOut2;
        }
    }

    // ========== Matrix Operations ==========

    /**
     * Create a scaled copy of the matrix
     * @param s Scaling vector. The elements of the vector will scale each column
     * @returns Scaled matrix
     */
    scaled(s: btVector3): btMatrix3x3 {
        return new btMatrix3x3(
            this.m_el[0].getX() * s.getX(), this.m_el[0].getY() * s.getY(), this.m_el[0].getZ() * s.getZ(),
            this.m_el[1].getX() * s.getX(), this.m_el[1].getY() * s.getY(), this.m_el[1].getZ() * s.getZ(),
            this.m_el[2].getX() * s.getX(), this.m_el[2].getY() * s.getY(), this.m_el[2].getZ() * s.getZ()
        );
    }

    /**
     * Return the determinant of the matrix
     */
    determinant(): number {
        return btTriple(this.m_el[0], this.m_el[1], this.m_el[2]);
    }

    /**
     * Return the adjoint of the matrix
     */
    adjoint(): btMatrix3x3 {
        return new btMatrix3x3(
            this.cofac(1, 1, 2, 2), this.cofac(0, 2, 2, 1), this.cofac(0, 1, 1, 2),
            this.cofac(1, 2, 2, 0), this.cofac(0, 0, 2, 2), this.cofac(0, 2, 1, 0),
            this.cofac(1, 0, 2, 1), this.cofac(0, 1, 2, 0), this.cofac(0, 0, 1, 1)
        );
    }

    /**
     * Return the matrix with all values non negative
     */
    absolute(): btMatrix3x3 {
        return new btMatrix3x3(
            btFabs(this.m_el[0].getX()), btFabs(this.m_el[0].getY()), btFabs(this.m_el[0].getZ()),
            btFabs(this.m_el[1].getX()), btFabs(this.m_el[1].getY()), btFabs(this.m_el[1].getZ()),
            btFabs(this.m_el[2].getX()), btFabs(this.m_el[2].getY()), btFabs(this.m_el[2].getZ())
        );
    }

    /**
     * Return the transpose of the matrix
     */
    transpose(): btMatrix3x3 {
        return new btMatrix3x3(
            this.m_el[0].getX(), this.m_el[1].getX(), this.m_el[2].getX(),
            this.m_el[0].getY(), this.m_el[1].getY(), this.m_el[2].getY(),
            this.m_el[0].getZ(), this.m_el[1].getZ(), this.m_el[2].getZ()
        );
    }

    /**
     * Return the inverse of the matrix
     */
    inverse(): btMatrix3x3 {
        const co = new btVector3(
            this.cofac(1, 1, 2, 2), 
            this.cofac(1, 2, 2, 0), 
            this.cofac(1, 0, 2, 1)
        );
        const det = btDot(this.m_el[0], co);
        btAssert(det !== 0.0);
        const s = 1.0 / det;
        return new btMatrix3x3(
            co.getX() * s, this.cofac(0, 2, 2, 1) * s, this.cofac(0, 1, 1, 2) * s,
            co.getY() * s, this.cofac(0, 0, 2, 2) * s, this.cofac(0, 2, 1, 0) * s,
            co.getZ() * s, this.cofac(0, 1, 2, 0) * s, this.cofac(0, 0, 1, 1) * s
        );
    }

    /**
     * Solve A * x = b, where b is a column vector. This is more efficient
     * than computing the inverse in one-shot cases.
     * Solve33 is from Box2d, thanks to Erin Catto
     * @param b Column vector
     * @returns Solution vector
     */
    solve33(b: btVector3): btVector3 {
        const col1 = this.getColumn(0);
        const col2 = this.getColumn(1);
        const col3 = this.getColumn(2);

        let det = btDot(col1, btCross(col2, col3));
        if (btFabs(det) > SIMD_EPSILON) {
            det = 1.0 / det;
        }
        const x = new btVector3(
            det * btDot(b, btCross(col2, col3)),
            det * btDot(col1, btCross(b, col3)),
            det * btDot(col1, btCross(col2, b))
        );
        return x;
    }

    /**
     * Multiply this^T * m
     * @param m Matrix to multiply with
     * @returns Result matrix
     */
    transposeTimes(m: btMatrix3x3): btMatrix3x3 {
        return new btMatrix3x3(
            this.m_el[0].getX() * m.m_el[0].getX() + this.m_el[1].getX() * m.m_el[1].getX() + this.m_el[2].getX() * m.m_el[2].getX(),
            this.m_el[0].getX() * m.m_el[0].getY() + this.m_el[1].getX() * m.m_el[1].getY() + this.m_el[2].getX() * m.m_el[2].getY(),
            this.m_el[0].getX() * m.m_el[0].getZ() + this.m_el[1].getX() * m.m_el[1].getZ() + this.m_el[2].getX() * m.m_el[2].getZ(),
            this.m_el[0].getY() * m.m_el[0].getX() + this.m_el[1].getY() * m.m_el[1].getX() + this.m_el[2].getY() * m.m_el[2].getX(),
            this.m_el[0].getY() * m.m_el[0].getY() + this.m_el[1].getY() * m.m_el[1].getY() + this.m_el[2].getY() * m.m_el[2].getY(),
            this.m_el[0].getY() * m.m_el[0].getZ() + this.m_el[1].getY() * m.m_el[1].getZ() + this.m_el[2].getY() * m.m_el[2].getZ(),
            this.m_el[0].getZ() * m.m_el[0].getX() + this.m_el[1].getZ() * m.m_el[1].getX() + this.m_el[2].getZ() * m.m_el[2].getX(),
            this.m_el[0].getZ() * m.m_el[0].getY() + this.m_el[1].getZ() * m.m_el[1].getY() + this.m_el[2].getZ() * m.m_el[2].getY(),
            this.m_el[0].getZ() * m.m_el[0].getZ() + this.m_el[1].getZ() * m.m_el[1].getZ() + this.m_el[2].getZ() * m.m_el[2].getZ()
        );
    }

    /**
     * Multiply this * m^T
     * @param m Matrix to multiply with (transposed)
     * @returns Result matrix
     */
    timesTranspose(m: btMatrix3x3): btMatrix3x3 {
        return new btMatrix3x3(
            btDot(this.m_el[0], m.m_el[0]), btDot(this.m_el[0], m.m_el[1]), btDot(this.m_el[0], m.m_el[2]),
            btDot(this.m_el[1], m.m_el[0]), btDot(this.m_el[1], m.m_el[1]), btDot(this.m_el[1], m.m_el[2]),
            btDot(this.m_el[2], m.m_el[0]), btDot(this.m_el[2], m.m_el[1]), btDot(this.m_el[2], m.m_el[2])
        );
    }

    // ========== Utility Methods ==========

    /**
     * Transpose dot x - multiply column x of this^T with v
     * @param v Vector to multiply with
     * @returns Scalar result
     */
    tdotx(v: btVector3): number {
        return this.m_el[0].getX() * v.getX() + this.m_el[1].getX() * v.getY() + this.m_el[2].getX() * v.getZ();
    }

    /**
     * Transpose dot y - multiply column y of this^T with v
     * @param v Vector to multiply with
     * @returns Scalar result
     */
    tdoty(v: btVector3): number {
        return this.m_el[0].getY() * v.getX() + this.m_el[1].getY() * v.getY() + this.m_el[2].getY() * v.getZ();
    }

    /**
     * Transpose dot z - multiply column z of this^T with v
     * @param v Vector to multiply with
     * @returns Scalar result
     */
    tdotz(v: btVector3): number {
        return this.m_el[0].getZ() * v.getX() + this.m_el[1].getZ() * v.getY() + this.m_el[2].getZ() * v.getZ();
    }

    /**
     * Calculate the matrix cofactor
     * @param r1 The first row to use for calculating the cofactor
     * @param c1 The first column to use for calculating the cofactor
     * @param r2 The second row to use for calculating the cofactor
     * @param c2 The second column to use for calculating the cofactor
     * @returns Cofactor value
     */
    cofac(r1: number, c1: number, r2: number, c2: number): number {
        return this.getValue(r1, c1) * this.getValue(r2, c2) - 
               this.getValue(r1, c2) * this.getValue(r2, c1);
    }

    // ========== Matrix Decomposition ==========

    /**
     * extractRotation is from "A robust method to extract the rotational part of deformations"
     * See http://dl.acm.org/citation.cfm?doid=2994258.2994269
     * decomposes a matrix A in a orthogonal matrix R and a symmetric matrix S:
     * A = R*S.
     * note that R can include both rotation and scaling.
     * @param q Quaternion to store extracted rotation
     * @param tolerance Convergence tolerance
     * @param maxIter Maximum iterations
     */
    extractRotation(q: btQuaternion, tolerance: number = 1.0e-9, maxIter: number = 100): void {
        let iter = 0;
        let w: number;
        const A = this;
        
        for (iter = 0; iter < maxIter; iter++) {
            const R = new btMatrix3x3(q);
            const cross1 = btCross(R.getColumn(0), A.getColumn(0));
            const cross2 = btCross(R.getColumn(1), A.getColumn(1));
            const cross3 = btCross(R.getColumn(2), A.getColumn(2));
            const crossSum = cross1.add(cross2).add(cross3);
            
            const dotSum = btDot(R.getColumn(0), A.getColumn(0)) + 
                          btDot(R.getColumn(1), A.getColumn(1)) + 
                          btDot(R.getColumn(2), A.getColumn(2));
            const scale = 1.0 / (btFabs(dotSum) + tolerance);
            const omega = crossSum.multiply(scale);
            
            w = omega.length();
            if (w < tolerance) break;
            
            const omegaNormalized = omega.multiply(1.0 / w);
            const newQ = new btQuaternion(omegaNormalized, w);
            q.setValue(
                newQ.getX() * q.getW() + newQ.getW() * q.getX() + newQ.getY() * q.getZ() - newQ.getZ() * q.getY(),
                newQ.getY() * q.getW() + newQ.getW() * q.getY() + newQ.getZ() * q.getX() - newQ.getX() * q.getZ(),
                newQ.getZ() * q.getW() + newQ.getW() * q.getZ() + newQ.getX() * q.getY() - newQ.getY() * q.getX(),
                newQ.getW() * q.getW() - newQ.getX() * q.getX() - newQ.getY() * q.getY() - newQ.getZ() * q.getZ()
            );
            q.normalize();
        }
    }

    /**
     * diagonalizes this matrix by the Jacobi method.
     * @param rot stores the rotation from the coordinate system in which the matrix is diagonal to the original
     * coordinate system, i.e., old_this = rot * new_this * rot^T.
     * @param threshold See iteration
     * @param maxSteps The iteration stops when all off-diagonal elements are less than the threshold multiplied
     * by the sum of the absolute values of the diagonal, or when maxSteps have been executed.
     */
    diagonalize(rot: btMatrix3x3, threshold: number, maxSteps: number): void {
        rot.setIdentity();
        
        for (let step = maxSteps; step > 0; step--) {
            // find off-diagonal element [p][q] with largest magnitude
            let p = 0;
            let q = 1;
            let r = 2;
            let max = btFabs(this.getValue(0, 1));
            let v = btFabs(this.getValue(0, 2));
            
            if (v > max) {
                q = 2;
                r = 1;
                max = v;
            }
            v = btFabs(this.getValue(1, 2));
            if (v > max) {
                p = 1;
                q = 2;
                r = 0;
                max = v;
            }

            const t = threshold * (btFabs(this.getValue(0, 0)) + 
                                  btFabs(this.getValue(1, 1)) + 
                                  btFabs(this.getValue(2, 2)));
            if (max <= t) {
                if (max <= SIMD_EPSILON * t) {
                    return;
                }
                step = 1;
            }

            // compute Jacobi rotation J which leads to a zero for element [p][q]
            const mpq = this.getValue(p, q);
            const theta = (this.getValue(q, q) - this.getValue(p, p)) / (2 * mpq);
            const theta2 = theta * theta;
            let cos: number;
            let sin: number;
            let t_rot: number;

            if (theta2 * theta2 < 10 / SIMD_EPSILON) {
                t_rot = (theta >= 0) ? 1 / (theta + btSqrt(1 + theta2))
                                    : 1 / (theta - btSqrt(1 + theta2));
                cos = 1 / btSqrt(1 + t_rot * t_rot);
                sin = cos * t_rot;
            } else {
                // approximation for large theta-value, i.e., a nearly diagonal matrix
                t_rot = 1 / (theta * (2 + 0.5 / theta2));
                cos = 1 - 0.5 * t_rot * t_rot;
                sin = cos * t_rot;
            }

            // apply rotation to matrix (this = J^T * this * J)
            this.setMatrixElement(p, q, 0);
            this.setMatrixElement(q, p, 0);
            this.setMatrixElement(p, p, this.getValue(p, p) - t_rot * mpq);
            this.setMatrixElement(q, q, this.getValue(q, q) + t_rot * mpq);
            
            const mrp = this.getValue(r, p);
            const mrq = this.getValue(r, q);
            this.setMatrixElement(r, p, cos * mrp - sin * mrq);
            this.setMatrixElement(p, r, cos * mrp - sin * mrq);
            this.setMatrixElement(r, q, cos * mrq + sin * mrp);
            this.setMatrixElement(q, r, cos * mrq + sin * mrp);

            // apply rotation to rot (rot = rot * J)
            for (let i = 0; i < 3; i++) {
                const mrp_rot = rot.getValue(i, p);
                const mrq_rot = rot.getValue(i, q);
                rot.setMatrixElement(i, p, cos * mrp_rot - sin * mrq_rot);
                rot.setMatrixElement(i, q, cos * mrq_rot + sin * mrp_rot);
            }
        }
    }

    // ========== Equality ==========

    /**
     * Test equality between matrices
     * @param other Matrix to compare with
     * @returns True if matrices are equal
     */
    equals(other: btMatrix3x3): boolean {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.getValue(i, j) !== other.getValue(i, j)) {
                    return false;
                }
            }
        }
        return true;
    }
}

// ========== Static Functions and Operators ==========

/**
 * Matrix multiplication by scalar
 * @param m Matrix
 * @param k Scalar
 * @returns Scaled matrix
 */
export function multiplyMatrixScalar(m: btMatrix3x3, k: number): btMatrix3x3 {
    return new btMatrix3x3(
        m.getRow(0).getX() * k, m.getRow(0).getY() * k, m.getRow(0).getZ() * k,
        m.getRow(1).getX() * k, m.getRow(1).getY() * k, m.getRow(1).getZ() * k,
        m.getRow(2).getX() * k, m.getRow(2).getY() * k, m.getRow(2).getZ() * k
    );
}

/**
 * Matrix addition
 * @param m1 First matrix
 * @param m2 Second matrix
 * @returns Sum matrix
 */
export function addMatrices(m1: btMatrix3x3, m2: btMatrix3x3): btMatrix3x3 {
    return new btMatrix3x3(
        m1.getRow(0).getX() + m2.getRow(0).getX(),
        m1.getRow(0).getY() + m2.getRow(0).getY(),
        m1.getRow(0).getZ() + m2.getRow(0).getZ(),
        m1.getRow(1).getX() + m2.getRow(1).getX(),
        m1.getRow(1).getY() + m2.getRow(1).getY(),
        m1.getRow(1).getZ() + m2.getRow(1).getZ(),
        m1.getRow(2).getX() + m2.getRow(2).getX(),
        m1.getRow(2).getY() + m2.getRow(2).getY(),
        m1.getRow(2).getZ() + m2.getRow(2).getZ()
    );
}

/**
 * Matrix subtraction
 * @param m1 First matrix
 * @param m2 Second matrix
 * @returns Difference matrix
 */
export function subtractMatrices(m1: btMatrix3x3, m2: btMatrix3x3): btMatrix3x3 {
    return new btMatrix3x3(
        m1.getRow(0).getX() - m2.getRow(0).getX(),
        m1.getRow(0).getY() - m2.getRow(0).getY(),
        m1.getRow(0).getZ() - m2.getRow(0).getZ(),
        m1.getRow(1).getX() - m2.getRow(1).getX(),
        m1.getRow(1).getY() - m2.getRow(1).getY(),
        m1.getRow(1).getZ() - m2.getRow(1).getZ(),
        m1.getRow(2).getX() - m2.getRow(2).getX(),
        m1.getRow(2).getY() - m2.getRow(2).getY(),
        m1.getRow(2).getZ() - m2.getRow(2).getZ()
    );
}

/**
 * Matrix-Vector multiplication (m * v)
 * @param m Matrix
 * @param v Vector
 * @returns Result vector
 */
export function multiplyMatrixVector(m: btMatrix3x3, v: btVector3): btVector3 {
    return new btVector3(
        btDot(m.getRow(0), v),
        btDot(m.getRow(1), v),
        btDot(m.getRow(2), v)
    );
}

/**
 * Vector-Matrix multiplication (v * m)
 * @param v Vector
 * @param m Matrix
 * @returns Result vector
 */
export function multiplyVectorMatrix(v: btVector3, m: btMatrix3x3): btVector3 {
    return new btVector3(m.tdotx(v), m.tdoty(v), m.tdotz(v));
}

/**
 * Matrix-Matrix multiplication (m1 * m2)
 * @param m1 First matrix
 * @param m2 Second matrix
 * @returns Product matrix
 */
export function multiplyMatrices(m1: btMatrix3x3, m2: btMatrix3x3): btMatrix3x3 {
    return new btMatrix3x3(
        m2.tdotx(m1.getRow(0)), m2.tdoty(m1.getRow(0)), m2.tdotz(m1.getRow(0)),
        m2.tdotx(m1.getRow(1)), m2.tdoty(m1.getRow(1)), m2.tdotz(m1.getRow(1)),
        m2.tdotx(m1.getRow(2)), m2.tdoty(m1.getRow(2)), m2.tdotz(m1.getRow(2))
    );
}

/**
 * Test equality between two matrices
 * @param m1 First matrix
 * @param m2 Second matrix
 * @returns True if matrices are equal
 */
export function matricesEqual(m1: btMatrix3x3, m2: btMatrix3x3): boolean {
    return m1.equals(m2);
}