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

import { describe, test, expect, beforeEach } from '@jest/globals';
import { btBoxShape } from './btBoxShape';
import { btVector3, btVector4 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
import { CONVEX_DISTANCE_MARGIN } from './btCollisionMargin';

describe('btBoxShape', () => {
    let boxShape: btBoxShape;
    const defaultHalfExtents = new btVector3(1, 2, 3);

    beforeEach(() => {
        boxShape = new btBoxShape(defaultHalfExtents);
    });

    describe('Constructor and Basic Properties', () => {
        test('should create box shape with correct shape type', () => {
            expect(boxShape.getShapeType()).toBe(BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE);
        });

        test('should return correct name', () => {
            expect(boxShape.getName()).toBe('Box');
        });

        test('should return correct shape characteristics', () => {
            expect(boxShape.getNumPlanes()).toBe(6);
            expect(boxShape.getNumVertices()).toBe(8);
            expect(boxShape.getNumEdges()).toBe(12);
            expect(boxShape.getNumPreferredPenetrationDirections()).toBe(6);
        });

        test('should be convex shape', () => {
            expect(boxShape.isConvex()).toBe(true);
            expect(boxShape.isPolyhedral()).toBe(true);
            expect(boxShape.isNonMoving()).toBe(false);
        });

        test('should have default collision margin', () => {
            expect(boxShape.getMargin()).toBe(CONVEX_DISTANCE_MARGIN);
        });
    });

    describe('Half Extents', () => {
        test('should return correct half extents without margin', () => {
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();
            // Note: constructor subtracts margin from scaled dimensions
            const expectedHalfExtents = defaultHalfExtents.clone();
            expectedHalfExtents.subtractAssign(new btVector3(CONVEX_DISTANCE_MARGIN, CONVEX_DISTANCE_MARGIN, CONVEX_DISTANCE_MARGIN));
            
            expect(halfExtents.x()).toBeCloseTo(expectedHalfExtents.x(), 6);
            expect(halfExtents.y()).toBeCloseTo(expectedHalfExtents.y(), 6);
            expect(halfExtents.z()).toBeCloseTo(expectedHalfExtents.z(), 6);
        });

        test('should return correct half extents with margin', () => {
            const halfExtentsWithMargin = boxShape.getHalfExtentsWithMargin();
            
            expect(halfExtentsWithMargin.x()).toBeCloseTo(defaultHalfExtents.x(), 6);
            expect(halfExtentsWithMargin.y()).toBeCloseTo(defaultHalfExtents.y(), 6);
            expect(halfExtentsWithMargin.z()).toBeCloseTo(defaultHalfExtents.z(), 6);
        });
    });

    describe('Support Vertices', () => {
        test('should compute correct supporting vertex without margin', () => {
            const direction = new btVector3(1, 1, 1);
            const support = boxShape.localGetSupportingVertexWithoutMargin(direction);
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();
            
            expect(support.x()).toBeCloseTo(halfExtents.x(), 6);
            expect(support.y()).toBeCloseTo(halfExtents.y(), 6);
            expect(support.z()).toBeCloseTo(halfExtents.z(), 6);
        });

        test('should compute correct supporting vertex with margin', () => {
            const direction = new btVector3(1, 1, 1);
            const support = boxShape.localGetSupportingVertex(direction);
            const halfExtentsWithMargin = boxShape.getHalfExtentsWithMargin();
            
            expect(support.x()).toBeCloseTo(halfExtentsWithMargin.x(), 6);
            expect(support.y()).toBeCloseTo(halfExtentsWithMargin.y(), 6);
            expect(support.z()).toBeCloseTo(halfExtentsWithMargin.z(), 6);
        });

        test('should handle negative directions correctly', () => {
            const direction = new btVector3(-1, -1, -1);
            const support = boxShape.localGetSupportingVertexWithoutMargin(direction);
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();
            
            expect(support.x()).toBeCloseTo(-halfExtents.x(), 6);
            expect(support.y()).toBeCloseTo(-halfExtents.y(), 6);
            expect(support.z()).toBeCloseTo(-halfExtents.z(), 6);
        });

        test('should handle mixed direction signs', () => {
            const direction = new btVector3(1, -1, 1);
            const support = boxShape.localGetSupportingVertexWithoutMargin(direction);
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();
            
            expect(support.x()).toBeCloseTo(halfExtents.x(), 6);
            expect(support.y()).toBeCloseTo(-halfExtents.y(), 6);
            expect(support.z()).toBeCloseTo(halfExtents.z(), 6);
        });
    });

    describe('Batch Support Vertices', () => {
        test('should compute multiple support vertices correctly', () => {
            const directions = [
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0),
                new btVector3(0, 0, 1),
                new btVector3(-1, 0, 0),
                new btVector3(0, -1, 0),
                new btVector3(0, 0, -1)
            ];
            const supportVertices = new Array<btVector3>(6);
            for (let i = 0; i < 6; i++) {
                supportVertices[i] = new btVector3(0, 0, 0);
            }

            boxShape.batchedUnitVectorGetSupportingVertexWithoutMargin(directions, supportVertices, 6);

            const halfExtents = boxShape.getHalfExtentsWithoutMargin();

            expect(supportVertices[0].x()).toBeCloseTo(halfExtents.x(), 6);
            expect(supportVertices[0].y()).toBeCloseTo(halfExtents.y(), 6);
            expect(supportVertices[0].z()).toBeCloseTo(halfExtents.z(), 6);

            expect(supportVertices[1].x()).toBeCloseTo(halfExtents.x(), 6);
            expect(supportVertices[1].y()).toBeCloseTo(halfExtents.y(), 6);
            expect(supportVertices[1].z()).toBeCloseTo(halfExtents.z(), 6);

            expect(supportVertices[3].x()).toBeCloseTo(-halfExtents.x(), 6);
            expect(supportVertices[3].y()).toBeCloseTo(halfExtents.y(), 6);
            expect(supportVertices[3].z()).toBeCloseTo(halfExtents.z(), 6);
        });
    });

    describe('Vertices and Edges', () => {
        test('should return correct vertices', () => {
            const vertices = [];
            for (let i = 0; i < 8; i++) {
                const vertex = new btVector3(0, 0, 0);
                boxShape.getVertex(i, vertex);
                vertices.push(vertex);
            }

            const halfExtents = boxShape.getHalfExtentsWithMargin();

            // Test some specific vertices
            expect(vertices[0].x()).toBeCloseTo(halfExtents.x(), 6);
            expect(vertices[0].y()).toBeCloseTo(halfExtents.y(), 6);
            expect(vertices[0].z()).toBeCloseTo(halfExtents.z(), 6);

            expect(vertices[7].x()).toBeCloseTo(-halfExtents.x(), 6);
            expect(vertices[7].y()).toBeCloseTo(-halfExtents.y(), 6);
            expect(vertices[7].z()).toBeCloseTo(-halfExtents.z(), 6);
        });

        test('should return correct edges', () => {
            const pa = new btVector3(0, 0, 0);
            const pb = new btVector3(0, 0, 0);

            // Test first edge (should connect vertices 0 and 1)
            boxShape.getEdge(0, pa, pb);

            const vertex0 = new btVector3(0, 0, 0);
            const vertex1 = new btVector3(0, 0, 0);
            boxShape.getVertex(0, vertex0);
            boxShape.getVertex(1, vertex1);

            expect(pa.equals(vertex0)).toBe(true);
            expect(pb.equals(vertex1)).toBe(true);
        });

        test('should handle all edge indices', () => {
            const pa = new btVector3(0, 0, 0);
            const pb = new btVector3(0, 0, 0);

            for (let i = 0; i < 12; i++) {
                expect(() => boxShape.getEdge(i, pa, pb)).not.toThrow();
            }
        });
    });

    describe('Planes', () => {
        test('should return correct plane equations', () => {
            const plane = new btVector4(0, 0, 0, 0);
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();

            // Test positive X plane
            boxShape.getPlaneEquation(plane, 0);
            expect(plane.x()).toBeCloseTo(1, 6);
            expect(plane.y()).toBeCloseTo(0, 6);
            expect(plane.z()).toBeCloseTo(0, 6);
            expect(plane.w()).toBeCloseTo(-halfExtents.x(), 6);

            // Test negative X plane
            boxShape.getPlaneEquation(plane, 1);
            expect(plane.x()).toBeCloseTo(-1, 6);
            expect(plane.y()).toBeCloseTo(0, 6);
            expect(plane.z()).toBeCloseTo(0, 6);
            expect(plane.w()).toBeCloseTo(-halfExtents.x(), 6);
        });

        test('should get plane normal and support point', () => {
            const planeNormal = new btVector3(0, 0, 0);
            const planeSupport = new btVector3(0, 0, 0);

            boxShape.getPlane(planeNormal, planeSupport, 0);

            expect(planeNormal.x()).toBeCloseTo(1, 6);
            expect(planeNormal.y()).toBeCloseTo(0, 6);
            expect(planeNormal.z()).toBeCloseTo(0, 6);
        });
    });

    describe('Inside Test', () => {
        test('should correctly identify points inside box', () => {
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();
            
            // Point at center
            expect(boxShape.isInside(new btVector3(0, 0, 0), 0)).toBe(true);
            
            // Point just inside boundary
            expect(boxShape.isInside(new btVector3(
                halfExtents.x() - 0.1,
                halfExtents.y() - 0.1,
                halfExtents.z() - 0.1
            ), 0)).toBe(true);
        });

        test('should correctly identify points outside box', () => {
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();
            
            // Point outside X boundary
            expect(boxShape.isInside(new btVector3(halfExtents.x() + 0.1, 0, 0), 0)).toBe(false);
            
            // Point outside Y boundary
            expect(boxShape.isInside(new btVector3(0, halfExtents.y() + 0.1, 0), 0)).toBe(false);
            
            // Point outside Z boundary
            expect(boxShape.isInside(new btVector3(0, 0, halfExtents.z() + 0.1), 0)).toBe(false);
        });

        test('should handle tolerance correctly', () => {
            const halfExtents = boxShape.getHalfExtentsWithoutMargin();
            const tolerance = 0.1;
            
            // Point just outside boundary but within tolerance
            expect(boxShape.isInside(new btVector3(halfExtents.x() + 0.05, 0, 0), tolerance)).toBe(true);
            
            // Point outside tolerance
            expect(boxShape.isInside(new btVector3(halfExtents.x() + 0.15, 0, 0), tolerance)).toBe(false);
        });
    });

    describe('Penetration Directions', () => {
        test('should return correct penetration directions', () => {
            const direction = new btVector3(0, 0, 0);
            
            // Test all 6 directions
            boxShape.getPreferredPenetrationDirection(0, direction);
            expect(direction.equals(new btVector3(1, 0, 0))).toBe(true);

            boxShape.getPreferredPenetrationDirection(1, direction);
            expect(direction.equals(new btVector3(-1, 0, 0))).toBe(true);

            boxShape.getPreferredPenetrationDirection(2, direction);
            expect(direction.equals(new btVector3(0, 1, 0))).toBe(true);

            boxShape.getPreferredPenetrationDirection(3, direction);
            expect(direction.equals(new btVector3(0, -1, 0))).toBe(true);

            boxShape.getPreferredPenetrationDirection(4, direction);
            expect(direction.equals(new btVector3(0, 0, 1))).toBe(true);

            boxShape.getPreferredPenetrationDirection(5, direction);
            expect(direction.equals(new btVector3(0, 0, -1))).toBe(true);
        });
    });

    describe('AABB Calculation', () => {
        test('should calculate correct AABB for identity transform', () => {
            const transform = new btTransform();
            transform.setIdentity();
            
            const aabbMin = new btVector3(0, 0, 0);
            const aabbMax = new btVector3(0, 0, 0);
            
            boxShape.getAabb(transform, aabbMin, aabbMax);
            
            const halfExtentsWithMargin = boxShape.getHalfExtentsWithMargin();
            
            expect(aabbMin.x()).toBeCloseTo(-halfExtentsWithMargin.x(), 5);
            expect(aabbMin.y()).toBeCloseTo(-halfExtentsWithMargin.y(), 5);
            expect(aabbMin.z()).toBeCloseTo(-halfExtentsWithMargin.z(), 5);
            
            expect(aabbMax.x()).toBeCloseTo(halfExtentsWithMargin.x(), 5);
            expect(aabbMax.y()).toBeCloseTo(halfExtentsWithMargin.y(), 5);
            expect(aabbMax.z()).toBeCloseTo(halfExtentsWithMargin.z(), 5);
        });

        test('should calculate correct AABB for translated transform', () => {
            const transform = new btTransform();
            transform.setIdentity();
            transform.setOrigin(new btVector3(5, 10, -2));
            
            const aabbMin = new btVector3(0, 0, 0);
            const aabbMax = new btVector3(0, 0, 0);
            
            boxShape.getAabb(transform, aabbMin, aabbMax);
            
            const halfExtentsWithMargin = boxShape.getHalfExtentsWithMargin();
            const origin = transform.getOrigin();
            
            expect(aabbMin.x()).toBeCloseTo(origin.x() - halfExtentsWithMargin.x(), 5);
            expect(aabbMin.y()).toBeCloseTo(origin.y() - halfExtentsWithMargin.y(), 5);
            expect(aabbMin.z()).toBeCloseTo(origin.z() - halfExtentsWithMargin.z(), 5);
            
            expect(aabbMax.x()).toBeCloseTo(origin.x() + halfExtentsWithMargin.x(), 5);
            expect(aabbMax.y()).toBeCloseTo(origin.y() + halfExtentsWithMargin.y(), 5);
            expect(aabbMax.z()).toBeCloseTo(origin.z() + halfExtentsWithMargin.z(), 5);
        });
    });

    describe('Inertia Calculation', () => {
        test('should calculate correct local inertia', () => {
            const mass = 10;
            const inertia = new btVector3(0, 0, 0);
            
            boxShape.calculateLocalInertia(mass, inertia);
            
            const halfExtents = boxShape.getHalfExtentsWithMargin();
            const lx = 2 * halfExtents.x();
            const ly = 2 * halfExtents.y();
            const lz = 2 * halfExtents.z();
            
            const expectedInertiaX = mass / 12 * (ly * ly + lz * lz);
            const expectedInertiaY = mass / 12 * (lx * lx + lz * lz);
            const expectedInertiaZ = mass / 12 * (lx * lx + ly * ly);
            
            expect(inertia.x()).toBeCloseTo(expectedInertiaX, 6);
            expect(inertia.y()).toBeCloseTo(expectedInertiaY, 6);
            expect(inertia.z()).toBeCloseTo(expectedInertiaZ, 6);
        });

        test('should have zero inertia for zero mass', () => {
            const inertia = new btVector3(0, 0, 0);
            
            boxShape.calculateLocalInertia(0, inertia);
            
            expect(inertia.x()).toBeCloseTo(0, 6);
            expect(inertia.y()).toBeCloseTo(0, 6);
            expect(inertia.z()).toBeCloseTo(0, 6);
        });
    });

    describe('Margin and Scaling', () => {
        test('should correctly set margin and adjust dimensions', () => {
            const newMargin = 0.1;
            const originalHalfExtentsWithMargin = boxShape.getHalfExtentsWithMargin().clone();
            
            boxShape.setMargin(newMargin);
            
            expect(boxShape.getMargin()).toBeCloseTo(newMargin, 6);
            
            // The half extents with margin should maintain the original total size
            // while adjusting the margin component
            const halfExtentsWithMargin = boxShape.getHalfExtentsWithMargin();
            expect(halfExtentsWithMargin.x()).toBeCloseTo(originalHalfExtentsWithMargin.x(), 5);
            expect(halfExtentsWithMargin.y()).toBeCloseTo(originalHalfExtentsWithMargin.y(), 5);
            expect(halfExtentsWithMargin.z()).toBeCloseTo(originalHalfExtentsWithMargin.z(), 5);
        });

        test('should correctly set local scaling', () => {
            const scaling = new btVector3(2, 0.5, 3);
            
            boxShape.setLocalScaling(scaling);
            
            expect(boxShape.getLocalScaling().equals(scaling)).toBe(true);
            
            // Verify that scaling affects the shape properly
            const newHalfExtentsWithMargin = boxShape.getHalfExtentsWithMargin();
            
            // The relationship should be maintained through the scaling transformation
            expect(newHalfExtentsWithMargin.length()).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        test('should throw error for invalid plane index', () => {
            const plane = new btVector4(0, 0, 0, 0);
            expect(() => boxShape.getPlaneEquation(plane, -1)).toThrow();
            expect(() => boxShape.getPlaneEquation(plane, 6)).toThrow();
        });

        test('should throw error for invalid edge index', () => {
            const pa = new btVector3(0, 0, 0);
            const pb = new btVector3(0, 0, 0);
            expect(() => boxShape.getEdge(-1, pa, pb)).toThrow();
            expect(() => boxShape.getEdge(12, pa, pb)).toThrow();
        });

        test('should throw error for invalid penetration direction index', () => {
            const direction = new btVector3(0, 0, 0);
            expect(() => boxShape.getPreferredPenetrationDirection(-1, direction)).toThrow();
            expect(() => boxShape.getPreferredPenetrationDirection(6, direction)).toThrow();
        });
    });

    describe('Edge Cases', () => {
        test('should handle very small boxes', () => {
            const smallBox = new btBoxShape(new btVector3(0.001, 0.001, 0.001));
            expect(smallBox.getHalfExtentsWithMargin().length()).toBeGreaterThan(0);
            
            // Should still be able to compute support vertices
            const support = smallBox.localGetSupportingVertex(new btVector3(1, 0, 0));
            expect(support.x()).toBeGreaterThan(0);
        });

        test('should handle zero direction vector for support vertex', () => {
            const zeroDirection = new btVector3(0, 0, 0);
            const support = boxShape.localGetSupportingVertex(zeroDirection);
            
            // Should not crash and return a valid result
            expect(isFinite(support.x())).toBe(true);
            expect(isFinite(support.y())).toBe(true);
            expect(isFinite(support.z())).toBe(true);
        });

        test('should handle asymmetric boxes', () => {
            const asymmetricBox = new btBoxShape(new btVector3(0.5, 5, 0.5));
            
            expect(asymmetricBox.getNumVertices()).toBe(8);
            expect(asymmetricBox.getNumEdges()).toBe(12);
            expect(asymmetricBox.getNumPlanes()).toBe(6);
            
            // Should compute reasonable inertia - the tallest dimension should have smallest inertia
            // For a tall thin box (small x,z and large y), the inertia about y-axis should be smallest
            const inertia = new btVector3(0, 0, 0);
            asymmetricBox.calculateLocalInertia(1, inertia);
            expect(inertia.x()).toBeGreaterThan(inertia.y());  // Ixx should be larger than Iyy
            expect(inertia.z()).toBeGreaterThan(inertia.y());  // Izz should be larger than Iyy
        });
    });
});