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
import { btRigidBody, btRigidBodyConstructionInfo } from './btRigidBody';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
/**
 * Basic interface to allow actions such as vehicles and characters to be updated inside a btDynamicsWorld
 */
export class btActionInterface {
    static getFixedBody() {
        // Create a static fixed body if it doesn't exist
        if (!btActionInterface.s_fixedBody) {
            // Create a minimal static rigid body for constraints
            const groundShape = null; // Placeholder - would be an actual collision shape
            const rbInfo = new btRigidBodyConstructionInfo(0, null, groundShape, new btVector3(0, 0, 0));
            rbInfo.m_startWorldTransform = new btTransform();
            rbInfo.m_startWorldTransform.setIdentity();
            btActionInterface.s_fixedBody = new btRigidBody(rbInfo);
        }
        return btActionInterface.s_fixedBody;
    }
}
btActionInterface.s_fixedBody = null;
