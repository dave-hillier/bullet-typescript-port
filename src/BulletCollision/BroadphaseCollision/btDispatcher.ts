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

// Forward declarations for dependencies
export interface btCollisionAlgorithm {
  // This will be properly defined in btCollisionAlgorithm.ts
}

export interface btBroadphaseProxy {
  m_uniqueId: number;
  m_clientObject: any;
  m_collisionFilterGroup: number;
  m_collisionFilterMask: number;
}

export interface btRigidBody {
  // Forward declaration
}

export interface btCollisionObject {
  // Forward declaration
}

export interface btOverlappingPairCache {
  // Forward declaration
}

export interface btCollisionObjectWrapper {
  // Forward declaration
}

export interface btPersistentManifold {
  // Forward declaration
}

export interface btPoolAllocator {
  // Forward declaration
}

export interface btIDebugDraw {
  // Forward declaration
}

/**
 * Dispatcher information structure containing settings and state for collision detection
 */
export class btDispatcherInfo {
  public static readonly DispatchFunc = {
    DISPATCH_DISCRETE: 1,
    DISPATCH_CONTINUOUS: 2
  } as const;

  public m_timeStep: number;
  public m_stepCount: number;
  public m_dispatchFunc: number;
  public m_timeOfImpact: number;
  public m_useContinuous: boolean;
  public m_debugDraw: btIDebugDraw | null;
  public m_enableSatConvex: boolean;
  public m_enableSPU: boolean;
  public m_useEpa: boolean;
  public m_allowedCcdPenetration: number;
  public m_useConvexConservativeDistanceUtil: boolean;
  public m_convexConservativeDistanceThreshold: number;
  public m_deterministicOverlappingPairs: boolean;

  constructor() {
    this.m_timeStep = 0.0;
    this.m_stepCount = 0;
    this.m_dispatchFunc = btDispatcherInfo.DispatchFunc.DISPATCH_DISCRETE;
    this.m_timeOfImpact = 1.0;
    this.m_useContinuous = true;
    this.m_debugDraw = null;
    this.m_enableSatConvex = false;
    this.m_enableSPU = true;
    this.m_useEpa = true;
    this.m_allowedCcdPenetration = 0.04;
    this.m_useConvexConservativeDistanceUtil = false;
    this.m_convexConservativeDistanceThreshold = 0.0;
    this.m_deterministicOverlappingPairs = false;
  }
}

/**
 * Enumeration for dispatcher query types
 */
export enum ebtDispatcherQueryType {
  BT_CONTACT_POINT_ALGORITHMS = 1,
  BT_CLOSEST_POINT_ALGORITHMS = 2
}

/**
 * The btDispatcher interface class can be used in combination with broadphase to dispatch calculations for overlapping pairs.
 * For example for pairwise collision detection, calculating contact points stored in btPersistentManifold or user callbacks (game logic).
 */
export abstract class btDispatcher {
  
  /**
   * Find and return a collision algorithm for the given collision object wrappers
   * @param body0Wrap First collision object wrapper
   * @param body1Wrap Second collision object wrapper
   * @param sharedManifold Shared persistent manifold (can be null)
   * @param queryType Type of query (contact points or closest points)
   * @returns Collision algorithm instance or null
   */
  public abstract findAlgorithm(
    body0Wrap: btCollisionObjectWrapper,
    body1Wrap: btCollisionObjectWrapper,
    sharedManifold: btPersistentManifold | null,
    queryType: ebtDispatcherQueryType
  ): btCollisionAlgorithm | null;

  /**
   * Get a new persistent manifold for the given collision objects
   * @param b0 First collision object
   * @param b1 Second collision object
   * @returns New persistent manifold
   */
  public abstract getNewManifold(b0: btCollisionObject, b1: btCollisionObject): btPersistentManifold;

  /**
   * Release a persistent manifold
   * @param manifold Manifold to release
   */
  public abstract releaseManifold(manifold: btPersistentManifold): void;

  /**
   * Clear a persistent manifold
   * @param manifold Manifold to clear
   */
  public abstract clearManifold(manifold: btPersistentManifold): void;

  /**
   * Check if collision detection is needed between two objects
   * @param body0 First collision object
   * @param body1 Second collision object
   * @returns True if collision detection is needed
   */
  public abstract needsCollision(body0: btCollisionObject, body1: btCollisionObject): boolean;

  /**
   * Check if collision response is needed between two objects
   * @param body0 First collision object
   * @param body1 Second collision object
   * @returns True if collision response is needed
   */
  public abstract needsResponse(body0: btCollisionObject, body1: btCollisionObject): boolean;

  /**
   * Dispatch collision detection for all overlapping pairs
   * @param pairCache Cache containing overlapping pairs
   * @param dispatchInfo Dispatcher information and settings
   * @param dispatcher Reference to the dispatcher instance
   */
  public abstract dispatchAllCollisionPairs(
    pairCache: btOverlappingPairCache,
    dispatchInfo: btDispatcherInfo,
    dispatcher: btDispatcher
  ): void;

  /**
   * Get the number of manifolds currently managed
   * @returns Number of manifolds
   */
  public abstract getNumManifolds(): number;

  /**
   * Get a manifold by its index
   * @param index Index of the manifold
   * @returns Manifold at the given index
   */
  public abstract getManifoldByIndexInternal(index: number): btPersistentManifold;

  /**
   * Get pointer to internal manifold array (for advanced use)
   * @returns Array of manifold pointers
   */
  public abstract getInternalManifoldPointer(): btPersistentManifold[];

  /**
   * Get the internal manifold pool allocator
   * @returns Pool allocator instance
   */
  public abstract getInternalManifoldPool(): btPoolAllocator;

  /**
   * Get the internal manifold pool allocator (const version)
   * @returns Pool allocator instance
   */
  public abstract getInternalManifoldPoolConst(): btPoolAllocator;

  /**
   * Allocate memory for a collision algorithm
   * @param size Size of memory to allocate
   * @returns Allocated memory pointer (in TypeScript, this returns an object)
   */
  public abstract allocateCollisionAlgorithm(size: number): any;

  /**
   * Free memory allocated for a collision algorithm
   * @param ptr Pointer to memory to free
   */
  public abstract freeCollisionAlgorithm(ptr: any): void;
}