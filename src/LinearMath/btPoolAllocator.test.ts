/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.
*/

import { btPoolAllocator } from './btPoolAllocator';

describe('btPoolAllocator', () => {
    describe('constructor', () => {
        test('creates pool with correct parameters', () => {
            const allocator = new btPoolAllocator(32, 10);

            expect(allocator.getElementSize()).toBe(32);
            expect(allocator.getMaxCount()).toBe(10);
            expect(allocator.getFreeCount()).toBe(10);
            expect(allocator.getUsedCount()).toBe(0);
        });

        test('throws error for invalid parameters', () => {
            expect(() => new btPoolAllocator(0, 10)).toThrow();
            expect(() => new btPoolAllocator(32, 0)).toThrow();
            expect(() => new btPoolAllocator(-1, 10)).toThrow();
            expect(() => new btPoolAllocator(32, -1)).toThrow();
        });

        test('handles single element pool', () => {
            const allocator = new btPoolAllocator(16, 1);

            expect(allocator.getMaxCount()).toBe(1);
            expect(allocator.getFreeCount()).toBe(1);
            expect(allocator.getUsedCount()).toBe(0);
        });
    });

    describe('allocation', () => {
        let allocator: btPoolAllocator;

        beforeEach(() => {
            allocator = new btPoolAllocator(64, 5);
        });

        test('allocates objects successfully', async () => {
            const obj1 = await allocator.allocate();
            const obj2 = await allocator.allocate();

            expect(obj1).not.toBeNull();
            expect(obj2).not.toBeNull();
            expect(obj1).not.toBe(obj2);

            expect(allocator.getFreeCount()).toBe(3);
            expect(allocator.getUsedCount()).toBe(2);
        });

        test('returns null when pool is exhausted', async () => {
            // Allocate all available slots
            const objects = [];
            for (let i = 0; i < 5; i++) {
                const obj = await allocator.allocate();
                expect(obj).not.toBeNull();
                objects.push(obj);
            }

            expect(allocator.getFreeCount()).toBe(0);
            expect(allocator.getUsedCount()).toBe(5);

            // Next allocation should return null
            const extraObj = await allocator.allocate();
            expect(extraObj).toBeNull();
        });

        test('ignores size parameter when it is 0', async () => {
            const obj = await allocator.allocate(0);
            expect(obj).not.toBeNull();
        });

        test('allows allocation with size <= elemSize', async () => {
            const obj1 = await allocator.allocate(32);
            const obj2 = await allocator.allocate(64);

            expect(obj1).not.toBeNull();
            expect(obj2).not.toBeNull();
        });

        test('throws error for size > elemSize', async () => {
            await expect(allocator.allocate(128)).rejects.toThrow();
        });
    });

    describe('pointer validation', () => {
        let allocator: btPoolAllocator;
        let obj1: any, obj2: any;

        beforeEach(async () => {
            allocator = new btPoolAllocator(32, 3);
            obj1 = await allocator.allocate();
            obj2 = await allocator.allocate();
        });

        test('validates allocated pointers', () => {
            expect(allocator.validPtr(obj1)).toBe(true);
            expect(allocator.validPtr(obj2)).toBe(true);
        });

        test('rejects null pointer', () => {
            expect(allocator.validPtr(null)).toBe(false);
        });

        test('rejects undefined pointer', () => {
            expect(allocator.validPtr(undefined)).toBe(false);
        });

        test('rejects external objects', () => {
            const externalObj = {};
            expect(allocator.validPtr(externalObj)).toBe(false);
        });

        test('rejects freed pointers', async () => {
            expect(allocator.validPtr(obj1)).toBe(true);

            await allocator.freeMemory(obj1);
            expect(allocator.validPtr(obj1)).toBe(false);
        });
    });

    describe('memory deallocation', () => {
        let allocator: btPoolAllocator;

        beforeEach(() => {
            allocator = new btPoolAllocator(48, 4);
        });

        test('frees memory correctly', async () => {
            const obj = await allocator.allocate();
            expect(allocator.getFreeCount()).toBe(3);
            expect(allocator.getUsedCount()).toBe(1);

            await allocator.freeMemory(obj);
            expect(allocator.getFreeCount()).toBe(4);
            expect(allocator.getUsedCount()).toBe(0);
        });

        test('allows reallocation after freeing', async () => {
            const obj1 = await allocator.allocate();
            await allocator.freeMemory(obj1);

            const obj2 = await allocator.allocate();
            expect(obj2).not.toBeNull();
            expect(allocator.getUsedCount()).toBe(1);
        });

        test('handles freeing null pointer gracefully', async () => {
            const initialFree = allocator.getFreeCount();
            await allocator.freeMemory(null);
            expect(allocator.getFreeCount()).toBe(initialFree);
        });

        test('handles freeing undefined pointer gracefully', async () => {
            const initialFree = allocator.getFreeCount();
            await allocator.freeMemory(undefined);
            expect(allocator.getFreeCount()).toBe(initialFree);
        });

        test('ignores freeing external objects', async () => {
            const externalObj = {};
            const initialFree = allocator.getFreeCount();

            await allocator.freeMemory(externalObj);
            expect(allocator.getFreeCount()).toBe(initialFree);
        });
    });

    describe('pool reset', () => {
        let allocator: btPoolAllocator;

        beforeEach(() => {
            allocator = new btPoolAllocator(16, 3);
        });

        test('resets pool to initial state', async () => {
            // Allocate some objects
            const obj1 = await allocator.allocate();
            const obj2 = await allocator.allocate();

            expect(allocator.getUsedCount()).toBe(2);
            expect(allocator.getFreeCount()).toBe(1);

            // Reset the pool
            await allocator.reset();

            expect(allocator.getUsedCount()).toBe(0);
            expect(allocator.getFreeCount()).toBe(3);

            // Previously allocated objects should no longer be valid
            expect(allocator.validPtr(obj1)).toBe(false);
            expect(allocator.validPtr(obj2)).toBe(false);
        });

        test('allows full reallocation after reset', async () => {
            // Fill the pool
            const objects = [];
            for (let i = 0; i < 3; i++) {
                objects.push(await allocator.allocate());
            }
            expect(allocator.getFreeCount()).toBe(0);

            // Reset and reallocate
            await allocator.reset();

            for (let i = 0; i < 3; i++) {
                const obj = await allocator.allocate();
                expect(obj).not.toBeNull();
            }

            expect(allocator.getFreeCount()).toBe(0);
            expect(allocator.getUsedCount()).toBe(3);
        });
    });

    describe('debug information', () => {
        let allocator: btPoolAllocator;

        beforeEach(() => {
            allocator = new btPoolAllocator(128, 8);
        });

        test('provides correct debug information initially', () => {
            const info = allocator.getDebugInfo();

            expect(info.elemSize).toBe(128);
            expect(info.maxElements).toBe(8);
            expect(info.freeCount).toBe(8);
            expect(info.usedCount).toBe(0);
            expect(info.allocatedPointers).toBe(0);
        });

        test('updates debug information after allocations', async () => {
            await allocator.allocate();
            await allocator.allocate();
            await allocator.allocate();

            const info = allocator.getDebugInfo();

            expect(info.freeCount).toBe(5);
            expect(info.usedCount).toBe(3);
            expect(info.allocatedPointers).toBe(3);
        });

        test('updates debug information after deallocations', async () => {
            const obj1 = await allocator.allocate();
            await allocator.allocate();

            await allocator.freeMemory(obj1);

            const info = allocator.getDebugInfo();

            expect(info.freeCount).toBe(7);
            expect(info.usedCount).toBe(1);
            expect(info.allocatedPointers).toBe(1);
        });
    });

    describe('pool address access', () => {
        test('provides readonly pool address', () => {
            const allocator = new btPoolAllocator(32, 5);
            const poolAddress = allocator.getPoolAddress();

            expect(poolAddress).toBeDefined();
            expect(Array.isArray(poolAddress)).toBe(true);
            expect(poolAddress.length).toBe(5);

            // Should be readonly - TypeScript compile-time check
            // poolAddress[0] = null; // This would cause a TypeScript error
        });
    });

    describe('concurrent access', () => {
        let allocator: btPoolAllocator;

        beforeEach(() => {
            allocator = new btPoolAllocator(64, 10);
        });

        test('handles concurrent allocations', async () => {
            const promises: Promise<any>[] = [];

            // Start multiple concurrent allocations
            for (let i = 0; i < 5; i++) {
                promises.push(allocator.allocate());
            }

            const results = await Promise.all(promises);

            // All allocations should succeed and return unique objects
            expect(results.every(obj => obj !== null)).toBe(true);
            expect(new Set(results).size).toBe(5); // All should be unique
            expect(allocator.getUsedCount()).toBe(5);
        });

        test('handles concurrent deallocations', async () => {
            // Allocate some objects
            const objects = [];
            for (let i = 0; i < 5; i++) {
                objects.push(await allocator.allocate());
            }

            // Free them concurrently
            const freePromises = objects.map(obj => allocator.freeMemory(obj));
            await Promise.all(freePromises);

            expect(allocator.getUsedCount()).toBe(0);
            expect(allocator.getFreeCount()).toBe(10);
        });
    });

    describe('edge cases', () => {
        test('handles very large pool', () => {
            const allocator = new btPoolAllocator(8, 1000);
            expect(allocator.getMaxCount()).toBe(1000);
            expect(allocator.getFreeCount()).toBe(1000);
        });

        test('handles small element size', () => {
            const allocator = new btPoolAllocator(1, 5);
            expect(allocator.getElementSize()).toBe(1);
        });

        test('maintains consistency after multiple alloc/free cycles', async () => {
            const allocator = new btPoolAllocator(32, 3);

            // Perform multiple allocation/deallocation cycles
            for (let cycle = 0; cycle < 10; cycle++) {
                const objects = [];

                // Allocate all
                for (let i = 0; i < 3; i++) {
                    objects.push(await allocator.allocate());
                }
                expect(allocator.getFreeCount()).toBe(0);

                // Free all
                for (const obj of objects) {
                    await allocator.freeMemory(obj);
                }
                expect(allocator.getFreeCount()).toBe(3);
                expect(allocator.getUsedCount()).toBe(0);
            }
        });
    });
});