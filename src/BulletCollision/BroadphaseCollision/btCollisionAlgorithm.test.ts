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
  btCollisionAlgorithm,
  btCollisionAlgorithmConstructionInfo,
  btManifoldArray,
  btManifoldResult,
  btCollisionObject,
  btCollisionObjectWrapper,
  btPersistentManifold
} from './btCollisionAlgorithm';
import { btDispatcher, btDispatcherInfo } from './btDispatcher';

// Mock implementations for testing
class MockDispatcher implements btDispatcher {
  public findAlgorithm(): any { return null; }
  public getNewManifold(): any { return null; }
  public releaseManifold(): void { }
  public clearManifold(): void { }
  public needsCollision(): boolean { return true; }
  public needsResponse(): boolean { return true; }
  public dispatchAllCollisionPairs(): void { }
  public getNumManifolds(): number { return 0; }
  public getManifoldByIndexInternal(): any { return null; }
  public getInternalManifoldPointer(): any[] { return []; }
  public getInternalManifoldPool(): any { return null; }
  public getInternalManifoldPoolConst(): any { return null; }
  public allocateCollisionAlgorithm(): any { return {}; }
  public freeCollisionAlgorithm(): void { }
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

class MockManifoldResult implements btManifoldResult {
  public contactPoints: any[] = [];
}

class MockPersistentManifold implements btPersistentManifold {
  public id: number;
  constructor(id: number) {
    this.id = id;
  }
}

// Test implementation of btCollisionAlgorithm
class TestCollisionAlgorithm extends btCollisionAlgorithm {
  public processedCollisions: number;
  public timeOfImpactCalculations: number;
  public manifoldRequests: number;

  constructor();
  constructor(ci: btCollisionAlgorithmConstructionInfo);
  constructor(ci?: btCollisionAlgorithmConstructionInfo) {
    if (ci) {
      super(ci);
    } else {
      super();
    }
    this.processedCollisions = 0;
    this.timeOfImpactCalculations = 0;
    this.manifoldRequests = 0;
  }

  public processCollision(
    body0Wrap: btCollisionObjectWrapper,
    body1Wrap: btCollisionObjectWrapper,
    _dispatchInfo: btDispatcherInfo,
    resultOut: btManifoldResult
  ): void {
    this.processedCollisions++;
    // Mock implementation - add a contact point to the result
    (resultOut as any).contactPoints = (resultOut as any).contactPoints || [];
    (resultOut as any).contactPoints.push({
      body0: body0Wrap,
      body1: body1Wrap,
      processed: true
    });
  }

  public calculateTimeOfImpact(
    _body0: btCollisionObject,
    _body1: btCollisionObject,
    _dispatchInfo: btDispatcherInfo,
    _resultOut: btManifoldResult
  ): number {
    this.timeOfImpactCalculations++;
    // Mock implementation - return a fixed time of impact
    return 0.5;
  }

