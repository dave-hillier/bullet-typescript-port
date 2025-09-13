/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2013 Erwin Coumans  http://bulletphysics.org

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
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/b3Contact4.h
 * 
 * Contact data structure with helper methods for contact manifold management.
 * Extends b3Contact4Data with additional utility functions for accessing and
 * manipulating contact point information.
 */

import { b3Vector3 } from '../../Bullet3Common/b3Vector3';
import { b3Contact4Data } from './shared/b3Contact4Data';
import { b3Assert } from '../../Bullet3Common/b3Scalar';

/**
 * b3Contact4 extends b3Contact4Data with utility methods for contact management.
 * This class provides convenient access to contact point data including body IDs,
 * restitution/friction coefficients, and penetration depths.
 */
export class b3Contact4 extends b3Contact4Data {
    constructor() {
        super();
    }

    /**
     * Get the ID of body A.
     * The body ID is stored as an absolute value.
     */
    getBodyA(): number {
        return Math.abs(this.m_bodyAPtrAndSignBit);
    }

    /**
     * Get the ID of body B.
     * The body ID is stored as an absolute value.
     */
    getBodyB(): number {
        return Math.abs(this.m_bodyBPtrAndSignBit);
    }

    /**
     * Check if body A is fixed (static).
     * Fixed bodies have negative sign bits.
     */
    isBodyAFixed(): boolean {
        return this.m_bodyAPtrAndSignBit < 0;
    }

    /**
     * Check if body B is fixed (static).
     * Fixed bodies have negative sign bits.
     */
    isBodyBFixed(): boolean {
        return this.m_bodyBPtrAndSignBit < 0;
    }

    /**
     * Get a mutable reference to the batch index.
     * The batch index is used for parallel processing of contacts.
     */
    getBatchIdx(): number {
        return this.m_batchIdx;
    }

    /**
     * Set the batch index for parallel processing.
     */
    setBatchIdx(batchIdx: number): void {
        this.m_batchIdx = batchIdx;
    }

    /**
     * Get the restitution coefficient as a floating point value.
     * The coefficient is stored as a compressed 16-bit value and converted back to float.
     */
    getRestituitionCoeff(): number {
        return this.m_restituitionCoeffCmp / 0xffff;
    }

    /**
     * Set the restitution coefficient.
     * The coefficient must be between 0.0 and 1.0 and is compressed to 16-bit storage.
     */
    setRestituitionCoeff(c: number): void {
        b3Assert(c >= 0.0 && c <= 1.0, 'Restitution coefficient must be between 0.0 and 1.0');
        this.m_restituitionCoeffCmp = Math.floor(c * 0xffff);
    }

    /**
     * Get the friction coefficient as a floating point value.
     * The coefficient is stored as a compressed 16-bit value and converted back to float.
     */
    getFrictionCoeff(): number {
        return this.m_frictionCoeffCmp / 0xffff;
    }

    /**
     * Set the friction coefficient.
     * The coefficient must be between 0.0 and 1.0 and is compressed to 16-bit storage.
     */
    setFrictionCoeff(c: number): void {
        b3Assert(c >= 0.0 && c <= 1.0, 'Friction coefficient must be between 0.0 and 1.0');
        this.m_frictionCoeffCmp = Math.floor(c * 0xffff);
    }

    /**
     * Get the number of active contact points.
     * This is stored in the w component of the world normal vector.
     */
    getNPoints(): number {
        return Math.floor(this.m_worldNormalOnB.w);
    }

    /**
     * Get the penetration depth for a specific contact point.
     * The penetration depth is stored in the w component of the world position.
     */
    getPenetration(idx: number): number {
        b3Assert(idx >= 0 && idx < 4, 'Contact point index must be between 0 and 3');
        return this.m_worldPosB[idx].w;
    }

    /**
     * Set the penetration depth for a specific contact point.
     */
    setPenetration(idx: number, penetration: number): void {
        b3Assert(idx >= 0 && idx < 4, 'Contact point index must be between 0 and 3');
        this.m_worldPosB[idx].w = penetration;
    }

    /**
     * Check if this contact is invalid.
     * A contact is invalid if either body ID is zero.
     */
    isInvalid(): boolean {
        return (this.getBodyA() === 0 || this.getBodyB() === 0);
    }

    /**
     * Get the world normal vector on body B.
     * Returns a new b3Vector3 containing the x, y, z components.
     */
    getWorldNormalOnB(): b3Vector3 {
        return new b3Vector3(
            this.m_worldNormalOnB.x,
            this.m_worldNormalOnB.y,
            this.m_worldNormalOnB.z
        );
    }

    /**
     * Set the world normal vector on body B.
     */
    setWorldNormalOnB(normal: b3Vector3): void {
        this.m_worldNormalOnB.x = normal.getX();
        this.m_worldNormalOnB.y = normal.getY();
        this.m_worldNormalOnB.z = normal.getZ();
    }

    /**
     * Get the world position of a contact point on body B.
     * Returns a new b3Vector3 containing the x, y, z components.
     */
    getWorldPosB(idx: number): b3Vector3 {
        b3Assert(idx >= 0 && idx < 4, 'Contact point index must be between 0 and 3');
        return new b3Vector3(
            this.m_worldPosB[idx].x,
            this.m_worldPosB[idx].y,
            this.m_worldPosB[idx].z
        );
    }

    /**
     * Set the world position of a contact point on body B.
     */
    setWorldPosB(idx: number, pos: b3Vector3): void {
        b3Assert(idx >= 0 && idx < 4, 'Contact point index must be between 0 and 3');
        this.m_worldPosB[idx].x = pos.getX();
        this.m_worldPosB[idx].y = pos.getY();
        this.m_worldPosB[idx].z = pos.getZ();
    }

    /**
     * Reset the contact to default values.
     */
    reset(): void {
        this.m_bodyAPtrAndSignBit = 0;
        this.m_bodyBPtrAndSignBit = 0;
        this.m_batchIdx = 0;
        this.m_restituitionCoeffCmp = 0;
        this.m_frictionCoeffCmp = 0;
        this.m_childIndexA = 0;
        this.m_childIndexB = 0;
        this.m_unused1 = 0;
        this.m_unused2 = 0;

        this.m_worldNormalOnB.x = 0;
        this.m_worldNormalOnB.y = 0;
        this.m_worldNormalOnB.z = 0;
        this.m_worldNormalOnB.w = 0;

        for (let i = 0; i < 4; i++) {
            this.m_worldPosB[i].x = 0;
            this.m_worldPosB[i].y = 0;
            this.m_worldPosB[i].z = 0;
            this.m_worldPosB[i].w = 0;
        }
    }
}