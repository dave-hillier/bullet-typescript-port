/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2010 Erwin Coumans  http://bulletphysics.org

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

import { SIMD_2_PI } from '../../LinearMath/btScalar';

// For btTriangleInfo m_flags
export const TRI_INFO_V0V1_CONVEX = 1;
export const TRI_INFO_V1V2_CONVEX = 2;
export const TRI_INFO_V2V0_CONVEX = 4;

export const TRI_INFO_V0V1_SWAP_NORMALB = 8;
export const TRI_INFO_V1V2_SWAP_NORMALB = 16;
export const TRI_INFO_V2V0_SWAP_NORMALB = 32;

/**
 * The btTriangleInfo structure stores information to adjust collision normals
 * to avoid collisions against internal edges
 */
export class btTriangleInfo {
    m_flags: number;
    m_edgeV0V1Angle: number;
    m_edgeV1V2Angle: number;
    m_edgeV2V0Angle: number;

    constructor() {
        this.m_edgeV0V1Angle = SIMD_2_PI;
        this.m_edgeV1V2Angle = SIMD_2_PI;
        this.m_edgeV2V0Angle = SIMD_2_PI;
        this.m_flags = 0;
    }
}

/**
 * Simplified hash key for triangle info mapping
 * In the original C++, this uses btHashInt but we use a simple number
 */
export type btTriangleInfoKey = number;

/**
 * Simplified triangle info map implementation using JavaScript Map
 * This replaces the btHashMap from the original C++ implementation
 */
export class btTriangleInfoMap {
    private m_map: Map<btTriangleInfoKey, btTriangleInfo>;
    private m_convexEpsilon: number;
    private m_planarEpsilon: number;
    private m_equalVertexThreshold: number;
    private m_edgeDistanceThreshold: number;
    private m_maxEdgeAngleThreshold: number;
    private m_zeroAreaThreshold: number;

    constructor() {
        this.m_map = new Map<btTriangleInfoKey, btTriangleInfo>();
        this.m_convexEpsilon = 0.0;
        this.m_planarEpsilon = 0.0001;
        this.m_equalVertexThreshold = 0.0001 * 0.0001;
        this.m_edgeDistanceThreshold = 0.1;
        this.m_maxEdgeAngleThreshold = SIMD_2_PI;
        this.m_zeroAreaThreshold = 0.0001 * 0.0001;
    }

    /**
     * Cleanup method (replaces C++ virtual destructor)
     */
    cleanup(): void {
        this.m_map.clear();
    }

    /**
     * Get triangle info for a given key
     */
    get(key: btTriangleInfoKey): btTriangleInfo | undefined {
        return this.m_map.get(key);
    }

    /**
     * Set triangle info for a given key
     */
    set(key: btTriangleInfoKey, info: btTriangleInfo): void {
        this.m_map.set(key, info);
    }

    /**
     * Check if triangle info exists for a given key
     */
    has(key: btTriangleInfoKey): boolean {
        return this.m_map.has(key);
    }

    /**
     * Remove triangle info for a given key
     */
    delete(key: btTriangleInfoKey): boolean {
        return this.m_map.delete(key);
    }

    /**
     * Get the number of triangle info entries
     */
    size(): number {
        return this.m_map.size;
    }

    /**
     * Clear all triangle info entries
     */
    clear(): void {
        this.m_map.clear();
    }

    /**
     * Get all keys
     */
    keys(): IterableIterator<btTriangleInfoKey> {
        return this.m_map.keys();
    }

    /**
     * Get all values
     */
    values(): IterableIterator<btTriangleInfo> {
        return this.m_map.values();
    }

    /**
     * Get all entries
     */
    entries(): IterableIterator<[btTriangleInfoKey, btTriangleInfo]> {
        return this.m_map.entries();
    }

    // Getter and setter methods for configuration parameters

    getConvexEpsilon(): number {
        return this.m_convexEpsilon;
    }

    setConvexEpsilon(convexEpsilon: number): void {
        this.m_convexEpsilon = convexEpsilon;
    }

    getPlanarEpsilon(): number {
        return this.m_planarEpsilon;
    }

    setPlanarEpsilon(planarEpsilon: number): void {
        this.m_planarEpsilon = planarEpsilon;
    }

    getEqualVertexThreshold(): number {
        return this.m_equalVertexThreshold;
    }

    setEqualVertexThreshold(equalVertexThreshold: number): void {
        this.m_equalVertexThreshold = equalVertexThreshold;
    }

    getEdgeDistanceThreshold(): number {
        return this.m_edgeDistanceThreshold;
    }

    setEdgeDistanceThreshold(edgeDistanceThreshold: number): void {
        this.m_edgeDistanceThreshold = edgeDistanceThreshold;
    }

    getMaxEdgeAngleThreshold(): number {
        return this.m_maxEdgeAngleThreshold;
    }

    setMaxEdgeAngleThreshold(maxEdgeAngleThreshold: number): void {
        this.m_maxEdgeAngleThreshold = maxEdgeAngleThreshold;
    }

    getZeroAreaThreshold(): number {
        return this.m_zeroAreaThreshold;
    }

    setZeroAreaThreshold(zeroAreaThreshold: number): void {
        this.m_zeroAreaThreshold = zeroAreaThreshold;
    }

    /**
     * Calculate serialize buffer size (serialization not fully implemented in TypeScript port)
     */
    calculateSerializeBufferSize(): number {
        // Serialization not implemented in TypeScript port
        return 0;
    }

    /**
     * Serialize the triangle info map (serialization not fully implemented in TypeScript port)
     */
    serialize(dataBuffer: any, serializer: any): string {
        // Serialization not implemented in TypeScript port
        return "";
    }
}

/**
 * Type alias for the internal triangle info map (for compatibility with original naming)
 */
export type btInternalTriangleInfoMap = btTriangleInfoMap;