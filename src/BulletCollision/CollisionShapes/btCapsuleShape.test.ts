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

import { btCapsuleShape, btCapsuleShapeX, btCapsuleShapeZ } from './btCapsuleShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btQuaternion } from '../../LinearMath/btQuaternion';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
import { SIMD_EPSILON } from '../../LinearMath/btScalar';

// Helper function for approximate vector comparisons
function expectVectorNear(actual: btVector3, expected: btVector3, precision: number = 5): void {
    expect(actual.x()).toBeCloseTo(expected.x(), precision);
    expect(actual.y()).toBeCloseTo(expected.y(), precision);
    expect(actual.z()).toBeCloseTo(expected.z(), precision);
}

// Helper function for approximate number comparisons
function expectClose(actual: number, expected: number, precision: number = 5): void {
    expect(actual).toBeCloseTo(expected, precision);
}

describe('btCapsuleShape', () => {
    describe('Construction and basic properties', () => {
        test('creates capsule shape with correct dimensions', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            expect(capsule.getRadius()).toBeCloseTo(radius);
            expect(capsule.getHalfHeight()).toBeCloseTo(height * 0.5);
            expect(capsule.getUpAxis()).toBe(1); // Y-axis
            expect(capsule.getName()).toBe("CapsuleShape");
            expect(capsule.getShapeType()).toBe(BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE);
        });

        test('sets collision margin equal to radius', () => {
            const radius = 0.5;
            const height = 1.5;
            const capsule = btCapsuleShape.create(radius, height);

            expect(capsule.getMargin()).toBeCloseTo(radius);
        });

        test('implicit shape dimensions are set correctly', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const dimensions = capsule.getImplicitShapeDimensions();
            expectVectorNear(dimensions, new btVector3(radius, height * 0.5, radius));
        });
    });

    describe('Support vertex calculations', () => {
        test('localGetSupportingVertexWithoutMargin returns correct vertices for Y-axis capsule', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            // Test positive Y direction
            const supportPos = capsule.localGetSupportingVertexWithoutMargin(new btVector3(0, 1, 0));
            expectVectorNear(supportPos, new btVector3(0, height * 0.5, 0));

            // Test negative Y direction
            const supportNeg = capsule.localGetSupportingVertexWithoutMargin(new btVector3(0, -1, 0));
            expectVectorNear(supportNeg, new btVector3(0, -height * 0.5, 0));

            // Test X direction (should return one of the caps)
            const supportX = capsule.localGetSupportingVertexWithoutMargin(new btVector3(1, 0, 0));
            const expectedCaps = [new btVector3(0, height * 0.5, 0), new btVector3(0, -height * 0.5, 0)];
            const isValidSupport = expectedCaps.some(cap => 
                Math.abs(supportX.x() - cap.x()) < SIMD_EPSILON &&
                Math.abs(supportX.y() - cap.y()) < SIMD_EPSILON &&
                Math.abs(supportX.z() - cap.z()) < SIMD_EPSILON
            );
            expect(isValidSupport).toBe(true);
        });

        test('localGetSupportingVertexWithoutMargin handles zero vector', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const support = capsule.localGetSupportingVertexWithoutMargin(new btVector3(0, 0, 0));
            
            // Should return one of the cap centers
            const expectedCaps = [new btVector3(0, height * 0.5, 0), new btVector3(0, -height * 0.5, 0)];
            const isValidSupport = expectedCaps.some(cap => 
                Math.abs(support.x() - cap.x()) < SIMD_EPSILON &&
                Math.abs(support.y() - cap.y()) < SIMD_EPSILON &&
                Math.abs(support.z() - cap.z()) < SIMD_EPSILON
            );
            expect(isValidSupport).toBe(true);
        });

        test('batchedUnitVectorGetSupportingVertexWithoutMargin works correctly', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const vectors = [
                new btVector3(0, 1, 0),
                new btVector3(0, -1, 0),
                new btVector3(1, 0, 0),
                new btVector3(0, 0, 1)
            ];
            const supportVertices = [
                new btVector3(0, 0, 0),
                new btVector3(0, 0, 0),
                new btVector3(0, 0, 0),
                new btVector3(0, 0, 0)
            ];

            capsule.batchedUnitVectorGetSupportingVertexWithoutMargin(vectors, supportVertices, 4);

            // Check positive Y
            expectVectorNear(supportVertices[0], new btVector3(0, height * 0.5, 0));
            // Check negative Y
            expectVectorNear(supportVertices[1], new btVector3(0, -height * 0.5, 0));

            // For X and Z directions, should return one of the caps
            const expectedCaps = [new btVector3(0, height * 0.5, 0), new btVector3(0, -height * 0.5, 0)];
            for (let i = 2; i < 4; i++) {
                const isValidSupport = expectedCaps.some(cap => 
                    Math.abs(supportVertices[i].x() - cap.x()) < SIMD_EPSILON &&
                    Math.abs(supportVertices[i].y() - cap.y()) < SIMD_EPSILON &&
                    Math.abs(supportVertices[i].z() - cap.z()) < SIMD_EPSILON
                );
                expect(isValidSupport).toBe(true);
            }
        });
    });

    describe('AABB calculation', () => {
        test('getAabb calculates correct bounding box for identity transform', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin = new btVector3(0, 0, 0);
            const aabbMax = new btVector3(0, 0, 0);

            capsule.getAabb(transform, aabbMin, aabbMax);

            // Expected extents: radius in X/Z, radius + halfHeight in Y
            const expectedMin = new btVector3(-radius, -(radius + height * 0.5), -radius);
            const expectedMax = new btVector3(radius, radius + height * 0.5, radius);

            expectVectorNear(aabbMin, expectedMin);
            expectVectorNear(aabbMax, expectedMax);
        });

        test('getAabb calculates correct bounding box for translated transform', () => {
            const radius = 0.5;
            const height = 1.0;
            const capsule = btCapsuleShape.create(radius, height);

            const transform = new btTransform();
            transform.setIdentity();
            transform.setOrigin(new btVector3(10, 5, -3));

            const aabbMin = new btVector3(0, 0, 0);
            const aabbMax = new btVector3(0, 0, 0);

            capsule.getAabb(transform, aabbMin, aabbMax);

            // Expected extents: radius in X/Z, radius + halfHeight in Y, offset by translation
            const expectedMin = new btVector3(10 - radius, 5 - (radius + height * 0.5), -3 - radius);
            const expectedMax = new btVector3(10 + radius, 5 + (radius + height * 0.5), -3 + radius);

            expectVectorNear(aabbMin, expectedMin);
            expectVectorNear(aabbMax, expectedMax);
        });

        test('getAabb calculates correct bounding box for rotated transform', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            // Rotate 90 degrees around Z axis (Y becomes X)
            const transform = new btTransform();
            const quaternion = new btQuaternion();
            quaternion.setRotation(new btVector3(0, 0, 1), Math.PI / 2);
            transform.setRotation(quaternion);
            transform.setOrigin(new btVector3(0, 0, 0));

            const aabbMin = new btVector3(0, 0, 0);
            const aabbMax = new btVector3(0, 0, 0);

            capsule.getAabb(transform, aabbMin, aabbMax);

            // After rotation, the capsule's Y-axis becomes X-axis
            // So we expect radius + halfHeight in X, radius in Y/Z
            const expectedExtentX = radius + height * 0.5;
            const expectedExtentYZ = radius;

            expect(Math.abs(aabbMin.x() - (-expectedExtentX))).toBeLessThan(0.01);
            expect(Math.abs(aabbMax.x() - expectedExtentX)).toBeLessThan(0.01);
            expect(Math.abs(aabbMin.y() - (-expectedExtentYZ))).toBeLessThan(0.01);
            expect(Math.abs(aabbMax.y() - expectedExtentYZ)).toBeLessThan(0.01);
            expect(Math.abs(aabbMin.z() - (-expectedExtentYZ))).toBeLessThan(0.01);
            expect(Math.abs(aabbMax.z() - expectedExtentYZ)).toBeLessThan(0.01);
        });
    });

    describe('Inertia calculation', () => {
        test('calculateLocalInertia produces reasonable inertia tensor', () => {
            const radius = 1.0;
            const height = 2.0;
            const mass = 10.0;
            const capsule = btCapsuleShape.create(radius, height);

            const inertia = new btVector3(0, 0, 0);
            capsule.calculateLocalInertia(mass, inertia);

            // All inertia components should be positive
            expect(inertia.x()).toBeGreaterThan(0);
            expect(inertia.y()).toBeGreaterThan(0);
            expect(inertia.z()).toBeGreaterThan(0);

            // For a Y-axis capsule, X and Z inertias should be equal and larger than Y
            expectClose(inertia.x(), inertia.z(), 10);
            expect(inertia.y()).toBeLessThan(inertia.x());
        });

        test('calculateLocalInertia scales with mass', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const inertia1 = new btVector3(0, 0, 0);
            const inertia2 = new btVector3(0, 0, 0);

            capsule.calculateLocalInertia(1.0, inertia1);
            capsule.calculateLocalInertia(2.0, inertia2);

            // Double mass should give double inertia
            expectClose(inertia2.x(), 2.0 * inertia1.x(), 10);
            expectClose(inertia2.y(), 2.0 * inertia1.y(), 10);
            expectClose(inertia2.z(), 2.0 * inertia1.z(), 10);
        });
    });

    describe('Local scaling', () => {
        test('setLocalScaling updates dimensions and margin correctly', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const scaling = new btVector3(2.0, 3.0, 0.5);
            capsule.setLocalScaling(scaling);

            // Check that scaling was applied to local scaling
            const localScaling = capsule.getLocalScaling();
            expectVectorNear(localScaling, new btVector3(2.0, 3.0, 0.5));

            // Check that implicit shape dimensions were scaled
            const dimensions = capsule.getImplicitShapeDimensions();
            expectVectorNear(dimensions, new btVector3(radius * 2.0, (height * 0.5) * 3.0, radius * 0.5));

            // Check that collision margin was updated (should be scaled radius)
            expect(capsule.getMargin()).toBeCloseTo(radius * 2.0); // X and Z axis have radius, but radiusAxis = (1+2)%3 = 0 (X)
        });
    });

    describe('Special methods', () => {
        test('setMargin does not change margin (capsule-specific behavior)', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const originalMargin = capsule.getMargin();
            capsule.setMargin(0.5); // Should be ignored

            expect(capsule.getMargin()).toBe(originalMargin);
        });

        test('getAnisotropicRollingFrictionDirection returns correct direction', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            const frictionDir = capsule.getAnisotropicRollingFrictionDirection();
            expectVectorNear(frictionDir, new btVector3(0, 1, 0)); // Y-axis
        });

        test('serialization methods return expected values', () => {
            const radius = 1.0;
            const height = 2.0;
            const capsule = btCapsuleShape.create(radius, height);

            expect(capsule.serialize()).toBe("btCapsuleShapeData");
            expect(capsule.calculateSerializeBufferSize()).toBe(0);

            const data = capsule.getCapsuleSerializationData();
            expect(data.upAxis).toBe(1);
            expect(data.padding).toEqual([0, 0, 0, 0]);
        });
    });
});

