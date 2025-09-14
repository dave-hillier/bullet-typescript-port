/**
 * Bullet Continuous Collision Detection and Physics Library
 * Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org
 *
 * EPA Copyright (c) Ricardo Padrela 2006
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
import { btTransform } from "../../LinearMath/btTransform";
import { btConvexShape } from "../CollisionShapes/btConvexShape";
import { btIDebugDraw } from "../../LinearMath/btIDebugDraw";
import { btConvexPenetrationDepthSolver } from "./btConvexPenetrationDepthSolver";
import { btSimplexSolverInterface } from "./btSimplexSolverInterface";
import { btGjkEpaSolver2, sResults } from "./btGjkEpa2";

/**
 * EpaPenetrationDepthSolver uses the Expanding Polytope Algorithm to
 * calculate the penetration depth between two convex shapes.
 */
export class btGjkEpaPenetrationDepthSolver extends btConvexPenetrationDepthSolver {
    constructor() {
        super();
    }

    calcPenDepth(
        simplexSolver: btSimplexSolverInterface,
        pConvexA: btConvexShape,
        pConvexB: btConvexShape,
        transformA: btTransform,
        transformB: btTransform,
        v: btVector3,
        wWitnessOnA: btVector3,
        wWitnessOnB: btVector3,
        debugDraw?: btIDebugDraw
    ): boolean {
        // Unused parameters (following C++ original behavior)
        // debugDraw is intentionally unused
        // v is intentionally unused
        // simplexSolver is intentionally unused

        const guessVectors: btVector3[] = [
            transformB.getOrigin().subtract(transformA.getOrigin()).safeNormalize(),
            transformA.getOrigin().subtract(transformB.getOrigin()).safeNormalize(),
            new btVector3(0, 0, 1),
            new btVector3(0, 1, 0),
            new btVector3(1, 0, 0),
            new btVector3(1, 1, 0),
            new btVector3(1, 1, 1),
            new btVector3(0, 1, 1),
            new btVector3(1, 0, 1)
        ];

        const numVectors = guessVectors.length;

        for (let i = 0; i < numVectors; i++) {
            simplexSolver.reset();
            const guessVector = guessVectors[i];

            const results: sResults = {
                status: 0,
                witnesses: [new btVector3(), new btVector3()],
                normal: new btVector3(),
                distance: 0
            };

            if (btGjkEpaSolver2.Penetration(
                pConvexA, transformA,
                pConvexB, transformB,
                guessVector, results
            )) {
                wWitnessOnA.copy(results.witnesses[0]);
                wWitnessOnB.copy(results.witnesses[1]);
                v.copy(results.normal);
                return true;
            } else {
                if (btGjkEpaSolver2.Distance(
                    pConvexA, transformA,
                    pConvexB, transformB,
                    guessVector, results
                )) {
                    wWitnessOnA.copy(results.witnesses[0]);
                    wWitnessOnB.copy(results.witnesses[1]);
                    v.copy(results.normal);
                    return false;
                }
            }
        }

        // Failed to find a distance/penetration
        wWitnessOnA.setValue(0, 0, 0);
        wWitnessOnB.setValue(0, 0, 0);
        v.setValue(0, 0, 0);
        return false;
    }
}