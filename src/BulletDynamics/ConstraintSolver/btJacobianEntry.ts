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

import { btMatrix3x3, multiplyMatrixVector } from '../../LinearMath/btMatrix3x3';
import { btVector3 } from '../../LinearMath/btVector3';
import { btAssert, SIMD_EPSILON } from '../../LinearMath/btScalar';

//notes:
// Another memory optimization would be to store m_1MinvJt in the remaining 3 w components
// which makes the btJacobianEntry memory layout 16 bytes
// if you only are interested in angular part, just feed massInvA and massInvB zero

/**
 * Jacobian entry is an abstraction that allows to describe constraints
 * it can be used in combination with a constraint solver
 * Can be used to relate the effect of an impulse to the constraint error
 */
export class btJacobianEntry {
    public m_linearJointAxis: btVector3;
    public m_aJ: btVector3;
    public m_bJ: btVector3;
    public m_0MinvJt: btVector3;
    public m_1MinvJt: btVector3;
    // Optimization: can be stored in the w/last component of one of the vectors
    public m_Adiag: number;

    constructor();
    constructor(
        world2A: btMatrix3x3,
        world2B: btMatrix3x3,
        rel_pos1: btVector3, rel_pos2: btVector3,
        jointAxis: btVector3,
        inertiaInvA: btVector3,
        massInvA: number,
        inertiaInvB: btVector3,
        massInvB: number
    );
    constructor(
        jointAxis: btVector3,
        world2A: btMatrix3x3,
        world2B: btMatrix3x3,
        inertiaInvA: btVector3,
        inertiaInvB: btVector3
    );
    constructor(
        axisInA: btVector3,
        axisInB: btVector3,
        inertiaInvA: btVector3,
        inertiaInvB: btVector3
    );
    constructor(
        world2A: btMatrix3x3,
        rel_pos1: btVector3, rel_pos2: btVector3,
        jointAxis: btVector3,
        inertiaInvA: btVector3,
        massInvA: number
    );
    constructor(...args: any[]) {
        this.m_linearJointAxis = new btVector3();
        this.m_aJ = new btVector3();
        this.m_bJ = new btVector3();
        this.m_0MinvJt = new btVector3();
        this.m_1MinvJt = new btVector3();
        this.m_Adiag = 0;

        if (args.length === 0) {
            // Default constructor
            return;
        }

        if (args.length === 9) {
            // constraint between two different rigidbodies
            const world2A = args[0] as btMatrix3x3;
            const world2B = args[1] as btMatrix3x3;
            const rel_pos1 = args[2] as btVector3;
            const rel_pos2 = args[3] as btVector3;
            const jointAxis = args[4] as btVector3;
            const inertiaInvA = args[5] as btVector3;
            const massInvA = args[6] as number;
            const inertiaInvB = args[7] as btVector3;
            const massInvB = args[8] as number;

            this.m_linearJointAxis.copy(jointAxis);
            this.m_aJ = multiplyMatrixVector(world2A, rel_pos1.cross(this.m_linearJointAxis));
            this.m_bJ = multiplyMatrixVector(world2B, rel_pos2.cross(this.m_linearJointAxis.negate()));
            this.m_0MinvJt = inertiaInvA.multiplyVector(this.m_aJ);
            this.m_1MinvJt = inertiaInvB.multiplyVector(this.m_bJ);
            this.m_Adiag = massInvA + this.m_0MinvJt.dot(this.m_aJ) + massInvB + this.m_1MinvJt.dot(this.m_bJ);

            btAssert(this.m_Adiag > 0.0);
        } else if (args.length === 5 && args[0] instanceof btVector3) {
            // angular constraint between two different rigidbodies
            const jointAxis = args[0] as btVector3;
            const world2A = args[1] as btMatrix3x3;
            const world2B = args[2] as btMatrix3x3;
            const inertiaInvA = args[3] as btVector3;
            const inertiaInvB = args[4] as btVector3;

            this.m_linearJointAxis.setValue(0, 0, 0);
            this.m_aJ = multiplyMatrixVector(world2A, jointAxis);
            this.m_bJ = multiplyMatrixVector(world2B, jointAxis.negate());
            this.m_0MinvJt = inertiaInvA.multiplyVector(this.m_aJ);
            this.m_1MinvJt = inertiaInvB.multiplyVector(this.m_bJ);
            this.m_Adiag = this.m_0MinvJt.dot(this.m_aJ) + this.m_1MinvJt.dot(this.m_bJ);

            btAssert(this.m_Adiag > 0.0);
        } else if (args.length === 4 && args[0] instanceof btVector3) {
            // angular constraint between two different rigidbodies (axisInA/axisInB version)
            const axisInA = args[0] as btVector3;
            const axisInB = args[1] as btVector3;
            const inertiaInvA = args[2] as btVector3;
            const inertiaInvB = args[3] as btVector3;

            this.m_linearJointAxis.setValue(0, 0, 0);
            this.m_aJ.copy(axisInA);
            this.m_bJ.copy(axisInB.negate());
            this.m_0MinvJt = inertiaInvA.multiplyVector(this.m_aJ);
            this.m_1MinvJt = inertiaInvB.multiplyVector(this.m_bJ);
            this.m_Adiag = this.m_0MinvJt.dot(this.m_aJ) + this.m_1MinvJt.dot(this.m_bJ);

            btAssert(this.m_Adiag > 0.0);
        } else if (args.length === 6) {
            // constraint on one rigidbody
            const world2A = args[0] as btMatrix3x3;
            const rel_pos1 = args[1] as btVector3;
            const rel_pos2 = args[2] as btVector3;
            const jointAxis = args[3] as btVector3;
            const inertiaInvA = args[4] as btVector3;
            const massInvA = args[5] as number;

            this.m_linearJointAxis.copy(jointAxis);
            this.m_aJ = multiplyMatrixVector(world2A, rel_pos1.cross(jointAxis));
            this.m_bJ = multiplyMatrixVector(world2A, rel_pos2.cross(jointAxis.negate()));
            this.m_0MinvJt = inertiaInvA.multiplyVector(this.m_aJ);
            this.m_1MinvJt.setValue(0, 0, 0);
            this.m_Adiag = massInvA + this.m_0MinvJt.dot(this.m_aJ);

            btAssert(this.m_Adiag > 0.0);
        }
    }

