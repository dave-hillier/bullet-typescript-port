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
 * TypeScript port of Bullet3Common/b3Scalar.h
 * Core scalar types and mathematical constants for the Bullet3 physics engine
 */

// Bullet3 version constant
export const B3_BULLET_VERSION = 300;

export function b3GetVersion(): number {
    return B3_BULLET_VERSION;
}

/**
 * The b3Scalar type abstracts floating point numbers.
 * In TypeScript, we always use number (which is a double-precision float).
 */
export type b3Scalar = number;

// Mathematical constants
export const B3_LARGE_FLOAT = 1e18;
export const B3_EPSILON = 2.220446049250313e-16; // Number.EPSILON
export const B3_INFINITY = Number.POSITIVE_INFINITY;

// Mathematical constants
export const B3_2_PI = 6.283185307179586232;
export const B3_PI = B3_2_PI * 0.5;
export const B3_HALF_PI = B3_2_PI * 0.25;
export const B3_RADS_PER_DEG = B3_2_PI / 360.0;
export const B3_DEGS_PER_RAD = 360.0 / B3_2_PI;
export const B3_SQRT12 = 0.7071067811865475244008443621048490;

/**
 * TypeScript assertion function to replace C++ b3Assert
 */
export function b3Assert(condition: boolean, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message || 'Bullet3 assertion failed');
    }
}

/**
 * Mathematical utility functions
 */
export function b3Sqrt(x: b3Scalar): b3Scalar {
    return Math.sqrt(x);
}

export function b3Fabs(x: b3Scalar): b3Scalar {
    return Math.abs(x);
}

export function b3Cos(x: b3Scalar): b3Scalar {
    return Math.cos(x);
}

export function b3Sin(x: b3Scalar): b3Scalar {
    return Math.sin(x);
}

export function b3Tan(x: b3Scalar): b3Scalar {
    return Math.tan(x);
}

export function b3Acos(x: b3Scalar): b3Scalar {
    if (x < -1) x = -1;
    if (x > 1) x = 1;
    return Math.acos(x);
}

export function b3Asin(x: b3Scalar): b3Scalar {
    if (x < -1) x = -1;
    if (x > 1) x = 1;
    return Math.asin(x);
}

export function b3Atan(x: b3Scalar): b3Scalar {
    return Math.atan(x);
}

export function b3Atan2(x: b3Scalar, y: b3Scalar): b3Scalar {
    return Math.atan2(x, y);
}

export function b3Exp(x: b3Scalar): b3Scalar {
    return Math.exp(x);
}

export function b3Log(x: b3Scalar): b3Scalar {
    return Math.log(x);
}

export function b3Pow(x: b3Scalar, y: b3Scalar): b3Scalar {
    return Math.pow(x, y);
}

export function b3Fmod(x: b3Scalar, y: b3Scalar): b3Scalar {
    return x % y;
}

export function b3RecipSqrt(x: b3Scalar): b3Scalar {
    return 1.0 / b3Sqrt(x);
}

/**
 * Fast atan2 approximation
 */
export function b3Atan2Fast(y: b3Scalar, x: b3Scalar): b3Scalar {
    const coeff_1 = B3_PI / 4.0;
    const coeff_2 = 3.0 * coeff_1;
    const abs_y = b3Fabs(y);
    let angle: b3Scalar;
    
    if (x >= 0.0) {
        const r = (x - abs_y) / (x + abs_y);
        angle = coeff_1 - coeff_1 * r;
    } else {
        const r = (x + abs_y) / (abs_y - x);
        angle = coeff_2 - coeff_1 * r;
    }
    
    return (y < 0.0) ? -angle : angle;
}

export function b3FuzzyZero(x: b3Scalar): boolean {
    return b3Fabs(x) < B3_EPSILON;
}

export function b3Equal(a: b3Scalar, eps: b3Scalar): boolean {
    return (a <= eps) && !(a < -eps);
}

export function b3GreaterEqual(a: b3Scalar, eps: b3Scalar): boolean {
    return !(a <= eps);
}

export function b3IsNegative(x: b3Scalar): number {
    return x < 0.0 ? 1 : 0;
}

export function b3Radians(x: b3Scalar): b3Scalar {
    return x * B3_RADS_PER_DEG;
}

export function b3Degrees(x: b3Scalar): b3Scalar {
    return x * B3_DEGS_PER_RAD;
}

/**
 * Conditional selection function (branchless selection)
 */
export function b3Fsel(a: b3Scalar, b: b3Scalar, c: b3Scalar): b3Scalar {
    return a >= 0 ? b : c;
}

export function b3Fsels(a: b3Scalar, b: b3Scalar, c: b3Scalar): b3Scalar {
    return b3Fsel(a, b, c);
}

/**
 * Utility functions
 */
export function b3MachineIsLittleEndian(): boolean {
    const buffer = new ArrayBuffer(2);
    const uint8Array = new Uint8Array(buffer);
    const uint16Array = new Uint16Array(buffer);
    uint16Array[0] = 1;
    return uint8Array[0] === 1;
}

/**
 * Selection functions (branchless selection for performance)
 */
export function b3Select(condition: number, valueIfConditionNonZero: number, valueIfConditionZero: number): number {
    return condition !== 0 ? valueIfConditionNonZero : valueIfConditionZero;
}

export function b3SelectFloat(condition: number, valueIfConditionNonZero: b3Scalar, valueIfConditionZero: b3Scalar): b3Scalar {
    return condition !== 0 ? valueIfConditionNonZero : valueIfConditionZero;
}

/**
 * Generic swap function
 */
export function b3Swap<T>(a: { value: T }, b: { value: T }): void {
    const tmp = a.value;
    a.value = b.value;
    b.value = tmp;
}

/**
 * Endian swapping functions
 */
export function b3SwapEndian(val: number): number {
    return ((val & 0xff000000) >>> 24) | 
           ((val & 0x00ff0000) >>> 8) | 
           ((val & 0x0000ff00) << 8) | 
           ((val & 0x000000ff) << 24);
}

export function b3SwapEndianShort(val: number): number {
    return ((val & 0xff00) >>> 8) | ((val & 0x00ff) << 8);
}

export function b3SwapEndianFloat(d: number): number {
    const buffer = new ArrayBuffer(4);
    const floatView = new Float32Array(buffer);
    const uintView = new Uint32Array(buffer);
    
    floatView[0] = d;
    return b3SwapEndian(uintView[0]);
}

export function b3UnswapEndianFloat(a: number): number {
    const swapped = b3SwapEndian(a);
    const buffer = new ArrayBuffer(4);
    const uintView = new Uint32Array(buffer);
    const floatView = new Float32Array(buffer);
    
    uintView[0] = swapped;
    return floatView[0];
}

/**
 * Normalize angle to range [-B3_PI, B3_PI]
 */
export function b3NormalizeAngle(angleInRadians: b3Scalar): b3Scalar {
    let angle = b3Fmod(angleInRadians, B3_2_PI);
    if (angle < -B3_PI) {
        return angle + B3_2_PI;
    } else if (angle > B3_PI) {
        return angle - B3_2_PI;
    } else {
        return angle;
    }
}

/**
 * Basic typed object for runtime type information
 */
export class b3TypedObject {
    private m_objectType: number;

    constructor(objectType: number) {
        this.m_objectType = objectType;
    }

    getObjectType(): number {
        return this.m_objectType;
    }
}

/**
 * Align a number to the provided alignment, upwards
 */
export function b3AlignNumber(unalignedValue: number, alignment: number): number {
    const bitMask = ~(alignment - 1);
    return (unalignedValue + alignment - 1) & bitMask;
}