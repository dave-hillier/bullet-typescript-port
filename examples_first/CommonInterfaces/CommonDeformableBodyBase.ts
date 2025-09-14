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

/**
 * @fileoverview CommonDeformableBodyBase - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonDeformableBodyBase.h
 *
 * This class extends CommonMultiBodyBase to support deformable/soft body physics.
 * It includes specialized mouse picking for deformable bodies and manages
 * Lagrangian forces for deformable body dynamics.
 */

// Import interfaces from already ported files
import type { GUIHelperInterface } from './CommonGUIHelperInterface';

// Import the base class
import { CommonMultiBodyBase } from './CommonMultiBodyBase';

// Import Bullet physics classes from the ported codebase
import { btVector3 } from '../../src/LinearMath/btVector3';
import { btTransform } from '../../src/LinearMath/btTransform';
import { btAssert } from '../../src/LinearMath/btScalar';
import { multiplyMatrixVector } from '../../src/LinearMath/btMatrix3x3';

// Import collision classes
import type { btCollisionObject } from '../../src/BulletCollision/CollisionDispatch/btCollisionObject';
import { btCollisionWorld, RayResultCallback, ClosestRayResultCallback, LocalRayResult } from '../../src/BulletCollision/CollisionDispatch/btCollisionWorld';
import { DISABLE_DEACTIVATION, ACTIVE_TAG } from '../../src/BulletCollision/CollisionDispatch/btCollisionObject';

// Import dynamics classes
import { btRigidBody } from '../../src/BulletDynamics/Dynamics/btRigidBody';
import type { btTypedConstraint } from '../../src/BulletDynamics/ConstraintSolver/btTypedConstraint';

// Mock soft body interfaces (since BulletSoftBody is not fully ported yet)
// These are placeholders until the full soft body system is implemented

/**
 * Mock interface for btSoftBody - represents a soft/deformable body
 */
interface btSoftBody extends btCollisionObject {
    m_faces: btSoftBodyFace[];
    setActivationState(state: number): void;
}

/**
 * Mock interface for btSoftBody::Face - represents a triangular face in a soft body
 */
interface btSoftBodyFace {
    // In the real implementation, this would contain node indices and other face data
    m_nodes: btSoftBodyNode[];
}

/**
 * Mock interface for btSoftBody::Node - represents a vertex/node in a soft body
 */
interface btSoftBodyNode {
    m_x: btVector3; // Position
    m_v: btVector3; // Velocity
}

/**
 * Mock interface for btDeformableLagrangianForce - base class for forces in deformable bodies
 */
interface btDeformableLagrangianForce {
    // Placeholder for Lagrangian force interface
}

/**
 * Mock interface for btDeformableMousePickingForce - mouse picking force for deformable bodies
 */
interface btDeformableMousePickingForce extends btDeformableLagrangianForce {
    setMousePos(mousePos: btVector3): void;
}

/**
 * Mock interface for btDeformableMultiBodyDynamicsWorld - extended dynamics world for deformable bodies
 */
interface btDeformableMultiBodyDynamicsWorld {
    // Inherits all methods from btMultiBodyDynamicsWorld
    setGravity(gravity: btVector3): void;
    stepSimulation(timeStep: number, maxSubSteps?: number, fixedTimeStep?: number): number;
    rayTest(rayFromWorld: btVector3, rayToWorld: btVector3, resultCallback: RayResultCallback): void;
    getNumConstraints(): number;
    getConstraint(index: number): btTypedConstraint;
    removeConstraint(constraint: btTypedConstraint): void;
    getNumCollisionObjects(): number;
    getCollisionObjectArray(): btCollisionObject[];
    removeCollisionObject(obj: btCollisionObject): void;
    addRigidBody(body: btRigidBody): void;
    addConstraint(constraint: btTypedConstraint, disableCollisionsBetweenLinkedBodies?: boolean): void;
    getDebugDrawer(): any;
    debugDrawWorld(): void;

    // Deformable body specific methods
    addForce(softBody: btSoftBody, force: btDeformableLagrangianForce): void;
    removeForce(softBody: btSoftBody, force: btDeformableLagrangianForce): void;
}

/**
 * Mock interface for btPoint2PointConstraint
 */
interface btPoint2PointConstraint extends btTypedConstraint {
    m_setting: {
        m_impulseClamp: number;
        m_tau: number;
    };
    setPivotB(pivotB: btVector3): void;
}

/**
 * Mock interface for btMultiBodyPoint2Point
 */
interface btMultiBodyPoint2Point {
    setMaxAppliedImpulse(maxImpulse: number): void;
    setPivotInB(pivot: btVector3): void;
    getMultiBodyA(): any; // btMultiBody
}

