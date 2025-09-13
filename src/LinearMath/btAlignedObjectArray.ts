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
 * TypeScript port of Bullet3's btAlignedObjectArray.h
 * 
 * The btAlignedObjectArray template class uses a subset of the stl::vector interface for its methods.
 * It is developed to replace stl::vector to avoid portability issues, including STL alignment issues to add SIMD/SSE data.
 * 
 * In TypeScript, this class wraps JavaScript's native Array for better performance while maintaining
 * the same API as the C++ version for compatibility.
 */

import { btAssert } from './btScalar';
import { BtAlignedAllocator } from './btAlignedAllocator';

/**
 * Comparison function type for sorting operations
 */
export interface CompareFunction<T> {
    (a: T, b: T): boolean;
}

/**
 * Default comparison class - equivalent of C++ std::less
 */
export class BtAlignedObjectArrayLess<T> {
    operator(a: T, b: T): boolean {
        return (a as any) < (b as any);
    }
}

/**
 * The btAlignedObjectArray template class uses a subset of the stl::vector interface for its methods.
 * It is developed to replace stl::vector to avoid portability issues, including STL alignment issues.
 * 
 * In TypeScript, this leverages JavaScript's native Array while providing the same API as the C++ version.
 */
export class BtAlignedObjectArray<T> {
    private m_allocator: BtAlignedAllocator<T>;
    private m_data: T[] = [];
    private m_size: number = 0;
    private m_capacity: number = 0;
    private m_ownsMemory: boolean = true;

    /**
     * Constructor - initializes an empty array
     */
    constructor() {
        this.m_allocator = new BtAlignedAllocator<T>(16);
        this.init();
    }

    /**
     * Copy constructor - creates a copy of another array
     * Generally it is best to avoid using the copy constructor of an btAlignedObjectArray, 
     * and use a (const) reference to the array instead.
     */
    static fromArray<T>(otherArray: BtAlignedObjectArray<T>): BtAlignedObjectArray<T> {
        const newArray = new BtAlignedObjectArray<T>();
        const otherSize = otherArray.size();
        newArray.resize(otherSize);
        newArray.copyFromArray(otherArray);
        return newArray;
    }

    /**
     * Assignment operator - copies from another array
     */
    assign(other: BtAlignedObjectArray<T>): BtAlignedObjectArray<T> {
        this.copyFromArray(other);
        return this;
    }

    /**
     * Initialize the array to empty state
     */
    private init(): void {
        this.m_ownsMemory = true;
        this.m_data = [];
        this.m_size = 0;
        this.m_capacity = 0;
    }

    /**
     * Calculate allocation size with growth strategy
     */
    private allocSize(size: number): number {
        return size ? size * 2 : 1;
    }

    /**
     * Copy elements from internal data to destination array
     */
    private copy(start: number, end: number, dest: T[]): void {
        for (let i = start; i < end; ++i) {
            dest[i] = this.m_data[i];
        }
    }

    /**
     * Destroy elements in range (simplified for TypeScript - no explicit destructors)
     */
    private destroy(first: number, last: number): void {
        // In TypeScript/JavaScript, we don't need explicit destruction
        // The garbage collector will handle cleanup automatically
        for (let i = first; i < last; i++) {
            delete this.m_data[i];
        }
    }

    /**
     * Allocate memory for specified number of elements
     */
    private allocate(size: number): T[] | null {
        if (size > 0) {
            return this.m_allocator.allocate(size);
        }
        return null;
    }

    /**
     * Deallocate memory
     */
    private deallocate(): void {
        if (this.m_data && this.m_data.length > 0) {
            if (this.m_ownsMemory) {
                this.m_allocator.deallocate(this.m_data);
            }
            this.m_data = [];
        }
    }

    /**
     * Return the number of elements in the array
     */
    size(): number {
        return this.m_size;
    }

    /**
     * Get element at index with bounds checking
     */
    at(n: number): T {
        btAssert(n >= 0, `Index ${n} is negative`);
        btAssert(n < this.size(), `Index ${n} is out of bounds (size: ${this.size()})`);
        return this.m_data[n];
    }

    /**
     * Set element at index with bounds checking
     */
    setAt(n: number, value: T): void {
        btAssert(n >= 0, `Index ${n} is negative`);
        btAssert(n < this.size(), `Index ${n} is out of bounds (size: ${this.size()})`);
        this.m_data[n] = value;
    }

    /**
     * Array access operator equivalent - get element at index
     */
    get(n: number): T {
        btAssert(n >= 0, `Index ${n} is negative`);
        btAssert(n < this.size(), `Index ${n} is out of bounds (size: ${this.size()})`);
        return this.m_data[n];
    }

    /**
     * Array access operator equivalent - set element at index
     */
    set(n: number, value: T): void {
        btAssert(n >= 0, `Index ${n} is negative`);
        btAssert(n < this.size(), `Index ${n} is out of bounds (size: ${this.size()})`);
        this.m_data[n] = value;
    }

