/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Erwin Coumans  http://bulletphysics.org

2009 March: btGeneric6DofConstraint refactored by Roman Ponomarev
Added support for generic constraint solver through getInfo1/getInfo2 methods

2007-09-09
btGeneric6DofConstraint Refactored by Francisco León
email: projectileman@yahoo.com
http://gimpact.sf.net

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

import { btVector3 } from '../../LinearMath/btVector3';
import { btMatrix3x3 } from '../../LinearMath/btMatrix3x3';
import { btTransform } from '../../LinearMath/btTransform';
import { btAssert, btNormalizeAngle, SIMD_EPSILON, SIMD_PI, SIMD_2_PI, SIMD_HALF_PI, BT_LARGE_FLOAT } from '../../LinearMath/btScalar';
import { btJacobianEntry } from './btJacobianEntry';
import { btTypedConstraint, btTypedConstraintType, btConstraintInfo1, btConstraintInfo2, btAdjustAngleToLimits, matrixToEulerXYZ, btConstraintParams } from './btTypedConstraint';

// Constants for the 6DOF constraint
const D6_USE_OBSOLETE_METHOD = false;
const D6_USE_FRAME_OFFSET = true;
const GENERIC_D6_DISABLE_WARMSTARTING = true;

export enum bt6DofFlags {
    BT_6DOF_FLAGS_CFM_NORM = 1,
    BT_6DOF_FLAGS_CFM_STOP = 2,
    BT_6DOF_FLAGS_ERP_STOP = 4
}

const BT_6DOF_FLAGS_AXIS_SHIFT = 3; // bits per axis

/**
 * Rotation Limit structure for generic joints
 */
export class btRotationalLimitMotor {
    // limit_parameters
    m_loLimit: number = 1.0;         // joint limit
    m_hiLimit: number = -1.0;        // joint limit
    m_targetVelocity: number = 0;    // target motor velocity
    m_maxMotorForce: number = 6.0;   // max force on motor
    m_maxLimitForce: number = 300.0; // max force on limit
    m_damping: number = 1.0;         // Damping.
    m_limitSoftness: number = 0.5;   // Relaxation factor
    m_normalCFM: number = 0;         // Constraint force mixing factor
    m_stopERP: number = 0.2;         // Error tolerance factor when joint is at limit
    m_stopCFM: number = 0;           // Constraint force mixing factor when joint is at limit
    m_bounce: number = 0.0;          // restitution factor
    m_enableMotor: boolean = false;

    // temp_variables
    m_currentLimitError: number = 0;  // How much is violated this limit
    m_currentPosition: number = 0;    // current value of angle
    m_currentLimit: number = 0;       // 0=free, 1=at lo limit, 2=at hi limit
    m_accumulatedImpulse: number = 0;

    constructor(other?: btRotationalLimitMotor) {
        if (other) {
            this.m_targetVelocity = other.m_targetVelocity;
            this.m_maxMotorForce = other.m_maxMotorForce;
            this.m_limitSoftness = other.m_limitSoftness;
            this.m_loLimit = other.m_loLimit;
            this.m_hiLimit = other.m_hiLimit;
            this.m_normalCFM = other.m_normalCFM;
            this.m_stopERP = other.m_stopERP;
            this.m_stopCFM = other.m_stopCFM;
            this.m_bounce = other.m_bounce;
            this.m_currentLimit = other.m_currentLimit;
            this.m_currentLimitError = other.m_currentLimitError;
            this.m_enableMotor = other.m_enableMotor;
            this.m_damping = other.m_damping;
            this.m_accumulatedImpulse = other.m_accumulatedImpulse;
            this.m_currentPosition = other.m_currentPosition;
        }
    }

    // Is limited
    isLimited(): boolean {
        return !(this.m_loLimit > this.m_hiLimit);
    }

    // Need apply correction
    needApplyTorques(): boolean {
        return !(this.m_currentLimit === 0 && this.m_enableMotor === false);
    }

    // calculates error
    testLimitValue(test_value: number): number {
        if (this.m_loLimit > this.m_hiLimit) {
            this.m_currentLimit = 0; // Free from violation
            return 0;
        }
        if (test_value < this.m_loLimit) {
            this.m_currentLimit = 1; // low limit violation
            this.m_currentLimitError = test_value - this.m_loLimit;
            if (this.m_currentLimitError > SIMD_PI)
                this.m_currentLimitError -= SIMD_2_PI;
            else if (this.m_currentLimitError < -SIMD_PI)
                this.m_currentLimitError += SIMD_2_PI;
            return 1;
        } else if (test_value > this.m_hiLimit) {
            this.m_currentLimit = 2; // High limit violation
            this.m_currentLimitError = test_value - this.m_hiLimit;
            if (this.m_currentLimitError > SIMD_PI)
                this.m_currentLimitError -= SIMD_2_PI;
            else if (this.m_currentLimitError < -SIMD_PI)
                this.m_currentLimitError += SIMD_2_PI;
            return 2;
        }

        this.m_currentLimit = 0; // Free from violation
        return 0;
    }

