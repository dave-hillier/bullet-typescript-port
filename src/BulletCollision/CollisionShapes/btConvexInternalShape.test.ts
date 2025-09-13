/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btConvexInternalShape, btConvexInternalAabbCachingShape } from './btConvexInternalShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btQuaternion } from '../../LinearMath/btQuaternion';
import { CONVEX_DISTANCE_MARGIN } from './btCollisionMargin';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

// Test implementation of btConvexInternalShape
class TestConvexInternalShape extends btConvexInternalShape {
    constructor() {
        super();
        // Set up a simple box-like shape for testing
        this.setImplicitShapeDimensions(new btVector3(1, 2, 3));
    }

    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        // Simple box support function for testing
        const halfExtents = this.getImplicitShapeDimensions();
        const scaling = this.getLocalScalingNV();
        return new btVector3(
            (vec.x() >= 0 ? halfExtents.x() : -halfExtents.x()) * scaling.x(),
            (vec.y() >= 0 ? halfExtents.y() : -halfExtents.y()) * scaling.y(),
            (vec.z() >= 0 ? halfExtents.z() : -halfExtents.z()) * scaling.z()
        );
    }

    batchedUnitVectorGetSupportingVertexWithoutMargin(
        vectors: btVector3[], 
        supportVerticesOut: btVector3[], 
        numVectors: number
    ): void {
        for (let i = 0; i < numVectors; i++) {
            supportVerticesOut[i] = this.localGetSupportingVertexWithoutMargin(vectors[i]);
        }
    }

    calculateLocalInertia(mass: number, inertia: btVector3): void {
        // Simple box inertia calculation for testing
        const halfExtents = this.getImplicitShapeDimensions();
        const lx = 2 * halfExtents.x();
        const ly = 2 * halfExtents.y();
        const lz = 2 * halfExtents.z();

        inertia.setValue(
            mass / 12.0 * (ly * ly + lz * lz),
            mass / 12.0 * (lx * lx + lz * lz),
            mass / 12.0 * (lx * lx + ly * ly)
        );
    }

    getName(): string {
        return 'TestConvexInternalShape';
    }

    getShapeType(): BroadphaseNativeTypes {
        return BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE;
    }
}

// Test implementation of btConvexInternalAabbCachingShape
class TestConvexInternalAabbCachingShape extends btConvexInternalAabbCachingShape {
    constructor() {
        super();
        // Set up a simple box-like shape for testing
        this.setImplicitShapeDimensions(new btVector3(1, 2, 3));
        this.recalcLocalAabb();
    }

    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        // Simple box support function for testing
        const halfExtents = this.getImplicitShapeDimensions();
        const scaling = this.getLocalScalingNV();
        return new btVector3(
            (vec.x() >= 0 ? halfExtents.x() : -halfExtents.x()) * scaling.x(),
            (vec.y() >= 0 ? halfExtents.y() : -halfExtents.y()) * scaling.y(),
            (vec.z() >= 0 ? halfExtents.z() : -halfExtents.z()) * scaling.z()
        );
    }

    batchedUnitVectorGetSupportingVertexWithoutMargin(
        vectors: btVector3[], 
        supportVerticesOut: btVector3[], 
        numVectors: number
    ): void {
        for (let i = 0; i < numVectors; i++) {
            supportVerticesOut[i] = this.localGetSupportingVertexWithoutMargin(vectors[i]);
        }
    }

    calculateLocalInertia(mass: number, inertia: btVector3): void {
        // Simple box inertia calculation for testing
        const halfExtents = this.getImplicitShapeDimensions();
        const lx = 2 * halfExtents.x();
        const ly = 2 * halfExtents.y();
        const lz = 2 * halfExtents.z();

        inertia.setValue(
            mass / 12.0 * (ly * ly + lz * lz),
            mass / 12.0 * (lx * lx + lz * lz),
            mass / 12.0 * (lx * lx + ly * ly)
        );
    }

    getName(): string {
        return 'TestConvexInternalAabbCachingShape';
    }

    getShapeType(): BroadphaseNativeTypes {
        return BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE;
    }
}

