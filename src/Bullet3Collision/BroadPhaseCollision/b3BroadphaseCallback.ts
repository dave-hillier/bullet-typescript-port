/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2013 Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

/**
 * TypeScript port of Bullet3Collision/BroadPhaseCollision/b3BroadphaseCallback.h
 * Broadphase collision detection callback interfaces for the Bullet3 physics engine
 */

import { b3Vector3 } from '../../Bullet3Common/b3Vector3';
import { b3Scalar } from '../../Bullet3Common/b3Scalar';

/**
 * Collision filter groups for broadphase proxy filtering
 */
export enum CollisionFilterGroups {
    DefaultFilter = 1,
    StaticFilter = 2,
    KinematicFilter = 4,
    DebrisFilter = 8,
    SensorTrigger = 16,
    CharacterFilter = 32,
    AllFilter = -1  // all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
}

/**
 * Broadphase proxy interface - represents an object in the broadphase collision detection system
 * This corresponds to the C++ b3BroadphaseProxy struct
 */
export interface b3BroadphaseProxy {
    /** Usually the client b3CollisionObject or Rigidbody class */
    readonly clientObject: any;
    
    /** Collision filter group for this proxy */
    readonly collisionFilterGroup: number;
    
    /** Collision filter mask for this proxy */
    readonly collisionFilterMask: number;
    
    /** Unique identifier for paircache */
    readonly uniqueId: number;
    
    /** Minimum bounds of the axis-aligned bounding box */
    readonly aabbMin: b3Vector3;
    
    /** Maximum bounds of the axis-aligned bounding box */
    readonly aabbMax: b3Vector3;
    
    /**
     * Get the unique identifier for this proxy
     */
    getUid(): number;
}

/**
 * Abstract base class for broadphase AABB callbacks
 * This corresponds to the C++ b3BroadphaseAabbCallback struct
 */
export abstract class b3BroadphaseAabbCallback {
    /**
     * Process a broadphase proxy that overlaps with the query AABB
     * @param proxy - The broadphase proxy to process
     * @returns true to continue processing, false to stop
     */
    abstract process(proxy: b3BroadphaseProxy): boolean;
}

/**
 * Ray callback for broadphase ray tests, extends AABB callback
 * This corresponds to the C++ b3BroadphaseRayCallback struct
 */
export abstract class b3BroadphaseRayCallback extends b3BroadphaseAabbCallback {
    /** Added some cached data to accelerate ray-AABB tests */
    public readonly rayDirectionInverse: b3Vector3;
    
    /** Sign bits for each axis of the ray direction */
    public readonly signs: number[] = [0, 0, 0];
    
    /** Maximum lambda value for the ray */
    public lambdaMax: b3Scalar;

    /**
     * Constructor for ray callback
     * @param rayFrom - Starting point of the ray
     * @param rayTo - Ending point of the ray
     */
    constructor(rayFrom: b3Vector3, rayTo: b3Vector3) {
        super();
        
        // Calculate ray direction and its inverse
        const rayDirection = rayTo.subtract(rayFrom);
        this.rayDirectionInverse = new b3Vector3(
            rayDirection.x === 0 ? 1e30 : 1.0 / rayDirection.x,
            rayDirection.y === 0 ? 1e30 : 1.0 / rayDirection.y,
            rayDirection.z === 0 ? 1e30 : 1.0 / rayDirection.z
        );
        
        // Calculate sign bits for optimized AABB-ray intersection
        this.signs[0] = this.rayDirectionInverse.x < 0 ? 1 : 0;
        this.signs[1] = this.rayDirectionInverse.y < 0 ? 1 : 0;
        this.signs[2] = this.rayDirectionInverse.z < 0 ? 1 : 0;
        
        // Calculate maximum lambda (ray parameter)
        this.lambdaMax = rayDirection.length();
    }
}