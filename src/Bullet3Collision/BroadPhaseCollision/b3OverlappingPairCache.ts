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

import { b3BroadphasePair, b3MakeBroadphasePair } from './b3OverlappingPair';
import { b3AlignedObjectArray } from '../../Bullet3Common/b3AlignedObjectArray';
import { b3Assert } from '../../Bullet3Common/b3Scalar';

/**
 * Type alias for array of broadphase pairs
 */
export type b3BroadphasePairArray = b3AlignedObjectArray<b3BroadphasePair>;

/**
 * Forward declaration for dispatcher
 */
export interface b3Dispatcher {
    // Interface will be defined in dispatch module
}

/**
 * Callback interface for processing overlapping pairs
 */
export interface b3OverlapCallback {
    /**
     * Process an overlapping pair
     * @param pair The broadphase pair to process
     * @returns true if the pair should be deleted
     */
    processOverlap(pair: b3BroadphasePair): boolean;
}

/**
 * Callback interface for filtering which pairs need collision detection
 */
export interface b3OverlapFilterCallback {
    /**
     * Determine if two proxies need broadphase collision detection
     * @param proxy0 First proxy index
     * @param proxy1 Second proxy index
     * @returns true when pairs need collision
     */
    needBroadphaseCollision(proxy0: number, proxy1: number): boolean;
}

/**
 * Global counters for debugging pair management
 */
export let b3g_removePairs = 0;
export let b3g_addedPairs = 0;
export let b3g_findPairs = 0;

/**
 * Null pair constant
 */
export const B3_NULL_PAIR = 0xffffffff;

/**
 * Abstract base class providing an interface for overlapping pair management.
 * The b3HashedOverlappingPairCache and b3SortedOverlappingPairCache classes are two implementations.
 */
export abstract class b3OverlappingPairCache {
    /**
     * Get pointer to the overlapping pair array
     */
    abstract getOverlappingPairArrayPtr(): b3BroadphasePair[] | null;

    /**
     * Get const pointer to the overlapping pair array
     */
    abstract getOverlappingPairArrayPtrConst(): readonly b3BroadphasePair[] | null;

    /**
     * Get reference to the overlapping pair array
     */
    abstract getOverlappingPairArray(): b3BroadphasePairArray;

    /**
     * Clean an overlapping pair
     * @param pair The pair to clean
     * @param dispatcher The collision dispatcher
     */
    abstract cleanOverlappingPair(pair: b3BroadphasePair, dispatcher: b3Dispatcher | null): void;

    /**
     * Get the number of overlapping pairs
     */
    abstract getNumOverlappingPairs(): number;

    /**
     * Clean all pairs containing a specific proxy
     * @param proxy The proxy index to clean
     * @param dispatcher The collision dispatcher
     */
    abstract cleanProxyFromPairs(proxy: number, dispatcher: b3Dispatcher | null): void;

    /**
     * Set the overlap filter callback
     * @param callback The filter callback to set
     */
    abstract setOverlapFilterCallback(callback: b3OverlapFilterCallback | null): void;

    /**
     * Process all overlapping pairs with a callback
     * @param callback The overlap callback
     * @param dispatcher The collision dispatcher
     */
    abstract processAllOverlappingPairs(callback: b3OverlapCallback | null, dispatcher: b3Dispatcher | null): void;

    /**
     * Find a specific pair
     * @param proxy0 First proxy index
     * @param proxy1 Second proxy index
     * @returns The pair if found, null otherwise
     */
    abstract findPair(proxy0: number, proxy1: number): b3BroadphasePair | null;

    /**
     * Check if this cache has deferred removal
     */
    abstract hasDeferredRemoval(): boolean;

    /**
     * Add an overlapping pair
     * @param proxy0 First proxy index
     * @param proxy1 Second proxy index
     * @returns The added pair, or null if not added
     */
    abstract addOverlappingPair(proxy0: number, proxy1: number): b3BroadphasePair | null;

    /**
     * Remove an overlapping pair
     * @param proxy0 First proxy index
     * @param proxy1 Second proxy index
     * @param dispatcher The collision dispatcher
     * @returns Removed pair data or null
     */
    abstract removeOverlappingPair(proxy0: number, proxy1: number, dispatcher: b3Dispatcher | null): any;

