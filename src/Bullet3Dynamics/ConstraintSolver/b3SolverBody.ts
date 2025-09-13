/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org

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
 * TypeScript port of Bullet3Dynamics/ConstraintSolver/b3SolverBody.h
 * Internal data structure for the constraint solver with optimized cache coherence
 */

import { b3Vector3, b3MakeVector3 } from '../../Bullet3Common/b3Vector3';
import { b3Transform } from '../../Bullet3Common/b3Transform';
import { b3Scalar, B3_HALF_PI, b3Sin, b3Cos } from '../../Bullet3Common/b3Scalar';

// Constants for b3TransformUtil
const B3_ANGULAR_MOTION_THRESHOLD = 0.5 * B3_HALF_PI;

/**
 * Utility class for transform operations
 * Port of b3TransformUtil from Bullet3Common/b3TransformUtil.h
 */
export class b3TransformUtil {
    /**
     * Integrate transform with linear and angular velocities over a time step
     * @param curTrans Current transform
     * @param linvel Linear velocity
     * @param angvel Angular velocity
     * @param timeStep Time step
     * @param predictedTransform Output predicted transform
     */
    static integrateTransform(
        curTrans: b3Transform,
        linvel: b3Vector3,
        angvel: b3Vector3,
        timeStep: b3Scalar,
        predictedTransform: b3Transform
    ): void {
        // Update position
        const newOrigin = curTrans.getOrigin().add(linvel.scale(timeStep));
        predictedTransform.setOrigin(newOrigin);

        // Exponential map for rotation
        // Based on "Practical Parameterization of Rotations Using the Exponential Map", F. Sebastian Grassia
        const axis = b3MakeVector3(0, 0, 0);
        let fAngle = angvel.length();

        // Limit the angular motion
        if (fAngle * timeStep > B3_ANGULAR_MOTION_THRESHOLD) {
            fAngle = B3_ANGULAR_MOTION_THRESHOLD / timeStep;
        }

        if (fAngle < 0.001) {
            // Use Taylor's expansions of sync function
            const scaleFactor = 0.5 * timeStep - (timeStep * timeStep * timeStep) * 0.020833333333 * fAngle * fAngle;
            axis.setValue(
                angvel.getX() * scaleFactor,
                angvel.getY() * scaleFactor,
                angvel.getZ() * scaleFactor
            );
        } else {
            // sync(fAngle) = sin(c*fAngle)/t
            const scaleFactor = b3Sin(0.5 * fAngle * timeStep) / fAngle;
            axis.setValue(
                angvel.getX() * scaleFactor,
                angvel.getY() * scaleFactor,
                angvel.getZ() * scaleFactor
            );
        }

        // Create quaternion from axis-angle representation
        const w = b3Cos(fAngle * timeStep * 0.5);
        const dorn = { x: axis.getX(), y: axis.getY(), z: axis.getZ(), w: w };
        
        const orn0 = curTrans.getRotation();
        
        // Multiply quaternions: dorn * orn0
        const predictedOrn = {
            x: dorn.w * orn0.x + dorn.x * orn0.w + dorn.y * orn0.z - dorn.z * orn0.y,
            y: dorn.w * orn0.y - dorn.x * orn0.z + dorn.y * orn0.w + dorn.z * orn0.x,
            z: dorn.w * orn0.z + dorn.x * orn0.y - dorn.y * orn0.x + dorn.z * orn0.w,
            w: dorn.w * orn0.w - dorn.x * orn0.x - dorn.y * orn0.y - dorn.z * orn0.z
        };

        // Normalize quaternion
        const qLength = Math.sqrt(predictedOrn.x * predictedOrn.x + predictedOrn.y * predictedOrn.y + 
                                 predictedOrn.z * predictedOrn.z + predictedOrn.w * predictedOrn.w);
        if (qLength > 0) {
            predictedOrn.x /= qLength;
            predictedOrn.y /= qLength;
            predictedOrn.z /= qLength;
            predictedOrn.w /= qLength;
        }

        predictedTransform.setRotation(predictedOrn);
    }
}

