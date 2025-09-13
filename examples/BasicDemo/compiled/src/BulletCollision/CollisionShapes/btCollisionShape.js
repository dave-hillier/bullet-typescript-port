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
 * The btCollisionShape class provides an interface for collision shapes that can be shared among btCollisionObjects.
 * This is the base abstract class for all collision shapes in the physics engine.
 */
export class btCollisionShape {
    constructor() {
        this.m_shapeType = BroadphaseNativeTypes.INVALID_SHAPE_PROXYTYPE;
        this.m_userPointer = null;
        this.m_userIndex = -1;
        this.m_userIndex2 = -1;
    }
    /**
     * Get the bounding sphere for this shape
     * @param center Output center of bounding sphere
     * @param radius Output radius of bounding sphere
     */
    getBoundingSphere(center, radius) {
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
    getAngularMotionDisc() {
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
    getContactBreakingThreshold(defaultContactThresholdFactor) {
        return this.getAngularMotionDisc() * defaultContactThresholdFactor;
    }
    /**
     * calculateTemporalAabb calculates the enclosing aabb for the moving object over interval [0..timeStep)
     * Result is conservative
     */
    calculateTemporalAabb(curTrans, linvel, angvel, timeStep, temporalAabbMin, temporalAabbMax) {
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
        }
        else {
            temporalAabbMinx += linMotion.x();
        }
        if (linMotion.y() > 0) {
            temporalAabbMaxy += linMotion.y();
        }
        else {
            temporalAabbMiny += linMotion.y();
        }
        if (linMotion.z() > 0) {
            temporalAabbMaxz += linMotion.z();
        }
        else {
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
    isPolyhedral() {
        return btBroadphaseProxy.isPolyhedral(this.getShapeType());
    }
    isConvex2d() {
        return btBroadphaseProxy.isConvex2d(this.getShapeType());
    }
    isConvex() {
        return btBroadphaseProxy.isConvex(this.getShapeType());
    }
    isNonMoving() {
        return btBroadphaseProxy.isNonMoving(this.getShapeType());
    }
    isConcave() {
        return btBroadphaseProxy.isConcave(this.getShapeType());
    }
    isCompound() {
        return btBroadphaseProxy.isCompound(this.getShapeType());
    }
    isSoftBody() {
        return btBroadphaseProxy.isSoftBody(this.getShapeType());
    }
    /**
     * isInfinite is used to catch simulation error (aabb check)
     */
    isInfinite() {
        return btBroadphaseProxy.isInfinite(this.getShapeType());
    }
    // Basic getters and setters
    getShapeType() {
        return this.m_shapeType;
    }
    /**
     * The getAnisotropicRollingFrictionDirection can be used in combination with setAnisotropicFriction
     * See Bullet/Demos/RollingFrictionDemo for an example
     */
    getAnisotropicRollingFrictionDirection() {
        return new btVector3(1, 1, 1);
    }
    // User data management
    setUserPointer(userPtr) {
        this.m_userPointer = userPtr;
    }
    getUserPointer() {
        return this.m_userPointer;
    }
    setUserIndex(index) {
        this.m_userIndex = index;
    }
    getUserIndex() {
        return this.m_userIndex;
    }
    setUserIndex2(index) {
        this.m_userIndex2 = index;
    }
    getUserIndex2() {
        return this.m_userIndex2;
    }
    // Serialization support
    calculateSerializeBufferSize() {
        // In TypeScript, we don't need exact buffer sizes, but we maintain the interface
        return 1; // Simplified for TypeScript
    }
    /**
     * Serialize the collision shape data
     * Returns the struct type name for serialization
     */
    serialize(dataBuffer, serializer) {
        var _a;
        // Simplified serialization for TypeScript
        dataBuffer.m_name = ((_a = serializer === null || serializer === void 0 ? void 0 : serializer.findNameForPointer) === null || _a === void 0 ? void 0 : _a.call(serializer, this)) || null;
        dataBuffer.m_shapeType = this.m_shapeType;
        return "btCollisionShapeData";
    }
    /**
     * Serialize a single shape
     */
    serializeSingleShape(serializer) {
        this.calculateSerializeBufferSize();
        const data = {
            m_name: null,
            m_shapeType: 0
        };
        this.serialize(data, serializer);
        // In a full implementation, this would handle the serialization chunk
        // For TypeScript port, we simplify this interface
    }
}
