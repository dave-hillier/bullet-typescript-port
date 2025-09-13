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
/**
 * Don't change any of the existing enum values, so add enum types at the end for serialization compatibility
 */
export var btTypedConstraintType;
(function (btTypedConstraintType) {
    btTypedConstraintType[btTypedConstraintType["POINT2POINT_CONSTRAINT_TYPE"] = 3] = "POINT2POINT_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["HINGE_CONSTRAINT_TYPE"] = 4] = "HINGE_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["CONETWIST_CONSTRAINT_TYPE"] = 5] = "CONETWIST_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["D6_CONSTRAINT_TYPE"] = 6] = "D6_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["SLIDER_CONSTRAINT_TYPE"] = 7] = "SLIDER_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["CONTACT_CONSTRAINT_TYPE"] = 8] = "CONTACT_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["D6_SPRING_CONSTRAINT_TYPE"] = 9] = "D6_SPRING_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["GEAR_CONSTRAINT_TYPE"] = 10] = "GEAR_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["FIXED_CONSTRAINT_TYPE"] = 11] = "FIXED_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["D6_SPRING_2_CONSTRAINT_TYPE"] = 12] = "D6_SPRING_2_CONSTRAINT_TYPE";
    btTypedConstraintType[btTypedConstraintType["MAX_CONSTRAINT_TYPE"] = 13] = "MAX_CONSTRAINT_TYPE";
})(btTypedConstraintType || (btTypedConstraintType = {}));
export var btConstraintParams;
(function (btConstraintParams) {
    btConstraintParams[btConstraintParams["BT_CONSTRAINT_ERP"] = 1] = "BT_CONSTRAINT_ERP";
    btConstraintParams[btConstraintParams["BT_CONSTRAINT_STOP_ERP"] = 2] = "BT_CONSTRAINT_STOP_ERP";
    btConstraintParams[btConstraintParams["BT_CONSTRAINT_CFM"] = 3] = "BT_CONSTRAINT_CFM";
    btConstraintParams[btConstraintParams["BT_CONSTRAINT_STOP_CFM"] = 4] = "BT_CONSTRAINT_STOP_CFM";
})(btConstraintParams || (btConstraintParams = {}));
/**
 * Joint feedback structure
 */
export class btJointFeedback {
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
    constructor() {
        this.m_numConstraintRows = 0;
        this.nub = 0;
    }
}
export class btConstraintInfo2 {
    constructor() {
        this.fps = 0;
        this.erp = 0;
        this.m_J1linearAxis = null;
        this.m_J1angularAxis = null;
        this.m_J2linearAxis = null;
        this.m_J2angularAxis = null;
        this.rowskip = 0;
        this.m_constraintError = null;
        this.cfm = null;
        this.m_lowerLimit = null;
        this.m_upperLimit = null;
        this.m_numIterations = 0;
        this.m_damping = 0;
    }
}
/**
 * TypedConstraint is the baseclass for Bullet constraints and vehicles
 * This is a minimal stub implementation for btRigidBody dependency
 */
export class btTypedConstraint {
    constructor(_type, rbA, rbB) {
        this.m_userConstraintPtr = null;
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
    getRigidBodyA() {
        return this.m_rbA;
    }
    getRigidBodyB() {
        return this.m_rbB;
    }
    getBreakingImpulseThreshold() {
        return this.m_breakingImpulseThreshold;
    }
    setBreakingImpulseThreshold(threshold) {
        this.m_breakingImpulseThreshold = threshold;
    }
    isEnabled() {
        return this.m_isEnabled;
    }
    setEnabled(enabled) {
        this.m_isEnabled = enabled;
    }
    getUserConstraintType() {
        return this.m_userConstraintType;
    }
    setUserConstraintType(userConstraintType) {
        this.m_userConstraintType = userConstraintType;
    }
    setUserConstraintId(uid) {
        this.m_userConstraintId = uid;
    }
    getUserConstraintId() {
        return this.m_userConstraintId;
    }
    getOverrideNumSolverIterations() {
        return this.m_overrideNumSolverIterations;
    }
    setOverrideNumSolverIterations(overrideNumIterations) {
        this.m_overrideNumSolverIterations = overrideNumIterations;
    }
    // Internal solver methods
    internalSetAppliedImpulse(appliedImpulse) {
        this.m_appliedImpulse = appliedImpulse;
    }
    internalGetAppliedImpulse() {
        return this.m_appliedImpulse;
    }
    getMotorFactor(_pos, _lowLim, _uppLim, _vel, _timeFact) {
        // Basic implementation - can be overridden by subclasses
        return 1.0;
    }
}
