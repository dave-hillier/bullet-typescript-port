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

import { btCollisionWorld } from '../../BulletCollision/CollisionDispatch/btCollisionWorld';
import { btRigidBody } from './btRigidBody';

// Forward declaration
export interface btIDebugDraw {
  // Will be defined when we port the debug drawing system
}

/**
 * Basic interface to allow actions such as vehicles and characters to be updated inside a btDynamicsWorld
 */
export abstract class btActionInterface {
  private static s_fixedBody: btRigidBody | null = null;

  protected static getFixedBody(): btRigidBody {
    // Create a static fixed body if it doesn't exist
    if (!btActionInterface.s_fixedBody) {
      // This is a placeholder - in the actual implementation this would be
      // a properly constructed static rigid body with zero mass
      btActionInterface.s_fixedBody = new btRigidBody(null, null, null);
    }
    return btActionInterface.s_fixedBody;
  }

  abstract updateAction(collisionWorld: btCollisionWorld, deltaTimeStep: number): void;

  abstract debugDraw(debugDrawer: btIDebugDraw): void;
}