/**
 * Mock interface for btMultiBodyLinkCollider
 */
interface btMultiBodyLinkCollider extends btCollisionObject {
    m_multiBody: any; // btMultiBody
    m_link: number;
}

// Mock implementations for soft body classes (to be replaced when properly ported)
class MockSoftBody {
    m_faces: btSoftBodyFace[] = [];

    setActivationState(state: number): void {
        // Mock implementation
        console.log(`Soft body activation state set to: ${state}`);
    }

    static upcast(obj: btCollisionObject | null): MockSoftBody | null {
        // Mock implementation - in real version this would check object type
        // For now, just return null to indicate no soft body found
        return null;
    }
}

class MockDeformableMousePickingForce implements btDeformableMousePickingForce {
    private m_elasticStiffness: number;
    private m_dampingStiffness: number;
    private m_face: btSoftBodyFace;
    private m_mousePos: btVector3;
    private m_maxForce: number;

    constructor(
        elasticStiffness: number,
        dampingStiffness: number,
        face: btSoftBodyFace,
        mousePos: btVector3,
        maxForce: number
    ) {
        this.m_elasticStiffness = elasticStiffness;
        this.m_dampingStiffness = dampingStiffness;
        this.m_face = face;
        this.m_mousePos = mousePos.clone();
        this.m_maxForce = maxForce;
    }

    setMousePos(mousePos: btVector3): void {
        this.m_mousePos.copy(mousePos);
    }
}

class MockPoint2PointConstraint {
    m_setting = {
        m_impulseClamp: 0,
        m_tau: 0
    };

    constructor(body: btRigidBody, localPivot: btVector3) {
        // Mock implementation
    }

    setPivotB(pivotB: btVector3): void {
        // Mock implementation
    }
}

class MockMultiBodyPoint2Point implements btMultiBodyPoint2Point {
    private m_multiBodyA: any;
    private m_link: number;
    private m_maxAppliedImpulse: number = 0;

    constructor(multiBody: any, link: number, rigidBody: btRigidBody | null, pivotInA: btVector3, pivotInB: btVector3) {
        this.m_multiBodyA = multiBody;
        this.m_link = link;
    }

    setMaxAppliedImpulse(maxImpulse: number): void {
        this.m_maxAppliedImpulse = maxImpulse;
    }

    setPivotInB(pivot: btVector3): void {
        // Mock implementation
    }

    getMultiBodyA(): any {
        return this.m_multiBodyA;
    }
}

class MockMultiBodyLinkCollider {
    m_multiBody: any = null;
    m_link: number = -1;

    static upcast(obj: btCollisionObject | null): MockMultiBodyLinkCollider | null {
        // Mock implementation - in real version this would check object type
        // For now, just return null to indicate no multi-body link collider found
        return null;
    }
}

class MockDeformableMultiBodyDynamicsWorld implements btDeformableMultiBodyDynamicsWorld {
    private m_forces = new Map<MockSoftBody, btDeformableLagrangianForce[]>();

    // Basic dynamics world methods
    setGravity(gravity: btVector3): void { }
    stepSimulation(timeStep: number, maxSubSteps = 1, fixedTimeStep = 1.0/60.0): number { return 1; }
    rayTest(rayFromWorld: btVector3, rayToWorld: btVector3, resultCallback: RayResultCallback): void { }
    getNumConstraints(): number { return 0; }
    getConstraint(index: number): btTypedConstraint { return null as any; }
    removeConstraint(constraint: btTypedConstraint): void { }
    getNumCollisionObjects(): number { return 0; }
    getCollisionObjectArray(): btCollisionObject[] { return []; }
    removeCollisionObject(obj: btCollisionObject): void { }
    addRigidBody(body: btRigidBody): void { }
    addConstraint(constraint: btTypedConstraint, disableCollisionsBetweenLinkedBodies = false): void { }
    getDebugDrawer(): any { return null; }
    debugDrawWorld(): void { }

    // Deformable body specific methods
    addForce(softBody: btSoftBody, force: btDeformableLagrangianForce): void {
        // Mock implementation
        console.log("Adding force to soft body");
    }

    removeForce(softBody: btSoftBody, force: btDeformableLagrangianForce): void {
        // Mock implementation
        console.log("Removing force from soft body");
    }
}

/**
 * Extended ray result callback with face information for soft bodies
 */
export class ClosestRayResultCallbackWithInfo extends ClosestRayResultCallback {
    public m_faceId: number = -1;

    constructor(rayFromWorld: btVector3, rayToWorld: btVector3) {
        super(rayFromWorld, rayToWorld);
    }