/**
 * The b3SolverBody is an internal data structure for the constraint solver. 
 * Only necessary data is packed to increase cache coherence/performance.
 */
export class b3SolverBody {
    public m_worldTransform: b3Transform;
    public m_deltaLinearVelocity: b3Vector3;
    public m_deltaAngularVelocity: b3Vector3;
    public m_angularFactor: b3Vector3;
    public m_linearFactor: b3Vector3;
    public m_invMass: b3Vector3;
    public m_pushVelocity: b3Vector3;
    public m_turnVelocity: b3Vector3;
    public m_linearVelocity: b3Vector3;
    public m_angularVelocity: b3Vector3;

    /** Original body reference (can be null for static bodies) */
    public m_originalBody: any = null;
    /** Original body index */
    public m_originalBodyIndex: number = 0;

    constructor() {
        this.m_worldTransform = new b3Transform();
        this.m_deltaLinearVelocity = b3MakeVector3(0, 0, 0);
        this.m_deltaAngularVelocity = b3MakeVector3(0, 0, 0);
        this.m_angularFactor = b3MakeVector3(1, 1, 1);
        this.m_linearFactor = b3MakeVector3(1, 1, 1);
        this.m_invMass = b3MakeVector3(0, 0, 0);
        this.m_pushVelocity = b3MakeVector3(0, 0, 0);
        this.m_turnVelocity = b3MakeVector3(0, 0, 0);
        this.m_linearVelocity = b3MakeVector3(0, 0, 0);
        this.m_angularVelocity = b3MakeVector3(0, 0, 0);
    }

    /**
     * Set the world transform
     */
    setWorldTransform(worldTransform: b3Transform): void {
        this.m_worldTransform = worldTransform;
    }

    /**
     * Get the world transform
     */
    getWorldTransform(): b3Transform {
        return this.m_worldTransform;
    }

    /**
     * Get velocity at a local point (obsolete method)
     * @param rel_pos Relative position
     * @param velocity Output velocity
     */
    getVelocityInLocalPointObsolete(rel_pos: b3Vector3, velocity: b3Vector3): void {
        if (this.m_originalBody) {
            const totalLinearVel = this.m_linearVelocity.add(this.m_deltaLinearVelocity);
            const totalAngularVel = this.m_angularVelocity.add(this.m_deltaAngularVelocity);
            const crossProduct = totalAngularVel.cross(rel_pos);
            velocity.setValue(
                totalLinearVel.getX() + crossProduct.getX(),
                totalLinearVel.getY() + crossProduct.getY(),
                totalLinearVel.getZ() + crossProduct.getZ()
            );
        } else {
            velocity.setValue(0, 0, 0);
        }
    }

    /**
     * Get angular velocity
     * @param angVel Output angular velocity
     */
    getAngularVelocity(angVel: b3Vector3): void {
        if (this.m_originalBody) {
            const totalAngularVel = this.m_angularVelocity.add(this.m_deltaAngularVelocity);
            angVel.setValue(totalAngularVel.getX(), totalAngularVel.getY(), totalAngularVel.getZ());
        } else {
            angVel.setValue(0, 0, 0);
        }
    }

    /**
     * Apply impulse for optimization in iterative solver
     * @param linearComponent Linear impulse component  
     * @param angularComponent Angular impulse component
     * @param impulseMagnitude Impulse magnitude
     */
    applyImpulse(linearComponent: b3Vector3, angularComponent: b3Vector3, impulseMagnitude: b3Scalar): void {
        if (this.m_originalBody) {
            // Apply linear impulse: m_deltaLinearVelocity += linearComponent * impulseMagnitude * m_linearFactor
            const linearImpulse = linearComponent.scale(impulseMagnitude);
            const scaledLinearImpulse = b3MakeVector3(
                linearImpulse.getX() * this.m_linearFactor.getX(),
                linearImpulse.getY() * this.m_linearFactor.getY(),
                linearImpulse.getZ() * this.m_linearFactor.getZ()
            );
            this.m_deltaLinearVelocity = this.m_deltaLinearVelocity.add(scaledLinearImpulse);

            // Apply angular impulse: m_deltaAngularVelocity += angularComponent * (impulseMagnitude * m_angularFactor)
            const angularImpulse = angularComponent.scale(impulseMagnitude);
            const scaledAngularImpulse = b3MakeVector3(
                angularImpulse.getX() * this.m_angularFactor.getX(),
                angularImpulse.getY() * this.m_angularFactor.getY(),
                angularImpulse.getZ() * this.m_angularFactor.getZ()
            );
            this.m_deltaAngularVelocity = this.m_deltaAngularVelocity.add(scaledAngularImpulse);
        }
    }

