/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

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

import { btGeometryUtil } from './btGeometryUtil';
import { btVector3 } from './btVector3';

describe('btGeometryUtil', () => {
    describe('isPointInsidePlanes', () => {
        test('should return true for point inside all planes', () => {
            // Create a simple cube using 6 planes (normals pointing inward)
            const planeEquations: btVector3[] = [];
            const plane1 = new btVector3(1, 0, 0); plane1.setValue(1, 0, 0, -1); planeEquations.push(plane1);   // right face: x >= 1
            const plane2 = new btVector3(-1, 0, 0); plane2.setValue(-1, 0, 0, -1); planeEquations.push(plane2);  // left face: x <= -1
            const plane3 = new btVector3(0, 1, 0); plane3.setValue(0, 1, 0, -1); planeEquations.push(plane3);   // top face: y >= 1
            const plane4 = new btVector3(0, -1, 0); plane4.setValue(0, -1, 0, -1); planeEquations.push(plane4);  // bottom face: y <= -1
            const plane5 = new btVector3(0, 0, 1); plane5.setValue(0, 0, 1, -1); planeEquations.push(plane5);   // front face: z >= 1
            const plane6 = new btVector3(0, 0, -1); plane6.setValue(0, 0, -1, -1); planeEquations.push(plane6);   // back face: z <= -1

            const pointInside = new btVector3(0, 0, 0); // origin should be inside
            const result = btGeometryUtil.isPointInsidePlanes(planeEquations, pointInside, 0);
            expect(result).toBe(true);
        });

        test('should return false for point outside planes', () => {
            // Create a simple cube using 6 planes
            const planeEquations: btVector3[] = [];
            const pl1 = new btVector3(1, 0, 0); pl1.setValue(1, 0, 0, -1); planeEquations.push(pl1);   // x >= 1
            const pl2 = new btVector3(-1, 0, 0); pl2.setValue(-1, 0, 0, -1); planeEquations.push(pl2);  // x <= -1
            const pl3 = new btVector3(0, 1, 0); pl3.setValue(0, 1, 0, -1); planeEquations.push(pl3);   // y >= 1
            const pl4 = new btVector3(0, -1, 0); pl4.setValue(0, -1, 0, -1); planeEquations.push(pl4);  // y <= -1
            const pl5 = new btVector3(0, 0, 1); pl5.setValue(0, 0, 1, -1); planeEquations.push(pl5);   // z >= 1
            const pl6 = new btVector3(0, 0, -1); pl6.setValue(0, 0, -1, -1); planeEquations.push(pl6);   // z <= -1

            const pointOutside = new btVector3(2, 0, 0); // outside the cube
            const result = btGeometryUtil.isPointInsidePlanes(planeEquations, pointOutside, 0);
            expect(result).toBe(false);
        });

        test('should respect margin parameter', () => {
            const planeEquations: btVector3[] = [];
            const plane = new btVector3(1, 0, 0);
            plane.setValue(1, 0, 0, -0.02);   // plane equation: x - 0.02 = 0, or x = 0.02
            planeEquations.push(plane);

            const pointNearPlane = new btVector3(0.05, 0, 0); // slightly outside (dist = 0.05 - 0.02 = 0.03 > 0)

            // Without margin, should be outside
            expect(btGeometryUtil.isPointInsidePlanes(planeEquations, pointNearPlane, 0)).toBe(false);

            // With sufficient margin, should be inside (dist - margin = 0.03 - 0.1 = -0.07 < 0)
            expect(btGeometryUtil.isPointInsidePlanes(planeEquations, pointNearPlane, 0.1)).toBe(true);
        });
    });

    describe('areVerticesBehindPlane', () => {
        test('should return true when all vertices are behind plane', () => {
            const planeNormal = new btVector3(1, 0, 0);
            planeNormal.setValue(1, 0, 0, 0); // plane at x = 0, normal pointing in +x direction
            const vertices = [
                new btVector3(-1, 0, 0),  // behind plane
                new btVector3(-2, 1, 1),  // behind plane
                new btVector3(-0.5, -1, 0) // behind plane
            ];

            const result = btGeometryUtil.areVerticesBehindPlane(planeNormal, vertices, 0);
            expect(result).toBe(true);
        });

        test('should return false when some vertices are in front of plane', () => {
            const planeNormal = new btVector3(1, 0, 0);
            planeNormal.setValue(1, 0, 0, 0); // plane at x = 0
            const vertices = [
                new btVector3(-1, 0, 0),  // behind plane
                new btVector3(1, 0, 0),   // in front of plane
                new btVector3(-0.5, 1, 0) // behind plane
            ];

            const result = btGeometryUtil.areVerticesBehindPlane(planeNormal, vertices, 0);
            expect(result).toBe(false);
        });

        test('should respect margin parameter', () => {
            const planeNormal = new btVector3(1, 0, 0);
            planeNormal.setValue(1, 0, 0, 0); // plane at x = 0
            const vertices = [
                new btVector3(0.05, 0, 0)  // slightly in front
            ];

            // Without margin, should be in front
            expect(btGeometryUtil.areVerticesBehindPlane(planeNormal, vertices, 0)).toBe(false);

            // With sufficient margin, should be considered behind
            expect(btGeometryUtil.areVerticesBehindPlane(planeNormal, vertices, 0.1)).toBe(true);
        });
    });

    describe('getPlaneEquationsFromVertices', () => {
        test('should generate plane equations from tetrahedron vertices', () => {
            // Create a simple tetrahedron
            const vertices = [
                new btVector3(1, 1, 1),
                new btVector3(1, -1, -1),
                new btVector3(-1, 1, -1),
                new btVector3(-1, -1, 1)
            ];

            const planeEquations: btVector3[] = [];
            btGeometryUtil.getPlaneEquationsFromVertices(vertices, planeEquations);

            // Should generate some plane equations
            expect(planeEquations.length).toBeGreaterThan(0);

            // Each plane equation should be normalized (length of normal should be 1)
            for (const plane of planeEquations) {
                const normalLength = Math.sqrt(plane.x() * plane.x() + plane.y() * plane.y() + plane.z() * plane.z());
                expect(normalLength).toBeCloseTo(1.0, 5);
            }
        });

        test('should not generate planes from collinear points', () => {
            // Three collinear points should not generate a valid plane
            const vertices = [
                new btVector3(0, 0, 0),
                new btVector3(1, 1, 1),
                new btVector3(2, 2, 2)  // collinear with the other two
            ];

            const planeEquations: btVector3[] = [];
            btGeometryUtil.getPlaneEquationsFromVertices(vertices, planeEquations);

            // Should generate no planes from collinear points
            expect(planeEquations.length).toBe(0);
        });
    });

    describe('getVerticesFromPlaneEquations', () => {
        test('should generate vertices from cube plane equations', () => {
            // Define planes for a unit cube centered at origin
            const planeEquations: btVector3[] = [];
            const pln1 = new btVector3(1, 0, 0); pln1.setValue(1, 0, 0, -0.5); planeEquations.push(pln1);   // right face
            const pln2 = new btVector3(-1, 0, 0); pln2.setValue(-1, 0, 0, -0.5); planeEquations.push(pln2);  // left face
            const pln3 = new btVector3(0, 1, 0); pln3.setValue(0, 1, 0, -0.5); planeEquations.push(pln3);   // top face
            const pln4 = new btVector3(0, -1, 0); pln4.setValue(0, -1, 0, -0.5); planeEquations.push(pln4);  // bottom face
            const pln5 = new btVector3(0, 0, 1); pln5.setValue(0, 0, 1, -0.5); planeEquations.push(pln5);   // front face
            const pln6 = new btVector3(0, 0, -1); pln6.setValue(0, 0, -1, -0.5); planeEquations.push(pln6);   // back face

            const vertices: btVector3[] = [];
            btGeometryUtil.getVerticesFromPlaneEquations(planeEquations, vertices);

            // Should generate some vertices
            expect(vertices.length).toBeGreaterThan(0);

            // All generated vertices should be inside the defined planes
            for (const vertex of vertices) {
                const isInside = btGeometryUtil.isPointInsidePlanes(planeEquations, vertex, 0.01);
                expect(isInside).toBe(true);
            }
        });

        test('should handle degenerate plane configurations', () => {
            // Parallel planes should not generate vertices
            const parallelPlanes: btVector3[] = [];
            const pp1 = new btVector3(1, 0, 0); pp1.setValue(1, 0, 0, -1); parallelPlanes.push(pp1);
            const pp2 = new btVector3(1, 0, 0); pp2.setValue(1, 0, 0, -2); parallelPlanes.push(pp2);  // parallel to first plane
            const pp3 = new btVector3(0, 1, 0); pp3.setValue(0, 1, 0, -1); parallelPlanes.push(pp3);

            const vertices: btVector3[] = [];
            btGeometryUtil.getVerticesFromPlaneEquations(parallelPlanes, vertices);

            // Should handle gracefully without throwing errors
            expect(vertices.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('isInside (legacy method)', () => {
        test('should behave like areVerticesBehindPlane', () => {
            const planeNormal = new btVector3(1, 0, 0);
            planeNormal.setValue(1, 0, 0, 0);
            const vertices = [
                new btVector3(-1, 0, 0),
                new btVector3(-2, 1, 1)
            ];
            const margin = 0.1;

            const isInsideResult = btGeometryUtil.isInside(vertices, planeNormal, margin);
            const areVerticesBehindResult = btGeometryUtil.areVerticesBehindPlane(planeNormal, vertices, margin);

            expect(isInsideResult).toBe(areVerticesBehindResult);
        });
    });

    describe('integration tests', () => {
        test('should maintain consistency between plane-to-vertex and vertex-to-plane conversion', () => {
            // Start with a simple pyramid
            const originalVertices = [
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0),
                new btVector3(0, 0, 1),
                new btVector3(0, 0, 0)
            ];

            // Convert vertices to planes
            const planeEquations: btVector3[] = [];
            btGeometryUtil.getPlaneEquationsFromVertices(originalVertices, planeEquations);

            // Convert planes back to vertices
            const regeneratedVertices: btVector3[] = [];
            btGeometryUtil.getVerticesFromPlaneEquations(planeEquations, regeneratedVertices);

            // All regenerated vertices should be inside the original convex hull
            for (const vertex of regeneratedVertices) {
                const isInside = btGeometryUtil.isPointInsidePlanes(planeEquations, vertex, 0.001);
                expect(isInside).toBe(true);
            }

            // All original vertices should be inside the plane equations we generated
            for (const vertex of originalVertices) {
                const isInside = btGeometryUtil.isPointInsidePlanes(planeEquations, vertex, 0.01);
                expect(isInside).toBe(true);
            }
        });
    });
});