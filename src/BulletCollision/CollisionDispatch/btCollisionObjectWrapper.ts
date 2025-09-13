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

import { btTransform } from '../../LinearMath/btTransform';
import { btCollisionShape } from '../CollisionShapes/btCollisionShape';
import { btCollisionObject } from './btCollisionObject';

/**
 * btCollisionObjectWrapper is a wrapper class for btCollisionObject.
 * It is used to pass collision object data to collision algorithms.
 */
export class btCollisionObjectWrapper {
    public readonly m_parent: btCollisionObjectWrapper | null;
    public readonly m_shape: btCollisionShape;
    public readonly m_collisionObject: btCollisionObject;
    public readonly m_worldTransform: btTransform;
    public readonly m_partId: number;
    public readonly m_index: number;

    constructor(
        parent: btCollisionObjectWrapper | null,
        shape: btCollisionShape,
        collisionObject: btCollisionObject,
        worldTransform: btTransform,
        partId: number = -1,
        index: number = -1
    ) {
        this.m_parent = parent;
        this.m_shape = shape;
        this.m_collisionObject = collisionObject;
        this.m_worldTransform = worldTransform;
        this.m_partId = partId;
        this.m_index = index;
    }

    getWorldTransform(): btTransform {
        return this.m_worldTransform;
    }

    getCollisionObject(): btCollisionObject {
        return this.m_collisionObject;
    }

    getCollisionShape(): btCollisionShape {
        return this.m_shape;
    }

    getPartId(): number {
        return this.m_partId;
    }

    getIndex(): number {
        return this.m_index;
    }

    getParent(): btCollisionObjectWrapper | null {
        return this.m_parent;
    }
}