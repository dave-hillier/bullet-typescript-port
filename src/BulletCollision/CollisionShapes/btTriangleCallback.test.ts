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

import { btTriangleCallback, btInternalTriangleIndexCallback } from './btTriangleCallback';
import { btVector3 } from '../../LinearMath/btVector3';

// Test implementation of btTriangleCallback
class TestTriangleCallback extends btTriangleCallback {
    public triangles: btVector3[][] = [];
    public partIds: number[] = [];
    public triangleIndices: number[] = [];
    public cleanupCalled = false;

    processTriangle(triangle: btVector3[], partId: number, triangleIndex: number): void {
        // Store a copy of the triangle for testing
        this.triangles.push([
            new btVector3(triangle[0]),
            new btVector3(triangle[1]),
            new btVector3(triangle[2])
        ]);
        this.partIds.push(partId);
        this.triangleIndices.push(triangleIndex);
    }

    cleanup(): void {
        this.cleanupCalled = true;
        this.triangles = [];
        this.partIds = [];
        this.triangleIndices = [];
    }
}

// Test implementation of btInternalTriangleIndexCallback
class TestInternalTriangleIndexCallback extends btInternalTriangleIndexCallback {
    public triangles: btVector3[][] = [];
    public partIds: number[] = [];
    public triangleIndices: number[] = [];
    public cleanupCalled = false;

    internalProcessTriangleIndex(triangle: btVector3[], partId: number, triangleIndex: number): void {
        // Store a copy of the triangle for testing
        this.triangles.push([
            new btVector3(triangle[0]),
            new btVector3(triangle[1]),
            new btVector3(triangle[2])
        ]);
        this.partIds.push(partId);
        this.triangleIndices.push(triangleIndex);
    }

    cleanup(): void {
        this.cleanupCalled = true;
        this.triangles = [];
        this.partIds = [];
        this.triangleIndices = [];
    }
}

describe('btTriangleCallback', () => {
    let callback: TestTriangleCallback;

    beforeEach(() => {
        callback = new TestTriangleCallback();
    });

    describe('abstract class behavior', () => {
        it('should be able to instantiate concrete implementation', () => {
            expect(callback).toBeDefined();
            expect(callback).toBeInstanceOf(btTriangleCallback);
            expect(callback).toBeInstanceOf(TestTriangleCallback);
        });

        it('should have processTriangle method implemented', () => {
            expect(typeof callback.processTriangle).toBe('function');
        });

        it('should have cleanup method available', () => {
            expect(typeof callback.cleanup).toBe('function');
        });
    });

    describe('processTriangle method', () => {
        it('should process a simple triangle', () => {
            const triangle = [
                new btVector3(0, 0, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0)
            ];
            const partId = 1;
            const triangleIndex = 5;

            callback.processTriangle(triangle, partId, triangleIndex);

            expect(callback.triangles).toHaveLength(1);
            expect(callback.partIds).toHaveLength(1);
            expect(callback.triangleIndices).toHaveLength(1);

            // Check triangle vertices
            expect(callback.triangles[0][0].x()).toBe(0);
            expect(callback.triangles[0][0].y()).toBe(0);
            expect(callback.triangles[0][0].z()).toBe(0);
            expect(callback.triangles[0][1].x()).toBe(1);
            expect(callback.triangles[0][1].y()).toBe(0);
            expect(callback.triangles[0][1].z()).toBe(0);
            expect(callback.triangles[0][2].x()).toBe(0);
            expect(callback.triangles[0][2].y()).toBe(1);
            expect(callback.triangles[0][2].z()).toBe(0);

            // Check metadata
            expect(callback.partIds[0]).toBe(partId);
            expect(callback.triangleIndices[0]).toBe(triangleIndex);
        });

        it('should process multiple triangles', () => {
            const triangle1 = [
                new btVector3(0, 0, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0)
            ];
            const triangle2 = [
                new btVector3(2, 0, 0),
                new btVector3(3, 0, 0),
                new btVector3(2, 1, 0)
            ];

            callback.processTriangle(triangle1, 0, 1);
            callback.processTriangle(triangle2, 1, 2);

            expect(callback.triangles).toHaveLength(2);
            expect(callback.partIds).toEqual([0, 1]);
            expect(callback.triangleIndices).toEqual([1, 2]);
        });

        it('should handle triangles with negative coordinates', () => {
            const triangle = [
                new btVector3(-1, -1, -1),
                new btVector3(1, -1, -1),
                new btVector3(0, 1, -1)
            ];

            callback.processTriangle(triangle, 0, 0);

            expect(callback.triangles[0][0].x()).toBe(-1);
            expect(callback.triangles[0][0].y()).toBe(-1);
            expect(callback.triangles[0][0].z()).toBe(-1);
        });

        it('should handle different part IDs and triangle indices', () => {
            const triangle = [
                new btVector3(0, 0, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0)
            ];

            callback.processTriangle(triangle, 999, 12345);

            expect(callback.partIds[0]).toBe(999);
            expect(callback.triangleIndices[0]).toBe(12345);
        });
    });

    describe('cleanup method', () => {
        it('should have default cleanup implementation', () => {
            // The base class cleanup should do nothing by default
            expect(() => callback.cleanup()).not.toThrow();
        });

        it('should call cleanup method when implemented', () => {
            callback.cleanup();
            expect(callback.cleanupCalled).toBe(true);
        });
    });
});

