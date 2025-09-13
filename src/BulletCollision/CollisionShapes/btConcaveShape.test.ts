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

import { btConcaveShape, PHY_ScalarType } from './btConcaveShape';
import { btTriangleCallback } from './btTriangleCallback';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

// Test implementation of btConcaveShape for testing purposes
class TestConcaveShape extends btConcaveShape {
    private triangles: btVector3[][];
    private processCallCount: number = 0;
    private localScaling: btVector3 = new btVector3(1, 1, 1);

    constructor(triangles: btVector3[][] = []) {
        super();
        this.triangles = triangles;
        this.m_shapeType = BroadphaseNativeTypes.TRIANGLE_MESH_SHAPE_PROXYTYPE;
    }

    processAllTriangles(callback: btTriangleCallback, _aabbMin: btVector3, _aabbMax: btVector3): void {
        this.processCallCount++;
        
        // Simple implementation that processes all triangles regardless of AABB
        // In a real implementation, you would cull triangles based on the AABB
        for (let i = 0; i < this.triangles.length; i++) {
            callback.processTriangle(this.triangles[i], 0, i);
        }
    }

    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        // Simple implementation - compute AABB from all triangles
        if (this.triangles.length === 0) {
            aabbMin.setValue(0, 0, 0);
            aabbMax.setValue(0, 0, 0);
            return;
        }

        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

        for (const triangle of this.triangles) {
            for (const vertex of triangle) {
                const transformedVertex = t.multiplyVector(vertex);
                minX = Math.min(minX, transformedVertex.x());
                minY = Math.min(minY, transformedVertex.y());
                minZ = Math.min(minZ, transformedVertex.z());
                maxX = Math.max(maxX, transformedVertex.x());
                maxY = Math.max(maxY, transformedVertex.y());
                maxZ = Math.max(maxZ, transformedVertex.z());
            }
        }

        aabbMin.setValue(minX, minY, minZ);
        aabbMax.setValue(maxX, maxY, maxZ);
    }

    setLocalScaling(scaling: btVector3): void {
        this.localScaling.copy(scaling);
    }

    getLocalScaling(): btVector3 {
        return this.localScaling.clone();
    }

    calculateLocalInertia(_mass: number, inertia: btVector3): void {
        // For testing purposes, just set to zero (concave shapes typically don't have inertia)
        inertia.setValue(0, 0, 0);
    }

    getName(): string {
        return "TestConcaveShape";
    }

    getProcessCallCount(): number {
        return this.processCallCount;
    }

    resetProcessCallCount(): void {
        this.processCallCount = 0;
    }

    addTriangle(triangle: btVector3[]): void {
        this.triangles.push(triangle);
    }
}

// Test implementation of btTriangleCallback for testing purposes
class TestTriangleCallback extends btTriangleCallback {
    private processedTriangles: { triangle: btVector3[], partId: number, triangleIndex: number }[] = [];

    processTriangle(triangle: btVector3[], partId: number, triangleIndex: number): void {
        this.processedTriangles.push({
            triangle: triangle.map(v => v.clone()),
            partId,
            triangleIndex
        });
    }

    getProcessedTriangles(): { triangle: btVector3[], partId: number, triangleIndex: number }[] {
        return this.processedTriangles;
    }

    clear(): void {
        this.processedTriangles = [];
    }
}

describe('PHY_ScalarType', () => {
    test('should have correct enum values', () => {
        expect(PHY_ScalarType.PHY_FLOAT).toBe(0);
        expect(PHY_ScalarType.PHY_DOUBLE).toBe(1);
        expect(PHY_ScalarType.PHY_INTEGER).toBe(2);
        expect(PHY_ScalarType.PHY_SHORT).toBe(3);
        expect(PHY_ScalarType.PHY_FIXEDPOINT88).toBe(4);
        expect(PHY_ScalarType.PHY_UCHAR).toBe(5);
    });
});

