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

import { btDiscreteDynamicsWorld } from '../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody } from '../../src/BulletDynamics/Dynamics/btRigidBody';
import { btVector3 } from '../../src/LinearMath/btVector3';
import { btTransform } from '../../src/LinearMath/btTransform';
import { btBoxShape } from '../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btDefaultCollisionConfiguration } from '../../src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration';
import { btCollisionDispatcher } from '../../src/BulletCollision/CollisionDispatch/btCollisionDispatcher';
import { btDbvtBroadphase } from '../../src/BulletCollision/BroadphaseCollision/btDbvtBroadphase';
import { btSequentialImpulseConstraintSolver } from '../../src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver';
import { btCollisionShape } from '../../src/BulletCollision/CollisionShapes/btCollisionShape';
import { btRigidBodyConstructionInfo } from '../../src/BulletDynamics/Dynamics/btRigidBody';

const ARRAY_SIZE_Y = 5;
const ARRAY_SIZE_X = 5;
const ARRAY_SIZE_Z = 5;

export class BasicExample {
    private m_dynamicsWorld: btDiscreteDynamicsWorld | null = null;
    private m_collisionShapes: btCollisionShape[] = [];
    private m_broadphase: btDbvtBroadphase | null = null;
    private m_dispatcher: btCollisionDispatcher | null = null;
    private m_solver: btSequentialImpulseConstraintSolver | null = null;
    private m_collisionConfiguration: btDefaultCollisionConfiguration | null = null;
    
    constructor() {
    }

    initPhysics(): void {
        this.createEmptyDynamicsWorld();
        
        if (!this.m_dynamicsWorld) {
            throw new Error("Failed to create dynamics world");
        }

        // Create ground
        const groundShape = new btBoxShape(new btVector3(50, 50, 50));
        this.m_collisionShapes.push(groundShape);

        const groundTransform = new btTransform();
        groundTransform.setIdentity();
        groundTransform.setOrigin(new btVector3(0, -50, 0));

        // Create ground rigid body (mass = 0 means static)
        const groundMass = 0;
        this.createRigidBody(groundMass, groundTransform, groundShape);

        // Create dynamic objects
        const colShape = new btBoxShape(new btVector3(0.1, 0.1, 0.1));
        this.m_collisionShapes.push(colShape);

        const startTransform = new btTransform();
        startTransform.setIdentity();

        const mass = 1.0;

        // Create a stack of boxes
        for (let k = 0; k < ARRAY_SIZE_Y; k++) {
            for (let i = 0; i < ARRAY_SIZE_X; i++) {
                for (let j = 0; j < ARRAY_SIZE_Z; j++) {
                    startTransform.setOrigin(new btVector3(
                        0.2 * i,
                        2 + 0.2 * k,
                        0.2 * j
                    ));

                    this.createRigidBody(mass, startTransform, colShape);
                }
            }
        }

        console.log("BasicExample physics initialized");
        console.log(`Created ${this.m_dynamicsWorld.getNumCollisionObjects()} collision objects`);
    }

    stepSimulation(timeStep: number): void {
        if (this.m_dynamicsWorld) {
            this.m_dynamicsWorld.stepSimulation(timeStep, 10);
        }
    }

    exitPhysics(): void {
        // Clean up in reverse order of creation
        if (this.m_dynamicsWorld) {
            // Remove the rigidbodies from the dynamics world and delete them
            for (let i = this.m_dynamicsWorld.getNumCollisionObjects() - 1; i >= 0; i--) {
                const obj = this.m_dynamicsWorld.getCollisionObjectArray()[i];
                const body = obj as btRigidBody;
                if (body && body.getMotionState()) {
                    // delete body.getMotionState(); // In TypeScript, just set to null
                    body.setMotionState(null);
                }
                this.m_dynamicsWorld.removeCollisionObject(obj);
                // delete obj; // GC handles this in TypeScript
            }
        }

        // Delete collision shapes
        this.m_collisionShapes.length = 0;

        this.m_dynamicsWorld = null;
        this.m_solver = null;
        this.m_broadphase = null;
        this.m_dispatcher = null;
        this.m_collisionConfiguration = null;

        console.log("BasicExample physics cleaned up");
    }

    getDynamicsWorld(): btDiscreteDynamicsWorld | null {
        return this.m_dynamicsWorld;
    }

    private createEmptyDynamicsWorld(): void {
        // Collision configuration contains default setup for memory, collision setup
        this.m_collisionConfiguration = new btDefaultCollisionConfiguration();

        // Use the default collision dispatcher
        this.m_dispatcher = new btCollisionDispatcher(this.m_collisionConfiguration);

        // btDbvtBroadphase is a good general purpose broadphase
        this.m_broadphase = new btDbvtBroadphase();

        // The default constraint solver
        this.m_solver = new btSequentialImpulseConstraintSolver();

        this.m_dynamicsWorld = new btDiscreteDynamicsWorld(
            this.m_dispatcher,
            this.m_broadphase,
            this.m_solver,
            this.m_collisionConfiguration
        );

        this.m_dynamicsWorld.setGravity(new btVector3(0, -10, 0));
    }

    private createRigidBody(mass: number, startTransform: btTransform, shape: btCollisionShape): btRigidBody | null {
        if (!this.m_dynamicsWorld) {
            return null;
        }

        const isDynamic = (mass !== 0.0);
        let localInertia = new btVector3(0, 0, 0);
        
        if (isDynamic) {
            shape.calculateLocalInertia(mass, localInertia);
        }

        // Using motionstate is optional, it provides interpolation capabilities
        // and only synchronizes 'active' objects
        const myMotionState = null; // For simplicity, skip motion state for now

        const rbInfo = new btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
        rbInfo.m_startWorldTransform = startTransform;

        const body = new btRigidBody(rbInfo);

        this.m_dynamicsWorld.addRigidBody(body);

        return body;
    }
}