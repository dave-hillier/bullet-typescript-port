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
import { SIMD_EPSILON } from '../../LinearMath/btScalar';
// Island management constants
export const ACTIVE_TAG = 1;
export const ISLAND_SLEEPING = 2;
export const WANTS_DEACTIVATION = 3;
export const DISABLE_DEACTIVATION = 4;
export const DISABLE_SIMULATION = 5;
export const FIXED_BASE_MULTI_BODY = 6;
/**
 * btCollisionObject can be used to manage collision detection objects.
 * btCollisionObject maintains all information that is needed for a collision detection: Shape, Transform and AABB proxy.
 * They can be added to the btCollisionWorld.
 */
export class btCollisionObject {
    constructor() {
        this.m_worldTransform = new btTransform();
        this.m_interpolationWorldTransform = new btTransform();
        this.m_interpolationLinearVelocity = new btVector3(0, 0, 0);
        this.m_interpolationAngularVelocity = new btVector3(0, 0, 0);
        this.m_anisotropicFriction = new btVector3(1, 1, 1);
        this.m_hasAnisotropicFriction = 0;
        this.m_contactProcessingThreshold = 0;
        this.m_broadphaseHandle = null;
        this.m_collisionShape = null;
        this.m_extensionPointer = null;
        this.m_rootCollisionShape = null;
        this.m_collisionFlags = btCollisionObject.CollisionFlags.CF_DYNAMIC_OBJECT;
        this.m_islandTag1 = -1;
        this.m_companionId = -1;
        this.m_worldArrayIndex = -1;
        this.m_activationState1 = ACTIVE_TAG;
        this.m_deactivationTime = 0;
        this.m_friction = 0.5;
        this.m_restitution = 0;
        this.m_rollingFriction = 0;
        this.m_spinningFriction = 0;
        this.m_contactDamping = 0;
        this.m_contactStiffness = 0;
        this.m_internalType = btCollisionObject.CollisionObjectTypes.CO_COLLISION_OBJECT;
        this.m_userObjectPointer = null;
        this.m_userIndex2 = -1;
        this.m_userIndex = -1;
        this.m_userIndex3 = -1;
        this.m_hitFraction = 1;
        this.m_ccdSweptSphereRadius = 0;
        this.m_ccdMotionThreshold = 0;
        this.m_checkCollideWith = 0;
        this.m_objectsWithoutCollisionCheck = [];
        this.m_updateRevision = 0;
        this.m_customDebugColorRGB = new btVector3(1, 0, 0);
    }
    /**
     * Check if this object merges simulation islands
     */
    mergesSimulationIslands() {
        // Static objects, kinematic and objects without contact response don't merge islands
        return (this.m_collisionFlags & (btCollisionObject.CollisionFlags.CF_STATIC_OBJECT |
            btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
            btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE)) === 0;
    }
    getAnisotropicFriction() {
        return this.m_anisotropicFriction;
    }
    setAnisotropicFriction(anisotropicFriction, frictionMode = btCollisionObject.AnisotropicFrictionFlags.CF_ANISOTROPIC_FRICTION) {
        this.m_anisotropicFriction.copy(anisotropicFriction);
        const isUnity = (anisotropicFriction.x() !== 1.0) || (anisotropicFriction.y() !== 1.0) || (anisotropicFriction.z() !== 1.0);
        this.m_hasAnisotropicFriction = isUnity ? frictionMode : 0;
    }
    hasAnisotropicFriction(frictionMode = btCollisionObject.AnisotropicFrictionFlags.CF_ANISOTROPIC_FRICTION) {
        return (this.m_hasAnisotropicFriction & frictionMode) !== 0;
    }
    setContactProcessingThreshold(contactProcessingThreshold) {
        this.m_contactProcessingThreshold = contactProcessingThreshold;
    }
    getContactProcessingThreshold() {
        return this.m_contactProcessingThreshold;
    }
    isStaticObject() {
        return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_STATIC_OBJECT) !== 0;
    }
    isKinematicObject() {
        return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT) !== 0;
    }
    isStaticOrKinematicObject() {
        return (this.m_collisionFlags & (btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
            btCollisionObject.CollisionFlags.CF_STATIC_OBJECT)) !== 0;
    }
    hasContactResponse() {
        return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE) === 0;
    }
    setCollisionShape(collisionShape) {
        this.m_updateRevision++;
        this.m_collisionShape = collisionShape;
        this.m_rootCollisionShape = collisionShape;
    }
    getCollisionShape() {
        return this.m_collisionShape;
    }
    setIgnoreCollisionCheck(co, ignoreCollisionCheck) {
        if (ignoreCollisionCheck) {
            this.m_objectsWithoutCollisionCheck.push(co);
        }
        else {
            const index = this.m_objectsWithoutCollisionCheck.indexOf(co);
            if (index >= 0) {
                this.m_objectsWithoutCollisionCheck.splice(index, 1);
            }
        }
        this.m_checkCollideWith = this.m_objectsWithoutCollisionCheck.length > 0 ? 1 : 0;
    }
    getNumObjectsWithoutCollision() {
        return this.m_objectsWithoutCollisionCheck.length;
    }
    getObjectWithoutCollision(index) {
        return this.m_objectsWithoutCollisionCheck[index];
    }
    checkCollideWithOverride(co) {
        const index = this.m_objectsWithoutCollisionCheck.indexOf(co);
        return index === -1;
    }
    internalGetExtensionPointer() {
        return this.m_extensionPointer;
    }
    internalSetExtensionPointer(pointer) {
        this.m_extensionPointer = pointer;
    }
    getActivationState() {
        return this.m_activationState1;
    }
    setActivationState(newState) {
        if (this.m_activationState1 !== DISABLE_DEACTIVATION && this.m_activationState1 !== DISABLE_SIMULATION) {
            this.m_activationState1 = newState;
        }
    }
    setDeactivationTime(time) {
        this.m_deactivationTime = time;
    }
    getDeactivationTime() {
        return this.m_deactivationTime;
    }
    forceActivationState(newState) {
        this.m_activationState1 = newState;
    }
    activate(forceActivation = false) {
        if (forceActivation ||
            (this.m_activationState1 !== DISABLE_DEACTIVATION &&
                this.m_activationState1 !== DISABLE_SIMULATION)) {
            this.m_activationState1 = ACTIVE_TAG;
            this.m_deactivationTime = 0;
        }
    }
    isActive() {
        return ((this.getActivationState() !== FIXED_BASE_MULTI_BODY) &&
            (this.getActivationState() !== ISLAND_SLEEPING) &&
            (this.getActivationState() !== DISABLE_SIMULATION));
    }
    setRestitution(rest) {
        this.m_updateRevision++;
        this.m_restitution = rest;
    }
    getRestitution() {
        return this.m_restitution;
    }
    setFriction(frict) {
        this.m_updateRevision++;
        this.m_friction = frict;
    }
    getFriction() {
        return this.m_friction;
    }
    setRollingFriction(frict) {
        this.m_updateRevision++;
        this.m_rollingFriction = frict;
    }
    getRollingFriction() {
        return this.m_rollingFriction;
    }
    setSpinningFriction(frict) {
        this.m_updateRevision++;
        this.m_spinningFriction = frict;
    }
    getSpinningFriction() {
        return this.m_spinningFriction;
    }
    setContactStiffnessAndDamping(stiffness, damping) {
        this.m_updateRevision++;
        this.m_contactStiffness = stiffness;
        this.m_contactDamping = damping;
        this.m_collisionFlags |= btCollisionObject.CollisionFlags.CF_HAS_CONTACT_STIFFNESS_DAMPING;
        // Avoid divisions by zero
        if (this.m_contactStiffness < SIMD_EPSILON) {
            this.m_contactStiffness = SIMD_EPSILON;
        }
    }
    getContactStiffness() {
        return this.m_contactStiffness;
    }
    getContactDamping() {
        return this.m_contactDamping;
    }
    getInternalType() {
        return this.m_internalType;
    }
    getWorldTransform() {
        return this.m_worldTransform;
    }
    setWorldTransform(worldTrans) {
        this.m_updateRevision++;
        this.m_worldTransform.assign(worldTrans);
    }
    getBroadphaseHandle() {
        return this.m_broadphaseHandle;
    }
    setBroadphaseHandle(handle) {
        this.m_broadphaseHandle = handle;
    }
    getInterpolationWorldTransform() {
        return this.m_interpolationWorldTransform;
    }
    setInterpolationWorldTransform(trans) {
        this.m_updateRevision++;
        this.m_interpolationWorldTransform.assign(trans);
    }
    setInterpolationLinearVelocity(linvel) {
        this.m_updateRevision++;
        this.m_interpolationLinearVelocity.copy(linvel);
    }
    setInterpolationAngularVelocity(angvel) {
        this.m_updateRevision++;
        this.m_interpolationAngularVelocity.copy(angvel);
    }
    getInterpolationLinearVelocity() {
        return this.m_interpolationLinearVelocity;
    }
    getInterpolationAngularVelocity() {
        return this.m_interpolationAngularVelocity;
    }
    getIslandTag() {
        return this.m_islandTag1;
    }
    setIslandTag(tag) {
        this.m_islandTag1 = tag;
    }
    getCompanionId() {
        return this.m_companionId;
    }
    setCompanionId(id) {
        this.m_companionId = id;
    }
    getWorldArrayIndex() {
        return this.m_worldArrayIndex;
    }
    setWorldArrayIndex(ix) {
        this.m_worldArrayIndex = ix;
    }
    getHitFraction() {
        return this.m_hitFraction;
    }
    setHitFraction(hitFraction) {
        this.m_hitFraction = hitFraction;
    }
    getCollisionFlags() {
        return this.m_collisionFlags;
    }
    setCollisionFlags(flags) {
        this.m_collisionFlags = flags;
    }
    getCcdSweptSphereRadius() {
        return this.m_ccdSweptSphereRadius;
    }
    setCcdSweptSphereRadius(radius) {
        this.m_ccdSweptSphereRadius = radius;
    }
    getCcdMotionThreshold() {
        return this.m_ccdMotionThreshold;
    }
    getCcdSquareMotionThreshold() {
        return this.m_ccdMotionThreshold * this.m_ccdMotionThreshold;
    }
    setCcdMotionThreshold(ccdMotionThreshold) {
        this.m_ccdMotionThreshold = ccdMotionThreshold;
    }
    getUserPointer() {
        return this.m_userObjectPointer;
    }
    getUserIndex() {
        return this.m_userIndex;
    }
    getUserIndex2() {
        return this.m_userIndex2;
    }
    getUserIndex3() {
        return this.m_userIndex3;
    }
    setUserPointer(userPointer) {
        this.m_userObjectPointer = userPointer;
    }
    setUserIndex(index) {
        this.m_userIndex = index;
    }
    setUserIndex2(index) {
        this.m_userIndex2 = index;
    }
    setUserIndex3(index) {
        this.m_userIndex3 = index;
    }
    getUpdateRevisionInternal() {
        return this.m_updateRevision;
    }
    setCustomDebugColor(colorRGB) {
        this.m_customDebugColorRGB.copy(colorRGB);
        this.m_collisionFlags |= btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
    }
    removeCustomDebugColor() {
        this.m_collisionFlags &= ~btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
    }
    getCustomDebugColor() {
        const hasCustomColor = (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR) !== 0;
        return hasCustomColor ? this.m_customDebugColorRGB : null;
    }
    checkCollideWith(co) {
        if (this.m_checkCollideWith) {
            return this.checkCollideWithOverride(co);
        }
        return true;
    }
}
// Enum for collision flags
btCollisionObject.CollisionFlags = {
    CF_DYNAMIC_OBJECT: 0,
    CF_STATIC_OBJECT: 1,
    CF_KINEMATIC_OBJECT: 2,
    CF_NO_CONTACT_RESPONSE: 4,
    CF_CUSTOM_MATERIAL_CALLBACK: 8,
    CF_CHARACTER_OBJECT: 16,
    CF_DISABLE_VISUALIZE_OBJECT: 32,
    CF_DISABLE_SPU_COLLISION_PROCESSING: 64,
    CF_HAS_CONTACT_STIFFNESS_DAMPING: 128,
    CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR: 256,
    CF_HAS_FRICTION_ANCHOR: 512,
    CF_HAS_COLLISION_SOUND_TRIGGER: 1024
};
// Enum for collision object types
btCollisionObject.CollisionObjectTypes = {
    CO_COLLISION_OBJECT: 1,
    CO_RIGID_BODY: 2,
    CO_GHOST_OBJECT: 4,
    CO_SOFT_BODY: 8,
    CO_HF_FLUID: 16,
    CO_USER_TYPE: 32,
    CO_FEATHERSTONE_LINK: 64
};
// Enum for anisotropic friction flags
btCollisionObject.AnisotropicFrictionFlags = {
    CF_ANISOTROPIC_FRICTION_DISABLED: 0,
    CF_ANISOTROPIC_FRICTION: 1,
    CF_ANISOTROPIC_ROLLING_FRICTION: 2
};
