/*
Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

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
 * TypeScript port of Bullet3Geometry/b3AabbUtil.h
 * AABB (Axis-Aligned Bounding Box) utility functions for the Bullet3 physics engine
 */

import { b3Vector3, b3MakeVector3 } from '../Bullet3Common/b3Vector3';
import { b3Transform } from '../Bullet3Common/b3Transform';
import { b3Min, b3Max, b3SetMin } from '../Bullet3Common/b3MinMax';
import { b3Scalar, b3Select } from '../Bullet3Common/b3Scalar';

/**
 * Expand an AABB by adding expansion vectors
 * @param aabbMin Minimum bounds of the AABB (modified in place)
 * @param aabbMax Maximum bounds of the AABB (modified in place)
 * @param expansionMin Expansion vector for minimum bounds
 * @param expansionMax Expansion vector for maximum bounds
 */
export function b3AabbExpand(
    aabbMin: b3Vector3,
    aabbMax: b3Vector3,
    expansionMin: b3Vector3,
    expansionMax: b3Vector3
): void {
    aabbMin.addAssign(expansionMin);
    aabbMax.addAssign(expansionMax);
}

/**
 * Conservative test for overlap between a point and an AABB
 * @param aabbMin Minimum bounds of the AABB
 * @param aabbMax Maximum bounds of the AABB
 * @param point The point to test
 * @returns True if the point is inside or on the boundary of the AABB
 */
export function b3TestPointAgainstAabb2(
    aabbMin: b3Vector3,
    aabbMax: b3Vector3,
    point: b3Vector3
): boolean {
    let overlap = true;
    overlap = (aabbMin.getX() > point.getX() || aabbMax.getX() < point.getX()) ? false : overlap;
    overlap = (aabbMin.getZ() > point.getZ() || aabbMax.getZ() < point.getZ()) ? false : overlap;
    overlap = (aabbMin.getY() > point.getY() || aabbMax.getY() < point.getY()) ? false : overlap;
    return overlap;
}

/**
 * Conservative test for overlap between two AABBs
 * @param aabbMin1 Minimum bounds of first AABB
 * @param aabbMax1 Maximum bounds of first AABB
 * @param aabbMin2 Minimum bounds of second AABB
 * @param aabbMax2 Maximum bounds of second AABB
 * @returns True if the AABBs overlap
 */
export function b3TestAabbAgainstAabb2(
    aabbMin1: b3Vector3,
    aabbMax1: b3Vector3,
    aabbMin2: b3Vector3,
    aabbMax2: b3Vector3
): boolean {
    let overlap = true;
    overlap = (aabbMin1.getX() > aabbMax2.getX() || aabbMax1.getX() < aabbMin2.getX()) ? false : overlap;
    overlap = (aabbMin1.getZ() > aabbMax2.getZ() || aabbMax1.getZ() < aabbMin2.getZ()) ? false : overlap;
    overlap = (aabbMin1.getY() > aabbMax2.getY() || aabbMax1.getY() < aabbMin2.getY()) ? false : overlap;
    return overlap;
}

/**
 * Conservative test for overlap between a triangle and an AABB
 * @param vertices Array of 3 vertices representing the triangle
 * @param aabbMin Minimum bounds of the AABB
 * @param aabbMax Maximum bounds of the AABB
 * @returns True if the triangle overlaps with the AABB
 */
export function b3TestTriangleAgainstAabb2(
    vertices: b3Vector3[],
    aabbMin: b3Vector3,
    aabbMax: b3Vector3
): boolean {
    const p1 = vertices[0];
    const p2 = vertices[1];
    const p3 = vertices[2];

    if (b3Min(b3Min(p1.get(0), p2.get(0)), p3.get(0)) > aabbMax.get(0)) return false;
    if (b3Max(b3Max(p1.get(0), p2.get(0)), p3.get(0)) < aabbMin.get(0)) return false;

    if (b3Min(b3Min(p1.get(2), p2.get(2)), p3.get(2)) > aabbMax.get(2)) return false;
    if (b3Max(b3Max(p1.get(2), p2.get(2)), p3.get(2)) < aabbMin.get(2)) return false;

    if (b3Min(b3Min(p1.get(1), p2.get(1)), p3.get(1)) > aabbMax.get(1)) return false;
    if (b3Max(b3Max(p1.get(1), p2.get(1)), p3.get(1)) < aabbMin.get(1)) return false;
    
    return true;
}

/**
 * Generate outcode for a point relative to a half-extent box
 * @param p The point to test
 * @param halfExtent Half-extents of the box
 * @returns Outcode bits indicating which sides the point is outside
 */