    /**
     * Apply push impulse for internal use
     * @param linearComponent Linear push component
     * @param angularComponent Angular push component  
     * @param impulseMagnitude Impulse magnitude
     */
    internalApplyPushImpulse(linearComponent: b3Vector3, angularComponent: b3Vector3, impulseMagnitude: b3Scalar): void {
        if (this.m_originalBody) {
            // Apply linear push: m_pushVelocity += linearComponent * impulseMagnitude * m_linearFactor
            const linearPush = linearComponent.scale(impulseMagnitude);
            const scaledLinearPush = b3MakeVector3(
                linearPush.getX() * this.m_linearFactor.getX(),
                linearPush.getY() * this.m_linearFactor.getY(),
                linearPush.getZ() * this.m_linearFactor.getZ()
            );
            this.m_pushVelocity = this.m_pushVelocity.add(scaledLinearPush);

            // Apply angular push: m_turnVelocity += angularComponent * (impulseMagnitude * m_angularFactor)
            const angularPush = angularComponent.scale(impulseMagnitude);
            const scaledAngularPush = b3MakeVector3(
                angularPush.getX() * this.m_angularFactor.getX(),
                angularPush.getY() * this.m_angularFactor.getY(),
                angularPush.getZ() * this.m_angularFactor.getZ()
            );
            this.m_turnVelocity = this.m_turnVelocity.add(scaledAngularPush);
        }
    }

    /**
     * Get delta linear velocity
     */
    getDeltaLinearVelocity(): b3Vector3 {
        return this.m_deltaLinearVelocity;
    }

    /**
     * Get delta angular velocity
     */
    getDeltaAngularVelocity(): b3Vector3 {
        return this.m_deltaAngularVelocity;
    }

    /**
     * Get push velocity
     */
    getPushVelocity(): b3Vector3 {
        return this.m_pushVelocity;
    }

    /**
     * Get turn velocity
     */
    getTurnVelocity(): b3Vector3 {
        return this.m_turnVelocity;
    }

    // Internal methods (should not be used by external code)

    /**
     * Internal method to get mutable delta linear velocity
     */
    internalGetDeltaLinearVelocity(): b3Vector3 {
        return this.m_deltaLinearVelocity;
    }

    /**
     * Internal method to get mutable delta angular velocity
     */
    internalGetDeltaAngularVelocity(): b3Vector3 {
        return this.m_deltaAngularVelocity;
    }

    /**
     * Internal method to get angular factor
     */
    internalGetAngularFactor(): b3Vector3 {
        return this.m_angularFactor;
    }

    /**
     * Internal method to get inverse mass
     */
    internalGetInvMass(): b3Vector3 {
        return this.m_invMass;
    }

    /**
     * Internal method to set inverse mass
     */
    internalSetInvMass(invMass: b3Vector3): void {
        this.m_invMass = invMass;
    }

    /**
     * Internal method to get mutable push velocity
     */
    internalGetPushVelocity(): b3Vector3 {
        return this.m_pushVelocity;
    }

    /**
     * Internal method to get mutable turn velocity
     */
    internalGetTurnVelocity(): b3Vector3 {
        return this.m_turnVelocity;
    }

