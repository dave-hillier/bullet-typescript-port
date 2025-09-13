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

import { btTransform } from './btTransform';
import { btVector3 } from './btVector3';
import { btQuaternion } from './btQuaternion';
import { SIMD_EPSILON, SIMD_HALF_PI } from './btScalar';

export const ANGULAR_MOTION_THRESHOLD = 0.5 * SIMD_HALF_PI;

export function btAabbSupport(halfExtents: btVector3, supportDir: btVector3): btVector3 {
    return new btVector3(
        supportDir.x() < 0.0 ? -halfExtents.x() : halfExtents.x(),
        supportDir.y() < 0.0 ? -halfExtents.y() : halfExtents.y(),
        supportDir.z() < 0.0 ? -halfExtents.z() : halfExtents.z()
    );
}

/**
 * Utils related to temporal transforms
 */
export class btTransformUtil {
    static integrateTransform(
        curTrans: btTransform,
        linvel: btVector3,
        angvel: btVector3,
        timeStep: number,
        predictedTransform: btTransform
    ): void {
        predictedTransform.setOrigin(curTrans.getOrigin().add(linvel.multiply(timeStep)));

        // Exponential map
        // Reference: "Practical Parameterization of Rotations Using the Exponential Map", F. Sebastian Grassia
        
        const fAngle2 = angvel.length2();
        let fAngle = 0;
        if (fAngle2 > SIMD_EPSILON) {
            fAngle = Math.sqrt(fAngle2);
        }

        // Limit the angular motion
        if (fAngle * timeStep > ANGULAR_MOTION_THRESHOLD) {
            fAngle = ANGULAR_MOTION_THRESHOLD / timeStep;
        }

        let axis: btVector3;
        if (fAngle < 0.001) {
            // Use Taylor's expansions of sync function
            axis = angvel.multiply(0.5 * timeStep - (timeStep * timeStep * timeStep) * 0.020833333333 * fAngle * fAngle);
        } else {
            // sync(fAngle) = sin(c*fAngle)/t
            axis = angvel.multiply(Math.sin(0.5 * fAngle * timeStep) / fAngle);
        }

        const dorn = new btQuaternion(axis.x(), axis.y(), axis.z(), Math.cos(fAngle * timeStep * 0.5));
        const orn0 = curTrans.getRotation();

        const predictedOrn = dorn.multiplyQuaternion(orn0);
        predictedOrn.safeNormalize();

        if (predictedOrn.length2() > SIMD_EPSILON) {
            predictedTransform.setRotation(predictedOrn);
        } else {
            predictedTransform.setBasis(curTrans.getBasis());
        }
    }

    static calculateVelocityQuaternion(
        pos0: btVector3,
        pos1: btVector3,
        orn0: btQuaternion,
        orn1: btQuaternion,
        timeStep: number,
        linVel: btVector3,
        angVel: btVector3
    ): void {
        linVel.copy(pos1.subtract(pos0).divide(timeStep));
        
        if (!orn0.equals(orn1)) {
            const axis = new btVector3();
            let angle = 0;
            this.calculateDiffAxisAngleQuaternion(orn0, orn1, axis, angle);
            angVel.copy(axis.multiply(angle / timeStep));
        } else {
            angVel.setValue(0, 0, 0);
        }
    }

    static calculateDiffAxisAngleQuaternion(
        orn0: btQuaternion,
        orn1a: btQuaternion,
        axis: btVector3,
        angle: number
    ): number {
        const orn1 = orn0.nearest(orn1a);
        const dorn = orn1.multiplyQuaternion(orn0.inverse());
        angle = dorn.getAngle();
        axis.setValue(dorn.x(), dorn.y(), dorn.z());
        
        // Check for axis length
        const len = axis.length2();
        if (len < SIMD_EPSILON * SIMD_EPSILON) {
            axis.setValue(1.0, 0.0, 0.0);
        } else {
            axis.divide(Math.sqrt(len));
        }
        return angle;
    }

    static calculateVelocity(
        transform0: btTransform,
        transform1: btTransform,
        timeStep: number,
        linVel: btVector3,
        angVel: btVector3
    ): void {
        linVel.copy(transform1.getOrigin().subtract(transform0.getOrigin()).divide(timeStep));
        
        const axis = new btVector3();
        let angle = 0;
        this.calculateDiffAxisAngle(transform0, transform1, axis, angle);
        angVel.copy(axis.multiply(angle / timeStep));
    }

