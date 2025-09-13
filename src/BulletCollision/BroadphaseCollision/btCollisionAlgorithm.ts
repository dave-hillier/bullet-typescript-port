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

import { btDispatcher, btDispatcherInfo } from './btDispatcher';

// Forward declarations for dependencies
export interface btBroadphaseProxy {
  // Forward declaration
}

export interface btManifoldResult {
  // Forward declaration
}

export interface btCollisionObject {
  // Forward declaration
}

export interface btCollisionObjectWrapper {
  // Forward declaration
}

export interface btPersistentManifold {
  // Forward declaration
}

/**
 * Type alias for arrays of persistent manifolds
 */
export type btManifoldArray = btPersistentManifold[];

/**
 * Construction information for collision algorithms
 */
export class btCollisionAlgorithmConstructionInfo {
  public m_dispatcher1: btDispatcher | null;
  public m_manifold: btPersistentManifold | null;

  constructor();
  constructor(dispatcher: btDispatcher, temp?: number);
  constructor(dispatcher?: btDispatcher, _temp?: number) {
    if (dispatcher) {
      this.m_dispatcher1 = dispatcher;
      this.m_manifold = null;
      // temp parameter is ignored as in the original C++ code
    } else {
      this.m_dispatcher1 = null;
      this.m_manifold = null;
    }
  }
}

/**
 * btCollisionAlgorithm is a collision interface that is compatible with the Broadphase and btDispatcher.
 * It is persistent over frames
 */
export abstract class btCollisionAlgorithm {
  protected m_dispatcher: btDispatcher | null;

  constructor();
  constructor(ci: btCollisionAlgorithmConstructionInfo);
  constructor(ci?: btCollisionAlgorithmConstructionInfo) {
    if (ci) {
      this.m_dispatcher = ci.m_dispatcher1;
    } else {
      this.m_dispatcher = null;
    }
  }

  /**
   * Process collision between two collision object wrappers
   * @param body0Wrap First collision object wrapper
   * @param body1Wrap Second collision object wrapper
   * @param dispatchInfo Dispatcher information and settings
   * @param resultOut Result output for manifold points
   */
  public abstract processCollision(
    body0Wrap: btCollisionObjectWrapper,
    body1Wrap: btCollisionObjectWrapper,
    dispatchInfo: btDispatcherInfo,
    resultOut: btManifoldResult
  ): void;

  /**
   * Calculate the time of impact between two collision objects
   * @param body0 First collision object
   * @param body1 Second collision object
   * @param dispatchInfo Dispatcher information and settings
   * @param resultOut Result output for manifold points
   * @returns Time of impact as a scalar value
   */
  public abstract calculateTimeOfImpact(
    body0: btCollisionObject,
    body1: btCollisionObject,
    dispatchInfo: btDispatcherInfo,
    resultOut: btManifoldResult
  ): number;

  /**
   * Get all contact manifolds associated with this collision algorithm
   * @param manifoldArray Array to populate with manifolds
   */
  public abstract getAllContactManifolds(manifoldArray: btManifoldArray): void;

  /**
   * Get the dispatcher associated with this collision algorithm
   * @returns Dispatcher instance or null
   */
  public getDispatcher(): btDispatcher | null {
    return this.m_dispatcher;
  }

  /**
   * Set the dispatcher for this collision algorithm
   * @param dispatcher Dispatcher to set
   */
  public setDispatcher(dispatcher: btDispatcher | null): void {
    this.m_dispatcher = dispatcher;
  }
}