    // apply the correction impulses for two bodies
    solveAngularLimits(timeStep: number, axis: btVector3, jacDiagABInv: number, body0: any, body1: any): number {
        if (!this.needApplyTorques()) return 0.0;

        let target_velocity = this.m_targetVelocity;
        let maxMotorForce = this.m_maxMotorForce;

        // current error correction
        if (this.m_currentLimit !== 0) {
            target_velocity = -this.m_stopERP * this.m_currentLimitError / timeStep;
            maxMotorForce = this.m_maxLimitForce;
        }

        maxMotorForce *= timeStep;

        // current velocity difference
        const angVelA = body0.getAngularVelocity();
        const angVelB = body1.getAngularVelocity();

        const vel_diff = angVelA.subtract(angVelB);
        const rel_vel = axis.dot(vel_diff);

        // correction velocity
        const motor_relvel = this.m_limitSoftness * (target_velocity - this.m_damping * rel_vel);

        if (motor_relvel < SIMD_EPSILON && motor_relvel > -SIMD_EPSILON) {
            return 0.0; // no need for applying force
        }

        // correction impulse
        const unclippedMotorImpulse = (1 + this.m_bounce) * motor_relvel * jacDiagABInv;

        // clip correction impulse
        let clippedMotorImpulse: number;
        if (unclippedMotorImpulse > 0.0) {
            clippedMotorImpulse = unclippedMotorImpulse > maxMotorForce ? maxMotorForce : unclippedMotorImpulse;
        } else {
            clippedMotorImpulse = unclippedMotorImpulse < -maxMotorForce ? -maxMotorForce : unclippedMotorImpulse;
        }

        // sort with accumulated impulses
        const lo = -BT_LARGE_FLOAT;
        const hi = BT_LARGE_FLOAT;

        const oldaccumImpulse = this.m_accumulatedImpulse;
        const sum = oldaccumImpulse + clippedMotorImpulse;
        this.m_accumulatedImpulse = sum > hi ? 0 : sum < lo ? 0 : sum;

        clippedMotorImpulse = this.m_accumulatedImpulse - oldaccumImpulse;

        const motorImp = axis.multiply(clippedMotorImpulse);

        body0.applyTorqueImpulse(motorImp);
        body1.applyTorqueImpulse(motorImp.negate());

        return clippedMotorImpulse;
    }
}

export class btTranslationalLimitMotor {
    m_lowerLimit: btVector3 = new btVector3(0, 0, 0);  // the constraint lower limits
    m_upperLimit: btVector3 = new btVector3(0, 0, 0);  // the constraint upper limits
    m_accumulatedImpulse: btVector3 = new btVector3(0, 0, 0);

    // Linear_Limit_parameters
    m_limitSoftness: number = 0.7;    // Softness for linear limit
    m_damping: number = 1.0;          // Damping for linear limit
    m_restitution: number = 0.5;      // Bounce parameter for linear limit
    m_normalCFM: btVector3 = new btVector3(0, 0, 0);     // Constraint force mixing factor
    m_stopERP: btVector3 = new btVector3(0.2, 0.2, 0.2); // Error tolerance factor when joint is at limit
    m_stopCFM: btVector3 = new btVector3(0, 0, 0);       // Constraint force mixing factor when joint is at limit

    m_enableMotor: boolean[] = [false, false, false];
    m_targetVelocity: btVector3 = new btVector3(0, 0, 0);     // target motor velocity
    m_maxMotorForce: btVector3 = new btVector3(0, 0, 0);      // max force on motor
    m_currentLimitError: btVector3 = new btVector3(0, 0, 0);  // How much is violated this limit
    m_currentLinearDiff: btVector3 = new btVector3(0, 0, 0);  // Current relative offset of constraint frames
    m_currentLimit: number[] = [0, 0, 0];                     // 0=free, 1=at lower limit, 2=at upper limit

    constructor(other?: btTranslationalLimitMotor) {
        if (other) {
            this.m_lowerLimit.copy(other.m_lowerLimit);
            this.m_upperLimit.copy(other.m_upperLimit);
            this.m_accumulatedImpulse.copy(other.m_accumulatedImpulse);

            this.m_limitSoftness = other.m_limitSoftness;
            this.m_damping = other.m_damping;
            this.m_restitution = other.m_restitution;
            this.m_normalCFM.copy(other.m_normalCFM);
            this.m_stopERP.copy(other.m_stopERP);
            this.m_stopCFM.copy(other.m_stopCFM);

            for (let i = 0; i < 3; i++) {
                this.m_enableMotor[i] = other.m_enableMotor[i];
                this.m_targetVelocity.setComponent(i, other.m_targetVelocity.getComponent(i));
                this.m_maxMotorForce.setComponent(i, other.m_maxMotorForce.getComponent(i));
            }
        }
    }

    // Test limit
    isLimited(limitIndex: number): boolean {
        return (this.m_upperLimit.getComponent(limitIndex) >= this.m_lowerLimit.getComponent(limitIndex));
    }

    needApplyForce(limitIndex: number): boolean {
        if (this.m_currentLimit[limitIndex] === 0 && this.m_enableMotor[limitIndex] === false) return false;
        return true;
    }

    testLimitValue(limitIndex: number, test_value: number): number {
        const loLimit = this.m_lowerLimit.getComponent(limitIndex);
        const hiLimit = this.m_upperLimit.getComponent(limitIndex);
        if (loLimit > hiLimit) {
            this.m_currentLimit[limitIndex] = 0; // Free from violation
            this.m_currentLimitError.setComponent(limitIndex, 0);
            return 0;
        }

        if (test_value < loLimit) {
            this.m_currentLimit[limitIndex] = 2; // low limit violation
            this.m_currentLimitError.setComponent(limitIndex, test_value - loLimit);
            return 2;
        } else if (test_value > hiLimit) {
            this.m_currentLimit[limitIndex] = 1; // High limit violation
            this.m_currentLimitError.setComponent(limitIndex, test_value - hiLimit);
            return 1;
        }

        this.m_currentLimit[limitIndex] = 0; // Free from violation
        this.m_currentLimitError.setComponent(limitIndex, 0);
        return 0;
    }

