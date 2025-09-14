/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org
*/

import { btOptimizedBvh } from './btOptimizedBvh';
import { btStridingMeshInterface, VertexIndexData } from './btStridingMeshInterface';
import { btVector3 } from '../../LinearMath/btVector3';
import { PHY_ScalarType } from './btConcaveShape';

/**
 * Mock implementation of btStridingMeshInterface for testing
 */
class MockTriangleMesh extends btStridingMeshInterface {
    private vertices: Float32Array;
    private indices: Uint32Array;
    private locked = false;

    constructor(vertices: number[], indices: number[]) {
        super();
        this.vertices = new Float32Array(vertices);
        this.indices = new Uint32Array(indices);
    }

    getLockedVertexIndexBase(_subpart: number): VertexIndexData {
        this.locked = true;
        return {
            vertexbase: this.vertices,
            indexbase: this.indices,
            numverts: this.vertices.length / 3,
            type: PHY_ScalarType.PHY_FLOAT,
            stride: 12,
            numfaces: this.indices.length / 3,
            indicestype: PHY_ScalarType.PHY_INTEGER,
            indexstride: 12
        };
    }

    getLockedReadOnlyVertexIndexBase(subpart: number): VertexIndexData {
        return this.getLockedVertexIndexBase(subpart);
    }

    unLockVertexBase(_subpart: number): void {
        this.locked = false;
    }

    unLockReadOnlyVertexBase(_subpart: number): void {
        this.locked = false;
    }

    getNumSubParts(): number {
        return 1;
    }

    preallocateVertices(_numverts: number): void {
        // Mock implementation
    }

    preallocateIndices(_numindices: number): void {
        // Mock implementation
    }

    isLocked(): boolean {
        return this.locked;
    }
}

describe('btOptimizedBvh', () => {
    let optimizedBvh: btOptimizedBvh;
    let triangleMesh: MockTriangleMesh;

    beforeEach(() => {
        optimizedBvh = new btOptimizedBvh();

        // Create a simple triangle mesh
        const vertices = [
            -1, -1, 0,  // vertex 0
             1, -1, 0,  // vertex 1
            -1,  1, 0,  // vertex 2
             1, -1, 0,  // vertex 3
             1,  1, 0,  // vertex 4
            -1,  1, 0   // vertex 5
        ];

        const indices = [
            0, 1, 2,  // Triangle 1
            3, 4, 5   // Triangle 2
        ];

        triangleMesh = new MockTriangleMesh(vertices, indices);
    });

    afterEach(() => {
        optimizedBvh.cleanup();
    });

    describe('Constructor', () => {
        test('should create a new btOptimizedBvh instance', () => {
            expect(optimizedBvh).toBeInstanceOf(btOptimizedBvh);
        });

        test('should initialize properly', () => {
            expect(optimizedBvh.getSubtreeInfoArray().length).toBe(0);
            expect(optimizedBvh.isQuantized()).toBe(false);
        });
    });

    describe('build', () => {
        test('should build BVH without quantization', () => {
            const aabbMin = new btVector3(-2, -2, -1);
            const aabbMax = new btVector3(2, 2, 1);

            expect(() => {
                optimizedBvh.build(triangleMesh, false, aabbMin, aabbMax);
            }).not.toThrow();

            expect(optimizedBvh.isQuantized()).toBe(false);
        });

        test('should build BVH with quantization', () => {
            const aabbMin = new btVector3(-2, -2, -1);
            const aabbMax = new btVector3(2, 2, 1);

            expect(() => {
                optimizedBvh.build(triangleMesh, true, aabbMin, aabbMax);
            }).not.toThrow();

            expect(optimizedBvh.isQuantized()).toBe(true);
        });

        test('should create subtree headers for quantized build', () => {
            const aabbMin = new btVector3(-2, -2, -1);
            const aabbMax = new btVector3(2, 2, 1);

            optimizedBvh.build(triangleMesh, true, aabbMin, aabbMax);

            expect(optimizedBvh.getSubtreeInfoArray().length).toBeGreaterThan(0);
        });

        test('should set quantization values', () => {
            const aabbMin = new btVector3(-2, -2, -1);
            const aabbMax = new btVector3(2, 2, 1);

            optimizedBvh.build(triangleMesh, true, aabbMin, aabbMax);

            const bvhMin = optimizedBvh.getBvhAabbMin();
            const bvhMax = optimizedBvh.getBvhAabbMax();

            // BVH may adjust bounds for quantization, so just check they're reasonable
            expect(bvhMin.x()).toBeLessThanOrEqual(aabbMin.x());
            expect(bvhMin.y()).toBeLessThanOrEqual(aabbMin.y());
            expect(bvhMin.z()).toBeLessThanOrEqual(aabbMin.z());
            expect(bvhMax.x()).toBeGreaterThanOrEqual(aabbMax.x());
            expect(bvhMax.y()).toBeGreaterThanOrEqual(aabbMax.y());
            expect(bvhMax.z()).toBeGreaterThanOrEqual(aabbMax.z());
        });

        test('should properly unlock mesh data after build', () => {
            const aabbMin = new btVector3(-2, -2, -1);
            const aabbMax = new btVector3(2, 2, 1);

            optimizedBvh.build(triangleMesh, false, aabbMin, aabbMax);

            expect(triangleMesh.isLocked()).toBe(false);
        });
    });

    describe('refit', () => {
        test('should refit quantized BVH', () => {
            const aabbMin = new btVector3(-2, -2, -1);
            const aabbMax = new btVector3(2, 2, 1);

            optimizedBvh.build(triangleMesh, true, aabbMin, aabbMax);

            const newAabbMin = new btVector3(-3, -3, -2);
            const newAabbMax = new btVector3(3, 3, 2);

            expect(() => {
                optimizedBvh.refit(triangleMesh, newAabbMin, newAabbMax);
            }).not.toThrow();

            const bvhMin = optimizedBvh.getBvhAabbMin();
            const bvhMax = optimizedBvh.getBvhAabbMax();

            // BVH may adjust bounds for quantization, so just check they're reasonable
            expect(bvhMin.x()).toBeLessThanOrEqual(newAabbMin.x());
            expect(bvhMin.y()).toBeLessThanOrEqual(newAabbMin.y());
            expect(bvhMin.z()).toBeLessThanOrEqual(newAabbMin.z());
            expect(bvhMax.x()).toBeGreaterThanOrEqual(newAabbMax.x());
            expect(bvhMax.y()).toBeGreaterThanOrEqual(newAabbMax.y());
            expect(bvhMax.z()).toBeGreaterThanOrEqual(newAabbMax.z());
        });
    });

    describe('Cleanup', () => {
        test('should cleanup resources properly', () => {
            const aabbMin = new btVector3(-2, -2, -1);
            const aabbMax = new btVector3(2, 2, 1);

            optimizedBvh.build(triangleMesh, true, aabbMin, aabbMax);

            expect(() => {
                optimizedBvh.cleanup();
            }).not.toThrow();
        });
    });
});