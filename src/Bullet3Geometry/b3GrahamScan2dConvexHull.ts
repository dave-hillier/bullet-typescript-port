/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

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
 * TypeScript port of Bullet3Geometry/b3GrahamScan2dConvexHull.h
 * Graham scan algorithm for computing 2D convex hulls
 */

import { b3Vector3, b3Cross, b3PlaneSpace1 } from '../Bullet3Common/b3Vector3';
import { b3AlignedObjectArray } from '../Bullet3Common/b3AlignedObjectArray';
import { b3Scalar } from '../Bullet3Common/b3Scalar';

/**
 * Extended b3Vector3 with additional properties for Graham scan algorithm
 */
export class b3GrahamVector3 extends b3Vector3 {
    public m_angle: b3Scalar = 0;
    public m_orgIndex: number;

    constructor(org: b3Vector3, orgIndex: number) {
        super(org.getX(), org.getY(), org.getZ(), org.getW());
        this.m_orgIndex = orgIndex;
    }
}

/**
 * Comparison function for sorting points by angle for Graham scan
 */
export class b3AngleCompareFunc {
    public m_anchor: b3Vector3;

    constructor(anchor: b3Vector3) {
        this.m_anchor = anchor;
    }

    /**
     * Compare two b3GrahamVector3 points for sorting
     * Returns true if 'a' should come before 'b' in sorted order
     * 
     * Sorting criteria (in order of priority):
     * 1. By angle with respect to anchor point
     * 2. By squared distance from anchor point
     * 3. By original index
     */
    call(a: b3GrahamVector3, b: b3GrahamVector3): boolean {
        if (a.m_angle !== b.m_angle) {
            return a.m_angle < b.m_angle;
        } else {
            const al = a.subtract(this.m_anchor).length2();
            const bl = b.subtract(this.m_anchor).length2();
            if (al !== bl) {
                return al < bl;
            } else {
                return a.m_orgIndex < b.m_orgIndex;
            }
        }
    }
}

/**
 * Graham scan algorithm for computing 2D convex hull
 * 
 * @param originalPoints Input points to compute convex hull for
 * @param hull Output array that will contain the convex hull points
 * @param normalAxis Normal vector defining the 2D plane
 * 
 * The algorithm works by:
 * 1. Finding the anchor point with smallest projection on the first axis
 * 2. Computing angles of all other points relative to the anchor
 * 3. Sorting points by angle
 * 4. Using a stack-based approach to eliminate concave points
 */
export function b3GrahamScanConvexHull2D(
    originalPoints: b3AlignedObjectArray<b3GrahamVector3>,
    hull: b3AlignedObjectArray<b3GrahamVector3>,
    normalAxis: b3Vector3
): void {
    // Create orthonormal basis in the 2D plane
    const axis0 = new b3Vector3();
    const axis1 = new b3Vector3();
    b3PlaneSpace1(normalAxis, axis0, axis1);

    // Handle trivial cases
    if (originalPoints.size() <= 1) {
        for (let i = 0; i < originalPoints.size(); i++) {
            hull.push_back(originalPoints.get(0));
        }
        return;
    }

    // Step 1: Find anchor point with smallest projection on axis0 and move it to first location
    for (let i = 0; i < originalPoints.size(); i++) {
        const projL = originalPoints.get(i).dot(axis0);
        const projR = originalPoints.get(0).dot(axis0);
        if (projL < projR) {
            originalPoints.swap(0, i);
        }
    }

    // Step 2: Precompute angles for all points relative to the anchor
    originalPoints.get(0).m_angle = -1e30; // Very small angle for anchor point

    for (let i = 1; i < originalPoints.size(); i++) {
        const xvec = axis0.clone();
        const ar = originalPoints.get(i).subtract(originalPoints.get(0));
        
        // Calculate angle using cross product and dot product
        // angle = cross(xvec, ar) · normalAxis / |ar|
        originalPoints.get(i).m_angle = b3Cross(xvec, ar).dot(normalAxis) / ar.length();
    }

    // Step 3: Sort all points based on angle with anchor point
    const comp = new b3AngleCompareFunc(originalPoints.get(0));
    originalPoints.quickSortInternal(
        (a: b3GrahamVector3, b: b3GrahamVector3) => comp.call(a, b),
        1,
        originalPoints.size() - 1
    );

    // Step 4: Initialize hull with first two points
    let i: number;
    for (i = 0; i < 2 && i < originalPoints.size(); i++) {
        hull.push_back(originalPoints.get(i));
    }

    // Step 5: Process remaining points using Graham scan
    // Keep all 'convex' points and discard concave points using backtracking
    for (; i < originalPoints.size(); i++) {
        let isConvex = false;
        
        while (!isConvex && hull.size() > 1) {
            const a = hull.get(hull.size() - 2);
            const b = hull.get(hull.size() - 1);
            
            // Check if the turn from 'a' to 'b' to current point is counter-clockwise
            // This is done by computing the cross product and checking its sign
            isConvex = b3Cross(a.subtract(b), a.subtract(originalPoints.get(i))).dot(normalAxis) > 0;
            
            if (!isConvex) {
                // Remove the last point from hull as it creates a concave turn
                hull.pop_back();
            } else {
                // Add current point to hull
                hull.push_back(originalPoints.get(i));
            }
        }

        // Handle case where hull has only one point left
        if (hull.size() <= 1 && i < originalPoints.size()) {
            hull.push_back(originalPoints.get(i));
        }
    }
}