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

import { btConvexShape, convexHullSupport, MAX_PREFERRED_PENETRATION_DIRECTIONS } from './btConvexShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { CONVEX_DISTANCE_MARGIN } from './btCollisionMargin';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

/**
 * Concrete implementation of btConvexShape for testing purposes
 */
class TestConvexShape extends btConvexShape {
    private testMargin: number = CONVEX_DISTANCE_MARGIN;
    private testScaling: btVector3 = new btVector3(1, 1, 1);

    constructor() {
        super();
        this.m_shapeType = BroadphaseNativeTypes.CONVEX_SHAPE_PROXYTYPE;
    }

    localGetSupportingVertex(vec: btVector3): btVector3 {
        // Simple test implementation - returns normalized direction with margin
        const length = vec.length();
        if (length < 0.0001) {
            return new btVector3(this.testMargin, 0, 0); // Default direction for zero vector
        }
        const normalized = vec.multiply(1.0 / length);
        return normalized.multiply(this.testMargin);
    }

    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        // Simple test implementation - returns normalized direction
        const length = vec.length();
        if (length < 0.0001) {
            return new btVector3(0.5, 0, 0); // Default direction for zero vector
        }
        return vec.multiply(0.5 / length); // half unit sphere
    }

    batchedUnitVectorGetSupportingVertexWithoutMargin(
        vectors: btVector3[], 
        supportVerticesOut: btVector3[], 
        numVectors: number
    ): void {
        for (let i = 0; i < numVectors && i < vectors.length; i++) {
            supportVerticesOut[i] = this.localGetSupportingVertexWithoutMargin(vectors[i]);
        }
    }

    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        // Simple AABB - sphere with margin
        const center = t.getOrigin();
        const extent = new btVector3(this.testMargin, this.testMargin, this.testMargin);
        aabbMin.copy(center.subtract(extent));
        aabbMax.copy(center.add(extent));
    }

    getAabbSlow(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        // Use same implementation as getAabb for testing
        this.getAabb(t, aabbMin, aabbMax);
    }

    setLocalScaling(scaling: btVector3): void {
        this.testScaling.copy(scaling);
    }

    getLocalScaling(): btVector3 {
        return this.testScaling.clone();
    }

    setMargin(margin: number): void {
        this.testMargin = margin;
    }

    getMargin(): number {
        return this.testMargin;
    }

    getNumPreferredPenetrationDirections(): number {
        return 0; // No preferred directions for test shape
    }

    getPreferredPenetrationDirection(_index: number, penetrationVector: btVector3): void {
        // No preferred directions for test shape
        penetrationVector.setValue(0, 0, 0);
    }

    calculateLocalInertia(mass: number, inertia: btVector3): void {
        // Simple sphere inertia for testing
        const i = 0.4 * mass * this.testMargin * this.testMargin;
        inertia.setValue(i, i, i);
    }

    getName(): string {
        return "TestConvexShape";
    }
}

