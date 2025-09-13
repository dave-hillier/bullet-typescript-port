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
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/b3RaycastInfo.h
 * Raycast information structures for the Bullet3 physics engine
 */

import { b3Vector3 } from '../../Bullet3Common/b3Vector3';
import { b3Scalar } from '../../Bullet3Common/b3Scalar';

/**
 * Ray information structure containing start and end points of a ray
 */
export class b3RayInfo {
    /** Starting point of the ray */
    public m_from: b3Vector3;
    
    /** End point of the ray */
    public m_to: b3Vector3;

    /**
     * Constructor for b3RayInfo
     * @param from Starting point of the ray (default: zero vector)
     * @param to End point of the ray (default: zero vector)
     */
    constructor(from: b3Vector3 = new b3Vector3(), to: b3Vector3 = new b3Vector3()) {
        this.m_from = from.clone();
        this.m_to = to.clone();
    }

    /**
     * Set the ray start and end points
     * @param from Starting point of the ray
     * @param to End point of the ray
     */
    setRay(from: b3Vector3, to: b3Vector3): void {
        this.m_from = from.clone();
        this.m_to = to.clone();
    }

    /**
     * Get the direction vector of the ray
     * @returns Direction vector (not normalized)
     */
    getDirection(): b3Vector3 {
        return this.m_to.subtract(this.m_from);
    }

    /**
     * Get the normalized direction vector of the ray
     * @returns Normalized direction vector
     */
    getNormalizedDirection(): b3Vector3 {
        return this.getDirection().normalized();
    }

    /**
     * Get the length of the ray
     * @returns Length of the ray
     */
    getLength(): b3Scalar {
        return this.m_from.distance(this.m_to);
    }

    /**
     * Create a copy of this ray info
     * @returns Copy of this b3RayInfo
     */
    clone(): b3RayInfo {
        return new b3RayInfo(this.m_from, this.m_to);
    }
}

/**
 * Ray hit result structure containing information about a ray intersection
 */
export class b3RayHit {
    /** Hit fraction along the ray (0 = ray start, 1 = ray end) */
    public m_hitFraction: b3Scalar;
    
    /** ID of the body that was hit */
    public m_hitBody: number;
    
    /** Additional hit result data 1 */
    public m_hitResult1: number;
    
    /** Additional hit result data 2 */
    public m_hitResult2: number;
    
    /** World space hit point */
    public m_hitPoint: b3Vector3;
    
    /** Surface normal at the hit point */
    public m_hitNormal: b3Vector3;

    /**
     * Constructor for b3RayHit
     * @param hitFraction Hit fraction along the ray (default: 1.0)
     * @param hitBody ID of the hit body (default: -1)
     * @param hitResult1 Additional hit result data 1 (default: -1)
     * @param hitResult2 Additional hit result data 2 (default: -1)
     * @param hitPoint World space hit point (default: zero vector)
     * @param hitNormal Surface normal at hit point (default: zero vector)
     */
    constructor(
        hitFraction: b3Scalar = 1.0,
        hitBody: number = -1,
        hitResult1: number = -1,
        hitResult2: number = -1,
        hitPoint: b3Vector3 = new b3Vector3(),
        hitNormal: b3Vector3 = new b3Vector3()
    ) {
        this.m_hitFraction = hitFraction;
        this.m_hitBody = hitBody;
        this.m_hitResult1 = hitResult1;
        this.m_hitResult2 = hitResult2;
        this.m_hitPoint = hitPoint.clone();
        this.m_hitNormal = hitNormal.clone();
    }

    /**
     * Check if this represents a valid hit
     * @returns True if hit fraction is between 0 and 1, false otherwise
     */
    hasHit(): boolean {
        return this.m_hitFraction >= 0.0 && this.m_hitFraction <= 1.0;
    }

    /**
     * Reset the hit to no-hit state
     */
    reset(): void {
        this.m_hitFraction = 1.0;
        this.m_hitBody = -1;
        this.m_hitResult1 = -1;
        this.m_hitResult2 = -1;
        this.m_hitPoint.setZero();
        this.m_hitNormal.setZero();
    }

    /**
     * Set the hit information
     * @param hitFraction Hit fraction along the ray
     * @param hitBody ID of the hit body
     * @param hitPoint World space hit point
     * @param hitNormal Surface normal at hit point
     * @param hitResult1 Additional hit result data 1 (optional)
     * @param hitResult2 Additional hit result data 2 (optional)
     */
    setHit(
        hitFraction: b3Scalar,
        hitBody: number,
        hitPoint: b3Vector3,
        hitNormal: b3Vector3,
        hitResult1: number = -1,
        hitResult2: number = -1
    ): void {
        this.m_hitFraction = hitFraction;
        this.m_hitBody = hitBody;
        this.m_hitResult1 = hitResult1;
        this.m_hitResult2 = hitResult2;
        this.m_hitPoint = hitPoint.clone();
        this.m_hitNormal = hitNormal.clone();
    }

    /**
     * Create a copy of this ray hit
     * @returns Copy of this b3RayHit
     */
    clone(): b3RayHit {
        return new b3RayHit(
            this.m_hitFraction,
            this.m_hitBody,
            this.m_hitResult1,
            this.m_hitResult2,
            this.m_hitPoint,
            this.m_hitNormal
        );
    }

    /**
     * Compare hit fractions for sorting (closer hits first)
     * @param other Another b3RayHit to compare with
     * @returns Negative if this hit is closer, positive if further, 0 if equal
     */
    compareTo(other: b3RayHit): number {
        return this.m_hitFraction - other.m_hitFraction;
    }
}