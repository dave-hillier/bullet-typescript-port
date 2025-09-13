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

import { btConvexInternalShape } from './btConvexInternalShape';
import { btVector3, btVector4 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btTransformAabb } from '../../LinearMath/btAabbUtil2';
import { btFsels, btAssert } from '../../LinearMath/btScalar';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

/**
 * The btBoxShape is a box primitive around the origin, its sides axis aligned with length 
 * specified by half extents, in local shape coordinates. When used as part of a btCollisionObject 
 * or btRigidBody it will be an oriented box in world space.
 */
export class btBoxShape extends btConvexInternalShape {
    /**
     * Constructor for btBoxShape
     * @param boxHalfExtents - The half extents (half width, half height, half depth) of the box
     */
    constructor(boxHalfExtents: btVector3) {
        super();
        this.m_shapeType = BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE;

        const margin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        this.implicitShapeDimensions = boxHalfExtents.multiplyVector(this.localScaling).subtract(margin);
        
        this.setSafeMargin(boxHalfExtents);
    }

    /**
     * Get the half extents including collision margin
     */
    getHalfExtentsWithMargin(): btVector3 {
        const halfExtents = this.getHalfExtentsWithoutMargin();
        const margin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        return halfExtents.add(margin);
    }

    /**
     * Get the half extents without collision margin (scaled shape dimensions)
     */
    getHalfExtentsWithoutMargin(): btVector3 {
        return this.implicitShapeDimensions.clone(); // scaling is included, margin is not
    }

    /**
     * Get supporting vertex in local coordinate system with margin
     */
    localGetSupportingVertex(vec: btVector3): btVector3 {
        const halfExtents = this.getHalfExtentsWithoutMargin();
        const margin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        const halfExtentsWithMargin = halfExtents.add(margin);

        return new btVector3(
            btFsels(vec.x(), halfExtentsWithMargin.x(), -halfExtentsWithMargin.x()),
            btFsels(vec.y(), halfExtentsWithMargin.y(), -halfExtentsWithMargin.y()),
            btFsels(vec.z(), halfExtentsWithMargin.z(), -halfExtentsWithMargin.z())
        );
    }

    /**
     * Get supporting vertex in local coordinate system without margin
     */
    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        const halfExtents = this.getHalfExtentsWithoutMargin();

