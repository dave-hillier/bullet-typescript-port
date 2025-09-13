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
import { multiplyMatrixVector } from '../../LinearMath/btMatrix3x3';
import { btTransform } from '../../LinearMath/btTransform';
import { btIDebugDraw } from '../../LinearMath/btIDebugDraw';
import { btBroadphaseProxy } from '../BroadphaseCollision/btBroadphaseProxy';
/**
 * Result structure for ray tests
 */
export class LocalRayResult {
    constructor(collisionObject, localShapeInfo, hitNormalLocal, hitFraction) {
        this.m_collisionObject = collisionObject;
        this.m_localShapeInfo = localShapeInfo;
        this.m_hitNormalLocal = hitNormalLocal;
        this.m_hitFraction = hitFraction;
    }
}
/**
 * Result callback for ray tests
 */
export class RayResultCallback {
    constructor() {
        this.m_closestHitFraction = 1.0;
        this.m_collisionObject = null;
        this.m_collisionFilterGroup = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
        this.m_collisionFilterMask = btBroadphaseProxy.CollisionFilterGroups.AllFilter;
        this.m_flags = 0;
    }
    hasHit() {
        return this.m_collisionObject !== null;
    }
    needsCollision(proxy0) {
        const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
        return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
    }
}
/**
 * Closest ray result callback
 */
export class ClosestRayResultCallback extends RayResultCallback {
    constructor(rayFromWorld, rayToWorld) {
        super();
        this.m_rayFromWorld = rayFromWorld;
        this.m_rayToWorld = rayToWorld;
        this.m_hitNormalWorld = new btVector3();
        this.m_hitPointWorld = new btVector3();
    }
    addSingleResult(rayResult, normalInWorldSpace) {
        // Caller already does the filter on the m_closestHitFraction
        console.assert(rayResult.m_hitFraction <= this.m_closestHitFraction);
        this.m_closestHitFraction = rayResult.m_hitFraction;
        this.m_collisionObject = rayResult.m_collisionObject;
        if (normalInWorldSpace) {
            this.m_hitNormalWorld.copy(rayResult.m_hitNormalLocal);
        }
        else {
            // Need to transform normal into worldspace
            const worldTrans = this.m_collisionObject.getWorldTransform();
            this.m_hitNormalWorld.copy(multiplyMatrixVector(worldTrans.getBasis(), rayResult.m_hitNormalLocal));
        }
        this.m_hitPointWorld.setInterpolate3(this.m_rayFromWorld, this.m_rayToWorld, rayResult.m_hitFraction);
        return rayResult.m_hitFraction;
    }
}
/**
 * All hits ray result callback
 */
export class AllHitsRayResultCallback extends RayResultCallback {
    constructor(rayFromWorld, rayToWorld) {
        super();
        this.m_rayFromWorld = rayFromWorld;
        this.m_rayToWorld = rayToWorld;
        this.m_collisionObjects = [];
        this.m_hitNormalWorld = [];
        this.m_hitPointWorld = [];
        this.m_hitFractions = [];
    }
    addSingleResult(rayResult, normalInWorldSpace) {
        this.m_collisionObject = rayResult.m_collisionObject;
        this.m_collisionObjects.push(rayResult.m_collisionObject);
        let hitNormalWorld;
        if (normalInWorldSpace) {
            hitNormalWorld = rayResult.m_hitNormalLocal.clone();
        }
        else {
            // Need to transform normal into worldspace
            const worldTrans = this.m_collisionObject.getWorldTransform();
            hitNormalWorld = multiplyMatrixVector(worldTrans.getBasis(), rayResult.m_hitNormalLocal);
        }
        this.m_hitNormalWorld.push(hitNormalWorld);
        const hitPointWorld = new btVector3();
        hitPointWorld.setInterpolate3(this.m_rayFromWorld, this.m_rayToWorld, rayResult.m_hitFraction);
        this.m_hitPointWorld.push(hitPointWorld);
        this.m_hitFractions.push(rayResult.m_hitFraction);
        return this.m_closestHitFraction;
    }
}
/**
 * Result structure for convex sweep tests
 */
export class LocalConvexResult {
    constructor(hitCollisionObject, localShapeInfo, hitNormalLocal, hitPointLocal, hitFraction) {
        this.m_hitCollisionObject = hitCollisionObject;
        this.m_localShapeInfo = localShapeInfo;
        this.m_hitNormalLocal = hitNormalLocal;
        this.m_hitPointLocal = hitPointLocal;
        this.m_hitFraction = hitFraction;
    }
}
/**
 * Result callback for convex sweep tests
 */
