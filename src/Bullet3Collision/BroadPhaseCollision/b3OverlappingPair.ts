/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2013 Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { b3Int4 } from '../../Bullet3Common/shared/b3Int4';

/**
 * Marker constants for pair tracking
 */
export const B3_NEW_PAIR_MARKER = -1;
export const B3_REMOVED_PAIR_MARKER = -2;

/**
 * Type alias for broadphase pairs, which are represented as b3Int4
 * where:
 * - x and y contain the indices of the two colliding objects
 * - z and w are used for internal bookkeeping (markers, etc.)
 */
export type b3BroadphasePair = b3Int4;

/**
 * Creates a broadphase pair from two object indices
 * @param xx First object index
 * @param yy Second object index
 * @returns A new b3BroadphasePair with indices sorted and markers initialized
 */
export function b3MakeBroadphasePair(xx: number, yy: number): b3BroadphasePair {
    const pair = new b3Int4();

    if (xx < yy) {
        pair.x = xx;
        pair.y = yy;
    } else {
        pair.x = yy;
        pair.y = xx;
    }
    pair.z = B3_NEW_PAIR_MARKER;
    pair.w = B3_NEW_PAIR_MARKER;
    
    return pair;
}

/**
 * Sort predicate for broadphase pairs
 * Orders pairs first by x component, then by y component in descending order
 */
export class b3BroadphasePairSortPredicate {
    /**
     * Compare two broadphase pairs for sorting
     * @param a First pair
     * @param b Second pair
     * @returns true if a should come before b in sorted order
     */
    public compare(a: b3BroadphasePair, b: b3BroadphasePair): boolean {
        const uidA0 = a.x;
        const uidB0 = b.x;
        const uidA1 = a.y;
        const uidB1 = b.y;
        return uidA0 > uidB0 || (uidA0 === uidB0 && uidA1 > uidB1);
    }

    /**
     * Function call operator for compatibility with sort functions
     * @param a First pair
     * @param b Second pair
     * @returns true if a should come before b in sorted order
     */
    public operator(a: b3BroadphasePair, b: b3BroadphasePair): boolean {
        return this.compare(a, b);
    }
}

/**
 * Check if two broadphase pairs are equal
 * Two pairs are equal if their x and y components match
 * @param a First pair
 * @param b Second pair
 * @returns true if the pairs represent the same object pair
 */
export function b3BroadphasePairEquals(a: b3BroadphasePair, b: b3BroadphasePair): boolean {
    return (a.x === b.x) && (a.y === b.y);
}

/**
 * Utility functions for working with broadphase pairs
 */
export namespace b3BroadphasePairUtils {
    /**
     * Get the first object index from a pair
     * @param pair The broadphase pair
     * @returns The first object index (always the smaller of the two)
     */
    export function getFirstIndex(pair: b3BroadphasePair): number {
        return pair.x;
    }

    /**
     * Get the second object index from a pair
     * @param pair The broadphase pair
     * @returns The second object index (always the larger of the two)
     */
    export function getSecondIndex(pair: b3BroadphasePair): number {
        return pair.y;
    }

    /**
     * Get the pair marker/status
     * @param pair The broadphase pair
     * @returns The marker value stored in the z component
     */
    export function getMarker(pair: b3BroadphasePair): number {
        return pair.z;
    }

    /**
     * Set the pair marker/status
     * @param pair The broadphase pair
     * @param marker The marker value to set
     */
    export function setMarker(pair: b3BroadphasePair, marker: number): void {
        pair.z = marker;
    }

    /**
     * Check if a pair is marked as new
     * @param pair The broadphase pair
     * @returns true if the pair is marked as new
     */
    export function isNewPair(pair: b3BroadphasePair): boolean {
        return pair.z === B3_NEW_PAIR_MARKER;
    }

    /**
     * Check if a pair is marked as removed
     * @param pair The broadphase pair
     * @returns true if the pair is marked as removed
     */
    export function isRemovedPair(pair: b3BroadphasePair): boolean {
        return pair.z === B3_REMOVED_PAIR_MARKER;
    }
}