describe('btCapsuleShapeX', () => {
    test('creates X-axis capsule with correct orientation', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeX.create(radius, height);

        expect(capsule.getUpAxis()).toBe(0); // X-axis
        expect(capsule.getName()).toBe("CapsuleX");
        expect(capsule.getRadius()).toBeCloseTo(radius);
        expect(capsule.getHalfHeight()).toBeCloseTo(height * 0.5);
    });

    test('support vertices work correctly for X-axis capsule', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeX.create(radius, height);

        // Test positive X direction
        const supportPos = capsule.localGetSupportingVertexWithoutMargin(new btVector3(1, 0, 0));
        expectVectorNear(supportPos, new btVector3(height * 0.5, 0, 0));

        // Test negative X direction
        const supportNeg = capsule.localGetSupportingVertexWithoutMargin(new btVector3(-1, 0, 0));
        expectVectorNear(supportNeg, new btVector3(-height * 0.5, 0, 0));
    });

    test('AABB calculation works for X-axis capsule', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeX.create(radius, height);

        const transform = new btTransform();
        transform.setIdentity();

        const aabbMin = new btVector3(0, 0, 0);
        const aabbMax = new btVector3(0, 0, 0);

        capsule.getAabb(transform, aabbMin, aabbMax);

        // Expected extents: radius + halfHeight in X, radius in Y/Z
        const expectedMin = new btVector3(-(radius + height * 0.5), -radius, -radius);
        const expectedMax = new btVector3(radius + height * 0.5, radius, radius);

        expectVectorNear(aabbMin, expectedMin);
        expectVectorNear(aabbMax, expectedMax);
    });

    test('anisotropic rolling friction direction is X-axis', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeX.create(radius, height);

        const frictionDir = capsule.getAnisotropicRollingFrictionDirection();
        expectVectorNear(frictionDir, new btVector3(1, 0, 0));
    });
});

