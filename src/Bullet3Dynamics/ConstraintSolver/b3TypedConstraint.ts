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
 * TypeScript port of Bullet3Dynamics/ConstraintSolver/b3TypedConstraint.h
 * Base class for Bullet constraints and vehicles
 */

import { b3Scalar, b3Assert, B3_2_PI, B3_PI, b3Fabs, b3NormalizeAngle } from '../../Bullet3Common/b3Scalar';
import { b3Vector3, b3MakeVector3 } from '../../Bullet3Common/b3Vector3';
import { b3ConstraintArray } from './b3SolverConstraint';
import { b3SolverBody } from './b3SolverBody';

/**
 * Constraint type enumeration
 * Don't change any of the existing enum values for serialization compatibility
 */
export enum b3TypedConstraintType {
    B3_POINT2POINT_CONSTRAINT_TYPE = 3,
    B3_HINGE_CONSTRAINT_TYPE,
    B3_CONETWIST_CONSTRAINT_TYPE,
    B3_D6_CONSTRAINT_TYPE,
    B3_SLIDER_CONSTRAINT_TYPE,
    B3_CONTACT_CONSTRAINT_TYPE,
    B3_D6_SPRING_CONSTRAINT_TYPE,
    B3_GEAR_CONSTRAINT_TYPE,
    B3_FIXED_CONSTRAINT_TYPE,
    B3_MAX_CONSTRAINT_TYPE
}

/**
 * Constraint parameters enumeration
 */
export enum b3ConstraintParams {
    B3_CONSTRAINT_ERP = 1,
    B3_CONSTRAINT_STOP_ERP,
    B3_CONSTRAINT_CFM,
    B3_CONSTRAINT_STOP_CFM
}

/**
 * Joint feedback structure for applied forces and torques
 */
export class b3JointFeedback {
    public m_appliedForceBodyA: b3Vector3;
    public m_appliedTorqueBodyA: b3Vector3;
    public m_appliedForceBodyB: b3Vector3;
    public m_appliedTorqueBodyB: b3Vector3;

    constructor() {
        this.m_appliedForceBodyA = b3MakeVector3(0, 0, 0);
        this.m_appliedTorqueBodyA = b3MakeVector3(0, 0, 0);
        this.m_appliedForceBodyB = b3MakeVector3(0, 0, 0);
        this.m_appliedTorqueBodyB = b3MakeVector3(0, 0, 0);
    }
}

/**
 * Base class for typed objects (rudimentary type info)
 */
export class b3TypedObject {
    protected m_objectType: number;

    constructor(objectType: number) {
        this.m_objectType = objectType;
    }

    getObjectType(): number {
        return this.m_objectType;
    }
}

/**
 * Rigid body data interface (simplified from b3RigidBodyData)
 */
export interface b3RigidBodyData {
    m_pos: { x: number; y: number; z: number; w: number };
    m_quat: { x: number; y: number; z: number; w: number };
    m_linVel: { x: number; y: number; z: number; w: number };
    m_angVel: { x: number; y: number; z: number; w: number };
    m_collidableIdx: number;
    m_invMass: number;
    m_restituitionCoeff: number;
    m_frictionCoeff: number;
}

/**
 * Constraint info structures for solver setup
 */
export interface b3ConstraintInfo1 {
    m_numConstraintRows: number;
    nub: number;
}

export interface b3ConstraintInfo2 {
    /** Frames per second (1/stepsize) */
    fps: b3Scalar;
    /** Default error reduction parameter (0..1) */
    erp: b3Scalar;
    
    /** Jacobian sub matrices for linear and angular components */
    m_J1linearAxis: number[] | null;
    m_J1angularAxis: number[] | null;
    m_J2linearAxis: number[] | null;
    m_J2angularAxis: number[] | null;
    
    /** Elements to jump from one row to the next in J's */
    rowskip: number;
    
    /** Right hand sides of the equation J*v = c + cfm * lambda */
    m_constraintError: number[] | null;
    cfm: number[] | null;
    
    /** Lo and hi limits for variables */
    m_lowerLimit: number[] | null;
    m_upperLimit: number[] | null;
    
    /** Findex vector for variables */
    findex: number[] | null;
    
    /** Number of solver iterations */
    m_numIterations: number;
    
    /** Damping of the velocity */
    m_damping: b3Scalar;
}

/**
 * Base class for typed constraints - abstract class for Bullet constraints and vehicles
 */
export abstract class b3TypedConstraint extends b3TypedObject {
    protected m_userConstraintType: number = 0;
    protected m_userConstraintId: number = 0;
    protected m_userConstraintPtr: any = null;
    protected m_breakingImpulseThreshold: b3Scalar = Number.MAX_VALUE;
    protected m_isEnabled: boolean = true;
    protected m_needsFeedback: boolean = false;
    protected m_overrideNumSolverIterations: number = -1;
    
