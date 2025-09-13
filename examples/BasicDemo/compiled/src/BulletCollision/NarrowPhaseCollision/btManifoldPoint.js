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
import { btVector3 } from '../../LinearMath/btVector3';
/**
 * Contact point flags for additional information
 */
export var btContactPointFlags;
(function (btContactPointFlags) {
    btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED"] = 1] = "BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED";
    btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_HAS_CONTACT_CFM"] = 2] = "BT_CONTACT_FLAG_HAS_CONTACT_CFM";
    btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_HAS_CONTACT_ERP"] = 4] = "BT_CONTACT_FLAG_HAS_CONTACT_ERP";
    btContactPointFlags[btContactPointFlags["BT_CONTACT_FLAG_FRICTION_ANCHOR"] = 8] = "BT_CONTACT_FLAG_FRICTION_ANCHOR";
})(btContactPointFlags || (btContactPointFlags = {}));
/**
 * btManifoldPoint collects and maintains persistent contactpoints.
 * Used to improve stability and performance of rigidbody dynamics response.
 */
export class btManifoldPoint {
    constructor(pointA, pointB, normal, distance) {
        this.m_localPointA = pointA ? new btVector3(pointA.x(), pointA.y(), pointA.z()) : new btVector3();
        this.m_localPointB = pointB ? new btVector3(pointB.x(), pointB.y(), pointB.z()) : new btVector3();
        this.m_positionWorldOnB = pointB ? new btVector3(pointB.x(), pointB.y(), pointB.z()) : new btVector3();
        this.m_positionWorldOnA = pointA ? new btVector3(pointA.x(), pointA.y(), pointA.z()) : new btVector3();
        this.m_normalWorldOnB = normal ? new btVector3(normal.x(), normal.y(), normal.z()) : new btVector3();
        this.m_distance1 = distance || 0;
        this.m_combinedFriction = 0;
        this.m_combinedRestitution = 0;
        this.m_combinedRollingFriction = 0;
        this.m_combinedSpinningFriction = 0;
        this.m_appliedImpulse = 0;
        this.m_lateralFrictionInitialized = false;
        this.m_appliedImpulseLateral1 = 0;
        this.m_appliedImpulseLateral2 = 0;
        this.m_contactMotion1 = 0;
        this.m_contactMotion2 = 0;
        this.m_contactCFM1 = 0;
        this.m_contactCFM2 = 0;
        this.m_contactERP = 0;
        this.m_lifeTime = 0;
        this.m_lateralFrictionDir1 = new btVector3();
        this.m_lateralFrictionDir2 = new btVector3();
        this.m_userPersistentData = null;
        this.m_partId0 = -1;
        this.m_partId1 = -1;
        this.m_index0 = -1;
        this.m_index1 = -1;
        this.m_contactPointFlags = 0;
        this.m_prevRHS = 0;
    }
    /**
     * Get distance between contact points
     */
    getDistance() {
        return this.m_distance1;
    }
    /**
     * Get lifetime of this contact point
     */
    getLifeTime() {
        return this.m_lifeTime;
    }
    /**
     * Get position on object A in world coordinates
     */
    getPositionWorldOnA() {
        return this.m_positionWorldOnA;
    }
    /**
     * Get position on object B in world coordinates
     */
    getPositionWorldOnB() {
        return this.m_positionWorldOnB;
    }
    /**
     * Set distance between contact points
     */
    setDistance(dist) {
        this.m_distance1 = dist;
    }
    /**
     * Get applied impulse
     */
    getAppliedImpulse() {
        return this.m_appliedImpulse;
    }
}
