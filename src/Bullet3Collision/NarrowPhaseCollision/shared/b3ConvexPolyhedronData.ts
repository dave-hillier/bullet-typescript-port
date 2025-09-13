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
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/shared/b3ConvexPolyhedronData.h
 * Data structures for convex polyhedron representation in GPU collision detection
 */

import { b3Float4 } from '../../../Bullet3Common/shared/b3Float4';

/**
 * GPU-optimized face representation for convex polyhedrons
 * Contains plane equation and index data for efficient face processing
 */
export class b3GpuFace {
    /** Plane equation in the form (nx, ny, nz, d) where n is the normal and d is the distance */
    public m_plane: b3Float4;
    
    /** Offset into the vertex index array where this face's indices start */
    public m_indexOffset: number;
    
    /** Number of vertex indices that define this face */
    public m_numIndices: number;
    
    /** Unused padding for memory alignment (kept for compatibility) */
    public m_unusedPadding1: number;
    
    /** Unused padding for memory alignment (kept for compatibility) */
    public m_unusedPadding2: number;

    constructor(
        plane: b3Float4 = new b3Float4(),
        indexOffset: number = 0,
        numIndices: number = 0,
        unusedPadding1: number = 0,
        unusedPadding2: number = 0
    ) {
        this.m_plane = plane;
        this.m_indexOffset = indexOffset;
        this.m_numIndices = numIndices;
        this.m_unusedPadding1 = unusedPadding1;
        this.m_unusedPadding2 = unusedPadding2;
    }

    /**
     * Create a copy of this GPU face
     */
    clone(): b3GpuFace {
        return new b3GpuFace(
            new b3Float4(this.m_plane.x, this.m_plane.y, this.m_plane.z, this.m_plane.w),
            this.m_indexOffset,
            this.m_numIndices,
            this.m_unusedPadding1,
            this.m_unusedPadding2
        );
    }
}

/**
 * Convex polyhedron data structure for GPU collision detection
 * Contains geometric properties and indexing information for efficient processing
 */
export class b3ConvexPolyhedronData {
    /** Local center of the convex polyhedron in object space */
    public m_localCenter: b3Float4;
    
    /** Extents (half-sizes) of the axis-aligned bounding box */
    public m_extents: b3Float4;
    
    /** Additional geometric parameter C (usage context-dependent) */
    public mC: b3Float4;
    
    /** Additional geometric parameter E (usage context-dependent) */
    public mE: b3Float4;

    /** Radius for sphere-based collision margin */
    public m_radius: number;
    
    /** Offset into the face array where this polyhedron's faces start */
    public m_faceOffset: number;
    
    /** Number of faces in this convex polyhedron */
    public m_numFaces: number;
    
    /** Number of vertices in this convex polyhedron */
    public m_numVertices: number;

    /** Offset into the vertex array where this polyhedron's vertices start */
    public m_vertexOffset: number;
    
    /** Offset into the unique edges array where this polyhedron's edges start */
    public m_uniqueEdgesOffset: number;
    
    /** Number of unique edges in this convex polyhedron */
    public m_numUniqueEdges: number;
    
    /** Unused field for potential future expansion or memory alignment */
    public m_unused: number;

    constructor(
        localCenter: b3Float4 = new b3Float4(),
        extents: b3Float4 = new b3Float4(),
        mC: b3Float4 = new b3Float4(),
        mE: b3Float4 = new b3Float4(),
        radius: number = 0,
        faceOffset: number = 0,
        numFaces: number = 0,
        numVertices: number = 0,
        vertexOffset: number = 0,
        uniqueEdgesOffset: number = 0,
        numUniqueEdges: number = 0,
        unused: number = 0
    ) {
        this.m_localCenter = localCenter;
        this.m_extents = extents;
        this.mC = mC;
        this.mE = mE;
        this.m_radius = radius;
        this.m_faceOffset = faceOffset;
        this.m_numFaces = numFaces;
        this.m_numVertices = numVertices;
        this.m_vertexOffset = vertexOffset;
        this.m_uniqueEdgesOffset = uniqueEdgesOffset;
        this.m_numUniqueEdges = numUniqueEdges;
        this.m_unused = unused;
    }

    /**
     * Create a copy of this convex polyhedron data
     */
    clone(): b3ConvexPolyhedronData {
        return new b3ConvexPolyhedronData(
            new b3Float4(this.m_localCenter.x, this.m_localCenter.y, this.m_localCenter.z, this.m_localCenter.w),
            new b3Float4(this.m_extents.x, this.m_extents.y, this.m_extents.z, this.m_extents.w),
            new b3Float4(this.mC.x, this.mC.y, this.mC.z, this.mC.w),
            new b3Float4(this.mE.x, this.mE.y, this.mE.z, this.mE.w),
            this.m_radius,
            this.m_faceOffset,
            this.m_numFaces,
            this.m_numVertices,
            this.m_vertexOffset,
            this.m_uniqueEdgesOffset,
            this.m_numUniqueEdges,
            this.m_unused
        );
    }

    /**
     * Check if this polyhedron data has valid geometric properties
     */
    isValid(): boolean {
        return this.m_numFaces >= 4 && // Minimum for a convex polyhedron (tetrahedron)
               this.m_numVertices >= 4 &&
               this.m_numUniqueEdges >= 6 &&
               this.m_radius >= 0;
    }

    /**
     * Get the total number of face indices for this polyhedron
     * Note: This would require access to the actual face data to calculate accurately
     */
    getTotalFaceIndices(): number {
        // This is a placeholder - in practice, you'd need to iterate through faces
        // and sum up their m_numIndices values
        return this.m_numFaces * 3; // Rough estimate assuming triangular faces
    }
}

// Type aliases for compatibility with C++ typedef pattern
export type b3GpuFace_t = b3GpuFace;
export type b3ConvexPolyhedronData_t = b3ConvexPolyhedronData;