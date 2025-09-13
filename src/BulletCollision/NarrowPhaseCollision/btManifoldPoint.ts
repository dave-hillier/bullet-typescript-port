/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org

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
export enum btContactPointFlags {
    BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED = 1,
    BT_CONTACT_FLAG_HAS_CONTACT_CFM = 2,
    BT_CONTACT_FLAG_HAS_CONTACT_ERP = 4
}

/**
 * btManifoldPoint collects and maintains persistent contactpoints.
 * Used to improve stability and performance of rigidbody dynamics response.
 */
export class btManifoldPoint {
    public m_localPointA: btVector3;
    public m_localPointB: btVector3;
    public m_positionWorldOnB: btVector3;
    public m_positionWorldOnA: btVector3;
    public m_normalWorldOnB: btVector3;

    public m_distance1: number;
    public m_combinedFriction: number;
    public m_combinedRestitution: number;
    public m_combinedRollingFriction: number;
    public m_combinedSpinningFriction: number;

    // BP Mod - only for motion interpolation
    public m_appliedImpulse: number;

    public m_lateralFrictionInitialized: boolean;
    public m_appliedImpulseLateral1: number;
    public m_appliedImpulseLateral2: number;
    public m_contactMotion1: number;
    public m_contactMotion2: number;
    public m_contactCFM1: number;
    public m_contactCFM2: number;
    public m_contactERP: number;

    public m_lifeTime: number; // How long the contact point has been there

    public m_lateralFrictionDir1: btVector3;
    public m_lateralFrictionDir2: btVector3;

    public m_userPersistentData: any;

    // Additional properties for contact constraints
    public m_partId0: number;
    public m_partId1: number;
    public m_index0: number;
    public m_index1: number;
    
    // Contact point flags
    public m_contactPointFlags: number;

    constructor();
    constructor(pointA: btVector3, pointB: btVector3, normal: btVector3, distance: number);
    constructor(pointA?: btVector3, pointB?: btVector3, normal?: btVector3, distance?: number) {
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
    }

    /**
     * Get distance between contact points
     */
    getDistance(): number {
        return this.m_distance1;
    }

    /**
     * Get lifetime of this contact point
     */
    getLifeTime(): number {
        return this.m_lifeTime;
    }

    /**
     * Get position on object A in world coordinates
     */
    getPositionWorldOnA(): btVector3 {
        return this.m_positionWorldOnA;
    }

    /**
     * Get position on object B in world coordinates  
     */
    getPositionWorldOnB(): btVector3 {
        return this.m_positionWorldOnB;
    }

    /**
     * Set distance between contact points
     */
    setDistance(dist: number): void {
        this.m_distance1 = dist;
    }

    /**
     * Get applied impulse
     */
    getAppliedImpulse(): number {
        return this.m_appliedImpulse;
    }
}