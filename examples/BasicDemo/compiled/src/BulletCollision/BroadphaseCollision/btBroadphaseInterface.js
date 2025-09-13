/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

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
import { btVector3 } from '../../LinearMath/btVector3';
/**
 * Callback interface for AABB testing in broadphase
 */
export class btBroadphaseAabbCallback {
}
/**
 * Callback interface for ray testing in broadphase
 * Extends btBroadphaseAabbCallback with cached data to accelerate ray-AABB tests
 */
export class btBroadphaseRayCallback extends btBroadphaseAabbCallback {
    constructor() {
        super();
        this.m_rayDirectionInverse = new btVector3();
        this.m_signs = [0, 0, 0];
        this.m_lambda_max = 0;
    }
}
/**
 * The btBroadphaseInterface class provides an interface to detect aabb-overlapping object pairs.
 * Some implementations for this broadphase interface include btAxisSweep3, bt32BitAxisSweep3 and btDbvtBroadphase.
 * The actual overlapping pair management, storage, adding and removing of pairs is dealt by the btOverlappingPairCache class.
 */
export class btBroadphaseInterface {
    /**
     * Reset broadphase internal structures, to ensure determinism/reproducibility
     * @param dispatcher Dispatcher instance
     */
    resetPool(_dispatcher) {
        // Default implementation does nothing
        // Implementations can override this if they need to reset internal state
    }
}
