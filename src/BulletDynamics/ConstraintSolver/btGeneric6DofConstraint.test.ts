/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Test suite for btGeneric6DofConstraint

Original Copyright (c) 2003-2006 Erwin Coumans  http://bulletphysics.org

This test suite is part of the TypeScript port of the original Bullet Physics Engine.
*/

import { describe, it, expect, beforeEach } from '@jest/globals';
import { btGeneric6DofConstraint, btRotationalLimitMotor, btTranslationalLimitMotor } from './btGeneric6DofConstraint';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btMatrix3x3 } from '../../LinearMath/btMatrix3x3';
import { btQuaternion } from '../../LinearMath/btQuaternion';
import { SIMD_PI, SIMD_HALF_PI } from '../../LinearMath/btScalar';
import { btJacobianEntry } from './btJacobianEntry';
import { btAdjustAngleToLimits, matrixToEulerXYZ } from './btTypedConstraint';

// Mock btRigidBody for testing
class MockRigidBody {
    private transform = new btTransform();
    private linearVelocity = new btVector3();
    private angularVelocity = new btVector3();
    private invMass = 1.0;
    private invInertia = new btVector3(1, 1, 1);

    constructor(mass: number = 1.0) {
        this.invMass = mass > 0 ? 1.0 / mass : 0;
        this.transform.setIdentity();
    }

    getCenterOfMassTransform(): btTransform {
        return this.transform;
    }

    getCenterOfMassPosition(): btVector3 {
        return this.transform.getOrigin();
    }

    getLinearVelocity(): btVector3 {
        return this.linearVelocity;
    }

    getAngularVelocity(): btVector3 {
        return this.angularVelocity;
    }

    getInvMass(): number {
        return this.invMass;
    }

    getInvInertiaDiagLocal(): btVector3 {
        return this.invInertia;
    }

    applyImpulse(impulse: btVector3, _relPos: btVector3): void {
        // Mock implementation for testing
        this.linearVelocity.addAssign(impulse.multiply(this.invMass));
    }

    applyTorqueImpulse(torque: btVector3): void {
        // Mock implementation for testing
        this.angularVelocity.addAssign(torque.multiply(this.invInertia));
    }

    getVelocityInLocalPoint(relPos: btVector3): btVector3 {
        // Mock implementation - simplified
        return this.linearVelocity.add(this.angularVelocity.cross(relPos));
    }

    setPosition(pos: btVector3): void {
        this.transform.getOrigin().copy(pos);
    }

    setOrientation(quat: btQuaternion): void {
        this.transform.getBasis().setRotation(quat);
    }
}

describe('btJacobianEntry', () => {
    it('should create a default jacobian entry', () => {
        const jacobian = new btJacobianEntry();
        expect(jacobian.m_Adiag).toBe(0);
        expect(jacobian.m_linearJointAxis).toBeInstanceOf(btVector3);
    });

    it('should create jacobian entry for two-body constraint', () => {
        const world2A = new btMatrix3x3();
        const world2B = new btMatrix3x3();
        world2A.setIdentity();
        world2B.setIdentity();

        const rel_pos1 = new btVector3(1, 0, 0);
        const rel_pos2 = new btVector3(-1, 0, 0);
        const jointAxis = new btVector3(0, 0, 1);
        const inertiaInvA = new btVector3(1, 1, 1);
        const inertiaInvB = new btVector3(1, 1, 1);

        const jacobian = new btJacobianEntry(
            world2A, world2B,
            rel_pos1, rel_pos2,
            jointAxis,
            inertiaInvA, 1.0,
            inertiaInvB, 1.0
        );

        expect(jacobian.m_Adiag).toBeGreaterThan(0);
        expect(jacobian.m_linearJointAxis.equals(jointAxis)).toBe(true);
    });

    it('should calculate diagonal value correctly', () => {
        const jacobian = new btJacobianEntry();
        jacobian.m_Adiag = 5.0;
        expect(jacobian.getDiagonal()).toBe(5.0);
    });
});

