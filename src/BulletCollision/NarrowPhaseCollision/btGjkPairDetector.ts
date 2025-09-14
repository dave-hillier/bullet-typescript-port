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
*/

import { btVector3 } from "../../LinearMath/btVector3";
import { btTransform } from "../../LinearMath/btTransform";
import { btDiscreteCollisionDetectorInterface, btClosestPointInput } from "./btDiscreteCollisionDetectorInterface";
import { btConvexShape } from "../CollisionShapes/btConvexShape";
import { btSimplexSolverInterface } from "./btSimplexSolverInterface";
import { btConvexPenetrationDepthSolver } from "./btConvexPenetrationDepthSolver";
import { SIMD_EPSILON, btAssert, btSqrt, btFabs, btFuzzyZero, BT_LARGE_FLOAT } from "../../LinearMath/btScalar";

// Must be above the machine epsilon
const REL_ERROR2 = 1.0e-6;

// Global tolerance for GJK EPA penetration
export let gGjkEpaPenetrationTolerance = 0.001;

/**
 * Support vector structure for GJK algorithm
 */
class btSupportVector {
    v: btVector3;   // Support point in minkowski sum
    v1: btVector3;  // Support point in obj1
    v2: btVector3;  // Support point in obj2

    constructor() {
        this.v = new btVector3();
        this.v1 = new btVector3();
        this.v2 = new btVector3();
    }

    copy(other: btSupportVector): void {
        this.v.copy(other.v);
        this.v1.copy(other.v1);
        this.v2.copy(other.v2);
    }
}

/**
 * Simplex structure for GJK algorithm
 */
class btSimplex {
    ps: btSupportVector[] = [];
    last: number = -1; // Index of last added point

    constructor() {
        for (let i = 0; i < 4; i++) {
            this.ps.push(new btSupportVector());
        }
    }
}

// Static origin vector
const ccd_vec3_origin = new btVector3(0, 0, 0);

// Helper functions
function btSimplexInit(s: btSimplex): void {
    s.last = -1;
}

function btSimplexSize(s: btSimplex): number {
    return s.last + 1;
}

function btSimplexPoint(s: btSimplex, idx: number): btSupportVector {
    return s.ps[idx];
}

function btSupportCopy(d: btSupportVector, s: btSupportVector): void {
    d.copy(s);
}

function btVec3Copy(v: btVector3, w: btVector3): void {
    v.copy(w);
}

function ccdVec3Add(v: btVector3, w: btVector3): void {
    v.add(w);
}

function ccdVec3Sub(v: btVector3, w: btVector3): void {
    v.sub(w);
}

function btVec3Sub2(d: btVector3, v: btVector3, w: btVector3): void {
    d.copy(v).sub(w);
}

function btVec3Dot(a: btVector3, b: btVector3): number {
    return a.dot(b);
}

function ccdVec3Dist2(a: btVector3, b: btVector3): number {
    const ab = a.clone().sub(b);
    return btVec3Dot(ab, ab);
}

function btVec3Scale(d: btVector3, k: number): void {
    d.multiplyScalar(k);
}

function btVec3Cross(d: btVector3, a: btVector3, b: btVector3): void {
    d.copy(a).cross(b);
}

function btTripleCross(a: btVector3, b: btVector3, c: btVector3, d: btVector3): void {
    const e = a.clone().cross(b);
    d.copy(e).cross(c);
}

function ccdEq(a: number, b: number): boolean {
    const ab = btFabs(a - b);
    if (btFabs(ab) < SIMD_EPSILON) {
        return true;
    }

    const absA = btFabs(a);
    const absB = btFabs(b);
    if (absB > absA) {
        return ab < SIMD_EPSILON * absB;
    } else {
        return ab < SIMD_EPSILON * absA;
    }
}

function ccdVec3X(v: btVector3): number {
    return v.x();
}

function ccdVec3Y(v: btVector3): number {
    return v.y();
}

function ccdVec3Z(v: btVector3): number {
    return v.z();
}

function btVec3Eq(a: btVector3, b: btVector3): boolean {
    return ccdEq(ccdVec3X(a), ccdVec3X(b)) &&
           ccdEq(ccdVec3Y(a), ccdVec3Y(b)) &&
           ccdEq(ccdVec3Z(a), ccdVec3Z(b));
}

function btSimplexAdd(s: btSimplex, v: btSupportVector): void {
    ++s.last;
    btSupportCopy(s.ps[s.last], v);
}

