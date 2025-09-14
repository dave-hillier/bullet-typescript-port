/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org

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
import { btTransform } from '../../LinearMath/btTransform';
import { btAssert, SIMD_INFINITY } from '../../LinearMath/btScalar';
import { btJacobianEntry } from './btJacobianEntry';
import { btTypedConstraint, btTypedConstraintType, btConstraintParams, btConstraintInfo1, btConstraintInfo2 } from './btTypedConstraint';
import { btRigidBody } from '../Dynamics/btRigidBody';
import { multiplyMatrixVector } from '../../LinearMath/btMatrix3x3';

// TypeScript equivalent of btAssertConstrParams
function btAssertConstrParams(condition: boolean, message?: string): asserts condition {
    btAssert(condition, message);
}

export class btConstraintSetting {
    m_tau: number;
    m_damping: number;
    m_impulseClamp: number;

    constructor() {
        this.m_tau = 0.3;
        this.m_damping = 1.0;
        this.m_impulseClamp = 0.0;
    }
}

export enum btPoint2PointFlags {
    BT_P2P_FLAGS_ERP = 1,
    BT_P2P_FLAGS_CFM = 2
}

/**
 * Point to point constraint between two rigidbodies each with a pivotpoint that describes the 'ballsocket' location in local space
 */
export class btPoint2PointConstraint extends btTypedConstraint {
    m_jac: btJacobianEntry[] = []; // 3 orthogonal linear constraints

    m_pivotInA: btVector3 = new btVector3();
    m_pivotInB: btVector3 = new btVector3();

    m_flags: number = 0;
    m_erp: number = 0;
    m_cfm: number = 0;

    // for backwards compatibility during the transition to 'getInfo/getInfo2'
    m_useSolveConstraintObsolete: boolean = false;

    m_setting: btConstraintSetting = new btConstraintSetting();

    constructor(rbA: btRigidBody, rbB: btRigidBody, pivotInA: btVector3, pivotInB: btVector3);
    constructor(rbA: btRigidBody, pivotInA: btVector3);
    constructor(rbA: btRigidBody, rbBOrPivotInA: btRigidBody | btVector3, pivotInAOrPivotInB?: btVector3, pivotInBOrUndefined?: btVector3) {
        super(btTypedConstraintType.POINT2POINT_CONSTRAINT_TYPE, rbA,
            rbBOrPivotInA instanceof btRigidBody ? rbBOrPivotInA : rbA);

        // Initialize jacobian entries array
        for (let i = 0; i < 3; i++) {
            this.m_jac.push(new btJacobianEntry());
        }

        // Set pivot points
        if (rbBOrPivotInA instanceof btRigidBody && pivotInAOrPivotInB && pivotInBOrUndefined) {
            // Two body constructor
            this.m_pivotInA = pivotInAOrPivotInB.clone();
            this.m_pivotInB = pivotInBOrUndefined.clone();
        } else if (rbBOrPivotInA instanceof btVector3) {
            // Single body constructor
            this.m_pivotInA = rbBOrPivotInA.clone();
            this.m_pivotInB = multiplyMatrixVector(rbA.getCenterOfMassTransform().getBasis(), rbBOrPivotInA).add(rbA.getCenterOfMassTransform().getOrigin());
        } else {
            throw new Error("Invalid constructor arguments");
        }
    }

    buildJacobian(): void {
        // we need it for both methods
        this.m_appliedImpulse = 0.0;

        const normal = new btVector3(0, 0, 0);

        for (let i = 0; i < 3; i++) {
            normal.setValue(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);

            this.m_jac[i].initConstraintTwoBodies(
                this.m_rbA.getCenterOfMassTransform().getBasis().transpose(),
                this.m_rbB.getCenterOfMassTransform().getBasis().transpose(),
                multiplyMatrixVector(this.m_rbA.getCenterOfMassTransform().getBasis(), this.m_pivotInA).subtract(this.m_rbA.getCenterOfMassPosition()),
                multiplyMatrixVector(this.m_rbB.getCenterOfMassTransform().getBasis(), this.m_pivotInB).subtract(this.m_rbB.getCenterOfMassPosition()),
                normal,
                this.m_rbA.getInvInertiaDiagLocal(),
                this.m_rbA.getInvMass(),
                this.m_rbB.getInvInertiaDiagLocal(),
                this.m_rbB.getInvMass()
            );
        }
    }

