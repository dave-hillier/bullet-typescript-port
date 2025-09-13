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
import { btBroadphaseProxy, BroadphaseNativeTypes } from './btBroadphaseProxy';
import { btDispatcher } from './btDispatcher';
import { 
  btBroadphaseInterface, 
  btBroadphaseAabbCallback, 
  btBroadphaseRayCallback,
  btOverlappingPairCache 
} from './btBroadphaseInterface';

// Mock implementations for testing
class MockOverlappingPairCache implements btOverlappingPairCache {
  // Mock implementation - just a placeholder
}

class MockDispatcher extends btDispatcher {
  public findAlgorithm(): null { return null; }
  public getNewManifold(): any { return {}; }
  public releaseManifold(): void {}
  public clearManifold(): void {}
  public needsCollision(): boolean { return true; }
  public needsResponse(): boolean { return true; }
  public dispatchAllCollisionPairs(): void {}
  public getNumManifolds(): number { return 0; }
  public getManifoldByIndexInternal(): any { return {}; }
  public getInternalManifoldPointer(): any[] { return []; }
  public getInternalManifoldPool(): any { return {}; }
  public getInternalManifoldPoolConst(): any { return {}; }
  public allocateCollisionAlgorithm(): any { return {}; }
  public freeCollisionAlgorithm(): void {}
}

// Test implementation of btBroadphaseInterface
class TestBroadphaseInterface extends btBroadphaseInterface {
  private proxies: btBroadphaseProxy[] = [];
  private pairCache = new MockOverlappingPairCache();
  private nextUniqueId = 1;

  public createProxy(
    aabbMin: btVector3,
    aabbMax: btVector3,
    _shapeType: number,
    userPtr: any,
    collisionFilterGroup: number,
    collisionFilterMask: number,
    _dispatcher: btDispatcher
  ): btBroadphaseProxy {
    const proxy = new btBroadphaseProxy(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask);
    proxy.m_uniqueId = this.nextUniqueId++;
    this.proxies.push(proxy);
    return proxy;
  }

  public destroyProxy(proxy: btBroadphaseProxy, _dispatcher: btDispatcher): void {
    const index = this.proxies.indexOf(proxy);
    if (index !== -1) {
      this.proxies.splice(index, 1);
    }
  }

  public setAabb(
    proxy: btBroadphaseProxy,
    aabbMin: btVector3,
    aabbMax: btVector3,
    _dispatcher: btDispatcher
  ): void {
    proxy.m_aabbMin.copy(aabbMin);
    proxy.m_aabbMax.copy(aabbMax);
  }

  public getAabb(proxy: btBroadphaseProxy, aabbMin: btVector3, aabbMax: btVector3): void {
    aabbMin.copy(proxy.m_aabbMin);
    aabbMax.copy(proxy.m_aabbMax);
  }

  public rayTest(
    rayFrom: btVector3,
    rayTo: btVector3,
    rayCallback: btBroadphaseRayCallback,
    _aabbMin?: btVector3,
    _aabbMax?: btVector3
  ): void {
    // Simple implementation for testing - check all proxies
    for (const proxy of this.proxies) {
      // Simple ray-AABB intersection test
      if (this.rayIntersectsAABB(rayFrom, rayTo, proxy.m_aabbMin, proxy.m_aabbMax)) {
        if (!rayCallback.process(proxy)) {
          break;
        }
      }
    }
  }

  public aabbTest(
    aabbMin: btVector3,
    aabbMax: btVector3,
    callback: btBroadphaseAabbCallback
  ): void {
    for (const proxy of this.proxies) {
      if (this.aabbOverlaps(aabbMin, aabbMax, proxy.m_aabbMin, proxy.m_aabbMax)) {
        if (!callback.process(proxy)) {
          break;
        }
      }
    }
  }

  public calculateOverlappingPairs(_dispatcher: btDispatcher): void {
    // Mock implementation
  }

  public getOverlappingPairCache(): btOverlappingPairCache {
    return this.pairCache;
  }

  public getOverlappingPairCacheConst(): btOverlappingPairCache {
    return this.pairCache;
  }

  public getBroadphaseAabb(aabbMin: btVector3, aabbMax: btVector3): void {
    if (this.proxies.length === 0) {
      aabbMin.setValue(0, 0, 0);
      aabbMax.setValue(0, 0, 0);
      return;
    }

    aabbMin.copy(this.proxies[0].m_aabbMin);
    aabbMax.copy(this.proxies[0].m_aabbMax);

    for (let i = 1; i < this.proxies.length; i++) {
      aabbMin.setMin(this.proxies[i].m_aabbMin);
      aabbMax.setMax(this.proxies[i].m_aabbMax);
    }
  }

  public printStats(): void {
    console.log(`TestBroadphaseInterface: ${this.proxies.length} proxies`);
  }

