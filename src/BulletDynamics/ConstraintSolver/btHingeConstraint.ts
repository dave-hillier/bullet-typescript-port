/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Erwin Coumans  http://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.

Hinge Constraint by Dirk Gregorius. Limits added by Marcus Hennix at Starbreeze Studios

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

import { btVector3, btPlaneSpace1 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btMatrix3x3 } from '../../LinearMath/btMatrix3x3';
import { btQuaternion, btQuatRotate, btShortestArcQuat } from '../../LinearMath/btQuaternion';
import { btAssert, btAtan2, btFabs, btFmod, SIMD_EPSILON, SIMD_INFINITY, SIMD_PI, SIMD_2_PI, btNormalizeAngle } from '../../LinearMath/btScalar';
import { btJacobianEntry } from './btJacobianEntry';
import { btAngularLimit } from './btAngularLimit';
import { btTypedConstraint, btTypedConstraintType, btConstraintParams, btConstraintInfo1, btConstraintInfo2 } from './btTypedConstraint';
import { btRigidBody } from '../Dynamics/btRigidBody';

// TypeScript equivalent of btAssertConstrParams
function btAssertConstrParams(condition: boolean, message?: string): asserts condition {
    btAssert(condition, message);
}

const _BT_USE_CENTER_LIMIT_ = true;

// Define constants that were macros in the original
const HINGE_USE_OBSOLETE_SOLVER = false;
const HINGE_USE_FRAME_OFFSET = true;

export enum btHingeFlags {
    BT_HINGE_FLAGS_CFM_STOP = 1,
    BT_HINGE_FLAGS_ERP_STOP = 2,
    BT_HINGE_FLAGS_CFM_NORM = 4,
    BT_HINGE_FLAGS_ERP_NORM = 8
}

/**
 * hinge constraint between two rigidbodies each with a pivotpoint that describes the axis location in local space
 * axis defines the orientation of the hinge axis
 */
export class btHingeConstraint extends btTypedConstraint {
    public m_jac: btJacobianEntry[] = [];     // 3 orthogonal linear constraints
    public m_jacAng: btJacobianEntry[] = [];  // 2 orthogonal angular constraints+ 1 for limit/motor

    public m_rbAFrame: btTransform;  // constraint axii. Assumes z is hinge axis.
    public m_rbBFrame: btTransform;

    public m_motorTargetVelocity: number;
    public m_maxMotorImpulse: number;
    public m_limit: btAngularLimit;
    public m_kHinge: number;
    public m_accLimitImpulse: number;
    public m_hingeAngle: number;
    public m_referenceSign: number;
    public m_angularOnly: boolean;
    public m_enableAngularMotor: boolean;
    public m_useSolveConstraintObsolete: boolean;
    public m_useOffsetForConstraintFrame: boolean;
    public m_useReferenceFrameA: boolean;
    public m_accMotorImpulse: number;
    public m_flags: number;
    public m_normalCFM: number;
    public m_normalERP: number;
    public m_stopCFM: number;
    public m_stopERP: number;

