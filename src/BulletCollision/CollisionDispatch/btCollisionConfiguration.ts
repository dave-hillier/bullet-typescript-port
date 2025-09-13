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
 * Pool allocator interface for memory management
 */
export interface btPoolAllocator {
    getFreeCount(): number;
    getUsedCount(): number;
    getMaxCount(): number;
    allocate(size: number): any;
    validPtr(ptr: any): boolean;
    freeMemory(ptr: any): void;
}

/**
 * Basic pool allocator implementation
 */
export class btDefaultPoolAllocator implements btPoolAllocator {
    protected m_maxElements: number;
    protected m_elementSize: number;
    protected m_freeElements: any[];

    constructor(maxElements: number, elementSize: number) {
        this.m_maxElements = maxElements;
        this.m_elementSize = elementSize;
        this.m_freeElements = [];
    }

    getFreeCount(): number {
        return this.m_freeElements.length;
    }

    getUsedCount(): number {
        return this.m_maxElements - this.m_freeElements.length;
    }

    getMaxCount(): number {
        return this.m_maxElements;
    }

    allocate(_size: number): any {
        if (this.m_freeElements.length > 0) {
            return this.m_freeElements.pop();
        }
        return {}; // Simplified allocation
    }

    validPtr(ptr: any): boolean {
        return ptr !== null && ptr !== undefined;
    }

    freeMemory(ptr: any): void {
        if (this.validPtr(ptr)) {
            this.m_freeElements.push(ptr);
        }
    }
}

/**
 * Collision algorithm creation function interface
 */
export interface btCollisionAlgorithmCreateFunc {
    createCollisionAlgorithm(info: btCollisionAlgorithmConstructionInfo, body0: any, body1: any): any;
    swapped: boolean;
}

/**
 * Basic collision algorithm creation function implementation
 */
export class btDefaultCollisionAlgorithmCreateFunc implements btCollisionAlgorithmCreateFunc {
    public swapped: boolean;

    constructor(swapped: boolean = false) {
        this.swapped = swapped;
    }

    createCollisionAlgorithm(_info: btCollisionAlgorithmConstructionInfo, _body0: any, _body1: any): any {
        // Simplified implementation - returns null for now
        return null;
    }
}

/**
 * Construction info for collision algorithms
 */
export interface btCollisionAlgorithmConstructionInfo {
    m_dispatcher1: any;
    m_manifold: any;
}

/**
 * btCollisionConfiguration allows to configure Bullet collision detection
 * stack allocator, pool memory allocators
 */
export abstract class btCollisionConfiguration {
    /**
     * Get persistent manifold pool
     */
    abstract getPersistentManifoldPool(): btPoolAllocator;

    /**
     * Get collision algorithm pool
     */
    abstract getCollisionAlgorithmPool(): btPoolAllocator;

    /**
     * Get collision algorithm create function for given proxy types
     */
    abstract getCollisionAlgorithmCreateFunc(proxyType0: number, proxyType1: number): btCollisionAlgorithmCreateFunc;

    /**
     * Get closest points algorithm create function for given proxy types
     */
    abstract getClosestPointsAlgorithmCreateFunc(proxyType0: number, proxyType1: number): btCollisionAlgorithmCreateFunc;
}