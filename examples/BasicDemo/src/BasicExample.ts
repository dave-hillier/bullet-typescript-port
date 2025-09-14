/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2015 Google Inc. http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.

Modified for TypeScript port by Claude Code.
*/

import { btVector3 } from '../../../src/LinearMath/btVector3.js';
import { btTransform } from '../../../src/LinearMath/btTransform.js';
import { SimpleRigidBodyBase } from './SimpleRigidBodyBase.js';
import type { SimpleThreeJsGUIHelper } from './SimpleThreeJsGUIHelper.js';

const ARRAY_SIZE_Y = 5;
const ARRAY_SIZE_X = 5;
const ARRAY_SIZE_Z = 5;

export class BasicExample extends SimpleRigidBodyBase {
    constructor(guiHelper: SimpleThreeJsGUIHelper) {
        super(guiHelper);
    }

    initPhysics(): void {
        // Set up axis
        this.m_guiHelper.setUpAxis(1); // Y-up

        // Create the physics world
        this.createEmptyDynamicsWorld();

        // Create ground shape
        const groundShape = this.createBoxShape(new btVector3(50, 50, 50));
        this.m_collisionShapes.push(groundShape);

        const groundTransform = new btTransform();
        groundTransform.setIdentity();
        groundTransform.setOrigin(new btVector3(0, -50, 0));

        // Create ground rigid body (mass = 0 means static)
        const groundMass = 0;
        const groundBody = this.createRigidBody(groundMass, groundTransform, groundShape, new btVector3(0.2, 0.2, 0.8)); // Blue color

        // Add ground visual
        if ('addGroundPlane' in this.m_guiHelper) {
            (this.m_guiHelper as any).addGroundPlane(50, -50);
        }

        // Create dynamic objects
        const colShape = this.createBoxShape(new btVector3(0.1, 0.1, 0.1));
        this.m_collisionShapes.push(colShape);

        const startTransform = new btTransform();
        startTransform.setIdentity();

        const mass = 1.0;

        // Create a stack of boxes
        for (let k = 0; k < ARRAY_SIZE_Y; k++) {
            for (let i = 0; i < ARRAY_SIZE_X; i++) {
                for (let j = 0; j < ARRAY_SIZE_Z; j++) {
                    startTransform.setOrigin(new btVector3(
                        0.2 * i,
                        2 + 0.2 * k,
                        0.2 * j
                    ));

                    const body = this.createRigidBody(mass, startTransform, colShape, new btVector3(1, 0.4, 0.4)); // Red color
                }
            }
        }

        console.log("BasicExample physics initialized");
        console.log(`Created ${this.m_dynamicsWorld!.getNumCollisionObjects()} collision objects`);
    }
}

// TypeScript equivalent of BasicExampleCreateFunc
export function BasicExampleCreateFunc(guiHelper: SimpleThreeJsGUIHelper): BasicExample {
    return new BasicExample(guiHelper);
}