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

import { btVector3 } from '../../LinearMath/btVector3';
import { btAssert, BT_LARGE_FLOAT } from '../../LinearMath/btScalar';
import { btInternalTriangleIndexCallback } from './btTriangleCallback';
import { PHY_ScalarType } from './btConcaveShape';

/**
 * Vertex data access result structure
 */
export interface VertexIndexData {
    vertexbase: number[] | Float32Array | Float64Array;
    numverts: number;
    type: PHY_ScalarType;
    stride: number;
    indexbase: number[] | Uint32Array | Uint16Array | Uint8Array;
    indexstride: number;
    numfaces: number;
    indicestype: PHY_ScalarType;
}

/**
 * The btStridingMeshInterface is the interface class for high performance generic access to triangle meshes,
 * used in combination with btBvhTriangleMeshShape and some other collision shapes.
 * Using index striding of 3*sizeof(integer) it can use triangle arrays,
 * using index striding of 1*sizeof(integer) it can handle triangle strips.
 * It allows for sharing graphics and collision meshes.
 * Also it provides locking/unlocking of graphics meshes that are in gpu memory.
 */
export abstract class btStridingMeshInterface {
    protected m_scaling: btVector3;

    constructor() {
        this.m_scaling = new btVector3(1, 1, 1);
    }

    /**
     * Cleanup method (replaces C++ virtual destructor)
     * Override this if your implementation needs cleanup
     */
    cleanup(): void {
        // Default implementation does nothing
    }

