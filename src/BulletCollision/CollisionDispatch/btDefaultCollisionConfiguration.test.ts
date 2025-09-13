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
    btDefaultCollisionConfiguration,
    createDefaultCollisionConstructionInfo
} from './btDefaultCollisionConfiguration';
import { btDefaultPoolAllocator } from './btCollisionConfiguration';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

describe('btDefaultCollisionConfiguration', () => {
    let configuration: btDefaultCollisionConfiguration;

    beforeEach(() => {
        configuration = new btDefaultCollisionConfiguration();
    });

    describe('Construction', () => {
        test('should construct with default construction info', () => {
            expect(configuration).toBeDefined();
            expect(configuration.getPersistentManifoldPool()).toBeDefined();
            expect(configuration.getCollisionAlgorithmPool()).toBeDefined();
        });

        test('should create default construction info', () => {
            const constructionInfo = createDefaultCollisionConstructionInfo();
            
            expect(constructionInfo.m_persistentManifoldPool).toBeUndefined();
            expect(constructionInfo.m_collisionAlgorithmPool).toBeUndefined();
            expect(constructionInfo.m_defaultMaxPersistentManifoldPoolSize).toBe(4096);
            expect(constructionInfo.m_defaultMaxCollisionAlgorithmPoolSize).toBe(4096);
            expect(constructionInfo.m_customCollisionAlgorithmMaxElementSize).toBe(0);
            expect(constructionInfo.m_useEpaPenetrationAlgorithm).toBe(true);
        });

        test('should construct with custom construction info', () => {
            const constructionInfo = createDefaultCollisionConstructionInfo();
            constructionInfo.m_defaultMaxPersistentManifoldPoolSize = 2048;
            constructionInfo.m_defaultMaxCollisionAlgorithmPoolSize = 2048;
            constructionInfo.m_useEpaPenetrationAlgorithm = false;
            
            const customConfig = new btDefaultCollisionConfiguration(constructionInfo);
            
            expect(customConfig.getPersistentManifoldPool()).toBeDefined();
            expect(customConfig.getCollisionAlgorithmPool()).toBeDefined();
        });

        test('should use provided pools when specified', () => {
            const constructionInfo = createDefaultCollisionConstructionInfo();
            const customManifoldPool = new btDefaultPoolAllocator(1024, 16);
            const customAlgorithmPool = new btDefaultPoolAllocator(1024, 32);
            
            constructionInfo.m_persistentManifoldPool = customManifoldPool;
            constructionInfo.m_collisionAlgorithmPool = customAlgorithmPool;
            
            const customConfig = new btDefaultCollisionConfiguration(constructionInfo);
            
            expect(customConfig.getPersistentManifoldPool()).toBe(customManifoldPool);
            expect(customConfig.getCollisionAlgorithmPool()).toBe(customAlgorithmPool);
        });
    });

    describe('Pool Allocators', () => {
        test('should provide persistent manifold pool', () => {
            const pool = configuration.getPersistentManifoldPool();
            
            expect(pool).toBeDefined();
            expect(pool.getMaxCount()).toBe(4096); // Default size
            expect(pool.getFreeCount()).toBeGreaterThanOrEqual(0);
            expect(pool.getUsedCount()).toBeGreaterThanOrEqual(0);
        });

        test('should provide collision algorithm pool', () => {
            const pool = configuration.getCollisionAlgorithmPool();
            
            expect(pool).toBeDefined();
            expect(pool.getMaxCount()).toBe(4096); // Default size
            expect(pool.getFreeCount()).toBeGreaterThanOrEqual(0);
            expect(pool.getUsedCount()).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Collision Algorithm Creation Functions', () => {
        test('should provide sphere-sphere collision algorithm', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
            expect(createFunc.swapped).toBe(false);
        });

        test('should provide sphere-box collision algorithm', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
            expect(createFunc.swapped).toBe(false);
        });

        test('should provide box-sphere collision algorithm (swapped)', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
            expect(createFunc.swapped).toBe(true);
        });

        test('should provide box-box collision algorithm', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
            expect(createFunc.swapped).toBe(false);
        });

        test('should provide compound-compound collision algorithm', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
        });

        test('should provide compound collision algorithm for compound vs non-compound', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
        });

        test('should provide swapped compound collision algorithm for non-compound vs compound', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
        });

        test('should provide convex-concave collision algorithm', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE, // Convex
                BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE // Concave
            );
            
            expect(createFunc).toBeDefined();
        });

        test('should provide swapped convex-concave collision algorithm', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE, // Concave
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE // Convex
            );
            
            expect(createFunc).toBeDefined();
        });

        test('should provide fallback collision algorithm for unknown types', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                999, // Unknown type
                999  // Unknown type
            );
            
            expect(createFunc).toBeDefined();
        });
    });

    describe('Closest Points Algorithm Creation Functions', () => {
        test('should provide closest points algorithm function', () => {
            const createFunc = configuration.getClosestPointsAlgorithmCreateFunc(
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
        });

        test('should use same dispatch as collision detection for closest points', () => {
            const collisionFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE
            );
            
            const closestPointsFunc = configuration.getClosestPointsAlgorithmCreateFunc(
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE
            );
            
            expect(closestPointsFunc).toBe(collisionFunc);
        });
    });

    describe('Shape Type Classification', () => {
        test('should classify shape types correctly for convex shapes', () => {
            // Test that our classification logic works by testing known convex types
            const sphereFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE
            );
            
            const boxFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE
            );
            
            expect(sphereFunc).toBeDefined();
            expect(boxFunc).toBeDefined();
        });

        test('should classify shape types correctly for concave shapes', () => {
            // Test triangle mesh (concave) vs sphere (convex)
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
        });

        test('should classify compound shapes correctly', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE,
                BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE
            );
            
            expect(createFunc).toBeDefined();
        });
    });

    describe('Multipoint Configuration', () => {
        test('should set convex-convex multipoint iterations', () => {
            const spy = jest.spyOn(console, 'log').mockImplementation();
            
            configuration.setConvexConvexMultipointIterations(5, 4);
            
            expect(spy).toHaveBeenCalledWith('Setting convex-convex multipoint iterations: 5, threshold: 4');
            spy.mockRestore();
        });

        test('should set convex-convex multipoint iterations with defaults', () => {
            const spy = jest.spyOn(console, 'log').mockImplementation();
            
            configuration.setConvexConvexMultipointIterations();
            
            expect(spy).toHaveBeenCalledWith('Setting convex-convex multipoint iterations: 3, threshold: 3');
            spy.mockRestore();
        });

        test('should set plane-convex multipoint iterations', () => {
            const spy = jest.spyOn(console, 'log').mockImplementation();
            
            configuration.setPlaneConvexMultipointIterations(4, 2);
            
            expect(spy).toHaveBeenCalledWith('Setting plane-convex multipoint iterations: 4, threshold: 2');
            spy.mockRestore();
        });

        test('should set plane-convex multipoint iterations with defaults', () => {
            const spy = jest.spyOn(console, 'log').mockImplementation();
            
            configuration.setPlaneConvexMultipointIterations();
            
            expect(spy).toHaveBeenCalledWith('Setting plane-convex multipoint iterations: 3, threshold: 3');
            spy.mockRestore();
        });
    });

    describe('Edge Cases', () => {
        test('should handle invalid shape type combinations', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(-1, -1);
            expect(createFunc).toBeDefined();
        });

        test('should handle mixed valid/invalid shape types', () => {
            const createFunc = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE,
                -1
            );
            expect(createFunc).toBeDefined();
        });

        test('should handle boundary shape type values', () => {
            // Test with values around the concave shapes boundary
            const createFunc1 = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE - 1,
                BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE + 1
            );
            
            const createFunc2 = configuration.getCollisionAlgorithmCreateFunc(
                BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE + 1,
                BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE - 1
            );
            
            expect(createFunc1).toBeDefined();
            expect(createFunc2).toBeDefined();
        });
    });

    describe('Memory Management', () => {
        test('should properly manage pool allocator lifecycle', () => {
            // Test that pools are accessible and functional
            const manifoldPool = configuration.getPersistentManifoldPool();
            const algorithmPool = configuration.getCollisionAlgorithmPool();
            
            expect(manifoldPool.getMaxCount()).toBeGreaterThan(0);
            expect(algorithmPool.getMaxCount()).toBeGreaterThan(0);
            
            // Test basic allocation/deallocation
            const ptr = manifoldPool.allocate(16);
            expect(manifoldPool.validPtr(ptr)).toBe(true);
            
            manifoldPool.freeMemory(ptr);
            // After freeing, we should have one more free slot
        });

        test('should use custom pools when provided', () => {
            const customManifoldPool = new btDefaultPoolAllocator(100, 16);
            const customAlgorithmPool = new btDefaultPoolAllocator(200, 32);
            
            const constructionInfo = createDefaultCollisionConstructionInfo();
            constructionInfo.m_persistentManifoldPool = customManifoldPool;
            constructionInfo.m_collisionAlgorithmPool = customAlgorithmPool;
            
            const customConfig = new btDefaultCollisionConfiguration(constructionInfo);
            
            expect(customConfig.getPersistentManifoldPool()).toBe(customManifoldPool);
            expect(customConfig.getCollisionAlgorithmPool()).toBe(customAlgorithmPool);
            expect(customConfig.getPersistentManifoldPool().getMaxCount()).toBe(100);
            expect(customConfig.getCollisionAlgorithmPool().getMaxCount()).toBe(200);
        });
    });
});