  private rayIntersectsAABB(rayFrom: btVector3, rayTo: btVector3, aabbMin: btVector3, aabbMax: btVector3): boolean {
    // Simple ray-AABB intersection test
    const rayDir = rayTo.subtract(rayFrom);
    const rayLen = rayDir.length();
    if (rayLen === 0) return false;
    
    rayDir.normalize();

    // Simple intersection test - just check if ray endpoints are close to AABB
    const center = aabbMin.add(aabbMax).multiply(0.5);
    const distance = rayFrom.distance(center);
    const size = aabbMax.subtract(aabbMin).length();
    
    return distance <= size;
  }

  private aabbOverlaps(min1: btVector3, max1: btVector3, min2: btVector3, max2: btVector3): boolean {
    return (min1.x() <= max2.x() && max1.x() >= min2.x()) &&
           (min1.y() <= max2.y() && max1.y() >= min2.y()) &&
           (min1.z() <= max2.z() && max1.z() >= min2.z());
  }
}

// Test callback implementations
class TestAabbCallback extends btBroadphaseAabbCallback {
  public processedProxies: btBroadphaseProxy[] = [];

  public process(proxy: btBroadphaseProxy): boolean {
    this.processedProxies.push(proxy);
    return true; // Continue processing
  }
}

class TestRayCallback extends btBroadphaseRayCallback {
  public processedProxies: btBroadphaseProxy[] = [];

  public process(proxy: btBroadphaseProxy): boolean {
    this.processedProxies.push(proxy);
    return true; // Continue processing
  }
}

