/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original GJK-EPA collision solver by Nathanael Presson, 2008
Original Copyright (c) 2003-2008 Erwin Coumans  http://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.

GJK-EPA COLLISION SOLVER:
- GJK (Gilbert-Johnson-Keerthi): Fast algorithm for computing distance between convex shapes
- EPA (Expanding Polytope Algorithm): Extends GJK to compute penetration depth when shapes overlap
- Used for precise collision detection and contact generation in physics simulations

Key Features:
- Distance calculation between separated convex shapes
- Penetration depth and direction for overlapping shapes
- Support for arbitrary convex shapes through support function interface
- Witness points on shape surfaces for contact point generation

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

import { btConvexShape } from '../CollisionShapes/btConvexShape';
import { btSphereShape } from '../CollisionShapes/btSphereShape';
import { btVector3, btDot, btCross } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btMatrix3x3, multiplyMatrixVector } from '../../LinearMath/btMatrix3x3';
import { btQuaternion } from '../../LinearMath/btQuaternion';
import { btMax, btMin, btSqrt, btFabs, SIMD_EPSILON, SIMD_INFINITY } from '../../LinearMath/btScalar';

// Configuration constants

// GJK constants
const GJK_MAX_ITERATIONS = 128;
const GJK_ACCURACY = 0.0001;
const GJK_MIN_DISTANCE = 0.0001;
const GJK_DUPLICATED_EPS = 0.0001;
const GJK_SIMPLEX2_EPS = 0.0;
const GJK_SIMPLEX3_EPS = 0.0;
const GJK_SIMPLEX4_EPS = 0.0;

// EPA constants
const EPA_MAX_VERTICES = 128;
const EPA_MAX_ITERATIONS = 255;
const EPA_ACCURACY = 0.0001;
const EPA_PLANE_EPS = 0.00001;
const EPA_INSIDE_EPS = 0.01;
const EPA_FALLBACK = 10 * EPA_ACCURACY;
const EPA_MAX_FACES = EPA_MAX_VERTICES * 2;

// Result status enumeration
enum eStatus {
    Separated,   // Shapes don't penetrate
    Penetrating, // Shapes are penetrating
    GJK_Failed,  // GJK phase fail, no big issue, shapes are probably just 'touching'
    EPA_Failed   // EPA phase fail, bigger problem, need to save parameters, and debug
}

// Results structure
interface sResults {
    status: eStatus;
    witnesses: [btVector3, btVector3];
    normal: btVector3;
    distance: number;
}

// GJK Status enumeration
enum GJKStatus {
    Valid,
    Inside,
    Failed
}

// EPA Status enumeration
enum EPAStatus {
    Valid,
    Touching,
    Degenerated,
    NonConvex,
    InvalidHull,
    OutOfFaces,
    OutOfVertices,
    AccuraryReached,
    FallBack,
    Failed
}

// Minkowski difference structure
class MinkowskiDiff {
    m_shapes: [btConvexShape | null, btConvexShape | null];
    m_toshape1: btMatrix3x3;
    m_toshape0: btTransform;
    private enableMargin: boolean;

    constructor() {
        this.m_shapes = [null, null];
        this.m_toshape1 = new btMatrix3x3();
        this.m_toshape0 = new btTransform();
        this.enableMargin = false;
    }

    setMarginEnabled(enable: boolean): void {
        this.enableMargin = enable;
    }

    support0(d: btVector3): btVector3 {
        if (this.enableMargin) {
            return this.m_shapes[0]!.localGetSupportVertexNonVirtual(d);
        } else {
            return this.m_shapes[0]!.localGetSupportVertexWithoutMarginNonVirtual(d);
        }
    }

    support1(d: btVector3): btVector3 {
        if (this.enableMargin) {
            return this.m_toshape0.transformPoint(
                this.m_shapes[1]!.localGetSupportVertexNonVirtual(
                    multiplyMatrixVector(this.m_toshape1, d)
                )
            );
        } else {
            return this.m_toshape0.transformPoint(
                this.m_shapes[1]!.localGetSupportVertexWithoutMarginNonVirtual(
                    multiplyMatrixVector(this.m_toshape1, d)
                )
            );
        }
    }

    support(d: btVector3): btVector3 {
        return this.support0(d).subtract(this.support1(d.negate()));
    }

    supportWithIndex(d: btVector3, index: number): btVector3 {
        if (index) {
            return this.support1(d);
        } else {
            return this.support0(d);
        }
    }
}

// Simplex vertex structure
class sSV {
    d: btVector3;
    w: btVector3;

