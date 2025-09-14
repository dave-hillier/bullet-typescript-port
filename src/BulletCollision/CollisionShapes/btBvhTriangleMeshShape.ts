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

import { btTriangleMeshShape } from './btTriangleMeshShape';
import { btStridingMeshInterface } from './btStridingMeshInterface';
import { btOptimizedBvh } from './btOptimizedBvh';
import { btTriangleInfoMap } from './btTriangleInfoMap';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTriangleCallback } from './btTriangleCallback';
import { btNodeOverlapCallback } from '../BroadphaseCollision/btQuantizedBvh';
import { PHY_ScalarType } from './btConcaveShape';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
import { btAssert, SIMD_EPSILON } from '../../LinearMath/btScalar';

/**
 * The btBvhTriangleMeshShape is a static-triangle mesh shape, it can only be used for fixed/non-moving objects.
 * If you required moving concave triangle meshes, it is recommended to perform convex decomposition
 * using HACD, see Bullet/Demos/ConvexDecompositionDemo.
 * Alternatively, you can use btGimpactMeshShape for moving concave triangle meshes.
 * btBvhTriangleMeshShape has several optimizations, such as bounding volume hierarchy and
 * cache friendly traversal for PlayStation 3 Cell SPU.
 * It is recommended to enable useQuantizedAabbCompression for better memory usage.
 * It takes a triangle mesh as input, for example a btTriangleMesh or btTriangleIndexVertexArray.
 * The btBvhTriangleMeshShape class allows for triangle mesh deformations by a refit or partialRefit method.
 * Instead of building the bounding volume hierarchy acceleration structure, it is also possible to serialize (save)
 * and deserialize (load) the structure from disk.
 */
export class btBvhTriangleMeshShape extends btTriangleMeshShape {
    private m_bvh: btOptimizedBvh | null;
    private m_triangleInfoMap: btTriangleInfoMap | null;
    private m_useQuantizedAabbCompression: boolean;
    private m_ownsBvh: boolean;

    /**
     * Constructor with basic BVH building
     * @param meshInterface The mesh interface for triangle access
     * @param useQuantizedAabbCompression Whether to use quantized AABB compression
     * @param buildBvh Whether to build the BVH immediately
     */
    constructor(meshInterface: btStridingMeshInterface, useQuantizedAabbCompression: boolean, buildBvh?: boolean);

    /**
     * Constructor with custom BVH AABB bounds
     * @param meshInterface The mesh interface for triangle access
     * @param useQuantizedAabbCompression Whether to use quantized AABB compression
     * @param bvhAabbMin The minimum AABB for BVH quantization
     * @param bvhAabbMax The maximum AABB for BVH quantization
     * @param buildBvh Whether to build the BVH immediately
     */
    constructor(meshInterface: btStridingMeshInterface, useQuantizedAabbCompression: boolean, bvhAabbMin: btVector3, bvhAabbMax: btVector3, buildBvh?: boolean);

    constructor(
        meshInterface: btStridingMeshInterface,
        useQuantizedAabbCompression: boolean,
        bvhAabbMinOrBuildBvh?: btVector3 | boolean,
        bvhAabbMax?: btVector3,
        buildBvh: boolean = true
    ) {
        super(meshInterface);

        this.m_bvh = null;
        this.m_triangleInfoMap = null;
        this.m_useQuantizedAabbCompression = useQuantizedAabbCompression;
        this.m_ownsBvh = false;

        this.m_shapeType = BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE;

        // Handle constructor overloads
        let shouldBuildBvh: boolean;
        let customAabbMin: btVector3 | null = null;
        let customAabbMax: btVector3 | null = null;

        if (typeof bvhAabbMinOrBuildBvh === 'boolean') {
            // First constructor form
            shouldBuildBvh = bvhAabbMinOrBuildBvh;
        } else if (bvhAabbMinOrBuildBvh && bvhAabbMax) {
            // Second constructor form
            customAabbMin = bvhAabbMinOrBuildBvh;
            customAabbMax = bvhAabbMax;
            shouldBuildBvh = buildBvh;
        } else {
            // Default
            shouldBuildBvh = buildBvh;
        }

        // Construct BVH from meshInterface
        if (shouldBuildBvh) {
            if (customAabbMin && customAabbMax) {
                // Build with custom AABB bounds
                this.m_bvh = new btOptimizedBvh();
                this.m_bvh.build(meshInterface, this.m_useQuantizedAabbCompression, customAabbMin, customAabbMax);
                this.m_ownsBvh = true;
            } else {
                // Build with default bounds
                this.buildOptimizedBvh();
            }
        }
    }

    /**
     * Cleanup method (replaces C++ virtual destructor)
     */
    cleanup(): void {
        if (this.m_ownsBvh && this.m_bvh) {
            this.m_bvh.cleanup();
            this.m_bvh = null;
        }
        super.cleanup();
    }

