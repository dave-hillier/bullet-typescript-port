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

import { btTransform } from '../../LinearMath/btTransform';
import { btVector3 } from '../../LinearMath/btVector3';
import { btMatrix3x3, multiplyMatrixVector } from '../../LinearMath/btMatrix3x3';
import { btQuaternion } from '../../LinearMath/btQuaternion';
// import { btTransformUtil } from '../../LinearMath/btTransformUtil'; // Temporarily disabled
import { btMotionState } from '../../LinearMath/btMotionState';
import { SIMD_HALF_PI, btSqrt, btPow } from '../../LinearMath/btScalar';
import { btClamped } from '../../LinearMath/btMinMax';
import { btCollisionObject, ISLAND_SLEEPING, WANTS_DEACTIVATION, DISABLE_DEACTIVATION } from '../../BulletCollision/CollisionDispatch/btCollisionObject';
import { btCollisionShape } from '../../BulletCollision/CollisionShapes/btCollisionShape';
import { btBroadphaseProxy } from '../../BulletCollision/BroadphaseCollision/btBroadphaseProxy';
import { btTypedConstraint } from '../ConstraintSolver/btTypedConstraint';

// Global variables
export let gDeactivationTime = 2.0;
export let gDisableDeactivation = false;

/**
 * Rigid body flags for controlling behavior
 */
export enum btRigidBodyFlags {
    BT_DISABLE_WORLD_GRAVITY = 1,
    /** BT_ENABLE_GYROPSCOPIC_FORCE flags is enabled by default in Bullet 2.83 and onwards.
     * and it BT_ENABLE_GYROPSCOPIC_FORCE becomes equivalent to BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY
     * See Demos/GyroscopicDemo and computeGyroscopicImpulseImplicit */
    BT_ENABLE_GYROSCOPIC_FORCE_EXPLICIT = 2,
    BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_WORLD = 4,
    BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY = 8,
    BT_ENABLE_GYROPSCOPIC_FORCE = BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY,
}

/**
 * The btRigidBodyConstructionInfo structure provides information to create a rigid body.
 * Setting mass to zero creates a fixed (non-dynamic) rigid body.
 * For dynamic objects, you can use the collision shape to approximate the local inertia tensor,
 * otherwise use the zero vector (default argument)
 * You can use the motion state to synchronize the world transform between physics and graphics objects.
 * And if the motion state is provided, the rigid body will initialize its initial world transform from the motion state,
 * m_startWorldTransform is only used when you don't provide a motion state.
 */
export class btRigidBodyConstructionInfo {
    m_mass: number;

    /** When a motionState is provided, the rigid body will initialize its world transform from the motion state
     * In this case, m_startWorldTransform is ignored. */
    m_motionState: btMotionState | null;
    m_startWorldTransform: btTransform;

    m_collisionShape: btCollisionShape | null;
    m_localInertia: btVector3;
    m_linearDamping: number;
    m_angularDamping: number;

    /** best simulation results when friction is non-zero */
    m_friction: number;
    /** the m_rollingFriction prevents rounded shapes, such as spheres, cylinders and capsules from rolling forever.
     * See Bullet/Demos/RollingFrictionDemo for usage */
    m_rollingFriction: number;
    m_spinningFriction: number;  // torsional friction around contact normal

    /** best simulation results using zero restitution. */
    m_restitution: number;

    m_linearSleepingThreshold: number;
    m_angularSleepingThreshold: number;

    // Additional damping can help avoiding lowpass jitter motion, help stability for ragdolls etc.
    // Such damping is undesirable, so once the overall simulation quality of the rigid body dynamics system has improved, this should become obsolete
    m_additionalDamping: boolean;
    m_additionalDampingFactor: number;
    m_additionalLinearDampingThresholdSqr: number;
    m_additionalAngularDampingThresholdSqr: number;
    m_additionalAngularDampingFactor: number;

