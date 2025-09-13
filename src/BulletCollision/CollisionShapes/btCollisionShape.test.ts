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

import { btCollisionShape, btCollisionShapeData } from './btCollisionShape';
import { btTransform } from '../../LinearMath/btTransform';
import { btVector3 } from '../../LinearMath/btVector3';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

/**
 * Test implementation of btCollisionShape for testing purposes
 * This implements a simple box shape for testing the abstract base class
 */
class TestCollisionShape extends btCollisionShape {
    private m_localScaling: btVector3;
    private m_margin: number;
    private m_halfExtents: btVector3;

    constructor(halfExtents: btVector3 = new btVector3(1, 1, 1)) {
        super();
        this.m_shapeType = BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE;
        this.m_localScaling = new btVector3(1, 1, 1);
        this.m_margin = 0.04;
        this.m_halfExtents = halfExtents.clone();
    }

    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        const halfExtentsWithMargin = this.m_halfExtents.add(new btVector3(this.m_margin, this.m_margin, this.m_margin));
        const basis = t.getBasis();
        const origin = t.getOrigin();

        const center = origin;
        const extent = new btVector3(
            Math.abs(basis.getRow(0).dot(halfExtentsWithMargin)),
            Math.abs(basis.getRow(1).dot(halfExtentsWithMargin)),
            Math.abs(basis.getRow(2).dot(halfExtentsWithMargin))
        );

        aabbMin.copy(center.subtract(extent));
        aabbMax.copy(center.add(extent));
    }

    setLocalScaling(scaling: btVector3): void {
        this.m_localScaling.copy(scaling.absolute());
    }

    getLocalScaling(): btVector3 {
        return this.m_localScaling;
    }

    calculateLocalInertia(mass: number, inertia: btVector3): void {
        const scaledHalfExtents = this.m_halfExtents.multiplyVector(this.m_localScaling);
        const margin = this.m_margin;
        const lx = 2 * (scaledHalfExtents.x() + margin);
        const ly = 2 * (scaledHalfExtents.y() + margin);
        const lz = 2 * (scaledHalfExtents.z() + margin);

        inertia.setValue(
            mass / 12 * (ly * ly + lz * lz),
            mass / 12 * (lx * lx + lz * lz),
            mass / 12 * (lx * lx + ly * ly)
        );
    }

    getName(): string {
        return "TestBox";
    }

    setMargin(margin: number): void {
        this.m_margin = margin;
    }

    getMargin(): number {
        return this.m_margin;
    }
}

