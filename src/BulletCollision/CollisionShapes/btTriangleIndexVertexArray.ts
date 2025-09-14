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

import { btStridingMeshInterface, VertexIndexData } from './btStridingMeshInterface';
import { btVector3 } from '../../LinearMath/btVector3';
import { btAssert } from '../../LinearMath/btScalar';
import { PHY_ScalarType } from './btConcaveShape';

/**
 * The btIndexedMesh indexes a single vertex and index array. Multiple btIndexedMesh objects can be passed into a btTriangleIndexVertexArray using addIndexedMesh.
 * Instead of the number of indices, we pass the number of triangles.
 */
export class btIndexedMesh {
    public m_numTriangles: number;
    public m_triangleIndexBase: number[] | Uint32Array | Uint16Array | Uint8Array;
    public m_triangleIndexStride: number; // Size in bytes of the indices for one triangle (3*sizeof(index_type) if the indices are tightly packed)
    public m_numVertices: number;
    public m_vertexBase: number[] | Float32Array | Float64Array;
    public m_vertexStride: number; // Size of a vertex, in bytes

    // The index type is set when adding an indexed mesh to the
    // btTriangleIndexVertexArray, do not set it manually
    public m_indexType: PHY_ScalarType;

    // The vertex type has a default type similar to Bullet's precision mode (float or double)
    // but can be set manually if you for example run Bullet with double precision but have
    // mesh data in single precision..
    public m_vertexType: PHY_ScalarType;

    constructor() {
        this.m_numTriangles = 0;
        this.m_triangleIndexBase = [];
        this.m_triangleIndexStride = 0;
        this.m_numVertices = 0;
        this.m_vertexBase = [];
        this.m_vertexStride = 0;
        this.m_indexType = PHY_ScalarType.PHY_INTEGER;
        this.m_vertexType = PHY_ScalarType.PHY_FLOAT; // Use float as default in TypeScript
    }
}

export type IndexedMeshArray = btIndexedMesh[];

/**
 * The btTriangleIndexVertexArray allows to access multiple triangle meshes, by indexing into existing triangle/index arrays.
 * Additional meshes can be added using addIndexedMesh
 * No duplicate is made of the vertex/index data, it only indexes into external vertex/index arrays.
 * So keep those arrays around during the lifetime of this btTriangleIndexVertexArray.
 */
export class btTriangleIndexVertexArray extends btStridingMeshInterface {
    protected m_indexedMeshes: IndexedMeshArray;
    protected m_hasAabb: number; // using number instead of bool to maintain alignment like C++
    protected m_aabbMin: btVector3;
    protected m_aabbMax: btVector3;

    constructor(numTriangles?: number, triangleIndexBase?: number[] | Uint32Array, triangleIndexStride?: number, numVertices?: number, vertexBase?: number[] | Float32Array, vertexStride?: number) {
        super();
        this.m_indexedMeshes = [];
        this.m_hasAabb = 0;
        this.m_aabbMin = new btVector3();
        this.m_aabbMax = new btVector3();

        // Backwards compatible constructor
        if (numTriangles !== undefined && triangleIndexBase !== undefined && triangleIndexStride !== undefined &&
            numVertices !== undefined && vertexBase !== undefined && vertexStride !== undefined) {
            const mesh = new btIndexedMesh();

            mesh.m_numTriangles = numTriangles;
            mesh.m_triangleIndexBase = triangleIndexBase;
            mesh.m_triangleIndexStride = triangleIndexStride;
            mesh.m_numVertices = numVertices;
            mesh.m_vertexBase = vertexBase;
            mesh.m_vertexStride = vertexStride;

            this.addIndexedMesh(mesh);
        }
    }

    /**
     * Cleanup method (replaces C++ virtual destructor)
     */
    cleanup(): void {
        super.cleanup();
        // Clear references to external arrays
        this.m_indexedMeshes.length = 0;
    }

    /**
     * Add an indexed mesh to the array
     * @param mesh The mesh to add
     * @param indexType The type of indices in the mesh
     */
    addIndexedMesh(mesh: btIndexedMesh, indexType: PHY_ScalarType = PHY_ScalarType.PHY_INTEGER): void {
        this.m_indexedMeshes.push(mesh);
        this.m_indexedMeshes[this.m_indexedMeshes.length - 1].m_indexType = indexType;
    }

    getLockedVertexIndexBase(subpart: number = 0): VertexIndexData {
        btAssert(subpart < this.getNumSubParts());

        const mesh = this.m_indexedMeshes[subpart];

        return {
            vertexbase: mesh.m_vertexBase,
            numverts: mesh.m_numVertices,
            type: mesh.m_vertexType,
            stride: mesh.m_vertexStride,
            indexbase: mesh.m_triangleIndexBase,
            indexstride: mesh.m_triangleIndexStride,
            numfaces: mesh.m_numTriangles,
            indicestype: mesh.m_indexType
        };
    }

    getLockedReadOnlyVertexIndexBase(subpart: number = 0): VertexIndexData {
        const mesh = this.m_indexedMeshes[subpart];

        return {
            vertexbase: mesh.m_vertexBase,
            numverts: mesh.m_numVertices,
            type: mesh.m_vertexType,
            stride: mesh.m_vertexStride,
            indexbase: mesh.m_triangleIndexBase,
            indexstride: mesh.m_triangleIndexStride,
            numfaces: mesh.m_numTriangles,
            indicestype: mesh.m_indexType
        };
    }

    /**
     * unLockVertexBase finishes the access to a subpart of the triangle mesh
     * Make a call to unLockVertexBase when the read and write access (using getLockedVertexIndexBase) is finished
     */
    unLockVertexBase(_subpart: number): void {
        // (void)subpart; - No-op in TypeScript implementation
        // In C++, this might unlock memory or resources, but in TypeScript we don't need to do anything
    }

    unLockReadOnlyVertexBase(_subpart: number): void {
        // (void)subpart; - No-op in TypeScript implementation
        // In C++, this might unlock memory or resources, but in TypeScript we don't need to do anything
    }

    /**
     * getNumSubParts returns the number of separate subparts
     * Each subpart has a continuous array of vertices and indices
     */
    getNumSubParts(): number {
        return this.m_indexedMeshes.length;
    }

    /**
     * Get the indexed meshes array
     */
    getIndexedMeshArray(): IndexedMeshArray {
        return this.m_indexedMeshes;
    }

    /**
     * Get the indexed meshes array (const version)
     */
    getIndexedMeshArrayConst(): readonly btIndexedMesh[] {
        return this.m_indexedMeshes;
    }

    preallocateVertices(_numverts: number): void {
        // (void)numverts; - No-op in TypeScript implementation
        // This is a hint for memory allocation which isn't needed in TypeScript
    }

    preallocateIndices(_numindices: number): void {
        // (void)numindices; - No-op in TypeScript implementation
        // This is a hint for memory allocation which isn't needed in TypeScript
    }

    hasPremadeAabb(): boolean {
        return (this.m_hasAabb === 1);
    }

    setPremadeAabb(aabbMin: btVector3, aabbMax: btVector3): void {
        this.m_aabbMin.copy(aabbMin);
        this.m_aabbMax.copy(aabbMax);
        this.m_hasAabb = 1; // this is intentionally a number see notes in header
    }

    getPremadeAabb(aabbMin: btVector3, aabbMax: btVector3): void {
        aabbMin.copy(this.m_aabbMin);
        aabbMax.copy(this.m_aabbMax);
    }
}