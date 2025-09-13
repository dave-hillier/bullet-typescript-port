/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

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
/**
 * TypeScript port of Bullet3's btScalar.h
 * Defines scalar types, math constants, and utility functions for the physics engine
 */
// Version information
export const BT_BULLET_VERSION = 326;
export function btGetVersion() {
    return BT_BULLET_VERSION;
}
export function btIsDoublePrecision() {
    // In TypeScript, we use number type which is double precision
    return true;
}
// Assertion function - TypeScript equivalent of btAssert macro
export function btAssert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}
// Large float constant
export const BT_LARGE_FLOAT = 1e30;
// Special float values
export const BT_INFINITY = Number.POSITIVE_INFINITY;
export const BT_NAN = Number.NaN;
// Mathematical constants
export const SIMD_PI = 3.1415926535897932384626433832795029;
export const SIMD_2_PI = 2.0 * SIMD_PI;
export const SIMD_HALF_PI = SIMD_PI * 0.5;
export const SIMD_RADS_PER_DEG = SIMD_2_PI / 360.0;
export const SIMD_DEGS_PER_RAD = 360.0 / SIMD_2_PI;
export const SIMDSQRT12 = 0.7071067811865475244008443621048490;
// Epsilon and other scalar constants
export const SIMD_EPSILON = Number.EPSILON;
export const SIMD_INFINITY = Number.MAX_VALUE;
export const BT_ONE = 1.0;
export const BT_ZERO = 0.0;
export const BT_TWO = 2.0;
export const BT_HALF = 0.5;
// Math utility functions - using JavaScript's native math functions
export function btSqrt(x) {
    return Math.sqrt(x);
}
export function btFabs(x) {
    return Math.abs(x);
}
export function btCos(x) {
    return Math.cos(x);
}
export function btSin(x) {
    return Math.sin(x);
}
export function btTan(x) {
    return Math.tan(x);
}
export function btAcos(x) {
    if (x < -1)
        x = -1;
    if (x > 1)
        x = 1;
    return Math.acos(x);
}
export function btAsin(x) {
    if (x < -1)
        x = -1;
    if (x > 1)
        x = 1;
    return Math.asin(x);
}
export function btAtan(x) {
    return Math.atan(x);
}
export function btAtan2(x, y) {
    return Math.atan2(x, y);
}
export function btExp(x) {
    return Math.exp(x);
}
export function btLog(x) {
    return Math.log(x);
}
export function btPow(x, y) {
    return Math.pow(x, y);
}
export function btFmod(x, y) {
    return x % y;
}
// Reciprocal functions
export function btRecipSqrt(x) {
    return 1.0 / btSqrt(x);
}
export function btRecip(x) {
    return 1.0 / x;
}
// Fast approximation of atan2
export function btAtan2Fast(y, x) {
    const coeff_1 = SIMD_PI / 4.0;
    const coeff_2 = 3.0 * coeff_1;
    const abs_y = btFabs(y);
    let angle;
    if (x >= 0.0) {
        const r = (x - abs_y) / (x + abs_y);
        angle = coeff_1 - coeff_1 * r;
    }
    else {
        const r = (x + abs_y) / (abs_y - x);
        angle = coeff_2 - coeff_1 * r;
    }
    return (y < 0.0) ? -angle : angle;
}
// Comparison utilities
export function btFuzzyZero(x) {
    return btFabs(x) < SIMD_EPSILON;
}
export function btEqual(a, eps) {
    return (a <= eps) && !(a < -eps);
}
export function btGreaterEqual(a, eps) {
    return !(a <= eps);
}
// Min/Max utilities
export function btMax(a, b) {
    return a > b ? a : b;
}
export function btMin(a, b) {
    return a < b ? a : b;
}
// Clamping utility
export function btClamped(value, min, max) {
    return value < min ? min : (value > max ? max : value);
}
export function btIsNegative(x) {
    return x < 0.0 ? 1 : 0;
}
// Angle conversion utilities
export function btRadians(x) {
    return x * SIMD_RADS_PER_DEG;
}
export function btDegrees(x) {
    return x * SIMD_DEGS_PER_RAD;
}
// Conditional select function
export function btFsel(a, b, c) {
    return a >= 0 ? b : c;
}
export function btFsels(a, b, c) {
    return btFsel(a, b, c);
}
// Machine endianness check
export function btMachineIsLittleEndian() {
    const buffer = new ArrayBuffer(4);
    const view8 = new Uint8Array(buffer);
    const view32 = new Uint32Array(buffer);
    view32[0] = 1;
    return view8[0] === 1;
}
// Branch-free selection functions
export function btSelectUnsigned(condition, valueIfConditionNonZero, valueIfConditionZero) {
    const testNz = ((condition | -condition) >> 31) >>> 0;
    const testEqz = ~testNz >>> 0;
    return ((valueIfConditionNonZero & testNz) | (valueIfConditionZero & testEqz)) >>> 0;
}
export function btSelectInt(condition, valueIfConditionNonZero, valueIfConditionZero) {
    const testNz = (condition | -condition) >> 31;
    const testEqz = ~testNz;
    return (valueIfConditionNonZero & testNz) | (valueIfConditionZero & testEqz);
}
export function btSelectFloat(condition, valueIfConditionNonZero, valueIfConditionZero) {
    return (condition !== 0) ? valueIfConditionNonZero : valueIfConditionZero;
}
// Generic swap function
export function btSwap(a, b) {
    const tmp = a.value;
    a.value = b.value;
    b.value = tmp;
}
// Endian swapping functions
export function btSwapEndianUnsigned(val) {
    return (((val & 0xff000000) >>> 24) |
        ((val & 0x00ff0000) >>> 8) |
        ((val & 0x0000ff00) << 8) |
        ((val & 0x000000ff) << 24)) >>> 0;
}
export function btSwapEndianUnsignedShort(val) {
    return (((val & 0xff00) >>> 8) | ((val & 0x00ff) << 8)) & 0xffff;
}
export function btSwapEndianInt(val) {
    return btSwapEndianUnsigned(val >>> 0) | 0;
}
export function btSwapEndianShort(val) {
    return btSwapEndianUnsignedShort(val & 0xffff) | 0;
}
// Float endian swapping using typed arrays
export function btSwapEndianFloat(d) {
    const buffer = new ArrayBuffer(4);
    const floatView = new Float32Array(buffer);
    const byteView = new Uint8Array(buffer);
    floatView[0] = d;
    // Swap bytes
    const temp = byteView[0];
    byteView[0] = byteView[3];
    byteView[3] = temp;
    const temp2 = byteView[1];
    byteView[1] = byteView[2];
    byteView[2] = temp2;
    return new Uint32Array(buffer)[0];
}
export function btUnswapEndianFloat(a) {
    const buffer = new ArrayBuffer(4);
    const intView = new Uint32Array(buffer);
    const byteView = new Uint8Array(buffer);
    intView[0] = a;
    // Swap bytes
    const temp = byteView[0];
    byteView[0] = byteView[3];
    byteView[3] = temp;
    const temp2 = byteView[1];
    byteView[1] = byteView[2];
    byteView[2] = temp2;
    return new Float32Array(buffer)[0];
}
// Double endian swapping
export function btSwapEndianDouble(d) {
    const buffer = new ArrayBuffer(8);
    const doubleView = new Float64Array(buffer);
    const byteView = new Uint8Array(buffer);
    doubleView[0] = d;
    const result = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        result[i] = byteView[7 - i];
    }
    return result;
}
export function btUnswapEndianDouble(src) {
    const buffer = new ArrayBuffer(8);
    const byteView = new Uint8Array(buffer);
    for (let i = 0; i < 8; i++) {
        byteView[i] = src[7 - i];
    }
    return new Float64Array(buffer)[0];
}
// Set array to zero
export function btSetZero(a, n) {
    for (let i = 0; i < n && i < a.length; i++) {
        a[i] = 0;
    }
}
// Large dot product
export function btLargeDot(a, b, n) {
    let sum = 0;
    let i = 0;
    // Process pairs for potential optimization
    while (i < n - 1) {
        const p0 = a[i];
        const q0 = b[i];
        const m0 = p0 * q0;
        const p1 = a[i + 1];
        const q1 = b[i + 1];
        const m1 = p1 * q1;
        sum += m0 + m1;
        i += 2;
    }
    // Handle remaining element
    if (i < n) {
        sum += a[i] * b[i];
    }
    return sum;
}
// Normalize angle to range [-SIMD_PI, SIMD_PI]
export function btNormalizeAngle(angleInRadians) {
    angleInRadians = btFmod(angleInRadians, SIMD_2_PI);
    if (angleInRadians < -SIMD_PI) {
        return angleInRadians + SIMD_2_PI;
    }
    else if (angleInRadians > SIMD_PI) {
        return angleInRadians - SIMD_2_PI;
    }
    else {
        return angleInRadians;
    }
}
// Type information base class
export class btTypedObject {
    constructor(objectType) {
        this.m_objectType = objectType;
    }
    getObjectType() {
        return this.m_objectType;
    }
}
// Pointer alignment utility (simplified for TypeScript - mainly for documentation)
export function btAlignPointer(unalignedPtr, _alignment) {
    // In TypeScript/JavaScript, memory alignment is handled automatically
    // This function is provided for API compatibility but returns the input unchanged
    return unalignedPtr;
}
