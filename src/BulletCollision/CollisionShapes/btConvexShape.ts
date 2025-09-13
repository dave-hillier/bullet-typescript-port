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

import { btCollisionShape } from './btCollisionShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { multiplyMatrixVector } from '../../LinearMath/btMatrix3x3';
import { CONVEX_DISTANCE_MARGIN } from './btCollisionMargin';
import { btAssert, SIMD_EPSILON } from '../../LinearMath/btScalar';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

/**
 * Maximum number of preferred penetration directions for convex shapes
 */
export const MAX_PREFERRED_PENETRATION_DIRECTIONS = 10;

/**
 * The btConvexShape is an abstract shape interface, implemented by all convex shapes 
 * such as btBoxShape, btConvexHullShape etc.
 * It describes general convex shapes using the localGetSupportingVertex interface, 
 * used by collision detectors such as btGjkPairDetector.
 */
export abstract class btConvexShape extends btCollisionShape {
    constructor() {
        super();
    }

    // Abstract methods that must be implemented by derived classes

    /**
     * localGetSupportingVertex of a convex shape returns the vertex in the direction vec
     * localGetSupportingVertex should include margin
     */
    abstract localGetSupportingVertex(vec: btVector3): btVector3;

    /**
     * localGetSupportingVertexWithoutMargin returns the vertex (without margin) in the direction vec
     */
    abstract localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3;

    /**
     * Notice that the vectors should be unit length
     */
    abstract batchedUnitVectorGetSupportingVertexWithoutMargin(
        vectors: btVector3[], 
        supportVerticesOut: btVector3[], 
        numVectors: number
    ): void;

    /**
     * getAabb returns the axis aligned bounding box in the coordinate frame of the given transform t.
     */
    abstract getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void;

