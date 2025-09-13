/*
Copyright (c) 2003-2013 Gino van den Bergen / Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

/**
 * Unit tests for b3FindSeparatingAxis.ts
 */

import { b3ProjectAxis, b3TestSepAxis, b3FindSeparatingAxis } from './b3FindSeparatingAxis';
import { b3Float4 } from '../../../Bullet3Common/shared/b3Float4';
import { b3Vector3 } from '../../../Bullet3Common/b3Vector3';
import { b3ConvexPolyhedronData, b3GpuFace } from './b3ConvexPolyhedronData';

describe('b3FindSeparatingAxis', () => {
    // Helper function to create a simple box polyhedron
    function createBoxPolyhedron(halfExtents: b3Vector3): {
        hull: b3ConvexPolyhedronData;
        vertices: b3Vector3[];
        uniqueEdges: b3Vector3[];
        faces: b3GpuFace[];
    } {
        const vertices: b3Vector3[] = [
            // Bottom face
            new b3Vector3(-halfExtents.x, -halfExtents.y, -halfExtents.z),
            new b3Vector3(halfExtents.x, -halfExtents.y, -halfExtents.z),
            new b3Vector3(halfExtents.x, halfExtents.y, -halfExtents.z),
            new b3Vector3(-halfExtents.x, halfExtents.y, -halfExtents.z),
            // Top face
            new b3Vector3(-halfExtents.x, -halfExtents.y, halfExtents.z),
            new b3Vector3(halfExtents.x, -halfExtents.y, halfExtents.z),
            new b3Vector3(halfExtents.x, halfExtents.y, halfExtents.z),
            new b3Vector3(-halfExtents.x, halfExtents.y, halfExtents.z)
        ];

        const uniqueEdges: b3Vector3[] = [
            new b3Vector3(1, 0, 0), // X-axis
            new b3Vector3(0, 1, 0), // Y-axis
            new b3Vector3(0, 0, 1)  // Z-axis
        ];

        const faces: b3GpuFace[] = [
            // -Z face
            new b3GpuFace(new b3Float4(0, 0, -1, halfExtents.z), 0, 4),
            // +Z face
            new b3GpuFace(new b3Float4(0, 0, 1, halfExtents.z), 4, 4),
            // -Y face
            new b3GpuFace(new b3Float4(0, -1, 0, halfExtents.y), 8, 4),
            // +Y face
            new b3GpuFace(new b3Float4(0, 1, 0, halfExtents.y), 12, 4),
            // -X face
            new b3GpuFace(new b3Float4(-1, 0, 0, halfExtents.x), 16, 4),
            // +X face
            new b3GpuFace(new b3Float4(1, 0, 0, halfExtents.x), 20, 4)
        ];

        const hull = new b3ConvexPolyhedronData(
            new b3Float4(0, 0, 0, 0), // local center
            new b3Float4(halfExtents.x, halfExtents.y, halfExtents.z, 0), // extents
            new b3Float4(), // mC
            new b3Float4(), // mE
            0, // radius
            0, // face offset
            6, // num faces
            8, // num vertices
            0, // vertex offset
            0, // unique edges offset
            3, // num unique edges
            0 // unused
        );

        return { hull, vertices, uniqueEdges, faces };
    }

    describe('b3ProjectAxis', () => {
        test('should project box vertices correctly onto coordinate axes', () => {
            const boxData = createBoxPolyhedron(new b3Vector3(1, 1, 1));
            const pos = new b3Float4(0, 0, 0, 0);
            const orn = { x: 0, y: 0, z: 0, w: 1 }; // identity quaternion

            // Test projection onto X-axis
            const projX = b3ProjectAxis(boxData.hull, pos, orn, new b3Float4(1, 0, 0, 0), boxData.vertices);
            expect(projX.min).toBe(-1);
            expect(projX.max).toBe(1);

            // Test projection onto Y-axis
            const projY = b3ProjectAxis(boxData.hull, pos, orn, new b3Float4(0, 1, 0, 0), boxData.vertices);
            expect(projY.min).toBe(-1);
            expect(projY.max).toBe(1);

            // Test projection onto Z-axis
            const projZ = b3ProjectAxis(boxData.hull, pos, orn, new b3Float4(0, 0, 1, 0), boxData.vertices);
            expect(projZ.min).toBe(-1);
            expect(projZ.max).toBe(1);
        });

        test('should handle translated position', () => {
            const boxData = createBoxPolyhedron(new b3Vector3(1, 1, 1));
            const pos = new b3Float4(5, 0, 0, 0); // translated 5 units along X
            const orn = { x: 0, y: 0, z: 0, w: 1 }; // identity quaternion

            const proj = b3ProjectAxis(boxData.hull, pos, orn, new b3Float4(1, 0, 0, 0), boxData.vertices);
            expect(proj.min).toBe(4); // -1 + 5
            expect(proj.max).toBe(6); // 1 + 5
        });
    });

    describe('b3TestSepAxis', () => {
        test('should detect separation between non-overlapping boxes', () => {
            const box1Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));
            const box2Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));

            const pos1 = new b3Float4(0, 0, 0, 0);
            const pos2 = new b3Float4(4, 0, 0, 0); // Separated by 4 units on X-axis
            const orn = { x: 0, y: 0, z: 0, w: 1 }; // identity quaternion

            const result = b3TestSepAxis(
                box1Data.hull, box2Data.hull,
                pos1, orn, pos2, orn,
                new b3Float4(1, 0, 0, 0), // X-axis
                box1Data.vertices, box2Data.vertices
            );

            expect(result.separated).toBe(true);
            expect(result.depth).toBe(0);
        });

        test('should detect overlap between intersecting boxes', () => {
            const box1Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));
            const box2Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));

            const pos1 = new b3Float4(0, 0, 0, 0);
            const pos2 = new b3Float4(1.5, 0, 0, 0); // Overlapping by 0.5 units
            const orn = { x: 0, y: 0, z: 0, w: 1 }; // identity quaternion

            const result = b3TestSepAxis(
                box1Data.hull, box2Data.hull,
                pos1, orn, pos2, orn,
                new b3Float4(1, 0, 0, 0), // X-axis
                box1Data.vertices, box2Data.vertices
            );

            expect(result.separated).toBe(false);
            expect(result.depth).toBeCloseTo(0.5, 6);
        });
    });

    describe('b3FindSeparatingAxis', () => {
        test('should find separating axis for non-overlapping boxes', () => {
            const box1Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));
            const box2Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));

            const pos1 = new b3Float4(0, 0, 0, 0);
            const pos2 = new b3Float4(3, 0, 0, 0); // Clearly separated
            const orn = { x: 0, y: 0, z: 0, w: 1 }; // identity quaternion

            const result = b3FindSeparatingAxis(
                box1Data.hull, box2Data.hull,
                pos1, orn, pos2, orn,
                box1Data.vertices, box1Data.uniqueEdges, box1Data.faces,
                box2Data.vertices, box2Data.uniqueEdges, box2Data.faces
            );

            expect(result.separated).toBe(true);
            // The separating axis should be along the X direction
            expect(Math.abs(result.separatingAxis.x)).toBeCloseTo(1, 5);
        });

        test('should return closest separating axis for overlapping boxes', () => {
            const box1Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));
            const box2Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));

            const pos1 = new b3Float4(0, 0, 0, 0);
            const pos2 = new b3Float4(1.5, 0, 0, 0); // Overlapping
            const orn = { x: 0, y: 0, z: 0, w: 1 }; // identity quaternion

            const result = b3FindSeparatingAxis(
                box1Data.hull, box2Data.hull,
                pos1, orn, pos2, orn,
                box1Data.vertices, box1Data.uniqueEdges, box1Data.faces,
                box2Data.vertices, box2Data.uniqueEdges, box2Data.faces
            );

            expect(result.separated).toBe(false);
            // Should return the axis with minimum penetration (likely X-axis)
            expect(Math.abs(result.separatingAxis.x)).toBeCloseTo(1, 5);
        });
    });

    describe('quaternion helper functions', () => {
        test('should handle identity quaternion correctly', () => {
            const box1Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));
            const box2Data = createBoxPolyhedron(new b3Vector3(1, 1, 1));

            const pos1 = new b3Float4(0, 0, 0, 0);
            const pos2 = new b3Float4(0, 0, 3, 0); // Separated along Z-axis
            const orn = { x: 0, y: 0, z: 0, w: 1 }; // identity quaternion

            const result = b3FindSeparatingAxis(
                box1Data.hull, box2Data.hull,
                pos1, orn, pos2, orn,
                box1Data.vertices, box1Data.uniqueEdges, box1Data.faces,
                box2Data.vertices, box2Data.uniqueEdges, box2Data.faces
            );

            expect(result.separated).toBe(true);
        });
    });
});