    /**
     * Internal method to get velocity at local point (without null check)
     * @param rel_pos Relative position
     * @param velocity Output velocity
     */
    internalGetVelocityInLocalPointObsolete(rel_pos: b3Vector3, velocity: b3Vector3): void {
        const totalLinearVel = this.m_linearVelocity.add(this.m_deltaLinearVelocity);
        const totalAngularVel = this.m_angularVelocity.add(this.m_deltaAngularVelocity);
        const crossProduct = totalAngularVel.cross(rel_pos);
        velocity.setValue(
            totalLinearVel.getX() + crossProduct.getX(),
            totalLinearVel.getY() + crossProduct.getY(),
            totalLinearVel.getZ() + crossProduct.getZ()
        );
    }

    /**
     * Internal method to get angular velocity (without null check)
     * @param angVel Output angular velocity
     */
    internalGetAngularVelocity(angVel: b3Vector3): void {
        const totalAngularVel = this.m_angularVelocity.add(this.m_deltaAngularVelocity);
        angVel.setValue(totalAngularVel.getX(), totalAngularVel.getY(), totalAngularVel.getZ());
    }

    /**
     * Internal method to apply impulse (without null check)
     * @param linearComponent Linear impulse component
     * @param angularComponent Angular impulse component
     * @param impulseMagnitude Impulse magnitude
     */
    internalApplyImpulse(linearComponent: b3Vector3, angularComponent: b3Vector3, impulseMagnitude: b3Scalar): void {
        // Apply linear impulse
        const linearImpulse = linearComponent.scale(impulseMagnitude);
        const scaledLinearImpulse = b3MakeVector3(
            linearImpulse.getX() * this.m_linearFactor.getX(),
            linearImpulse.getY() * this.m_linearFactor.getY(),
            linearImpulse.getZ() * this.m_linearFactor.getZ()
        );
        this.m_deltaLinearVelocity = this.m_deltaLinearVelocity.add(scaledLinearImpulse);

        // Apply angular impulse
        const angularImpulse = angularComponent.scale(impulseMagnitude);
        const scaledAngularImpulse = b3MakeVector3(
            angularImpulse.getX() * this.m_angularFactor.getX(),
            angularImpulse.getY() * this.m_angularFactor.getY(),
            angularImpulse.getZ() * this.m_angularFactor.getZ()
        );
        this.m_deltaAngularVelocity = this.m_deltaAngularVelocity.add(scaledAngularImpulse);
    }

    /**
     * Write back velocity changes to the body
     */
    writebackVelocity(): void {
        this.m_linearVelocity = this.m_linearVelocity.add(this.m_deltaLinearVelocity);
        this.m_angularVelocity = this.m_angularVelocity.add(this.m_deltaAngularVelocity);
    }

    /**
     * Write back velocity and transform changes with time integration
     * @param timeStep Time step for integration
     * @param splitImpulseTurnErp Error reduction parameter for turn impulses
     */
    writebackVelocityAndTransform(timeStep: b3Scalar, splitImpulseTurnErp: b3Scalar): void {
        if (this.m_originalBody) {
            this.m_linearVelocity = this.m_linearVelocity.add(this.m_deltaLinearVelocity);
            this.m_angularVelocity = this.m_angularVelocity.add(this.m_deltaAngularVelocity);

            // Correct the position/orientation based on push/turn recovery
            const pushX = this.m_pushVelocity.getX();
            const pushY = this.m_pushVelocity.getY();
            const pushZ = this.m_pushVelocity.getZ();
            const turnX = this.m_turnVelocity.getX();
            const turnY = this.m_turnVelocity.getY();
            const turnZ = this.m_turnVelocity.getZ();

            if (pushX !== 0 || pushY !== 0 || pushZ !== 0 || turnX !== 0 || turnY !== 0 || turnZ !== 0) {
                const newTransform = new b3Transform();
                const scaledTurnVelocity = this.m_turnVelocity.scale(splitImpulseTurnErp);
                b3TransformUtil.integrateTransform(this.m_worldTransform, this.m_pushVelocity, scaledTurnVelocity, timeStep, newTransform);
                this.m_worldTransform = newTransform;
            }
        }
    }
}