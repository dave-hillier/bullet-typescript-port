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
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/shared/b3ContactSphereSphere.h
 * 
 * Sphere-convex collision detection function for narrow phase collision detection.
 * This implements sphere-to-convex hull collision detection using Separating Axis Theorem (SAT).
 * 
 * Key differences from C++ version:
 * - Removed all C++ preprocessor directives and includes
 * - Converted C++ pointers and references to TypeScript object parameters
 * - Converted C++ arrays to TypeScript arrays
 * - Converted C++ primitive types to TypeScript number/boolean
 * - Implemented helper functions inline
 * - Removed manual memory management
 * - Uses TypeScript strict typing and safety
 */

import { b3Float4, b3MakeFloat4, b3Dot3F4 } from '../../../Bullet3Common/shared/b3Float4';
import { b3Contact4Data } from './b3Contact4Data';
import { b3Sqrt } from '../../../Bullet3Common/b3Scalar';
import { b3Vector3 } from '../../../Bullet3Common/b3Vector3';
import { b3Transform } from '../../../Bullet3Common/b3Transform';
import { b3Quat } from '../../BroadPhaseCollision/shared/b3Aabb';
import { b3Collidable } from './b3Collidable';
import { b3ConvexPolyhedronData, b3GpuFace } from './b3ConvexPolyhedronData';

/**
 * Temporary simplified b3RigidBodyData structure until the full version is ported
 * Based on Bullet3Collision/NarrowPhaseCollision/shared/b3RigidBodyData.h
 */
interface b3RigidBodyData {
    m_pos: b3Float4;
    m_quat: b3Quat;
    m_linVel: b3Float4;
    m_angVel: b3Float4;
    m_collidableIdx: number;
    m_invMass: number;
    m_restituitionCoeff: number;
    m_frictionCoeff: number;
}

/**
 * Type alias for compatibility with the original C++ function signature
 */
export type b3Contact4 = b3Contact4Data;

/**
 * Create a b3Float4 vector with specified components
 * Equivalent to C++ b3MakeVector3 macro
 */
function b3MakeVector3(x: number, y: number, z: number, w: number = 0): b3Float4 {
    return b3MakeFloat4(x, y, z, w);
}

/**
 * Calculate signed distance from a point to a plane
 * @param point The point to test
 * @param planeEqn Plane equation (normal + distance)
 * @param closestPointOnFace Output parameter for closest point on face
 * @returns Signed distance (positive = outside, negative = inside)
 */
function signedDistanceFromPointToPlane(
    point: b3Float4, 
    planeEqn: b3Float4, 
    closestPointOnFace: { value: b3Float4 }
): number {
    const n = b3MakeFloat4(planeEqn.x, planeEqn.y, planeEqn.z, 0);
    const dist = b3Dot3F4(n, point) + planeEqn.w;
    closestPointOnFace.value = point.subtract(n.scale(dist));
    return dist;
}

/**
 * Check if a point is inside a polygon face
 * @param p Point to test
 * @param face GPU face data
 * @param baseVertex Array of vertices
 * @param convexIndices Array of vertex indices
 * @param out Output parameter for closest point if outside
 * @returns true if point is inside polygon, false otherwise
 */
function IsPointInPolygon(
    p: b3Float4,
    face: b3GpuFace,
    baseVertex: b3Float4[],
    convexIndices: number[],
    out: { value: b3Float4 }
): boolean {
    const plane = b3MakeVector3(face.m_plane.x, face.m_plane.y, face.m_plane.z, 0);
    
    if (face.m_numIndices < 2) {
        return false;
    }
    
    const v0 = baseVertex[convexIndices[face.m_indexOffset + face.m_numIndices - 1]];
    let b = v0;
    
    for (let i = 0; i < face.m_numIndices; i++) {
        const a = b;
        const vi = baseVertex[convexIndices[face.m_indexOffset + i]];
        b = vi;
        
        const ab = b.subtract(a);
        const ap = p.subtract(a);
        const v = ab.cross3(plane);
        
        if (b3Dot3F4(ap, v) > 0) {
            const ab_m2 = b3Dot3F4(ab, ab);
            const rt = ab_m2 !== 0 ? b3Dot3F4(ab, ap) / ab_m2 : 0;
            
            if (rt <= 0) {
                out.value = a;
            } else if (rt >= 1) {
                out.value = b;
            } else {
                const s = 1 - rt;
                out.value = new b3Float4(
                    s * a.x + rt * b.x,
                    s * a.y + rt * b.y,
                    s * a.z + rt * b.z,
                    0
                );
            }
            return false;
        }
    }
    
    return true;
}

/**
 * Compute contact between a sphere and a convex shape
 * 
 * This function performs narrow phase collision detection between a sphere
 * and a convex polyhedron using the Separating Axis Theorem.
 * 
 * @param pairIndex Index of the collision pair for batching
 * @param bodyIndexA Index of body A (sphere)
 * @param bodyIndexB Index of body B (convex)
 * @param collidableIndexA Index of collidable A (sphere)
 * @param collidableIndexB Index of collidable B (convex)
 * @param rigidBodies Array of rigid body data
 * @param collidables Array of collidable shape data
 * @param convexShapes Array of convex polyhedron data
 * @param convexVertices Array of convex vertices
 * @param convexIndices Array of vertex indices
 * @param faces Array of face data
 * @param globalContactsOut Output array for contact data
 * @param nGlobalContactsOut Reference to current contact count
 * @param maxContactCapacity Maximum number of contacts allowed
 */