    getInfo1(info: btConstraintInfo1): void {
        this.getInfo1NonVirtual(info);
    }

    getInfo1NonVirtual(info: btConstraintInfo1): void {
        if (this.m_useSolveConstraintObsolete) {
            info.m_numConstraintRows = 0;
            info.nub = 0;
        } else {
            info.m_numConstraintRows = 3;
            info.nub = 3;
        }
    }

    getInfo2(info: btConstraintInfo2): void {
        this.getInfo2NonVirtual(info, this.m_rbA.getCenterOfMassTransform(), this.m_rbB.getCenterOfMassTransform());
    }

    getInfo2NonVirtual(info: btConstraintInfo2, body0_trans: btTransform, body1_trans: btTransform): void {
        btAssert(!this.m_useSolveConstraintObsolete);

        // anchor points in global coordinates with respect to body PORs.

        // set jacobian
        if (info.m_J1linearAxis) {
            info.m_J1linearAxis[0] = 1;
            info.m_J1linearAxis[info.rowskip + 1] = 1;
            info.m_J1linearAxis[2 * info.rowskip + 2] = 1;
        }

        const a1 = multiplyMatrixVector(body0_trans.getBasis(), this.getPivotInA());
        if (info.m_J1angularAxis) {
            // Simplified skew symmetric matrix setup for angular constraints
            const a1neg = a1.negate();
            const skew = a1neg;

            info.m_J1angularAxis[0] = skew.getX();
            info.m_J1angularAxis[1] = skew.getY();
            info.m_J1angularAxis[2] = skew.getZ();

            info.m_J1angularAxis[info.rowskip + 0] = -skew.getZ();
            info.m_J1angularAxis[info.rowskip + 1] = 0;
            info.m_J1angularAxis[info.rowskip + 2] = skew.getX();

            info.m_J1angularAxis[2 * info.rowskip + 0] = skew.getY();
            info.m_J1angularAxis[2 * info.rowskip + 1] = -skew.getX();
            info.m_J1angularAxis[2 * info.rowskip + 2] = 0;
        }

        if (info.m_J2linearAxis) {
            info.m_J2linearAxis[0] = -1;
            info.m_J2linearAxis[info.rowskip + 1] = -1;
            info.m_J2linearAxis[2 * info.rowskip + 2] = -1;
        }

        const a2 = multiplyMatrixVector(body1_trans.getBasis(), this.getPivotInB());

        if (info.m_J2angularAxis) {
            // Simplified skew symmetric matrix setup for angular constraints
            info.m_J2angularAxis[0] = a2.getX();
            info.m_J2angularAxis[1] = a2.getY();
            info.m_J2angularAxis[2] = a2.getZ();

            info.m_J2angularAxis[info.rowskip + 0] = -a2.getZ();
            info.m_J2angularAxis[info.rowskip + 1] = 0;
            info.m_J2angularAxis[info.rowskip + 2] = a2.getX();

            info.m_J2angularAxis[2 * info.rowskip + 0] = a2.getY();
            info.m_J2angularAxis[2 * info.rowskip + 1] = -a2.getX();
            info.m_J2angularAxis[2 * info.rowskip + 2] = 0;
        }

        // set right hand side
        const currERP = (this.m_flags & btPoint2PointFlags.BT_P2P_FLAGS_ERP) ? this.m_erp : info.erp;
        const k = info.fps * currERP;
        let j: number;

        if (info.m_constraintError) {
            for (j = 0; j < 3; j++) {
                const a2Val = j === 0 ? a2.getX() : (j === 1 ? a2.getY() : a2.getZ());
                const a1Val = j === 0 ? a1.getX() : (j === 1 ? a1.getY() : a1.getZ());
                const body1OriginVal = j === 0 ? body1_trans.getOrigin().getX() : (j === 1 ? body1_trans.getOrigin().getY() : body1_trans.getOrigin().getZ());
                const body0OriginVal = j === 0 ? body0_trans.getOrigin().getX() : (j === 1 ? body0_trans.getOrigin().getY() : body0_trans.getOrigin().getZ());
                info.m_constraintError[j * info.rowskip] = k * (a2Val + body1OriginVal - a1Val - body0OriginVal);
            }
        }

        if ((this.m_flags & btPoint2PointFlags.BT_P2P_FLAGS_CFM) && info.cfm) {
            for (j = 0; j < 3; j++) {
                info.cfm[j * info.rowskip] = this.m_cfm;
            }
        }

        const impulseClamp = this.m_setting.m_impulseClamp;
        for (j = 0; j < 3; j++) {
            if (this.m_setting.m_impulseClamp > 0) {
                if (info.m_lowerLimit) {
                    info.m_lowerLimit[j * info.rowskip] = -impulseClamp;
                }
                if (info.m_upperLimit) {
                    info.m_upperLimit[j * info.rowskip] = impulseClamp;
                }
            }
        }
        info.m_damping = this.m_setting.m_damping;
    }

