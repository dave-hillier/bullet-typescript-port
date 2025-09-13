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

import {
  btDispatcher,
  btDispatcherInfo,
  ebtDispatcherQueryType,
  btCollisionAlgorithm,
  btCollisionObject,
  btCollisionObjectWrapper,
  btOverlappingPairCache,
  btPersistentManifold,
  btPoolAllocator
} from './btDispatcher';

describe('btDispatcherInfo', () => {
  test('constructor should initialize with correct default values', () => {
    const dispatcherInfo = new btDispatcherInfo();

    expect(dispatcherInfo.m_timeStep).toBe(0.0);
    expect(dispatcherInfo.m_stepCount).toBe(0);
    expect(dispatcherInfo.m_dispatchFunc).toBe(btDispatcherInfo.DispatchFunc.DISPATCH_DISCRETE);
    expect(dispatcherInfo.m_timeOfImpact).toBe(1.0);
    expect(dispatcherInfo.m_useContinuous).toBe(true);
    expect(dispatcherInfo.m_debugDraw).toBe(null);
    expect(dispatcherInfo.m_enableSatConvex).toBe(false);
    expect(dispatcherInfo.m_enableSPU).toBe(true);
    expect(dispatcherInfo.m_useEpa).toBe(true);
    expect(dispatcherInfo.m_allowedCcdPenetration).toBe(0.04);
    expect(dispatcherInfo.m_useConvexConservativeDistanceUtil).toBe(false);
    expect(dispatcherInfo.m_convexConservativeDistanceThreshold).toBe(0.0);
    expect(dispatcherInfo.m_deterministicOverlappingPairs).toBe(false);
  });

  test('should allow setting and getting properties', () => {
    const dispatcherInfo = new btDispatcherInfo();

    dispatcherInfo.m_timeStep = 0.016;
    dispatcherInfo.m_stepCount = 1;
    dispatcherInfo.m_dispatchFunc = btDispatcherInfo.DispatchFunc.DISPATCH_CONTINUOUS;
    dispatcherInfo.m_useContinuous = false;

    expect(dispatcherInfo.m_timeStep).toBe(0.016);
    expect(dispatcherInfo.m_stepCount).toBe(1);
    expect(dispatcherInfo.m_dispatchFunc).toBe(btDispatcherInfo.DispatchFunc.DISPATCH_CONTINUOUS);
    expect(dispatcherInfo.m_useContinuous).toBe(false);
  });

  test('DispatchFunc constants should have correct values', () => {
    expect(btDispatcherInfo.DispatchFunc.DISPATCH_DISCRETE).toBe(1);
    expect(btDispatcherInfo.DispatchFunc.DISPATCH_CONTINUOUS).toBe(2);
  });
});

describe('ebtDispatcherQueryType', () => {
  test('should have correct enum values', () => {
    expect(ebtDispatcherQueryType.BT_CONTACT_POINT_ALGORITHMS).toBe(1);
    expect(ebtDispatcherQueryType.BT_CLOSEST_POINT_ALGORITHMS).toBe(2);
  });
});

// Mock implementations for testing
class MockCollisionAlgorithm implements btCollisionAlgorithm {
  // Mock implementation
}

class MockCollisionObject implements btCollisionObject {
  public id: number;
  constructor(id: number) {
    this.id = id;
  }
}

class MockCollisionObjectWrapper implements btCollisionObjectWrapper {
  public collisionObject: btCollisionObject;
  constructor(collisionObject: btCollisionObject) {
    this.collisionObject = collisionObject;
  }
}

class MockPersistentManifold implements btPersistentManifold {
  public id: number;
  constructor(id: number) {
    this.id = id;
  }
}

class MockOverlappingPairCache implements btOverlappingPairCache {
  // Mock implementation
}

class MockPoolAllocator implements btPoolAllocator {
  // Mock implementation
}

// Test implementation of btDispatcher
class TestDispatcher extends btDispatcher {
  private manifolds: btPersistentManifold[] = [];
  private poolAllocator = new MockPoolAllocator();

  public findAlgorithm(
    _body0Wrap: btCollisionObjectWrapper,
    _body1Wrap: btCollisionObjectWrapper,
    _sharedManifold: btPersistentManifold | null,
    _queryType: ebtDispatcherQueryType
  ): btCollisionAlgorithm | null {
    return new MockCollisionAlgorithm();
  }

  public getNewManifold(_b0: btCollisionObject, _b1: btCollisionObject): btPersistentManifold {
    const manifold = new MockPersistentManifold(this.manifolds.length);
    this.manifolds.push(manifold);
    return manifold;
  }

  public releaseManifold(manifold: btPersistentManifold): void {
    const index = this.manifolds.indexOf(manifold);
    if (index >= 0) {
      this.manifolds.splice(index, 1);
    }
  }

  public clearManifold(_manifold: btPersistentManifold): void {
    // Mock implementation - just clear the manifold
  }

  public needsCollision(_body0: btCollisionObject, _body1: btCollisionObject): boolean {
    return true; // Mock implementation always returns true
  }

  public needsResponse(_body0: btCollisionObject, _body1: btCollisionObject): boolean {
    return true; // Mock implementation always returns true
  }

  public dispatchAllCollisionPairs(
    _pairCache: btOverlappingPairCache,
    _dispatchInfo: btDispatcherInfo,
    _dispatcher: btDispatcher
  ): void {
    // Mock implementation - no-op
  }

  public getNumManifolds(): number {
    return this.manifolds.length;
  }

  public getManifoldByIndexInternal(index: number): btPersistentManifold {
    return this.manifolds[index];
  }

