/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Erwin Coumans  http://bulletphysics.org

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

Elsevier CDROM license agreements grants nonexclusive license to use the software
for any purpose, commercial or non-commercial as long as the following credit is included
identifying the original source of the software:

Parts of the source are "from the book Real-Time Collision Detection by
Christer Ericson, published by Morgan Kaufmann Publishers,
(c) 2005 Elsevier Inc."
*/

import { btVector3 } from "../../LinearMath/btVector3";
import { btSimplexSolverInterface } from "./btSimplexSolverInterface";
import { BT_LARGE_FLOAT, btAssert } from "../../LinearMath/btScalar";
import { SIMD_EPSILON } from "../../LinearMath/btScalar";

export const VORONOI_SIMPLEX_MAX_VERTS = 5;

// Use equal vertex threshold by default
export const BT_USE_EQUAL_VERTEX_THRESHOLD = true;

// Default equal vertex threshold based on precision
export const VORONOI_DEFAULT_EQUAL_VERTEX_THRESHOLD = 0.0001;

/**
 * Usage bitfield for tracking which vertices are used in the simplex
 */
export class btUsageBitfield {
    usedVertexA: boolean = false;
    usedVertexB: boolean = false;
    usedVertexC: boolean = false;
    usedVertexD: boolean = false;

    constructor() {
        this.reset();
    }

    reset(): void {
        this.usedVertexA = false;
        this.usedVertexB = false;
        this.usedVertexC = false;
        this.usedVertexD = false;
    }
}

/**
 * Result structure for sub-simplex closest point calculations
 */
export class btSubSimplexClosestResult {
    m_closestPointOnSimplex: btVector3;
    m_usedVertices: btUsageBitfield;
    m_barycentricCoords: number[] = [0, 0, 0, 0];
    m_degenerate: boolean = false;

    constructor() {
        this.m_closestPointOnSimplex = new btVector3();
        this.m_usedVertices = new btUsageBitfield();
        this.reset();
    }

    reset(): void {
        this.m_degenerate = false;
        this.setBarycentricCoordinates();
        this.m_usedVertices.reset();
    }

    isValid(): boolean {
        const valid = (this.m_barycentricCoords[0] >= 0) &&
                     (this.m_barycentricCoords[1] >= 0) &&
                     (this.m_barycentricCoords[2] >= 0) &&
                     (this.m_barycentricCoords[3] >= 0);
        return valid;
    }

    setBarycentricCoordinates(a: number = 0, b: number = 0, c: number = 0, d: number = 0): void {
        this.m_barycentricCoords[0] = a;
        this.m_barycentricCoords[1] = b;
        this.m_barycentricCoords[2] = c;
        this.m_barycentricCoords[3] = d;
    }
}

/**
 * btVoronoiSimplexSolver is an implementation of the closest point distance algorithm from a 1-4 points simplex to the origin.
 * Can be used with GJK, as an alternative to Johnson distance algorithm.
 */
export class btVoronoiSimplexSolver extends btSimplexSolverInterface {
    m_numVertices: number = 0;
    m_simplexVectorW: btVector3[] = [];
    m_simplexPointsP: btVector3[] = [];
    m_simplexPointsQ: btVector3[] = [];

    m_cachedP1: btVector3 = new btVector3();
    m_cachedP2: btVector3 = new btVector3();
    m_cachedV: btVector3 = new btVector3();
    m_lastW: btVector3 = new btVector3();

    m_equalVertexThreshold: number = VORONOI_DEFAULT_EQUAL_VERTEX_THRESHOLD;
    m_cachedValidClosest: boolean = false;
    m_cachedBC: btSubSimplexClosestResult = new btSubSimplexClosestResult();
    m_needsUpdate: boolean = true;

    constructor() {
        super();
        // Initialize arrays
        for (let i = 0; i < VORONOI_SIMPLEX_MAX_VERTS; i++) {
            this.m_simplexVectorW.push(new btVector3());
            this.m_simplexPointsP.push(new btVector3());
            this.m_simplexPointsQ.push(new btVector3());
        }
    }

