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

import { btConcaveShape } from './btConcaveShape';
import { btStridingMeshInterface } from './btStridingMeshInterface';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btMatrix3x3 } from '../../LinearMath/btMatrix3x3';
import { btTriangleCallback, btInternalTriangleIndexCallback } from './btTriangleCallback';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
import { TestTriangleAgainstAabb2 } from '../../LinearMath/btAabbUtil2';
import { btAssert, BT_LARGE_FLOAT } from '../../LinearMath/btScalar';

/**
 * The btTriangleMeshShape is an internal concave triangle mesh interface.
 * Don't use this class directly, use btBvhTriangleMeshShape instead.
 *
 * This is the base class for triangle mesh collision shapes. It provides
 * basic triangle mesh functionality but lacks acceleration structures.
 * For better performance, use btBvhTriangleMeshShape which adds BVH acceleration.
 */
export class btTriangleMeshShape extends btConcaveShape {
    protected m_localAabbMin: btVector3;
    protected m_localAabbMax: btVector3;
    protected m_meshInterface: btStridingMeshInterface;

    /**
     * btTriangleMeshShape constructor has been disabled/protected, so that users will not mistakenly use this class.
     * Don't use btTriangleMeshShape but use btBvhTriangleMeshShape instead!
     */
    constructor(meshInterface: btStridingMeshInterface) {
        super();
        this.m_localAabbMin = new btVector3();
        this.m_localAabbMax = new btVector3();
        this.m_meshInterface = meshInterface;

        this.m_shapeType = BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE;

        if (meshInterface.hasPremadeAabb()) {
            meshInterface.getPremadeAabb(this.m_localAabbMin, this.m_localAabbMax);
        } else {
            this.recalcLocalAabb();
        }
    }

    /**
     * Cleanup method (replaces C++ virtual destructor)
     */
    cleanup(): void {
        super.cleanup();
    }

    /**
     * Get AABB for this shape transformed by the given transform
     */
    getAabb(trans: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        const localHalfExtents = this.m_localAabbMax.sub(this.m_localAabbMin).op_mul(0.5);
        localHalfExtents.add(new btVector3(this.getMargin(), this.getMargin(), this.getMargin()));
        const localCenter = this.m_localAabbMax.add(this.m_localAabbMin).op_mul(0.5);

        const abs_b = trans.getBasis().absolute();
        const center = trans.transform(localCenter);
        const extent = new btVector3(
            localHalfExtents.dot(abs_b.getRow(0)),
            localHalfExtents.dot(abs_b.getRow(1)),
            localHalfExtents.dot(abs_b.getRow(2))
        );

        aabbMin.copy(center.op_sub(extent));
        aabbMax.copy(center.op_add(extent));
    }

    /**
     * Recalculate the local AABB by finding supporting vertices in each axis direction
     */
    recalcLocalAabb(): void {
        for (let i = 0; i < 3; i++) {
            const vec = new btVector3(0, 0, 0);
            vec.setValue(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
            const tmp = this.localGetSupportingVertex(vec);
            this.m_localAabbMax.setValue(
                i === 0 ? tmp.x() + this.m_collisionMargin : this.m_localAabbMax.x(),
                i === 1 ? tmp.y() + this.m_collisionMargin : this.m_localAabbMax.y(),
                i === 2 ? tmp.z() + this.m_collisionMargin : this.m_localAabbMax.z()
            );

            vec.setValue(i === 0 ? -1 : 0, i === 1 ? -1 : 0, i === 2 ? -1 : 0);
            const tmp2 = this.localGetSupportingVertex(vec);
            this.m_localAabbMin.setValue(
                i === 0 ? tmp2.x() - this.m_collisionMargin : this.m_localAabbMin.x(),
                i === 1 ? tmp2.y() - this.m_collisionMargin : this.m_localAabbMin.y(),
                i === 2 ? tmp2.z() - this.m_collisionMargin : this.m_localAabbMin.z()
            );
        }
    }

    /**
     * Find the supporting vertex in the given direction
     */
    localGetSupportingVertex(vec: btVector3): btVector3 {
        const ident = new btTransform();
        ident.setIdentity();

        const supportCallback = new SupportVertexCallback(vec, ident);
        const aabbMax = new btVector3(BT_LARGE_FLOAT, BT_LARGE_FLOAT, BT_LARGE_FLOAT);

        this.processAllTriangles(supportCallback, aabbMax.negate(), aabbMax);

        return supportCallback.getSupportVertexLocal();
    }

    /**
     * Get supporting vertex without margin (not implemented for concave shapes)
     */
    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        btAssert(false, "localGetSupportingVertexWithoutMargin not supported for triangle mesh shapes");
        return this.localGetSupportingVertex(vec);
    }