    static calculateDiffAxisAngle(
        transform0: btTransform,
        transform1: btTransform,
        axis: btVector3,
        angle: number
    ): number {
        const dmat = transform1.getBasis().multiply(transform0.getBasis().inverse());
        const dorn = new btQuaternion();
        dmat.getRotation(dorn);

        // Floating point inaccuracy can lead to w component > 1..., which breaks
        dorn.normalize();

        angle = dorn.getAngle();
        axis.setValue(dorn.x(), dorn.y(), dorn.z());
        
        // Check for axis length
        const len = axis.length2();
        if (len < SIMD_EPSILON * SIMD_EPSILON) {
            axis.setValue(1.0, 0.0, 0.0);
        } else {
            axis.divide(Math.sqrt(len));
        }
        return angle;
    }
}

/**
 * The btConvexSeparatingDistanceUtil can help speed up convex collision detection
 * by conservatively updating a cached separating distance/vector instead of re-calculating the closest distance
 */
export class btConvexSeparatingDistanceUtil {
    private m_ornA: btQuaternion;
    private m_ornB: btQuaternion;
    private m_posA: btVector3;
    private m_posB: btVector3;

    private m_separatingNormal: btVector3;

    private readonly m_boundingRadiusA: number;
    private readonly m_boundingRadiusB: number;
    private m_separatingDistance: number;

    constructor(boundingRadiusA: number, boundingRadiusB: number) {
        this.m_boundingRadiusA = boundingRadiusA;
        this.m_boundingRadiusB = boundingRadiusB;
        this.m_separatingDistance = 0.0;

        this.m_ornA = new btQuaternion();
        this.m_ornB = new btQuaternion();
        this.m_posA = new btVector3();
        this.m_posB = new btVector3();
        this.m_separatingNormal = new btVector3();
    }

    getConservativeSeparatingDistance(): number {
        return this.m_separatingDistance;
    }

    updateSeparatingDistance(transA: btTransform, transB: btTransform): void {
        const toPosA = transA.getOrigin();
        const toPosB = transB.getOrigin();
        const toOrnA = transA.getRotation();
        const toOrnB = transB.getRotation();

        if (this.m_separatingDistance > 0.0) {
            const linVelA = new btVector3();
            const angVelA = new btVector3();
            const linVelB = new btVector3();
            const angVelB = new btVector3();
            
            btTransformUtil.calculateVelocityQuaternion(this.m_posA, toPosA, this.m_ornA, toOrnA, 1.0, linVelA, angVelA);
            btTransformUtil.calculateVelocityQuaternion(this.m_posB, toPosB, this.m_ornB, toOrnB, 1.0, linVelB, angVelB);
            
            const maxAngularProjectedVelocity = angVelA.length() * this.m_boundingRadiusA + 
                                               angVelB.length() * this.m_boundingRadiusB;
            const relLinVel = linVelB.subtract(linVelA);
            let relLinVelocLength = relLinVel.dot(this.m_separatingNormal);
            if (relLinVelocLength < 0.0) {
                relLinVelocLength = 0.0;
            }

            const projectedMotion = maxAngularProjectedVelocity + relLinVelocLength;
            this.m_separatingDistance -= projectedMotion;
        }

        this.m_posA.copy(toPosA);
        this.m_posB.copy(toPosB);
        this.m_ornA.copy(toOrnA);
        this.m_ornB.copy(toOrnB);
    }

    initSeparatingDistance(
        separatingVector: btVector3,
        separatingDistance: number,
        transA: btTransform,
        transB: btTransform
    ): void {
        this.m_separatingDistance = separatingDistance;

        if (this.m_separatingDistance > 0.0) {
            this.m_separatingNormal.copy(separatingVector);

            const toPosA = transA.getOrigin();
            const toPosB = transB.getOrigin();
            const toOrnA = transA.getRotation();
            const toOrnB = transB.getRotation();
            
            this.m_posA.copy(toPosA);
            this.m_posB.copy(toPosB);
            this.m_ornA.copy(toOrnA);
            this.m_ornB.copy(toOrnB);
        }
    }
}