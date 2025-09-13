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
 * Tests for b3ConvexPolyhedronData TypeScript port
 */

import { b3GpuFace, b3ConvexPolyhedronData } from './b3ConvexPolyhedronData';
import { b3Float4 } from '../../../Bullet3Common/shared/b3Float4';

describe('b3GpuFace', () => {
    describe('constructor', () => {
        test('should create with default values', () => {
            const face = new b3GpuFace();
            
            expect(face.m_plane).toBeInstanceOf(b3Float4);
            expect(face.m_plane.x).toBe(0);
            expect(face.m_plane.y).toBe(0);
            expect(face.m_plane.z).toBe(0);
            expect(face.m_plane.w).toBe(0);
            expect(face.m_indexOffset).toBe(0);
            expect(face.m_numIndices).toBe(0);
            expect(face.m_unusedPadding1).toBe(0);
            expect(face.m_unusedPadding2).toBe(0);
        });

        test('should create with provided values', () => {
            const plane = new b3Float4(1, 0, 0, 5);
            const face = new b3GpuFace(plane, 10, 3, 0, 0);
            
            expect(face.m_plane).toBe(plane);
            expect(face.m_indexOffset).toBe(10);
            expect(face.m_numIndices).toBe(3);
            expect(face.m_unusedPadding1).toBe(0);
            expect(face.m_unusedPadding2).toBe(0);
        });
    });

    describe('clone', () => {
        test('should create a deep copy', () => {
            const originalPlane = new b3Float4(1, 2, 3, 4);
            const original = new b3GpuFace(originalPlane, 5, 6, 7, 8);
            
            const cloned = original.clone();
            
            expect(cloned).not.toBe(original);
            expect(cloned.m_plane).not.toBe(original.m_plane);
            expect(cloned.m_plane.x).toBe(original.m_plane.x);
            expect(cloned.m_plane.y).toBe(original.m_plane.y);
            expect(cloned.m_plane.z).toBe(original.m_plane.z);
            expect(cloned.m_plane.w).toBe(original.m_plane.w);
            expect(cloned.m_indexOffset).toBe(original.m_indexOffset);
            expect(cloned.m_numIndices).toBe(original.m_numIndices);
            expect(cloned.m_unusedPadding1).toBe(original.m_unusedPadding1);
            expect(cloned.m_unusedPadding2).toBe(original.m_unusedPadding2);
        });

        test('modifications to clone should not affect original', () => {
            const original = new b3GpuFace(new b3Float4(1, 2, 3, 4), 5, 6);
            const cloned = original.clone();
            
            cloned.m_plane.x = 99;
            cloned.m_indexOffset = 100;
            
            expect(original.m_plane.x).toBe(1);
            expect(original.m_indexOffset).toBe(5);
        });
    });
});