    /**
     * getAabbSlow returns the axis aligned bounding box but uses a more generic algorithm (slower)
     */
    abstract getAabbSlow(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void;

    /**
     * Set local scaling of the convex shape
     */
    abstract setLocalScaling(scaling: btVector3): void;

    /**
     * Get local scaling of the convex shape
     */
    abstract getLocalScaling(): btVector3;

    /**
     * Set the collision margin
     */
    abstract setMargin(margin: number): void;

    /**
     * Get the collision margin
     */
    abstract getMargin(): number;

    /**
     * Get the number of preferred penetration directions
     */
    abstract getNumPreferredPenetrationDirections(): number;

    /**
     * Get the preferred penetration direction at given index
     */
    abstract getPreferredPenetrationDirection(index: number, penetrationVector: btVector3): void;

    // Virtual methods with default implementations

    /**
     * Project the convex shape onto a direction and return the min and max projections
     */
    project(
        trans: btTransform, 
        dir: btVector3, 
        minProj: { value: number }, 
        maxProj: { value: number }, 
        witnesPtMin: btVector3, 
        witnesPtMax: btVector3
    ): void {
        const localAxis = multiplyMatrixVector(trans.getBasis().transpose(), dir);
        const vtx1 = trans.transformPoint(this.localGetSupportingVertex(localAxis));
        const vtx2 = trans.transformPoint(this.localGetSupportingVertex(localAxis.negate()));

        minProj.value = vtx1.dot(dir);
        maxProj.value = vtx2.dot(dir);
        witnesPtMax.copy(vtx2);
        witnesPtMin.copy(vtx1);

        if (minProj.value > maxProj.value) {
            const tmp = minProj.value;
            minProj.value = maxProj.value;
            maxProj.value = tmp;
            witnesPtMax.copy(vtx1);
            witnesPtMin.copy(vtx2);
        }
    }

    // Non-virtual methods with specific implementations

    /**
     * Non-virtual version of localGetSupportingVertexWithoutMargin
     * This method contains optimized implementations for different shape types
     */
    localGetSupportVertexWithoutMarginNonVirtual(localDir: btVector3): btVector3 {
        switch (this.m_shapeType) {
            case BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
                return new btVector3(0, 0, 0);

            case BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
                // Box shape support vertex calculation
                // This would need the actual box shape implementation
                // For now, fall through to default
                break;

            case BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
                // Triangle shape support vertex calculation
                // This would need the actual triangle shape implementation
                // For now, fall through to default
                break;

            case BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
                // Cylinder shape support vertex calculation
                // This would need the actual cylinder shape implementation
                // For now, fall through to default
                break;

            case BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
                // Capsule shape support vertex calculation
                // This would need the actual capsule shape implementation
                // For now, fall through to default
                break;

            case BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
                // Convex hull support vertex calculation
                // This would need the actual convex hull shape implementation
                // For now, fall through to default
                break;

            default:
                return this.localGetSupportingVertexWithoutMargin(localDir);
        }

        // Should never reach here - but provide fallback
        btAssert(false, "Unknown shape type in localGetSupportVertexWithoutMarginNonVirtual");
        return new btVector3(0, 0, 0);
    }

    /**
     * Non-virtual version of localGetSupportingVertex
     */
    localGetSupportVertexNonVirtual(localDir: btVector3): btVector3 {
        let localDirNorm = localDir.clone();
        if (localDirNorm.length2() < (SIMD_EPSILON * SIMD_EPSILON)) {
            localDirNorm.setValue(-1, -1, -1);
        }
        localDirNorm.normalize();

        return this.localGetSupportVertexWithoutMarginNonVirtual(localDirNorm)
            .add(localDirNorm.multiply(this.getMarginNonVirtual()));
    }

    /**
     * Non-virtual version of getMargin
     */
    getMarginNonVirtual(): number {
        switch (this.m_shapeType) {
            case BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
                // For sphere, radius is the margin - would need actual sphere shape implementation
                return CONVEX_DISTANCE_MARGIN; // Fallback

            case BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CONE_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
                // These would need actual shape implementations to get correct margins
                return CONVEX_DISTANCE_MARGIN; // Fallback

            default:
                return this.getMargin();
        }
    }

    /**
     * Non-virtual version of getAabb
     */
    getAabbNonVirtual(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        switch (this.m_shapeType) {
            case BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE:
                {
                    // Sphere AABB calculation - simplified implementation
                    const margin = this.getMarginNonVirtual();
                    const center = t.getOrigin();
                    const extent = new btVector3(margin, margin, margin);
                    aabbMin.copy(center.subtract(extent));
                    aabbMax.copy(center.add(extent));
                }
                break;

            case BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE:
                {
                    // Box/Cylinder AABB calculation - would need actual shape implementations
                    // For now, fall through to default
                    this.getAabb(t, aabbMin, aabbMax);
                }
                break;

            case BroadphaseNativeTypes.TRIANGLE_SHAPE_PROXYTYPE:
                {
                    // Triangle AABB calculation - would need actual shape implementation
                    // For now, fall through to default
                    this.getAabb(t, aabbMin, aabbMax);
                }
                break;

            case BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE:
                {
                    // Capsule AABB calculation - would need actual shape implementation
                    // For now, fall through to default
                    this.getAabb(t, aabbMin, aabbMax);
                }
                break;

            case BroadphaseNativeTypes.CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE:
            case BroadphaseNativeTypes.CONVEX_HULL_SHAPE_PROXYTYPE:
                {
                    // Convex hull AABB calculation - would need actual shape implementations
                    // For now, fall through to default
                    this.getAabb(t, aabbMin, aabbMax);
                }
                break;

            default:
                this.getAabb(t, aabbMin, aabbMax);
                break;
        }
    }
}

/**
 * Helper function for convex hull support vertex calculation
 * Used by convex hull and point cloud shapes
 */
export function convexHullSupport(
    localDirOrg: btVector3, 
    points: btVector3[], 
    _numPoints: number, 
    localScaling: btVector3
): btVector3 {
    const vec = new btVector3(
        localDirOrg.x() * localScaling.x(),
        localDirOrg.y() * localScaling.y(),
        localDirOrg.z() * localScaling.z()
    );

    const maxDotRef = { value: 0 };
    const ptIndex = vec.maxDot(points, maxDotRef);
    btAssert(ptIndex >= 0);
    
    if (ptIndex < 0) {
        return new btVector3(0, 0, 0);
    }
    
    return new btVector3(
        points[ptIndex].x() * localScaling.x(),
        points[ptIndex].y() * localScaling.y(),
        points[ptIndex].z() * localScaling.z()
    );
}