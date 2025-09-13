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
import { btTriangleCallback } from './btTriangleCallback';
import { btVector3 } from '../../LinearMath/btVector3';

/**
 * PHY_ScalarType enumerates possible scalar types.
 * See the btStridingMeshInterface or btHeightfieldTerrainShape for its use
 */
export enum PHY_ScalarType {
    PHY_FLOAT = 0,
    PHY_DOUBLE,
    PHY_INTEGER,
    PHY_SHORT,
    PHY_FIXEDPOINT88,
    PHY_UCHAR
}

/**
 * The btConcaveShape class provides an interface for non-moving (static) concave shapes.
 * It has been implemented by the btStaticPlaneShape, btBvhTriangleMeshShape and btHeightfieldTerrainShape.
 * 
 * Concave shapes are shapes that can have "dents" or "caves" - they are not convex.
 * Examples include triangle meshes, heightfields, and infinite planes.
 * These shapes are typically used for static geometry like terrain or level geometry.
 */
export abstract class btConcaveShape extends btCollisionShape {
    protected m_collisionMargin: number;

    constructor() {
        super();
        this.m_collisionMargin = 0;
    }

    /**
     * Process all triangles that overlap with the given AABB.
     * This is the core method that must be implemented by all concave shapes.
     * It calls the callback for each triangle that overlaps with the specified bounding box.
     * 
     * @param callback The triangle callback that will be called for each overlapping triangle
     * @param aabbMin The minimum bounds of the axis-aligned bounding box to query
     * @param aabbMax The maximum bounds of the axis-aligned bounding box to query
     */
    abstract processAllTriangles(callback: btTriangleCallback, aabbMin: btVector3, aabbMax: btVector3): void;

    /**
     * Get the collision margin for this concave shape.
     * The collision margin is used to expand the shape slightly for collision detection.
     * 
     * @returns The collision margin
     */
    getMargin(): number {
        return this.m_collisionMargin;
    }

    /**
     * Set the collision margin for this concave shape.
     * The collision margin is used to expand the shape slightly for collision detection.
     * 
     * @param collisionMargin The new collision margin value
     */
    setMargin(collisionMargin: number): void {
        this.m_collisionMargin = collisionMargin;
    }

    /**
     * Cleanup method (replaces C++ virtual destructor)
     * Override this if your implementation needs cleanup
     */
    cleanup(): void {
        // Default implementation does nothing
        // Subclasses should override if they need to clean up resources
    }
}