    addSingleResult(rayResult: LocalRayResult, normalInWorldSpace: boolean): number {
        // Caller already does the filter on the m_closestHitFraction
        btAssert(rayResult.m_hitFraction <= this.m_closestHitFraction, "Hit fraction should be closest");

        this.m_closestHitFraction = rayResult.m_hitFraction;
        this.m_collisionObject = rayResult.m_collisionObject;

        if (rayResult.m_localShapeInfo) {
            this.m_faceId = rayResult.m_localShapeInfo.m_triangleIndex;
        } else {
            this.m_faceId = -1;
        }

        if (normalInWorldSpace) {
            this.m_hitNormalWorld.copy(rayResult.m_hitNormalLocal);
        } else {
            // Need to transform normal into worldspace
            const worldTransform = this.m_collisionObject!.getWorldTransform();
            const basis = worldTransform.getBasis();
            this.m_hitNormalWorld.copy(multiplyMatrixVector(basis, rayResult.m_hitNormalLocal));
        }

        this.m_hitPointWorld.setInterpolate3(this.m_rayFromWorld, this.m_rayToWorld, rayResult.m_hitFraction);
        return rayResult.m_hitFraction;
    }
}

/**
 * CommonDeformableBodyBase - Base class for deformable body physics examples
 *
 * This class extends CommonMultiBodyBase to support soft/deformable body physics.
 * It includes:
 * - Deformable body dynamics world setup
 * - Lagrangian force management for deformable bodies
 * - Specialized mouse picking for soft bodies
 * - Integration with both rigid body and soft body physics
 */
export class CommonDeformableBodyBase extends CommonMultiBodyBase {
    protected m_forces: btDeformableLagrangianForce[] = [];
    protected m_pickedSoftBody: MockSoftBody | null = null;
    protected m_mouseForce: btDeformableMousePickingForce | null = null;
    protected m_pickingForceElasticStiffness: number;
    protected m_pickingForceDampingStiffness: number;
    protected m_maxPickingForce: number;

    constructor(helper: GUIHelperInterface) {
        super(helper);
        this.m_pickedSoftBody = null;
        this.m_mouseForce = null;
        this.m_pickingForceElasticStiffness = 100;
        this.m_pickingForceDampingStiffness = 0.0;
        this.m_maxPickingForce = 0.3;
    }

    /**
     * Get the deformable dynamics world (cast from the base dynamics world)
     */
    getDeformableDynamicsWorld(): btDeformableMultiBodyDynamicsWorld | null {
        return this.m_dynamicsWorld as any as btDeformableMultiBodyDynamicsWorld;
    }

    /**
     * Pick a body using raycasting - supports rigid bodies, multi-bodies, and soft bodies
     */
    pickBody(rayFromWorld: btVector3, rayToWorld: btVector3): boolean {
        const deformableWorld = this.getDeformableDynamicsWorld();
        if (deformableWorld === null) {
            return false;
        }

        const rayCallback = new ClosestRayResultCallbackWithInfo(rayFromWorld, rayToWorld);
        deformableWorld.rayTest(rayFromWorld, rayToWorld, rayCallback);

        if (rayCallback.hasHit()) {
            const pickPos = rayCallback.m_hitPointWorld.clone();
            const body = btRigidBody.upcast(rayCallback.m_collisionObject);
            const psb = MockSoftBody.upcast(rayCallback.m_collisionObject);

            this.m_oldPickingPos.copy(rayToWorld);
            this.m_hitPos.copy(pickPos);
            this.m_oldPickingDist = pickPos.subtract(rayFromWorld).length();

            if (body) {
                // Handle rigid body picking
                if (!(body.isStaticObject() || body.isKinematicObject())) {
                    this.m_pickedBody = body;
                    this.m_pickedBody.setActivationState(DISABLE_DEACTIVATION);
                    const localPivot = body.getCenterOfMassTransform().inverse().multiplyVector(pickPos);
                    const p2p = new MockPoint2PointConstraint(body, localPivot);
                    deformableWorld.addConstraint(p2p as any, true);
                    this.m_pickedConstraint = p2p as any;
                    const mousePickClamping = 30.0;
                    p2p.m_setting.m_impulseClamp = mousePickClamping;
                    // Very weak constraint for picking
                    p2p.m_setting.m_tau = 0.001;
                }
            } else if (psb) {
                // Handle soft body picking
                const faceId = rayCallback.m_faceId;
                if (faceId >= 0 && faceId < psb.m_faces.length) {
                    this.m_pickedSoftBody = psb;
                    psb.setActivationState(DISABLE_DEACTIVATION);
                    const face = psb.m_faces[faceId];
                    const mouseForce = new MockDeformableMousePickingForce(
                        this.m_pickingForceElasticStiffness,
                        this.m_pickingForceDampingStiffness,
                        face,
                        this.m_hitPos,
                        this.m_maxPickingForce
                    );
                    this.m_mouseForce = mouseForce;
                    deformableWorld.addForce(psb as any, mouseForce);
                }
            } else {
                // Handle multi-body link collider picking
                const multiCol = MockMultiBodyLinkCollider.upcast(rayCallback.m_collisionObject);
                if (multiCol && multiCol.m_multiBody) {
                    this.m_prevCanSleep = multiCol.m_multiBody.getCanSleep();
                    multiCol.m_multiBody.setCanSleep(false);

                    const pivotInA = multiCol.m_multiBody.worldPosToLocal(multiCol.m_link, pickPos);

                    const p2p = new MockMultiBodyPoint2Point(
                        multiCol.m_multiBody,
                        multiCol.m_link,
                        null,
                        pivotInA,
                        pickPos
                    );
                    // If you add too much energy to the system, causing high angular velocities,
                    // simulation 'explodes'. So we try to avoid it by clamping the maximum impulse
                    const scaling = 1;
                    p2p.setMaxAppliedImpulse(2 * scaling);

                    // Note: In mock implementation, this would need proper multi-body dynamics world
                    // deformableWorld.addMultiBodyConstraint(p2p);
                    this.m_pickingMultiBodyPoint2Point = p2p as any;
                }
            }
        }
        return false;
    }