describe('btCapsuleShapeZ', () => {
    test('creates Z-axis capsule with correct orientation', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeZ.create(radius, height);

        expect(capsule.getUpAxis()).toBe(2); // Z-axis
        expect(capsule.getName()).toBe("CapsuleZ");
        expect(capsule.getRadius()).toBeCloseTo(radius);
        expect(capsule.getHalfHeight()).toBeCloseTo(height * 0.5);
    });

    test('support vertices work correctly for Z-axis capsule', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeZ.create(radius, height);

        // Test positive Z direction
        const supportPos = capsule.localGetSupportingVertexWithoutMargin(new btVector3(0, 0, 1));
        expectVectorNear(supportPos, new btVector3(0, 0, height * 0.5));

        // Test negative Z direction
        const supportNeg = capsule.localGetSupportingVertexWithoutMargin(new btVector3(0, 0, -1));
        expectVectorNear(supportNeg, new btVector3(0, 0, -height * 0.5));
    });

    test('AABB calculation works for Z-axis capsule', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeZ.create(radius, height);

        const transform = new btTransform();
        transform.setIdentity();

        const aabbMin = new btVector3(0, 0, 0);
        const aabbMax = new btVector3(0, 0, 0);

        capsule.getAabb(transform, aabbMin, aabbMax);

        // Expected extents: radius in X/Y, radius + halfHeight in Z
        const expectedMin = new btVector3(-radius, -radius, -(radius + height * 0.5));
        const expectedMax = new btVector3(radius, radius, radius + height * 0.5);

        expectVectorNear(aabbMin, expectedMin);
        expectVectorNear(aabbMax, expectedMax);
    });

    test('anisotropic rolling friction direction is Z-axis', () => {
        const radius = 1.0;
        const height = 2.0;
        const capsule = btCapsuleShapeZ.create(radius, height);

        const frictionDir = capsule.getAnisotropicRollingFrictionDirection();
        expectVectorNear(frictionDir, new btVector3(0, 0, 1));
    });
});