    solveLinearAxis(
        timeStep: number,
        jacDiagABInv: number,
        body1: any, pointInA: btVector3,
        body2: any, pointInB: btVector3,
        limit_index: number,
        axis_normal_on_a: btVector3,
        anchorPos: btVector3
    ): number {
        // find relative velocity
        const rel_pos1 = anchorPos.subtract(body1.getCenterOfMassPosition());
        const rel_pos2 = anchorPos.subtract(body2.getCenterOfMassPosition());

        const vel1 = body1.getVelocityInLocalPoint(rel_pos1);
        const vel2 = body2.getVelocityInLocalPoint(rel_pos2);
        const vel = vel1.subtract(vel2);

        const rel_vel = axis_normal_on_a.dot(vel);

        // apply displacement correction

        // positional error (zeroth order error)
        let depth = -(pointInA.subtract(pointInB)).dot(axis_normal_on_a);
        let lo = -BT_LARGE_FLOAT;
        let hi = BT_LARGE_FLOAT;

        const minLimit = this.m_lowerLimit.getComponent(limit_index);
        const maxLimit = this.m_upperLimit.getComponent(limit_index);

        // handle the limits
        if (minLimit < maxLimit) {
            if (depth > maxLimit) {
                depth -= maxLimit;
                lo = 0;
            } else {
                if (depth < minLimit) {
                    depth -= minLimit;
                    hi = 0;
                } else {
                    return 0.0;
                }
            }
        }

        const normalImpulse = this.m_limitSoftness * (this.m_restitution * depth / timeStep - this.m_damping * rel_vel) * jacDiagABInv;

        const oldNormalImpulse = this.m_accumulatedImpulse.getComponent(limit_index);
        const sum = oldNormalImpulse + normalImpulse;
        const clampedSum = sum > hi ? 0 : sum < lo ? 0 : sum;
        this.m_accumulatedImpulse.setComponent(limit_index, clampedSum);
        const finalNormalImpulse = clampedSum - oldNormalImpulse;

        const impulse_vector = axis_normal_on_a.multiply(finalNormalImpulse);
        body1.applyImpulse(impulse_vector, rel_pos1);
        body2.applyImpulse(impulse_vector.negate(), rel_pos2);

        return finalNormalImpulse;
    }
}

/**
 * btGeneric6DofConstraint between two rigidbodies each with a pivotpoint that describes the axis location in local space
 *
 * btGeneric6DofConstraint can leave any of the 6 degree of freedom 'free' or 'locked'.
 * Currently this limit supports rotational motors
 *
 * For Linear limits, use btGeneric6DofConstraint.setLinearUpperLimit, btGeneric6DofConstraint.setLinearLowerLimit.
 * You can set the parameters with the btTranslationalLimitMotor structure accessible through the
 * btGeneric6DofConstraint.getTranslationalLimitMotor method.
 * At this moment translational motors are not supported. May be in the future.
 *
 * For Angular limits, use the btRotationalLimitMotor structure for configuring the limit.
 * This is accessible through btGeneric6DofConstraint.getLimitMotor method,
 * This brings support for limit parameters and motors.
 *
 * Angular limits have these possible ranges:
 * AXIS | MIN ANGLE | MAX ANGLE
 * X    | -PI       | PI
 * Y    | -PI/2     | PI/2
 * Z    | -PI       | PI
 */
export class btGeneric6DofConstraint extends btTypedConstraint {
    protected m_frameInA: btTransform;  // the constraint space w.r.t body A
    protected m_frameInB: btTransform;  // the constraint space w.r.t body B

    // Jacobians
    protected m_jacLinear: btJacobianEntry[] = [new btJacobianEntry(), new btJacobianEntry(), new btJacobianEntry()];  // 3 orthogonal linear constraints
    protected m_jacAng: btJacobianEntry[] = [new btJacobianEntry(), new btJacobianEntry(), new btJacobianEntry()];     // 3 orthogonal angular constraints

    // Linear_Limit_parameters
    protected m_linearLimits: btTranslationalLimitMotor;

    // hinge_parameters
    protected m_angularLimits: btRotationalLimitMotor[] = [new btRotationalLimitMotor(), new btRotationalLimitMotor(), new btRotationalLimitMotor()];

    // temporal variables
    protected m_timeStep: number = 0;
    protected m_calculatedTransformA: btTransform = new btTransform();
    protected m_calculatedTransformB: btTransform = new btTransform();
    protected m_calculatedAxisAngleDiff: btVector3 = new btVector3();
    protected m_calculatedAxis: btVector3[] = [new btVector3(), new btVector3(), new btVector3()];
    protected m_calculatedLinearDiff: btVector3 = new btVector3();
    protected m_factA: number = 0;
    protected m_factB: number = 0;
    protected m_hasStaticBody: boolean = false;

    protected m_AnchorPos: btVector3 = new btVector3(); // point between pivots of bodies A and B to solve linear axes

    protected m_useLinearReferenceFrameA: boolean = true;
    protected m_useOffsetForConstraintFrame: boolean = D6_USE_FRAME_OFFSET;

    protected m_flags: number = 0;

    // for backwards compatibility during the transition to 'getInfo/getInfo2'
    public m_useSolveConstraintObsolete: boolean = D6_USE_OBSOLETE_METHOD;

    constructor(rbA: any, rbB: any, frameInA: btTransform, frameInB: btTransform, useLinearReferenceFrameA: boolean);
    constructor(rbB: any, frameInB: btTransform, useLinearReferenceFrameB: boolean);
    constructor(rbAOrB: any, rbBOrFrameInB?: any, frameInAOrUseLinear?: any, frameInBOrUndefined?: any, useLinearReferenceFrameA?: boolean) {
        if (arguments.length === 5) {
            // Two-body constructor
            super(btTypedConstraintType.D6_CONSTRAINT_TYPE, rbAOrB, rbBOrFrameInB);
            this.m_frameInA = new btTransform(frameInAOrUseLinear);
            this.m_frameInB = new btTransform(frameInBOrUndefined);
            this.m_useLinearReferenceFrameA = useLinearReferenceFrameA || true;
            this.m_linearLimits = new btTranslationalLimitMotor();
        } else {
            // Single-body constructor
            super(btTypedConstraintType.D6_CONSTRAINT_TYPE, btTypedConstraint.getFixedBody(), rbAOrB);
            this.m_frameInB = new btTransform(rbBOrFrameInB);
            this.m_useLinearReferenceFrameA = frameInAOrUseLinear !== undefined ? frameInAOrUseLinear : true;
            this.m_linearLimits = new btTranslationalLimitMotor();

            // not providing rigidbody A means implicitly using worldspace for body A
            this.m_frameInA = rbAOrB.getCenterOfMassTransform().multiply(this.m_frameInB);
        }

        this.calculateTransforms();
    }