    /**
     * Clear the array, deallocated memory. 
     * Generally it is better to use array.resize(0), to reduce performance overhead of run-time memory (de)allocations.
     */
    clear(): void {
        this.destroy(0, this.size());
        this.deallocate();
        this.init();
    }

    /**
     * Remove last element from array
     */
    pop_back(): void {
        btAssert(this.m_size > 0, "Cannot pop from empty array");
        this.m_size--;
        // In TypeScript, we don't need explicit destructor calls
        delete this.m_data[this.m_size];
    }

    /**
     * Resize without initialization - changes the number of elements but doesn't initialize new elements
     */
    resizeNoInitialize(newsize: number): void {
        if (newsize > this.size()) {
            this.reserve(newsize);
        }
        this.m_size = newsize;
    }

    /**
     * Resize changes the number of elements in the array. 
     * If the new size is larger, the new elements will be constructed using the optional fillData argument.
     * When the new number of elements is smaller, memory will not be freed, to reduce performance overhead of run-time memory (de)allocations.
     */
    resize(newsize: number, fillData?: T): void {
        const curSize = this.size();

        if (newsize < curSize) {
            // Shrinking - destroy extra elements
            for (let i = newsize; i < curSize; i++) {
                delete this.m_data[i];
            }
        } else if (newsize > curSize) {
            // Growing - reserve space and initialize new elements
            this.reserve(newsize);
            
            if (fillData !== undefined) {
                for (let i = curSize; i < newsize; i++) {
                    this.m_data[i] = fillData;
                }
            }
        }

        this.m_size = newsize;
    }

    /**
     * Expand array by one element without initialization
     */
    expandNonInitializing(): T {
        const sz = this.size();
        if (sz === this.capacity()) {
            this.reserve(this.allocSize(this.size()));
        }
        this.m_size++;

        // Return reference to the new element (uninitialized)
        return this.m_data[sz];
    }

    /**
     * Expand array by one element with optional fill value
     */
    expand(fillValue?: T): T {
        const sz = this.size();
        if (sz === this.capacity()) {
            this.reserve(this.allocSize(this.size()));
        }
        this.m_size++;

        // Initialize the new element
        if (fillValue !== undefined) {
            this.m_data[sz] = fillValue;
        }

        return this.m_data[sz];
    }

    /**
     * Add element to the end of the array
     */
    push_back(value: T): void {
        const sz = this.size();
        if (sz === this.capacity()) {
            this.reserve(this.allocSize(this.size()));
        }

        this.m_data[this.m_size] = value;
        this.m_size++;
    }

    /**
     * Return the pre-allocated (reserved) elements, this is at least as large as the total number of elements
     */
    capacity(): number {
        return this.m_capacity;
    }

    /**
     * Reserve memory for at least _Count elements
     */
    reserve(count: number): void {
        if (this.capacity() < count) {
            // Not enough room, reallocate
            const newData = this.allocate(count);
            if (!newData) {
                throw new Error("Failed to allocate memory");
            }

            // Copy existing elements
            this.copy(0, this.size(), newData);

            // Destroy old elements
            this.destroy(0, this.size());

            // Deallocate old memory
            this.deallocate();

            // Set new data
            this.m_ownsMemory = true;
            this.m_data = newData;
            this.m_capacity = count;
        }
    }

    /**
     * Swap two elements in the array
     */
    swap(index0: number, index1: number): void {
        const temp = this.m_data[index0];
        this.m_data[index0] = this.m_data[index1];
        this.m_data[index1] = temp;
    }

    /**
     * Internal quicksort implementation
     */
    private quickSortInternal<L extends CompareFunction<T>>(compareFunc: L, lo: number, hi: number): void {
        let i = lo, j = hi;
        const x = this.m_data[Math.floor((lo + hi) / 2)];

        // Partition
        do {
            while (compareFunc(this.m_data[i], x)) i++;
            while (compareFunc(x, this.m_data[j])) j--;
            if (i <= j) {
                this.swap(i, j);
                i++;
                j--;
            }
        } while (i <= j);

        // Recursion
        if (lo < j) {
            this.quickSortInternal(compareFunc, lo, j);
        }
        if (i < hi) {
            this.quickSortInternal(compareFunc, i, hi);
        }
    }

    /**
     * Quick sort the array using the provided comparison function
     */
    quickSort<L extends CompareFunction<T>>(compareFunc: L): void {
        // Don't sort 0 or 1 elements
        if (this.size() > 1) {
            this.quickSortInternal(compareFunc, 0, this.size() - 1);
        }
    }

    /**
     * Heap sort helper - down heap operation
     */
    private downHeap<L extends CompareFunction<T>>(pArr: T[], k: number, n: number, compareFunc: L): void {
        const temp = pArr[k - 1];
        
        // k has child(s)
        while (k <= Math.floor(n / 2)) {
            let child = 2 * k;

            if ((child < n) && compareFunc(pArr[child - 1], pArr[child])) {
                child++;
            }
            
            // Pick larger child
            if (compareFunc(temp, pArr[child - 1])) {
                // Move child up
                pArr[k - 1] = pArr[child - 1];
                k = child;
            } else {
                break;
            }
        }
        pArr[k - 1] = temp;
    }

