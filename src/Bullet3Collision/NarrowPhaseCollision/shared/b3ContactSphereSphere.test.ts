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
 * Unit tests for b3ContactSphereSphere
 * Tests the sphere-convex collision detection function
 */

import { computeContactSphereConvex } from './b3ContactSphereSphere';
import { b3Contact4Data } from './b3Contact4Data';
import { b3Float4 } from '../../../Bullet3Common/shared/b3Float4';
import { b3Collidable } from './b3Collidable';
import { b3ConvexPolyhedronData, b3GpuFace } from './b3ConvexPolyhedronData';

// Mock b3RigidBodyData interface
interface b3RigidBodyData {
    m_pos: b3Float4;
    m_quat: { x: number; y: number; z: number; w: number };
    m_linVel: b3Float4;
    m_angVel: b3Float4;
    m_collidableIdx: number;
    m_invMass: number;
    m_restituitionCoeff: number;
    m_frictionCoeff: number;
}

describe('b3ContactSphereSphere', () => {
    describe('computeContactSphereConvex', () => {
        it('should exist and be callable', () => {
            expect(computeContactSphereConvex).toBeDefined();
            expect(typeof computeContactSphereConvex).toBe('function');
        });

        it('should handle basic sphere-convex test without crashing', () => {
            // Create minimal test data
            const rigidBodies: b3RigidBodyData[] = [
                {
                    m_pos: new b3Float4(0, 0, 0, 0),
                    m_quat: { x: 0, y: 0, z: 0, w: 1 },
                    m_linVel: new b3Float4(0, 0, 0, 0),
                    m_angVel: new b3Float4(0, 0, 0, 0),
                    m_collidableIdx: 0,
                    m_invMass: 1,
                    m_restituitionCoeff: 0,
                    m_frictionCoeff: 0.5
                },
                {
                    m_pos: new b3Float4(0, 0, 0, 0),
                    m_quat: { x: 0, y: 0, z: 0, w: 1 },
                    m_linVel: new b3Float4(0, 0, 0, 0),
                    m_angVel: new b3Float4(0, 0, 0, 0),
                    m_collidableIdx: 1,
                    m_invMass: 1,
                    m_restituitionCoeff: 0,
                    m_frictionCoeff: 0.5
                }
            ];

            const sphereCollidable = new b3Collidable();
            sphereCollidable.setSphere(1.0, 0);
            
            const convexCollidable = new b3Collidable();
            convexCollidable.setConvexHull(0);
            
            const collidables: b3Collidable[] = [
                sphereCollidable,
                convexCollidable
            ];

            const convexShapes: b3ConvexPolyhedronData[] = [
                new b3ConvexPolyhedronData()
            ];

            const convexVertices: b3Float4[] = [];
            const convexIndices: number[] = [];
            const faces: b3GpuFace[] = [];
            const globalContactsOut: b3Contact4Data[] = [new b3Contact4Data()];
            const nGlobalContactsOut = { value: 0 };

            // This should not throw an error
            expect(() => {
                computeContactSphereConvex(
                    0, // pairIndex
                    0, // bodyIndexA
                    1, // bodyIndexB
                    0, // collidableIndexA
                    1, // collidableIndexB
                    rigidBodies,
                    collidables,
                    convexShapes,
                    convexVertices,
                    convexIndices,
                    faces,
                    globalContactsOut,
                    nGlobalContactsOut,
                    1 // maxContactCapacity
                );
            }).not.toThrow();
        });
    });
});