    constructor(
        mass: number,
        motionState: btMotionState | null,
        collisionShape: btCollisionShape | null,
        localInertia: btVector3 = new btVector3(0, 0, 0)
    ) {
        this.m_mass = mass;
        this.m_motionState = motionState;
        this.m_collisionShape = collisionShape;
        this.m_localInertia = localInertia;
        this.m_linearDamping = 0.0;
        this.m_angularDamping = 0.0;
        this.m_friction = 0.5;
        this.m_rollingFriction = 0.0;
        this.m_spinningFriction = 0.0;
        this.m_restitution = 0.0;
        this.m_linearSleepingThreshold = 0.8;
        this.m_angularSleepingThreshold = 1.0;
        this.m_additionalDamping = false;
        this.m_additionalDampingFactor = 0.005;
        this.m_additionalLinearDampingThresholdSqr = 0.01;
        this.m_additionalAngularDampingThresholdSqr = 0.01;
        this.m_additionalAngularDampingFactor = 0.01;

        this.m_startWorldTransform = new btTransform();
        this.m_startWorldTransform.setIdentity();
    }
}

/**
 * The btRigidBody is the main class for rigid body objects. It is derived from btCollisionObject, 
 * so it keeps a pointer to a btCollisionShape.
 * It is recommended for performance and memory use to share btCollisionShape objects whenever possible.
 * There are 3 types of rigid bodies:
 * - A) Dynamic rigid bodies, with positive mass. Motion is controlled by rigid body dynamics.
 * - B) Fixed objects with zero mass. They are not moving (basically collision objects)
 * - C) Kinematic objects, which are objects without mass, but the user can move them. 
 *   There is one-way interaction, and Bullet calculates a velocity based on the timestep and previous and current world transform.
 * Bullet automatically deactivates dynamic rigid bodies, when the velocity is below a threshold for a given time.
 * Deactivated (sleeping) rigid bodies don't take any processing time, except a minor broadphase collision detection impact 
 * (to allow active objects to activate/wake up sleeping objects)
 */
export class btRigidBody extends btCollisionObject {
    // Static constants
    static readonly CF_STATIC_OBJECT = btCollisionObject.CollisionFlags.CF_STATIC_OBJECT;
    static readonly CO_RIGID_BODY = btCollisionObject.CollisionObjectTypes.CO_RIGID_BODY;
    
    private m_invInertiaTensorWorld: btMatrix3x3;
    private m_linearVelocity: btVector3;
    private m_angularVelocity: btVector3;
    private m_inverseMass: number;
    private m_linearFactor: btVector3;

    private m_gravity: btVector3;
    private m_gravity_acceleration: btVector3;
    private m_invInertiaLocal: btVector3;
    private m_totalForce: btVector3;
    private m_totalTorque: btVector3;

    private m_linearDamping: number;
    private m_angularDamping: number;

    private m_additionalDamping: boolean;
    private m_additionalDampingFactor: number;
    private m_additionalLinearDampingThresholdSqr: number;
    private m_additionalAngularDampingThresholdSqr: number;

    private m_linearSleepingThreshold: number;
    private m_angularSleepingThreshold: number;

    // m_optionalMotionState allows to automatic synchronize the world transform for active objects
    private m_optionalMotionState: btMotionState | null;

    // keep track of typed constraints referencing this rigid body, to disable collision between linked bodies
    private m_constraintRefs: btTypedConstraint[];

    private m_rigidbodyFlags: number;

    // Protected members
    protected m_deltaLinearVelocity: btVector3;
    protected m_deltaAngularVelocity: btVector3;
    protected m_angularFactor: btVector3;
    protected m_invMass: btVector3;
    protected m_pushVelocity: btVector3;
    protected m_turnVelocity: btVector3;

    // For experimental overriding of friction/contact solver func
    public m_contactSolverType: number;
    public m_frictionSolverType: number;