function btSimplexSet(s: btSimplex, pos: number, a: btSupportVector): void {
    btSupportCopy(s.ps[pos], a);
}

function btSimplexSetSize(s: btSimplex, size: number): void {
    s.last = size - 1;
}

function ccdSimplexLast(s: btSimplex): btSupportVector {
    return btSimplexPoint(s, s.last);
}

function ccdSign(val: number): number {
    if (btFuzzyZero(val)) {
        return 0;
    } else if (val < 0) {
        return -1;
    }
    return 1;
}

function btVec3PointSegmentDist2(P: btVector3, x0: btVector3, b: btVector3, witness?: btVector3): number {
    let dist: number, t: number;
    const d = new btVector3(), a = new btVector3();

    // Direction of segment
    btVec3Sub2(d, b, x0);

    // Precompute vector from P to x0
    btVec3Sub2(a, x0, P);

    t = -1 * btVec3Dot(a, d);
    t /= btVec3Dot(d, d);

    if (t < 0 || btFuzzyZero(t)) {
        dist = ccdVec3Dist2(x0, P);
        if (witness) {
            btVec3Copy(witness, x0);
        }
    } else if (t > 1 || ccdEq(t, 1)) {
        dist = ccdVec3Dist2(b, P);
        if (witness) {
            btVec3Copy(witness, b);
        }
    } else {
        if (witness) {
            btVec3Copy(witness, d);
            btVec3Scale(witness, t);
            ccdVec3Add(witness, x0);
            dist = ccdVec3Dist2(witness, P);
        } else {
            // Recycling variables
            btVec3Scale(d, t);
            ccdVec3Add(d, a);
            dist = btVec3Dot(d, d);
        }
    }

    return dist;
}

function btVec3PointTriDist2(P: btVector3, x0: btVector3, B: btVector3, C: btVector3, witness?: btVector3): number {
    const d1 = new btVector3(), d2 = new btVector3(), a = new btVector3();
    let u: number, v: number, w: number, p: number, q: number, r: number;
    let s: number, t: number, dist: number, dist2: number;
    const witness2 = new btVector3();

    btVec3Sub2(d1, B, x0);
    btVec3Sub2(d2, C, x0);
    btVec3Sub2(a, x0, P);

    u = btVec3Dot(a, a);
    v = btVec3Dot(d1, d1);
    w = btVec3Dot(d2, d2);
    p = btVec3Dot(a, d1);
    q = btVec3Dot(a, d2);
    r = btVec3Dot(d1, d2);

    s = (q * r - w * p) / (w * v - r * r);
    t = (-s * r - q) / w;

    if ((btFuzzyZero(s) || s > 0) &&
        (ccdEq(s, 1) || s < 1) &&
        (btFuzzyZero(t) || t > 0) &&
        (ccdEq(t, 1) || t < 1) &&
        (ccdEq(t + s, 1) || t + s < 1)) {

        if (witness) {
            btVec3Scale(d1, s);
            btVec3Scale(d2, t);
            btVec3Copy(witness, x0);
            ccdVec3Add(witness, d1);
            ccdVec3Add(witness, d2);
            dist = ccdVec3Dist2(witness, P);
        } else {
            dist = s * s * v;
            dist += t * t * w;
            dist += 2 * s * t * r;
            dist += 2 * s * p;
            dist += 2 * t * q;
            dist += u;
        }
    } else {
        dist = btVec3PointSegmentDist2(P, x0, B, witness);

        dist2 = btVec3PointSegmentDist2(P, x0, C, witness2);
        if (dist2 < dist) {
            dist = dist2;
            if (witness) {
                btVec3Copy(witness, witness2);
            }
        }

        dist2 = btVec3PointSegmentDist2(P, B, C, witness2);
        if (dist2 < dist) {
            dist = dist2;
            if (witness) {
                btVec3Copy(witness, witness2);
            }
        }
    }

    return dist;
}