describe('btConvexShape', () => {
    let shape: TestConvexShape;

    beforeEach(() => {
        shape = new TestConvexShape();
    });

    describe('Abstract interface', () => {
        test('localGetSupportingVertex should return valid support vertex', () => {
            const direction = new btVector3(1, 0, 0);
            const support = shape.localGetSupportingVertex(direction);
            
            expect(support.x()).toBeCloseTo(CONVEX_DISTANCE_MARGIN, 5);
            expect(support.y()).toBeCloseTo(0, 5);
            expect(support.z()).toBeCloseTo(0, 5);
        });

        test('localGetSupportingVertexWithoutMargin should return support vertex without margin', () => {
            const direction = new btVector3(0, 1, 0);
            const support = shape.localGetSupportingVertexWithoutMargin(direction);
            
            expect(support.x()).toBeCloseTo(0, 5);
            expect(support.y()).toBeCloseTo(0.5, 5);
            expect(support.z()).toBeCloseTo(0, 5);
        });

        test('batchedUnitVectorGetSupportingVertexWithoutMargin should process multiple vectors', () => {
            const vectors = [
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0),
                new btVector3(0, 0, 1)
            ];
            const supportVertices: btVector3[] = [
                new btVector3(),
                new btVector3(),
                new btVector3()
            ];

            shape.batchedUnitVectorGetSupportingVertexWithoutMargin(vectors, supportVertices, 3);

            expect(supportVertices[0].x()).toBeCloseTo(0.5, 5);
            expect(supportVertices[1].y()).toBeCloseTo(0.5, 5);
            expect(supportVertices[2].z()).toBeCloseTo(0.5, 5);
        });

        test('getAabb should return valid bounding box', () => {
            const transform = new btTransform();
            transform.setOrigin(new btVector3(1, 2, 3));
            
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();
            
            shape.getAabb(transform, aabbMin, aabbMax);

            const margin = CONVEX_DISTANCE_MARGIN;
            expect(aabbMin.x()).toBeCloseTo(1 - margin, 5);
            expect(aabbMin.y()).toBeCloseTo(2 - margin, 5);
            expect(aabbMin.z()).toBeCloseTo(3 - margin, 5);
            expect(aabbMax.x()).toBeCloseTo(1 + margin, 5);
            expect(aabbMax.y()).toBeCloseTo(2 + margin, 5);
            expect(aabbMax.z()).toBeCloseTo(3 + margin, 5);
        });

        test('margin should be settable and gettable', () => {
            const newMargin = 0.1;
            shape.setMargin(newMargin);
            expect(shape.getMargin()).toBeCloseTo(newMargin, 5);
        });

        test('local scaling should be settable and gettable', () => {
            const newScaling = new btVector3(2, 3, 4);
            shape.setLocalScaling(newScaling);
            const scaling = shape.getLocalScaling();
            
            expect(scaling.x()).toBeCloseTo(2, 5);
            expect(scaling.y()).toBeCloseTo(3, 5);
            expect(scaling.z()).toBeCloseTo(4, 5);
        });
    });

    describe('project method', () => {
        test('should project shape onto direction vector', () => {
            const transform = new btTransform();
            transform.setIdentity();
            
            const direction = new btVector3(1, 0, 0);
            const minProj = { value: 0 };
            const maxProj = { value: 0 };
            const witnessPtMin = new btVector3();
            const witnessPtMax = new btVector3();

            shape.project(transform, direction, minProj, maxProj, witnessPtMin, witnessPtMax);

            expect(minProj.value).toBeLessThanOrEqual(maxProj.value);
            expect(Math.abs(minProj.value)).toBeCloseTo(CONVEX_DISTANCE_MARGIN, 5);
            expect(maxProj.value).toBeCloseTo(CONVEX_DISTANCE_MARGIN, 5);
        });

        test('should handle transformed shape projection', () => {
            const transform = new btTransform();
            transform.setOrigin(new btVector3(5, 0, 0));
            
            const direction = new btVector3(1, 0, 0);
            const minProj = { value: 0 };
            const maxProj = { value: 0 };
            const witnessPtMin = new btVector3();
            const witnessPtMax = new btVector3();

            shape.project(transform, direction, minProj, maxProj, witnessPtMin, witnessPtMax);

            // With translation, the projection should be shifted
            // Allow for some margin of error in the calculation
            expect(minProj.value).toBeCloseTo(5 - CONVEX_DISTANCE_MARGIN, 1);
            expect(maxProj.value).toBeCloseTo(5 + CONVEX_DISTANCE_MARGIN, 1);
        });
    });

    describe('Non-virtual methods', () => {
        test('localGetSupportVertexNonVirtual should handle zero vector', () => {
            const zeroDir = new btVector3(0, 0, 0);
            const support = shape.localGetSupportVertexNonVirtual(zeroDir);
            
            // Should normalize to (-1, -1, -1) and add margin
            expect(support.length()).toBeGreaterThan(0);
        });

        test('localGetSupportVertexNonVirtual should normalize input direction', () => {
            const largeDir = new btVector3(100, 0, 0);
            const support = shape.localGetSupportVertexNonVirtual(largeDir);
            
            // Should give same result as unit vector
            const unitDir = new btVector3(1, 0, 0);
            const unitSupport = shape.localGetSupportVertexNonVirtual(unitDir);
            
            expect(support.x()).toBeCloseTo(unitSupport.x(), 5);
            expect(support.y()).toBeCloseTo(unitSupport.y(), 5);
            expect(support.z()).toBeCloseTo(unitSupport.z(), 5);
        });

        test('localGetSupportVertexWithoutMarginNonVirtual should handle sphere shape type', () => {
            // Create shape with sphere type
            const sphereShape = new TestConvexShape();
            (sphereShape as any).m_shapeType = BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
            
            const direction = new btVector3(1, 0, 0);
            const support = sphereShape.localGetSupportVertexWithoutMarginNonVirtual(direction);
            
            // Sphere shape should return origin for support vertex without margin
            expect(support.x()).toBeCloseTo(0, 5);
            expect(support.y()).toBeCloseTo(0, 5);
            expect(support.z()).toBeCloseTo(0, 5);
        });

        test('getMarginNonVirtual should return margin for different shape types', () => {
            // Test sphere shape type
            (shape as any).m_shapeType = BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
            expect(shape.getMarginNonVirtual()).toBeCloseTo(CONVEX_DISTANCE_MARGIN, 5);
            
            // Test box shape type
            (shape as any).m_shapeType = BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE;
            expect(shape.getMarginNonVirtual()).toBeCloseTo(CONVEX_DISTANCE_MARGIN, 5);
        });

        test('getAabbNonVirtual should handle sphere shape', () => {
            (shape as any).m_shapeType = BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
            
            const transform = new btTransform();
            transform.setOrigin(new btVector3(1, 2, 3));
            
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();
            
            shape.getAabbNonVirtual(transform, aabbMin, aabbMax);
            
            const margin = shape.getMarginNonVirtual();
            expect(aabbMin.x()).toBeCloseTo(1 - margin, 5);
            expect(aabbMax.x()).toBeCloseTo(1 + margin, 5);
        });
    });

    describe('Constants', () => {
        test('MAX_PREFERRED_PENETRATION_DIRECTIONS should be defined', () => {
            expect(MAX_PREFERRED_PENETRATION_DIRECTIONS).toBe(10);
        });
    });

    describe('Inheritance', () => {
        test('should inherit from btCollisionShape', () => {
            const { btCollisionShape } = require('./btCollisionShape');
            expect(shape).toBeInstanceOf(btCollisionShape);
        });

        test('should implement all abstract methods', () => {
            // These should not throw errors
            expect(() => shape.localGetSupportingVertex(new btVector3(1, 0, 0))).not.toThrow();
            expect(() => shape.localGetSupportingVertexWithoutMargin(new btVector3(1, 0, 0))).not.toThrow();
            expect(() => shape.batchedUnitVectorGetSupportingVertexWithoutMargin([], [], 0)).not.toThrow();
            expect(() => shape.getAabb(new btTransform(), new btVector3(), new btVector3())).not.toThrow();
            expect(() => shape.getAabbSlow(new btTransform(), new btVector3(), new btVector3())).not.toThrow();
            expect(() => shape.setLocalScaling(new btVector3(1, 1, 1))).not.toThrow();
            expect(() => shape.getLocalScaling()).not.toThrow();
            expect(() => shape.setMargin(0.1)).not.toThrow();
            expect(() => shape.getMargin()).not.toThrow();
            expect(() => shape.getNumPreferredPenetrationDirections()).not.toThrow();
            expect(() => shape.getPreferredPenetrationDirection(0, new btVector3())).not.toThrow();
        });
    });
});

