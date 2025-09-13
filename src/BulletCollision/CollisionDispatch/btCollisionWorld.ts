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
import { btCollisionObject, btCollisionObjectArray } from './btCollisionObject';
import { btDispatcherInfo, btCollisionConfiguration } from './btCollisionDispatcher';
import { btBroadphaseInterface } from '../BroadphaseCollision/btBroadphaseInterface';
import { btOverlappingPairCache } from '../BroadphaseCollision/btBroadphaseInterface';
import { btDispatcher } from '../BroadphaseCollision/btDispatcher';
import { btIDebugDraw } from '../../LinearMath/btIDebugDraw';
import { btCollisionShape } from '../CollisionShapes/btCollisionShape';
import { btConvexShape } from '../CollisionShapes/btConvexShape';
import { btBroadphaseProxy } from '../BroadphaseCollision/btBroadphaseProxy';
import { btManifoldPoint } from '../NarrowPhaseCollision/btManifoldPoint';
import { btCollisionObjectWrapper } from './btCollisionObjectWrapper';

/**
 * LocalShapeInfo gives extra information for complex shapes
 * Currently, only btTriangleMeshShape is available, so it just contains triangleIndex and subpart
 */
export interface LocalShapeInfo {
    m_shapePart: number;
    m_triangleIndex: number;
}

/**
 * Result structure for ray tests
 */
export class LocalRayResult {
    public readonly m_collisionObject: btCollisionObject;
    public readonly m_localShapeInfo: LocalShapeInfo | null;
    public readonly m_hitNormalLocal: btVector3;
    public readonly m_hitFraction: number;

    constructor(
        collisionObject: btCollisionObject,
        localShapeInfo: LocalShapeInfo | null,
        hitNormalLocal: btVector3,
        hitFraction: number
    ) {
        this.m_collisionObject = collisionObject;
        this.m_localShapeInfo = localShapeInfo;
        this.m_hitNormalLocal = hitNormalLocal;
        this.m_hitFraction = hitFraction;
    }
}

/**
 * Result callback for ray tests
 */
export abstract class RayResultCallback {
    public m_closestHitFraction: number;
    public m_collisionObject: btCollisionObject | null;
    public m_collisionFilterGroup: number;
    public m_collisionFilterMask: number;
    public m_flags: number;

    constructor() {
        this.m_closestHitFraction = 1.0;
        this.m_collisionObject = null;
        this.m_collisionFilterGroup = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
        this.m_collisionFilterMask = btBroadphaseProxy.CollisionFilterGroups.AllFilter;
        this.m_flags = 0;
    }

    hasHit(): boolean {
        return this.m_collisionObject !== null;
    }

    needsCollision(proxy0: btBroadphaseProxy): boolean {
        const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
        return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
    }

    abstract addSingleResult(rayResult: LocalRayResult, normalInWorldSpace: boolean): number;
}

/**
 * Closest ray result callback
 */
export class ClosestRayResultCallback extends RayResultCallback {
    public m_rayFromWorld: btVector3;
    public m_rayToWorld: btVector3;
    public m_hitNormalWorld: btVector3;
    public m_hitPointWorld: btVector3;

    constructor(rayFromWorld: btVector3, rayToWorld: btVector3) {
        super();
        this.m_rayFromWorld = rayFromWorld;
        this.m_rayToWorld = rayToWorld;
        this.m_hitNormalWorld = new btVector3();
        this.m_hitPointWorld = new btVector3();
    }

