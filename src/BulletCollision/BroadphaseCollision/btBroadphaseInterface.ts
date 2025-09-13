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
import { btBroadphaseProxy } from './btBroadphaseProxy';
import { btDispatcher } from './btDispatcher';

// Forward declaration for btOverlappingPairCache - will be properly defined when porting that class
export interface btOverlappingPairCache {
  // Interface placeholder - will be defined when porting btOverlappingPairCache.ts
}

/**
 * Callback interface for AABB testing in broadphase
 */
export abstract class btBroadphaseAabbCallback {
  /**
   * Process a broadphase proxy
   * @param proxy The broadphase proxy to process
   * @returns True if processing should continue, false otherwise
   */
  public abstract process(proxy: btBroadphaseProxy): boolean;
}

/**
 * Callback interface for ray testing in broadphase
 * Extends btBroadphaseAabbCallback with cached data to accelerate ray-AABB tests
 */
export abstract class btBroadphaseRayCallback extends btBroadphaseAabbCallback {
  /// Added some cached data to accelerate ray-AABB tests
  public m_rayDirectionInverse: btVector3;
  public m_signs: [number, number, number];
  public m_lambda_max: number;

  constructor() {
    super();
    this.m_rayDirectionInverse = new btVector3();
    this.m_signs = [0, 0, 0];
    this.m_lambda_max = 0;
  }
}

/**
 * The btBroadphaseInterface class provides an interface to detect aabb-overlapping object pairs.
 * Some implementations for this broadphase interface include btAxisSweep3, bt32BitAxisSweep3 and btDbvtBroadphase.
 * The actual overlapping pair management, storage, adding and removing of pairs is dealt by the btOverlappingPairCache class.
 */
export abstract class btBroadphaseInterface {

  /**
   * Create a broadphase proxy
   * @param aabbMin Minimum AABB coordinates
   * @param aabbMax Maximum AABB coordinates
   * @param shapeType Type of collision shape
   * @param userPtr User pointer (typically collision object)
   * @param collisionFilterGroup Collision filter group
   * @param collisionFilterMask Collision filter mask
   * @param dispatcher Dispatcher instance
   * @returns Created broadphase proxy
   */
  public abstract createProxy(
    aabbMin: btVector3,
    aabbMax: btVector3,
    shapeType: number,
    userPtr: any,
    collisionFilterGroup: number,
    collisionFilterMask: number,
    dispatcher: btDispatcher
  ): btBroadphaseProxy;

  /**
   * Destroy a broadphase proxy
   * @param proxy Proxy to destroy
   * @param dispatcher Dispatcher instance
   */
  public abstract destroyProxy(proxy: btBroadphaseProxy, dispatcher: btDispatcher): void;

  /**
   * Update the AABB of a broadphase proxy
   * @param proxy Proxy to update
   * @param aabbMin New minimum AABB coordinates
   * @param aabbMax New maximum AABB coordinates
   * @param dispatcher Dispatcher instance
   */
  public abstract setAabb(
    proxy: btBroadphaseProxy,
    aabbMin: btVector3,
    aabbMax: btVector3,
    dispatcher: btDispatcher
  ): void;

  /**
   * Get the AABB of a broadphase proxy
   * @param proxy Proxy to query
   * @param aabbMin Output minimum AABB coordinates
   * @param aabbMax Output maximum AABB coordinates
   */
  public abstract getAabb(proxy: btBroadphaseProxy, aabbMin: btVector3, aabbMax: btVector3): void;

  /**
   * Perform a ray test against the broadphase
   * @param rayFrom Ray starting point
   * @param rayTo Ray ending point
   * @param rayCallback Callback to process ray hits
   * @param aabbMin Optional AABB minimum for culling (default: zero vector)
   * @param aabbMax Optional AABB maximum for culling (default: zero vector)
   */
  public abstract rayTest(
    rayFrom: btVector3,
    rayTo: btVector3,
    rayCallback: btBroadphaseRayCallback,
    aabbMin?: btVector3,
    aabbMax?: btVector3
  ): void;

  /**
   * Perform an AABB test against the broadphase
   * @param aabbMin AABB minimum coordinates
   * @param aabbMax AABB maximum coordinates
   * @param callback Callback to process AABB overlaps
   */
  public abstract aabbTest(
    aabbMin: btVector3,
    aabbMax: btVector3,
    callback: btBroadphaseAabbCallback
  ): void;

  /**
   * Calculate overlapping pairs
   * Note: This is optional - incremental algorithms (sweep and prune) might do it during setAabb
   * @param dispatcher Dispatcher instance
   */
  public abstract calculateOverlappingPairs(dispatcher: btDispatcher): void;

  /**
   * Get the overlapping pair cache
   * @returns Overlapping pair cache instance
   */
  public abstract getOverlappingPairCache(): btOverlappingPairCache;

  /**
   * Get the overlapping pair cache (const version)
   * @returns Overlapping pair cache instance
   */
  public abstract getOverlappingPairCacheConst(): btOverlappingPairCache;

  /**
   * Get the broadphase AABB in the 'global' coordinate frame
   * @param aabbMin Output minimum AABB coordinates
   * @param aabbMax Output maximum AABB coordinates
   */
  public abstract getBroadphaseAabb(aabbMin: btVector3, aabbMax: btVector3): void;

  /**
   * Reset broadphase internal structures, to ensure determinism/reproducibility
   * @param dispatcher Dispatcher instance
   */
  public resetPool(_dispatcher: btDispatcher): void {
    // Default implementation does nothing
    // Implementations can override this if they need to reset internal state
  }

  /**
   * Print statistics about the broadphase
   */
  public abstract printStats(): void;
}