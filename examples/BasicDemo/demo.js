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
System.register("src/LinearMath/btMinMax", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    /**
     * TypeScript port of Bullet3's btMinMax.h
     * Provides generic min/max utility functions with proper type safety
     */
    /**
     * Returns the minimum of two values
     * @param a First value
     * @param b Second value
     * @returns The smaller of the two values
     */
    function btMin(a, b) {
        return a < b ? a : b;
    }
    exports_1("btMin", btMin);
    /**
     * Returns the maximum of two values
     * @param a First value
     * @param b Second value
     * @returns The larger of the two values
     */
    function btMax(a, b) {
        return a > b ? a : b;
    }
    exports_1("btMax", btMax);
    /**
     * Clamps a value between lower and upper bounds
     * @param a Value to clamp
     * @param lb Lower bound
     * @param ub Upper bound
     * @returns The clamped value
     */
    function btClamped(a, lb, ub) {
        return a < lb ? lb : (ub < a ? ub : a);
    }
    exports_1("btClamped", btClamped);
    /**
     * Sets the first value to the minimum of the two values (modifies the first parameter)
     * @param a Object with a value property to potentially modify
     * @param b Value to compare against
     */
    function btSetMin(a, b) {
        if (b < a.value) {
            a.value = b;
        }
    }
    exports_1("btSetMin", btSetMin);
    /**
     * Sets the first value to the maximum of the two values (modifies the first parameter)
     * @param a Object with a value property to potentially modify
     * @param b Value to compare against
     */
    function btSetMax(a, b) {
        if (a.value < b) {
            a.value = b;
        }
    }
    exports_1("btSetMax", btSetMax);
    /**
     * Clamps the first value between the bounds (modifies the first parameter)
     * @param a Object with a value property to potentially modify
     * @param lb Lower bound
     * @param ub Upper bound
     */
    function btClamp(a, lb, ub) {
        if (a.value < lb) {
            a.value = lb;
        }
        else if (ub < a.value) {
            a.value = ub;
        }
    }
    exports_1("btClamp", btClamp);
    return {
        setters: [],
        execute: function () {/*
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
        }
    };
});
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
System.register("src/LinearMath/btQuadWord", ["src/LinearMath/btMinMax"], function (exports_2, context_2) {
    "use strict";
    var btMinMax_1, btQuadWord;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (btMinMax_1_1) {
                btMinMax_1 = btMinMax_1_1;
            }
        ],
        execute: function () {/*
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
            /**
             * The btQuadWord class is base class for btVector3 and btQuaternion.
             * This TypeScript version removes SIMD optimizations and uses a simple array-based implementation.
             */
            btQuadWord = class btQuadWord {
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
                    this.m_floats[0] = btMinMax_1.btMax(this.m_floats[0], other.m_floats[0]);
                    this.m_floats[1] = btMinMax_1.btMax(this.m_floats[1], other.m_floats[1]);
                    this.m_floats[2] = btMinMax_1.btMax(this.m_floats[2], other.m_floats[2]);
                    this.m_floats[3] = btMinMax_1.btMax(this.m_floats[3], other.m_floats[3]);
                }
                /**
                 * Set each element to the min of the current values and the values of another btQuadWord
                 * @param other The other btQuadWord to compare with
                 */
                setMin(other) {
                    this.m_floats[0] = btMinMax_1.btMin(this.m_floats[0], other.m_floats[0]);
                    this.m_floats[1] = btMinMax_1.btMin(this.m_floats[1], other.m_floats[1]);
                    this.m_floats[2] = btMinMax_1.btMin(this.m_floats[2], other.m_floats[2]);
                    this.m_floats[3] = btMinMax_1.btMin(this.m_floats[3], other.m_floats[3]);
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
            };
            exports_2("btQuadWord", btQuadWord);
        }
    };
});
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
System.register("src/LinearMath/btScalar", [], function (exports_3, context_3) {
    "use strict";
    var BT_BULLET_VERSION, BT_LARGE_FLOAT, BT_INFINITY, BT_NAN, SIMD_PI, SIMD_2_PI, SIMD_HALF_PI, SIMD_RADS_PER_DEG, SIMD_DEGS_PER_RAD, SIMDSQRT12, SIMD_EPSILON, SIMD_INFINITY, BT_ONE, BT_ZERO, BT_TWO, BT_HALF, btTypedObject;
    var __moduleName = context_3 && context_3.id;
    function btGetVersion() {
        return BT_BULLET_VERSION;
    }
    exports_3("btGetVersion", btGetVersion);
    function btIsDoublePrecision() {
        // In TypeScript, we use number type which is double precision
        return true;
    }
    exports_3("btIsDoublePrecision", btIsDoublePrecision);
    // Assertion function - TypeScript equivalent of btAssert macro
    function btAssert(condition, message) {
        if (!condition) {
            throw new Error(message || "Assertion failed");
        }
    }
    exports_3("btAssert", btAssert);
    // Math utility functions - using JavaScript's native math functions
    function btSqrt(x) {
        return Math.sqrt(x);
    }
    exports_3("btSqrt", btSqrt);
    function btFabs(x) {
        return Math.abs(x);
    }
    exports_3("btFabs", btFabs);
    function btCos(x) {
        return Math.cos(x);
    }
    exports_3("btCos", btCos);
    function btSin(x) {
        return Math.sin(x);
    }
    exports_3("btSin", btSin);
    function btTan(x) {
        return Math.tan(x);
    }
    exports_3("btTan", btTan);
    function btAcos(x) {
        if (x < -1)
            x = -1;
        if (x > 1)
            x = 1;
        return Math.acos(x);
    }
    exports_3("btAcos", btAcos);
    function btAsin(x) {
        if (x < -1)
            x = -1;
        if (x > 1)
            x = 1;
        return Math.asin(x);
    }
    exports_3("btAsin", btAsin);
    function btAtan(x) {
        return Math.atan(x);
    }
    exports_3("btAtan", btAtan);
    function btAtan2(x, y) {
        return Math.atan2(x, y);
    }
    exports_3("btAtan2", btAtan2);
    function btExp(x) {
        return Math.exp(x);
    }
    exports_3("btExp", btExp);
    function btLog(x) {
        return Math.log(x);
    }
    exports_3("btLog", btLog);
    function btPow(x, y) {
        return Math.pow(x, y);
    }
    exports_3("btPow", btPow);
    function btFmod(x, y) {
        return x % y;
    }
    exports_3("btFmod", btFmod);
    // Reciprocal functions
    function btRecipSqrt(x) {
        return 1.0 / btSqrt(x);
    }
    exports_3("btRecipSqrt", btRecipSqrt);
    function btRecip(x) {
        return 1.0 / x;
    }
    exports_3("btRecip", btRecip);
    // Fast approximation of atan2
    function btAtan2Fast(y, x) {
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
    exports_3("btAtan2Fast", btAtan2Fast);
    // Comparison utilities
    function btFuzzyZero(x) {
        return btFabs(x) < SIMD_EPSILON;
    }
    exports_3("btFuzzyZero", btFuzzyZero);
    function btEqual(a, eps) {
        return (a <= eps) && !(a < -eps);
    }
    exports_3("btEqual", btEqual);
    function btGreaterEqual(a, eps) {
        return !(a <= eps);
    }
    exports_3("btGreaterEqual", btGreaterEqual);
    // Min/Max utilities
    function btMax(a, b) {
        return a > b ? a : b;
    }
    exports_3("btMax", btMax);
    function btMin(a, b) {
        return a < b ? a : b;
    }
    exports_3("btMin", btMin);
    // Clamping utility
    function btClamped(value, min, max) {
        return value < min ? min : (value > max ? max : value);
    }
    exports_3("btClamped", btClamped);
    function btIsNegative(x) {
        return x < 0.0 ? 1 : 0;
    }
    exports_3("btIsNegative", btIsNegative);
    // Angle conversion utilities
    function btRadians(x) {
        return x * SIMD_RADS_PER_DEG;
    }
    exports_3("btRadians", btRadians);
    function btDegrees(x) {
        return x * SIMD_DEGS_PER_RAD;
    }
    exports_3("btDegrees", btDegrees);
    // Conditional select function
    function btFsel(a, b, c) {
        return a >= 0 ? b : c;
    }
    exports_3("btFsel", btFsel);
    function btFsels(a, b, c) {
        return btFsel(a, b, c);
    }
    exports_3("btFsels", btFsels);
    // Machine endianness check
    function btMachineIsLittleEndian() {
        const buffer = new ArrayBuffer(4);
        const view8 = new Uint8Array(buffer);
        const view32 = new Uint32Array(buffer);
        view32[0] = 1;
        return view8[0] === 1;
    }
    exports_3("btMachineIsLittleEndian", btMachineIsLittleEndian);
    // Branch-free selection functions
    function btSelectUnsigned(condition, valueIfConditionNonZero, valueIfConditionZero) {
        const testNz = ((condition | -condition) >> 31) >>> 0;
        const testEqz = ~testNz >>> 0;
        return ((valueIfConditionNonZero & testNz) | (valueIfConditionZero & testEqz)) >>> 0;
    }
    exports_3("btSelectUnsigned", btSelectUnsigned);
    function btSelectInt(condition, valueIfConditionNonZero, valueIfConditionZero) {
        const testNz = (condition | -condition) >> 31;
        const testEqz = ~testNz;
        return (valueIfConditionNonZero & testNz) | (valueIfConditionZero & testEqz);
    }
    exports_3("btSelectInt", btSelectInt);
    function btSelectFloat(condition, valueIfConditionNonZero, valueIfConditionZero) {
        return (condition !== 0) ? valueIfConditionNonZero : valueIfConditionZero;
    }
    exports_3("btSelectFloat", btSelectFloat);
    // Generic swap function
    function btSwap(a, b) {
        const tmp = a.value;
        a.value = b.value;
        b.value = tmp;
    }
    exports_3("btSwap", btSwap);
    // Endian swapping functions
    function btSwapEndianUnsigned(val) {
        return (((val & 0xff000000) >>> 24) |
            ((val & 0x00ff0000) >>> 8) |
            ((val & 0x0000ff00) << 8) |
            ((val & 0x000000ff) << 24)) >>> 0;
    }
    exports_3("btSwapEndianUnsigned", btSwapEndianUnsigned);
    function btSwapEndianUnsignedShort(val) {
        return (((val & 0xff00) >>> 8) | ((val & 0x00ff) << 8)) & 0xffff;
    }
    exports_3("btSwapEndianUnsignedShort", btSwapEndianUnsignedShort);
    function btSwapEndianInt(val) {
        return btSwapEndianUnsigned(val >>> 0) | 0;
    }
    exports_3("btSwapEndianInt", btSwapEndianInt);
    function btSwapEndianShort(val) {
        return btSwapEndianUnsignedShort(val & 0xffff) | 0;
    }
    exports_3("btSwapEndianShort", btSwapEndianShort);
    // Float endian swapping using typed arrays
    function btSwapEndianFloat(d) {
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
    exports_3("btSwapEndianFloat", btSwapEndianFloat);
    function btUnswapEndianFloat(a) {
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
    exports_3("btUnswapEndianFloat", btUnswapEndianFloat);
    // Double endian swapping
    function btSwapEndianDouble(d) {
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
    exports_3("btSwapEndianDouble", btSwapEndianDouble);
    function btUnswapEndianDouble(src) {
        const buffer = new ArrayBuffer(8);
        const byteView = new Uint8Array(buffer);
        for (let i = 0; i < 8; i++) {
            byteView[i] = src[7 - i];
        }
        return new Float64Array(buffer)[0];
    }
    exports_3("btUnswapEndianDouble", btUnswapEndianDouble);
    // Set array to zero
    function btSetZero(a, n) {
        for (let i = 0; i < n && i < a.length; i++) {
            a[i] = 0;
        }
    }
    exports_3("btSetZero", btSetZero);
    // Large dot product
    function btLargeDot(a, b, n) {
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
    exports_3("btLargeDot", btLargeDot);
    // Normalize angle to range [-SIMD_PI, SIMD_PI]
    function btNormalizeAngle(angleInRadians) {
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
    exports_3("btNormalizeAngle", btNormalizeAngle);
    // Pointer alignment utility (simplified for TypeScript - mainly for documentation)
    function btAlignPointer(unalignedPtr, _alignment) {
        // In TypeScript/JavaScript, memory alignment is handled automatically
        // This function is provided for API compatibility but returns the input unchanged
        return unalignedPtr;
    }
    exports_3("btAlignPointer", btAlignPointer);
    return {
        setters: [],
        execute: function () {/*
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
            exports_3("BT_BULLET_VERSION", BT_BULLET_VERSION = 326);
            // Large float constant
            exports_3("BT_LARGE_FLOAT", BT_LARGE_FLOAT = 1e30);
            // Special float values
            exports_3("BT_INFINITY", BT_INFINITY = Number.POSITIVE_INFINITY);
            exports_3("BT_NAN", BT_NAN = Number.NaN);
            // Mathematical constants
            exports_3("SIMD_PI", SIMD_PI = 3.1415926535897932384626433832795029);
            exports_3("SIMD_2_PI", SIMD_2_PI = 2.0 * SIMD_PI);
            exports_3("SIMD_HALF_PI", SIMD_HALF_PI = SIMD_PI * 0.5);
            exports_3("SIMD_RADS_PER_DEG", SIMD_RADS_PER_DEG = SIMD_2_PI / 360.0);
            exports_3("SIMD_DEGS_PER_RAD", SIMD_DEGS_PER_RAD = 360.0 / SIMD_2_PI);
            exports_3("SIMDSQRT12", SIMDSQRT12 = 0.7071067811865475244008443621048490);
            // Epsilon and other scalar constants
            exports_3("SIMD_EPSILON", SIMD_EPSILON = Number.EPSILON);
            exports_3("SIMD_INFINITY", SIMD_INFINITY = Number.MAX_VALUE);
            exports_3("BT_ONE", BT_ONE = 1.0);
            exports_3("BT_ZERO", BT_ZERO = 0.0);
            exports_3("BT_TWO", BT_TWO = 2.0);
            exports_3("BT_HALF", BT_HALF = 0.5);
            // Type information base class
            btTypedObject = class btTypedObject {
                constructor(objectType) {
                    this.m_objectType = objectType;
                }
                getObjectType() {
                    return this.m_objectType;
                }
            };
            exports_3("btTypedObject", btTypedObject);
        }
    };
});
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
System.register("src/LinearMath/btVector3", ["src/LinearMath/btQuadWord", "src/LinearMath/btScalar", "src/LinearMath/btMinMax"], function (exports_4, context_4) {
    "use strict";
    var btQuadWord_1, btScalar_1, btMinMax_2, btVector3, btVector4;
    var __moduleName = context_4 && context_4.id;
    // ========== Global Helper Functions ==========
    /**
     * Return the dot product between two vectors
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Dot product
     */
    function btDot(v1, v2) {
        return v1.dot(v2);
    }
    exports_4("btDot", btDot);
    /**
     * Return the distance squared between two vectors
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Distance squared
     */
    function btDistance2(v1, v2) {
        return v1.distance2(v2);
    }
    exports_4("btDistance2", btDistance2);
    /**
     * Return the distance between two vectors
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Distance
     */
    function btDistance(v1, v2) {
        return v1.distance(v2);
    }
    exports_4("btDistance", btDistance);
    /**
     * Return the angle between two vectors
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Angle in radians
     */
    function btAngle(v1, v2) {
        return v1.angle(v2);
    }
    exports_4("btAngle", btAngle);
    /**
     * Return the cross product of two vectors
     * @param v1 First vector
     * @param v2 Second vector
     * @returns Cross product
     */
    function btCross(v1, v2) {
        return v1.cross(v2);
    }
    exports_4("btCross", btCross);
    /**
     * Return the scalar triple product of three vectors
     * @param v1 First vector
     * @param v2 Second vector
     * @param v3 Third vector
     * @returns Scalar triple product
     */
    function btTriple(v1, v2, v3) {
        return v1.triple(v2, v3);
    }
    exports_4("btTriple", btTriple);
    /**
     * Return the linear interpolation between two vectors
     * @param v1 One vector
     * @param v2 The other vector
     * @param t The ratio of this to v (t = 0 => return v1, t=1 => return v2)
     * @returns Interpolated vector
     */
    function lerp(v1, v2, t) {
        return v1.lerp(v2, t);
    }
    exports_4("lerp", lerp);
    /**
     * Template function btPlaneSpace1 - computes two orthogonal vectors to a given normal vector
     * @param n Normal vector (should be unit length)
     * @param p Output first orthogonal vector
     * @param q Output second orthogonal vector
     */
    function btPlaneSpace1(n, p, q) {
        if (btScalar_1.btFabs(n.z()) > 0.7071067811865475244008443621048490) { // SIMDSQRT12
            // Choose p in y-z plane
            const a = n.y() * n.y() + n.z() * n.z();
            const k = 1.0 / btScalar_1.btSqrt(a);
            p.setValue(0, -n.z() * k, n.y() * k);
            // Set q = n × p
            q.setValue(a * k, -n.x() * p.z(), n.x() * p.y());
        }
        else {
            // Choose p in x-y plane
            const a = n.x() * n.x() + n.y() * n.y();
            const k = 1.0 / btScalar_1.btSqrt(a);
            p.setValue(-n.y() * k, n.x() * k, 0);
            // Set q = n × p
            q.setValue(-n.z() * p.y(), n.z() * p.x(), a * k);
        }
    }
    exports_4("btPlaneSpace1", btPlaneSpace1);
    return {
        setters: [
            function (btQuadWord_1_1) {
                btQuadWord_1 = btQuadWord_1_1;
            },
            function (btScalar_1_1) {
                btScalar_1 = btScalar_1_1;
            },
            function (btMinMax_2_1) {
                btMinMax_2 = btMinMax_2_1;
            }
        ],
        execute: function () {/*
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
            /**
             * btVector3 can be used to represent 3D points and vectors.
             * It has an unused w component to suit 16-byte alignment when btVector3 is stored in containers.
             * This extra component can be used by derived classes (Quaternion?) or by user
             *
             * TypeScript port removes SIMD optimizations and uses scalar implementations.
             */
            btVector3 = class btVector3 extends btQuadWord_1.btQuadWord {
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
                    btScalar_1.btAssert(s !== 0.0, "Division by zero");
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
                    btScalar_1.btAssert(s !== 0.0, "Division by zero");
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
                    return btScalar_1.btSqrt(this.length2());
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
                    if (d > btScalar_1.SIMD_EPSILON) {
                        return btScalar_1.btSqrt(d);
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
                    if (l2 >= btScalar_1.SIMD_EPSILON * btScalar_1.SIMD_EPSILON) {
                        this.divideAssign(btScalar_1.btSqrt(l2));
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
                    btScalar_1.btAssert(!this.fuzzyZero(), "Cannot normalize zero vector");
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
                    const s = btScalar_1.btSqrt(this.length2() * v.length2());
                    btScalar_1.btAssert(s !== 0.0, "Cannot compute angle with zero-length vector");
                    return btScalar_1.btAcos(this.dot(v) / s);
                }
                /**
                 * Return a vector with the absolute values of each element
                 * @returns New vector with absolute values
                 */
                absolute() {
                    return new btVector3(btScalar_1.btFabs(this.m_floats[0]), btScalar_1.btFabs(this.m_floats[1]), btScalar_1.btFabs(this.m_floats[2]));
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
                    return o.add(x.multiply(btScalar_1.btCos(angle))).add(y.multiply(btScalar_1.btSin(angle)));
                }
                /**
                 * Set each element to the max of the current values and the values of another btVector3
                 * @param other The other btVector3 to compare with
                 */
                setMax(other) {
                    this.m_floats[0] = btMinMax_2.btMax(this.m_floats[0], other.m_floats[0]);
                    this.m_floats[1] = btMinMax_2.btMax(this.m_floats[1], other.m_floats[1]);
                    this.m_floats[2] = btMinMax_2.btMax(this.m_floats[2], other.m_floats[2]);
                    this.m_floats[3] = btMinMax_2.btMax(this.m_floats[3], other.w());
                }
                /**
                 * Set each element to the min of the current values and the values of another btVector3
                 * @param other The other btVector3 to compare with
                 */
                setMin(other) {
                    this.m_floats[0] = btMinMax_2.btMin(this.m_floats[0], other.m_floats[0]);
                    this.m_floats[1] = btMinMax_2.btMin(this.m_floats[1], other.m_floats[1]);
                    this.m_floats[2] = btMinMax_2.btMin(this.m_floats[2], other.m_floats[2]);
                    this.m_floats[3] = btMinMax_2.btMin(this.m_floats[3], other.w());
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
                    return this.length2() < btScalar_1.SIMD_EPSILON * btScalar_1.SIMD_EPSILON;
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
                    let maxDot1 = -btScalar_1.SIMD_INFINITY;
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
                    let minDot1 = btScalar_1.SIMD_INFINITY;
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
            };
            exports_4("btVector3", btVector3);
            /**
             * btVector4 extends btVector3 with a fourth component
             * This is kept as a simple extension for compatibility with C++ API
             */
            btVector4 = class btVector4 extends btVector3 {
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
                    return new btVector4(btScalar_1.btFabs(this.m_floats[0]), btScalar_1.btFabs(this.m_floats[1]), btScalar_1.btFabs(this.m_floats[2]), btScalar_1.btFabs(this.m_floats[3]));
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
            };
            exports_4("btVector4", btVector4);
        }
    };
});
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
System.register("src/LinearMath/btQuaternion", ["src/LinearMath/btQuadWord", "src/LinearMath/btVector3", "src/LinearMath/btScalar"], function (exports_5, context_5) {
    "use strict";
    var btQuadWord_2, btVector3_1, btScalar_2, btQuaternion;
    var __moduleName = context_5 && context_5.id;
    // ========== Global Helper Functions ==========
    /**
     * Return the product of two quaternions
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @returns Product quaternion
     */
    function btMultiplyQuaternion(q1, q2) {
        return q1.multiplyQuaternion(q2);
    }
    exports_5("btMultiplyQuaternion", btMultiplyQuaternion);
    /**
     * Return the product of a quaternion and a vector
     * @param q Quaternion
     * @param w Vector (treated as pure quaternion)
     * @returns Product quaternion
     */
    function btMultiplyQuaternionVector(q, w) {
        return q.multiplyVector(w);
    }
    exports_5("btMultiplyQuaternionVector", btMultiplyQuaternionVector);
    /**
     * Return the product of a vector and a quaternion
     * @param w Vector (treated as pure quaternion)
     * @param q Quaternion
     * @returns Product quaternion
     */
    function btMultiplyVectorQuaternion(w, q) {
        return btQuaternion.multiply(w, q);
    }
    exports_5("btMultiplyVectorQuaternion", btMultiplyVectorQuaternion);
    /**
     * Calculate the dot product between two quaternions
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @returns Dot product
     */
    function btDot(q1, q2) {
        return q1.dot(q2);
    }
    exports_5("btDot", btDot);
    /**
     * Return the length of a quaternion
     * @param q Quaternion
     * @returns Length
     */
    function btLength(q) {
        return q.length();
    }
    exports_5("btLength", btLength);
    /**
     * Return the angle between two quaternions
     * @param q1 First quaternion
     * @param q2 Second quaternion
     * @returns Angle between quaternions
     */
    function btAngle(q1, q2) {
        return q1.angle(q2);
    }
    exports_5("btAngle", btAngle);
    /**
     * Return the inverse of a quaternion
     * @param q Quaternion to invert
     * @returns Inverse quaternion
     */
    function btInverse(q) {
        return q.inverse();
    }
    exports_5("btInverse", btInverse);
    /**
     * Return the result of spherical linear interpolation between two quaternions
     * @param q1 The first quaternion
     * @param q2 The second quaternion
     * @param t The ratio between q1 and q2. t = 0 return q1, t=1 returns q2
     * @returns Interpolated quaternion
     */
    function btSlerp(q1, q2, t) {
        return q1.slerp(q2, t);
    }
    exports_5("btSlerp", btSlerp);
    /**
     * Rotate a vector by a quaternion
     * @param rotation The quaternion rotation
     * @param v The vector to rotate
     * @returns Rotated vector
     */
    function btQuatRotate(rotation, v) {
        const q = rotation.multiplyVector(v);
        const result = q.multiplyQuaternion(rotation.inverse());
        return new btVector3_1.btVector3(result.getX(), result.getY(), result.getZ());
    }
    exports_5("btQuatRotate", btQuatRotate);
    /**
     * Return the shortest arc quaternion to rotate vector v0 to v1
     * @param v0 From vector (should be normalized)
     * @param v1 To vector (should be normalized)
     * @returns Shortest arc rotation quaternion
     */
    function btShortestArcQuat(v0, v1) {
        const c = v0.cross(v1);
        const d = v0.dot(v1);
        if (d < -1.0 + btScalar_2.SIMD_EPSILON) {
            // vectors are opposite, pick any orthogonal vector
            const n = new btVector3_1.btVector3();
            const unused = new btVector3_1.btVector3();
            btVector3_1.btPlaneSpace1(v0, n, unused);
            return new btQuaternion(n.x(), n.y(), n.z(), 0.0);
        }
        const s = btScalar_2.btSqrt((1.0 + d) * 2.0);
        const rs = 1.0 / s;
        return new btQuaternion(c.getX() * rs, c.getY() * rs, c.getZ() * rs, s * 0.5);
    }
    exports_5("btShortestArcQuat", btShortestArcQuat);
    /**
     * Return the shortest arc quaternion to rotate vector v0 to v1 (with normalization)
     * @param v0 From vector (will be normalized)
     * @param v1 To vector (will be normalized)
     * @returns Shortest arc rotation quaternion
     */
    function btShortestArcQuatNormalize2(v0, v1) {
        v0.normalize();
        v1.normalize();
        return btShortestArcQuat(v0, v1);
    }
    exports_5("btShortestArcQuatNormalize2", btShortestArcQuatNormalize2);
    return {
        setters: [
            function (btQuadWord_2_1) {
                btQuadWord_2 = btQuadWord_2_1;
            },
            function (btVector3_1_1) {
                btVector3_1 = btVector3_1_1;
            },
            function (btScalar_2_1) {
                btScalar_2 = btScalar_2_1;
            }
        ],
        execute: function () {/*
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
            /**
             * The btQuaternion implements quaternion to perform linear algebra rotations in combination with btMatrix3x3, btVector3 and btTransform.
             * TypeScript port removes SIMD optimizations and uses scalar implementations only.
             */
            btQuaternion = class btQuaternion extends btQuadWord_2.btQuadWord {
                constructor(x, y, z, w) {
                    if (x instanceof btQuaternion) {
                        // Copy constructor
                        super(x.getX(), x.getY(), x.getZ(), x.getW());
                    }
                    else if (x instanceof btVector3_1.btVector3 && typeof y === 'number') {
                        // Axis-angle constructor
                        super();
                        this.setRotation(x, y);
                    }
                    else if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
                        if (typeof w === 'number') {
                            // Four scalar constructor
                            super(x, y, z, w);
                        }
                        else {
                            // Euler angles constructor (yaw, pitch, roll)
                            super();
                            this.setEulerZYX(x, y, z); // Use ZYX as default for TypeScript port
                        }
                    }
                    else {
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
                setRotation(axis, angle) {
                    const d = axis.length();
                    btScalar_2.btAssert(d !== 0.0, "Axis cannot be zero length");
                    const s = btScalar_2.btSin(angle * 0.5) / d;
                    this.setValue(axis.x() * s, axis.y() * s, axis.z() * s, btScalar_2.btCos(angle * 0.5));
                }
                /**
                 * Set the quaternion using Euler angles (YXZ order)
                 * @param yaw Angle around Y
                 * @param pitch Angle around X
                 * @param roll Angle around Z
                 */
                setEuler(yaw, pitch, roll) {
                    const halfYaw = yaw * 0.5;
                    const halfPitch = pitch * 0.5;
                    const halfRoll = roll * 0.5;
                    const cosYaw = btScalar_2.btCos(halfYaw);
                    const sinYaw = btScalar_2.btSin(halfYaw);
                    const cosPitch = btScalar_2.btCos(halfPitch);
                    const sinPitch = btScalar_2.btSin(halfPitch);
                    const cosRoll = btScalar_2.btCos(halfRoll);
                    const sinRoll = btScalar_2.btSin(halfRoll);
                    this.setValue(cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw, cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw, sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw, cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw);
                }
                /**
                 * Set the quaternion using euler angles (ZYX order)
                 * @param yawZ Angle around Z
                 * @param pitchY Angle around Y
                 * @param rollX Angle around X
                 */
                setEulerZYX(yawZ, pitchY, rollX) {
                    const halfYaw = yawZ * 0.5;
                    const halfPitch = pitchY * 0.5;
                    const halfRoll = rollX * 0.5;
                    const cosYaw = btScalar_2.btCos(halfYaw);
                    const sinYaw = btScalar_2.btSin(halfYaw);
                    const cosPitch = btScalar_2.btCos(halfPitch);
                    const sinPitch = btScalar_2.btSin(halfPitch);
                    const cosRoll = btScalar_2.btCos(halfRoll);
                    const sinRoll = btScalar_2.btSin(halfRoll);
                    this.setValue(sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw, // x
                    cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw, // y  
                    cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw, // z
                    cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw // w
                    );
                }
                /**
                 * Get the euler angles from this quaternion (ZYX order)
                 * @param yawZ Output angle around Z
                 * @param pitchY Output angle around Y
                 * @param rollX Output angle around X
                 */
                getEulerZYX(yawZ, pitchY, rollX) {
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
                        pitchY.value = -0.5 * btScalar_2.SIMD_PI;
                        rollX.value = 0;
                        yawZ.value = 2 * btScalar_2.btAtan2(this.m_floats[0], -this.m_floats[1]);
                    }
                    else if (sarg >= 0.99999) {
                        pitchY.value = 0.5 * btScalar_2.SIMD_PI;
                        rollX.value = 0;
                        yawZ.value = 2 * btScalar_2.btAtan2(-this.m_floats[0], this.m_floats[1]);
                    }
                    else {
                        pitchY.value = btScalar_2.btAsin(sarg);
                        rollX.value = btScalar_2.btAtan2(2 * (this.m_floats[1] * this.m_floats[2] + this.m_floats[3] * this.m_floats[0]), squ - sqx - sqy + sqz);
                        yawZ.value = btScalar_2.btAtan2(2 * (this.m_floats[0] * this.m_floats[1] + this.m_floats[3] * this.m_floats[2]), squ + sqx - sqy - sqz);
                    }
                }
                // ========== Arithmetic Operations ==========
                /**
                 * Add a quaternion to this one
                 * @param q The quaternion to add to this one
                 * @returns Reference to this quaternion
                 */
                addAssign(q) {
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
                subtractAssign(q) {
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
                multiplyAssign(s) {
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
                multiplyAssignQuaternion(q) {
                    this.setValue(this.m_floats[3] * q.x() + this.m_floats[0] * q.m_floats[3] + this.m_floats[1] * q.z() - this.m_floats[2] * q.y(), this.m_floats[3] * q.y() + this.m_floats[1] * q.m_floats[3] + this.m_floats[2] * q.x() - this.m_floats[0] * q.z(), this.m_floats[3] * q.z() + this.m_floats[2] * q.m_floats[3] + this.m_floats[0] * q.y() - this.m_floats[1] * q.x(), this.m_floats[3] * q.m_floats[3] - this.m_floats[0] * q.x() - this.m_floats[1] * q.y() - this.m_floats[2] * q.z());
                    return this;
                }
                /**
                 * Inversely scale this quaternion
                 * @param s The scale factor to divide by
                 * @returns Reference to this quaternion
                 */
                divideAssign(s) {
                    btScalar_2.btAssert(s !== 0.0, "Division by zero");
                    return this.multiplyAssign(1.0 / s);
                }
                /**
                 * Add two quaternions
                 * @param q The quaternion to add
                 * @returns New quaternion containing the sum
                 */
                add(q) {
                    const q1 = this;
                    return new btQuaternion(q1.x() + q.x(), q1.y() + q.y(), q1.z() + q.z(), q1.m_floats[3] + q.m_floats[3]);
                }
                /**
                 * Subtract a quaternion from this one
                 * @param q The quaternion to subtract
                 * @returns New quaternion containing the difference
                 */
                subtract(q) {
                    const q1 = this;
                    return new btQuaternion(q1.x() - q.x(), q1.y() - q.y(), q1.z() - q.z(), q1.m_floats[3] - q.m_floats[3]);
                }
                /**
                 * Return a scaled version of this quaternion
                 * @param s The scale factor
                 * @returns New scaled quaternion
                 */
                multiply(s) {
                    return new btQuaternion(this.x() * s, this.y() * s, this.z() * s, this.m_floats[3] * s);
                }
                /**
                 * Multiply this quaternion by another quaternion
                 * @param q The other quaternion
                 * @returns New quaternion result (this * q)
                 */
                multiplyQuaternion(q) {
                    return new btQuaternion(this.m_floats[3] * q.x() + this.m_floats[0] * q.m_floats[3] + this.m_floats[1] * q.z() - this.m_floats[2] * q.y(), this.m_floats[3] * q.y() + this.m_floats[1] * q.m_floats[3] + this.m_floats[2] * q.x() - this.m_floats[0] * q.z(), this.m_floats[3] * q.z() + this.m_floats[2] * q.m_floats[3] + this.m_floats[0] * q.y() - this.m_floats[1] * q.x(), this.m_floats[3] * q.m_floats[3] - this.m_floats[0] * q.x() - this.m_floats[1] * q.y() - this.m_floats[2] * q.z());
                }
                /**
                 * Multiply this quaternion by a vector (as pure quaternion)
                 * @param w The vector
                 * @returns New quaternion result
                 */
                multiplyVector(w) {
                    return new btQuaternion(this.w() * w.x() + this.y() * w.z() - this.z() * w.y(), this.w() * w.y() + this.z() * w.x() - this.x() * w.z(), this.w() * w.z() + this.x() * w.y() - this.y() * w.x(), -this.x() * w.x() - this.y() * w.y() - this.z() * w.z());
                }
                /**
                 * Return an inversely scaled version of this quaternion
                 * @param s The inverse scale factor
                 * @returns New quaternion divided by scalar
                 */
                divide(s) {
                    btScalar_2.btAssert(s !== 0.0, "Division by zero");
                    return this.multiply(1.0 / s);
                }
                /**
                 * Return the negative of this quaternion
                 * @returns New negated quaternion
                 */
                negate() {
                    const q2 = this;
                    return new btQuaternion(-q2.x(), -q2.y(), -q2.z(), -q2.m_floats[3]);
                }
                // ========== Quaternion Operations ==========
                /**
                 * Return the dot product between this quaternion and another
                 * @param q The other quaternion
                 * @returns Dot product result
                 */
                dot(q) {
                    return this.m_floats[0] * q.x() +
                        this.m_floats[1] * q.y() +
                        this.m_floats[2] * q.z() +
                        this.m_floats[3] * q.m_floats[3];
                }
                /**
                 * Return the length squared of the quaternion
                 * @returns Length squared
                 */
                length2() {
                    return this.dot(this);
                }
                /**
                 * Return the length of the quaternion
                 * @returns Quaternion length
                 */
                length() {
                    return btScalar_2.btSqrt(this.length2());
                }
                /**
                 * Safely normalize the quaternion
                 * @returns Reference to this quaternion
                 */
                safeNormalize() {
                    const l2 = this.length2();
                    if (l2 > btScalar_2.SIMD_EPSILON) {
                        this.normalize();
                    }
                    return this;
                }
                /**
                 * Normalize the quaternion
                 * Such that x^2 + y^2 + z^2 + w^2 = 1
                 * @returns Reference to this quaternion
                 */
                normalize() {
                    return this.divideAssign(this.length());
                }
                /**
                 * Return a normalized version of this quaternion
                 * @returns New normalized quaternion
                 */
                normalized() {
                    return this.divide(this.length());
                }
                /**
                 * Return the angle between this quaternion and the other
                 * @param q The other quaternion
                 * @returns Half angle between quaternions
                 */
                angle(q) {
                    const s = btScalar_2.btSqrt(this.length2() * q.length2());
                    btScalar_2.btAssert(s !== 0.0, "Cannot compute angle with zero-length quaternion");
                    return btScalar_2.btAcos(this.dot(q) / s);
                }
                /**
                 * Return the angle between this quaternion and the other along the shortest path
                 * @param q The other quaternion
                 * @returns Full angle between quaternions along shortest path
                 */
                angleShortestPath(q) {
                    const s = btScalar_2.btSqrt(this.length2() * q.length2());
                    btScalar_2.btAssert(s !== 0.0, "Cannot compute angle with zero-length quaternion");
                    if (this.dot(q) < 0) { // Take care of long angle case see http://en.wikipedia.org/wiki/Slerp
                        return btScalar_2.btAcos(this.dot(q.negate()) / s) * 2.0;
                    }
                    else {
                        return btScalar_2.btAcos(this.dot(q) / s) * 2.0;
                    }
                }
                /**
                 * Return the angle [0, 2Pi] of rotation represented by this quaternion
                 * @returns Rotation angle
                 */
                getAngle() {
                    return 2.0 * btScalar_2.btAcos(this.m_floats[3]);
                }
                /**
                 * Return the angle [0, Pi] of rotation represented by this quaternion along the shortest path
                 * @returns Shortest path rotation angle
                 */
                getAngleShortestPath() {
                    let s;
                    if (this.m_floats[3] >= 0) {
                        s = 2.0 * btScalar_2.btAcos(this.m_floats[3]);
                    }
                    else {
                        s = 2.0 * btScalar_2.btAcos(-this.m_floats[3]);
                    }
                    return s;
                }
                /**
                 * Return the axis of the rotation represented by this quaternion
                 * @returns Rotation axis (unit vector)
                 */
                getAxis() {
                    const s_squared = 1.0 - this.m_floats[3] * this.m_floats[3];
                    if (s_squared < 10.0 * btScalar_2.SIMD_EPSILON) { // Check for divide by zero
                        return new btVector3_1.btVector3(1.0, 0.0, 0.0); // Arbitrary
                    }
                    const s = 1.0 / btScalar_2.btSqrt(s_squared);
                    return new btVector3_1.btVector3(this.m_floats[0] * s, this.m_floats[1] * s, this.m_floats[2] * s);
                }
                /**
                 * Return the inverse of this quaternion
                 * @returns Inverse quaternion
                 */
                inverse() {
                    return new btQuaternion(-this.m_floats[0], -this.m_floats[1], -this.m_floats[2], this.m_floats[3]);
                }
                /**
                 * Return the farthest quaternion representation (for interpolation)
                 * @param qd The destination quaternion
                 * @returns Farthest quaternion
                 */
                farthest(qd) {
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
                nearest(qd) {
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
                slerp(q, t) {
                    const magnitude = btScalar_2.btSqrt(this.length2() * q.length2());
                    btScalar_2.btAssert(magnitude > 0, "Cannot slerp with zero-length quaternions");
                    const product = this.dot(q) / magnitude;
                    const absproduct = btScalar_2.btFabs(product);
                    if (absproduct < 1.0 - btScalar_2.SIMD_EPSILON) {
                        // Take care of long angle case see http://en.wikipedia.org/wiki/Slerp
                        const theta = btScalar_2.btAcos(absproduct);
                        const d = btScalar_2.btSin(theta);
                        btScalar_2.btAssert(d > 0, "Division by zero in slerp");
                        const sign = (product < 0) ? -1.0 : 1.0;
                        const s0 = btScalar_2.btSin((1.0 - t) * theta) / d;
                        const s1 = btScalar_2.btSin(sign * t * theta) / d;
                        return new btQuaternion((this.m_floats[0] * s0 + q.x() * s1), (this.m_floats[1] * s0 + q.y() * s1), (this.m_floats[2] * s0 + q.z() * s1), (this.m_floats[3] * s0 + q.w() * s1));
                    }
                    else {
                        return new btQuaternion(this);
                    }
                }
                // ========== btQuadWord Overrides ==========
                /**
                 * Get the W component
                 * @returns W value
                 */
                getW() {
                    return this.m_floats[3];
                }
                /**
                 * Create a copy of this btQuaternion
                 * @returns A new btQuaternion with the same values
                 */
                clone() {
                    return new btQuaternion(this.m_floats[0], this.m_floats[1], this.m_floats[2], this.m_floats[3]);
                }
                /**
                 * Copy values from another btQuaternion
                 * @param other The btQuaternion to copy from
                 */
                copy(other) {
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
                static getIdentity() {
                    return new btQuaternion(0.0, 0.0, 0.0, 1.0);
                }
                /**
                 * Add two quaternions (static version)
                 * @param q1 First quaternion
                 * @param q2 Second quaternion
                 * @returns Sum of the two quaternions
                 */
                static add(q1, q2) {
                    return q1.add(q2);
                }
                /**
                 * Subtract two quaternions (static version)
                 * @param q1 First quaternion
                 * @param q2 Second quaternion
                 * @returns Difference of the two quaternions
                 */
                static subtract(q1, q2) {
                    return q1.subtract(q2);
                }
                static multiply(arg1, arg2) {
                    if (typeof arg1 === 'number' && arg2 instanceof btQuaternion) {
                        return arg2.multiply(arg1);
                    }
                    else if (arg1 instanceof btQuaternion && typeof arg2 === 'number') {
                        return arg1.multiply(arg2);
                    }
                    else if (arg1 instanceof btQuaternion && arg2 instanceof btQuaternion) {
                        return arg1.multiplyQuaternion(arg2);
                    }
                    else if (arg1 instanceof btQuaternion && arg2 instanceof btVector3_1.btVector3) {
                        return arg1.multiplyVector(arg2);
                    }
                    else if (arg1 instanceof btVector3_1.btVector3 && arg2 instanceof btQuaternion) {
                        return btQuaternion.multiplyVectorQuaternion(arg1, arg2);
                    }
                    else {
                        throw new Error("Invalid arguments for btQuaternion.multiply");
                    }
                }
                /**
                 * Multiply vector by quaternion (static helper)
                 * @param w Vector
                 * @param q Quaternion
                 * @returns Result quaternion
                 */
                static multiplyVectorQuaternion(w, q) {
                    return new btQuaternion(w.x() * q.w() + w.y() * q.z() - w.z() * q.y(), w.y() * q.w() + w.z() * q.x() - w.x() * q.z(), w.z() * q.w() + w.x() * q.y() - w.y() * q.x(), -w.x() * q.x() - w.y() * q.y() - w.z() * q.z());
                }
                /**
                 * Divide quaternion by scalar (static version)
                 * @param q Quaternion
                 * @param s Scalar
                 * @returns Divided quaternion
                 */
                static divide(q, s) {
                    return q.divide(s);
                }
                /**
                 * Negate quaternion (static version)
                 * @param q Quaternion to negate
                 * @returns Negated quaternion
                 */
                static negate(q) {
                    return q.negate();
                }
                /**
                 * Dot product (static version)
                 * @param q1 First quaternion
                 * @param q2 Second quaternion
                 * @returns Dot product
                 */
                static dot(q1, q2) {
                    return q1.dot(q2);
                }
                /**
                 * Length (static version)
                 * @param q Quaternion
                 * @returns Quaternion length
                 */
                static getLength(q) {
                    return q.length();
                }
                /**
                 * Angle between quaternions (static version)
                 * @param q1 First quaternion
                 * @param q2 Second quaternion
                 * @returns Angle between quaternions
                 */
                static angle(q1, q2) {
                    return q1.angle(q2);
                }
                /**
                 * Inverse (static version)
                 * @param q Quaternion to invert
                 * @returns Inverse quaternion
                 */
                static inverse(q) {
                    return q.inverse();
                }
                /**
                 * Spherical linear interpolation (static version)
                 * @param q1 First quaternion
                 * @param q2 Second quaternion
                 * @param t Interpolation parameter
                 * @returns Interpolated quaternion
                 */
                static slerp(q1, q2, t) {
                    return q1.slerp(q2, t);
                }
            };
            exports_5("btQuaternion", btQuaternion);
        }
    };
});
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
System.register("src/LinearMath/btMatrix3x3", ["src/LinearMath/btVector3", "src/LinearMath/btQuaternion", "src/LinearMath/btScalar"], function (exports_6, context_6) {
    "use strict";
    var btVector3_2, btQuaternion_1, btScalar_3, btMatrix3x3;
    var __moduleName = context_6 && context_6.id;
    // ========== Static Functions and Operators ==========
    /**
     * Matrix multiplication by scalar
     * @param m Matrix
     * @param k Scalar
     * @returns Scaled matrix
     */
    function multiplyMatrixScalar(m, k) {
        return new btMatrix3x3(m.getRow(0).getX() * k, m.getRow(0).getY() * k, m.getRow(0).getZ() * k, m.getRow(1).getX() * k, m.getRow(1).getY() * k, m.getRow(1).getZ() * k, m.getRow(2).getX() * k, m.getRow(2).getY() * k, m.getRow(2).getZ() * k);
    }
    exports_6("multiplyMatrixScalar", multiplyMatrixScalar);
    /**
     * Matrix addition
     * @param m1 First matrix
     * @param m2 Second matrix
     * @returns Sum matrix
     */
    function addMatrices(m1, m2) {
        return new btMatrix3x3(m1.getRow(0).getX() + m2.getRow(0).getX(), m1.getRow(0).getY() + m2.getRow(0).getY(), m1.getRow(0).getZ() + m2.getRow(0).getZ(), m1.getRow(1).getX() + m2.getRow(1).getX(), m1.getRow(1).getY() + m2.getRow(1).getY(), m1.getRow(1).getZ() + m2.getRow(1).getZ(), m1.getRow(2).getX() + m2.getRow(2).getX(), m1.getRow(2).getY() + m2.getRow(2).getY(), m1.getRow(2).getZ() + m2.getRow(2).getZ());
    }
    exports_6("addMatrices", addMatrices);
    /**
     * Matrix subtraction
     * @param m1 First matrix
     * @param m2 Second matrix
     * @returns Difference matrix
     */
    function subtractMatrices(m1, m2) {
        return new btMatrix3x3(m1.getRow(0).getX() - m2.getRow(0).getX(), m1.getRow(0).getY() - m2.getRow(0).getY(), m1.getRow(0).getZ() - m2.getRow(0).getZ(), m1.getRow(1).getX() - m2.getRow(1).getX(), m1.getRow(1).getY() - m2.getRow(1).getY(), m1.getRow(1).getZ() - m2.getRow(1).getZ(), m1.getRow(2).getX() - m2.getRow(2).getX(), m1.getRow(2).getY() - m2.getRow(2).getY(), m1.getRow(2).getZ() - m2.getRow(2).getZ());
    }
    exports_6("subtractMatrices", subtractMatrices);
    /**
     * Matrix-Vector multiplication (m * v)
     * @param m Matrix
     * @param v Vector
     * @returns Result vector
     */
    function multiplyMatrixVector(m, v) {
        return new btVector3_2.btVector3(btVector3_2.btDot(m.getRow(0), v), btVector3_2.btDot(m.getRow(1), v), btVector3_2.btDot(m.getRow(2), v));
    }
    exports_6("multiplyMatrixVector", multiplyMatrixVector);
    /**
     * Vector-Matrix multiplication (v * m)
     * @param v Vector
     * @param m Matrix
     * @returns Result vector
     */
    function multiplyVectorMatrix(v, m) {
        return new btVector3_2.btVector3(m.tdotx(v), m.tdoty(v), m.tdotz(v));
    }
    exports_6("multiplyVectorMatrix", multiplyVectorMatrix);
    /**
     * Matrix-Matrix multiplication (m1 * m2)
     * @param m1 First matrix
     * @param m2 Second matrix
     * @returns Product matrix
     */
    function multiplyMatrices(m1, m2) {
        return new btMatrix3x3(m2.tdotx(m1.getRow(0)), m2.tdoty(m1.getRow(0)), m2.tdotz(m1.getRow(0)), m2.tdotx(m1.getRow(1)), m2.tdoty(m1.getRow(1)), m2.tdotz(m1.getRow(1)), m2.tdotx(m1.getRow(2)), m2.tdoty(m1.getRow(2)), m2.tdotz(m1.getRow(2)));
    }
    exports_6("multiplyMatrices", multiplyMatrices);
    /**
     * Test equality between two matrices
     * @param m1 First matrix
     * @param m2 Second matrix
     * @returns True if matrices are equal
     */
    function matricesEqual(m1, m2) {
        return m1.equals(m2);
    }
    exports_6("matricesEqual", matricesEqual);
    return {
        setters: [
            function (btVector3_2_1) {
                btVector3_2 = btVector3_2_1;
            },
            function (btQuaternion_1_1) {
                btQuaternion_1 = btQuaternion_1_1;
            },
            function (btScalar_3_1) {
                btScalar_3 = btScalar_3_1;
            }
        ],
        execute: function () {/*
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
            /**
             * The btMatrix3x3 class implements a 3x3 rotation matrix, to perform linear algebra
             * in combination with btQuaternion, btTransform and btVector3.
             * Make sure to only include a pure orthogonal matrix without scaling.
             *
             * TypeScript port removes SIMD optimizations and uses scalar implementations only.
             */
            btMatrix3x3 = class btMatrix3x3 {
                constructor(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
                    this.m_el = [new btVector3_2.btVector3(0, 0, 0), new btVector3_2.btVector3(0, 0, 0), new btVector3_2.btVector3(0, 0, 0)];
                    if (arg0 instanceof btQuaternion_1.btQuaternion) {
                        // Constructor from quaternion
                        this.setRotation(arg0);
                    }
                    else if (arg0 instanceof btMatrix3x3) {
                        // Copy constructor
                        this.m_el[0] = new btVector3_2.btVector3(arg0.m_el[0]);
                        this.m_el[1] = new btVector3_2.btVector3(arg0.m_el[1]);
                        this.m_el[2] = new btVector3_2.btVector3(arg0.m_el[2]);
                    }
                    else if (arg0 instanceof btVector3_2.btVector3 && arg1 instanceof btVector3_2.btVector3 && arg2 instanceof btVector3_2.btVector3) {
                        // Constructor from three vectors
                        this.m_el[0] = new btVector3_2.btVector3(arg0);
                        this.m_el[1] = new btVector3_2.btVector3(arg1);
                        this.m_el[2] = new btVector3_2.btVector3(arg2);
                    }
                    else if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number' &&
                        typeof arg3 === 'number' && typeof arg4 === 'number' && typeof arg5 === 'number' &&
                        typeof arg6 === 'number' && typeof arg7 === 'number' && typeof arg8 === 'number') {
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
                getColumn(i) {
                    btScalar_3.btAssert(0 <= i && i < 3);
                    if (i === 0) {
                        return new btVector3_2.btVector3(this.m_el[0].getX(), this.m_el[1].getX(), this.m_el[2].getX());
                    }
                    else if (i === 1) {
                        return new btVector3_2.btVector3(this.m_el[0].getY(), this.m_el[1].getY(), this.m_el[2].getY());
                    }
                    else {
                        return new btVector3_2.btVector3(this.m_el[0].getZ(), this.m_el[1].getZ(), this.m_el[2].getZ());
                    }
                }
                /**
                 * Get a row of the matrix as a vector
                 * @param i Row number 0 indexed
                 * @returns Row vector (const reference)
                 */
                getRow(i) {
                    btScalar_3.btAssert(0 <= i && i < 3);
                    return this.m_el[i];
                }
                /**
                 * Get a mutable reference to a row of the matrix as a vector
                 * @param i Row number 0 indexed
                 * @returns Mutable row vector
                 */
                getElement(i) {
                    btScalar_3.btAssert(0 <= i && i < 3);
                    return this.m_el[i];
                }
                /**
                 * Get element at row i, column j
                 * @param i Row index
                 * @param j Column index
                 * @returns Element value
                 */
                getValue(i, j) {
                    btScalar_3.btAssert(0 <= i && i < 3);
                    btScalar_3.btAssert(0 <= j && j < 3);
                    if (j === 0)
                        return this.m_el[i].getX();
                    if (j === 1)
                        return this.m_el[i].getY();
                    return this.m_el[i].getZ();
                }
                /**
                 * Set element at row i, column j
                 * @param i Row index
                 * @param j Column index
                 * @param value Value to set
                 */
                setMatrixElement(i, j, value) {
                    btScalar_3.btAssert(0 <= i && i < 3);
                    btScalar_3.btAssert(0 <= j && j < 3);
                    if (j === 0) {
                        this.m_el[i].setX(value);
                    }
                    else if (j === 1) {
                        this.m_el[i].setY(value);
                    }
                    else {
                        this.m_el[i].setZ(value);
                    }
                }
                // ========== Matrix Assignment Operations ==========
                /**
                 * Multiply by the target matrix on the right
                 * @param m Rotation matrix to be applied
                 * @returns This matrix (equivalent to this = this * m)
                 */
                multiplyAssign(m) {
                    this.setValue(m.tdotx(this.m_el[0]), m.tdoty(this.m_el[0]), m.tdotz(this.m_el[0]), m.tdotx(this.m_el[1]), m.tdoty(this.m_el[1]), m.tdotz(this.m_el[1]), m.tdotx(this.m_el[2]), m.tdoty(this.m_el[2]), m.tdotz(this.m_el[2]));
                    return this;
                }
                /**
                 * Add by the target matrix on the right
                 * @param m Matrix to be applied
                 * @returns This matrix (equivalent to this = this + m)
                 */
                addAssign(m) {
                    this.setValue(this.m_el[0].getX() + m.m_el[0].getX(), this.m_el[0].getY() + m.m_el[0].getY(), this.m_el[0].getZ() + m.m_el[0].getZ(), this.m_el[1].getX() + m.m_el[1].getX(), this.m_el[1].getY() + m.m_el[1].getY(), this.m_el[1].getZ() + m.m_el[1].getZ(), this.m_el[2].getX() + m.m_el[2].getX(), this.m_el[2].getY() + m.m_el[2].getY(), this.m_el[2].getZ() + m.m_el[2].getZ());
                    return this;
                }
                /**
                 * Subtract by the target matrix on the right
                 * @param m Matrix to be applied
                 * @returns This matrix (equivalent to this = this - m)
                 */
                subtractAssign(m) {
                    this.setValue(this.m_el[0].getX() - m.m_el[0].getX(), this.m_el[0].getY() - m.m_el[0].getY(), this.m_el[0].getZ() - m.m_el[0].getZ(), this.m_el[1].getX() - m.m_el[1].getX(), this.m_el[1].getY() - m.m_el[1].getY(), this.m_el[1].getZ() - m.m_el[1].getZ(), this.m_el[2].getX() - m.m_el[2].getX(), this.m_el[2].getY() - m.m_el[2].getY(), this.m_el[2].getZ() - m.m_el[2].getZ());
                    return this;
                }
                // ========== Matrix Setting Methods ==========
                /**
                 * Set from the rotational part of a 4x4 OpenGL matrix
                 * @param m A pointer to the beginning of the array of scalars
                 */
                setFromOpenGLSubMatrix(m) {
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
                setValue(xx, xy, xz, yx, yy, yz, zx, zy, zz) {
                    this.m_el[0].setValue(xx, xy, xz);
                    this.m_el[1].setValue(yx, yy, yz);
                    this.m_el[2].setValue(zx, zy, zz);
                }
                /**
                 * Set the matrix from a quaternion
                 * @param q The Quaternion to match
                 */
                setRotation(q) {
                    const d = q.length2();
                    btScalar_3.btAssert(d !== 0.0);
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
                    this.setValue(1.0 - (yy + zz), xy - wz, xz + wy, xy + wz, 1.0 - (xx + zz), yz - wx, xz - wy, yz + wx, 1.0 - (xx + yy));
                }
                /**
                 * Set the matrix from euler angles using YPR around YXZ respectively
                 * @param yaw Yaw about Y axis
                 * @param pitch Pitch about X axis
                 * @param roll Roll about Z axis
                 */
                setEulerYPR(yaw, pitch, roll) {
                    this.setEulerZYX(roll, pitch, yaw);
                }
                /**
                 * Set the matrix from euler angles YPR around ZYX axes
                 * @param eulerX Roll about X axis
                 * @param eulerY Pitch around Y axis
                 * @param eulerZ Yaw about Z axis
                 */
                setEulerZYX(eulerX, eulerY, eulerZ) {
                    const ci = btScalar_3.btCos(eulerX);
                    const cj = btScalar_3.btCos(eulerY);
                    const ch = btScalar_3.btCos(eulerZ);
                    const si = btScalar_3.btSin(eulerX);
                    const sj = btScalar_3.btSin(eulerY);
                    const sh = btScalar_3.btSin(eulerZ);
                    const cc = ci * ch;
                    const cs = ci * sh;
                    const sc = si * ch;
                    const ss = si * sh;
                    this.setValue(cj * ch, sj * sc - cs, sj * cc + ss, cj * sh, sj * ss + cc, sj * cs - sc, -sj, cj * si, cj * ci);
                }
                /**
                 * Set the matrix to the identity
                 */
                setIdentity() {
                    this.setValue(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
                }
                /**
                 * Set the matrix to zero
                 */
                setZero() {
                    this.setValue(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);
                }
                /**
                 * Get the identity matrix
                 * @returns Identity matrix
                 */
                static getIdentity() {
                    const identityMatrix = new btMatrix3x3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
                    return identityMatrix;
                }
                // ========== OpenGL Conversion ==========
                /**
                 * Fill the rotational part of an OpenGL matrix and clear the shear/perspective
                 * @param m The array to be filled
                 */
                getOpenGLSubMatrix(m) {
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
                getRotation(q) {
                    const trace = this.m_el[0].getX() + this.m_el[1].getY() + this.m_el[2].getZ();
                    const temp = [0, 0, 0, 0];
                    if (trace > 0.0) {
                        const s = btScalar_3.btSqrt(trace + 1.0);
                        temp[3] = s * 0.5;
                        const s_inv = 0.5 / s;
                        temp[0] = (this.m_el[2].getY() - this.m_el[1].getZ()) * s_inv;
                        temp[1] = (this.m_el[0].getZ() - this.m_el[2].getX()) * s_inv;
                        temp[2] = (this.m_el[1].getX() - this.m_el[0].getY()) * s_inv;
                    }
                    else {
                        const i = this.m_el[0].getX() < this.m_el[1].getY() ?
                            (this.m_el[1].getY() < this.m_el[2].getZ() ? 2 : 1) :
                            (this.m_el[0].getX() < this.m_el[2].getZ() ? 2 : 0);
                        const j = (i + 1) % 3;
                        const k = (i + 2) % 3;
                        const s = btScalar_3.btSqrt(this.getValue(i, i) - this.getValue(j, j) - this.getValue(k, k) + 1.0);
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
                getEulerYPR() {
                    // first use the normal calculus
                    let yaw = btScalar_3.btAtan2(this.m_el[1].getX(), this.m_el[0].getX());
                    let pitch = btScalar_3.btAsin(-this.m_el[2].getX());
                    let roll = btScalar_3.btAtan2(this.m_el[2].getY(), this.m_el[2].getZ());
                    // on pitch = +/-HalfPI
                    if (btScalar_3.btFabs(pitch) === btScalar_3.SIMD_HALF_PI) {
                        if (yaw > 0) {
                            yaw -= btScalar_3.SIMD_PI;
                        }
                        else {
                            yaw += btScalar_3.SIMD_PI;
                        }
                        if (roll > 0) {
                            roll -= btScalar_3.SIMD_PI;
                        }
                        else {
                            roll += btScalar_3.SIMD_PI;
                        }
                    }
                    return { yaw, pitch, roll };
                }
                /**
                 * Get the matrix represented as euler angles around ZYX
                 * @param solutionNumber Which solution of two possible solutions (1 or 2)
                 * @returns Object with yaw, pitch, roll values
                 */
                getEulerZYX(solutionNumber = 1) {
                    let eulerOut = { yaw: 0, pitch: 0, roll: 0 };
                    let eulerOut2 = { yaw: 0, pitch: 0, roll: 0 };
                    // Check that pitch is not at a singularity
                    if (btScalar_3.btFabs(this.m_el[2].getX()) >= 1) {
                        eulerOut.yaw = 0;
                        eulerOut2.yaw = 0;
                        // From difference of angles formula
                        const delta = btScalar_3.btAtan2(this.m_el[0].getX(), this.m_el[0].getZ());
                        if (this.m_el[2].getX() > 0) { // gimbal locked up
                            eulerOut.pitch = btScalar_3.SIMD_PI / 2.0;
                            eulerOut2.pitch = btScalar_3.SIMD_PI / 2.0;
                            eulerOut.roll = eulerOut.pitch + delta;
                            eulerOut2.roll = eulerOut.pitch + delta;
                        }
                        else { // gimbal locked down
                            eulerOut.pitch = -btScalar_3.SIMD_PI / 2.0;
                            eulerOut2.pitch = -btScalar_3.SIMD_PI / 2.0;
                            eulerOut.roll = -eulerOut.pitch + delta;
                            eulerOut2.roll = -eulerOut.pitch + delta;
                        }
                    }
                    else {
                        eulerOut.pitch = -btScalar_3.btAsin(this.m_el[2].getX());
                        eulerOut2.pitch = btScalar_3.SIMD_PI - eulerOut.pitch;
                        eulerOut.roll = btScalar_3.btAtan2(this.m_el[2].getY() / btScalar_3.btCos(eulerOut.pitch), this.m_el[2].getZ() / btScalar_3.btCos(eulerOut.pitch));
                        eulerOut2.roll = btScalar_3.btAtan2(this.m_el[2].getY() / btScalar_3.btCos(eulerOut2.pitch), this.m_el[2].getZ() / btScalar_3.btCos(eulerOut2.pitch));
                        eulerOut.yaw = btScalar_3.btAtan2(this.m_el[1].getX() / btScalar_3.btCos(eulerOut.pitch), this.m_el[0].getX() / btScalar_3.btCos(eulerOut.pitch));
                        eulerOut2.yaw = btScalar_3.btAtan2(this.m_el[1].getX() / btScalar_3.btCos(eulerOut2.pitch), this.m_el[0].getX() / btScalar_3.btCos(eulerOut2.pitch));
                    }
                    if (solutionNumber === 1) {
                        return eulerOut;
                    }
                    else {
                        return eulerOut2;
                    }
                }
                // ========== Matrix Operations ==========
                /**
                 * Create a scaled copy of the matrix
                 * @param s Scaling vector. The elements of the vector will scale each column
                 * @returns Scaled matrix
                 */
                scaled(s) {
                    return new btMatrix3x3(this.m_el[0].getX() * s.getX(), this.m_el[0].getY() * s.getY(), this.m_el[0].getZ() * s.getZ(), this.m_el[1].getX() * s.getX(), this.m_el[1].getY() * s.getY(), this.m_el[1].getZ() * s.getZ(), this.m_el[2].getX() * s.getX(), this.m_el[2].getY() * s.getY(), this.m_el[2].getZ() * s.getZ());
                }
                /**
                 * Return the determinant of the matrix
                 */
                determinant() {
                    return btVector3_2.btTriple(this.m_el[0], this.m_el[1], this.m_el[2]);
                }
                /**
                 * Return the adjoint of the matrix
                 */
                adjoint() {
                    return new btMatrix3x3(this.cofac(1, 1, 2, 2), this.cofac(0, 2, 2, 1), this.cofac(0, 1, 1, 2), this.cofac(1, 2, 2, 0), this.cofac(0, 0, 2, 2), this.cofac(0, 2, 1, 0), this.cofac(1, 0, 2, 1), this.cofac(0, 1, 2, 0), this.cofac(0, 0, 1, 1));
                }
                /**
                 * Return the matrix with all values non negative
                 */
                absolute() {
                    return new btMatrix3x3(btScalar_3.btFabs(this.m_el[0].getX()), btScalar_3.btFabs(this.m_el[0].getY()), btScalar_3.btFabs(this.m_el[0].getZ()), btScalar_3.btFabs(this.m_el[1].getX()), btScalar_3.btFabs(this.m_el[1].getY()), btScalar_3.btFabs(this.m_el[1].getZ()), btScalar_3.btFabs(this.m_el[2].getX()), btScalar_3.btFabs(this.m_el[2].getY()), btScalar_3.btFabs(this.m_el[2].getZ()));
                }
                /**
                 * Return the transpose of the matrix
                 */
                transpose() {
                    return new btMatrix3x3(this.m_el[0].getX(), this.m_el[1].getX(), this.m_el[2].getX(), this.m_el[0].getY(), this.m_el[1].getY(), this.m_el[2].getY(), this.m_el[0].getZ(), this.m_el[1].getZ(), this.m_el[2].getZ());
                }
                /**
                 * Return the inverse of the matrix
                 */
                inverse() {
                    const co = new btVector3_2.btVector3(this.cofac(1, 1, 2, 2), this.cofac(1, 2, 2, 0), this.cofac(1, 0, 2, 1));
                    const det = btVector3_2.btDot(this.m_el[0], co);
                    btScalar_3.btAssert(det !== 0.0);
                    const s = 1.0 / det;
                    return new btMatrix3x3(co.getX() * s, this.cofac(0, 2, 2, 1) * s, this.cofac(0, 1, 1, 2) * s, co.getY() * s, this.cofac(0, 0, 2, 2) * s, this.cofac(0, 2, 1, 0) * s, co.getZ() * s, this.cofac(0, 1, 2, 0) * s, this.cofac(0, 0, 1, 1) * s);
                }
                /**
                 * Solve A * x = b, where b is a column vector. This is more efficient
                 * than computing the inverse in one-shot cases.
                 * Solve33 is from Box2d, thanks to Erin Catto
                 * @param b Column vector
                 * @returns Solution vector
                 */
                solve33(b) {
                    const col1 = this.getColumn(0);
                    const col2 = this.getColumn(1);
                    const col3 = this.getColumn(2);
                    let det = btVector3_2.btDot(col1, btVector3_2.btCross(col2, col3));
                    if (btScalar_3.btFabs(det) > btScalar_3.SIMD_EPSILON) {
                        det = 1.0 / det;
                    }
                    const x = new btVector3_2.btVector3(det * btVector3_2.btDot(b, btVector3_2.btCross(col2, col3)), det * btVector3_2.btDot(col1, btVector3_2.btCross(b, col3)), det * btVector3_2.btDot(col1, btVector3_2.btCross(col2, b)));
                    return x;
                }
                /**
                 * Multiply this^T * m
                 * @param m Matrix to multiply with
                 * @returns Result matrix
                 */
                transposeTimes(m) {
                    return new btMatrix3x3(this.m_el[0].getX() * m.m_el[0].getX() + this.m_el[1].getX() * m.m_el[1].getX() + this.m_el[2].getX() * m.m_el[2].getX(), this.m_el[0].getX() * m.m_el[0].getY() + this.m_el[1].getX() * m.m_el[1].getY() + this.m_el[2].getX() * m.m_el[2].getY(), this.m_el[0].getX() * m.m_el[0].getZ() + this.m_el[1].getX() * m.m_el[1].getZ() + this.m_el[2].getX() * m.m_el[2].getZ(), this.m_el[0].getY() * m.m_el[0].getX() + this.m_el[1].getY() * m.m_el[1].getX() + this.m_el[2].getY() * m.m_el[2].getX(), this.m_el[0].getY() * m.m_el[0].getY() + this.m_el[1].getY() * m.m_el[1].getY() + this.m_el[2].getY() * m.m_el[2].getY(), this.m_el[0].getY() * m.m_el[0].getZ() + this.m_el[1].getY() * m.m_el[1].getZ() + this.m_el[2].getY() * m.m_el[2].getZ(), this.m_el[0].getZ() * m.m_el[0].getX() + this.m_el[1].getZ() * m.m_el[1].getX() + this.m_el[2].getZ() * m.m_el[2].getX(), this.m_el[0].getZ() * m.m_el[0].getY() + this.m_el[1].getZ() * m.m_el[1].getY() + this.m_el[2].getZ() * m.m_el[2].getY(), this.m_el[0].getZ() * m.m_el[0].getZ() + this.m_el[1].getZ() * m.m_el[1].getZ() + this.m_el[2].getZ() * m.m_el[2].getZ());
                }
                /**
                 * Multiply this * m^T
                 * @param m Matrix to multiply with (transposed)
                 * @returns Result matrix
                 */
                timesTranspose(m) {
                    return new btMatrix3x3(btVector3_2.btDot(this.m_el[0], m.m_el[0]), btVector3_2.btDot(this.m_el[0], m.m_el[1]), btVector3_2.btDot(this.m_el[0], m.m_el[2]), btVector3_2.btDot(this.m_el[1], m.m_el[0]), btVector3_2.btDot(this.m_el[1], m.m_el[1]), btVector3_2.btDot(this.m_el[1], m.m_el[2]), btVector3_2.btDot(this.m_el[2], m.m_el[0]), btVector3_2.btDot(this.m_el[2], m.m_el[1]), btVector3_2.btDot(this.m_el[2], m.m_el[2]));
                }
                // ========== Utility Methods ==========
                /**
                 * Transpose dot x - multiply column x of this^T with v
                 * @param v Vector to multiply with
                 * @returns Scalar result
                 */
                tdotx(v) {
                    return this.m_el[0].getX() * v.getX() + this.m_el[1].getX() * v.getY() + this.m_el[2].getX() * v.getZ();
                }
                /**
                 * Transpose dot y - multiply column y of this^T with v
                 * @param v Vector to multiply with
                 * @returns Scalar result
                 */
                tdoty(v) {
                    return this.m_el[0].getY() * v.getX() + this.m_el[1].getY() * v.getY() + this.m_el[2].getY() * v.getZ();
                }
                /**
                 * Transpose dot z - multiply column z of this^T with v
                 * @param v Vector to multiply with
                 * @returns Scalar result
                 */
                tdotz(v) {
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
                cofac(r1, c1, r2, c2) {
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
                extractRotation(q, tolerance = 1.0e-9, maxIter = 100) {
                    let iter = 0;
                    let w;
                    const A = this;
                    for (iter = 0; iter < maxIter; iter++) {
                        const R = new btMatrix3x3(q);
                        const cross1 = btVector3_2.btCross(R.getColumn(0), A.getColumn(0));
                        const cross2 = btVector3_2.btCross(R.getColumn(1), A.getColumn(1));
                        const cross3 = btVector3_2.btCross(R.getColumn(2), A.getColumn(2));
                        const crossSum = cross1.add(cross2).add(cross3);
                        const dotSum = btVector3_2.btDot(R.getColumn(0), A.getColumn(0)) +
                            btVector3_2.btDot(R.getColumn(1), A.getColumn(1)) +
                            btVector3_2.btDot(R.getColumn(2), A.getColumn(2));
                        const scale = 1.0 / (btScalar_3.btFabs(dotSum) + tolerance);
                        const omega = crossSum.multiply(scale);
                        w = omega.length();
                        if (w < tolerance)
                            break;
                        const omegaNormalized = omega.multiply(1.0 / w);
                        const newQ = new btQuaternion_1.btQuaternion(omegaNormalized, w);
                        q.setValue(newQ.getX() * q.getW() + newQ.getW() * q.getX() + newQ.getY() * q.getZ() - newQ.getZ() * q.getY(), newQ.getY() * q.getW() + newQ.getW() * q.getY() + newQ.getZ() * q.getX() - newQ.getX() * q.getZ(), newQ.getZ() * q.getW() + newQ.getW() * q.getZ() + newQ.getX() * q.getY() - newQ.getY() * q.getX(), newQ.getW() * q.getW() - newQ.getX() * q.getX() - newQ.getY() * q.getY() - newQ.getZ() * q.getZ());
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
                diagonalize(rot, threshold, maxSteps) {
                    rot.setIdentity();
                    for (let step = maxSteps; step > 0; step--) {
                        // find off-diagonal element [p][q] with largest magnitude
                        let p = 0;
                        let q = 1;
                        let r = 2;
                        let max = btScalar_3.btFabs(this.getValue(0, 1));
                        let v = btScalar_3.btFabs(this.getValue(0, 2));
                        if (v > max) {
                            q = 2;
                            r = 1;
                            max = v;
                        }
                        v = btScalar_3.btFabs(this.getValue(1, 2));
                        if (v > max) {
                            p = 1;
                            q = 2;
                            r = 0;
                            max = v;
                        }
                        const t = threshold * (btScalar_3.btFabs(this.getValue(0, 0)) +
                            btScalar_3.btFabs(this.getValue(1, 1)) +
                            btScalar_3.btFabs(this.getValue(2, 2)));
                        if (max <= t) {
                            if (max <= btScalar_3.SIMD_EPSILON * t) {
                                return;
                            }
                            step = 1;
                        }
                        // compute Jacobi rotation J which leads to a zero for element [p][q]
                        const mpq = this.getValue(p, q);
                        const theta = (this.getValue(q, q) - this.getValue(p, p)) / (2 * mpq);
                        const theta2 = theta * theta;
                        let cos;
                        let sin;
                        let t_rot;
                        if (theta2 * theta2 < 10 / btScalar_3.SIMD_EPSILON) {
                            t_rot = (theta >= 0) ? 1 / (theta + btScalar_3.btSqrt(1 + theta2))
                                : 1 / (theta - btScalar_3.btSqrt(1 + theta2));
                            cos = 1 / btScalar_3.btSqrt(1 + t_rot * t_rot);
                            sin = cos * t_rot;
                        }
                        else {
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
                equals(other) {
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 3; j++) {
                            if (this.getValue(i, j) !== other.getValue(i, j)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
            };
            exports_6("btMatrix3x3", btMatrix3x3);
        }
    };
});
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
System.register("src/LinearMath/btTransform", ["src/LinearMath/btMatrix3x3", "src/LinearMath/btVector3", "src/LinearMath/btQuaternion"], function (exports_7, context_7) {
    "use strict";
    var btMatrix3x3_1, btVector3_3, btQuaternion_2, btTransform;
    var __moduleName = context_7 && context_7.id;
    /**
     * Test if two transforms have all elements equal
     * @param t1 First transform
     * @param t2 Second transform
     * @returns True if transforms are equal
     */
    function btTransformEquals(t1, t2) {
        return t1.equals(t2);
    }
    exports_7("btTransformEquals", btTransformEquals);
    return {
        setters: [
            function (btMatrix3x3_1_1) {
                btMatrix3x3_1 = btMatrix3x3_1_1;
            },
            function (btVector3_3_1) {
                btVector3_3 = btVector3_3_1;
            },
            function (btQuaternion_2_1) {
                btQuaternion_2 = btQuaternion_2_1;
            }
        ],
        execute: function () {/*
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
            /**
             * The btTransform class supports rigid transforms with only translation and rotation and no scaling/shear.
             * It can be used in combination with btVector3, btQuaternion and btMatrix3x3 linear algebra classes.
             *
             * TypeScript port removes SIMD optimizations, memory alignment directives, and uses scalar implementations only.
             */
            btTransform = class btTransform {
                constructor(qOrBOrOther, c) {
                    if (qOrBOrOther === undefined) {
                        // No initialization constructor
                        this.m_basis = new btMatrix3x3_1.btMatrix3x3();
                        this.m_origin = new btVector3_3.btVector3(0, 0, 0);
                    }
                    else if (qOrBOrOther instanceof btQuaternion_2.btQuaternion) {
                        // Constructor from quaternion
                        this.m_basis = new btMatrix3x3_1.btMatrix3x3(qOrBOrOther);
                        this.m_origin = c ? new btVector3_3.btVector3(c.x(), c.y(), c.z()) : new btVector3_3.btVector3(0, 0, 0);
                    }
                    else if (qOrBOrOther instanceof btMatrix3x3_1.btMatrix3x3) {
                        // Constructor from matrix
                        this.m_basis = new btMatrix3x3_1.btMatrix3x3(qOrBOrOther);
                        this.m_origin = c ? new btVector3_3.btVector3(c.x(), c.y(), c.z()) : new btVector3_3.btVector3(0, 0, 0);
                    }
                    else {
                        // Copy constructor
                        this.m_basis = new btMatrix3x3_1.btMatrix3x3(qOrBOrOther.m_basis);
                        this.m_origin = new btVector3_3.btVector3(qOrBOrOther.m_origin.x(), qOrBOrOther.m_origin.y(), qOrBOrOther.m_origin.z());
                    }
                }
                /**
                 * Assignment - set this transform to be equal to another
                 * @param other The other transform
                 * @returns This transform for chaining
                 */
                assign(other) {
                    this.m_basis = new btMatrix3x3_1.btMatrix3x3(other.m_basis);
                    this.m_origin = new btVector3_3.btVector3(other.m_origin.x(), other.m_origin.y(), other.m_origin.z());
                    return this;
                }
                /**
                 * Set the current transform as the value of the product of two transforms
                 * @param t1 Transform 1
                 * @param t2 Transform 2
                 * This = Transform1 * Transform2
                 */
                mult(t1, t2) {
                    this.m_basis = btMatrix3x3_1.multiplyMatrices(t1.m_basis, t2.m_basis);
                    this.m_origin = t1.transformPoint(t2.m_origin);
                }
                /**
                 * Return the transform of the vector
                 * Equivalent to C++ operator()(const btVector3& x)
                 * @param x The vector to transform
                 * @returns The transformed vector
                 */
                transformPoint(x) {
                    return x.dot3(this.m_basis.getRow(0), this.m_basis.getRow(1), this.m_basis.getRow(2)).add(this.m_origin);
                }
                /**
                 * Return the transform of the vector (same as transformPoint)
                 * Equivalent to C++ operator*(const btVector3& x)
                 * @param x The vector to transform
                 * @returns The transformed vector
                 */
                multiplyVector(x) {
                    return this.transformPoint(x);
                }
                /**
                 * Return the transform of the btQuaternion
                 * Equivalent to C++ operator*(const btQuaternion& q)
                 * @param q The quaternion to transform
                 * @returns The transformed quaternion
                 */
                multiplyQuaternion(q) {
                    return this.getRotation().multiplyQuaternion(q);
                }
                /**
                 * Return the basis matrix for the rotation
                 * @returns Reference to the rotation matrix
                 */
                getBasis() {
                    return this.m_basis;
                }
                /**
                 * Return the basis matrix for the rotation (const version)
                 * @returns The rotation matrix
                 */
                getBasisConst() {
                    return new btMatrix3x3_1.btMatrix3x3(this.m_basis);
                }
                /**
                 * Return the origin vector translation
                 * @returns Reference to the translation vector
                 */
                getOrigin() {
                    return this.m_origin;
                }
                /**
                 * Return the origin vector translation (const version)
                 * @returns The translation vector
                 */
                getOriginConst() {
                    return new btVector3_3.btVector3(this.m_origin.x(), this.m_origin.y(), this.m_origin.z());
                }
                /**
                 * Return a quaternion representing the rotation
                 * @returns The rotation as a quaternion
                 */
                getRotation() {
                    const q = new btQuaternion_2.btQuaternion();
                    this.m_basis.getRotation(q);
                    return q;
                }
                /**
                 * Set from an array
                 * @param m A 16 element array (12 rotation(row major padded on the right by 1), and 3 translation)
                 */
                setFromOpenGLMatrix(m) {
                    this.m_basis.setFromOpenGLSubMatrix(m);
                    this.m_origin.setValue(m[12], m[13], m[14]);
                }
                /**
                 * Fill an array representation
                 * @param m A 16 element array to fill (12 rotation(row major padded on the right by 1), and 3 translation)
                 */
                getOpenGLMatrix(m) {
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
                setOrigin(origin) {
                    this.m_origin.setValue(origin.x(), origin.y(), origin.z());
                }
                /**
                 * Inverse transform of a vector
                 * @param inVec The vector to inverse transform
                 * @returns The inverse transformed vector
                 */
                invXform(inVec) {
                    const v = inVec.subtract(this.m_origin);
                    return btMatrix3x3_1.multiplyMatrixVector(this.m_basis.transpose(), v);
                }
                /**
                 * Set the rotational element by btMatrix3x3
                 * @param basis The rotation matrix to set
                 */
                setBasis(basis) {
                    this.m_basis = new btMatrix3x3_1.btMatrix3x3(basis);
                }
                /**
                 * Set the rotational element by btQuaternion
                 * @param q The quaternion to set the rotation to
                 */
                setRotation(q) {
                    this.m_basis.setRotation(q);
                }
                /**
                 * Set this transformation to the identity
                 */
                setIdentity() {
                    this.m_basis.setIdentity();
                    this.m_origin.setValue(0.0, 0.0, 0.0);
                }
                /**
                 * Multiply this Transform by another (this = this * another)
                 * Equivalent to C++ operator*=(const btTransform& t)
                 * @param t The other transform
                 * @returns This transform for chaining
                 */
                multiplyAssign(t) {
                    this.m_origin.addAssign(btMatrix3x3_1.multiplyMatrixVector(this.m_basis, t.m_origin));
                    this.m_basis.multiplyAssign(t.m_basis);
                    return this;
                }
                /**
                 * Return the inverse of this transform
                 * @returns The inverse transform
                 */
                inverse() {
                    const inv = this.m_basis.transpose();
                    return new btTransform(inv, btMatrix3x3_1.multiplyMatrixVector(inv, this.m_origin.negate()));
                }
                /**
                 * Return the inverse of this transform times the other transform
                 * @param t The other transform
                 * @returns this.inverse() * the other
                 */
                inverseTimes(t) {
                    const v = t.getOrigin().subtract(this.m_origin);
                    return new btTransform(this.m_basis.transposeTimes(t.m_basis), btMatrix3x3_1.multiplyMatrixVector(this.m_basis.transpose(), v));
                }
                /**
                 * Return the product of this transform and the other
                 * Equivalent to C++ operator*(const btTransform& t)
                 * @param t The other transform
                 * @returns The product transform
                 */
                multiply(t) {
                    return new btTransform(btMatrix3x3_1.multiplyMatrices(this.m_basis, t.m_basis), this.transformPoint(t.m_origin));
                }
                /**
                 * Test if two transforms have all elements equal
                 * @param other The other transform to compare with
                 * @returns True if transforms are equal
                 */
                equals(other) {
                    return this.m_basis.equals(other.m_basis) && this.m_origin.equals(other.m_origin);
                }
                /**
                 * Return an identity transform
                 * @returns The identity transform
                 */
                static getIdentity() {
                    return new btTransform(btMatrix3x3_1.btMatrix3x3.getIdentity(), new btVector3_3.btVector3(0, 0, 0));
                }
                /**
                 * Create a new transform from a quaternion and optional translation
                 * @param q The rotation quaternion
                 * @param origin The translation vector (default: zero vector)
                 * @returns New transform
                 */
                static fromQuaternion(q, origin) {
                    return new btTransform(q, origin);
                }
                /**
                 * Create a new transform from a matrix and optional translation
                 * @param basis The rotation matrix
                 * @param origin The translation vector (default: zero vector)
                 * @returns New transform
                 */
                static fromMatrix(basis, origin) {
                    return new btTransform(basis, origin);
                }
                /**
                 * Create a transform with only translation (identity rotation)
                 * @param origin The translation vector
                 * @returns New transform with identity rotation and given translation
                 */
                static fromTranslation(origin) {
                    return new btTransform(btMatrix3x3_1.btMatrix3x3.getIdentity(), origin);
                }
                /**
                 * Create a transform with only rotation (zero translation)
                 * @param q The rotation quaternion
                 * @returns New transform with given rotation and zero translation
                 */
                static fromRotation(q) {
                    return new btTransform(q, new btVector3_3.btVector3(0, 0, 0));
                }
                /**
                 * Create a transform with only rotation (zero translation)
                 * @param basis The rotation matrix
                 * @returns New transform with given rotation and zero translation
                 */
                static fromRotationMatrix(basis) {
                    return new btTransform(basis, new btVector3_3.btVector3(0, 0, 0));
                }
                /**
                 * Clone this transform
                 * @returns A new transform identical to this one
                 */
                clone() {
                    return new btTransform(this);
                }
                /**
                 * String representation for debugging
                 * @returns String representation of the transform
                 */
                toString() {
                    return `btTransform(basis: ${this.m_basis.toString()}, origin: ${this.m_origin.toString()})`;
                }
            };
            exports_7("btTransform", btTransform);
        }
    };
});
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
System.register("src/BulletCollision/BroadphaseCollision/btBroadphaseProxy", ["src/LinearMath/btVector3"], function (exports_8, context_8) {
    "use strict";
    var btVector3_4, BroadphaseNativeTypes, btBroadphaseProxy, btBroadphasePair, btBroadphasePairSortPredicate;
    var __moduleName = context_8 && context_8.id;
    function btBroadphasePairEquals(a, b) {
        return (a.m_pProxy0 === b.m_pProxy0) && (a.m_pProxy1 === b.m_pProxy1);
    }
    exports_8("btBroadphasePairEquals", btBroadphasePairEquals);
    return {
        setters: [
            function (btVector3_4_1) {
                btVector3_4 = btVector3_4_1;
            }
        ],
        execute: function () {/*
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
            /// btDispatcher uses these types
            /// IMPORTANT NOTE: The types are ordered polyhedral, implicit convex and concave
            /// to facilitate type checking
            /// CUSTOM_POLYHEDRAL_SHAPE_TYPE, CUSTOM_CONVEX_SHAPE_TYPE and CUSTOM_CONCAVE_SHAPE_TYPE can be used to extend Bullet without modifying source code
            (function (BroadphaseNativeTypes) {
                // polyhedral convex shapes
                BroadphaseNativeTypes[BroadphaseNativeTypes["BOX_SHAPE_PROXYTYPE"] = 0] = "BOX_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["TRIANGLE_SHAPE_PROXYTYPE"] = 1] = "TRIANGLE_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["TETRAHEDRAL_SHAPE_PROXYTYPE"] = 2] = "TETRAHEDRAL_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE"] = 3] = "CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_HULL_SHAPE_PROXYTYPE"] = 4] = "CONVEX_HULL_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE"] = 5] = "CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CUSTOM_POLYHEDRAL_SHAPE_TYPE"] = 6] = "CUSTOM_POLYHEDRAL_SHAPE_TYPE";
                // implicit convex shapes
                BroadphaseNativeTypes[BroadphaseNativeTypes["IMPLICIT_CONVEX_SHAPES_START_HERE"] = 7] = "IMPLICIT_CONVEX_SHAPES_START_HERE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["SPHERE_SHAPE_PROXYTYPE"] = 8] = "SPHERE_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["MULTI_SPHERE_SHAPE_PROXYTYPE"] = 9] = "MULTI_SPHERE_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CAPSULE_SHAPE_PROXYTYPE"] = 10] = "CAPSULE_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONE_SHAPE_PROXYTYPE"] = 11] = "CONE_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_SHAPE_PROXYTYPE"] = 12] = "CONVEX_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CYLINDER_SHAPE_PROXYTYPE"] = 13] = "CYLINDER_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["UNIFORM_SCALING_SHAPE_PROXYTYPE"] = 14] = "UNIFORM_SCALING_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["MINKOWSKI_SUM_SHAPE_PROXYTYPE"] = 15] = "MINKOWSKI_SUM_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE"] = 16] = "MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["BOX_2D_SHAPE_PROXYTYPE"] = 17] = "BOX_2D_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_2D_SHAPE_PROXYTYPE"] = 18] = "CONVEX_2D_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CUSTOM_CONVEX_SHAPE_TYPE"] = 19] = "CUSTOM_CONVEX_SHAPE_TYPE";
                // concave shapes
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONCAVE_SHAPES_START_HERE"] = 20] = "CONCAVE_SHAPES_START_HERE";
                // keep all the convex shapetype below here, for the check IsConvexShape in broadphase proxy!
                BroadphaseNativeTypes[BroadphaseNativeTypes["TRIANGLE_MESH_SHAPE_PROXYTYPE"] = 21] = "TRIANGLE_MESH_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE"] = 22] = "SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE";
                /// used for demo integration FAST/Swift collision library and Bullet
                BroadphaseNativeTypes[BroadphaseNativeTypes["FAST_CONCAVE_MESH_PROXYTYPE"] = 23] = "FAST_CONCAVE_MESH_PROXYTYPE";
                // terrain
                BroadphaseNativeTypes[BroadphaseNativeTypes["TERRAIN_SHAPE_PROXYTYPE"] = 24] = "TERRAIN_SHAPE_PROXYTYPE";
                /// Used for GIMPACT Trimesh integration
                BroadphaseNativeTypes[BroadphaseNativeTypes["GIMPACT_SHAPE_PROXYTYPE"] = 25] = "GIMPACT_SHAPE_PROXYTYPE";
                /// Multimaterial mesh
                BroadphaseNativeTypes[BroadphaseNativeTypes["MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE"] = 26] = "MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["EMPTY_SHAPE_PROXYTYPE"] = 27] = "EMPTY_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["STATIC_PLANE_PROXYTYPE"] = 28] = "STATIC_PLANE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CUSTOM_CONCAVE_SHAPE_TYPE"] = 29] = "CUSTOM_CONCAVE_SHAPE_TYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["SDF_SHAPE_PROXYTYPE"] = 29] = "SDF_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["CONCAVE_SHAPES_END_HERE"] = 30] = "CONCAVE_SHAPES_END_HERE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["COMPOUND_SHAPE_PROXYTYPE"] = 31] = "COMPOUND_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["SOFTBODY_SHAPE_PROXYTYPE"] = 32] = "SOFTBODY_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["HFFLUID_SHAPE_PROXYTYPE"] = 33] = "HFFLUID_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE"] = 34] = "HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["INVALID_SHAPE_PROXYTYPE"] = 35] = "INVALID_SHAPE_PROXYTYPE";
                BroadphaseNativeTypes[BroadphaseNativeTypes["MAX_BROADPHASE_COLLISION_TYPES"] = 36] = "MAX_BROADPHASE_COLLISION_TYPES";
            })(BroadphaseNativeTypes || (exports_8("BroadphaseNativeTypes", BroadphaseNativeTypes = {})));
            /// The btBroadphaseProxy is the main class that can be used with the Bullet broadphases.
            /// It stores collision shape type information, collision filter information and a client object, typically a btCollisionObject or btRigidBody.
            btBroadphaseProxy = class btBroadphaseProxy {
                getUid() {
                    return this.m_uniqueId;
                }
                constructor(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask) {
                    // Usually the client btCollisionObject or Rigidbody class
                    this.m_clientObject = null;
                    this.m_collisionFilterGroup = 0;
                    this.m_collisionFilterMask = 0;
                    this.m_uniqueId = 0; // m_uniqueId is introduced for paircache. could get rid of this, by calculating the address offset etc.
                    if (aabbMin && aabbMax && userPtr !== undefined && collisionFilterGroup !== undefined && collisionFilterMask !== undefined) {
                        this.m_clientObject = userPtr;
                        this.m_collisionFilterGroup = collisionFilterGroup;
                        this.m_collisionFilterMask = collisionFilterMask;
                        this.m_aabbMin = aabbMin;
                        this.m_aabbMax = aabbMax;
                    }
                    else {
                        this.m_clientObject = null;
                        this.m_collisionFilterGroup = 0;
                        this.m_collisionFilterMask = 0;
                        this.m_aabbMin = new btVector3_4.btVector3(0, 0, 0);
                        this.m_aabbMax = new btVector3_4.btVector3(0, 0, 0);
                    }
                }
                static isPolyhedral(proxyType) {
                    return proxyType < BroadphaseNativeTypes.IMPLICIT_CONVEX_SHAPES_START_HERE;
                }
                static isConvex(proxyType) {
                    return proxyType < BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE;
                }
                static isNonMoving(proxyType) {
                    return btBroadphaseProxy.isConcave(proxyType) && !(proxyType === BroadphaseNativeTypes.GIMPACT_SHAPE_PROXYTYPE);
                }
                static isConcave(proxyType) {
                    return (proxyType > BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE) &&
                        (proxyType < BroadphaseNativeTypes.CONCAVE_SHAPES_END_HERE);
                }
                static isCompound(proxyType) {
                    return proxyType === BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;
                }
                static isSoftBody(proxyType) {
                    return proxyType === BroadphaseNativeTypes.SOFTBODY_SHAPE_PROXYTYPE;
                }
                static isInfinite(proxyType) {
                    return proxyType === BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE;
                }
                static isConvex2d(proxyType) {
                    return (proxyType === BroadphaseNativeTypes.BOX_2D_SHAPE_PROXYTYPE) ||
                        (proxyType === BroadphaseNativeTypes.CONVEX_2D_SHAPE_PROXYTYPE);
                }
            };
            exports_8("btBroadphaseProxy", btBroadphaseProxy);
            /// optional filtering to cull potential collisions
            btBroadphaseProxy.CollisionFilterGroups = {
                DefaultFilter: 1,
                StaticFilter: 2,
                KinematicFilter: 4,
                DebrisFilter: 8,
                SensorTrigger: 16,
                CharacterFilter: 32,
                AllFilter: -1 // all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
            };
            /// The btBroadphasePair class contains a pair of aabb-overlapping objects.
            /// A btDispatcher can search a btCollisionAlgorithm that performs exact/narrowphase collision detection on the actual collision shapes.
            btBroadphasePair = class btBroadphasePair {
                constructor(proxy0, proxy1) {
                    this.m_pProxy0 = null;
                    this.m_pProxy1 = null;
                    this.m_algorithm = null;
                    this.m_internalInfo1 = null;
                    this.m_internalTmpValue = 0;
                    if (proxy0 && proxy1) {
                        // keep them sorted, so the std::set operations work
                        if (proxy0.m_uniqueId < proxy1.m_uniqueId) {
                            this.m_pProxy0 = proxy0;
                            this.m_pProxy1 = proxy1;
                        }
                        else {
                            this.m_pProxy0 = proxy1;
                            this.m_pProxy1 = proxy0;
                        }
                        this.m_algorithm = null;
                        this.m_internalInfo1 = null;
                    }
                }
            };
            exports_8("btBroadphasePair", btBroadphasePair);
            btBroadphasePairSortPredicate = class btBroadphasePairSortPredicate {
                compare(a, b) {
                    const uidA0 = a.m_pProxy0 ? a.m_pProxy0.m_uniqueId : -1;
                    const uidB0 = b.m_pProxy0 ? b.m_pProxy0.m_uniqueId : -1;
                    const uidA1 = a.m_pProxy1 ? a.m_pProxy1.m_uniqueId : -1;
                    const uidB1 = b.m_pProxy1 ? b.m_pProxy1.m_uniqueId : -1;
                    // For algorithm comparison, we use object identity (similar to pointer comparison in C++)
                    // This is a simple comparison by object reference
                    const algorithmComparison = () => {
                        if (!a.m_algorithm && !b.m_algorithm)
                            return false;
                        if (!a.m_algorithm)
                            return false;
                        if (!b.m_algorithm)
                            return true;
                        // Compare by object reference hash (simplified pointer comparison)
                        return a.m_algorithm !== b.m_algorithm;
                    };
                    return uidA0 > uidB0 ||
                        (a.m_pProxy0 === b.m_pProxy0 && uidA1 > uidB1) ||
                        (a.m_pProxy0 === b.m_pProxy0 && a.m_pProxy1 === b.m_pProxy1 && algorithmComparison());
                }
            };
            exports_8("btBroadphasePairSortPredicate", btBroadphasePairSortPredicate);
        }
    };
});
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
System.register("src/BulletCollision/CollisionShapes/btCollisionShape", ["src/LinearMath/btTransform", "src/LinearMath/btVector3", "src/BulletCollision/BroadphaseCollision/btBroadphaseProxy"], function (exports_9, context_9) {
    "use strict";
    var btTransform_1, btVector3_5, btBroadphaseProxy_1, btCollisionShape;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (btTransform_1_1) {
                btTransform_1 = btTransform_1_1;
            },
            function (btVector3_5_1) {
                btVector3_5 = btVector3_5_1;
            },
            function (btBroadphaseProxy_1_1) {
                btBroadphaseProxy_1 = btBroadphaseProxy_1_1;
            }
        ],
        execute: function () {/*
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
             * The btCollisionShape class provides an interface for collision shapes that can be shared among btCollisionObjects.
             * This is the base abstract class for all collision shapes in the physics engine.
             */
            btCollisionShape = class btCollisionShape {
                constructor() {
                    this.m_shapeType = btBroadphaseProxy_1.BroadphaseNativeTypes.INVALID_SHAPE_PROXYTYPE;
                    this.m_userPointer = null;
                    this.m_userIndex = -1;
                    this.m_userIndex2 = -1;
                }
                /**
                 * Get the bounding sphere for this shape
                 * @param center Output center of bounding sphere
                 * @param radius Output radius of bounding sphere
                 */
                getBoundingSphere(center, radius) {
                    const tr = new btTransform_1.btTransform();
                    tr.setIdentity();
                    const aabbMin = new btVector3_5.btVector3();
                    const aabbMax = new btVector3_5.btVector3();
                    this.getAabb(tr, aabbMin, aabbMax);
                    const diff = aabbMax.subtract(aabbMin);
                    radius.value = diff.length() * 0.5;
                    center.copy(aabbMin.add(aabbMax).multiply(0.5));
                }
                /**
                 * getAngularMotionDisc returns the maximum radius needed for Conservative Advancement to handle time-of-impact with rotations.
                 */
                getAngularMotionDisc() {
                    // TODO: cache this value to improve performance
                    const center = new btVector3_5.btVector3();
                    const radiusRef = { value: 0 };
                    this.getBoundingSphere(center, radiusRef);
                    let disc = radiusRef.value;
                    disc += center.length();
                    return disc;
                }
                /**
                 * Get contact breaking threshold
                 */
                getContactBreakingThreshold(defaultContactThresholdFactor) {
                    return this.getAngularMotionDisc() * defaultContactThresholdFactor;
                }
                /**
                 * calculateTemporalAabb calculates the enclosing aabb for the moving object over interval [0..timeStep)
                 * Result is conservative
                 */
                calculateTemporalAabb(curTrans, linvel, angvel, timeStep, temporalAabbMin, temporalAabbMax) {
                    // Start with static aabb
                    this.getAabb(curTrans, temporalAabbMin, temporalAabbMax);
                    let temporalAabbMaxx = temporalAabbMax.x();
                    let temporalAabbMaxy = temporalAabbMax.y();
                    let temporalAabbMaxz = temporalAabbMax.z();
                    let temporalAabbMinx = temporalAabbMin.x();
                    let temporalAabbMiny = temporalAabbMin.y();
                    let temporalAabbMinz = temporalAabbMin.z();
                    // Add linear motion
                    const linMotion = linvel.multiply(timeStep);
                    // TODO: simd would have a vector max/min operation, instead of per-element access
                    if (linMotion.x() > 0) {
                        temporalAabbMaxx += linMotion.x();
                    }
                    else {
                        temporalAabbMinx += linMotion.x();
                    }
                    if (linMotion.y() > 0) {
                        temporalAabbMaxy += linMotion.y();
                    }
                    else {
                        temporalAabbMiny += linMotion.y();
                    }
                    if (linMotion.z() > 0) {
                        temporalAabbMaxz += linMotion.z();
                    }
                    else {
                        temporalAabbMinz += linMotion.z();
                    }
                    // Add conservative angular motion
                    const angularMotion = angvel.length() * this.getAngularMotionDisc() * timeStep;
                    const angularMotion3d = new btVector3_5.btVector3(angularMotion, angularMotion, angularMotion);
                    temporalAabbMin.setValue(temporalAabbMinx, temporalAabbMiny, temporalAabbMinz);
                    temporalAabbMax.setValue(temporalAabbMaxx, temporalAabbMaxy, temporalAabbMaxz);
                    temporalAabbMin.subtractAssign(angularMotion3d);
                    temporalAabbMax.addAssign(angularMotion3d);
                }
                // Shape type checking methods - inline helpers
                isPolyhedral() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isPolyhedral(this.getShapeType());
                }
                isConvex2d() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isConvex2d(this.getShapeType());
                }
                isConvex() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isConvex(this.getShapeType());
                }
                isNonMoving() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isNonMoving(this.getShapeType());
                }
                isConcave() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isConcave(this.getShapeType());
                }
                isCompound() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isCompound(this.getShapeType());
                }
                isSoftBody() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isSoftBody(this.getShapeType());
                }
                /**
                 * isInfinite is used to catch simulation error (aabb check)
                 */
                isInfinite() {
                    return btBroadphaseProxy_1.btBroadphaseProxy.isInfinite(this.getShapeType());
                }
                // Basic getters and setters
                getShapeType() {
                    return this.m_shapeType;
                }
                /**
                 * The getAnisotropicRollingFrictionDirection can be used in combination with setAnisotropicFriction
                 * See Bullet/Demos/RollingFrictionDemo for an example
                 */
                getAnisotropicRollingFrictionDirection() {
                    return new btVector3_5.btVector3(1, 1, 1);
                }
                // User data management
                setUserPointer(userPtr) {
                    this.m_userPointer = userPtr;
                }
                getUserPointer() {
                    return this.m_userPointer;
                }
                setUserIndex(index) {
                    this.m_userIndex = index;
                }
                getUserIndex() {
                    return this.m_userIndex;
                }
                setUserIndex2(index) {
                    this.m_userIndex2 = index;
                }
                getUserIndex2() {
                    return this.m_userIndex2;
                }
                // Serialization support
                calculateSerializeBufferSize() {
                    // In TypeScript, we don't need exact buffer sizes, but we maintain the interface
                    return 1; // Simplified for TypeScript
                }
                /**
                 * Serialize the collision shape data
                 * Returns the struct type name for serialization
                 */
                serialize(dataBuffer, serializer) {
                    var _a;
                    // Simplified serialization for TypeScript
                    dataBuffer.m_name = ((_a = serializer === null || serializer === void 0 ? void 0 : serializer.findNameForPointer) === null || _a === void 0 ? void 0 : _a.call(serializer, this)) || null;
                    dataBuffer.m_shapeType = this.m_shapeType;
                    return "btCollisionShapeData";
                }
                /**
                 * Serialize a single shape
                 */
                serializeSingleShape(serializer) {
                    this.calculateSerializeBufferSize();
                    const data = {
                        m_name: null,
                        m_shapeType: 0
                    };
                    this.serialize(data, serializer);
                    // In a full implementation, this would handle the serialization chunk
                    // For TypeScript port, we simplify this interface
                }
            };
            exports_9("btCollisionShape", btCollisionShape);
        }
    };
});
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
System.register("src/BulletCollision/CollisionDispatch/btCollisionObject", ["src/LinearMath/btTransform", "src/LinearMath/btVector3", "src/LinearMath/btScalar"], function (exports_10, context_10) {
    "use strict";
    var btTransform_2, btVector3_6, btScalar_4, ACTIVE_TAG, ISLAND_SLEEPING, WANTS_DEACTIVATION, DISABLE_DEACTIVATION, DISABLE_SIMULATION, FIXED_BASE_MULTI_BODY, btCollisionObject;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (btTransform_2_1) {
                btTransform_2 = btTransform_2_1;
            },
            function (btVector3_6_1) {
                btVector3_6 = btVector3_6_1;
            },
            function (btScalar_4_1) {
                btScalar_4 = btScalar_4_1;
            }
        ],
        execute: function () {/*
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
            // Island management constants
            exports_10("ACTIVE_TAG", ACTIVE_TAG = 1);
            exports_10("ISLAND_SLEEPING", ISLAND_SLEEPING = 2);
            exports_10("WANTS_DEACTIVATION", WANTS_DEACTIVATION = 3);
            exports_10("DISABLE_DEACTIVATION", DISABLE_DEACTIVATION = 4);
            exports_10("DISABLE_SIMULATION", DISABLE_SIMULATION = 5);
            exports_10("FIXED_BASE_MULTI_BODY", FIXED_BASE_MULTI_BODY = 6);
            /**
             * btCollisionObject can be used to manage collision detection objects.
             * btCollisionObject maintains all information that is needed for a collision detection: Shape, Transform and AABB proxy.
             * They can be added to the btCollisionWorld.
             */
            btCollisionObject = class btCollisionObject {
                constructor() {
                    this.m_worldTransform = new btTransform_2.btTransform();
                    this.m_interpolationWorldTransform = new btTransform_2.btTransform();
                    this.m_interpolationLinearVelocity = new btVector3_6.btVector3(0, 0, 0);
                    this.m_interpolationAngularVelocity = new btVector3_6.btVector3(0, 0, 0);
                    this.m_anisotropicFriction = new btVector3_6.btVector3(1, 1, 1);
                    this.m_hasAnisotropicFriction = 0;
                    this.m_contactProcessingThreshold = 0;
                    this.m_broadphaseHandle = null;
                    this.m_collisionShape = null;
                    this.m_extensionPointer = null;
                    this.m_rootCollisionShape = null;
                    this.m_collisionFlags = btCollisionObject.CollisionFlags.CF_DYNAMIC_OBJECT;
                    this.m_islandTag1 = -1;
                    this.m_companionId = -1;
                    this.m_worldArrayIndex = -1;
                    this.m_activationState1 = ACTIVE_TAG;
                    this.m_deactivationTime = 0;
                    this.m_friction = 0.5;
                    this.m_restitution = 0;
                    this.m_rollingFriction = 0;
                    this.m_spinningFriction = 0;
                    this.m_contactDamping = 0;
                    this.m_contactStiffness = 0;
                    this.m_internalType = btCollisionObject.CollisionObjectTypes.CO_COLLISION_OBJECT;
                    this.m_userObjectPointer = null;
                    this.m_userIndex2 = -1;
                    this.m_userIndex = -1;
                    this.m_userIndex3 = -1;
                    this.m_hitFraction = 1;
                    this.m_ccdSweptSphereRadius = 0;
                    this.m_ccdMotionThreshold = 0;
                    this.m_checkCollideWith = 0;
                    this.m_objectsWithoutCollisionCheck = [];
                    this.m_updateRevision = 0;
                    this.m_customDebugColorRGB = new btVector3_6.btVector3(1, 0, 0);
                }
                /**
                 * Check if this object merges simulation islands
                 */
                mergesSimulationIslands() {
                    // Static objects, kinematic and objects without contact response don't merge islands
                    return (this.m_collisionFlags & (btCollisionObject.CollisionFlags.CF_STATIC_OBJECT |
                        btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
                        btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE)) === 0;
                }
                getAnisotropicFriction() {
                    return this.m_anisotropicFriction;
                }
                setAnisotropicFriction(anisotropicFriction, frictionMode = btCollisionObject.AnisotropicFrictionFlags.CF_ANISOTROPIC_FRICTION) {
                    this.m_anisotropicFriction.copy(anisotropicFriction);
                    const isUnity = (anisotropicFriction.x() !== 1.0) || (anisotropicFriction.y() !== 1.0) || (anisotropicFriction.z() !== 1.0);
                    this.m_hasAnisotropicFriction = isUnity ? frictionMode : 0;
                }
                hasAnisotropicFriction(frictionMode = btCollisionObject.AnisotropicFrictionFlags.CF_ANISOTROPIC_FRICTION) {
                    return (this.m_hasAnisotropicFriction & frictionMode) !== 0;
                }
                setContactProcessingThreshold(contactProcessingThreshold) {
                    this.m_contactProcessingThreshold = contactProcessingThreshold;
                }
                getContactProcessingThreshold() {
                    return this.m_contactProcessingThreshold;
                }
                isStaticObject() {
                    return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_STATIC_OBJECT) !== 0;
                }
                isKinematicObject() {
                    return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT) !== 0;
                }
                isStaticOrKinematicObject() {
                    return (this.m_collisionFlags & (btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
                        btCollisionObject.CollisionFlags.CF_STATIC_OBJECT)) !== 0;
                }
                hasContactResponse() {
                    return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE) === 0;
                }
                setCollisionShape(collisionShape) {
                    this.m_updateRevision++;
                    this.m_collisionShape = collisionShape;
                    this.m_rootCollisionShape = collisionShape;
                }
                getCollisionShape() {
                    return this.m_collisionShape;
                }
                setIgnoreCollisionCheck(co, ignoreCollisionCheck) {
                    if (ignoreCollisionCheck) {
                        this.m_objectsWithoutCollisionCheck.push(co);
                    }
                    else {
                        const index = this.m_objectsWithoutCollisionCheck.indexOf(co);
                        if (index >= 0) {
                            this.m_objectsWithoutCollisionCheck.splice(index, 1);
                        }
                    }
                    this.m_checkCollideWith = this.m_objectsWithoutCollisionCheck.length > 0 ? 1 : 0;
                }
                getNumObjectsWithoutCollision() {
                    return this.m_objectsWithoutCollisionCheck.length;
                }
                getObjectWithoutCollision(index) {
                    return this.m_objectsWithoutCollisionCheck[index];
                }
                checkCollideWithOverride(co) {
                    const index = this.m_objectsWithoutCollisionCheck.indexOf(co);
                    return index === -1;
                }
                internalGetExtensionPointer() {
                    return this.m_extensionPointer;
                }
                internalSetExtensionPointer(pointer) {
                    this.m_extensionPointer = pointer;
                }
                getActivationState() {
                    return this.m_activationState1;
                }
                setActivationState(newState) {
                    if (this.m_activationState1 !== DISABLE_DEACTIVATION && this.m_activationState1 !== DISABLE_SIMULATION) {
                        this.m_activationState1 = newState;
                    }
                }
                setDeactivationTime(time) {
                    this.m_deactivationTime = time;
                }
                getDeactivationTime() {
                    return this.m_deactivationTime;
                }
                forceActivationState(newState) {
                    this.m_activationState1 = newState;
                }
                activate(forceActivation = false) {
                    if (forceActivation ||
                        (this.m_activationState1 !== DISABLE_DEACTIVATION &&
                            this.m_activationState1 !== DISABLE_SIMULATION)) {
                        this.m_activationState1 = ACTIVE_TAG;
                        this.m_deactivationTime = 0;
                    }
                }
                isActive() {
                    return ((this.getActivationState() !== FIXED_BASE_MULTI_BODY) &&
                        (this.getActivationState() !== ISLAND_SLEEPING) &&
                        (this.getActivationState() !== DISABLE_SIMULATION));
                }
                setRestitution(rest) {
                    this.m_updateRevision++;
                    this.m_restitution = rest;
                }
                getRestitution() {
                    return this.m_restitution;
                }
                setFriction(frict) {
                    this.m_updateRevision++;
                    this.m_friction = frict;
                }
                getFriction() {
                    return this.m_friction;
                }
                setRollingFriction(frict) {
                    this.m_updateRevision++;
                    this.m_rollingFriction = frict;
                }
                getRollingFriction() {
                    return this.m_rollingFriction;
                }
                setSpinningFriction(frict) {
                    this.m_updateRevision++;
                    this.m_spinningFriction = frict;
                }
                getSpinningFriction() {
                    return this.m_spinningFriction;
                }
                setContactStiffnessAndDamping(stiffness, damping) {
                    this.m_updateRevision++;
                    this.m_contactStiffness = stiffness;
                    this.m_contactDamping = damping;
                    this.m_collisionFlags |= btCollisionObject.CollisionFlags.CF_HAS_CONTACT_STIFFNESS_DAMPING;
                    // Avoid divisions by zero
                    if (this.m_contactStiffness < btScalar_4.SIMD_EPSILON) {
                        this.m_contactStiffness = btScalar_4.SIMD_EPSILON;
                    }
                }
                getContactStiffness() {
                    return this.m_contactStiffness;
                }
                getContactDamping() {
                    return this.m_contactDamping;
                }
                getInternalType() {
                    return this.m_internalType;
                }
                getWorldTransform() {
                    return this.m_worldTransform;
                }
                setWorldTransform(worldTrans) {
                    this.m_updateRevision++;
                    this.m_worldTransform.assign(worldTrans);
                }
                getBroadphaseHandle() {
                    return this.m_broadphaseHandle;
                }
                setBroadphaseHandle(handle) {
                    this.m_broadphaseHandle = handle;
                }
                getInterpolationWorldTransform() {
                    return this.m_interpolationWorldTransform;
                }
                setInterpolationWorldTransform(trans) {
                    this.m_updateRevision++;
                    this.m_interpolationWorldTransform.assign(trans);
                }
                setInterpolationLinearVelocity(linvel) {
                    this.m_updateRevision++;
                    this.m_interpolationLinearVelocity.copy(linvel);
                }
                setInterpolationAngularVelocity(angvel) {
                    this.m_updateRevision++;
                    this.m_interpolationAngularVelocity.copy(angvel);
                }
                getInterpolationLinearVelocity() {
                    return this.m_interpolationLinearVelocity;
                }
                getInterpolationAngularVelocity() {
                    return this.m_interpolationAngularVelocity;
                }
                getIslandTag() {
                    return this.m_islandTag1;
                }
                setIslandTag(tag) {
                    this.m_islandTag1 = tag;
                }
                getCompanionId() {
                    return this.m_companionId;
                }
                setCompanionId(id) {
                    this.m_companionId = id;
                }
                getWorldArrayIndex() {
                    return this.m_worldArrayIndex;
                }
                setWorldArrayIndex(ix) {
                    this.m_worldArrayIndex = ix;
                }
                getHitFraction() {
                    return this.m_hitFraction;
                }
                setHitFraction(hitFraction) {
                    this.m_hitFraction = hitFraction;
                }
                getCollisionFlags() {
                    return this.m_collisionFlags;
                }
                setCollisionFlags(flags) {
                    this.m_collisionFlags = flags;
                }
                getCcdSweptSphereRadius() {
                    return this.m_ccdSweptSphereRadius;
                }
                setCcdSweptSphereRadius(radius) {
                    this.m_ccdSweptSphereRadius = radius;
                }
                getCcdMotionThreshold() {
                    return this.m_ccdMotionThreshold;
                }
                getCcdSquareMotionThreshold() {
                    return this.m_ccdMotionThreshold * this.m_ccdMotionThreshold;
                }
                setCcdMotionThreshold(ccdMotionThreshold) {
                    this.m_ccdMotionThreshold = ccdMotionThreshold;
                }
                getUserPointer() {
                    return this.m_userObjectPointer;
                }
                getUserIndex() {
                    return this.m_userIndex;
                }
                getUserIndex2() {
                    return this.m_userIndex2;
                }
                getUserIndex3() {
                    return this.m_userIndex3;
                }
                setUserPointer(userPointer) {
                    this.m_userObjectPointer = userPointer;
                }
                setUserIndex(index) {
                    this.m_userIndex = index;
                }
                setUserIndex2(index) {
                    this.m_userIndex2 = index;
                }
                setUserIndex3(index) {
                    this.m_userIndex3 = index;
                }
                getUpdateRevisionInternal() {
                    return this.m_updateRevision;
                }
                setCustomDebugColor(colorRGB) {
                    this.m_customDebugColorRGB.copy(colorRGB);
                    this.m_collisionFlags |= btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
                }
                removeCustomDebugColor() {
                    this.m_collisionFlags &= ~btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
                }
                getCustomDebugColor() {
                    const hasCustomColor = (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR) !== 0;
                    return hasCustomColor ? this.m_customDebugColorRGB : null;
                }
                checkCollideWith(co) {
                    if (this.m_checkCollideWith) {
                        return this.checkCollideWithOverride(co);
                    }
                    return true;
                }
            };
            exports_10("btCollisionObject", btCollisionObject);
            // Enum for collision flags
            btCollisionObject.CollisionFlags = {
                CF_DYNAMIC_OBJECT: 0,
                CF_STATIC_OBJECT: 1,
                CF_KINEMATIC_OBJECT: 2,
                CF_NO_CONTACT_RESPONSE: 4,
                CF_CUSTOM_MATERIAL_CALLBACK: 8,
                CF_CHARACTER_OBJECT: 16,
                CF_DISABLE_VISUALIZE_OBJECT: 32,
                CF_DISABLE_SPU_COLLISION_PROCESSING: 64,
                CF_HAS_CONTACT_STIFFNESS_DAMPING: 128,
                CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR: 256,
                CF_HAS_FRICTION_ANCHOR: 512,
                CF_HAS_COLLISION_SOUND_TRIGGER: 1024
            };
            // Enum for collision object types
            btCollisionObject.CollisionObjectTypes = {
                CO_COLLISION_OBJECT: 1,
                CO_RIGID_BODY: 2,
                CO_GHOST_OBJECT: 4,
                CO_SOFT_BODY: 8,
                CO_HF_FLUID: 16,
                CO_USER_TYPE: 32,
                CO_FEATHERSTONE_LINK: 64
            };
            // Enum for anisotropic friction flags
            btCollisionObject.AnisotropicFrictionFlags = {
                CF_ANISOTROPIC_FRICTION_DISABLED: 0,
                CF_ANISOTROPIC_FRICTION: 1,
                CF_ANISOTROPIC_ROLLING_FRICTION: 2
            };
        }
    };
});
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
System.register("src/BulletCollision/BroadphaseCollision/btDispatcher", [], function (exports_11, context_11) {
    "use strict";
    var btDispatcherInfo, ebtDispatcherQueryType, btDispatcher;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [],
        execute: function () {/*
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
             * Dispatcher information structure containing settings and state for collision detection
             */
            btDispatcherInfo = class btDispatcherInfo {
                constructor() {
                    this.m_timeStep = 0.0;
                    this.m_stepCount = 0;
                    this.m_dispatchFunc = btDispatcherInfo.DispatchFunc.DISPATCH_DISCRETE;
                    this.m_timeOfImpact = 1.0;
                    this.m_useContinuous = true;
                    this.m_debugDraw = null;
                    this.m_enableSatConvex = false;
                    this.m_enableSPU = true;
                    this.m_useEpa = true;
                    this.m_allowedCcdPenetration = 0.04;
                    this.m_useConvexConservativeDistanceUtil = false;
                    this.m_convexConservativeDistanceThreshold = 0.0;
                    this.m_deterministicOverlappingPairs = false;
                }
            };
            exports_11("btDispatcherInfo", btDispatcherInfo);
            btDispatcherInfo.DispatchFunc = {
                DISPATCH_DISCRETE: 1,
                DISPATCH_CONTINUOUS: 2
            };
            /**
             * Enumeration for dispatcher query types
             */
            (function (ebtDispatcherQueryType) {
                ebtDispatcherQueryType[ebtDispatcherQueryType["BT_CONTACT_POINT_ALGORITHMS"] = 1] = "BT_CONTACT_POINT_ALGORITHMS";
                ebtDispatcherQueryType[ebtDispatcherQueryType["BT_CLOSEST_POINT_ALGORITHMS"] = 2] = "BT_CLOSEST_POINT_ALGORITHMS";
            })(ebtDispatcherQueryType || (exports_11("ebtDispatcherQueryType", ebtDispatcherQueryType = {})));
            /**
             * The btDispatcher interface class can be used in combination with broadphase to dispatch calculations for overlapping pairs.
             * For example for pairwise collision detection, calculating contact points stored in btPersistentManifold or user callbacks (game logic).
             */
            btDispatcher = class btDispatcher {
            };
            exports_11("btDispatcher", btDispatcher);
        }
    };
});
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
System.register("src/BulletCollision/CollisionDispatch/btCollisionDispatcher", ["src/BulletCollision/BroadphaseCollision/btDispatcher"], function (exports_12, context_12) {
    "use strict";
    var btDispatcher_1, btCollisionDispatcher;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (btDispatcher_1_1) {
                btDispatcher_1 = btDispatcher_1_1;
            }
        ],
        execute: function () {/*
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
             * The btCollisionDispatcher supports algorithms that handle ConvexConvex and ConvexConcave collision pairs.
             * Time of Impact, Closest Points and Penetration Depth.
             */
            btCollisionDispatcher = class btCollisionDispatcher extends btDispatcher_1.btDispatcher {
                constructor(_collisionConfiguration) {
                    super();
                    this.m_dispatcherInfo = {
                        m_timeStep: 1.0 / 60.0,
                        m_stepCount: 0,
                        m_dispatchFunc: 1,
                        m_timeOfImpact: 1.0,
                        m_useContinuous: true,
                        m_debugDraw: null,
                        m_enableSatConvex: false,
                        m_enableSPU: true,
                        m_useEpa: true,
                        m_allowedCcdPenetration: 0.04,
                        m_useConvexConservativeDistanceUtil: false,
                        m_convexConservativeDistanceThreshold: 0.0,
                        m_deterministicOverlappingPairs: false,
                        m_stackAllocator: null
                    };
                }
                getDispatcherInfo() {
                    return this.m_dispatcherInfo;
                }
                // Implement required abstract methods from btDispatcher
                findAlgorithm(_body0Wrap, _body1Wrap, _sharedManifold, _queryType) {
                    // Simplified implementation for now
                    return null;
                }
                getNewManifold(_b0, _b1) {
                    // Simplified implementation for now
                    return null;
                }
                releaseManifold(_manifold) {
                    // Simplified implementation for now
                }
                clearManifold(_manifold) {
                    // Simplified implementation for now
                }
                needsCollision(_body0, _body1) {
                    return true;
                }
                needsResponse(_body0, _body1) {
                    return true;
                }
                dispatchAllCollisionPairs(_pairCache, _dispatchInfo, _dispatcher) {
                    // Simplified implementation for now
                }
                getNumManifolds() {
                    return 0;
                }
                getManifoldByIndexInternal(_index) {
                    return null;
                }
                getInternalManifoldPointer() {
                    return null;
                }
                allocateCollisionAlgorithm(_size) {
                    return null;
                }
                freeCollisionAlgorithm(_ptr) {
                    // Simplified implementation for now
                }
                internalSetInternalOwner(_owner) {
                    // Simplified implementation for now
                }
                getInternalManifoldPool() {
                    return null;
                }
                getInternalManifoldPoolConst() {
                    return null;
                }
            };
            exports_12("btCollisionDispatcher", btCollisionDispatcher);
        }
    };
});
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
System.register("src/BulletCollision/BroadphaseCollision/btBroadphaseInterface", ["src/LinearMath/btVector3"], function (exports_13, context_13) {
    "use strict";
    var btVector3_7, btBroadphaseAabbCallback, btBroadphaseRayCallback, btBroadphaseInterface;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (btVector3_7_1) {
                btVector3_7 = btVector3_7_1;
            }
        ],
        execute: function () {/*
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
             * Callback interface for AABB testing in broadphase
             */
            btBroadphaseAabbCallback = class btBroadphaseAabbCallback {
            };
            exports_13("btBroadphaseAabbCallback", btBroadphaseAabbCallback);
            /**
             * Callback interface for ray testing in broadphase
             * Extends btBroadphaseAabbCallback with cached data to accelerate ray-AABB tests
             */
            btBroadphaseRayCallback = class btBroadphaseRayCallback extends btBroadphaseAabbCallback {
                constructor() {
                    super();
                    this.m_rayDirectionInverse = new btVector3_7.btVector3();
                    this.m_signs = [0, 0, 0];
                    this.m_lambda_max = 0;
                }
            };
            exports_13("btBroadphaseRayCallback", btBroadphaseRayCallback);
            /**
             * The btBroadphaseInterface class provides an interface to detect aabb-overlapping object pairs.
             * Some implementations for this broadphase interface include btAxisSweep3, bt32BitAxisSweep3 and btDbvtBroadphase.
             * The actual overlapping pair management, storage, adding and removing of pairs is dealt by the btOverlappingPairCache class.
             */
            btBroadphaseInterface = class btBroadphaseInterface {
                /**
                 * Reset broadphase internal structures, to ensure determinism/reproducibility
                 * @param dispatcher Dispatcher instance
                 */
                resetPool(_dispatcher) {
                    // Default implementation does nothing
                    // Implementations can override this if they need to reset internal state
                }
            };
            exports_13("btBroadphaseInterface", btBroadphaseInterface);
        }
    };
});
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
System.register("src/LinearMath/btIDebugDraw", ["src/LinearMath/btVector3", "src/LinearMath/btMatrix3x3"], function (exports_14, context_14) {
    "use strict";
    var btVector3_8, btMatrix3x3_2, btIDebugDraw;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (btVector3_8_1) {
                btVector3_8 = btVector3_8_1;
            },
            function (btMatrix3x3_2_1) {
                btMatrix3x3_2 = btMatrix3x3_2_1;
            }
        ],
        execute: function () {/*
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
             * The btIDebugDraw interface class allows hooking up a debug renderer to visually debug simulations.
             * Typical usage is during fixed timestep simulation/collisionDetection.
             */
            btIDebugDraw = class btIDebugDraw {
                /**
                 * Draw sphere
                 */
                drawSphere(radius, transform, color) {
                    // Default implementation using drawLine - can be overridden for better performance
                    const center = transform.getOrigin();
                    const step = Math.PI * 2.0 / 10.0;
                    for (let i = 0; i < 10; i++) {
                        const angle1 = i * step;
                        const angle2 = (i + 1) * step;
                        let p1 = new btVector3_8.btVector3(Math.cos(angle1) * radius, Math.sin(angle1) * radius, 0);
                        let p2 = new btVector3_8.btVector3(Math.cos(angle2) * radius, Math.sin(angle2) * radius, 0);
                        p1 = btMatrix3x3_2.multiplyMatrixVector(transform.getBasis(), p1).add(center);
                        p2 = btMatrix3x3_2.multiplyMatrixVector(transform.getBasis(), p2).add(center);
                        this.drawLine(p1, p2, color);
                    }
                }
                /**
                 * Draw box
                 */
                drawBox(bbMin, bbMax, color) {
                    // Draw wireframe box
                    const vertices = [
                        new btVector3_8.btVector3(bbMin.x(), bbMin.y(), bbMin.z()),
                        new btVector3_8.btVector3(bbMax.x(), bbMin.y(), bbMin.z()),
                        new btVector3_8.btVector3(bbMax.x(), bbMax.y(), bbMin.z()),
                        new btVector3_8.btVector3(bbMin.x(), bbMax.y(), bbMin.z()),
                        new btVector3_8.btVector3(bbMin.x(), bbMin.y(), bbMax.z()),
                        new btVector3_8.btVector3(bbMax.x(), bbMin.y(), bbMax.z()),
                        new btVector3_8.btVector3(bbMax.x(), bbMax.y(), bbMax.z()),
                        new btVector3_8.btVector3(bbMin.x(), bbMax.y(), bbMax.z())
                    ];
                    // Bottom face
                    this.drawLine(vertices[0], vertices[1], color);
                    this.drawLine(vertices[1], vertices[2], color);
                    this.drawLine(vertices[2], vertices[3], color);
                    this.drawLine(vertices[3], vertices[0], color);
                    // Top face
                    this.drawLine(vertices[4], vertices[5], color);
                    this.drawLine(vertices[5], vertices[6], color);
                    this.drawLine(vertices[6], vertices[7], color);
                    this.drawLine(vertices[7], vertices[4], color);
                    // Vertical edges
                    this.drawLine(vertices[0], vertices[4], color);
                    this.drawLine(vertices[1], vertices[5], color);
                    this.drawLine(vertices[2], vertices[6], color);
                    this.drawLine(vertices[3], vertices[7], color);
                }
            };
            exports_14("btIDebugDraw", btIDebugDraw);
            // Debug drawing modes
            btIDebugDraw.DebugDrawModes = {
                DBG_NoDebug: 0,
                DBG_DrawWireframe: 1,
                DBG_DrawAabb: 2,
                DBG_DrawFeaturesText: 4,
                DBG_DrawContactPoints: 8,
                DBG_NoDeactivation: 16,
                DBG_NoHelpText: 32,
                DBG_DrawText: 64,
                DBG_ProfileTimings: 128,
                DBG_EnableSatComparison: 256,
                DBG_DisableBulletLCP: 512,
                DBG_EnableCCD: 1024,
                DBG_DrawConstraints: 2048,
                DBG_DrawConstraintLimits: 4096,
                DBG_FastWireframe: 8192,
                DBG_DrawNormals: 16384,
                DBG_DrawFrames: 32768,
                DBG_MAX_DEBUG_DRAW_MODE: 65536
            };
        }
    };
});
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
System.register("src/BulletCollision/CollisionShapes/btCollisionMargin", [], function (exports_15, context_15) {
    "use strict";
    var CONVEX_DISTANCE_MARGIN;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [],
        execute: function () {/*
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
             * TypeScript port of Bullet3's btCollisionMargin.h
             * Defines collision margin constants for convex collision shapes
             */
            /**
             * The CONVEX_DISTANCE_MARGIN is a default collision margin for convex collision shapes
             * derived from btConvexInternalShape.
             * This collision margin is used by GJK and some other algorithms.
             * Note that when creating small objects, you need to make sure to set a smaller collision margin,
             * using the 'setMargin' API.
             */
            exports_15("CONVEX_DISTANCE_MARGIN", CONVEX_DISTANCE_MARGIN = 0.04);
        }
    };
});
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
System.register("src/BulletCollision/CollisionShapes/btConvexShape", ["src/BulletCollision/CollisionShapes/btCollisionShape", "src/LinearMath/btVector3", "src/LinearMath/btMatrix3x3", "src/BulletCollision/CollisionShapes/btCollisionMargin", "src/LinearMath/btScalar", "src/BulletCollision/BroadphaseCollision/btBroadphaseProxy"], function (exports_16, context_16) {
    "use strict";
    var btCollisionShape_1, btVector3_9, btMatrix3x3_3, btCollisionMargin_1, btScalar_5, btBroadphaseProxy_2, MAX_PREFERRED_PENETRATION_DIRECTIONS, btConvexShape;
    var __moduleName = context_16 && context_16.id;
    /**
     * Helper function for convex hull support vertex calculation
     * Used by convex hull and point cloud shapes
     */
    function convexHullSupport(localDirOrg, points, _numPoints, localScaling) {
        const vec = new btVector3_9.btVector3(localDirOrg.x() * localScaling.x(), localDirOrg.y() * localScaling.y(), localDirOrg.z() * localScaling.z());
        const maxDotRef = { value: 0 };
        const ptIndex = vec.maxDot(points, maxDotRef);
        btScalar_5.btAssert(ptIndex >= 0);
        if (ptIndex < 0) {
            return new btVector3_9.btVector3(0, 0, 0);
        }
        return new btVector3_9.btVector3(points[ptIndex].x() * localScaling.x(), points[ptIndex].y() * localScaling.y(), points[ptIndex].z() * localScaling.z());
    }
    exports_16("convexHullSupport", convexHullSupport);
    return {
        setters: [
            function (btCollisionShape_1_1) {
                btCollisionShape_1 = btCollisionShape_1_1;
            },
            function (btVector3_9_1) {
                btVector3_9 = btVector3_9_1;
            },
            function (btMatrix3x3_3_1) {
                btMatrix3x3_3 = btMatrix3x3_3_1;
            },
            function (btCollisionMargin_1_1) {
                btCollisionMargin_1 = btCollisionMargin_1_1;
            },
            function (btScalar_5_1) {
                btScalar_5 = btScalar_5_1;
            },
            function (btBroadphaseProxy_2_1) {
                btBroadphaseProxy_2 = btBroadphaseProxy_2_1;
            }
        ],
        execute: function () {/*
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
             * Maximum number of preferred penetration directions for convex shapes
             */
            exports_16("MAX_PREFERRED_PENETRATION_DIRECTIONS", MAX_PREFERRED_PENETRATION_DIRECTIONS = 10);
            /**
             * The btConvexShape is an abstract shape interface, implemented by all convex shapes
             * such as btBoxShape, btConvexHullShape etc.
             * It describes general convex shapes using the localGetSupportingVertex interface,
             * used by collision detectors such as btGjkPairDetector.
             */
            btConvexShape = class btConvexShape extends btCollisionShape_1.btCollisionShape {
                constructor() {
                    super();
                }
                // Virtual methods with default implementations
                /**
                 * Project the convex shape onto a direction and return the min and max projections
                 */
                project(trans, dir, minProj, maxProj, witnesPtMin, witnesPtMax) {
                    const localAxis = btMatrix3x3_3.multiplyMatrixVector(trans.getBasis().transpose(), dir);
                    const vtx1 = trans.transformPoint(this.localGetSupportingVertex(localAxis));
                    const vtx2 = trans.transformPoint(this.localGetSupportingVertex(localAxis.negate()));
                    minProj.value = vtx1.dot(dir);
                    maxProj.value = vtx2.dot(dir);
                    witnesPtMax.copy(vtx2);
                    witnesPtMin.copy(vtx1);
                    if (minProj.value > maxProj.value) {
                        const tmp = minProj.value;
                        minProj.value = maxProj.value;
                        maxProj.value = tmp;
                        witnesPtMax.copy(vtx1);
                        witnesPtMin.copy(vtx2);
                    }
                }
                // Non-virtual methods with specific implementations
                /**
                 * Non-virtual version of localGetSupportingVertexWithoutMargin
                 * This method contains optimized implementations for different shape types
                 */
                localGetSupportVertexWithoutMarginNonVirtual(localDir) {
                    switch (this.m_shapeType) {
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
                            return new btVector3_9.btVector3(0, 0, 0);
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
                            // Box shape support vertex calculation
                            // This would need the actual box shape implementation
                            // For now, fall through to default
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
                            // Triangle shape support vertex calculation
                            // This would need the actual triangle shape implementation
                            // For now, fall through to default
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
                            // Cylinder shape support vertex calculation
                            // This would need the actual cylinder shape implementation
                            // For now, fall through to default
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
                            // Capsule shape support vertex calculation
                            // This would need the actual capsule shape implementation
                            // For now, fall through to default
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
                            // Convex hull support vertex calculation
                            // This would need the actual convex hull shape implementation
                            // For now, fall through to default
                            break;
                        default:
                            return this.localGetSupportingVertexWithoutMargin(localDir);
                    }
                    // Should never reach here - but provide fallback
                    btScalar_5.btAssert(false, "Unknown shape type in localGetSupportVertexWithoutMarginNonVirtual");
                    return new btVector3_9.btVector3(0, 0, 0);
                }
                /**
                 * Non-virtual version of localGetSupportingVertex
                 */
                localGetSupportVertexNonVirtual(localDir) {
                    let localDirNorm = localDir.clone();
                    if (localDirNorm.length2() < (btScalar_5.SIMD_EPSILON * btScalar_5.SIMD_EPSILON)) {
                        localDirNorm.setValue(-1, -1, -1);
                    }
                    localDirNorm.normalize();
                    return this.localGetSupportVertexWithoutMarginNonVirtual(localDirNorm)
                        .add(localDirNorm.multiply(this.getMarginNonVirtual()));
                }
                /**
                 * Non-virtual version of getMargin
                 */
                getMarginNonVirtual() {
                    switch (this.m_shapeType) {
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
                            // For sphere, radius is the margin - would need actual sphere shape implementation
                            return btCollisionMargin_1.CONVEX_DISTANCE_MARGIN; // Fallback
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CONE_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
                            // These would need actual shape implementations to get correct margins
                            return btCollisionMargin_1.CONVEX_DISTANCE_MARGIN; // Fallback
                        default:
                            return this.getMargin();
                    }
                }
                /**
                 * Non-virtual version of getAabb
                 */
                getAabbNonVirtual(t, aabbMin, aabbMax) {
                    switch (this.m_shapeType) {
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
                            {
                                // Sphere AABB calculation - simplified implementation
                                const margin = this.getMarginNonVirtual();
                                const center = t.getOrigin();
                                const extent = new btVector3_9.btVector3(margin, margin, margin);
                                aabbMin.copy(center.subtract(extent));
                                aabbMax.copy(center.add(extent));
                            }
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
                            {
                                // Box/Cylinder AABB calculation - would need actual shape implementations
                                // For now, fall through to default
                                this.getAabb(t, aabbMin, aabbMax);
                            }
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
                            {
                                // Triangle AABB calculation - would need actual shape implementation
                                // For now, fall through to default
                                this.getAabb(t, aabbMin, aabbMax);
                            }
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
                            {
                                // Capsule AABB calculation - would need actual shape implementation
                                // For now, fall through to default
                                this.getAabb(t, aabbMin, aabbMax);
                            }
                            break;
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
                        case btBroadphaseProxy_2.BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
                            {
                                // Convex hull AABB calculation - would need actual shape implementations
                                // For now, fall through to default
                                this.getAabb(t, aabbMin, aabbMax);
                            }
                            break;
                        default:
                            this.getAabb(t, aabbMin, aabbMax);
                            break;
                    }
                }
            };
            exports_16("btConvexShape", btConvexShape);
        }
    };
});
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
System.register("src/BulletCollision/NarrowPhaseCollision/btManifoldPoint", ["src/LinearMath/btVector3"], function (exports_17, context_17) {
    "use strict";
    var btVector3_10, btContactPointFlags, btManifoldPoint;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (btVector3_10_1) {
                btVector3_10 = btVector3_10_1;
            }
        ],
        execute: function () {/*
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
             * Contact point flags for additional information
             */
            (function (btContactPointFlags) {
                btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED"] = 1] = "BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED";
                btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_HAS_CONTACT_CFM"] = 2] = "BT_CONTACT_FLAG_HAS_CONTACT_CFM";
                btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_HAS_CONTACT_ERP"] = 4] = "BT_CONTACT_FLAG_HAS_CONTACT_ERP";
                btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_FRICTION_ANCHOR"] = 8] = "BT_CONTACT_FLAG_FRICTION_ANCHOR";
            })(btContactPointFlags || (exports_17("btContactPointFlags", btContactPointFlags = {})));
            /**
             * btManifoldPoint collects and maintains persistent contactpoints.
             * Used to improve stability and performance of rigidbody dynamics response.
             */
            btManifoldPoint = class btManifoldPoint {
                constructor(pointA, pointB, normal, distance) {
                    this.m_localPointA = pointA ? new btVector3_10.btVector3(pointA.x(), pointA.y(), pointA.z()) : new btVector3_10.btVector3();
                    this.m_localPointB = pointB ? new btVector3_10.btVector3(pointB.x(), pointB.y(), pointB.z()) : new btVector3_10.btVector3();
                    this.m_positionWorldOnB = pointB ? new btVector3_10.btVector3(pointB.x(), pointB.y(), pointB.z()) : new btVector3_10.btVector3();
                    this.m_positionWorldOnA = pointA ? new btVector3_10.btVector3(pointA.x(), pointA.y(), pointA.z()) : new btVector3_10.btVector3();
                    this.m_normalWorldOnB = normal ? new btVector3_10.btVector3(normal.x(), normal.y(), normal.z()) : new btVector3_10.btVector3();
                    this.m_distance1 = distance || 0;
                    this.m_combinedFriction = 0;
                    this.m_combinedRestitution = 0;
                    this.m_combinedRollingFriction = 0;
                    this.m_combinedSpinningFriction = 0;
                    this.m_appliedImpulse = 0;
                    this.m_lateralFrictionInitialized = false;
                    this.m_appliedImpulseLateral1 = 0;
                    this.m_appliedImpulseLateral2 = 0;
                    this.m_contactMotion1 = 0;
                    this.m_contactMotion2 = 0;
                    this.m_contactCFM1 = 0;
                    this.m_contactCFM2 = 0;
                    this.m_contactERP = 0;
                    this.m_lifeTime = 0;
                    this.m_lateralFrictionDir1 = new btVector3_10.btVector3();
                    this.m_lateralFrictionDir2 = new btVector3_10.btVector3();
                    this.m_userPersistentData = null;
                    this.m_partId0 = -1;
                    this.m_partId1 = -1;
                    this.m_index0 = -1;
                    this.m_index1 = -1;
                    this.m_contactPointFlags = 0;
                    this.m_prevRHS = 0;
                }
                /**
                 * Get distance between contact points
                 */
                getDistance() {
                    return this.m_distance1;
                }
                /**
                 * Get lifetime of this contact point
                 */
                getLifeTime() {
                    return this.m_lifeTime;
                }
                /**
                 * Get position on object A in world coordinates
                 */
                getPositionWorldOnA() {
                    return this.m_positionWorldOnA;
                }
                /**
                 * Get position on object B in world coordinates
                 */
                getPositionWorldOnB() {
                    return this.m_positionWorldOnB;
                }
                /**
                 * Set distance between contact points
                 */
                setDistance(dist) {
                    this.m_distance1 = dist;
                }
                /**
                 * Get applied impulse
                 */
                getAppliedImpulse() {
                    return this.m_appliedImpulse;
                }
            };
            exports_17("btManifoldPoint", btManifoldPoint);
        }
    };
});
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
System.register("src/BulletCollision/CollisionDispatch/btCollisionObjectWrapper", [], function (exports_18, context_18) {
    "use strict";
    var btCollisionObjectWrapper;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {/*
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
             * btCollisionObjectWrapper is a wrapper class for btCollisionObject.
             * It is used to pass collision object data to collision algorithms.
             */
            btCollisionObjectWrapper = class btCollisionObjectWrapper {
                constructor(parent, shape, collisionObject, worldTransform, partId = -1, index = -1) {
                    this.m_parent = parent;
                    this.m_shape = shape;
                    this.m_collisionObject = collisionObject;
                    this.m_worldTransform = worldTransform;
                    this.m_partId = partId;
                    this.m_index = index;
                }
                getWorldTransform() {
                    return this.m_worldTransform;
                }
                getCollisionObject() {
                    return this.m_collisionObject;
                }
                getCollisionShape() {
                    return this.m_shape;
                }
                getPartId() {
                    return this.m_partId;
                }
                getIndex() {
                    return this.m_index;
                }
                getParent() {
                    return this.m_parent;
                }
            };
            exports_18("btCollisionObjectWrapper", btCollisionObjectWrapper);
        }
    };
});
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
System.register("src/BulletCollision/CollisionDispatch/btCollisionWorld", ["src/LinearMath/btVector3", "src/LinearMath/btMatrix3x3", "src/LinearMath/btTransform", "src/LinearMath/btIDebugDraw", "src/BulletCollision/BroadphaseCollision/btBroadphaseProxy"], function (exports_19, context_19) {
    "use strict";
    var btVector3_11, btMatrix3x3_4, btTransform_3, btIDebugDraw_1, btBroadphaseProxy_3, LocalRayResult, RayResultCallback, ClosestRayResultCallback, AllHitsRayResultCallback, LocalConvexResult, ConvexResultCallback, ClosestConvexResultCallback, ContactResultCallback, btCollisionWorld;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (btVector3_11_1) {
                btVector3_11 = btVector3_11_1;
            },
            function (btMatrix3x3_4_1) {
                btMatrix3x3_4 = btMatrix3x3_4_1;
            },
            function (btTransform_3_1) {
                btTransform_3 = btTransform_3_1;
            },
            function (btIDebugDraw_1_1) {
                btIDebugDraw_1 = btIDebugDraw_1_1;
            },
            function (btBroadphaseProxy_3_1) {
                btBroadphaseProxy_3 = btBroadphaseProxy_3_1;
            }
        ],
        execute: function () {/*
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
             * Result structure for ray tests
             */
            LocalRayResult = class LocalRayResult {
                constructor(collisionObject, localShapeInfo, hitNormalLocal, hitFraction) {
                    this.m_collisionObject = collisionObject;
                    this.m_localShapeInfo = localShapeInfo;
                    this.m_hitNormalLocal = hitNormalLocal;
                    this.m_hitFraction = hitFraction;
                }
            };
            exports_19("LocalRayResult", LocalRayResult);
            /**
             * Result callback for ray tests
             */
            RayResultCallback = class RayResultCallback {
                constructor() {
                    this.m_closestHitFraction = 1.0;
                    this.m_collisionObject = null;
                    this.m_collisionFilterGroup = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
                    this.m_collisionFilterMask = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.AllFilter;
                    this.m_flags = 0;
                }
                hasHit() {
                    return this.m_collisionObject !== null;
                }
                needsCollision(proxy0) {
                    const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
                    return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
                }
            };
            exports_19("RayResultCallback", RayResultCallback);
            /**
             * Closest ray result callback
             */
            ClosestRayResultCallback = class ClosestRayResultCallback extends RayResultCallback {
                constructor(rayFromWorld, rayToWorld) {
                    super();
                    this.m_rayFromWorld = rayFromWorld;
                    this.m_rayToWorld = rayToWorld;
                    this.m_hitNormalWorld = new btVector3_11.btVector3();
                    this.m_hitPointWorld = new btVector3_11.btVector3();
                }
                addSingleResult(rayResult, normalInWorldSpace) {
                    // Caller already does the filter on the m_closestHitFraction
                    console.assert(rayResult.m_hitFraction <= this.m_closestHitFraction);
                    this.m_closestHitFraction = rayResult.m_hitFraction;
                    this.m_collisionObject = rayResult.m_collisionObject;
                    if (normalInWorldSpace) {
                        this.m_hitNormalWorld.copy(rayResult.m_hitNormalLocal);
                    }
                    else {
                        // Need to transform normal into worldspace
                        const worldTrans = this.m_collisionObject.getWorldTransform();
                        this.m_hitNormalWorld.copy(btMatrix3x3_4.multiplyMatrixVector(worldTrans.getBasis(), rayResult.m_hitNormalLocal));
                    }
                    this.m_hitPointWorld.setInterpolate3(this.m_rayFromWorld, this.m_rayToWorld, rayResult.m_hitFraction);
                    return rayResult.m_hitFraction;
                }
            };
            exports_19("ClosestRayResultCallback", ClosestRayResultCallback);
            /**
             * All hits ray result callback
             */
            AllHitsRayResultCallback = class AllHitsRayResultCallback extends RayResultCallback {
                constructor(rayFromWorld, rayToWorld) {
                    super();
                    this.m_rayFromWorld = rayFromWorld;
                    this.m_rayToWorld = rayToWorld;
                    this.m_collisionObjects = [];
                    this.m_hitNormalWorld = [];
                    this.m_hitPointWorld = [];
                    this.m_hitFractions = [];
                }
                addSingleResult(rayResult, normalInWorldSpace) {
                    this.m_collisionObject = rayResult.m_collisionObject;
                    this.m_collisionObjects.push(rayResult.m_collisionObject);
                    let hitNormalWorld;
                    if (normalInWorldSpace) {
                        hitNormalWorld = rayResult.m_hitNormalLocal.clone();
                    }
                    else {
                        // Need to transform normal into worldspace
                        const worldTrans = this.m_collisionObject.getWorldTransform();
                        hitNormalWorld = btMatrix3x3_4.multiplyMatrixVector(worldTrans.getBasis(), rayResult.m_hitNormalLocal);
                    }
                    this.m_hitNormalWorld.push(hitNormalWorld);
                    const hitPointWorld = new btVector3_11.btVector3();
                    hitPointWorld.setInterpolate3(this.m_rayFromWorld, this.m_rayToWorld, rayResult.m_hitFraction);
                    this.m_hitPointWorld.push(hitPointWorld);
                    this.m_hitFractions.push(rayResult.m_hitFraction);
                    return this.m_closestHitFraction;
                }
            };
            exports_19("AllHitsRayResultCallback", AllHitsRayResultCallback);
            /**
             * Result structure for convex sweep tests
             */
            LocalConvexResult = class LocalConvexResult {
                constructor(hitCollisionObject, localShapeInfo, hitNormalLocal, hitPointLocal, hitFraction) {
                    this.m_hitCollisionObject = hitCollisionObject;
                    this.m_localShapeInfo = localShapeInfo;
                    this.m_hitNormalLocal = hitNormalLocal;
                    this.m_hitPointLocal = hitPointLocal;
                    this.m_hitFraction = hitFraction;
                }
            };
            exports_19("LocalConvexResult", LocalConvexResult);
            /**
             * Result callback for convex sweep tests
             */
            ConvexResultCallback = class ConvexResultCallback {
                constructor() {
                    this.m_closestHitFraction = 1.0;
                    this.m_collisionFilterGroup = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
                    this.m_collisionFilterMask = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.AllFilter;
                }
                hasHit() {
                    return this.m_closestHitFraction < 1.0;
                }
                needsCollision(proxy0) {
                    const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
                    return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
                }
            };
            exports_19("ConvexResultCallback", ConvexResultCallback);
            /**
             * Closest convex result callback
             */
            ClosestConvexResultCallback = class ClosestConvexResultCallback extends ConvexResultCallback {
                constructor(convexFromWorld, convexToWorld) {
                    super();
                    this.m_convexFromWorld = convexFromWorld;
                    this.m_convexToWorld = convexToWorld;
                    this.m_hitNormalWorld = new btVector3_11.btVector3();
                    this.m_hitPointWorld = new btVector3_11.btVector3();
                    this.m_hitCollisionObject = null;
                }
                addSingleResult(convexResult, normalInWorldSpace) {
                    // Caller already does the filter on the m_closestHitFraction
                    console.assert(convexResult.m_hitFraction <= this.m_closestHitFraction);
                    this.m_closestHitFraction = convexResult.m_hitFraction;
                    this.m_hitCollisionObject = convexResult.m_hitCollisionObject;
                    if (normalInWorldSpace) {
                        this.m_hitNormalWorld.copy(convexResult.m_hitNormalLocal);
                    }
                    else {
                        // Need to transform normal into worldspace
                        const worldTrans = this.m_hitCollisionObject.getWorldTransform();
                        this.m_hitNormalWorld.copy(btMatrix3x3_4.multiplyMatrixVector(worldTrans.getBasis(), convexResult.m_hitNormalLocal));
                    }
                    this.m_hitPointWorld.copy(convexResult.m_hitPointLocal);
                    return convexResult.m_hitFraction;
                }
            };
            exports_19("ClosestConvexResultCallback", ClosestConvexResultCallback);
            /**
             * Contact result callback
             */
            ContactResultCallback = class ContactResultCallback {
                constructor() {
                    this.m_collisionFilterGroup = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
                    this.m_collisionFilterMask = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.AllFilter;
                    this.m_closestDistanceThreshold = 0;
                }
                needsCollision(proxy0) {
                    const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
                    return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
                }
            };
            exports_19("ContactResultCallback", ContactResultCallback);
            /**
             * CollisionWorld is interface and container for the collision detection
             */
            btCollisionWorld = class btCollisionWorld {
                constructor(dispatcher, broadphasePairCache, _collisionConfiguration) {
                    this.m_collisionObjects = [];
                    this.m_dispatcher1 = dispatcher;
                    this.m_broadphasePairCache = broadphasePairCache;
                    this.m_debugDrawer = null;
                    this.m_forceUpdateAllAabbs = true;
                    // Initialize dispatch info with default values
                    this.m_dispatchInfo = {
                        m_timeStep: 1.0 / 60.0,
                        m_stepCount: 0,
                        m_dispatchFunc: 1,
                        m_timeOfImpact: 1.0,
                        m_useContinuous: true,
                        m_debugDraw: null,
                        m_enableSatConvex: false,
                        m_enableSPU: true,
                        m_useEpa: true,
                        m_allowedCcdPenetration: 0.04,
                        m_useConvexConservativeDistanceUtil: false,
                        m_convexConservativeDistanceThreshold: 0.0,
                        m_deterministicOverlappingPairs: false,
                        m_stackAllocator: null
                    };
                }
                setBroadphase(pairCache) {
                    this.m_broadphasePairCache = pairCache;
                }
                getBroadphase() {
                    return this.m_broadphasePairCache;
                }
                getPairCache() {
                    return this.m_broadphasePairCache.getOverlappingPairCache();
                }
                getDispatcher() {
                    return this.m_dispatcher1;
                }
                updateSingleAabb(colObj) {
                    const minAabb = new btVector3_11.btVector3();
                    const maxAabb = new btVector3_11.btVector3();
                    const shape = colObj.getCollisionShape();
                    if (shape) {
                        shape.getAabb(colObj.getWorldTransform(), minAabb, maxAabb);
                        // Check for contact processing threshold
                        const contactThreshold = colObj.getContactProcessingThreshold();
                        if (contactThreshold !== 0.0) {
                            const contactThresholdVec = new btVector3_11.btVector3(contactThreshold, contactThreshold, contactThreshold);
                            minAabb.subtract(contactThresholdVec);
                            maxAabb.add(contactThresholdVec);
                        }
                        // Update broadphase AABB
                        const bp = colObj.getBroadphaseHandle();
                        if (bp) {
                            this.m_broadphasePairCache.setAabb(bp, minAabb, maxAabb, this.m_dispatcher1);
                        }
                    }
                }
                updateAabbs() {
                    for (const colObj of this.m_collisionObjects) {
                        if (this.m_forceUpdateAllAabbs || colObj.isActive()) {
                            this.updateSingleAabb(colObj);
                        }
                    }
                }
                computeOverlappingPairs() {
                    this.m_broadphasePairCache.calculateOverlappingPairs(this.m_dispatcher1);
                }
                setDebugDrawer(debugDrawer) {
                    this.m_debugDrawer = debugDrawer;
                }
                getDebugDrawer() {
                    return this.m_debugDrawer;
                }
                debugDrawWorld() {
                    if (!this.m_debugDrawer) {
                        return;
                    }
                    const drawAabb = (this.m_debugDrawer.getDebugMode() & btIDebugDraw_1.btIDebugDraw.DebugDrawModes.DBG_DrawAabb) !== 0;
                    const drawWireframe = (this.m_debugDrawer.getDebugMode() & btIDebugDraw_1.btIDebugDraw.DebugDrawModes.DBG_DrawWireframe) !== 0;
                    if (drawAabb || drawWireframe) {
                        for (const colObj of this.m_collisionObjects) {
                            const shape = colObj.getCollisionShape();
                            if (shape) {
                                const color = new btVector3_11.btVector3(1, 1, 1);
                                if (drawAabb) {
                                    const minAabb = new btVector3_11.btVector3();
                                    const maxAabb = new btVector3_11.btVector3();
                                    shape.getAabb(colObj.getWorldTransform(), minAabb, maxAabb);
                                    this.m_debugDrawer.drawBox(minAabb, maxAabb, color);
                                }
                                if (drawWireframe) {
                                    this.debugDrawObject(colObj.getWorldTransform(), shape, color);
                                }
                            }
                        }
                    }
                }
                debugDrawObject(worldTransform, shape, color) {
                    // Basic debug drawing - can be extended for specific shape types
                    if (this.m_debugDrawer) {
                        const minAabb = new btVector3_11.btVector3();
                        const maxAabb = new btVector3_11.btVector3();
                        shape.getAabb(worldTransform, minAabb, maxAabb);
                        this.m_debugDrawer.drawBox(minAabb, maxAabb, color);
                    }
                }
                getNumCollisionObjects() {
                    return this.m_collisionObjects.length;
                }
                rayTest(rayFromWorld, rayToWorld, resultCallback) {
                    // Basic ray test implementation
                    // This is a simplified version - in the full implementation this would use the broadphase
                    for (const colObj of this.m_collisionObjects) {
                        if (!resultCallback.needsCollision(colObj.getBroadphaseHandle())) {
                            continue;
                        }
                        // Simplified ray test - in reality this would call collision algorithms
                        const rayFrom = new btTransform_3.btTransform();
                        rayFrom.setOrigin(rayFromWorld);
                        const rayTo = new btTransform_3.btTransform();
                        rayTo.setOrigin(rayToWorld);
                        btCollisionWorld.rayTestSingle(rayFrom, rayTo, colObj, colObj.getCollisionShape(), colObj.getWorldTransform(), resultCallback);
                    }
                }
                convexSweepTest(castShape, from, to, resultCallback, allowedCcdPenetration = 0.0) {
                    // Basic convex sweep test implementation
                    for (const colObj of this.m_collisionObjects) {
                        if (!resultCallback.needsCollision(colObj.getBroadphaseHandle())) {
                            continue;
                        }
                        // Simplified convex test - in reality this would call collision algorithms
                        btCollisionWorld.objectQuerySingle(castShape, from, to, colObj, colObj.getCollisionShape(), colObj.getWorldTransform(), resultCallback, allowedCcdPenetration);
                    }
                }
                contactTest(_colObj, _resultCallback) {
                    // Basic contact test implementation - simplified for now
                    console.log('Contact test not fully implemented yet');
                }
                contactPairTest(_colObjA, _colObjB, _resultCallback) {
                    // Basic contact pair test implementation - simplified for now
                    console.log('Contact pair test not fully implemented yet');
                }
                static rayTestSingle(rayFromTrans, rayToTrans, collisionObject, _collisionShape, _colObjWorldTransform, resultCallback) {
                    // Simplified ray test single implementation
                    // In the full implementation this would dispatch to collision algorithms
                    const rayDir = rayToTrans.getOrigin().subtract(rayFromTrans.getOrigin());
                    const rayLength = rayDir.length();
                    rayDir.normalize();
                    // Basic sphere test as an example - real implementation would dispatch based on shape type
                    const result = new LocalRayResult(collisionObject, null, new btVector3_11.btVector3(0, 0, 1), rayLength > 0 ? 0.5 : 1.0 // Simplified hit fraction
                    );
                    if (result.m_hitFraction < resultCallback.m_closestHitFraction) {
                        resultCallback.addSingleResult(result, false);
                    }
                }
                static rayTestSingleInternal(rayFromTrans, rayToTrans, collisionObjectWrap, resultCallback) {
                    // Simplified internal ray test
                    this.rayTestSingle(rayFromTrans, rayToTrans, collisionObjectWrap.getCollisionObject(), collisionObjectWrap.getCollisionShape(), collisionObjectWrap.getWorldTransform(), resultCallback);
                }
                static objectQuerySingle(_castShape, _rayFromTrans, _rayToTrans, collisionObject, _collisionShape, _colObjWorldTransform, resultCallback, _allowedPenetration) {
                    // Simplified object query single implementation
                    const result = new LocalConvexResult(collisionObject, null, new btVector3_11.btVector3(0, 0, 1), new btVector3_11.btVector3(0, 0, 0), 0.5 // Simplified hit fraction
                    );
                    if (result.m_hitFraction < resultCallback.m_closestHitFraction) {
                        resultCallback.addSingleResult(result, false);
                    }
                }
                static objectQuerySingleInternal(castShape, convexFromTrans, convexToTrans, colObjWrap, resultCallback, allowedPenetration) {
                    // Simplified internal object query
                    this.objectQuerySingle(castShape, convexFromTrans, convexToTrans, colObjWrap.getCollisionObject(), colObjWrap.getCollisionShape(), colObjWrap.getWorldTransform(), resultCallback, allowedPenetration);
                }
                addCollisionObject(collisionObject, collisionFilterGroup = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.DefaultFilter, collisionFilterMask = btBroadphaseProxy_3.btBroadphaseProxy.CollisionFilterGroups.AllFilter) {
                    // Check if object is already in the world
                    if (this.m_collisionObjects.includes(collisionObject)) {
                        console.warn('Object already in collision world');
                        return;
                    }
                    collisionObject.setWorldArrayIndex(this.m_collisionObjects.length);
                    this.m_collisionObjects.push(collisionObject);
                    // Create broadphase proxy
                    const shape = collisionObject.getCollisionShape();
                    if (shape) {
                        const minAabb = new btVector3_11.btVector3();
                        const maxAabb = new btVector3_11.btVector3();
                        shape.getAabb(collisionObject.getWorldTransform(), minAabb, maxAabb);
                        const proxyType = shape.getShapeType();
                        const proxy = this.m_broadphasePairCache.createProxy(minAabb, maxAabb, proxyType, collisionObject, collisionFilterGroup, collisionFilterMask, this.m_dispatcher1);
                        collisionObject.setBroadphaseHandle(proxy);
                    }
                }
                refreshBroadphaseProxy(collisionObject) {
                    const shape = collisionObject.getCollisionShape();
                    const bp = collisionObject.getBroadphaseHandle();
                    if (shape && bp) {
                        this.m_broadphasePairCache.destroyProxy(bp, this.m_dispatcher1);
                        const minAabb = new btVector3_11.btVector3();
                        const maxAabb = new btVector3_11.btVector3();
                        shape.getAabb(collisionObject.getWorldTransform(), minAabb, maxAabb);
                        const proxyType = shape.getShapeType();
                        const newProxy = this.m_broadphasePairCache.createProxy(minAabb, maxAabb, proxyType, collisionObject, bp.m_collisionFilterGroup, bp.m_collisionFilterMask, this.m_dispatcher1);
                        collisionObject.setBroadphaseHandle(newProxy);
                    }
                }
                getCollisionObjectArray() {
                    return this.m_collisionObjects;
                }
                removeCollisionObject(collisionObject) {
                    const index = this.m_collisionObjects.indexOf(collisionObject);
                    if (index >= 0) {
                        // Remove from broadphase
                        const bp = collisionObject.getBroadphaseHandle();
                        if (bp) {
                            this.m_broadphasePairCache.destroyProxy(bp, this.m_dispatcher1);
                            collisionObject.setBroadphaseHandle(null);
                        }
                        // Remove from array
                        this.m_collisionObjects.splice(index, 1);
                        // Update array indices for remaining objects
                        for (let i = index; i < this.m_collisionObjects.length; i++) {
                            this.m_collisionObjects[i].setWorldArrayIndex(i);
                        }
                    }
                }
                performDiscreteCollisionDetection() {
                    this.updateAabbs();
                    this.computeOverlappingPairs();
                    const dispatcher = this.getDispatcher();
                    if (dispatcher) {
                        dispatcher.dispatchAllCollisionPairs(this.m_broadphasePairCache.getOverlappingPairCache(), this.m_dispatchInfo, this.m_dispatcher1);
                    }
                }
                getDispatchInfo() {
                    return this.m_dispatchInfo;
                }
                getForceUpdateAllAabbs() {
                    return this.m_forceUpdateAllAabbs;
                }
                setForceUpdateAllAabbs(forceUpdateAllAabbs) {
                    this.m_forceUpdateAllAabbs = forceUpdateAllAabbs;
                }
            };
            exports_19("btCollisionWorld", btCollisionWorld);
        }
    };
});
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
System.register("src/BulletCollision/CollisionDispatch/btCollisionConfiguration", [], function (exports_20, context_20) {
    "use strict";
    var btDefaultPoolAllocator, btDefaultCollisionAlgorithmCreateFunc, btCollisionConfiguration;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [],
        execute: function () {/*
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
             * Basic pool allocator implementation
             */
            btDefaultPoolAllocator = class btDefaultPoolAllocator {
                constructor(maxElements, elementSize) {
                    this.m_maxElements = maxElements;
                    this.m_elementSize = elementSize;
                    this.m_freeElements = [];
                }
                getFreeCount() {
                    return this.m_freeElements.length;
                }
                getUsedCount() {
                    return this.m_maxElements - this.m_freeElements.length;
                }
                getMaxCount() {
                    return this.m_maxElements;
                }
                allocate(_size) {
                    if (this.m_freeElements.length > 0) {
                        return this.m_freeElements.pop();
                    }
                    return {}; // Simplified allocation
                }
                validPtr(ptr) {
                    return ptr !== null && ptr !== undefined;
                }
                freeMemory(ptr) {
                    if (this.validPtr(ptr)) {
                        this.m_freeElements.push(ptr);
                    }
                }
            };
            exports_20("btDefaultPoolAllocator", btDefaultPoolAllocator);
            /**
             * Basic collision algorithm creation function implementation
             */
            btDefaultCollisionAlgorithmCreateFunc = class btDefaultCollisionAlgorithmCreateFunc {
                constructor(swapped = false) {
                    this.swapped = swapped;
                }
                createCollisionAlgorithm(_info, _body0, _body1) {
                    // Simplified implementation - returns null for now
                    return null;
                }
            };
            exports_20("btDefaultCollisionAlgorithmCreateFunc", btDefaultCollisionAlgorithmCreateFunc);
            /**
             * btCollisionConfiguration allows to configure Bullet collision detection
             * stack allocator, pool memory allocators
             */
            btCollisionConfiguration = class btCollisionConfiguration {
            };
            exports_20("btCollisionConfiguration", btCollisionConfiguration);
        }
    };
});
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
System.register("src/BulletDynamics/ConstraintSolver/btContactSolverInfo", [], function (exports_21, context_21) {
    "use strict";
    var btSolverMode, btContactSolverInfo;
    var __moduleName = context_21 && context_21.id;
    return {
        setters: [],
        execute: function () {/*
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
            (function (btSolverMode) {
                btSolverMode[btSolverMode["SOLVER_RANDMIZE_ORDER"] = 1] = "SOLVER_RANDMIZE_ORDER";
                btSolverMode[btSolverMode["SOLVER_FRICTION_SEPARATE"] = 2] = "SOLVER_FRICTION_SEPARATE";
                btSolverMode[btSolverMode["SOLVER_USE_WARMSTARTING"] = 4] = "SOLVER_USE_WARMSTARTING";
                btSolverMode[btSolverMode["SOLVER_USE_2_FRICTION_DIRECTIONS"] = 16] = "SOLVER_USE_2_FRICTION_DIRECTIONS";
                btSolverMode[btSolverMode["SOLVER_ENABLE_FRICTION_DIRECTION_CACHING"] = 32] = "SOLVER_ENABLE_FRICTION_DIRECTION_CACHING";
                btSolverMode[btSolverMode["SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION"] = 64] = "SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION";
                btSolverMode[btSolverMode["SOLVER_CACHE_FRIENDLY"] = 128] = "SOLVER_CACHE_FRIENDLY";
                btSolverMode[btSolverMode["SOLVER_SIMD"] = 256] = "SOLVER_SIMD";
                btSolverMode[btSolverMode["SOLVER_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS"] = 512] = "SOLVER_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS";
                btSolverMode[btSolverMode["SOLVER_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS"] = 1024] = "SOLVER_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS";
                btSolverMode[btSolverMode["SOLVER_DISABLE_IMPLICIT_CONE_FRICTION"] = 2048] = "SOLVER_DISABLE_IMPLICIT_CONE_FRICTION";
                btSolverMode[btSolverMode["SOLVER_USE_ARTICULATED_WARMSTARTING"] = 4096] = "SOLVER_USE_ARTICULATED_WARMSTARTING";
            })(btSolverMode || (exports_21("btSolverMode", btSolverMode = {})));
            btContactSolverInfo = class btContactSolverInfo {
                constructor() {
                    this.m_tau = 0.6;
                    this.m_damping = 1.0;
                    this.m_friction = 0.3;
                    this.m_timeStep = 1.0 / 60.0;
                    this.m_restitution = 0.0;
                    this.m_maxErrorReduction = 20.0;
                    this.m_numIterations = 10;
                    this.m_erp = 0.2;
                    this.m_erp2 = 0.2;
                    this.m_deformable_erp = 0.06;
                    this.m_deformable_cfm = 0.01;
                    this.m_deformable_maxErrorReduction = 0.1;
                    this.m_globalCfm = 0.0;
                    this.m_frictionERP = 0.2; // positional friction 'anchors' are disabled by default
                    this.m_frictionCFM = 0.0;
                    this.m_sor = 1.0;
                    this.m_splitImpulse = 1; // true
                    this.m_splitImpulsePenetrationThreshold = -0.04;
                    this.m_splitImpulseTurnErp = 0.1;
                    this.m_linearSlop = 0.0;
                    this.m_warmstartingFactor = 0.85;
                    this.m_articulatedWarmstartingFactor = 0.85;
                    // m_solverMode =  SOLVER_USE_WARMSTARTING |  SOLVER_SIMD | SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION|SOLVER_USE_2_FRICTION_DIRECTIONS|SOLVER_ENABLE_FRICTION_DIRECTION_CACHING;// | SOLVER_RANDMIZE_ORDER;
                    this.m_solverMode = btSolverMode.SOLVER_USE_WARMSTARTING | btSolverMode.SOLVER_SIMD; // | SOLVER_RANDMIZE_ORDER;
                    this.m_restingContactRestitutionThreshold = 2; // unused as of 2.81
                    this.m_minimumSolverBatchSize = 128; // try to combine islands until the amount of constraints reaches this limit
                    this.m_maxGyroscopicForce = 100.0; // it is only used for 'explicit' version of gyroscopic force
                    this.m_singleAxisRollingFrictionThreshold = 1e30; // if the velocity is above this threshold, it will use a single constraint row (axis), otherwise 3 rows.
                    this.m_leastSquaresResidualThreshold = 0.0;
                    this.m_restitutionVelocityThreshold = 0.2; // if the relative velocity is below this threshold, there is zero restitution
                    this.m_jointFeedbackInWorldSpace = false;
                    this.m_jointFeedbackInJointFrame = false;
                    this.m_reportSolverAnalytics = 0;
                    this.m_numNonContactInnerIterations = 1; // the number of inner iterations for solving motor constraint in a single iteration of the constraint solve
                }
            };
            exports_21("btContactSolverInfo", btContactSolverInfo);
        }
    };
});
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
System.register("src/BulletCollision/NarrowPhaseCollision/btPersistentManifold", ["src/LinearMath/btScalar", "src/BulletCollision/NarrowPhaseCollision/btManifoldPoint"], function (exports_22, context_22) {
    "use strict";
    var btScalar_6, btScalar_7, btManifoldPoint_1, gContactBreakingThreshold, globalContactCallbacks, gContactDestroyedCallback, gContactProcessedCallback, gContactStartedCallback, gContactEndedCallback, btContactManifoldTypes, MANIFOLD_CACHE_SIZE, btPersistentManifold;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (btScalar_6_1) {
                btScalar_6 = btScalar_6_1;
                btScalar_7 = btScalar_6_1;
            },
            function (btManifoldPoint_1_1) {
                btManifoldPoint_1 = btManifoldPoint_1_1;
            }
        ],
        execute: function () {/*
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
            /** maximum contact breaking and merging threshold */
            exports_22("gContactBreakingThreshold", gContactBreakingThreshold = 0.02);
            /** Global contact callbacks - using a mutable object to allow test modification */
            exports_22("globalContactCallbacks", globalContactCallbacks = {
                gContactDestroyedCallback: null,
                gContactProcessedCallback: null,
                gContactStartedCallback: null,
                gContactEndedCallback: null
            });
            // Export individual getters for backwards compatibility
            exports_22("gContactDestroyedCallback", gContactDestroyedCallback = () => globalContactCallbacks.gContactDestroyedCallback);
            exports_22("gContactProcessedCallback", gContactProcessedCallback = () => globalContactCallbacks.gContactProcessedCallback);
            exports_22("gContactStartedCallback", gContactStartedCallback = () => globalContactCallbacks.gContactStartedCallback);
            exports_22("gContactEndedCallback", gContactEndedCallback = () => globalContactCallbacks.gContactEndedCallback);
            /** The enum starts at 1024 to avoid type conflicts with btTypedConstraint */
            (function (btContactManifoldTypes) {
                btContactManifoldTypes[btContactManifoldTypes["MIN_CONTACT_MANIFOLD_TYPE"] = 1024] = "MIN_CONTACT_MANIFOLD_TYPE";
                btContactManifoldTypes[btContactManifoldTypes["BT_PERSISTENT_MANIFOLD_TYPE"] = 1025] = "BT_PERSISTENT_MANIFOLD_TYPE";
            })(btContactManifoldTypes || (exports_22("btContactManifoldTypes", btContactManifoldTypes = {})));
            exports_22("MANIFOLD_CACHE_SIZE", MANIFOLD_CACHE_SIZE = 4);
            /**
             * btPersistentManifold is a contact point cache, it stays persistent as long as objects are overlapping in the broadphase.
             * Those contact points are created by the collision narrow phase.
             * The cache can be empty, or hold 1,2,3 or 4 points. Some collision algorithms (GJK) might only add one point at a time.
             * updates/refreshes old contact points, and throw them away if necessary (distance becomes too large)
             * reduces the cache to 4 points, when more then 4 points are added, using following rules:
             * the contact point with deepest penetration is always kept, and it tries to maximize the area covered by the points
             * note that some pairs of objects might have more then one contact manifold.
             */
            btPersistentManifold = class btPersistentManifold extends btScalar_6.btTypedObject {
                constructor(body0, body1, _unused, contactBreakingThreshold, contactProcessingThreshold) {
                    super(btContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE);
                    this.m_pointCache = [];
                    for (let i = 0; i < MANIFOLD_CACHE_SIZE; i++) {
                        this.m_pointCache.push(new btManifoldPoint_1.btManifoldPoint());
                    }
                    this.m_body0 = body0 || null;
                    this.m_body1 = body1 || null;
                    this.m_cachedPoints = 0;
                    this.m_contactBreakingThreshold = contactBreakingThreshold || gContactBreakingThreshold;
                    this.m_contactProcessingThreshold = contactProcessingThreshold || gContactBreakingThreshold;
                    this.m_companionIdA = 0;
                    this.m_companionIdB = 0;
                    this.m_index1a = 0;
                }
                getBody0() {
                    return this.m_body0;
                }
                getBody1() {
                    return this.m_body1;
                }
                setBodies(body0, body1) {
                    this.m_body0 = body0;
                    this.m_body1 = body1;
                }
                clearUserCache(pt) {
                    const cache = pt.m_userPersistentData;
                    if (cache && globalContactCallbacks.gContactDestroyedCallback) {
                        globalContactCallbacks.gContactDestroyedCallback(cache);
                    }
                    pt.m_userPersistentData = null;
                }
                getNumContacts() {
                    return this.m_cachedPoints;
                }
                /** the setNumContacts API is usually not used, except when you gather/fill all contacts manually */
                setNumContacts(cachedPoints) {
                    this.m_cachedPoints = cachedPoints;
                }
                getContactPoint(index) {
                    btScalar_7.btAssert(index < this.m_cachedPoints);
                    return this.m_pointCache[index];
                }
                /** @todo: get this margin from the current physics / collision environment */
                getContactBreakingThreshold() {
                    return this.m_contactBreakingThreshold;
                }
                getContactProcessingThreshold() {
                    return this.m_contactProcessingThreshold;
                }
                setContactBreakingThreshold(contactBreakingThreshold) {
                    this.m_contactBreakingThreshold = contactBreakingThreshold;
                }
                setContactProcessingThreshold(contactProcessingThreshold) {
                    this.m_contactProcessingThreshold = contactProcessingThreshold;
                }
                getCacheEntry(newPoint) {
                    let shortestDist = this.getContactBreakingThreshold() * this.getContactBreakingThreshold();
                    let size = this.getNumContacts();
                    let nearestPoint = -1;
                    for (let i = 0; i < size; i++) {
                        const mp = this.m_pointCache[i];
                        const diffA = mp.m_localPointA.subtract(newPoint.m_localPointA);
                        const distToManiPoint = diffA.dot(diffA);
                        if (distToManiPoint < shortestDist) {
                            shortestDist = distToManiPoint;
                            nearestPoint = i;
                        }
                    }
                    return nearestPoint;
                }
                addManifoldPoint(newPoint, _isPredictive = false) {
                    btScalar_7.btAssert(this.validContactDistance(newPoint));
                    let insertIndex = this.getNumContacts();
                    if (insertIndex === MANIFOLD_CACHE_SIZE) {
                        if (MANIFOLD_CACHE_SIZE >= 4) {
                            // Sort so most isolated points come first
                            insertIndex = this.sortCachedPoints(newPoint);
                        }
                        else {
                            insertIndex = 0;
                        }
                        this.clearUserCache(this.m_pointCache[insertIndex]);
                    }
                    else {
                        this.m_cachedPoints++;
                    }
                    if (insertIndex < 0) {
                        insertIndex = 0;
                    }
                    btScalar_7.btAssert(this.m_pointCache[insertIndex].m_userPersistentData === null);
                    this.m_pointCache[insertIndex] = newPoint;
                    return insertIndex;
                }
                removeContactPoint(index) {
                    this.clearUserCache(this.m_pointCache[index]);
                    const lastUsedIndex = this.getNumContacts() - 1;
                    if (index !== lastUsedIndex) {
                        this.m_pointCache[index] = this.m_pointCache[lastUsedIndex];
                        // Get rid of duplicated userPersistentData pointer
                        this.m_pointCache[lastUsedIndex].m_userPersistentData = null;
                        this.m_pointCache[lastUsedIndex].m_appliedImpulse = 0;
                        this.m_pointCache[lastUsedIndex].m_prevRHS = 0;
                        this.m_pointCache[lastUsedIndex].m_contactPointFlags = 0;
                        this.m_pointCache[lastUsedIndex].m_appliedImpulseLateral1 = 0;
                        this.m_pointCache[lastUsedIndex].m_appliedImpulseLateral2 = 0;
                        this.m_pointCache[lastUsedIndex].m_lifeTime = 0;
                    }
                    btScalar_7.btAssert(this.m_pointCache[lastUsedIndex].m_userPersistentData === null);
                    this.m_cachedPoints--;
                    if (globalContactCallbacks.gContactEndedCallback && this.m_cachedPoints === 0) {
                        globalContactCallbacks.gContactEndedCallback(this);
                    }
                }
                replaceContactPoint(newPoint, insertIndex) {
                    btScalar_7.btAssert(this.validContactDistance(newPoint));
                    const lifeTime = this.m_pointCache[insertIndex].getLifeTime();
                    const appliedImpulse = this.m_pointCache[insertIndex].m_appliedImpulse;
                    const prevRHS = this.m_pointCache[insertIndex].m_prevRHS;
                    const appliedLateralImpulse1 = this.m_pointCache[insertIndex].m_appliedImpulseLateral1;
                    const appliedLateralImpulse2 = this.m_pointCache[insertIndex].m_appliedImpulseLateral2;
                    let replacePoint = true;
                    /** we keep existing contact points for friction anchors */
                    /** if the friction force is within the Coulomb friction cone */
                    if (newPoint.m_contactPointFlags & btManifoldPoint_1.btContactPointFlags.BT_CONTACT_FLAG_FRICTION_ANCHOR) {
                        const mu = this.m_pointCache[insertIndex].m_combinedFriction;
                        const eps = 0; // we could allow to enlarge or shrink the tolerance to check against the friction cone a bit
                        const a = appliedLateralImpulse1 * appliedLateralImpulse1 + appliedLateralImpulse2 * appliedLateralImpulse2;
                        const b = eps + mu * appliedImpulse;
                        replacePoint = (a) > (b * b);
                    }
                    if (replacePoint) {
                        btScalar_7.btAssert(lifeTime >= 0);
                        const cache = this.m_pointCache[insertIndex].m_userPersistentData;
                        this.m_pointCache[insertIndex] = newPoint;
                        this.m_pointCache[insertIndex].m_userPersistentData = cache;
                        this.m_pointCache[insertIndex].m_appliedImpulse = appliedImpulse;
                        this.m_pointCache[insertIndex].m_prevRHS = prevRHS;
                        this.m_pointCache[insertIndex].m_appliedImpulseLateral1 = appliedLateralImpulse1;
                        this.m_pointCache[insertIndex].m_appliedImpulseLateral2 = appliedLateralImpulse2;
                    }
                    this.m_pointCache[insertIndex].m_lifeTime = lifeTime;
                }
                validContactDistance(pt) {
                    return pt.m_distance1 <= this.getContactBreakingThreshold();
                }
                /** calculated new worldspace coordinates and depth, and reject points that exceed the collision margin */
                refreshContactPoints(trA, trB) {
                    let i;
                    for (i = this.getNumContacts() - 1; i >= 0; i--) {
                        const manifoldPoint = this.m_pointCache[i];
                        manifoldPoint.m_positionWorldOnA = trA.transformPoint(manifoldPoint.m_localPointA);
                        manifoldPoint.m_positionWorldOnB = trB.transformPoint(manifoldPoint.m_localPointB);
                        manifoldPoint.m_distance1 = manifoldPoint.m_positionWorldOnA.subtract(manifoldPoint.m_positionWorldOnB).dot(manifoldPoint.m_normalWorldOnB);
                        manifoldPoint.m_lifeTime++;
                    }
                    // First remove deeper penetrations
                    let distance2d = this.getContactBreakingThreshold() * this.getContactBreakingThreshold();
                    for (i = this.getNumContacts() - 1; i >= 0; i--) {
                        const manifoldPoint = this.m_pointCache[i];
                        // Contact becomes invalid when signed distance exceeds the breaking threshold
                        // Contact also becomes invalid when relative motion between the two contact points exceeds the breaking threshold
                        // this is to catch cases where the object is removed from the manifold too late.
                        if (!this.validContactDistance(manifoldPoint)) {
                            this.removeContactPoint(i);
                        }
                        else {
                            // Calculate relative motion
                            const distance2 = manifoldPoint.m_positionWorldOnA.subtract(manifoldPoint.m_positionWorldOnB).length2();
                            if (distance2 > distance2d) {
                                this.removeContactPoint(i);
                            }
                        }
                    }
                }
                clearManifold() {
                    for (let i = 0; i < this.m_cachedPoints; i++) {
                        this.clearUserCache(this.m_pointCache[i]);
                    }
                    if (globalContactCallbacks.gContactEndedCallback && this.m_cachedPoints) {
                        globalContactCallbacks.gContactEndedCallback(this);
                    }
                    this.m_cachedPoints = 0;
                }
                /** sort cached points so most isolated points come first */
                sortCachedPoints(pt) {
                    // Calculate area of the quadrilateral formed by the current cached points plus the new point
                    let maxPenetration = pt.getDistance();
                    let biggestIndex = -1;
                    for (let i = 0; i < this.getNumContacts(); i++) {
                        if (this.m_pointCache[i].getDistance() < maxPenetration) {
                            maxPenetration = this.m_pointCache[i].getDistance();
                            biggestIndex = i;
                        }
                    }
                    // If no point is deeper than the new point, don't add it
                    if (biggestIndex >= 0) {
                        return biggestIndex;
                    }
                    // Find the point that contributes least to the contact area
                    let res0 = 0, res1 = 0, res2 = 0, res3 = 0;
                    if (MANIFOLD_CACHE_SIZE >= 4) {
                        const a0 = pt.m_localPointA.subtract(this.m_pointCache[1].m_localPointA);
                        const b0 = this.m_pointCache[3].m_localPointA.subtract(this.m_pointCache[2].m_localPointA);
                        res0 = a0.cross(b0).length2();
                        const a1 = pt.m_localPointA.subtract(this.m_pointCache[0].m_localPointA);
                        const b1 = this.m_pointCache[3].m_localPointA.subtract(this.m_pointCache[2].m_localPointA);
                        res1 = a1.cross(b1).length2();
                        const a2 = pt.m_localPointA.subtract(this.m_pointCache[0].m_localPointA);
                        const b2 = this.m_pointCache[3].m_localPointA.subtract(this.m_pointCache[1].m_localPointA);
                        res2 = a2.cross(b2).length2();
                        const a3 = pt.m_localPointA.subtract(this.m_pointCache[0].m_localPointA);
                        const b3 = this.m_pointCache[2].m_localPointA.subtract(this.m_pointCache[1].m_localPointA);
                        res3 = a3.cross(b3).length2();
                    }
                    let biggestarea = res0;
                    biggestIndex = 0;
                    if (res1 > biggestarea) {
                        biggestarea = res1;
                        biggestIndex = 1;
                    }
                    if (res2 > biggestarea) {
                        biggestarea = res2;
                        biggestIndex = 2;
                    }
                    if (res3 > biggestarea) {
                        biggestarea = res3;
                        biggestIndex = 3;
                    }
                    return biggestIndex;
                }
            };
            exports_22("btPersistentManifold", btPersistentManifold);
        }
    };
});
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
System.register("src/BulletDynamics/ConstraintSolver/btConstraintSolver", [], function (exports_23, context_23) {
    "use strict";
    var btConstraintSolverType, btConstraintSolver;
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [],
        execute: function () {/*
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
            (function (btConstraintSolverType) {
                btConstraintSolverType[btConstraintSolverType["BT_SEQUENTIAL_IMPULSE_SOLVER"] = 1] = "BT_SEQUENTIAL_IMPULSE_SOLVER";
                btConstraintSolverType[btConstraintSolverType["BT_MLCP_SOLVER"] = 2] = "BT_MLCP_SOLVER";
                btConstraintSolverType[btConstraintSolverType["BT_NNCG_SOLVER"] = 4] = "BT_NNCG_SOLVER";
                btConstraintSolverType[btConstraintSolverType["BT_MULTIBODY_SOLVER"] = 8] = "BT_MULTIBODY_SOLVER";
                btConstraintSolverType[btConstraintSolverType["BT_BLOCK_SOLVER"] = 16] = "BT_BLOCK_SOLVER";
            })(btConstraintSolverType || (exports_23("btConstraintSolverType", btConstraintSolverType = {})));
            /**
             * btConstraintSolver provides solver interface
             */
            btConstraintSolver = class btConstraintSolver {
                prepareSolve(_numBodies, _numManifolds) {
                    // Default implementation does nothing
                }
                allSolved(_info, _debugDrawer) {
                    // Default implementation does nothing
                }
            };
            exports_23("btConstraintSolver", btConstraintSolver);
        }
    };
});
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
System.register("src/LinearMath/btMotionState", ["src/LinearMath/btTransform"], function (exports_24, context_24) {
    "use strict";
    var btTransform_4, btMotionState, btDefaultMotionState;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [
            function (btTransform_4_1) {
                btTransform_4 = btTransform_4_1;
            }
        ],
        execute: function () {/*
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
             * The btMotionState interface class allows the dynamics world to synchronize and interpolate the updated world transforms with graphics
             * For optimizations, potentially only update graphics object transforms when needed
             */
            btMotionState = class btMotionState {
            };
            exports_24("btMotionState", btMotionState);
            /**
             * Default implementation of btMotionState providing identity transforms
             */
            btDefaultMotionState = class btDefaultMotionState extends btMotionState {
                constructor(startTrans = new btTransform_4.btTransform(), centerOfMassOffset = new btTransform_4.btTransform()) {
                    super();
                    this.m_graphicsWorldTrans = startTrans.clone();
                    this.m_centerOfMassOffset = centerOfMassOffset.clone();
                    this.m_startWorldTrans = startTrans.clone();
                }
                /**
                 * Synchronizes world transform from user to physics
                 */
                getWorldTransform(centerOfMassWorldTrans) {
                    centerOfMassWorldTrans.assign(this.m_centerOfMassOffset.inverse().multiply(this.m_graphicsWorldTrans));
                }
                /**
                 * Synchronizes world transform from physics to user
                 */
                setWorldTransform(centerOfMassWorldTrans) {
                    this.m_graphicsWorldTrans.assign(centerOfMassWorldTrans.multiply(this.m_centerOfMassOffset));
                }
            };
            exports_24("btDefaultMotionState", btDefaultMotionState);
        }
    };
});
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
System.register("src/BulletDynamics/ConstraintSolver/btTypedConstraint", ["src/LinearMath/btVector3"], function (exports_25, context_25) {
    "use strict";
    var btVector3_12, btTypedConstraintType, btConstraintParams, btJointFeedback, btConstraintInfo1, btConstraintInfo2, btTypedConstraint;
    var __moduleName = context_25 && context_25.id;
    return {
        setters: [
            function (btVector3_12_1) {
                btVector3_12 = btVector3_12_1;
            }
        ],
        execute: function () {/*
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
             * Don't change any of the existing enum values, so add enum types at the end for serialization compatibility
             */
            (function (btTypedConstraintType) {
                btTypedConstraintType[btTypedConstraintType["POINT2POINT_CONSTRAINT_TYPE"] = 3] = "POINT2POINT_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["HINGE_CONSTRAINT_TYPE"] = 4] = "HINGE_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["CONETWIST_CONSTRAINT_TYPE"] = 5] = "CONETWIST_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["D6_CONSTRAINT_TYPE"] = 6] = "D6_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["SLIDER_CONSTRAINT_TYPE"] = 7] = "SLIDER_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["CONTACT_CONSTRAINT_TYPE"] = 8] = "CONTACT_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["D6_SPRING_CONSTRAINT_TYPE"] = 9] = "D6_SPRING_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["GEAR_CONSTRAINT_TYPE"] = 10] = "GEAR_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["FIXED_CONSTRAINT_TYPE"] = 11] = "FIXED_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["D6_SPRING_2_CONSTRAINT_TYPE"] = 12] = "D6_SPRING_2_CONSTRAINT_TYPE";
                btTypedConstraintType[btTypedConstraintType["MAX_CONSTRAINT_TYPE"] = 13] = "MAX_CONSTRAINT_TYPE";
            })(btTypedConstraintType || (exports_25("btTypedConstraintType", btTypedConstraintType = {})));
            (function (btConstraintParams) {
                btConstraintParams[btConstraintParams["BT_CONSTRAINT_ERP"] = 1] = "BT_CONSTRAINT_ERP";
                btConstraintParams[btConstraintParams["BT_CONSTRAINT_STOP_ERP"] = 2] = "BT_CONSTRAINT_STOP_ERP";
                btConstraintParams[btConstraintParams["BT_CONSTRAINT_CFM"] = 3] = "BT_CONSTRAINT_CFM";
                btConstraintParams[btConstraintParams["BT_CONSTRAINT_STOP_CFM"] = 4] = "BT_CONSTRAINT_STOP_CFM";
            })(btConstraintParams || (exports_25("btConstraintParams", btConstraintParams = {})));
            /**
             * Joint feedback structure
             */
            btJointFeedback = class btJointFeedback {
                constructor() {
                    this.m_appliedForceBodyA = new btVector3_12.btVector3();
                    this.m_appliedTorqueBodyA = new btVector3_12.btVector3();
                    this.m_appliedForceBodyB = new btVector3_12.btVector3();
                    this.m_appliedTorqueBodyB = new btVector3_12.btVector3();
                }
            };
            exports_25("btJointFeedback", btJointFeedback);
            /**
             * Constraint info structures used by constraint solver
             */
            btConstraintInfo1 = class btConstraintInfo1 {
                constructor() {
                    this.m_numConstraintRows = 0;
                    this.nub = 0;
                }
            };
            exports_25("btConstraintInfo1", btConstraintInfo1);
            btConstraintInfo2 = class btConstraintInfo2 {
                constructor() {
                    this.fps = 0;
                    this.erp = 0;
                    this.m_J1linearAxis = null;
                    this.m_J1angularAxis = null;
                    this.m_J2linearAxis = null;
                    this.m_J2angularAxis = null;
                    this.rowskip = 0;
                    this.m_constraintError = null;
                    this.cfm = null;
                    this.m_lowerLimit = null;
                    this.m_upperLimit = null;
                    this.m_numIterations = 0;
                    this.m_damping = 0;
                }
            };
            exports_25("btConstraintInfo2", btConstraintInfo2);
            /**
             * TypedConstraint is the baseclass for Bullet constraints and vehicles
             * This is a minimal stub implementation for btRigidBody dependency
             */
            btTypedConstraint = class btTypedConstraint {
                constructor(_type, rbA, rbB) {
                    this.m_userConstraintPtr = null;
                    this.m_userConstraintType = -1;
                    this.m_userConstraintId = -1;
                    this.m_breakingImpulseThreshold = 3.402823466e+38; // FLT_MAX
                    this.m_isEnabled = true;
                    this.m_needsFeedback = false;
                    this.m_overrideNumSolverIterations = -1;
                    this.m_appliedImpulse = 0;
                    this.m_dbgDrawSize = 0.3;
                    this.m_jointFeedback = null;
                    this.m_rbA = rbA;
                    this.m_rbB = rbB || rbA; // If no rbB provided, use rbA (single body constraint)
                }
                // Essential methods that btRigidBody needs
                getRigidBodyA() {
                    return this.m_rbA;
                }
                getRigidBodyB() {
                    return this.m_rbB;
                }
                getBreakingImpulseThreshold() {
                    return this.m_breakingImpulseThreshold;
                }
                setBreakingImpulseThreshold(threshold) {
                    this.m_breakingImpulseThreshold = threshold;
                }
                isEnabled() {
                    return this.m_isEnabled;
                }
                setEnabled(enabled) {
                    this.m_isEnabled = enabled;
                }
                getUserConstraintType() {
                    return this.m_userConstraintType;
                }
                setUserConstraintType(userConstraintType) {
                    this.m_userConstraintType = userConstraintType;
                }
                setUserConstraintId(uid) {
                    this.m_userConstraintId = uid;
                }
                getUserConstraintId() {
                    return this.m_userConstraintId;
                }
                getOverrideNumSolverIterations() {
                    return this.m_overrideNumSolverIterations;
                }
                setOverrideNumSolverIterations(overrideNumIterations) {
                    this.m_overrideNumSolverIterations = overrideNumIterations;
                }
                // Internal solver methods
                internalSetAppliedImpulse(appliedImpulse) {
                    this.m_appliedImpulse = appliedImpulse;
                }
                internalGetAppliedImpulse() {
                    return this.m_appliedImpulse;
                }
                getMotorFactor(_pos, _lowLim, _uppLim, _vel, _timeFact) {
                    // Basic implementation - can be overridden by subclasses
                    return 1.0;
                }
            };
            exports_25("btTypedConstraint", btTypedConstraint);
        }
    };
});
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
System.register("src/BulletDynamics/Dynamics/btRigidBody", ["src/LinearMath/btTransform", "src/LinearMath/btVector3", "src/LinearMath/btMatrix3x3", "src/LinearMath/btScalar", "src/LinearMath/btMinMax", "src/BulletCollision/CollisionDispatch/btCollisionObject"], function (exports_26, context_26) {
    "use strict";
    var btTransform_5, btVector3_13, btMatrix3x3_5, btScalar_8, btMinMax_3, btCollisionObject_1, gDeactivationTime, gDisableDeactivation, btRigidBodyFlags, btRigidBodyConstructionInfo, btRigidBody;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (btTransform_5_1) {
                btTransform_5 = btTransform_5_1;
            },
            function (btVector3_13_1) {
                btVector3_13 = btVector3_13_1;
            },
            function (btMatrix3x3_5_1) {
                btMatrix3x3_5 = btMatrix3x3_5_1;
            },
            function (btScalar_8_1) {
                btScalar_8 = btScalar_8_1;
            },
            function (btMinMax_3_1) {
                btMinMax_3 = btMinMax_3_1;
            },
            function (btCollisionObject_1_1) {
                btCollisionObject_1 = btCollisionObject_1_1;
            }
        ],
        execute: function () {/*
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
            // Global variables
            exports_26("gDeactivationTime", gDeactivationTime = 2.0);
            exports_26("gDisableDeactivation", gDisableDeactivation = false);
            /**
             * Rigid body flags for controlling behavior
             */
            (function (btRigidBodyFlags) {
                btRigidBodyFlags[btRigidBodyFlags["BT_DISABLE_WORLD_GRAVITY"] = 1] = "BT_DISABLE_WORLD_GRAVITY";
                /** BT_ENABLE_GYROPSCOPIC_FORCE flags is enabled by default in Bullet 2.83 and onwards.
                 * and it BT_ENABLE_GYROPSCOPIC_FORCE becomes equivalent to BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY
                 * See Demos/GyroscopicDemo and computeGyroscopicImpulseImplicit */
                btRigidBodyFlags[btRigidBodyFlags["BT_ENABLE_GYROSCOPIC_FORCE_EXPLICIT"] = 2] = "BT_ENABLE_GYROSCOPIC_FORCE_EXPLICIT";
                btRigidBodyFlags[btRigidBodyFlags["BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_WORLD"] = 4] = "BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_WORLD";
                btRigidBodyFlags[btRigidBodyFlags["BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY"] = 8] = "BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY";
                btRigidBodyFlags[btRigidBodyFlags["BT_ENABLE_GYROPSCOPIC_FORCE"] = 8] = "BT_ENABLE_GYROPSCOPIC_FORCE";
            })(btRigidBodyFlags || (exports_26("btRigidBodyFlags", btRigidBodyFlags = {})));
            /**
             * The btRigidBodyConstructionInfo structure provides information to create a rigid body.
             * Setting mass to zero creates a fixed (non-dynamic) rigid body.
             * For dynamic objects, you can use the collision shape to approximate the local inertia tensor,
             * otherwise use the zero vector (default argument)
             * You can use the motion state to synchronize the world transform between physics and graphics objects.
             * And if the motion state is provided, the rigid body will initialize its initial world transform from the motion state,
             * m_startWorldTransform is only used when you don't provide a motion state.
             */
            btRigidBodyConstructionInfo = class btRigidBodyConstructionInfo {
                constructor(mass, motionState, collisionShape, localInertia = new btVector3_13.btVector3(0, 0, 0)) {
                    this.m_mass = mass;
                    this.m_motionState = motionState;
                    this.m_collisionShape = collisionShape;
                    this.m_localInertia = localInertia;
                    this.m_linearDamping = 0.0;
                    this.m_angularDamping = 0.0;
                    this.m_friction = 0.5;
                    this.m_rollingFriction = 0.0;
                    this.m_spinningFriction = 0.0;
                    this.m_restitution = 0.0;
                    this.m_linearSleepingThreshold = 0.8;
                    this.m_angularSleepingThreshold = 1.0;
                    this.m_additionalDamping = false;
                    this.m_additionalDampingFactor = 0.005;
                    this.m_additionalLinearDampingThresholdSqr = 0.01;
                    this.m_additionalAngularDampingThresholdSqr = 0.01;
                    this.m_additionalAngularDampingFactor = 0.01;
                    this.m_startWorldTransform = new btTransform_5.btTransform();
                    this.m_startWorldTransform.setIdentity();
                }
            };
            exports_26("btRigidBodyConstructionInfo", btRigidBodyConstructionInfo);
            /**
             * The btRigidBody is the main class for rigid body objects. It is derived from btCollisionObject,
             * so it keeps a pointer to a btCollisionShape.
             * It is recommended for performance and memory use to share btCollisionShape objects whenever possible.
             * There are 3 types of rigid bodies:
             * - A) Dynamic rigid bodies, with positive mass. Motion is controlled by rigid body dynamics.
             * - B) Fixed objects with zero mass. They are not moving (basically collision objects)
             * - C) Kinematic objects, which are objects without mass, but the user can move them.
             *   There is one-way interaction, and Bullet calculates a velocity based on the timestep and previous and current world transform.
             * Bullet automatically deactivates dynamic rigid bodies, when the velocity is below a threshold for a given time.
             * Deactivated (sleeping) rigid bodies don't take any processing time, except a minor broadphase collision detection impact
             * (to allow active objects to activate/wake up sleeping objects)
             */
            btRigidBody = class btRigidBody extends btCollisionObject_1.btCollisionObject {
                constructor(constructionInfoOrMass, motionState, collisionShape, localInertia = new btVector3_13.btVector3(0, 0, 0)) {
                    super();
                    let constructionInfo;
                    if (typeof constructionInfoOrMass === 'number') {
                        constructionInfo = new btRigidBodyConstructionInfo(constructionInfoOrMass, motionState || null, collisionShape || null, localInertia);
                    }
                    else {
                        constructionInfo = constructionInfoOrMass;
                    }
                    // Initialize all member variables
                    this.m_invInertiaTensorWorld = new btMatrix3x3_5.btMatrix3x3();
                    this.m_linearVelocity = new btVector3_13.btVector3();
                    this.m_angularVelocity = new btVector3_13.btVector3();
                    this.m_inverseMass = 0;
                    this.m_linearFactor = new btVector3_13.btVector3();
                    this.m_gravity = new btVector3_13.btVector3();
                    this.m_gravity_acceleration = new btVector3_13.btVector3();
                    this.m_invInertiaLocal = new btVector3_13.btVector3();
                    this.m_totalForce = new btVector3_13.btVector3();
                    this.m_totalTorque = new btVector3_13.btVector3();
                    this.m_linearDamping = 0;
                    this.m_angularDamping = 0;
                    this.m_additionalDamping = false;
                    this.m_additionalDampingFactor = 0;
                    this.m_additionalLinearDampingThresholdSqr = 0;
                    this.m_additionalAngularDampingThresholdSqr = 0;
                    this.m_linearSleepingThreshold = 0;
                    this.m_angularSleepingThreshold = 0;
                    this.m_optionalMotionState = null;
                    this.m_constraintRefs = [];
                    this.m_rigidbodyFlags = 0;
                    this.m_deltaLinearVelocity = new btVector3_13.btVector3();
                    this.m_deltaAngularVelocity = new btVector3_13.btVector3();
                    this.m_angularFactor = new btVector3_13.btVector3();
                    this.m_invMass = new btVector3_13.btVector3();
                    this.m_pushVelocity = new btVector3_13.btVector3();
                    this.m_turnVelocity = new btVector3_13.btVector3();
                    this.m_contactSolverType = 0;
                    this.m_frictionSolverType = 0;
                    this.setupRigidBody(constructionInfo);
                }
                /** setupRigidBody is only used internally by the constructor */
                setupRigidBody(constructionInfo) {
                    this.m_internalType = btRigidBody.CO_RIGID_BODY;
                    this.m_linearVelocity.setValue(0.0, 0.0, 0.0);
                    this.m_angularVelocity.setValue(0.0, 0.0, 0.0);
                    this.m_angularFactor.setValue(1, 1, 1);
                    this.m_linearFactor.setValue(1, 1, 1);
                    this.m_gravity.setValue(0.0, 0.0, 0.0);
                    this.m_gravity_acceleration.setValue(0.0, 0.0, 0.0);
                    this.m_totalForce.setValue(0.0, 0.0, 0.0);
                    this.m_totalTorque.setValue(0.0, 0.0, 0.0);
                    this.setDamping(constructionInfo.m_linearDamping, constructionInfo.m_angularDamping);
                    this.m_linearSleepingThreshold = constructionInfo.m_linearSleepingThreshold;
                    this.m_angularSleepingThreshold = constructionInfo.m_angularSleepingThreshold;
                    this.m_optionalMotionState = constructionInfo.m_motionState;
                    this.m_contactSolverType = 0;
                    this.m_frictionSolverType = 0;
                    this.m_additionalDamping = constructionInfo.m_additionalDamping;
                    this.m_additionalDampingFactor = constructionInfo.m_additionalDampingFactor;
                    this.m_additionalLinearDampingThresholdSqr = constructionInfo.m_additionalLinearDampingThresholdSqr;
                    this.m_additionalAngularDampingThresholdSqr = constructionInfo.m_additionalAngularDampingThresholdSqr;
                    if (this.m_optionalMotionState) {
                        this.m_optionalMotionState.getWorldTransform(this.m_worldTransform);
                    }
                    else {
                        // Copy transform data manually since btTransform doesn't have copy method
                        this.m_worldTransform.setOrigin(constructionInfo.m_startWorldTransform.getOrigin());
                        this.m_worldTransform.setRotation(constructionInfo.m_startWorldTransform.getRotation());
                    }
                    // Copy transform data manually
                    this.m_interpolationWorldTransform.setOrigin(this.m_worldTransform.getOrigin());
                    this.m_interpolationWorldTransform.setRotation(this.m_worldTransform.getRotation());
                    this.m_interpolationLinearVelocity.setValue(0, 0, 0);
                    this.m_interpolationAngularVelocity.setValue(0, 0, 0);
                    // moved to btCollisionObject
                    this.m_friction = constructionInfo.m_friction;
                    this.m_rollingFriction = constructionInfo.m_rollingFriction;
                    this.m_spinningFriction = constructionInfo.m_spinningFriction;
                    this.m_restitution = constructionInfo.m_restitution;
                    if (constructionInfo.m_collisionShape) {
                        this.setCollisionShape(constructionInfo.m_collisionShape);
                    }
                    this.setMassProps(constructionInfo.m_mass, constructionInfo.m_localInertia);
                    this.updateInertiaTensor();
                    this.m_rigidbodyFlags = btRigidBodyFlags.BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY;
                    this.m_deltaLinearVelocity.setZero();
                    this.m_deltaAngularVelocity.setZero();
                    this.m_invMass.copy(this.m_linearFactor.multiply(this.m_inverseMass));
                    this.m_pushVelocity.setZero();
                    this.m_turnVelocity.setZero();
                }
                /** to keep collision detection and dynamics separate we don't store a rigidbody pointer
                 * but a rigidbody is derived from btCollisionObject, so we can safely perform an upcast */
                static upcast(colObj) {
                    if (colObj && (colObj.getInternalType() & btRigidBody.CO_RIGID_BODY)) {
                        return colObj;
                    }
                    return null;
                }
                /** continuous collision detection needs prediction */
                predictIntegratedTransform(step, predictedTransform) {
                    // btTransformUtil.integrateTransform(this.m_worldTransform, this.m_linearVelocity, this.m_angularVelocity, step, predictedTransform);
                    // Simple integration for now
                    const newOrigin = this.m_worldTransform.getOrigin().add(this.m_linearVelocity.multiply(step));
                    predictedTransform.setOrigin(newOrigin);
                    predictedTransform.setRotation(this.m_worldTransform.getRotation());
                }
                saveKinematicState(step) {
                    // todo: clamp to some (user definable) safe minimum timestep, to limit maximum angular/linear velocities
                    if (step !== 0.0) {
                        // if we use motionstate to synchronize world transforms, get the new kinematic/animated world transform
                        if (this.getMotionState()) {
                            this.getMotionState().getWorldTransform(this.m_worldTransform);
                        }
                        // btTransformUtil.calculateVelocity(this.m_interpolationWorldTransform, this.m_worldTransform, step, this.m_linearVelocity, this.m_angularVelocity);
                        // Simple velocity calculation for now
                        if (step > 0) {
                            this.m_linearVelocity = this.m_worldTransform.getOrigin().subtract(this.m_interpolationWorldTransform.getOrigin()).divide(step);
                            this.m_angularVelocity.setValue(0, 0, 0); // Simplified for now
                        }
                        this.m_interpolationLinearVelocity.copy(this.m_linearVelocity);
                        this.m_interpolationAngularVelocity.copy(this.m_angularVelocity);
                        this.m_interpolationWorldTransform.setOrigin(this.m_worldTransform.getOrigin());
                        this.m_interpolationWorldTransform.setRotation(this.m_worldTransform.getRotation());
                    }
                }
                applyGravity() {
                    if (this.isStaticOrKinematicObject()) {
                        return;
                    }
                    this.applyCentralForce(this.m_gravity);
                }
                clearGravity() {
                    if (this.isStaticOrKinematicObject()) {
                        return;
                    }
                    this.applyCentralForce(this.m_gravity.negate());
                }
                setGravity(acceleration) {
                    if (this.m_inverseMass !== 0.0) {
                        this.m_gravity.copy(acceleration.multiply(1.0 / this.m_inverseMass));
                    }
                    this.m_gravity_acceleration.copy(acceleration);
                }
                getGravity() {
                    return this.m_gravity_acceleration;
                }
                setDamping(lin_damping, ang_damping) {
                    this.m_linearDamping = btMinMax_3.btClamped(lin_damping, 0.0, 1.0);
                    this.m_angularDamping = btMinMax_3.btClamped(ang_damping, 0.0, 1.0);
                }
                getLinearDamping() {
                    return this.m_linearDamping;
                }
                getAngularDamping() {
                    return this.m_angularDamping;
                }
                getLinearSleepingThreshold() {
                    return this.m_linearSleepingThreshold;
                }
                getAngularSleepingThreshold() {
                    return this.m_angularSleepingThreshold;
                }
                /** applyDamping damps the velocity, using the given m_linearDamping and m_angularDamping */
                applyDamping(timeStep) {
                    this.m_linearVelocity.multiplyAssign(btScalar_8.btPow(1 - this.m_linearDamping, timeStep));
                    this.m_angularVelocity.multiplyAssign(btScalar_8.btPow(1 - this.m_angularDamping, timeStep));
                    if (this.m_additionalDamping) {
                        // Additional damping can help avoiding lowpass jitter motion, help stability for ragdolls etc.
                        if ((this.m_angularVelocity.length2() < this.m_additionalAngularDampingThresholdSqr) &&
                            (this.m_linearVelocity.length2() < this.m_additionalLinearDampingThresholdSqr)) {
                            this.m_angularVelocity.multiplyAssign(this.m_additionalDampingFactor);
                            this.m_linearVelocity.multiplyAssign(this.m_additionalDampingFactor);
                        }
                        const speed = this.m_linearVelocity.length();
                        if (speed < this.m_linearDamping) {
                            const dampVel = 0.005;
                            if (speed > dampVel) {
                                const dir = this.m_linearVelocity.normalized();
                                this.m_linearVelocity.subtractAssign(dir.multiply(dampVel));
                            }
                            else {
                                this.m_linearVelocity.setValue(0.0, 0.0, 0.0);
                            }
                        }
                        const angSpeed = this.m_angularVelocity.length();
                        if (angSpeed < this.m_angularDamping) {
                            const angDampVel = 0.005;
                            if (angSpeed > angDampVel) {
                                const dir = this.m_angularVelocity.normalized();
                                this.m_angularVelocity.subtractAssign(dir.multiply(angDampVel));
                            }
                            else {
                                this.m_angularVelocity.setValue(0.0, 0.0, 0.0);
                            }
                        }
                    }
                }
                getCollisionShape() {
                    return this.m_collisionShape;
                }
                setMassProps(mass, inertia) {
                    if (mass === 0.0) {
                        this.m_collisionFlags |= btRigidBody.CF_STATIC_OBJECT;
                        this.m_inverseMass = 0.0;
                    }
                    else {
                        this.m_collisionFlags &= (~btRigidBody.CF_STATIC_OBJECT);
                        this.m_inverseMass = 1.0 / mass;
                    }
                    // Fg = m * a
                    this.m_gravity.copy(this.m_gravity_acceleration.multiply(mass));
                    this.m_invInertiaLocal.setValue(inertia.x() !== 0.0 ? 1.0 / inertia.x() : 0.0, inertia.y() !== 0.0 ? 1.0 / inertia.y() : 0.0, inertia.z() !== 0.0 ? 1.0 / inertia.z() : 0.0);
                    this.m_invMass.copy(this.m_linearFactor.multiply(this.m_inverseMass));
                }
                getLinearFactor() {
                    return this.m_linearFactor;
                }
                setLinearFactor(linearFactor) {
                    this.m_linearFactor.copy(linearFactor);
                    this.m_invMass.copy(this.m_linearFactor.multiply(this.m_inverseMass));
                }
                getInvMass() {
                    return this.m_inverseMass;
                }
                getMass() {
                    return this.m_inverseMass === 0.0 ? 0.0 : 1.0 / this.m_inverseMass;
                }
                getInvInertiaTensorWorld() {
                    return this.m_invInertiaTensorWorld;
                }
                integrateVelocities(step) {
                    if (this.isStaticOrKinematicObject()) {
                        return;
                    }
                    this.m_linearVelocity.addAssign(this.m_totalForce.multiply(this.m_inverseMass * step));
                    this.m_angularVelocity.addAssign(btMatrix3x3_5.multiplyMatrixVector(this.m_invInertiaTensorWorld, this.m_totalTorque).multiply(step));
                    const MAX_ANGVEL = btScalar_8.SIMD_HALF_PI;
                    // clamp angular velocity. collision calculations will fail on higher angular velocities
                    const angvel = this.m_angularVelocity.length();
                    if (angvel * step > MAX_ANGVEL) {
                        this.m_angularVelocity.multiplyAssign((MAX_ANGVEL / step) / angvel);
                    }
                }
                setCenterOfMassTransform(xform) {
                    if (this.isKinematicObject()) {
                        this.m_interpolationWorldTransform.setOrigin(this.m_worldTransform.getOrigin());
                        this.m_interpolationWorldTransform.setRotation(this.m_worldTransform.getRotation());
                    }
                    else {
                        this.m_interpolationWorldTransform.setOrigin(xform.getOrigin());
                        this.m_interpolationWorldTransform.setRotation(xform.getRotation());
                    }
                    this.m_interpolationLinearVelocity.copy(this.getLinearVelocity());
                    this.m_interpolationAngularVelocity.copy(this.getAngularVelocity());
                    this.m_worldTransform.setOrigin(xform.getOrigin());
                    this.m_worldTransform.setRotation(xform.getRotation());
                    this.updateInertiaTensor();
                }
                applyCentralForce(force) {
                    this.m_totalForce.addAssign(force.multiplyVector(this.m_linearFactor));
                }
                getTotalForce() {
                    return this.m_totalForce;
                }
                getTotalTorque() {
                    return this.m_totalTorque;
                }
                getInvInertiaDiagLocal() {
                    return this.m_invInertiaLocal;
                }
                setInvInertiaDiagLocal(diagInvInertia) {
                    this.m_invInertiaLocal.copy(diagInvInertia);
                }
                setSleepingThresholds(linear, angular) {
                    this.m_linearSleepingThreshold = linear;
                    this.m_angularSleepingThreshold = angular;
                }
                applyTorque(torque) {
                    this.m_totalTorque.addAssign(torque.multiplyVector(this.m_angularFactor));
                }
                applyForce(force, rel_pos) {
                    this.applyCentralForce(force);
                    this.applyTorque(rel_pos.cross(force.multiplyVector(this.m_linearFactor)));
                }
                applyCentralImpulse(impulse) {
                    this.m_linearVelocity.addAssign(impulse.multiplyVector(this.m_linearFactor).multiply(this.m_inverseMass));
                }
                applyTorqueImpulse(torque) {
                    this.m_angularVelocity.addAssign(btMatrix3x3_5.multiplyMatrixVector(this.m_invInertiaTensorWorld, torque.multiplyVector(this.m_angularFactor)));
                }
                applyImpulse(impulse, rel_pos) {
                    if (this.m_inverseMass !== 0.0) {
                        this.applyCentralImpulse(impulse);
                        if (this.m_angularFactor.length2() > 0) {
                            this.applyTorqueImpulse(rel_pos.cross(impulse.multiplyVector(this.m_linearFactor)));
                        }
                    }
                }
                applyPushImpulse(impulse, rel_pos) {
                    if (this.m_inverseMass !== 0.0) {
                        this.applyCentralPushImpulse(impulse);
                        if (this.m_angularFactor.length2() > 0) {
                            this.applyTorqueTurnImpulse(rel_pos.cross(impulse.multiplyVector(this.m_linearFactor)));
                        }
                    }
                }
                getPushVelocity() {
                    return this.m_pushVelocity;
                }
                getTurnVelocity() {
                    return this.m_turnVelocity;
                }
                setPushVelocity(v) {
                    this.m_pushVelocity.copy(v);
                }
                setTurnVelocity(v) {
                    this.m_turnVelocity.copy(v);
                }
                applyCentralPushImpulse(impulse) {
                    this.m_pushVelocity.addAssign(impulse.multiplyVector(this.m_linearFactor).multiply(this.m_inverseMass));
                }
                applyTorqueTurnImpulse(torque) {
                    this.m_turnVelocity.addAssign(btMatrix3x3_5.multiplyMatrixVector(this.m_invInertiaTensorWorld, torque.multiplyVector(this.m_angularFactor)));
                }
                clearForces() {
                    this.m_totalForce.setValue(0.0, 0.0, 0.0);
                    this.m_totalTorque.setValue(0.0, 0.0, 0.0);
                }
                updateInertiaTensor() {
                    // Simplified implementation - the full version requires matrix multiplication
                    this.m_invInertiaTensorWorld.setIdentity();
                    // This is a simplified version - in the full implementation this would be:
                    // this.m_invInertiaTensorWorld = worldBasis.scaled(this.m_invInertiaLocal) * worldBasis.transpose();
                    // For now, we just scale the identity matrix
                    this.m_invInertiaTensorWorld.setValue(this.m_invInertiaLocal.x(), 0, 0, 0, this.m_invInertiaLocal.y(), 0, 0, 0, this.m_invInertiaLocal.z());
                }
                getCenterOfMassPosition() {
                    return this.m_worldTransform.getOrigin();
                }
                getOrientation() {
                    return this.m_worldTransform.getRotation();
                }
                getCenterOfMassTransform() {
                    return this.m_worldTransform;
                }
                getLinearVelocity() {
                    return this.m_linearVelocity;
                }
                getAngularVelocity() {
                    return this.m_angularVelocity;
                }
                setLinearVelocity(lin_vel) {
                    this.m_updateRevision++;
                    this.m_linearVelocity.copy(lin_vel);
                }
                setAngularVelocity(ang_vel) {
                    this.m_updateRevision++;
                    this.m_angularVelocity.copy(ang_vel);
                }
                getVelocityInLocalPoint(rel_pos) {
                    // we also calculate lin/ang velocity for kinematic objects
                    return this.m_linearVelocity.add(this.m_angularVelocity.cross(rel_pos));
                }
                getPushVelocityInLocalPoint(rel_pos) {
                    // we also calculate lin/ang velocity for kinematic objects
                    return this.m_pushVelocity.add(this.m_turnVelocity.cross(rel_pos));
                }
                translate(v) {
                    this.m_worldTransform.getOrigin().addAssign(v);
                }
                getAabb(aabbMin, aabbMax) {
                    var _a;
                    (_a = this.getCollisionShape()) === null || _a === void 0 ? void 0 : _a.getAabb(this.m_worldTransform, aabbMin, aabbMax);
                }
                computeImpulseDenominator(pos, normal) {
                    const r0 = pos.subtract(this.getCenterOfMassPosition());
                    const c0 = r0.cross(normal);
                    const vec = btMatrix3x3_5.multiplyMatrixVector(this.getInvInertiaTensorWorld(), c0).cross(r0);
                    return this.m_inverseMass + normal.dot(vec);
                }
                computeAngularImpulseDenominator(axis) {
                    const vec = btMatrix3x3_5.multiplyMatrixVector(this.getInvInertiaTensorWorld(), axis);
                    return axis.dot(vec);
                }
                updateDeactivation(timeStep) {
                    if ((this.getActivationState() === btCollisionObject_1.ISLAND_SLEEPING) || (this.getActivationState() === btCollisionObject_1.DISABLE_DEACTIVATION)) {
                        return;
                    }
                    if ((this.getLinearVelocity().length2() < this.m_linearSleepingThreshold * this.m_linearSleepingThreshold) &&
                        (this.getAngularVelocity().length2() < this.m_angularSleepingThreshold * this.m_angularSleepingThreshold)) {
                        this.m_deactivationTime += timeStep;
                    }
                    else {
                        this.m_deactivationTime = 0.0;
                        this.setActivationState(0);
                    }
                }
                wantsSleeping() {
                    if (this.getActivationState() === btCollisionObject_1.DISABLE_DEACTIVATION) {
                        return false;
                    }
                    // disable deactivation
                    if (gDisableDeactivation || (gDeactivationTime === 0.0)) {
                        return false;
                    }
                    if ((this.getActivationState() === btCollisionObject_1.ISLAND_SLEEPING) || (this.getActivationState() === btCollisionObject_1.WANTS_DEACTIVATION)) {
                        return true;
                    }
                    if (this.m_deactivationTime > gDeactivationTime) {
                        return true;
                    }
                    return false;
                }
                getBroadphaseProxy() {
                    return this.m_broadphaseHandle;
                }
                setNewBroadphaseProxy(broadphaseProxy) {
                    this.m_broadphaseHandle = broadphaseProxy;
                }
                // btMotionState allows to automatic synchronize the world transform for active objects
                getMotionState() {
                    return this.m_optionalMotionState;
                }
                setMotionState(motionState) {
                    this.m_optionalMotionState = motionState;
                    if (this.m_optionalMotionState) {
                        motionState.getWorldTransform(this.m_worldTransform);
                    }
                }
                setAngularFactor(angFac) {
                    this.m_updateRevision++;
                    if (typeof angFac === 'number') {
                        this.m_angularFactor.setValue(angFac, angFac, angFac);
                    }
                    else {
                        this.m_angularFactor.copy(angFac);
                    }
                }
                getAngularFactor() {
                    return this.m_angularFactor;
                }
                // is this rigidbody added to a btCollisionWorld/btDynamicsWorld/btBroadphase?
                isInWorld() {
                    return this.getBroadphaseProxy() !== null;
                }
                addConstraintRef(c) {
                    // disable collision with the 'other' body
                    const index = this.m_constraintRefs.findIndex(ref => ref === c);
                    // don't add constraints that are already referenced
                    if (index === -1) {
                        this.m_constraintRefs.push(c);
                        const colObjA = c.getRigidBodyA();
                        const colObjB = c.getRigidBodyB();
                        if (colObjA === this) {
                            colObjA.setIgnoreCollisionCheck(colObjB, true);
                        }
                        else {
                            colObjB.setIgnoreCollisionCheck(colObjA, true);
                        }
                    }
                }
                removeConstraintRef(c) {
                    const index = this.m_constraintRefs.findIndex(ref => ref === c);
                    // don't remove constraints that are not referenced
                    if (index !== -1) {
                        this.m_constraintRefs.splice(index, 1);
                        const colObjA = c.getRigidBodyA();
                        const colObjB = c.getRigidBodyB();
                        if (colObjA === this) {
                            colObjA.setIgnoreCollisionCheck(colObjB, false);
                        }
                        else {
                            colObjB.setIgnoreCollisionCheck(colObjA, false);
                        }
                    }
                }
                getConstraintRef(index) {
                    return this.m_constraintRefs[index];
                }
                getNumConstraintRefs() {
                    return this.m_constraintRefs.length;
                }
                setFlags(flags) {
                    this.m_rigidbodyFlags = flags;
                }
                getFlags() {
                    return this.m_rigidbodyFlags;
                }
                getLocalInertia() {
                    const inertiaLocal = new btVector3_13.btVector3();
                    const inertia = this.m_invInertiaLocal;
                    inertiaLocal.setValue(inertia.x() !== 0.0 ? 1.0 / inertia.x() : 0.0, inertia.y() !== 0.0 ? 1.0 / inertia.y() : 0.0, inertia.z() !== 0.0 ? 1.0 / inertia.z() : 0.0);
                    return inertiaLocal;
                }
                proceedToTransform(newTrans) {
                    this.setCenterOfMassTransform(newTrans);
                }
                /** perform implicit force computation in world space */
                computeGyroscopicImpulseImplicit_World(_dt) {
                    // Simplified implementation - returns zero vector for now
                    // Full implementation would require complex matrix operations
                    return new btVector3_13.btVector3(0, 0, 0);
                }
                /** perform implicit force computation in body space (inertial frame) */
                computeGyroscopicImpulseImplicit_Body(_step) {
                    // Simplified implementation - returns zero vector for now
                    // Full implementation would require complex matrix operations
                    return new btVector3_13.btVector3(0, 0, 0);
                }
                /** explicit version is best avoided, it gains energy */
                computeGyroscopicForceExplicit(maxGyroscopicForce) {
                    // Simplified implementation - the full version requires proper matrix multiplication
                    const gf = new btVector3_13.btVector3(0, 0, 0); // Simplified - would be cross product of angular velocity and inertia tensor
                    const l2 = gf.length2();
                    if (l2 > maxGyroscopicForce * maxGyroscopicForce) {
                        gf.multiplyAssign(1.0 / btScalar_8.btSqrt(l2) * maxGyroscopicForce);
                    }
                    return gf;
                }
            };
            exports_26("btRigidBody", btRigidBody);
            // Static constants
            btRigidBody.CF_STATIC_OBJECT = btCollisionObject_1.btCollisionObject.CollisionFlags.CF_STATIC_OBJECT;
            btRigidBody.CO_RIGID_BODY = btCollisionObject_1.btCollisionObject.CollisionObjectTypes.CO_RIGID_BODY;
        }
    };
});
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
System.register("src/BulletDynamics/Dynamics/btActionInterface", ["src/BulletDynamics/Dynamics/btRigidBody", "src/LinearMath/btVector3", "src/LinearMath/btTransform"], function (exports_27, context_27) {
    "use strict";
    var btRigidBody_1, btVector3_14, btTransform_6, btActionInterface;
    var __moduleName = context_27 && context_27.id;
    return {
        setters: [
            function (btRigidBody_1_1) {
                btRigidBody_1 = btRigidBody_1_1;
            },
            function (btVector3_14_1) {
                btVector3_14 = btVector3_14_1;
            },
            function (btTransform_6_1) {
                btTransform_6 = btTransform_6_1;
            }
        ],
        execute: function () {/*
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
             * Basic interface to allow actions such as vehicles and characters to be updated inside a btDynamicsWorld
             */
            btActionInterface = class btActionInterface {
                static getFixedBody() {
                    // Create a static fixed body if it doesn't exist
                    if (!btActionInterface.s_fixedBody) {
                        // Create a minimal static rigid body for constraints
                        const groundShape = null; // Placeholder - would be an actual collision shape
                        const rbInfo = new btRigidBody_1.btRigidBodyConstructionInfo(0, null, groundShape, new btVector3_14.btVector3(0, 0, 0));
                        rbInfo.m_startWorldTransform = new btTransform_6.btTransform();
                        rbInfo.m_startWorldTransform.setIdentity();
                        btActionInterface.s_fixedBody = new btRigidBody_1.btRigidBody(rbInfo);
                    }
                    return btActionInterface.s_fixedBody;
                }
            };
            exports_27("btActionInterface", btActionInterface);
            btActionInterface.s_fixedBody = null;
        }
    };
});
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
System.register("src/BulletDynamics/Dynamics/btDynamicsWorld", ["src/BulletCollision/CollisionDispatch/btCollisionWorld", "src/BulletDynamics/ConstraintSolver/btContactSolverInfo"], function (exports_28, context_28) {
    "use strict";
    var btCollisionWorld_1, btContactSolverInfo_1, btDynamicsWorldType, btDynamicsWorld;
    var __moduleName = context_28 && context_28.id;
    return {
        setters: [
            function (btCollisionWorld_1_1) {
                btCollisionWorld_1 = btCollisionWorld_1_1;
            },
            function (btContactSolverInfo_1_1) {
                btContactSolverInfo_1 = btContactSolverInfo_1_1;
            }
        ],
        execute: function () {/*
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
            (function (btDynamicsWorldType) {
                btDynamicsWorldType[btDynamicsWorldType["BT_SIMPLE_DYNAMICS_WORLD"] = 1] = "BT_SIMPLE_DYNAMICS_WORLD";
                btDynamicsWorldType[btDynamicsWorldType["BT_DISCRETE_DYNAMICS_WORLD"] = 2] = "BT_DISCRETE_DYNAMICS_WORLD";
                btDynamicsWorldType[btDynamicsWorldType["BT_CONTINUOUS_DYNAMICS_WORLD"] = 3] = "BT_CONTINUOUS_DYNAMICS_WORLD";
                btDynamicsWorldType[btDynamicsWorldType["BT_SOFT_RIGID_DYNAMICS_WORLD"] = 4] = "BT_SOFT_RIGID_DYNAMICS_WORLD";
                btDynamicsWorldType[btDynamicsWorldType["BT_GPU_DYNAMICS_WORLD"] = 5] = "BT_GPU_DYNAMICS_WORLD";
                btDynamicsWorldType[btDynamicsWorldType["BT_SOFT_MULTIBODY_DYNAMICS_WORLD"] = 6] = "BT_SOFT_MULTIBODY_DYNAMICS_WORLD";
                btDynamicsWorldType[btDynamicsWorldType["BT_DEFORMABLE_MULTIBODY_DYNAMICS_WORLD"] = 7] = "BT_DEFORMABLE_MULTIBODY_DYNAMICS_WORLD";
            })(btDynamicsWorldType || (exports_28("btDynamicsWorldType", btDynamicsWorldType = {})));
            /**
             * The btDynamicsWorld is the interface class for several dynamics implementation,
             * basic, discrete, parallel, and continuous etc.
             */
            btDynamicsWorld = class btDynamicsWorld extends btCollisionWorld_1.btCollisionWorld {
                constructor(dispatcher, broadphase, collisionConfiguration) {
                    super(dispatcher, broadphase, collisionConfiguration);
                    this.m_internalTickCallback = null;
                    this.m_internalPreTickCallback = null;
                    this.m_worldUserInfo = null;
                    this.m_solverInfo = new btContactSolverInfo_1.btContactSolverInfo();
                }
                addConstraint(_constraint, _disableCollisionsBetweenLinkedBodies = false) {
                    // Default implementation does nothing
                }
                removeConstraint(_constraint) {
                    // Default implementation does nothing
                }
                getNumConstraints() {
                    return 0;
                }
                getConstraint(_index) {
                    return null;
                }
                getConstraintConst(_index) {
                    return null;
                }
                clearForces() {
                    // Default implementation does nothing
                }
                // Internal tick callback
                setInternalTickCallback(cb, worldUserInfo = null, isPreTick = false) {
                    if (isPreTick) {
                        this.m_internalPreTickCallback = cb;
                    }
                    else {
                        this.m_internalTickCallback = cb;
                    }
                    this.m_worldUserInfo = worldUserInfo;
                }
                getInternalTickCallback() {
                    return this.m_internalTickCallback;
                }
                getInternalPreTickCallback() {
                    return this.m_internalPreTickCallback;
                }
                getWorldUserInfo() {
                    return this.m_worldUserInfo;
                }
                setWorldUserInfo(worldUserInfo) {
                    this.m_worldUserInfo = worldUserInfo;
                }
                getSolverInfo() {
                    return this.m_solverInfo;
                }
                // Solver info methods
                setNumTasks(_numTasks) {
                    // Default implementation - subclasses can override
                }
            };
            exports_28("btDynamicsWorld", btDynamicsWorld);
        }
    };
});
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
System.register("src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld", ["src/BulletDynamics/Dynamics/btDynamicsWorld", "src/LinearMath/btVector3"], function (exports_29, context_29) {
    "use strict";
    var btDynamicsWorld_1, btVector3_15, btDiscreteDynamicsWorld;
    var __moduleName = context_29 && context_29.id;
    // Helper function to check if number is approximately zero
    function btFuzzyZero(x) {
        return Math.abs(x) < Number.EPSILON;
    }
    return {
        setters: [
            function (btDynamicsWorld_1_1) {
                btDynamicsWorld_1 = btDynamicsWorld_1_1;
            },
            function (btVector3_15_1) {
                btVector3_15 = btVector3_15_1;
            }
        ],
        execute: function () {/*
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
             * btDiscreteDynamicsWorld provides discrete rigid body simulation
             * those classes replace the obsolete CcdPhysicsEnvironment/CcdPhysicsController
             */
            btDiscreteDynamicsWorld = class btDiscreteDynamicsWorld extends btDynamicsWorld_1.btDynamicsWorld {
                constructor(dispatcher, pairCache, constraintSolver, collisionConfiguration) {
                    super(dispatcher, pairCache, collisionConfiguration);
                    this.m_sortedConstraints = [];
                    // protected m_islandManager: btSimulationIslandManager; // Temporarily disabled
                    this.m_constraints = [];
                    this.m_nonStaticRigidBodies = [];
                    this.m_gravity = new btVector3_15.btVector3(0, -10, 0);
                    // For variable timesteps
                    this.m_localTime = 0;
                    this.m_fixedTimeStep = 0;
                    this.m_ownsIslandManager = true;
                    this.m_ownsConstraintSolver = true;
                    this.m_synchronizeAllMotionStates = false;
                    this.m_applySpeculativeContactRestitution = false;
                    this.m_actions = [];
                    this.m_profileTimings = 0;
                    this.m_latencyMotionStateInterpolation = true;
                    if (!constraintSolver) {
                        // Create default constraint solver if none provided
                        this.m_constraintSolver = {
                            solveGroup: () => 0,
                            reset: () => { },
                            getSolverType: () => 1,
                            prepareSolve: () => { },
                            allSolved: () => { }
                        };
                        this.m_ownsConstraintSolver = true;
                    }
                    else {
                        this.m_constraintSolver = constraintSolver;
                        this.m_ownsConstraintSolver = false;
                    }
                    // this.m_islandManager = new btSimulationIslandManager(); // Temporarily disabled
                }
                /**
                 * Main physics simulation step
                 * If maxSubSteps > 0, it will interpolate motion between fixedTimeStep's
                 */
                stepSimulation(timeStep, maxSubSteps = 1, fixedTimeStep = 1.0 / 60.0) {
                    this.startProfiling(timeStep);
                    let numSimulationSubSteps = 0;
                    if (maxSubSteps) {
                        // Fixed timestep with interpolation
                        this.m_fixedTimeStep = fixedTimeStep;
                        this.m_localTime += timeStep;
                        if (this.m_localTime >= fixedTimeStep) {
                            numSimulationSubSteps = Math.floor(this.m_localTime / fixedTimeStep);
                            this.m_localTime -= numSimulationSubSteps * fixedTimeStep;
                        }
                    }
                    else {
                        // Variable timestep
                        fixedTimeStep = timeStep;
                        this.m_localTime = this.m_latencyMotionStateInterpolation ? 0 : timeStep;
                        this.m_fixedTimeStep = 0;
                        if (btFuzzyZero(timeStep)) {
                            numSimulationSubSteps = 0;
                            maxSubSteps = 0;
                        }
                        else {
                            numSimulationSubSteps = 1;
                            maxSubSteps = 1;
                        }
                    }
                    if (numSimulationSubSteps) {
                        // Clamp the number of substeps to prevent simulation grinding
                        const clampedSimulationSteps = Math.min(numSimulationSubSteps, maxSubSteps);
                        this.saveKinematicState(fixedTimeStep * clampedSimulationSteps);
                        this.applyGravity();
                        for (let i = 0; i < clampedSimulationSteps; i++) {
                            this.internalSingleStepSimulation(fixedTimeStep);
                            this.synchronizeMotionStates();
                        }
                    }
                    else {
                        this.synchronizeMotionStates();
                    }
                    this.clearForces();
                    return numSimulationSubSteps;
                }
                startProfiling(_timeStep) {
                    // Profiling implementation would go here
                }
                saveKinematicState(timeStep) {
                    // Iterate over collision objects to save kinematic state
                    for (let i = 0; i < this.m_collisionObjects.length; i++) {
                        const colObj = this.m_collisionObjects[i];
                        const body = colObj;
                        if (body && body.getActivationState && body.getActivationState() !== 2) { // ISLAND_SLEEPING = 2
                            if (body.isKinematicObject && body.isKinematicObject()) {
                                // Save kinematic state for next frame velocity calculation
                                if (body.saveKinematicState) {
                                    body.saveKinematicState(timeStep);
                                }
                            }
                        }
                    }
                }
                internalSingleStepSimulation(timeStep) {
                    // Call pre-tick callback if set
                    if (this.m_internalPreTickCallback) {
                        this.m_internalPreTickCallback(this, timeStep);
                    }
                    // Apply gravity and predict motion
                    this.predictUnconstraintMotion(timeStep);
                    const dispatchInfo = this.getDispatchInfo();
                    dispatchInfo.m_timeStep = timeStep;
                    dispatchInfo.m_stepCount = 0;
                    // Perform collision detection
                    this.performDiscreteCollisionDetection();
                    this.calculateSimulationIslands();
                    this.getSolverInfo().m_timeStep = timeStep;
                    // Solve contact and other joint constraints
                    this.solveConstraints(this.getSolverInfo());
                    // Integrate transforms
                    this.integrateTransforms(timeStep);
                    // Update vehicle simulation
                    this.updateActions(timeStep);
                    this.updateActivationState(timeStep);
                    // Call post-tick callback if set
                    if (this.m_internalTickCallback) {
                        this.m_internalTickCallback(this, timeStep);
                    }
                }
                predictUnconstraintMotion(timeStep) {
                    for (const body of this.m_nonStaticRigidBodies) {
                        if (!body.isStaticOrKinematicObject()) {
                            // Don't integrate/update velocities here, it happens in the constraint solver
                            // Simplified prediction - in full implementation this would predict transforms
                            if (body.predictIntegratedTransform && body.getWorldTransform) {
                                const predictedTransform = body.getWorldTransform().clone();
                                body.predictIntegratedTransform(timeStep, predictedTransform);
                            }
                        }
                    }
                }
                integrateTransforms(timeStep) {
                    // Integrate transforms for all non-static rigid bodies
                    for (const body of this.m_nonStaticRigidBodies) {
                        if (body.isActive() && !body.isStaticOrKinematicObject()) {
                            if (body.integrateVelocities) {
                                body.integrateVelocities(timeStep);
                            }
                        }
                    }
                }
                updateActions(timeStep) {
                    for (const action of this.m_actions) {
                        action.updateAction(this, timeStep);
                    }
                }
                updateActivationState(timeStep) {
                    for (const body of this.m_nonStaticRigidBodies) {
                        if (body.updateDeactivation) {
                            body.updateDeactivation(timeStep);
                            if (body.wantsSleeping && body.wantsSleeping()) {
                                if (body.isStaticOrKinematicObject()) {
                                    body.setActivationState(2); // ISLAND_SLEEPING
                                }
                                else {
                                    if (body.getActivationState() === 1) { // ACTIVE_TAG
                                        body.setActivationState(3); // WANTS_DEACTIVATION
                                    }
                                    if (body.getActivationState() === 2) { // ISLAND_SLEEPING
                                        body.setAngularVelocity(new btVector3_15.btVector3(0, 0, 0));
                                        body.setLinearVelocity(new btVector3_15.btVector3(0, 0, 0));
                                    }
                                }
                            }
                            else {
                                if (body.getActivationState() !== 5) { // DISABLE_DEACTIVATION
                                    body.setActivationState(1); // ACTIVE_TAG
                                }
                            }
                        }
                    }
                }
                calculateSimulationIslands() {
                    // this.getSimulationIslandManager().updateActivationState(this, this.getDispatcher()); // Temporarily disabled
                    // Store the island id in each body
                    // this.getSimulationIslandManager().storeIslandActivationState(this); // Temporarily disabled
                }
                solveConstraints(solverInfo) {
                    // Sort constraints by island ID - simplified version
                    this.m_sortedConstraints = [...this.m_constraints];
                    this.m_constraintSolver.prepareSolve(this.getNumCollisionObjects(), this.getDispatcher().getNumManifolds());
                    // Simplified constraint solving - full implementation would use islands
                    this.m_constraintSolver.solveGroup(this.m_collisionObjects, this.m_collisionObjects.length, [], 0, this.m_sortedConstraints, this.m_sortedConstraints.length, solverInfo, this.getDebugDrawer(), this.getDispatcher());
                    this.m_constraintSolver.allSolved(solverInfo, this.getDebugDrawer());
                }
                synchronizeMotionStates() {
                    if (this.m_synchronizeAllMotionStates) {
                        // Synchronize all collision objects
                        for (const colObj of this.m_collisionObjects) {
                            const body = colObj;
                            if (body) {
                                this.synchronizeSingleMotionState(body);
                            }
                        }
                    }
                    else {
                        // Synchronize only active rigid bodies
                        for (const body of this.m_nonStaticRigidBodies) {
                            if (body.isActive()) {
                                this.synchronizeSingleMotionState(body);
                            }
                        }
                    }
                }
                synchronizeSingleMotionState(body) {
                    if (body.getMotionState && body.getMotionState() && !body.isStaticOrKinematicObject()) {
                        // Update motion state with interpolated transform
                        // Simplified implementation
                        if (body.getWorldTransform) {
                            const motionState = body.getMotionState();
                            if (motionState) {
                                motionState.setWorldTransform(body.getWorldTransform());
                            }
                        }
                    }
                }
                // World management methods
                setGravity(gravity) {
                    this.m_gravity = gravity.clone();
                    for (const body of this.m_nonStaticRigidBodies) {
                        if (body.isActive() && body.setGravity) {
                            body.setGravity(gravity);
                        }
                    }
                }
                getGravity() {
                    return this.m_gravity.clone();
                }
                addRigidBody(body, group, mask) {
                    if (!body.isStaticOrKinematicObject()) {
                        body.setGravity(this.m_gravity);
                    }
                    if (body.getCollisionShape()) {
                        if (!body.isStaticObject()) {
                            this.m_nonStaticRigidBodies.push(body);
                        }
                        else {
                            body.setActivationState(2); // ISLAND_SLEEPING
                        }
                        // Simplified collision filter setup - using default values
                        const collisionFilterGroup = group !== undefined ? group : 1; // Default
                        const collisionFilterMask = mask !== undefined ? mask : -1; // All
                        this.addCollisionObject(body, collisionFilterGroup, collisionFilterMask);
                    }
                }
                removeRigidBody(body) {
                    const index = this.m_nonStaticRigidBodies.indexOf(body);
                    if (index !== -1) {
                        this.m_nonStaticRigidBodies.splice(index, 1);
                    }
                    this.removeCollisionObject(body);
                }
                removeCollisionObject(collisionObject) {
                    const body = collisionObject;
                    // Check if it's a rigid body by checking common rigid body properties
                    if (body && body.isStaticOrKinematicObject !== undefined) {
                        this.removeRigidBody(body);
                    }
                    else {
                        super.removeCollisionObject(collisionObject);
                    }
                }
                // Constraint management
                addConstraint(constraint, _disableCollisionsBetweenLinkedBodies = false) {
                    this.m_constraints.push(constraint);
                }
                removeConstraint(constraint) {
                    const index = this.m_constraints.indexOf(constraint);
                    if (index !== -1) {
                        this.m_constraints.splice(index, 1);
                    }
                }
                getNumConstraints() {
                    return this.m_constraints.length;
                }
                getConstraint(index) {
                    return index >= 0 && index < this.m_constraints.length ? this.m_constraints[index] : null;
                }
                // Action management
                addAction(action) {
                    this.m_actions.push(action);
                }
                removeAction(action) {
                    const index = this.m_actions.indexOf(action);
                    if (index !== -1) {
                        this.m_actions.splice(index, 1);
                    }
                }
                // Solver management
                setConstraintSolver(solver) {
                    this.m_constraintSolver = solver;
                }
                getConstraintSolver() {
                    return this.m_constraintSolver;
                }
                // getSimulationIslandManager(): btSimulationIslandManager {
                //   return this.m_islandManager;
                // } // Temporarily disabled
                getWorldType() {
                    return btDynamicsWorld_1.btDynamicsWorldType.BT_DISCRETE_DYNAMICS_WORLD;
                }
                // Force management
                clearForces() {
                    for (const body of this.m_nonStaticRigidBodies) {
                        if (body.clearForces) {
                            body.clearForces();
                        }
                    }
                }
                applyGravity() {
                    for (const body of this.m_nonStaticRigidBodies) {
                        if (body.isActive() && body.applyGravity) {
                            body.applyGravity();
                        }
                    }
                }
                debugDrawWorld() {
                    // Simplified debug drawing - would call parent if it had concrete implementation
                    const debugDrawer = this.getDebugDrawer();
                    if (debugDrawer) {
                        // Draw constraints
                        for (const constraint of this.m_constraints) {
                            this.debugDrawConstraint(constraint);
                        }
                        // Draw actions
                        for (const action of this.m_actions) {
                            action.debugDraw(debugDrawer);
                        }
                    }
                }
                debugDrawConstraint(_constraint) {
                    // Debug draw constraint - would need proper constraint implementation
                }
                // Settings
                setSynchronizeAllMotionStates(synchronizeAll) {
                    this.m_synchronizeAllMotionStates = synchronizeAll;
                }
                getSynchronizeAllMotionStates() {
                    return this.m_synchronizeAllMotionStates;
                }
                setApplySpeculativeContactRestitution(enable) {
                    this.m_applySpeculativeContactRestitution = enable;
                }
                getApplySpeculativeContactRestitution() {
                    return this.m_applySpeculativeContactRestitution;
                }
                setLatencyMotionStateInterpolation(latencyInterpolation) {
                    this.m_latencyMotionStateInterpolation = latencyInterpolation;
                }
                getLatencyMotionStateInterpolation() {
                    return this.m_latencyMotionStateInterpolation;
                }
                getNonStaticRigidBodies() {
                    return [...this.m_nonStaticRigidBodies];
                }
                // Legacy vehicle/character methods (deprecated, use actions instead)
                addVehicle(vehicle) {
                    this.addAction(vehicle);
                }
                removeVehicle(vehicle) {
                    this.removeAction(vehicle);
                }
                addCharacter(character) {
                    this.addAction(character);
                }
                removeCharacter(character) {
                    this.removeAction(character);
                }
            };
            exports_29("btDiscreteDynamicsWorld", btDiscreteDynamicsWorld);
        }
    };
});
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
System.register("src/LinearMath/btAabbUtil2", ["src/LinearMath/btVector3", "src/LinearMath/btMinMax", "src/LinearMath/btScalar"], function (exports_30, context_30) {
    "use strict";
    var btVector3_16, btMinMax_4, btScalar_9;
    var __moduleName = context_30 && context_30.id;
    /**
     * Expands an AABB by the given expansion values
     * @param aabbMin Minimum bounds of the AABB to modify
     * @param aabbMax Maximum bounds of the AABB to modify
     * @param expansionMin Minimum expansion values
     * @param expansionMax Maximum expansion values
     */
    function AabbExpand(aabbMin, aabbMax, expansionMin, expansionMax) {
        aabbMin.copy(aabbMin.add(expansionMin));
        aabbMax.copy(aabbMax.add(expansionMax));
    }
    exports_30("AabbExpand", AabbExpand);
    /**
     * Conservative test for overlap between a point and an AABB
     * @param aabbMin1 Minimum bounds of the AABB
     * @param aabbMax1 Maximum bounds of the AABB
     * @param point Point to test
     * @returns True if the point is inside the AABB
     */
    function TestPointAgainstAabb2(aabbMin1, aabbMax1, point) {
        let overlap = true;
        overlap = (aabbMin1.getX() > point.getX() || aabbMax1.getX() < point.getX()) ? false : overlap;
        overlap = (aabbMin1.getZ() > point.getZ() || aabbMax1.getZ() < point.getZ()) ? false : overlap;
        overlap = (aabbMin1.getY() > point.getY() || aabbMax1.getY() < point.getY()) ? false : overlap;
        return overlap;
    }
    exports_30("TestPointAgainstAabb2", TestPointAgainstAabb2);
    /**
     * Conservative test for overlap between two AABBs
     * @param aabbMin1 Minimum bounds of the first AABB
     * @param aabbMax1 Maximum bounds of the first AABB
     * @param aabbMin2 Minimum bounds of the second AABB
     * @param aabbMax2 Maximum bounds of the second AABB
     * @returns True if the AABBs overlap
     */
    function TestAabbAgainstAabb2(aabbMin1, aabbMax1, aabbMin2, aabbMax2) {
        let overlap = true;
        overlap = (aabbMin1.getX() > aabbMax2.getX() || aabbMax1.getX() < aabbMin2.getX()) ? false : overlap;
        overlap = (aabbMin1.getZ() > aabbMax2.getZ() || aabbMax1.getZ() < aabbMin2.getZ()) ? false : overlap;
        overlap = (aabbMin1.getY() > aabbMax2.getY() || aabbMax1.getY() < aabbMin2.getY()) ? false : overlap;
        return overlap;
    }
    exports_30("TestAabbAgainstAabb2", TestAabbAgainstAabb2);
    /**
     * Conservative test for overlap between a triangle and an AABB
     * @param vertices Array of three vertices defining the triangle
     * @param aabbMin Minimum bounds of the AABB
     * @param aabbMax Maximum bounds of the AABB
     * @returns True if the triangle overlaps with the AABB
     */
    function TestTriangleAgainstAabb2(vertices, aabbMin, aabbMax) {
        const p1 = vertices[0];
        const p2 = vertices[1];
        const p3 = vertices[2];
        if (btMinMax_4.btMin(btMinMax_4.btMin(p1.getX(), p2.getX()), p3.getX()) > aabbMax.getX())
            return false;
        if (btMinMax_4.btMax(btMinMax_4.btMax(p1.getX(), p2.getX()), p3.getX()) < aabbMin.getX())
            return false;
        if (btMinMax_4.btMin(btMinMax_4.btMin(p1.getZ(), p2.getZ()), p3.getZ()) > aabbMax.getZ())
            return false;
        if (btMinMax_4.btMax(btMinMax_4.btMax(p1.getZ(), p2.getZ()), p3.getZ()) < aabbMin.getZ())
            return false;
        if (btMinMax_4.btMin(btMinMax_4.btMin(p1.getY(), p2.getY()), p3.getY()) > aabbMax.getY())
            return false;
        if (btMinMax_4.btMax(btMinMax_4.btMax(p1.getY(), p2.getY()), p3.getY()) < aabbMin.getY())
            return false;
        return true;
    }
    exports_30("TestTriangleAgainstAabb2", TestTriangleAgainstAabb2);
    /**
     * Computes the outcode for a point against half extents
     * @param p Point to test
     * @param halfExtent Half extents defining the bounds
     * @returns Outcode bits indicating which bounds the point exceeds
     */
    function btOutcode(p, halfExtent) {
        return (p.getX() < -halfExtent.getX() ? 0x01 : 0x0) |
            (p.getX() > halfExtent.getX() ? 0x08 : 0x0) |
            (p.getY() < -halfExtent.getY() ? 0x02 : 0x0) |
            (p.getY() > halfExtent.getY() ? 0x10 : 0x0) |
            (p.getZ() < -halfExtent.getZ() ? 0x4 : 0x0) |
            (p.getZ() > halfExtent.getZ() ? 0x20 : 0x0);
    }
    exports_30("btOutcode", btOutcode);
    /**
     * Ray-AABB intersection test using inverse direction and ray signs
     * @param rayFrom Ray origin
     * @param rayInvDirection Inverse ray direction
     * @param raySign Array indicating the sign of each ray direction component
     * @param bounds Array of two vectors representing the AABB bounds [min, max]
     * @param tmin Output parameter for the minimum intersection distance
     * @param lambda_min Minimum lambda value
     * @param lambda_max Maximum lambda value
     * @returns True if the ray intersects the AABB
     */
    function btRayAabb2(rayFrom, rayInvDirection, raySign, bounds, tmin, lambda_min, lambda_max) {
        let tmax, tymin, tymax, tzmin, tzmax;
        tmin.value = (bounds[raySign[0]].getX() - rayFrom.getX()) * rayInvDirection.getX();
        tmax = (bounds[1 - raySign[0]].getX() - rayFrom.getX()) * rayInvDirection.getX();
        tymin = (bounds[raySign[1]].getY() - rayFrom.getY()) * rayInvDirection.getY();
        tymax = (bounds[1 - raySign[1]].getY() - rayFrom.getY()) * rayInvDirection.getY();
        if ((tmin.value > tymax) || (tymin > tmax))
            return false;
        if (tymin > tmin.value)
            tmin.value = tymin;
        if (tymax < tmax)
            tmax = tymax;
        tzmin = (bounds[raySign[2]].getZ() - rayFrom.getZ()) * rayInvDirection.getZ();
        tzmax = (bounds[1 - raySign[2]].getZ() - rayFrom.getZ()) * rayInvDirection.getZ();
        if ((tmin.value > tzmax) || (tzmin > tmax))
            return false;
        if (tzmin > tmin.value)
            tmin.value = tzmin;
        if (tzmax < tmax)
            tmax = tzmax;
        return ((tmin.value < lambda_max) && (tmax > lambda_min));
    }
    exports_30("btRayAabb2", btRayAabb2);
    /**
     * Ray-AABB intersection test with normal computation
     * @param rayFrom Ray origin
     * @param rayTo Ray end point
     * @param aabbMin Minimum bounds of the AABB
     * @param aabbMax Maximum bounds of the AABB
     * @param param Output parameter for intersection parameter
     * @param normal Output normal at intersection point
     * @returns True if the ray intersects the AABB
     */
    function btRayAabb(rayFrom, rayTo, aabbMin, aabbMax, param, normal) {
        const aabbHalfExtent = aabbMax.subtract(aabbMin).multiply(0.5);
        const aabbCenter = aabbMax.add(aabbMin).multiply(0.5);
        const source = rayFrom.subtract(aabbCenter);
        const target = rayTo.subtract(aabbCenter);
        const sourceOutcode = btOutcode(source, aabbHalfExtent);
        const targetOutcode = btOutcode(target, aabbHalfExtent);
        if ((sourceOutcode & targetOutcode) === 0x0) {
            let lambda_enter = 0.0;
            let lambda_exit = param.value;
            const r = target.subtract(source);
            let normSign = 1;
            const hitNormal = new btVector3_16.btVector3(0, 0, 0);
            let bit = 1;
            for (let j = 0; j < 2; j++) {
                for (let i = 0; i !== 3; ++i) {
                    if (sourceOutcode & bit) {
                        const lambda = (-source.getAt(i) - aabbHalfExtent.getAt(i) * normSign) / r.getAt(i);
                        if (lambda_enter <= lambda) {
                            lambda_enter = lambda;
                            hitNormal.setValue(0, 0, 0);
                            hitNormal.setAt(i, normSign);
                        }
                    }
                    else if (targetOutcode & bit) {
                        const lambda = (-source.getAt(i) - aabbHalfExtent.getAt(i) * normSign) / r.getAt(i);
                        if (lambda < lambda_exit) {
                            lambda_exit = lambda;
                        }
                    }
                    bit <<= 1;
                }
                normSign = -1;
            }
            if (lambda_enter <= lambda_exit) {
                param.value = lambda_enter;
                normal.copy(hitNormal);
                return true;
            }
        }
        return false;
    }
    exports_30("btRayAabb", btRayAabb);
    /**
     * Transforms an AABB defined by half extents with a margin
     * @param halfExtents Half extents of the original AABB
     * @param margin Margin to add to the AABB
     * @param t Transform to apply
     * @param aabbMinOut Output minimum bounds
     * @param aabbMaxOut Output maximum bounds
     */
    function btTransformAabb(halfExtents, margin, t, aabbMinOut, aabbMaxOut) {
        const halfExtentsWithMargin = halfExtents.add(new btVector3_16.btVector3(margin, margin, margin));
        const abs_b = t.getBasis().absolute();
        const center = t.getOrigin();
        const extent = halfExtentsWithMargin.dot3(abs_b.getRow(0), abs_b.getRow(1), abs_b.getRow(2));
        aabbMinOut.copy(center.subtract(extent));
        aabbMaxOut.copy(center.add(extent));
    }
    exports_30("btTransformAabb", btTransformAabb);
    /**
     * Transforms an AABB defined by min/max bounds with a margin
     * @param localAabbMin Local minimum bounds
     * @param localAabbMax Local maximum bounds
     * @param margin Margin to add to the AABB
     * @param trans Transform to apply
     * @param aabbMinOut Output minimum bounds
     * @param aabbMaxOut Output maximum bounds
     */
    function btTransformAabbOverload(localAabbMin, localAabbMax, margin, trans, aabbMinOut, aabbMaxOut) {
        btScalar_9.btAssert(localAabbMin.getX() <= localAabbMax.getX());
        btScalar_9.btAssert(localAabbMin.getY() <= localAabbMax.getY());
        btScalar_9.btAssert(localAabbMin.getZ() <= localAabbMax.getZ());
        let localHalfExtents = localAabbMax.subtract(localAabbMin).multiply(0.5);
        localHalfExtents = localHalfExtents.add(new btVector3_16.btVector3(margin, margin, margin));
        const localCenter = localAabbMax.add(localAabbMin).multiply(0.5);
        const abs_b = trans.getBasis().absolute();
        const center = trans.transformPoint(localCenter);
        const extent = localHalfExtents.dot3(abs_b.getRow(0), abs_b.getRow(1), abs_b.getRow(2));
        aabbMinOut.copy(center.subtract(extent));
        aabbMaxOut.copy(center.add(extent));
    }
    exports_30("btTransformAabbOverload", btTransformAabbOverload);
    /**
     * Tests overlap between two quantized AABBs using branchless approach
     * @param aabbMin1 Minimum bounds of the first AABB (quantized as unsigned short)
     * @param aabbMax1 Maximum bounds of the first AABB (quantized as unsigned short)
     * @param aabbMin2 Minimum bounds of the second AABB (quantized as unsigned short)
     * @param aabbMax2 Maximum bounds of the second AABB (quantized as unsigned short)
     * @returns 1 if AABBs overlap, 0 otherwise
     */
    function testQuantizedAabbAgainstQuantizedAabb(aabbMin1, aabbMax1, aabbMin2, aabbMax2) {
        // Branchless implementation using btSelectUnsigned
        const overlapCondition = (aabbMin1[0] <= aabbMax2[0]) &&
            (aabbMax1[0] >= aabbMin2[0]) &&
            (aabbMin1[2] <= aabbMax2[2]) &&
            (aabbMax1[2] >= aabbMin2[2]) &&
            (aabbMin1[1] <= aabbMax2[1]) &&
            (aabbMax1[1] >= aabbMin2[1]);
        return btScalar_9.btSelectUnsigned(overlapCondition ? 1 : 0, 1, 0);
    }
    exports_30("testQuantizedAabbAgainstQuantizedAabb", testQuantizedAabbAgainstQuantizedAabb);
    return {
        setters: [
            function (btVector3_16_1) {
                btVector3_16 = btVector3_16_1;
            },
            function (btMinMax_4_1) {
                btMinMax_4 = btMinMax_4_1;
            },
            function (btScalar_9_1) {
                btScalar_9 = btScalar_9_1;
            }
        ],
        execute: function () {/*
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
        }
    };
});
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
System.register("src/BulletCollision/CollisionShapes/btConvexInternalShape", ["src/BulletCollision/CollisionShapes/btConvexShape", "src/LinearMath/btVector3", "src/LinearMath/btAabbUtil2", "src/LinearMath/btMatrix3x3", "src/BulletCollision/CollisionShapes/btCollisionMargin", "src/LinearMath/btScalar"], function (exports_31, context_31) {
    "use strict";
    var btConvexShape_1, btVector3_17, btAabbUtil2_1, btMatrix3x3_6, btCollisionMargin_2, btScalar_10, btConvexInternalShape, btConvexInternalAabbCachingShape;
    var __moduleName = context_31 && context_31.id;
    return {
        setters: [
            function (btConvexShape_1_1) {
                btConvexShape_1 = btConvexShape_1_1;
            },
            function (btVector3_17_1) {
                btVector3_17 = btVector3_17_1;
            },
            function (btAabbUtil2_1_1) {
                btAabbUtil2_1 = btAabbUtil2_1_1;
            },
            function (btMatrix3x3_6_1) {
                btMatrix3x3_6 = btMatrix3x3_6_1;
            },
            function (btCollisionMargin_2_1) {
                btCollisionMargin_2 = btCollisionMargin_2_1;
            },
            function (btScalar_10_1) {
                btScalar_10 = btScalar_10_1;
            }
        ],
        execute: function () {/*
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
             * The btConvexInternalShape is an internal base class, shared by most convex shape implementations.
             * The btConvexInternalShape uses a default collision margin set to CONVEX_DISTANCE_MARGIN.
             * This collision margin used by Gjk and some other algorithms, see also btCollisionMargin.h
             * Note that when creating small shapes (derived from btConvexInternalShape),
             * you need to make sure to set a smaller collision margin, using the 'setMargin' API
             * There is a automatic mechanism 'setSafeMargin' used by btBoxShape and btCylinderShape
             */
            btConvexInternalShape = class btConvexInternalShape extends btConvexShape_1.btConvexShape {
                constructor() {
                    super();
                    this.localScaling = new btVector3_17.btVector3(1, 1, 1);
                    this.implicitShapeDimensions = new btVector3_17.btVector3(0, 0, 0);
                    this.collisionMargin = btCollisionMargin_2.CONVEX_DISTANCE_MARGIN;
                    this.padding = 0;
                }
                /**
                 * Get supporting vertex in local coordinate system, including margin
                 */
                localGetSupportingVertex(vec) {
                    const supVertex = this.localGetSupportingVertexWithoutMargin(vec);
                    if (this.getMargin() !== 0) {
                        const vecnorm = vec.clone();
                        if (vecnorm.length2() < (btScalar_10.SIMD_EPSILON * btScalar_10.SIMD_EPSILON)) {
                            vecnorm.setValue(-1, -1, -1);
                        }
                        vecnorm.normalize();
                        supVertex.addAssign(vecnorm.multiply(this.getMargin()));
                    }
                    return supVertex;
                }
                /**
                 * Get the implicit shape dimensions
                 */
                getImplicitShapeDimensions() {
                    return this.implicitShapeDimensions.clone();
                }
                /**
                 * Warning: use setImplicitShapeDimensions with care
                 * changing a collision shape while the body is in the world is not recommended,
                 * it is best to remove the body from the world, then make the change, and re-add it
                 * alternatively flush the contact points, see documentation for 'cleanProxyFromPairs'
                 */
                setImplicitShapeDimensions(dimensions) {
                    this.implicitShapeDimensions.copy(dimensions);
                }
                setSafeMargin(minDimensionOrHalfExtents, defaultMarginMultiplier = 0.1) {
                    let minDimension;
                    if (typeof minDimensionOrHalfExtents === 'number') {
                        minDimension = minDimensionOrHalfExtents;
                    }
                    else {
                        // see http://code.google.com/p/bullet/issues/detail?id=349
                        // this margin check could be added to other collision shapes too,
                        // or add some assert/warning somewhere
                        const axis = minDimensionOrHalfExtents.minAxis();
                        minDimension = axis === 0 ? minDimensionOrHalfExtents.x() :
                            axis === 1 ? minDimensionOrHalfExtents.y() :
                                minDimensionOrHalfExtents.z();
                    }
                    const safeMargin = defaultMarginMultiplier * minDimension;
                    if (safeMargin < this.getMargin()) {
                        this.setMargin(safeMargin);
                    }
                }
                /**
                 * getAabb's default implementation is brute force, expected derived classes to implement a fast dedicated version
                 */
                getAabb(t, aabbMin, aabbMax) {
                    this.getAabbSlow(t, aabbMin, aabbMax);
                }
                /**
                 * Slow AABB calculation using support function queries
                 */
                getAabbSlow(trans, minAabb, maxAabb) {
                    const margin = this.getMargin();
                    for (let i = 0; i < 3; i++) {
                        let vec = new btVector3_17.btVector3(0, 0, 0);
                        if (i === 0)
                            vec.setValue(1, 0, 0);
                        else if (i === 1)
                            vec.setValue(0, 1, 0);
                        else
                            vec.setValue(0, 0, 1);
                        const transformedVec = btMatrix3x3_6.multiplyMatrixVector(trans.getBasis(), vec);
                        const sv = this.localGetSupportingVertexWithoutMargin(transformedVec);
                        const tmp = trans.transformPoint(sv);
                        vec = vec.negate();
                        const transformedVec2 = btMatrix3x3_6.multiplyMatrixVector(trans.getBasis(), vec);
                        const sv2 = this.localGetSupportingVertexWithoutMargin(transformedVec2);
                        const tmp2 = trans.transformPoint(sv2);
                        if (i === 0) {
                            maxAabb.setValue(tmp.x() + margin, 0, 0);
                            minAabb.setValue(tmp2.x() - margin, 0, 0);
                        }
                        else if (i === 1) {
                            maxAabb.setValue(maxAabb.x(), tmp.y() + margin, maxAabb.z());
                            minAabb.setValue(minAabb.x(), tmp2.y() - margin, minAabb.z());
                        }
                        else {
                            maxAabb.setValue(maxAabb.x(), maxAabb.y(), tmp.z() + margin);
                            minAabb.setValue(minAabb.x(), minAabb.y(), tmp2.z() - margin);
                        }
                    }
                }
                /**
                 * Set local scaling of the convex shape
                 */
                setLocalScaling(scaling) {
                    this.localScaling.copy(scaling.absolute());
                }
                /**
                 * Get local scaling of the convex shape
                 */
                getLocalScaling() {
                    return this.localScaling.clone();
                }
                /**
                 * Get local scaling without creating a copy (non-virtual version)
                 */
                getLocalScalingNV() {
                    return this.localScaling;
                }
                /**
                 * Set the collision margin
                 */
                setMargin(margin) {
                    this.collisionMargin = margin;
                }
                /**
                 * Get the collision margin
                 */
                getMargin() {
                    return this.collisionMargin;
                }
                /**
                 * Get collision margin without virtual call
                 */
                getMarginNV() {
                    return this.collisionMargin;
                }
                /**
                 * Get the number of preferred penetration directions
                 */
                getNumPreferredPenetrationDirections() {
                    return 0;
                }
                /**
                 * Get the preferred penetration direction at given index
                 */
                getPreferredPenetrationDirection(_index, _penetrationVector) {
                    btScalar_10.btAssert(false, 'getPreferredPenetrationDirection not implemented');
                }
                /**
                 * Calculate the size needed for serialization
                 */
                calculateSerializeBufferSize() {
                    // In TypeScript, we don't need to calculate buffer sizes for serialization
                    // This method exists for API compatibility
                    return 0;
                }
                /**
                 * Serialize the shape data
                 * Returns serialization type name for compatibility
                 */
                serialize(_dataBuffer, _serializer) {
                    // In TypeScript, we can return a simple object structure
                    // This method exists for API compatibility with C++ version
                    return 'btConvexInternalShapeData';
                }
                /**
                 * Create serialization data object
                 */
                getSerializationData() {
                    return {
                        collisionShapeData: {},
                        localScaling: {
                            x: this.localScaling.x(),
                            y: this.localScaling.y(),
                            z: this.localScaling.z()
                        },
                        implicitShapeDimensions: {
                            x: this.implicitShapeDimensions.x(),
                            y: this.implicitShapeDimensions.y(),
                            z: this.implicitShapeDimensions.z()
                        },
                        collisionMargin: this.collisionMargin,
                        padding: 0
                    };
                }
            };
            exports_31("btConvexInternalShape", btConvexInternalShape);
            /**
             * btConvexInternalAabbCachingShape adds local aabb caching for convex shapes,
             * to avoid expensive bounding box calculations
             */
            btConvexInternalAabbCachingShape = class btConvexInternalAabbCachingShape extends btConvexInternalShape {
                constructor() {
                    super();
                    this.localAabbMin = new btVector3_17.btVector3(1, 1, 1);
                    this.localAabbMax = new btVector3_17.btVector3(-1, -1, -1);
                    this.isLocalAabbValid = false;
                }
                /**
                 * Set cached local AABB
                 */
                setCachedLocalAabb(aabbMin, aabbMax) {
                    this.isLocalAabbValid = true;
                    this.localAabbMin.copy(aabbMin);
                    this.localAabbMax.copy(aabbMax);
                }
                /**
                 * Get cached local AABB
                 */
                getCachedLocalAabb(aabbMin, aabbMax) {
                    btScalar_10.btAssert(this.isLocalAabbValid, 'Local AABB cache is not valid');
                    aabbMin.copy(this.localAabbMin);
                    aabbMax.copy(this.localAabbMax);
                }
                /**
                 * Get non-virtual AABB using cached local bounds
                 */
                getNonvirtualAabb(trans, aabbMin, aabbMax, _margin) {
                    // lazy evaluation of local aabb
                    btScalar_10.btAssert(this.isLocalAabbValid, 'Local AABB cache is not valid');
                    // The cached local bounds already include margin, so we pass 0 as margin to avoid double-adding
                    btAabbUtil2_1.btTransformAabbOverload(this.localAabbMin, this.localAabbMax, 0, trans, aabbMin, aabbMax);
                }
                /**
                 * Set local scaling and recalculate cached AABB
                 */
                setLocalScaling(scaling) {
                    super.setLocalScaling(scaling);
                    this.recalcLocalAabb();
                }
                /**
                 * Get AABB using cached local bounds
                 */
                getAabb(t, aabbMin, aabbMax) {
                    this.getNonvirtualAabb(t, aabbMin, aabbMax, this.getMargin());
                }
                /**
                 * Recalculate local AABB cache
                 */
                recalcLocalAabb() {
                    this.isLocalAabbValid = true;
                    // Use optimized approach with batched queries
                    const directions = [
                        new btVector3_17.btVector3(1, 0, 0),
                        new btVector3_17.btVector3(0, 1, 0),
                        new btVector3_17.btVector3(0, 0, 1),
                        new btVector3_17.btVector3(-1, 0, 0),
                        new btVector3_17.btVector3(0, -1, 0),
                        new btVector3_17.btVector3(0, 0, -1)
                    ];
                    const supporting = [
                        new btVector3_17.btVector3(0, 0, 0),
                        new btVector3_17.btVector3(0, 0, 0),
                        new btVector3_17.btVector3(0, 0, 0),
                        new btVector3_17.btVector3(0, 0, 0),
                        new btVector3_17.btVector3(0, 0, 0),
                        new btVector3_17.btVector3(0, 0, 0)
                    ];
                    this.batchedUnitVectorGetSupportingVertexWithoutMargin(directions, supporting, 6);
                    for (let i = 0; i < 3; ++i) {
                        const maxCoord = (i === 0 ? supporting[i].x() : i === 1 ? supporting[i].y() : supporting[i].z()) + this.collisionMargin;
                        const minCoord = (i === 0 ? supporting[i + 3].x() : i === 1 ? supporting[i + 3].y() : supporting[i + 3].z()) - this.collisionMargin;
                        if (i === 0) {
                            this.localAabbMax.setValue(maxCoord, this.localAabbMax.y(), this.localAabbMax.z());
                            this.localAabbMin.setValue(minCoord, this.localAabbMin.y(), this.localAabbMin.z());
                        }
                        else if (i === 1) {
                            this.localAabbMax.setValue(this.localAabbMax.x(), maxCoord, this.localAabbMax.z());
                            this.localAabbMin.setValue(this.localAabbMin.x(), minCoord, this.localAabbMin.z());
                        }
                        else {
                            this.localAabbMax.setValue(this.localAabbMax.x(), this.localAabbMax.y(), maxCoord);
                            this.localAabbMin.setValue(this.localAabbMin.x(), this.localAabbMin.y(), minCoord);
                        }
                    }
                }
            };
            exports_31("btConvexInternalAabbCachingShape", btConvexInternalAabbCachingShape);
        }
    };
});
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
System.register("src/BulletCollision/CollisionShapes/btBoxShape", ["src/BulletCollision/CollisionShapes/btConvexInternalShape", "src/LinearMath/btVector3", "src/LinearMath/btAabbUtil2", "src/LinearMath/btScalar", "src/BulletCollision/BroadphaseCollision/btBroadphaseProxy"], function (exports_32, context_32) {
    "use strict";
    var btConvexInternalShape_1, btVector3_18, btAabbUtil2_2, btScalar_11, btBroadphaseProxy_4, btBoxShape;
    var __moduleName = context_32 && context_32.id;
    return {
        setters: [
            function (btConvexInternalShape_1_1) {
                btConvexInternalShape_1 = btConvexInternalShape_1_1;
            },
            function (btVector3_18_1) {
                btVector3_18 = btVector3_18_1;
            },
            function (btAabbUtil2_2_1) {
                btAabbUtil2_2 = btAabbUtil2_2_1;
            },
            function (btScalar_11_1) {
                btScalar_11 = btScalar_11_1;
            },
            function (btBroadphaseProxy_4_1) {
                btBroadphaseProxy_4 = btBroadphaseProxy_4_1;
            }
        ],
        execute: function () {/*
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
             * The btBoxShape is a box primitive around the origin, its sides axis aligned with length
             * specified by half extents, in local shape coordinates. When used as part of a btCollisionObject
             * or btRigidBody it will be an oriented box in world space.
             */
            btBoxShape = class btBoxShape extends btConvexInternalShape_1.btConvexInternalShape {
                /**
                 * Constructor for btBoxShape
                 * @param boxHalfExtents - The half extents (half width, half height, half depth) of the box
                 */
                constructor(boxHalfExtents) {
                    super();
                    this.m_shapeType = btBroadphaseProxy_4.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE;
                    const margin = new btVector3_18.btVector3(this.getMargin(), this.getMargin(), this.getMargin());
                    this.implicitShapeDimensions = boxHalfExtents.multiplyVector(this.localScaling).subtract(margin);
                    this.setSafeMargin(boxHalfExtents);
                }
                /**
                 * Get the half extents including collision margin
                 */
                getHalfExtentsWithMargin() {
                    const halfExtents = this.getHalfExtentsWithoutMargin();
                    const margin = new btVector3_18.btVector3(this.getMargin(), this.getMargin(), this.getMargin());
                    return halfExtents.add(margin);
                }
                /**
                 * Get the half extents without collision margin (scaled shape dimensions)
                 */
                getHalfExtentsWithoutMargin() {
                    return this.implicitShapeDimensions.clone(); // scaling is included, margin is not
                }
                /**
                 * Get supporting vertex in local coordinate system with margin
                 */
                localGetSupportingVertex(vec) {
                    const halfExtents = this.getHalfExtentsWithoutMargin();
                    const margin = new btVector3_18.btVector3(this.getMargin(), this.getMargin(), this.getMargin());
                    const halfExtentsWithMargin = halfExtents.add(margin);
                    return new btVector3_18.btVector3(btScalar_11.btFsels(vec.x(), halfExtentsWithMargin.x(), -halfExtentsWithMargin.x()), btScalar_11.btFsels(vec.y(), halfExtentsWithMargin.y(), -halfExtentsWithMargin.y()), btScalar_11.btFsels(vec.z(), halfExtentsWithMargin.z(), -halfExtentsWithMargin.z()));
                }
                /**
                 * Get supporting vertex in local coordinate system without margin
                 */
                localGetSupportingVertexWithoutMargin(vec) {
                    const halfExtents = this.getHalfExtentsWithoutMargin();
                    return new btVector3_18.btVector3(btScalar_11.btFsels(vec.x(), halfExtents.x(), -halfExtents.x()), btScalar_11.btFsels(vec.y(), halfExtents.y(), -halfExtents.y()), btScalar_11.btFsels(vec.z(), halfExtents.z(), -halfExtents.z()));
                }
                /**
                 * Get supporting vertices for multiple unit vectors at once (batch operation)
                 */
                batchedUnitVectorGetSupportingVertexWithoutMargin(vectors, supportVerticesOut, numVectors) {
                    const halfExtents = this.getHalfExtentsWithoutMargin();
                    for (let i = 0; i < numVectors; i++) {
                        const vec = vectors[i];
                        supportVerticesOut[i] = new btVector3_18.btVector3(btScalar_11.btFsels(vec.x(), halfExtents.x(), -halfExtents.x()), btScalar_11.btFsels(vec.y(), halfExtents.y(), -halfExtents.y()), btScalar_11.btFsels(vec.z(), halfExtents.z(), -halfExtents.z()));
                    }
                }
                /**
                 * Set collision margin and adjust implicit shape dimensions accordingly
                 */
                setMargin(collisionMargin) {
                    // Correct the implicitShapeDimensions for the margin
                    const oldMargin = new btVector3_18.btVector3(this.getMargin(), this.getMargin(), this.getMargin());
                    const implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add(oldMargin);
                    super.setMargin(collisionMargin);
                    const newMargin = new btVector3_18.btVector3(this.getMargin(), this.getMargin(), this.getMargin());
                    this.implicitShapeDimensions = implicitShapeDimensionsWithMargin.subtract(newMargin);
                }
                /**
                 * Set local scaling and adjust implicit shape dimensions accordingly
                 */
                setLocalScaling(scaling) {
                    const oldMargin = new btVector3_18.btVector3(this.getMargin(), this.getMargin(), this.getMargin());
                    const implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add(oldMargin);
                    const unScaledImplicitShapeDimensionsWithMargin = new btVector3_18.btVector3(implicitShapeDimensionsWithMargin.x() / this.localScaling.x(), implicitShapeDimensionsWithMargin.y() / this.localScaling.y(), implicitShapeDimensionsWithMargin.z() / this.localScaling.z());
                    super.setLocalScaling(scaling);
                    this.implicitShapeDimensions = new btVector3_18.btVector3(unScaledImplicitShapeDimensionsWithMargin.x() * this.localScaling.x(), unScaledImplicitShapeDimensionsWithMargin.y() * this.localScaling.y(), unScaledImplicitShapeDimensionsWithMargin.z() * this.localScaling.z()).subtract(oldMargin);
                }
                /**
                 * Get axis-aligned bounding box in world coordinates
                 */
                getAabb(t, aabbMin, aabbMax) {
                    btAabbUtil2_2.btTransformAabb(this.getHalfExtentsWithoutMargin(), this.getMargin(), t, aabbMin, aabbMax);
                }
                /**
                 * Calculate local inertia tensor for the box
                 */
                calculateLocalInertia(mass, inertia) {
                    const halfExtents = this.getHalfExtentsWithMargin();
                    const lx = 2 * halfExtents.x();
                    const ly = 2 * halfExtents.y();
                    const lz = 2 * halfExtents.z();
                    inertia.setValue(mass / 12 * (ly * ly + lz * lz), mass / 12 * (lx * lx + lz * lz), mass / 12 * (lx * lx + ly * ly));
                }
                /**
                 * Get plane normal and support point for the given plane index
                 */
                getPlane(planeNormal, planeSupport, i) {
                    // This plane might not be aligned...
                    const plane = new btVector3_18.btVector4(0, 0, 0, 0);
                    this.getPlaneEquation(plane, i);
                    planeNormal.setValue(plane.x(), plane.y(), plane.z());
                    planeSupport.copy(this.localGetSupportingVertex(planeNormal.negate()));
                }
                /**
                 * Get number of planes (faces) of the box
                 */
                getNumPlanes() {
                    return 6;
                }
                /**
                 * Get number of vertices of the box
                 */
                getNumVertices() {
                    return 8;
                }
                /**
                 * Get number of edges of the box
                 */
                getNumEdges() {
                    return 12;
                }
                /**
                 * Get vertex at the given index
                 */
                getVertex(i, vtx) {
                    const halfExtents = this.getHalfExtentsWithMargin();
                    vtx.setValue(halfExtents.x() * (1 - (i & 1)) - halfExtents.x() * (i & 1), halfExtents.y() * (1 - ((i & 2) >> 1)) - halfExtents.y() * ((i & 2) >> 1), halfExtents.z() * (1 - ((i & 4) >> 2)) - halfExtents.z() * ((i & 4) >> 2));
                }
                /**
                 * Get plane equation for the given plane index
                 */
                getPlaneEquation(plane, i) {
                    const halfExtents = this.getHalfExtentsWithoutMargin();
                    switch (i) {
                        case 0:
                            plane.setValue(1, 0, 0, -halfExtents.x());
                            break;
                        case 1:
                            plane.setValue(-1, 0, 0, -halfExtents.x());
                            break;
                        case 2:
                            plane.setValue(0, 1, 0, -halfExtents.y());
                            break;
                        case 3:
                            plane.setValue(0, -1, 0, -halfExtents.y());
                            break;
                        case 4:
                            plane.setValue(0, 0, 1, -halfExtents.z());
                            break;
                        case 5:
                            plane.setValue(0, 0, -1, -halfExtents.z());
                            break;
                        default:
                            btScalar_11.btAssert(false, `Invalid plane index: ${i}`);
                    }
                }
                /**
                 * Get edge vertices for the given edge index
                 */
                getEdge(i, pa, pb) {
                    let edgeVert0 = 0;
                    let edgeVert1 = 0;
                    switch (i) {
                        case 0:
                            edgeVert0 = 0;
                            edgeVert1 = 1;
                            break;
                        case 1:
                            edgeVert0 = 0;
                            edgeVert1 = 2;
                            break;
                        case 2:
                            edgeVert0 = 1;
                            edgeVert1 = 3;
                            break;
                        case 3:
                            edgeVert0 = 2;
                            edgeVert1 = 3;
                            break;
                        case 4:
                            edgeVert0 = 0;
                            edgeVert1 = 4;
                            break;
                        case 5:
                            edgeVert0 = 1;
                            edgeVert1 = 5;
                            break;
                        case 6:
                            edgeVert0 = 2;
                            edgeVert1 = 6;
                            break;
                        case 7:
                            edgeVert0 = 3;
                            edgeVert1 = 7;
                            break;
                        case 8:
                            edgeVert0 = 4;
                            edgeVert1 = 5;
                            break;
                        case 9:
                            edgeVert0 = 4;
                            edgeVert1 = 6;
                            break;
                        case 10:
                            edgeVert0 = 5;
                            edgeVert1 = 7;
                            break;
                        case 11:
                            edgeVert0 = 6;
                            edgeVert1 = 7;
                            break;
                        default:
                            btScalar_11.btAssert(false, `Invalid edge index: ${i}`);
                    }
                    this.getVertex(edgeVert0, pa);
                    this.getVertex(edgeVert1, pb);
                }
                /**
                 * Test if a point is inside the box (with tolerance)
                 */
                isInside(pt, tolerance) {
                    const halfExtents = this.getHalfExtentsWithoutMargin();
                    return (pt.x() <= (halfExtents.x() + tolerance)) &&
                        (pt.x() >= (-halfExtents.x() - tolerance)) &&
                        (pt.y() <= (halfExtents.y() + tolerance)) &&
                        (pt.y() >= (-halfExtents.y() - tolerance)) &&
                        (pt.z() <= (halfExtents.z() + tolerance)) &&
                        (pt.z() >= (-halfExtents.z() - tolerance));
                }
                /**
                 * Get shape name for debugging
                 */
                getName() {
                    return "Box";
                }
                /**
                 * Get number of preferred penetration directions
                 */
                getNumPreferredPenetrationDirections() {
                    return 6;
                }
                /**
                 * Get preferred penetration direction for the given index
                 */
                getPreferredPenetrationDirection(index, penetrationVector) {
                    switch (index) {
                        case 0:
                            penetrationVector.setValue(1, 0, 0);
                            break;
                        case 1:
                            penetrationVector.setValue(-1, 0, 0);
                            break;
                        case 2:
                            penetrationVector.setValue(0, 1, 0);
                            break;
                        case 3:
                            penetrationVector.setValue(0, -1, 0);
                            break;
                        case 4:
                            penetrationVector.setValue(0, 0, 1);
                            break;
                        case 5:
                            penetrationVector.setValue(0, 0, -1);
                            break;
                        default:
                            btScalar_11.btAssert(false, `Invalid penetration direction index: ${index}`);
                    }
                }
            };
            exports_32("btBoxShape", btBoxShape);
        }
    };
});
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
System.register("src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration", ["src/BulletCollision/CollisionDispatch/btCollisionConfiguration", "src/BulletCollision/BroadphaseCollision/btBroadphaseProxy"], function (exports_33, context_33) {
    "use strict";
    var btCollisionConfiguration_1, btBroadphaseProxy_5, btDefaultConvexPenetrationDepthSolver, btDefaultVoronoiSimplexSolver, btDefaultCollisionConfiguration;
    var __moduleName = context_33 && context_33.id;
    /**
     * Default construction info values
     */
    function createDefaultCollisionConstructionInfo() {
        return {
            m_persistentManifoldPool: undefined,
            m_collisionAlgorithmPool: undefined,
            m_defaultMaxPersistentManifoldPoolSize: 4096,
            m_defaultMaxCollisionAlgorithmPoolSize: 4096,
            m_customCollisionAlgorithmMaxElementSize: 0,
            m_useEpaPenetrationAlgorithm: true
        };
    }
    exports_33("createDefaultCollisionConstructionInfo", createDefaultCollisionConstructionInfo);
    return {
        setters: [
            function (btCollisionConfiguration_1_1) {
                btCollisionConfiguration_1 = btCollisionConfiguration_1_1;
            },
            function (btBroadphaseProxy_5_1) {
                btBroadphaseProxy_5 = btBroadphaseProxy_5_1;
            }
        ],
        execute: function () {/*
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
             * Default penetration depth solver implementation
             */
            btDefaultConvexPenetrationDepthSolver = class btDefaultConvexPenetrationDepthSolver {
            };
            exports_33("btDefaultConvexPenetrationDepthSolver", btDefaultConvexPenetrationDepthSolver);
            /**
             * Default Voronoi simplex solver implementation
             */
            btDefaultVoronoiSimplexSolver = class btDefaultVoronoiSimplexSolver {
            };
            exports_33("btDefaultVoronoiSimplexSolver", btDefaultVoronoiSimplexSolver);
            /**
             * btDefaultCollisionConfiguration provides setup for all the collision detection stacks, dispatchers
             * and registration of collision shapes
             */
            btDefaultCollisionConfiguration = class btDefaultCollisionConfiguration extends btCollisionConfiguration_1.btCollisionConfiguration {
                constructor(constructionInfo = createDefaultCollisionConstructionInfo()) {
                    super();
                    this.m_persistentManifoldPoolSize = constructionInfo.m_defaultMaxPersistentManifoldPoolSize;
                    // Initialize persistent manifold pool
                    if (constructionInfo.m_persistentManifoldPool) {
                        this.m_persistentManifoldPool = constructionInfo.m_persistentManifoldPool;
                        this.m_ownsPersistentManifoldPool = false;
                    }
                    else {
                        this.m_persistentManifoldPool = new btCollisionConfiguration_1.btDefaultPoolAllocator(constructionInfo.m_defaultMaxPersistentManifoldPoolSize, 16 // sizeof(btPersistentManifold) approximation
                        );
                        this.m_ownsPersistentManifoldPool = true;
                    }
                    // Initialize collision algorithm pool
                    if (constructionInfo.m_collisionAlgorithmPool) {
                        this.m_collisionAlgorithmPool = constructionInfo.m_collisionAlgorithmPool;
                        this.m_ownsCollisionAlgorithmPool = false;
                    }
                    else {
                        this.m_collisionAlgorithmPool = new btCollisionConfiguration_1.btDefaultPoolAllocator(constructionInfo.m_defaultMaxCollisionAlgorithmPoolSize, 32 // sizeof(collision algorithm) approximation
                        );
                        this.m_ownsCollisionAlgorithmPool = true;
                    }
                    // Initialize penetration depth solver
                    this.m_pdSolver = new btDefaultConvexPenetrationDepthSolver();
                    // Initialize collision algorithm create functions
                    this.m_convexConvexCreateFunc = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_convexConcaveCreateFunc = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_swappedConvexConcaveCreateFunc = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(true);
                    this.m_compoundCreateFunc = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_compoundCompoundCreateFunc = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_swappedCompoundCreateFunc = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(true);
                    this.m_emptyCreateFunc = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_sphereSphereCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_sphereBoxCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_boxSphereCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(true);
                    this.m_boxBoxCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_sphereTriangleCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_triangleSphereCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(true);
                    this.m_planeConvexCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(false);
                    this.m_convexPlaneCF = new btCollisionConfiguration_1.btDefaultCollisionAlgorithmCreateFunc(true);
                }
                /**
                 * Get persistent manifold pool
                 */
                getPersistentManifoldPool() {
                    return this.m_persistentManifoldPool;
                }
                /**
                 * Get collision algorithm pool
                 */
                getCollisionAlgorithmPool() {
                    return this.m_collisionAlgorithmPool;
                }
                /**
                 * Get collision algorithm create function for given proxy types
                 */
                getCollisionAlgorithmCreateFunc(proxyType0, proxyType1) {
                    // Simplified dispatch table - in the full implementation this would be a 2D array
                    // based on the BroadphaseNativeTypes
                    if (proxyType0 === btBroadphaseProxy_5.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE &&
                        proxyType1 === btBroadphaseProxy_5.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE) {
                        return this.m_sphereSphereCF;
                    }
                    if (proxyType0 === btBroadphaseProxy_5.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE &&
                        proxyType1 === btBroadphaseProxy_5.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE) {
                        return this.m_sphereBoxCF;
                    }
                    if (proxyType0 === btBroadphaseProxy_5.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE &&
                        proxyType1 === btBroadphaseProxy_5.BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE) {
                        return this.m_boxSphereCF;
                    }
                    if (proxyType0 === btBroadphaseProxy_5.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE &&
                        proxyType1 === btBroadphaseProxy_5.BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE) {
                        return this.m_boxBoxCF;
                    }
                    // Check for compound shapes
                    if (this.isCompound(proxyType0) && this.isCompound(proxyType1)) {
                        return this.m_compoundCompoundCreateFunc;
                    }
                    if (this.isCompound(proxyType0)) {
                        return this.m_compoundCreateFunc;
                    }
                    if (this.isCompound(proxyType1)) {
                        return this.m_swappedCompoundCreateFunc;
                    }
                    // Check for convex-concave combinations
                    if (this.isConvex(proxyType0) && this.isConcave(proxyType1)) {
                        return this.m_convexConcaveCreateFunc;
                    }
                    if (this.isConcave(proxyType0) && this.isConvex(proxyType1)) {
                        return this.m_swappedConvexConcaveCreateFunc;
                    }
                    // Default to convex-convex
                    if (this.isConvex(proxyType0) && this.isConvex(proxyType1)) {
                        return this.m_convexConvexCreateFunc;
                    }
                    // Fallback to empty algorithm
                    return this.m_emptyCreateFunc;
                }
                /**
                 * Get closest points algorithm create function for given proxy types
                 */
                getClosestPointsAlgorithmCreateFunc(proxyType0, proxyType1) {
                    // For now, use the same dispatch as collision detection
                    return this.getCollisionAlgorithmCreateFunc(proxyType0, proxyType1);
                }
                /**
                 * Configure convex-convex multipoint iterations
                 */
                setConvexConvexMultipointIterations(numPerturbationIterations = 3, minimumPointsPerturbationThreshold = 3) {
                    // This would configure the convex-convex algorithm for multiple contact points
                    // For now, this is a stub
                    console.log(`Setting convex-convex multipoint iterations: ${numPerturbationIterations}, threshold: ${minimumPointsPerturbationThreshold}`);
                }
                /**
                 * Configure plane-convex multipoint iterations
                 */
                setPlaneConvexMultipointIterations(numPerturbationIterations = 3, minimumPointsPerturbationThreshold = 3) {
                    // This would configure the plane-convex algorithm for multiple contact points
                    // For now, this is a stub
                    console.log(`Setting plane-convex multipoint iterations: ${numPerturbationIterations}, threshold: ${minimumPointsPerturbationThreshold}`);
                }
                /**
                 * Helper method to check if a proxy type is convex
                 */
                isConvex(proxyType) {
                    return proxyType < btBroadphaseProxy_5.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE;
                }
                /**
                 * Helper method to check if a proxy type is concave
                 */
                isConcave(proxyType) {
                    return proxyType > btBroadphaseProxy_5.BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE &&
                        proxyType < btBroadphaseProxy_5.BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;
                }
                /**
                 * Helper method to check if a proxy type is compound
                 */
                isCompound(proxyType) {
                    return proxyType === btBroadphaseProxy_5.BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;
                }
            };
            exports_33("btDefaultCollisionConfiguration", btDefaultCollisionConfiguration);
        }
    };
});
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
System.register("src/BulletCollision/BroadphaseCollision/btDbvtBroadphase", ["src/BulletCollision/BroadphaseCollision/btBroadphaseInterface", "src/BulletCollision/BroadphaseCollision/btBroadphaseProxy"], function (exports_34, context_34) {
    "use strict";
    var btBroadphaseInterface_1, btBroadphaseProxy_6, btDbvtProxy, btDbvtBroadphase;
    var __moduleName = context_34 && context_34.id;
    return {
        setters: [
            function (btBroadphaseInterface_1_1) {
                btBroadphaseInterface_1 = btBroadphaseInterface_1_1;
            },
            function (btBroadphaseProxy_6_1) {
                btBroadphaseProxy_6 = btBroadphaseProxy_6_1;
            }
        ],
        execute: function () {/*
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
             * Proxy for DBVT broadphase
             */
            btDbvtProxy = class btDbvtProxy extends btBroadphaseProxy_6.btBroadphaseProxy {
                constructor(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask) {
                    super(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask);
                    this.leaf = null;
                    this.links = [null, null];
                    this.stage = 0;
                }
            };
            exports_34("btDbvtProxy", btDbvtProxy);
            /**
             * Basic stub implementation of btDbvtBroadphase
             * This is a minimal implementation to get BasicDemo working.
             * The full DBVT implementation would be quite complex and can be enhanced later.
             */
            btDbvtBroadphase = class btDbvtBroadphase extends btBroadphaseInterface_1.btBroadphaseInterface {
                constructor(paircache) {
                    super();
                    // For now, we'll use simple arrays instead of full DBVT trees
                    this.m_proxies = [];
                    this.m_paircache = null;
                    this.m_prediction = 0;
                    this.m_newpairs = 0;
                    this._m_stageCurrent = 0;
                    this._m_needcleanup = false;
                    this.m_paircache = paircache || null;
                }
                createProxy(aabbMin, aabbMax, _shapeType, userPtr, collisionFilterGroup, collisionFilterMask, _dispatcher) {
                    const proxy = new btDbvtProxy(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask);
                    // Simple implementation: just add to array
                    this.m_proxies.push(proxy);
                    return proxy;
                }
                destroyProxy(proxy, _dispatcher) {
                    const dbvtProxy = proxy;
                    const index = this.m_proxies.indexOf(dbvtProxy);
                    if (index !== -1) {
                        this.m_proxies.splice(index, 1);
                    }
                }
                setAabb(proxy, aabbMin, aabbMax, _dispatcher) {
                    // Update the proxy's AABB
                    proxy.m_aabbMin.copy(aabbMin);
                    proxy.m_aabbMax.copy(aabbMax);
                    // In a full implementation, this would update the DBVT tree
                }
                getAabb(proxy, aabbMin, aabbMax) {
                    aabbMin.copy(proxy.m_aabbMin);
                    aabbMax.copy(proxy.m_aabbMax);
                }
                rayTest(_rayFrom, _rayTo, rayCallback, _aabbMin, _aabbMax) {
                    // Basic ray test implementation
                    // In a full implementation, this would traverse the DBVT tree efficiently
                    for (const proxy of this.m_proxies) {
                        // Simple AABB-ray intersection test would go here
                        // For now, just call the callback for all proxies
                        if (!rayCallback.process(proxy)) {
                            break;
                        }
                    }
                }
                aabbTest(_aabbMin, _aabbMax, callback) {
                    // Basic AABB test implementation
                    for (const proxy of this.m_proxies) {
                        // Simple AABB-AABB intersection test would go here
                        // For now, just call the callback for all proxies
                        if (!callback.process(proxy)) {
                            break;
                        }
                    }
                }
                calculateOverlappingPairs(_dispatcher) {
                    // Simple O(n²) collision detection
                    // In a full implementation, this would use the DBVT for efficient culling
                    this.m_newpairs = 0;
                    for (let i = 0; i < this.m_proxies.length; i++) {
                        for (let j = i + 1; j < this.m_proxies.length; j++) {
                            const proxy0 = this.m_proxies[i];
                            const proxy1 = this.m_proxies[j];
                            // Check if AABBs overlap
                            if (this.testAabbAgainstAabb2(proxy0, proxy1)) {
                                // In a full implementation, we would add to pair cache
                                this.m_newpairs++;
                            }
                        }
                    }
                }
                getOverlappingPairCache() {
                    return this.m_paircache;
                }
                getOverlappingPairCacheConst() {
                    return this.m_paircache;
                }
                getBroadphaseAabb(aabbMin, aabbMax) {
                    // Calculate bounding box of all proxies
                    if (this.m_proxies.length === 0) {
                        aabbMin.setValue(-1000, -1000, -1000);
                        aabbMax.setValue(1000, 1000, 1000);
                        return;
                    }
                    aabbMin.copy(this.m_proxies[0].m_aabbMin);
                    aabbMax.copy(this.m_proxies[0].m_aabbMax);
                    for (const proxy of this.m_proxies) {
                        aabbMin.setMin(proxy.m_aabbMin);
                        aabbMax.setMax(proxy.m_aabbMax);
                    }
                }
                resetPool(_dispatcher) {
                    // Reset internal structures
                    this._m_stageCurrent = 0;
                    this._m_needcleanup = false;
                }
                printStats() {
                    console.log(`btDbvtBroadphase stats: ${this.m_proxies.length} proxies, ${this.m_newpairs} new pairs`);
                }
                // Additional methods specific to btDbvtBroadphase
                setVelocityPrediction(prediction) {
                    this.m_prediction = prediction;
                }
                getVelocityPrediction() {
                    return this.m_prediction;
                }
                performDeferredRemoval(_dispatcher) {
                    // Placeholder for deferred removal logic
                }
                collide(dispatcher) {
                    // Placeholder for main collision detection logic
                    this.calculateOverlappingPairs(dispatcher);
                }
                optimize() {
                    // Placeholder for tree optimization
                }
                // Helper method to test AABB overlap
                testAabbAgainstAabb2(proxy0, proxy1) {
                    return proxy0.m_aabbMin.x() <= proxy1.m_aabbMax.x() &&
                        proxy1.m_aabbMin.x() <= proxy0.m_aabbMax.x() &&
                        proxy0.m_aabbMin.y() <= proxy1.m_aabbMax.y() &&
                        proxy1.m_aabbMin.y() <= proxy0.m_aabbMax.y() &&
                        proxy0.m_aabbMin.z() <= proxy1.m_aabbMax.z() &&
                        proxy1.m_aabbMin.z() <= proxy0.m_aabbMax.z();
                }
            };
            exports_34("btDbvtBroadphase", btDbvtBroadphase);
        }
    };
});
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
System.register("src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver", ["src/BulletDynamics/ConstraintSolver/btConstraintSolver"], function (exports_35, context_35) {
    "use strict";
    var btConstraintSolver_1, btSequentialImpulseConstraintSolver;
    var __moduleName = context_35 && context_35.id;
    return {
        setters: [
            function (btConstraintSolver_1_1) {
                btConstraintSolver_1 = btConstraintSolver_1_1;
            }
        ],
        execute: function () {/*
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
             * Basic stub implementation of btSequentialImpulseConstraintSolver
             * This is a minimal implementation to get BasicDemo working.
             * The full constraint solver implementation would be quite complex and can be enhanced later.
             */
            btSequentialImpulseConstraintSolver = class btSequentialImpulseConstraintSolver extends btConstraintSolver_1.btConstraintSolver {
                constructor() {
                    super();
                    // Internal solver data structures (simplified for stub implementation)
                    this.m_tmpSolverBodyPool = [];
                    this.m_tmpSolverContactConstraintPool = [];
                    this._m_maxOverrideNumSolverIterations = 0;
                    this._m_fixedBodyId = -1;
                    this.m_btSeed2 = 0;
                    this.m_leastSquaresResidual = 0;
                    this._m_cachedSolverMode = 0;
                    this.m_analyticsData = {
                        m_numSolverCalls: 0,
                        m_numIterationsUsed: -1,
                        m_remainingLeastSquaresResidual: -1,
                        m_islandId: -2,
                        m_numBodies: 0,
                        m_numContactManifolds: 0
                    };
                    this.reset();
                }
                solveGroup(bodies, numBodies, _manifolds, numManifolds, _constraints, _numConstraints, info, _debugDrawer, _dispatcher) {
                    // Basic stub implementation
                    // In a real implementation, this would:
                    // 1. Convert bodies to solver bodies
                    // 2. Convert contacts to solver constraints
                    // 3. Convert joints to solver constraints  
                    // 4. Solve the system iteratively
                    // 5. Write results back to bodies
                    this.m_analyticsData.m_numSolverCalls++;
                    this.m_analyticsData.m_numBodies = numBodies;
                    this.m_analyticsData.m_numContactManifolds = numManifolds;
                    // For the stub, we'll just do a simple integration step
                    const timeStep = info.m_timeStep;
                    for (let i = 0; i < numBodies; i++) {
                        const body = bodies[i];
                        // Apply basic integration (this is highly simplified)
                        // In reality, the solver would handle constraints, contacts, friction, etc.
                        this.integrateBody(body, timeStep);
                    }
                    this.m_analyticsData.m_numIterationsUsed = info.m_numIterations;
                    this.m_leastSquaresResidual = 0.0; // Stub value
                    return this.m_leastSquaresResidual;
                }
                reset() {
                    // Clear internal cached data and reset random seed
                    this.m_tmpSolverBodyPool.length = 0;
                    this.m_tmpSolverContactConstraintPool.length = 0;
                    this.m_btSeed2 = 0;
                    this.m_leastSquaresResidual = 0;
                    // Reset analytics
                    this.m_analyticsData.m_numSolverCalls = 0;
                    this.m_analyticsData.m_numIterationsUsed = -1;
                    this.m_analyticsData.m_remainingLeastSquaresResidual = -1;
                    this.m_analyticsData.m_islandId = -2;
                    this.m_analyticsData.m_numBodies = 0;
                    this.m_analyticsData.m_numContactManifolds = 0;
                }
                getSolverType() {
                    return btConstraintSolver_1.btConstraintSolverType.BT_SEQUENTIAL_IMPULSE_SOLVER;
                }
                // Additional methods for solver control
                setRandSeed(seed) {
                    this.m_btSeed2 = seed;
                }
                getRandSeed() {
                    return this.m_btSeed2;
                }
                // Simple pseudo-random number generator (for consistency with C++ version)
                btRand2() {
                    this.m_btSeed2 = (1664525 * this.m_btSeed2 + 1013904223) & 0xffffffff;
                    return this.m_btSeed2;
                }
                btRandInt2(n) {
                    // High-order bits are more random
                    return Math.floor((this.btRand2() / 0x100000000) * n);
                }
                // Helper method for basic body integration (very simplified)
                integrateBody(body, _timeStep) {
                    // This is a very basic stub - real implementation would be much more complex
                    // and would handle forces, velocities, constraints, contacts, etc.
                    // For now, we'll just do basic position integration if this is a dynamic body
                    // In a full implementation, this logic would be distributed across many methods
                    // Skip static bodies
                    if (body.isStaticObject()) {
                        return;
                    }
                    // Apply gravity and integrate (this is extremely simplified)
                    // Real implementation would handle forces, impulses, constraints, etc.
                    // This stub implementation doesn't actually modify the body
                    // because we'd need proper force/velocity/mass handling
                }
            };
            exports_35("btSequentialImpulseConstraintSolver", btSequentialImpulseConstraintSolver);
        }
    };
});
/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2015 Google Inc. http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/
System.register("examples/BasicDemo/BasicExample", ["src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld", "src/BulletDynamics/Dynamics/btRigidBody", "src/LinearMath/btVector3", "src/LinearMath/btTransform", "src/BulletCollision/CollisionShapes/btBoxShape", "src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration", "src/BulletCollision/CollisionDispatch/btCollisionDispatcher", "src/BulletCollision/BroadphaseCollision/btDbvtBroadphase", "src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver"], function (exports_36, context_36) {
    "use strict";
    var btDiscreteDynamicsWorld_1, btRigidBody_2, btVector3_19, btTransform_7, btBoxShape_1, btDefaultCollisionConfiguration_1, btCollisionDispatcher_1, btDbvtBroadphase_1, btSequentialImpulseConstraintSolver_1, btRigidBody_3, ARRAY_SIZE_Y, ARRAY_SIZE_X, ARRAY_SIZE_Z, BasicExample;
    var __moduleName = context_36 && context_36.id;
    return {
        setters: [
            function (btDiscreteDynamicsWorld_1_1) {
                btDiscreteDynamicsWorld_1 = btDiscreteDynamicsWorld_1_1;
            },
            function (btRigidBody_2_1) {
                btRigidBody_2 = btRigidBody_2_1;
                btRigidBody_3 = btRigidBody_2_1;
            },
            function (btVector3_19_1) {
                btVector3_19 = btVector3_19_1;
            },
            function (btTransform_7_1) {
                btTransform_7 = btTransform_7_1;
            },
            function (btBoxShape_1_1) {
                btBoxShape_1 = btBoxShape_1_1;
            },
            function (btDefaultCollisionConfiguration_1_1) {
                btDefaultCollisionConfiguration_1 = btDefaultCollisionConfiguration_1_1;
            },
            function (btCollisionDispatcher_1_1) {
                btCollisionDispatcher_1 = btCollisionDispatcher_1_1;
            },
            function (btDbvtBroadphase_1_1) {
                btDbvtBroadphase_1 = btDbvtBroadphase_1_1;
            },
            function (btSequentialImpulseConstraintSolver_1_1) {
                btSequentialImpulseConstraintSolver_1 = btSequentialImpulseConstraintSolver_1_1;
            }
        ],
        execute: function () {/*
            Bullet Continuous Collision Detection and Physics Library
            Copyright (c) 2015 Google Inc. http://bulletphysics.org
            
            This software is provided 'as-is', without any express or implied warranty.
            In no event will the authors be held liable for any damages arising from the use of this software.
            Permission is granted to anyone to use this software for any purpose,
            including commercial applications, and to alter it and redistribute it freely,
            subject to the following restrictions:
            
            1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
            2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
            3. This notice may not be removed or altered from any source distribution.
            */
            ARRAY_SIZE_Y = 5;
            ARRAY_SIZE_X = 5;
            ARRAY_SIZE_Z = 5;
            BasicExample = class BasicExample {
                constructor() {
                    this.m_dynamicsWorld = null;
                    this.m_collisionShapes = [];
                    this.m_broadphase = null;
                    this.m_dispatcher = null;
                    this.m_solver = null;
                    this.m_collisionConfiguration = null;
                }
                initPhysics() {
                    this.createEmptyDynamicsWorld();
                    if (!this.m_dynamicsWorld) {
                        throw new Error("Failed to create dynamics world");
                    }
                    // Create ground
                    const groundShape = new btBoxShape_1.btBoxShape(new btVector3_19.btVector3(50, 50, 50));
                    this.m_collisionShapes.push(groundShape);
                    const groundTransform = new btTransform_7.btTransform();
                    groundTransform.setIdentity();
                    groundTransform.setOrigin(new btVector3_19.btVector3(0, -50, 0));
                    // Create ground rigid body (mass = 0 means static)
                    const groundMass = 0;
                    this.createRigidBody(groundMass, groundTransform, groundShape);
                    // Create dynamic objects
                    const colShape = new btBoxShape_1.btBoxShape(new btVector3_19.btVector3(0.1, 0.1, 0.1));
                    this.m_collisionShapes.push(colShape);
                    const startTransform = new btTransform_7.btTransform();
                    startTransform.setIdentity();
                    const mass = 1.0;
                    // Create a stack of boxes
                    for (let k = 0; k < ARRAY_SIZE_Y; k++) {
                        for (let i = 0; i < ARRAY_SIZE_X; i++) {
                            for (let j = 0; j < ARRAY_SIZE_Z; j++) {
                                startTransform.setOrigin(new btVector3_19.btVector3(0.2 * i, 2 + 0.2 * k, 0.2 * j));
                                this.createRigidBody(mass, startTransform, colShape);
                            }
                        }
                    }
                    console.log("BasicExample physics initialized");
                    console.log(`Created ${this.m_dynamicsWorld.getNumCollisionObjects()} collision objects`);
                }
                stepSimulation(timeStep) {
                    if (this.m_dynamicsWorld) {
                        this.m_dynamicsWorld.stepSimulation(timeStep, 10);
                    }
                }
                exitPhysics() {
                    // Clean up in reverse order of creation
                    if (this.m_dynamicsWorld) {
                        // Remove the rigidbodies from the dynamics world and delete them
                        for (let i = this.m_dynamicsWorld.getNumCollisionObjects() - 1; i >= 0; i--) {
                            const obj = this.m_dynamicsWorld.getCollisionObjectArray()[i];
                            const body = obj;
                            if (body && body.getMotionState()) {
                                // delete body.getMotionState(); // In TypeScript, just set to null
                                body.setMotionState(null);
                            }
                            this.m_dynamicsWorld.removeCollisionObject(obj);
                            // delete obj; // GC handles this in TypeScript
                        }
                    }
                    // Delete collision shapes
                    this.m_collisionShapes.length = 0;
                    this.m_dynamicsWorld = null;
                    this.m_solver = null;
                    this.m_broadphase = null;
                    this.m_dispatcher = null;
                    this.m_collisionConfiguration = null;
                    console.log("BasicExample physics cleaned up");
                }
                getDynamicsWorld() {
                    return this.m_dynamicsWorld;
                }
                createEmptyDynamicsWorld() {
                    // Collision configuration contains default setup for memory, collision setup
                    this.m_collisionConfiguration = new btDefaultCollisionConfiguration_1.btDefaultCollisionConfiguration();
                    // Use the default collision dispatcher
                    this.m_dispatcher = new btCollisionDispatcher_1.btCollisionDispatcher(this.m_collisionConfiguration);
                    // btDbvtBroadphase is a good general purpose broadphase
                    this.m_broadphase = new btDbvtBroadphase_1.btDbvtBroadphase();
                    // The default constraint solver
                    this.m_solver = new btSequentialImpulseConstraintSolver_1.btSequentialImpulseConstraintSolver();
                    this.m_dynamicsWorld = new btDiscreteDynamicsWorld_1.btDiscreteDynamicsWorld(this.m_dispatcher, this.m_broadphase, this.m_solver, this.m_collisionConfiguration);
                    this.m_dynamicsWorld.setGravity(new btVector3_19.btVector3(0, -10, 0));
                }
                createRigidBody(mass, startTransform, shape) {
                    if (!this.m_dynamicsWorld) {
                        return null;
                    }
                    const isDynamic = (mass !== 0.0);
                    let localInertia = new btVector3_19.btVector3(0, 0, 0);
                    if (isDynamic) {
                        shape.calculateLocalInertia(mass, localInertia);
                    }
                    // Using motionstate is optional, it provides interpolation capabilities
                    // and only synchronizes 'active' objects
                    const myMotionState = null; // For simplicity, skip motion state for now
                    const rbInfo = new btRigidBody_3.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
                    rbInfo.m_startWorldTransform = startTransform;
                    const body = new btRigidBody_2.btRigidBody(rbInfo);
                    this.m_dynamicsWorld.addRigidBody(body);
                    return body;
                }
            };
            exports_36("BasicExample", BasicExample);
        }
    };
});
/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2015 Google Inc. http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/
System.register("examples/BasicDemo/main", ["examples/BasicDemo/BasicExample"], function (exports_37, context_37) {
    "use strict";
    var BasicExample_1, BrowserDemo;
    var __moduleName = context_37 && context_37.id;
    return {
        setters: [
            function (BasicExample_1_1) {
                BasicExample_1 = BasicExample_1_1;
            }
        ],
        execute: function () {/*
            Bullet Continuous Collision Detection and Physics Library
            Copyright (c) 2015 Google Inc. http://bulletphysics.org
            
            This software is provided 'as-is', without any express or implied warranty.
            In no event will the authors be held liable for any damages arising from the use of this software.
            Permission is granted to anyone to use this software for any purpose,
            including commercial applications, and to alter it and redistribute it freely,
            subject to the following restrictions:
            
            1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
            2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
            3. This notice may not be removed or altered from any source distribution.
            */
            BrowserDemo = class BrowserDemo {
                constructor() {
                    this.isRunning = false;
                    this.frameCount = 0;
                    this.lastTime = 0;
                    this.example = new BasicExample_1.BasicExample();
                    this.setupUI();
                }
                setupUI() {
                    const container = document.getElementById('demo-container') || document.body;
                    // Create control panel
                    const controlPanel = document.createElement('div');
                    controlPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
        `;
                    const title = document.createElement('h3');
                    title.textContent = 'Bullet3 Basic Demo (TypeScript)';
                    title.style.margin = '0 0 10px 0';
                    controlPanel.appendChild(title);
                    const startBtn = document.createElement('button');
                    startBtn.textContent = 'Start Simulation';
                    startBtn.onclick = () => this.startSimulation();
                    controlPanel.appendChild(startBtn);
                    const stopBtn = document.createElement('button');
                    stopBtn.textContent = 'Stop Simulation';
                    stopBtn.onclick = () => this.stopSimulation();
                    stopBtn.style.marginLeft = '10px';
                    controlPanel.appendChild(stopBtn);
                    const resetBtn = document.createElement('button');
                    resetBtn.textContent = 'Reset';
                    resetBtn.onclick = () => this.resetSimulation();
                    resetBtn.style.marginLeft = '10px';
                    controlPanel.appendChild(resetBtn);
                    const infoDiv = document.createElement('div');
                    infoDiv.id = 'info';
                    infoDiv.style.marginTop = '10px';
                    controlPanel.appendChild(infoDiv);
                    container.appendChild(controlPanel);
                    // Create output area
                    const outputArea = document.createElement('div');
                    outputArea.id = 'output';
                    outputArea.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            height: 200px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 11px;
            overflow-y: auto;
            border-radius: 5px;
        `;
                    container.appendChild(outputArea);
                    this.log('Basic Demo initialized. Click Start to begin simulation.');
                }
                log(message) {
                    const output = document.getElementById('output');
                    if (output) {
                        const time = new Date().toLocaleTimeString();
                        output.innerHTML += `[${time}] ${message}<br>`;
                        output.scrollTop = output.scrollHeight;
                    }
                    console.log(message);
                }
                updateInfo() {
                    const info = document.getElementById('info');
                    if (info && this.example.getDynamicsWorld()) {
                        const world = this.example.getDynamicsWorld();
                        info.innerHTML = `
                <div>Frame: ${this.frameCount}</div>
                <div>Objects: ${world.getNumCollisionObjects()}</div>
                <div>Status: ${this.isRunning ? 'Running' : 'Stopped'}</div>
            `;
                    }
                }
                startSimulation() {
                    if (!this.isRunning) {
                        this.log('Initializing physics...');
                        try {
                            this.example.initPhysics();
                            this.isRunning = true;
                            this.frameCount = 0;
                            this.lastTime = performance.now();
                            this.log('Physics initialized successfully');
                            this.simulationLoop();
                        }
                        catch (error) {
                            this.log(`Error initializing physics: ${error}`);
                            console.error(error);
                        }
                    }
                }
                stopSimulation() {
                    if (this.isRunning) {
                        this.isRunning = false;
                        this.log('Simulation stopped');
                    }
                }
                resetSimulation() {
                    this.stopSimulation();
                    this.log('Cleaning up physics...');
                    try {
                        this.example.exitPhysics();
                        this.log('Physics cleaned up');
                        this.frameCount = 0;
                        this.updateInfo();
                    }
                    catch (error) {
                        this.log(`Error cleaning up physics: ${error}`);
                        console.error(error);
                    }
                }
                simulationLoop() {
                    if (!this.isRunning)
                        return;
                    const currentTime = performance.now();
                    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
                    this.lastTime = currentTime;
                    try {
                        // Step the simulation
                        this.example.stepSimulation(Math.min(deltaTime, 1 / 30)); // Cap at 30fps for stability
                        this.frameCount++;
                        // Update info every 60 frames
                        if (this.frameCount % 60 === 0) {
                            this.updateInfo();
                            this.logObjectPositions();
                        }
                    }
                    catch (error) {
                        this.log(`Simulation error: ${error}`);
                        console.error(error);
                        this.stopSimulation();
                        return;
                    }
                    // Continue the loop
                    requestAnimationFrame(() => this.simulationLoop());
                }
                logObjectPositions() {
                    const world = this.example.getDynamicsWorld();
                    if (!world)
                        return;
                    const objects = world.getCollisionObjectArray();
                    const dynamicObjects = objects.filter((obj, index) => {
                        const body = obj;
                        return body && body.getMass && body.getMass() > 0;
                    });
                    if (dynamicObjects.length > 0) {
                        // Log first few dynamic objects
                        const samplesToLog = Math.min(3, dynamicObjects.length);
                        let positionInfo = `Dynamic object positions (first ${samplesToLog}): `;
                        for (let i = 0; i < samplesToLog; i++) {
                            const body = dynamicObjects[i];
                            const transform = body.getWorldTransform();
                            const origin = transform.getOrigin();
                            positionInfo += `[${i}](${origin.x().toFixed(2)}, ${origin.y().toFixed(2)}, ${origin.z().toFixed(2)}) `;
                        }
                        this.log(positionInfo);
                    }
                }
            };
            // Initialize when DOM is ready
            document.addEventListener('DOMContentLoaded', () => {
                new BrowserDemo();
            });
            // Handle page unload
            window.addEventListener('beforeunload', () => {
                // Any cleanup if needed
            });
        }
    };
});
