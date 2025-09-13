/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

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

/**
 * TypeScript port of Bullet3's btAabbUtil2.h
 * Utility functions for Axis-Aligned Bounding Box (AABB) operations
 */

import { btVector3 } from './btVector3';
import { btTransform } from './btTransform';
import { btMin, btMax } from './btMinMax';
import { btAssert, btSelectUnsigned } from './btScalar';

/**
 * Expands an AABB by the given expansion values
 * @param aabbMin Minimum bounds of the AABB to modify
 * @param aabbMax Maximum bounds of the AABB to modify
 * @param expansionMin Minimum expansion values
 * @param expansionMax Maximum expansion values
 */
export function AabbExpand(
    aabbMin: btVector3,
    aabbMax: btVector3,
    expansionMin: btVector3,
    expansionMax: btVector3
): void {
    aabbMin.copy(aabbMin.add(expansionMin));
    aabbMax.copy(aabbMax.add(expansionMax));
}

/**
 * Conservative test for overlap between a point and an AABB
 * @param aabbMin1 Minimum bounds of the AABB
 * @param aabbMax1 Maximum bounds of the AABB
 * @param point Point to test
 * @returns True if the point is inside the AABB
 */
export function TestPointAgainstAabb2(
    aabbMin1: btVector3,
    aabbMax1: btVector3,
    point: btVector3
): boolean {
    let overlap = true;
    overlap = (aabbMin1.getX() > point.getX() || aabbMax1.getX() < point.getX()) ? false : overlap;
    overlap = (aabbMin1.getZ() > point.getZ() || aabbMax1.getZ() < point.getZ()) ? false : overlap;
    overlap = (aabbMin1.getY() > point.getY() || aabbMax1.getY() < point.getY()) ? false : overlap;
    return overlap;
}

/**
 * Conservative test for overlap between two AABBs
 * @param aabbMin1 Minimum bounds of the first AABB
 * @param aabbMax1 Maximum bounds of the first AABB
 * @param aabbMin2 Minimum bounds of the second AABB
 * @param aabbMax2 Maximum bounds of the second AABB
 * @returns True if the AABBs overlap
 */
export function TestAabbAgainstAabb2(
    aabbMin1: btVector3,
    aabbMax1: btVector3,
    aabbMin2: btVector3,
    aabbMax2: btVector3
): boolean {
    let overlap = true;
    overlap = (aabbMin1.getX() > aabbMax2.getX() || aabbMax1.getX() < aabbMin2.getX()) ? false : overlap;
    overlap = (aabbMin1.getZ() > aabbMax2.getZ() || aabbMax1.getZ() < aabbMin2.getZ()) ? false : overlap;
    overlap = (aabbMin1.getY() > aabbMax2.getY() || aabbMax1.getY() < aabbMin2.getY()) ? false : overlap;
    return overlap;
}

/**
 * Conservative test for overlap between a triangle and an AABB
 * @param vertices Array of three vertices defining the triangle
 * @param aabbMin Minimum bounds of the AABB
 * @param aabbMax Maximum bounds of the AABB
 * @returns True if the triangle overlaps with the AABB
 */
export function TestTriangleAgainstAabb2(
    vertices: btVector3[],
    aabbMin: btVector3,
    aabbMax: btVector3
): boolean {
    const p1 = vertices[0];
    const p2 = vertices[1];
    const p3 = vertices[2];

    if (btMin(btMin(p1.getX(), p2.getX()), p3.getX()) > aabbMax.getX()) return false;
    if (btMax(btMax(p1.getX(), p2.getX()), p3.getX()) < aabbMin.getX()) return false;

    if (btMin(btMin(p1.getZ(), p2.getZ()), p3.getZ()) > aabbMax.getZ()) return false;
    if (btMax(btMax(p1.getZ(), p2.getZ()), p3.getZ()) < aabbMin.getZ()) return false;

    if (btMin(btMin(p1.getY(), p2.getY()), p3.getY()) > aabbMax.getY()) return false;
    if (btMax(btMax(p1.getY(), p2.getY()), p3.getY()) < aabbMin.getY()) return false;
    
    return true;
}