export class ConvexResultCallback {
    constructor() {
        this.m_closestHitFraction = 1.0;
        this.m_collisionFilterGroup = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
        this.m_collisionFilterMask = btBroadphaseProxy.CollisionFilterGroups.AllFilter;
    }
    hasHit() {
        return this.m_closestHitFraction < 1.0;
    }
    needsCollision(proxy0) {
        const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
        return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
    }
}
/**
 * Closest convex result callback
 */
export class ClosestConvexResultCallback extends ConvexResultCallback {
    constructor(convexFromWorld, convexToWorld) {
        super();
        this.m_convexFromWorld = convexFromWorld;
        this.m_convexToWorld = convexToWorld;
        this.m_hitNormalWorld = new btVector3();
        this.m_hitPointWorld = new btVector3();
        this.m_hitCollisionObject = null;
    }
    addSingleResult(convexResult, normalInWorldSpace) {
        // Caller already does the filter on the m_closestHitFraction
        console.assert(convexResult.m_hitFraction <= this.m_closestHitFraction);
        this.m_closestHitFraction = convexResult.m_hitFraction;
        this.m_hitCollisionObject = convexResult.m_hitCollisionObject;
        if (normalInWorldSpace) {
            this.m_hitNormalWorld.copy(convexResult.m_hitNormalLocal);
        }
        else {
            // Need to transform normal into worldspace
            const worldTrans = this.m_hitCollisionObject.getWorldTransform();
            this.m_hitNormalWorld.copy(multiplyMatrixVector(worldTrans.getBasis(), convexResult.m_hitNormalLocal));
        }
        this.m_hitPointWorld.copy(convexResult.m_hitPointLocal);
        return convexResult.m_hitFraction;
    }
}
/**
 * Contact result callback
 */
export class ContactResultCallback {
    constructor() {
        this.m_collisionFilterGroup = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
        this.m_collisionFilterMask = btBroadphaseProxy.CollisionFilterGroups.AllFilter;
        this.m_closestDistanceThreshold = 0;
    }
    needsCollision(proxy0) {
        const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
        return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
    }
}
/**
 * CollisionWorld is interface and container for the collision detection
 */