    /**
     * Heap sort the array using the provided comparison function
     */
    heapSort<L extends CompareFunction<T>>(compareFunc: L): void {
        let n = this.m_size;
        
        // Build heap
        for (let k = Math.floor(n / 2); k > 0; k--) {
            this.downHeap(this.m_data, k, n, compareFunc);
        }

        // Sort
        while (n >= 1) {
            this.swap(0, n - 1); // Largest of a[0..n-1]
            n = n - 1;
            // Restore heap
            this.downHeap(this.m_data, 1, n, compareFunc);
        }
    }

    /**
     * Non-recursive binary search, assumes sorted array
     */
    findBinarySearch(key: T): number {
        let first = 0;
        let last = this.size() - 1;

        // Assume sorted array
        while (first <= last) {
            const mid = Math.floor((first + last) / 2);
            if ((key as any) > (this.m_data[mid] as any)) {
                first = mid + 1; // Repeat search in top half
            } else if ((key as any) < (this.m_data[mid] as any)) {
                last = mid - 1; // Repeat search in bottom half
            } else {
                return mid; // Found it, return position
            }
        }
        return this.size(); // Failed to find key
    }

    /**
     * Linear search for key in array
     */
    findLinearSearch(key: T): number {
        let index = this.size();
        
        for (let i = 0; i < this.size(); i++) {
            if (this.m_data[i] === key) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * Linear search for key in array
     * If the key is not in the array, return -1 instead of size(),
     * since 0 also means the first element in the array.
     */
    findLinearSearch2(key: T): number {
        let index = -1;
        
        for (let i = 0; i < this.size(); i++) {
            if (this.m_data[i] === key) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * Remove element at specified index
     */
    removeAtIndex(index: number): void {
        if (index < this.size()) {
            this.swap(index, this.size() - 1);
            this.pop_back();
        }
    }

    /**
     * Remove first occurrence of key from array
     */
    remove(key: T): void {
        const findIndex = this.findLinearSearch(key);
        this.removeAtIndex(findIndex);
    }

    /**
     * Initialize from external buffer (for memory-mapped scenarios)
     * Sets the array to use external memory without owning it
     */
    initializeFromBuffer(buffer: T[], size: number, capacity: number): void {
        this.clear();
        this.m_ownsMemory = false;
        this.m_data = buffer;
        this.m_size = size;
        this.m_capacity = capacity;
    }

    /**
     * Copy from another array
     */
    copyFromArray(otherArray: BtAlignedObjectArray<T>): void {
        const otherSize = otherArray.size();
        this.resize(otherSize);
        otherArray.copy(0, otherSize, this.m_data);
    }

    /**
     * Get the underlying data array (for compatibility with native JavaScript functions)
     * Note: This returns a reference to the internal array, so modifications will affect the original
     */
    getData(): T[] {
        return this.m_data.slice(0, this.m_size);
    }

    /**
     * Get a reference to the underlying data array (dangerous - for performance-critical code only)
     */
    getDataUnsafe(): T[] {
        return this.m_data;
    }

    /**
     * Check if array is empty
     */
    empty(): boolean {
        return this.m_size === 0;
    }

    /**
     * Get first element
     */
    front(): T {
        btAssert(this.m_size > 0, "Array is empty");
        return this.m_data[0];
    }

    /**
     * Get last element
     */
    back(): T {
        btAssert(this.m_size > 0, "Array is empty");
        return this.m_data[this.m_size - 1];
    }

    /**
     * Iterator support - for compatibility with for...of loops
     */
    *[Symbol.iterator](): Iterator<T> {
        for (let i = 0; i < this.m_size; i++) {
            yield this.m_data[i];
        }
    }

    /**
     * Convert to standard JavaScript array
     */
    toArray(): T[] {
        return this.m_data.slice(0, this.m_size);
    }

    /**
     * Static factory method to create from JavaScript array
     */
    static fromJSArray<T>(jsArray: T[]): BtAlignedObjectArray<T> {
        const btArray = new BtAlignedObjectArray<T>();
        btArray.resize(jsArray.length);
        for (let i = 0; i < jsArray.length; i++) {
            btArray.set(i, jsArray[i]);
        }
        return btArray;
    }
}

/**
 * Utility function to create a new btAlignedObjectArray
 */
export function createAlignedObjectArray<T>(): BtAlignedObjectArray<T> {
    return new BtAlignedObjectArray<T>();
}

/**
 * Utility function to create a btAlignedObjectArray from a JavaScript array
 */
export function createAlignedObjectArrayFromJS<T>(jsArray: T[]): BtAlignedObjectArray<T> {
    return BtAlignedObjectArray.fromJSArray(jsArray);
}