    constructor(constructionInfo: btRigidBodyConstructionInfo);
    constructor(mass: number, motionState: btMotionState | null, collisionShape: btCollisionShape | null, localInertia?: btVector3);
    constructor(
        constructionInfoOrMass: btRigidBodyConstructionInfo | number,
        motionState?: btMotionState | null,
        collisionShape?: btCollisionShape | null,
        localInertia: btVector3 = new btVector3(0, 0, 0)
    ) {
        super();

        let constructionInfo: btRigidBodyConstructionInfo;
        if (typeof constructionInfoOrMass === 'number') {
            constructionInfo = new btRigidBodyConstructionInfo(
                constructionInfoOrMass,
                motionState || null,
                collisionShape || null,
                localInertia
            );
        } else {
            constructionInfo = constructionInfoOrMass;
        }

        // Initialize all member variables
        this.m_invInertiaTensorWorld = new btMatrix3x3();
        this.m_linearVelocity = new btVector3();
        this.m_angularVelocity = new btVector3();
        this.m_inverseMass = 0;
        this.m_linearFactor = new btVector3();
        this.m_gravity = new btVector3();
        this.m_gravity_acceleration = new btVector3();
        this.m_invInertiaLocal = new btVector3();
        this.m_totalForce = new btVector3();
        this.m_totalTorque = new btVector3();
        this.m_linearDamping = 0;
        this.m_angularDamping = 0;
        this.m_additionalDamping = false;
        this.m_additionalDampingFactor = 0;
        this.m_additionalLinearDampingThresholdSqr = 0;
        this.m_additionalAngularDampingThresholdSqr = 0;
        this.m_linearSleepingThreshold = 0;
        this.m_angularSleepingThreshold = 0;
        this.m_optionalMotionState = null;
        this.m_constraintRefs = [];
        this.m_rigidbodyFlags = 0;
        this.m_deltaLinearVelocity = new btVector3();
        this.m_deltaAngularVelocity = new btVector3();
        this.m_angularFactor = new btVector3();
        this.m_invMass = new btVector3();
        this.m_pushVelocity = new btVector3();
        this.m_turnVelocity = new btVector3();
        this.m_contactSolverType = 0;
        this.m_frictionSolverType = 0;

        this.setupRigidBody(constructionInfo);
    }

    /** setupRigidBody is only used internally by the constructor */
    private setupRigidBody(constructionInfo: btRigidBodyConstructionInfo): void {
        this.m_internalType = btRigidBody.CO_RIGID_BODY;

        this.m_linearVelocity.setValue(0.0, 0.0, 0.0);
        this.m_angularVelocity.setValue(0.0, 0.0, 0.0);
        this.m_angularFactor.setValue(1, 1, 1);
        this.m_linearFactor.setValue(1, 1, 1);
        this.m_gravity.setValue(0.0, 0.0, 0.0);
        this.m_gravity_acceleration.setValue(0.0, 0.0, 0.0);
        this.m_totalForce.setValue(0.0, 0.0, 0.0);
        this.m_totalTorque.setValue(0.0, 0.0, 0.0);
        
        this.setDamping(constructionInfo.m_linearDamping, constructionInfo.m_angularDamping);

        this.m_linearSleepingThreshold = constructionInfo.m_linearSleepingThreshold;
        this.m_angularSleepingThreshold = constructionInfo.m_angularSleepingThreshold;
        this.m_optionalMotionState = constructionInfo.m_motionState;
        this.m_contactSolverType = 0;
        this.m_frictionSolverType = 0;
        this.m_additionalDamping = constructionInfo.m_additionalDamping;
        this.m_additionalDampingFactor = constructionInfo.m_additionalDampingFactor;
        this.m_additionalLinearDampingThresholdSqr = constructionInfo.m_additionalLinearDampingThresholdSqr;
        this.m_additionalAngularDampingThresholdSqr = constructionInfo.m_additionalAngularDampingThresholdSqr;

        if (this.m_optionalMotionState) {
            this.m_optionalMotionState.getWorldTransform(this.m_worldTransform);
        } else {
            // Copy transform data manually since btTransform doesn't have copy method
            this.m_worldTransform.setOrigin(constructionInfo.m_startWorldTransform.getOrigin());
            this.m_worldTransform.setRotation(constructionInfo.m_startWorldTransform.getRotation());
        }

        // Copy transform data manually
        this.m_interpolationWorldTransform.setOrigin(this.m_worldTransform.getOrigin());
        this.m_interpolationWorldTransform.setRotation(this.m_worldTransform.getRotation());
        this.m_interpolationLinearVelocity.setValue(0, 0, 0);
        this.m_interpolationAngularVelocity.setValue(0, 0, 0);

        // moved to btCollisionObject
        this.m_friction = constructionInfo.m_friction;
        this.m_rollingFriction = constructionInfo.m_rollingFriction;
        this.m_spinningFriction = constructionInfo.m_spinningFriction;

        this.m_restitution = constructionInfo.m_restitution;

        if (constructionInfo.m_collisionShape) {
            this.setCollisionShape(constructionInfo.m_collisionShape);
        }

        this.setMassProps(constructionInfo.m_mass, constructionInfo.m_localInertia);
        this.updateInertiaTensor();

        this.m_rigidbodyFlags = btRigidBodyFlags.BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY;

        this.m_deltaLinearVelocity.setZero();
        this.m_deltaAngularVelocity.setZero();
        this.m_invMass.copy(this.m_linearFactor.multiply(this.m_inverseMass));
        this.m_pushVelocity.setZero();
        this.m_turnVelocity.setZero();
    }

