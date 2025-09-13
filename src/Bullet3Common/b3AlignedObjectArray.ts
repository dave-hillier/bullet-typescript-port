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

/**
 * TypeScript port of Bullet3Common/b3AlignedObjectArray.h
 * Dynamic array container for the Bullet3 physics engine
 * 
 * In TypeScript, we don't need custom memory allocation or alignment,
 * so this is essentially a wrapper around native arrays with bullet-compatible interface.
 */

import { b3Assert } from './b3Scalar';

/**
 * The b3AlignedObjectArray template class uses a subset of the stl::vector interface for its methods.
 * In TypeScript, this wraps the native array with bullet3-compatible methods.
 */
export class b3AlignedObjectArray<T> {
    private m_data: T[] = [];

    constructor();
    constructor(other: b3AlignedObjectArray<T>);
    constructor(initialCapacity: number);
    constructor(arg?: b3AlignedObjectArray<T> | number) {
        if (arg === undefined) {
            // Default constructor
            this.m_data = [];
        } else if (typeof arg === 'number') {
            // Constructor with initial capacity
            this.m_data = new Array(arg);
        } else {
            // Copy constructor
            this.m_data = [...arg.m_data];
        }
    }

    /**
     * Assignment operator
     */
    assign(other: b3AlignedObjectArray<T>): b3AlignedObjectArray<T> {
        this.copyFromArray(other);
        return this;
    }

    /**
     * Copy from another array
     */
    copyFromArray(other: b3AlignedObjectArray<T>): void {
        this.m_data = [...other.m_data];
    }

    /**
     * Return the number of elements in the array
     */
    size(): number {
        return this.m_data.length;
    }

    /**
     * Return the capacity of the array
     */
    capacity(): number {
        return this.m_data.length; // In JS, capacity == length
    }

    /**
     * Access element at index with bounds checking
     */
    at(n: number): T {
        b3Assert(n >= 0 && n < this.size(), `Index ${n} out of bounds`);
        return this.m_data[n];
    }

    /**
     * Access element at index (array subscript)
     */
    get(n: number): T {
        b3Assert(n >= 0 && n < this.size(), `Index ${n} out of bounds`);
        return this.m_data[n];
    }

    /**
     * Set element at index
     */
    set(n: number, value: T): void {
        b3Assert(n >= 0 && n < this.size(), `Index ${n} out of bounds`);
        this.m_data[n] = value;
    }

    /**
     * Clear the array
     */
    clear(): void {
        this.m_data = [];
    }

    /**
     * Remove the last element
     */
    pop_back(): void {
        b3Assert(this.m_data.length > 0, 'Cannot pop from empty array');
        this.m_data.pop();
    }

    /**
     * Resize the array without initializing new elements
     */
    resizeNoInitialize(newsize: number): void {
        this.m_data.length = newsize;
    }

    /**
     * Resize the array, filling new elements with fillData
     */
    resize(newsize: number, fillData?: T): void {
        const currentSize = this.m_data.length;
        
        if (newsize < currentSize) {
            // Shrink array
            this.m_data.length = newsize;
        } else if (newsize > currentSize && fillData !== undefined) {
            // Grow array and fill with fillData
            for (let i = currentSize; i < newsize; i++) {
                this.m_data[i] = fillData;
            }
        } else {
            // Just change size
            this.m_data.length = newsize;
        }
    }

    /**
     * Expand the array by one element and return reference to it
     */
    expandNonInitializing(): { value: T } {
        const index = this.m_data.length;
        this.m_data.length++;
        
        // Return a reference-like object for compatibility
        return {
            get value(): T {
                return this.m_data[index];
            },
            set value(val: T) {
                this.m_data[index] = val;
            }
        } as any;
    }

    /**
     * Expand the array by one element, initialized with fillValue
     */
    expand(fillValue?: T): T {
        this.m_data.push(fillValue!);
        return this.m_data[this.m_data.length - 1];
    }

    /**
     * Add element to the end
     */
    push_back(value: T): void {
        this.m_data.push(value);
    }

    /**
     * Reserve capacity (no-op in TypeScript since arrays grow dynamically)
     */
    reserve(size: number): void {
        // In TypeScript, arrays grow dynamically, so this is a no-op
        // But we can pre-allocate if needed
        if (size > this.m_data.length) {
            this.m_data.length = size;
        }
    }

    /**
     * Return pointer to the first element (for C++ compatibility)
     */
    data(): T[] {
        return this.m_data;
    }

    /**
     * Swap contents with another array
     */
    swap(i: number, j: number): void {
        b3Assert(i >= 0 && i < this.size(), `Index ${i} out of bounds`);
        b3Assert(j >= 0 && j < this.size(), `Index ${j} out of bounds`);
        
        const temp = this.m_data[i];
        this.m_data[i] = this.m_data[j];
        this.m_data[j] = temp;
    }