    // Calcs global transform of the offsets
    calculateTransforms(): void;
    calculateTransforms(transA: btTransform, transB: btTransform): void;
    calculateTransforms(transA?: btTransform, transB?: btTransform): void {
        if (transA && transB) {
            this.m_calculatedTransformA = transA.multiply(this.m_frameInA);
            this.m_calculatedTransformB = transB.multiply(this.m_frameInB);
        } else {
            this.m_calculatedTransformA = this.m_rbA.getCenterOfMassTransform().multiply(this.m_frameInA);
            this.m_calculatedTransformB = this.m_rbB.getCenterOfMassTransform().multiply(this.m_frameInB);
        }
        this.calculateLinearInfo();
        this.calculateAngleInfo();
        if (this.m_useOffsetForConstraintFrame) {
            // get weight factors depending on masses
            const miA = this.getRigidBodyA().getInvMass();
            const miB = this.getRigidBodyB().getInvMass();
            this.m_hasStaticBody = (miA < SIMD_EPSILON) || (miB < SIMD_EPSILON);
            const miS = miA + miB;
            if (miS > 0) {
                this.m_factA = miB / miS;
            } else {
                this.m_factA = 0.5;
            }
            this.m_factB = 1.0 - this.m_factA;
        }
    }

    // Gets the global transform of the offset for body A
    getCalculatedTransformA(): btTransform {
        return this.m_calculatedTransformA;
    }

    // Gets the global transform of the offset for body B
    getCalculatedTransformB(): btTransform {
        return this.m_calculatedTransformB;
    }

    getFrameOffsetA(): btTransform {
        return this.m_frameInA;
    }

    getFrameOffsetB(): btTransform {
        return this.m_frameInB;
    }

    // performs Jacobian calculation, and also calculates angle differences and axis
    buildJacobian(): void {
        if (this.m_useSolveConstraintObsolete) {
            // Clear accumulated impulses for the next simulation step
            this.m_linearLimits.m_accumulatedImpulse.setValue(0, 0, 0);
            for (let i = 0; i < 3; i++) {
                this.m_angularLimits[i].m_accumulatedImpulse = 0;
            }
            // calculates transform
            this.calculateTransforms(this.m_rbA.getCenterOfMassTransform(), this.m_rbB.getCenterOfMassTransform());

            this.calcAnchorPos();
            const pivotAInW = this.m_AnchorPos;
            const pivotBInW = this.m_AnchorPos;

            let normalWorld: btVector3;
            // linear part
            for (let i = 0; i < 3; i++) {
                if (this.m_linearLimits.isLimited(i)) {
                    if (this.m_useLinearReferenceFrameA)
                        normalWorld = this.m_calculatedTransformA.getBasis().getColumn(i);
                    else
                        normalWorld = this.m_calculatedTransformB.getBasis().getColumn(i);

                    this.buildLinearJacobian(
                        this.m_jacLinear[i], normalWorld,
                        pivotAInW, pivotBInW);
                }
            }

            // angular part
            for (let i = 0; i < 3; i++) {
                // calculates error angle
                if (this.testAngularLimitMotor(i)) {
                    normalWorld = this.getAxis(i);
                    // Create angular atom
                    this.buildAngularJacobian(this.m_jacAng[i], normalWorld);
                }
            }
        }
    }

    getInfo1(info: btConstraintInfo1): void {
        if (this.m_useSolveConstraintObsolete) {
            info.m_numConstraintRows = 0;
            info.nub = 0;
        } else {
            // prepare constraint
            this.calculateTransforms(this.m_rbA.getCenterOfMassTransform(), this.m_rbB.getCenterOfMassTransform());
            info.m_numConstraintRows = 0;
            info.nub = 6;
            // test linear limits
            for (let i = 0; i < 3; i++) {
                if (this.m_linearLimits.needApplyForce(i)) {
                    info.m_numConstraintRows++;
                    info.nub--;
                }
            }
            // test angular limits
            for (let i = 0; i < 3; i++) {
                if (this.testAngularLimitMotor(i)) {
                    info.m_numConstraintRows++;
                    info.nub--;
                }
            }
        }
    }

    getInfo1NonVirtual(info: btConstraintInfo1): void {
        if (this.m_useSolveConstraintObsolete) {
            info.m_numConstraintRows = 0;
            info.nub = 0;
        } else {
            // pre-allocate all 6
            info.m_numConstraintRows = 6;
            info.nub = 0;
        }
    }

    getInfo2(info: btConstraintInfo2): void {
        btAssert(!this.m_useSolveConstraintObsolete);

        const transA = this.m_rbA.getCenterOfMassTransform();
        const transB = this.m_rbB.getCenterOfMassTransform();
        const linVelA = this.m_rbA.getLinearVelocity();
        const linVelB = this.m_rbB.getLinearVelocity();
        const angVelA = this.m_rbA.getAngularVelocity();
        const angVelB = this.m_rbB.getAngularVelocity();

        if (this.m_useOffsetForConstraintFrame) {
            // for stability better to solve angular limits first
            const row = this.setAngularLimits(info, 0, transA, transB, linVelA, linVelB, angVelA, angVelB);
            this.setLinearLimits(info, row, transA, transB, linVelA, linVelB, angVelA, angVelB);
        } else {
            // leave old version for compatibility
            const row = this.setLinearLimits(info, 0, transA, transB, linVelA, linVelB, angVelA, angVelB);
            this.setAngularLimits(info, row, transA, transB, linVelA, linVelB, angVelA, angVelB);
        }
    }

    getInfo2NonVirtual(info: btConstraintInfo2, transA: btTransform, transB: btTransform, linVelA: btVector3, linVelB: btVector3, angVelA: btVector3, angVelB: btVector3): void {
        btAssert(!this.m_useSolveConstraintObsolete);
        // prepare constraint
        this.calculateTransforms(transA, transB);

        for (let i = 0; i < 3; i++) {
            this.testAngularLimitMotor(i);
        }

        if (this.m_useOffsetForConstraintFrame) {
            // for stability better to solve angular limits first
            const row = this.setAngularLimits(info, 0, transA, transB, linVelA, linVelB, angVelA, angVelB);
            this.setLinearLimits(info, row, transA, transB, linVelA, linVelB, angVelA, angVelB);
        } else {
            // leave old version for compatibility
            const row = this.setLinearLimits(info, 0, transA, transB, linVelA, linVelB, angVelA, angVelB);
            this.setAngularLimits(info, row, transA, transB, linVelA, linVelB, angVelA, angVelB);
        }
    }

