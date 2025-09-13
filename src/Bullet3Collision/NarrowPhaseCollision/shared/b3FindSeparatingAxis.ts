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
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/shared/b3FindSeparatingAxis.h
 * Separating Axis Theorem (SAT) implementation for convex polyhedron collision detection
 * 
 * The Separating Axis Theorem is used to determine if two convex shapes are intersecting.
 * If a separating axis exists (an axis along which the projections of the shapes don't overlap),
 * then the shapes are not intersecting.
 */

import { b3Float4, b3Dot3F4, b3Cross3, b3FastNormalized3, b3IsAlmostZero } from '../../../Bullet3Common/shared/b3Float4';
import { b3ConvexPolyhedronData, b3GpuFace } from './b3ConvexPolyhedronData';
import { b3Vector3 } from '../../../Bullet3Common/b3Vector3';
import { b3Scalar } from '../../../Bullet3Common/b3Scalar';

/**
 * Quaternion interface for rotation operations
 */
export interface b3Quaternion {
    x: b3Scalar;
    y: b3Scalar;
    z: b3Scalar;
    w: b3Scalar;
}

/**
 * Create a quaternion inverse
 */
function b3QuatInverse(q: b3Quaternion): b3Quaternion {
    return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

/**
 * Multiply two quaternions
 */
function b3QuatMul(a: b3Quaternion, b: b3Quaternion): b3Quaternion {
    const cross = b3Cross3(
        new b3Float4(a.x, a.y, a.z, 0),
        new b3Float4(b.x, b.y, b.z, 0)
    );
    
    return {
        x: cross.x + a.w * b.x + b.w * a.x,
        y: cross.y + a.w * b.y + b.w * a.y,
        z: cross.z + a.w * b.z + b.w * a.z,
        w: a.w * b.w - b3Dot3F4(
            new b3Float4(a.x, a.y, a.z, 0),
            new b3Float4(b.x, b.y, b.z, 0)
        )
    };
}

/**
 * Rotate a vector by a quaternion
 */
function b3QuatRotate(q: b3Quaternion, vec: b3Float4): b3Float4 {
    const qInv = b3QuatInverse(q);
    const vcpy = new b3Float4(vec.x, vec.y, vec.z, 0);
    
    // Perform q * vec * q^-1
    const temp = b3QuatMul(q, { x: vcpy.x, y: vcpy.y, z: vcpy.z, w: 0 });
    const result = b3QuatMul(temp, qInv);
    
    return new b3Float4(result.x, result.y, result.z, 0);
}

/**
 * Transform a point by rotation and translation
 */
function b3TransformPoint(point: b3Float4, translation: b3Float4, orientation: b3Quaternion): b3Float4 {
    const rotated = b3QuatRotate(orientation, point);
    return rotated.add(translation);
}

/**
 * Assertion function for debugging
 */
function b3Assert(condition: boolean, message?: string): void {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

/**
 * Project a convex polyhedron onto an axis and return the min/max projection values
 * 
 * @param hull - The convex polyhedron data
 * @param pos - Position of the hull in world space
 * @param orn - Orientation of the hull in world space
 * @param dir - Direction vector to project onto (should be normalized)
 * @param vertices - Array of vertices for the hull
 * @param min - Output parameter for minimum projection value
 * @param max - Output parameter for maximum projection value
 */
export function b3ProjectAxis(
    hull: b3ConvexPolyhedronData,
    pos: b3Float4,
    orn: b3Quaternion,
    dir: b3Float4,
    vertices: b3Vector3[]
): { min: b3Scalar; max: b3Scalar } {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    const numVerts = hull.m_numVertices;

    // Transform direction to local space of the hull
    const localDir = b3QuatRotate(b3QuatInverse(orn), dir);

    // Calculate offset for world space projection
    const offset = b3Dot3F4(pos, dir);

    // Project each vertex onto the direction axis
    for (let i = 0; i < numVerts; i++) {
        const vertex = vertices[hull.m_vertexOffset + i];
        const vertexFloat4 = new b3Float4(vertex.x, vertex.y, vertex.z, 0);
        const dp = b3Dot3F4(vertexFloat4, localDir);
        
        if (dp < min) min = dp;
        if (dp > max) max = dp;
    }

    // Ensure min <= max (handle numerical precision issues)
    if (min > max) {
        const tmp = min;
        min = max;
        max = tmp;
    }

    // Transform to world space
    min += offset;
    max += offset;

    return { min, max };
}

/**
 * Test if two convex polyhedra are separated along a given axis
 * 
 * @param hullA - First convex polyhedron
 * @param hullB - Second convex polyhedron
 * @param posA - Position of hull A
 * @param ornA - Orientation of hull A
 * @param posB - Position of hull B
 * @param ornB - Orientation of hull B
 * @param sepAxis - Separating axis to test
 * @param verticesA - Vertices of hull A
 * @param verticesB - Vertices of hull B
 * @returns Object containing separation test result and penetration depth
 */
export function b3TestSepAxis(
    hullA: b3ConvexPolyhedronData,
    hullB: b3ConvexPolyhedronData,
    posA: b3Float4,
    ornA: b3Quaternion,
    posB: b3Float4,
    ornB: b3Quaternion,
    sepAxis: b3Float4,
    verticesA: b3Vector3[],
    verticesB: b3Vector3[]
): { separated: boolean; depth: b3Scalar } {
    const projA = b3ProjectAxis(hullA, posA, ornA, sepAxis, verticesA);
    const projB = b3ProjectAxis(hullB, posB, ornB, sepAxis, verticesB);

    // Check for separation
    if (projA.max < projB.min || projB.max < projA.min) {
        return { separated: true, depth: 0 };
    }

    // Calculate penetration depth
    const d0 = projA.max - projB.min;
    const d1 = projB.max - projA.min;
    
    b3Assert(d0 >= 0.0);
    b3Assert(d1 >= 0.0);
    
    const depth = d0 < d1 ? d0 : d1;
    return { separated: false, depth };
}

/**
 * Find a separating axis between two convex polyhedra using SAT
 * This is the main SAT implementation that tests face normals and edge-edge combinations
 * 
 * @param hullA - First convex polyhedron
 * @param hullB - Second convex polyhedron
 * @param posA - Position of hull A
 * @param ornA - Orientation of hull A
 * @param posB - Position of hull B
 * @param ornB - Orientation of hull B
 * @param verticesA - Vertices of hull A
 * @param uniqueEdgesA - Unique edge directions of hull A
 * @param facesA - Face data of hull A
 * @param verticesB - Vertices of hull B
 * @param uniqueEdgesB - Unique edge directions of hull B
 * @param facesB - Face data of hull B
 * @returns Object containing separation result and separating axis
 */
export function b3FindSeparatingAxis(
    hullA: b3ConvexPolyhedronData,
    hullB: b3ConvexPolyhedronData,
    posA1: b3Float4,
    ornA: b3Quaternion,
    posB1: b3Float4,
    ornB: b3Quaternion,
    verticesA: b3Vector3[],
    uniqueEdgesA: b3Vector3[],
    facesA: b3GpuFace[],
    verticesB: b3Vector3[],
    uniqueEdgesB: b3Vector3[],
    facesB: b3GpuFace[]
): { separated: boolean; separatingAxis: b3Vector3 } {
    // Ensure w component is 0 for position vectors
    const posA = new b3Float4(posA1.x, posA1.y, posA1.z, 0);
    const posB = new b3Float4(posB1.x, posB1.y, posB1.z, 0);

    // Calculate center-to-center vector for orientation checks
    const c0local = hullA.m_localCenter;
    const c0 = b3TransformPoint(c0local, posA, ornA);
    const c1local = hullB.m_localCenter;
    const c1 = b3TransformPoint(c1local, posB, ornB);
    const deltaC2 = c0.subtract(c1);

    let dmin = Number.MAX_VALUE;
    let separatingAxis = new b3Vector3(1, 0, 0);

    // Test face normals from hull A
    const numFacesA = hullA.m_numFaces;
    for (let i = 0; i < numFacesA; i++) {
        const normal = facesA[hullA.m_faceOffset + i].m_plane;
        let faceANormalWS = b3QuatRotate(ornA, normal);

        // Ensure normal points away from hull B
        if (b3Dot3F4(deltaC2, faceANormalWS) < 0) {
            faceANormalWS = faceANormalWS.scale(-1);
        }

        const result = b3TestSepAxis(hullA, hullB, posA, ornA, posB, ornB, faceANormalWS, verticesA, verticesB);
        
        if (result.separated) {
            return { separated: true, separatingAxis: new b3Vector3(faceANormalWS.x, faceANormalWS.y, faceANormalWS.z) };
        }

        if (result.depth < dmin) {
            dmin = result.depth;
            separatingAxis = new b3Vector3(faceANormalWS.x, faceANormalWS.y, faceANormalWS.z);
        }
    }

    // Test face normals from hull B
    const numFacesB = hullB.m_numFaces;
    for (let i = 0; i < numFacesB; i++) {
        const normal = facesB[hullB.m_faceOffset + i].m_plane;
        let worldNormal = b3QuatRotate(ornB, normal);

        // Ensure normal points away from hull A
        if (b3Dot3F4(deltaC2, worldNormal) < 0) {
            worldNormal = worldNormal.scale(-1);
        }

        const result = b3TestSepAxis(hullA, hullB, posA, ornA, posB, ornB, worldNormal, verticesA, verticesB);
        
        if (result.separated) {
            return { separated: true, separatingAxis: new b3Vector3(worldNormal.x, worldNormal.y, worldNormal.z) };
        }

        if (result.depth < dmin) {
            dmin = result.depth;
            separatingAxis = new b3Vector3(worldNormal.x, worldNormal.y, worldNormal.z);
        }
    }

    // Test edge-edge combinations
    for (let e0 = 0; e0 < hullA.m_numUniqueEdges; e0++) {
        const edge0 = uniqueEdgesA[hullA.m_uniqueEdgesOffset + e0];
        const edge0Float4 = new b3Float4(edge0.x, edge0.y, edge0.z, 0);
        const edge0World = b3QuatRotate(ornA, edge0Float4);

        for (let e1 = 0; e1 < hullB.m_numUniqueEdges; e1++) {
            const edge1 = uniqueEdgesB[hullB.m_uniqueEdgesOffset + e1];
            const edge1Float4 = new b3Float4(edge1.x, edge1.y, edge1.z, 0);
            const edge1World = b3QuatRotate(ornB, edge1Float4);

            const crossje = b3Cross3(edge0World, edge1World);

            // Skip if cross product is near zero (parallel edges)
            if (!b3IsAlmostZero(crossje)) {
                let normalizedCross = b3FastNormalized3(crossje);
                
                // Ensure consistent orientation
                if (b3Dot3F4(deltaC2, normalizedCross) < 0) {
                    normalizedCross = normalizedCross.scale(-1);
                }

                const result = b3TestSepAxis(hullA, hullB, posA, ornA, posB, ornB, normalizedCross, verticesA, verticesB);
                
                if (result.separated) {
                    return { separated: true, separatingAxis: new b3Vector3(normalizedCross.x, normalizedCross.y, normalizedCross.z) };
                }

                if (result.depth < dmin) {
                    dmin = result.depth;
                    separatingAxis = new b3Vector3(normalizedCross.x, normalizedCross.y, normalizedCross.z);
                }
            }
        }
    }

    // Ensure separating axis points from A to B
    const sepFloat4 = new b3Float4(separatingAxis.x, separatingAxis.y, separatingAxis.z, 0);
    const deltaNeg = deltaC2.scale(-1);
    if (b3Dot3F4(deltaNeg, sepFloat4) > 0.0) {
        separatingAxis = separatingAxis.negate();
    }

    return { separated: false, separatingAxis };
}