    updateRHS(timeStep: number): void {
        // Empty implementation - matches C++ version
        void timeStep;
    }

    setPivotA(pivotA: btVector3): void {
        this.m_pivotInA = pivotA.clone();
    }

    setPivotB(pivotB: btVector3): void {
        this.m_pivotInB = pivotB.clone();
    }

    getPivotInA(): btVector3 {
        return this.m_pivotInA;
    }

    getPivotInB(): btVector3 {
        return this.m_pivotInB;
    }

    /**
     * Override the default global value of a parameter (such as ERP or CFM), optionally provide the axis (0..5).
     * If no axis is provided, it uses the default axis for this constraint.
     */
    setParam(num: number, value: number, axis: number = -1): void {
        if (axis !== -1) {
            btAssertConstrParams(false, "axis parameter not supported for btPoint2PointConstraint");
        } else {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_ERP:
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    this.m_erp = value;
                    this.m_flags |= btPoint2PointFlags.BT_P2P_FLAGS_ERP;
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    this.m_cfm = value;
                    this.m_flags |= btPoint2PointFlags.BT_P2P_FLAGS_CFM;
                    break;
                default:
                    btAssertConstrParams(false, "unknown constraint parameter");
            }
        }
    }

    /**
     * Return the local value of parameter
     */
    getParam(num: number, axis: number = -1): number {
        let retVal = SIMD_INFINITY;

        if (axis !== -1) {
            btAssertConstrParams(false, "axis parameter not supported for btPoint2PointConstraint");
        } else {
            switch (num) {
                case btConstraintParams.BT_CONSTRAINT_ERP:
                case btConstraintParams.BT_CONSTRAINT_STOP_ERP:
                    btAssertConstrParams(!!(this.m_flags & btPoint2PointFlags.BT_P2P_FLAGS_ERP), "ERP not set");
                    retVal = this.m_erp;
                    break;
                case btConstraintParams.BT_CONSTRAINT_CFM:
                case btConstraintParams.BT_CONSTRAINT_STOP_CFM:
                    btAssertConstrParams(!!(this.m_flags & btPoint2PointFlags.BT_P2P_FLAGS_CFM), "CFM not set");
                    retVal = this.m_cfm;
                    break;
                default:
                    btAssertConstrParams(false, "unknown constraint parameter");
            }
        }

        return retVal;
    }

    getFlags(): number {
        return this.m_flags;
    }

    calculateSerializeBufferSize(): number {
        // Simplified for TypeScript - would return size of serialization structure in C++
        return 0;
    }

    serialize(dataBuffer: any, serializer: any): string | null {
        // Serialization not implemented in TypeScript port
        return null;
    }
}