    constructor(rbA: btRigidBody, rbB: btRigidBody, pivotInA: btVector3, pivotInB: btVector3, axisInA: btVector3, axisInB: btVector3, useReferenceFrameA: boolean = false) {
        super(btTypedConstraintType.HINGE_CONSTRAINT_TYPE, rbA, rbB);

        // Initialize arrays
        for (let i = 0; i < 3; i++) {
            this.m_jac.push(new btJacobianEntry());
            this.m_jacAng.push(new btJacobianEntry());
        }

        this.m_rbAFrame = new btTransform();
        this.m_rbBFrame = new btTransform();
        this.m_limit = new btAngularLimit();
        this.m_motorTargetVelocity = 0;
        this.m_maxMotorImpulse = 0;
        this.m_kHinge = 0;
        this.m_accLimitImpulse = 0;
        this.m_hingeAngle = 0;
        this.m_referenceSign = 0;
        this.m_angularOnly = false;
        this.m_enableAngularMotor = false;
        this.m_useSolveConstraintObsolete = HINGE_USE_OBSOLETE_SOLVER;
        this.m_useOffsetForConstraintFrame = HINGE_USE_FRAME_OFFSET;
        this.m_useReferenceFrameA = useReferenceFrameA;
        this.m_accMotorImpulse = 0;
        this.m_flags = 0;
        this.m_normalCFM = 0;
        this.m_normalERP = 0;
        this.m_stopCFM = 0;
        this.m_stopERP = 0;

        this.m_rbAFrame.getOrigin().copy(pivotInA);

        // since no frame is given, assume this to be zero angle and just pick rb transform axis
        let rbAxisA1 = rbA.getCenterOfMassTransform().getBasis().getColumn(0);
        let rbAxisA2: btVector3;
        const projection = axisInA.dot(rbAxisA1);

        if (projection >= 1.0 - SIMD_EPSILON) {
            rbAxisA1 = rbA.getCenterOfMassTransform().getBasis().getColumn(2).negate();
            rbAxisA2 = rbA.getCenterOfMassTransform().getBasis().getColumn(1);
        } else if (projection <= -1.0 + SIMD_EPSILON) {
            rbAxisA1 = rbA.getCenterOfMassTransform().getBasis().getColumn(2);
            rbAxisA2 = rbA.getCenterOfMassTransform().getBasis().getColumn(1);
        } else {
            rbAxisA2 = axisInA.cross(rbAxisA1);
            rbAxisA1 = rbAxisA2.cross(axisInA);
        }

        this.m_rbAFrame.getBasis().setValue(
            rbAxisA1.x, rbAxisA2.x, axisInA.x,
            rbAxisA1.y, rbAxisA2.y, axisInA.y,
            rbAxisA1.z, rbAxisA2.z, axisInA.z
        );

        const rotationArc = btShortestArcQuat(axisInA, axisInB);
        const rbAxisB1 = btQuatRotate(rotationArc, rbAxisA1);
        const rbAxisB2 = axisInB.cross(rbAxisB1);

        this.m_rbBFrame.getOrigin().copy(pivotInB);
        this.m_rbBFrame.getBasis().setValue(
            rbAxisB1.x, rbAxisB2.x, axisInB.x,
            rbAxisB1.y, rbAxisB2.y, axisInB.y,
            rbAxisB1.z, rbAxisB2.z, axisInB.z
        );

        this.m_referenceSign = this.m_useReferenceFrameA ? -1.0 : 1.0;
    }