    // Protected members
    protected m_rbA: number;
    protected m_rbB: number;
    protected m_appliedImpulse: b3Scalar = 0;
    protected m_dbgDrawSize: b3Scalar = 0.3;
    protected m_jointFeedback: b3JointFeedback | null = null;

    /**
     * Constructor
     * @param type Constraint type
     * @param bodyA First body index
     * @param bodyB Second body index  
     */
    constructor(type: b3TypedConstraintType, bodyA: number, bodyB: number) {
        super(type);
        this.m_rbA = bodyA;
        this.m_rbB = bodyB;
    }

    /**
     * Internal method used by the constraint solver to get motor factor
     * @param pos Position
     * @param lowLim Lower limit
     * @param uppLim Upper limit
     * @param vel Velocity
     * @param timeFact Time factor
     * @returns Motor factor
     */
    protected getMotorFactor(pos: b3Scalar, lowLim: b3Scalar, uppLim: b3Scalar, _vel: b3Scalar, _timeFact: b3Scalar): b3Scalar {
        if (lowLim > uppLim) {
            return 1.0;
        }
        if (pos < lowLim) {
            return -1.0;
        }
        if (pos > uppLim) {
            return 1.0;
        }
        return 0.0;
    }

    /**
     * Get override number of solver iterations
     */
    getOverrideNumSolverIterations(): number {
        return this.m_overrideNumSolverIterations;
    }

    /**
     * Override the number of constraint solver iterations used to solve this constraint
     * -1 will use the default number of iterations, as specified in SolverInfo.m_numIterations
     * @param overrideNumIterations Number of iterations to override with
     */
    setOverrideNumSolverIterations(overrideNumIterations: number): void {
        this.m_overrideNumSolverIterations = overrideNumIterations;
    }

    /**
     * Internal method used by the constraint solver, don't use directly
     * @param ca Constraint array
     * @param solverBodyA Solver body A ID
     * @param solverBodyB Solver body B ID
     * @param timeStep Time step
     */
    setupSolverConstraint(_ca: b3ConstraintArray, _solverBodyA: number, _solverBodyB: number, _timeStep: b3Scalar): void {
        // Default implementation - override in derived classes
    }

    /**
     * Internal method used by the constraint solver, don't use directly
     * @param info Constraint info 1
     * @param bodies Rigid body data array
     */
    abstract getInfo1(info: b3ConstraintInfo1, bodies: b3RigidBodyData[]): void;

    /**
     * Internal method used by the constraint solver, don't use directly
     * @param info Constraint info 2
     * @param bodies Rigid body data array
     */
    abstract getInfo2(info: b3ConstraintInfo2, bodies: b3RigidBodyData[]): void;

    /**
     * Internal method to set applied impulse
     * @param appliedImpulse Applied impulse value
     */
    internalSetAppliedImpulse(appliedImpulse: b3Scalar): void {
        this.m_appliedImpulse = appliedImpulse;
    }

    /**
     * Internal method to get applied impulse
     */
    internalGetAppliedImpulse(): b3Scalar {
        return this.m_appliedImpulse;
    }

    /**
     * Get breaking impulse threshold
     */
    getBreakingImpulseThreshold(): b3Scalar {
        return this.m_breakingImpulseThreshold;
    }

    /**
     * Set breaking impulse threshold
     * @param threshold Breaking threshold
     */
    setBreakingImpulseThreshold(threshold: b3Scalar): void {
        this.m_breakingImpulseThreshold = threshold;
    }

    /**
     * Check if constraint is enabled
     */
    isEnabled(): boolean {
        return this.m_isEnabled;
    }

    /**
     * Enable or disable constraint
     * @param enabled Enable state
     */
    setEnabled(enabled: boolean): void {
        this.m_isEnabled = enabled;
    }

    /**
     * Internal method used by the constraint solver (obsolete)
     * @param bodyA Solver body A
     * @param bodyB Solver body B
     * @param timeStep Time step
     */
    solveConstraintObsolete(_bodyA: b3SolverBody, _bodyB: b3SolverBody, _timeStep: b3Scalar): void {
        // Default empty implementation
    }

    /**
     * Get rigid body A index
     */
    getRigidBodyA(): number {
        return this.m_rbA;
    }

    /**
     * Get rigid body B index
     */
    getRigidBodyB(): number {
        return this.m_rbB;
    }

    /**
     * Get user constraint type
     */
    getUserConstraintType(): number {
        return this.m_userConstraintType;
    }

    /**
     * Set user constraint type
     * @param userConstraintType User-defined constraint type
     */
    setUserConstraintType(userConstraintType: number): void {
        this.m_userConstraintType = userConstraintType;
    }

