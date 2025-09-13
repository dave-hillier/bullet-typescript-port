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

/**
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/shared/b3Contact4Data.h
 * 
 * Structure for storing contact data in batches of up to 4 contact points.
 * Used in narrow phase collision detection and contact manifold management.
 */

import { b3Float4 } from '../../../Bullet3Common/shared/b3Float4';

/**
 * Contact data structure that can hold up to 4 contact points.
 * This is optimized for SIMD operations in the original Bullet3 implementation.
 * In TypeScript, we maintain the same data structure for compatibility.
 */
export class b3Contact4Data {
    /**
     * World positions of contact points on body B (up to 4 points)
     */
    public m_worldPosB: b3Float4[];

    /**
     * World normal on body B. The w component stores the number of active contact points.
     */
    public m_worldNormalOnB: b3Float4;

    /**
     * Compressed restitution coefficient
     */
    public m_restituitionCoeffCmp: number;

    /**
     * Compressed friction coefficient
     */
    public m_frictionCoeffCmp: number;

    /**
     * Batch index for parallel processing
     */
    public m_batchIdx: number;

    /**
     * Body A pointer and sign bit packed together
     * x: body A pointer, y: body B pointer
     */
    public m_bodyAPtrAndSignBit: number;

    /**
     * Body B pointer and sign bit packed together
     */
    public m_bodyBPtrAndSignBit: number;

    /**
     * Child index for compound shapes on body A
     */
    public m_childIndexA: number;

    /**
     * Child index for compound shapes on body B
     */
    public m_childIndexB: number;

    /**
     * Unused padding field 1
     */
    public m_unused1: number;

    /**
     * Unused padding field 2
     */
    public m_unused2: number;

    constructor() {
        // Initialize array of 4 b3Float4 vectors for contact positions
        this.m_worldPosB = [
            new b3Float4(),
            new b3Float4(),
            new b3Float4(),
            new b3Float4()
        ];
        
        this.m_worldNormalOnB = new b3Float4();
        this.m_restituitionCoeffCmp = 0;
        this.m_frictionCoeffCmp = 0;
        this.m_batchIdx = 0;
        this.m_bodyAPtrAndSignBit = 0;
        this.m_bodyBPtrAndSignBit = 0;
        this.m_childIndexA = 0;
        this.m_childIndexB = 0;
        this.m_unused1 = 0;
        this.m_unused2 = 0;
    }

    /**
     * Get the number of active contact points.
     * This is stored in the w component of m_worldNormalOnB.
     */
    getNumPoints(): number {
        return Math.floor(this.m_worldNormalOnB.w);
    }

    /**
     * Set the number of active contact points.
     * This is stored in the w component of m_worldNormalOnB.
     */
    setNumPoints(numPoints: number): void {
        this.m_worldNormalOnB.w = numPoints;
    }
}

/**
 * Get the number of contact points from a contact data structure.
 * Equivalent to the C++ inline function b3Contact4Data_getNumPoints.
 */
export function b3Contact4Data_getNumPoints(contact: b3Contact4Data): number {
    return contact.getNumPoints();
}

/**
 * Set the number of contact points in a contact data structure.
 * Equivalent to the C++ inline function b3Contact4Data_setNumPoints.
 */
export function b3Contact4Data_setNumPoints(contact: b3Contact4Data, numPoints: number): void {
    contact.setNumPoints(numPoints);
}

/**
 * Type alias for consistency with C++ typedef
 */
export type b3Contact4Data_t = b3Contact4Data;