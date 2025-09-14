/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2015 Google Inc. http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btVector3 } from '../../../src/LinearMath/btVector3';
import { btTransform } from '../../../src/LinearMath/btTransform';
import { btDbvtBroadphase } from '../../../src/BulletCollision/BroadphaseCollision/btDbvtBroadphase';
import { btDefaultCollisionConfiguration } from '../../../src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration';
import { btCollisionDispatcher } from '../../../src/BulletCollision/CollisionDispatch/btCollisionDispatcher';
import { btSequentialImpulseConstraintSolver } from '../../../src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver';
import { btDiscreteDynamicsWorld } from '../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody, btRigidBodyConstructionInfo } from '../../../src/BulletDynamics/Dynamics/btRigidBody';
import { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btDefaultMotionState } from '../../../src/LinearMath/btMotionState';

import type { btCollisionShape } from '../../../src/BulletCollision/CollisionShapes/btCollisionShape';

// Common physics world state
export interface PhysicsWorld {
    collisionShapes: btCollisionShape[];
    dynamicsWorld: btDiscreteDynamicsWorld;
}

// Common example interface - equivalent to CommonExampleInterface
export interface ExampleInterface {
    initPhysics(): void;
    stepSimulation(deltaTime: number): void;
    exitPhysics(): void;
    resetCamera?(): void;
    renderScene?(): void;
    getDynamicsWorld(): btDiscreteDynamicsWorld | null;
}

// GUI Helper interface - simplified version of GUIHelperInterface  
export interface GuiHelper {
    resetCamera(dist?: number, yaw?: number, pitch?: number, targetX?: number, targetY?: number, targetZ?: number): void;
    setUpAxis(axis: number): void;
    render(): void;
    syncPhysicsToGraphics(world: btDiscreteDynamicsWorld): void;
}

// Create empty dynamics world - equivalent to CommonRigidBodyBase::createEmptyDynamicsWorld
export function createEmptyDynamicsWorld(): PhysicsWorld {
    // Collision configuration contains default setup for memory, collision setup
    const collisionConfiguration = new btDefaultCollisionConfiguration();

    // Use the default collision dispatcher
    const dispatcher = new btCollisionDispatcher(collisionConfiguration);

    const broadphase = new btDbvtBroadphase();

    // The default constraint solver
    const solver = new btSequentialImpulseConstraintSolver();

    const dynamicsWorld = new btDiscreteDynamicsWorld(
        dispatcher,
        broadphase,
        solver,
        collisionConfiguration
    );

    dynamicsWorld.setGravity(new btVector3(0, -10, 0));

    return {
        collisionShapes: [],
        dynamicsWorld
    };
}

// Create box shape helper - equivalent to CommonRigidBodyBase::createBoxShape
export function createBoxShape(halfExtents: btVector3): btBoxShape {
    return new btBoxShape(halfExtents);
}

// Create rigid body helper - equivalent to CommonRigidBodyBase::createRigidBody  
export function createRigidBody(
    physicsWorld: PhysicsWorld,
    mass: number,
    startTransform: btTransform,
    shape: btCollisionShape,
    color: btVector3 = new btVector3(1, 0, 0)
): btRigidBody {
    // Rigidbody is dynamic if and only if mass is non zero, otherwise static
    const isDynamic = mass !== 0.0;

    const localInertia = new btVector3(0, 0, 0);
    if (isDynamic) {
        shape.calculateLocalInertia(mass, localInertia);
    }

    // Using motionstate is recommended, it provides interpolation capabilities
    const myMotionState = new btDefaultMotionState(startTransform);

    const cInfo = new btRigidBodyConstructionInfo(
        mass,
        myMotionState,
        shape,
        localInertia
    );

    const body = new btRigidBody(cInfo);
    body.setUserIndex(-1);
    
    physicsWorld.dynamicsWorld.addRigidBody(body);

    return body;
}

// Exit physics helper - equivalent to CommonRigidBodyBase::exitPhysics
export function exitPhysics(physicsWorld: PhysicsWorld): void {
    const { dynamicsWorld } = physicsWorld;
    
    // Remove the rigidbodies from the dynamics world and delete them
    if (dynamicsWorld) {
        // Remove constraints
        for (let i = dynamicsWorld.getNumConstraints() - 1; i >= 0; i--) {
            dynamicsWorld.removeConstraint(dynamicsWorld.getConstraint(i));
        }
        
        // Remove collision objects
        for (let i = dynamicsWorld.getNumCollisionObjects() - 1; i >= 0; i--) {
            const obj = dynamicsWorld.getCollisionObjectArray()[i];
            dynamicsWorld.removeCollisionObject(obj);
        }
    }
    
    // Clear collision shapes array (GC will handle cleanup)
    physicsWorld.collisionShapes.length = 0;
}

// Step simulation helper
export function stepSimulation(physicsWorld: PhysicsWorld, deltaTime: number): void {
    physicsWorld.dynamicsWorld.stepSimulation(deltaTime);
}

// TypeScript equivalent of B3_STANDALONE_EXAMPLE macro
export function createStandaloneExample(
    exampleCreateFunc: () => ExampleInterface,
    guiHelper?: GuiHelper
): ExampleInterface {
    return exampleCreateFunc();
}

// Camera reset helper - equivalent to resetCamera in BasicExample
export function resetCamera(guiHelper: GuiHelper): void {
    const dist = 4;
    const pitch = -35;
    const yaw = 52;
    const targetPos = [0, 0, 0];
    guiHelper.resetCamera(dist, yaw, pitch, targetPos[0], targetPos[1], targetPos[2]);
}