    /**
     * Remove element at index
     */
    remove(index: number): void {
        b3Assert(index >= 0 && index < this.size(), `Index ${index} out of bounds`);
        this.m_data.splice(index, 1);
    }

    /**
     * Remove element by swapping with last element
     */
    removeAtIndex(index: number): void {
        b3Assert(index >= 0 && index < this.size(), `Index ${index} out of bounds`);
        if (index < this.size() - 1) {
            this.m_data[index] = this.m_data[this.size() - 1];
        }
        this.pop_back();
    }

    /**
     * Find element and return index, or -1 if not found
     */
    findLinearSearch(key: T): number {
        return this.m_data.indexOf(key);
    }

    /**
     * Find element using binary search (assumes sorted array)
     */
    findBinarySearch(key: T, compareFn?: (a: T, b: T) => number): number {
        if (!compareFn) {
            compareFn = (a, b) => a < b ? -1 : (a > b ? 1 : 0);
        }

        let left = 0;
        let right = this.size() - 1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const cmp = compareFn(this.m_data[mid], key);
            
            if (cmp === 0) {
                return mid;
            } else if (cmp < 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1;
    }

    /**
     * Check if array is empty
     */
    empty(): boolean {
        return this.m_data.length === 0;
    }

    /**
     * Get the first element
     */
    front(): T {
        b3Assert(this.size() > 0, 'Array is empty');
        return this.m_data[0];
    }

    /**
     * Get the last element
     */
    back(): T {
        b3Assert(this.size() > 0, 'Array is empty');
        return this.m_data[this.size() - 1];
    }

    /**
     * Copy from regular array
     */
    copyFromNativeArray(array: T[]): void {
        this.m_data = [...array];
    }

    /**
     * Convert to regular array
     */
    toNativeArray(): T[] {
        return [...this.m_data];
    }

    /**
     * Iterator support
     */
    *[Symbol.iterator](): Iterator<T> {
        for (const item of this.m_data) {
            yield item;
        }
    }

    /**
     * forEach implementation
     */
    forEach(callback: (value: T, index: number, array: b3AlignedObjectArray<T>) => void): void {
        for (let i = 0; i < this.m_data.length; i++) {
            callback(this.m_data[i], i, this);
        }
    }

    /**
     * map implementation
     */
    map<U>(callback: (value: T, index: number, array: b3AlignedObjectArray<T>) => U): b3AlignedObjectArray<U> {
        const result = new b3AlignedObjectArray<U>();
        for (let i = 0; i < this.m_data.length; i++) {
            result.push_back(callback(this.m_data[i], i, this));
        }
        return result;
    }

    /**
     * filter implementation
     */
    filter(callback: (value: T, index: number, array: b3AlignedObjectArray<T>) => boolean): b3AlignedObjectArray<T> {
        const result = new b3AlignedObjectArray<T>();
        for (let i = 0; i < this.m_data.length; i++) {
            if (callback(this.m_data[i], i, this)) {
                result.push_back(this.m_data[i]);
            }
        }
        return result;
    }

    /**
     * QuickSort implementation compatible with Bullet3's interface
     * @param compareFunc Comparison function that returns true if first argument should come before second
     * @param left Starting index (optional, defaults to 0)
     * @param right Ending index (optional, defaults to size - 1)
     */
    quickSortInternal<CompareFunc extends { (a: T, b: T): boolean }>(
        compareFunc: CompareFunc,
        left: number = 0,
        right: number = this.size() - 1
    ): void {
        if (left < right) {
            const pivotIndex = this.partition(compareFunc, left, right);
            this.quickSortInternal(compareFunc, left, pivotIndex - 1);
            this.quickSortInternal(compareFunc, pivotIndex + 1, right);
        }
    }

    /**
     * Partition function for quicksort
     */
    private partition<CompareFunc extends { (a: T, b: T): boolean }>(
        compareFunc: CompareFunc,
        left: number,
        right: number
    ): number {
        const pivot = this.m_data[right];
        let i = left - 1;

        for (let j = left; j < right; j++) {
            if (compareFunc(this.m_data[j], pivot)) {
                i++;
                this.swap(i, j);
            }
        }

        this.swap(i + 1, right);
        return i + 1;
    }
}

/**
 * Utility function to create a b3AlignedObjectArray from a native array
 */
export function b3MakeAlignedObjectArray<T>(array: T[]): b3AlignedObjectArray<T> {
    const result = new b3AlignedObjectArray<T>();
    result.copyFromNativeArray(array);
    return result;
}