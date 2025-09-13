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
 * TypeScript port of Bullet3Collision/BroadPhaseCollision/shared/b3Aabb.h
 * Axis-aligned bounding box (AABB) data structure and operations
 * 
 * This module provides:
 * - b3Aabb class for representing axis-aligned bounding boxes
 * - b3TransformAabb2 function for transforming AABBs from local to world space
 * - b3TestAabbAgainstAabb function for testing AABB overlap
 * - Utility functions for AABB operations (center, extent, expansion, etc.)
 * 
 * Key differences from C++ version:
 * - Uses TypeScript classes instead of C structs
 * - Removes C++ unions (replaced with computed properties)
 * - Simplified quaternion representation using interface
 * - No manual memory management
 * - Uses TypeScript/JavaScript native math functions
 */

import { 
    b3Float4, 
    b3Float4ConstArg, 
    b3MakeFloat4, 
    b3Dot3F4 
} from '../../../Bullet3Common/shared/b3Float4';
import { 
    b3QuatGetRotationMatrix, 
    b3AbsoluteMat3x3, 
    b3GetRow 
} from '../../../Bullet3Common/shared/b3Mat3x3';
import { b3Scalar } from '../../../Bullet3Common/b3Scalar';

/**
 * Quaternion type for Bullet3 (simplified representation)
 * In the full Bullet3 port, this would be a proper b3Quat class
 */
export interface b3Quat {
    x: b3Scalar;
    y: b3Scalar;
    z: b3Scalar;
    w: b3Scalar;
}

/**
 * Type alias for const quaternion arguments
 */
export type b3QuatConstArg = b3Quat;

/**
 * Axis-aligned bounding box structure
 * Stores minimum and maximum extents as b3Float4 vectors
 */
export class b3Aabb {
    /**
     * Minimum bounds (can also be accessed as array or indices)
     */
    public m_minVec: b3Float4;
    
    /**
     * Maximum bounds (can also be accessed as array or indices) 
     */
    public m_maxVec: b3Float4;

    constructor(minVec?: b3Float4, maxVec?: b3Float4) {
        this.m_minVec = minVec ? minVec.clone() : new b3Float4();
        this.m_maxVec = maxVec ? maxVec.clone() : new b3Float4();
    }

    /**
     * Get minimum bounds as array
     */
    get m_min(): number[] {
        return this.m_minVec.toArray();
    }

    /**
     * Get maximum bounds as array
     */
    get m_max(): number[] {
        return this.m_maxVec.toArray();
    }

    /**
     * Get minimum bounds as integer indices (for spatial hashing)
     */
    get m_minIndices(): number[] {
        return [
            Math.floor(this.m_minVec.x),
            Math.floor(this.m_minVec.y), 
            Math.floor(this.m_minVec.z),
            Math.floor(this.m_minVec.w)
        ];
    }

    /**
     * Get maximum bounds as signed integer indices (for spatial hashing)
     */
    get m_signedMaxIndices(): number[] {
        return [
            Math.floor(this.m_maxVec.x),
            Math.floor(this.m_maxVec.y),
            Math.floor(this.m_maxVec.z), 
            Math.floor(this.m_maxVec.w)
        ];
    }

    /**
     * Clone this AABB
     */
    clone(): b3Aabb {
        return new b3Aabb(this.m_minVec, this.m_maxVec);
    }

    /**
     * Check if this AABB contains a point
     */
    contains(point: b3Float4ConstArg): boolean {
        return point.x >= this.m_minVec.x && point.x <= this.m_maxVec.x &&
               point.y >= this.m_minVec.y && point.y <= this.m_maxVec.y &&
               point.z >= this.m_minVec.z && point.z <= this.m_maxVec.z;
    }

    /**
     * Expand this AABB to include a point
     */
    include(point: b3Float4ConstArg): void {
        this.m_minVec.setMin(point);
        this.m_maxVec.setMax(point);
    }

    /**
     * Expand this AABB to include another AABB
     */
    merge(other: b3Aabb): void {
        this.m_minVec.setMin(other.m_minVec);
        this.m_maxVec.setMax(other.m_maxVec);
    }
}

/**
 * Type alias for the C-style struct typedef
 */
export type b3Aabb_t = b3Aabb;

/**
 * Transform a point using position and quaternion orientation
 * Helper function for b3TransformAabb2
 */
function b3TransformPoint(point: b3Float4ConstArg, pos: b3Float4ConstArg, orn: b3QuatConstArg): b3Float4 {
    // Get rotation matrix from quaternion
    const m = b3QuatGetRotationMatrix(orn);
    
    // Transform the point: rotatedPoint = m * point
    const rotated = m.multiplyVector(point);
    
    // Translate: result = rotatedPoint + pos
    return rotated.add(pos);
}