export class btCollisionWorld {
    constructor(dispatcher, broadphasePairCache, _collisionConfiguration) {
        this.m_collisionObjects = [];
        this.m_dispatcher1 = dispatcher;
        this.m_broadphasePairCache = broadphasePairCache;
        this.m_debugDrawer = null;
        this.m_forceUpdateAllAabbs = true;
        // Initialize dispatch info with default values
        this.m_dispatchInfo = {
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
    setBroadphase(pairCache) {
        this.m_broadphasePairCache = pairCache;
    }
    getBroadphase() {
        return this.m_broadphasePairCache;
    }
    getPairCache() {
        return this.m_broadphasePairCache.getOverlappingPairCache();
    }
    getDispatcher() {
        return this.m_dispatcher1;
    }
    updateSingleAabb(colObj) {
        const minAabb = new btVector3();
        const maxAabb = new btVector3();
        const shape = colObj.getCollisionShape();
        if (shape) {
            shape.getAabb(colObj.getWorldTransform(), minAabb, maxAabb);
            // Check for contact processing threshold
            const contactThreshold = colObj.getContactProcessingThreshold();
            if (contactThreshold !== 0.0) {
                const contactThresholdVec = new btVector3(contactThreshold, contactThreshold, contactThreshold);
                minAabb.subtract(contactThresholdVec);
                maxAabb.add(contactThresholdVec);
            }
            // Update broadphase AABB
            const bp = colObj.getBroadphaseHandle();
            if (bp) {
                this.m_broadphasePairCache.setAabb(bp, minAabb, maxAabb, this.m_dispatcher1);
            }
        }
    }
    updateAabbs() {
        for (const colObj of this.m_collisionObjects) {
            if (this.m_forceUpdateAllAabbs || colObj.isActive()) {
                this.updateSingleAabb(colObj);
            }
        }
    }
    computeOverlappingPairs() {
        this.m_broadphasePairCache.calculateOverlappingPairs(this.m_dispatcher1);
    }
    setDebugDrawer(debugDrawer) {
        this.m_debugDrawer = debugDrawer;
    }
    getDebugDrawer() {
        return this.m_debugDrawer;
    }
    debugDrawWorld() {
        if (!this.m_debugDrawer) {
            return;
        }
        const drawAabb = (this.m_debugDrawer.getDebugMode() & btIDebugDraw.DebugDrawModes.DBG_DrawAabb) !== 0;
        const drawWireframe = (this.m_debugDrawer.getDebugMode() & btIDebugDraw.DebugDrawModes.DBG_DrawWireframe) !== 0;
        if (drawAabb || drawWireframe) {
            for (const colObj of this.m_collisionObjects) {
                const shape = colObj.getCollisionShape();
                if (shape) {
                    const color = new btVector3(1, 1, 1);
                    if (drawAabb) {
                        const minAabb = new btVector3();
                        const maxAabb = new btVector3();
                        shape.getAabb(colObj.getWorldTransform(), minAabb, maxAabb);
                        this.m_debugDrawer.drawBox(minAabb, maxAabb, color);
                    }
                    if (drawWireframe) {
                        this.debugDrawObject(colObj.getWorldTransform(), shape, color);
                    }
                }
            }
        }
    }
    debugDrawObject(worldTransform, shape, color) {
        // Basic debug drawing - can be extended for specific shape types
        if (this.m_debugDrawer) {
            const minAabb = new btVector3();
            const maxAabb = new btVector3();
            shape.getAabb(worldTransform, minAabb, maxAabb);
            this.m_debugDrawer.drawBox(minAabb, maxAabb, color);
        }
    }
    getNumCollisionObjects() {
        return this.m_collisionObjects.length;
    }
    rayTest(rayFromWorld, rayToWorld, resultCallback) {
        // Basic ray test implementation
        // This is a simplified version - in the full implementation this would use the broadphase
        for (const colObj of this.m_collisionObjects) {
            if (!resultCallback.needsCollision(colObj.getBroadphaseHandle())) {
                continue;
            }
            // Simplified ray test - in reality this would call collision algorithms
            const rayFrom = new btTransform();
            rayFrom.setOrigin(rayFromWorld);
            const rayTo = new btTransform();
            rayTo.setOrigin(rayToWorld);
            btCollisionWorld.rayTestSingle(rayFrom, rayTo, colObj, colObj.getCollisionShape(), colObj.getWorldTransform(), resultCallback);
        }
    }
    convexSweepTest(castShape, from, to, resultCallback, allowedCcdPenetration = 0.0) {
        // Basic convex sweep test implementation
        for (const colObj of this.m_collisionObjects) {
            if (!resultCallback.needsCollision(colObj.getBroadphaseHandle())) {
                continue;
            }
            // Simplified convex test - in reality this would call collision algorithms
            btCollisionWorld.objectQuerySingle(castShape, from, to, colObj, colObj.getCollisionShape(), colObj.getWorldTransform(), resultCallback, allowedCcdPenetration);
        }
    }
    contactTest(_colObj, _resultCallback) {
        // Basic contact test implementation - simplified for now
        console.log('Contact test not fully implemented yet');
    }
    contactPairTest(_colObjA, _colObjB, _resultCallback) {
        // Basic contact pair test implementation - simplified for now
        console.log('Contact pair test not fully implemented yet');
    }
    static rayTestSingle(rayFromTrans, rayToTrans, collisionObject, _collisionShape, _colObjWorldTransform, resultCallback) {
        // Simplified ray test single implementation
        // In the full implementation this would dispatch to collision algorithms
        const rayDir = rayToTrans.getOrigin().subtract(rayFromTrans.getOrigin());
        const rayLength = rayDir.length();
        rayDir.normalize();
        // Basic sphere test as an example - real implementation would dispatch based on shape type
        const result = new LocalRayResult(collisionObject, null, new btVector3(0, 0, 1), rayLength > 0 ? 0.5 : 1.0 // Simplified hit fraction
        );
        if (result.m_hitFraction < resultCallback.m_closestHitFraction) {
            resultCallback.addSingleResult(result, false);
        }
    }
    static rayTestSingleInternal(rayFromTrans, rayToTrans, collisionObjectWrap, resultCallback) {
        // Simplified internal ray test
        this.rayTestSingle(rayFromTrans, rayToTrans, collisionObjectWrap.getCollisionObject(), collisionObjectWrap.getCollisionShape(), collisionObjectWrap.getWorldTransform(), resultCallback);
    }
    static objectQuerySingle(_castShape, _rayFromTrans, _rayToTrans, collisionObject, _collisionShape, _colObjWorldTransform, resultCallback, _allowedPenetration) {
        // Simplified object query single implementation
        const result = new LocalConvexResult(collisionObject, null, new btVector3(0, 0, 1), new btVector3(0, 0, 0), 0.5 // Simplified hit fraction
        );
        if (result.m_hitFraction < resultCallback.m_closestHitFraction) {
            resultCallback.addSingleResult(result, false);
        }
    }
    static objectQuerySingleInternal(castShape, convexFromTrans, convexToTrans, colObjWrap, resultCallback, allowedPenetration) {
        // Simplified internal object query
        this.objectQuerySingle(castShape, convexFromTrans, convexToTrans, colObjWrap.getCollisionObject(), colObjWrap.getCollisionShape(), colObjWrap.getWorldTransform(), resultCallback, allowedPenetration);
    }
    addCollisionObject(collisionObject, collisionFilterGroup = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter, collisionFilterMask = btBroadphaseProxy.CollisionFilterGroups.AllFilter) {
        // Check if object is already in the world
        if (this.m_collisionObjects.includes(collisionObject)) {
            console.warn('Object already in collision world');
            return;
        }
        collisionObject.setWorldArrayIndex(this.m_collisionObjects.length);
        this.m_collisionObjects.push(collisionObject);
        // Create broadphase proxy
        const shape = collisionObject.getCollisionShape();
        if (shape) {
            const minAabb = new btVector3();
            const maxAabb = new btVector3();
            shape.getAabb(collisionObject.getWorldTransform(), minAabb, maxAabb);
            const proxyType = shape.getShapeType();
            const proxy = this.m_broadphasePairCache.createProxy(minAabb, maxAabb, proxyType, collisionObject, collisionFilterGroup, collisionFilterMask, this.m_dispatcher1);
            collisionObject.setBroadphaseHandle(proxy);
        }
    }
    refreshBroadphaseProxy(collisionObject) {
        const shape = collisionObject.getCollisionShape();
        const bp = collisionObject.getBroadphaseHandle();
        if (shape && bp) {
            this.m_broadphasePairCache.destroyProxy(bp, this.m_dispatcher1);
            const minAabb = new btVector3();
            const maxAabb = new btVector3();
            shape.getAabb(collisionObject.getWorldTransform(), minAabb, maxAabb);
            const proxyType = shape.getShapeType();
            const newProxy = this.m_broadphasePairCache.createProxy(minAabb, maxAabb, proxyType, collisionObject, bp.m_collisionFilterGroup, bp.m_collisionFilterMask, this.m_dispatcher1);
            collisionObject.setBroadphaseHandle(newProxy);
        }
    }
    getCollisionObjectArray() {
        return this.m_collisionObjects;
    }
    removeCollisionObject(collisionObject) {
        const index = this.m_collisionObjects.indexOf(collisionObject);
        if (index >= 0) {
            // Remove from broadphase
            const bp = collisionObject.getBroadphaseHandle();
            if (bp) {
                this.m_broadphasePairCache.destroyProxy(bp, this.m_dispatcher1);
                collisionObject.setBroadphaseHandle(null);
            }
            // Remove from array
            this.m_collisionObjects.splice(index, 1);
            // Update array indices for remaining objects
            for (let i = index; i < this.m_collisionObjects.length; i++) {
                this.m_collisionObjects[i].setWorldArrayIndex(i);
            }
        }
    }
    performDiscreteCollisionDetection() {
        this.updateAabbs();
        this.computeOverlappingPairs();
        const dispatcher = this.getDispatcher();
        if (dispatcher) {
            dispatcher.dispatchAllCollisionPairs(this.m_broadphasePairCache.getOverlappingPairCache(), this.m_dispatchInfo, this.m_dispatcher1);
        }
    }
    getDispatchInfo() {
        return this.m_dispatchInfo;
    }
    getForceUpdateAllAabbs() {
        return this.m_forceUpdateAllAabbs;
    }
    setForceUpdateAllAabbs(forceUpdateAllAabbs) {
        this.m_forceUpdateAllAabbs = forceUpdateAllAabbs;
    }
}
