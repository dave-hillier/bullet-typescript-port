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

export enum btSolverMode {
  SOLVER_RANDMIZE_ORDER = 1,
  SOLVER_FRICTION_SEPARATE = 2,
  SOLVER_USE_WARMSTARTING = 4,
  SOLVER_USE_2_FRICTION_DIRECTIONS = 16,
  SOLVER_ENABLE_FRICTION_DIRECTION_CACHING = 32,
  SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64,
  SOLVER_CACHE_FRIENDLY = 128,
  SOLVER_SIMD = 256,
  SOLVER_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512,
  SOLVER_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024,
  SOLVER_DISABLE_IMPLICIT_CONE_FRICTION = 2048,
  SOLVER_USE_ARTICULATED_WARMSTARTING = 4096,
}

export interface btContactSolverInfoData {
  m_tau: number;
  m_damping: number; // global non-contact constraint damping, can be locally overridden by constraints during 'getInfo2'.
  m_friction: number;
  m_timeStep: number;
  m_restitution: number;
  m_numIterations: number;
  m_maxErrorReduction: number;
  m_sor: number; // successive over-relaxation term
  m_erp: number; // error reduction for non-contact constraints
  m_erp2: number; // error reduction for contact constraints
  m_deformable_erp: number; // error reduction for deformable constraints
  m_deformable_cfm: number; // constraint force mixing for deformable constraints
  m_deformable_maxErrorReduction: number; // maxErrorReduction for deformable contact
  m_globalCfm: number; // constraint force mixing for contacts and non-contacts
  m_frictionERP: number; // error reduction for friction constraints
  m_frictionCFM: number; // constraint force mixing for friction constraints

  m_splitImpulse: number;
  m_splitImpulsePenetrationThreshold: number;
  m_splitImpulseTurnErp: number;
  m_linearSlop: number;
  m_warmstartingFactor: number;
  m_articulatedWarmstartingFactor: number;
  m_solverMode: number;
  m_restingContactRestitutionThreshold: number;
  m_minimumSolverBatchSize: number;
  m_maxGyroscopicForce: number;
  m_singleAxisRollingFrictionThreshold: number;
  m_leastSquaresResidualThreshold: number;
  m_restitutionVelocityThreshold: number;
  m_jointFeedbackInWorldSpace: boolean;
  m_jointFeedbackInJointFrame: boolean;
  m_reportSolverAnalytics: number;
  m_numNonContactInnerIterations: number;
}

export class btContactSolverInfo implements btContactSolverInfoData {
  m_tau: number;
  m_damping: number;
  m_friction: number;
  m_timeStep: number;
  m_restitution: number;
  m_maxErrorReduction: number;
  m_numIterations: number;
  m_erp: number;
  m_erp2: number;
  m_deformable_erp: number;
  m_deformable_cfm: number;
  m_deformable_maxErrorReduction: number;
  m_globalCfm: number;
  m_frictionERP: number;
  m_frictionCFM: number;
  m_sor: number;
  m_splitImpulse: number;
  m_splitImpulsePenetrationThreshold: number;
  m_splitImpulseTurnErp: number;
  m_linearSlop: number;
  m_warmstartingFactor: number;
  m_articulatedWarmstartingFactor: number;
  m_solverMode: number;
  m_restingContactRestitutionThreshold: number;
  m_minimumSolverBatchSize: number;
  m_maxGyroscopicForce: number;
  m_singleAxisRollingFrictionThreshold: number;
  m_leastSquaresResidualThreshold: number;
  m_restitutionVelocityThreshold: number;
  m_jointFeedbackInWorldSpace: boolean;
  m_jointFeedbackInJointFrame: boolean;
  m_reportSolverAnalytics: number;
  m_numNonContactInnerIterations: number;

  constructor() {
    this.m_tau = 0.6;
    this.m_damping = 1.0;
    this.m_friction = 0.3;
    this.m_timeStep = 1.0 / 60.0;
    this.m_restitution = 0.0;
    this.m_maxErrorReduction = 20.0;
    this.m_numIterations = 10;
    this.m_erp = 0.2;
    this.m_erp2 = 0.2;
    this.m_deformable_erp = 0.06;
    this.m_deformable_cfm = 0.01;
    this.m_deformable_maxErrorReduction = 0.1;
    this.m_globalCfm = 0.0;
    this.m_frictionERP = 0.2; // positional friction 'anchors' are disabled by default
    this.m_frictionCFM = 0.0;
    this.m_sor = 1.0;
    this.m_splitImpulse = 1; // true
    this.m_splitImpulsePenetrationThreshold = -0.04;
    this.m_splitImpulseTurnErp = 0.1;
    this.m_linearSlop = 0.0;
    this.m_warmstartingFactor = 0.85;
    this.m_articulatedWarmstartingFactor = 0.85;
    // m_solverMode =  SOLVER_USE_WARMSTARTING |  SOLVER_SIMD | SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION|SOLVER_USE_2_FRICTION_DIRECTIONS|SOLVER_ENABLE_FRICTION_DIRECTION_CACHING;// | SOLVER_RANDMIZE_ORDER;
    this.m_solverMode = btSolverMode.SOLVER_USE_WARMSTARTING | btSolverMode.SOLVER_SIMD; // | SOLVER_RANDMIZE_ORDER;
    this.m_restingContactRestitutionThreshold = 2; // unused as of 2.81
    this.m_minimumSolverBatchSize = 128; // try to combine islands until the amount of constraints reaches this limit
    this.m_maxGyroscopicForce = 100.0; // it is only used for 'explicit' version of gyroscopic force
    this.m_singleAxisRollingFrictionThreshold = 1e30; // if the velocity is above this threshold, it will use a single constraint row (axis), otherwise 3 rows.
    this.m_leastSquaresResidualThreshold = 0.0;
    this.m_restitutionVelocityThreshold = 0.2; // if the relative velocity is below this threshold, there is zero restitution
    this.m_jointFeedbackInWorldSpace = false;
    this.m_jointFeedbackInJointFrame = false;
    this.m_reportSolverAnalytics = 0;
    this.m_numNonContactInnerIterations = 1; // the number of inner iterations for solving motor constraint in a single iteration of the constraint solve
  }
}