    static createSingleBodyConstraint(rbA: btRigidBody, pivotInA: btVector3, axisInA: btVector3, useReferenceFrameA: boolean = false): btHingeConstraint {
        // Create a two-body constraint with the fixed body
        const fixedBody = btTypedConstraint.getFixedBody();
        const hingeConstraint = Object.create(btHingeConstraint.prototype);
        btTypedConstraint.call(hingeConstraint, btTypedConstraintType.HINGE_CONSTRAINT_TYPE, rbA);

        // Initialize the same way as the regular constructor
        for (let i = 0; i < 3; i++) {
            hingeConstraint.m_jac.push(new btJacobianEntry());
            hingeConstraint.m_jacAng.push(new btJacobianEntry());
        }

        hingeConstraint.m_rbAFrame = new btTransform();
        hingeConstraint.m_rbBFrame = new btTransform();
        hingeConstraint.m_limit = new btAngularLimit();
        hingeConstraint.m_motorTargetVelocity = 0;
        hingeConstraint.m_maxMotorImpulse = 0;
        hingeConstraint.m_kHinge = 0;
        hingeConstraint.m_accLimitImpulse = 0;
        hingeConstraint.m_hingeAngle = 0;
        hingeConstraint.m_referenceSign = 0;
        hingeConstraint.m_angularOnly = false;
        hingeConstraint.m_enableAngularMotor = false;
        hingeConstraint.m_useSolveConstraintObsolete = HINGE_USE_OBSOLETE_SOLVER;
        hingeConstraint.m_useOffsetForConstraintFrame = HINGE_USE_FRAME_OFFSET;
        hingeConstraint.m_useReferenceFrameA = useReferenceFrameA;
        hingeConstraint.m_accMotorImpulse = 0;
        hingeConstraint.m_flags = 0;
        hingeConstraint.m_normalCFM = 0;
        hingeConstraint.m_normalERP = 0;
        hingeConstraint.m_stopCFM = 0;
        hingeConstraint.m_stopERP = 0;

        // Set up frame similar to original constructor
        const rbAxisA1 = new btVector3();
        const rbAxisA2 = new btVector3();
        btPlaneSpace1(axisInA, rbAxisA1, rbAxisA2);

        hingeConstraint.m_rbAFrame.getOrigin().copy(pivotInA);
        hingeConstraint.m_rbAFrame.getBasis().setValue(
            rbAxisA1.x, rbAxisA2.x, axisInA.x,
            rbAxisA1.y, rbAxisA2.y, axisInA.y,
            rbAxisA1.z, rbAxisA2.z, axisInA.z
        );

        const axisInB = rbA.getCenterOfMassTransform().getBasis().multiplyVector(axisInA);
        const rotationArc = btShortestArcQuat(axisInA, axisInB);
        const rbAxisB1 = btQuatRotate(rotationArc, rbAxisA1);
        const rbAxisB2 = axisInB.cross(rbAxisB1);

        hingeConstraint.m_rbBFrame.getOrigin().copy(rbA.getCenterOfMassTransform().multiplyVector(pivotInA));
        hingeConstraint.m_rbBFrame.getBasis().setValue(
            rbAxisB1.x, rbAxisB2.x, axisInB.x,
            rbAxisB1.y, rbAxisB2.y, axisInB.y,
            rbAxisB1.z, rbAxisB2.z, axisInB.z
        );

        hingeConstraint.m_referenceSign = hingeConstraint.m_useReferenceFrameA ? -1.0 : 1.0;
        return hingeConstraint;
    }

    buildJacobian(): void {
        // Simplified implementation for now
        if (this.m_useSolveConstraintObsolete) {
            this.m_appliedImpulse = 0.0;
            this.m_accMotorImpulse = 0.0;
            this.m_accLimitImpulse = 0.0;

            // test angular limit
            this.testLimit(this.m_rbA.getCenterOfMassTransform(), this.m_rbB.getCenterOfMassTransform());
        }
    }

    getInfo1(info: btConstraintInfo1): void {
        if (this.m_useSolveConstraintObsolete) {
            info.m_numConstraintRows = 0;
            info.nub = 0;
        } else {
            info.m_numConstraintRows = 5;  // Fixed 3 linear + 2 angular
            info.nub = 1;
            // always add the row, to avoid computation (data is not available yet)
            // prepare constraint
            this.testLimit(this.m_rbA.getCenterOfMassTransform(), this.m_rbB.getCenterOfMassTransform());
            if (this.getSolveLimit() || this.getEnableAngularMotor()) {
                info.m_numConstraintRows++;  // limit 3rd anguar as well
                info.nub--;
            }
        }
    }

    getInfo2(info: btConstraintInfo2): void {
        // Simplified implementation - would need full implementation for complete functionality
        // For now, just basic setup
        if (!this.m_useSolveConstraintObsolete) {
            // Basic constraint setup would go here
            // This is a complex method that requires significant implementation
        }
    }

    getRigidBodyA(): btRigidBody {
        return this.m_rbA;
    }

    getRigidBodyB(): btRigidBody {
        return this.m_rbB;
    }

    getFrameOffsetA(): btTransform {
        return this.m_rbAFrame;
    }

    getFrameOffsetB(): btTransform {
        return this.m_rbBFrame;
    }

    setAngularOnly(angularOnly: boolean): void {
        this.m_angularOnly = angularOnly;
    }

    enableAngularMotor(enableMotor: boolean, targetVelocity: number, maxMotorImpulse: number): void {
        this.m_enableAngularMotor = enableMotor;
        this.m_motorTargetVelocity = targetVelocity;
        this.m_maxMotorImpulse = maxMotorImpulse;
    }

