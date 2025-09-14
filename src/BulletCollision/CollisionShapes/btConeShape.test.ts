/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.
*/

import { describe, test, expect, beforeEach } from '@jest/globals';
import { btConeShape, btConeShapeX, btConeShapeZ } from './btConeShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

describe('btConeShape', () => {
    let coneShape: btConeShape;
    const testRadius = 1.0;
    const testHeight = 2.0;

    beforeEach(() => {
        coneShape = new btConeShape(testRadius, testHeight);
    });

    describe('Construction', () => {
        test('should create a cone with correct dimensions', () => {
            expect(coneShape.getRadius()).toBe(testRadius);
            expect(coneShape.getHeight()).toBe(testHeight);
        });

        test('should have correct shape type', () => {
            expect(coneShape.getShapeType()).toBe(BroadphaseNativeTypes.CONE_SHAPE_PROXYTYPE);
        });

        test('should have correct name', () => {
            expect(coneShape.getName()).toBe('Cone');
        });

        test('should default to Y-axis up direction', () => {
            expect(coneShape.getConeUpIndex()).toBe(1);
        });
    });

    describe('Dimension accessors', () => {
        test('should allow setting and getting radius', () => {
            const newRadius = 2.5;
            coneShape.setRadius(newRadius);
            expect(coneShape.getRadius()).toBe(newRadius);
        });

        test('should allow setting and getting height', () => {
            const newHeight = 3.0;
            coneShape.setHeight(newHeight);
            expect(coneShape.getHeight()).toBe(newHeight);
        });
    });

    describe('Axis orientation', () => {
        test('should set cone up index correctly for X axis', () => {
            coneShape.setConeUpIndex(0);
            expect(coneShape.getConeUpIndex()).toBe(0);
        });

        test('should set cone up index correctly for Y axis', () => {
            coneShape.setConeUpIndex(1);
            expect(coneShape.getConeUpIndex()).toBe(1);
        });

        test('should set cone up index correctly for Z axis', () => {
            coneShape.setConeUpIndex(2);
            expect(coneShape.getConeUpIndex()).toBe(2);
        });
    });

    describe('Support function', () => {
        test('should return tip point for upward direction', () => {
            const upward = new btVector3(0, 1, 0);
            const support = coneShape.localGetSupportingVertexWithoutMargin(upward);

            expect(support.x()).toBeCloseTo(0, 6);
            expect(support.y()).toBeCloseTo(testHeight / 2, 6);
            expect(support.z()).toBeCloseTo(0, 6);
        });

        test('should return base point for downward direction', () => {
            const downward = new btVector3(0, -1, 0);
            const support = coneShape.localGetSupportingVertexWithoutMargin(downward);

            expect(support.x()).toBeCloseTo(0, 6);
            expect(support.y()).toBeCloseTo(-testHeight / 2, 6);
            expect(support.z()).toBeCloseTo(0, 6);
        });

        test('should return base edge point for horizontal direction', () => {
            const rightward = new btVector3(1, 0, 0);
            const support = coneShape.localGetSupportingVertexWithoutMargin(rightward);

            expect(support.x()).toBeCloseTo(testRadius, 6);
            expect(support.y()).toBeCloseTo(-testHeight / 2, 6);
            expect(support.z()).toBeCloseTo(0, 6);
        });
    });

    describe('Support function with margin', () => {
        test('should include margin in support calculation', () => {
            const margin = 0.1;
            coneShape.setMargin(margin);

            const upward = new btVector3(0, 1, 0);
            const supportWithoutMargin = coneShape.localGetSupportingVertexWithoutMargin(upward);
            const supportWithMargin = coneShape.localGetSupportingVertex(upward);

            // Support with margin should be further out
            expect(supportWithMargin.y()).toBeGreaterThan(supportWithoutMargin.y());
        });
    });

    describe('Batch support query', () => {
        test('should handle batch queries correctly', () => {
            const vectors = [
                new btVector3(1, 0, 0),
                new btVector3(0, 1, 0),
                new btVector3(0, 0, 1)
            ];
            const supports = [
                new btVector3(0, 0, 0),
                new btVector3(0, 0, 0),
                new btVector3(0, 0, 0)
            ];

            coneShape.batchedUnitVectorGetSupportingVertexWithoutMargin(vectors, supports, 3);

            // Verify each support point matches individual queries
            for (let i = 0; i < 3; i++) {
                const individualSupport = coneShape.localGetSupportingVertexWithoutMargin(vectors[i]);
                expect(supports[i].x()).toBeCloseTo(individualSupport.x(), 6);
                expect(supports[i].y()).toBeCloseTo(individualSupport.y(), 6);
                expect(supports[i].z()).toBeCloseTo(individualSupport.z(), 6);
            }
        });
    });

    describe('AABB calculation', () => {
        test('should calculate correct AABB', () => {
            const transform = new btTransform();
            transform.setIdentity();
            const aabbMin = new btVector3(0, 0, 0);
            const aabbMax = new btVector3(0, 0, 0);

            coneShape.getAabb(transform, aabbMin, aabbMax);

            // AABB should contain the cone
            expect(aabbMin.x()).toBeLessThanOrEqual(-testRadius);
            expect(aabbMin.y()).toBeLessThanOrEqual(-testHeight / 2);
            expect(aabbMin.z()).toBeLessThanOrEqual(-testRadius);

            expect(aabbMax.x()).toBeGreaterThanOrEqual(testRadius);
            expect(aabbMax.y()).toBeGreaterThanOrEqual(testHeight / 2);
            expect(aabbMax.z()).toBeGreaterThanOrEqual(testRadius);
        });
    });

    describe('Local inertia calculation', () => {
        test('should calculate reasonable inertia values', () => {
            const mass = 1.0;
            const inertia = new btVector3(0, 0, 0);

            coneShape.calculateLocalInertia(mass, inertia);

            // All inertia components should be positive
            expect(inertia.x()).toBeGreaterThan(0);
            expect(inertia.y()).toBeGreaterThan(0);
            expect(inertia.z()).toBeGreaterThan(0);
        });
    });

    describe('Local scaling', () => {
        test('should scale dimensions correctly', () => {
            const scaling = new btVector3(2, 3, 2);
            const originalRadius = coneShape.getRadius();
            const originalHeight = coneShape.getHeight();

            coneShape.setLocalScaling(scaling);

            // Height should scale with Y axis
            expect(coneShape.getHeight()).toBeCloseTo(originalHeight * 3, 6);
            // Radius should scale with X and Z axes (averaged)
            expect(coneShape.getRadius()).toBeCloseTo(originalRadius * 2, 6);
        });
    });

    describe('Anisotropic rolling friction direction', () => {
        test('should return Y axis for standard cone', () => {
            const direction = coneShape.getAnisotropicRollingFrictionDirection();
            expect(direction.x()).toBe(0);
            expect(direction.y()).toBe(1);
            expect(direction.z()).toBe(0);
        });
    });

    describe('Serialization', () => {
        test('should provide serialization data', () => {
            const data = coneShape.getConeShapeData();
            expect(data.upIndex).toBe(1); // Y axis
            expect(data.padding).toEqual([0, 0, 0, 0]);
        });
    });
});