/**
 * Computes the outcode for a point against half extents
 * @param p Point to test
 * @param halfExtent Half extents defining the bounds
 * @returns Outcode bits indicating which bounds the point exceeds
 */
export function btOutcode(p: btVector3, halfExtent: btVector3): number {
    return (p.getX() < -halfExtent.getX() ? 0x01 : 0x0) |
           (p.getX() > halfExtent.getX() ? 0x08 : 0x0) |
           (p.getY() < -halfExtent.getY() ? 0x02 : 0x0) |
           (p.getY() > halfExtent.getY() ? 0x10 : 0x0) |
           (p.getZ() < -halfExtent.getZ() ? 0x4 : 0x0) |
           (p.getZ() > halfExtent.getZ() ? 0x20 : 0x0);
}

/**
 * Ray-AABB intersection test using inverse direction and ray signs
 * @param rayFrom Ray origin
 * @param rayInvDirection Inverse ray direction
 * @param raySign Array indicating the sign of each ray direction component
 * @param bounds Array of two vectors representing the AABB bounds [min, max]
 * @param tmin Output parameter for the minimum intersection distance
 * @param lambda_min Minimum lambda value
 * @param lambda_max Maximum lambda value
 * @returns True if the ray intersects the AABB
 */
export function btRayAabb2(
    rayFrom: btVector3,
    rayInvDirection: btVector3,
    raySign: number[],
    bounds: btVector3[],
    tmin: { value: number },
    lambda_min: number,
    lambda_max: number
): boolean {
    let tmax: number, tymin: number, tymax: number, tzmin: number, tzmax: number;
    
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
    return ((tmin.value < lambda_max) && (tmax > lambda_min));
}

/**
 * Ray-AABB intersection test with normal computation
 * @param rayFrom Ray origin
 * @param rayTo Ray end point
 * @param aabbMin Minimum bounds of the AABB
 * @param aabbMax Maximum bounds of the AABB
 * @param param Output parameter for intersection parameter
 * @param normal Output normal at intersection point
 * @returns True if the ray intersects the AABB
 */
export function btRayAabb(
    rayFrom: btVector3,
    rayTo: btVector3,
    aabbMin: btVector3,
    aabbMax: btVector3,
    param: { value: number },
    normal: btVector3
): boolean {
    const aabbHalfExtent = aabbMax.subtract(aabbMin).multiply(0.5);
    const aabbCenter = aabbMax.add(aabbMin).multiply(0.5);
    const source = rayFrom.subtract(aabbCenter);
    const target = rayTo.subtract(aabbCenter);
    const sourceOutcode = btOutcode(source, aabbHalfExtent);
    const targetOutcode = btOutcode(target, aabbHalfExtent);
    
    if ((sourceOutcode & targetOutcode) === 0x0) {
        let lambda_enter = 0.0;
        let lambda_exit = param.value;
        const r = target.subtract(source);
        let normSign = 1;
        const hitNormal = new btVector3(0, 0, 0);
        let bit = 1;

        for (let j = 0; j < 2; j++) {
            for (let i = 0; i !== 3; ++i) {
                if (sourceOutcode & bit) {
                    const lambda = (-source.getAt(i) - aabbHalfExtent.getAt(i) * normSign) / r.getAt(i);
                    if (lambda_enter <= lambda) {
                        lambda_enter = lambda;
                        hitNormal.setValue(0, 0, 0);
                        hitNormal.setAt(i, normSign);
                    }
                } else if (targetOutcode & bit) {
                    const lambda = (-source.getAt(i) - aabbHalfExtent.getAt(i) * normSign) / r.getAt(i);
                    if (lambda < lambda_exit) {
                        lambda_exit = lambda;
                    }
                }
                bit <<= 1;
            }
            normSign = -1;
        }
        if (lambda_enter <= lambda_exit) {
            param.value = lambda_enter;
            normal.copy(hitNormal);
            return true;
        }
    }
    return false;
}

