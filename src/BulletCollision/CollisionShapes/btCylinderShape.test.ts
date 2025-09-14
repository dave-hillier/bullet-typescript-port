/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.

Unit tests for btCylinderShape and its variants.
*/

import { btCylinderShape, btCylinderShapeX, btCylinderShapeZ } from './btCylinderShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

describe('btCylinderShape', () => {
    let cylinder: btCylinderShape;
    const halfExtents = new btVector3(1, 2, 1);

    beforeEach(() => {
        cylinder = new btCylinderShape(halfExtents);
    });

    describe('Constructor', () => {
        test('should create cylinder with correct properties', () => {
            expect(cylinder.getUpAxis()).toBe(1); // Y-aligned by default
            expect(cylinder.getShapeType()).toBe(BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE);
        });

        test('should set implicit shape dimensions correctly', () => {
            const dims = cylinder.getImplicitShapeDimensions();
            // Dimensions should be halfExtents minus margin
            expect(dims.x()).toBeCloseTo(halfExtents.x() - cylinder.getMargin());
            expect(dims.y()).toBeCloseTo(halfExtents.y() - cylinder.getMargin());
            expect(dims.z()).toBeCloseTo(halfExtents.z() - cylinder.getMargin());
        });
    });

    describe('Half Extents', () => {
        test('should return correct half extents without margin', () => {
            const extents = cylinder.getHalfExtentsWithoutMargin();
            expect(extents.x()).toBeCloseTo(halfExtents.x() - cylinder.getMargin());
            expect(extents.y()).toBeCloseTo(halfExtents.y() - cylinder.getMargin());
            expect(extents.z()).toBeCloseTo(halfExtents.z() - cylinder.getMargin());
        });

        test('should return correct half extents with margin', () => {
            const extents = cylinder.getHalfExtentsWithMargin();
            const expected = cylinder.getHalfExtentsWithoutMargin();
            const margin = cylinder.getMargin();

            expect(extents.x()).toBeCloseTo(expected.x() + margin);
            expect(extents.y()).toBeCloseTo(expected.y() + margin);
            expect(extents.z()).toBeCloseTo(expected.z() + margin);
        });
    });

    describe('Supporting Vertex', () => {
        test('should return correct supporting vertex for Y-aligned cylinder', () => {
            // Test along Y axis (height direction)
            let vec = new btVector3(0, 1, 0);
            let support = cylinder.localGetSupportingVertexWithoutMargin(vec);
            expect(support.y()).toBeCloseTo(cylinder.getHalfExtentsWithoutMargin().y());

            vec = new btVector3(0, -1, 0);
            support = cylinder.localGetSupportingVertexWithoutMargin(vec);
            expect(support.y()).toBeCloseTo(-cylinder.getHalfExtentsWithoutMargin().y());

            // Test along X axis (radius direction)
            vec = new btVector3(1, 0, 0);
            support = cylinder.localGetSupportingVertexWithoutMargin(vec);
            expect(support.x()).toBeCloseTo(cylinder.getHalfExtentsWithoutMargin().x());
            expect(Math.abs(support.z())).toBeLessThan(0.0001); // Should be close to 0
        });

        test('should handle zero vector for supporting vertex', () => {
            const vec = new btVector3(0, 0, 0);
            const support = cylinder.localGetSupportingVertexWithoutMargin(vec);
            expect(support.x()).toBeCloseTo(cylinder.getHalfExtentsWithoutMargin().x());
        });
    });

    describe('Batched Supporting Vertices', () => {
        test('should compute multiple supporting vertices correctly', () => {
            const vectors = [
                new btVector3(1, 0, 0),
                new btVector3(-1, 0, 0),
                new btVector3(0, 1, 0),
                new btVector3(0, -1, 0)
            ];
            const supportVertices = new Array(4).fill(null).map(() => new btVector3(0, 0, 0));

            cylinder.batchedUnitVectorGetSupportingVertexWithoutMargin(vectors, supportVertices, 4);

            expect(supportVertices[0].x()).toBeCloseTo(cylinder.getHalfExtentsWithoutMargin().x());
            expect(supportVertices[1].x()).toBeCloseTo(-cylinder.getHalfExtentsWithoutMargin().x());
            expect(supportVertices[2].y()).toBeCloseTo(cylinder.getHalfExtentsWithoutMargin().y());
            expect(supportVertices[3].y()).toBeCloseTo(-cylinder.getHalfExtentsWithoutMargin().y());
        });
    });

    describe('Local Inertia', () => {
        test('should calculate correct local inertia for Y-aligned cylinder', () => {
            const mass = 10.0;
            const inertia = new btVector3(0, 0, 0);
            cylinder.calculateLocalInertia(mass, inertia);

            const halfExtents = cylinder.getHalfExtentsWithMargin();
            const radius2 = halfExtents.x() * halfExtents.x();
            const height2 = 4.0 * halfExtents.y() * halfExtents.y();

            const expectedT1 = (mass / 12.0) * height2 + (mass / 4.0) * radius2;
            const expectedT2 = (mass / 2.0) * radius2;

            expect(inertia.x()).toBeCloseTo(expectedT1);
            expect(inertia.y()).toBeCloseTo(expectedT2);
            expect(inertia.z()).toBeCloseTo(expectedT1);
        });
    });

    describe('AABB', () => {
        test('should compute correct AABB', () => {
            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin = new btVector3(0, 0, 0);
            const aabbMax = new btVector3(0, 0, 0);

            cylinder.getAabb(transform, aabbMin, aabbMax);

            const expectedExtents = cylinder.getHalfExtentsWithMargin();
            expect(aabbMin.x()).toBeCloseTo(-expectedExtents.x());
            expect(aabbMin.y()).toBeCloseTo(-expectedExtents.y());
            expect(aabbMin.z()).toBeCloseTo(-expectedExtents.z());
            expect(aabbMax.x()).toBeCloseTo(expectedExtents.x());
            expect(aabbMax.y()).toBeCloseTo(expectedExtents.y());
            expect(aabbMax.z()).toBeCloseTo(expectedExtents.z());
        });
    });

    describe('Margin', () => {
        test('should set margin correctly and adjust dimensions', () => {
            const originalExtentsWithMargin = cylinder.getHalfExtentsWithMargin().clone();
            const newMargin = 0.1;

            cylinder.setMargin(newMargin);

            expect(cylinder.getMargin()).toBeCloseTo(newMargin);
            // Half extents with margin should remain approximately the same after margin adjustment
            const newExtentsWithMargin = cylinder.getHalfExtentsWithMargin();
            expect(newExtentsWithMargin.x()).toBeCloseTo(originalExtentsWithMargin.x(), 1);
            expect(newExtentsWithMargin.y()).toBeCloseTo(originalExtentsWithMargin.y(), 1);
            expect(newExtentsWithMargin.z()).toBeCloseTo(originalExtentsWithMargin.z(), 1);
        });
    });

    describe('Scaling', () => {
        test('should set local scaling correctly', () => {
            const scaling = new btVector3(2, 1.5, 2);
            cylinder.setLocalScaling(scaling);

            const retrievedScaling = cylinder.getLocalScaling();
            expect(retrievedScaling.x()).toBeCloseTo(2);
            expect(retrievedScaling.y()).toBeCloseTo(1.5);
            expect(retrievedScaling.z()).toBeCloseTo(2);
        });
    });

    describe('Properties', () => {
        test('should return correct radius', () => {
            const radius = cylinder.getRadius();
            expect(radius).toBeCloseTo(cylinder.getHalfExtentsWithMargin().x());
        });

        test('should return correct anisotropic rolling friction direction', () => {
            const direction = cylinder.getAnisotropicRollingFrictionDirection();
            expect(direction.x()).toBe(0);
            expect(direction.y()).toBe(1); // Y-aligned cylinder
            expect(direction.z()).toBe(0);
        });

        test('should return correct name', () => {
            expect(cylinder.getName()).toBe('CylinderY');
        });
    });

    describe('Serialization', () => {
        test('should return correct serialization buffer size', () => {
            expect(cylinder.calculateSerializeBufferSize()).toBe(0);
        });

        test('should return correct serialization type name', () => {
            expect(cylinder.serialize()).toBe('btCylinderShapeData');
        });

        test('should return serialization data', () => {
            const data = cylinder.getCylinderShapeData();
            expect(data.upAxis).toBe(1);
            expect(data.padding).toHaveLength(4);
        });
    });
});