    /** to keep collision detection and dynamics separate we don't store a rigidbody pointer
     * but a rigidbody is derived from btCollisionObject, so we can safely perform an upcast */
    static upcast(colObj: btCollisionObject | null): btRigidBody | null {
        if (colObj && (colObj.getInternalType() & btRigidBody.CO_RIGID_BODY)) {
            return colObj as btRigidBody;
        }
        return null;
    }

    /** continuous collision detection needs prediction */
    predictIntegratedTransform(step: number, predictedTransform: btTransform): void {
        // btTransformUtil.integrateTransform(this.m_worldTransform, this.m_linearVelocity, this.m_angularVelocity, step, predictedTransform);
        // Simple integration for now
        const newOrigin = this.m_worldTransform.getOrigin().add(this.m_linearVelocity.multiply(step));
        predictedTransform.setOrigin(newOrigin);
        predictedTransform.setRotation(this.m_worldTransform.getRotation());
    }

    saveKinematicState(step: number): void {
        // todo: clamp to some (user definable) safe minimum timestep, to limit maximum angular/linear velocities
        if (step !== 0.0) {
            // if we use motionstate to synchronize world transforms, get the new kinematic/animated world transform
            if (this.getMotionState()) {
                this.getMotionState()!.getWorldTransform(this.m_worldTransform);
            }
            
            // btTransformUtil.calculateVelocity(this.m_interpolationWorldTransform, this.m_worldTransform, step, this.m_linearVelocity, this.m_angularVelocity);
            // Simple velocity calculation for now
            if (step > 0) {
                this.m_linearVelocity = this.m_worldTransform.getOrigin().subtract(this.m_interpolationWorldTransform.getOrigin()).divide(step);
                this.m_angularVelocity.setValue(0, 0, 0); // Simplified for now
            }
            this.m_interpolationLinearVelocity.copy(this.m_linearVelocity);
            this.m_interpolationAngularVelocity.copy(this.m_angularVelocity);
            this.m_interpolationWorldTransform.setOrigin(this.m_worldTransform.getOrigin());
            this.m_interpolationWorldTransform.setRotation(this.m_worldTransform.getRotation());
        }
    }

    applyGravity(): void {
        if (this.isStaticOrKinematicObject()) {
            return;
        }
        this.applyCentralForce(this.m_gravity);
    }

    clearGravity(): void {
        if (this.isStaticOrKinematicObject()) {
            return;
        }
        this.applyCentralForce(this.m_gravity.negate());
    }

    setGravity(acceleration: btVector3): void {
        if (this.m_inverseMass !== 0.0) {
            this.m_gravity.copy(acceleration.multiply(1.0 / this.m_inverseMass));
        }
        this.m_gravity_acceleration.copy(acceleration);
    }

    getGravity(): btVector3 {
        return this.m_gravity_acceleration;
    }

    setDamping(lin_damping: number, ang_damping: number): void {
        this.m_linearDamping = btClamped(lin_damping, 0.0, 1.0);
        this.m_angularDamping = btClamped(ang_damping, 0.0, 1.0);
    }

    getLinearDamping(): number {
        return this.m_linearDamping;
    }

    getAngularDamping(): number {
        return this.m_angularDamping;
    }

    getLinearSleepingThreshold(): number {
        return this.m_linearSleepingThreshold;
    }