        return new btVector3(
            btFsels(vec.x(), halfExtents.x(), -halfExtents.x()),
            btFsels(vec.y(), halfExtents.y(), -halfExtents.y()),
            btFsels(vec.z(), halfExtents.z(), -halfExtents.z())
        );
    }

    /**
     * Get supporting vertices for multiple unit vectors at once (batch operation)
     */
    batchedUnitVectorGetSupportingVertexWithoutMargin(
        vectors: btVector3[], 
        supportVerticesOut: btVector3[], 
        numVectors: number
    ): void {
        const halfExtents = this.getHalfExtentsWithoutMargin();

        for (let i = 0; i < numVectors; i++) {
            const vec = vectors[i];
            supportVerticesOut[i] = new btVector3(
                btFsels(vec.x(), halfExtents.x(), -halfExtents.x()),
                btFsels(vec.y(), halfExtents.y(), -halfExtents.y()),
                btFsels(vec.z(), halfExtents.z(), -halfExtents.z())
            );
        }
    }

    /**
     * Set collision margin and adjust implicit shape dimensions accordingly
     */
    setMargin(collisionMargin: number): void {
        // Correct the implicitShapeDimensions for the margin
        const oldMargin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        const implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add(oldMargin);

        super.setMargin(collisionMargin);
        const newMargin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        this.implicitShapeDimensions = implicitShapeDimensionsWithMargin.subtract(newMargin);
    }

    /**
     * Set local scaling and adjust implicit shape dimensions accordingly
     */
    setLocalScaling(scaling: btVector3): void {
        const oldMargin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        const implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add(oldMargin);
        const unScaledImplicitShapeDimensionsWithMargin = new btVector3(
            implicitShapeDimensionsWithMargin.x() / this.localScaling.x(),
            implicitShapeDimensionsWithMargin.y() / this.localScaling.y(),
            implicitShapeDimensionsWithMargin.z() / this.localScaling.z()
        );

        super.setLocalScaling(scaling);

        this.implicitShapeDimensions = new btVector3(
            unScaledImplicitShapeDimensionsWithMargin.x() * this.localScaling.x(),
            unScaledImplicitShapeDimensionsWithMargin.y() * this.localScaling.y(),
            unScaledImplicitShapeDimensionsWithMargin.z() * this.localScaling.z()
        ).subtract(oldMargin);
    }

    /**
     * Get axis-aligned bounding box in world coordinates
     */
    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        btTransformAabb(this.getHalfExtentsWithoutMargin(), this.getMargin(), t, aabbMin, aabbMax);
    }

    /**
     * Calculate local inertia tensor for the box
     */
    calculateLocalInertia(mass: number, inertia: btVector3): void {
        const halfExtents = this.getHalfExtentsWithMargin();

        const lx = 2 * halfExtents.x();
        const ly = 2 * halfExtents.y();
        const lz = 2 * halfExtents.z();

        inertia.setValue(
            mass / 12 * (ly * ly + lz * lz),
            mass / 12 * (lx * lx + lz * lz),
            mass / 12 * (lx * lx + ly * ly)
        );
    }

    /**
     * Get plane normal and support point for the given plane index
     */
    getPlane(planeNormal: btVector3, planeSupport: btVector3, i: number): void {
        // This plane might not be aligned...
        const plane = new btVector4(0, 0, 0, 0);
        this.getPlaneEquation(plane, i);
        planeNormal.setValue(plane.x(), plane.y(), plane.z());
        planeSupport.copy(this.localGetSupportingVertex(planeNormal.negate()));
    }

    /**
     * Get number of planes (faces) of the box
     */
    getNumPlanes(): number {
        return 6;
    }

    /**
     * Get number of vertices of the box
     */
    getNumVertices(): number {
        return 8;
    }

    /**
     * Get number of edges of the box
     */
    getNumEdges(): number {
        return 12;
    }

    /**
     * Get vertex at the given index
     */
    getVertex(i: number, vtx: btVector3): void {
        const halfExtents = this.getHalfExtentsWithMargin();

        vtx.setValue(
            halfExtents.x() * (1 - (i & 1)) - halfExtents.x() * (i & 1),
            halfExtents.y() * (1 - ((i & 2) >> 1)) - halfExtents.y() * ((i & 2) >> 1),
            halfExtents.z() * (1 - ((i & 4) >> 2)) - halfExtents.z() * ((i & 4) >> 2)
        );
    }

    /**
     * Get plane equation for the given plane index
     */
    getPlaneEquation(plane: btVector4, i: number): void {
        const halfExtents = this.getHalfExtentsWithoutMargin();

        switch (i) {
            case 0:
                plane.setValue(1, 0, 0, -halfExtents.x());
                break;
            case 1:
                plane.setValue(-1, 0, 0, -halfExtents.x());
                break;
            case 2:
                plane.setValue(0, 1, 0, -halfExtents.y());
                break;
            case 3:
                plane.setValue(0, -1, 0, -halfExtents.y());
                break;
            case 4:
                plane.setValue(0, 0, 1, -halfExtents.z());
                break;
            case 5:
                plane.setValue(0, 0, -1, -halfExtents.z());
                break;
            default:
                btAssert(false, `Invalid plane index: ${i}`);
        }
    }

    /**
     * Get edge vertices for the given edge index
     */
    getEdge(i: number, pa: btVector3, pb: btVector3): void {
        let edgeVert0 = 0;
        let edgeVert1 = 0;

        switch (i) {
            case 0:
                edgeVert0 = 0;
                edgeVert1 = 1;
                break;
            case 1:
                edgeVert0 = 0;
                edgeVert1 = 2;
                break;
            case 2:
                edgeVert0 = 1;
                edgeVert1 = 3;
                break;
            case 3:
                edgeVert0 = 2;
                edgeVert1 = 3;
                break;
            case 4:
                edgeVert0 = 0;
                edgeVert1 = 4;
                break;
            case 5:
                edgeVert0 = 1;
                edgeVert1 = 5;
                break;
            case 6:
                edgeVert0 = 2;
                edgeVert1 = 6;
                break;
            case 7:
                edgeVert0 = 3;
                edgeVert1 = 7;
                break;
            case 8:
                edgeVert0 = 4;
                edgeVert1 = 5;
                break;
            case 9:
                edgeVert0 = 4;
                edgeVert1 = 6;
                break;
            case 10:
                edgeVert0 = 5;
                edgeVert1 = 7;
                break;
            case 11:
                edgeVert0 = 6;
                edgeVert1 = 7;
                break;
            default:
                btAssert(false, `Invalid edge index: ${i}`);
        }

        this.getVertex(edgeVert0, pa);
        this.getVertex(edgeVert1, pb);
    }

    /**
     * Test if a point is inside the box (with tolerance)
     */
    isInside(pt: btVector3, tolerance: number): boolean {
        const halfExtents = this.getHalfExtentsWithoutMargin();

        return (pt.x() <= (halfExtents.x() + tolerance)) &&
               (pt.x() >= (-halfExtents.x() - tolerance)) &&
               (pt.y() <= (halfExtents.y() + tolerance)) &&
               (pt.y() >= (-halfExtents.y() - tolerance)) &&
               (pt.z() <= (halfExtents.z() + tolerance)) &&
               (pt.z() >= (-halfExtents.z() - tolerance));
    }

    /**
     * Get shape name for debugging
     */
    getName(): string {
        return "Box";
    }

    /**
     * Get number of preferred penetration directions
     */
    getNumPreferredPenetrationDirections(): number {
        return 6;
    }

    /**
     * Get preferred penetration direction for the given index
     */
    getPreferredPenetrationDirection(index: number, penetrationVector: btVector3): void {
        switch (index) {
            case 0:
                penetrationVector.setValue(1, 0, 0);
                break;
            case 1:
                penetrationVector.setValue(-1, 0, 0);
                break;
            case 2:
                penetrationVector.setValue(0, 1, 0);
                break;
            case 3:
                penetrationVector.setValue(0, -1, 0);
                break;
            case 4:
                penetrationVector.setValue(0, 0, 1);
                break;
            case 5:
                penetrationVector.setValue(0, 0, -1);
                break;
            default:
                btAssert(false, `Invalid penetration direction index: ${index}`);
        }
    }
}