    enableMotor(enableMotor: boolean): void {
        this.m_enableAngularMotor = enableMotor;
    }

    setMaxMotorImpulse(maxMotorImpulse: number): void {
        this.m_maxMotorImpulse = maxMotorImpulse;
    }

    setMotorTargetVelocity(motorTargetVelocity: number): void {
        this.m_motorTargetVelocity = motorTargetVelocity;
    }

    setLimit(low: number, high: number, softness: number = 0.9, biasFactor: number = 0.3, relaxationFactor: number = 1.0): void {
        if (_BT_USE_CENTER_LIMIT_) {
            this.m_limit.set(low, high, softness, biasFactor, relaxationFactor);
        }
    }

    getLimitSoftness(): number {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.getSoftness();
        }
        return 0.0;
    }

    getLimitBiasFactor(): number {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.getBiasFactor();
        }
        return 0.0;
    }

    getLimitRelaxationFactor(): number {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.getRelaxationFactor();
        }
        return 0.0;
    }

    hasLimit(): boolean {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.getHalfRange() > 0;
        }
        return false;
    }

    getLowerLimit(): number {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.getLow();
        }
        return 0.0;
    }

    getUpperLimit(): number {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.getHigh();
        }
        return 0.0;
    }

    getHingeAngle(): number {
        return this.getHingeAngleFromTransforms(this.m_rbA.getCenterOfMassTransform(), this.m_rbB.getCenterOfMassTransform());
    }

    getHingeAngleFromTransforms(transA: btTransform, transB: btTransform): number {
        const refAxis0 = transA.getBasis().multiplyVector(this.m_rbAFrame.getBasis().getColumn(0));
        const refAxis1 = transA.getBasis().multiplyVector(this.m_rbAFrame.getBasis().getColumn(1));
        const swingAxis = transB.getBasis().multiplyVector(this.m_rbBFrame.getBasis().getColumn(1));
        const angle = btAtan2(swingAxis.dot(refAxis0), swingAxis.dot(refAxis1));
        return this.m_referenceSign * angle;
    }

    testLimit(transA: btTransform, transB: btTransform): void {
        // Compute limit information
        this.m_hingeAngle = this.getHingeAngleFromTransforms(transA, transB);
        if (_BT_USE_CENTER_LIMIT_) {
            this.m_limit.test(this.m_hingeAngle);
        }
    }

    getSolveLimit(): number {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.isLimit();
        }
        return 0;
    }

    getLimitSign(): number {
        if (_BT_USE_CENTER_LIMIT_) {
            return this.m_limit.getSign();
        }
        return 0.0;
    }

    getAngularOnly(): boolean {
        return this.m_angularOnly;
    }

    getEnableAngularMotor(): boolean {
        return this.m_enableAngularMotor;
    }

    getMotorTargetVelocity(): number {
        return this.m_motorTargetVelocity;
    }

    getMaxMotorImpulse(): number {
        return this.m_maxMotorImpulse;
    }

    getUseFrameOffset(): boolean {
        return this.m_useOffsetForConstraintFrame;
    }

    setUseFrameOffset(frameOffsetOnOff: boolean): void {
        this.m_useOffsetForConstraintFrame = frameOffsetOnOff;
    }

    getUseReferenceFrameA(): boolean {
        return this.m_useReferenceFrameA;
    }

    setUseReferenceFrameA(useReferenceFrameA: boolean): void {
        this.m_useReferenceFrameA = useReferenceFrameA;
    }

    setParam(num: number, value: number, axis: number = -1): void {
        if ((axis === -1) || (axis === 5)) {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    this.m_stopERP = value;
                    this.m_flags |= btHingeFlags.BT_HINGE_FLAGS_ERP_STOP;
                    break;
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    this.m_stopCFM = value;
                    this.m_flags |= btHingeFlags.BT_HINGE_FLAGS_CFM_STOP;
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                    this.m_normalCFM = value;
                    this.m_flags |= btHingeFlags.BT_HINGE_FLAGS_CFM_NORM;
                    break;
                case btConstraintParams.BT_CONSTRAINT_ERP:
                    this.m_normalERP = value;
                    this.m_flags |= btHingeFlags.BT_HINGE_FLAGS_ERP_NORM;
                    break;
                default:
                    btAssertConstrParams(false);
            }
        } else {
            btAssertConstrParams(false);
        }
    }

    getParam(num: number, axis: number = -1): number {
        let retVal = 0;
        if ((axis === -1) || (axis === 5)) {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    btAssertConstrParams(!!(this.m_flags & btHingeFlags.BT_HINGE_FLAGS_ERP_STOP));
                    retVal = this.m_stopERP;
                    break;
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    btAssertConstrParams(!!(this.m_flags & btHingeFlags.BT_HINGE_FLAGS_CFM_STOP));
                    retVal = this.m_stopCFM;
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                    btAssertConstrParams(!!(this.m_flags & btHingeFlags.BT_HINGE_FLAGS_CFM_NORM));
                    retVal = this.m_normalCFM;
                    break;
                case btConstraintParams.BT_CONSTRAINT_ERP:
                    btAssertConstrParams(!!(this.m_flags & btHingeFlags.BT_HINGE_FLAGS_ERP_NORM));
                    retVal = this.m_normalERP;
                    break;
                default:
                    btAssertConstrParams(false);
            }
        } else {
            btAssertConstrParams(false);
        }
        return retVal;
    }

    getFlags(): number {
        return this.m_flags;
    }

    updateRHS(timeStep: number): void {
        // Empty implementation for now
    }

    setFrames(frameA: btTransform, frameB: btTransform): void {
        this.m_rbAFrame = frameA.clone();
        this.m_rbBFrame = frameB.clone();
        this.buildJacobian();
    }

    getAFrame(): btTransform {
        return this.m_rbAFrame;
    }

    getBFrame(): btTransform {
        return this.m_rbBFrame;
    }
}