/**
 * Transforms an AABB defined by half extents with a margin
 * @param halfExtents Half extents of the original AABB
 * @param margin Margin to add to the AABB
 * @param t Transform to apply
 * @param aabbMinOut Output minimum bounds
 * @param aabbMaxOut Output maximum bounds
 */
export function btTransformAabb(
    halfExtents: btVector3,
    margin: number,
    t: btTransform,
    aabbMinOut: btVector3,
    aabbMaxOut: btVector3
): void {
    const halfExtentsWithMargin = halfExtents.add(new btVector3(margin, margin, margin));
    const abs_b = t.getBasis().absolute();
    const center = t.getOrigin();
    const extent = halfExtentsWithMargin.dot3(abs_b.getRow(0), abs_b.getRow(1), abs_b.getRow(2));
    aabbMinOut.copy(center.subtract(extent));
    aabbMaxOut.copy(center.add(extent));
}

/**
 * Transforms an AABB defined by min/max bounds with a margin
 * @param localAabbMin Local minimum bounds
 * @param localAabbMax Local maximum bounds
 * @param margin Margin to add to the AABB
 * @param trans Transform to apply
 * @param aabbMinOut Output minimum bounds
 * @param aabbMaxOut Output maximum bounds
 */
export function btTransformAabbOverload(
    localAabbMin: btVector3,
    localAabbMax: btVector3,
    margin: number,
    trans: btTransform,
    aabbMinOut: btVector3,
    aabbMaxOut: btVector3
): void {
    btAssert(localAabbMin.getX() <= localAabbMax.getX());
    btAssert(localAabbMin.getY() <= localAabbMax.getY());
    btAssert(localAabbMin.getZ() <= localAabbMax.getZ());
    
    let localHalfExtents = localAabbMax.subtract(localAabbMin).multiply(0.5);
    localHalfExtents = localHalfExtents.add(new btVector3(margin, margin, margin));

    const localCenter = localAabbMax.add(localAabbMin).multiply(0.5);
    const abs_b = trans.getBasis().absolute();
    const center = trans.transformPoint(localCenter);
    const extent = localHalfExtents.dot3(abs_b.getRow(0), abs_b.getRow(1), abs_b.getRow(2));
    aabbMinOut.copy(center.subtract(extent));
    aabbMaxOut.copy(center.add(extent));
}

/**
 * Tests overlap between two quantized AABBs using branchless approach
 * @param aabbMin1 Minimum bounds of the first AABB (quantized as unsigned short)
 * @param aabbMax1 Maximum bounds of the first AABB (quantized as unsigned short)
 * @param aabbMin2 Minimum bounds of the second AABB (quantized as unsigned short)
 * @param aabbMax2 Maximum bounds of the second AABB (quantized as unsigned short)
 * @returns 1 if AABBs overlap, 0 otherwise
 */
export function testQuantizedAabbAgainstQuantizedAabb(
    aabbMin1: number[],
    aabbMax1: number[],
    aabbMin2: number[],
    aabbMax2: number[]
): number {
    // Branchless implementation using btSelectUnsigned
    const overlapCondition = (aabbMin1[0] <= aabbMax2[0]) &&
                             (aabbMax1[0] >= aabbMin2[0]) &&
                             (aabbMin1[2] <= aabbMax2[2]) &&
                             (aabbMax1[2] >= aabbMin2[2]) &&
                             (aabbMin1[1] <= aabbMax2[1]) &&
                             (aabbMax1[1] >= aabbMin2[1]);
    
    return btSelectUnsigned(overlapCondition ? 1 : 0, 1, 0);
}