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
import { btCollisionShape } from '../CollisionShapes/btCollisionShape';
import { btBroadphaseProxy } from '../BroadphaseCollision/btBroadphaseProxy';
import { SIMD_EPSILON } from '../../LinearMath/btScalar';

// Island management constants
export const ACTIVE_TAG = 1;
export const ISLAND_SLEEPING = 2;
export const WANTS_DEACTIVATION = 3;
export const DISABLE_DEACTIVATION = 4;
export const DISABLE_SIMULATION = 5;
export const FIXED_BASE_MULTI_BODY = 6;

/**
 * Array type for btCollisionObjects
 */
export type btCollisionObjectArray = btCollisionObject[];

/**
 * btCollisionObject can be used to manage collision detection objects.
 * btCollisionObject maintains all information that is needed for a collision detection: Shape, Transform and AABB proxy.
 * They can be added to the btCollisionWorld.
 */
export class btCollisionObject {
    protected m_worldTransform: btTransform;
    protected m_interpolationWorldTransform: btTransform;
    protected m_interpolationLinearVelocity: btVector3;
    protected m_interpolationAngularVelocity: btVector3;

    protected m_anisotropicFriction: btVector3;
    protected m_hasAnisotropicFriction: number;
    protected m_contactProcessingThreshold: number;

    protected m_broadphaseHandle: btBroadphaseProxy | null;
    protected m_collisionShape: btCollisionShape | null;
    protected m_extensionPointer: any;
    protected m_rootCollisionShape: btCollisionShape | null;

    protected m_collisionFlags: number;
    protected m_islandTag1: number;
    protected m_companionId: number;
    protected m_worldArrayIndex: number;

    protected m_activationState1: number;
    protected m_deactivationTime: number;

    protected m_friction: number;
    protected m_restitution: number;
    protected m_rollingFriction: number;
    protected m_spinningFriction: number;
    protected m_contactDamping: number;
    protected m_contactStiffness: number;

    protected m_internalType: number;
    protected m_userObjectPointer: any;
    protected m_userIndex2: number;
    protected m_userIndex: number;
    protected m_userIndex3: number;

    protected m_hitFraction: number;
    protected m_ccdSweptSphereRadius: number;
    protected m_ccdMotionThreshold: number;
    protected m_checkCollideWith: number;

    protected m_objectsWithoutCollisionCheck: btCollisionObject[];
    protected m_updateRevision: number;
    protected m_customDebugColorRGB: btVector3;

    // Enum for collision flags
    static CollisionFlags = {
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
    static CollisionObjectTypes = {
        CO_COLLISION_OBJECT: 1,
        CO_RIGID_BODY: 2,
        CO_GHOST_OBJECT: 4,
        CO_SOFT_BODY: 8,
        CO_HF_FLUID: 16,
        CO_USER_TYPE: 32,
        CO_FEATHERSTONE_LINK: 64
    };

    // Enum for anisotropic friction flags
    static AnisotropicFrictionFlags = {
        CF_ANISOTROPIC_FRICTION_DISABLED: 0,
        CF_ANISOTROPIC_FRICTION: 1,
        CF_ANISOTROPIC_ROLLING_FRICTION: 2
    };

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
    mergesSimulationIslands(): boolean {
        // Static objects, kinematic and objects without contact response don't merge islands
        return (this.m_collisionFlags & (
            btCollisionObject.CollisionFlags.CF_STATIC_OBJECT |
            btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
            btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE
        )) === 0;
    }

    getAnisotropicFriction(): btVector3 {
        return this.m_anisotropicFriction;
    }

    setAnisotropicFriction(anisotropicFriction: btVector3, frictionMode: number = btCollisionObject.AnisotropicFrictionFlags.CF_ANISOTROPIC_FRICTION): void {
        this.m_anisotropicFriction.copy(anisotropicFriction);
        const isUnity = (anisotropicFriction.x() !== 1.0) || (anisotropicFriction.y() !== 1.0) || (anisotropicFriction.z() !== 1.0);
        this.m_hasAnisotropicFriction = isUnity ? frictionMode : 0;
    }

    hasAnisotropicFriction(frictionMode: number = btCollisionObject.AnisotropicFrictionFlags.CF_ANISOTROPIC_FRICTION): boolean {
        return (this.m_hasAnisotropicFriction & frictionMode) !== 0;
    }

    setContactProcessingThreshold(contactProcessingThreshold: number): void {
        this.m_contactProcessingThreshold = contactProcessingThreshold;
    }

    getContactProcessingThreshold(): number {
        return this.m_contactProcessingThreshold;
    }

    isStaticObject(): boolean {
        return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_STATIC_OBJECT) !== 0;
    }