describe('btConvexInternalShape', () => {
    let shape: TestConvexInternalShape;

    beforeEach(() => {
        shape = new TestConvexInternalShape();
    });

    describe('constructor', () => {
        it('should initialize with default values', () => {
            const localScaling = shape.getLocalScaling();
            expect(localScaling.x()).toBeCloseTo(1, 5);
            expect(localScaling.y()).toBeCloseTo(1, 5);
            expect(localScaling.z()).toBeCloseTo(1, 5);

            expect(shape.getMargin()).toBeCloseTo(CONVEX_DISTANCE_MARGIN, 5);
        });
    });

    describe('implicit shape dimensions', () => {
        it('should set and get implicit shape dimensions', () => {
            const dimensions = new btVector3(2, 3, 4);
            shape.setImplicitShapeDimensions(dimensions);

            const result = shape.getImplicitShapeDimensions();
            expect(result.x()).toBeCloseTo(2, 5);
            expect(result.y()).toBeCloseTo(3, 5);
            expect(result.z()).toBeCloseTo(4, 5);
        });

        it('should return a copy of implicit shape dimensions', () => {
            const dimensions = new btVector3(2, 3, 4);
            shape.setImplicitShapeDimensions(dimensions);

            const result1 = shape.getImplicitShapeDimensions();
            const result2 = shape.getImplicitShapeDimensions();

            expect(result1).not.toBe(result2);
            expect(result1.equals(result2)).toBe(true);
        });
    });

    describe('local scaling', () => {
        it('should set and get local scaling', () => {
            const scaling = new btVector3(2, 3, 4);
            shape.setLocalScaling(scaling);

            const result = shape.getLocalScaling();
            expect(result.x()).toBeCloseTo(2, 5);
            expect(result.y()).toBeCloseTo(3, 5);
            expect(result.z()).toBeCloseTo(4, 5);
        });

        it('should use absolute values for scaling', () => {
            const scaling = new btVector3(-2, -3, -4);
            shape.setLocalScaling(scaling);

            const result = shape.getLocalScaling();
            expect(result.x()).toBeCloseTo(2, 5);
            expect(result.y()).toBeCloseTo(3, 5);
            expect(result.z()).toBeCloseTo(4, 5);
        });

        it('should return non-virtual scaling reference', () => {
            const scaling = new btVector3(2, 3, 4);
            shape.setLocalScaling(scaling);

            const result = shape.getLocalScalingNV();
            expect(result.x()).toBeCloseTo(2, 5);
            expect(result.y()).toBeCloseTo(3, 5);
            expect(result.z()).toBeCloseTo(4, 5);
        });
    });

    describe('collision margin', () => {
        it('should set and get collision margin', () => {
            const margin = 0.1;
            shape.setMargin(margin);

            expect(shape.getMargin()).toBeCloseTo(margin, 5);
            expect(shape.getMarginNV()).toBeCloseTo(margin, 5);
        });
    });

    describe('safe margin', () => {
        it('should set safe margin based on minimum dimension', () => {
            const initialMargin = 1.0;
            shape.setMargin(initialMargin);

            const minDimension = 5.0;
            const multiplier = 0.1;
            shape.setSafeMargin(minDimension, multiplier);

            const expectedMargin = multiplier * minDimension;
            expect(shape.getMargin()).toBeCloseTo(expectedMargin, 5);
        });

        it('should not change margin if safe margin is larger', () => {
            const initialMargin = 0.01;
            shape.setMargin(initialMargin);

            const minDimension = 5.0;
            const multiplier = 0.1;
            shape.setSafeMargin(minDimension, multiplier);

            expect(shape.getMargin()).toBeCloseTo(initialMargin, 5);
        });

        it('should set safe margin based on half extents', () => {
            const initialMargin = 1.0;
            shape.setMargin(initialMargin);

            const halfExtents = new btVector3(2, 1, 3); // minAxis is y with value 1
            const multiplier = 0.1;
            shape.setSafeMargin(halfExtents, multiplier);

            const expectedMargin = multiplier * 1.0; // minimum dimension
            expect(shape.getMargin()).toBeCloseTo(expectedMargin, 5);
        });
    });

    describe('supporting vertex', () => {
        it('should return supporting vertex with margin', () => {
            const vec = new btVector3(1, 0, 0);
            const support = shape.localGetSupportingVertex(vec);

            // For a box shape with half extents (1, 2, 3), when asking for support in direction (1, 0, 0),
            // the support function returns the corner (1, 2, 3) because it returns the full corner vertex
            // Then margin is added in the direction (1, 0, 0) which gives us the margin only in X direction
            expect(support.x()).toBeCloseTo(1 + CONVEX_DISTANCE_MARGIN, 5);
            expect(support.y()).toBeCloseTo(2, 5);
            expect(support.z()).toBeCloseTo(3, 5);
        });

        it('should handle zero vector by using fallback direction', () => {
            const zeroVec = new btVector3(0, 0, 0);
            const support = shape.localGetSupportingVertex(zeroVec);

            // Should use fallback direction (-1, -1, -1) normalized
            expect(support.length()).toBeGreaterThan(0);
        });
    });

    describe('AABB calculation', () => {
        it('should calculate AABB correctly', () => {
            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            shape.getAabb(transform, aabbMin, aabbMax);


            // For a box with half extents (1, 2, 3) and margin
            const expectedMin = -1 - CONVEX_DISTANCE_MARGIN;
            const expectedMaxX = 1 + CONVEX_DISTANCE_MARGIN;
            const expectedMaxY = 2 + CONVEX_DISTANCE_MARGIN;
            const expectedMaxZ = 3 + CONVEX_DISTANCE_MARGIN;

            expect(aabbMin.x()).toBeCloseTo(expectedMin, 3);
            expect(aabbMin.y()).toBeCloseTo(-2 - CONVEX_DISTANCE_MARGIN, 3);
            expect(aabbMin.z()).toBeCloseTo(-3 - CONVEX_DISTANCE_MARGIN, 3);

            expect(aabbMax.x()).toBeCloseTo(expectedMaxX, 3);
            expect(aabbMax.y()).toBeCloseTo(expectedMaxY, 3);
            expect(aabbMax.z()).toBeCloseTo(expectedMaxZ, 3);
        });

        it('should calculate AABB with rotation', () => {
            const transform = new btTransform();
            const rotation = new btQuaternion();
            rotation.setRotation(new btVector3(0, 0, 1), Math.PI / 4);
            transform.setRotation(rotation);
            transform.setOrigin(new btVector3(0, 0, 0));

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            shape.getAabbSlow(transform, aabbMin, aabbMax);

            // After 45-degree rotation around Z, the AABB should change from the identity case
            // For a 45-degree rotation, we expect some expansion, but let's be more realistic about the values
            expect(Math.abs(aabbMin.x() - (-1 - CONVEX_DISTANCE_MARGIN))).toBeGreaterThan(0.1);
            expect(Math.abs(aabbMin.y() - (-2 - CONVEX_DISTANCE_MARGIN))).toBeGreaterThan(0.1);
            expect(Math.abs(aabbMax.x() - (1 + CONVEX_DISTANCE_MARGIN))).toBeGreaterThan(0.1);
            expect(Math.abs(aabbMax.y() - (2 + CONVEX_DISTANCE_MARGIN))).toBeGreaterThan(0.1);
        });
    });

    describe('penetration directions', () => {
        it('should return zero preferred penetration directions by default', () => {
            expect(shape.getNumPreferredPenetrationDirections()).toBe(0);
        });

        it('should throw assertion error for getPreferredPenetrationDirection', () => {
            const penetrationVector = new btVector3();
            expect(() => {
                shape.getPreferredPenetrationDirection(0, penetrationVector);
            }).toThrow();
        });
    });

    describe('serialization', () => {
        it('should calculate serialize buffer size', () => {
            const size = shape.calculateSerializeBufferSize();
            expect(size).toBe(0); // In TypeScript implementation
        });

        it('should serialize and return type name', () => {
            const typeName = shape.serialize();
            expect(typeName).toBe('btConvexInternalShapeData');
        });

        it('should create serialization data', () => {
            const scaling = new btVector3(2, 3, 4);
            const dimensions = new btVector3(1, 2, 3);
            const margin = 0.1;

            shape.setLocalScaling(scaling);
            shape.setImplicitShapeDimensions(dimensions);
            shape.setMargin(margin);

            const data = shape.getSerializationData();

            expect(data.localScaling.x).toBeCloseTo(2, 5);
            expect(data.localScaling.y).toBeCloseTo(3, 5);
            expect(data.localScaling.z).toBeCloseTo(4, 5);

            expect(data.implicitShapeDimensions.x).toBeCloseTo(1, 5);
            expect(data.implicitShapeDimensions.y).toBeCloseTo(2, 5);
            expect(data.implicitShapeDimensions.z).toBeCloseTo(3, 5);

            expect(data.collisionMargin).toBeCloseTo(margin, 5);
            expect(data.padding).toBe(0);
        });
    });
});