    updateRHS(timeStep: number): void {
        // Implementation placeholder
    }

    // Get the rotation axis in global coordinates
    getAxis(axis_index: number): btVector3 {
        return this.m_calculatedAxis[axis_index];
    }

    // Get the relative Euler angle
    getAngle(axis_index: number): number {
        return this.m_calculatedAxisAngleDiff.getComponent(axis_index);
    }

    // Get the relative position of the constraint pivot
    getRelativePivotPosition(axis_index: number): number {
        return this.m_calculatedLinearDiff.getComponent(axis_index);
    }

    setFrames(frameA: btTransform, frameB: btTransform): void {
        this.m_frameInA.copy(frameA);
        this.m_frameInB.copy(frameB);
        this.buildJacobian();
        this.calculateTransforms();
    }

    // Test angular limit.
    testAngularLimitMotor(axis_index: number): boolean {
        let angle = this.m_calculatedAxisAngleDiff.getComponent(axis_index);
        angle = btAdjustAngleToLimits(angle, this.m_angularLimits[axis_index].m_loLimit, this.m_angularLimits[axis_index].m_hiLimit);
        this.m_angularLimits[axis_index].m_currentPosition = angle;
        // test limits
        this.m_angularLimits[axis_index].testLimitValue(angle);
        return this.m_angularLimits[axis_index].needApplyTorques();
    }

    setLinearLowerLimit(linearLower: btVector3): void {
        this.m_linearLimits.m_lowerLimit.copy(linearLower);
    }

    getLinearLowerLimit(linearLower: btVector3): void {
        linearLower.copy(this.m_linearLimits.m_lowerLimit);
    }

    setLinearUpperLimit(linearUpper: btVector3): void {
        this.m_linearLimits.m_upperLimit.copy(linearUpper);
    }

    getLinearUpperLimit(linearUpper: btVector3): void {
        linearUpper.copy(this.m_linearLimits.m_upperLimit);
    }

    setAngularLowerLimit(angularLower: btVector3): void {
        for (let i = 0; i < 3; i++)
            this.m_angularLimits[i].m_loLimit = btNormalizeAngle(angularLower.getComponent(i));
    }

    getAngularLowerLimit(angularLower: btVector3): void {
        for (let i = 0; i < 3; i++)
            angularLower.setComponent(i, this.m_angularLimits[i].m_loLimit);
    }

    setAngularUpperLimit(angularUpper: btVector3): void {
        for (let i = 0; i < 3; i++)
            this.m_angularLimits[i].m_hiLimit = btNormalizeAngle(angularUpper.getComponent(i));
    }

    getAngularUpperLimit(angularUpper: btVector3): void {
        for (let i = 0; i < 3; i++)
            angularUpper.setComponent(i, this.m_angularLimits[i].m_hiLimit);
    }

    // Retrieves the angular limit information
    getRotationalLimitMotor(index: number): btRotationalLimitMotor {
        return this.m_angularLimits[index];
    }

    // Retrieves the limit information
    getTranslationalLimitMotor(): btTranslationalLimitMotor {
        return this.m_linearLimits;
    }

    // first 3 are linear, next 3 are angular
    setLimit(axis: number, lo: number, hi: number): void {
        if (axis < 3) {
            this.m_linearLimits.m_lowerLimit.setComponent(axis, lo);
            this.m_linearLimits.m_upperLimit.setComponent(axis, hi);
        } else {
            const normalizedLo = btNormalizeAngle(lo);
            const normalizedHi = btNormalizeAngle(hi);
            this.m_angularLimits[axis - 3].m_loLimit = normalizedLo;
            this.m_angularLimits[axis - 3].m_hiLimit = normalizedHi;
        }
    }

    // Test limit
    isLimited(limitIndex: number): boolean {
        if (limitIndex < 3) {
            return this.m_linearLimits.isLimited(limitIndex);
        }
        return this.m_angularLimits[limitIndex - 3].isLimited();
    }

    calcAnchorPos(): void {
        const imA = this.m_rbA.getInvMass();
        const imB = this.m_rbB.getInvMass();
        let weight: number;
        if (imB === 0.0) {
            weight = 1.0;
        } else {
            weight = imA / (imA + imB);
        }
        const pA = this.m_calculatedTransformA.getOrigin();
        const pB = this.m_calculatedTransformB.getOrigin();
        this.m_AnchorPos = pA.multiply(weight).add(pB.multiply(1.0 - weight));
    }

