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

import { btContactSolverInfo } from './btContactSolverInfo';
import { btCollisionObject } from '../../BulletCollision/CollisionDispatch/btCollisionObject';
import { btPersistentManifold } from '../../BulletCollision/NarrowPhaseCollision/btPersistentManifold';
import { btDispatcher } from '../../BulletCollision/BroadphaseCollision/btDispatcher';

// Forward declarations for types we haven't ported yet
export interface btTypedConstraint {
  // Will be defined when we port the constraint system
}

export interface btIDebugDraw {
  // Will be defined when we port the debug drawing system
}

export enum btConstraintSolverType {
  BT_SEQUENTIAL_IMPULSE_SOLVER = 1,
  BT_MLCP_SOLVER = 2,
  BT_NNCG_SOLVER = 4,
  BT_MULTIBODY_SOLVER = 8,
  BT_BLOCK_SOLVER = 16,
}

/**
 * btConstraintSolver provides solver interface
 */
export abstract class btConstraintSolver {
  
  prepareSolve(_numBodies: number, _numManifolds: number): void {
    // Default implementation does nothing
  }

  /**
   * solve a group of constraints
   */
  abstract solveGroup(
    bodies: btCollisionObject[],
    numBodies: number,
    manifolds: btPersistentManifold[],
    numManifolds: number,
    constraints: btTypedConstraint[],
    numConstraints: number,
    info: btContactSolverInfo,
    debugDrawer: btIDebugDraw | null,
    dispatcher: btDispatcher
  ): number;

  allSolved(_info: btContactSolverInfo, _debugDrawer: btIDebugDraw | null): void {
    // Default implementation does nothing
  }

  /**
   * clear internal cached data and reset random seed
   */
  abstract reset(): void;

  abstract getSolverType(): btConstraintSolverType;
}