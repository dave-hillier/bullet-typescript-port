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
 * TypeScript port of Bullet3's btPoolAllocator.h
 *
 * The btPoolAllocator class allows to efficiently allocate a large pool of objects,
 * instead of dynamically allocating them separately.
 *
 * In the TypeScript version, this is simplified to work with JavaScript's garbage collector
 * while maintaining the same interface for compatibility with the C++ version.
 */

import { btAssert } from './btScalar';
import { btSpinMutex, btMutexLock, btMutexUnlock } from './btThreads';

/**
 * Pool element wrapper for tracking allocated objects
 */
interface PoolElement {
    data: any;
    nextFree: PoolElement | null;
}

/**
 * btPoolAllocator - Efficient memory pool allocation for same-sized objects
 *
 * This TypeScript version maintains API compatibility with the C++ version while
 * adapting to JavaScript's memory management model.
 */
export class btPoolAllocator {
    private m_elemSize: number;
    private m_maxElements: number;
    private m_freeCount: number;
    private m_firstFree: PoolElement | null;
    private m_pool: PoolElement[];
    private m_mutex: btSpinMutex;
    private m_allocatedElements: Set<PoolElement>;

    constructor(elemSize: number, maxElements: number) {
        btAssert(elemSize > 0, "Element size must be positive");
        btAssert(maxElements > 0, "Max elements must be positive");

        this.m_elemSize = elemSize;
        this.m_maxElements = maxElements;
        this.m_freeCount = maxElements;
        this.m_mutex = new btSpinMutex();
        this.m_allocatedElements = new Set<PoolElement>();

        // Initialize the pool as a linked list of free elements
        this.m_pool = new Array<PoolElement>(maxElements);

        // Create all pool elements and link them
        for (let i = 0; i < maxElements; i++) {
            this.m_pool[i] = {
                data: null,
                nextFree: i < maxElements - 1 ? null : null // Will be set below
            };
        }

        // Link the free list
        for (let i = 0; i < maxElements - 1; i++) {
            this.m_pool[i].nextFree = this.m_pool[i + 1];
        }
        this.m_pool[maxElements - 1].nextFree = null;

        this.m_firstFree = maxElements > 0 ? this.m_pool[0] : null;
    }

    /**
     * Get the number of free elements in the pool
     */
    getFreeCount(): number {
        return this.m_freeCount;
    }

    /**
     * Get the number of used elements in the pool
     */
    getUsedCount(): number {
        return this.m_maxElements - this.m_freeCount;
    }

    /**
     * Get the maximum number of elements the pool can hold
     */
    getMaxCount(): number {
        return this.m_maxElements;
    }

    /**
     * Allocate memory from the pool
     * @param size The size to allocate (ignored in pool allocator, must be <= elemSize)
     * @returns Allocated object or null if pool is full
     */
    async allocate(size: number = 0): Promise<any> {
        // In release mode, size parameter is ignored (like in C++)
        if (size > 0) {
            btAssert(size <= this.m_elemSize, `Requested size ${size} exceeds element size ${this.m_elemSize}`);
        }

        await btMutexLock(this.m_mutex);

        let result: any = null;

        try {
            if (this.m_firstFree !== null) {
                const element = this.m_firstFree;
                this.m_firstFree = element.nextFree;
                element.nextFree = null;

                // Create the actual data object
                element.data = {};
                this.m_allocatedElements.add(element);
                this.m_freeCount--;

                result = element.data;
            }
        } finally {
            btMutexUnlock(this.m_mutex);
        }

        return result;
    }

    /**
     * Check if a pointer is valid (belongs to this pool)
     * @param ptr The pointer to validate
     * @returns true if the pointer belongs to this pool
     */
    validPtr(ptr: any): boolean {
        if (!ptr) {
            return false;
        }

        // Find the pool element that contains this data
        for (const element of this.m_allocatedElements) {
            if (element.data === ptr) {
                return true;
            }
        }

        return false;
    }

    /**
     * Free memory back to the pool
     * @param ptr The pointer to free
     */
    async freeMemory(ptr: any): Promise<void> {
        if (!ptr) {
            return;
        }

        await btMutexLock(this.m_mutex);

        try {
            // Find the pool element that contains this data
            let elementToFree: PoolElement | null = null;

            for (const element of this.m_allocatedElements) {
                if (element.data === ptr) {
                    elementToFree = element;
                    break;
                }
            }

            if (elementToFree) {
                btAssert(this.validPtr(ptr), "Attempting to free invalid pointer");

                // Remove from allocated set
                this.m_allocatedElements.delete(elementToFree);

                // Clear the data
                elementToFree.data = null;

                // Add back to free list
                elementToFree.nextFree = this.m_firstFree;
                this.m_firstFree = elementToFree;
                this.m_freeCount++;
            }
        } finally {
            btMutexUnlock(this.m_mutex);
        }
    }

    /**
     * Get the element size
     */
    getElementSize(): number {
        return this.m_elemSize;
    }

    /**
     * Get pool address information (for debugging/compatibility)
     * Returns a readonly reference to the pool array
     */
    getPoolAddress(): readonly PoolElement[] {
        return this.m_pool;
    }

    /**
     * Reset the pool to initial state (free all allocations)
     * This is a TypeScript-specific utility method
     */
    async reset(): Promise<void> {
        await btMutexLock(this.m_mutex);

        try {
            // Clear all allocated elements
            for (const element of this.m_allocatedElements) {
                element.data = null;
            }
            this.m_allocatedElements.clear();

            // Rebuild free list
            for (let i = 0; i < this.m_maxElements - 1; i++) {
                this.m_pool[i].nextFree = this.m_pool[i + 1];
            }
            this.m_pool[this.m_maxElements - 1].nextFree = null;

            this.m_firstFree = this.m_maxElements > 0 ? this.m_pool[0] : null;
            this.m_freeCount = this.m_maxElements;
        } finally {
            btMutexUnlock(this.m_mutex);
        }
    }

    /**
     * Get debug information about the pool state
     * This is a TypeScript-specific utility method
     */
    getDebugInfo(): {
        elemSize: number;
        maxElements: number;
        freeCount: number;
        usedCount: number;
        allocatedPointers: number;
    } {
        return {
            elemSize: this.m_elemSize,
            maxElements: this.m_maxElements,
            freeCount: this.m_freeCount,
            usedCount: this.getUsedCount(),
            allocatedPointers: this.m_allocatedElements.size
        };
    }
}