    getAngularSleepingThreshold(): number {
        return this.m_angularSleepingThreshold;
    }

    /** applyDamping damps the velocity, using the given m_linearDamping and m_angularDamping */
    applyDamping(timeStep: number): void {
        this.m_linearVelocity.multiplyAssign(btPow(1 - this.m_linearDamping, timeStep));
        this.m_angularVelocity.multiplyAssign(btPow(1 - this.m_angularDamping, timeStep));

        if (this.m_additionalDamping) {
            // Additional damping can help avoiding lowpass jitter motion, help stability for ragdolls etc.
            if ((this.m_angularVelocity.length2() < this.m_additionalAngularDampingThresholdSqr) &&
                (this.m_linearVelocity.length2() < this.m_additionalLinearDampingThresholdSqr)) {
                this.m_angularVelocity.multiplyAssign(this.m_additionalDampingFactor);
                this.m_linearVelocity.multiplyAssign(this.m_additionalDampingFactor);
            }

            const speed = this.m_linearVelocity.length();
            if (speed < this.m_linearDamping) {
                const dampVel = 0.005;
                if (speed > dampVel) {
                    const dir = this.m_linearVelocity.normalized();
                    this.m_linearVelocity.subtractAssign(dir.multiply(dampVel));
                } else {
                    this.m_linearVelocity.setValue(0.0, 0.0, 0.0);
                }
            }

            const angSpeed = this.m_angularVelocity.length();
            if (angSpeed < this.m_angularDamping) {
                const angDampVel = 0.005;
                if (angSpeed > angDampVel) {
                    const dir = this.m_angularVelocity.normalized();
                    this.m_angularVelocity.subtractAssign(dir.multiply(angDampVel));
                } else {
                    this.m_angularVelocity.setValue(0.0, 0.0, 0.0);
                }
            }
        }
    }

    getCollisionShape(): btCollisionShape | null {
        return this.m_collisionShape;
    }

    setMassProps(mass: number, inertia: btVector3): void {
        if (mass === 0.0) {
            this.m_collisionFlags |= btRigidBody.CF_STATIC_OBJECT;
            this.m_inverseMass = 0.0;
        } else {
            this.m_collisionFlags &= (~btRigidBody.CF_STATIC_OBJECT);
            this.m_inverseMass = 1.0 / mass;
        }

        // Fg = m * a
        this.m_gravity.copy(this.m_gravity_acceleration.multiply(mass));

        this.m_invInertiaLocal.setValue(
            inertia.x() !== 0.0 ? 1.0 / inertia.x() : 0.0,
            inertia.y() !== 0.0 ? 1.0 / inertia.y() : 0.0,
            inertia.z() !== 0.0 ? 1.0 / inertia.z() : 0.0
        );

        this.m_invMass.copy(this.m_linearFactor.multiply(this.m_inverseMass));
    }

    getLinearFactor(): btVector3 {
        return this.m_linearFactor;
    }

    setLinearFactor(linearFactor: btVector3): void {
        this.m_linearFactor.copy(linearFactor);
        this.m_invMass.copy(this.m_linearFactor.multiply(this.m_inverseMass));
    }

    getInvMass(): number {
        return this.m_inverseMass;
    }

    getMass(): number {
        return this.m_inverseMass === 0.0 ? 0.0 : 1.0 / this.m_inverseMass;
    }

    getInvInertiaTensorWorld(): btMatrix3x3 {
        return this.m_invInertiaTensorWorld;
    }

    integrateVelocities(step: number): void {
        if (this.isStaticOrKinematicObject()) {
            return;
        }

        this.m_linearVelocity.addAssign(this.m_totalForce.multiply(this.m_inverseMass * step));
        this.m_angularVelocity.addAssign(multiplyMatrixVector(this.m_invInertiaTensorWorld, this.m_totalTorque).multiply(step));

        const MAX_ANGVEL = SIMD_HALF_PI;
        // clamp angular velocity. collision calculations will fail on higher angular velocities
        const angvel = this.m_angularVelocity.length();
        if (angvel * step > MAX_ANGVEL) {
            this.m_angularVelocity.multiplyAssign((MAX_ANGVEL / step) / angvel);
        }
    }

