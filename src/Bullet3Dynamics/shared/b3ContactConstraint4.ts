/*
Copyright (c) 2003-2013 Gino van den Bergen / Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { b3Float4 } from "../../Bullet3Common/shared/b3Float4";

/**
 * Contact constraint data structure for GPU-based physics simulation.
 * Contains constraint data for up to 4 contact points between two rigid bodies.
 * 
 * This class represents the contact constraints used in Bullet3's GPU dynamics
 * system, including normal and friction constraint data.
 */
export class b3ContactConstraint4 {
    /** Linear constraint data (normal constraint), w component stores friction coefficient */
    public m_linear: b3Float4;
    
    /** World positions of contact points (up to 4 contact points) */
    public m_worldPos: b3Float4[];
    
    /** Center point for friction constraints */
    public m_center: b3Float4;
    
    /** Jacobian coefficient inverse for normal constraints (up to 4 contacts) */
    public m_jacCoeffInv: number[];
    
    /** RHS values for normal constraints (up to 4 contacts) */
    public m_b: number[];
    
    /** Applied impulse * dt for normal constraints (up to 4 contacts) */
    public m_appliedRambdaDt: number[];
    
    /** Jacobian coefficient inverse for friction constraints (2 friction directions) */
    public m_fJacCoeffInv: number[];
    
    /** Applied impulse * dt for friction constraints (2 friction directions) */
    public m_fAppliedRambdaDt: number[];
    
    /** Index of body A in the constraint */
    public m_bodyA: number;
    
    /** Index of body B in the constraint */
    public m_bodyB: number;
    
    /** Batch index for parallel processing */
    public m_batchIdx: number;
    
    /** Padding for alignment (unused in TypeScript) */
    public m_paddings: number;

    constructor() {
        this.m_linear = new b3Float4();
        this.m_worldPos = [
            new b3Float4(),
            new b3Float4(),
            new b3Float4(),
            new b3Float4()
        ];
        this.m_center = new b3Float4();
        this.m_jacCoeffInv = [0, 0, 0, 0];
        this.m_b = [0, 0, 0, 0];
        this.m_appliedRambdaDt = [0, 0, 0, 0];
        this.m_fJacCoeffInv = [0, 0];
        this.m_fAppliedRambdaDt = [0, 0];
        this.m_bodyA = 0;
        this.m_bodyB = 0;
        this.m_batchIdx = 0;
        this.m_paddings = 0;
    }

    /**
     * Gets the friction coefficient stored in the w component of m_linear.
     * @returns The friction coefficient for this contact constraint
     */
    public getFrictionCoeff(): number {
        return this.m_linear.w;
    }

    /**
     * Sets the friction coefficient in the w component of m_linear.
     * @param value The friction coefficient to set
     */
    public setFrictionCoeff(value: number): void {
        this.m_linear.w = value;
    }
}

/**
 * Gets the friction coefficient from a contact constraint.
 * @param constraint The contact constraint to get the friction coefficient from
 * @returns The friction coefficient
 */
export function b3GetFrictionCoeff(constraint: b3ContactConstraint4): number {
    return constraint.m_linear.w;
}