    /**
     * Process all triangles that overlap with the given AABB
     */
    processAllTriangles(callback: btTriangleCallback, aabbMin: btVector3, aabbMax: btVector3): void {
        const filterCallback = new FilteredCallback(callback, aabbMin, aabbMax);
        this.m_meshInterface.internalProcessAllTriangles(filterCallback, aabbMin, aabbMax);
    }

    /**
     * Calculate local inertia (not supported for concave shapes)
     */
    calculateLocalInertia(mass: number, inertia: btVector3): void {
        // Moving concave objects not supported
        btAssert(false, "calculateLocalInertia not supported for concave triangle mesh shapes");
        inertia.setValue(0, 0, 0);
    }

    /**
     * Set the local scaling
     */
    setLocalScaling(scaling: btVector3): void {
        this.m_meshInterface.setScaling(scaling);
        this.recalcLocalAabb();
    }

    /**
     * Get the local scaling
     */
    getLocalScaling(): btVector3 {
        return this.m_meshInterface.getScaling();
    }

    /**
     * Get the mesh interface
     */
    getMeshInterface(): btStridingMeshInterface {
        return this.m_meshInterface;
    }

    /**
     * Get the local AABB minimum
     */
    getLocalAabbMin(): btVector3 {
        return this.m_localAabbMin;
    }

    /**
     * Get the local AABB maximum
     */
    getLocalAabbMax(): btVector3 {
        return this.m_localAabbMax;
    }

    /**
     * Get the shape name for debugging
     */
    getName(): string {
        return "TRIANGLEMESH";
    }
}

/**
 * Callback class to find the supporting vertex in a given direction
 */
class SupportVertexCallback extends btTriangleCallback {
    private m_supportVertexLocal: btVector3;
    private m_worldTrans: btTransform;
    private m_maxDot: number;
    private m_supportVecLocal: btVector3;

    constructor(supportVecWorld: btVector3, trans: btTransform) {
        super();
        this.m_supportVertexLocal = new btVector3(0, 0, 0);
        this.m_worldTrans = trans;
        this.m_maxDot = -BT_LARGE_FLOAT;
        this.m_supportVecLocal = trans.getBasis().transpose().transform(supportVecWorld);
    }

    processTriangle(triangle: btVector3[], partId: number, triangleIndex: number): void {
        for (let i = 0; i < 3; i++) {
            const dot = this.m_supportVecLocal.dot(triangle[i]);
            if (dot > this.m_maxDot) {
                this.m_maxDot = dot;
                this.m_supportVertexLocal.copy(triangle[i]);
            }
        }
    }

    getSupportVertexWorldSpace(): btVector3 {
        return this.m_worldTrans.transform(this.m_supportVertexLocal);
    }

    getSupportVertexLocal(): btVector3 {
        return this.m_supportVertexLocal;
    }
}

/**
 * Filtered callback that only processes triangles within a given AABB
 */
class FilteredCallback extends btInternalTriangleIndexCallback {
    private m_callback: btTriangleCallback;
    private m_aabbMin: btVector3;
    private m_aabbMax: btVector3;

    constructor(callback: btTriangleCallback, aabbMin: btVector3, aabbMax: btVector3) {
        super();
        this.m_callback = callback;
        this.m_aabbMin = aabbMin;
        this.m_aabbMax = aabbMax;
    }

    internalProcessTriangleIndex(triangle: btVector3[], partId: number, triangleIndex: number): void {
        if (TestTriangleAgainstAabb2(triangle, this.m_aabbMin, this.m_aabbMax)) {
            // Check aabb in triangle-space, before doing this
            this.m_callback.processTriangle(triangle, partId, triangleIndex);
        }
    }
}