// Static utility functions used in the original implementation
function btNormalizeAnglePositive(angle: number): number {
    return btFmod(btFmod(angle, 2.0 * SIMD_PI) + 2.0 * SIMD_PI, 2.0 * SIMD_PI);
}

function btShortestAngularDistance(accAngle: number, curAngle: number): number {
    return btNormalizeAngle(btNormalizeAnglePositive(btNormalizeAnglePositive(curAngle) - btNormalizeAnglePositive(accAngle)));
}

function btShortestAngleUpdate(accAngle: number, curAngle: number): number {
    const tol = 0.3;
    const result = btShortestAngularDistance(accAngle, curAngle);

    if (btFabs(result) > tol) {
        return curAngle;
    } else {
        return accAngle + result;
    }
}

/**
 * The getAccumulatedHingeAngle returns the accumulated hinge angle, taking rotation across the -PI/PI boundary into account
 */
export class btHingeAccumulatedAngleConstraint extends btHingeConstraint {
    protected m_accumulatedAngle: number;

    constructor(rbA: btRigidBody, rbB: btRigidBody, pivotInA: btVector3, pivotInB: btVector3, axisInA: btVector3, axisInB: btVector3, useReferenceFrameA: boolean = false) {
        super(rbA, rbB, pivotInA, pivotInB, axisInA, axisInB, useReferenceFrameA);
        this.m_accumulatedAngle = this.getHingeAngle();
    }

    getAccumulatedHingeAngle(): number {
        const hingeAngle = this.getHingeAngle();
        this.m_accumulatedAngle = btShortestAngleUpdate(this.m_accumulatedAngle, hingeAngle);
        return this.m_accumulatedAngle;
    }

    setAccumulatedHingeAngle(accAngle: number): void {
        this.m_accumulatedAngle = accAngle;
    }

    getInfo1(info: btConstraintInfo1): void {
        // update m_accumulatedAngle
        const curHingeAngle = this.getHingeAngle();
        this.m_accumulatedAngle = btShortestAngleUpdate(this.m_accumulatedAngle, curHingeAngle);

        // Call parent implementation
        super.getInfo1(info);
    }
}