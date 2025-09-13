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

import { btDispatcher } from '../BroadphaseCollision/btDispatcher';

/**
 * Dispatcher info structure
 */
export interface btDispatcherInfo {
    m_timeStep: number;
    m_stepCount: number;
    m_dispatchFunc: number;
    m_timeOfImpact: number;
    m_useContinuous: boolean;
    m_debugDraw: any;
    m_enableSatConvex: boolean;
    m_enableSPU: boolean;
    m_useEpa: boolean;
    m_allowedCcdPenetration: number;
    m_useConvexConservativeDistanceUtil: boolean;
    m_convexConservativeDistanceThreshold: number;
    m_deterministicOverlappingPairs: boolean;
    m_stackAllocator: any;
}

/**
 * Collision configuration interface
 */
export interface btCollisionConfiguration {
    // Minimal interface stub
}

/**
 * The btCollisionDispatcher supports algorithms that handle ConvexConvex and ConvexConcave collision pairs.
 * Time of Impact, Closest Points and Penetration Depth.
 */
export class btCollisionDispatcher extends btDispatcher {
    protected m_dispatcherInfo: btDispatcherInfo;
    
    constructor(_collisionConfiguration: btCollisionConfiguration) {
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
    
    getDispatcherInfo(): btDispatcherInfo {
        return this.m_dispatcherInfo;
    }

    // Implement required abstract methods from btDispatcher
    findAlgorithm(_body0Wrap: any, _body1Wrap: any, _sharedManifold: any, _queryType: any): any {
        // Simplified implementation for now
        return null;
    }

    getNewManifold(_b0: any, _b1: any): any {
        // Simplified implementation for now
        return null;
    }

    releaseManifold(_manifold: any): void {
        // Simplified implementation for now
    }

    clearManifold(_manifold: any): void {
        // Simplified implementation for now
    }

    needsCollision(_body0: any, _body1: any): boolean {
        return true;
    }

    needsResponse(_body0: any, _body1: any): boolean {
        return true;
    }

    dispatchAllCollisionPairs(_pairCache: any, _dispatchInfo: any, _dispatcher: any): void {
        // Simplified implementation for now
    }

    getNumManifolds(): number {
        return 0;
    }

    getManifoldByIndexInternal(_index: number): any {
        return null;
    }

    getInternalManifoldPointer(): any {
        return null;
    }

    allocateCollisionAlgorithm(_size: number): any {
        return null;
    }

    freeCollisionAlgorithm(_ptr: any): void {
        // Simplified implementation for now
    }

    internalSetInternalOwner(_owner: any): void {
        // Simplified implementation for now
    }

    getInternalManifoldPool(): any {
        return null;
    }

    getInternalManifoldPoolConst(): any {
        return null;
    }
}