describe('Capsule shapes consistency', () => {
    test('all capsule variants have same radius calculation logic', () => {
        const radius = 1.5;
        const height = 3.0;

        const capsuleY = btCapsuleShape.create(radius, height);
        const capsuleX = btCapsuleShapeX.create(radius, height);
        const capsuleZ = btCapsuleShapeZ.create(radius, height);

        expect(capsuleY.getRadius()).toBeCloseTo(radius);
        expect(capsuleX.getRadius()).toBeCloseTo(radius);
        expect(capsuleZ.getRadius()).toBeCloseTo(radius);

        expect(capsuleY.getHalfHeight()).toBeCloseTo(height * 0.5);
        expect(capsuleX.getHalfHeight()).toBeCloseTo(height * 0.5);
        expect(capsuleZ.getHalfHeight()).toBeCloseTo(height * 0.5);
    });

    test('all capsule variants have consistent volume approximation via inertia', () => {
        const radius = 1.0;
        const height = 2.0;
        const mass = 5.0;

        const capsuleY = btCapsuleShape.create(radius, height);
        const capsuleX = btCapsuleShapeX.create(radius, height);
        const capsuleZ = btCapsuleShapeZ.create(radius, height);

        const inertiaY = new btVector3(0, 0, 0);
        const inertiaX = new btVector3(0, 0, 0);
        const inertiaZ = new btVector3(0, 0, 0);

        capsuleY.calculateLocalInertia(mass, inertiaY);
        capsuleX.calculateLocalInertia(mass, inertiaX);
        capsuleZ.calculateLocalInertia(mass, inertiaZ);

        // The sum of inertia components should be similar (related to overall volume)
        const sumY = inertiaY.x() + inertiaY.y() + inertiaY.z();
        const sumX = inertiaX.x() + inertiaX.y() + inertiaX.z();
        const sumZ = inertiaZ.x() + inertiaZ.y() + inertiaZ.z();

        expectClose(sumY, sumX, 3);
        expectClose(sumY, sumZ, 3);
    });
});

describe('Edge cases and robustness', () => {
    test('handles very small dimensions', () => {
        const radius = 1e-6;
        const height = 1e-5;
        const capsule = btCapsuleShape.create(radius, height);

        expect(capsule.getRadius()).toBeCloseTo(radius, 10);
        expect(capsule.getHalfHeight()).toBeCloseTo(height * 0.5, 10);

        // Should still produce valid support vertices
        const support = capsule.localGetSupportingVertexWithoutMargin(new btVector3(0, 1, 0));
        expect(support.length()).toBeGreaterThanOrEqual(0);
    });

    test('handles large dimensions', () => {
        const radius = 1e6;
        const height = 1e7;
        const capsule = btCapsuleShape.create(radius, height);

        expect(capsule.getRadius()).toBeCloseTo(radius);
        expect(capsule.getHalfHeight()).toBeCloseTo(height * 0.5);

        const inertia = new btVector3(0, 0, 0);
        capsule.calculateLocalInertia(1.0, inertia);
        
        // Inertia should be finite and positive
        expect(isFinite(inertia.x())).toBe(true);
        expect(isFinite(inertia.y())).toBe(true);
        expect(isFinite(inertia.z())).toBe(true);
        expect(inertia.x()).toBeGreaterThan(0);
        expect(inertia.y()).toBeGreaterThan(0);
        expect(inertia.z()).toBeGreaterThan(0);
    });

    test('handles zero height capsule (degenerate to sphere-like)', () => {
        const radius = 1.0;
        const height = 0.0;
        const capsule = btCapsuleShape.create(radius, height);

        expect(capsule.getRadius()).toBeCloseTo(radius);
        expect(capsule.getHalfHeight()).toBeCloseTo(0.0);

        // Support vertices should be at origin
        const support = capsule.localGetSupportingVertexWithoutMargin(new btVector3(0, 1, 0));
        expectVectorNear(support, new btVector3(0, 0, 0));
    });
});