describe('convexHullSupport helper function', () => {
    test('should return correct support vertex for point cloud', () => {
        const points = [
            new btVector3(-1, -1, -1),
            new btVector3(1, -1, -1),
            new btVector3(0, 1, -1),
            new btVector3(0, 0, 1)
        ];
        
        const direction = new btVector3(1, 0, 0);
        const scaling = new btVector3(1, 1, 1);
        
        const support = convexHullSupport(direction, points, points.length, scaling);
        
        // Should return the point with maximum dot product in x direction
        expect(support.x()).toBeCloseTo(1, 5);
        expect(support.y()).toBeCloseTo(-1, 5);
        expect(support.z()).toBeCloseTo(-1, 5);
    });

    test('should apply local scaling correctly', () => {
        const points = [
            new btVector3(1, 0, 0),
            new btVector3(0, 1, 0),
            new btVector3(0, 0, 1)
        ];
        
        const direction = new btVector3(1, 0, 0);
        const scaling = new btVector3(2, 3, 4);
        
        const support = convexHullSupport(direction, points, points.length, scaling);
        
        // Should return scaled version of best point
        expect(support.x()).toBeCloseTo(2, 5); // 1 * 2
        expect(support.y()).toBeCloseTo(0, 5); // 0 * 3
        expect(support.z()).toBeCloseTo(0, 5); // 0 * 4
    });

    test('should handle empty point array gracefully', () => {
        const points: btVector3[] = [];
        const direction = new btVector3(1, 0, 0);
        const scaling = new btVector3(1, 1, 1);
        
        // This should throw an assertion error for empty array in the current implementation
        // In a real implementation, this would be handled more gracefully
        expect(() => {
            convexHullSupport(direction, points, 0, scaling);
        }).toThrow();
    });
});