    /**
     * Check if this shape owns its BVH
     */
    getOwnsBvh(): boolean {
        return this.m_ownsBvh;
    }

    /**
     * Perform ray cast using the BVH acceleration structure
     * @param callback The triangle callback to call for each hit triangle
     * @param raySource The ray starting point
     * @param rayTarget The ray ending point
     */
    performRaycast(callback: btTriangleCallback, raySource: btVector3, rayTarget: btVector3): void {
        if (!this.m_bvh) {
            // Fall back to brute force if no BVH
            super.processAllTriangles(callback, raySource, rayTarget);
            return;
        }

        const nodeCallback = new MyNodeOverlapCallback(callback, this.m_meshInterface);
        this.m_bvh.reportRayOverlappingNodex(nodeCallback, raySource, rayTarget);
    }

    /**
     * Perform convex cast using the BVH acceleration structure
     * @param callback The triangle callback to call for each hit triangle
     * @param raySource The convex starting point
     * @param rayTarget The convex ending point
     * @param aabbMin The minimum AABB of the convex
     * @param aabbMax The maximum AABB of the convex
     */
    performConvexcast(callback: btTriangleCallback, raySource: btVector3, rayTarget: btVector3, aabbMin: btVector3, aabbMax: btVector3): void {
        if (!this.m_bvh) {
            // Fall back to brute force if no BVH
            super.processAllTriangles(callback, aabbMin, aabbMax);
            return;
        }

        const nodeCallback = new MyNodeOverlapCallback(callback, this.m_meshInterface);
        this.m_bvh.reportBoxCastOverlappingNodex(nodeCallback, raySource, rayTarget, aabbMin, aabbMax);
    }

    /**
     * Process all triangles that overlap with the given AABB using BVH acceleration
     * @param callback The triangle callback to call for each overlapping triangle
     * @param aabbMin The minimum AABB bounds
     * @param aabbMax The maximum AABB bounds
     */
    processAllTriangles(callback: btTriangleCallback, aabbMin: btVector3, aabbMax: btVector3): void {
        if (!this.m_bvh) {
            // Fall back to brute force if no BVH
            super.processAllTriangles(callback, aabbMin, aabbMax);
            return;
        }

        const nodeCallback = new MyNodeOverlapCallback(callback, this.m_meshInterface);
        this.m_bvh.reportAabbOverlappingNodex(nodeCallback, aabbMin, aabbMax);
    }

    /**
     * Refit the entire BVH tree
     * @param aabbMin The new minimum AABB
     * @param aabbMax The new maximum AABB
     */
    refitTree(aabbMin: btVector3, aabbMax: btVector3): void {
        if (this.m_bvh) {
            this.m_bvh.refit(this.m_meshInterface, aabbMin, aabbMax);
        }
        this.recalcLocalAabb();
    }

    /**
     * For a fast incremental refit of parts of the tree.
     * Note: the entire AABB of the tree will become more conservative, it never shrinks
     * @param aabbMin The minimum AABB for the region to refit
     * @param aabbMax The maximum AABB for the region to refit
     */
    partialRefitTree(aabbMin: btVector3, aabbMax: btVector3): void {
        if (this.m_bvh) {
            this.m_bvh.refitPartial(this.m_meshInterface, aabbMin, aabbMax);
        }
        this.m_localAabbMin.setMin(aabbMin);
        this.m_localAabbMax.setMax(aabbMax);
    }

    /**
     * Get the shape name for debugging
     */
    getName(): string {
        return "BVHTRIANGLEMESH";
    }

    /**
     * Set the local scaling and rebuild the BVH if necessary
     */
    setLocalScaling(scaling: btVector3): void {
        const currentScaling = this.getLocalScaling();
        if (currentScaling.sub(scaling).length2() > SIMD_EPSILON) {
            super.setLocalScaling(scaling);
            this.buildOptimizedBvh();
        }
    }

    /**
     * Get the optimized BVH
     */
    getOptimizedBvh(): btOptimizedBvh | null {
        return this.m_bvh;
    }

    /**
     * Set an external optimized BVH
     * @param bvh The BVH to use
     * @param localScaling The local scaling to apply
     */
    setOptimizedBvh(bvh: btOptimizedBvh, localScaling?: btVector3): void {
        if (!localScaling) {
            localScaling = new btVector3(1, 1, 1);
        }
        btAssert(!this.m_bvh, "BVH already set");
        btAssert(!this.m_ownsBvh, "Already owns a BVH");

        this.m_bvh = bvh;
        this.m_ownsBvh = false;

        // Update the scaling without rebuilding the BVH
        const currentScaling = this.getLocalScaling();
        if (currentScaling.sub(localScaling).length2() > SIMD_EPSILON) {
            super.setLocalScaling(localScaling);
        }
    }

