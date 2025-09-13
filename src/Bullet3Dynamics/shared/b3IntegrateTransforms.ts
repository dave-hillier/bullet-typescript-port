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
 * TypeScript port of Bullet3Dynamics/shared/b3IntegrateTransforms.h
 * 
 * This module provides physics integration functions for rigid body transforms.
 * It handles both linear and angular integration with damping and motion constraints.
 * 
 * Key features:
 * - Quaternion-based angular integration using axis-angle representation
 * - Angular motion threshold limiting to prevent excessive rotation
 * - Taylor series approximation for small angle integration  
 * - Gravity application and linear velocity integration
 * - Support for both single body and batch integration
 * 
 * Key differences from C++ version:
 * - Removed all C++ preprocessor directives and OpenCL code paths
 * - Converted C++ pointers and arrays to TypeScript objects and arrays
 * - Implemented quaternion operations inline instead of using macros
 * - Used proper TypeScript typing throughout
 * - Removed manual memory management (arrays passed by reference)
 */

import { 
    b3Float4, 
    b3Float4ConstArg, 
    b3Dot3F4 
} from '../../Bullet3Common/shared/b3Float4';
import { 
    b3Scalar, 
    b3Sqrt, 
    b3Sin, 
    b3Cos 
} from '../../Bullet3Common/b3Scalar';
import { b3Quat } from '../../Bullet3Collision/BroadPhaseCollision/shared/b3Aabb';

/**
 * Rigid body data structure for physics integration
 * Based on Bullet3Collision/NarrowPhaseCollision/shared/b3RigidBodyData.h
 */
export interface b3RigidBodyData {
    /** World position */
    m_pos: b3Float4;
    /** World orientation (quaternion) */
    m_quat: b3Quat;
    /** Linear velocity */
    m_linVel: b3Float4;
    /** Angular velocity */
    m_angVel: b3Float4;
    /** Index into collidables array */
    m_collidableIdx: number;
    /** Inverse mass (0 = static/infinite mass) */
    m_invMass: b3Scalar;
    /** Coefficient of restitution (bounciness) */
    m_restituitionCoeff: b3Scalar;
    /** Coefficient of friction */
    m_frictionCoeff: b3Scalar;
}

/**
 * Type alias for C-style typedef compatibility
 */
export type b3RigidBodyData_t = b3RigidBodyData;

/**
 * Type alias for const quaternion arguments
 */
export type b3QuatConstArg = b3Quat;

// Physics constants
const BT_GPU_ANGULAR_MOTION_THRESHOLD = 0.25 * Math.PI; // ~45 degrees max per step

/**
 * Quaternion multiplication
 * Computes the Hamilton product of two quaternions
 */
function b3QuatMul(a: b3QuatConstArg, b: b3QuatConstArg): b3Quat {
    return {
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y + a.y * b.w + a.z * b.x - a.x * b.z,
        z: a.w * b.z + a.z * b.w + a.x * b.y - a.y * b.x,
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
    };
}

/**
 * Normalize a quaternion to unit length
 * Ensures the quaternion represents a valid rotation
 */
function b3QuatNormalized(q: b3QuatConstArg): b3Quat {
    const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
    
    if (len > 0) {
        const invLen = 1.0 / len;
        return {
            x: q.x * invLen,
            y: q.y * invLen,
            z: q.z * invLen,
            w: q.w * invLen
        };
    } else {
        // Return identity quaternion for invalid input
        return { x: 0, y: 0, z: 0, w: 1 };
    }
}


/**
 * Integrate a single rigid body transform for one time step
 * 
 * Performs physics integration including:
 * - Angular velocity integration with damping
 * - Angular motion threshold limiting 
 * - Quaternion-based rotation integration
 * - Linear velocity integration with gravity
 * - Position integration
 * 
 * @param bodies Array of rigid body data (modified in-place)
 * @param nodeID Index of the body to integrate
 * @param timeStep Integration time step (typically 1/60 seconds)
 * @param angularDamping Angular damping factor (0-1, where 1 = no damping)
 * @param gravityAcceleration Gravity acceleration vector (e.g., (0, -9.8, 0))
 */