describe('btConeShapeX', () => {
    let coneShapeX: btConeShapeX;
    const testRadius = 1.0;
    const testHeight = 2.0;

    beforeEach(() => {
        coneShapeX = new btConeShapeX(testRadius, testHeight);
    });

    test('should be oriented along X axis', () => {
        expect(coneShapeX.getConeUpIndex()).toBe(0);
        expect(coneShapeX.getName()).toBe('ConeX');
    });

    test('should have X axis as anisotropic rolling friction direction', () => {
        const direction = coneShapeX.getAnisotropicRollingFrictionDirection();
        expect(direction.x()).toBe(1);
        expect(direction.y()).toBe(0);
        expect(direction.z()).toBe(0);
    });

    test('should return tip point for positive X direction', () => {
        const direction = new btVector3(1, 0, 0);
        const support = coneShapeX.localGetSupportingVertexWithoutMargin(direction);

        expect(support.x()).toBeCloseTo(testHeight / 2, 6);
        expect(support.y()).toBeCloseTo(0, 6);
        expect(support.z()).toBeCloseTo(0, 6);
    });
});

describe('btConeShapeZ', () => {
    let coneShapeZ: btConeShapeZ;
    const testRadius = 1.0;
    const testHeight = 2.0;

    beforeEach(() => {
        coneShapeZ = new btConeShapeZ(testRadius, testHeight);
    });

    test('should be oriented along Z axis', () => {
        expect(coneShapeZ.getConeUpIndex()).toBe(2);
        expect(coneShapeZ.getName()).toBe('ConeZ');
    });

    test('should have Z axis as anisotropic rolling friction direction', () => {
        const direction = coneShapeZ.getAnisotropicRollingFrictionDirection();
        expect(direction.x()).toBe(0);
        expect(direction.y()).toBe(0);
        expect(direction.z()).toBe(1);
    });

    test('should return tip point for positive Z direction', () => {
        const direction = new btVector3(0, 0, 1);
        const support = coneShapeZ.localGetSupportingVertexWithoutMargin(direction);

        expect(support.x()).toBeCloseTo(0, 6);
        expect(support.y()).toBeCloseTo(0, 6);
        expect(support.z()).toBeCloseTo(testHeight / 2, 6);
    });
});

describe('Cone shape variants comparison', () => {
    const testRadius = 1.0;
    const testHeight = 2.0;

    test('should maintain consistent volume across orientations', () => {
        const coneY = new btConeShape(testRadius, testHeight);
        const coneX = new btConeShapeX(testRadius, testHeight);
        const coneZ = new btConeShapeZ(testRadius, testHeight);

        // All should have the same radius and height
        expect(coneX.getRadius()).toBe(coneY.getRadius());
        expect(coneX.getHeight()).toBe(coneY.getHeight());
        expect(coneZ.getRadius()).toBe(coneY.getRadius());
        expect(coneZ.getHeight()).toBe(coneY.getHeight());
    });

    test('should have different up axes', () => {
        const coneY = new btConeShape(testRadius, testHeight);
        const coneX = new btConeShapeX(testRadius, testHeight);
        const coneZ = new btConeShapeZ(testRadius, testHeight);

        expect(coneY.getConeUpIndex()).toBe(1); // Y axis
        expect(coneX.getConeUpIndex()).toBe(0); // X axis
        expect(coneZ.getConeUpIndex()).toBe(2); // Z axis
    });
});