    setCenterOfMassTransform(xform: btTransform): void {
        if (this.isKinematicObject()) {
            this.m_interpolationWorldTransform.setOrigin(this.m_worldTransform.getOrigin());
            this.m_interpolationWorldTransform.setRotation(this.m_worldTransform.getRotation());
        } else {
            this.m_interpolationWorldTransform.setOrigin(xform.getOrigin());
            this.m_interpolationWorldTransform.setRotation(xform.getRotation());
        }
        this.m_interpolationLinearVelocity.copy(this.getLinearVelocity());
        this.m_interpolationAngularVelocity.copy(this.getAngularVelocity());
        this.m_worldTransform.setOrigin(xform.getOrigin());
        this.m_worldTransform.setRotation(xform.getRotation());
        this.updateInertiaTensor();
    }

    applyCentralForce(force: btVector3): void {
        this.m_totalForce.addAssign(force.multiplyVector(this.m_linearFactor));
    }

    getTotalForce(): btVector3 {
        return this.m_totalForce;
    }

    getTotalTorque(): btVector3 {
        return this.m_totalTorque;
    }

    getInvInertiaDiagLocal(): btVector3 {
        return this.m_invInertiaLocal;
    }

    setInvInertiaDiagLocal(diagInvInertia: btVector3): void {
        this.m_invInertiaLocal.copy(diagInvInertia);
    }

    setSleepingThresholds(linear: number, angular: number): void {
        this.m_linearSleepingThreshold = linear;
        this.m_angularSleepingThreshold = angular;
    }

    applyTorque(torque: btVector3): void {
        this.m_totalTorque.addAssign(torque.multiplyVector(this.m_angularFactor));
    }

    applyForce(force: btVector3, rel_pos: btVector3): void {
        this.applyCentralForce(force);
        this.applyTorque(rel_pos.cross(force.multiplyVector(this.m_linearFactor)));
    }

    applyCentralImpulse(impulse: btVector3): void {
        this.m_linearVelocity.addAssign(impulse.multiplyVector(this.m_linearFactor).multiply(this.m_inverseMass));
    }

    applyTorqueImpulse(torque: btVector3): void {
        this.m_angularVelocity.addAssign(multiplyMatrixVector(this.m_invInertiaTensorWorld, torque.multiplyVector(this.m_angularFactor)));
    }

    applyImpulse(impulse: btVector3, rel_pos: btVector3): void {
        if (this.m_inverseMass !== 0.0) {
            this.applyCentralImpulse(impulse);
            if (this.m_angularFactor.length2() > 0) {
                this.applyTorqueImpulse(rel_pos.cross(impulse.multiplyVector(this.m_linearFactor)));
            }
        }
    }

    applyPushImpulse(impulse: btVector3, rel_pos: btVector3): void {
        if (this.m_inverseMass !== 0.0) {
            this.applyCentralPushImpulse(impulse);
            if (this.m_angularFactor.length2() > 0) {
                this.applyTorqueTurnImpulse(rel_pos.cross(impulse.multiplyVector(this.m_linearFactor)));
            }
        }
    }

    getPushVelocity(): btVector3 {
        return this.m_pushVelocity;
    }

    getTurnVelocity(): btVector3 {
        return this.m_turnVelocity;
    }

    setPushVelocity(v: btVector3): void {
        this.m_pushVelocity.copy(v);
    }

    setTurnVelocity(v: btVector3): void {
        this.m_turnVelocity.copy(v);
    }

    applyCentralPushImpulse(impulse: btVector3): void {
        this.m_pushVelocity.addAssign(impulse.multiplyVector(this.m_linearFactor).multiply(this.m_inverseMass));
    }

    applyTorqueTurnImpulse(torque: btVector3): void {
        this.m_turnVelocity.addAssign(multiplyMatrixVector(this.m_invInertiaTensorWorld, torque.multiplyVector(this.m_angularFactor)));
    }

    clearForces(): void {
        this.m_totalForce.setValue(0.0, 0.0, 0.0);
        this.m_totalTorque.setValue(0.0, 0.0, 0.0);
    }

