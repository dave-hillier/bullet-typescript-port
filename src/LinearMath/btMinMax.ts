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
export function btMin<T>(a: T, b: T): T {
    return a < b ? a : b;
}

/**
 * Returns the maximum of two values
 * @param a First value
 * @param b Second value
 * @returns The larger of the two values
 */
export function btMax<T>(a: T, b: T): T {
    return a > b ? a : b;
}

/**
 * Clamps a value between lower and upper bounds
 * @param a Value to clamp
 * @param lb Lower bound
 * @param ub Upper bound
 * @returns The clamped value
 */
export function btClamped<T>(a: T, lb: T, ub: T): T {
    return a < lb ? lb : (ub < a ? ub : a);
}

/**
 * Sets the first value to the minimum of the two values (modifies the first parameter)
 * @param a Object with a value property to potentially modify
 * @param b Value to compare against
 */
export function btSetMin<T>(a: { value: T }, b: T): void {
    if (b < a.value) {
        a.value = b;
    }
}

/**
 * Sets the first value to the maximum of the two values (modifies the first parameter)
 * @param a Object with a value property to potentially modify
 * @param b Value to compare against
 */
export function btSetMax<T>(a: { value: T }, b: T): void {
    if (a.value < b) {
        a.value = b;
    }
}

/**
 * Clamps the first value between the bounds (modifies the first parameter)
 * @param a Object with a value property to potentially modify
 * @param lb Lower bound
 * @param ub Upper bound
 */
export function btClamp<T>(a: { value: T }, lb: T, ub: T): void {
    if (a.value < lb) {
        a.value = lb;
    } else if (ub < a.value) {
        a.value = ub;
    }
}