    /**
     * Remove all overlapping pairs containing a proxy
     * @param proxy The proxy index
     * @param dispatcher The collision dispatcher
     */
    abstract removeOverlappingPairsContainingProxy(proxy: number, dispatcher: b3Dispatcher | null): void;

    /**
     * Sort overlapping pairs
     * @param dispatcher The collision dispatcher
     */
    abstract sortOverlappingPairs(dispatcher: b3Dispatcher | null): void;
}

/**
 * Hash-space based Pair Cache, thanks to Erin Catto, Box2D, http://www.box2d.org, and Pierre Terdiman, Codercorner, http://codercorner.com
 */
export class b3HashedOverlappingPairCache extends b3OverlappingPairCache {
    private m_overlappingPairArray: b3BroadphasePairArray;
    private m_overlapFilterCallback: b3OverlapFilterCallback | null;
    private m_hashTable: b3AlignedObjectArray<number>;
    private m_next: b3AlignedObjectArray<number>;

    constructor() {
        super();
        this.m_overlappingPairArray = new b3AlignedObjectArray<b3BroadphasePair>();
        this.m_overlapFilterCallback = null;
        this.m_hashTable = new b3AlignedObjectArray<number>();
        this.m_next = new b3AlignedObjectArray<number>();
    }

    /**
     * Check if two proxies need broadphase collision
     */
    private needsBroadphaseCollision(proxy0: number, proxy1: number): boolean {
        if (this.m_overlapFilterCallback) {
            return this.m_overlapFilterCallback.needBroadphaseCollision(proxy0, proxy1);
        }

        const collides = true; // Default behavior - always collide
        return collides;
    }

    /**
     * Add an overlapping pair
     * @param proxy0 First proxy index
     * @param proxy1 Second proxy index
     * @returns The added pair, or null if not added
     */
    addOverlappingPair(proxy0: number, proxy1: number): b3BroadphasePair | null {
        b3g_addedPairs++;

        if (!this.needsBroadphaseCollision(proxy0, proxy1)) {
            return null;
        }

        return this.internalAddPair(proxy0, proxy1);
    }

    /**
     * Remove overlapping pairs containing a proxy
     * @param proxy The proxy index
     * @param dispatcher The collision dispatcher
     */
    removeOverlappingPairsContainingProxy(proxy: number, dispatcher: b3Dispatcher | null): void {
        this.cleanProxyFromPairs(proxy, dispatcher);
    }

    /**
     * Remove an overlapping pair
     * @param proxy0 First proxy index
     * @param proxy1 Second proxy index
     * @param dispatcher The collision dispatcher
     * @returns Removed pair data or null
     */
    removeOverlappingPair(proxy0: number, proxy1: number, dispatcher: b3Dispatcher | null): any {
        const pair = this.findPair(proxy0, proxy1);
        if (!pair) {
            return null;
        }

        this.cleanOverlappingPair(pair, dispatcher);

        // Find and remove from hash table
        const hash = this.getHash(proxy0, proxy1);
        let index = this.m_hashTable.get(hash);
        let previous = B3_NULL_PAIR;

        while (index !== B3_NULL_PAIR && !this.equalsPair(this.m_overlappingPairArray.get(index), proxy0, proxy1)) {
            previous = index;
            index = this.m_next.get(index);
        }

        if (index !== B3_NULL_PAIR) {
            if (previous !== B3_NULL_PAIR) {
                this.m_next.set(previous, this.m_next.get(index));
            } else {
                this.m_hashTable.set(hash, this.m_next.get(index));
            }

            // Remove from array by swapping with last element
            const lastPairIndex = this.m_overlappingPairArray.size() - 1;
            if (index < lastPairIndex) {
                const lastPair = this.m_overlappingPairArray.get(lastPairIndex);
                this.m_overlappingPairArray.set(index, lastPair);

                // Update hash table for moved pair
                const lastHash = this.getHash(lastPair.x, lastPair.y);
                let lastIndex = this.m_hashTable.get(lastHash);
                let lastPrevious = B3_NULL_PAIR;

                while (lastIndex !== lastPairIndex) {
                    lastPrevious = lastIndex;
                    lastIndex = this.m_next.get(lastIndex);
                }

                if (lastPrevious !== B3_NULL_PAIR) {
                    this.m_next.set(lastPrevious, index);
                } else {
                    this.m_hashTable.set(lastHash, index);
                }
                this.m_next.set(index, this.m_next.get(lastPairIndex));
            }

            this.m_overlappingPairArray.pop_back();
        }

        return pair;
    }