    addSingleResult(rayResult: LocalRayResult, normalInWorldSpace: boolean): number {
        // Caller already does the filter on the m_closestHitFraction
        console.assert(rayResult.m_hitFraction <= this.m_closestHitFraction);

        this.m_closestHitFraction = rayResult.m_hitFraction;
        this.m_collisionObject = rayResult.m_collisionObject;
        
        if (normalInWorldSpace) {
            this.m_hitNormalWorld.copy(rayResult.m_hitNormalLocal);
        } else {
            // Need to transform normal into worldspace
            const worldTrans = this.m_collisionObject!.getWorldTransform();
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
    public m_collisionObjects: btCollisionObject[];
    public m_rayFromWorld: btVector3;
    public m_rayToWorld: btVector3;
    public m_hitNormalWorld: btVector3[];
    public m_hitPointWorld: btVector3[];
    public m_hitFractions: number[];

    constructor(rayFromWorld: btVector3, rayToWorld: btVector3) {
        super();
        this.m_rayFromWorld = rayFromWorld;
        this.m_rayToWorld = rayToWorld;
        this.m_collisionObjects = [];
        this.m_hitNormalWorld = [];
        this.m_hitPointWorld = [];
        this.m_hitFractions = [];
    }

    addSingleResult(rayResult: LocalRayResult, normalInWorldSpace: boolean): number {
        this.m_collisionObject = rayResult.m_collisionObject;
        this.m_collisionObjects.push(rayResult.m_collisionObject);
        
        let hitNormalWorld: btVector3;
        if (normalInWorldSpace) {
            hitNormalWorld = rayResult.m_hitNormalLocal.clone();
        } else {
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
    public readonly m_hitCollisionObject: btCollisionObject;
    public readonly m_localShapeInfo: LocalShapeInfo | null;
    public readonly m_hitNormalLocal: btVector3;
    public readonly m_hitPointLocal: btVector3;
    public readonly m_hitFraction: number;

    constructor(
        hitCollisionObject: btCollisionObject,
        localShapeInfo: LocalShapeInfo | null,
        hitNormalLocal: btVector3,
        hitPointLocal: btVector3,
        hitFraction: number
    ) {
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
export abstract class ConvexResultCallback {
    public m_closestHitFraction: number;
    public m_collisionFilterGroup: number;
    public m_collisionFilterMask: number;

    constructor() {
        this.m_closestHitFraction = 1.0;
        this.m_collisionFilterGroup = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
        this.m_collisionFilterMask = btBroadphaseProxy.CollisionFilterGroups.AllFilter;
    }

    hasHit(): boolean {
        return this.m_closestHitFraction < 1.0;
    }

    needsCollision(proxy0: btBroadphaseProxy): boolean {
        const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
        return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
    }

    abstract addSingleResult(convexResult: LocalConvexResult, normalInWorldSpace: boolean): number;
}

/**
 * Closest convex result callback
 */
export class ClosestConvexResultCallback extends ConvexResultCallback {
    public m_convexFromWorld: btVector3;
    public m_convexToWorld: btVector3;
    public m_hitNormalWorld: btVector3;
    public m_hitPointWorld: btVector3;
    public m_hitCollisionObject: btCollisionObject | null;

    constructor(convexFromWorld: btVector3, convexToWorld: btVector3) {
        super();
        this.m_convexFromWorld = convexFromWorld;
        this.m_convexToWorld = convexToWorld;
        this.m_hitNormalWorld = new btVector3();
        this.m_hitPointWorld = new btVector3();
        this.m_hitCollisionObject = null;
    }

    addSingleResult(convexResult: LocalConvexResult, normalInWorldSpace: boolean): number {
        // Caller already does the filter on the m_closestHitFraction
        console.assert(convexResult.m_hitFraction <= this.m_closestHitFraction);

        this.m_closestHitFraction = convexResult.m_hitFraction;
        this.m_hitCollisionObject = convexResult.m_hitCollisionObject;
        
        if (normalInWorldSpace) {
            this.m_hitNormalWorld.copy(convexResult.m_hitNormalLocal);
        } else {
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
export abstract class ContactResultCallback {
    public m_collisionFilterGroup: number;
    public m_collisionFilterMask: number;
    public m_closestDistanceThreshold: number;

    constructor() {
        this.m_collisionFilterGroup = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter;
        this.m_collisionFilterMask = btBroadphaseProxy.CollisionFilterGroups.AllFilter;
        this.m_closestDistanceThreshold = 0;
    }

    needsCollision(proxy0: btBroadphaseProxy): boolean {
        const collides = (proxy0.m_collisionFilterGroup & this.m_collisionFilterMask) !== 0;
        return collides && (this.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0;
    }

    abstract addSingleResult(
        cp: btManifoldPoint,
        colObj0Wrap: btCollisionObjectWrapper,
        partId0: number,
        index0: number,
        colObj1Wrap: btCollisionObjectWrapper,
        partId1: number,
        index1: number
    ): number;
}

/**
 * CollisionWorld is interface and container for the collision detection
 */
export class btCollisionWorld {
    protected m_collisionObjects: btCollisionObjectArray;
    protected m_dispatcher1: btDispatcher;
    protected m_dispatchInfo: btDispatcherInfo;
    protected m_broadphasePairCache: btBroadphaseInterface;
    protected m_debugDrawer: btIDebugDraw | null;
    protected m_forceUpdateAllAabbs: boolean;

    constructor(
        dispatcher: btDispatcher,
        broadphasePairCache: btBroadphaseInterface,
_collisionConfiguration: btCollisionConfiguration
    ) {
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

    setBroadphase(pairCache: btBroadphaseInterface): void {
        this.m_broadphasePairCache = pairCache;
    }

    getBroadphase(): btBroadphaseInterface {
        return this.m_broadphasePairCache;
    }

    getPairCache(): btOverlappingPairCache | null {
        return this.m_broadphasePairCache.getOverlappingPairCache();
    }

    getDispatcher(): btDispatcher {
        return this.m_dispatcher1;
    }

    updateSingleAabb(colObj: btCollisionObject): void {
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

    updateAabbs(): void {
        for (const colObj of this.m_collisionObjects) {
            if (this.m_forceUpdateAllAabbs || colObj.isActive()) {
                this.updateSingleAabb(colObj);
            }
        }
    }

    computeOverlappingPairs(): void {
        this.m_broadphasePairCache.calculateOverlappingPairs(this.m_dispatcher1);
    }

    setDebugDrawer(debugDrawer: btIDebugDraw): void {
        this.m_debugDrawer = debugDrawer;
    }

    getDebugDrawer(): btIDebugDraw | null {
        return this.m_debugDrawer;
    }

    debugDrawWorld(): void {
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

    debugDrawObject(worldTransform: btTransform, shape: btCollisionShape, color: btVector3): void {
        // Basic debug drawing - can be extended for specific shape types
        if (this.m_debugDrawer) {
            const minAabb = new btVector3();
            const maxAabb = new btVector3();
            shape.getAabb(worldTransform, minAabb, maxAabb);
            this.m_debugDrawer.drawBox(minAabb, maxAabb, color);
        }
    }

    getNumCollisionObjects(): number {
        return this.m_collisionObjects.length;
    }

    rayTest(rayFromWorld: btVector3, rayToWorld: btVector3, resultCallback: RayResultCallback): void {
        // Basic ray test implementation
        // This is a simplified version - in the full implementation this would use the broadphase
        for (const colObj of this.m_collisionObjects) {
            if (!resultCallback.needsCollision(colObj.getBroadphaseHandle()!)) {
                continue;
            }
            
            // Simplified ray test - in reality this would call collision algorithms
            const rayFrom = new btTransform();
            rayFrom.setOrigin(rayFromWorld);
            const rayTo = new btTransform();
            rayTo.setOrigin(rayToWorld);
            
            btCollisionWorld.rayTestSingle(
                rayFrom, 
                rayTo, 
                colObj, 
                colObj.getCollisionShape()!, 
                colObj.getWorldTransform(),
                resultCallback
            );
        }
    }

    convexSweepTest(
        castShape: btConvexShape,
        from: btTransform,
        to: btTransform,
        resultCallback: ConvexResultCallback,
        allowedCcdPenetration: number = 0.0
    ): void {
        // Basic convex sweep test implementation
        for (const colObj of this.m_collisionObjects) {
            if (!resultCallback.needsCollision(colObj.getBroadphaseHandle()!)) {
                continue;
            }
            
            // Simplified convex test - in reality this would call collision algorithms
            btCollisionWorld.objectQuerySingle(
                castShape,
                from,
                to,
                colObj,
                colObj.getCollisionShape()!,
                colObj.getWorldTransform(),
                resultCallback,
                allowedCcdPenetration
            );
        }
    }

    contactTest(_colObj: btCollisionObject, _resultCallback: ContactResultCallback): void {
        // Basic contact test implementation - simplified for now
        console.log('Contact test not fully implemented yet');
    }

    contactPairTest(_colObjA: btCollisionObject, _colObjB: btCollisionObject, _resultCallback: ContactResultCallback): void {
        // Basic contact pair test implementation - simplified for now
        console.log('Contact pair test not fully implemented yet');
    }

    static rayTestSingle(
        rayFromTrans: btTransform,
        rayToTrans: btTransform,
        collisionObject: btCollisionObject,
        _collisionShape: btCollisionShape,
        _colObjWorldTransform: btTransform,
        resultCallback: RayResultCallback
    ): void {
        // Simplified ray test single implementation
        // In the full implementation this would dispatch to collision algorithms
        const rayDir = rayToTrans.getOrigin().subtract(rayFromTrans.getOrigin());
        const rayLength = rayDir.length();
        rayDir.normalize();
        
        // Basic sphere test as an example - real implementation would dispatch based on shape type
        const result = new LocalRayResult(
            collisionObject,
            null,
            new btVector3(0, 0, 1),
            rayLength > 0 ? 0.5 : 1.0 // Simplified hit fraction
        );
        
        if (result.m_hitFraction < resultCallback.m_closestHitFraction) {
            resultCallback.addSingleResult(result, false);
        }
    }

    static rayTestSingleInternal(
        rayFromTrans: btTransform,
        rayToTrans: btTransform,
        collisionObjectWrap: btCollisionObjectWrapper,
        resultCallback: RayResultCallback
    ): void {
        // Simplified internal ray test
        this.rayTestSingle(
            rayFromTrans,
            rayToTrans,
            collisionObjectWrap.getCollisionObject(),
            collisionObjectWrap.getCollisionShape(),
            collisionObjectWrap.getWorldTransform(),
            resultCallback
        );
    }

    static objectQuerySingle(
        _castShape: btConvexShape,
        _rayFromTrans: btTransform,
        _rayToTrans: btTransform,
        collisionObject: btCollisionObject,
        _collisionShape: btCollisionShape,
        _colObjWorldTransform: btTransform,
        resultCallback: ConvexResultCallback,
        _allowedPenetration: number
    ): void {
        // Simplified object query single implementation
        const result = new LocalConvexResult(
            collisionObject,
            null,
            new btVector3(0, 0, 1),
            new btVector3(0, 0, 0),
            0.5 // Simplified hit fraction
        );
        
        if (result.m_hitFraction < resultCallback.m_closestHitFraction) {
            resultCallback.addSingleResult(result, false);
        }
    }

    static objectQuerySingleInternal(
        castShape: btConvexShape,
        convexFromTrans: btTransform,
        convexToTrans: btTransform,
        colObjWrap: btCollisionObjectWrapper,
        resultCallback: ConvexResultCallback,
        allowedPenetration: number
    ): void {
        // Simplified internal object query
        this.objectQuerySingle(
            castShape,
            convexFromTrans,
            convexToTrans,
            colObjWrap.getCollisionObject(),
            colObjWrap.getCollisionShape(),
            colObjWrap.getWorldTransform(),
            resultCallback,
            allowedPenetration
        );
    }

    addCollisionObject(
        collisionObject: btCollisionObject,
        collisionFilterGroup: number = btBroadphaseProxy.CollisionFilterGroups.DefaultFilter,
        collisionFilterMask: number = btBroadphaseProxy.CollisionFilterGroups.AllFilter
    ): void {
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
            const proxy = this.m_broadphasePairCache.createProxy(
                minAabb,
                maxAabb,
                proxyType,
                collisionObject,
                collisionFilterGroup,
                collisionFilterMask,
                this.m_dispatcher1
            );

            collisionObject.setBroadphaseHandle(proxy);
        }
    }

    refreshBroadphaseProxy(collisionObject: btCollisionObject): void {
        const shape = collisionObject.getCollisionShape();
        const bp = collisionObject.getBroadphaseHandle();
        
        if (shape && bp) {
            this.m_broadphasePairCache.destroyProxy(bp, this.m_dispatcher1);
            
            const minAabb = new btVector3();
            const maxAabb = new btVector3();
            shape.getAabb(collisionObject.getWorldTransform(), minAabb, maxAabb);
            
            const proxyType = shape.getShapeType();
            const newProxy = this.m_broadphasePairCache.createProxy(
                minAabb,
                maxAabb,
                proxyType,
                collisionObject,
                bp.m_collisionFilterGroup,
                bp.m_collisionFilterMask,
                this.m_dispatcher1
            );
            
            collisionObject.setBroadphaseHandle(newProxy);
        }
    }

    getCollisionObjectArray(): btCollisionObjectArray {
        return this.m_collisionObjects;
    }

    removeCollisionObject(collisionObject: btCollisionObject): void {
        const index = this.m_collisionObjects.indexOf(collisionObject);
        if (index >= 0) {
            // Remove from broadphase
            const bp = collisionObject.getBroadphaseHandle();
            if (bp) {
                this.m_broadphasePairCache.destroyProxy(bp, this.m_dispatcher1);
                collisionObject.setBroadphaseHandle(null as any);
            }

            // Remove from array
            this.m_collisionObjects.splice(index, 1);

            // Update array indices for remaining objects
            for (let i = index; i < this.m_collisionObjects.length; i++) {
                this.m_collisionObjects[i].setWorldArrayIndex(i);
            }
        }
    }

    performDiscreteCollisionDetection(): void {
        this.updateAabbs();
        this.computeOverlappingPairs();
        
        const dispatcher = this.getDispatcher();
        if (dispatcher) {
            dispatcher.dispatchAllCollisionPairs(
                this.m_broadphasePairCache.getOverlappingPairCache()!,
                this.m_dispatchInfo,
                this.m_dispatcher1
            );
        }
    }

    getDispatchInfo(): btDispatcherInfo {
        return this.m_dispatchInfo;
    }

    getForceUpdateAllAabbs(): boolean {
        return this.m_forceUpdateAllAabbs;
    }

    setForceUpdateAllAabbs(forceUpdateAllAabbs: boolean): void {
        this.m_forceUpdateAllAabbs = forceUpdateAllAabbs;
    }
}