    getDiagonal(): number {
        return this.m_Adiag;
    }

    // for two constraints on the same rigidbody (for example vehicle friction)
    getNonDiagonal(jacB: btJacobianEntry, massInvA: number): number;
    // for two constraints on sharing two same rigidbodies (for example two contact points between two rigidbodies)
    getNonDiagonal(jacB: btJacobianEntry, massInvA: number, massInvB: number): number;
    getNonDiagonal(jacB: btJacobianEntry, massInvA: number, massInvB?: number): number {
        if (massInvB === undefined) {
            const jacA = this;
            const lin = massInvA * jacA.m_linearJointAxis.dot(jacB.m_linearJointAxis);
            const ang = jacA.m_0MinvJt.dot(jacB.m_aJ);
            return lin + ang;
        } else {
            const jacA = this;
            const lin = jacA.m_linearJointAxis.multiplyVector(jacB.m_linearJointAxis);
            const ang0 = jacA.m_0MinvJt.multiplyVector(jacB.m_aJ);
            const ang1 = jacA.m_1MinvJt.multiplyVector(jacB.m_bJ);
            const lin0 = lin.multiply(massInvA);
            const lin1 = lin.multiply(massInvB);
            const sum = ang0.add(ang1).add(lin0).add(lin1);
            return sum.x() + sum.y() + sum.z();
        }
    }

    getRelativeVelocity(linvelA: btVector3, angvelA: btVector3, linvelB: btVector3, angvelB: btVector3): number {
        const linrel = linvelA.subtract(linvelB);
        const angvela = angvelA.multiplyVector(this.m_aJ);
        const angvelb = angvelB.multiplyVector(this.m_bJ);
        const linrel_scaled = linrel.multiplyVector(this.m_linearJointAxis);
        const angvela_total = angvela.add(angvelb).add(linrel_scaled);
        const rel_vel2 = angvela_total.x() + angvela_total.y() + angvela_total.z();
        return rel_vel2 + SIMD_EPSILON;
    }
}