    /**
     * Internal method to process all triangles within the given AABB bounds
     * @param callback The callback to call for each triangle
     * @param aabbMin Minimum bounds
     * @param aabbMax Maximum bounds
     */
    internalProcessAllTriangles(callback: btInternalTriangleIndexCallback, _aabbMin: btVector3, _aabbMax: btVector3): void {
        // Variables unused in the generic implementation
        // (void)aabbMin; (void)aabbMax;

        let _numtotalphysicsverts = 0;
        const graphicssubparts = this.getNumSubParts();
        const triangle: btVector3[] = [new btVector3(), new btVector3(), new btVector3()];

        const meshScaling = this.getScaling();

        // If the number of parts is big, the performance might drop due to the innerloop switch on indextype
        for (let part = 0; part < graphicssubparts; part++) {
            const data = this.getLockedReadOnlyVertexIndexBase(part);
            _numtotalphysicsverts += data.numfaces * 3; // upper bound

            // Unlike that developers want to pass in double-precision meshes in single-precision Bullet build
            // so disable this feature by default
            // see patch http://code.google.com/p/bullet/issues/detail?id=213

            switch (data.type) {
                case PHY_ScalarType.PHY_FLOAT: {
                    const vertexbase = data.vertexbase as Float32Array | number[];

                    switch (data.indicestype) {
                        case PHY_ScalarType.PHY_INTEGER: {
                            const indexbase = data.indexbase as Uint32Array | number[];
                            for (let gfxindex = 0; gfxindex < data.numfaces; gfxindex++) {
                                const baseIndex = Math.floor(gfxindex * data.indexstride / 4);
                                const tri_indices = [
                                    indexbase[baseIndex],
                                    indexbase[baseIndex + 1],
                                    indexbase[baseIndex + 2]
                                ];

                                for (let i = 0; i < 3; i++) {
                                    const vertexIndex = Math.floor(tri_indices[i] * data.stride / 4);
                                    triangle[i].setValue(
                                        vertexbase[vertexIndex] * meshScaling.x(),
                                        vertexbase[vertexIndex + 1] * meshScaling.y(),
                                        vertexbase[vertexIndex + 2] * meshScaling.z()
                                    );
                                }
                                callback.internalProcessTriangleIndex(triangle, part, gfxindex);
                            }
                            break;
                        }
                        case PHY_ScalarType.PHY_SHORT: {
                            const indexbase = data.indexbase as Uint16Array | number[];
                            for (let gfxindex = 0; gfxindex < data.numfaces; gfxindex++) {
                                const baseIndex = Math.floor(gfxindex * data.indexstride / 2);
                                const tri_indices = [
                                    indexbase[baseIndex],
                                    indexbase[baseIndex + 1],
                                    indexbase[baseIndex + 2]
                                ];

                                for (let i = 0; i < 3; i++) {
                                    const vertexIndex = Math.floor(tri_indices[i] * data.stride / 4);
                                    triangle[i].setValue(
                                        vertexbase[vertexIndex] * meshScaling.x(),
                                        vertexbase[vertexIndex + 1] * meshScaling.y(),
                                        vertexbase[vertexIndex + 2] * meshScaling.z()
                                    );
                                }
                                callback.internalProcessTriangleIndex(triangle, part, gfxindex);
                            }
                            break;
                        }
                        case PHY_ScalarType.PHY_UCHAR: {
                            const indexbase = data.indexbase as Uint8Array | number[];
                            for (let gfxindex = 0; gfxindex < data.numfaces; gfxindex++) {
                                const baseIndex = gfxindex * data.indexstride;
                                const tri_indices = [
                                    indexbase[baseIndex],
                                    indexbase[baseIndex + 1],
                                    indexbase[baseIndex + 2]
                                ];

                                for (let i = 0; i < 3; i++) {
                                    const vertexIndex = Math.floor(tri_indices[i] * data.stride / 4);
                                    triangle[i].setValue(
                                        vertexbase[vertexIndex] * meshScaling.x(),
                                        vertexbase[vertexIndex + 1] * meshScaling.y(),
                                        vertexbase[vertexIndex + 2] * meshScaling.z()
                                    );
                                }
                                callback.internalProcessTriangleIndex(triangle, part, gfxindex);
                            }
                            break;
                        }
                        default:
                            btAssert(false, `Unsupported index type: ${data.indicestype}`);
                    }
                    break;
                }

                case PHY_ScalarType.PHY_DOUBLE: {
                    const vertexbase = data.vertexbase as Float64Array | number[];

                    switch (data.indicestype) {
                        case PHY_ScalarType.PHY_INTEGER: {
                            const indexbase = data.indexbase as Uint32Array | number[];
                            for (let gfxindex = 0; gfxindex < data.numfaces; gfxindex++) {
                                const baseIndex = Math.floor(gfxindex * data.indexstride / 4);
                                const tri_indices = [
                                    indexbase[baseIndex],
                                    indexbase[baseIndex + 1],
                                    indexbase[baseIndex + 2]
                                ];

                                for (let i = 0; i < 3; i++) {
                                    const vertexIndex = Math.floor(tri_indices[i] * data.stride / 8);
                                    triangle[i].setValue(
                                        vertexbase[vertexIndex] * meshScaling.x(),
                                        vertexbase[vertexIndex + 1] * meshScaling.y(),
                                        vertexbase[vertexIndex + 2] * meshScaling.z()
                                    );
                                }
                                callback.internalProcessTriangleIndex(triangle, part, gfxindex);
                            }
                            break;
                        }
                        case PHY_ScalarType.PHY_SHORT: {
                            const indexbase = data.indexbase as Uint16Array | number[];
                            for (let gfxindex = 0; gfxindex < data.numfaces; gfxindex++) {
                                const baseIndex = Math.floor(gfxindex * data.indexstride / 2);
                                const tri_indices = [
                                    indexbase[baseIndex],
                                    indexbase[baseIndex + 1],
                                    indexbase[baseIndex + 2]
                                ];

                                for (let i = 0; i < 3; i++) {
                                    const vertexIndex = Math.floor(tri_indices[i] * data.stride / 8);
                                    triangle[i].setValue(
                                        vertexbase[vertexIndex] * meshScaling.x(),
                                        vertexbase[vertexIndex + 1] * meshScaling.y(),
                                        vertexbase[vertexIndex + 2] * meshScaling.z()
                                    );
                                }
                                callback.internalProcessTriangleIndex(triangle, part, gfxindex);
                            }
                            break;
                        }
                        case PHY_ScalarType.PHY_UCHAR: {
                            const indexbase = data.indexbase as Uint8Array | number[];
                            for (let gfxindex = 0; gfxindex < data.numfaces; gfxindex++) {
                                const baseIndex = gfxindex * data.indexstride;
                                const tri_indices = [
                                    indexbase[baseIndex],
                                    indexbase[baseIndex + 1],
                                    indexbase[baseIndex + 2]
                                ];

                                for (let i = 0; i < 3; i++) {
                                    const vertexIndex = Math.floor(tri_indices[i] * data.stride / 8);
                                    triangle[i].setValue(
                                        vertexbase[vertexIndex] * meshScaling.x(),
                                        vertexbase[vertexIndex + 1] * meshScaling.y(),
                                        vertexbase[vertexIndex + 2] * meshScaling.z()
                                    );
                                }
                                callback.internalProcessTriangleIndex(triangle, part, gfxindex);
                            }
                            break;
                        }
                        default:
                            btAssert(false, `Unsupported index type: ${data.indicestype}`);
                    }
                    break;
                }
                default:
                    btAssert(false, `Unsupported vertex type: ${data.type}`);
            }

            this.unLockReadOnlyVertexBase(part);
        }
    }

