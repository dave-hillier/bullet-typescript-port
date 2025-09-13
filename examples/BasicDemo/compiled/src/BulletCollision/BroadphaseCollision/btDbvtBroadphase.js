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
import { btBroadphaseInterface } from './btBroadphaseInterface';
import { btBroadphaseProxy } from './btBroadphaseProxy';
/**
 * Proxy for DBVT broadphase
 */
export class btDbvtProxy extends btBroadphaseProxy {
    constructor(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask) {
        super(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask);
        this.leaf = null;
        this.links = [null, null];
        this.stage = 0;
    }
}
/**
 * Basic stub implementation of btDbvtBroadphase
 * This is a minimal implementation to get BasicDemo working.
 * The full DBVT implementation would be quite complex and can be enhanced later.
 */
export class btDbvtBroadphase extends btBroadphaseInterface {
    constructor(paircache) {
        super();
        // For now, we'll use simple arrays instead of full DBVT trees
        this.m_proxies = [];
        this.m_paircache = null;
        this.m_prediction = 0;
        this.m_newpairs = 0;
        this._m_stageCurrent = 0;
        this._m_needcleanup = false;
        this.m_paircache = paircache || null;
    }
    createProxy(aabbMin, aabbMax, _shapeType, userPtr, collisionFilterGroup, collisionFilterMask, _dispatcher) {
        const proxy = new btDbvtProxy(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask);
        // Simple implementation: just add to array
        this.m_proxies.push(proxy);
        return proxy;
    }
    destroyProxy(proxy, _dispatcher) {
        const dbvtProxy = proxy;
        const index = this.m_proxies.indexOf(dbvtProxy);
        if (index !== -1) {
            this.m_proxies.splice(index, 1);
        }
    }
    setAabb(proxy, aabbMin, aabbMax, _dispatcher) {
        // Update the proxy's AABB
        proxy.m_aabbMin.copy(aabbMin);
        proxy.m_aabbMax.copy(aabbMax);
        // In a full implementation, this would update the DBVT tree
    }
    getAabb(proxy, aabbMin, aabbMax) {
        aabbMin.copy(proxy.m_aabbMin);
        aabbMax.copy(proxy.m_aabbMax);
    }
    rayTest(_rayFrom, _rayTo, rayCallback, _aabbMin, _aabbMax) {
        // Basic ray test implementation
        // In a full implementation, this would traverse the DBVT tree efficiently
        for (const proxy of this.m_proxies) {
            // Simple AABB-ray intersection test would go here
            // For now, just call the callback for all proxies
            if (!rayCallback.process(proxy)) {
                break;
            }
        }
    }
    aabbTest(_aabbMin, _aabbMax, callback) {
        // Basic AABB test implementation
        for (const proxy of this.m_proxies) {
            // Simple AABB-AABB intersection test would go here
            // For now, just call the callback for all proxies
            if (!callback.process(proxy)) {
                break;
            }
        }
    }
    calculateOverlappingPairs(_dispatcher) {
        // Simple O(n²) collision detection
        // In a full implementation, this would use the DBVT for efficient culling
        this.m_newpairs = 0;
        for (let i = 0; i < this.m_proxies.length; i++) {
            for (let j = i + 1; j < this.m_proxies.length; j++) {
                const proxy0 = this.m_proxies[i];
                const proxy1 = this.m_proxies[j];
                // Check if AABBs overlap
                if (this.testAabbAgainstAabb2(proxy0, proxy1)) {
                    // In a full implementation, we would add to pair cache
                    this.m_newpairs++;
                }
            }
        }
    }
    getOverlappingPairCache() {
        return this.m_paircache;
    }
    getOverlappingPairCacheConst() {
        return this.m_paircache;
    }
    getBroadphaseAabb(aabbMin, aabbMax) {
        // Calculate bounding box of all proxies
        if (this.m_proxies.length === 0) {
            aabbMin.setValue(-1000, -1000, -1000);
            aabbMax.setValue(1000, 1000, 1000);
            return;
        }
        aabbMin.copy(this.m_proxies[0].m_aabbMin);
        aabbMax.copy(this.m_proxies[0].m_aabbMax);
        for (const proxy of this.m_proxies) {
            aabbMin.setMin(proxy.m_aabbMin);
            aabbMax.setMax(proxy.m_aabbMax);
        }
    }
    resetPool(_dispatcher) {
        // Reset internal structures
        this._m_stageCurrent = 0;
        this._m_needcleanup = false;
    }
    printStats() {
        console.log(`btDbvtBroadphase stats: ${this.m_proxies.length} proxies, ${this.m_newpairs} new pairs`);
    }
    // Additional methods specific to btDbvtBroadphase
    setVelocityPrediction(prediction) {
        this.m_prediction = prediction;
    }
    getVelocityPrediction() {
        return this.m_prediction;
    }
    performDeferredRemoval(_dispatcher) {
        // Placeholder for deferred removal logic
    }
    collide(dispatcher) {
        // Placeholder for main collision detection logic
        this.calculateOverlappingPairs(dispatcher);
    }
    optimize() {
        // Placeholder for tree optimization
    }
    // Helper method to test AABB overlap
    testAabbAgainstAabb2(proxy0, proxy1) {
        return proxy0.m_aabbMin.x() <= proxy1.m_aabbMax.x() &&
            proxy1.m_aabbMin.x() <= proxy0.m_aabbMax.x() &&
            proxy0.m_aabbMin.y() <= proxy1.m_aabbMax.y() &&
            proxy1.m_aabbMin.y() <= proxy0.m_aabbMax.y() &&
            proxy0.m_aabbMin.z() <= proxy1.m_aabbMax.z() &&
            proxy1.m_aabbMin.z() <= proxy0.m_aabbMax.z();
    }
}
