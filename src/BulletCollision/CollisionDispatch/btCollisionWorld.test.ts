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

import { 
    btCollisionWorld,
    ClosestRayResultCallback,
    AllHitsRayResultCallback,
    ClosestConvexResultCallback
} from './btCollisionWorld';
import { btCollisionObject } from './btCollisionObject';
import { btCollisionDispatcher, btCollisionConfiguration } from './btCollisionDispatcher';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btCollisionShape } from '../CollisionShapes/btCollisionShape';
import { btConvexShape } from '../CollisionShapes/btConvexShape';
import { btBroadphaseInterface } from '../BroadphaseCollision/btBroadphaseInterface';
import { btDispatcher } from '../BroadphaseCollision/btDispatcher';
import { btBroadphaseProxy } from '../BroadphaseCollision/btBroadphaseProxy';
import { btIDebugDraw } from '../../LinearMath/btIDebugDraw';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

// Mock implementations for testing
class MockCollisionShape extends btCollisionShape {
    constructor() {
        super();
        this.m_shapeType = BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
    }

    getAabb(_t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        aabbMin.setValue(-1, -1, -1);
        aabbMax.setValue(1, 1, 1);
    }

    calculateLocalInertia(mass: number, inertia: btVector3): void {
        inertia.setValue(0.4 * mass, 0.4 * mass, 0.4 * mass);
    }

    setLocalScaling(_scaling: btVector3): void {
        // Mock implementation
    }

    getLocalScaling(): btVector3 {
        return new btVector3(1, 1, 1);
    }

    setMargin(_margin: number): void {
        // Mock implementation
    }

    getMargin(): number {
        return 0.04;
    }

    getShapeType(): number {
        return this.m_shapeType;
    }

    getName(): string {
        return 'MockShape';
    }
}

class MockConvexShape extends btConvexShape {
    constructor() {
        super();
        this.m_shapeType = BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
    }

    getAabb(_t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        aabbMin.setValue(-0.5, -0.5, -0.5);
        aabbMax.setValue(0.5, 0.5, 0.5);
    }

    getAabbSlow(_t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        this.getAabb(_t, aabbMin, aabbMax);
    }

    localGetSupportingVertex(_vec: btVector3): btVector3 {
        return new btVector3(0.5, 0, 0);
    }

    localGetSupportingVertexWithoutMargin(_vec: btVector3): btVector3 {
        return new btVector3(0.46, 0, 0);
    }

    batchedUnitVectorGetSupportingVertexWithoutMargin(
        _vectors: btVector3[], 
        supportVerticesOut: btVector3[], 
        numVectors: number
    ): void {
        for (let i = 0; i < numVectors; i++) {
            supportVerticesOut[i] = new btVector3(0.46, 0, 0);
        }
    }

    getNumPreferredPenetrationDirections(): number {
        return 0;
    }

    getPreferredPenetrationDirection(_index: number, _penetrationVector: btVector3): void {
        // Mock implementation
    }

    calculateLocalInertia(mass: number, inertia: btVector3): void {
        inertia.setValue(0.4 * mass, 0.4 * mass, 0.4 * mass);
    }

    setLocalScaling(_scaling: btVector3): void {
        // Mock implementation
    }

    getLocalScaling(): btVector3 {
        return new btVector3(1, 1, 1);
    }

    setMargin(_margin: number): void {
        // Mock implementation
    }

    getMargin(): number {
        return 0.04;
    }

    getShapeType(): number {
        return this.m_shapeType;
    }

    getName(): string {
        return 'MockConvexShape';
    }
}

class MockBroadphaseInterface extends btBroadphaseInterface {
    private proxies: btBroadphaseProxy[] = [];
    private nextUniqueId = 1;

    createProxy(
        aabbMin: btVector3,
        aabbMax: btVector3,
        _shapeType: number,
        userPtr: any,
        collisionFilterGroup: number,
        collisionFilterMask: number,
        _dispatcher: btDispatcher
    ): btBroadphaseProxy {
        const proxy = new btBroadphaseProxy();
        proxy.m_aabbMin = aabbMin.clone();
        proxy.m_aabbMax = aabbMax.clone();
        proxy.m_clientObject = userPtr;
        proxy.m_collisionFilterGroup = collisionFilterGroup;
        proxy.m_collisionFilterMask = collisionFilterMask;
        proxy.m_uniqueId = this.nextUniqueId++;
        
        this.proxies.push(proxy);
        return proxy;
    }

    destroyProxy(proxy: btBroadphaseProxy, _dispatcher: btDispatcher): void {
        const index = this.proxies.indexOf(proxy);
        if (index >= 0) {
            this.proxies.splice(index, 1);
        }
    }

