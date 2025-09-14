/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Erwin Coumans  http://bulletphysics.org

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

import { btNormalizeAngle, btEqual, btFabs, SIMD_2_PI } from '../../LinearMath/btScalar';

/**
 * Angular limit class for joint constraints
 */
export class btAngularLimit {
    private m_center: number;
    private m_halfRange: number;
    private m_softness: number;
    private m_biasFactor: number;
    private m_relaxationFactor: number;
    private m_correction: number;
    private m_sign: number;
    private m_solveLimit: boolean;

    /**
     * Default constructor initializes limit as inactive, allowing free constraint movement
     */
    constructor() {
        this.m_center = 0.0;
        this.m_halfRange = -1.0;
        this.m_softness = 0.9;
        this.m_biasFactor = 0.3;
        this.m_relaxationFactor = 1.0;
        this.m_correction = 0.0;
        this.m_sign = 0.0;
        this.m_solveLimit = false;
    }

    /**
     * Sets all limit's parameters.
     * When low > high limit becomes inactive.
     * When high - low > 2PI limit is ineffective too because no angle can exceed the limit
     */
    set(low: number, high: number, softness: number = 0.9, biasFactor: number = 0.3, relaxationFactor: number = 1.0): void {
        this.m_halfRange = (high - low) / 2.0;
        this.m_center = btNormalizeAngle(low + this.m_halfRange);
        this.m_softness = softness;
        this.m_biasFactor = biasFactor;
        this.m_relaxationFactor = relaxationFactor;
    }

    /**
     * Checks constraint angle against limit. If limit is active and the angle violates the limit
     * correction is calculated.
     */
    test(angle: number): void {
        this.m_correction = 0.0;
        this.m_sign = 0.0;
        this.m_solveLimit = false;

        if (this.m_halfRange >= 0.0) {
            const deviation = btNormalizeAngle(angle - this.m_center);
            if (deviation < -this.m_halfRange) {
                this.m_solveLimit = true;
                this.m_correction = -(deviation + this.m_halfRange);
                this.m_sign = +1.0;
            } else if (deviation > this.m_halfRange) {
                this.m_solveLimit = true;
                this.m_correction = this.m_halfRange - deviation;
                this.m_sign = -1.0;
            }
        }
    }

    /**
     * Returns limit's softness
     */
    getSoftness(): number {
        return this.m_softness;
    }

    /**
     * Returns limit's bias factor
     */
    getBiasFactor(): number {
        return this.m_biasFactor;
    }

    /**
     * Returns limit's relaxation factor
     */
    getRelaxationFactor(): number {
        return this.m_relaxationFactor;
    }

    /**
     * Returns correction value evaluated when test() was invoked
     */
    getCorrection(): number {
        return this.m_correction;
    }

    /**
     * Returns sign value evaluated when test() was invoked
     */
    getSign(): number {
        return this.m_sign;
    }

    /**
     * Gives half of the distance between min and max limit angle
     */
    getHalfRange(): number {
        return this.m_halfRange;
    }

    /**
     * Returns true when the last test() invocation recognized limit violation
     */
    isLimit(): number {
        return this.m_solveLimit ? 1 : 0;
    }

    /**
     * Checks given angle against limit. If limit is active and angle doesn't fit it, the angle
     * returned is modified so it equals to the limit closest to given angle.
     */
    fit(angle: { value: number }): void {
        if (this.m_halfRange > 0.0) {
            const relativeAngle = btNormalizeAngle(angle.value - this.m_center);
            if (!btEqual(relativeAngle, this.m_halfRange)) {
                if (relativeAngle > 0.0) {
                    angle.value = this.getHigh();
                } else {
                    angle.value = this.getLow();
                }
            }
        }
    }

    /**
     * Returns correction value multiplied by sign value
     */
    getError(): number {
        return this.m_correction * this.m_sign;
    }

    getLow(): number {
        return btNormalizeAngle(this.m_center - this.m_halfRange);
    }

    getHigh(): number {
        return btNormalizeAngle(this.m_center + this.m_halfRange);
    }
}

/**
 * Utility function to adjust angle to limits
 */
export function btAdjustAngleToLimits(
    angleInRadians: number,
    angleLowerLimitInRadians: number,
    angleUpperLimitInRadians: number
): number {
    if (angleLowerLimitInRadians >= angleUpperLimitInRadians) {
        return angleInRadians;
    } else if (angleInRadians < angleLowerLimitInRadians) {
        const diffLo = btFabs(btNormalizeAngle(angleLowerLimitInRadians - angleInRadians));
        const diffHi = btFabs(btNormalizeAngle(angleUpperLimitInRadians - angleInRadians));
        return (diffLo < diffHi) ? angleInRadians : (angleInRadians + SIMD_2_PI);
    } else if (angleInRadians > angleUpperLimitInRadians) {
        const diffHi = btFabs(btNormalizeAngle(angleInRadians - angleUpperLimitInRadians));
        const diffLo = btFabs(btNormalizeAngle(angleInRadians - angleLowerLimitInRadians));
        return (diffLo < diffHi) ? (angleInRadians - SIMD_2_PI) : angleInRadians;
    } else {
        return angleInRadians;
    }
}