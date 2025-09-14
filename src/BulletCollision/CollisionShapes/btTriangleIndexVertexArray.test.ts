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

import { btTriangleIndexVertexArray, btIndexedMesh } from './btTriangleIndexVertexArray';
import { btVector3 } from '../../LinearMath/btVector3';
import { PHY_ScalarType } from './btConcaveShape';
import { btInternalTriangleIndexCallback } from './btTriangleCallback';

describe('btIndexedMesh', () => {
    let mesh: btIndexedMesh;

    beforeEach(() => {
        mesh = new btIndexedMesh();
    });

    test('constructor initializes with default values', () => {
        expect(mesh.m_numTriangles).toBe(0);
        expect(mesh.m_triangleIndexBase).toEqual([]);
        expect(mesh.m_triangleIndexStride).toBe(0);
        expect(mesh.m_numVertices).toBe(0);
        expect(mesh.m_vertexBase).toEqual([]);
        expect(mesh.m_vertexStride).toBe(0);
        expect(mesh.m_indexType).toBe(PHY_ScalarType.PHY_INTEGER);
        expect(mesh.m_vertexType).toBe(PHY_ScalarType.PHY_FLOAT);
    });

    test('can set mesh properties', () => {
        const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
        const indices = new Uint32Array([0, 1, 2]);

        mesh.m_numTriangles = 1;
        mesh.m_triangleIndexBase = indices;
        mesh.m_triangleIndexStride = 12; // 3 indices * 4 bytes
        mesh.m_numVertices = 3;
        mesh.m_vertexBase = vertices;
        mesh.m_vertexStride = 12; // 3 floats * 4 bytes
        mesh.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        expect(mesh.m_numTriangles).toBe(1);
        expect(mesh.m_triangleIndexBase).toBe(indices);
        expect(mesh.m_triangleIndexStride).toBe(12);
        expect(mesh.m_numVertices).toBe(3);
        expect(mesh.m_vertexBase).toBe(vertices);
        expect(mesh.m_vertexStride).toBe(12);
        expect(mesh.m_indexType).toBe(PHY_ScalarType.PHY_INTEGER);
        expect(mesh.m_vertexType).toBe(PHY_ScalarType.PHY_FLOAT);
    });
});