    constructor() {
        this.d = new btVector3(0, 0, 0);
        this.w = new btVector3(0, 0, 0);
    }
}

// Simplex structure
class sSimplex {
    c: (sSV | null)[];
    p: number[];
    rank: number;

    constructor() {
        this.c = [null, null, null, null];
        this.p = [0, 0, 0, 0];
        this.rank = 0;
    }
}

// GJK class
class GJK {
    m_shape: MinkowskiDiff;
    m_ray: btVector3;
    m_distance: number;
    m_simplices: [sSimplex, sSimplex];
    m_store: sSV[];
    m_free: (sSV | null)[];
    m_nfree: number;
    m_current: number;
    m_simplex: sSimplex | null;
    m_status: GJKStatus;

    constructor() {
        this.m_shape = new MinkowskiDiff();
        this.m_ray = new btVector3(0, 0, 0);
        this.m_distance = 0;
        this.m_simplices = [new sSimplex(), new sSimplex()];
        this.m_store = [new sSV(), new sSV(), new sSV(), new sSV()];
        this.m_free = [null, null, null, null];
        this.m_nfree = 0;
        this.m_current = 0;
        this.m_simplex = null;
        this.m_status = GJKStatus.Failed;
        this.initialize();
    }

    initialize(): void {
        this.m_ray = new btVector3(0, 0, 0);
        this.m_nfree = 0;
        this.m_status = GJKStatus.Failed;
        this.m_current = 0;
        this.m_distance = 0;
    }

    evaluate(shapearg: MinkowskiDiff, guess: btVector3): GJKStatus {
        let iterations = 0;
        let sqdist = 0;
        let alpha = 0;
        const lastw: btVector3[] = [
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0)
        ];
        let clastw = 0;

        // Initialize solver
        this.m_free[0] = this.m_store[0];
        this.m_free[1] = this.m_store[1];
        this.m_free[2] = this.m_store[2];
        this.m_free[3] = this.m_store[3];
        this.m_nfree = 4;
        this.m_current = 0;
        this.m_status = GJKStatus.Valid;
        this.m_shape = shapearg;
        this.m_distance = 0;

        // Initialize simplex
        this.m_simplices[0].rank = 0;
        this.m_ray = guess.clone();
        const sqrl = this.m_ray.length2();
        this.appendVertice(this.m_simplices[0], sqrl > 0 ? this.m_ray.negate() : new btVector3(1, 0, 0));
        this.m_simplices[0].p[0] = 1;
        this.m_ray = this.m_simplices[0].c[0].w.clone();
        sqdist = sqrl;
        lastw[0].copy(this.m_ray);
        lastw[1].copy(this.m_ray);
        lastw[2].copy(this.m_ray);
        lastw[3].copy(this.m_ray);

        // Loop
        do {
            const next = 1 - this.m_current;
            const cs = this.m_simplices[this.m_current];
            const ns = this.m_simplices[next];

            // Check zero
            const rl = this.m_ray.length();
            if (rl < GJK_MIN_DISTANCE) {
                // Touching or inside
                this.m_status = GJKStatus.Inside;
                break;
            }

            // Append new vertice in -'v' direction
            this.appendVertice(cs, this.m_ray.negate());
            const w = cs.c[cs.rank - 1].w;
            let found = false;
            for (let i = 0; i < 4; ++i) {
                if (w.subtract(lastw[i]).length2() < GJK_DUPLICATED_EPS) {
                    found = true;
                    break;
                }
            }
            if (found) {
                // Return old simplex
                this.removeVertice(this.m_simplices[this.m_current]);
                break;
            } else {
                // Update lastw
                lastw[clastw = (clastw + 1) & 3].copy(w);
            }

            // Check for termination
            const omega = btDot(this.m_ray, w) / rl;
            alpha = btMax(omega, alpha);
            if (((rl - alpha) - (GJK_ACCURACY * rl)) <= 0) {
                // Return old simplex
                this.removeVertice(this.m_simplices[this.m_current]);
                break;
            }

            // Reduce simplex
            const weights: number[] = [0, 0, 0, 0];
            let mask = 0;
            switch (cs.rank) {
                case 2:
                    sqdist = GJK.projectOrigin2(cs.c[0].w, cs.c[1].w, weights, mask);
                    break;
                case 3:
                    sqdist = GJK.projectOrigin3(cs.c[0].w, cs.c[1].w, cs.c[2].w, weights, mask);
                    break;
                case 4:
                    sqdist = GJK.projectOrigin4(cs.c[0].w, cs.c[1].w, cs.c[2].w, cs.c[3].w, weights, mask);
                    break;
            }

            if (sqdist >= 0) {
                // Valid
                ns.rank = 0;
                this.m_ray = new btVector3(0, 0, 0);
                this.m_current = next;
                for (let i = 0, ni = cs.rank; i < ni; ++i) {
                    if (mask & (1 << i)) {
                        ns.c[ns.rank] = cs.c[i];
                        ns.p[ns.rank++] = weights[i];
                        this.m_ray = this.m_ray.add(cs.c[i].w.multiply(weights[i]));
                    } else {
                        this.m_free[this.m_nfree++] = cs.c[i];
                    }
                }
                if (mask === 15) {
                    this.m_status = GJKStatus.Inside;
                }
            } else {
                // Return old simplex
                this.removeVertice(this.m_simplices[this.m_current]);
                break;
            }
            this.m_status = ((++iterations) < GJK_MAX_ITERATIONS) ? this.m_status : GJKStatus.Failed;
        } while (this.m_status === GJKStatus.Valid);