describe('btRotationalLimitMotor', () => {
    let motor: btRotationalLimitMotor;

    beforeEach(() => {
        motor = new btRotationalLimitMotor();
    });

    it('should create with default values', () => {
        expect(motor.m_loLimit).toBe(1.0);
        expect(motor.m_hiLimit).toBe(-1.0);
        expect(motor.m_targetVelocity).toBe(0);
        expect(motor.m_maxMotorForce).toBe(6.0);
        expect(motor.m_maxLimitForce).toBe(300.0);
        expect(motor.m_enableMotor).toBe(false);
    });

    it('should detect when not limited', () => {
        // Default values make it unlimited
        expect(motor.isLimited()).toBe(false);
    });

    it('should detect when limited', () => {
        motor.m_loLimit = -SIMD_HALF_PI;
        motor.m_hiLimit = SIMD_HALF_PI;
        expect(motor.isLimited()).toBe(true);
    });

    it('should test limit values correctly', () => {
        motor.m_loLimit = -1.0;
        motor.m_hiLimit = 1.0;

        // Test below lower limit
        const result1 = motor.testLimitValue(-1.5);
        expect(result1).toBe(1); // low limit violation
        expect(motor.m_currentLimit).toBe(1);

        // Test above upper limit
        const result2 = motor.testLimitValue(1.5);
        expect(result2).toBe(2); // high limit violation
        expect(motor.m_currentLimit).toBe(2);

        // Test within limits
        const result3 = motor.testLimitValue(0.5);
        expect(result3).toBe(0); // free from violation
        expect(motor.m_currentLimit).toBe(0);
    });

    it('should copy constructor work correctly', () => {
        motor.m_targetVelocity = 5.0;
        motor.m_enableMotor = true;
        motor.m_loLimit = -2.0;
        motor.m_hiLimit = 2.0;

        const motorCopy = new btRotationalLimitMotor(motor);
        expect(motorCopy.m_targetVelocity).toBe(5.0);
        expect(motorCopy.m_enableMotor).toBe(true);
        expect(motorCopy.m_loLimit).toBe(-2.0);
        expect(motorCopy.m_hiLimit).toBe(2.0);
    });
});

describe('btTranslationalLimitMotor', () => {
    let motor: btTranslationalLimitMotor;

    beforeEach(() => {
        motor = new btTranslationalLimitMotor();
    });

    it('should create with default values', () => {
        expect(motor.m_lowerLimit.length()).toBe(0);
        expect(motor.m_upperLimit.length()).toBe(0);
        expect(motor.m_limitSoftness).toBe(0.7);
        expect(motor.m_damping).toBe(1.0);
        expect(motor.m_restitution).toBe(0.5);
    });

    it('should test if axis is limited', () => {
        // Default values should be unlimited
        expect(motor.isLimited(0)).toBe(true); // 0 >= 0

        motor.m_lowerLimit.setValue(0, -1, 0);
        motor.m_upperLimit.setValue(1, -1, 0);

        expect(motor.isLimited(0)).toBe(true); // upper >= lower
        expect(motor.isLimited(1)).toBe(false); // upper < lower (unlimited)
    });

    it('should test limit values correctly', () => {
        motor.m_lowerLimit.setValue(-1, 0, 0);
        motor.m_upperLimit.setValue(1, 0, 0);

        // Test below lower limit
        const result1 = motor.testLimitValue(0, -1.5);
        expect(result1).toBe(2); // low limit violation
        expect(motor.m_currentLimit[0]).toBe(2);

        // Test above upper limit
        const result2 = motor.testLimitValue(0, 1.5);
        expect(result2).toBe(1); // high limit violation
        expect(motor.m_currentLimit[0]).toBe(1);

        // Test within limits
        const result3 = motor.testLimitValue(0, 0.5);
        expect(result3).toBe(0); // free from violation
        expect(motor.m_currentLimit[0]).toBe(0);
    });
});

