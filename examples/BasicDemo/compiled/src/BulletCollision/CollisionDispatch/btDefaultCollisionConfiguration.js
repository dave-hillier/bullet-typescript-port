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
import { btCollisionConfiguration, btDefaultPoolAllocator, btDefaultCollisionAlgorithmCreateFunc } from './btCollisionConfiguration';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
/**
 * Default construction info values
 */
export function createDefaultCollisionConstructionInfo() {
    return {
        m_persistentManifoldPool: undefined,
        m_collisionAlgorithmPool: undefined,
        m_defaultMaxPersistentManifoldPoolSize: 4096,
        m_defaultMaxCollisionAlgorithmPoolSize: 4096,
        m_customCollisionAlgorithmMaxElementSize: 0,
        m_useEpaPenetrationAlgorithm: true
    };
}
/**
 * Default penetration depth solver implementation
 */
export class btDefaultConvexPenetrationDepthSolver {
}
/**
 * Default Voronoi simplex solver implementation
 */
export class btDefaultVoronoiSimplexSolver {
}
/**
 * btDefaultCollisionConfiguration provides setup for all the collision detection stacks, dispatchers
 * and registration of collision shapes
 */
export class btDefaultCollisionConfiguration extends btCollisionConfiguration {
    constructor(constructionInfo = createDefaultCollisionConstructionInfo()) {
        super();
        this.m_persistentManifoldPoolSize = constructionInfo.m_defaultMaxPersistentManifoldPoolSize;
        // Initialize persistent manifold pool
        if (constructionInfo.m_persistentManifoldPool) {
            this.m_persistentManifoldPool = constructionInfo.m_persistentManifoldPool;
            this.m_ownsPersistentManifoldPool = false;
        }
        else {
            this.m_persistentManifoldPool = new btDefaultPoolAllocator(constructionInfo.m_defaultMaxPersistentManifoldPoolSize, 16 // sizeof(btPersistentManifold) approximation
            );
            this.m_ownsPersistentManifoldPool = true;
        }
        // Initialize collision algorithm pool
        if (constructionInfo.m_collisionAlgorithmPool) {
            this.m_collisionAlgorithmPool = constructionInfo.m_collisionAlgorithmPool;
            this.m_ownsCollisionAlgorithmPool = false;
        }
        else {
            this.m_collisionAlgorithmPool = new btDefaultPoolAllocator(constructionInfo.m_defaultMaxCollisionAlgorithmPoolSize, 32 // sizeof(collision algorithm) approximation
            );
            this.m_ownsCollisionAlgorithmPool = true;
        }
        // Initialize penetration depth solver
        this.m_pdSolver = new btDefaultConvexPenetrationDepthSolver();
        // Initialize collision algorithm create functions
        this.m_convexConvexCreateFunc = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_convexConcaveCreateFunc = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_swappedConvexConcaveCreateFunc = new btDefaultCollisionAlgorithmCreateFunc(true);
        this.m_compoundCreateFunc = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_compoundCompoundCreateFunc = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_swappedCompoundCreateFunc = new btDefaultCollisionAlgorithmCreateFunc(true);
        this.m_emptyCreateFunc = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_sphereSphereCF = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_sphereBoxCF = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_boxSphereCF = new btDefaultCollisionAlgorithmCreateFunc(true);
        this.m_boxBoxCF = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_sphereTriangleCF = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_triangleSphereCF = new btDefaultCollisionAlgorithmCreateFunc(true);
        this.m_planeConvexCF = new btDefaultCollisionAlgorithmCreateFunc(false);
        this.m_convexPlaneCF = new btDefaultCollisionAlgorithmCreateFunc(true);
    }
    /**
     * Get persistent manifold pool
     */
    getPersistentManifoldPool() {
        return this.m_persistentManifoldPool;
    }
    /**
     * Get collision algorithm pool
     */
    getCollisionAlgorithmPool() {
        return this.m_collisionAlgorithmPool;
    }
    /**
     * Get collision algorithm create function for given proxy types
     */
    getCollisionAlgorithmCreateFunc(proxyType0, proxyType1) {
        // Simplified dispatch table - in the full implementation this would be a 2D array
        // based on the BroadphaseNativeTypes
        if (proxyType0 === BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE &&
            proxyType1 === BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE) {
            return this.m_sphereSphereCF;
        }
        if (proxyType0 === BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE &&
            proxyType1 === BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE) {
            return this.m_sphereBoxCF;
        }
        if (proxyType0 === BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE &&
            proxyType1 === BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE) {
            return this.m_boxSphereCF;
        }
        if (proxyType0 === BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE &&
            proxyType1 === BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE) {
            return this.m_boxBoxCF;
        }
        // Check for compound shapes
        if (this.isCompound(proxyType0) && this.isCompound(proxyType1)) {
            return this.m_compoundCompoundCreateFunc;
        }
        if (this.isCompound(proxyType0)) {
            return this.m_compoundCreateFunc;
        }
        if (this.isCompound(proxyType1)) {
            return this.m_swappedCompoundCreateFunc;
        }
        // Check for convex-concave combinations
        if (this.isConvex(proxyType0) && this.isConcave(proxyType1)) {
            return this.m_convexConcaveCreateFunc;
        }
        if (this.isConcave(proxyType0) && this.isConvex(proxyType1)) {
            return this.m_swappedConvexConcaveCreateFunc;
        }
        // Default to convex-convex
        if (this.isConvex(proxyType0) && this.isConvex(proxyType1)) {
            return this.m_convexConvexCreateFunc;
        }
        // Fallback to empty algorithm
        return this.m_emptyCreateFunc;
    }
    /**
     * Get closest points algorithm create function for given proxy types
     */
    getClosestPointsAlgorithmCreateFunc(proxyType0, proxyType1) {
        // For now, use the same dispatch as collision detection
        return this.getCollisionAlgorithmCreateFunc(proxyType0, proxyType1);
    }
    /**
     * Configure convex-convex multipoint iterations
     */
    setConvexConvexMultipointIterations(numPerturbationIterations = 3, minimumPointsPerturbationThreshold = 3) {
        // This would configure the convex-convex algorithm for multiple contact points
        // For now, this is a stub
        console.log(`Setting convex-convex multipoint iterations: ${numPerturbationIterations}, threshold: ${minimumPointsPerturbationThreshold}`);
    }
    /**
     * Configure plane-convex multipoint iterations
     */
    setPlaneConvexMultipointIterations(numPerturbationIterations = 3, minimumPointsPerturbationThreshold = 3) {
        // This would configure the plane-convex algorithm for multiple contact points
        // For now, this is a stub
        console.log(`Setting plane-convex multipoint iterations: ${numPerturbationIterations}, threshold: ${minimumPointsPerturbationThreshold}`);
    }
    /**
     * Helper method to check if a proxy type is convex
     */
    isConvex(proxyType) {
        return proxyType < BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE;
    }
    /**
     * Helper method to check if a proxy type is concave
     */
    isConcave(proxyType) {
        return proxyType > BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE &&
            proxyType < BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;
    }
    /**
     * Helper method to check if a proxy type is compound
     */
    isCompound(proxyType) {
        return proxyType === BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;
    }
}