    setAabb(proxy: btBroadphaseProxy, aabbMin: btVector3, aabbMax: btVector3, _dispatcher: btDispatcher): void {
        proxy.m_aabbMin = aabbMin.clone();
        proxy.m_aabbMax = aabbMax.clone();
    }

    getAabb(proxy: btBroadphaseProxy, aabbMin: btVector3, aabbMax: btVector3): void {
        aabbMin.copy(proxy.m_aabbMin);
        aabbMax.copy(proxy.m_aabbMax);
    }

    rayTest(_rayFrom: btVector3, _rayTo: btVector3, _callback: any): void {
        // Mock implementation
    }

    aabbTest(_aabbMin: btVector3, _aabbMax: btVector3, _callback: any): void {
        // Mock implementation
    }

    calculateOverlappingPairs(_dispatcher: btDispatcher): void {
        // Mock implementation
    }

    getOverlappingPairCache(): any {
        return null;
    }

    getOverlappingPairCacheConst(): any {
        return null;
    }

    getBroadphaseAabb(aabbMin: btVector3, aabbMax: btVector3): void {
        aabbMin.setValue(-1000, -1000, -1000);
        aabbMax.setValue(1000, 1000, 1000);
    }

    printStats(): void {
        console.log(`MockBroadphase: ${this.proxies.length} proxies`);
    }
}

class MockCollisionConfiguration implements btCollisionConfiguration {
    getPersistentManifoldPool(): any {
        return null;
    }

    getCollisionAlgorithmPool(): any {
        return null;
    }

    getCollisionAlgorithmCreateFunc(_proxyType0: number, _proxyType1: number): any {
        return null;
    }

    getClosestPointsAlgorithmCreateFunc(_proxyType0: number, _proxyType1: number): any {
        return null;
    }
}

class MockDebugDrawer extends btIDebugDraw {
    private debugMode = 0;
    public lines: Array<{ from: btVector3, to: btVector3, color: btVector3 }> = [];

    drawLine(from: btVector3, to: btVector3, color: btVector3): void {
        this.lines.push({ from: from.clone(), to: to.clone(), color: color.clone() });
    }

    drawLine3(from: btVector3, to: btVector3, fromColor: btVector3, _toColor: btVector3): void {
        this.drawLine(from, to, fromColor);
    }

    drawContactPoint(_pointOnB: btVector3, _normalOnB: btVector3, _distance: number, _lifeTime: number, _color: btVector3): void {
        // Mock implementation
    }

    reportErrorWarning(warningString: string): void {
        console.warn(warningString);
    }

    draw3dText(_location: btVector3, _textString: string): void {
        // Mock implementation
    }

    setDebugMode(debugMode: number): void {
        this.debugMode = debugMode;
    }

    getDebugMode(): number {
        return this.debugMode;
    }
}