    /**
     * Build the optimized BVH
     */
    buildOptimizedBvh(): void {
        if (this.m_ownsBvh && this.m_bvh) {
            this.m_bvh.cleanup();
        }

        // m_localAabbMin/m_localAabbMax is already re-calculated in btTriangleMeshShape.
        // We could just scale aabb, but this needs some more work
        this.m_bvh = new btOptimizedBvh();

        // Rebuild the BVH
        this.m_bvh.build(this.m_meshInterface, this.m_useQuantizedAabbCompression, this.m_localAabbMin, this.m_localAabbMax);
        this.m_ownsBvh = true;
    }

    /**
     * Check if quantized AABB compression is used
     */
    usesQuantizedAabbCompression(): boolean {
        return this.m_useQuantizedAabbCompression;
    }

    /**
     * Set the triangle info map
     */
    setTriangleInfoMap(triangleInfoMap: btTriangleInfoMap | null): void {
        this.m_triangleInfoMap = triangleInfoMap;
    }

    /**
     * Get the triangle info map (const version)
     */
    getTriangleInfoMap(): btTriangleInfoMap | null {
        return this.m_triangleInfoMap;
    }

    /**
     * Calculate serialize buffer size (serialization not fully implemented in TypeScript port)
     */
    calculateSerializeBufferSize(): number {
        // Serialization not implemented in TypeScript port
        return 0;
    }

    /**
     * Serialize the shape (serialization not fully implemented in TypeScript port)
     */
    serialize(dataBuffer: any, serializer: any): string {
        // Serialization not implemented in TypeScript port
        return "";
    }

    /**
     * Serialize single BVH (serialization not fully implemented in TypeScript port)
     */
    serializeSingleBvh(serializer: any): void {
        // Serialization not implemented in TypeScript port
    }

    /**
     * Serialize single triangle info map (serialization not fully implemented in TypeScript port)
     */
    serializeSingleTriangleInfoMap(serializer: any): void {
        // Serialization not implemented in TypeScript port
    }
}

/**
 * Node overlap callback for BVH traversal
 * This class processes BVH nodes and extracts triangle data for collision detection
 */
class MyNodeOverlapCallback implements btNodeOverlapCallback {
    private m_meshInterface: btStridingMeshInterface;
    private m_callback: btTriangleCallback;

    constructor(callback: btTriangleCallback, meshInterface: btStridingMeshInterface) {
        this.m_callback = callback;
        this.m_meshInterface = meshInterface;
    }

    processNode(nodeSubPart: number, nodeTriangleIndex: number): void {
        const triangle: btVector3[] = [new btVector3(), new btVector3(), new btVector3()];

        // Get mesh data for this subpart
        const meshData = this.m_meshInterface.getLockedReadOnlyVertexIndexBase(nodeSubPart);
        const vertexbase = meshData.vertexbase;
        const numverts = meshData.numverts;
        const type = meshData.type;
        const stride = meshData.stride;
        const indexbase = meshData.indexbase;
        const indexstride = meshData.indexstride;
        const numfaces = meshData.numfaces;
        const indicestype = meshData.indicestype;

        // Extract triangle vertices based on index type
        const indexOffset = nodeTriangleIndex * indexstride;
        let gfxbase: Uint32Array | Uint16Array | Uint8Array;

        switch (indicestype) {
            case PHY_ScalarType.PHY_INTEGER:
                gfxbase = new Uint32Array(indexbase.buffer, indexbase.byteOffset + indexOffset, 3);
                break;
            case PHY_ScalarType.PHY_SHORT:
                gfxbase = new Uint16Array(indexbase.buffer, indexbase.byteOffset + indexOffset, 3);
                break;
            case PHY_ScalarType.PHY_UCHAR:
                gfxbase = new Uint8Array(indexbase.buffer, indexbase.byteOffset + indexOffset, 3);
                break;
            default:
                btAssert(false, "Unknown index type");
                return;
        }

        const meshScaling = this.m_meshInterface.getScaling();

        // Extract vertex positions
        for (let j = 2; j >= 0; j--) {
            const graphicsindex = gfxbase[j];
            const vertexOffset = graphicsindex * stride;

            if (type === PHY_ScalarType.PHY_FLOAT) {
                const graphicsbase = new Float32Array(vertexbase.buffer, vertexbase.byteOffset + vertexOffset, 3);
                triangle[j].setValue(
                    graphicsbase[0] * meshScaling.x(),
                    graphicsbase[1] * meshScaling.y(),
                    graphicsbase[2] * meshScaling.z()
                );
            } else if (type === PHY_ScalarType.PHY_DOUBLE) {
                const graphicsbase = new Float64Array(vertexbase.buffer, vertexbase.byteOffset + vertexOffset, 3);
                triangle[j].setValue(
                    graphicsbase[0] * meshScaling.x(),
                    graphicsbase[1] * meshScaling.y(),
                    graphicsbase[2] * meshScaling.z()
                );
            }
        }

        // Process the triangle
        this.m_callback.processTriangle(triangle, nodeSubPart, nodeTriangleIndex);
        this.m_meshInterface.unLockReadOnlyVertexBase(nodeSubPart);
    }
}