function btDoSimplex2(simplex: btSimplex, dir: btVector3): number {
    const A = ccdSimplexLast(simplex);
    const B = btSimplexPoint(simplex, 0);
    const AB = new btVector3(), AO = new btVector3(), tmp = new btVector3();
    let dot: number;

    // Compute AB oriented segment
    btVec3Sub2(AB, B.v, A.v);
    // Compute AO vector
    btVec3Copy(AO, A.v);
    btVec3Scale(AO, -1);

    // Dot product AB . AO
    dot = btVec3Dot(AB, AO);

    // Check if origin doesn't lie on AB segment
    btVec3Cross(tmp, AB, AO);
    if (btFuzzyZero(btVec3Dot(tmp, tmp)) && dot > 0) {
        return 1;
    }

    // Check if origin is in area where AB segment is
    if (btFuzzyZero(dot) || dot < 0) {
        // Origin is in outside area of A
        btSimplexSet(simplex, 0, A);
        btSimplexSetSize(simplex, 1);
        btVec3Copy(dir, AO);
    } else {
        // Origin is in area where AB segment is
        // Keep simplex untouched and set direction to AB x AO x AB
        btTripleCross(AB, AO, AB, dir);
    }

    return 0;
}

function btDoSimplex3(simplex: btSimplex, dir: btVector3): number {
    const A = ccdSimplexLast(simplex);
    const B = btSimplexPoint(simplex, 1);
    const C = btSimplexPoint(simplex, 0);
    const AO = new btVector3(), AB = new btVector3(), AC = new btVector3();
    const ABC = new btVector3(), tmp = new btVector3();
    let dot: number, dist: number;

    // Check touching contact
    dist = btVec3PointTriDist2(ccd_vec3_origin, A.v, B.v, C.v);
    if (btFuzzyZero(dist)) {
        return 1;
    }

    // Check if triangle is really triangle (has area > 0)
    if (btVec3Eq(A.v, B.v) || btVec3Eq(A.v, C.v)) {
        return -1;
    }

    // Compute AO vector
    btVec3Copy(AO, A.v);
    btVec3Scale(AO, -1);

    // Compute AB and AC segments and ABC vector (perpendicular to triangle)
    btVec3Sub2(AB, B.v, A.v);
    btVec3Sub2(AC, C.v, A.v);
    btVec3Cross(ABC, AB, AC);

    btVec3Cross(tmp, ABC, AC);
    dot = btVec3Dot(tmp, AO);
    if (btFuzzyZero(dot) || dot > 0) {
        dot = btVec3Dot(AC, AO);
        if (btFuzzyZero(dot) || dot > 0) {
            // C is already in place
            btSimplexSet(simplex, 1, A);
            btSimplexSetSize(simplex, 2);
            btTripleCross(AC, AO, AC, dir);
        } else {
            dot = btVec3Dot(AB, AO);
            if (btFuzzyZero(dot) || dot > 0) {
                btSimplexSet(simplex, 0, B);
                btSimplexSet(simplex, 1, A);
                btSimplexSetSize(simplex, 2);
                btTripleCross(AB, AO, AB, dir);
            } else {
                btSimplexSet(simplex, 0, A);
                btSimplexSetSize(simplex, 1);
                btVec3Copy(dir, AO);
            }
        }
    } else {
        btVec3Cross(tmp, AB, ABC);
        dot = btVec3Dot(tmp, AO);
        if (btFuzzyZero(dot) || dot > 0) {
            dot = btVec3Dot(AB, AO);
            if (btFuzzyZero(dot) || dot > 0) {
                btSimplexSet(simplex, 0, B);
                btSimplexSet(simplex, 1, A);
                btSimplexSetSize(simplex, 2);
                btTripleCross(AB, AO, AB, dir);
            } else {
                btSimplexSet(simplex, 0, A);
                btSimplexSetSize(simplex, 1);
                btVec3Copy(dir, AO);
            }
        } else {
            dot = btVec3Dot(ABC, AO);
            if (btFuzzyZero(dot) || dot > 0) {
                btVec3Copy(dir, ABC);
            } else {
                const tmp_support = new btSupportVector();
                btSupportCopy(tmp_support, C);
                btSimplexSet(simplex, 0, B);
                btSimplexSet(simplex, 1, tmp_support);
                btVec3Copy(dir, ABC);
                btVec3Scale(dir, -1);
            }
        }
    }

    return 0;
}

