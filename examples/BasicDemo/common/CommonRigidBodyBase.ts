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

import { btVector3 } from '@bullet3/LinearMath/btVector3';
import { btTransform } from '@bullet3/LinearMath/btTransform';
import { btDbvtBroadphase } from '@bullet3/BulletCollision/BroadphaseCollision/btDbvtBroadphase';
import { btDefaultCollisionConfiguration } from '@bullet3/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration';
import { btCollisionDispatcher } from '@bullet3/BulletCollision/CollisionDispatch/btCollisionDispatcher';
import { btSequentialImpulseConstraintSolver } from '@bullet3/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver';
import { btDiscreteDynamicsWorld } from '@bullet3/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody, btRigidBodyConstructionInfo } from '@bullet3/BulletDynamics/Dynamics/btRigidBody';
import { btBoxShape } from '@bullet3/BulletCollision/CollisionShapes/btBoxShape';
import { btDefaultMotionState } from '@bullet3/LinearMath/btDefaultMotionState';

import type { btCollisionShape } from '@bullet3/BulletCollision/CollisionShapes/btCollisionShape';
import type { btBroadphaseInterface } from '@bullet3/BulletCollision/BroadphaseCollision/btBroadphaseInterface';
import type { btConstraintSolver } from '@bullet3/BulletDynamics/ConstraintSolver/btConstraintSolver';
import type { btCollisionConfiguration } from '@bullet3/BulletCollision/CollisionDispatch/btCollisionConfiguration';
import type { btTypedConstraint } from '@bullet3/BulletDynamics/ConstraintSolver/btTypedConstraint';

import { CommonExampleInterface } from './CommonExampleInterface';
import { CommonGuiHelper } from './CommonGuiHelper';

export abstract class CommonRigidBodyBase extends CommonExampleInterface {
    // Keep the collision shapes, for deletion/cleanup
    protected m_collisionShapes: btCollisionShape[] = [];
    protected m_broadphase: btBroadphaseInterface | null = null;
    protected m_dispatcher: btCollisionDispatcher | null = null;
    protected m_solver: btConstraintSolver | null = null;
    protected m_collisionConfiguration: btCollisionConfiguration | null = null;
    protected m_dynamicsWorld: btDiscreteDynamicsWorld | null = null;

    // Data for picking objects
    protected m_pickedBody: btRigidBody | null = null;
    protected m_pickedConstraint: btTypedConstraint | null = null;
    protected m_savedState: number = 0;
    protected m_oldPickingPos = new btVector3(0, 0, 0);
    protected m_hitPos = new btVector3(0, 0, 0);
    protected m_oldPickingDist: number = 0;
    protected m_guiHelper: CommonGuiHelper;

    constructor(helper: CommonGuiHelper) {
        super();
        this.m_guiHelper = helper;
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
        this.removePickingConstraint();
        
        // Cleanup in the reverse order of creation/initialization
        
        // Remove the rigidbodies from the dynamics world and delete them
        if (this.m_dynamicsWorld) {
            // Remove constraints
            for (let i = this.m_dynamicsWorld.getNumConstraints() - 1; i >= 0; i--) {
                this.m_dynamicsWorld.removeConstraint(this.m_dynamicsWorld.getConstraint(i));
            }
            
            // Remove collision objects
            for (let i = this.m_dynamicsWorld.getNumCollisionObjects() - 1; i >= 0; i--) {
                const obj = this.m_dynamicsWorld.getCollisionObjectArray()[i];
                const body = obj as btRigidBody;
                if (body && body.getMotionState && body.getMotionState()) {
                    // In TypeScript, motion states are managed by GC
                }
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

    public debugDraw(debugDrawFlags: number): void {
        if (this.m_dynamicsWorld) {
            if (this.m_dynamicsWorld.getDebugDrawer()) {
                this.m_dynamicsWorld.getDebugDrawer()!.setDebugMode(debugDrawFlags);
            }
            this.m_dynamicsWorld.debugDrawWorld();
        }
    }

    public removePickingConstraint(): void {
        if (this.m_pickedConstraint && this.m_pickedBody) {
            this.m_pickedBody.forceActivationState(this.m_savedState);
            this.m_pickedBody.activate();
            this.m_dynamicsWorld!.removeConstraint(this.m_pickedConstraint);
            this.m_pickedConstraint = null;
            this.m_pickedBody = null;
        }
    }

    public createBoxShape(halfExtents: btVector3): btBoxShape {
        const box = new btBoxShape(halfExtents);
        return box;
    }

    public deleteRigidBody(body: btRigidBody): void {
        // Remove from graphics if gui helper supports it
        this.m_guiHelper.removeRigidBody(body);
        
        if (this.m_dynamicsWorld) {
            this.m_dynamicsWorld.removeRigidBody(body);
        }
        // TypeScript/JavaScript GC will handle cleanup
    }

    public createRigidBody(
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
        
        if (this.m_dynamicsWorld) {
            this.m_dynamicsWorld.addRigidBody(body);
        }

        // Register with GUI helper for rendering
        this.m_guiHelper.addRigidBody(body, shape, color);

        return body;
    }

    public renderScene(): void {
        if (this.m_dynamicsWorld) {
            // Sync physics to graphics
            this.m_guiHelper.syncPhysicsToGraphics(this.m_dynamicsWorld);
            
            // Render the scene
            this.m_guiHelper.render(this.m_dynamicsWorld);
        }
    }

    // Abstract methods that subclasses must implement
    public abstract initPhysics(): void;
    
    // Optional methods that subclasses can override
    public resetCamera(): void {
        // Default camera reset - can be overridden
        this.m_guiHelper.resetCamera();
    }
}