    cleanProxyFromPairs(proxy: number, dispatcher: b3Dispatcher | null): void {
        // Remove all pairs containing this proxy
        for (let i = this.m_overlappingPairArray.size() - 1; i >= 0; i--) {
            const pair = this.m_overlappingPairArray.get(i);
            if (pair.x === proxy || pair.y === proxy) {
                this.removeOverlappingPair(pair.x, pair.y, dispatcher);
            }
        }
    }

    processAllOverlappingPairs(callback: b3OverlapCallback | null, dispatcher: b3Dispatcher | null): void {
        if (!callback) return;

        for (let i = this.m_overlappingPairArray.size() - 1; i >= 0; i--) {
            const pair = this.m_overlappingPairArray.get(i);
            if (callback.processOverlap(pair)) {
                this.removeOverlappingPair(pair.x, pair.y, dispatcher);
            }
        }
    }

    getOverlappingPairArrayPtr(): b3BroadphasePair[] | null {
        return this.m_overlappingPairArray.size() > 0 ? this.m_overlappingPairArray.data() : null;
    }

    getOverlappingPairArrayPtrConst(): readonly b3BroadphasePair[] | null {
        return this.m_overlappingPairArray.size() > 0 ? this.m_overlappingPairArray.data() : null;
    }

    getOverlappingPairArray(): b3BroadphasePairArray {
        return this.m_overlappingPairArray;
    }

    cleanOverlappingPair(_pair: b3BroadphasePair, _dispatcher: b3Dispatcher | null): void {
        // Default implementation - derived classes can override
    }

    findPair(proxy0: number, proxy1: number): b3BroadphasePair | null {
        b3g_findPairs++;

        if (this.m_hashTable.size() === 0) {
            return null;
        }

        const hash = this.getHash(proxy0, proxy1);
        return this.internalFindPair(proxy0, proxy1, hash);
    }

    GetCount(): number {
        return this.m_overlappingPairArray.size();
    }

    getOverlapFilterCallback(): b3OverlapFilterCallback | null {
        return this.m_overlapFilterCallback;
    }

    setOverlapFilterCallback(callback: b3OverlapFilterCallback | null): void {
        this.m_overlapFilterCallback = callback;
    }

    getNumOverlappingPairs(): number {
        return this.m_overlappingPairArray.size();
    }

    hasDeferredRemoval(): boolean {
        return false;
    }

    sortOverlappingPairs(_dispatcher: b3Dispatcher | null): void {
        // Sort the overlapping pairs
        this.m_overlappingPairArray.data().sort((a, b) => {
            if (a.x !== b.x) return a.x - b.x;
            return a.y - b.y;
        });
    }

    /**
     * Internal method to add a pair
     */
    private internalAddPair(proxy0: number, proxy1: number): b3BroadphasePair | null {
        const hash = this.getHash(proxy0, proxy1);
        const pair = this.internalFindPair(proxy0, proxy1, hash);
        
        if (pair !== null) {
            return pair;
        }

        // Ensure hash table is large enough
        const count = this.m_overlappingPairArray.size();
        const oldCapacity = this.m_hashTable.size();

        if (count >= oldCapacity) {
            this.growTables();
        }

        // Create new pair
        const newPair = b3MakeBroadphasePair(proxy0, proxy1);

        const pairIndex = count;
        this.m_overlappingPairArray.push_back(newPair);

        // Add to hash table
        this.m_next.set(pairIndex, this.m_hashTable.get(hash));
        this.m_hashTable.set(hash, pairIndex);

        return newPair;
    }

    /**
     * Grow the hash tables
     */
    private growTables(): void {
        const oldCapacity = this.m_hashTable.size();
        const newCapacity = Math.max(oldCapacity * 2, 2);

        if (this.m_hashTable.size() < newCapacity) {
            // Initialize new hash table
            this.m_hashTable.resize(newCapacity, B3_NULL_PAIR);
            this.m_next.resize(newCapacity, B3_NULL_PAIR);

            // Rebuild hash table
            for (let i = 0; i < this.m_overlappingPairArray.size(); i++) {
                const pair = this.m_overlappingPairArray.get(i);
                const hash = this.getHash(pair.x, pair.y);
                this.m_next.set(i, this.m_hashTable.get(hash));
                this.m_hashTable.set(hash, i);
            }
        }
    }

