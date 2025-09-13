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

import { btTransform } from '../../LinearMath/btTransform';
import { btVector3 } from '../../LinearMath/btVector3';
import { btBroadphaseProxy, BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

/**
 * Serialization data structure for collision shapes
 * Equivalent to btCollisionShapeData in C++
 */
export interface btCollisionShapeData {
    m_name: string | null;
    m_shapeType: number;
}

/**
 * The btCollisionShape class provides an interface for collision shapes that can be shared among btCollisionObjects.
 * This is the base abstract class for all collision shapes in the physics engine.
 */
export abstract class btCollisionShape {
    protected m_shapeType: number;
    protected m_userPointer: any;
    protected m_userIndex: number;
    protected m_userIndex2: number;

    constructor() {
        this.m_shapeType = BroadphaseNativeTypes.INVALID_SHAPE_PROXYTYPE;
        this.m_userPointer = null;
        this.m_userIndex = -1;
        this.m_userIndex2 = -1;
    }

    /**
     * getAabb returns the axis aligned bounding box in the coordinate frame of the given transform t.
     * @param t Transform to apply
     * @param aabbMin Output minimum bounds
     * @param aabbMax Output maximum bounds
     */
    abstract getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void;

    /**
     * Get the bounding sphere for this shape
     * @param center Output center of bounding sphere
     * @param radius Output radius of bounding sphere
     */
    getBoundingSphere(center: btVector3, radius: { value: number }): void {
        const tr = new btTransform();
        tr.setIdentity();
        const aabbMin = new btVector3();
        const aabbMax = new btVector3();

        this.getAabb(tr, aabbMin, aabbMax);

        const diff = aabbMax.subtract(aabbMin);
        radius.value = diff.length() * 0.5;
        center.copy(aabbMin.add(aabbMax).multiply(0.5));
    }

    /**
     * getAngularMotionDisc returns the maximum radius needed for Conservative Advancement to handle time-of-impact with rotations.
     */
    getAngularMotionDisc(): number {
        // TODO: cache this value to improve performance
        const center = new btVector3();
        const radiusRef = { value: 0 };
        this.getBoundingSphere(center, radiusRef);
        let disc = radiusRef.value;
        disc += center.length();
        return disc;
    }

    /**
     * Get contact breaking threshold
     */
    getContactBreakingThreshold(defaultContactThresholdFactor: number): number {
        return this.getAngularMotionDisc() * defaultContactThresholdFactor;
    }

    /**
     * calculateTemporalAabb calculates the enclosing aabb for the moving object over interval [0..timeStep)
     * Result is conservative
     */
    calculateTemporalAabb(
        curTrans: btTransform,
        linvel: btVector3,
        angvel: btVector3,
        timeStep: number,
        temporalAabbMin: btVector3,
        temporalAabbMax: btVector3
    ): void {
        // Start with static aabb
        this.getAabb(curTrans, temporalAabbMin, temporalAabbMax);

        let temporalAabbMaxx = temporalAabbMax.x();
        let temporalAabbMaxy = temporalAabbMax.y();
        let temporalAabbMaxz = temporalAabbMax.z();
        let temporalAabbMinx = temporalAabbMin.x();
        let temporalAabbMiny = temporalAabbMin.y();
        let temporalAabbMinz = temporalAabbMin.z();

        // Add linear motion
        const linMotion = linvel.multiply(timeStep);
        // TODO: simd would have a vector max/min operation, instead of per-element access
        if (linMotion.x() > 0) {
            temporalAabbMaxx += linMotion.x();
        } else {
            temporalAabbMinx += linMotion.x();
        }
        if (linMotion.y() > 0) {
            temporalAabbMaxy += linMotion.y();
        } else {
            temporalAabbMiny += linMotion.y();
        }
        if (linMotion.z() > 0) {
            temporalAabbMaxz += linMotion.z();
        } else {
            temporalAabbMinz += linMotion.z();
        }

        // Add conservative angular motion
        const angularMotion = angvel.length() * this.getAngularMotionDisc() * timeStep;
        const angularMotion3d = new btVector3(angularMotion, angularMotion, angularMotion);
        
        temporalAabbMin.setValue(temporalAabbMinx, temporalAabbMiny, temporalAabbMinz);
        temporalAabbMax.setValue(temporalAabbMaxx, temporalAabbMaxy, temporalAabbMaxz);

        temporalAabbMin.subtractAssign(angularMotion3d);
        temporalAabbMax.addAssign(angularMotion3d);
    }

    // Shape type checking methods - inline helpers
    isPolyhedral(): boolean {
        return btBroadphaseProxy.isPolyhedral(this.getShapeType());
    }

    isConvex2d(): boolean {
        return btBroadphaseProxy.isConvex2d(this.getShapeType());
    }

    isConvex(): boolean {
        return btBroadphaseProxy.isConvex(this.getShapeType());
    }

    isNonMoving(): boolean {
        return btBroadphaseProxy.isNonMoving(this.getShapeType());
    }

    isConcave(): boolean {
        return btBroadphaseProxy.isConcave(this.getShapeType());
    }

    isCompound(): boolean {
        return btBroadphaseProxy.isCompound(this.getShapeType());
    }

    isSoftBody(): boolean {
        return btBroadphaseProxy.isSoftBody(this.getShapeType());
    }

    /**
     * isInfinite is used to catch simulation error (aabb check)
     */
    isInfinite(): boolean {
        return btBroadphaseProxy.isInfinite(this.getShapeType());
    }

    // Abstract methods that must be implemented by derived classes
    abstract setLocalScaling(scaling: btVector3): void;
    abstract getLocalScaling(): btVector3;
    abstract calculateLocalInertia(mass: number, inertia: btVector3): void;

    /**
     * Debugging support - get the name of this shape type
     */
    abstract getName(): string;

    abstract setMargin(margin: number): void;
    abstract getMargin(): number;

    // Basic getters and setters
    getShapeType(): number {
        return this.m_shapeType;
    }

    /**
     * The getAnisotropicRollingFrictionDirection can be used in combination with setAnisotropicFriction
     * See Bullet/Demos/RollingFrictionDemo for an example
     */
    getAnisotropicRollingFrictionDirection(): btVector3 {
        return new btVector3(1, 1, 1);
    }

    // User data management
    setUserPointer(userPtr: any): void {
        this.m_userPointer = userPtr;
    }

    getUserPointer(): any {
        return this.m_userPointer;
    }

    setUserIndex(index: number): void {
        this.m_userIndex = index;
    }

    getUserIndex(): number {
        return this.m_userIndex;
    }

    setUserIndex2(index: number): void {
        this.m_userIndex2 = index;
    }

    getUserIndex2(): number {
        return this.m_userIndex2;
    }

    // Serialization support
    calculateSerializeBufferSize(): number {
        // In TypeScript, we don't need exact buffer sizes, but we maintain the interface
        return 1; // Simplified for TypeScript
    }

    /**
     * Serialize the collision shape data
     * Returns the struct type name for serialization
     */
    serialize(dataBuffer: btCollisionShapeData, serializer?: any): string {
        // Simplified serialization for TypeScript
        dataBuffer.m_name = serializer?.findNameForPointer?.(this) || null;
        dataBuffer.m_shapeType = this.m_shapeType;
        return "btCollisionShapeData";
    }

    /**
     * Serialize a single shape
     */
    serializeSingleShape(serializer: any): void {
        this.calculateSerializeBufferSize();
        const data: btCollisionShapeData = {
            m_name: null,
            m_shapeType: 0
        };
        this.serialize(data, serializer);
        // In a full implementation, this would handle the serialization chunk
        // For TypeScript port, we simplify this interface
    }
}