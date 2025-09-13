/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { b3Scalar } from "../../Bullet3Common/b3Scalar";

/**
 * Solver modes for contact constraint solving
 */
export enum b3SolverMode {
    B3_SOLVER_RANDMIZE_ORDER = 1,
    B3_SOLVER_FRICTION_SEPARATE = 2,
    B3_SOLVER_USE_WARMSTARTING = 4,
    B3_SOLVER_USE_2_FRICTION_DIRECTIONS = 16,
    B3_SOLVER_ENABLE_FRICTION_DIRECTION_CACHING = 32,
    B3_SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64,
    B3_SOLVER_CACHE_FRIENDLY = 128,
    B3_SOLVER_SIMD = 256,
    B3_SOLVER_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512,
    B3_SOLVER_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024
}

/**
 * Contact solver information data interface
 * Contains all the parameters needed for constraint solving
 */
export interface b3ContactSolverInfoData {
    /** Time stepping parameter for constraint solving */
    m_tau: b3Scalar;
    /** Global non-contact constraint damping, can be locally overridden by constraints during 'getInfo2' */
    m_damping: b3Scalar;
    /** Default friction coefficient */
    m_friction: b3Scalar;
    /** Time step for simulation */
    m_timeStep: b3Scalar;
    /** Restitution (bounciness) coefficient */
    m_restitution: b3Scalar;
    /** Number of constraint solver iterations */
    m_numIterations: number;
    /** Maximum error reduction per step */
    m_maxErrorReduction: b3Scalar;
    /** Successive Over-Relaxation factor */
    m_sor: b3Scalar;
    /** Error Reduction Parameter - used as Baumgarte factor */
    m_erp: b3Scalar;
    /** Error Reduction Parameter 2 - used in Split Impulse */
    m_erp2: b3Scalar;
    /** Global Constraint Force Mixing */
    m_globalCfm: b3Scalar;
    /** Enable split impulse */
    m_splitImpulse: number;
    /** Penetration threshold for split impulse */
    m_splitImpulsePenetrationThreshold: b3Scalar;
    /** Turn ERP for split impulse */
    m_splitImpulseTurnErp: b3Scalar;
    /** Linear slop for constraint solving */
    m_linearSlop: b3Scalar;
    /** Warmstarting factor for iterative solver */
    m_warmstartingFactor: b3Scalar;
    /** Solver mode flags (combination of b3SolverMode values) */
    m_solverMode: number;
    /** Restitution threshold for resting contacts */
    m_restingContactRestitutionThreshold: number;
    /** Minimum number of constraints to batch together */
    m_minimumSolverBatchSize: number;
    /** Maximum gyroscopic force */
    m_maxGyroscopicForce: b3Scalar;
    /** Threshold for single axis rolling friction */
    m_singleAxisRollingFrictionThreshold: b3Scalar;
}

/**
 * Contact solver information class with default values
 * Extends the data interface with initialization
 */
export class b3ContactSolverInfo implements b3ContactSolverInfoData {
    public m_tau: b3Scalar;
    public m_damping: b3Scalar;
    public m_friction: b3Scalar;
    public m_timeStep: b3Scalar;
    public m_restitution: b3Scalar;
    public m_numIterations: number;
    public m_maxErrorReduction: b3Scalar;
    public m_sor: b3Scalar;
    public m_erp: b3Scalar;
    public m_erp2: b3Scalar;
    public m_globalCfm: b3Scalar;
    public m_splitImpulse: number;
    public m_splitImpulsePenetrationThreshold: b3Scalar;
    public m_splitImpulseTurnErp: b3Scalar;
    public m_linearSlop: b3Scalar;
    public m_warmstartingFactor: b3Scalar;
    public m_solverMode: number;
    public m_restingContactRestitutionThreshold: number;
    public m_minimumSolverBatchSize: number;
    public m_maxGyroscopicForce: b3Scalar;
    public m_singleAxisRollingFrictionThreshold: b3Scalar;

    /**
     * Constructor with default values optimized for typical physics simulation
     */
    constructor() {
        this.m_tau = 0.6;
        this.m_damping = 1.0;
        this.m_friction = 0.3;
        this.m_timeStep = 1.0 / 60.0;
        this.m_restitution = 0.0;
        this.m_maxErrorReduction = 20.0;
        this.m_numIterations = 10;
        this.m_erp = 0.2;
        this.m_erp2 = 0.8;
        this.m_globalCfm = 0.0;
        this.m_sor = 1.0;
        this.m_splitImpulse = 1; // true
        this.m_splitImpulsePenetrationThreshold = -0.04;
        this.m_splitImpulseTurnErp = 0.1;
        this.m_linearSlop = 0.0;
        this.m_warmstartingFactor = 0.85;
        
        // Default solver mode: use warmstarting and SIMD optimizations
        this.m_solverMode = b3SolverMode.B3_SOLVER_USE_WARMSTARTING | b3SolverMode.B3_SOLVER_SIMD;
        
        this.m_restingContactRestitutionThreshold = 2; // unused as of 2.81
        this.m_minimumSolverBatchSize = 128; // try to combine islands until the amount of constraints reaches this limit
        this.m_maxGyroscopicForce = 100.0; // only used to clamp forces for bodies that have their B3_ENABLE_GYROPSCOPIC_FORCE flag set
        this.m_singleAxisRollingFrictionThreshold = 1e30; // if the velocity is above this threshold, it will use a single constraint row (axis), otherwise 3 rows
    }

    /**
     * Copy constructor - creates a deep copy of another contact solver info
     */
    static copy(other: b3ContactSolverInfoData): b3ContactSolverInfo {
        const info = new b3ContactSolverInfo();
        info.m_tau = other.m_tau;
        info.m_damping = other.m_damping;
        info.m_friction = other.m_friction;
        info.m_timeStep = other.m_timeStep;
        info.m_restitution = other.m_restitution;
        info.m_numIterations = other.m_numIterations;
        info.m_maxErrorReduction = other.m_maxErrorReduction;
        info.m_sor = other.m_sor;
        info.m_erp = other.m_erp;
        info.m_erp2 = other.m_erp2;
        info.m_globalCfm = other.m_globalCfm;
        info.m_splitImpulse = other.m_splitImpulse;
        info.m_splitImpulsePenetrationThreshold = other.m_splitImpulsePenetrationThreshold;
        info.m_splitImpulseTurnErp = other.m_splitImpulseTurnErp;
        info.m_linearSlop = other.m_linearSlop;
        info.m_warmstartingFactor = other.m_warmstartingFactor;
        info.m_solverMode = other.m_solverMode;
        info.m_restingContactRestitutionThreshold = other.m_restingContactRestitutionThreshold;
        info.m_minimumSolverBatchSize = other.m_minimumSolverBatchSize;
        info.m_maxGyroscopicForce = other.m_maxGyroscopicForce;
        info.m_singleAxisRollingFrictionThreshold = other.m_singleAxisRollingFrictionThreshold;
        return info;
    }

    /**
     * Clone this instance
     */
    clone(): b3ContactSolverInfo {
        return b3ContactSolverInfo.copy(this);
    }
}