    /**
     * Set user constraint ID
     * @param uid User ID
     */
    setUserConstraintId(uid: number): void {
        this.m_userConstraintId = uid;
    }

    /**
     * Get user constraint ID
     */
    getUserConstraintId(): number {
        return this.m_userConstraintId;
    }

    /**
     * Set user constraint pointer
     * @param ptr User pointer
     */
    setUserConstraintPtr(ptr: any): void {
        this.m_userConstraintPtr = ptr;
    }

    /**
     * Get user constraint pointer
     */
    getUserConstraintPtr(): any {
        return this.m_userConstraintPtr;
    }

    /**
     * Set joint feedback
     * @param jointFeedback Joint feedback object
     */
    setJointFeedback(jointFeedback: b3JointFeedback | null): void {
        this.m_jointFeedback = jointFeedback;
    }

    /**
     * Get joint feedback (const version)
     */
    getJointFeedback(): b3JointFeedback | null {
        return this.m_jointFeedback;
    }

    /**
     * Get unique ID (alias for getUserConstraintId)
     */
    getUid(): number {
        return this.m_userConstraintId;
    }

    /**
     * Check if constraint needs feedback
     */
    needsFeedback(): boolean {
        return this.m_needsFeedback;
    }

    /**
     * Enable feedback to read applied linear and angular impulse
     * Use getAppliedImpulse to read feedback information
     * @param needsFeedback Whether feedback is needed
     */
    enableFeedback(needsFeedback: boolean): void {
        this.m_needsFeedback = needsFeedback;
    }

    /**
     * Get applied impulse - estimated total applied impulse.
     * This feedback can be used to determine breaking constraints or playing sounds.
     */
    getAppliedImpulse(): b3Scalar {
        b3Assert(this.m_needsFeedback, "Feedback must be enabled to get applied impulse");
        return this.m_appliedImpulse;
    }

    /**
     * Get constraint type
     */
    getConstraintType(): b3TypedConstraintType {
        return this.m_objectType as b3TypedConstraintType;
    }

    /**
     * Set debug draw size
     * @param dbgDrawSize Debug draw size
     */
    setDbgDrawSize(dbgDrawSize: b3Scalar): void {
        this.m_dbgDrawSize = dbgDrawSize;
    }

    /**
     * Get debug draw size
     */
    getDbgDrawSize(): b3Scalar {
        return this.m_dbgDrawSize;
    }

    /**
     * Override the default global value of a parameter (such as ERP or CFM)
     * @param num Parameter number
     * @param value Parameter value
     * @param axis Optional axis (0..5), -1 for default axis
     */
    abstract setParam(num: number, value: b3Scalar, axis?: number): void;

    /**
     * Return the local value of parameter
     * @param num Parameter number
     * @param axis Optional axis (0..5), -1 for default axis
     */
    abstract getParam(num: number, axis?: number): b3Scalar;
}

/**
 * Adjust angle to limits
 * Returns angle in range [-B3_2_PI, B3_2_PI], closest to one of the limits
 * All arguments should be normalized angles (i.e. in range [-B3_PI, B3_PI])
 * @param angleInRadians Input angle
 * @param angleLowerLimitInRadians Lower limit
 * @param angleUpperLimitInRadians Upper limit
 * @returns Adjusted angle
 */
export function b3AdjustAngleToLimits(
    angleInRadians: b3Scalar,
    angleLowerLimitInRadians: b3Scalar,
    angleUpperLimitInRadians: b3Scalar
): b3Scalar {
    if (angleLowerLimitInRadians >= angleUpperLimitInRadians) {
        return angleInRadians;
    } else if (angleInRadians < angleLowerLimitInRadians) {
        const diffLo = b3Fabs(b3NormalizeAngle(angleLowerLimitInRadians - angleInRadians));
        const diffHi = b3Fabs(b3NormalizeAngle(angleUpperLimitInRadians - angleInRadians));
        return (diffLo < diffHi) ? angleInRadians : (angleInRadians + B3_2_PI);
    } else if (angleInRadians > angleUpperLimitInRadians) {
        const diffHi = b3Fabs(b3NormalizeAngle(angleInRadians - angleUpperLimitInRadians));
        const diffLo = b3Fabs(b3NormalizeAngle(angleInRadians - angleLowerLimitInRadians));
        return (diffLo < diffHi) ? (angleInRadians - B3_2_PI) : angleInRadians;
    } else {
        return angleInRadians;
    }
}

/**
 * Serialization data structure (for future serialization support)
 */
