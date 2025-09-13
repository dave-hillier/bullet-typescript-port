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
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/shared/b3ReduceContacts.h
 * 
 * Contact reduction algorithm for reducing a large number of contact points
 * to a manageable subset while preserving the most important contacts.
 */

import { b3Float4, b3MakeFloat4, b3Dot3F4, b3Cross3, b3FastNormalized3 } from '../../../Bullet3Common/shared/b3Float4';
import { b3Int4 } from '../../../Bullet3Common/shared/b3Int4';

/**
 * Reduces a set of contact points to at most 4 contacts.
 * This function implements a contact reduction algorithm that selects
 * the most important contacts from a larger set to maintain stability
 * while keeping computational cost manageable.
 * 
 * The algorithm:
 * 1. If 4 or fewer contacts, return all
 * 2. Find the contact with deepest penetration
 * 3. Find contacts at extremes along two orthogonal directions
 * 4. Ensure the deepest contact is included in the final set
 * 
 * @param p Array of contact points (position + penetration depth in w component)
 * @param nPoints Number of points in the array
 * @param nearNormal The surface normal at the contact point
 * @param contactIdx Output array to store indices of selected contacts
 * @returns Number of contacts in the reduced set (0-4)
 */
export function b3ReduceContacts(
    p: b3Float4[], 
    nPoints: number, 
    nearNormal: b3Float4, 
    contactIdx: b3Int4[]
): number {
    if (nPoints === 0) {
        return 0;
    }

    if (nPoints <= 4) {
        return nPoints;
    }

    // Limit to maximum 64 contacts for performance
    if (nPoints > 64) {
        nPoints = 64;
    }

    // Calculate the center point of all contacts
    let center = b3MakeFloat4(0, 0, 0, 0);
    for (let i = 0; i < nPoints; i++) {
        center = center.add(p[i]);
    }
    center = center.scale(1.0 / nPoints);

    // Sample 4 directions - create two orthogonal vectors in the contact plane
    const aVector = p[0].subtract(center);
    const u = b3FastNormalized3(b3Cross3(nearNormal, aVector));
    const v = b3FastNormalized3(b3Cross3(nearNormal, u));

    // Keep point with deepest penetration (smallest w value - most negative)
    let minW = Number.MAX_VALUE;
    let minIndex = -1;

    // Track minimum dot products in 4 directions (most negative = furthest)
    const maxDots = b3MakeFloat4(
        Number.POSITIVE_INFINITY, // u direction 
        Number.POSITIVE_INFINITY, // -u direction
        Number.POSITIVE_INFINITY, // v direction
        Number.POSITIVE_INFINITY  // -v direction
    );

    // Initialize contact indices
    contactIdx[0] = new b3Int4(-1, -1, -1, -1);

    // Find extremes and deepest penetration
    for (let ie = 0; ie < nPoints; ie++) {
        // Track deepest penetration (most negative w)
        if (p[ie].w < minW) {
            minW = p[ie].w;
            minIndex = ie;
        }

        // Vector from center to this contact point
        const r = p[ie].subtract(center);

        // Check projection along u direction (find most negative = furthest in +u)
        let f = b3Dot3F4(u, r);
        if (f < maxDots.x) {
            maxDots.x = f;
            contactIdx[0].x = ie;
        }

        // Check projection along -u direction (find most negative = furthest in -u)
        f = b3Dot3F4(u.scale(-1), r);
        if (f < maxDots.y) {
            maxDots.y = f;
            contactIdx[0].y = ie;
        }

        // Check projection along v direction (find most negative = furthest in +v)
        f = b3Dot3F4(v, r);
        if (f < maxDots.z) {
            maxDots.z = f;
            contactIdx[0].z = ie;
        }

        // Check projection along -v direction (find most negative = furthest in -v)
        f = b3Dot3F4(v.scale(-1), r);
        if (f < maxDots.w) {
            maxDots.w = f;
            contactIdx[0].w = ie;
        }
    }

    // Ensure the deepest penetration contact is included
    // If it's not already in our 4 extreme contacts, replace the first one
    if (contactIdx[0].x !== minIndex && 
        contactIdx[0].y !== minIndex && 
        contactIdx[0].z !== minIndex && 
        contactIdx[0].w !== minIndex) {
        // Replace the first contact with the deepest penetration contact
        // TODO: Could replace the contact with least penetration instead
        contactIdx[0].x = minIndex;
    }

    return 4;
}