export function integrateSingleTransform(
    bodies: b3RigidBodyData[],
    nodeID: number,
    timeStep: b3Scalar,
    angularDamping: b3Scalar,
    gravityAcceleration: b3Float4ConstArg
): void {
    const body = bodies[nodeID];
    
    // Skip integration for static bodies (infinite mass)
    if (body.m_invMass === 0.0) {
        return;
    }

    // Angular velocity integration with damping
    {
        // Apply angular damping
        body.m_angVel.x *= angularDamping;
        body.m_angVel.y *= angularDamping;
        body.m_angVel.z *= angularDamping;

        const angvel = body.m_angVel;
        let fAngle = b3Sqrt(b3Dot3F4(angvel, angvel));

        // Limit angular motion to prevent numerical instability
        if (fAngle * timeStep > BT_GPU_ANGULAR_MOTION_THRESHOLD) {
            fAngle = BT_GPU_ANGULAR_MOTION_THRESHOLD / timeStep;
        }

        let axis: b3Float4;
        
        if (fAngle < 0.001) {
            // Use Taylor series expansion for small angles to avoid singularity
            // axis = angvel * (0.5 * timeStep - (timeStep^3 / 48) * fAngle^2)
            const factor = 0.5 * timeStep - (timeStep * timeStep * timeStep) * 0.020833333333 * fAngle * fAngle;
            axis = angvel.scale(factor);
        } else {
            // Use trigonometric integration: axis = angvel * sin(0.5 * fAngle * timeStep) / fAngle
            axis = angvel.scale(b3Sin(0.5 * fAngle * timeStep) / fAngle);
        }

        // Create quaternion for rotation increment
        const dorn: b3Quat = {
            x: axis.x,
            y: axis.y, 
            z: axis.z,
            w: b3Cos(fAngle * timeStep * 0.5)
        };

        // Apply rotation: q_new = dorn * q_old
        const orn0 = body.m_quat;
        const predictedOrn = b3QuatMul(dorn, orn0);
        body.m_quat = b3QuatNormalized(predictedOrn);
    }

    // Linear velocity integration
    // Apply gravity acceleration
    body.m_linVel = body.m_linVel.add(gravityAcceleration.scale(timeStep));
    
    // Position integration using current linear velocity
    body.m_pos = body.m_pos.add(body.m_linVel.scale(timeStep));
}

/**
 * Integrate a single rigid body transform (alternative interface)
 * 
 * This function provides the same functionality as integrateSingleTransform
 * but operates directly on a single body pointer for compatibility with 
 * the original C++ interface.
 * 
 * @param body Single rigid body to integrate (modified in-place)
 * @param timeStep Integration time step
 * @param angularDamping Angular damping factor (0-1)
 * @param gravityAcceleration Gravity acceleration vector
 */
export function b3IntegrateTransform(
    body: b3RigidBodyData,
    timeStep: b3Scalar,
    angularDamping: b3Scalar,
    gravityAcceleration: b3Float4ConstArg
): void {
    // Skip integration for static bodies (infinite mass)
    if (body.m_invMass === 0.0) {
        return;
    }

    // Angular velocity integration with damping
    {
        // Apply angular damping
        body.m_angVel.x *= angularDamping;
        body.m_angVel.y *= angularDamping;
        body.m_angVel.z *= angularDamping;

        const angvel = body.m_angVel;
        let fAngle = b3Sqrt(b3Dot3F4(angvel, angvel));

        // Limit angular motion to prevent numerical instability
        if (fAngle * timeStep > BT_GPU_ANGULAR_MOTION_THRESHOLD) {
            fAngle = BT_GPU_ANGULAR_MOTION_THRESHOLD / timeStep;
        }

        let axis: b3Float4;
        
        if (fAngle < 0.001) {
            // Use Taylor series expansion for small angles to avoid singularity
            // axis = angvel * (0.5 * timeStep - (timeStep^3 / 48) * fAngle^2)
            const factor = 0.5 * timeStep - (timeStep * timeStep * timeStep) * 0.020833333333 * fAngle * fAngle;
            axis = angvel.scale(factor);
        } else {
            // Use trigonometric integration: axis = angvel * sin(0.5 * fAngle * timeStep) / fAngle
            axis = angvel.scale(b3Sin(0.5 * fAngle * timeStep) / fAngle);
        }

        // Create quaternion for rotation increment
        const dorn: b3Quat = {
            x: axis.x,
            y: axis.y,
            z: axis.z, 
            w: b3Cos(fAngle * timeStep * 0.5)
        };

        // Apply rotation: q_new = dorn * q_old
        const orn0 = body.m_quat;
        const predictedOrn = b3QuatMul(dorn, orn0);
        body.m_quat = b3QuatNormalized(predictedOrn);
    }

    // Apply gravity acceleration first
    body.m_linVel = body.m_linVel.add(gravityAcceleration.scale(timeStep));
    
    // Position integration using updated linear velocity
    body.m_pos = body.m_pos.add(body.m_linVel.scale(timeStep));
}