describe('btCylinderShapeX', () => {
    let cylinderX: btCylinderShapeX;
    const halfExtents = new btVector3(2, 1, 1);

    beforeEach(() => {
        cylinderX = new btCylinderShapeX(halfExtents);
    });

    describe('Constructor', () => {
        test('should create X-aligned cylinder', () => {
            expect(cylinderX.getUpAxis()).toBe(0); // X-aligned
            expect(cylinderX.getName()).toBe('CylinderX');
        });
    });

    describe('Supporting Vertex', () => {
        test('should return correct supporting vertex for X-aligned cylinder', () => {
            // Test along X axis (height direction)
            let vec = new btVector3(1, 0, 0);
            let support = cylinderX.localGetSupportingVertexWithoutMargin(vec);
            expect(support.x()).toBeCloseTo(cylinderX.getHalfExtentsWithoutMargin().x());

            // Test along Y axis (radius direction)
            vec = new btVector3(0, 1, 0);
            support = cylinderX.localGetSupportingVertexWithoutMargin(vec);
            expect(support.y()).toBeCloseTo(cylinderX.getHalfExtentsWithoutMargin().y());
        });
    });

    describe('Local Inertia', () => {
        test('should calculate correct local inertia for X-aligned cylinder', () => {
            const mass = 10.0;
            const inertia = new btVector3(0, 0, 0);
            cylinderX.calculateLocalInertia(mass, inertia);

            const halfExtents = cylinderX.getHalfExtentsWithMargin();
            const radius2 = halfExtents.y() * halfExtents.y();
            const height2 = 4.0 * halfExtents.x() * halfExtents.x();

            const expectedT1 = (mass / 12.0) * height2 + (mass / 4.0) * radius2;
            const expectedT2 = (mass / 2.0) * radius2;

            expect(inertia.x()).toBeCloseTo(expectedT2); // X is the rotation axis
            expect(inertia.y()).toBeCloseTo(expectedT1);
            expect(inertia.z()).toBeCloseTo(expectedT1);
        });
    });

    describe('Properties', () => {
        test('should return correct radius for X-aligned cylinder', () => {
            const radius = cylinderX.getRadius();
            expect(radius).toBeCloseTo(cylinderX.getHalfExtentsWithMargin().y());
        });

        test('should return correct anisotropic rolling friction direction', () => {
            const direction = cylinderX.getAnisotropicRollingFrictionDirection();
            expect(direction.x()).toBe(1); // X-aligned cylinder
            expect(direction.y()).toBe(0);
            expect(direction.z()).toBe(0);
        });
    });
});

