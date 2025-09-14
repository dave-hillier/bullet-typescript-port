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

// Test using Jest framework
import { btCompoundShape, btCompoundShapeChildEqual } from './btCompoundShape';
import { btBoxShape } from './btBoxShape';
import { btSphereShape } from './btSphereShape';
import { btTransform } from '../../LinearMath/btTransform';
import { btVector3 } from '../../LinearMath/btVector3';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

describe('btCompoundShape', () => {
    let compoundShape: btCompoundShape;
    let boxShape: btBoxShape;
    let sphereShape: btSphereShape;

    beforeEach(() => {
        compoundShape = new btCompoundShape();
        boxShape = new btBoxShape(new btVector3(1, 1, 1));
        sphereShape = new btSphereShape(0.5);
    });

    describe('construction', () => {
        test('default constructor', () => {
            const compound = new btCompoundShape();

            expect(compound.getName()).toBe('Compound');
            expect(compound.getShapeType()).toBe(BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE);
            expect(compound.getNumChildShapes()).toBe(0);
            expect(compound.isCompound()).toBe(true);
        });

        test('constructor with dynamic AABB tree enabled', () => {
            const compound = new btCompoundShape(true);

            expect(compound.getDynamicAabbTree()).not.toBeNull();
        });

        test('constructor with dynamic AABB tree disabled', () => {
            const compound = new btCompoundShape(false);

            expect(compound.getDynamicAabbTree()).toBeNull();
        });

        test('constructor with initial capacity', () => {
            const compound = new btCompoundShape(true, 10);

            expect(compound.getNumChildShapes()).toBe(0);
        });
    });

    describe('child shape management', () => {
        test('add child shape', () => {
            const transform = new btTransform();
            transform.setIdentity();

            compoundShape.addChildShape(transform, boxShape);

            expect(compoundShape.getNumChildShapes()).toBe(1);
            expect(compoundShape.getChildShape(0)).toBe(boxShape);
        });

        test('get child transform', () => {
            const transform = new btTransform();
            transform.setIdentity();
            transform.setOrigin(new btVector3(1, 2, 3));

            compoundShape.addChildShape(transform, boxShape);

            const childTransform = compoundShape.getChildTransform(0);
            expect(childTransform.getOrigin().x()).toBeCloseTo(1);
            expect(childTransform.getOrigin().y()).toBeCloseTo(2);
            expect(childTransform.getOrigin().z()).toBeCloseTo(3);
        });

        test('update child transform', () => {
            const initialTransform = new btTransform();
            initialTransform.setIdentity();

            compoundShape.addChildShape(initialTransform, boxShape);

            const newTransform = new btTransform();
            newTransform.setIdentity();
            newTransform.setOrigin(new btVector3(5, 6, 7));

            compoundShape.updateChildTransform(0, newTransform);

            const childTransform = compoundShape.getChildTransform(0);
            expect(childTransform.getOrigin().x()).toBeCloseTo(5);
            expect(childTransform.getOrigin().y()).toBeCloseTo(6);
            expect(childTransform.getOrigin().z()).toBeCloseTo(7);
        });

        test('remove child shape by index', () => {
            const transform = new btTransform();
            transform.setIdentity();

            compoundShape.addChildShape(transform, boxShape);
            compoundShape.addChildShape(transform, sphereShape);

            expect(compoundShape.getNumChildShapes()).toBe(2);

            compoundShape.removeChildShapeByIndex(0);

            expect(compoundShape.getNumChildShapes()).toBe(1);
            expect(compoundShape.getChildShape(0)).toBe(sphereShape);
        });

        test('remove child shape by reference', () => {
            const transform = new btTransform();
            transform.setIdentity();

            compoundShape.addChildShape(transform, boxShape);
            compoundShape.addChildShape(transform, sphereShape);

            expect(compoundShape.getNumChildShapes()).toBe(2);

            compoundShape.removeChildShape(boxShape);

            expect(compoundShape.getNumChildShapes()).toBe(1);
            expect(compoundShape.getChildShape(0)).toBe(sphereShape);
        });
    });

    describe('AABB calculation', () => {
        test('getAabb with no children', () => {
            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            compoundShape.getAabb(transform, aabbMin, aabbMax);

            // Should have zero-size AABB when no children
            expect(aabbMin.x()).toBeLessThanOrEqual(0);
            expect(aabbMin.y()).toBeLessThanOrEqual(0);
            expect(aabbMin.z()).toBeLessThanOrEqual(0);
            expect(aabbMax.x()).toBeGreaterThanOrEqual(0);
            expect(aabbMax.y()).toBeGreaterThanOrEqual(0);
            expect(aabbMax.z()).toBeGreaterThanOrEqual(0);
        });

        test('getAabb with children', () => {
            const childTransform = new btTransform();
            childTransform.setIdentity();

            compoundShape.addChildShape(childTransform, boxShape);

            const transform = new btTransform();
            transform.setIdentity();

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();

            compoundShape.getAabb(transform, aabbMin, aabbMax);

            // Should have non-zero AABB
            expect(aabbMax.x() - aabbMin.x()).toBeGreaterThan(0);
            expect(aabbMax.y() - aabbMin.y()).toBeGreaterThan(0);
            expect(aabbMax.z() - aabbMin.z()).toBeGreaterThan(0);
        });

        test('recalculateLocalAabb', () => {
            const transform1 = new btTransform();
            transform1.setIdentity();
            transform1.setOrigin(new btVector3(-2, 0, 0));

            const transform2 = new btTransform();
            transform2.setIdentity();
            transform2.setOrigin(new btVector3(2, 0, 0));

            compoundShape.addChildShape(transform1, boxShape);
            compoundShape.addChildShape(transform2, boxShape);

            // Force recalculation
            compoundShape.recalculateLocalAabb();

            const worldTransform = new btTransform();
            worldTransform.setIdentity();

            const aabbMin = new btVector3();
            const aabbMax = new btVector3();
            compoundShape.getAabb(worldTransform, aabbMin, aabbMax);

            // Should encompass both boxes
            expect(aabbMin.x()).toBeLessThan(-2);
            expect(aabbMax.x()).toBeGreaterThan(2);
        });
    });

    describe('scaling', () => {
        test('set and get local scaling', () => {
            const scaling = new btVector3(2, 3, 4);

            compoundShape.setLocalScaling(scaling);

            const retrievedScaling = compoundShape.getLocalScaling();
            expect(retrievedScaling.x()).toBeCloseTo(2);
            expect(retrievedScaling.y()).toBeCloseTo(3);
            expect(retrievedScaling.z()).toBeCloseTo(4);
        });
    });

    describe('inertia calculation', () => {
        test('calculateLocalInertia', () => {
            const transform = new btTransform();
            transform.setIdentity();

            compoundShape.addChildShape(transform, boxShape);

            const inertia = new btVector3();
            compoundShape.calculateLocalInertia(1.0, inertia);

            expect(inertia.x()).toBeGreaterThan(0);
            expect(inertia.y()).toBeGreaterThan(0);
            expect(inertia.z()).toBeGreaterThan(0);
        });

        test('calculatePrincipalAxisTransform', () => {
            const transform1 = new btTransform();
            transform1.setIdentity();
            transform1.setOrigin(new btVector3(1, 0, 0));

            const transform2 = new btTransform();
            transform2.setIdentity();
            transform2.setOrigin(new btVector3(-1, 0, 0));

            compoundShape.addChildShape(transform1, boxShape);
            compoundShape.addChildShape(transform2, boxShape);

            const masses = [1.0, 1.0];
            const principal = new btTransform();
            const inertia = new btVector3();

            compoundShape.calculatePrincipalAxisTransform(masses, principal, inertia);

            // Center of mass should be at origin
            expect(principal.getOrigin().x()).toBeCloseTo(0, 5);
            expect(principal.getOrigin().y()).toBeCloseTo(0, 5);
            expect(principal.getOrigin().z()).toBeCloseTo(0, 5);

            // Inertia should be positive
            expect(inertia.x()).toBeGreaterThan(0);
            expect(inertia.y()).toBeGreaterThan(0);
            expect(inertia.z()).toBeGreaterThan(0);
        });
    });

    describe('properties', () => {
        test('margin', () => {
            compoundShape.setMargin(0.5);
            expect(compoundShape.getMargin()).toBeCloseTo(0.5);
        });

        test('update revision', () => {
            const initialRevision = compoundShape.getUpdateRevision();

            const transform = new btTransform();
            transform.setIdentity();
            compoundShape.addChildShape(transform, boxShape);

            expect(compoundShape.getUpdateRevision()).toBeGreaterThan(initialRevision);
        });
    });

    describe('serialization', () => {
        test('serialize empty compound shape', () => {
            const dataBuffer = {
                m_name: null,
                m_shapeType: 0,
                m_childShapePtr: null,
                m_numChildShapes: 0,
                m_collisionMargin: 0
            };

            const result = compoundShape.serialize(dataBuffer);

            expect(result).toBe('btCompoundShapeData');
            expect(dataBuffer.m_numChildShapes).toBe(0);
            expect(dataBuffer.m_childShapePtr).toBeNull();
        });

        test('serialize compound shape with children', () => {
            const transform = new btTransform();
            transform.setIdentity();
            compoundShape.addChildShape(transform, boxShape);

            const dataBuffer = {
                m_name: null,
                m_shapeType: 0,
                m_childShapePtr: null,
                m_numChildShapes: 0,
                m_collisionMargin: 0
            };

            const result = compoundShape.serialize(dataBuffer);

            expect(result).toBe('btCompoundShapeData');
            expect(dataBuffer.m_numChildShapes).toBe(1);
            expect(dataBuffer.m_childShapePtr).not.toBeNull();
            expect(dataBuffer.m_childShapePtr).toHaveLength(1);
        });
    });
});

