/*
Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

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
 * Unit tests for btAabbUtil2.ts
 * Tests AABB utility functions for correctness and edge cases
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
    AabbExpand,
    TestPointAgainstAabb2,
    TestAabbAgainstAabb2,
    TestTriangleAgainstAabb2,
    btOutcode,
    btRayAabb2,
    btRayAabb,
    btTransformAabb,
    btTransformAabbOverload,
    testQuantizedAabbAgainstQuantizedAabb
} from './btAabbUtil2';
import { btVector3 } from './btVector3';
import { btTransform } from './btTransform';

describe('btAabbUtil2', () => {
    let aabbMin: btVector3;
    let aabbMax: btVector3;

    beforeEach(() => {
        aabbMin = new btVector3(-1, -1, -1);
        aabbMax = new btVector3(1, 1, 1);
    });

    describe('AabbExpand', () => {
        it('should expand AABB correctly with positive expansion', () => {
            const expansionMin = new btVector3(-0.5, -0.5, -0.5);
            const expansionMax = new btVector3(0.5, 0.5, 0.5);
            const originalMin = aabbMin.clone();
            const originalMax = aabbMax.clone();

            AabbExpand(aabbMin, aabbMax, expansionMin, expansionMax);

            expect(aabbMin.getX()).toBeCloseTo(originalMin.getX() - 0.5, 5);
            expect(aabbMin.getY()).toBeCloseTo(originalMin.getY() - 0.5, 5);
            expect(aabbMin.getZ()).toBeCloseTo(originalMin.getZ() - 0.5, 5);
            expect(aabbMax.getX()).toBeCloseTo(originalMax.getX() + 0.5, 5);
            expect(aabbMax.getY()).toBeCloseTo(originalMax.getY() + 0.5, 5);
            expect(aabbMax.getZ()).toBeCloseTo(originalMax.getZ() + 0.5, 5);
        });

        it('should handle zero expansion', () => {
            const expansionMin = new btVector3(0, 0, 0);
            const expansionMax = new btVector3(0, 0, 0);
            const originalMin = aabbMin.clone();
            const originalMax = aabbMax.clone();

            AabbExpand(aabbMin, aabbMax, expansionMin, expansionMax);

            expect(aabbMin.equals(originalMin)).toBe(true);
            expect(aabbMax.equals(originalMax)).toBe(true);
        });
    });

    describe('TestPointAgainstAabb2', () => {
        it('should return true for point inside AABB', () => {
            const point = new btVector3(0, 0, 0);
            const result = TestPointAgainstAabb2(aabbMin, aabbMax, point);
            expect(result).toBe(true);
        });

        it('should return true for point on AABB boundary', () => {
            const point = new btVector3(1, 0, 0);
            const result = TestPointAgainstAabb2(aabbMin, aabbMax, point);
            expect(result).toBe(true);
        });

        it('should return false for point outside AABB', () => {
            const point = new btVector3(2, 0, 0);
            const result = TestPointAgainstAabb2(aabbMin, aabbMax, point);
            expect(result).toBe(false);
        });

        it('should return false for point outside in multiple dimensions', () => {
            const point = new btVector3(2, 2, 2);
            const result = TestPointAgainstAabb2(aabbMin, aabbMax, point);
            expect(result).toBe(false);
        });
    });

    describe('TestAabbAgainstAabb2', () => {
        it('should return true for overlapping AABBs', () => {
            const min2 = new btVector3(-0.5, -0.5, -0.5);
            const max2 = new btVector3(1.5, 1.5, 1.5);
            const result = TestAabbAgainstAabb2(aabbMin, aabbMax, min2, max2);
            expect(result).toBe(true);
        });

        it('should return true for touching AABBs', () => {
            const min2 = new btVector3(1, -1, -1);
            const max2 = new btVector3(2, 1, 1);
            const result = TestAabbAgainstAabb2(aabbMin, aabbMax, min2, max2);
            expect(result).toBe(true);
        });

        it('should return false for non-overlapping AABBs', () => {
            const min2 = new btVector3(2, -1, -1);
            const max2 = new btVector3(3, 1, 1);
            const result = TestAabbAgainstAabb2(aabbMin, aabbMax, min2, max2);
            expect(result).toBe(false);
        });

        it('should return true for identical AABBs', () => {
            const result = TestAabbAgainstAabb2(aabbMin, aabbMax, aabbMin.clone(), aabbMax.clone());
            expect(result).toBe(true);
        });

        it('should return false for AABBs separated in single dimension', () => {
            const min2 = new btVector3(-1, -1, 2);
            const max2 = new btVector3(1, 1, 3);
            const result = TestAabbAgainstAabb2(aabbMin, aabbMax, min2, max2);
            expect(result).toBe(false);
        });
    });

    describe('TestTriangleAgainstAabb2', () => {
        it('should return true for triangle inside AABB', () => {
            const vertices = [
                new btVector3(0, 0, 0),
                new btVector3(0.5, 0, 0),
                new btVector3(0, 0.5, 0)
            ];
            const result = TestTriangleAgainstAabb2(vertices, aabbMin, aabbMax);
            expect(result).toBe(true);
        });

        it('should return true for triangle intersecting AABB', () => {
            const vertices = [
                new btVector3(-2, -2, 0),
                new btVector3(2, 0, 0),
                new btVector3(0, 2, 0)
            ];
            const result = TestTriangleAgainstAabb2(vertices, aabbMin, aabbMax);
            expect(result).toBe(true);
        });

        it('should return false for triangle outside AABB', () => {
            const vertices = [
                new btVector3(2, 2, 2),
                new btVector3(3, 2, 2),
                new btVector3(2, 3, 2)
            ];
            const result = TestTriangleAgainstAabb2(vertices, aabbMin, aabbMax);
            expect(result).toBe(false);
        });

        it('should return false for triangle separated in X dimension', () => {
            const vertices = [
                new btVector3(2, -0.5, -0.5),
                new btVector3(2, 0.5, -0.5),
                new btVector3(2, 0, 0.5)
            ];
            const result = TestTriangleAgainstAabb2(vertices, aabbMin, aabbMax);
            expect(result).toBe(false);
        });
    });

    describe('btOutcode', () => {
        it('should return 0 for point inside half extents', () => {
            const point = new btVector3(0, 0, 0);
            const halfExtent = new btVector3(1, 1, 1);
            const result = btOutcode(point, halfExtent);
            expect(result).toBe(0);
        });

        it('should return correct outcode for point outside in positive X', () => {
            const point = new btVector3(2, 0, 0);
            const halfExtent = new btVector3(1, 1, 1);
            const result = btOutcode(point, halfExtent);
            expect(result & 0x08).toBe(0x08); // Positive X bit
        });

        it('should return correct outcode for point outside in negative X', () => {
            const point = new btVector3(-2, 0, 0);
            const halfExtent = new btVector3(1, 1, 1);
            const result = btOutcode(point, halfExtent);
            expect(result & 0x01).toBe(0x01); // Negative X bit
        });

        it('should return correct outcode for point outside in multiple dimensions', () => {
            const point = new btVector3(2, 2, 2);
            const halfExtent = new btVector3(1, 1, 1);
            const result = btOutcode(point, halfExtent);
            expect(result & 0x08).toBe(0x08); // Positive X
            expect(result & 0x10).toBe(0x10); // Positive Y
            expect(result & 0x20).toBe(0x20); // Positive Z
        });
    });

    describe('btRayAabb2', () => {
        it('should detect intersection for ray passing through AABB', () => {
            const rayFrom = new btVector3(-2, 0, 0);
            const rayInvDirection = new btVector3(1, 1, 1); // Direction (1,1,1) -> inv (1,1,1)
            const raySign = [0, 0, 0]; // All positive
            const bounds = [aabbMin, aabbMax];
            const tmin = { value: 0 };

            const result = btRayAabb2(rayFrom, rayInvDirection, raySign, bounds, tmin, 0, 10);
            
            expect(result).toBe(true);
            expect(tmin.value).toBeGreaterThan(0);
        });

        it('should not detect intersection for ray missing AABB', () => {
            const rayFrom = new btVector3(-2, 2, 0);
            const rayInvDirection = new btVector3(1, 0, 0); // Direction (1,0,0) -> inv (1,inf,inf)
            const raySign = [0, 0, 0];
            const bounds = [aabbMin, aabbMax];
            const tmin = { value: 0 };

            const result = btRayAabb2(rayFrom, rayInvDirection, raySign, bounds, tmin, 0, 10);
            
            expect(result).toBe(false);
        });
    });

    describe('btRayAabb', () => {
        it('should detect intersection and compute normal', () => {
            const rayFrom = new btVector3(-2, 0, 0);
            const rayTo = new btVector3(2, 0, 0);
            const param = { value: 1.0 };
            const normal = new btVector3();

            const result = btRayAabb(rayFrom, rayTo, aabbMin, aabbMax, param, normal);

            expect(result).toBe(true);
            expect(param.value).toBeLessThan(1.0);
            expect(param.value).toBeGreaterThan(0);
            // Normal should point towards the ray origin
            expect(Math.abs(normal.getX())).toBeCloseTo(1, 5);
            expect(normal.getY()).toBeCloseTo(0, 5);
            expect(normal.getZ()).toBeCloseTo(0, 5);
        });

        it('should not detect intersection for ray missing AABB', () => {
            const rayFrom = new btVector3(-2, 2, 0);
            const rayTo = new btVector3(2, 2, 0);
            const param = { value: 1.0 };
            const normal = new btVector3();

            const result = btRayAabb(rayFrom, rayTo, aabbMin, aabbMax, param, normal);

            expect(result).toBe(false);
        });

        it('should handle ray starting inside AABB', () => {
            const rayFrom = new btVector3(0, 0, 0);
            const rayTo = new btVector3(2, 0, 0);
            const param = { value: 1.0 };
            const normal = new btVector3();

            const result = btRayAabb(rayFrom, rayTo, aabbMin, aabbMax, param, normal);

            expect(result).toBe(true);
        });
    });

    describe('btTransformAabb', () => {
        it('should transform AABB with identity transform', () => {
            const halfExtents = new btVector3(1, 1, 1);
            const margin = 0;
            const identityTransform = new btTransform();
            identityTransform.setIdentity();
            const aabbMinOut = new btVector3();
            const aabbMaxOut = new btVector3();

            btTransformAabb(halfExtents, margin, identityTransform, aabbMinOut, aabbMaxOut);

            expect(aabbMinOut.getX()).toBeCloseTo(-1, 5);
            expect(aabbMinOut.getY()).toBeCloseTo(-1, 5);
            expect(aabbMinOut.getZ()).toBeCloseTo(-1, 5);
            expect(aabbMaxOut.getX()).toBeCloseTo(1, 5);
            expect(aabbMaxOut.getY()).toBeCloseTo(1, 5);
            expect(aabbMaxOut.getZ()).toBeCloseTo(1, 5);
        });

        it('should apply margin correctly', () => {
            const halfExtents = new btVector3(1, 1, 1);
            const margin = 0.5;
            const identityTransform = new btTransform();
            identityTransform.setIdentity();
            const aabbMinOut = new btVector3();
            const aabbMaxOut = new btVector3();

            btTransformAabb(halfExtents, margin, identityTransform, aabbMinOut, aabbMaxOut);

            expect(aabbMinOut.getX()).toBeCloseTo(-1.5, 5);
            expect(aabbMinOut.getY()).toBeCloseTo(-1.5, 5);
            expect(aabbMinOut.getZ()).toBeCloseTo(-1.5, 5);
            expect(aabbMaxOut.getX()).toBeCloseTo(1.5, 5);
            expect(aabbMaxOut.getY()).toBeCloseTo(1.5, 5);
            expect(aabbMaxOut.getZ()).toBeCloseTo(1.5, 5);
        });

        it('should transform AABB with translation', () => {
            const halfExtents = new btVector3(1, 1, 1);
            const margin = 0;
            const transform = new btTransform();
            transform.setIdentity();
            transform.setOrigin(new btVector3(2, 3, 4));
            const aabbMinOut = new btVector3();
            const aabbMaxOut = new btVector3();

            btTransformAabb(halfExtents, margin, transform, aabbMinOut, aabbMaxOut);

            expect(aabbMinOut.getX()).toBeCloseTo(1, 5);
            expect(aabbMinOut.getY()).toBeCloseTo(2, 5);
            expect(aabbMinOut.getZ()).toBeCloseTo(3, 5);
            expect(aabbMaxOut.getX()).toBeCloseTo(3, 5);
            expect(aabbMaxOut.getY()).toBeCloseTo(4, 5);
            expect(aabbMaxOut.getZ()).toBeCloseTo(5, 5);
        });
    });

    describe('btTransformAabbOverload', () => {
        it('should transform AABB from min/max bounds', () => {
            const localMin = new btVector3(-1, -1, -1);
            const localMax = new btVector3(1, 1, 1);
            const margin = 0;
            const identityTransform = new btTransform();
            identityTransform.setIdentity();
            const aabbMinOut = new btVector3();
            const aabbMaxOut = new btVector3();

            btTransformAabbOverload(localMin, localMax, margin, identityTransform, aabbMinOut, aabbMaxOut);

            expect(aabbMinOut.getX()).toBeCloseTo(-1, 5);
            expect(aabbMinOut.getY()).toBeCloseTo(-1, 5);
            expect(aabbMinOut.getZ()).toBeCloseTo(-1, 5);
            expect(aabbMaxOut.getX()).toBeCloseTo(1, 5);
            expect(aabbMaxOut.getY()).toBeCloseTo(1, 5);
            expect(aabbMaxOut.getZ()).toBeCloseTo(1, 5);
        });

        it('should throw assertion error for invalid AABB bounds', () => {
            const localMin = new btVector3(1, 1, 1);
            const localMax = new btVector3(-1, -1, -1); // Invalid: min > max
            const margin = 0;
            const identityTransform = new btTransform();
            const aabbMinOut = new btVector3();
            const aabbMaxOut = new btVector3();

            expect(() => {
                btTransformAabbOverload(localMin, localMax, margin, identityTransform, aabbMinOut, aabbMaxOut);
            }).toThrow();
        });
    });

    describe('testQuantizedAabbAgainstQuantizedAabb', () => {
        it('should return 1 for overlapping quantized AABBs', () => {
            const min1 = [0, 0, 0];
            const max1 = [100, 100, 100];
            const min2 = [50, 50, 50];
            const max2 = [150, 150, 150];

            const result = testQuantizedAabbAgainstQuantizedAabb(min1, max1, min2, max2);
            expect(result).toBe(1);
        });

        it('should return 0 for non-overlapping quantized AABBs', () => {
            const min1 = [0, 0, 0];
            const max1 = [50, 50, 50];
            const min2 = [100, 100, 100];
            const max2 = [150, 150, 150];

            const result = testQuantizedAabbAgainstQuantizedAabb(min1, max1, min2, max2);
            expect(result).toBe(0);
        });

        it('should return 1 for touching quantized AABBs', () => {
            const min1 = [0, 0, 0];
            const max1 = [50, 50, 50];
            const min2 = [50, 0, 0];
            const max2 = [100, 50, 50];

            const result = testQuantizedAabbAgainstQuantizedAabb(min1, max1, min2, max2);
            expect(result).toBe(1);
        });

        it('should return 0 for AABBs separated in one dimension', () => {
            const min1 = [0, 0, 0];
            const max1 = [100, 100, 100];
            const min2 = [0, 0, 200];
            const max2 = [100, 100, 300];

            const result = testQuantizedAabbAgainstQuantizedAabb(min1, max1, min2, max2);
            expect(result).toBe(0);
        });
    });

    describe('Edge cases and numerical stability', () => {
        it('should handle very small AABBs', () => {
            const epsilon = 1e-10;
            const minAABB = new btVector3(-epsilon, -epsilon, -epsilon);
            const maxAABB = new btVector3(epsilon, epsilon, epsilon);
            const point = new btVector3(0, 0, 0);

            const result = TestPointAgainstAabb2(minAABB, maxAABB, point);
            expect(result).toBe(true);
        });

        it('should handle very large AABBs', () => {
            const large = 1e6;
            const minAABB = new btVector3(-large, -large, -large);
            const maxAABB = new btVector3(large, large, large);
            const point = new btVector3(100, 100, 100);

            const result = TestPointAgainstAabb2(minAABB, maxAABB, point);
            expect(result).toBe(true);
        });

        it('should handle zero-volume AABB', () => {
            const point = new btVector3(1, 1, 1);
            const zeroAABB = new btVector3(1, 1, 1);

            const result = TestPointAgainstAabb2(zeroAABB, zeroAABB, point);
            expect(result).toBe(true);
        });
    });
});