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
 * TypeScript port of Bullet3Common/b3MinMax.h
 * Min/max utility functions for the Bullet3 physics engine
 */

import { b3Scalar } from './b3Scalar';

/**
 * Return the minimum of two values
 */
export function b3Min<T>(a: T, b: T): T {
    return a < b ? a : b;
}

/**
 * Return the maximum of two values
 */
export function b3Max<T>(a: T, b: T): T {
    return a > b ? a : b;
}

/**
 * Clamp a value between lower and upper bounds
 */
export function b3Clamped<T>(a: T, lb: T, ub: T): T {
    return a < lb ? lb : (ub < a ? ub : a);
}

/**
 * Set the first value to the minimum of the two values
 */
export function b3SetMin<T>(a: { value: T }, b: T): void {
    if (b < a.value) {
        a.value = b;
    }
}

/**
 * Set the first value to the maximum of the two values
 */
export function b3SetMax<T>(a: { value: T }, b: T): void {
    if (a.value < b) {
        a.value = b;
    }
}

/**
 * Clamp the first value between lower and upper bounds (in-place)
 */
export function b3Clamp<T>(a: { value: T }, lb: T, ub: T): void {
    if (a.value < lb) {
        a.value = lb;
    } else if (ub < a.value) {
        a.value = ub;
    }
}

/**
 * Specialized versions for b3Scalar (number)
 */
export function b3MinScalar(a: b3Scalar, b: b3Scalar): b3Scalar {
    return Math.min(a, b);
}

export function b3MaxScalar(a: b3Scalar, b: b3Scalar): b3Scalar {
    return Math.max(a, b);
}

export function b3ClampedScalar(a: b3Scalar, lb: b3Scalar, ub: b3Scalar): b3Scalar {
    return Math.max(lb, Math.min(ub, a));
}