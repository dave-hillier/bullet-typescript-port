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

/**
 * TypeScript port of Bullet3Dynamics/ConstraintSolver/b3SolverConstraint.h
 * 1D constraint along a normal axis between bodyA and bodyB. 
 * Can be combined to solve contact and friction constraints.
 */

import { b3Vector3, b3MakeVector3 } from '../../Bullet3Common/b3Vector3';
import { b3Scalar } from '../../Bullet3Common/b3Scalar';

/**
 * Solver constraint types
 */
export enum b3SolverConstraintType {
    B3_SOLVER_CONTACT_1D = 0,
    B3_SOLVER_FRICTION_1D = 1
}

/**
 * 1D constraint structure for the constraint solver
 * Contains all necessary data for solving a single constraint row
 */
export class b3SolverConstraint {
    /** Cross product of relative position and contact normal for body A */
    public m_relpos1CrossNormal: b3Vector3;
    
    /** Contact normal direction */
    public m_contactNormal: b3Vector3;
    
    /** Cross product of relative position and contact normal for body B */
    public m_relpos2CrossNormal: b3Vector3;
    
    /** Angular impulse component for body A */
    public m_angularComponentA: b3Vector3;
    
    /** Angular impulse component for body B */
    public m_angularComponentB: b3Vector3;
    
    /** Applied push impulse (mutable for solver) */
    public m_appliedPushImpulse: b3Scalar;
    
    /** Applied impulse (mutable for solver) */
    public m_appliedImpulse: b3Scalar;
    
    /** Friction coefficient */
    public m_friction: b3Scalar;
    
    /** Jacobian diagonal inverse (A^-1 B^-1) */
    public m_jacDiagABInv: b3Scalar;
    
    /** Right-hand side of constraint equation */
    public m_rhs: b3Scalar;
    
    /** Constraint force mixing parameter */
    public m_cfm: b3Scalar;
    
    /** Lower limit for constraint force */
    public m_lowerLimit: b3Scalar;
    
    /** Upper limit for constraint force */
    public m_upperLimit: b3Scalar;
    
    /** Right-hand side for penetration constraint */
    public m_rhsPenetration: b3Scalar;
    
    /** Original contact point (can be null) */
    public m_originalContactPoint: any = null;
    
    /** Override number of solver iterations */
    public m_overrideNumSolverIterations: number;
    
    /** Index of corresponding friction constraint */
    public m_frictionIndex: number;
    
    /** Solver body ID for body A */
    public m_solverBodyIdA: number;
    
    /** Solver body ID for body B */
    public m_solverBodyIdB: number;

    /**
     * Constructor - initializes all constraint data
     */
    constructor() {
        this.m_relpos1CrossNormal = b3MakeVector3(0, 0, 0);
        this.m_contactNormal = b3MakeVector3(0, 0, 0);
        this.m_relpos2CrossNormal = b3MakeVector3(0, 0, 0);
        this.m_angularComponentA = b3MakeVector3(0, 0, 0);
        this.m_angularComponentB = b3MakeVector3(0, 0, 0);
        
        this.m_appliedPushImpulse = 0;
        this.m_appliedImpulse = 0;
        this.m_friction = 0;
        this.m_jacDiagABInv = 0;
        this.m_rhs = 0;
        this.m_cfm = 0;
        this.m_lowerLimit = 0;
        this.m_upperLimit = 0;
        this.m_rhsPenetration = 0;
        
        this.m_overrideNumSolverIterations = 0;
        this.m_frictionIndex = 0;
        this.m_solverBodyIdA = 0;
        this.m_solverBodyIdB = 0;
    }
}

/**
 * Array type for solver constraints
 */
export type b3ConstraintArray = b3SolverConstraint[];