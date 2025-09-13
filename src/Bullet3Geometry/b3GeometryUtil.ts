/*
Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

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
 * TypeScript port of Bullet3Geometry/b3GeometryUtil.h and b3GeometryUtil.cpp
 * Helper class for converting between plane equations and vertices
 */

import { b3Vector3 } from '../Bullet3Common/b3Vector3';
import { b3Scalar, b3Fabs } from '../Bullet3Common/b3Scalar';

/**
 * Helper function to check if a plane equation doesn't already exist in the array
 * @param planeEquation The plane equation to check
 * @param planeEquations Array of existing plane equations
 * @returns true if the plane equation doesn't exist, false otherwise
 */
function notExist(planeEquation: b3Vector3, planeEquations: b3Vector3[]): boolean {
    const numbrushes = planeEquations.length;
    for (let i = 0; i < numbrushes; i++) {
        const N1 = planeEquations[i];
        if (planeEquation.dot(N1) > 0.999) {
            return false;
        }
    }
    return true;
}

/**
 * The b3GeometryUtil helper class provides methods to convert between plane equations and vertices.
 * This is useful for geometric computations in collision detection and convex hull generation.
 */
export class b3GeometryUtil {
    /**
     * Generate plane equations from a set of vertices using brute force approach.
     * For each combination of 3 vertices, computes the plane equation and checks if all other vertices are behind it.
     * @param vertices Input array of vertices (modified in place if needed)
     * @param planeEquationsOut Output array of plane equations
     */
    static getPlaneEquationsFromVertices(vertices: b3Vector3[], planeEquationsOut: b3Vector3[]): void {
        const numvertices = vertices.length;
        // Brute force approach: try all combinations of 3 vertices
        for (let i = 0; i < numvertices; i++) {
            const N1 = vertices[i];

            for (let j = i + 1; j < numvertices; j++) {
                const N2 = vertices[j];

                for (let k = j + 1; k < numvertices; k++) {
                    const N3 = vertices[k];

                    const edge0 = N2.subtract(N1);
                    const edge1 = N3.subtract(N1);
                    let normalSign: b3Scalar = 1.0;
                    
                    // Try both normal directions
                    for (let ww = 0; ww < 2; ww++) {
                        const planeEquation = edge0.cross(edge1).scale(normalSign);
                        
                        if (planeEquation.length2() > 0.0001) {
                            const normalizedPlane = planeEquation.normalized();
                            
                            if (notExist(normalizedPlane, planeEquationsOut)) {
                                // Set the w component (distance from origin)
                                normalizedPlane.setW(-normalizedPlane.dot(N1));

                                // Check if all vertices are behind this plane
                                if (b3GeometryUtil.areVerticesBehindPlane(normalizedPlane, vertices, 0.01)) {
                                    planeEquationsOut.push(normalizedPlane);
                                }
                            }
                        }
                        normalSign = -1.0;
                    }
                }
            }
        }
    }

    /**
     * Generate vertices from plane equations by finding intersections of 3 planes.
     * Uses the mathematical formula for finding the intersection point of three planes.
     * @param planeEquations Array of plane equations
     * @param verticesOut Output array of vertices
     */
    static getVerticesFromPlaneEquations(planeEquations: b3Vector3[], verticesOut: b3Vector3[]): void {
        const numbrushes = planeEquations.length;
        // Brute force: try all combinations of 3 planes
        for (let i = 0; i < numbrushes; i++) {
            const N1 = planeEquations[i];

            for (let j = i + 1; j < numbrushes; j++) {
                const N2 = planeEquations[j];

                for (let k = j + 1; k < numbrushes; k++) {
                    const N3 = planeEquations[k];

                    // Calculate cross products for the intersection formula
                    const n2n3 = N2.cross(N3);
                    const n3n1 = N3.cross(N1);
                    const n1n2 = N1.cross(N2);

                    if ((n2n3.length2() > 0.0001) &&
                        (n3n1.length2() > 0.0001) &&
                        (n1n2.length2() > 0.0001)) {
                        
                        // Point P out of 3 plane equations:
                        // P = (d1(N2×N3) + d2(N3×N1) + d3(N1×N2)) / (N1·(N2×N3))
                        const quotient = N1.dot(n2n3);
                        
                        if (b3Fabs(quotient) > 0.000001) {
                            const invQuotient = -1.0 / quotient;
                            
                            // Scale cross products by plane distances
                            const term1 = n2n3.scale(N1.getW());
                            const term2 = n3n1.scale(N2.getW());
                            const term3 = n1n2.scale(N3.getW());
                            
                            // Calculate potential vertex
                            const potentialVertex = term1.add(term2).add(term3).scale(invQuotient);

                            // Check if this vertex is inside all planes
                            if (b3GeometryUtil.isPointInsidePlanes(planeEquations, potentialVertex, 0.01)) {
                                verticesOut.push(potentialVertex);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Check if all vertices are behind (or on) a given plane within a margin.
     * @param planeNormal The plane equation (normal + distance in w component)
     * @param vertices Array of vertices to test
     * @param margin Tolerance margin for the test
     * @returns true if all vertices are behind the plane, false otherwise
     */
    static areVerticesBehindPlane(planeNormal: b3Vector3, vertices: b3Vector3[], margin: b3Scalar): boolean {
        const numvertices = vertices.length;
        for (let i = 0; i < numvertices; i++) {
            const vertex = vertices[i];
            const dist = planeNormal.dot(vertex) + planeNormal.getW() - margin;
            if (dist > 0.0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a point is inside all planes within a margin.
     * A point is inside a plane if the distance to the plane is negative (or within margin).
     * @param planeEquations Array of plane equations
     * @param point The point to test
     * @param margin Tolerance margin for the test
     * @returns true if point is inside all planes, false otherwise
     */
    static isPointInsidePlanes(planeEquations: b3Vector3[], point: b3Vector3, margin: b3Scalar): boolean {
        const numbrushes = planeEquations.length;
        for (let i = 0; i < numbrushes; i++) {
            const N1 = planeEquations[i];
            const dist = N1.dot(point) + N1.getW() - margin;
            if (dist > 0.0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if vertices define a valid convex shape by testing if they are inside their own planes.
     * This is a legacy method that may be used for validation purposes.
     * @param vertices Array of vertices
     * @param planeNormal A reference plane normal for testing
     * @param margin Tolerance margin
     * @returns true if the vertices form a valid convex shape
     */
    static isInside(vertices: b3Vector3[], planeNormal: b3Vector3, margin: b3Scalar): boolean {
        // This method appears to be a placeholder in the original implementation
        // For now, we'll use areVerticesBehindPlane as a reasonable interpretation
        return b3GeometryUtil.areVerticesBehindPlane(planeNormal, vertices, margin);
    }
}