describe('btInternalTriangleIndexCallback', () => {
    let callback: TestInternalTriangleIndexCallback;

    beforeEach(() => {
        callback = new TestInternalTriangleIndexCallback();
    });

    describe('abstract class behavior', () => {
        it('should be able to instantiate concrete implementation', () => {
            expect(callback).toBeDefined();
            expect(callback).toBeInstanceOf(btInternalTriangleIndexCallback);
            expect(callback).toBeInstanceOf(TestInternalTriangleIndexCallback);
        });

        it('should have internalProcessTriangleIndex method implemented', () => {
            expect(typeof callback.internalProcessTriangleIndex).toBe('function');
        });

        it('should have cleanup method available', () => {
            expect(typeof callback.cleanup).toBe('function');
        });
    });

    describe('internalProcessTriangleIndex method', () => {
        it('should process a simple triangle internally', () => {
            const triangle = [
                new btVector3(1, 2, 3),
                new btVector3(4, 5, 6),
                new btVector3(7, 8, 9)
            ];
            const partId = 2;
            const triangleIndex = 10;

            callback.internalProcessTriangleIndex(triangle, partId, triangleIndex);

            expect(callback.triangles).toHaveLength(1);
            expect(callback.partIds).toHaveLength(1);
            expect(callback.triangleIndices).toHaveLength(1);

            // Check triangle vertices
            expect(callback.triangles[0][0].x()).toBe(1);
            expect(callback.triangles[0][0].y()).toBe(2);
            expect(callback.triangles[0][0].z()).toBe(3);
            expect(callback.triangles[0][1].x()).toBe(4);
            expect(callback.triangles[0][1].y()).toBe(5);
            expect(callback.triangles[0][1].z()).toBe(6);
            expect(callback.triangles[0][2].x()).toBe(7);
            expect(callback.triangles[0][2].y()).toBe(8);
            expect(callback.triangles[0][2].z()).toBe(9);

            // Check metadata
            expect(callback.partIds[0]).toBe(partId);
            expect(callback.triangleIndices[0]).toBe(triangleIndex);
        });

        it('should process multiple triangles internally', () => {
            const triangle1 = [
                new btVector3(0, 0, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0)
            ];
            const triangle2 = [
                new btVector3(1, 1, 1),
                new btVector3(2, 1, 1),
                new btVector3(1, 2, 1)
            ];

            callback.internalProcessTriangleIndex(triangle1, 1, 100);
            callback.internalProcessTriangleIndex(triangle2, 2, 200);

            expect(callback.triangles).toHaveLength(2);
            expect(callback.partIds).toEqual([1, 2]);
            expect(callback.triangleIndices).toEqual([100, 200]);
        });

        it('should handle zero values correctly', () => {
            const triangle = [
                new btVector3(0, 0, 0),
                new btVector3(0, 0, 0),
                new btVector3(0, 0, 0)
            ];

            callback.internalProcessTriangleIndex(triangle, 0, 0);

            expect(callback.triangles[0]).toHaveLength(3);
            expect(callback.triangles[0][0].isZero()).toBe(true);
            expect(callback.triangles[0][1].isZero()).toBe(true);
            expect(callback.triangles[0][2].isZero()).toBe(true);
        });
    });

    describe('cleanup method', () => {
        it('should have default cleanup implementation', () => {
            // The base class cleanup should do nothing by default
            expect(() => callback.cleanup()).not.toThrow();
        });

        it('should call cleanup method when implemented', () => {
            callback.cleanup();
            expect(callback.cleanupCalled).toBe(true);
        });
    });
});

describe('callback interface compatibility', () => {
    it('should allow both callbacks to be used polymorphically', () => {
        const triangleCallback: btTriangleCallback = new TestTriangleCallback();
        const internalCallback: btInternalTriangleIndexCallback = new TestInternalTriangleIndexCallback();

        expect(triangleCallback).toBeInstanceOf(btTriangleCallback);
        expect(internalCallback).toBeInstanceOf(btInternalTriangleIndexCallback);

        // Both should have cleanup methods
        expect(typeof triangleCallback.cleanup).toBe('function');
        expect(typeof internalCallback.cleanup).toBe('function');
    });
});