    /**
     * Move a picked body - supports rigid bodies, multi-bodies, and soft bodies
     */
    movePickedBody(rayFromWorld: btVector3, rayToWorld: btVector3): boolean {
        if (this.m_pickedBody && this.m_pickedConstraint) {
            const pickCon = this.m_pickedConstraint as any as MockPoint2PointConstraint;
            if (pickCon) {
                // Keep it at the same picking distance
                const newPivotB = new btVector3();
                let dir = rayToWorld.subtract(rayFromWorld);
                dir.normalize();
                dir = dir.multiply(this.m_oldPickingDist);
                newPivotB.copy(rayFromWorld.add(dir));
                pickCon.setPivotB(newPivotB);
                return true;
            }
        }

        if (this.m_pickingMultiBodyPoint2Point) {
            // Keep it at the same picking distance
            let dir = rayToWorld.subtract(rayFromWorld);
            dir.normalize();
            dir = dir.multiply(this.m_oldPickingDist);
            const newPivotB = rayFromWorld.add(dir);
            this.m_pickingMultiBodyPoint2Point.setPivotInB(newPivotB);
        }

        if (this.m_pickedSoftBody && this.m_mouseForce) {
            // Keep it at the same picking distance
            const newPivot = new btVector3();
            let dir = rayToWorld.subtract(rayFromWorld);
            dir.normalize();
            dir = dir.multiply(this.m_oldPickingDist);
            newPivot.copy(rayFromWorld.add(dir));
            this.m_mouseForce.setMousePos(newPivot);
        }

        return false;
    }

    /**
     * Remove picking constraint for all body types
     */
    removePickingConstraint(): void {
        if (this.m_pickedConstraint) {
            const deformableWorld = this.getDeformableDynamicsWorld();
            if (deformableWorld) {
                deformableWorld.removeConstraint(this.m_pickedConstraint);
            }

            if (this.m_pickedBody) {
                this.m_pickedBody.forceActivationState(ACTIVE_TAG);
                this.m_pickedBody.activate(true);
            }
            // In TypeScript, constraint will be garbage collected
            this.m_pickedConstraint = null;
            this.m_pickedBody = null;
        }

        if (this.m_pickingMultiBodyPoint2Point) {
            this.m_pickingMultiBodyPoint2Point.getMultiBodyA().setCanSleep(this.m_prevCanSleep);
            const deformableWorld = this.getDeformableDynamicsWorld();
            if (deformableWorld) {
                // Note: In mock implementation, this would need proper multi-body dynamics world
                // deformableWorld.removeMultiBodyConstraint(this.m_pickingMultiBodyPoint2Point);
            }
            // In TypeScript, constraint will be garbage collected
            this.m_pickingMultiBodyPoint2Point = null;
        }

        if (this.m_pickedSoftBody) {
            const deformableWorld = this.getDeformableDynamicsWorld();
            if (deformableWorld && this.m_mouseForce) {
                deformableWorld.removeForce(this.m_pickedSoftBody as any, this.m_mouseForce);
            }
            // In TypeScript, force and body references will be garbage collected
            this.m_mouseForce = null;
            this.m_pickedSoftBody = null;
        }
    }
}

export default CommonDeformableBodyBase;