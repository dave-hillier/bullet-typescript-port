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
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
import { SIMD_EPSILON } from '../../LinearMath/btScalar';

/**
 * The btSphereShape implements an implicit sphere, centered around a local origin with radius.
 * This is one of the most basic collision shapes and is used extensively in physics simulations
 * due to its simplicity and computational efficiency.
 */
export class btSphereShape extends btConvexInternalShape {
    /**
     * Constructor for sphere shape
     * @param radius The radius of the sphere
     */
    constructor(radius: number) {
        super();
        this.m_shapeType = BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
        this.localScaling.setValue(1.0, 1.0, 1.0);
        this.implicitShapeDimensions.setZero();
        this.implicitShapeDimensions.setX(radius);
        this.collisionMargin = radius;
    }

    /**
     * Get supporting vertex in local coordinate system, including margin.
     * For spheres, this extends the center point by the radius in the direction of vec.
     */
    localGetSupportingVertex(vec: btVector3): btVector3 {
        const supVertex = this.localGetSupportingVertexWithoutMargin(vec);

        let vecnorm = vec.clone();
        if (vecnorm.length2() < (SIMD_EPSILON * SIMD_EPSILON)) {
            vecnorm.setValue(-1, -1, -1);
        }
        vecnorm.normalize();
        supVertex.addAssign(vecnorm.multiply(this.getMargin()));
        return supVertex;
    }

    /**
     * Get supporting vertex without margin.
     * For spheres, this is always the center point (origin) since the sphere
     * is defined by its center and radius, and the radius is handled as margin.
     */
    localGetSupportingVertexWithoutMargin(_vec: btVector3): btVector3 {
        return new btVector3(0, 0, 0);
    }

    /**
     * Batch compute supporting vertices without margin for multiple directions.
     * For spheres, all supporting vertices without margin are at the origin.
     */
    batchedUnitVectorGetSupportingVertexWithoutMargin(
        _vectors: btVector3[],
        supportVerticesOut: btVector3[],
        numVectors: number
    ): void {
        for (let i = 0; i < numVectors; i++) {
            supportVerticesOut[i].setValue(0, 0, 0);
        }
    }

    /**
     * Calculate local inertia tensor for the sphere.
     * For a solid sphere: I = (2/5) * m * r²
     */
    calculateLocalInertia(mass: number, inertia: btVector3): void {
        const elem = 0.4 * mass * this.getMargin() * this.getMargin();
        inertia.setValue(elem, elem, elem);
    }

    /**
     * Get axis-aligned bounding box for the sphere.
     * The AABB is simply the sphere center ± radius in all directions.
     */
    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        const center = t.getOrigin();
        const extent = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        aabbMin.copy(center.subtract(extent));
        aabbMax.copy(center.add(extent));
    }

    /**
     * Get the radius of the sphere, accounting for local scaling.
     */
    getRadius(): number {
        return this.implicitShapeDimensions.x() * this.localScaling.x();
    }

    /**
     * Set the unscaled radius of the sphere.
     * This updates both the implicit shape dimensions and the collision margin.
     */
    setUnscaledRadius(radius: number): void {
        this.implicitShapeDimensions.setX(radius);
        super.setMargin(radius);
    }

    /**
     * Set collision margin.
     * For spheres, the margin is effectively the radius, so this delegates to the parent.
     */
    setMargin(margin: number): void {
        super.setMargin(margin);
    }

    /**
     * Get collision margin.
     * For spheres, we return the full radius as margin to improve GJK behavior.
     * This means the sphere never enters penetration cases during collision detection.
     * Note: This means non-uniform scaling is not supported for spheres.
     */
    getMargin(): number {
        // To improve gjk behavior, use radius+margin as the full margin, 
        // so never get into the penetration case.
        // This means non-uniform scaling is not supported anymore
        return this.getRadius();
    }

    /**
     * Get human-readable name for debugging purposes.
     */
    getName(): string {
        return "SPHERE";
    }
}