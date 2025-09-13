/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org

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
 * TypeScript port of Bullet3's btAlignedAllocator.h
 * 
 * This file provides memory allocation utilities adapted for TypeScript/JavaScript.
 * Since JavaScript handles memory alignment automatically through its runtime,
 * most alignment-specific functionality is simplified or omitted.
 */

// Size type for allocation functions
export type SizeType = number;

// Function type definitions for custom allocators
export type BtAllocFunc = (size: number) => any;
export type BtFreeFunc = (memblock: any) => void;
export type BtAlignedAllocFunc = (size: number, alignment: number) => any;
export type BtAlignedFreeFunc = (memblock: any) => void;

// Internal allocation tracking for debugging (simplified)
let gDebugMemoryAllocations = false;
let gAllocatedMemory = 0;
let gTotalAllocations = 0;

// Custom allocator function pointers (currently unused in this TypeScript port)
// @ts-expect-error - preserved for API compatibility, may be used in future
let _gAllocFunc: BtAllocFunc | null = null;
// @ts-expect-error - preserved for API compatibility, may be used in future
let _gFreeFunc: BtFreeFunc | null = null;
let gAlignedAllocFunc: BtAlignedAllocFunc | null = null;
let gAlignedFreeFunc: BtAlignedFreeFunc | null = null;

/**
 * Internal aligned allocation function
 * In JavaScript, all object allocation is handled by the runtime,
 * so alignment is automatically managed.
 */
function btAlignedAllocInternal(size: number, alignment: number): any {
    if (gAlignedAllocFunc) {
        const ptr = gAlignedAllocFunc(size, alignment);
        if (gDebugMemoryAllocations) {
            gAllocatedMemory += size;
            gTotalAllocations++;
        }
        return ptr;
    }
    
    // Default allocation - JavaScript handles alignment automatically
    if (size <= 0) return null;
    
    // For arrays, create typed arrays which are properly aligned
    if (size % 4 === 0) {
        return new ArrayBuffer(size);
    }
    
    // For general objects, return a generic object
    const obj = {};
    
    if (gDebugMemoryAllocations) {
        gAllocatedMemory += size;
        gTotalAllocations++;
    }
    
    return obj;
}

/**
 * Internal aligned free function
 * In JavaScript, memory is automatically garbage collected
 */
function btAlignedFreeInternal(ptr: any): void {
    if (!ptr) return;
    
    if (gAlignedFreeFunc) {
        gAlignedFreeFunc(ptr);
        return;
    }
    
    // In JavaScript, we can't explicitly free memory
    // The garbage collector will handle it automatically
    if (gDebugMemoryAllocations && gTotalAllocations > 0) {
        gTotalAllocations--;
    }
}

/**
 * Aligned allocation function (public API)
 */
export function btAlignedAlloc(size: number, alignment: number): any {
    return btAlignedAllocInternal(size, alignment);
}

/**
 * Aligned free function (public API)
 */
export function btAlignedFree(ptr: any): void {
    btAlignedFreeInternal(ptr);
}

/**
 * Set custom allocator functions
 * Allows the developer to override default allocation behavior
 */
export function btAlignedAllocSetCustom(allocFunc: BtAllocFunc, freeFunc: BtFreeFunc): void {
    _gAllocFunc = allocFunc;
    _gFreeFunc = freeFunc;
}

/**
 * Set custom aligned allocator functions
 * Allows the developer to override default aligned allocation behavior
 */
export function btAlignedAllocSetCustomAligned(allocFunc: BtAlignedAllocFunc, freeFunc: BtAlignedFreeFunc): void {
    gAlignedAllocFunc = allocFunc;
    gAlignedFreeFunc = freeFunc;
}

/**
 * Enable or disable debug memory allocation tracking
 */
export function btSetDebugMemoryAllocations(enable: boolean): void {
    gDebugMemoryAllocations = enable;
    if (!enable) {
        gAllocatedMemory = 0;
        gTotalAllocations = 0;
    }
}

/**
 * Get current allocated memory size (for debugging)
 */
export function btGetAllocatedMemory(): number {
    return gAllocatedMemory;
}