    get_limit_motor_info2(
        limot: btRotationalLimitMotor,
        transA: btTransform, transB: btTransform,
        linVelA: btVector3, linVelB: btVector3,
        angVelA: btVector3, angVelB: btVector3,
        info: btConstraintInfo2, row: number,
        ax1: btVector3, rotational: number,
        rotAllowed: number = 0
    ): number {
        const srow = row * info.rowskip;
        const powered = limot.m_enableMotor;
        const limit = limot.m_currentLimit;

        if (powered || limit) {
            if (!info.m_J1linearAxis || !info.m_J2linearAxis || !info.m_J1angularAxis || !info.m_J2angularAxis || !info.m_constraintError || !info.cfm || !info.m_lowerLimit || !info.m_upperLimit) {
                throw new Error("Invalid constraint info arrays");
            }

            const J1 = rotational ? info.m_J1angularAxis : info.m_J1linearAxis;
            const J2 = rotational ? info.m_J2angularAxis : info.m_J2linearAxis;

            J1[srow + 0] = ax1.x();
            J1[srow + 1] = ax1.y();
            J1[srow + 2] = ax1.z();

            J2[srow + 0] = -ax1.x();
            J2[srow + 1] = -ax1.y();
            J2[srow + 2] = -ax1.z();

            if (!rotational) {
                if (this.m_useOffsetForConstraintFrame) {
                    // get vector from bodyB to frameB in WCS
                    const relB = this.m_calculatedTransformB.getOrigin().subtract(transB.getOrigin());
                    // get its projection to constraint axis
                    const projB = ax1.multiply(relB.dot(ax1));
                    // get vector directed from bodyB to constraint axis (and orthogonal to it)
                    const orthoB = relB.subtract(projB);
                    // same for bodyA
                    const relA = this.m_calculatedTransformA.getOrigin().subtract(transA.getOrigin());
                    const projA = ax1.multiply(relA.dot(ax1));
                    const orthoA = relA.subtract(projA);
                    // get desired offset between frames A and B along constraint axis
                    const desiredOffs = limot.m_currentPosition - limot.m_currentLimitError;
                    // desired vector from projection of center of bodyA to projection of center of bodyB to constraint axis
                    const totalDist = projA.add(ax1.multiply(desiredOffs)).subtract(projB);
                    // get offset vectors relA and relB
                    const relA_final = orthoA.add(totalDist.multiply(this.m_factA));
                    const relB_final = orthoB.subtract(totalDist.multiply(this.m_factB));
                    const tmpA = relA_final.cross(ax1);
                    const tmpB = relB_final.cross(ax1);
                    if (this.m_hasStaticBody && (!rotAllowed)) {
                        tmpA.multiplyAssign(this.m_factA);
                        tmpB.multiplyAssign(this.m_factB);
                    }
                    for (let i = 0; i < 3; i++) info.m_J1angularAxis[srow + i] = tmpA.getComponent(i);
                    for (let i = 0; i < 3; i++) info.m_J2angularAxis[srow + i] = -tmpB.getComponent(i);
                } else {
                    let ltd: btVector3; // Linear Torque Decoupling vector
                    let c = this.m_calculatedTransformB.getOrigin().op_sub(transA.getOrigin());
                    ltd = c.cross(ax1);
                    info.m_J1angularAxis[srow + 0] = ltd.x();
                    info.m_J1angularAxis[srow + 1] = ltd.y();
                    info.m_J1angularAxis[srow + 2] = ltd.z();

                    c = this.m_calculatedTransformB.getOrigin().subtract(transB.getOrigin());
                    ltd = c.cross(ax1).negate();
                    info.m_J2angularAxis[srow + 0] = ltd.x();
                    info.m_J2angularAxis[srow + 1] = ltd.y();
                    info.m_J2angularAxis[srow + 2] = ltd.z();
                }
            }

            // if we're limited low and high simultaneously, the joint motor is ineffective
            let finalPowered = powered;
            if (limit && (limot.m_loLimit === limot.m_hiLimit)) finalPowered = false;

            info.m_constraintError[srow] = 0;
            if (finalPowered) {
                info.cfm[srow] = limot.m_normalCFM;
                if (!limit) {
                    const tag_vel = rotational ? limot.m_targetVelocity : -limot.m_targetVelocity;

                    const mot_fact = this.getMotorFactor(
                        limot.m_currentPosition,
                        limot.m_loLimit,
                        limot.m_hiLimit,
                        tag_vel,
                        info.fps * limot.m_stopERP
                    );
                    info.m_constraintError[srow] += mot_fact * limot.m_targetVelocity;
                    info.m_lowerLimit[srow] = -limot.m_maxMotorForce / info.fps;
                    info.m_upperLimit[srow] = limot.m_maxMotorForce / info.fps;
                }
            }
            if (limit) {
                const k = info.fps * limot.m_stopERP;
                if (!rotational) {
                    info.m_constraintError[srow] += k * limot.m_currentLimitError;
                } else {
                    info.m_constraintError[srow] += -k * limot.m_currentLimitError;
                }
                info.cfm[srow] = limot.m_stopCFM;
                if (limot.m_loLimit === limot.m_hiLimit) {
                    // limited low and high simultaneously
                    info.m_lowerLimit[srow] = -Number.POSITIVE_INFINITY;
                    info.m_upperLimit[srow] = Number.POSITIVE_INFINITY;
                } else {
                    if (limit === 1) {
                        info.m_lowerLimit[srow] = 0;
                        info.m_upperLimit[srow] = Number.POSITIVE_INFINITY;
                    } else {
                        info.m_lowerLimit[srow] = -Number.POSITIVE_INFINITY;
                        info.m_upperLimit[srow] = 0;
                    }
                    // deal with bounce
                    if (limot.m_bounce > 0) {
                        // calculate joint velocity
                        let vel: number;
                        if (rotational) {
                            vel = angVelA.dot(ax1);
                            vel -= angVelB.dot(ax1);
                        } else {
                            vel = linVelA.dot(ax1);
                            vel -= linVelB.dot(ax1);
                        }
                        // only apply bounce if the velocity is incoming, and if the
                        // resulting c[] exceeds what we already have.
                        if (limit === 1) {
                            if (vel < 0) {
                                const newc = -limot.m_bounce * vel;
                                if (newc > info.m_constraintError[srow])
                                    info.m_constraintError[srow] = newc;
                            }
                        } else {
                            if (vel > 0) {
                                const newc = -limot.m_bounce * vel;
                                if (newc < info.m_constraintError[srow])
                                    info.m_constraintError[srow] = newc;
                            }
                        }
                    }
                }
            }
            return 1;
        } else {
            return 0;
        }
    }

