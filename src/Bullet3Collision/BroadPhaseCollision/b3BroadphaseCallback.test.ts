/**
 * Test suite for b3BroadphaseCallback
 */

import { 
    b3BroadphaseAabbCallback, 
    b3BroadphaseRayCallback, 
    b3BroadphaseProxy,
    CollisionFilterGroups 
} from './b3BroadphaseCallback';
import { b3Vector3 } from '../../Bullet3Common/b3Vector3';

describe('b3BroadphaseCallback', () => {
    // Mock implementation of b3BroadphaseProxy for testing
    class MockBroadphaseProxy implements b3BroadphaseProxy {
        constructor(
            public readonly clientObject: any,
            public readonly collisionFilterGroup: number,
            public readonly collisionFilterMask: number,
            public readonly uniqueId: number,
            public readonly aabbMin: b3Vector3,
            public readonly aabbMax: b3Vector3
        ) {}

        getUid(): number {
            return this.uniqueId;
        }
    }

    // Test implementation of AABB callback
    class TestAabbCallback extends b3BroadphaseAabbCallback {
        public processedProxies: b3BroadphaseProxy[] = [];

        process(proxy: b3BroadphaseProxy): boolean {
            this.processedProxies.push(proxy);
            return true; // Continue processing
        }
    }

    // Test implementation of Ray callback
    class TestRayCallback extends b3BroadphaseRayCallback {
        public processedProxies: b3BroadphaseProxy[] = [];

        process(proxy: b3BroadphaseProxy): boolean {
            this.processedProxies.push(proxy);
            return true; // Continue processing
        }
    }

    describe('CollisionFilterGroups', () => {
        it('should have correct enum values', () => {
            expect(CollisionFilterGroups.DefaultFilter).toBe(1);
            expect(CollisionFilterGroups.StaticFilter).toBe(2);
            expect(CollisionFilterGroups.KinematicFilter).toBe(4);
            expect(CollisionFilterGroups.DebrisFilter).toBe(8);
            expect(CollisionFilterGroups.SensorTrigger).toBe(16);
            expect(CollisionFilterGroups.CharacterFilter).toBe(32);
            expect(CollisionFilterGroups.AllFilter).toBe(-1);
        });
    });

    describe('b3BroadphaseProxy', () => {
        it('should create a mock proxy correctly', () => {
            const aabbMin = new b3Vector3(-1, -1, -1);
            const aabbMax = new b3Vector3(1, 1, 1);
            const proxy = new MockBroadphaseProxy(
                "test-object",
                CollisionFilterGroups.DefaultFilter,
                CollisionFilterGroups.AllFilter,
                42,
                aabbMin,
                aabbMax
            );

            expect(proxy.clientObject).toBe("test-object");
            expect(proxy.collisionFilterGroup).toBe(CollisionFilterGroups.DefaultFilter);
            expect(proxy.collisionFilterMask).toBe(CollisionFilterGroups.AllFilter);
            expect(proxy.uniqueId).toBe(42);
            expect(proxy.getUid()).toBe(42);
            expect(proxy.aabbMin).toBe(aabbMin);
            expect(proxy.aabbMax).toBe(aabbMax);
        });
    });

    describe('b3BroadphaseAabbCallback', () => {
        it('should process proxies correctly', () => {
            const callback = new TestAabbCallback();
            const proxy = new MockBroadphaseProxy(
                "test",
                CollisionFilterGroups.DefaultFilter,
                CollisionFilterGroups.AllFilter,
                1,
                new b3Vector3(-1, -1, -1),
                new b3Vector3(1, 1, 1)
            );

            const result = callback.process(proxy);

            expect(result).toBe(true);
            expect(callback.processedProxies).toHaveLength(1);
            expect(callback.processedProxies[0]).toBe(proxy);
        });
    });

    describe('b3BroadphaseRayCallback', () => {
        it('should initialize ray data correctly', () => {
            const rayFrom = new b3Vector3(0, 0, 0);
            const rayTo = new b3Vector3(10, 5, 2);
            const callback = new TestRayCallback(rayFrom, rayTo);

            // Check ray direction inverse is calculated
            expect(callback.rayDirectionInverse.x).toBeCloseTo(1.0 / 10.0, 5);
            expect(callback.rayDirectionInverse.y).toBeCloseTo(1.0 / 5.0, 5);
            expect(callback.rayDirectionInverse.z).toBeCloseTo(1.0 / 2.0, 5);

            // Check signs are calculated (all positive direction)
            expect(callback.signs[0]).toBe(0);
            expect(callback.signs[1]).toBe(0);
            expect(callback.signs[2]).toBe(0);

            // Check lambda max is the ray length
            const expectedLength = Math.sqrt(10*10 + 5*5 + 2*2);
            expect(callback.lambdaMax).toBeCloseTo(expectedLength, 5);
        });

        it('should handle negative ray directions correctly', () => {
            const rayFrom = new b3Vector3(5, 3, 1);
            const rayTo = new b3Vector3(-2, -1, -2);
            const callback = new TestRayCallback(rayFrom, rayTo);

            // Ray direction is (-7, -4, -3), so inverses should be negative
            expect(callback.rayDirectionInverse.x).toBeCloseTo(-1.0 / 7.0, 5);
            expect(callback.rayDirectionInverse.y).toBeCloseTo(-1.0 / 4.0, 5);
            expect(callback.rayDirectionInverse.z).toBeCloseTo(-1.0 / 3.0, 5);

            // Check signs are calculated (all negative direction)
            expect(callback.signs[0]).toBe(1);
            expect(callback.signs[1]).toBe(1);
            expect(callback.signs[2]).toBe(1);
        });

        it('should handle zero ray direction components', () => {
            const rayFrom = new b3Vector3(0, 0, 0);
            const rayTo = new b3Vector3(0, 5, 0);
            const callback = new TestRayCallback(rayFrom, rayTo);

            // Check that zero components get large inverse values
            expect(Math.abs(callback.rayDirectionInverse.x)).toBeGreaterThan(1e20);
            expect(callback.rayDirectionInverse.y).toBeCloseTo(1.0 / 5.0, 5);
            expect(Math.abs(callback.rayDirectionInverse.z)).toBeGreaterThan(1e20);

            // Signs should be 0 for zero and positive components
            expect(callback.signs[0]).toBe(0);
            expect(callback.signs[1]).toBe(0);
            expect(callback.signs[2]).toBe(0);
        });

        it('should process proxies correctly', () => {
            const rayFrom = new b3Vector3(0, 0, 0);
            const rayTo = new b3Vector3(1, 1, 1);
            const callback = new TestRayCallback(rayFrom, rayTo);
            const proxy = new MockBroadphaseProxy(
                "test",
                CollisionFilterGroups.DefaultFilter,
                CollisionFilterGroups.AllFilter,
                1,
                new b3Vector3(-1, -1, -1),
                new b3Vector3(1, 1, 1)
            );

            const result = callback.process(proxy);

            expect(result).toBe(true);
            expect(callback.processedProxies).toHaveLength(1);
            expect(callback.processedProxies[0]).toBe(proxy);
        });
    });
});