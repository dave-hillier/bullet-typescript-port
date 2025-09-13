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

import { 
    btCollisionObject, 
    ACTIVE_TAG, 
    ISLAND_SLEEPING, 
    DISABLE_DEACTIVATION,
    DISABLE_SIMULATION
} from './btCollisionObject';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btCollisionShape } from '../CollisionShapes/btCollisionShape';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

// Mock collision shape for testing
class MockCollisionShape extends btCollisionShape {
    constructor() {
        super();
        this.m_shapeType = BroadphaseNativeTypes.SPHERE_SHAPE_PROXYTYPE;
    }

    getAabb(_t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        aabbMin.setValue(-1, -1, -1);
        aabbMax.setValue(1, 1, 1);
    }

    calculateLocalInertia(mass: number, inertia: btVector3): void {
        inertia.setValue(0.4 * mass, 0.4 * mass, 0.4 * mass);
    }

    setLocalScaling(_scaling: btVector3): void {
        // Mock implementation
    }

    getLocalScaling(): btVector3 {
        return new btVector3(1, 1, 1);
    }

    setMargin(_margin: number): void {
        // Mock implementation
    }

    getMargin(): number {
        return 0.04;
    }

    getShapeType(): number {
        return this.m_shapeType;
    }

    getName(): string {
        return 'MockShape';
    }
}

