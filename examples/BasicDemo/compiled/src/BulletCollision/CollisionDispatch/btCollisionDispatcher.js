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
import { btDispatcher } from '../BroadphaseCollision/btDispatcher';
/**
 * The btCollisionDispatcher supports algorithms that handle ConvexConvex and ConvexConcave collision pairs.
 * Time of Impact, Closest Points and Penetration Depth.
 */
export class btCollisionDispatcher extends btDispatcher {
    constructor(_collisionConfiguration) {
        super();
        this.m_dispatcherInfo = {
            m_timeStep: 1.0 / 60.0,
            m_stepCount: 0,
            m_dispatchFunc: 1,
            m_timeOfImpact: 1.0,
            m_useContinuous: true,
            m_debugDraw: null,
            m_enableSatConvex: false,
            m_enableSPU: true,
            m_useEpa: true,
            m_allowedCcdPenetration: 0.04,
            m_useConvexConservativeDistanceUtil: false,
            m_convexConservativeDistanceThreshold: 0.0,
            m_deterministicOverlappingPairs: false,
            m_stackAllocator: null
        };
    }
    getDispatcherInfo() {
        return this.m_dispatcherInfo;
    }
    // Implement required abstract methods from btDispatcher
    findAlgorithm(_body0Wrap, _body1Wrap, _sharedManifold, _queryType) {
        // Simplified implementation for now
        return null;
    }
    getNewManifold(_b0, _b1) {
        // Simplified implementation for now
        return null;
    }
    releaseManifold(_manifold) {
        // Simplified implementation for now
    }
    clearManifold(_manifold) {
        // Simplified implementation for now
    }
    needsCollision(_body0, _body1) {
        return true;
    }
    needsResponse(_body0, _body1) {
        return true;
    }
    dispatchAllCollisionPairs(_pairCache, _dispatchInfo, _dispatcher) {
        // Simplified implementation for now
    }
    getNumManifolds() {
        return 0;
    }
    getManifoldByIndexInternal(_index) {
        return null;
    }
    getInternalManifoldPointer() {
        return null;
    }
    allocateCollisionAlgorithm(_size) {
        return null;
    }
    freeCollisionAlgorithm(_ptr) {
        // Simplified implementation for now
    }
    internalSetInternalOwner(_owner) {
        // Simplified implementation for now
    }
    getInternalManifoldPool() {
        return null;
    }
    getInternalManifoldPoolConst() {
        return null;
    }
}
