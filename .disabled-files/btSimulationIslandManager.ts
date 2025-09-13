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

import { btUnionFind } from './btUnionFind';
import { btCollisionObject } from './btCollisionObject';
import { btCollisionWorld } from './btCollisionWorld';
import { btDispatcher } from '../BroadphaseCollision/btDispatcher';
import { btPersistentManifold } from '../NarrowPhaseCollision/btPersistentManifold';

/**
 * Callback interface for processing simulation islands
 */
export interface IslandCallback {
  processIsland(bodies: btCollisionObject[], manifolds: btPersistentManifold[], islandId: number): void;
}

/**
 * SimulationIslandManager creates and handles simulation islands, using btUnionFind
 */
export class btSimulationIslandManager {
  private m_unionFind: btUnionFind = new btUnionFind();
  private m_islandmanifold: btPersistentManifold[] = [];
  private m_islandBodies: btCollisionObject[] = [];
  private m_splitIslands: boolean = true;

  constructor() {
    // Constructor implementation
  }

  initUnionFind(n: number): void {
    this.m_unionFind.reset(n);
  }

  getUnionFind(): btUnionFind {
    return this.m_unionFind;
  }

  updateActivationState(colWorld: btCollisionWorld, dispatcher: btDispatcher): void {
    // Initialize union find with all collision objects
    this.initUnionFind(colWorld.getNumCollisionObjects());

    // Tag all collision objects with their array index
    for (let i = 0; i < colWorld.getNumCollisionObjects(); i++) {
      const collisionObject = colWorld.getCollisionObjectArray()[i];
      if (collisionObject) {
        collisionObject.setIslandTag(i);
        collisionObject.setCompanionId(-1);
        collisionObject.setActivationState(1); // ACTIVE_TAG
      }
    }

    // Update activation state based on constraints and manifolds
    this.findUnions(dispatcher, colWorld);
  }

  storeIslandActivationState(world: btCollisionWorld): void {
    // Store the island id in each body
    for (let i = 0; i < world.getNumCollisionObjects(); i++) {
      const collisionObject = world.getCollisionObjectArray()[i];
      if (collisionObject) {
        const islandId = this.m_unionFind.find(i);
        collisionObject.setIslandTag(islandId);
      }
    }
  }

  findUnions(dispatcher: btDispatcher, colWorld: btCollisionWorld): void {
    // Process all manifolds to connect bodies
    for (let i = 0; i < dispatcher.getNumManifolds(); i++) {
      const manifold = dispatcher.getManifoldByIndexInternal(i);
      if (manifold && manifold.getNumContacts() > 0) {
        const colObj0 = manifold.getBody0() as btCollisionObject;
        const colObj1 = manifold.getBody1() as btCollisionObject;

        if (colObj0 && colObj1) {
          const tag0 = colObj0.getIslandTag();
          const tag1 = colObj1.getIslandTag();

          if (tag0 >= 0 && tag1 >= 0) {
            this.m_unionFind.unite(tag0, tag1);
          }
        }
      }
    }
  }

  /**
   * Abstract callback interface for processing simulation islands
   */
  static abstract class IslandCallback {
    abstract processIsland(
      bodies: btCollisionObject[],
      numBodies: number,
      manifolds: btPersistentManifold[],
      numManifolds: number,
      islandId: number
    ): void;
  }

  buildAndProcessIslands(dispatcher: btDispatcher, collisionWorld: btCollisionWorld, callback: btSimulationIslandManager.IslandCallback): void {
    this.buildIslands(dispatcher, collisionWorld);
    this.processIslands(dispatcher, collisionWorld, callback);
  }

  buildIslands(dispatcher: btDispatcher, colWorld: btCollisionWorld): void {
    // Clear existing island data
    this.m_islandBodies = [];
    this.m_islandmanifold = [];

    // Sort islands for efficient processing
    this.m_unionFind.sortIslands();

    // Build island arrays
    const numElem = this.m_unionFind.getNumElements();
    
    for (let i = 0; i < numElem; i++) {
      const element = this.m_unionFind.getElement(i);
      const islandId = element.m_id;
      
      if (islandId === i) {
        // This is a root element (island representative)
        const collisionObject = colWorld.getCollisionObjectArray()[i];
        if (collisionObject) {
          this.m_islandBodies.push(collisionObject);
        }
      }
    }

    // Build manifold array for islands
    for (let i = 0; i < dispatcher.getNumManifolds(); i++) {
      const manifold = dispatcher.getManifoldByIndexInternal(i);
      if (manifold && manifold.getNumContacts() > 0) {
        this.m_islandmanifold.push(manifold);
      }
    }
  }

  processIslands(dispatcher: btDispatcher, collisionWorld: btCollisionWorld, callback: IslandCallback): void {
    // Process each island separately
    const islandMap = new Map<number, { bodies: btCollisionObject[], manifolds: btPersistentManifold[] }>();

    // Group bodies by island
    for (const body of this.m_islandBodies) {
      const islandId = body.getIslandTag();
      if (!islandMap.has(islandId)) {
        islandMap.set(islandId, { bodies: [], manifolds: [] });
      }
      islandMap.get(islandId)!.bodies.push(body);
    }

    // Group manifolds by island
    for (const manifold of this.m_islandmanifold) {
      const body0 = manifold.getBody0() as btCollisionObject;
      if (body0) {
        const islandId = body0.getIslandTag();
        const island = islandMap.get(islandId);
        if (island) {
          island.manifolds.push(manifold);
        }
      }
    }

    // Process each island
    for (const [islandId, island] of islandMap.entries()) {
      if (island.bodies.length > 0) {
        callback.processIsland(
          island.bodies,
          island.bodies.length,
          island.manifolds,
          island.manifolds.length,
          islandId
        );
      }
    }
  }

  getSplitIslands(): boolean {
    return this.m_splitIslands;
  }

  setSplitIslands(doSplitIslands: boolean): void {
    this.m_splitIslands = doSplitIslands;
  }
}