describe('btConcaveShape', () => {
    let concaveShape: TestConcaveShape;
    let triangleCallback: TestTriangleCallback;

    beforeEach(() => {
        concaveShape = new TestConcaveShape();
        triangleCallback = new TestTriangleCallback();
    });

    afterEach(() => {
        concaveShape.cleanup();
        triangleCallback.cleanup();
    });

    describe('constructor', () => {
        test('should initialize with zero collision margin', () => {
            expect(concaveShape.getMargin()).toBe(0);
        });

        test('should inherit from btCollisionShape', () => {
            expect(concaveShape).toBeInstanceOf(btConcaveShape);
        });
    });

    describe('margin operations', () => {
        test('should set and get collision margin correctly', () => {
            const margin = 0.04;
            concaveShape.setMargin(margin);
            expect(concaveShape.getMargin()).toBe(margin);
        });

        test('should handle negative margin values', () => {
            const margin = -0.1;
            concaveShape.setMargin(margin);
            expect(concaveShape.getMargin()).toBe(margin);
        });

        test('should handle zero margin', () => {
            concaveShape.setMargin(0.5);
            concaveShape.setMargin(0);
            expect(concaveShape.getMargin()).toBe(0);
        });

        test('should handle very small margin values', () => {
            const margin = 1e-10;
            concaveShape.setMargin(margin);
            expect(concaveShape.getMargin()).toBe(margin);
        });

        test('should handle very large margin values', () => {
            const margin = 1000;
            concaveShape.setMargin(margin);
            expect(concaveShape.getMargin()).toBe(margin);
        });
    });

    describe('processAllTriangles', () => {
        test('should call processTriangle for each triangle', () => {
            const triangle1 = [
                new btVector3(0, 0, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0)
            ];
            const triangle2 = [
                new btVector3(1, 0, 0),
                new btVector3(1, 1, 0),
                new btVector3(0, 1, 0)
            ];

            concaveShape.addTriangle(triangle1);
            concaveShape.addTriangle(triangle2);

            const aabbMin = new btVector3(-1, -1, -1);
            const aabbMax = new btVector3(2, 2, 1);

            concaveShape.processAllTriangles(triangleCallback, aabbMin, aabbMax);

            const processedTriangles = triangleCallback.getProcessedTriangles();
            expect(processedTriangles).toHaveLength(2);

            // Check first triangle
            expect(processedTriangles[0].partId).toBe(0);
            expect(processedTriangles[0].triangleIndex).toBe(0);
            expect(processedTriangles[0].triangle).toHaveLength(3);
            expect(processedTriangles[0].triangle[0].equals(triangle1[0])).toBe(true);
            expect(processedTriangles[0].triangle[1].equals(triangle1[1])).toBe(true);
            expect(processedTriangles[0].triangle[2].equals(triangle1[2])).toBe(true);

            // Check second triangle
            expect(processedTriangles[1].partId).toBe(0);
            expect(processedTriangles[1].triangleIndex).toBe(1);
            expect(processedTriangles[1].triangle).toHaveLength(3);
            expect(processedTriangles[1].triangle[0].equals(triangle2[0])).toBe(true);
            expect(processedTriangles[1].triangle[1].equals(triangle2[1])).toBe(true);
            expect(processedTriangles[1].triangle[2].equals(triangle2[2])).toBe(true);
        });

        test('should handle empty triangle list', () => {
            const aabbMin = new btVector3(-1, -1, -1);
            const aabbMax = new btVector3(1, 1, 1);

            concaveShape.processAllTriangles(triangleCallback, aabbMin, aabbMax);

            expect(triangleCallback.getProcessedTriangles()).toHaveLength(0);
            expect(concaveShape.getProcessCallCount()).toBe(1);
        });

        test('should handle multiple calls correctly', () => {
            const triangle = [
                new btVector3(0, 0, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0)
            ];
            concaveShape.addTriangle(triangle);

            const aabbMin = new btVector3(-1, -1, -1);
            const aabbMax = new btVector3(2, 2, 1);

            // First call
            concaveShape.processAllTriangles(triangleCallback, aabbMin, aabbMax);
            expect(triangleCallback.getProcessedTriangles()).toHaveLength(1);
            expect(concaveShape.getProcessCallCount()).toBe(1);

            // Second call (callback should accumulate)
            concaveShape.processAllTriangles(triangleCallback, aabbMin, aabbMax);
            expect(triangleCallback.getProcessedTriangles()).toHaveLength(2);
            expect(concaveShape.getProcessCallCount()).toBe(2);
        });

        test('should work with different AABB parameters', () => {
            const triangle = [
                new btVector3(0, 0, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0)
            ];
            concaveShape.addTriangle(triangle);

            // Test with different AABB bounds
            const aabbMin1 = new btVector3(-10, -10, -10);
            const aabbMax1 = new btVector3(10, 10, 10);
            concaveShape.processAllTriangles(triangleCallback, aabbMin1, aabbMax1);
            expect(triangleCallback.getProcessedTriangles()).toHaveLength(1);

            triangleCallback.clear();

            const aabbMin2 = new btVector3(0, 0, 0);
            const aabbMax2 = new btVector3(0.5, 0.5, 0.5);
            concaveShape.processAllTriangles(triangleCallback, aabbMin2, aabbMax2);
            expect(triangleCallback.getProcessedTriangles()).toHaveLength(1);
        });
    });

    describe('cleanup', () => {
        test('should have cleanup method', () => {
            expect(typeof concaveShape.cleanup).toBe('function');
            // Should not throw
            expect(() => concaveShape.cleanup()).not.toThrow();
        });

        test('should be callable multiple times', () => {
            expect(() => {
                concaveShape.cleanup();
                concaveShape.cleanup();
                concaveShape.cleanup();
            }).not.toThrow();
        });
    });

    describe('inheritance and polymorphism', () => {
        test('should be abstract (cannot instantiate btConcaveShape directly)', () => {
            // This is enforced by TypeScript at compile time
            // At runtime, we can only test through our concrete implementation
            expect(concaveShape).toBeInstanceOf(btConcaveShape);
        });

        test('should work as btCollisionShape', () => {
            const shape: btConcaveShape = concaveShape;
            expect(shape.getMargin()).toBe(0);
            shape.setMargin(0.1);
            expect(shape.getMargin()).toBe(0.1);
        });
    });

    describe('edge cases', () => {
        test('should handle NaN margin values gracefully', () => {
            concaveShape.setMargin(NaN);
            expect(isNaN(concaveShape.getMargin())).toBe(true);
        });

        test('should handle Infinity margin values', () => {
            concaveShape.setMargin(Infinity);
            expect(concaveShape.getMargin()).toBe(Infinity);
        });

        test('should handle -Infinity margin values', () => {
            concaveShape.setMargin(-Infinity);
            expect(concaveShape.getMargin()).toBe(-Infinity);
        });

        test('should handle very large numbers of triangles', () => {
            // Add many triangles
            for (let i = 0; i < 1000; i++) {
                const triangle = [
                    new btVector3(i, 0, 0),
                    new btVector3(i + 1, 0, 0),
                    new btVector3(i, 1, 0)
                ];
                concaveShape.addTriangle(triangle);
            }

            const aabbMin = new btVector3(-1, -1, -1);
            const aabbMax = new btVector3(1001, 2, 1);

            concaveShape.processAllTriangles(triangleCallback, aabbMin, aabbMax);
            expect(triangleCallback.getProcessedTriangles()).toHaveLength(1000);
        });
    });
});