    isKinematicObject(): boolean {
        return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT) !== 0;
    }

    isStaticOrKinematicObject(): boolean {
        return (this.m_collisionFlags & (
            btCollisionObject.CollisionFlags.CF_KINEMATIC_OBJECT |
            btCollisionObject.CollisionFlags.CF_STATIC_OBJECT
        )) !== 0;
    }

    hasContactResponse(): boolean {
        return (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_NO_CONTACT_RESPONSE) === 0;
    }

    setCollisionShape(collisionShape: btCollisionShape): void {
        this.m_updateRevision++;
        this.m_collisionShape = collisionShape;
        this.m_rootCollisionShape = collisionShape;
    }

    getCollisionShape(): btCollisionShape | null {
        return this.m_collisionShape;
    }

    setIgnoreCollisionCheck(co: btCollisionObject, ignoreCollisionCheck: boolean): void {
        if (ignoreCollisionCheck) {
            this.m_objectsWithoutCollisionCheck.push(co);
        } else {
            const index = this.m_objectsWithoutCollisionCheck.indexOf(co);
            if (index >= 0) {
                this.m_objectsWithoutCollisionCheck.splice(index, 1);
            }
        }
        this.m_checkCollideWith = this.m_objectsWithoutCollisionCheck.length > 0 ? 1 : 0;
    }

    getNumObjectsWithoutCollision(): number {
        return this.m_objectsWithoutCollisionCheck.length;
    }

    getObjectWithoutCollision(index: number): btCollisionObject {
        return this.m_objectsWithoutCollisionCheck[index];
    }

    checkCollideWithOverride(co: btCollisionObject): boolean {
        const index = this.m_objectsWithoutCollisionCheck.indexOf(co);
        return index === -1;
    }

    internalGetExtensionPointer(): any {
        return this.m_extensionPointer;
    }

    internalSetExtensionPointer(pointer: any): void {
        this.m_extensionPointer = pointer;
    }

    getActivationState(): number {
        return this.m_activationState1;
    }

    setActivationState(newState: number): void {
        if (this.m_activationState1 !== DISABLE_DEACTIVATION && this.m_activationState1 !== DISABLE_SIMULATION) {
            this.m_activationState1 = newState;
        }
    }

    setDeactivationTime(time: number): void {
        this.m_deactivationTime = time;
    }

    getDeactivationTime(): number {
        return this.m_deactivationTime;
    }

    forceActivationState(newState: number): void {
        this.m_activationState1 = newState;
    }

    activate(forceActivation: boolean = false): void {
        if (forceActivation || 
           (this.m_activationState1 !== DISABLE_DEACTIVATION && 
            this.m_activationState1 !== DISABLE_SIMULATION)) {
            this.m_activationState1 = ACTIVE_TAG;
            this.m_deactivationTime = 0;
        }
    }

    isActive(): boolean {
        return ((this.getActivationState() !== FIXED_BASE_MULTI_BODY) && 
                (this.getActivationState() !== ISLAND_SLEEPING) && 
                (this.getActivationState() !== DISABLE_SIMULATION));
    }

    setRestitution(rest: number): void {
        this.m_updateRevision++;
        this.m_restitution = rest;
    }

    getRestitution(): number {
        return this.m_restitution;
    }

    setFriction(frict: number): void {
        this.m_updateRevision++;
        this.m_friction = frict;
    }

    getFriction(): number {
        return this.m_friction;
    }

    setRollingFriction(frict: number): void {
        this.m_updateRevision++;
        this.m_rollingFriction = frict;
    }

    getRollingFriction(): number {
        return this.m_rollingFriction;
    }

    setSpinningFriction(frict: number): void {
        this.m_updateRevision++;
        this.m_spinningFriction = frict;
    }

    getSpinningFriction(): number {
        return this.m_spinningFriction;
    }

    setContactStiffnessAndDamping(stiffness: number, damping: number): void {
        this.m_updateRevision++;
        this.m_contactStiffness = stiffness;
        this.m_contactDamping = damping;

        this.m_collisionFlags |= btCollisionObject.CollisionFlags.CF_HAS_CONTACT_STIFFNESS_DAMPING;

        // Avoid divisions by zero
        if (this.m_contactStiffness < SIMD_EPSILON) {
            this.m_contactStiffness = SIMD_EPSILON;
        }
    }

    getContactStiffness(): number {
        return this.m_contactStiffness;
    }

    getContactDamping(): number {
        return this.m_contactDamping;
    }

    getInternalType(): number {
        return this.m_internalType;
    }

    getWorldTransform(): btTransform {
        return this.m_worldTransform;
    }

    setWorldTransform(worldTrans: btTransform): void {
        this.m_updateRevision++;
        this.m_worldTransform.assign(worldTrans);
    }

    getBroadphaseHandle(): btBroadphaseProxy | null {
        return this.m_broadphaseHandle;
    }

    setBroadphaseHandle(handle: btBroadphaseProxy): void {
        this.m_broadphaseHandle = handle;
    }

    getInterpolationWorldTransform(): btTransform {
        return this.m_interpolationWorldTransform;
    }

    setInterpolationWorldTransform(trans: btTransform): void {
        this.m_updateRevision++;
        this.m_interpolationWorldTransform.assign(trans);
    }

    setInterpolationLinearVelocity(linvel: btVector3): void {
        this.m_updateRevision++;
        this.m_interpolationLinearVelocity.copy(linvel);
    }

    setInterpolationAngularVelocity(angvel: btVector3): void {
        this.m_updateRevision++;
        this.m_interpolationAngularVelocity.copy(angvel);
    }

    getInterpolationLinearVelocity(): btVector3 {
        return this.m_interpolationLinearVelocity;
    }

    getInterpolationAngularVelocity(): btVector3 {
        return this.m_interpolationAngularVelocity;
    }

    getIslandTag(): number {
        return this.m_islandTag1;
    }

    setIslandTag(tag: number): void {
        this.m_islandTag1 = tag;
    }

    getCompanionId(): number {
        return this.m_companionId;
    }

    setCompanionId(id: number): void {
        this.m_companionId = id;
    }

    getWorldArrayIndex(): number {
        return this.m_worldArrayIndex;
    }

    setWorldArrayIndex(ix: number): void {
        this.m_worldArrayIndex = ix;
    }

    getHitFraction(): number {
        return this.m_hitFraction;
    }

    setHitFraction(hitFraction: number): void {
        this.m_hitFraction = hitFraction;
    }

    getCollisionFlags(): number {
        return this.m_collisionFlags;
    }

    setCollisionFlags(flags: number): void {
        this.m_collisionFlags = flags;
    }

    getCcdSweptSphereRadius(): number {
        return this.m_ccdSweptSphereRadius;
    }

    setCcdSweptSphereRadius(radius: number): void {
        this.m_ccdSweptSphereRadius = radius;
    }

    getCcdMotionThreshold(): number {
        return this.m_ccdMotionThreshold;
    }

    getCcdSquareMotionThreshold(): number {
        return this.m_ccdMotionThreshold * this.m_ccdMotionThreshold;
    }

    setCcdMotionThreshold(ccdMotionThreshold: number): void {
        this.m_ccdMotionThreshold = ccdMotionThreshold;
    }

    getUserPointer(): any {
        return this.m_userObjectPointer;
    }

    getUserIndex(): number {
        return this.m_userIndex;
    }

    getUserIndex2(): number {
        return this.m_userIndex2;
    }

    getUserIndex3(): number {
        return this.m_userIndex3;
    }

    setUserPointer(userPointer: any): void {
        this.m_userObjectPointer = userPointer;
    }

    setUserIndex(index: number): void {
        this.m_userIndex = index;
    }

    setUserIndex2(index: number): void {
        this.m_userIndex2 = index;
    }

    setUserIndex3(index: number): void {
        this.m_userIndex3 = index;
    }

    getUpdateRevisionInternal(): number {
        return this.m_updateRevision;
    }

    setCustomDebugColor(colorRGB: btVector3): void {
        this.m_customDebugColorRGB.copy(colorRGB);
        this.m_collisionFlags |= btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
    }

    removeCustomDebugColor(): void {
        this.m_collisionFlags &= ~btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
    }

    getCustomDebugColor(): btVector3 | null {
        const hasCustomColor = (this.m_collisionFlags & btCollisionObject.CollisionFlags.CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR) !== 0;
        return hasCustomColor ? this.m_customDebugColorRGB : null;
    }

    checkCollideWith(co: btCollisionObject): boolean {
        if (this.m_checkCollideWith) {
            return this.checkCollideWithOverride(co);
        }
        return true;
    }
}