function btDoSimplex4(simplex: btSimplex, dir: btVector3): number {
    const A = ccdSimplexLast(simplex);
    const B = btSimplexPoint(simplex, 2);
    const C = btSimplexPoint(simplex, 1);
    const D = btSimplexPoint(simplex, 0);
    const AO = new btVector3(), AB = new btVector3(), AC = new btVector3();
    const AD = new btVector3(), ABC = new btVector3(), ACD = new btVector3(), ADB = new btVector3();
    let B_on_ACD: number, C_on_ADB: number, D_on_ABC: number;
    let AB_O: boolean, AC_O: boolean, AD_O: boolean;
    let dist: number;

    // Check if tetrahedron is really tetrahedron (has volume > 0)
    dist = btVec3PointTriDist2(A.v, B.v, C.v, D.v);
    if (btFuzzyZero(dist)) {
        return -1;
    }

    // Check if origin lies on some of tetrahedron's face - if so objects intersect
    dist = btVec3PointTriDist2(ccd_vec3_origin, A.v, B.v, C.v);
    if (btFuzzyZero(dist)) return 1;
    dist = btVec3PointTriDist2(ccd_vec3_origin, A.v, C.v, D.v);
    if (btFuzzyZero(dist)) return 1;
    dist = btVec3PointTriDist2(ccd_vec3_origin, A.v, B.v, D.v);
    if (btFuzzyZero(dist)) return 1;
    dist = btVec3PointTriDist2(ccd_vec3_origin, B.v, C.v, D.v);
    if (btFuzzyZero(dist)) return 1;

    // Compute AO, AB, AC, AD segments and ABC, ACD, ADB normal vectors
    btVec3Copy(AO, A.v);
    btVec3Scale(AO, -1);
    btVec3Sub2(AB, B.v, A.v);
    btVec3Sub2(AC, C.v, A.v);
    btVec3Sub2(AD, D.v, A.v);
    btVec3Cross(ABC, AB, AC);
    btVec3Cross(ACD, AC, AD);
    btVec3Cross(ADB, AD, AB);

    // Side (positive or negative) of B, C, D relative to planes ACD, ADB and ABC respectively
    B_on_ACD = ccdSign(btVec3Dot(ACD, AB));
    C_on_ADB = ccdSign(btVec3Dot(ADB, AC));
    D_on_ABC = ccdSign(btVec3Dot(ABC, AD));

    // Whether origin is on same side of ACD, ADB, ABC as B, C, D respectively
    AB_O = ccdSign(btVec3Dot(ACD, AO)) === B_on_ACD;
    AC_O = ccdSign(btVec3Dot(ADB, AO)) === C_on_ADB;
    AD_O = ccdSign(btVec3Dot(ABC, AO)) === D_on_ABC;

    if (AB_O && AC_O && AD_O) {
        // Origin is in tetrahedron
        return 1;
    } else if (!AB_O) {
        // B is farthest from the origin among all of the tetrahedron's points
        // D and C are in place
        btSimplexSet(simplex, 2, A);
        btSimplexSetSize(simplex, 3);
    } else if (!AC_O) {
        // C is farthest
        btSimplexSet(simplex, 1, D);
        btSimplexSet(simplex, 0, B);
        btSimplexSet(simplex, 2, A);
        btSimplexSetSize(simplex, 3);
    } else { // (!AD_O)
        btSimplexSet(simplex, 0, C);
        btSimplexSet(simplex, 1, B);
        btSimplexSet(simplex, 2, A);
        btSimplexSetSize(simplex, 3);
    }

    return btDoSimplex3(simplex, dir);
}

function btDoSimplex(simplex: btSimplex, dir: btVector3): number {
    if (btSimplexSize(simplex) === 2) {
        // Simplex contains segment only one segment
        return btDoSimplex2(simplex, dir);
    } else if (btSimplexSize(simplex) === 3) {
        // Simplex contains triangle
        return btDoSimplex3(simplex, dir);
    } else { // btSimplexSize(simplex) === 4
        // Tetrahedron - this is the only shape which can encapsule origin
        return btDoSimplex4(simplex, dir);
    }
}

function btComputeSupport(
    convexA: btConvexShape,
    localTransA: btTransform,
    convexB: btConvexShape,
    localTransB: btTransform,
    dir: btVector3,
    check2d: boolean,
    supAworld: btVector3,
    supBworld: btVector3,
    aMinb: btVector3
): void {
    const separatingAxisInA = dir.clone().applyMatrix3(localTransA.getBasis());
    const separatingAxisInB = dir.clone().negate().applyMatrix3(localTransB.getBasis());

    const pInANoMargin = convexA.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInA);
    const qInBNoMargin = convexB.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInB);

    const pInA = pInANoMargin.clone();
    const qInB = qInBNoMargin.clone();

    supAworld.copy(localTransA.op_mul(pInA));
    supBworld.copy(localTransB.op_mul(qInB));

    if (check2d) {
        supAworld.setZ(0);
        supBworld.setZ(0);
    }

    aMinb.copy(supAworld).sub(supBworld);
}