  public getAllContactManifolds(manifoldArray: btManifoldArray): void {
    this.manifoldRequests++;
    // Mock implementation - add some test manifolds
    manifoldArray.push(new MockPersistentManifold(1));
    manifoldArray.push(new MockPersistentManifold(2));
  }
}

describe('btCollisionAlgorithmConstructionInfo', () => {
  test('default constructor should initialize with null values', () => {
    const ci = new btCollisionAlgorithmConstructionInfo();

    expect(ci.m_dispatcher1).toBe(null);
    expect(ci.m_manifold).toBe(null);
  });

  test('constructor with dispatcher should initialize correctly', () => {
    const dispatcher = new MockDispatcher();
    const ci = new btCollisionAlgorithmConstructionInfo(dispatcher, 42);

    expect(ci.m_dispatcher1).toBe(dispatcher);
    expect(ci.m_manifold).toBe(null);
    // temp parameter should be ignored (as in original C++)
  });

  test('constructor with only dispatcher should work', () => {
    const dispatcher = new MockDispatcher();
    const ci = new btCollisionAlgorithmConstructionInfo(dispatcher);

    expect(ci.m_dispatcher1).toBe(dispatcher);
    expect(ci.m_manifold).toBe(null);
  });
});

describe('btCollisionAlgorithm', () => {
  let dispatcher: MockDispatcher;
  let constructionInfo: btCollisionAlgorithmConstructionInfo;
  let collisionObject1: MockCollisionObject;
  let collisionObject2: MockCollisionObject;
  let wrapper1: MockCollisionObjectWrapper;
  let wrapper2: MockCollisionObjectWrapper;
  let dispatchInfo: btDispatcherInfo;
  let manifoldResult: MockManifoldResult;

  beforeEach(() => {
    dispatcher = new MockDispatcher();
    constructionInfo = new btCollisionAlgorithmConstructionInfo(dispatcher);
    collisionObject1 = new MockCollisionObject(1);
    collisionObject2 = new MockCollisionObject(2);
    wrapper1 = new MockCollisionObjectWrapper(collisionObject1);
    wrapper2 = new MockCollisionObjectWrapper(collisionObject2);
    dispatchInfo = new btDispatcherInfo();
    manifoldResult = new MockManifoldResult();
  });

  test('default constructor should initialize with null dispatcher', () => {
    const algorithm = new TestCollisionAlgorithm();
    expect(algorithm.getDispatcher()).toBe(null);
  });

  test('constructor with construction info should set dispatcher', () => {
    const algorithm = new TestCollisionAlgorithm(constructionInfo);
    expect(algorithm.getDispatcher()).toBe(dispatcher);
  });

  test('setDispatcher should update dispatcher', () => {
    const algorithm = new TestCollisionAlgorithm();
    const newDispatcher = new MockDispatcher();

    expect(algorithm.getDispatcher()).toBe(null);
    
    algorithm.setDispatcher(newDispatcher);
    expect(algorithm.getDispatcher()).toBe(newDispatcher);
    
    algorithm.setDispatcher(null);
    expect(algorithm.getDispatcher()).toBe(null);
  });

  test('processCollision should be called and track invocations', () => {
    const algorithm = new TestCollisionAlgorithm(constructionInfo);
    
    expect(algorithm.processedCollisions).toBe(0);
    
    algorithm.processCollision(wrapper1, wrapper2, dispatchInfo, manifoldResult);
    expect(algorithm.processedCollisions).toBe(1);
    
    algorithm.processCollision(wrapper1, wrapper2, dispatchInfo, manifoldResult);
    expect(algorithm.processedCollisions).toBe(2);
  });

  test('processCollision should populate result output', () => {
    const algorithm = new TestCollisionAlgorithm(constructionInfo);
    
    algorithm.processCollision(wrapper1, wrapper2, dispatchInfo, manifoldResult);
    
    expect((manifoldResult as any).contactPoints).toBeDefined();
    expect((manifoldResult as any).contactPoints.length).toBe(1);
    expect((manifoldResult as any).contactPoints[0].body0).toBe(wrapper1);
    expect((manifoldResult as any).contactPoints[0].body1).toBe(wrapper2);
    expect((manifoldResult as any).contactPoints[0].processed).toBe(true);
  });

  test('calculateTimeOfImpact should return numeric value', () => {
    const algorithm = new TestCollisionAlgorithm(constructionInfo);
    
    expect(algorithm.timeOfImpactCalculations).toBe(0);
    
    const timeOfImpact = algorithm.calculateTimeOfImpact(
      collisionObject1,
      collisionObject2,
      dispatchInfo,
      manifoldResult
    );
    
    expect(algorithm.timeOfImpactCalculations).toBe(1);
    expect(typeof timeOfImpact).toBe('number');
    expect(timeOfImpact).toBe(0.5);
  });

  test('calculateTimeOfImpact should track multiple calls', () => {
    const algorithm = new TestCollisionAlgorithm(constructionInfo);
    
    algorithm.calculateTimeOfImpact(collisionObject1, collisionObject2, dispatchInfo, manifoldResult);
    algorithm.calculateTimeOfImpact(collisionObject1, collisionObject2, dispatchInfo, manifoldResult);
    algorithm.calculateTimeOfImpact(collisionObject1, collisionObject2, dispatchInfo, manifoldResult);
    
    expect(algorithm.timeOfImpactCalculations).toBe(3);
  });

  test('getAllContactManifolds should populate manifold array', () => {
    const algorithm = new TestCollisionAlgorithm(constructionInfo);
    const manifoldArray: btManifoldArray = [];
    
    expect(algorithm.manifoldRequests).toBe(0);
    expect(manifoldArray.length).toBe(0);
    
    algorithm.getAllContactManifolds(manifoldArray);
    
    expect(algorithm.manifoldRequests).toBe(1);
    expect(manifoldArray.length).toBe(2);
    expect(manifoldArray[0]).toBeInstanceOf(MockPersistentManifold);
    expect(manifoldArray[1]).toBeInstanceOf(MockPersistentManifold);
    expect((manifoldArray[0] as MockPersistentManifold).id).toBe(1);
    expect((manifoldArray[1] as MockPersistentManifold).id).toBe(2);
  });

  test('getAllContactManifolds should work with pre-populated array', () => {
    const algorithm = new TestCollisionAlgorithm(constructionInfo);
    const existingManifold = new MockPersistentManifold(0);
    const manifoldArray: btManifoldArray = [existingManifold];
    
    algorithm.getAllContactManifolds(manifoldArray);
    
    expect(manifoldArray.length).toBe(3);
    expect(manifoldArray[0]).toBe(existingManifold);
    expect(manifoldArray[1]).toBeInstanceOf(MockPersistentManifold);
    expect(manifoldArray[2]).toBeInstanceOf(MockPersistentManifold);
  });

  test('btManifoldArray type should work as expected', () => {
    const manifoldArray: btManifoldArray = [];
    const manifold1 = new MockPersistentManifold(1);
    const manifold2 = new MockPersistentManifold(2);
    
    manifoldArray.push(manifold1);
    manifoldArray.push(manifold2);
    
    expect(manifoldArray.length).toBe(2);
    expect(manifoldArray[0]).toBe(manifold1);
    expect(manifoldArray[1]).toBe(manifold2);
  });

  test('algorithm should work with different dispatcher instances', () => {
    const algorithm1 = new TestCollisionAlgorithm(constructionInfo);
    const dispatcher2 = new MockDispatcher();
    const ci2 = new btCollisionAlgorithmConstructionInfo(dispatcher2);
    const algorithm2 = new TestCollisionAlgorithm(ci2);
    
    expect(algorithm1.getDispatcher()).toBe(dispatcher);
    expect(algorithm2.getDispatcher()).toBe(dispatcher2);
    
    // Both algorithms should work independently
    algorithm1.processCollision(wrapper1, wrapper2, dispatchInfo, manifoldResult);
    algorithm2.processCollision(wrapper1, wrapper2, dispatchInfo, manifoldResult);
    
    expect(algorithm1.processedCollisions).toBe(1);
    expect(algorithm2.processedCollisions).toBe(1);
  });
});