    updateInertiaTensor(): void {
        // Simplified implementation - the full version requires matrix multiplication
        this.m_invInertiaTensorWorld.setIdentity();
        // This is a simplified version - in the full implementation this would be:
        // this.m_invInertiaTensorWorld = worldBasis.scaled(this.m_invInertiaLocal) * worldBasis.transpose();
        // For now, we just scale the identity matrix
        this.m_invInertiaTensorWorld.setValue(
            this.m_invInertiaLocal.x(), 0, 0,
            0, this.m_invInertiaLocal.y(), 0,
            0, 0, this.m_invInertiaLocal.z()
        );
    }

    getCenterOfMassPosition(): btVector3 {
        return this.m_worldTransform.getOrigin();
    }

    getOrientation(): btQuaternion {
        return this.m_worldTransform.getRotation();
    }

    getCenterOfMassTransform(): btTransform {
        return this.m_worldTransform;
    }

    getLinearVelocity(): btVector3 {
        return this.m_linearVelocity;
    }

    getAngularVelocity(): btVector3 {
        return this.m_angularVelocity;
    }

    setLinearVelocity(lin_vel: btVector3): void {
        this.m_updateRevision++;
        this.m_linearVelocity.copy(lin_vel);
    }

    setAngularVelocity(ang_vel: btVector3): void {
        this.m_updateRevision++;
        this.m_angularVelocity.copy(ang_vel);
    }

    getVelocityInLocalPoint(rel_pos: btVector3): btVector3 {
        // we also calculate lin/ang velocity for kinematic objects
        return this.m_linearVelocity.add(this.m_angularVelocity.cross(rel_pos));
    }

    getPushVelocityInLocalPoint(rel_pos: btVector3): btVector3 {
        // we also calculate lin/ang velocity for kinematic objects
        return this.m_pushVelocity.add(this.m_turnVelocity.cross(rel_pos));
    }

    translate(v: btVector3): void {
        this.m_worldTransform.getOrigin().addAssign(v);
    }

    getAabb(aabbMin: btVector3, aabbMax: btVector3): void {
        this.getCollisionShape()?.getAabb(this.m_worldTransform, aabbMin, aabbMax);
    }

    computeImpulseDenominator(pos: btVector3, normal: btVector3): number {
        const r0 = pos.subtract(this.getCenterOfMassPosition());
        const c0 = r0.cross(normal);
        const vec = multiplyMatrixVector(this.getInvInertiaTensorWorld(), c0).cross(r0);
        return this.m_inverseMass + normal.dot(vec);
    }

    computeAngularImpulseDenominator(axis: btVector3): number {
        const vec = multiplyMatrixVector(this.getInvInertiaTensorWorld(), axis);
        return axis.dot(vec);
    }

    updateDeactivation(timeStep: number): void {
        if ((this.getActivationState() === ISLAND_SLEEPING) || (this.getActivationState() === DISABLE_DEACTIVATION)) {
            return;
        }

        if ((this.getLinearVelocity().length2() < this.m_linearSleepingThreshold * this.m_linearSleepingThreshold) &&
            (this.getAngularVelocity().length2() < this.m_angularSleepingThreshold * this.m_angularSleepingThreshold)) {
            this.m_deactivationTime += timeStep;
        } else {
            this.m_deactivationTime = 0.0;
            this.setActivationState(0);
        }
    }

    wantsSleeping(): boolean {
        if (this.getActivationState() === DISABLE_DEACTIVATION) {
            return false;
        }

        // disable deactivation
        if (gDisableDeactivation || (gDeactivationTime === 0.0)) {
            return false;
        }

        if ((this.getActivationState() === ISLAND_SLEEPING) || (this.getActivationState() === WANTS_DEACTIVATION)) {
            return true;
        }

        if (this.m_deactivationTime > gDeactivationTime) {
            return true;
        }
        return false;
    }

    getBroadphaseProxy(): btBroadphaseProxy | null {
        return this.m_broadphaseHandle;
    }

    setNewBroadphaseProxy(broadphaseProxy: btBroadphaseProxy): void {
        this.m_broadphaseHandle = broadphaseProxy;
    }

    // btMotionState allows to automatic synchronize the world transform for active objects
    getMotionState(): btMotionState | null {
        return this.m_optionalMotionState;
    }