/**
 * btGjkPairDetector uses GJK to implement the btDiscreteCollisionDetectorInterface
 */
export class btGjkPairDetector extends btDiscreteCollisionDetectorInterface {
    private m_cachedSeparatingAxis: btVector3 = new btVector3(0, 1, 0);
    private m_penetrationDepthSolver: btConvexPenetrationDepthSolver | null = null;
    private m_simplexSolver: btSimplexSolverInterface;
    private m_minkowskiA: btConvexShape;
    private m_minkowskiB: btConvexShape;
    private m_shapeTypeA: number;
    private m_shapeTypeB: number;
    private m_marginA: number;
    private m_marginB: number;
    private m_ignoreMargin: boolean = false;
    private m_cachedSeparatingDistance: number = 0;

    // Some debugging to fix degeneracy problems
    m_lastUsedMethod: number = -1;
    m_curIter: number = 0;
    m_degenerateSimplex: number = 0;
    m_catchDegeneracies: number = 1;
    m_fixContactNormalDirection: number = 1;

    constructor(
        objectA: btConvexShape,
        objectB: btConvexShape,
        simplexSolver: btSimplexSolverInterface,
        penetrationDepthSolver?: btConvexPenetrationDepthSolver,
        shapeTypeA?: number,
        shapeTypeB?: number,
        marginA?: number,
        marginB?: number
    ) {
        super();
        this.m_simplexSolver = simplexSolver;
        this.m_penetrationDepthSolver = penetrationDepthSolver || null;
        this.m_minkowskiA = objectA;
        this.m_minkowskiB = objectB;
        this.m_shapeTypeA = shapeTypeA !== undefined ? shapeTypeA : objectA.getShapeType();
        this.m_shapeTypeB = shapeTypeB !== undefined ? shapeTypeB : objectB.getShapeType();
        this.m_marginA = marginA !== undefined ? marginA : objectA.getMargin();
        this.m_marginB = marginB !== undefined ? marginB : objectB.getMargin();
    }

    getClosestPoints(
        input: btClosestPointInput,
        output: btDiscreteCollisionDetectorInterface.Result,
        debugDraw?: any,
        swapResults: boolean = false
    ): void {
        this.getClosestPointsNonVirtual(input, output, debugDraw);
    }