export interface b3TypedConstraintData {
    m_bodyA: number;
    m_bodyB: number;
    m_name: string;
    m_objectType: number;
    m_userConstraintType: number;
    m_userConstraintId: number;
    m_needsFeedback: number;
    m_appliedImpulse: number;
    m_dbgDrawSize: number;
    m_disableCollisionsBetweenLinkedBodies: number;
    m_overrideNumSolverIterations: number;
    m_breakingImpulseThreshold: number;
    m_isEnabled: number;
}

/**
 * Angular limit class for constraint limiting
 */
export class b3AngularLimit {
    private m_center: b3Scalar = 0.0;
    private m_halfRange: b3Scalar = -1.0;
    private m_softness: b3Scalar = 0.9;
    private m_biasFactor: b3Scalar = 0.3;
    private m_relaxationFactor: b3Scalar = 1.0;
    private m_correction: b3Scalar = 0.0;
    private m_sign: b3Scalar = 0.0;
    private m_solveLimit: boolean = false;

    /**
     * Default constructor initializes limit as inactive, allowing free constraint movement
     */
    constructor() {
        // All properties initialized above with default values
    }

    /**
     * Set all limit's parameters.
     * When low > high limit becomes inactive.
     * When high - low > 2PI limit is ineffective too because no angle can exceed the limit
     * @param low Lower limit
     * @param high Upper limit
     * @param softness Softness parameter (default 0.9)
     * @param biasFactor Bias factor (default 0.3)
     * @param relaxationFactor Relaxation factor (default 1.0)
     */
    set(low: b3Scalar, high: b3Scalar, softness: b3Scalar = 0.9, biasFactor: b3Scalar = 0.3, relaxationFactor: b3Scalar = 1.0): void {
        this.m_softness = softness;
        this.m_biasFactor = biasFactor;
        this.m_relaxationFactor = relaxationFactor;
        
        if (low > high) {
            this.m_halfRange = -1.0;
            this.m_center = 0.0;
        } else {
            this.m_center = (high + low) * 0.5;
            this.m_halfRange = (high - low) * 0.5;
            if (this.m_halfRange > B3_PI) {
                this.m_halfRange = -1.0;
            }
        }
    }

    /**
     * Check constraint angle against limit. If limit is active and the angle violates the limit
     * correction is calculated.
     * @param angle Angle to test
     */
    test(angle: b3Scalar): void {
        this.m_correction = 0.0;
        this.m_sign = 0.0;
        this.m_solveLimit = false;
        
        if (this.m_halfRange >= 0.0) {
            const deviation = b3NormalizeAngle(angle - this.m_center);
            if (deviation < -this.m_halfRange) {
                this.m_solveLimit = true;
                this.m_correction = -(deviation + this.m_halfRange);
                this.m_sign = 1.0;
            } else if (deviation > this.m_halfRange) {
                this.m_solveLimit = true;
                this.m_correction = this.m_halfRange - deviation;
                this.m_sign = -1.0;
            }
        }
    }

    /**
     * Get limit's softness
     */
    getSoftness(): b3Scalar {
        return this.m_softness;
    }

    /**
     * Get limit's bias factor
     */
    getBiasFactor(): b3Scalar {
        return this.m_biasFactor;
    }

    /**
     * Get limit's relaxation factor
     */
    getRelaxationFactor(): b3Scalar {
        return this.m_relaxationFactor;
    }

    /**
     * Get correction value evaluated when test() was invoked
     */
    getCorrection(): b3Scalar {
        return this.m_correction;
    }

    /**
     * Get sign value evaluated when test() was invoked
     */
    getSign(): b3Scalar {
        return this.m_sign;
    }

    /**
     * Get half of the distance between min and max limit angle
     */
    getHalfRange(): b3Scalar {
        return this.m_halfRange;
    }

    /**
     * Check if the last test() invocation recognized limit violation
     */
    isLimit(): boolean {
        return this.m_solveLimit;
    }

    /**
     * Check given angle against limit. If limit is active and angle doesn't fit it,
     * the angle is modified so it equals to the limit closest to given angle.
     * @param angle Angle to fit (modified in place)
     */
    fit(angle: { value: b3Scalar }): void {
        if (this.m_halfRange > 0.0) {
            const relativeAngle = b3NormalizeAngle(angle.value - this.m_center);
            if (relativeAngle > this.m_halfRange) {
                angle.value = this.m_center + this.m_halfRange;
            } else if (relativeAngle < -this.m_halfRange) {
                angle.value = this.m_center - this.m_halfRange;
            }
        }
    }

    /**
     * Get correction value multiplied by sign value
     */
    getError(): b3Scalar {
        return this.m_correction * this.m_sign;
    }

    /**
     * Get lower limit
     */
    getLow(): b3Scalar {
        return this.m_center - this.m_halfRange;
    }

    /**
     * Get upper limit
     */
    getHigh(): b3Scalar {
        return this.m_center + this.m_halfRange;
    }
}