export function computeContactSphereConvex(
    pairIndex: number,
    bodyIndexA: number,
    bodyIndexB: number,
    collidableIndexA: number,
    _collidableIndexB: number,
    rigidBodies: b3RigidBodyData[],
    collidables: b3Collidable[],
    convexShapes: b3ConvexPolyhedronData[],
    convexVertices: b3Float4[],
    convexIndices: number[],
    faces: b3GpuFace[],
    globalContactsOut: b3Contact4[],
    nGlobalContactsOut: { value: number },
    maxContactCapacity: number
): void {
    const radius = collidables[collidableIndexA].m_radius;
    const spherePos1 = rigidBodies[bodyIndexA].m_pos;
    
    const pos = rigidBodies[bodyIndexB].m_pos;
    const quat = rigidBodies[bodyIndexB].m_quat;
    
    // Create transform for body B
    const tr = new b3Transform();
    tr.setIdentity();
    tr.setOrigin(new b3Vector3(pos.x, pos.y, pos.z));
    tr.setRotation(quat);
    const trInv = tr.inverse();
    
    // Transform sphere position to local space of body B
    const spherePos = trInv.apply(new b3Vector3(spherePos1.x, spherePos1.y, spherePos1.z));
    const spherePosFloat4 = b3MakeFloat4(spherePos.x, spherePos.y, spherePos.z, 0);
    
    const collidableIndex = rigidBodies[bodyIndexB].m_collidableIdx;
    const shapeIndex = collidables[collidableIndex].m_shapeIndex;
    const numFaces = convexShapes[shapeIndex].m_numFaces;
    
    let closestPnt = b3MakeVector3(0, 0, 0, 0);
    let minDist = -1000000; // TODO: Use proper float limits
    let bCollide = true;
    let region = -1;
    let localHitNormal = b3MakeVector3(0, 0, 0, 0);
    
    // Test against all faces of the convex hull
    for (let f = 0; f < numFaces; f++) {
        const face = faces[convexShapes[shapeIndex].m_faceOffset + f];
        const localPlaneNormal = b3MakeVector3(face.m_plane.x, face.m_plane.y, face.m_plane.z, 0);
        const planeEqn = localPlaneNormal.clone();
        planeEqn.w = face.m_plane.w;
        
        const pntReturn = { value: b3MakeFloat4(0, 0, 0, 0) };
        const dist = signedDistanceFromPointToPlane(spherePosFloat4, planeEqn, pntReturn);
        
        if (dist > radius) {
            bCollide = false;
            break;
        }
        
        if (dist > 0) {
            // Might hit an edge or vertex
            const out = { value: b3MakeFloat4(0, 0, 0, 0) };
            
            const isInPoly = IsPointInPolygon(
                spherePosFloat4,
                face,
                convexVertices.slice(convexShapes[shapeIndex].m_vertexOffset),
                convexIndices,
                out
            );
            
            if (isInPoly) {
                if (dist > minDist) {
                    minDist = dist;
                    closestPnt = pntReturn.value;
                    localHitNormal = planeEqn;
                    region = 1;
                }
            } else {
                const tmp = spherePosFloat4.subtract(out.value);
                const l2 = tmp.length2();
                
                if (l2 < radius * radius) {
                    const newDist = b3Sqrt(l2);
                    if (newDist > minDist) {
                        minDist = newDist;
                        closestPnt = out.value;
                        localHitNormal = tmp.scale(1 / newDist);
                        region = 2;
                    }
                } else {
                    bCollide = false;
                    break;
                }
            }
        } else {
            if (dist > minDist) {
                minDist = dist;
                closestPnt = pntReturn.value;
                localHitNormal = planeEqn;
                region = 3;
            }
        }
    }
    
    // Static counter for debugging (converted from C++ static)
    // In production code, this could be removed or made part of a debug context
    
    if (bCollide && minDist > -10000) {
        const normalOnSurfaceB1 = tr.getBasis().multiplyVector(
            new b3Vector3(localHitNormal.x, localHitNormal.y, localHitNormal.z)
        );
        const normalOnSurfaceB1Float4 = b3MakeFloat4(normalOnSurfaceB1.x, normalOnSurfaceB1.y, normalOnSurfaceB1.z, 0);
        
        const pOnB1Vec = tr.apply(new b3Vector3(closestPnt.x, closestPnt.y, closestPnt.z));
        const pOnB1 = b3MakeFloat4(pOnB1Vec.x, pOnB1Vec.y, pOnB1Vec.z, 0);
        
        const actualDepth = minDist - radius;
        
        if (actualDepth < 0) {
            pOnB1.w = actualDepth;
            
            if (nGlobalContactsOut.value < maxContactCapacity) {
                const dstIdx = nGlobalContactsOut.value;
                nGlobalContactsOut.value++;
                
                const c = globalContactsOut[dstIdx];
                c.m_worldNormalOnB = normalOnSurfaceB1Float4;
                c.m_frictionCoeffCmp = 0.7;
                c.m_restituitionCoeffCmp = 0;
                
                c.m_batchIdx = pairIndex;
                c.m_bodyAPtrAndSignBit = rigidBodies[bodyIndexA].m_invMass === 0 ? -bodyIndexA : bodyIndexA;
                c.m_bodyBPtrAndSignBit = rigidBodies[bodyIndexB].m_invMass === 0 ? -bodyIndexB : bodyIndexB;
                c.m_worldPosB[0] = pOnB1;
                const numPoints = 1;
                c.m_worldNormalOnB.w = numPoints;
                
                // Debug: region indicates the type of contact found
                // region = 1: face contact, region = 2: edge/vertex contact, region = 3: inside contact
                // This could be used for debugging or contact type classification
                void region; // Suppress unused variable warning
            }
        }
    }
}