    getClosestPointsNonVirtual(
        input: btClosestPointInput,
        output: btDiscreteCollisionDetectorInterface.Result,
        debugDraw?: any
    ): void {
        this.m_cachedSeparatingDistance = 0;

        let distance = 0;
        const normalInB = new btVector3(0, 0, 0);

        const pointOnA = new btVector3();
        const pointOnB = new btVector3();
        const localTransA = input.m_transformA.clone();
        const localTransB = input.m_transformB.clone();
        const positionOffset = localTransA.getOrigin().clone().add(localTransB.getOrigin()).multiplyScalar(0.5);
        localTransA.getOrigin().sub(positionOffset);
        localTransB.getOrigin().sub(positionOffset);

        const check2d = this.m_minkowskiA.isConvex2d() && this.m_minkowskiB.isConvex2d();

        let marginA = this.m_marginA;
        let marginB = this.m_marginB;

        // For CCD we don't use margins
        if (this.m_ignoreMargin) {
            marginA = 0;
            marginB = 0;
        }

        this.m_curIter = 0;
        const gGjkMaxIter = 1000; // This is to catch invalid input, perhaps check for #NaN?
        this.m_cachedSeparatingAxis.setValue(0, 1, 0);

        let isValid = false;
        let checkSimplex = false;
        const checkPenetration = true;
        this.m_degenerateSimplex = 0;

        this.m_lastUsedMethod = -1;
        let status = -2;
        const orgNormalInB = new btVector3(0, 0, 0);
        const margin = marginA + marginB;

        // Implementation using the libCCD-based GJK approach
        {
            let squaredDistance = BT_LARGE_FLOAT;
            let delta = 0;

            const simplex1 = new btSimplex();
            const simplex = simplex1;
            btSimplexInit(simplex);

            const dir = new btVector3(1, 0, 0);

            {
                const lastSupV = new btVector3();
                const supAworld = new btVector3();
                const supBworld = new btVector3();
                btComputeSupport(this.m_minkowskiA, localTransA, this.m_minkowskiB, localTransB, dir, check2d, supAworld, supBworld, lastSupV);

                const last = new btSupportVector();
                last.v.copy(lastSupV);
                last.v1.copy(supAworld);
                last.v2.copy(supBworld);

                btSimplexAdd(simplex, last);

                dir.copy(lastSupV).negate();

                // Start iterations
                for (let iterations = 0; iterations < gGjkMaxIter; iterations++) {
                    // Obtain support point
                    btComputeSupport(this.m_minkowskiA, localTransA, this.m_minkowskiB, localTransB, dir, check2d, supAworld, supBworld, lastSupV);

                    // Check if farthest point in Minkowski difference in direction dir
                    // isn't somewhere before origin (the test on negative dot product)
                    // - because if it is, objects are not intersecting at all.
                    delta = lastSupV.dot(dir);
                    if (delta < 0) {
                        // No intersection, besides margin
                        status = -1;
                        break;
                    }

                    // Add last support vector to simplex
                    last.v.copy(lastSupV);
                    last.v1.copy(supAworld);
                    last.v2.copy(supBworld);

                    btSimplexAdd(simplex, last);

                    // If btDoSimplex returns 1 if objects intersect, -1 if objects don't
                    // intersect and 0 if algorithm should continue
                    const do_simplex_res = btDoSimplex(simplex, dir);

                    if (do_simplex_res === 1) {
                        status = 0; // intersection found
                        break;
                    } else if (do_simplex_res === -1) {
                        // intersection not found
                        status = -1;
                        break;
                    }

                    if (btFuzzyZero(btVec3Dot(dir, dir))) {
                        // intersection not found
                        status = -1;
                    }

                    if (dir.length2() < SIMD_EPSILON) {
                        // no intersection, besides margin
                        status = -1;
                        break;
                    }

                    if (dir.fuzzyZero()) {
                        // intersection not found
                        status = -1;
                        break;
                    }
                }
            }

            this.m_simplexSolver.reset();

            if (true) {
                // Main GJK loop
                while (true) {
                    const separatingAxisInA = this.m_cachedSeparatingAxis.clone().negate().applyMatrix3(localTransA.getBasis());
                    const separatingAxisInB = this.m_cachedSeparatingAxis.clone().applyMatrix3(localTransB.getBasis());

                    const pInA = this.m_minkowskiA.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInA);
                    const qInB = this.m_minkowskiB.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInB);

                    const pWorld = localTransA.op_mul(pInA);
                    const qWorld = localTransB.op_mul(qInB);

                    if (check2d) {
                        pWorld.setZ(0);
                        qWorld.setZ(0);
                    }

                    const w = pWorld.clone().sub(qWorld);
                    delta = this.m_cachedSeparatingAxis.dot(w);

                    // Potential exit, they don't overlap
                    if ((delta > 0) && (delta * delta > squaredDistance * input.m_maximumDistanceSquared)) {
                        this.m_degenerateSimplex = 10;
                        checkSimplex = true;
                        break;
                    }

                    // Exit 0: the new point is already in the simplex, or we didn't come any closer
                    if (this.m_simplexSolver.inSimplex(w)) {
                        this.m_degenerateSimplex = 1;
                        checkSimplex = true;
                        break;
                    }

                    // Are we getting any closer?
                    const f0 = squaredDistance - delta;
                    const f1 = squaredDistance * REL_ERROR2;

                    if (f0 <= f1) {
                        if (f0 <= 0) {
                            this.m_degenerateSimplex = 2;
                        } else {
                            this.m_degenerateSimplex = 11;
                        }
                        checkSimplex = true;
                        break;
                    }

                    // Add current vertex to simplex
                    this.m_simplexSolver.addVertex(w, pWorld, qWorld);
                    const newCachedSeparatingAxis = new btVector3();

                    // Calculate the closest point to the origin (update vector v)
                    if (!this.m_simplexSolver.closest(newCachedSeparatingAxis)) {
                        this.m_degenerateSimplex = 3;
                        checkSimplex = true;
                        break;
                    }

                    if (newCachedSeparatingAxis.length2() < REL_ERROR2) {
                        this.m_cachedSeparatingAxis.copy(newCachedSeparatingAxis);
                        this.m_degenerateSimplex = 6;
                        checkSimplex = true;
                        break;
                    }

                    const previousSquaredDistance = squaredDistance;
                    squaredDistance = newCachedSeparatingAxis.length2();

                    // Are we getting any closer?
                    if (previousSquaredDistance - squaredDistance <= SIMD_EPSILON * previousSquaredDistance) {
                        checkSimplex = true;
                        this.m_degenerateSimplex = 12;
                        break;
                    }

                    this.m_cachedSeparatingAxis.copy(newCachedSeparatingAxis);

                    // Degeneracy, this is typically due to invalid/uninitialized world transforms
                    if (this.m_curIter++ > gGjkMaxIter) {
                        console.log(`btGjkPairDetector maxIter exceeded: ${this.m_curIter}`);
                        break;
                    }

                    const check = !this.m_simplexSolver.fullSimplex();

                    if (!check) {
                        this.m_degenerateSimplex = 13;
                        break;
                    }
                }

                if (checkSimplex) {
                    this.m_simplexSolver.compute_points(pointOnA, pointOnB);
                    normalInB.copy(this.m_cachedSeparatingAxis);

                    const lenSqr = this.m_cachedSeparatingAxis.length2();

                    // Valid normal
                    if (lenSqr < REL_ERROR2) {
                        this.m_degenerateSimplex = 5;
                    }
                    if (lenSqr > SIMD_EPSILON * SIMD_EPSILON) {
                        const rlen = 1 / btSqrt(lenSqr);
                        normalInB.multiplyScalar(rlen); // normalize

                        const s = btSqrt(squaredDistance);

                        btAssert(s > 0);
                        pointOnA.sub(this.m_cachedSeparatingAxis.clone().multiplyScalar(marginA / s));
                        pointOnB.add(this.m_cachedSeparatingAxis.clone().multiplyScalar(marginB / s));
                        distance = (1 / rlen) - margin;
                        isValid = true;
                        orgNormalInB.copy(normalInB);

                        this.m_lastUsedMethod = 1;
                    } else {
                        this.m_lastUsedMethod = 2;
                    }
                }
            }