describe('btCollisionWorld', () => {
    let collisionWorld: btCollisionWorld;
    let mockDispatcher: btCollisionDispatcher;
    let mockBroadphase: MockBroadphaseInterface;
    let mockConfiguration: MockCollisionConfiguration;

    beforeEach(() => {
        mockConfiguration = new MockCollisionConfiguration();
        mockDispatcher = new btCollisionDispatcher(mockConfiguration);
        mockBroadphase = new MockBroadphaseInterface();
        collisionWorld = new btCollisionWorld(mockDispatcher, mockBroadphase, mockConfiguration);
    });

    describe('Construction and Basic Properties', () => {
        test('should construct with proper components', () => {
            expect(collisionWorld.getDispatcher()).toBe(mockDispatcher);
            expect(collisionWorld.getBroadphase()).toBe(mockBroadphase);
            expect(collisionWorld.getNumCollisionObjects()).toBe(0);
            expect(collisionWorld.getForceUpdateAllAabbs()).toBe(true);
        });

        test('should get dispatch info', () => {
            const dispatchInfo = collisionWorld.getDispatchInfo();
            expect(dispatchInfo).toBeDefined();
            expect(dispatchInfo.m_timeStep).toBeCloseTo(1.0 / 60.0);
            expect(dispatchInfo.m_stepCount).toBe(0);
        });
    });

    describe('Collision Object Management', () => {
        let collisionObject: btCollisionObject;
        let mockShape: MockCollisionShape;

        beforeEach(() => {
            collisionObject = new btCollisionObject();
            mockShape = new MockCollisionShape();
            collisionObject.setCollisionShape(mockShape);
        });

        test('should add collision object', () => {
            expect(collisionWorld.getNumCollisionObjects()).toBe(0);
            
            collisionWorld.addCollisionObject(collisionObject);
            
            expect(collisionWorld.getNumCollisionObjects()).toBe(1);
            expect(collisionWorld.getCollisionObjectArray()[0]).toBe(collisionObject);
            expect(collisionObject.getWorldArrayIndex()).toBe(0);
            expect(collisionObject.getBroadphaseHandle()).not.toBeNull();
        });

        test('should not add same object twice', () => {
            collisionWorld.addCollisionObject(collisionObject);
            const spy = jest.spyOn(console, 'warn').mockImplementation();
            
            collisionWorld.addCollisionObject(collisionObject);
            
            expect(collisionWorld.getNumCollisionObjects()).toBe(1);
            expect(spy).toHaveBeenCalledWith('Object already in collision world');
            spy.mockRestore();
        });

        test('should remove collision object', () => {
            collisionWorld.addCollisionObject(collisionObject);
            expect(collisionWorld.getNumCollisionObjects()).toBe(1);
            
            collisionWorld.removeCollisionObject(collisionObject);
            
            expect(collisionWorld.getNumCollisionObjects()).toBe(0);
        });

        test('should update array indices when removing objects', () => {
            const object1 = new btCollisionObject();
            const object2 = new btCollisionObject();
            const object3 = new btCollisionObject();
            
            object1.setCollisionShape(mockShape);
            object2.setCollisionShape(mockShape);
            object3.setCollisionShape(mockShape);
            
            collisionWorld.addCollisionObject(object1);
            collisionWorld.addCollisionObject(object2);
            collisionWorld.addCollisionObject(object3);
            
            expect(object2.getWorldArrayIndex()).toBe(1);
            expect(object3.getWorldArrayIndex()).toBe(2);
            
            collisionWorld.removeCollisionObject(object1);
            
            expect(object2.getWorldArrayIndex()).toBe(0);
            expect(object3.getWorldArrayIndex()).toBe(1);
        });

        test('should get collision object array', () => {
            collisionWorld.addCollisionObject(collisionObject);
            const array = collisionWorld.getCollisionObjectArray();
            
            expect(array).toHaveLength(1);
            expect(array[0]).toBe(collisionObject);
        });
    });

    describe('AABB Management', () => {
        let collisionObject: btCollisionObject;
        let mockShape: MockCollisionShape;

        beforeEach(() => {
            collisionObject = new btCollisionObject();
            mockShape = new MockCollisionShape();
            collisionObject.setCollisionShape(mockShape);
            collisionWorld.addCollisionObject(collisionObject);
        });

        test('should update single AABB', () => {
            const transform = new btTransform();
            transform.setOrigin(new btVector3(5, 0, 0));
            collisionObject.setWorldTransform(transform);
            
            // This should not throw
            collisionWorld.updateSingleAabb(collisionObject);
        });

        test('should update all AABBs', () => {
            // This should not throw
            collisionWorld.updateAabbs();
        });

        test('should refresh broadphase proxy', () => {
            const initialProxy = collisionObject.getBroadphaseHandle();
            expect(initialProxy).not.toBeNull();
            
            collisionWorld.refreshBroadphaseProxy(collisionObject);
            
            const newProxy = collisionObject.getBroadphaseHandle();
            expect(newProxy).not.toBeNull();
            expect(newProxy).not.toBe(initialProxy); // Should be a new proxy
        });
    });

    describe('Ray Testing', () => {
        test('should create closest ray result callback', () => {
            const rayFrom = new btVector3(0, 0, 0);
            const rayTo = new btVector3(10, 0, 0);
            const callback = new ClosestRayResultCallback(rayFrom, rayTo);
            
            expect(callback.m_rayFromWorld).toBe(rayFrom);
            expect(callback.m_rayToWorld).toBe(rayTo);
            expect(callback.m_closestHitFraction).toBe(1.0);
            expect(callback.hasHit()).toBe(false);
        });

        test('should create all hits ray result callback', () => {
            const rayFrom = new btVector3(0, 0, 0);
            const rayTo = new btVector3(10, 0, 0);
            const callback = new AllHitsRayResultCallback(rayFrom, rayTo);
            
            expect(callback.m_rayFromWorld).toBe(rayFrom);
            expect(callback.m_rayToWorld).toBe(rayTo);
            expect(callback.m_collisionObjects).toHaveLength(0);
            expect(callback.m_hitNormalWorld).toHaveLength(0);
            expect(callback.m_hitPointWorld).toHaveLength(0);
            expect(callback.m_hitFractions).toHaveLength(0);
        });

        test('should perform ray test', () => {
            const collisionObject = new btCollisionObject();
            const mockShape = new MockCollisionShape();
            collisionObject.setCollisionShape(mockShape);
            collisionWorld.addCollisionObject(collisionObject);
            
            const rayFrom = new btVector3(0, 0, 0);
            const rayTo = new btVector3(10, 0, 0);
            const callback = new ClosestRayResultCallback(rayFrom, rayTo);
            
            // This should not throw
            collisionWorld.rayTest(rayFrom, rayTo, callback);
        });
    });

    describe('Convex Sweep Testing', () => {
        test('should create closest convex result callback', () => {
            const convexFrom = new btVector3(0, 0, 0);
            const convexTo = new btVector3(5, 0, 0);
            const callback = new ClosestConvexResultCallback(convexFrom, convexTo);
            
            expect(callback.m_convexFromWorld).toBe(convexFrom);
            expect(callback.m_convexToWorld).toBe(convexTo);
            expect(callback.m_closestHitFraction).toBe(1.0);
            expect(callback.hasHit()).toBe(false);
            expect(callback.m_hitCollisionObject).toBeNull();
        });

        test('should perform convex sweep test', () => {
            const collisionObject = new btCollisionObject();
            const mockShape = new MockCollisionShape();
            collisionObject.setCollisionShape(mockShape);
            collisionWorld.addCollisionObject(collisionObject);
            
            const castShape = new MockConvexShape();
            const from = new btTransform();
            from.setOrigin(new btVector3(0, 0, 0));
            const to = new btTransform();
            to.setOrigin(new btVector3(5, 0, 0));
            
            const callback = new ClosestConvexResultCallback(
                from.getOrigin(),
                to.getOrigin()
            );
            
            // This should not throw
            collisionWorld.convexSweepTest(castShape, from, to, callback);
        });
    });

    describe('Debug Drawing', () => {
        test('should set and get debug drawer', () => {
            const debugDrawer = new MockDebugDrawer();
            
            collisionWorld.setDebugDrawer(debugDrawer);
            expect(collisionWorld.getDebugDrawer()).toBe(debugDrawer);
        });

        test('should debug draw world', () => {
            const debugDrawer = new MockDebugDrawer();
            debugDrawer.setDebugMode(btIDebugDraw.DebugDrawModes.DBG_DrawAabb);
            collisionWorld.setDebugDrawer(debugDrawer);
            
            const collisionObject = new btCollisionObject();
            const mockShape = new MockCollisionShape();
            collisionObject.setCollisionShape(mockShape);
            collisionWorld.addCollisionObject(collisionObject);
            
            // This should not throw
            collisionWorld.debugDrawWorld();
        });

        test('should debug draw object', () => {
            const debugDrawer = new MockDebugDrawer();
            collisionWorld.setDebugDrawer(debugDrawer);
            
            const transform = new btTransform();
            const shape = new MockCollisionShape();
            const color = new btVector3(1, 0, 0);
            
            // This should not throw
            collisionWorld.debugDrawObject(transform, shape, color);
        });
    });

    describe('Collision Detection', () => {
        test('should perform discrete collision detection', () => {
            const collisionObject = new btCollisionObject();
            const mockShape = new MockCollisionShape();
            collisionObject.setCollisionShape(mockShape);
            collisionWorld.addCollisionObject(collisionObject);
            
            // This should not throw
            collisionWorld.performDiscreteCollisionDetection();
        });

        test('should compute overlapping pairs', () => {
            // This should not throw
            collisionWorld.computeOverlappingPairs();
        });
    });

    describe('Contact Testing', () => {
        test('should perform contact test', () => {
            const collisionObject = new btCollisionObject();
            const mockShape = new MockCollisionShape();
            collisionObject.setCollisionShape(mockShape);
            
            const spy = jest.spyOn(console, 'log').mockImplementation();
            
            // This should log a message since it's not fully implemented
            collisionWorld.contactTest(collisionObject, null as any);
            
            expect(spy).toHaveBeenCalledWith('Contact test not fully implemented yet');
            spy.mockRestore();
        });

        test('should perform contact pair test', () => {
            const objectA = new btCollisionObject();
            const objectB = new btCollisionObject();
            
            const spy = jest.spyOn(console, 'log').mockImplementation();
            
            // This should log a message since it's not fully implemented
            collisionWorld.contactPairTest(objectA, objectB, null as any);
            
            expect(spy).toHaveBeenCalledWith('Contact pair test not fully implemented yet');
            spy.mockRestore();
        });
    });

    describe('Force Update AABBs', () => {
        test('should set and get force update all AABBs', () => {
            expect(collisionWorld.getForceUpdateAllAabbs()).toBe(true);
            
            collisionWorld.setForceUpdateAllAabbs(false);
            expect(collisionWorld.getForceUpdateAllAabbs()).toBe(false);
        });
    });
});