        this.m_simplex = this.m_simplices[this.m_current];
        switch (this.m_status) {
            case GJKStatus.Valid:
                this.m_distance = this.m_ray.length();
                break;
            case GJKStatus.Inside:
                this.m_distance = 0;
                break;
            default:
                break;
        }
        return this.m_status;
    }

    encloseOrigin(): boolean {
        switch (this.m_simplex.rank) {
            case 1:
                {
                    for (let i = 0; i < 3; ++i) {
                        const axis = new btVector3(0, 0, 0);
                        axis.setValue(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
                        this.appendVertice(this.m_simplex, axis);
                        if (this.encloseOrigin()) return true;
                        this.removeVertice(this.m_simplex);
                        this.appendVertice(this.m_simplex, axis.negate());
                        if (this.encloseOrigin()) return true;
                        this.removeVertice(this.m_simplex);
                    }
                }
                break;
            case 2:
                {
                    const d = this.m_simplex.c[1].w.subtract(this.m_simplex.c[0].w);
                    for (let i = 0; i < 3; ++i) {
                        const axis = new btVector3(0, 0, 0);
                        axis.setValue(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
                        const p = btCross(d, axis);
                        if (p.length2() > 0) {
                            this.appendVertice(this.m_simplex, p);
                            if (this.encloseOrigin()) return true;
                            this.removeVertice(this.m_simplex);
                            this.appendVertice(this.m_simplex, p.negate());
                            if (this.encloseOrigin()) return true;
                            this.removeVertice(this.m_simplex);
                        }
                    }
                }
                break;
            case 3:
                {
                    const n = btCross(
                        this.m_simplex.c[1].w.subtract(this.m_simplex.c[0].w),
                        this.m_simplex.c[2].w.subtract(this.m_simplex.c[0].w)
                    );
                    if (n.length2() > 0) {
                        this.appendVertice(this.m_simplex, n);
                        if (this.encloseOrigin()) return true;
                        this.removeVertice(this.m_simplex);
                        this.appendVertice(this.m_simplex, n.negate());
                        if (this.encloseOrigin()) return true;
                        this.removeVertice(this.m_simplex);
                    }
                }
                break;
            case 4:
                {
                    if (btFabs(GJK.det(
                        this.m_simplex.c[0].w.subtract(this.m_simplex.c[3].w),
                        this.m_simplex.c[1].w.subtract(this.m_simplex.c[3].w),
                        this.m_simplex.c[2].w.subtract(this.m_simplex.c[3].w)
                    )) > 0) {
                        return true;
                    }
                }
                break;
        }
        return false;
    }

    getSupport(d: btVector3, sv: sSV): void {
        sv.d = d.clone().normalize();
        sv.w = this.m_shape.support(sv.d);
    }

    removeVertice(simplex: sSimplex): void {
        this.m_free[this.m_nfree++] = simplex.c[--simplex.rank];
    }

    appendVertice(simplex: sSimplex, v: btVector3): void {
        simplex.p[simplex.rank] = 0;
        simplex.c[simplex.rank] = this.m_free[--this.m_nfree];
        this.getSupport(v, simplex.c[simplex.rank++]);
    }

    static det(a: btVector3, b: btVector3, c: btVector3): number {
        return (a.y() * b.z() * c.x() + a.z() * b.x() * c.y() -
                a.x() * b.z() * c.y() - a.y() * b.x() * c.z() +
                a.x() * b.y() * c.z() - a.z() * b.y() * c.x());
    }

    static projectOrigin2(a: btVector3, b: btVector3, w: number[], m: number): number {
        const d = b.subtract(a);
        const l = d.length2();
        if (l > GJK_SIMPLEX2_EPS) {
            const t = l > 0 ? -btDot(a, d) / l : 0;
            if (t >= 1) {
                w[0] = 0;
                w[1] = 1;
                m = 2;
                return b.length2();
            } else if (t <= 0) {
                w[0] = 1;
                w[1] = 0;
                m = 1;
                return a.length2();
            } else {
                w[0] = 1 - (w[1] = t);
                m = 3;
                return a.add(d.multiply(t)).length2();
            }
        }
        return -1;
    }

    static projectOrigin3(a: btVector3, b: btVector3, c: btVector3, w: number[], m: number): number {
        const imd3 = [1, 2, 0];
        const vt = [a, b, c];
        const dl = [a.subtract(b), b.subtract(c), c.subtract(a)];
        const n = btCross(dl[0], dl[1]);
        const l = n.length2();

        if (l > GJK_SIMPLEX3_EPS) {
            let mindist = -1;
            const subw = [0, 0];
            let subm = 0;

            for (let i = 0; i < 3; ++i) {
                if (btDot(vt[i], btCross(dl[i], n)) > 0) {
                    const j = imd3[i];
                    const subd = GJK.projectOrigin2(vt[i], vt[j], subw, subm);
                    if ((mindist < 0) || (subd < mindist)) {
                        mindist = subd;
                        m = ((subm & 1) ? 1 << i : 0) + ((subm & 2) ? 1 << j : 0);
                        w[i] = subw[0];
                        w[j] = subw[1];
                        w[imd3[j]] = 0;
                    }
                }
            }

            if (mindist < 0) {
                const d = btDot(a, n);
                const s = btSqrt(l);
                const p = n.multiply(d / l);
                mindist = p.length2();
                m = 7;
                w[0] = btCross(dl[1], b.subtract(p)).length() / s;
                w[1] = btCross(dl[2], c.subtract(p)).length() / s;
                w[2] = 1 - (w[0] + w[1]);
            }
            return mindist;
        }
        return -1;
    }

    static projectOrigin4(a: btVector3, b: btVector3, c: btVector3, d: btVector3, w: number[], m: number): number {
        const imd3 = [1, 2, 0];
        const vt = [a, b, c, d];
        const dl = [a.subtract(d), b.subtract(d), c.subtract(d)];
        const vl = GJK.det(dl[0], dl[1], dl[2]);
        const ng = (vl * btDot(a, btCross(b.subtract(c), a.subtract(b)))) <= 0;

        if (ng && (btFabs(vl) > GJK_SIMPLEX4_EPS)) {
            let mindist = -1;
            const subw = [0, 0, 0];
            let subm = 0;

            for (let i = 0; i < 3; ++i) {
                const j = imd3[i];
                const s = vl * btDot(d, btCross(dl[i], dl[j]));
                if (s > 0) {
                    const subd = GJK.projectOrigin3(vt[i], vt[j], d, subw, subm);
                    if ((mindist < 0) || (subd < mindist)) {
                        mindist = subd;
                        m = (subm & 1 ? 1 << i : 0) +
                            (subm & 2 ? 1 << j : 0) +
                            (subm & 4 ? 8 : 0);
                        w[i] = subw[0];
                        w[j] = subw[1];
                        w[imd3[j]] = 0;
                        w[3] = subw[2];
                    }
                }
            }

            if (mindist < 0) {
                mindist = 0;
                m = 15;
                w[0] = GJK.det(c, b, d) / vl;
                w[1] = GJK.det(a, c, d) / vl;
                w[2] = GJK.det(b, a, d) / vl;
                w[3] = 1 - (w[0] + w[1] + w[2]);
            }
            return mindist;
        }
        return -1;
    }
}

// EPA Face structure
class sFace {
    n: btVector3;
    d: number;
    c: [sSV | null, sSV | null, sSV | null];
    f: [sFace | null, sFace | null, sFace | null];
    l: [sFace | null, sFace | null];
    e: [number, number, number];
    pass: number;

    constructor() {
        this.n = new btVector3(0, 0, 0);
        this.d = 0;
        this.c = [null, null, null];
        this.f = [null, null, null];
        this.l = [null, null];
        this.e = [0, 0, 0];
        this.pass = 0;
    }
}

// EPA List structure
class sList {
    root: sFace | null;
    count: number;

    constructor() {
        this.root = null;
        this.count = 0;
    }
}

// EPA Horizon structure
class sHorizon {
    cf: sFace | null;
    ff: sFace | null;
    nf: number;

    constructor() {
        this.cf = null;
        this.ff = null;
        this.nf = 0;
    }
}

// EPA class
class EPA {
    m_status: EPAStatus;
    m_result: sSimplex;
    m_normal: btVector3;
    m_depth: number;
    m_sv_store: sSV[];
    m_fc_store: sFace[];
    m_nextsv: number;
    m_hull: sList;
    m_stock: sList;

    constructor() {
        this.m_status = EPAStatus.Failed;
        this.m_result = new sSimplex();
        this.m_normal = new btVector3(0, 0, 0);
        this.m_depth = 0;
        this.m_sv_store = [];
        this.m_fc_store = [];
        this.m_nextsv = 0;
        this.m_hull = new sList();
        this.m_stock = new sList();
        this.initialize();
    }

    static bind(fa: sFace, ea: number, fb: sFace, eb: number): void {
        fa.e[ea] = eb;
        fa.f[ea] = fb;
        fb.e[eb] = ea;
        fb.f[eb] = fa;
    }

    static append(list: sList, face: sFace): void {
        face.l[0] = null;
        face.l[1] = list.root;
        if (list.root) list.root.l[0] = face;
        list.root = face;
        ++list.count;
    }

    static remove(list: sList, face: sFace): void {
        if (face.l[1]) face.l[1].l[0] = face.l[0];
        if (face.l[0]) face.l[0].l[1] = face.l[1];
        if (face === list.root) list.root = face.l[1];
        --list.count;
    }

    initialize(): void {
        this.m_status = EPAStatus.Failed;
        this.m_normal = new btVector3(0, 0, 0);
        this.m_depth = 0;
        this.m_nextsv = 0;

        // Initialize storage arrays
        this.m_sv_store = [];
        for (let i = 0; i < EPA_MAX_VERTICES; ++i) {
            this.m_sv_store.push(new sSV());
        }

        this.m_fc_store = [];
        for (let i = 0; i < EPA_MAX_FACES; ++i) {
            this.m_fc_store.push(new sFace());
        }

        this.m_hull = new sList();
        this.m_stock = new sList();

        for (let i = 0; i < EPA_MAX_FACES; ++i) {
            EPA.append(this.m_stock, this.m_fc_store[EPA_MAX_FACES - i - 1]);
        }
    }

    evaluate(gjk: GJK, guess: btVector3): EPAStatus {
        const simplex = gjk.m_simplex;
        if ((simplex.rank > 1) && gjk.encloseOrigin()) {
            // Clean up
            while (this.m_hull.root) {
                const f = this.m_hull.root;
                EPA.remove(this.m_hull, f);
                EPA.append(this.m_stock, f);
            }

            this.m_status = EPAStatus.Valid;
            this.m_nextsv = 0;

            // Orient simplex
            if (GJK.det(
                simplex.c[0]!.w.subtract(simplex.c[3]!.w),
                simplex.c[1]!.w.subtract(simplex.c[3]!.w),
                simplex.c[2]!.w.subtract(simplex.c[3]!.w)
            ) < 0) {
                // Swap simplex vertices
                const tempC = simplex.c[0];
                simplex.c[0] = simplex.c[1];
                simplex.c[1] = tempC;
                const tempP = simplex.p[0];
                simplex.p[0] = simplex.p[1];
                simplex.p[1] = tempP;
            }

            // Build initial hull
            const tetra: (sFace | null)[] = [
                this.newface(simplex.c[0]!, simplex.c[1]!, simplex.c[2]!, true),
                this.newface(simplex.c[1]!, simplex.c[0]!, simplex.c[3]!, true),
                this.newface(simplex.c[2]!, simplex.c[1]!, simplex.c[3]!, true),
                this.newface(simplex.c[0]!, simplex.c[2]!, simplex.c[3]!, true)
            ];

            if (this.m_hull.count === 4) {
                let best = this.findbest();
                const outer = this.copyFace(best);
                let pass = 0;
                let iterations = 0;

                EPA.bind(tetra[0]!, 0, tetra[1]!, 0);
                EPA.bind(tetra[0]!, 1, tetra[2]!, 0);
                EPA.bind(tetra[0]!, 2, tetra[3]!, 0);
                EPA.bind(tetra[1]!, 1, tetra[3]!, 2);
                EPA.bind(tetra[1]!, 2, tetra[2]!, 1);
                EPA.bind(tetra[2]!, 2, tetra[3]!, 1);

                this.m_status = EPAStatus.Valid;
                for (; iterations < EPA_MAX_ITERATIONS; ++iterations) {
                    if (this.m_nextsv < EPA_MAX_VERTICES) {
                        const horizon = new sHorizon();
                        const w = this.m_sv_store[this.m_nextsv++];
                        let valid = true;
                        best.pass = ++pass;
                        gjk.getSupport(best.n, w);
                        const wdist = btDot(best.n, w.w) - best.d;

                        if (wdist > EPA_ACCURACY) {
                            for (let j = 0; (j < 3) && valid; ++j) {
                                valid = valid && this.expand(pass, w, best.f[j]!, best.e[j], horizon);
                            }
                            if (valid && (horizon.nf >= 3)) {
                                EPA.bind(horizon.cf, 1, horizon.ff, 2);
                                EPA.remove(this.m_hull, best);
                                EPA.append(this.m_stock, best);
                                best = this.findbest();
                                this.copyFaceData(best, outer);
                            } else {
                                this.m_status = EPAStatus.InvalidHull;
                                break;
                            }
                        } else {
                            this.m_status = EPAStatus.AccuraryReached;
                            break;
                        }
                    } else {
                        this.m_status = EPAStatus.OutOfVertices;
                        break;
                    }
                }

                const projection = outer.n.multiply(outer.d);
                this.m_normal = outer.n.clone();
                this.m_depth = outer.d;
                this.m_result.rank = 3;
                this.m_result.c[0] = outer.c[0]!;
                this.m_result.c[1] = outer.c[1]!;
                this.m_result.c[2] = outer.c[2]!;

                this.m_result.p[0] = btCross(
                    outer.c[1]!.w.subtract(projection),
                    outer.c[2]!.w.subtract(projection)
                ).length();
                this.m_result.p[1] = btCross(
                    outer.c[2]!.w.subtract(projection),
                    outer.c[0]!.w.subtract(projection)
                ).length();
                this.m_result.p[2] = btCross(
                    outer.c[0]!.w.subtract(projection),
                    outer.c[1]!.w.subtract(projection)
                ).length();

                const sum = this.m_result.p[0] + this.m_result.p[1] + this.m_result.p[2];
                this.m_result.p[0] /= sum;
                this.m_result.p[1] /= sum;
                this.m_result.p[2] /= sum;
                return this.m_status;
            }
        }

        // Fallback
        this.m_status = EPAStatus.FallBack;
        this.m_normal = guess.negate();
        const nl = this.m_normal.length();
        if (nl > 0) {
            this.m_normal = this.m_normal.divide(nl);
        } else {
            this.m_normal = new btVector3(1, 0, 0);
        }
        this.m_depth = 0;
        this.m_result.rank = 1;
        this.m_result.c[0] = simplex.c[0]!;
        this.m_result.p[0] = 1;
        return this.m_status;
    }

    getedgedist(face: sFace, a: sSV, b: sSV, distOut: { value: number }): boolean {
        const ba = b.w.subtract(a.w);
        const n_ab = btCross(ba, face.n); // Outward facing edge normal direction, on triangle plane
        const a_dot_nab = btDot(a.w, n_ab); // Only care about the sign to determine inside/outside, so not normalization required

        if (a_dot_nab < 0) {
            // Outside of edge a->b
            const ba_l2 = ba.length2();
            const a_dot_ba = btDot(a.w, ba);
            const b_dot_ba = btDot(b.w, ba);

            if (a_dot_ba > 0) {
                // Pick distance vertex a
                distOut.value = a.w.length();
            } else if (b_dot_ba < 0) {
                // Pick distance vertex b
                distOut.value = b.w.length();
            } else {
                // Pick distance to edge a->b
                const a_dot_b = btDot(a.w, b.w);
                distOut.value = btSqrt(btMax((a.w.length2() * b.w.length2() - a_dot_b * a_dot_b) / ba_l2, 0));
            }
            return true;
        }
        return false;
    }

    newface(a: sSV, b: sSV, c: sSV, forced: boolean): sFace {
        if (this.m_stock.root) {
            const face = this.m_stock.root;
            EPA.remove(this.m_stock, face);
            EPA.append(this.m_hull, face);
            face.pass = 0;
            face.c[0] = a;
            face.c[1] = b;
            face.c[2] = c;
            face.n = btCross(b.w.subtract(a.w), c.w.subtract(a.w));
            const l = face.n.length();
            const v = l > EPA_ACCURACY;

            if (v) {
                const distOut = { value: 0 };
                if (!(this.getedgedist(face, a, b, distOut) ||
                      this.getedgedist(face, b, c, distOut) ||
                      this.getedgedist(face, c, a, distOut))) {
                    // Origin projects to the interior of the triangle
                    // Use distance to triangle plane
                    face.d = btDot(a.w, face.n) / l;
                } else {
                    face.d = distOut.value;
                }

                face.n = face.n.divide(l);
                if (forced || (face.d >= -EPA_PLANE_EPS)) {
                    return face;
                } else {
                    this.m_status = EPAStatus.NonConvex;
                }
            } else {
                this.m_status = EPAStatus.Degenerated;
            }

            EPA.remove(this.m_hull, face);
            EPA.append(this.m_stock, face);
            return null;
        }
        this.m_status = this.m_stock.root ? EPAStatus.OutOfVertices : EPAStatus.OutOfFaces;
        return null;
    }

    findbest(): sFace {
        let minf = this.m_hull.root;
        let mind = minf.d * minf.d;
        for (let f = minf.l[1]; f; f = f.l[1]) {
            const sqd = f.d * f.d;
            if (sqd < mind) {
                minf = f;
                mind = sqd;
            }
        }
        return minf;
    }

    expand(pass: number, w: sSV, f: sFace, e: number, horizon: sHorizon): boolean {
        const i1m3 = [1, 2, 0];
        const i2m3 = [2, 0, 1];

        if (f.pass !== pass) {
            const e1 = i1m3[e];
            if ((btDot(f.n, w.w) - f.d) < -EPA_PLANE_EPS) {
                const nf = this.newface(f.c[e1]!, f.c[e]!, w, false);
                if (nf) {
                    EPA.bind(nf, 0, f, e);
                    if (horizon.cf) {
                        EPA.bind(horizon.cf, 1, nf, 2);
                    } else {
                        horizon.ff = nf;
                    }
                    horizon.cf = nf;
                    ++horizon.nf;
                    return true;
                }
            } else {
                const e2 = i2m3[e];
                f.pass = pass;
                if (this.expand(pass, w, f.f[e1]!, f.e[e1], horizon) &&
                    this.expand(pass, w, f.f[e2]!, f.e[e2], horizon)) {
                    EPA.remove(this.m_hull, f);
                    EPA.append(this.m_stock, f);
                    return true;
                }
            }
        }
        return false;
    }

    private copyFace(face: sFace): sFace {
        const copy = new sFace();
        copy.n.copy(face.n);
        copy.d = face.d;
        copy.c[0] = face.c[0];
        copy.c[1] = face.c[1];
        copy.c[2] = face.c[2];
        return copy;
    }

    private copyFaceData(target: sFace, source: sFace): void {
        target.n.copy(source.n);
        target.d = source.d;
        target.c[0] = source.c[0];
        target.c[1] = source.c[1];
        target.c[2] = source.c[2];
    }
}

// Initialize function
function initialize(
    shape0: btConvexShape, wtrs0: btTransform,
    shape1: btConvexShape, wtrs1: btTransform,
    results: sResults,
    shape: MinkowskiDiff,
    withmargins: boolean
): void {
    // Results
    results.witnesses[0] = new btVector3(0, 0, 0);
    results.witnesses[1] = new btVector3(0, 0, 0);
    results.status = eStatus.Separated;

    // Shape
    shape.m_shapes[0] = shape0;
    shape.m_shapes[1] = shape1;
    shape.m_toshape1 = wtrs1.getBasis().transposeTimes(wtrs0.getBasis());
    shape.m_toshape0 = wtrs0.inverseTimes(wtrs1);
    shape.setMarginEnabled(withmargins);
}

// Main solver class
export class btGjkEpaSolver2 {
    static stackSizeRequirement(): number {
        // In TypeScript, we don't need to worry about stack size
        return 0;
    }

    static distance(
        shape0: btConvexShape, wtrs0: btTransform,
        shape1: btConvexShape, wtrs1: btTransform,
        guess: btVector3,
        results: sResults
    ): boolean {
        const shape = new MinkowskiDiff();
        initialize(shape0, wtrs0, shape1, wtrs1, results, shape, false);
        const gjk = new GJK();
        const gjk_status = gjk.evaluate(shape, guess);

        if (gjk_status === GJKStatus.Valid) {
            let w0 = new btVector3(0, 0, 0);
            let w1 = new btVector3(0, 0, 0);
            for (let i = 0; i < gjk.m_simplex.rank; ++i) {
                const p = gjk.m_simplex.p[i];
                w0 = w0.add(shape.supportWithIndex(gjk.m_simplex.c[i].d, 0).multiply(p));
                w1 = w1.add(shape.supportWithIndex(gjk.m_simplex.c[i].d.negate(), 1).multiply(p));
            }
            results.witnesses[0] = wtrs0.transformPoint(w0);
            results.witnesses[1] = wtrs0.transformPoint(w1);
            results.normal = w0.subtract(w1);
            results.distance = results.normal.length();
            results.normal = results.normal.divide(results.distance > GJK_MIN_DISTANCE ? results.distance : 1);
            return true;
        } else {
            results.status = gjk_status === GJKStatus.Inside ? eStatus.Penetrating : eStatus.GJK_Failed;
            return false;
        }
    }

    static penetration(
        shape0: btConvexShape, wtrs0: btTransform,
        shape1: btConvexShape, wtrs1: btTransform,
        guess: btVector3,
        results: sResults,
        usemargins: boolean = true
    ): boolean {
        const shape = new MinkowskiDiff();
        initialize(shape0, wtrs0, shape1, wtrs1, results, shape, usemargins);
        const gjk = new GJK();
        const gjk_status = gjk.evaluate(shape, guess.negate());

        switch (gjk_status) {
            case GJKStatus.Inside:
                {
                    const epa = new EPA();
                    const epa_status = epa.evaluate(gjk, guess.negate());
                    if (epa_status !== EPAStatus.Failed) {
                        let w0 = new btVector3(0, 0, 0);
                        for (let i = 0; i < epa.m_result.rank; ++i) {
                            w0 = w0.add(shape.supportWithIndex(epa.m_result.c[i].d, 0).multiply(epa.m_result.p[i]));
                        }
                        results.status = eStatus.Penetrating;
                        results.witnesses[0] = wtrs0.transformPoint(w0);
                        results.witnesses[1] = wtrs0.transformPoint(w0.subtract(epa.m_normal.multiply(epa.m_depth)));
                        results.normal = epa.m_normal.negate();
                        results.distance = -epa.m_depth;
                        return true;
                    } else {
                        results.status = eStatus.EPA_Failed;
                    }
                }
                break;
            case GJKStatus.Failed:
                results.status = eStatus.GJK_Failed;
                break;
            default:
                break;
        }
        return false;
    }

    static signedDistance(
        position: btVector3,
        margin: number,
        shape0: btConvexShape,
        wtrs0: btTransform,
        results: sResults
    ): number {
        const shape = new MinkowskiDiff();
        const shape1 = new btSphereShape(margin);
        const wtrs1 = new btTransform(new btQuaternion(0, 0, 0, 1), position);
        initialize(shape0, wtrs0, shape1, wtrs1, results, shape, false);
        const gjk = new GJK();
        const gjk_status = gjk.evaluate(shape, new btVector3(1, 1, 1));

        if (gjk_status === GJKStatus.Valid) {
            let w0 = new btVector3(0, 0, 0);
            let w1 = new btVector3(0, 0, 0);
            for (let i = 0; i < gjk.m_simplex.rank; ++i) {
                const p = gjk.m_simplex.p[i];
                w0 = w0.add(shape.supportWithIndex(gjk.m_simplex.c[i].d, 0).multiply(p));
                w1 = w1.add(shape.supportWithIndex(gjk.m_simplex.c[i].d.negate(), 1).multiply(p));
            }
            results.witnesses[0] = wtrs0.transformPoint(w0);
            results.witnesses[1] = wtrs0.transformPoint(w1);
            const delta = results.witnesses[1].subtract(results.witnesses[0]);
            const marginTotal = shape0.getMarginNonVirtual() + shape1.getMarginNonVirtual();
            const length = delta.length();
            results.normal = delta.divide(length);
            results.witnesses[0] = results.witnesses[0].add(results.normal.multiply(marginTotal));
            results.distance = length - marginTotal;
            return results.distance;
        } else {
            if (gjk_status === GJKStatus.Inside) {
                if (btGjkEpaSolver2.penetration(shape0, wtrs0, shape1, wtrs1, gjk.m_ray, results)) {
                    const delta = results.witnesses[0].subtract(results.witnesses[1]);
                    const length = delta.length();
                    if (length >= SIMD_EPSILON) {
                        results.normal = delta.divide(length);
                    }
                    return -length;
                }
            }
        }
        return SIMD_INFINITY;
    }

    static signedDistanceShape(
        shape0: btConvexShape, wtrs0: btTransform,
        shape1: btConvexShape, wtrs1: btTransform,
        guess: btVector3,
        results: sResults
    ): boolean {
        if (!btGjkEpaSolver2.distance(shape0, wtrs0, shape1, wtrs1, guess, results)) {
            return btGjkEpaSolver2.penetration(shape0, wtrs0, shape1, wtrs1, guess, results, false);
        } else {
            return true;
        }
    }
}

// Export types and constants for external use
export { eStatus, sResults, GJKStatus, EPAStatus };