            const catchDegeneratePenetrationCase =
                (this.m_catchDegeneracies && this.m_penetrationDepthSolver && this.m_degenerateSimplex && ((distance + margin) < gGjkEpaPenetrationTolerance));

            if ((checkPenetration && (!isValid || catchDegeneratePenetrationCase)) || (status === 0)) {
                // Penetration case
                if (this.m_penetrationDepthSolver) {
                    // Penetration depth case
                    const tmpPointOnA = new btVector3();
                    const tmpPointOnB = new btVector3();

                    this.m_cachedSeparatingAxis.setZero();

                    const isValid2 = this.m_penetrationDepthSolver.calcPenDepth(
                        this.m_simplexSolver,
                        this.m_minkowskiA, this.m_minkowskiB,
                        localTransA, localTransB,
                        this.m_cachedSeparatingAxis, tmpPointOnA, tmpPointOnB,
                        debugDraw
                    );

                    if (this.m_cachedSeparatingAxis.length2() > 0) {
                        if (isValid2) {
                            let tmpNormalInB = tmpPointOnB.clone().sub(tmpPointOnA);
                            let lenSqr = tmpNormalInB.length2();
                            if (lenSqr <= (SIMD_EPSILON * SIMD_EPSILON)) {
                                tmpNormalInB.copy(this.m_cachedSeparatingAxis);
                                lenSqr = this.m_cachedSeparatingAxis.length2();
                            }

                            if (lenSqr > (SIMD_EPSILON * SIMD_EPSILON)) {
                                tmpNormalInB.multiplyScalar(1 / btSqrt(lenSqr));
                                const distance2 = -tmpPointOnA.clone().sub(tmpPointOnB).length();
                                this.m_lastUsedMethod = 3;
                                // Only replace valid penetrations when the result is deeper
                                if (!isValid || (distance2 < distance)) {
                                    distance = distance2;
                                    pointOnA.copy(tmpPointOnA);
                                    pointOnB.copy(tmpPointOnB);
                                    normalInB.copy(tmpNormalInB);
                                    isValid = true;
                                } else {
                                    this.m_lastUsedMethod = 8;
                                }
                            } else {
                                this.m_lastUsedMethod = 9;
                            }
                        } else {
                            // This is another degenerate case, where the initial GJK calculation reports a degenerate case
                            // EPA reports no penetration, and the second GJK (using the supporting vector without margin)
                            // reports a valid positive distance. Use the results of the second GJK instead of failing.
                            if (this.m_cachedSeparatingAxis.length2() > 0) {
                                const distance2 = tmpPointOnA.clone().sub(tmpPointOnB).length() - margin;
                                // Only replace valid distances when the distance is less
                                if (!isValid || (distance2 < distance)) {
                                    distance = distance2;
                                    pointOnA.copy(tmpPointOnA);
                                    pointOnB.copy(tmpPointOnB);
                                    pointOnA.sub(this.m_cachedSeparatingAxis.clone().multiplyScalar(marginA));
                                    pointOnB.add(this.m_cachedSeparatingAxis.clone().multiplyScalar(marginB));
                                    normalInB.copy(this.m_cachedSeparatingAxis);
                                    normalInB.normalize();

                                    isValid = true;
                                    this.m_lastUsedMethod = 6;
                                } else {
                                    this.m_lastUsedMethod = 5;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (isValid && ((distance < 0) || (distance * distance < input.m_maximumDistanceSquared))) {
            this.m_cachedSeparatingAxis.copy(normalInB);
            this.m_cachedSeparatingDistance = distance;

            if (true) {
                // Todo: need to track down this EPA penetration solver degeneracy
                // The penetration solver reports penetration but the contact normal
                // connecting the contact points is pointing in the opposite direction
                // until then, detect the issue and revert the normal

                let d2 = 0;
                {
                    const separatingAxisInA = orgNormalInB.clone().negate().applyMatrix3(localTransA.getBasis());
                    const separatingAxisInB = orgNormalInB.clone().applyMatrix3(localTransB.getBasis());

                    const pInA = this.m_minkowskiA.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInA);
                    const qInB = this.m_minkowskiB.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInB);

                    const pWorld = localTransA.op_mul(pInA);
                    const qWorld = localTransB.op_mul(qInB);
                    const w = pWorld.clone().sub(qWorld);
                    d2 = orgNormalInB.dot(w) - margin;
                }

                let d1 = 0;
                {
                    const separatingAxisInA = normalInB.clone().applyMatrix3(localTransA.getBasis());
                    const separatingAxisInB = normalInB.clone().negate().applyMatrix3(localTransB.getBasis());

                    const pInA = this.m_minkowskiA.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInA);
                    const qInB = this.m_minkowskiB.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInB);

                    const pWorld = localTransA.op_mul(pInA);
                    const qWorld = localTransB.op_mul(qInB);
                    const w = pWorld.clone().sub(qWorld);
                    d1 = normalInB.clone().negate().dot(w) - margin;
                }

                let d0 = 0;
                {
                    const separatingAxisInA = normalInB.clone().negate().applyMatrix3(input.m_transformA.getBasis());
                    const separatingAxisInB = normalInB.clone().applyMatrix3(input.m_transformB.getBasis());

                    const pInA = this.m_minkowskiA.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInA);
                    const qInB = this.m_minkowskiB.localGetSupportVertexWithoutMarginNonVirtual(separatingAxisInB);

                    const pWorld = localTransA.op_mul(pInA);
                    const qWorld = localTransB.op_mul(qInB);
                    const w = pWorld.clone().sub(qWorld);
                    d0 = normalInB.dot(w) - margin;
                }

                if (d1 > d0) {
                    this.m_lastUsedMethod = 10;
                    normalInB.negate();
                }

                if (orgNormalInB.length2() > 0) {
                    if (d2 > d0 && d2 > d1 && d2 > distance) {
                        normalInB.copy(orgNormalInB);
                        distance = d2;
                    }
                }
            }

            output.addContactPoint(
                normalInB,
                pointOnB.clone().add(positionOffset),
                distance
            );
        }
    }

    setMinkowskiA(minkA: btConvexShape): void {
        this.m_minkowskiA = minkA;
    }

    setMinkowskiB(minkB: btConvexShape): void {
        this.m_minkowskiB = minkB;
    }

    setCachedSeparatingAxis(separatingAxis: btVector3): void {
        this.m_cachedSeparatingAxis.copy(separatingAxis);
    }

    getCachedSeparatingAxis(): btVector3 {
        return this.m_cachedSeparatingAxis;
    }

    getCachedSeparatingDistance(): number {
        return this.m_cachedSeparatingDistance;
    }

    setPenetrationDepthSolver(penetrationDepthSolver: btConvexPenetrationDepthSolver): void {
        this.m_penetrationDepthSolver = penetrationDepthSolver;
    }

    /**
     * Don't use setIgnoreMargin, it's for Bullet's internal use
     */
    setIgnoreMargin(ignoreMargin: boolean): void {
        this.m_ignoreMargin = ignoreMargin;
    }
}