describe('btCylinderShapeZ', () => {
    let cylinderZ: btCylinderShapeZ;
    const halfExtents = new btVector3(1, 1, 2);

    beforeEach(() => {
        cylinderZ = new btCylinderShapeZ(halfExtents);
    });

    describe('Constructor', () => {
        test('should create Z-aligned cylinder', () => {
            expect(cylinderZ.getUpAxis()).toBe(2); // Z-aligned
            expect(cylinderZ.getName()).toBe('CylinderZ');
        });
    });

    describe('Supporting Vertex', () => {
        test('should return correct supporting vertex for Z-aligned cylinder', () => {
            // Test along Z axis (height direction)
            let vec = new btVector3(0, 0, 1);
            let support = cylinderZ.localGetSupportingVertexWithoutMargin(vec);
            expect(support.z()).toBeCloseTo(cylinderZ.getHalfExtentsWithoutMargin().z());

            // Test along X axis (radius direction)
            vec = new btVector3(1, 0, 0);
            support = cylinderZ.localGetSupportingVertexWithoutMargin(vec);
            expect(support.x()).toBeCloseTo(cylinderZ.getHalfExtentsWithoutMargin().x());
        });
    });

    describe('Local Inertia', () => {
        test('should calculate correct local inertia for Z-aligned cylinder', () => {
            const mass = 10.0;
            const inertia = new btVector3(0, 0, 0);
            cylinderZ.calculateLocalInertia(mass, inertia);

            const halfExtents = cylinderZ.getHalfExtentsWithMargin();
            const radius2 = halfExtents.x() * halfExtents.x();
            const height2 = 4.0 * halfExtents.z() * halfExtents.z();

            const expectedT1 = (mass / 12.0) * height2 + (mass / 4.0) * radius2;
            const expectedT2 = (mass / 2.0) * radius2;

            expect(inertia.x()).toBeCloseTo(expectedT1);
            expect(inertia.y()).toBeCloseTo(expectedT1);
            expect(inertia.z()).toBeCloseTo(expectedT2); // Z is the rotation axis
        });
    });

    describe('Properties', () => {
        test('should return correct radius for Z-aligned cylinder', () => {
            const radius = cylinderZ.getRadius();
            expect(radius).toBeCloseTo(cylinderZ.getHalfExtentsWithMargin().x());
        });

        test('should return correct anisotropic rolling friction direction', () => {
            const direction = cylinderZ.getAnisotropicRollingFrictionDirection();
            expect(direction.x()).toBe(0);
            expect(direction.y()).toBe(0);
            expect(direction.z()).toBe(1); // Z-aligned cylinder
        });
    });
});

describe('Cylinder Shape Comparison', () => {
    test('should have different orientations but similar volumes', () => {
        const halfExtents = new btVector3(1, 2, 1);
        const cylinderY = new btCylinderShape(halfExtents);
        const cylinderX = new btCylinderShapeX(new btVector3(2, 1, 1));
        const cylinderZ = new btCylinderShapeZ(new btVector3(1, 1, 2));

        expect(cylinderY.getUpAxis()).toBe(1);
        expect(cylinderX.getUpAxis()).toBe(0);
        expect(cylinderZ.getUpAxis()).toBe(2);

        // All should have the same radius when properly oriented
        expect(cylinderY.getRadius()).toBeCloseTo(1);
        expect(cylinderX.getRadius()).toBeCloseTo(1);
        expect(cylinderZ.getRadius()).toBeCloseTo(1);
    });
});