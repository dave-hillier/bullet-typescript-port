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

import { btVector3 } from './btVector3';
import { btFabs } from './btScalar';

/**
 * Helper function to check if a plane equation already exists in the array
 * @param planeEquation The plane equation to check
 * @param planeEquations Array of existing plane equations
 * @returns true if the plane equation does not exist, false otherwise
 */
function notExist(planeEquation: btVector3, planeEquations: btVector3[]): boolean {
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
 * The btGeometryUtil helper class provides a few methods to convert between plane equations and vertices.
 * This class contains static utility methods for geometric operations like plane calculations,
 * point-in-polygon tests, and convex hull operations.
 */
export class btGeometryUtil {
    /**
     * Generates plane equations from a set of vertices using brute force approach.
     * Each plane is defined by three non-collinear vertices.
     * @param vertices Array of vertices defining the convex hull
     * @param planeEquationsOut Output array to store the generated plane equations
     */
    static getPlaneEquationsFromVertices(vertices: btVector3[], planeEquationsOut: btVector3[]): void {
        const numvertices = vertices.length;
        // brute force:
        for (let i = 0; i < numvertices; i++) {
            const N1 = vertices[i];

            for (let j = i + 1; j < numvertices; j++) {
                const N2 = vertices[j];

                for (let k = j + 1; k < numvertices; k++) {
                    const N3 = vertices[k];

                    let planeEquation: btVector3;
                    const edge0 = N2.subtract(N1);
                    const edge1 = N3.subtract(N1);
                    let normalSign = 1.0;

                    for (let ww = 0; ww < 2; ww++) {
                        planeEquation = edge0.cross(edge1).multiply(normalSign);
                        if (planeEquation.length2() > 0.0001) {
                            planeEquation = planeEquation.normalize();
                            if (notExist(planeEquation, planeEquationsOut)) {
                                // Set the w component (plane distance)
                                const planeWithDistance = new btVector3(
                                    planeEquation.x(),
                                    planeEquation.y(),
                                    planeEquation.z()
                                );
                                planeWithDistance.setValue(
                                    planeEquation.x(),
                                    planeEquation.y(),
                                    planeEquation.z(),
                                    -planeEquation.dot(N1)
                                );

                                // check if inside, and replace supportingVertexOut if needed
                                if (btGeometryUtil.areVerticesBehindPlane(planeWithDistance, vertices, 0.01)) {
                                    planeEquationsOut.push(planeWithDistance);
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
     * Generates vertices from plane equations by finding intersection points of three planes.
     * @param planeEquations Array of plane equations
     * @param verticesOut Output array to store the generated vertices
     */
    static getVerticesFromPlaneEquations(planeEquations: btVector3[], verticesOut: btVector3[]): void {
        const numbrushes = planeEquations.length;
        // brute force:
        for (let i = 0; i < numbrushes; i++) {
            const N1 = planeEquations[i];

            for (let j = i + 1; j < numbrushes; j++) {
                const N2 = planeEquations[j];

                for (let k = j + 1; k < numbrushes; k++) {
                    const N3 = planeEquations[k];

                    const n2n3 = N2.cross(N3);
                    const n3n1 = N3.cross(N1);
                    const n1n2 = N1.cross(N2);

                    if ((n2n3.length2() > 0.0001) &&
                        (n3n1.length2() > 0.0001) &&
                        (n1n2.length2() > 0.0001)) {
                        // point P out of 3 plane equations:
                        //	d1 ( N2 * N3 ) + d2 ( N3 * N1 ) + d3 ( N1 * N2 )
                        //P =  -------------------------------------------------------------------------
                        //   N1 . ( N2 * N3 )

                        const quotient_denom = N1.dot(n2n3);
                        if (btFabs(quotient_denom) > 0.000001) {
                            const quotient = -1.0 / quotient_denom;
                            const term1 = n2n3.multiply(N1.w());
                            const term2 = n3n1.multiply(N2.w());
                            const term3 = n1n2.multiply(N3.w());

                            let potentialVertex = term1.add(term2).add(term3);
                            potentialVertex = potentialVertex.multiply(quotient);

                            // check if inside, and replace supportingVertexOut if needed
                            if (btGeometryUtil.isPointInsidePlanes(planeEquations, potentialVertex, 0.01)) {
                                verticesOut.push(potentialVertex);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Tests if a point is inside all planes (on the negative side of all plane equations).
     * @param planeEquations Array of plane equations
     * @param point Point to test
     * @param margin Safety margin for the test
     * @returns true if the point is inside all planes, false otherwise
     */
    static isPointInsidePlanes(planeEquations: btVector3[], point: btVector3, margin: number): boolean {
        const numbrushes = planeEquations.length;
        for (let i = 0; i < numbrushes; i++) {
            const N1 = planeEquations[i];
            const dist = N1.dot(point) + N1.w() - margin;
            if (dist > 0.0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Tests if all vertices are behind (on the negative side of) a plane.
     * @param planeNormal Plane equation (normal + distance in w component)
     * @param vertices Array of vertices to test
     * @param margin Safety margin for the test
     * @returns true if all vertices are behind the plane, false otherwise
     */
    static areVerticesBehindPlane(planeNormal: btVector3, vertices: btVector3[], margin: number): boolean {
        const numvertices = vertices.length;
        for (let i = 0; i < numvertices; i++) {
            const N1 = vertices[i];
            const dist = planeNormal.dot(N1) + planeNormal.w() - margin;
            if (dist > 0.0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Legacy method - checks if vertices are inside a convex hull defined by other vertices.
     * This method appears to be unused in the original code and may be deprecated.
     * @param vertices Array of vertices
     * @param planeNormal Plane normal to test against
     * @param margin Safety margin
     * @returns true if inside, false otherwise
     */
    static isInside(vertices: btVector3[], planeNormal: btVector3, margin: number): boolean {
        // This method signature suggests it should test if vertices are inside a plane,
        // but the implementation would need to be inferred from usage context.
        // The original C++ header declares this method but the implementation is not provided
        // in the cpp file, suggesting it may be unused or deprecated.

        // Based on the method name and parameters, this likely calls areVerticesBehindPlane
        return btGeometryUtil.areVerticesBehindPlane(planeNormal, vertices, margin);
    }
}