export function b3Outcode(p: b3Vector3, halfExtent: b3Vector3): number {
    return (p.getX() < -halfExtent.getX() ? 0x01 : 0x0) |
           (p.getX() > halfExtent.getX() ? 0x08 : 0x0) |
           (p.getY() < -halfExtent.getY() ? 0x02 : 0x0) |
           (p.getY() > halfExtent.getY() ? 0x10 : 0x0) |
           (p.getZ() < -halfExtent.getZ() ? 0x4 : 0x0) |
           (p.getZ() > halfExtent.getZ() ? 0x20 : 0x0);
}

/**
 * Ray-AABB intersection test using optimized algorithm
 * @param rayFrom Ray origin
 * @param rayInvDirection Inverse direction vector of the ray
 * @param raySign Array indicating sign of direction components [3]
 * @param bounds Array of AABB bounds [min, max]
 * @param tmin Output parameter for minimum intersection parameter
 * @param lambdaMin Minimum ray parameter to consider
 * @param lambdaMax Maximum ray parameter to consider
 * @returns True if ray intersects AABB within the given parameter range
 */
export function b3RayAabb2(
    rayFrom: b3Vector3,
    rayInvDirection: b3Vector3,
    raySign: number[],
    bounds: b3Vector3[],
    tmin: { value: b3Scalar },
    lambdaMin: b3Scalar,
    lambdaMax: b3Scalar
): boolean {
    let tmax: b3Scalar;
    let tymin: b3Scalar;
    let tymax: b3Scalar;
    let tzmin: b3Scalar;
    let tzmax: b3Scalar;

    tmin.value = (bounds[raySign[0]].getX() - rayFrom.getX()) * rayInvDirection.getX();
    tmax = (bounds[1 - raySign[0]].getX() - rayFrom.getX()) * rayInvDirection.getX();
    tymin = (bounds[raySign[1]].getY() - rayFrom.getY()) * rayInvDirection.getY();
    tymax = (bounds[1 - raySign[1]].getY() - rayFrom.getY()) * rayInvDirection.getY();

    if ((tmin.value > tymax) || (tymin > tmax))
        return false;

    if (tymin > tmin.value)
        tmin.value = tymin;

    if (tymax < tmax)
        tmax = tymax;

    tzmin = (bounds[raySign[2]].getZ() - rayFrom.getZ()) * rayInvDirection.getZ();
    tzmax = (bounds[1 - raySign[2]].getZ() - rayFrom.getZ()) * rayInvDirection.getZ();

    if ((tmin.value > tzmax) || (tzmin > tmax))
        return false;
    if (tzmin > tmin.value)
        tmin.value = tzmin;
    if (tzmax < tmax)
        tmax = tzmax;
    return ((tmin.value < lambdaMax) && (tmax > lambdaMin));
}

/**
 * Ray-AABB intersection test returning hit parameter and normal
 * @param rayFrom Ray origin
 * @param rayTo Ray destination
 * @param aabbMin Minimum bounds of AABB
 * @param aabbMax Maximum bounds of AABB
 * @param param Input/output ray parameter (input: max distance, output: hit distance)
 * @param normal Output hit normal
 * @returns True if ray hits AABB
 */
export function b3RayAabb(
    rayFrom: b3Vector3,
    rayTo: b3Vector3,
    aabbMin: b3Vector3,
    aabbMax: b3Vector3,
    param: { value: b3Scalar },
    normal: b3Vector3
): boolean {
    const aabbHalfExtent = aabbMax.subtract(aabbMin).scale(0.5);
    const aabbCenter = aabbMax.add(aabbMin).scale(0.5);
    const source = rayFrom.subtract(aabbCenter);
    const target = rayTo.subtract(aabbCenter);
    const sourceOutcode = b3Outcode(source, aabbHalfExtent);
    const targetOutcode = b3Outcode(target, aabbHalfExtent);
    
    if ((sourceOutcode & targetOutcode) === 0x0) {
        let lambdaEnter = 0.0;
        let lambdaExit = param.value;
        const r = target.subtract(source);
        let normSign = 1;
        const hitNormal = b3MakeVector3(0, 0, 0);
        let bit = 1;

        for (let j = 0; j < 2; j++) {
            for (let i = 0; i !== 3; ++i) {
                if (sourceOutcode & bit) {
                    const lambda = (-source.get(i) - aabbHalfExtent.get(i) * normSign) / r.get(i);
                    if (lambdaEnter <= lambda) {
                        lambdaEnter = lambda;
                        hitNormal.setValue(0, 0, 0);
                        hitNormal.set(i, normSign);
                    }
                }
                else if (targetOutcode & bit) {
                    const lambda = (-source.get(i) - aabbHalfExtent.get(i) * normSign) / r.get(i);
                    b3SetMin({ value: lambdaExit }, lambda);
                }
                bit <<= 1;
            }
            normSign = -1;
        }
        
        if (lambdaEnter <= lambdaExit) {
            param.value = lambdaEnter;
            normal.setX(hitNormal.getX());
            normal.setY(hitNormal.getY());
            normal.setZ(hitNormal.getZ());
            return true;
        }
    }
    return false;
}