/**
 * Get total number of allocations (for debugging)
 */
export function btGetTotalAllocations(): number {
    return gTotalAllocations;
}

/**
 * Dump memory leaks (simplified for TypeScript)
 * Returns the number of outstanding allocations
 */
export function btDumpMemoryLeaks(): number {
    if (gDebugMemoryAllocations && gTotalAllocations > 0) {
        console.warn(`Bullet3 Memory Leak Detection: ${gTotalAllocations} outstanding allocations`);
        console.warn(`Total allocated memory: ${gAllocatedMemory} bytes`);
    }
    return gTotalAllocations;
}

/**
 * The btAlignedAllocator is a portable class for aligned memory allocations.
 * In TypeScript, this is primarily provided for API compatibility with the C++ version.
 * Since JavaScript handles memory alignment automatically, most functionality is simplified.
 */
export class BtAlignedAllocator<T> {
    // Type aliases for compatibility with C++ STL allocator interface
    public readonly value_type = null as any as T;
    public readonly pointer = null as any as T;
    public readonly const_pointer = null as any as Readonly<T>;
    public readonly reference = null as any as T;
    public readonly const_reference = null as any as Readonly<T>;

    private readonly alignment: number;

    constructor(alignment: number = 16) {
        this.alignment = alignment;
    }

    /**
     * Get the address of a reference (simplified for TypeScript)
     */
    address(ref: T): T {
        return ref;
    }

    /**
     * Get the address of a const reference (simplified for TypeScript)
     */
    addressConst(ref: Readonly<T>): Readonly<T> {
        return ref;
    }

    /**
     * Allocate memory for n objects of type T
     * In TypeScript, this creates an array or object as appropriate
     */
    allocate(n: number): T[] {
        if (n <= 0) return [];
        
        // For arrays, create appropriately sized array
        const result = new Array<T>(n);
        
        if (gDebugMemoryAllocations) {
            gAllocatedMemory += n * 8; // Approximate size per element
            gTotalAllocations++;
        }
        
        return result;
    }

    /**
     * Construct an object at the given location
     * In TypeScript, this is simplified since we don't have explicit construction
     */
    construct(ptr: T[], index: number, value: T): void {
        if (ptr && index >= 0 && index < ptr.length) {
            ptr[index] = value;
        }
    }

    /**
     * Deallocate memory (simplified for TypeScript)
     * In JavaScript, memory is automatically garbage collected
     */
    deallocate(_ptr: T[]): void {
        if (gDebugMemoryAllocations && gTotalAllocations > 0) {
            gTotalAllocations--;
        }
        // In JavaScript, we can't explicitly deallocate memory
        // The garbage collector will handle it
    }

    /**
     * Destroy an object at the given location
     * In TypeScript, this is simplified since destruction is handled by GC
     */
    destroy(ptr: T[], index: number): void {
        if (ptr && index >= 0 && index < ptr.length) {
            delete ptr[index];
        }
    }

    /**
     * Create a new allocator for a different type
     */
    rebind<U>(): BtAlignedAllocator<U> {
        return new BtAlignedAllocator<U>(this.alignment);
    }

    /**
     * Check if two allocators are equal
     */
    equals(other: BtAlignedAllocator<T>): boolean {
        return this.alignment === other.alignment;
    }

    /**
     * Get the alignment used by this allocator
     */
    getAlignment(): number {
        return this.alignment;
    }
}

/**
 * Utility function to create an aligned allocator
 */
export function createAlignedAllocator<T>(alignment: number = 16): BtAlignedAllocator<T> {
    return new BtAlignedAllocator<T>(alignment);
}

/**
 * Helper function to allocate an aligned array
 * This is a convenience function that creates an appropriately sized and aligned array
 */
export function allocateAlignedArray<T>(size: number, alignment: number = 16): T[] {
    const allocator = new BtAlignedAllocator<T>(alignment);
    return allocator.allocate(size);
}

/**
 * Helper function to deallocate an aligned array
 */
export function deallocateAlignedArray<T>(array: T[]): void {
    const allocator = new BtAlignedAllocator<T>();
    allocator.deallocate(array);
}