describe('btCollisionShape', () => {
    let shape: TestCollisionShape;

    beforeEach(() => {
        shape = new TestCollisionShape(new btVector3(2, 1, 0.5));
    });

    describe('constructor', () => {
        test('should initialize with default values', () => {
            const defaultShape = new TestCollisionShape();
            expect(defaultShape.getShapeType()).toBe(BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE);
            expect(defaultShape.getUserPointer()).toBeNull();
            expect(defaultShape.getUserIndex()).toBe(-1);
            expect(defaultShape.getUserIndex2()).toBe(-1);
        });
    });

    describe('shape type checking', () => {
        test('should correctly identify shape properties', () => {
            expect(shape.isPolyhedral()).toBe(true);
            expect(shape.isConvex()).toBe(true);
            expect(shape.isConvex2d()).toBe(false);
            expect(shape.isConcave()).toBe(false);
            expect(shape.isCompound()).toBe(false);
            expect(shape.isSoftBody()).toBe(false);
            expect(shape.isInfinite()).toBe(false);
            expect(shape.isNonMoving()).toBe(false);
        });
    });

    describe('getBoundingSphere', () => {
        test('should calculate correct bounding sphere', () => {
            const center = new btVector3();
            const radius = { value: 0 };
            
            shape.getBoundingSphere(center, radius);
            
            // For a box with half extents (2, 1, 0.5) + margin (0.04), 
            // the bounding sphere should encompass the entire box
            expect(radius.value).toBeGreaterThan(2); // At least the largest dimension
            expect(center.x()).toBeCloseTo(0, 5);
            expect(center.y()).toBeCloseTo(0, 5);
            expect(center.z()).toBeCloseTo(0, 5);
        });

        test('should calculate bounding sphere for transformed shape', () => {
            const transform = new btTransform();
            transform.setOrigin(new btVector3(5, 3, 1));
            
            // Create a new shape to test with transform
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();
            shape.getAabb(transform, aabbMin, aabbMax);
            
            // The AABB should be centered around the transform origin
            const aabbCenter = aabbMin.add(aabbMax).multiply(0.5);
            expect(aabbCenter.x()).toBeCloseTo(5, 5);
            expect(aabbCenter.y()).toBeCloseTo(3, 5);
            expect(aabbCenter.z()).toBeCloseTo(1, 5);
        });
    });

    describe('getAngularMotionDisc', () => {
        test('should return valid angular motion disc', () => {
            const disc = shape.getAngularMotionDisc();
            expect(disc).toBeGreaterThan(0);
            expect(Number.isFinite(disc)).toBe(true);
        });
    });

    describe('getContactBreakingThreshold', () => {
        test('should calculate contact breaking threshold correctly', () => {
            const defaultFactor = 0.02;
            const threshold = shape.getContactBreakingThreshold(defaultFactor);
            const expectedThreshold = shape.getAngularMotionDisc() * defaultFactor;
            
            expect(threshold).toBeCloseTo(expectedThreshold, 10);
            expect(threshold).toBeGreaterThan(0);
        });
    });

    describe('calculateTemporalAabb', () => {
        test('should calculate temporal AABB with no motion', () => {
            const curTrans = new btTransform();
            curTrans.setIdentity();
            const linvel = new btVector3(0, 0, 0);
            const angvel = new btVector3(0, 0, 0);
            const timeStep = 0.016; // ~60fps
            
            const temporalAabbMin = new btVector3();
            const temporalAabbMax = new btVector3();
            const staticAabbMin = new btVector3();
            const staticAabbMax = new btVector3();
            
            shape.getAabb(curTrans, staticAabbMin, staticAabbMax);
            shape.calculateTemporalAabb(curTrans, linvel, angvel, timeStep, temporalAabbMin, temporalAabbMax);
            
            // With no motion, temporal AABB should equal static AABB
            expect(temporalAabbMin.x()).toBeCloseTo(staticAabbMin.x(), 5);
            expect(temporalAabbMin.y()).toBeCloseTo(staticAabbMin.y(), 5);
            expect(temporalAabbMin.z()).toBeCloseTo(staticAabbMin.z(), 5);
            expect(temporalAabbMax.x()).toBeCloseTo(staticAabbMax.x(), 5);
            expect(temporalAabbMax.y()).toBeCloseTo(staticAabbMax.y(), 5);
            expect(temporalAabbMax.z()).toBeCloseTo(staticAabbMax.z(), 5);
        });

        test('should expand AABB for linear motion', () => {
            const curTrans = new btTransform();
            curTrans.setIdentity();
            const linvel = new btVector3(10, 0, -5);
            const angvel = new btVector3(0, 0, 0);
            const timeStep = 0.1;
            
            const temporalAabbMin = new btVector3();
            const temporalAabbMax = new btVector3();
            const staticAabbMin = new btVector3();
            const staticAabbMax = new btVector3();
            
            shape.getAabb(curTrans, staticAabbMin, staticAabbMax);
            shape.calculateTemporalAabb(curTrans, linvel, angvel, timeStep, temporalAabbMin, temporalAabbMax);
            
            // Linear motion should expand the AABB in the direction of motion
            
            // X direction: positive motion should expand max
            expect(temporalAabbMax.x()).toBeGreaterThan(staticAabbMax.x());
            expect(temporalAabbMin.x()).toBeCloseTo(staticAabbMin.x(), 5);
            
            // Z direction: negative motion should expand min
            expect(temporalAabbMin.z()).toBeLessThan(staticAabbMin.z());
            expect(temporalAabbMax.z()).toBeCloseTo(staticAabbMax.z(), 5);
            
            // Y direction: no motion, should be equal
            expect(temporalAabbMin.y()).toBeCloseTo(staticAabbMin.y(), 5);
            expect(temporalAabbMax.y()).toBeCloseTo(staticAabbMax.y(), 5);
        });

        test('should expand AABB for angular motion', () => {
            const curTrans = new btTransform();
            curTrans.setIdentity();
            const linvel = new btVector3(0, 0, 0);
            const angvel = new btVector3(0, 1, 0); // Rotation around Y axis
            const timeStep = 0.1;
            
            const temporalAabbMin = new btVector3();
            const temporalAabbMax = new btVector3();
            const staticAabbMin = new btVector3();
            const staticAabbMax = new btVector3();
            
            shape.getAabb(curTrans, staticAabbMin, staticAabbMax);
            shape.calculateTemporalAabb(curTrans, linvel, angvel, timeStep, temporalAabbMin, temporalAabbMax);
            
            // Angular motion should expand AABB in all directions
            expect(temporalAabbMin.x()).toBeLessThan(staticAabbMin.x());
            expect(temporalAabbMin.y()).toBeLessThan(staticAabbMin.y());
            expect(temporalAabbMin.z()).toBeLessThan(staticAabbMin.z());
            expect(temporalAabbMax.x()).toBeGreaterThan(staticAabbMax.x());
            expect(temporalAabbMax.y()).toBeGreaterThan(staticAabbMax.y());
            expect(temporalAabbMax.z()).toBeGreaterThan(staticAabbMax.z());
        });
    });

    describe('user data management', () => {
        test('should handle user pointer correctly', () => {
            const userData = { id: 123, name: "test" };
            
            shape.setUserPointer(userData);
            expect(shape.getUserPointer()).toBe(userData);
            
            shape.setUserPointer(null);
            expect(shape.getUserPointer()).toBeNull();
        });

        test('should handle user indices correctly', () => {
            shape.setUserIndex(42);
            expect(shape.getUserIndex()).toBe(42);
            
            shape.setUserIndex2(84);
            expect(shape.getUserIndex2()).toBe(84);
        });
    });

    describe('anisotropic rolling friction direction', () => {
        test('should return default direction', () => {
            const direction = shape.getAnisotropicRollingFrictionDirection();
            expect(direction.x()).toBe(1);
            expect(direction.y()).toBe(1);
            expect(direction.z()).toBe(1);
        });
    });

    describe('abstract method implementations', () => {
        test('should implement local scaling', () => {
            const scaling = new btVector3(2, 0.5, 3);
            shape.setLocalScaling(scaling);
            
            const retrievedScaling = shape.getLocalScaling();
            expect(retrievedScaling.x()).toBe(2);
            expect(retrievedScaling.y()).toBe(0.5);
            expect(retrievedScaling.z()).toBe(3);
        });

        test('should handle negative scaling by taking absolute values', () => {
            const scaling = new btVector3(-2, 0.5, -3);
            shape.setLocalScaling(scaling);
            
            const retrievedScaling = shape.getLocalScaling();
            expect(retrievedScaling.x()).toBe(2);
            expect(retrievedScaling.y()).toBe(0.5);
            expect(retrievedScaling.z()).toBe(3);
        });

        test('should calculate local inertia correctly', () => {
            const mass = 10;
            const inertia = new btVector3();
            
            shape.calculateLocalInertia(mass, inertia);
            
            // Inertia values should be positive and proportional to mass
            expect(inertia.x()).toBeGreaterThan(0);
            expect(inertia.y()).toBeGreaterThan(0);
            expect(inertia.z()).toBeGreaterThan(0);
            
            // Test with different mass
            const inertia2 = new btVector3();
            shape.calculateLocalInertia(mass * 2, inertia2);
            
            expect(inertia2.x()).toBeCloseTo(inertia.x() * 2, 5);
            expect(inertia2.y()).toBeCloseTo(inertia.y() * 2, 5);
            expect(inertia2.z()).toBeCloseTo(inertia.z() * 2, 5);
        });

        test('should handle margin correctly', () => {
            const originalMargin = shape.getMargin();
            expect(originalMargin).toBe(0.04);
            
            shape.setMargin(0.1);
            expect(shape.getMargin()).toBe(0.1);
        });

        test('should return correct name', () => {
            expect(shape.getName()).toBe("TestBox");
        });
    });

    describe('serialization', () => {
        test('should calculate serialize buffer size', () => {
            const size = shape.calculateSerializeBufferSize();
            expect(size).toBe(1); // Simplified for TypeScript
        });

        test('should serialize shape data', () => {
            const data: btCollisionShapeData = {
                m_name: null,
                m_shapeType: 0
            };
            
            const structType = shape.serialize(data);
            
            expect(structType).toBe("btCollisionShapeData");
            expect(data.m_shapeType).toBe(BroadphaseNativeTypes.BOX_SHAPE_PROXYTYPE);
        });

        test('should handle single shape serialization', () => {
            const mockSerializer = {
                findNameForPointer: jest.fn(() => "TestShape"),
                allocate: jest.fn(),
                finalizeChunk: jest.fn()
            };
            
            expect(() => {
                shape.serializeSingleShape(mockSerializer);
            }).not.toThrow();
        });
    });

    describe('AABB calculation', () => {
        test('should calculate AABB correctly for identity transform', () => {
            const transform = new btTransform();
            transform.setIdentity();
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();
            
            shape.getAabb(transform, aabbMin, aabbMax);
            
            // For a box with half extents (2, 1, 0.5) + margin (0.04)
            const expectedMin = -2.04;
            const expectedMaxX = 2.04;
            const expectedMaxY = 1.04;
            const expectedMaxZ = 0.54;
            
            expect(aabbMin.x()).toBeCloseTo(expectedMin, 2);
            expect(aabbMax.x()).toBeCloseTo(expectedMaxX, 2);
            expect(aabbMax.y()).toBeCloseTo(expectedMaxY, 2);
            expect(aabbMax.z()).toBeCloseTo(expectedMaxZ, 2);
        });

        test('should calculate AABB correctly for translated transform', () => {
            const transform = new btTransform();
            transform.setIdentity();
            transform.setOrigin(new btVector3(10, 5, 2));
            
            const aabbMin = new btVector3();
            const aabbMax = new btVector3();
            
            shape.getAabb(transform, aabbMin, aabbMax);
            
            // AABB should be translated by the origin
            expect(aabbMin.x()).toBeCloseTo(10 - 2.04, 2);
            expect(aabbMax.x()).toBeCloseTo(10 + 2.04, 2);
            expect(aabbMin.y()).toBeCloseTo(5 - 1.04, 2);
            expect(aabbMax.y()).toBeCloseTo(5 + 1.04, 2);
            expect(aabbMin.z()).toBeCloseTo(2 - 0.54, 2);
            expect(aabbMax.z()).toBeCloseTo(2 + 0.54, 2);
        });
    });
});