describe('btCollisionObject', () => {
    let collisionObject: btCollisionObject;
    let mockShape: MockCollisionShape;

    beforeEach(() => {
        collisionObject = new btCollisionObject();
        mockShape = new MockCollisionShape();
    });

    describe('Construction', () => {
        test('should initialize with default values', () => {
            expect(collisionObject.getActivationState()).toBe(ACTIVE_TAG);
            expect(collisionObject.getCollisionFlags()).toBe(btCollisionObject.CollisionFlags.CF_DYNAMIC_OBJECT);
            expect(collisionObject.getFriction()).toBe(0.5);
            expect(collisionObject.getRestitution()).toBe(0);
            expect(collisionObject.getHitFraction()).toBe(1);
            expect(collisionObject.getCollisionShape()).toBeNull();
            expect(collisionObject.isActive()).toBe(true);
        });

        test('should initialize world transform as identity', () => {
            const transform = collisionObject.getWorldTransform();
            expect(transform.getOrigin().x()).toBe(0);
            expect(transform.getOrigin().y()).toBe(0);
            expect(transform.getOrigin().z()).toBe(0);
        });
    });

    describe('Collision Shape Management', () => {
        test('should set and get collision shape', () => {
            collisionObject.setCollisionShape(mockShape);
            expect(collisionObject.getCollisionShape()).toBe(mockShape);
        });

        test('should increment update revision when setting collision shape', () => {
            const initialRevision = collisionObject.getUpdateRevisionInternal();
            collisionObject.setCollisionShape(mockShape);
            expect(collisionObject.getUpdateRevisionInternal()).toBe(initialRevision + 1);
        });
    });

    describe('Transform Management', () => {
        test('should set and get world transform', () => {
            const transform = new btTransform();
            transform.setOrigin(new btVector3(1, 2, 3));
            
            collisionObject.setWorldTransform(transform);
            const result = collisionObject.getWorldTransform();
            
            expect(result.getOrigin().x()).toBe(1);
            expect(result.getOrigin().y()).toBe(2);
            expect(result.getOrigin().z()).toBe(3);
        });

        test('should increment update revision when setting world transform', () => {
            const initialRevision = collisionObject.getUpdateRevisionInternal();
            const transform = new btTransform();
            collisionObject.setWorldTransform(transform);
            expect(collisionObject.getUpdateRevisionInternal()).toBe(initialRevision + 1);
        });

        test('should set and get interpolation transforms', () => {
            const transform = new btTransform();
            transform.setOrigin(new btVector3(1, 2, 3));
            
            collisionObject.setInterpolationWorldTransform(transform);
            const result = collisionObject.getInterpolationWorldTransform();
            
            expect(result.getOrigin().x()).toBe(1);
            expect(result.getOrigin().y()).toBe(2);
            expect(result.getOrigin().z()).toBe(3);
        });
    });

    describe('Material Properties', () => {
        test('should set and get friction', () => {
            collisionObject.setFriction(0.8);
            expect(collisionObject.getFriction()).toBe(0.8);
        });

        test('should set and get restitution', () => {
            collisionObject.setRestitution(0.6);
            expect(collisionObject.getRestitution()).toBe(0.6);
        });

        test('should set and get rolling friction', () => {
            collisionObject.setRollingFriction(0.1);
            expect(collisionObject.getRollingFriction()).toBe(0.1);
        });

        test('should set and get spinning friction', () => {
            collisionObject.setSpinningFriction(0.2);
            expect(collisionObject.getSpinningFriction()).toBe(0.2);
        });

        test('should increment update revision when setting material properties', () => {
            const initialRevision = collisionObject.getUpdateRevisionInternal();
            collisionObject.setFriction(0.8);
            expect(collisionObject.getUpdateRevisionInternal()).toBe(initialRevision + 1);
        });
    });

    describe('Activation State Management', () => {
        test('should set and get activation state', () => {
            collisionObject.setActivationState(ISLAND_SLEEPING);
            expect(collisionObject.getActivationState()).toBe(ISLAND_SLEEPING);
        });

        test('should not change state when disabled', () => {
            collisionObject.forceActivationState(DISABLE_DEACTIVATION);
            collisionObject.setActivationState(ISLAND_SLEEPING);
            expect(collisionObject.getActivationState()).toBe(DISABLE_DEACTIVATION);
        });

        test('should force activation state', () => {
            collisionObject.forceActivationState(DISABLE_SIMULATION);
            expect(collisionObject.getActivationState()).toBe(DISABLE_SIMULATION);
        });

        test('should activate object', () => {
            collisionObject.setActivationState(ISLAND_SLEEPING);
            collisionObject.activate();
            expect(collisionObject.getActivationState()).toBe(ACTIVE_TAG);
        });

        test('should check if object is active', () => {
            expect(collisionObject.isActive()).toBe(true);
            
            collisionObject.setActivationState(ISLAND_SLEEPING);
            expect(collisionObject.isActive()).toBe(false);
            
            collisionObject.setActivationState(DISABLE_SIMULATION);
            expect(collisionObject.isActive()).toBe(false);
        });
    });

    describe('Collision Flags', () => {
        test('should set and get collision flags', () => {
            const flags = btCollisionObject.CollisionFlags.CF_STATIC_OBJECT | 
                         btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE;
            collisionObject.setCollisionFlags(flags);
            expect(collisionObject.getCollisionFlags()).toBe(flags);
        });

        test('should check static object', () => {
            collisionObject.setCollisionFlags(btCollisionObject.CollisionFlags.CF_STATIC_OBJECT);
            expect(collisionObject.isStaticObject()).toBe(true);
            expect(collisionObject.isKinematicObject()).toBe(false);
        });

        test('should check kinematic object', () => {
            collisionObject.setCollisionFlags(btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT);
            expect(collisionObject.isKinematicObject()).toBe(true);
            expect(collisionObject.isStaticObject()).toBe(false);
        });

        test('should check static or kinematic object', () => {
            collisionObject.setCollisionFlags(btCollisionObject.CollisionFlags.CF_STATIC_OBJECT);
            expect(collisionObject.isStaticOrKinematicObject()).toBe(true);
            
            collisionObject.setCollisionFlags(btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT);
            expect(collisionObject.isStaticOrKinematicObject()).toBe(true);
            
            collisionObject.setCollisionFlags(btCollisionObject.CollisionFlags.CF_DYNAMIC_OBJECT);
            expect(collisionObject.isStaticOrKinematicObject()).toBe(false);
        });

        test('should check contact response', () => {
            expect(collisionObject.hasContactResponse()).toBe(true);
            
            collisionObject.setCollisionFlags(btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE);
            expect(collisionObject.hasContactResponse()).toBe(false);
        });

        test('should check simulation island merging', () => {
            expect(collisionObject.mergesSimulationIslands()).toBe(true);
            
            collisionObject.setCollisionFlags(btCollisionObject.CollisionFlags.CF_STATIC_OBJECT);
            expect(collisionObject.mergesSimulationIslands()).toBe(false);
        });
    });

    describe('Anisotropic Friction', () => {
        test('should set and get anisotropic friction', () => {
            const friction = new btVector3(0.5, 0.8, 1.2);
            collisionObject.setAnisotropicFriction(friction);
            
            const result = collisionObject.getAnisotropicFriction();
            expect(result.x()).toBe(0.5);
            expect(result.y()).toBe(0.8);
            expect(result.z()).toBe(1.2);
        });

        test('should detect anisotropic friction', () => {
            const friction = new btVector3(0.5, 0.8, 1.2);
            collisionObject.setAnisotropicFriction(friction);
            expect(collisionObject.hasAnisotropicFriction()).toBe(true);
            
            const unityFriction = new btVector3(1, 1, 1);
            collisionObject.setAnisotropicFriction(unityFriction);
            expect(collisionObject.hasAnisotropicFriction()).toBe(false);
        });
    });

    describe('CCD Properties', () => {
        test('should set and get CCD swept sphere radius', () => {
            collisionObject.setCcdSweptSphereRadius(0.1);
            expect(collisionObject.getCcdSweptSphereRadius()).toBe(0.1);
        });

        test('should set and get CCD motion threshold', () => {
            collisionObject.setCcdMotionThreshold(0.05);
            expect(collisionObject.getCcdMotionThreshold()).toBe(0.05);
            expect(collisionObject.getCcdSquareMotionThreshold()).toBeCloseTo(0.0025, 10);
        });
    });

    describe('User Data', () => {
        test('should set and get user pointer', () => {
            const userData = { id: 42, name: 'test' };
            collisionObject.setUserPointer(userData);
            expect(collisionObject.getUserPointer()).toBe(userData);
        });

        test('should set and get user indices', () => {
            collisionObject.setUserIndex(100);
            collisionObject.setUserIndex2(200);
            collisionObject.setUserIndex3(300);
            
            expect(collisionObject.getUserIndex()).toBe(100);
            expect(collisionObject.getUserIndex2()).toBe(200);
            expect(collisionObject.getUserIndex3()).toBe(300);
        });
    });

    describe('Collision Filtering', () => {
        test('should manage collision ignore list', () => {
            const otherObject = new btCollisionObject();
            
            expect(collisionObject.getNumObjectsWithoutCollision()).toBe(0);
            expect(collisionObject.checkCollideWith(otherObject)).toBe(true);
            
            collisionObject.setIgnoreCollisionCheck(otherObject, true);
            expect(collisionObject.getNumObjectsWithoutCollision()).toBe(1);
            expect(collisionObject.getObjectWithoutCollision(0)).toBe(otherObject);
            expect(collisionObject.checkCollideWith(otherObject)).toBe(false);
            
            collisionObject.setIgnoreCollisionCheck(otherObject, false);
            expect(collisionObject.getNumObjectsWithoutCollision()).toBe(0);
            expect(collisionObject.checkCollideWith(otherObject)).toBe(true);
        });
    });

    describe('Contact Properties', () => {
        test('should set and get contact processing threshold', () => {
            collisionObject.setContactProcessingThreshold(0.02);
            expect(collisionObject.getContactProcessingThreshold()).toBe(0.02);
        });

        test('should set and get contact stiffness and damping', () => {
            collisionObject.setContactStiffnessAndDamping(1000, 50);
            expect(collisionObject.getContactStiffness()).toBe(1000);
            expect(collisionObject.getContactDamping()).toBe(50);
            
            // Should set the contact stiffness/damping flag
            const flags = collisionObject.getCollisionFlags();
            expect(flags & btCollisionObject.CollisionFlags.CF_HAS_CONTACT_STIFFNESS_DAMPING).not.toBe(0);
        });
    });

    describe('Debug Rendering', () => {
        test('should set and get custom debug color', () => {
            const color = new btVector3(1, 0, 0);
            collisionObject.setCustomDebugColor(color);
            
            const result = collisionObject.getCustomDebugColor();
            expect(result).not.toBeNull();
            expect(result!.x()).toBe(1);
            expect(result!.y()).toBe(0);
            expect(result!.z()).toBe(0);
            
            // Should set the custom color flag
            const flags = collisionObject.getCollisionFlags();
            expect(flags & btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR).not.toBe(0);
        });

        test('should remove custom debug color', () => {
            const color = new btVector3(1, 0, 0);
            collisionObject.setCustomDebugColor(color);
            
            collisionObject.removeCustomDebugColor();
            expect(collisionObject.getCustomDebugColor()).toBeNull();
            
            // Should clear the custom color flag
            const flags = collisionObject.getCollisionFlags();
            expect(flags & btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR).toBe(0);
        });
    });

    describe('Island Management', () => {
        test('should set and get island tag', () => {
            collisionObject.setIslandTag(42);
            expect(collisionObject.getIslandTag()).toBe(42);
        });

        test('should set and get companion id', () => {
            collisionObject.setCompanionId(123);
            expect(collisionObject.getCompanionId()).toBe(123);
        });

        test('should set and get world array index', () => {
            collisionObject.setWorldArrayIndex(5);
            expect(collisionObject.getWorldArrayIndex()).toBe(5);
        });
    });

    describe('Hit Fraction', () => {
        test('should set and get hit fraction', () => {
            collisionObject.setHitFraction(0.75);
            expect(collisionObject.getHitFraction()).toBe(0.75);
        });
    });

    describe('Deactivation Time', () => {
        test('should set and get deactivation time', () => {
            collisionObject.setDeactivationTime(2.5);
            expect(collisionObject.getDeactivationTime()).toBe(2.5);
        });
    });
});