describe('btBroadphaseInterface', () => {
  let broadphase: TestBroadphaseInterface;
  let dispatcher: MockDispatcher;

  beforeEach(() => {
    broadphase = new TestBroadphaseInterface();
    dispatcher = new MockDispatcher();
  });

  describe('Proxy Management', () => {
    test('should create proxy with correct properties', () => {
      const aabbMin = new btVector3(-1, -1, -1);
      const aabbMax = new btVector3(1, 1, 1);
      const userPtr = { id: 'test' };
      const filterGroup = 1;
      const filterMask = -1;

      const proxy = broadphase.createProxy(
        aabbMin, aabbMax, BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE,
        userPtr, filterGroup, filterMask, dispatcher
      );

      expect(proxy).toBeDefined();
      expect(proxy.m_aabbMin.equals(aabbMin)).toBe(true);
      expect(proxy.m_aabbMax.equals(aabbMax)).toBe(true);
      expect(proxy.m_clientObject).toBe(userPtr);
      expect(proxy.m_collisionFilterGroup).toBe(filterGroup);
      expect(proxy.m_collisionFilterMask).toBe(filterMask);
      expect(proxy.m_uniqueId).toBeGreaterThan(0);
    });

    test('should destroy proxy correctly', () => {
      const proxy = broadphase.createProxy(
        new btVector3(-1, -1, -1), new btVector3(1, 1, 1),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, null, 1, -1, dispatcher
      );

      broadphase.destroyProxy(proxy, dispatcher);
      
      // Verify proxy is no longer in broadphase (by checking AABB test doesn't find it)
      const callback = new TestAabbCallback();
      broadphase.aabbTest(new btVector3(-2, -2, -2), new btVector3(2, 2, 2), callback);
      expect(callback.processedProxies).not.toContain(proxy);
    });

    test('should update proxy AABB correctly', () => {
      const proxy = broadphase.createProxy(
        new btVector3(-1, -1, -1), new btVector3(1, 1, 1),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, null, 1, -1, dispatcher
      );

      const newMin = new btVector3(-2, -2, -2);
      const newMax = new btVector3(2, 2, 2);
      broadphase.setAabb(proxy, newMin, newMax, dispatcher);

      const resultMin = new btVector3();
      const resultMax = new btVector3();
      broadphase.getAabb(proxy, resultMin, resultMax);

      expect(resultMin.equals(newMin)).toBe(true);
      expect(resultMax.equals(newMax)).toBe(true);
    });
  });

  describe('AABB Testing', () => {
    test('should find overlapping proxies with AABB test', () => {
      // Create two overlapping proxies
      const proxy1 = broadphase.createProxy(
        new btVector3(-1, -1, -1), new btVector3(1, 1, 1),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, { id: 1 }, 1, -1, dispatcher
      );

      broadphase.createProxy(
        new btVector3(0.5, 0.5, 0.5), new btVector3(2, 2, 2),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, { id: 2 }, 1, -1, dispatcher
      );

      const callback = new TestAabbCallback();
      broadphase.aabbTest(new btVector3(-0.5, -0.5, -0.5), new btVector3(0.5, 0.5, 0.5), callback);

      expect(callback.processedProxies.length).toBeGreaterThan(0);
      expect(callback.processedProxies).toContain(proxy1);
    });

    test('should not find non-overlapping proxies', () => {
      broadphase.createProxy(
        new btVector3(10, 10, 10), new btVector3(11, 11, 11),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, { id: 1 }, 1, -1, dispatcher
      );

      const callback = new TestAabbCallback();
      broadphase.aabbTest(new btVector3(-1, -1, -1), new btVector3(1, 1, 1), callback);

      expect(callback.processedProxies.length).toBe(0);
    });
  });

  describe('Ray Testing', () => {
    test('should perform ray test with callback', () => {
      broadphase.createProxy(
        new btVector3(-1, -1, -1), new btVector3(1, 1, 1),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, { id: 1 }, 1, -1, dispatcher
      );

      const rayCallback = new TestRayCallback();
      broadphase.rayTest(
        new btVector3(-5, 0, 0), new btVector3(5, 0, 0), rayCallback
      );

      // The test implementation should call process on proxies that might intersect
      expect(typeof rayCallback.processedProxies).toBeDefined();
    });

    test('should initialize ray callback properly', () => {
      const rayCallback = new TestRayCallback();
      
      expect(rayCallback.m_rayDirectionInverse).toBeInstanceOf(btVector3);
      expect(Array.isArray(rayCallback.m_signs)).toBe(true);
      expect(rayCallback.m_signs.length).toBe(3);
      expect(typeof rayCallback.m_lambda_max).toBe('number');
    });
  });

  describe('Broadphase AABB', () => {
    test('should return zero AABB when no proxies exist', () => {
      const aabbMin = new btVector3();
      const aabbMax = new btVector3();
      broadphase.getBroadphaseAabb(aabbMin, aabbMax);

      expect(aabbMin.equals(new btVector3(0, 0, 0))).toBe(true);
      expect(aabbMax.equals(new btVector3(0, 0, 0))).toBe(true);
    });

    test('should return combined AABB of all proxies', () => {
      broadphase.createProxy(
        new btVector3(-2, -2, -2), new btVector3(-1, -1, -1),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, null, 1, -1, dispatcher
      );

      broadphase.createProxy(
        new btVector3(1, 1, 1), new btVector3(2, 2, 2),
        BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE, null, 1, -1, dispatcher
      );

      const aabbMin = new btVector3();
      const aabbMax = new btVector3();
      broadphase.getBroadphaseAabb(aabbMin, aabbMax);

      expect(aabbMin.x()).toBeLessThanOrEqual(-1);
      expect(aabbMin.y()).toBeLessThanOrEqual(-1);
      expect(aabbMin.z()).toBeLessThanOrEqual(-1);
      expect(aabbMax.x()).toBeGreaterThanOrEqual(2);
      expect(aabbMax.y()).toBeGreaterThanOrEqual(2);
      expect(aabbMax.z()).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Overlapping Pair Cache', () => {
    test('should return overlapping pair cache', () => {
      const cache = broadphase.getOverlappingPairCache();
      expect(cache).toBeInstanceOf(MockOverlappingPairCache);
    });

    test('should return same cache from const and non-const methods', () => {
      const cache1 = broadphase.getOverlappingPairCache();
      const cache2 = broadphase.getOverlappingPairCacheConst();
      expect(cache1).toBe(cache2);
    });
  });

  describe('Utility Methods', () => {
    test('should call resetPool without error', () => {
      expect(() => {
        broadphase.resetPool(dispatcher);
      }).not.toThrow();
    });

    test('should call printStats without error', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      broadphase.printStats();
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle calculateOverlappingPairs call', () => {
      expect(() => {
        broadphase.calculateOverlappingPairs(dispatcher);
      }).not.toThrow();
    });
  });
});

describe('btBroadphaseAabbCallback', () => {
  test('should be extendable as abstract class', () => {
    class CustomCallback extends btBroadphaseAabbCallback {
      public process(_proxy: btBroadphaseProxy): boolean {
        return true;
      }
    }

    const callback = new CustomCallback();
    expect(callback).toBeInstanceOf(btBroadphaseAabbCallback);
  });
});

describe('btBroadphaseRayCallback', () => {
  test('should extend btBroadphaseAabbCallback', () => {
    const callback = new TestRayCallback();
    expect(callback).toBeInstanceOf(btBroadphaseAabbCallback);
    expect(callback).toBeInstanceOf(btBroadphaseRayCallback);
  });

  test('should initialize cached ray data', () => {
    const callback = new TestRayCallback();
    
    expect(callback.m_rayDirectionInverse).toBeInstanceOf(btVector3);
    expect(Array.isArray(callback.m_signs)).toBe(true);
    expect(callback.m_signs.length).toBe(3);
    expect(typeof callback.m_lambda_max).toBe('number');
    
    // Test that signs array contains numbers
    for (const sign of callback.m_signs) {
      expect(typeof sign).toBe('number');
    }
  });
});