describe('btGeneric6DofConstraint', () => {
    let bodyA: MockRigidBody;
    let bodyB: MockRigidBody;
    let frameInA: btTransform;
    let frameInB: btTransform;
    let constraint: btGeneric6DofConstraint;

    beforeEach(() => {
        bodyA = new MockRigidBody(1.0);
        bodyB = new MockRigidBody(1.0);

        frameInA = new btTransform();
        frameInA.setIdentity();
        frameInB = new btTransform();
        frameInB.setIdentity();
        frameInB.getOrigin().setValue(2, 0, 0);

        constraint = new btGeneric6DofConstraint(bodyA, bodyB, frameInA, frameInB, true);
    });

    it('should create constraint with correct type', () => {
        expect(constraint).toBeInstanceOf(btGeneric6DofConstraint);
        expect(constraint.getRigidBodyA()).toBe(bodyA);
        expect(constraint.getRigidBodyB()).toBe(bodyB);
    });

    it('should have properly initialized limit motors', () => {
        const rotMotor = constraint.getRotationalLimitMotor(0);
        expect(rotMotor).toBeInstanceOf(btRotationalLimitMotor);
        expect(rotMotor.m_loLimit).toBe(1.0);
        expect(rotMotor.m_hiLimit).toBe(-1.0);

        const transMotor = constraint.getTranslationalLimitMotor();
        expect(transMotor).toBeInstanceOf(btTranslationalLimitMotor);
    });

    it('should set and get linear limits correctly', () => {
        const lowerLimit = new btVector3(-1, -2, -3);
        const upperLimit = new btVector3(1, 2, 3);

        constraint.setLinearLowerLimit(lowerLimit);
        constraint.setLinearUpperLimit(upperLimit);

        const retrievedLower = new btVector3();
        const retrievedUpper = new btVector3();
        constraint.getLinearLowerLimit(retrievedLower);
        constraint.getLinearUpperLimit(retrievedUpper);

        expect(retrievedLower.equals(lowerLimit)).toBe(true);
        expect(retrievedUpper.equals(upperLimit)).toBe(true);
    });

    it('should set and get angular limits correctly', () => {
        const lowerLimit = new btVector3(-SIMD_HALF_PI, -SIMD_HALF_PI, -SIMD_PI);
        const upperLimit = new btVector3(SIMD_HALF_PI, SIMD_HALF_PI, SIMD_PI);

        constraint.setAngularLowerLimit(lowerLimit);
        constraint.setAngularUpperLimit(upperLimit);

        const retrievedLower = new btVector3();
        const retrievedUpper = new btVector3();
        constraint.getAngularLowerLimit(retrievedLower);
        constraint.getAngularUpperLimit(retrievedUpper);

        // Angular limits are normalized, so test within tolerance
        expect(Math.abs(retrievedLower.x() - lowerLimit.x())).toBeLessThan(0.01);
        expect(Math.abs(retrievedUpper.x() - upperLimit.x())).toBeLessThan(0.01);
    });

    it('should set limits using setLimit method', () => {
        // Test linear limit (axis 0)
        constraint.setLimit(0, -5, 5);
        expect(constraint.getTranslationalLimitMotor().m_lowerLimit.x()).toBe(-5);
        expect(constraint.getTranslationalLimitMotor().m_upperLimit.x()).toBe(5);

        // Test angular limit (axis 3 = first angular axis)
        constraint.setLimit(3, -1, 1);
        expect(constraint.getRotationalLimitMotor(0).m_loLimit).toBeCloseTo(-1, 5);
        expect(constraint.getRotationalLimitMotor(0).m_hiLimit).toBeCloseTo(1, 5);
    });

    it('should detect limited axes correctly', () => {
        // Initially, default limits should make axes unlimited for rotational
        expect(constraint.isLimited(3)).toBe(false); // Angular axis 0

        // Set proper limits
        constraint.setLimit(3, -1, 1);
        expect(constraint.isLimited(3)).toBe(true);

        // Test linear axis
        constraint.setLimit(0, -1, 1);
        expect(constraint.isLimited(0)).toBe(true);
    });

    it('should calculate transforms correctly', () => {
        bodyA.setPosition(new btVector3(0, 0, 0));
        bodyB.setPosition(new btVector3(5, 0, 0));

        constraint.calculateTransforms();

        const transformA = constraint.getCalculatedTransformA();
        const transformB = constraint.getCalculatedTransformB();

        expect(transformA).toBeInstanceOf(btTransform);
        expect(transformB).toBeInstanceOf(btTransform);
    });

    it('should handle frame offset settings', () => {
        expect(constraint.getUseFrameOffset()).toBe(true); // D6_USE_FRAME_OFFSET is true

        constraint.setUseFrameOffset(false);
        expect(constraint.getUseFrameOffset()).toBe(false);
    });

    it('should handle linear reference frame settings', () => {
        expect(constraint.getUseLinearReferenceFrameA()).toBe(true);

        constraint.setUseLinearReferenceFrameA(false);
        expect(constraint.getUseLinearReferenceFrameA()).toBe(false);
    });
});

describe('Utility functions', () => {
    it('should adjust angles to limits correctly', () => {
        const angle = btAdjustAngleToLimits(SIMD_PI + 0.1, -SIMD_PI, SIMD_PI);
        expect(Math.abs(angle - (-SIMD_PI + 0.1))).toBeLessThan(0.01);

        const angle2 = btAdjustAngleToLimits(-SIMD_PI - 0.1, -SIMD_PI, SIMD_PI);
        expect(Math.abs(angle2 - (SIMD_PI - 0.1))).toBeLessThan(0.01);
    });

    it('should convert matrix to euler XYZ', () => {
        const matrix = new btMatrix3x3();
        matrix.setIdentity();

        const xyz = new btVector3();
        const result = matrixToEulerXYZ(matrix, xyz);

        expect(result).toBe(true);
        expect(xyz.length()).toBeLessThan(0.01); // Should be close to zero for identity matrix
    });
});