    setMotionState(motionState: btMotionState | null): void {
        this.m_optionalMotionState = motionState;
        if (this.m_optionalMotionState) {
            motionState!.getWorldTransform(this.m_worldTransform);
        }
    }

    setAngularFactor(angFac: btVector3): void;
    setAngularFactor(angFac: number): void;
    setAngularFactor(angFac: btVector3 | number): void {
        this.m_updateRevision++;
        if (typeof angFac === 'number') {
            this.m_angularFactor.setValue(angFac, angFac, angFac);
        } else {
            this.m_angularFactor.copy(angFac);
        }
    }

    getAngularFactor(): btVector3 {
        return this.m_angularFactor;
    }

    // is this rigidbody added to a btCollisionWorld/btDynamicsWorld/btBroadphase?
    isInWorld(): boolean {
        return this.getBroadphaseProxy() !== null;
    }

    addConstraintRef(c: btTypedConstraint): void {
        // disable collision with the 'other' body
        const index = this.m_constraintRefs.findIndex(ref => ref === c);
        // don't add constraints that are already referenced
        if (index === -1) {
            this.m_constraintRefs.push(c);
            const colObjA = c.getRigidBodyA() as btCollisionObject;
            const colObjB = c.getRigidBodyB() as btCollisionObject;
            if (colObjA === this) {
                colObjA.setIgnoreCollisionCheck(colObjB, true);
            } else {
                colObjB.setIgnoreCollisionCheck(colObjA, true);
            }
        }
    }

    removeConstraintRef(c: btTypedConstraint): void {
        const index = this.m_constraintRefs.findIndex(ref => ref === c);
        // don't remove constraints that are not referenced
        if (index !== -1) {
            this.m_constraintRefs.splice(index, 1);
            const colObjA = c.getRigidBodyA() as btCollisionObject;
            const colObjB = c.getRigidBodyB() as btCollisionObject;
            if (colObjA === this) {
                colObjA.setIgnoreCollisionCheck(colObjB, false);
            } else {
                colObjB.setIgnoreCollisionCheck(colObjA, false);
            }
        }
    }

    getConstraintRef(index: number): btTypedConstraint {
        return this.m_constraintRefs[index];
    }

    getNumConstraintRefs(): number {
        return this.m_constraintRefs.length;
    }

    setFlags(flags: number): void {
        this.m_rigidbodyFlags = flags;
    }

    getFlags(): number {
        return this.m_rigidbodyFlags;
    }

    getLocalInertia(): btVector3 {
        const inertiaLocal = new btVector3();
        const inertia = this.m_invInertiaLocal;
        inertiaLocal.setValue(
            inertia.x() !== 0.0 ? 1.0 / inertia.x() : 0.0,
            inertia.y() !== 0.0 ? 1.0 / inertia.y() : 0.0,
            inertia.z() !== 0.0 ? 1.0 / inertia.z() : 0.0
        );
        return inertiaLocal;
    }

    proceedToTransform(newTrans: btTransform): void {
        this.setCenterOfMassTransform(newTrans);
    }

    /** perform implicit force computation in world space */
    computeGyroscopicImpulseImplicit_World(_dt: number): btVector3 {
        // Simplified implementation - returns zero vector for now
        // Full implementation would require complex matrix operations
        return new btVector3(0, 0, 0);
    }

    /** perform implicit force computation in body space (inertial frame) */
    computeGyroscopicImpulseImplicit_Body(_step: number): btVector3 {
        // Simplified implementation - returns zero vector for now
        // Full implementation would require complex matrix operations
        return new btVector3(0, 0, 0);
    }

    /** explicit version is best avoided, it gains energy */
    computeGyroscopicForceExplicit(maxGyroscopicForce: number): btVector3 {
        // Simplified implementation - the full version requires proper matrix multiplication
        const gf = new btVector3(0, 0, 0); // Simplified - would be cross product of angular velocity and inertia tensor
        const l2 = gf.length2();
        if (l2 > maxGyroscopicForce * maxGyroscopicForce) {
            gf.multiplyAssign(1.0 / btSqrt(l2) * maxGyroscopicForce);
        }
        return gf;
    }
}