/**
 * Transform AABB from half-extents and margin
 * @param halfExtents Half-extents of the local AABB
 * @param margin Additional margin to expand the AABB
 * @param t Transform to apply
 * @param aabbMinOut Output minimum bounds
 * @param aabbMaxOut Output maximum bounds
 */
export function b3TransformAabbFromHalfExtents(
    halfExtents: b3Vector3,
    margin: b3Scalar,
    t: b3Transform,
    aabbMinOut: b3Vector3,
    aabbMaxOut: b3Vector3
): void {
    const halfExtentsWithMargin = halfExtents.add(b3MakeVector3(margin, margin, margin));
    const absB = t.getBasis().absolute();
    const center = t.getOrigin();
    const extent = halfExtentsWithMargin.dot3(absB.getRow(0), absB.getRow(1), absB.getRow(2));
    
    const minResult = center.subtract(extent);
    const maxResult = center.add(extent);
    
    aabbMinOut.setX(minResult.getX());
    aabbMinOut.setY(minResult.getY());
    aabbMinOut.setZ(minResult.getZ());
    
    aabbMaxOut.setX(maxResult.getX());
    aabbMaxOut.setY(maxResult.getY());
    aabbMaxOut.setZ(maxResult.getZ());
}

/**
 * Transform AABB from local min/max bounds
 * @param localAabbMin Local minimum bounds
 * @param localAabbMax Local maximum bounds
 * @param margin Additional margin to expand the AABB
 * @param trans Transform to apply
 * @param aabbMinOut Output minimum bounds
 * @param aabbMaxOut Output maximum bounds
 */
export function b3TransformAabb(
    localAabbMin: b3Vector3,
    localAabbMax: b3Vector3,
    margin: b3Scalar,
    trans: b3Transform,
    aabbMinOut: b3Vector3,
    aabbMaxOut: b3Vector3
): void {
    const localHalfExtents = localAabbMax.subtract(localAabbMin).scale(0.5);
    const localHalfExtentsWithMargin = localHalfExtents.add(b3MakeVector3(margin, margin, margin));

    const localCenter = localAabbMax.add(localAabbMin).scale(0.5);
    const absB = trans.getBasis().absolute();
    const center = trans.apply(localCenter);
    const extent = localHalfExtentsWithMargin.dot3(absB.getRow(0), absB.getRow(1), absB.getRow(2));
    
    const minResult = center.subtract(extent);
    const maxResult = center.add(extent);
    
    aabbMinOut.setX(minResult.getX());
    aabbMinOut.setY(minResult.getY());
    aabbMinOut.setZ(minResult.getZ());
    
    aabbMaxOut.setX(maxResult.getX());
    aabbMaxOut.setY(maxResult.getY());
    aabbMaxOut.setZ(maxResult.getZ());
}

/**
 * Test for overlap between two quantized AABBs (branchless version)
 * @param aabbMin1 Quantized minimum bounds of first AABB
 * @param aabbMax1 Quantized maximum bounds of first AABB
 * @param aabbMin2 Quantized minimum bounds of second AABB
 * @param aabbMax2 Quantized maximum bounds of second AABB
 * @returns Non-zero if AABBs overlap, zero otherwise
 */
export function b3TestQuantizedAabbAgainstQuantizedAabb(
    aabbMin1: number[],
    aabbMax1: number[],
    aabbMin2: number[],
    aabbMax2: number[]
): number {
    // Using branchless version for better performance
    const overlapCondition = 
        (aabbMin1[0] <= aabbMax2[0]) && (aabbMax1[0] >= aabbMin2[0]) &&
        (aabbMin1[2] <= aabbMax2[2]) && (aabbMax1[2] >= aabbMin2[2]) &&
        (aabbMin1[1] <= aabbMax2[1]) && (aabbMax1[1] >= aabbMin2[1]);
    
    return b3Select(overlapCondition ? 1 : 0, 1, 0);
}