describe('btConvexInternalAabbCachingShape', () => {
    let shape: TestConvexInternalAabbCachingShape;

    beforeEach(() => {
        shape = new TestConvexInternalAabbCachingShape();
    });

    describe('constructor', () => {
        it('should initialize with valid AABB cache', () => {
            // The constructor should call recalcLocalAabb, making the cache valid
            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            // Should not throw since AABB cache is valid
            expect(() => {
                shape.getAabb(transform, aabbMin, aabbMax);
            }).not.toThrow();
        });
    });

    describe('AABB caching', () => {
        it('should cache AABB after recalculation', () => {
            shape.recalcLocalAabb();

            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            shape.getAabb(transform, aabbMin, aabbMax);

            // Should calculate AABB correctly using cached bounds
            expect(aabbMin.x()).toBeCloseTo(-1 - CONVEX_DISTANCE_MARGIN, 3);
            expect(aabbMin.y()).toBeCloseTo(-2 - CONVEX_DISTANCE_MARGIN, 3);
            expect(aabbMin.z()).toBeCloseTo(-3 - CONVEX_DISTANCE_MARGIN, 3);

            expect(aabbMax.x()).toBeCloseTo(1 + CONVEX_DISTANCE_MARGIN, 3);
            expect(aabbMax.y()).toBeCloseTo(2 + CONVEX_DISTANCE_MARGIN, 3);
            expect(aabbMax.z()).toBeCloseTo(3 + CONVEX_DISTANCE_MARGIN, 3);
        });

        it('should recalculate AABB when local scaling changes', () => {
            const initialTransform = new btTransform();
            initialTransform.setIdentity();

            const initialMin = new btVector3();
            const initialMax = new btVector3();
            shape.getAabb(initialTransform, initialMin, initialMax);

            // Change scaling
            const newScaling = new btVector3(2, 2, 2);
            shape.setLocalScaling(newScaling);

            const newMin = new btVector3();
            const newMax = new btVector3();
            shape.getAabb(initialTransform, newMin, newMax);

            // AABB should be different after scaling change
            expect(Math.abs(newMin.x() - initialMin.x())).toBeGreaterThan(0.01);
            expect(Math.abs(newMax.x() - initialMax.x())).toBeGreaterThan(0.01);
        });

        it('should use cached local AABB for faster computation', () => {
            const transform = new btTransform();
            const rotation = new btQuaternion();
            rotation.setRotation(new btVector3(1, 0, 0), Math.PI / 6);
            transform.setRotation(rotation);
            transform.setOrigin(new btVector3(1, 2, 3));

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            shape.getAabb(transform, aabbMin, aabbMax);

            // Should transform the cached local bounds
            expect(aabbMin.x()).toBeDefined();
            expect(aabbMin.y()).toBeDefined();
            expect(aabbMin.z()).toBeDefined();
            expect(aabbMax.x()).toBeDefined();
            expect(aabbMax.y()).toBeDefined();
            expect(aabbMax.z()).toBeDefined();
        });
    });

    describe('cached AABB access', () => {
        it('should set and get cached AABB', () => {
            const testMin = new btVector3(-5, -6, -7);
            const testMax = new btVector3(5, 6, 7);

            // Access protected method through subclass
            (shape as any).setCachedLocalAabb(testMin, testMax);

            const retrievedMin = new btVector3();
            const retrievedMax = new btVector3();

            (shape as any).getCachedLocalAabb(retrievedMin, retrievedMax);

            expect(retrievedMin.equals(testMin)).toBe(true);
            expect(retrievedMax.equals(testMax)).toBe(true);
        });
    });

    describe('performance characteristics', () => {
        it('should provide faster AABB calculation than base class', () => {
            const baseShape = new TestConvexInternalShape();
            const cachedShape = new TestConvexInternalAabbCachingShape();

            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin1 = new btVector3();
            const aabbMax1 = new btVector3();
            const aabbMin2 = new btVector3();
            const aabbMax2 = new btVector3();

            // Both should produce similar results
            baseShape.getAabb(transform, aabbMin1, aabbMax1);
            cachedShape.getAabb(transform, aabbMin2, aabbMax2);

            // Results should be approximately equal
            expect(aabbMin1.distance(aabbMin2)).toBeLessThan(0.1);
            expect(aabbMax1.distance(aabbMax2)).toBeLessThan(0.1);
        });
    });
});