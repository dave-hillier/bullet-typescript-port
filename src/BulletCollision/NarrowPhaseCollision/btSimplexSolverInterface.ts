/**
 * Bullet Continuous Collision Detection and Physics Library
 * Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org
 *
 * This software is provided 'as-is', without any express or implied warranty.
 * In no event will the authors be held liable for any damages arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it freely,
 * subject to the following restrictions:
 *
 * 1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 *
 * Modified for TypeScript port
 */

import { btVector3 } from "../../LinearMath/btVector3";

/**
 * btSimplexSolverInterface can incrementally calculate distance between origin and up to 4 vertices
 * Used by GJK or Linear Casting. Can be implemented by the Johnson-algorithm or alternative approaches based on
 * voronoi regions or barycentric coordinates
 */
export abstract class btSimplexSolverInterface {
    abstract reset(): void;

    abstract addVertex(w: btVector3, p: btVector3, q: btVector3): void;

    abstract closest(v: btVector3): boolean;

    abstract maxVertex(): number;

    abstract fullSimplex(): boolean;

    abstract getSimplex(pBuf: btVector3[], qBuf: btVector3[], yBuf: btVector3[]): number;

    abstract inSimplex(w: btVector3): boolean;

    abstract backup_closest(v: btVector3): void;

    abstract emptySimplex(): boolean;

    abstract compute_points(p1: btVector3, p2: btVector3): void;

    abstract numVertices(): number;
}