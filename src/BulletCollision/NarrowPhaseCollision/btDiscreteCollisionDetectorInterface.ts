/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btTransform } from "../../LinearMath/btTransform";
import { btVector3 } from "../../LinearMath/btVector3";
import { BT_LARGE_FLOAT } from "../../LinearMath/btScalar";

/**
 * Input structure for closest point queries
 */
export class btClosestPointInput {
    m_transformA: btTransform;
    m_transformB: btTransform;
    m_maximumDistanceSquared: number;

    constructor() {
        this.m_transformA = new btTransform();
        this.m_transformB = new btTransform();
        this.m_maximumDistanceSquared = BT_LARGE_FLOAT;
    }
}

/**
 * This interface is made to be used by an iterative approach to do TimeOfImpact calculations
 * This interface allows to query for closest points and penetration depth between two (convex) objects
 * the closest point is on the second object (B), and the normal points from the surface on B towards A.
 * distance is between closest points on B and closest point on A. So you can calculate closest point on A
 * by taking closestPointInA = closestPointInB + m_distance * m_normalOnSurfaceB
 */
export abstract class btDiscreteCollisionDetectorInterface {
    /**
     * Give either closest points (distance > 0) or penetration (distance)
     * The normal always points from B towards A
     */
    abstract getClosestPoints(
        input: btClosestPointInput,
        output: btDiscreteCollisionDetectorInterface.Result,
        debugDraw?: any, // btIDebugDraw interface - optional for TypeScript port
        swapResults?: boolean
    ): void;
}

export namespace btDiscreteCollisionDetectorInterface {
    /**
     * Abstract result interface for collision detection
     */
    export abstract class Result {
        /**
         * setShapeIdentifiersA/B provides experimental support for per-triangle material / custom material combiner
         */
        abstract setShapeIdentifiersA(partId0: number, index0: number): void;
        abstract setShapeIdentifiersB(partId1: number, index1: number): void;
        abstract addContactPoint(normalOnBInWorld: btVector3, pointInWorld: btVector3, depth: number): void;
    }
}

/**
 * Concrete implementation of Result that stores the closest/deepest contact point
 */
export class btStorageResult extends btDiscreteCollisionDetectorInterface.Result {
    m_normalOnSurfaceB: btVector3;
    m_closestPointInB: btVector3;
    /** negative means penetration! */
    m_distance: number;

    constructor() {
        super();
        this.m_normalOnSurfaceB = new btVector3(0, 0, 0);
        this.m_closestPointInB = new btVector3(0, 0, 0);
        this.m_distance = BT_LARGE_FLOAT;
    }

    setShapeIdentifiersA(_partId0: number, _index0: number): void {
        // Default implementation does nothing
        // Subclasses can override to handle shape identifiers
    }

    setShapeIdentifiersB(_partId1: number, _index1: number): void {
        // Default implementation does nothing
        // Subclasses can override to handle shape identifiers
    }

    addContactPoint(normalOnBInWorld: btVector3, pointInWorld: btVector3, depth: number): void {
        if (depth < this.m_distance) {
            this.m_normalOnSurfaceB.copy(normalOnBInWorld);
            this.m_closestPointInB.copy(pointInWorld);
            this.m_distance = depth;
        }
    }

    /**
     * Get the stored normal on surface B
     */
    getNormalOnSurfaceB(): btVector3 {
        return this.m_normalOnSurfaceB;
    }

    /**
     * Get the stored closest point in B
     */
    getClosestPointInB(): btVector3 {
        return this.m_closestPointInB;
    }

    /**
     * Get the stored distance (negative for penetration)
     */
    getDistance(): number {
        return this.m_distance;
    }

    /**
     * Reset the result for reuse
     */
    reset(): void {
        this.m_normalOnSurfaceB.setValue(0, 0, 0);
        this.m_closestPointInB.setValue(0, 0, 0);
        this.m_distance = BT_LARGE_FLOAT;
    }
}