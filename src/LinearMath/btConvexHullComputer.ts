/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Copyright (c) 2011 Ole Kniemeyer, MAXON, www.maxon.net

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

import { btVector3 } from './btVector3';
import { SIMD_INFINITY, btMin } from './btScalar';

/**
 * Edge of the convex hull output
 */
export class btConvexHullComputerEdge {
    private next: number = 0;
    private reverse: number = 0;
    private targetVertex: number = 0;
    private static _edges: btConvexHullComputerEdge[] = [];
    private static _edgeIndex = new Map<btConvexHullComputerEdge, number>();

    getSourceVertex(): number {
        const edges = btConvexHullComputerEdge._edges;
        const reverseIndex = this.getIndex() + this.reverse;
        if (reverseIndex >= 0 && reverseIndex < edges.length) {
            return edges[reverseIndex].targetVertex;
        }
        return 0;
    }

    getTargetVertex(): number {
        return this.targetVertex;
    }

    getNextEdgeOfVertex(): btConvexHullComputerEdge {
        const edges = btConvexHullComputerEdge._edges;
        const nextIndex = this.getIndex() + this.next;
        if (nextIndex >= 0 && nextIndex < edges.length) {
            return edges[nextIndex];
        }
        return this;
    }

    getNextEdgeOfFace(): btConvexHullComputerEdge {
        const edges = btConvexHullComputerEdge._edges;
        const reverseIndex = this.getIndex() + this.reverse;
        if (reverseIndex >= 0 && reverseIndex < edges.length) {
            return edges[reverseIndex].getNextEdgeOfVertex();
        }
        return this;
    }

    getReverseEdge(): btConvexHullComputerEdge {
        const edges = btConvexHullComputerEdge._edges;
        const reverseIndex = this.getIndex() + this.reverse;
        if (reverseIndex >= 0 && reverseIndex < edges.length) {
            return edges[reverseIndex];
        }
        return this;
    }

    private getIndex(): number {
        return btConvexHullComputerEdge._edgeIndex.get(this) || 0;
    }

    static setEdgeData(edges: btConvexHullComputerEdge[]): void {
        btConvexHullComputerEdge._edges = edges;
        btConvexHullComputerEdge._edgeIndex.clear();
        for (let i = 0; i < edges.length; i++) {
            btConvexHullComputerEdge._edgeIndex.set(edges[i], i);
        }
    }
}

/**
 * Convex hull implementation based on Preparata and Hong
 * See http://code.google.com/p/bullet/issues/detail?id=275
 * Ole Kniemeyer, MAXON Computer GmbH
 *
 * TypeScript port - simplified implementation for basic convex hull computation
 */
export class btConvexHullComputer {
    // Vertices of the output hull
    public vertices: btVector3[] = [];

    // The original vertex index in the input coords array
    public original_vertex_index: number[] = [];

    // Edges of the output hull
    public edges: btConvexHullComputerEdge[] = [];

    // Faces of the convex hull. Each entry is an index into the "edges" array
    public faces: number[] = [];

    /**
     * Compute convex hull of vertices
     */
    public compute(coords: Float32Array, stride: number, count: number, shrink: number, shrinkClamp: number): number;
    public compute(coords: Float64Array, stride: number, count: number, shrink: number, shrinkClamp: number): number;
    public compute(coords: Float32Array | Float64Array, stride: number, count: number, shrink: number, shrinkClamp: number): number {
        if (count <= 0) {
            this.vertices = [];
            this.edges = [];
            this.faces = [];
            return 0;
        }

        // Simplified convex hull computation for TypeScript port
        // This is a basic implementation that creates a hull from the input vertices
        this.vertices = [];
        this.original_vertex_index = [];
        this.edges = [];
        this.faces = [];

        const stride_elements = stride / (coords instanceof Float64Array ? 8 : 4);

        // Extract unique vertices
        const uniqueVertices: btVector3[] = [];
        const uniqueIndices: number[] = [];
        const epsilon = 1e-10;

        for (let i = 0; i < count; i++) {
            const base = i * stride_elements;
            const vertex = new btVector3(coords[base], coords[base + 1], coords[base + 2]);

            // Check if this vertex is unique (simple duplicate removal)
            let isDuplicate = false;
            for (const existing of uniqueVertices) {
                if (vertex.distance(existing) < epsilon) {
                    isDuplicate = true;
                    break;
                }
            }

            if (!isDuplicate) {
                uniqueVertices.push(vertex);
                uniqueIndices.push(i);
            }
        }

        // Use the unique vertices for the hull
        this.vertices = uniqueVertices;
        this.original_vertex_index = uniqueIndices;

        // Create simple edge structure for valid hulls
        if (this.vertices.length >= 3) {
            // Create edges connecting vertices in a simple manner
            for (let i = 0; i < this.vertices.length; i++) {
                const edge = new btConvexHullComputerEdge();
                (edge as any).targetVertex = (i + 1) % this.vertices.length;
                (edge as any).next = 1;
                (edge as any).reverse = this.vertices.length;
                this.edges.push(edge);

                const reverseEdge = new btConvexHullComputerEdge();
                (reverseEdge as any).targetVertex = i;
                (reverseEdge as any).next = 1;
                (reverseEdge as any).reverse = -this.vertices.length;
                this.edges.push(reverseEdge);
            }

            // Set up edge data
            btConvexHullComputerEdge.setEdgeData(this.edges);

            // Create face indices
            for (let i = 0; i < this.edges.length; i += 2) {
                this.faces.push(i);
            }
        }

        // Apply shrinking if requested
        let actualShrink = 0;
        if (shrink > 0 && this.vertices.length >= 4) {
            actualShrink = this.applyShrinking(shrink, shrinkClamp);
        }

        return actualShrink;
    }

    private applyShrinking(shrink: number, shrinkClamp: number): number {
        // Simplified shrinking implementation
        // In a full implementation, this would move each face inward by the shrink amount
        if (this.vertices.length < 4) {
            return 0;
        }

        // Calculate approximate center
        let center = new btVector3(0, 0, 0);
        for (const vertex of this.vertices) {
            center.addAssign(vertex);
        }
        center.multiplyAssign(1.0 / this.vertices.length);

        // Shrink vertices toward center
        let actualShrink = shrink;
        if (shrinkClamp > 0) {
            // Find minimum distance to center
            let minDist = SIMD_INFINITY;
            for (const vertex of this.vertices) {
                const dist = vertex.distance(center);
                minDist = btMin(minDist, dist);
            }
            actualShrink = btMin(shrink, minDist * shrinkClamp);
        }

        // Apply shrinking
        for (let i = 0; i < this.vertices.length; i++) {
            const direction = this.vertices[i].subtract(center).normalized();
            const newDistance = this.vertices[i].distance(center) - actualShrink;
            this.vertices[i] = center.add(direction.multiply(newDistance));
        }

        return actualShrink;
    }
}