    /**
     * Check if a pair equals the given proxy IDs
     */
    private equalsPair(pair: b3BroadphasePair, proxyId1: number, proxyId2: number): boolean {
        return pair.x === proxyId1 && pair.y === proxyId2;
    }

    /**
     * Hash function for two proxy IDs
     */
    private getHash(proxyId1: number, proxyId2: number): number {
        if (this.m_hashTable.size() === 0) {
            return 0;
        }

        let key = (((proxyId1 >>> 0) | 0) | (((proxyId2 >>> 0) | 0) << 16)) | 0;

        // Thomas Wang's hash
        key += ~(key << 15);
        key ^= (key >>> 10);
        key += (key << 3);
        key ^= (key >>> 6);
        key += ~(key << 11);
        key ^= (key >>> 16);

        return (key >>> 0) % this.m_hashTable.size();
    }

    /**
     * Internal find pair method
     */
    private internalFindPair(proxy0: number, proxy1: number, hash: number): b3BroadphasePair | null {
        let index = this.m_hashTable.get(hash);

        while (index !== B3_NULL_PAIR && !this.equalsPair(this.m_overlappingPairArray.get(index), proxy0, proxy1)) {
            index = this.m_next.get(index);
        }

        if (index === B3_NULL_PAIR) {
            return null;
        }

        b3Assert(index < this.m_overlappingPairArray.size(), 'Index out of bounds');

        return this.m_overlappingPairArray.get(index);
    }
}

/**
 * Sorted overlapping pair cache maintains the objects with overlapping AABB
 * Typically managed by the Broadphase, Axis3Sweep or b3SimpleBroadphase
 */
export class b3SortedOverlappingPairCache extends b3OverlappingPairCache {
    protected m_overlappingPairArray: b3BroadphasePairArray;
    protected m_blockedForChanges: boolean;
    protected m_hasDeferredRemoval: boolean;
    protected m_overlapFilterCallback: b3OverlapFilterCallback | null;

    constructor() {
        super();
        this.m_overlappingPairArray = new b3AlignedObjectArray<b3BroadphasePair>();
        this.m_blockedForChanges = false;
        this.m_hasDeferredRemoval = false;
        this.m_overlapFilterCallback = null;
    }

    processAllOverlappingPairs(callback: b3OverlapCallback | null, dispatcher: b3Dispatcher | null): void {
        if (!callback) return;

        for (let i = this.m_overlappingPairArray.size() - 1; i >= 0; i--) {
            const pair = this.m_overlappingPairArray.get(i);
            if (callback.processOverlap(pair)) {
                this.removeOverlappingPair(pair.x, pair.y, dispatcher);
            }
        }
    }

    removeOverlappingPair(proxy0: number, proxy1: number, dispatcher: b3Dispatcher | null): any {
        const pair = this.findPair(proxy0, proxy1);
        if (!pair) {
            return null;
        }

        this.cleanOverlappingPair(pair, dispatcher);

        // Remove from array
        const index = this.m_overlappingPairArray.findLinearSearch(pair);
        if (index !== -1) {
            this.m_overlappingPairArray.remove(index);
        }

        return pair;
    }

    cleanOverlappingPair(_pair: b3BroadphasePair, _dispatcher: b3Dispatcher | null): void {
        // Default implementation
    }

    addOverlappingPair(proxy0: number, proxy1: number): b3BroadphasePair | null {
        if (!this.needsBroadphaseCollision(proxy0, proxy1)) {
            return null;
        }

        const newPair = b3MakeBroadphasePair(proxy0, proxy1);
        this.m_overlappingPairArray.push_back(newPair);
        return newPair;
    }

    findPair(proxy0: number, proxy1: number): b3BroadphasePair | null {
        // Linear search through sorted pairs
        for (let i = 0; i < this.m_overlappingPairArray.size(); i++) {
            const pair = this.m_overlappingPairArray.get(i);
            if ((pair.x === proxy0 && pair.y === proxy1) || (pair.x === proxy1 && pair.y === proxy0)) {
                return pair;
            }
        }
        return null;
    }