    // override the default global value of a parameter (such as ERP or CFM), optionally provide the axis (0..5).
    // If no axis is provided, it uses the default axis for this constraint.
    setParam(num: number, value: number, axis: number = -1): void {
        if ((axis >= 0) && (axis < 3)) {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    this.m_linearLimits.m_stopERP.setComponent(axis, value);
                    this.m_flags |= bt6DofFlags.BT_6DOF_FLAGS_ERP_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT);
                    break;
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    this.m_linearLimits.m_stopCFM.setComponent(axis, value);
                    this.m_flags |= bt6DofFlags.BT_6DOF_FLAGS_CFM_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT);
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                    this.m_linearLimits.m_normalCFM.setComponent(axis, value);
                    this.m_flags |= bt6DofFlags.BT_6DOF_FLAGS_CFM_NORM << (axis * BT_6DOF_FLAGS_AXIS_SHIFT);
                    break;
                default:
                    btAssert(false, "Invalid constraint parameter");
            }
        } else if ((axis >= 3) && (axis < 6)) {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    this.m_angularLimits[axis - 3].m_stopERP = value;
                    this.m_flags |= bt6DofFlags.BT_6DOF_FLAGS_ERP_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT);
                    break;
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    this.m_angularLimits[axis - 3].m_stopCFM = value;
                    this.m_flags |= bt6DofFlags.BT_6DOF_FLAGS_CFM_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT);
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                    this.m_angularLimits[axis - 3].m_normalCFM = value;
                    this.m_flags |= bt6DofFlags.BT_6DOF_FLAGS_CFM_NORM << (axis * BT_6DOF_FLAGS_AXIS_SHIFT);
                    break;
                default:
                    btAssert(false, "Invalid constraint parameter");
            }
        } else {
            btAssert(false, "Invalid axis index");
        }
    }

    // return the local value of parameter
    getParam(num: number, axis: number = -1): number {
        let retVal = 0;
        if ((axis >= 0) && (axis < 3)) {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    btAssert((this.m_flags & (bt6DofFlags.BT_6DOF_FLAGS_ERP_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT))) !== 0, "Parameter not set");
                    retVal = this.m_linearLimits.m_stopERP.getComponent(axis);
                    break;
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    btAssert((this.m_flags & (bt6DofFlags.BT_6DOF_FLAGS_CFM_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT))) !== 0, "Parameter not set");
                    retVal = this.m_linearLimits.m_stopCFM.getComponent(axis);
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                    btAssert((this.m_flags & (bt6DofFlags.BT_6DOF_FLAGS_CFM_NORM << (axis * BT_6DOF_FLAGS_AXIS_SHIFT))) !== 0, "Parameter not set");
                    retVal = this.m_linearLimits.m_normalCFM.getComponent(axis);
                    break;
                default:
                    btAssert(false, "Invalid constraint parameter");
            }
        } else if ((axis >= 3) && (axis < 6)) {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    btAssert((this.m_flags & (bt6DofFlags.BT_6DOF_FLAGS_ERP_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT))) !== 0, "Parameter not set");
                    retVal = this.m_angularLimits[axis - 3].m_stopERP;
                    break;
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    btAssert((this.m_flags & (bt6DofFlags.BT_6DOF_FLAGS_CFM_STOP << (axis * BT_6DOF_FLAGS_AXIS_SHIFT))) !== 0, "Parameter not set");
                    retVal = this.m_angularLimits[axis - 3].m_stopCFM;
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                    btAssert((this.m_flags & (bt6DofFlags.BT_6DOF_FLAGS_CFM_NORM << (axis * BT_6DOF_FLAGS_AXIS_SHIFT))) !== 0, "Parameter not set");
                    retVal = this.m_angularLimits[axis - 3].m_normalCFM;
                    break;
                default:
                    btAssert(false, "Invalid constraint parameter");
            }
        } else {
            btAssert(false, "Invalid axis index");
        }
        return retVal;
    }

    setAxis(axis1: btVector3, axis2: btVector3): void {
        const zAxis = axis1.normalized();
        const yAxis = axis2.normalized();
        const xAxis = yAxis.cross(zAxis); // we want right coordinate system

        const frameInW = new btTransform();
        frameInW.setIdentity();
        frameInW.getBasis().setValue(
            xAxis.x(), yAxis.x(), zAxis.x(),
            xAxis.y(), yAxis.y(), zAxis.y(),
            xAxis.z(), yAxis.z(), zAxis.z()
        );

        // now get constraint frame in local coordinate systems
        this.m_frameInA = this.m_rbA.getCenterOfMassTransform().inverse().multiply(frameInW);
        this.m_frameInB = this.m_rbB.getCenterOfMassTransform().inverse().multiply(frameInW);

        this.calculateTransforms();
    }

    getUseFrameOffset(): boolean {
        return this.m_useOffsetForConstraintFrame;
    }

    setUseFrameOffset(frameOffsetOnOff: boolean): void {
        this.m_useOffsetForConstraintFrame = frameOffsetOnOff;
    }

    getUseLinearReferenceFrameA(): boolean {
        return this.m_useLinearReferenceFrameA;
    }

    setUseLinearReferenceFrameA(linearReferenceFrameA: boolean): void {
        this.m_useLinearReferenceFrameA = linearReferenceFrameA;
    }

    getFlags(): number {
        return this.m_flags;
    }

    // Protected/Private helper methods
    protected setLinearLimits(info: btConstraintInfo2, row: number, transA: btTransform, transB: btTransform, linVelA: btVector3, linVelB: btVector3, angVelA: btVector3, angVelB: btVector3): number {
        // solve linear limits
        const limot = new btRotationalLimitMotor();
        for (let i = 0; i < 3; i++) {
            if (this.m_linearLimits.needApplyForce(i)) {
                // re-use rotational motor code
                limot.m_bounce = 0;
                limot.m_currentLimit = this.m_linearLimits.m_currentLimit[i];
                limot.m_currentPosition = this.m_linearLimits.m_currentLinearDiff.getComponent(i);
                limot.m_currentLimitError = this.m_linearLimits.m_currentLimitError.getComponent(i);
                limot.m_damping = this.m_linearLimits.m_damping;
                limot.m_enableMotor = this.m_linearLimits.m_enableMotor[i];
                limot.m_hiLimit = this.m_linearLimits.m_upperLimit.getComponent(i);
                limot.m_limitSoftness = this.m_linearLimits.m_limitSoftness;
                limot.m_loLimit = this.m_linearLimits.m_lowerLimit.getComponent(i);
                limot.m_maxLimitForce = 0;
                limot.m_maxMotorForce = this.m_linearLimits.m_maxMotorForce.getComponent(i);
                limot.m_targetVelocity = this.m_linearLimits.m_targetVelocity.getComponent(i);
                const axis = this.m_calculatedTransformA.getBasis().getColumn(i);
                const flags = this.m_flags >> (i * BT_6DOF_FLAGS_AXIS_SHIFT);
                limot.m_normalCFM = (flags & bt6DofFlags.BT_6DOF_FLAGS_CFM_NORM) ? this.m_linearLimits.m_normalCFM.getComponent(i) : (info.cfm ? info.cfm[0] : 0);
                limot.m_stopCFM = (flags & bt6DofFlags.BT_6DOF_FLAGS_CFM_STOP) ? this.m_linearLimits.m_stopCFM.getComponent(i) : (info.cfm ? info.cfm[0] : 0);
                limot.m_stopERP = (flags & bt6DofFlags.BT_6DOF_FLAGS_ERP_STOP) ? this.m_linearLimits.m_stopERP.getComponent(i) : info.erp;
                if (this.m_useOffsetForConstraintFrame) {
                    const indx1 = (i + 1) % 3;
                    const indx2 = (i + 2) % 3;
                    let rotAllowed = 1; // rotations around orthos to current axis
                    if (this.m_angularLimits[indx1].m_currentLimit && this.m_angularLimits[indx2].m_currentLimit) {
                        rotAllowed = 0;
                    }
                    row += this.get_limit_motor_info2(limot, transA, transB, linVelA, linVelB, angVelA, angVelB, info, row, axis, 0, rotAllowed);
                } else {
                    row += this.get_limit_motor_info2(limot, transA, transB, linVelA, linVelB, angVelA, angVelB, info, row, axis, 0);
                }
            }
        }
        return row;
    }

    protected setAngularLimits(info: btConstraintInfo2, row_offset: number, transA: btTransform, transB: btTransform, linVelA: btVector3, linVelB: btVector3, angVelA: btVector3, angVelB: btVector3): number {
        let row = row_offset;
        // solve angular limits
        for (let i = 0; i < 3; i++) {
            if (this.getRotationalLimitMotor(i).needApplyTorques()) {
                const axis = this.getAxis(i);
                const flags = this.m_flags >> ((i + 3) * BT_6DOF_FLAGS_AXIS_SHIFT);
                if (!(flags & bt6DofFlags.BT_6DOF_FLAGS_CFM_NORM)) {
                    this.m_angularLimits[i].m_normalCFM = info.cfm ? info.cfm[0] : 0;
                }
                if (!(flags & bt6DofFlags.BT_6DOF_FLAGS_CFM_STOP)) {
                    this.m_angularLimits[i].m_stopCFM = info.cfm ? info.cfm[0] : 0;
                }
                if (!(flags & bt6DofFlags.BT_6DOF_FLAGS_ERP_STOP)) {
                    this.m_angularLimits[i].m_stopERP = info.erp;
                }
                row += this.get_limit_motor_info2(this.getRotationalLimitMotor(i),
                    transA, transB, linVelA, linVelB, angVelA, angVelB, info, row, axis, 1);
            }
        }

        return row;
    }

    protected buildLinearJacobian(jacLinear: btJacobianEntry, normalWorld: btVector3, pivotAInW: btVector3, pivotBInW: btVector3): void {
        // Use placement new equivalent - reassign the object
        Object.assign(jacLinear, new btJacobianEntry(
            this.m_rbA.getCenterOfMassTransform().getBasis().transpose(),
            this.m_rbB.getCenterOfMassTransform().getBasis().transpose(),
            pivotAInW.subtract(this.m_rbA.getCenterOfMassPosition()),
            pivotBInW.subtract(this.m_rbB.getCenterOfMassPosition()),
            normalWorld,
            this.m_rbA.getInvInertiaDiagLocal(),
            this.m_rbA.getInvMass(),
            this.m_rbB.getInvInertiaDiagLocal(),
            this.m_rbB.getInvMass()
        ));
    }

    protected buildAngularJacobian(jacAngular: btJacobianEntry, jointAxisW: btVector3): void {
        // Use placement new equivalent - reassign the object
        Object.assign(jacAngular, new btJacobianEntry(
            jointAxisW,
            this.m_rbA.getCenterOfMassTransform().getBasis().transpose(),
            this.m_rbB.getCenterOfMassTransform().getBasis().transpose(),
            this.m_rbA.getInvInertiaDiagLocal(),
            this.m_rbB.getInvInertiaDiagLocal()
        ));
    }

    protected calculateLinearInfo(): void {
        this.m_calculatedLinearDiff = this.m_calculatedTransformB.getOrigin().subtract(this.m_calculatedTransformA.getOrigin());
        this.m_calculatedLinearDiff = this.m_calculatedTransformA.getBasis().inverse().multiply(this.m_calculatedLinearDiff);
        for (let i = 0; i < 3; i++) {
            this.m_linearLimits.m_currentLinearDiff.setComponent(i, this.m_calculatedLinearDiff.getComponent(i));
            this.m_linearLimits.testLimitValue(i, this.m_calculatedLinearDiff.getComponent(i));
        }
    }

    // calcs the euler angles between the two bodies.
    protected calculateAngleInfo(): void {
        const relative_frame = this.m_calculatedTransformA.getBasis().inverse().multiply(this.m_calculatedTransformB.getBasis());
        matrixToEulerXYZ(relative_frame, this.m_calculatedAxisAngleDiff);
        // in euler angle mode we do not actually constrain the angular velocity
        // along the axes axis[0] and axis[2] (although we do use axis[1]) :
        //
        //    to get			constrain w2-w1 along		...not
        //    ------			---------------------		------
        //    d(angle[0])/dt = 0	ax[1] x ax[2]			ax[0]
        //    d(angle[1])/dt = 0	ax[1]
        //    d(angle[2])/dt = 0	ax[0] x ax[1]			ax[2]
        //
        // constraining w2-w1 along an axis 'a' means that a'*(w2-w1)=0.
        // to prove the result for angle[0], write the expression for angle[0] from
        // GetInfo1 then take the derivative. to prove this for angle[2] it is
        // easier to take the euler rate expression for d(angle[2])/dt with respect
        // to the components of w and set that to 0.
        const axis0 = this.m_calculatedTransformB.getBasis().getColumn(0);
        const axis2 = this.m_calculatedTransformA.getBasis().getColumn(2);

        this.m_calculatedAxis[1] = axis2.cross(axis0);
        this.m_calculatedAxis[0] = this.m_calculatedAxis[1].cross(axis2);
        this.m_calculatedAxis[2] = axis0.cross(this.m_calculatedAxis[1]);

        this.m_calculatedAxis[0].normalize();
        this.m_calculatedAxis[1].normalize();
        this.m_calculatedAxis[2].normalize();
    }
}