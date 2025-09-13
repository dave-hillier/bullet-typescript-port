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

import { b3Float4ConstArg, b3MaxFloat4, b3MinFloat4 } from '../../../Bullet3Common/shared/b3Float4';

/**
 * Maximum number of parts that can be encoded in bits
 */
export const B3_MAX_NUM_PARTS_IN_BITS = 10;

/**
 * b3QuantizedBvhNodeData is a compressed AABB node, 16 bytes.
 * Node can be used for leafnode or internal node. Leafnodes can point to 32-bit triangle index (non-negative range).
 */
export class b3QuantizedBvhNodeData {
    /**
     * 12 bytes - quantized AABB minimum values (3 components)
     */
    public m_quantizedAabbMin: [number, number, number];

    /**
     * quantized AABB maximum values (3 components)
     */
    public m_quantizedAabbMax: [number, number, number];

    /**
     * 4 bytes - escape index (for internal nodes) or triangle index (for leaf nodes)
     * Negative values indicate internal nodes (escape index)
     * Non-negative values indicate leaf nodes (triangle index)
     */
    public m_escapeIndexOrTriangleIndex: number;

    constructor() {
        this.m_quantizedAabbMin = [0, 0, 0];
        this.m_quantizedAabbMax = [0, 0, 0];
        this.m_escapeIndexOrTriangleIndex = 0;
    }

    /**
     * Set quantized AABB minimum values
     */
    setQuantizedAabbMin(x: number, y: number, z: number): void {
        this.m_quantizedAabbMin[0] = Math.floor(x) & 0xFFFF; // Clamp to 16-bit unsigned
        this.m_quantizedAabbMin[1] = Math.floor(y) & 0xFFFF;
        this.m_quantizedAabbMin[2] = Math.floor(z) & 0xFFFF;
    }

    /**
     * Set quantized AABB maximum values
     */
    setQuantizedAabbMax(x: number, y: number, z: number): void {
        this.m_quantizedAabbMax[0] = Math.floor(x) & 0xFFFF; // Clamp to 16-bit unsigned
        this.m_quantizedAabbMax[1] = Math.floor(y) & 0xFFFF;
        this.m_quantizedAabbMax[2] = Math.floor(z) & 0xFFFF;
    }

    /**
     * Set the escape index or triangle index
     */
    setEscapeIndexOrTriangleIndex(value: number): void {
        this.m_escapeIndexOrTriangleIndex = Math.floor(value);
    }
}

/**
 * Get the triangle index from a BVH node.
 * Only valid for leaf nodes (when b3IsLeaf returns true).
 */
export function b3GetTriangleIndex(rootNode: b3QuantizedBvhNodeData): number {
    const x = 0;
    const y = (~(x & 0)) << (31 - B3_MAX_NUM_PARTS_IN_BITS);
    // Get only the lower bits where the triangle index is stored
    return rootNode.m_escapeIndexOrTriangleIndex & ~y;
}

/**
 * Check if a BVH node is a leaf node.
 * @param rootNode - The BVH node to check
 * @returns 1 if leaf node (triangle index >= 0), 0 if internal node (escape index < 0)
 */
export function b3IsLeaf(rootNode: b3QuantizedBvhNodeData): number {
    // Skip index is negative (internal node), triangle index >= 0 (leaf node)
    return rootNode.m_escapeIndexOrTriangleIndex >= 0 ? 1 : 0;
}

/**
 * Get the escape index from an internal BVH node.
 * Only valid for internal nodes (when b3IsLeaf returns false).
 */
export function b3GetEscapeIndex(rootNode: b3QuantizedBvhNodeData): number {
    return -rootNode.m_escapeIndexOrTriangleIndex;
}

/**
 * Quantize a 3D point with clamping to fit within the BVH bounds.
 * @param out - Output array for quantized values [x, y, z]
 * @param point2 - Point to quantize
 * @param isMax - True if this is for maximum bounds (adds 1 and sets LSB), false for minimum bounds
 * @param bvhAabbMin - BVH minimum bounds
 * @param bvhAabbMax - BVH maximum bounds  
 * @param bvhQuantization - Quantization scale factors
 */
export function b3QuantizeWithClamp(
    out: [number, number, number],
    point2: b3Float4ConstArg,
    isMax: boolean,
    bvhAabbMin: b3Float4ConstArg,
    bvhAabbMax: b3Float4ConstArg,
    bvhQuantization: b3Float4ConstArg
): void {
    const clampedPoint = b3MaxFloat4(point2, bvhAabbMin);
    const finalClampedPoint = b3MinFloat4(clampedPoint, bvhAabbMax);

    const v = finalClampedPoint.subtract(bvhAabbMin).multiply(bvhQuantization);

    if (isMax) {
        // For maximum bounds, add 1 and set the least significant bit
        out[0] = (Math.floor(v.x + 1.0) | 1) & 0xFFFF;
        out[1] = (Math.floor(v.y + 1.0) | 1) & 0xFFFF;
        out[2] = (Math.floor(v.z + 1.0) | 1) & 0xFFFF;
    } else {
        // For minimum bounds, clear the least significant bit
        out[0] = Math.floor(v.x) & 0xFFFE;
        out[1] = Math.floor(v.y) & 0xFFFE;
        out[2] = Math.floor(v.z) & 0xFFFE;
    }
}

/**
 * Test if two quantized AABBs overlap.
 * @param aabbMin1 - First AABB minimum bounds [x, y, z]
 * @param aabbMax1 - First AABB maximum bounds [x, y, z]
 * @param aabbMin2 - Second AABB minimum bounds [x, y, z]
 * @param aabbMax2 - Second AABB maximum bounds [x, y, z]
 * @returns 1 if AABBs overlap, 0 if they don't overlap
 */
export function b3TestQuantizedAabbAgainstQuantizedAabbSlow(
    aabbMin1: readonly [number, number, number],
    aabbMax1: readonly [number, number, number],
    aabbMin2: readonly [number, number, number],
    aabbMax2: readonly [number, number, number]
): number {
    // Check for separation along X axis
    if (aabbMin1[0] > aabbMax2[0]) return 0;
    if (aabbMax1[0] < aabbMin2[0]) return 0;

    // Check for separation along Y axis
    if (aabbMin1[1] > aabbMax2[1]) return 0;
    if (aabbMax1[1] < aabbMin2[1]) return 0;

    // Check for separation along Z axis
    if (aabbMin1[2] > aabbMax2[2]) return 0;
    if (aabbMax1[2] < aabbMin2[2]) return 0;

    // No separation found, AABBs overlap
    return 1;
}