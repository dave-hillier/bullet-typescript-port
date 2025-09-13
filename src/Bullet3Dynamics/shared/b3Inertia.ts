/*
Copyright (c) 2013 Advanced Micro Devices, Inc.  

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
 * TypeScript port of Bullet3Dynamics/shared/b3Inertia.h
 * Inertia tensor data structure for rigid body dynamics
 */

import { b3Mat3x3 } from '../../Bullet3Common/shared/b3Mat3x3';

/**
 * Inertia tensor data structure containing both world-space and local-space
 * inverse inertia matrices for efficient rigid body dynamics calculations.
 */
export class b3Inertia {
    /**
     * World-space inverse inertia tensor matrix.
     * This is the inverse inertia tensor transformed to world coordinates,
     * used for computing angular accelerations in world space.
     */
    public m_invInertiaWorld: b3Mat3x3;

    /**
     * Initial (body-space) inverse inertia tensor matrix.
     * This is the constant inverse inertia tensor in the body's local coordinate system,
     * computed once from the body's mass distribution and then transformed as needed.
     */
    public m_initInvInertia: b3Mat3x3;

    /**
     * Constructor initializes both inertia matrices to identity.
     */
    constructor() {
        this.m_invInertiaWorld = new b3Mat3x3();
        this.m_initInvInertia = new b3Mat3x3();
    }

    /**
     * Create a copy of this inertia object.
     * @returns A new b3Inertia instance with cloned matrices
     */
    clone(): b3Inertia {
        const result = new b3Inertia();
        result.m_invInertiaWorld = this.m_invInertiaWorld.clone();
        result.m_initInvInertia = this.m_initInvInertia.clone();
        return result;
    }
}