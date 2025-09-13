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
import { btContactSolverInfo } from '../ConstraintSolver/btContactSolverInfo';
export var btDynamicsWorldType;
(function (btDynamicsWorldType) {
    btDynamicsWorldType[btDynamicsWorldType["BT_SIMPLE_DYNAMICS_WORLD"] = 1] = "BT_SIMPLE_DYNAMICS_WORLD";
    btDynamicsWorldType[btDynamicsWorldType["BT_DISCRETE_DYNAMICS_WORLD"] = 2] = "BT_DISCRETE_DYNAMICS_WORLD";
    btDynamicsWorldType[btDynamicsWorldType["BT_CONTINUOUS_DYNAMICS_WORLD"] = 3] = "BT_CONTINUOUS_DYNAMICS_WORLD";
    btDynamicsWorldType[btDynamicsWorldType["BT_SOFT_RIGID_DYNAMICS_WORLD"] = 4] = "BT_SOFT_RIGID_DYNAMICS_WORLD";
    btDynamicsWorldType[btDynamicsWorldType["BT_GPU_DYNAMICS_WORLD"] = 5] = "BT_GPU_DYNAMICS_WORLD";
    btDynamicsWorldType[btDynamicsWorldType["BT_SOFT_MULTIBODY_DYNAMICS_WORLD"] = 6] = "BT_SOFT_MULTIBODY_DYNAMICS_WORLD";
    btDynamicsWorldType[btDynamicsWorldType["BT_DEFORMABLE_MULTIBODY_DYNAMICS_WORLD"] = 7] = "BT_DEFORMABLE_MULTIBODY_DYNAMICS_WORLD";
})(btDynamicsWorldType || (btDynamicsWorldType = {}));
/**
 * The btDynamicsWorld is the interface class for several dynamics implementation,
 * basic, discrete, parallel, and continuous etc.
 */
export class btDynamicsWorld extends btCollisionWorld {
    constructor(dispatcher, broadphase, collisionConfiguration) {
        super(dispatcher, broadphase, collisionConfiguration);
        this.m_internalTickCallback = null;
        this.m_internalPreTickCallback = null;
        this.m_worldUserInfo = null;
        this.m_solverInfo = new btContactSolverInfo();
    }
    addConstraint(_constraint, _disableCollisionsBetweenLinkedBodies = false) {
        // Default implementation does nothing
    }
    removeConstraint(_constraint) {
        // Default implementation does nothing
    }
    getNumConstraints() {
        return 0;
    }
    getConstraint(_index) {
        return null;
    }
    getConstraintConst(_index) {
        return null;
    }
    clearForces() {
        // Default implementation does nothing
    }
    // Internal tick callback
    setInternalTickCallback(cb, worldUserInfo = null, isPreTick = false) {
        if (isPreTick) {
            this.m_internalPreTickCallback = cb;
        }
        else {
            this.m_internalTickCallback = cb;
        }
        this.m_worldUserInfo = worldUserInfo;
    }
    getInternalTickCallback() {
        return this.m_internalTickCallback;
    }
    getInternalPreTickCallback() {
        return this.m_internalPreTickCallback;
    }
    getWorldUserInfo() {
        return this.m_worldUserInfo;
    }
    setWorldUserInfo(worldUserInfo) {
        this.m_worldUserInfo = worldUserInfo;
    }
    getSolverInfo() {
        return this.m_solverInfo;
    }
    // Solver info methods
    setNumTasks(_numTasks) {
        // Default implementation - subclasses can override
    }
}
