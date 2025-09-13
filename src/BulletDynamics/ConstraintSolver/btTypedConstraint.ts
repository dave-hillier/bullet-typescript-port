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

import { btVector3 } from '../../LinearMath/btVector3';

// Forward declaration to avoid circular dependency
export interface btRigidBody {
    // Minimal interface needed for constraint operations
}

/**
 * Don't change any of the existing enum values, so add enum types at the end for serialization compatibility
 */
export enum btTypedConstraintType {
    POINT2POINT_CONSTRAINT_TYPE = 3,
    HINGE_CONSTRAINT_TYPE,
    CONETWIST_CONSTRAINT_TYPE,
    D6_CONSTRAINT_TYPE,
    SLIDER_CONSTRAINT_TYPE,
    CONTACT_CONSTRAINT_TYPE,
    D6_SPRING_CONSTRAINT_TYPE,
    GEAR_CONSTRAINT_TYPE,
    FIXED_CONSTRAINT_TYPE,
    D6_SPRING_2_CONSTRAINT_TYPE,
    MAX_CONSTRAINT_TYPE
}

export enum btConstraintParams {
    BT_CONSTRAINT_ERP = 1,
    BT_CONSTRAINT_STOP_ERP,
    BT_CONSTRAINT_CFM,
    BT_CONSTRAINT_STOP_CFM
}

/**
 * Joint feedback structure
 */
export class btJointFeedback {
    m_appliedForceBodyA: btVector3;
    m_appliedTorqueBodyA: btVector3;
    m_appliedForceBodyB: btVector3;
    m_appliedTorqueBodyB: btVector3;

    constructor() {
        this.m_appliedForceBodyA = new btVector3();
        this.m_appliedTorqueBodyA = new btVector3();
        this.m_appliedForceBodyB = new btVector3();
        this.m_appliedTorqueBodyB = new btVector3();
    }
}

/**
 * Constraint info structures used by constraint solver
 */
export class btConstraintInfo1 {
    m_numConstraintRows: number = 0;
    nub: number = 0;
}

export class btConstraintInfo2 {
    fps: number = 0;
    erp: number = 0;
    
    m_J1linearAxis: number[] | null = null;
    m_J1angularAxis: number[] | null = null;
    m_J2linearAxis: number[] | null = null;
    m_J2angularAxis: number[] | null = null;
    
    rowskip: number = 0;
    
    m_constraintError: number[] | null = null;
    cfm: number[] | null = null;
    
    m_lowerLimit: number[] | null = null;
    m_upperLimit: number[] | null = null;
    
    m_numIterations: number = 0;
    m_damping: number = 0;
}

/**
 * TypedConstraint is the baseclass for Bullet constraints and vehicles
 * This is a minimal stub implementation for btRigidBody dependency
 */
export abstract class btTypedConstraint {
    protected m_userConstraintType: number;
    protected m_userConstraintId: number;
    protected m_userConstraintPtr: any = null;

    protected m_breakingImpulseThreshold: number;
    protected m_isEnabled: boolean;
    protected m_needsFeedback: boolean;
    protected m_overrideNumSolverIterations: number;

    protected m_rbA: any; // Will be actual btRigidBody at runtime
    protected m_rbB: any; // Will be actual btRigidBody at runtime
    protected m_appliedImpulse: number;
    protected m_dbgDrawSize: number;
    protected m_jointFeedback: btJointFeedback | null;

    constructor(_type: btTypedConstraintType, rbA: any, rbB?: any) {
        this.m_userConstraintType = -1;
        this.m_userConstraintId = -1;
        this.m_breakingImpulseThreshold = 3.402823466e+38; // FLT_MAX
        this.m_isEnabled = true;
        this.m_needsFeedback = false;
        this.m_overrideNumSolverIterations = -1;
        this.m_appliedImpulse = 0;
        this.m_dbgDrawSize = 0.3;
        this.m_jointFeedback = null;

        this.m_rbA = rbA;
        this.m_rbB = rbB || rbA; // If no rbB provided, use rbA (single body constraint)
    }

    // Essential methods that btRigidBody needs
    getRigidBodyA(): any {
        return this.m_rbA;
    }

    getRigidBodyB(): any {
        return this.m_rbB;
    }

    getBreakingImpulseThreshold(): number {
        return this.m_breakingImpulseThreshold;
    }

    setBreakingImpulseThreshold(threshold: number): void {
        this.m_breakingImpulseThreshold = threshold;
    }

    isEnabled(): boolean {
        return this.m_isEnabled;
    }

    setEnabled(enabled: boolean): void {
        this.m_isEnabled = enabled;
    }

    getUserConstraintType(): number {
        return this.m_userConstraintType;
    }

    setUserConstraintType(userConstraintType: number): void {
        this.m_userConstraintType = userConstraintType;
    }

    setUserConstraintId(uid: number): void {
        this.m_userConstraintId = uid;
    }

    getUserConstraintId(): number {
        return this.m_userConstraintId;
    }

    getOverrideNumSolverIterations(): number {
        return this.m_overrideNumSolverIterations;
    }

    setOverrideNumSolverIterations(overrideNumIterations: number): void {
        this.m_overrideNumSolverIterations = overrideNumIterations;
    }

    // Abstract methods that subclasses must implement
    abstract buildJacobian(): void;
    abstract getInfo1(info: btConstraintInfo1): void;
    abstract getInfo2(info: btConstraintInfo2): void;

    // Internal solver methods
    internalSetAppliedImpulse(appliedImpulse: number): void {
        this.m_appliedImpulse = appliedImpulse;
    }

    internalGetAppliedImpulse(): number {
        return this.m_appliedImpulse;
    }

    protected getMotorFactor(_pos: number, _lowLim: number, _uppLim: number, _vel: number, _timeFact: number): number {
        // Basic implementation - can be overridden by subclasses
        return 1.0;
    }
}