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

import { btCollisionWorld } from '../../BulletCollision/CollisionDispatch/btCollisionWorld';
import { btDispatcher } from '../../BulletCollision/BroadphaseCollision/btDispatcher';
import { btBroadphaseInterface } from '../../BulletCollision/BroadphaseCollision/btBroadphaseInterface';
import { btCollisionConfiguration } from '../../BulletCollision/CollisionDispatch/btCollisionConfiguration';
import { btVector3 } from '../../LinearMath/btVector3';
import { btContactSolverInfo } from '../ConstraintSolver/btContactSolverInfo';
import { btConstraintSolver } from '../ConstraintSolver/btConstraintSolver';
import { btActionInterface } from './btActionInterface';
import { btRigidBody } from './btRigidBody';

// Forward declarations for types we haven't fully ported yet
export interface btTypedConstraint {
  // Will be defined when we port the constraint system
}

// Type for the callback for each tick
export type btInternalTickCallback = (world: btDynamicsWorld, timeStep: number) => void;

export enum btDynamicsWorldType {
  BT_SIMPLE_DYNAMICS_WORLD = 1,
  BT_DISCRETE_DYNAMICS_WORLD = 2,
  BT_CONTINUOUS_DYNAMICS_WORLD = 3,
  BT_SOFT_RIGID_DYNAMICS_WORLD = 4,
  BT_GPU_DYNAMICS_WORLD = 5,
  BT_SOFT_MULTIBODY_DYNAMICS_WORLD = 6,
  BT_DEFORMABLE_MULTIBODY_DYNAMICS_WORLD = 7
}

/**
 * The btDynamicsWorld is the interface class for several dynamics implementation, 
 * basic, discrete, parallel, and continuous etc.
 */
export abstract class btDynamicsWorld extends btCollisionWorld {
  protected m_internalTickCallback: btInternalTickCallback | null = null;
  protected m_internalPreTickCallback: btInternalTickCallback | null = null;
  protected m_worldUserInfo: any = null;
  protected m_solverInfo: btContactSolverInfo;

  constructor(
    dispatcher: btDispatcher,
    broadphase: btBroadphaseInterface,
    collisionConfiguration: btCollisionConfiguration
  ) {
    super(dispatcher, broadphase, collisionConfiguration);
    this.m_solverInfo = new btContactSolverInfo();
  }

  /**
   * stepSimulation proceeds the simulation over 'timeStep', units in preferably in seconds.
   * By default, Bullet will subdivide the timestep in constant substeps of each 'fixedTimeStep'.
   * in order to keep the simulation real-time, the maximum number of substeps can be clamped to 'maxSubSteps'.
   * You can disable subdividing the timestep/substepping by passing maxSubSteps=0 as second argument to stepSimulation, 
   * but in that case you have to keep the timeStep constant.
   */
  abstract stepSimulation(timeStep: number, maxSubSteps?: number, fixedTimeStep?: number): number;

  abstract debugDrawWorld(): void;

  addConstraint(_constraint: btTypedConstraint, _disableCollisionsBetweenLinkedBodies: boolean = false): void {
    // Default implementation does nothing
  }

  removeConstraint(_constraint: btTypedConstraint): void {
    // Default implementation does nothing
  }

  abstract addAction(action: btActionInterface): void;

  abstract removeAction(action: btActionInterface): void;

  // once a rigidbody is added to the dynamics world, it will get this gravity assigned
  // existing rigidbodies in the world get gravity assigned too, during this method
  abstract setGravity(gravity: btVector3): void;
  abstract getGravity(): btVector3;

  abstract synchronizeMotionStates(): void;

  abstract addRigidBody(body: btRigidBody, group?: number, mask?: number): void;

  abstract removeRigidBody(body: btRigidBody): void;

  abstract setConstraintSolver(solver: btConstraintSolver): void;

  abstract getConstraintSolver(): btConstraintSolver;

  getNumConstraints(): number {
    return 0;
  }

  getConstraint(_index: number): btTypedConstraint | null {
    return null;
  }

  getConstraintConst(_index: number): btTypedConstraint | null {
    return null;
  }

  abstract getWorldType(): btDynamicsWorldType;

  clearForces(): void {
    // Default implementation does nothing
  }

  // Internal tick callback
  setInternalTickCallback(cb: btInternalTickCallback | null, worldUserInfo: any = null, isPreTick: boolean = false): void {
    if (isPreTick) {
      this.m_internalPreTickCallback = cb;
    } else {
      this.m_internalTickCallback = cb;
    }
    this.m_worldUserInfo = worldUserInfo;
  }

  getInternalTickCallback(): btInternalTickCallback | null {
    return this.m_internalTickCallback;
  }

  getInternalPreTickCallback(): btInternalTickCallback | null {
    return this.m_internalPreTickCallback;
  }

  getWorldUserInfo(): any {
    return this.m_worldUserInfo;
  }

  setWorldUserInfo(worldUserInfo: any): void {
    this.m_worldUserInfo = worldUserInfo;
  }

  getSolverInfo(): btContactSolverInfo {
    return this.m_solverInfo;
  }

  // Solver info methods
  setNumTasks(_numTasks: number): void {
    // Default implementation - subclasses can override
  }
}