/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btSphereShape } from './btSphereShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btQuaternion } from '../../LinearMath/btQuaternion';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

describe('btSphereShape', () => {
    let sphere: btSphereShape;
    const testRadius = 5.0;

    beforeEach(() => {
        sphere = new btSphereShape(testRadius);
    });

    describe('constructor', () => {
        it('should create sphere with correct radius', () => {
            expect(sphere.getRadius()).toBeCloseTo(testRadius);
        });

        it('should set correct shape type', () => {
            expect(sphere.getShapeType()).toBe(BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE);
        });

        it('should initialize with unit scaling', () => {
            const scaling = sphere.getLocalScaling();
            expect(scaling.x()).toBeCloseTo(1.0);
            expect(scaling.y()).toBeCloseTo(1.0);
            expect(scaling.z()).toBeCloseTo(1.0);
        });

        it('should set collision margin equal to radius', () => {
            expect(sphere.getMargin()).toBeCloseTo(testRadius);
        });

        it('should set implicit shape dimensions correctly', () => {
            const dimensions = sphere.getImplicitShapeDimensions();
            expect(dimensions.x()).toBeCloseTo(testRadius);
            expect(dimensions.y()).toBeCloseTo(0);
            expect(dimensions.z()).toBeCloseTo(0);
        });
    });

    describe('radius management', () => {
        it('should return correct radius', () => {
            expect(sphere.getRadius()).toBeCloseTo(testRadius);
        });

        it('should account for scaling in radius calculation', () => {
            const scaling = new btVector3(2.0, 2.0, 2.0);
            sphere.setLocalScaling(scaling);
            expect(sphere.getRadius()).toBeCloseTo(testRadius * 2.0);
        });

        it('should set unscaled radius correctly', () => {
            const newRadius = 3.0;
            sphere.setUnscaledRadius(newRadius);
            expect(sphere.getRadius()).toBeCloseTo(newRadius);
            expect(sphere.getMargin()).toBeCloseTo(newRadius);
        });

        it('should handle zero radius', () => {
            const zeroSphere = new btSphereShape(0.0);
            expect(zeroSphere.getRadius()).toBeCloseTo(0.0);
            expect(zeroSphere.getMargin()).toBeCloseTo(0.0);
        });

        it('should handle very small radius', () => {
            const smallRadius = 0.001;
            const smallSphere = new btSphereShape(smallRadius);
            expect(smallSphere.getRadius()).toBeCloseTo(smallRadius);
        });

        it('should handle very large radius', () => {
            const largeRadius = 1000.0;
            const largeSphere = new btSphereShape(largeRadius);
            expect(largeSphere.getRadius()).toBeCloseTo(largeRadius);
        });
    });

    describe('supporting vertex calculations', () => {
        it('should return origin for supporting vertex without margin', () => {
            const directions = [
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0),
                new btVector3(0, 0, 1),
                new btVector3(-1, 0, 0),
                new btVector3(0, -1, 0),
                new btVector3(0, 0, -1),
                new btVector3(1, 1, 1).normalize(),
                new btVector3(-1, -1, -1).normalize()
            ];

            directions.forEach(dir => {
                const support = sphere.localGetSupportingVertexWithoutMargin(dir);
                expect(support.x()).toBeCloseTo(0);
                expect(support.y()).toBeCloseTo(0);
                expect(support.z()).toBeCloseTo(0);
            });
        });

        it('should return correct supporting vertex with margin', () => {
            const testCases = [
                { dir: new btVector3(1, 0, 0), expected: new btVector3(testRadius, 0, 0) },
                { dir: new btVector3(0, 1, 0), expected: new btVector3(0, testRadius, 0) },
                { dir: new btVector3(0, 0, 1), expected: new btVector3(0, 0, testRadius) },
                { dir: new btVector3(-1, 0, 0), expected: new btVector3(-testRadius, 0, 0) },
                { dir: new btVector3(0, -1, 0), expected: new btVector3(0, -testRadius, 0) },
                { dir: new btVector3(0, 0, -1), expected: new btVector3(0, 0, -testRadius) }
            ];

            testCases.forEach(({ dir, expected }) => {
                const support = sphere.localGetSupportingVertex(dir);
                expect(support.x()).toBeCloseTo(expected.x());
                expect(support.y()).toBeCloseTo(expected.y());
                expect(support.z()).toBeCloseTo(expected.z());
            });
        });

        it('should handle zero vector direction', () => {
            const zeroVec = new btVector3(0, 0, 0);
            const support = sphere.localGetSupportingVertex(zeroVec);
            // Should use default direction (-1, -1, -1) when input is zero
            const length = Math.sqrt(support.x() * support.x() + support.y() * support.y() + support.z() * support.z());
            expect(length).toBeCloseTo(testRadius);
        });

        it('should handle very small vector direction', () => {
            const tinyVec = new btVector3(1e-10, 1e-10, 1e-10);
            const support = sphere.localGetSupportingVertex(tinyVec);
            const length = Math.sqrt(support.x() * support.x() + support.y() * support.y() + support.z() * support.z());
            expect(length).toBeCloseTo(testRadius);
        });

        it('should normalize direction vector correctly', () => {
            const unnormalizedDir = new btVector3(3, 4, 0); // length = 5
            const support = sphere.localGetSupportingVertex(unnormalizedDir);
            const length = Math.sqrt(support.x() * support.x() + support.y() * support.y() + support.z() * support.z());
            expect(length).toBeCloseTo(testRadius);
            
            // Check direction is correct (normalized)
            expect(support.x()).toBeCloseTo(testRadius * 3 / 5);
            expect(support.y()).toBeCloseTo(testRadius * 4 / 5);
            expect(support.z()).toBeCloseTo(0);
        });
    });

    describe('batched supporting vertex calculations', () => {
        it('should return origin for all directions without margin', () => {
            const directions = [
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0),
                new btVector3(0, 0, 1),
                new btVector3(-1, -1, -1).normalize()
            ];
            const results = new Array(directions.length);
            for (let i = 0; i < results.length; i++) {
                results[i] = new btVector3();
            }

            sphere.batchedUnitVectorGetSupportingVertexWithoutMargin(directions, results, directions.length);

            results.forEach(result => {
                expect(result.x()).toBeCloseTo(0);
                expect(result.y()).toBeCloseTo(0);
                expect(result.z()).toBeCloseTo(0);
            });
        });

        it('should handle empty batch', () => {
            const directions: btVector3[] = [];
            const results: btVector3[] = [];
            sphere.batchedUnitVectorGetSupportingVertexWithoutMargin(directions, results, 0);
            expect(results.length).toBe(0);
        });

        it('should handle single vector batch', () => {
            const directions = [new btVector3(1, 0, 0)];
            const results = [new btVector3()];
            sphere.batchedUnitVectorGetSupportingVertexWithoutMargin(directions, results, 1);

            expect(results[0].x()).toBeCloseTo(0);
            expect(results[0].y()).toBeCloseTo(0);
            expect(results[0].z()).toBeCloseTo(0);
        });
    });

    describe('AABB calculation', () => {
        it('should calculate correct AABB at origin', () => {
            const transform = new btTransform();
            transform.setIdentity();
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            sphere.getAabb(transform, aabbMin, aabbMax);

            expect(aabbMin.x()).toBeCloseTo(-testRadius);
            expect(aabbMin.y()).toBeCloseTo(-testRadius);
            expect(aabbMin.z()).toBeCloseTo(-testRadius);
            expect(aabbMax.x()).toBeCloseTo(testRadius);
            expect(aabbMax.y()).toBeCloseTo(testRadius);
            expect(aabbMax.z()).toBeCloseTo(testRadius);
        });

        it('should calculate correct AABB with translation', () => {
            const transform = new btTransform();
            transform.setIdentity();
            const translation = new btVector3(10, 20, 30);
            transform.setOrigin(translation);

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            sphere.getAabb(transform, aabbMin, aabbMax);

            expect(aabbMin.x()).toBeCloseTo(translation.x() - testRadius);
            expect(aabbMin.y()).toBeCloseTo(translation.y() - testRadius);
            expect(aabbMin.z()).toBeCloseTo(translation.z() - testRadius);
            expect(aabbMax.x()).toBeCloseTo(translation.x() + testRadius);
            expect(aabbMax.y()).toBeCloseTo(translation.y() + testRadius);
            expect(aabbMax.z()).toBeCloseTo(translation.z() + testRadius);
        });

        it('should calculate correct AABB with rotation (should be unchanged)', () => {
            const transform = new btTransform();
            const rotation = new btQuaternion(new btVector3(0, 0, 1), Math.PI / 4);
            transform.setRotation(rotation);
            transform.setOrigin(new btVector3(0, 0, 0));

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            sphere.getAabb(transform, aabbMin, aabbMax);

            // Rotation shouldn't change sphere AABB
            expect(aabbMin.x()).toBeCloseTo(-testRadius);
            expect(aabbMin.y()).toBeCloseTo(-testRadius);
            expect(aabbMin.z()).toBeCloseTo(-testRadius);
            expect(aabbMax.x()).toBeCloseTo(testRadius);
            expect(aabbMax.y()).toBeCloseTo(testRadius);
            expect(aabbMax.z()).toBeCloseTo(testRadius);
        });

        it('should handle zero radius sphere', () => {
            const zeroSphere = new btSphereShape(0.0);
            const transform = new btTransform();
            transform.setIdentity();
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            zeroSphere.getAabb(transform, aabbMin, aabbMax);

            expect(aabbMin.x()).toBeCloseTo(0);
            expect(aabbMin.y()).toBeCloseTo(0);
            expect(aabbMin.z()).toBeCloseTo(0);
            expect(aabbMax.x()).toBeCloseTo(0);
            expect(aabbMax.y()).toBeCloseTo(0);
            expect(aabbMax.z()).toBeCloseTo(0);
        });
    });

    describe('inertia calculation', () => {
        it('should calculate correct inertia for unit mass', () => {
            const mass = 1.0;
            const inertia = new btVector3();
            sphere.calculateLocalInertia(mass, inertia);

            const expectedInertia = 0.4 * mass * testRadius * testRadius;
            expect(inertia.x()).toBeCloseTo(expectedInertia);
            expect(inertia.y()).toBeCloseTo(expectedInertia);
            expect(inertia.z()).toBeCloseTo(expectedInertia);
        });

        it('should calculate correct inertia for different masses', () => {
            const masses = [0.5, 2.0, 10.0, 100.0];
            const inertia = new btVector3();

            masses.forEach(mass => {
                sphere.calculateLocalInertia(mass, inertia);
                const expectedInertia = 0.4 * mass * testRadius * testRadius;
                expect(inertia.x()).toBeCloseTo(expectedInertia);
                expect(inertia.y()).toBeCloseTo(expectedInertia);
                expect(inertia.z()).toBeCloseTo(expectedInertia);
            });
        });

        it('should handle zero mass', () => {
            const mass = 0.0;
            const inertia = new btVector3();
            sphere.calculateLocalInertia(mass, inertia);

            expect(inertia.x()).toBeCloseTo(0);
            expect(inertia.y()).toBeCloseTo(0);
            expect(inertia.z()).toBeCloseTo(0);
        });

        it('should scale inertia with radius squared', () => {
            const smallSphere = new btSphereShape(1.0);
            const largeSphere = new btSphereShape(2.0);
            const mass = 1.0;
            const smallInertia = new btVector3();
            const largeInertia = new btVector3();

            smallSphere.calculateLocalInertia(mass, smallInertia);
            largeSphere.calculateLocalInertia(mass, largeInertia);

            // Large sphere should have 4x the inertia (2² = 4)
            expect(largeInertia.x()).toBeCloseTo(4 * smallInertia.x());
            expect(largeInertia.y()).toBeCloseTo(4 * smallInertia.y());
            expect(largeInertia.z()).toBeCloseTo(4 * smallInertia.z());
        });
    });

    describe('margin management', () => {
        it('should return radius as margin', () => {
            expect(sphere.getMargin()).toBeCloseTo(testRadius);
        });

        it('should update margin when setting unscaled radius', () => {
            const newRadius = 7.0;
            sphere.setUnscaledRadius(newRadius);
            expect(sphere.getMargin()).toBeCloseTo(newRadius);
        });

        it('should handle margin setting', () => {
            const newMargin = 3.0;
            sphere.setMargin(newMargin);
            // For spheres, margin should still be the radius
            expect(sphere.getMargin()).toBeCloseTo(sphere.getRadius());
        });
    });

    describe('scaling', () => {
        it('should apply scaling to radius', () => {
            const scale = 2.0;
            sphere.setLocalScaling(new btVector3(scale, scale, scale));
            expect(sphere.getRadius()).toBeCloseTo(testRadius * scale);
        });

        it('should use X component of scaling for radius', () => {
            // Non-uniform scaling uses X component for sphere radius
            sphere.setLocalScaling(new btVector3(3.0, 2.0, 1.0));
            expect(sphere.getRadius()).toBeCloseTo(testRadius * 3.0);
        });

        it('should affect AABB with scaling', () => {
            const scale = 0.5;
            sphere.setLocalScaling(new btVector3(scale, scale, scale));
            
            const transform = new btTransform();
            transform.setIdentity();
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            sphere.getAabb(transform, aabbMin, aabbMax);

            const expectedRadius = testRadius * scale;
            expect(aabbMin.x()).toBeCloseTo(-expectedRadius);
            expect(aabbMax.x()).toBeCloseTo(expectedRadius);
        });
    });

    describe('shape identification', () => {
        it('should return correct name', () => {
            expect(sphere.getName()).toBe('SPHERE');
        });

        it('should have correct shape type', () => {
            expect(sphere.getShapeType()).toBe(BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE);
        });
    });

    describe('edge cases and robustness', () => {
        it('should handle negative radius gracefully', () => {
            const negativeSphere = new btSphereShape(-1.0);
            // Implementation should handle this appropriately
            expect(negativeSphere.getRadius()).toBe(-1.0); // Or could be absolute value
        });

        it('should handle very large radius', () => {
            const hugeSphere = new btSphereShape(1e6);
            expect(hugeSphere.getRadius()).toBeCloseTo(1e6);
            
            const transform = new btTransform();
            transform.setIdentity();
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();
            hugeSphere.getAabb(transform, aabbMin, aabbMax);
            
            expect(aabbMin.x()).toBeCloseTo(-1e6);
            expect(aabbMax.x()).toBeCloseTo(1e6);
        });

        it('should handle very small radius', () => {
            const tinySphere = new btSphereShape(1e-10);
            expect(tinySphere.getRadius()).toBeCloseTo(1e-10);
            
            const inertia = new btVector3();
            tinySphere.calculateLocalInertia(1.0, inertia);
            expect(inertia.x()).toBeCloseTo(0.4 * 1e-20, 1e-25);
        });

        it('should maintain consistency between radius and margin', () => {
            const radii = [0.1, 1.0, 5.0, 100.0];
            radii.forEach(radius => {
                const testSphere = new btSphereShape(radius);
                expect(testSphere.getRadius()).toBeCloseTo(radius);
                expect(testSphere.getMargin()).toBeCloseTo(radius);
            });
        });
    });
});