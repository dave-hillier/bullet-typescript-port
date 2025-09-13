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

import { btVector3 } from '../../LinearMath/btVector3';

/**
 * The btTriangleCallback provides a callback for each overlapping triangle when calling processAllTriangles.
 * This callback is called by processAllTriangles for all btConcaveShape derived class, such as btBvhTriangleMeshShape, btStaticPlaneShape and btHeightfieldTerrainShape.
 */
export abstract class btTriangleCallback {
    /**
     * Process a triangle with the given vertices
     * @param triangle Array of 3 btVector3 vertices representing the triangle
     * @param partId The part ID (for multi-part meshes)
     * @param triangleIndex The index of the triangle within the part
     */
    abstract processTriangle(triangle: btVector3[], partId: number, triangleIndex: number): void;

    /**
     * Cleanup method (replaces C++ virtual destructor)
     * Override this if your implementation needs cleanup
     */
    cleanup(): void {
        // Default implementation does nothing
    }
}

/**
 * Internal triangle callback interface used by collision detection algorithms
 * This is typically used internally by Bullet's collision detection system
 */
export abstract class btInternalTriangleIndexCallback {
    /**
     * Internal method to process triangle with index information
     * @param triangle Array of 3 btVector3 vertices representing the triangle  
     * @param partId The part ID (for multi-part meshes)
     * @param triangleIndex The index of the triangle within the part
     */
    abstract internalProcessTriangleIndex(triangle: btVector3[], partId: number, triangleIndex: number): void;

    /**
     * Cleanup method (replaces C++ virtual destructor)
     * Override this if your implementation needs cleanup
     */
    cleanup(): void {
        // Default implementation does nothing
    }
}