describe('btTriangleIndexVertexArray', () => {
    let triangleArray: btTriangleIndexVertexArray;

    beforeEach(() => {
        triangleArray = new btTriangleIndexVertexArray();
    });

    test('constructor creates empty triangle array', () => {
        expect(triangleArray.getNumSubParts()).toBe(0);
        expect(triangleArray.hasPremadeAabb()).toBe(false);
        expect(triangleArray.getScaling()).toEqual(new btVector3(1, 1, 1));
    });

    test('backwards compatible constructor', () => {
        const vertices = new Float32Array([
            0, 0, 0,  // vertex 0
            1, 0, 0,  // vertex 1
            0, 1, 0   // vertex 2
        ]);
        const indices = new Uint32Array([0, 1, 2]);

        const array = new btTriangleIndexVertexArray(
            1,       // numTriangles
            indices, // triangleIndexBase
            12,      // triangleIndexStride (3 * 4 bytes)
            3,       // numVertices
            vertices,// vertexBase
            12       // vertexStride (3 * 4 bytes)
        );

        expect(array.getNumSubParts()).toBe(1);
        const data = array.getLockedReadOnlyVertexIndexBase(0);
        expect(data.numfaces).toBe(1);
        expect(data.numverts).toBe(3);
        expect(data.vertexbase).toBe(vertices);
        expect(data.indexbase).toBe(indices);
    });

    test('addIndexedMesh adds mesh to array', () => {
        const mesh = new btIndexedMesh();
        mesh.m_numTriangles = 1;
        mesh.m_numVertices = 3;

        triangleArray.addIndexedMesh(mesh);

        expect(triangleArray.getNumSubParts()).toBe(1);
        expect(triangleArray.getIndexedMeshArray()).toContain(mesh);
    });

    test('addIndexedMesh with custom index type', () => {
        const mesh = new btIndexedMesh();
        mesh.m_numTriangles = 1;
        mesh.m_numVertices = 3;

        triangleArray.addIndexedMesh(mesh, PHY_ScalarType.PHY_SHORT);

        const addedMesh = triangleArray.getIndexedMeshArray()[0];
        expect(addedMesh.m_indexType).toBe(PHY_ScalarType.PHY_SHORT);
    });

    test('getLockedVertexIndexBase returns mesh data', () => {
        const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
        const indices = new Uint32Array([0, 1, 2]);

        const mesh = new btIndexedMesh();
        mesh.m_numTriangles = 1;
        mesh.m_triangleIndexBase = indices;
        mesh.m_triangleIndexStride = 12;
        mesh.m_numVertices = 3;
        mesh.m_vertexBase = vertices;
        mesh.m_vertexStride = 12;
        mesh.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        triangleArray.addIndexedMesh(mesh);
        const data = triangleArray.getLockedVertexIndexBase(0);

        expect(data.vertexbase).toBe(vertices);
        expect(data.numverts).toBe(3);
        expect(data.type).toBe(PHY_ScalarType.PHY_FLOAT);
        expect(data.stride).toBe(12);
        expect(data.indexbase).toBe(indices);
        expect(data.indexstride).toBe(12);
        expect(data.numfaces).toBe(1);
        expect(data.indicestype).toBe(PHY_ScalarType.PHY_INTEGER);
    });

    test('getLockedReadOnlyVertexIndexBase returns mesh data', () => {
        const vertices = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
        const indices = new Uint32Array([0, 1, 2]);

        const mesh = new btIndexedMesh();
        mesh.m_numTriangles = 1;
        mesh.m_triangleIndexBase = indices;
        mesh.m_triangleIndexStride = 12;
        mesh.m_numVertices = 3;
        mesh.m_vertexBase = vertices;
        mesh.m_vertexStride = 12;
        mesh.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        triangleArray.addIndexedMesh(mesh);
        const data = triangleArray.getLockedReadOnlyVertexIndexBase(0);

        expect(data.vertexbase).toBe(vertices);
        expect(data.numverts).toBe(3);
        expect(data.type).toBe(PHY_ScalarType.PHY_FLOAT);
        expect(data.stride).toBe(12);
        expect(data.indexbase).toBe(indices);
        expect(data.indexstride).toBe(12);
        expect(data.numfaces).toBe(1);
        expect(data.indicestype).toBe(PHY_ScalarType.PHY_INTEGER);
    });

    test('unlock methods do not throw', () => {
        expect(() => triangleArray.unLockVertexBase(0)).not.toThrow();
        expect(() => triangleArray.unLockReadOnlyVertexBase(0)).not.toThrow();
    });

    test('preallocate methods do not throw', () => {
        expect(() => triangleArray.preallocateVertices(100)).not.toThrow();
        expect(() => triangleArray.preallocateIndices(300)).not.toThrow();
    });

    test('AABB premade functionality', () => {
        const aabbMin = new btVector3(-1, -1, -1);
        const aabbMax = new btVector3(1, 1, 1);

        expect(triangleArray.hasPremadeAabb()).toBe(false);

        triangleArray.setPremadeAabb(aabbMin, aabbMax);
        expect(triangleArray.hasPremadeAabb()).toBe(true);

        const retrievedMin = new btVector3();
        const retrievedMax = new btVector3();
        triangleArray.getPremadeAabb(retrievedMin, retrievedMax);

        expect(retrievedMin).toEqual(aabbMin);
        expect(retrievedMax).toEqual(aabbMax);
    });

    test('scaling functionality', () => {
        const scaling = new btVector3(2, 3, 4);

        triangleArray.setScaling(scaling);
        const retrievedScaling = triangleArray.getScaling();

        expect(retrievedScaling).toEqual(scaling);
    });

    test('cleanup method executes without errors', () => {
        const mesh = new btIndexedMesh();
        triangleArray.addIndexedMesh(mesh);

        expect(triangleArray.getNumSubParts()).toBe(1);

        triangleArray.cleanup();

        expect(triangleArray.getNumSubParts()).toBe(0);
    });

    test('getIndexedMeshArrayConst returns readonly array', () => {
        const mesh = new btIndexedMesh();
        triangleArray.addIndexedMesh(mesh);

        const constArray = triangleArray.getIndexedMeshArrayConst();
        expect(constArray).toContain(mesh);
        expect(constArray.length).toBe(1);
    });

    test('InternalProcessAllTriangles processes triangles correctly', () => {
        // Create a simple triangle
        const vertices = new Float32Array([
            0, 0, 0,  // vertex 0
            1, 0, 0,  // vertex 1
            0, 1, 0   // vertex 2
        ]);
        const indices = new Uint32Array([0, 1, 2]);

        const mesh = new btIndexedMesh();
        mesh.m_numTriangles = 1;
        mesh.m_triangleIndexBase = indices;
        mesh.m_triangleIndexStride = 12; // 3 indices * 4 bytes
        mesh.m_numVertices = 3;
        mesh.m_vertexBase = vertices;
        mesh.m_vertexStride = 12; // 3 floats * 4 bytes
        mesh.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        triangleArray.addIndexedMesh(mesh);

        // Mock callback to capture processed triangles
        class TestCallback extends btInternalTriangleIndexCallback {
            public processedTriangles: btVector3[][] = [];

            internalProcessTriangleIndex(triangle: btVector3[], _partId: number, _triangleIndex: number): void {
                this.processedTriangles.push([
                    triangle[0].clone(),
                    triangle[1].clone(),
                    triangle[2].clone()
                ]);
            }
        }

        const callback = new TestCallback();
        const aabbMin = new btVector3(-1, -1, -1);
        const aabbMax = new btVector3(2, 2, 2);

        triangleArray.internalProcessAllTriangles(callback, aabbMin, aabbMax);

        expect(callback.processedTriangles).toHaveLength(1);
        const processedTriangle = callback.processedTriangles[0];

        expect(processedTriangle[0]).toEqual(new btVector3(0, 0, 0));
        expect(processedTriangle[1]).toEqual(new btVector3(1, 0, 0));
        expect(processedTriangle[2]).toEqual(new btVector3(0, 1, 0));
    });

    test('InternalProcessAllTriangles with scaling', () => {
        // Create a simple triangle
        const vertices = new Float32Array([
            0, 0, 0,  // vertex 0
            1, 0, 0,  // vertex 1
            0, 1, 0   // vertex 2
        ]);
        const indices = new Uint32Array([0, 1, 2]);

        const mesh = new btIndexedMesh();
        mesh.m_numTriangles = 1;
        mesh.m_triangleIndexBase = indices;
        mesh.m_triangleIndexStride = 12;
        mesh.m_numVertices = 3;
        mesh.m_vertexBase = vertices;
        mesh.m_vertexStride = 12;
        mesh.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        triangleArray.addIndexedMesh(mesh);
        triangleArray.setScaling(new btVector3(2, 3, 4));

        class TestCallback extends btInternalTriangleIndexCallback {
            public processedTriangles: btVector3[][] = [];

            internalProcessTriangleIndex(triangle: btVector3[], _partId: number, _triangleIndex: number): void {
                this.processedTriangles.push([
                    triangle[0].clone(),
                    triangle[1].clone(),
                    triangle[2].clone()
                ]);
            }
        }

        const callback = new TestCallback();
        const aabbMin = new btVector3(-1, -1, -1);
        const aabbMax = new btVector3(3, 4, 5);

        triangleArray.internalProcessAllTriangles(callback, aabbMin, aabbMax);

        expect(callback.processedTriangles).toHaveLength(1);
        const processedTriangle = callback.processedTriangles[0];

        // Vertices should be scaled
        expect(processedTriangle[0]).toEqual(new btVector3(0, 0, 0));
        expect(processedTriangle[1]).toEqual(new btVector3(2, 0, 0));
        expect(processedTriangle[2]).toEqual(new btVector3(0, 3, 0));
    });

    test('calculateAabbBruteForce computes correct bounds', () => {
        // Create a triangle with known bounds
        const vertices = new Float32Array([
            -1, -1, -1,  // vertex 0
             2,  0,  0,  // vertex 1
             0,  3,  2   // vertex 2
        ]);
        const indices = new Uint32Array([0, 1, 2]);

        const mesh = new btIndexedMesh();
        mesh.m_numTriangles = 1;
        mesh.m_triangleIndexBase = indices;
        mesh.m_triangleIndexStride = 12;
        mesh.m_numVertices = 3;
        mesh.m_vertexBase = vertices;
        mesh.m_vertexStride = 12;
        mesh.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        triangleArray.addIndexedMesh(mesh);

        const aabbMin = new btVector3();
        const aabbMax = new btVector3();

        triangleArray.calculateAabbBruteForce(aabbMin, aabbMax);

        // Expected bounds: min(-1, -1, -1) and max(2, 3, 2)
        expect(aabbMin.x()).toBeCloseTo(-1);
        expect(aabbMin.y()).toBeCloseTo(-1);
        expect(aabbMin.z()).toBeCloseTo(-1);
        expect(aabbMax.x()).toBeCloseTo(2);
        expect(aabbMax.y()).toBeCloseTo(3);
        expect(aabbMax.z()).toBeCloseTo(2);
    });

    test('InternalProcessAllTriangles handles multiple meshes', () => {
        // First mesh - one triangle
        const vertices1 = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
        const indices1 = new Uint32Array([0, 1, 2]);

        const mesh1 = new btIndexedMesh();
        mesh1.m_numTriangles = 1;
        mesh1.m_triangleIndexBase = indices1;
        mesh1.m_triangleIndexStride = 12;
        mesh1.m_numVertices = 3;
        mesh1.m_vertexBase = vertices1;
        mesh1.m_vertexStride = 12;
        mesh1.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh1.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        // Second mesh - one triangle
        const vertices2 = new Float32Array([1, 1, 1, 2, 1, 1, 1, 2, 1]);
        const indices2 = new Uint32Array([0, 1, 2]);

        const mesh2 = new btIndexedMesh();
        mesh2.m_numTriangles = 1;
        mesh2.m_triangleIndexBase = indices2;
        mesh2.m_triangleIndexStride = 12;
        mesh2.m_numVertices = 3;
        mesh2.m_vertexBase = vertices2;
        mesh2.m_vertexStride = 12;
        mesh2.m_indexType = PHY_ScalarType.PHY_INTEGER;
        mesh2.m_vertexType = PHY_ScalarType.PHY_FLOAT;

        triangleArray.addIndexedMesh(mesh1);
        triangleArray.addIndexedMesh(mesh2);

        class TestCallback extends btInternalTriangleIndexCallback {
            public processedTriangles: btVector3[][] = [];
            public partIds: number[] = [];

            internalProcessTriangleIndex(triangle: btVector3[], partId: number, _triangleIndex: number): void {
                this.processedTriangles.push([
                    triangle[0].clone(),
                    triangle[1].clone(),
                    triangle[2].clone()
                ]);
                this.partIds.push(partId);
            }
        }

        const callback = new TestCallback();
        const aabbMin = new btVector3(-1, -1, -1);
        const aabbMax = new btVector3(3, 3, 3);

        triangleArray.internalProcessAllTriangles(callback, aabbMin, aabbMax);

        expect(callback.processedTriangles).toHaveLength(2);
        expect(callback.partIds).toEqual([0, 1]);
    });
});

describe('btTriangleIndexVertexArray error handling', () => {
    test('getLockedVertexIndexBase throws on invalid subpart', () => {
        const triangleArray = new btTriangleIndexVertexArray();

        expect(() => triangleArray.getLockedVertexIndexBase(0)).toThrow();
    });

    test('serialization methods return appropriate values', () => {
        const triangleArray = new btTriangleIndexVertexArray();

        expect(triangleArray.calculateSerializeBufferSize()).toBe(0);
        expect(triangleArray.serialize(null, null)).toBe(null);
    });
});