/**
 * Transform an AABB (axis-aligned bounding box) from local space to world space
 * 
 * @param localAabbMin Local space minimum bounds
 * @param localAabbMax Local space maximum bounds  
 * @param margin Additional margin to add to the AABB
 * @param pos World position (translation)
 * @param orn World orientation (quaternion)
 * @param aabbMinOut Output world space minimum bounds
 * @param aabbMaxOut Output world space maximum bounds
 */
export function b3TransformAabb2(
    localAabbMin: b3Float4ConstArg,
    localAabbMax: b3Float4ConstArg,
    margin: b3Scalar,
    pos: b3Float4ConstArg,
    orn: b3QuatConstArg,
    aabbMinOut: b3Float4,
    aabbMaxOut: b3Float4
): void {
    // Calculate local half extents and add margin
    const localHalfExtents = localAabbMax.subtract(localAabbMin).scale(0.5);
    const marginVec = b3MakeFloat4(margin, margin, margin, 0);
    const expandedHalfExtents = localHalfExtents.add(marginVec);
    
    // Calculate local center
    const localCenter = localAabbMax.add(localAabbMin).scale(0.5);
    
    // Get rotation matrix and its absolute version
    const m = b3QuatGetRotationMatrix(orn);
    const abs_b = b3AbsoluteMat3x3(m);
    
    // Transform center to world space
    const center = b3TransformPoint(localCenter, pos, orn);
    
    // Calculate world space extents by transforming the half extents through absolute rotation matrix
    const extent = b3MakeFloat4(
        b3Dot3F4(expandedHalfExtents, b3GetRow(abs_b, 0)),
        b3Dot3F4(expandedHalfExtents, b3GetRow(abs_b, 1)), 
        b3Dot3F4(expandedHalfExtents, b3GetRow(abs_b, 2)),
        0
    );
    
    // Calculate final world space AABB bounds
    const minResult = center.subtract(extent);
    const maxResult = center.add(extent);
    
    // Copy results to output parameters
    aabbMinOut.setValue(minResult.x, minResult.y, minResult.z, minResult.w);
    aabbMaxOut.setValue(maxResult.x, maxResult.y, maxResult.z, maxResult.w);
}

/**
 * Conservative test for overlap between two AABBs
 * 
 * @param aabbMin1 Minimum bounds of first AABB
 * @param aabbMax1 Maximum bounds of first AABB
 * @param aabbMin2 Minimum bounds of second AABB
 * @param aabbMax2 Maximum bounds of second AABB
 * @returns true if the AABBs overlap, false otherwise
 */
export function b3TestAabbAgainstAabb(
    aabbMin1: b3Float4ConstArg,
    aabbMax1: b3Float4ConstArg,
    aabbMin2: b3Float4ConstArg,
    aabbMax2: b3Float4ConstArg
): boolean {
    let overlap = true;
    
    // Test X axis
    overlap = (aabbMin1.x > aabbMax2.x || aabbMax1.x < aabbMin2.x) ? false : overlap;
    
    // Test Z axis  
    overlap = (aabbMin1.z > aabbMax2.z || aabbMax1.z < aabbMin2.z) ? false : overlap;
    
    // Test Y axis
    overlap = (aabbMin1.y > aabbMax2.y || aabbMax1.y < aabbMin2.y) ? false : overlap;
    
    return overlap;
}

/**
 * Create an AABB from minimum and maximum points
 */
export function b3MakeAabb(min: b3Float4ConstArg, max: b3Float4ConstArg): b3Aabb {
    return new b3Aabb(min, max);
}

/**
 * Get the center point of an AABB
 */
export function b3AabbGetCenter(aabb: b3Aabb): b3Float4 {
    return aabb.m_maxVec.add(aabb.m_minVec).scale(0.5);
}

/**
 * Get the extents (half-sizes) of an AABB
 */
export function b3AabbGetExtent(aabb: b3Aabb): b3Float4 {
    return aabb.m_maxVec.subtract(aabb.m_minVec).scale(0.5);
}

/**
 * Expand an AABB by a given margin on all sides
 */
export function b3AabbExpand(aabb: b3Aabb, margin: b3Scalar): b3Aabb {
    const marginVec = b3MakeFloat4(margin, margin, margin, 0);
    return new b3Aabb(
        aabb.m_minVec.subtract(marginVec),
        aabb.m_maxVec.add(marginVec)
    );
}