    removeVertex(index: number): void {
        btAssert(this.m_numVertices > 0);
        this.m_numVertices--;
        this.m_simplexVectorW[index].copy(this.m_simplexVectorW[this.m_numVertices]);
        this.m_simplexPointsP[index].copy(this.m_simplexPointsP[this.m_numVertices]);
        this.m_simplexPointsQ[index].copy(this.m_simplexPointsQ[this.m_numVertices]);
    }

    reduceVertices(usedVerts: btUsageBitfield): void {
        if ((this.numVertices() >= 4) && (!usedVerts.usedVertexD)) {
            this.removeVertex(3);
        }
        if ((this.numVertices() >= 3) && (!usedVerts.usedVertexC)) {
            this.removeVertex(2);
        }
        if ((this.numVertices() >= 2) && (!usedVerts.usedVertexB)) {
            this.removeVertex(1);
        }
        if ((this.numVertices() >= 1) && (!usedVerts.usedVertexA)) {
            this.removeVertex(0);
        }
    }

    updateClosestVectorAndPoints(): boolean {
        if (this.m_needsUpdate) {
            this.m_cachedBC.reset();
            this.m_needsUpdate = false;

            switch (this.numVertices()) {
                case 0:
                    this.m_cachedValidClosest = false;
                    break;

                case 1: {
                    this.m_cachedP1.copy(this.m_simplexPointsP[0]);
                    this.m_cachedP2.copy(this.m_simplexPointsQ[0]);
                    this.m_cachedV.copy(this.m_cachedP1).sub(this.m_cachedP2); // == m_simplexVectorW[0]
                    this.m_cachedBC.reset();
                    this.m_cachedBC.setBarycentricCoordinates(1, 0, 0, 0);
                    this.m_cachedValidClosest = this.m_cachedBC.isValid();
                    break;
                }

                case 2: {
                    // Closest point origin from line segment
                    const from = this.m_simplexVectorW[0];
                    const to = this.m_simplexVectorW[1];

                    const p = new btVector3(0, 0, 0);
                    const diff = p.clone().sub(from);
                    const v = to.clone().sub(from);
                    let t = v.dot(diff);

                    if (t > 0) {
                        const dotVV = v.dot(v);
                        if (t < dotVV) {
                            t /= dotVV;
                            diff.sub(v.clone().multiplyScalar(t));
                            this.m_cachedBC.m_usedVertices.usedVertexA = true;
                            this.m_cachedBC.m_usedVertices.usedVertexB = true;
                        } else {
                            t = 1;
                            diff.sub(v);
                            // Reduce to 1 point
                            this.m_cachedBC.m_usedVertices.usedVertexB = true;
                        }
                    } else {
                        t = 0;
                        // Reduce to 1 point
                        this.m_cachedBC.m_usedVertices.usedVertexA = true;
                    }

                    this.m_cachedBC.setBarycentricCoordinates(1 - t, t);
                    const nearest = from.clone().add(v.clone().multiplyScalar(t));

                    this.m_cachedP1.copy(this.m_simplexPointsP[0])
                        .add(this.m_simplexPointsP[1].clone().sub(this.m_simplexPointsP[0]).multiplyScalar(t));
                    this.m_cachedP2.copy(this.m_simplexPointsQ[0])
                        .add(this.m_simplexPointsQ[1].clone().sub(this.m_simplexPointsQ[0]).multiplyScalar(t));
                    this.m_cachedV.copy(this.m_cachedP1).sub(this.m_cachedP2);

                    this.reduceVertices(this.m_cachedBC.m_usedVertices);
                    this.m_cachedValidClosest = this.m_cachedBC.isValid();
                    break;
                }

                case 3: {
                    // Closest point origin from triangle
                    const p = new btVector3(0, 0, 0);
                    const a = this.m_simplexVectorW[0];
                    const b = this.m_simplexVectorW[1];
                    const c = this.m_simplexVectorW[2];

                    this.closestPtPointTriangle(p, a, b, c, this.m_cachedBC);
                    this.m_cachedP1.copy(this.m_simplexPointsP[0].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[0]))
                        .add(this.m_simplexPointsP[1].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[1]))
                        .add(this.m_simplexPointsP[2].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[2]));

                    this.m_cachedP2.copy(this.m_simplexPointsQ[0].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[0]))
                        .add(this.m_simplexPointsQ[1].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[1]))
                        .add(this.m_simplexPointsQ[2].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[2]));

                    this.m_cachedV.copy(this.m_cachedP1).sub(this.m_cachedP2);
                    this.reduceVertices(this.m_cachedBC.m_usedVertices);
                    this.m_cachedValidClosest = this.m_cachedBC.isValid();
                    break;
                }

                case 4: {
                    const p = new btVector3(0, 0, 0);
                    const a = this.m_simplexVectorW[0];
                    const b = this.m_simplexVectorW[1];
                    const c = this.m_simplexVectorW[2];
                    const d = this.m_simplexVectorW[3];

                    const hasSeparation = this.closestPtPointTetrahedron(p, a, b, c, d, this.m_cachedBC);

                    if (hasSeparation) {
                        this.m_cachedP1.copy(this.m_simplexPointsP[0].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[0]))
                            .add(this.m_simplexPointsP[1].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[1]))
                            .add(this.m_simplexPointsP[2].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[2]))
                            .add(this.m_simplexPointsP[3].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[3]));

                        this.m_cachedP2.copy(this.m_simplexPointsQ[0].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[0]))
                            .add(this.m_simplexPointsQ[1].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[1]))
                            .add(this.m_simplexPointsQ[2].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[2]))
                            .add(this.m_simplexPointsQ[3].clone().multiplyScalar(this.m_cachedBC.m_barycentricCoords[3]));

                        this.m_cachedV.copy(this.m_cachedP1).sub(this.m_cachedP2);
                        this.reduceVertices(this.m_cachedBC.m_usedVertices);
                    } else {
                        if (this.m_cachedBC.m_degenerate) {
                            this.m_cachedValidClosest = false;
                        } else {
                            this.m_cachedValidClosest = true;
                            // Degenerate case == false, penetration = true + zero
                            this.m_cachedV.setValue(0, 0, 0);
                        }
                        break;
                    }

                    this.m_cachedValidClosest = this.m_cachedBC.isValid();
                    break;
                }

                default:
                    this.m_cachedValidClosest = false;
            }
        }

        return this.m_cachedValidClosest;
    }

    // Clear the simplex, remove all vertices
    reset(): void {
        this.m_cachedValidClosest = false;
        this.m_numVertices = 0;
        this.m_needsUpdate = true;
        this.m_lastW.setValue(BT_LARGE_FLOAT, BT_LARGE_FLOAT, BT_LARGE_FLOAT);
        this.m_cachedBC.reset();
    }

    // Add a vertex
    addVertex(w: btVector3, p: btVector3, q: btVector3): void {
        this.m_lastW.copy(w);
        this.m_needsUpdate = true;

        this.m_simplexVectorW[this.m_numVertices].copy(w);
        this.m_simplexPointsP[this.m_numVertices].copy(p);
        this.m_simplexPointsQ[this.m_numVertices].copy(q);

        this.m_numVertices++;
    }

    setEqualVertexThreshold(threshold: number): void {
        this.m_equalVertexThreshold = threshold;
    }

    getEqualVertexThreshold(): number {
        return this.m_equalVertexThreshold;
    }

    // Return/calculate the closest vertex
    closest(v: btVector3): boolean {
        const success = this.updateClosestVectorAndPoints();
        v.copy(this.m_cachedV);
        return success;
    }

    maxVertex(): number {
        const numverts = this.numVertices();
        let maxV = 0;
        for (let i = 0; i < numverts; i++) {
            const curLen2 = this.m_simplexVectorW[i].length2();
            if (maxV < curLen2) {
                maxV = curLen2;
            }
        }
        return maxV;
    }

    fullSimplex(): boolean {
        return (this.m_numVertices === 4);
    }

    // Return the current simplex
    getSimplex(pBuf: btVector3[], qBuf: btVector3[], yBuf: btVector3[]): number {
        for (let i = 0; i < this.numVertices(); i++) {
            yBuf[i] = this.m_simplexVectorW[i].clone();
            pBuf[i] = this.m_simplexPointsP[i].clone();
            qBuf[i] = this.m_simplexPointsQ[i].clone();
        }
        return this.numVertices();
    }

    inSimplex(w: btVector3): boolean {
        let found = false;
        const numverts = this.numVertices();

        // w is in the current (reduced) simplex
        for (let i = 0; i < numverts; i++) {
            if (BT_USE_EQUAL_VERTEX_THRESHOLD) {
                if (this.m_simplexVectorW[i].distance2(w) <= this.m_equalVertexThreshold) {
                    found = true;
                    break;
                }
            } else {
                if (this.m_simplexVectorW[i].equals(w)) {
                    found = true;
                    break;
                }
            }
        }

        // Check in case lastW is already removed
        if (w.equals(this.m_lastW)) {
            return true;
        }

        return found;
    }

    backup_closest(v: btVector3): void {
        v.copy(this.m_cachedV);
    }

    emptySimplex(): boolean {
        return (this.numVertices() === 0);
    }

    compute_points(p1: btVector3, p2: btVector3): void {
        this.updateClosestVectorAndPoints();
        p1.copy(this.m_cachedP1);
        p2.copy(this.m_cachedP2);
    }

    numVertices(): number {
        return this.m_numVertices;
    }

    closestPtPointTriangle(p: btVector3, a: btVector3, b: btVector3, c: btVector3, result: btSubSimplexClosestResult): boolean {
        result.m_usedVertices.reset();

        // Check if P in vertex region outside A
        const ab = b.clone().sub(a);
        const ac = c.clone().sub(a);
        const ap = p.clone().sub(a);
        const d1 = ab.dot(ap);
        const d2 = ac.dot(ap);
        if (d1 <= 0 && d2 <= 0) {
            result.m_closestPointOnSimplex.copy(a);
            result.m_usedVertices.usedVertexA = true;
            result.setBarycentricCoordinates(1, 0, 0);
            return true; // a; barycentric coordinates (1,0,0)
        }

        // Check if P in vertex region outside B
        const bp = p.clone().sub(b);
        const d3 = ab.dot(bp);
        const d4 = ac.dot(bp);
        if (d3 >= 0 && d4 <= d3) {
            result.m_closestPointOnSimplex.copy(b);
            result.m_usedVertices.usedVertexB = true;
            result.setBarycentricCoordinates(0, 1, 0);
            return true; // b; barycentric coordinates (0,1,0)
        }

        // Check if P in edge region of AB, if so return projection of P onto AB
        const vc = d1 * d4 - d3 * d2;
        if (vc <= 0 && d1 >= 0 && d3 <= 0) {
            const v = d1 / (d1 - d3);
            result.m_closestPointOnSimplex.copy(a).add(ab.clone().multiplyScalar(v));
            result.m_usedVertices.usedVertexA = true;
            result.m_usedVertices.usedVertexB = true;
            result.setBarycentricCoordinates(1 - v, v, 0);
            return true;
        }

        // Check if P in vertex region outside C
        const cp = p.clone().sub(c);
        const d5 = ab.dot(cp);
        const d6 = ac.dot(cp);
        if (d6 >= 0 && d5 <= d6) {
            result.m_closestPointOnSimplex.copy(c);
            result.m_usedVertices.usedVertexC = true;
            result.setBarycentricCoordinates(0, 0, 1);
            return true; // c; barycentric coordinates (0,0,1)
        }

        // Check if P in edge region of AC, if so return projection of P onto AC
        const vb = d5 * d2 - d1 * d6;
        if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            const w = d2 / (d2 - d6);
            result.m_closestPointOnSimplex.copy(a).add(ac.clone().multiplyScalar(w));
            result.m_usedVertices.usedVertexA = true;
            result.m_usedVertices.usedVertexC = true;
            result.setBarycentricCoordinates(1 - w, 0, w);
            return true;
        }

        // Check if P in edge region of BC, if so return projection of P onto BC
        const va = d3 * d6 - d5 * d4;
        if (va <= 0 && (d4 - d3) >= 0 && (d5 - d6) >= 0) {
            const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
            result.m_closestPointOnSimplex.copy(b).add(c.clone().sub(b).multiplyScalar(w));
            result.m_usedVertices.usedVertexB = true;
            result.m_usedVertices.usedVertexC = true;
            result.setBarycentricCoordinates(0, 1 - w, w);
            return true;
        }

        // P inside face region. Compute Q through its barycentric coordinates (u,v,w)
        const denom = 1 / (va + vb + vc);
        const v = vb * denom;
        const w = vc * denom;

        result.m_closestPointOnSimplex.copy(a).add(ab.clone().multiplyScalar(v)).add(ac.clone().multiplyScalar(w));
        result.m_usedVertices.usedVertexA = true;
        result.m_usedVertices.usedVertexB = true;
        result.m_usedVertices.usedVertexC = true;
        result.setBarycentricCoordinates(1 - v - w, v, w);

        return true;
    }

    // Test if point p and d lie on opposite sides of plane through abc
    pointOutsideOfPlane(p: btVector3, a: btVector3, b: btVector3, c: btVector3, d: btVector3): number {
        const normal = b.clone().sub(a).cross(c.clone().sub(a));
        const signp = p.clone().sub(a).dot(normal); // [AP AB AC]
        const signd = d.clone().sub(a).dot(normal); // [AD AB AC]

        // Check for degenerate tetrahedron
        if (signd * signd < (1e-4 * 1e-4)) {
            return -1;
        }

        // Points on opposite sides if expression signs are opposite
        return signp * signd < 0 ? 1 : 0;
    }

    closestPtPointTetrahedron(p: btVector3, a: btVector3, b: btVector3, c: btVector3, d: btVector3, finalResult: btSubSimplexClosestResult): boolean {
        const tempResult = new btSubSimplexClosestResult();

        // Start out assuming point inside all halfspaces, so closest to itself
        finalResult.m_closestPointOnSimplex.copy(p);
        finalResult.m_usedVertices.reset();
        finalResult.m_usedVertices.usedVertexA = true;
        finalResult.m_usedVertices.usedVertexB = true;
        finalResult.m_usedVertices.usedVertexC = true;
        finalResult.m_usedVertices.usedVertexD = true;

        const pointOutsideABC = this.pointOutsideOfPlane(p, a, b, c, d);
        const pointOutsideACD = this.pointOutsideOfPlane(p, a, c, d, b);
        const pointOutsideADB = this.pointOutsideOfPlane(p, a, d, b, c);
        const pointOutsideBDC = this.pointOutsideOfPlane(p, b, d, c, a);

        if (pointOutsideABC < 0 || pointOutsideACD < 0 || pointOutsideADB < 0 || pointOutsideBDC < 0) {
            finalResult.m_degenerate = true;
            return false;
        }

        if (!pointOutsideABC && !pointOutsideACD && !pointOutsideADB && !pointOutsideBDC) {
            return false;
        }

        let bestSqDist = Number.MAX_VALUE;

        // If point outside face abc then compute closest point on abc
        if (pointOutsideABC) {
            this.closestPtPointTriangle(p, a, b, c, tempResult);
            const q = tempResult.m_closestPointOnSimplex;
            const sqDist = q.clone().sub(p).dot(q.clone().sub(p));

            // Update best closest point if (squared) distance is less than current best
            if (sqDist < bestSqDist) {
                bestSqDist = sqDist;
                finalResult.m_closestPointOnSimplex.copy(q);
                // Convert result bitmask!
                finalResult.m_usedVertices.reset();
                finalResult.m_usedVertices.usedVertexA = tempResult.m_usedVertices.usedVertexA;
                finalResult.m_usedVertices.usedVertexB = tempResult.m_usedVertices.usedVertexB;
                finalResult.m_usedVertices.usedVertexC = tempResult.m_usedVertices.usedVertexC;
                finalResult.setBarycentricCoordinates(
                    tempResult.m_barycentricCoords[0], // VERTA
                    tempResult.m_barycentricCoords[1], // VERTB
                    tempResult.m_barycentricCoords[2], // VERTC
                    0
                );
            }
        }

        // Repeat test for face acd
        if (pointOutsideACD) {
            this.closestPtPointTriangle(p, a, c, d, tempResult);
            const q = tempResult.m_closestPointOnSimplex;
            const sqDist = q.clone().sub(p).dot(q.clone().sub(p));

            if (sqDist < bestSqDist) {
                bestSqDist = sqDist;
                finalResult.m_closestPointOnSimplex.copy(q);
                finalResult.m_usedVertices.reset();
                finalResult.m_usedVertices.usedVertexA = tempResult.m_usedVertices.usedVertexA;
                finalResult.m_usedVertices.usedVertexC = tempResult.m_usedVertices.usedVertexB;
                finalResult.m_usedVertices.usedVertexD = tempResult.m_usedVertices.usedVertexC;
                finalResult.setBarycentricCoordinates(
                    tempResult.m_barycentricCoords[0], // VERTA
                    0,
                    tempResult.m_barycentricCoords[1], // VERTB -> VERTC
                    tempResult.m_barycentricCoords[2]  // VERTC -> VERTD
                );
            }
        }

        // Repeat test for face adb
        if (pointOutsideADB) {
            this.closestPtPointTriangle(p, a, d, b, tempResult);
            const q = tempResult.m_closestPointOnSimplex;
            const sqDist = q.clone().sub(p).dot(q.clone().sub(p));

            if (sqDist < bestSqDist) {
                bestSqDist = sqDist;
                finalResult.m_closestPointOnSimplex.copy(q);
                finalResult.m_usedVertices.reset();
                finalResult.m_usedVertices.usedVertexA = tempResult.m_usedVertices.usedVertexA;
                finalResult.m_usedVertices.usedVertexB = tempResult.m_usedVertices.usedVertexC;
                finalResult.m_usedVertices.usedVertexD = tempResult.m_usedVertices.usedVertexB;
                finalResult.setBarycentricCoordinates(
                    tempResult.m_barycentricCoords[0], // VERTA
                    tempResult.m_barycentricCoords[2], // VERTC -> VERTB
                    0,
                    tempResult.m_barycentricCoords[1]  // VERTB -> VERTD
                );
            }
        }

        // Repeat test for face bdc
        if (pointOutsideBDC) {
            this.closestPtPointTriangle(p, b, d, c, tempResult);
            const q = tempResult.m_closestPointOnSimplex;
            const sqDist = q.clone().sub(p).dot(q.clone().sub(p));

            if (sqDist < bestSqDist) {
                bestSqDist = sqDist;
                finalResult.m_closestPointOnSimplex.copy(q);
                finalResult.m_usedVertices.reset();
                finalResult.m_usedVertices.usedVertexB = tempResult.m_usedVertices.usedVertexA;
                finalResult.m_usedVertices.usedVertexC = tempResult.m_usedVertices.usedVertexC;
                finalResult.m_usedVertices.usedVertexD = tempResult.m_usedVertices.usedVertexB;
                finalResult.setBarycentricCoordinates(
                    0,
                    tempResult.m_barycentricCoords[0], // VERTA -> VERTB
                    tempResult.m_barycentricCoords[2], // VERTC
                    tempResult.m_barycentricCoords[1]  // VERTB -> VERTD
                );
            }
        }

        // Help! We ended up full!
        if (finalResult.m_usedVertices.usedVertexA &&
            finalResult.m_usedVertices.usedVertexB &&
            finalResult.m_usedVertices.usedVertexC &&
            finalResult.m_usedVertices.usedVertexD) {
            return true;
        }

        return true;
    }
}