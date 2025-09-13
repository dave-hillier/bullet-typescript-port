/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2006 Erwin Coumans  http://bulletphysics.org

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

/**
 * The btMotionState interface class allows the dynamics world to synchronize and interpolate the updated world transforms with graphics
 * For optimizations, potentially only update graphics object transforms when needed
 */
export abstract class btMotionState {
    /**
     * Synchronizes world transform from user to physics
     * Bullet only calls the update of worldtransform for active objects
     * @param worldTrans - world transform from user
     */
    abstract getWorldTransform(worldTrans: btTransform): void;

    /**
     * Synchronizes world transform from physics to user
     * Bullet only calls the update of worldtransform for active objects
     * @param worldTrans - world transform from physics
     */
    abstract setWorldTransform(worldTrans: btTransform): void;
}

/**
 * Default implementation of btMotionState providing identity transforms
 */
export class btDefaultMotionState extends btMotionState {
    protected m_graphicsWorldTrans: btTransform;
    protected m_centerOfMassOffset: btTransform;
    protected m_startWorldTrans: btTransform;

    constructor(
        startTrans: btTransform = new btTransform(),
        centerOfMassOffset: btTransform = new btTransform()
    ) {
        super();
        this.m_graphicsWorldTrans = startTrans.clone();
        this.m_centerOfMassOffset = centerOfMassOffset.clone();
        this.m_startWorldTrans = startTrans.clone();
    }

    /**
     * Synchronizes world transform from user to physics
     */
    getWorldTransform(centerOfMassWorldTrans: btTransform): void {
        centerOfMassWorldTrans.assign(
            this.m_centerOfMassOffset.inverse().multiply(this.m_graphicsWorldTrans)
        );
    }

    /**
     * Synchronizes world transform from physics to user
     */
    setWorldTransform(centerOfMassWorldTrans: btTransform): void {
        this.m_graphicsWorldTrans.assign(
            centerOfMassWorldTrans.multiply(this.m_centerOfMassOffset)
        );
    }
}