describe('btCompoundShapeChildEqual', () => {
    test('equal children', () => {
        const transform = new btTransform();
        transform.setIdentity();

        const shape = new btBoxShape(new btVector3(1, 1, 1));

        const child1 = {
            m_transform: transform,
            m_childShape: shape,
            m_childShapeType: shape.getShapeType(),
            m_childMargin: shape.getMargin(),
            m_node: null
        };

        const child2 = {
            m_transform: new btTransform(transform),
            m_childShape: shape,
            m_childShapeType: shape.getShapeType(),
            m_childMargin: shape.getMargin(),
            m_node: null
        };

        expect(btCompoundShapeChildEqual(child1, child2)).toBe(true);
    });

    test('different children', () => {
        const transform1 = new btTransform();
        transform1.setIdentity();

        const transform2 = new btTransform();
        transform2.setIdentity();
        transform2.setOrigin(new btVector3(1, 0, 0));

        const shape = new btBoxShape(new btVector3(1, 1, 1));

        const child1 = {
            m_transform: transform1,
            m_childShape: shape,
            m_childShapeType: shape.getShapeType(),
            m_childMargin: shape.getMargin(),
            m_node: null
        };

        const child2 = {
            m_transform: transform2,
            m_childShape: shape,
            m_childShapeType: shape.getShapeType(),
            m_childMargin: shape.getMargin(),
            m_node: null
        };

        expect(btCompoundShapeChildEqual(child1, child2)).toBe(false);
    });
});