    cleanProxyFromPairs(proxy: number, dispatcher: b3Dispatcher | null): void {
        for (let i = this.m_overlappingPairArray.size() - 1; i >= 0; i--) {
            const pair = this.m_overlappingPairArray.get(i);
            if (pair.x === proxy || pair.y === proxy) {
                this.removeOverlappingPair(pair.x, pair.y, dispatcher);
            }
        }
    }

    removeOverlappingPairsContainingProxy(proxy: number, dispatcher: b3Dispatcher | null): void {
        this.cleanProxyFromPairs(proxy, dispatcher);
    }

    private needsBroadphaseCollision(proxy0: number, proxy1: number): boolean {
        if (this.m_overlapFilterCallback) {
            return this.m_overlapFilterCallback.needBroadphaseCollision(proxy0, proxy1);
        }

        const collides = true; // Default behavior
        return collides;
    }

    getOverlappingPairArray(): b3BroadphasePairArray {
        return this.m_overlappingPairArray;
    }

    getOverlappingPairArrayPtr(): b3BroadphasePair[] | null {
        return this.m_overlappingPairArray.size() > 0 ? this.m_overlappingPairArray.data() : null;
    }

    getOverlappingPairArrayPtrConst(): readonly b3BroadphasePair[] | null {
        return this.m_overlappingPairArray.size() > 0 ? this.m_overlappingPairArray.data() : null;
    }

    getNumOverlappingPairs(): number {
        return this.m_overlappingPairArray.size();
    }

    getOverlapFilterCallback(): b3OverlapFilterCallback | null {
        return this.m_overlapFilterCallback;
    }

    setOverlapFilterCallback(callback: b3OverlapFilterCallback | null): void {
        this.m_overlapFilterCallback = callback;
    }

    hasDeferredRemoval(): boolean {
        return this.m_hasDeferredRemoval;
    }

    sortOverlappingPairs(_dispatcher: b3Dispatcher | null): void {
        // Sort the pairs
        this.m_overlappingPairArray.data().sort((a, b) => {
            if (a.x !== b.x) return a.x - b.x;
            return a.y - b.y;
        });
    }
}

/**
 * Null pair cache skips add/removal of overlapping pairs. Useful for benchmarking and unit testing.
 */
export class b3NullPairCache extends b3OverlappingPairCache {
    private m_overlappingPairArray: b3BroadphasePairArray;

    constructor() {
        super();
        this.m_overlappingPairArray = new b3AlignedObjectArray<b3BroadphasePair>();
    }

    getOverlappingPairArrayPtr(): b3BroadphasePair[] | null {
        return this.m_overlappingPairArray.size() > 0 ? this.m_overlappingPairArray.data() : null;
    }

    getOverlappingPairArrayPtrConst(): readonly b3BroadphasePair[] | null {
        return this.m_overlappingPairArray.size() > 0 ? this.m_overlappingPairArray.data() : null;
    }

    getOverlappingPairArray(): b3BroadphasePairArray {
        return this.m_overlappingPairArray;
    }

    cleanOverlappingPair(_pair: b3BroadphasePair, _dispatcher: b3Dispatcher | null): void {
        // No-op
    }

    getNumOverlappingPairs(): number {
        return 0;
    }

    cleanProxyFromPairs(_proxy: number, _dispatcher: b3Dispatcher | null): void {
        // No-op
    }

    setOverlapFilterCallback(_callback: b3OverlapFilterCallback | null): void {
        // No-op
    }

    processAllOverlappingPairs(_callback: b3OverlapCallback | null, _dispatcher: b3Dispatcher | null): void {
        // No-op
    }

    findPair(_proxy0: number, _proxy1: number): b3BroadphasePair | null {
        return null;
    }

    hasDeferredRemoval(): boolean {
        return true;
    }

    addOverlappingPair(_proxy0: number, _proxy1: number): b3BroadphasePair | null {
        return null;
    }

    removeOverlappingPair(_proxy0: number, _proxy1: number, _dispatcher: b3Dispatcher | null): any {
        return null;
    }

    removeOverlappingPairsContainingProxy(_proxy: number, _dispatcher: b3Dispatcher | null): void {
        // No-op
    }

    sortOverlappingPairs(_dispatcher: b3Dispatcher | null): void {
        // No-op
    }
}