  public getInternalManifoldPointer(): btPersistentManifold[] {
    return this.manifolds;
  }

  public getInternalManifoldPool(): btPoolAllocator {
    return this.poolAllocator;
  }

  public getInternalManifoldPoolConst(): btPoolAllocator {
    return this.poolAllocator;
  }

  public allocateCollisionAlgorithm(_size: number): any {
    return new MockCollisionAlgorithm();
  }

  public freeCollisionAlgorithm(_ptr: any): void {
    // Mock implementation - no-op in TypeScript
  }
}

describe('btDispatcher', () => {
  let dispatcher: TestDispatcher;
  let collisionObject1: MockCollisionObject;
  let collisionObject2: MockCollisionObject;
  let wrapper1: MockCollisionObjectWrapper;
  let wrapper2: MockCollisionObjectWrapper;

  beforeEach(() => {
    dispatcher = new TestDispatcher();
    collisionObject1 = new MockCollisionObject(1);
    collisionObject2 = new MockCollisionObject(2);
    wrapper1 = new MockCollisionObjectWrapper(collisionObject1);
    wrapper2 = new MockCollisionObjectWrapper(collisionObject2);
  });

  test('findAlgorithm should return a collision algorithm', () => {
    const algorithm = dispatcher.findAlgorithm(
      wrapper1,
      wrapper2,
      null,
      ebtDispatcherQueryType.BT_CONTACT_POINT_ALGORITHMS
    );

    expect(algorithm).toBeDefined();
    expect(algorithm).toBeInstanceOf(MockCollisionAlgorithm);
  });

  test('getNewManifold should create and track manifolds', () => {
    expect(dispatcher.getNumManifolds()).toBe(0);

    const manifold1 = dispatcher.getNewManifold(collisionObject1, collisionObject2);
    expect(manifold1).toBeDefined();
    expect(manifold1).toBeInstanceOf(MockPersistentManifold);
    expect(dispatcher.getNumManifolds()).toBe(1);

    const manifold2 = dispatcher.getNewManifold(collisionObject1, collisionObject2);
    expect(manifold2).toBeDefined();
    expect(dispatcher.getNumManifolds()).toBe(2);
  });

  test('releaseManifold should remove manifolds', () => {
    const manifold1 = dispatcher.getNewManifold(collisionObject1, collisionObject2);
    const manifold2 = dispatcher.getNewManifold(collisionObject1, collisionObject2);

    expect(dispatcher.getNumManifolds()).toBe(2);

    dispatcher.releaseManifold(manifold1);
    expect(dispatcher.getNumManifolds()).toBe(1);

    dispatcher.releaseManifold(manifold2);
    expect(dispatcher.getNumManifolds()).toBe(0);
  });

  test('getManifoldByIndexInternal should return correct manifold', () => {
    const manifold1 = dispatcher.getNewManifold(collisionObject1, collisionObject2);
    const manifold2 = dispatcher.getNewManifold(collisionObject1, collisionObject2);

    expect(dispatcher.getManifoldByIndexInternal(0)).toBe(manifold1);
    expect(dispatcher.getManifoldByIndexInternal(1)).toBe(manifold2);
  });

  test('getInternalManifoldPointer should return manifold array', () => {
    const manifold1 = dispatcher.getNewManifold(collisionObject1, collisionObject2);
    const manifold2 = dispatcher.getNewManifold(collisionObject1, collisionObject2);

    const manifoldPointer = dispatcher.getInternalManifoldPointer();
    expect(manifoldPointer).toContain(manifold1);
    expect(manifoldPointer).toContain(manifold2);
    expect(manifoldPointer.length).toBe(2);
  });

  test('needsCollision should return boolean', () => {
    const result = dispatcher.needsCollision(collisionObject1, collisionObject2);
    expect(typeof result).toBe('boolean');
  });

  test('needsResponse should return boolean', () => {
    const result = dispatcher.needsResponse(collisionObject1, collisionObject2);
    expect(typeof result).toBe('boolean');
  });

  test('getInternalManifoldPool should return pool allocator', () => {
    const pool = dispatcher.getInternalManifoldPool();
    expect(pool).toBeDefined();
    expect(pool).toBeInstanceOf(MockPoolAllocator);
  });

  test('getInternalManifoldPoolConst should return same pool allocator', () => {
    const pool1 = dispatcher.getInternalManifoldPool();
    const pool2 = dispatcher.getInternalManifoldPoolConst();
    expect(pool1).toBe(pool2);
  });

  test('allocateCollisionAlgorithm should return object', () => {
    const algorithm = dispatcher.allocateCollisionAlgorithm(64);
    expect(algorithm).toBeDefined();
    expect(algorithm).toBeInstanceOf(MockCollisionAlgorithm);
  });

  test('freeCollisionAlgorithm should accept any object', () => {
    const algorithm = dispatcher.allocateCollisionAlgorithm(64);
    expect(() => {
      dispatcher.freeCollisionAlgorithm(algorithm);
    }).not.toThrow();
  });

  test('dispatchAllCollisionPairs should not throw', () => {
    const pairCache = new MockOverlappingPairCache();
    const dispatchInfo = new btDispatcherInfo();

    expect(() => {
      dispatcher.dispatchAllCollisionPairs(pairCache, dispatchInfo, dispatcher);
    }).not.toThrow();
  });

  test('clearManifold should not throw', () => {
    const manifold = dispatcher.getNewManifold(collisionObject1, collisionObject2);
    
    expect(() => {
      dispatcher.clearManifold(manifold);
    }).not.toThrow();
  });
});