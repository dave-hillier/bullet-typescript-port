/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine

Test file for btPoint2PointConstraint - verifies basic functionality.
*/

import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btPoint2PointConstraint, btConstraintSetting } from './btPoint2PointConstraint';
import { btConstraintInfo1, btConstraintInfo2 } from './btTypedConstraint';
import { btRigidBody } from '../Dynamics/btRigidBody';

describe('btPoint2PointConstraint', () => {
    let rbA: btRigidBody;
    let rbB: btRigidBody;
    let pivotInA: btVector3;
    let pivotInB: btVector3;

    beforeEach(() => {
        // Create mock rigid bodies for testing
        rbA = {} as btRigidBody;
        rbB = {} as btRigidBody;

        // Mock required methods
        rbA.getCenterOfMassTransform = () => new btTransform();
        rbA.getCenterOfMassPosition = () => new btVector3(0, 0, 0);
        rbA.getInvInertiaDiagLocal = () => new btVector3(1, 1, 1);
        rbA.getInvMass = () => 1.0;

        rbB.getCenterOfMassTransform = () => new btTransform();
        rbB.getCenterOfMassPosition = () => new btVector3(1, 0, 0);
        rbB.getInvInertiaDiagLocal = () => new btVector3(1, 1, 1);
        rbB.getInvMass = () => 1.0;

        pivotInA = new btVector3(0.5, 0, 0);
        pivotInB = new btVector3(-0.5, 0, 0);
    });

    test('should create two-body constraint', () => {
        const constraint = new btPoint2PointConstraint(rbA, rbB, pivotInA, pivotInB);

        expect(constraint).toBeInstanceOf(btPoint2PointConstraint);
        expect(constraint.getPivotInA()).toEqual(pivotInA);
        expect(constraint.getPivotInB()).toEqual(pivotInB);
        expect(constraint.getFlags()).toBe(0);
    });

    test('should create single-body constraint', () => {
        const constraint = new btPoint2PointConstraint(rbA, pivotInA);

        expect(constraint).toBeInstanceOf(btPoint2PointConstraint);
        expect(constraint.getPivotInA()).toEqual(pivotInA);
        expect(constraint.getFlags()).toBe(0);
    });

    test('should set and get pivot points', () => {
        const constraint = new btPoint2PointConstraint(rbA, rbB, pivotInA, pivotInB);

        const newPivotA = new btVector3(1, 1, 1);
        const newPivotB = new btVector3(-1, -1, -1);

        constraint.setPivotA(newPivotA);
        constraint.setPivotB(newPivotB);

        expect(constraint.getPivotInA()).toEqual(newPivotA);
        expect(constraint.getPivotInB()).toEqual(newPivotB);
    });

    test('should build jacobian without errors', () => {
        const constraint = new btPoint2PointConstraint(rbA, rbB, pivotInA, pivotInB);

        expect(() => {
            constraint.buildJacobian();
        }).not.toThrow();

        expect(constraint.m_jac).toHaveLength(3);
    });

    test('should get constraint info', () => {
        const constraint = new btPoint2PointConstraint(rbA, rbB, pivotInA, pivotInB);
        const info = new btConstraintInfo1();

        constraint.getInfo1(info);

        expect(info.m_numConstraintRows).toBe(3);
        expect(info.nub).toBe(3);
    });

    test('should handle constraint settings', () => {
        const constraint = new btPoint2PointConstraint(rbA, rbB, pivotInA, pivotInB);

        expect(constraint.m_setting).toBeInstanceOf(btConstraintSetting);
        expect(constraint.m_setting.m_tau).toBe(0.3);
        expect(constraint.m_setting.m_damping).toBe(1.0);
        expect(constraint.m_setting.m_impulseClamp).toBe(0.0);
    });

    test('should handle update RHS call', () => {
        const constraint = new btPoint2PointConstraint(rbA, rbB, pivotInA, pivotInB);

        expect(() => {
            constraint.updateRHS(1.0 / 60.0);
        }).not.toThrow();
    });

    test('should handle parameter setting and getting', () => {
        const constraint = new btPoint2PointConstraint(rbA, rbB, pivotInA, pivotInB);

        // These should not throw for valid parameter types
        expect(() => {
            constraint.setParam(1, 0.5); // BT_CONSTRAINT_ERP = 1
            constraint.setParam(3, 0.1); // BT_CONSTRAINT_CFM = 3
        }).not.toThrow();

        // Test getting parameters
        const erpValue = constraint.getParam(1); // BT_CONSTRAINT_ERP
        const cfmValue = constraint.getParam(3); // BT_CONSTRAINT_CFM

        expect(typeof erpValue).toBe('number');
        expect(typeof cfmValue).toBe('number');
    });
});