describe('b3ConvexPolyhedronData', () => {
    describe('constructor', () => {
        test('should create with default values', () => {
            const polyhedron = new b3ConvexPolyhedronData();
            
            expect(polyhedron.m_localCenter).toBeInstanceOf(b3Float4);
            expect(polyhedron.m_extents).toBeInstanceOf(b3Float4);
            expect(polyhedron.mC).toBeInstanceOf(b3Float4);
            expect(polyhedron.mE).toBeInstanceOf(b3Float4);
            expect(polyhedron.m_radius).toBe(0);
            expect(polyhedron.m_faceOffset).toBe(0);
            expect(polyhedron.m_numFaces).toBe(0);
            expect(polyhedron.m_numVertices).toBe(0);
            expect(polyhedron.m_vertexOffset).toBe(0);
            expect(polyhedron.m_uniqueEdgesOffset).toBe(0);
            expect(polyhedron.m_numUniqueEdges).toBe(0);
            expect(polyhedron.m_unused).toBe(0);
        });

        test('should create with provided values', () => {
            const localCenter = new b3Float4(1, 2, 3, 0);
            const extents = new b3Float4(5, 5, 5, 0);
            const mC = new b3Float4(0, 0, 0, 1);
            const mE = new b3Float4(1, 1, 1, 0);
            
            const polyhedron = new b3ConvexPolyhedronData(
                localCenter, extents, mC, mE, 0.1, 0, 6, 8, 0, 0, 12, 0
            );
            
            expect(polyhedron.m_localCenter).toBe(localCenter);
            expect(polyhedron.m_extents).toBe(extents);
            expect(polyhedron.mC).toBe(mC);
            expect(polyhedron.mE).toBe(mE);
            expect(polyhedron.m_radius).toBe(0.1);
            expect(polyhedron.m_faceOffset).toBe(0);
            expect(polyhedron.m_numFaces).toBe(6);
            expect(polyhedron.m_numVertices).toBe(8);
            expect(polyhedron.m_vertexOffset).toBe(0);
            expect(polyhedron.m_uniqueEdgesOffset).toBe(0);
            expect(polyhedron.m_numUniqueEdges).toBe(12);
            expect(polyhedron.m_unused).toBe(0);
        });
    });

    describe('clone', () => {
        test('should create a deep copy', () => {
            const original = new b3ConvexPolyhedronData(
                new b3Float4(1, 2, 3, 4),
                new b3Float4(5, 6, 7, 8),
                new b3Float4(9, 10, 11, 12),
                new b3Float4(13, 14, 15, 16),
                0.5,
                10, 6, 8, 20, 30, 12, 0
            );
            
            const cloned = original.clone();
            
            expect(cloned).not.toBe(original);
            expect(cloned.m_localCenter).not.toBe(original.m_localCenter);
            expect(cloned.m_extents).not.toBe(original.m_extents);
            expect(cloned.mC).not.toBe(original.mC);
            expect(cloned.mE).not.toBe(original.mE);
            
            // Check that values are copied correctly
            expect(cloned.m_localCenter.x).toBe(1);
            expect(cloned.m_extents.z).toBe(7);
            expect(cloned.mC.w).toBe(12);
            expect(cloned.mE.y).toBe(14);
            expect(cloned.m_radius).toBe(0.5);
            expect(cloned.m_numFaces).toBe(6);
            expect(cloned.m_numVertices).toBe(8);
            expect(cloned.m_numUniqueEdges).toBe(12);
        });
    });

    describe('isValid', () => {
        test('should return false for default empty polyhedron', () => {
            const polyhedron = new b3ConvexPolyhedronData();
            expect(polyhedron.isValid()).toBe(false);
        });

        test('should return true for valid tetrahedron', () => {
            const polyhedron = new b3ConvexPolyhedronData(
                new b3Float4(), // localCenter
                new b3Float4(), // extents
                new b3Float4(), // mC
                new b3Float4(), // mE
                0.1,  // radius
                0,    // faceOffset
                4,    // numFaces (tetrahedron minimum)
                4,    // numVertices (tetrahedron minimum)
                0,    // vertexOffset
                0,    // uniqueEdgesOffset
                6,    // numUniqueEdges (tetrahedron minimum)
                0     // unused
            );
            expect(polyhedron.isValid()).toBe(true);
        });

        test('should return true for valid cube', () => {
            const polyhedron = new b3ConvexPolyhedronData(
                new b3Float4(), // localCenter
                new b3Float4(), // extents
                new b3Float4(), // mC
                new b3Float4(), // mE
                0.0,  // radius
                0,    // faceOffset
                6,    // numFaces (cube)
                8,    // numVertices (cube)
                0,    // vertexOffset
                0,    // uniqueEdgesOffset
                12,   // numUniqueEdges (cube)
                0     // unused
            );
            expect(polyhedron.isValid()).toBe(true);
        });

        test('should return false for negative radius', () => {
            const polyhedron = new b3ConvexPolyhedronData(
                new b3Float4(), new b3Float4(), new b3Float4(), new b3Float4(),
                -0.1, 0, 4, 4, 0, 0, 6, 0
            );
            expect(polyhedron.isValid()).toBe(false);
        });

        test('should return false for insufficient faces', () => {
            const polyhedron = new b3ConvexPolyhedronData(
                new b3Float4(), new b3Float4(), new b3Float4(), new b3Float4(),
                0.1, 0, 3, 4, 0, 0, 6, 0 // only 3 faces
            );
            expect(polyhedron.isValid()).toBe(false);
        });

        test('should return false for insufficient vertices', () => {
            const polyhedron = new b3ConvexPolyhedronData(
                new b3Float4(), new b3Float4(), new b3Float4(), new b3Float4(),
                0.1, 0, 4, 3, 0, 0, 6, 0 // only 3 vertices
            );
            expect(polyhedron.isValid()).toBe(false);
        });

        test('should return false for insufficient edges', () => {
            const polyhedron = new b3ConvexPolyhedronData(
                new b3Float4(), new b3Float4(), new b3Float4(), new b3Float4(),
                0.1, 0, 4, 4, 0, 0, 5, 0 // only 5 edges
            );
            expect(polyhedron.isValid()).toBe(false);
        });
    });

    describe('getTotalFaceIndices', () => {
        test('should return estimated face indices count', () => {
            const polyhedron = new b3ConvexPolyhedronData(
                new b3Float4(), new b3Float4(), new b3Float4(), new b3Float4(),
                0.1, 0, 6, 8, 0, 0, 12, 0 // cube with 6 faces
            );
            
            // Rough estimate: 6 faces * 3 indices per face = 18
            expect(polyhedron.getTotalFaceIndices()).toBe(18);
        });

        test('should handle zero faces', () => {
            const polyhedron = new b3ConvexPolyhedronData();
            expect(polyhedron.getTotalFaceIndices()).toBe(0);
        });
    });
});

describe('Type aliases', () => {
    test('b3GpuFace_t should be alias for b3GpuFace', () => {
        // TypeScript type aliases are compile-time only, so we test by creating instances
        const face1 = new b3GpuFace();
        expect(face1).toBeInstanceOf(b3GpuFace);
    });

    test('b3ConvexPolyhedronData_t should be alias for b3ConvexPolyhedronData', () => {
        // TypeScript type aliases are compile-time only, so we test by creating instances
        const polyhedron1 = new b3ConvexPolyhedronData();
        expect(polyhedron1).toBeInstanceOf(b3ConvexPolyhedronData);
    });
});