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

Modified for TypeScript port by Claude Code.
*/

import { btVector3 } from '../../../src/LinearMath/btVector3.js';
import { btTransform } from '../../../src/LinearMath/btTransform.js';
import { btDbvtBroadphase } from '../../../src/BulletCollision/BroadphaseCollision/btDbvtBroadphase.js';
import { btDefaultCollisionConfiguration } from '../../../src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration.js';
import { btCollisionDispatcher } from '../../../src/BulletCollision/CollisionDispatch/btCollisionDispatcher.js';
import { btSequentialImpulseConstraintSolver } from '../../../src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver.js';
import { btDiscreteDynamicsWorld } from '../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld.js';
import { btRigidBody, btRigidBodyConstructionInfo } from '../../../src/BulletDynamics/Dynamics/btRigidBody.js';
import { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape.js';
import { btDefaultMotionState } from '../../../src/LinearMath/btMotionState.js';

import type { btCollisionShape } from '../../../src/BulletCollision/CollisionShapes/btCollisionShape.js';
import type { btBroadphaseInterface } from '../../../src/BulletCollision/BroadphaseCollision/btBroadphaseInterface.js';
import type { btConstraintSolver } from '../../../src/BulletDynamics/ConstraintSolver/btConstraintSolver.js';
import type { btCollisionConfiguration } from '../../../src/BulletCollision/CollisionDispatch/btCollisionConfiguration.js';

import { CommonExampleInterface } from '../../CommonInterfaces/CommonExampleInterface.js';
import type { SimpleThreeJsGUIHelper } from './SimpleThreeJsGUIHelper.js';

export abstract class SimpleRigidBodyBase implements CommonExampleInterface {
    // Keep the collision shapes, for deletion/cleanup
    protected m_collisionShapes: btCollisionShape[] = [];
    protected m_broadphase: btBroadphaseInterface | null = null;
    protected m_dispatcher: btCollisionDispatcher | null = null;
    protected m_solver: btConstraintSolver | null = null;
    protected m_collisionConfiguration: btCollisionConfiguration | null = null;
    protected m_dynamicsWorld: btDiscreteDynamicsWorld | null = null;
    protected m_guiHelper: SimpleThreeJsGUIHelper;

    constructor(guiHelper: SimpleThreeJsGUIHelper) {
        this.m_guiHelper = guiHelper;
    }

    public getDynamicsWorld(): btDiscreteDynamicsWorld | null {
        return this.m_dynamicsWorld;
    }

    public createEmptyDynamicsWorld(): void {
        // Collision configuration contains default setup for memory, collision setup
        this.m_collisionConfiguration = new btDefaultCollisionConfiguration();

        // Use the default collision dispatcher. For parallel processing you can use a different dispatcher
        this.m_dispatcher = new btCollisionDispatcher(this.m_collisionConfiguration);

        this.m_broadphase = new btDbvtBroadphase();

        // The default constraint solver. For parallel processing you can use a different solver
        const sol = new btSequentialImpulseConstraintSolver();
        this.m_solver = sol;

        this.m_dynamicsWorld = new btDiscreteDynamicsWorld(
            this.m_dispatcher,
            this.m_broadphase,
            this.m_solver,
            this.m_collisionConfiguration
        );

        this.m_dynamicsWorld.setGravity(new btVector3(0, -10, 0));
    }

    public stepSimulation(deltaTime: number): void {
        if (this.m_dynamicsWorld) {
            this.m_dynamicsWorld.stepSimulation(deltaTime);
        }
    }

    public exitPhysics(): void {
        // Cleanup in the reverse order of creation/initialization

        // Remove the rigidbodies from the dynamics world and delete them
        if (this.m_dynamicsWorld) {
            // Remove constraints
            for (let i = this.m_dynamicsWorld.getNumConstraints() - 1; i >= 0; i--) {
                const constraint = this.m_dynamicsWorld.getConstraint(i);
                if (constraint) {
                    this.m_dynamicsWorld.removeConstraint(constraint);
                }
            }

            // Remove collision objects
            for (let i = this.m_dynamicsWorld.getNumCollisionObjects() - 1; i >= 0; i--) {
                const obj = this.m_dynamicsWorld.getCollisionObjectArray()[i];
                this.m_dynamicsWorld.removeCollisionObject(obj);
            }
        }

        // Clear collision shapes array (GC will handle cleanup)
        this.m_collisionShapes.length = 0;

        // Clear references for GC
        this.m_dynamicsWorld = null;
        this.m_solver = null;
        this.m_broadphase = null;
        this.m_dispatcher = null;
        this.m_collisionConfiguration = null;
    }

    public createBoxShape(halfExtents: btVector3): btBoxShape {
        const box = new btBoxShape(halfExtents);
        return box;
    }

    public createRigidBody(
        mass: number,
        startTransform: btTransform,
        shape: btCollisionShape,
        color: btVector3 = new btVector3(1, 0, 0)
    ): btRigidBody {
        // Debug the input transform
        const inputOrigin = startTransform.getOrigin();
        console.log(`createRigidBody input transform: (${inputOrigin.x().toFixed(1)}, ${inputOrigin.y().toFixed(1)}, ${inputOrigin.z().toFixed(1)})`);

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

        // Debug the body's transform after creation
        const bodyTransform = body.getWorldTransform();
        const bodyOrigin = bodyTransform.getOrigin();
        console.log(`createRigidBody result transform: (${bodyOrigin.x().toFixed(1)}, ${bodyOrigin.y().toFixed(1)}, ${bodyOrigin.z().toFixed(1)})`);

        // WORKAROUND: If the transform is not set correctly, set it manually
        if (bodyOrigin.x() === 0 && bodyOrigin.y() === 0 && bodyOrigin.z() === 0) {
            console.log(`Workaround: Setting world transform manually`);
            body.setWorldTransform(startTransform);

            // Verify the fix worked
            const fixedTransform = body.getWorldTransform();
            const fixedOrigin = fixedTransform.getOrigin();
            console.log(`Fixed transform: (${fixedOrigin.x().toFixed(1)}, ${fixedOrigin.y().toFixed(1)}, ${fixedOrigin.z().toFixed(1)})`);
        }

        if (this.m_dynamicsWorld) {
            this.m_dynamicsWorld.addRigidBody(body);
        }

        // Register with GUI helper for rendering
        this.m_guiHelper.addRigidBody(body, shape, color);

        return body;
    }

    public renderScene(): void {
        if (this.m_dynamicsWorld && this.m_guiHelper) {
            // Sync physics to graphics
            this.m_guiHelper.syncPhysicsToGraphics(this.m_dynamicsWorld);
        }
    }

    // Abstract methods that subclasses must implement
    public abstract initPhysics(): void;

    // Optional methods that subclasses can override
    public resetCamera(): void {
        // Default camera reset - can be overridden
        this.m_guiHelper.resetCamera();
    }

    // Implement remaining CommonExampleInterface methods
    public keyboardCallback(key: number, state: number): boolean {
        return false; // Not handled
    }

    public keyboardCallbackUp(key: number, state: number): boolean {
        return false; // Not handled
    }

    public specialKeyboard(key: number, state: number): boolean {
        return false; // Not handled
    }

    public specialKeyboardUp(key: number, state: number): boolean {
        return false; // Not handled
    }

    public mouseButtonCallback(button: number, state: number, x: number, y: number): boolean {
        return false; // Not handled
    }

    public mouseMoveCallback(x: number, y: number): boolean {
        return false; // Not handled
    }

    public displayCallback(): void {
        // Default empty implementation
    }

    public physicsDebugDraw(debugFlags: number): void {
        if (this.m_dynamicsWorld && this.m_dynamicsWorld.getDebugDrawer()) {
            this.m_dynamicsWorld.getDebugDrawer()!.setDebugMode(debugFlags);
            this.m_dynamicsWorld.debugDrawWorld();
        }
    }
}