    /**
     * Brute force method to calculate AABB
     * @param aabbMin Output minimum bounds
     * @param aabbMax Output maximum bounds
     */
    calculateAabbBruteForce(aabbMin: btVector3, aabbMax: btVector3): void {
        class AabbCalculationCallback extends btInternalTriangleIndexCallback {
            public m_aabbMin: btVector3;
            public m_aabbMax: btVector3;

            constructor() {
                super();
                this.m_aabbMin = new btVector3(BT_LARGE_FLOAT, BT_LARGE_FLOAT, BT_LARGE_FLOAT);
                this.m_aabbMax = new btVector3(-BT_LARGE_FLOAT, -BT_LARGE_FLOAT, -BT_LARGE_FLOAT);
            }

            internalProcessTriangleIndex(triangle: btVector3[], _partId: number, _triangleIndex: number): void {
                // (void)partId; (void)triangleIndex;

                this.m_aabbMin.setMin(triangle[0]);
                this.m_aabbMax.setMax(triangle[0]);
                this.m_aabbMin.setMin(triangle[1]);
                this.m_aabbMax.setMax(triangle[1]);
                this.m_aabbMin.setMin(triangle[2]);
                this.m_aabbMax.setMax(triangle[2]);
            }
        }

        // First calculate the total aabb for all triangles
        const aabbCallback = new AabbCalculationCallback();
        aabbMin.setValue(-BT_LARGE_FLOAT, -BT_LARGE_FLOAT, -BT_LARGE_FLOAT);
        aabbMax.setValue(BT_LARGE_FLOAT, BT_LARGE_FLOAT, BT_LARGE_FLOAT);
        this.internalProcessAllTriangles(aabbCallback, aabbMin, aabbMax);

        aabbMin.copy(aabbCallback.m_aabbMin);
        aabbMax.copy(aabbCallback.m_aabbMax);
    }

    /**
     * Get read and write access to a subpart of a triangle mesh
     * This subpart has a continuous array of vertices and indices
     * In this way the mesh can be handled as chunks of memory with striding
     * Very similar to OpenGL vertexarray support
     * Make a call to unLockVertexBase when the read and write access is finished
     */
    abstract getLockedVertexIndexBase(subpart?: number): VertexIndexData;

    abstract getLockedReadOnlyVertexIndexBase(subpart?: number): VertexIndexData;

    /**
     * unLockVertexBase finishes the access to a subpart of the triangle mesh
     * Make a call to unLockVertexBase when the read and write access (using getLockedVertexIndexBase) is finished
     */
    abstract unLockVertexBase(subpart: number): void;

    abstract unLockReadOnlyVertexBase(subpart: number): void;

    /**
     * getNumSubParts returns the number of separate subparts
     * Each subpart has a continuous array of vertices and indices
     */
    abstract getNumSubParts(): number;

    abstract preallocateVertices(numverts: number): void;
    abstract preallocateIndices(numindices: number): void;

    hasPremadeAabb(): boolean {
        return false;
    }

    setPremadeAabb(_aabbMin: btVector3, _aabbMax: btVector3): void {
        // (void)aabbMin; (void)aabbMax;
        // Default implementation does nothing
    }

    getPremadeAabb(_aabbMin: btVector3, _aabbMax: btVector3): void {
        // (void)aabbMin; (void)aabbMax;
        // Default implementation does nothing
    }

    getScaling(): btVector3 {
        return this.m_scaling;
    }

    setScaling(scaling: btVector3): void {
        this.m_scaling = scaling;
    }

    calculateSerializeBufferSize(): number {
        // Simplified for TypeScript - we won't implement full serialization
        return 0;
    }

    /**
     * Serialize the mesh interface
     * Note: Serialization is simplified in TypeScript port - returns null
     */
    serialize(_dataBuffer: any, _serializer: any): string | null {
        // Serialization is complex and not typically needed in TypeScript/JavaScript environments
        // Return null to indicate serialization is not supported
        return null;
    }
}