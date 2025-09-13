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
import { btTypedObject } from "../../LinearMath/btScalar";
import { btAssert } from "../../LinearMath/btScalar";
import { btManifoldPoint, btContactPointFlags } from "./btManifoldPoint";
/** maximum contact breaking and merging threshold */
export let gContactBreakingThreshold = 0.02;
/** Global contact callbacks - using a mutable object to allow test modification */
export const globalContactCallbacks = {
    gContactDestroyedCallback: null,
    gContactProcessedCallback: null,
    gContactStartedCallback: null,
    gContactEndedCallback: null
};
// Export individual getters for backwards compatibility
export const gContactDestroyedCallback = () => globalContactCallbacks.gContactDestroyedCallback;
export const gContactProcessedCallback = () => globalContactCallbacks.gContactProcessedCallback;
export const gContactStartedCallback = () => globalContactCallbacks.gContactStartedCallback;
export const gContactEndedCallback = () => globalContactCallbacks.gContactEndedCallback;
/** The enum starts at 1024 to avoid type conflicts with btTypedConstraint */
export var btContactManifoldTypes;
(function (btContactManifoldTypes) {
    btContactManifoldTypes[btContactManifoldTypes["MIN_CONTACT_MANIFOLD_TYPE"] = 1024] = "MIN_CONTACT_MANIFOLD_TYPE";
    btContactManifoldTypes[btContactManifoldTypes["BT_PERSISTENT_MANIFOLD_TYPE"] = 1025] = "BT_PERSISTENT_MANIFOLD_TYPE";
})(btContactManifoldTypes || (btContactManifoldTypes = {}));
export const MANIFOLD_CACHE_SIZE = 4;
/**
 * btPersistentManifold is a contact point cache, it stays persistent as long as objects are overlapping in the broadphase.
 * Those contact points are created by the collision narrow phase.
 * The cache can be empty, or hold 1,2,3 or 4 points. Some collision algorithms (GJK) might only add one point at a time.
 * updates/refreshes old contact points, and throw them away if necessary (distance becomes too large)
 * reduces the cache to 4 points, when more then 4 points are added, using following rules:
 * the contact point with deepest penetration is always kept, and it tries to maximize the area covered by the points
 * note that some pairs of objects might have more then one contact manifold.
 */
export class btPersistentManifold extends btTypedObject {
    constructor(body0, body1, _unused, contactBreakingThreshold, contactProcessingThreshold) {
        super(btContactManifoldTypes.BT_PERSISTENT_MANIFOLD_TYPE);
        this.m_pointCache = [];
        for (let i = 0; i < MANIFOLD_CACHE_SIZE; i++) {
            this.m_pointCache.push(new btManifoldPoint());
        }
        this.m_body0 = body0 || null;
        this.m_body1 = body1 || null;
        this.m_cachedPoints = 0;
        this.m_contactBreakingThreshold = contactBreakingThreshold || gContactBreakingThreshold;
        this.m_contactProcessingThreshold = contactProcessingThreshold || gContactBreakingThreshold;
        this.m_companionIdA = 0;
        this.m_companionIdB = 0;
        this.m_index1a = 0;
    }
    getBody0() {
        return this.m_body0;
    }
    getBody1() {
        return this.m_body1;
    }
    setBodies(body0, body1) {
        this.m_body0 = body0;
        this.m_body1 = body1;
    }
    clearUserCache(pt) {
        const cache = pt.m_userPersistentData;
        if (cache && globalContactCallbacks.gContactDestroyedCallback) {
            globalContactCallbacks.gContactDestroyedCallback(cache);
        }
        pt.m_userPersistentData = null;
    }
    getNumContacts() {
        return this.m_cachedPoints;
    }
    /** the setNumContacts API is usually not used, except when you gather/fill all contacts manually */
    setNumContacts(cachedPoints) {
        this.m_cachedPoints = cachedPoints;
    }
    getContactPoint(index) {
        btAssert(index < this.m_cachedPoints);
        return this.m_pointCache[index];
    }
    /** @todo: get this margin from the current physics / collision environment */
    getContactBreakingThreshold() {
        return this.m_contactBreakingThreshold;
    }
    getContactProcessingThreshold() {
        return this.m_contactProcessingThreshold;
    }
    setContactBreakingThreshold(contactBreakingThreshold) {
        this.m_contactBreakingThreshold = contactBreakingThreshold;
    }
    setContactProcessingThreshold(contactProcessingThreshold) {
        this.m_contactProcessingThreshold = contactProcessingThreshold;
    }
    getCacheEntry(newPoint) {
        let shortestDist = this.getContactBreakingThreshold() * this.getContactBreakingThreshold();
        let size = this.getNumContacts();
        let nearestPoint = -1;
        for (let i = 0; i < size; i++) {
            const mp = this.m_pointCache[i];
            const diffA = mp.m_localPointA.subtract(newPoint.m_localPointA);
            const distToManiPoint = diffA.dot(diffA);
            if (distToManiPoint < shortestDist) {
                shortestDist = distToManiPoint;
                nearestPoint = i;
            }
        }
        return nearestPoint;
    }
    addManifoldPoint(newPoint, _isPredictive = false) {
        btAssert(this.validContactDistance(newPoint));
        let insertIndex = this.getNumContacts();
        if (insertIndex === MANIFOLD_CACHE_SIZE) {
            if (MANIFOLD_CACHE_SIZE >= 4) {
                // Sort so most isolated points come first
                insertIndex = this.sortCachedPoints(newPoint);
            }
            else {
                insertIndex = 0;
            }
            this.clearUserCache(this.m_pointCache[insertIndex]);
        }
        else {
            this.m_cachedPoints++;
        }
        if (insertIndex < 0) {
            insertIndex = 0;
        }
        btAssert(this.m_pointCache[insertIndex].m_userPersistentData === null);
        this.m_pointCache[insertIndex] = newPoint;
        return insertIndex;
    }
    removeContactPoint(index) {
        this.clearUserCache(this.m_pointCache[index]);
        const lastUsedIndex = this.getNumContacts() - 1;
        if (index !== lastUsedIndex) {
            this.m_pointCache[index] = this.m_pointCache[lastUsedIndex];
            // Get rid of duplicated userPersistentData pointer
            this.m_pointCache[lastUsedIndex].m_userPersistentData = null;
            this.m_pointCache[lastUsedIndex].m_appliedImpulse = 0;
            this.m_pointCache[lastUsedIndex].m_prevRHS = 0;
            this.m_pointCache[lastUsedIndex].m_contactPointFlags = 0;
            this.m_pointCache[lastUsedIndex].m_appliedImpulseLateral1 = 0;
            this.m_pointCache[lastUsedIndex].m_appliedImpulseLateral2 = 0;
            this.m_pointCache[lastUsedIndex].m_lifeTime = 0;
        }
        btAssert(this.m_pointCache[lastUsedIndex].m_userPersistentData === null);
        this.m_cachedPoints--;
        if (globalContactCallbacks.gContactEndedCallback && this.m_cachedPoints === 0) {
            globalContactCallbacks.gContactEndedCallback(this);
        }
    }
    replaceContactPoint(newPoint, insertIndex) {
        btAssert(this.validContactDistance(newPoint));
        const lifeTime = this.m_pointCache[insertIndex].getLifeTime();
        const appliedImpulse = this.m_pointCache[insertIndex].m_appliedImpulse;
        const prevRHS = this.m_pointCache[insertIndex].m_prevRHS;
        const appliedLateralImpulse1 = this.m_pointCache[insertIndex].m_appliedImpulseLateral1;
        const appliedLateralImpulse2 = this.m_pointCache[insertIndex].m_appliedImpulseLateral2;
        let replacePoint = true;
        /** we keep existing contact points for friction anchors */
        /** if the friction force is within the Coulomb friction cone */
        if (newPoint.m_contactPointFlags & btContactPointFlags.BT_CONTACT_FLAG_FRICTION_ANCHOR) {
            const mu = this.m_pointCache[insertIndex].m_combinedFriction;
            const eps = 0; // we could allow to enlarge or shrink the tolerance to check against the friction cone a bit
            const a = appliedLateralImpulse1 * appliedLateralImpulse1 + appliedLateralImpulse2 * appliedLateralImpulse2;
            const b = eps + mu * appliedImpulse;
            replacePoint = (a) > (b * b);
        }
        if (replacePoint) {
            btAssert(lifeTime >= 0);
            const cache = this.m_pointCache[insertIndex].m_userPersistentData;
            this.m_pointCache[insertIndex] = newPoint;
            this.m_pointCache[insertIndex].m_userPersistentData = cache;
            this.m_pointCache[insertIndex].m_appliedImpulse = appliedImpulse;
            this.m_pointCache[insertIndex].m_prevRHS = prevRHS;
            this.m_pointCache[insertIndex].m_appliedImpulseLateral1 = appliedLateralImpulse1;
            this.m_pointCache[insertIndex].m_appliedImpulseLateral2 = appliedLateralImpulse2;
        }
        this.m_pointCache[insertIndex].m_lifeTime = lifeTime;
    }
    validContactDistance(pt) {
        return pt.m_distance1 <= this.getContactBreakingThreshold();
    }
    /** calculated new worldspace coordinates and depth, and reject points that exceed the collision margin */
    refreshContactPoints(trA, trB) {
        let i;
        for (i = this.getNumContacts() - 1; i >= 0; i--) {
            const manifoldPoint = this.m_pointCache[i];
            manifoldPoint.m_positionWorldOnA = trA.transformPoint(manifoldPoint.m_localPointA);
            manifoldPoint.m_positionWorldOnB = trB.transformPoint(manifoldPoint.m_localPointB);
            manifoldPoint.m_distance1 = manifoldPoint.m_positionWorldOnA.subtract(manifoldPoint.m_positionWorldOnB).dot(manifoldPoint.m_normalWorldOnB);
            manifoldPoint.m_lifeTime++;
        }
        // First remove deeper penetrations
        let distance2d = this.getContactBreakingThreshold() * this.getContactBreakingThreshold();
        for (i = this.getNumContacts() - 1; i >= 0; i--) {
            const manifoldPoint = this.m_pointCache[i];
            // Contact becomes invalid when signed distance exceeds the breaking threshold
            // Contact also becomes invalid when relative motion between the two contact points exceeds the breaking threshold
            // this is to catch cases where the object is removed from the manifold too late.
            if (!this.validContactDistance(manifoldPoint)) {
                this.removeContactPoint(i);
            }
            else {
                // Calculate relative motion
                const distance2 = manifoldPoint.m_positionWorldOnA.subtract(manifoldPoint.m_positionWorldOnB).length2();
                if (distance2 > distance2d) {
                    this.removeContactPoint(i);
                }
            }
        }
    }
    clearManifold() {
        for (let i = 0; i < this.m_cachedPoints; i++) {
            this.clearUserCache(this.m_pointCache[i]);
        }
        if (globalContactCallbacks.gContactEndedCallback && this.m_cachedPoints) {
            globalContactCallbacks.gContactEndedCallback(this);
        }
        this.m_cachedPoints = 0;
    }
    /** sort cached points so most isolated points come first */
    sortCachedPoints(pt) {
        // Calculate area of the quadrilateral formed by the current cached points plus the new point
        let maxPenetration = pt.getDistance();
        let biggestIndex = -1;
        for (let i = 0; i < this.getNumContacts(); i++) {
            if (this.m_pointCache[i].getDistance() < maxPenetration) {
                maxPenetration = this.m_pointCache[i].getDistance();
                biggestIndex = i;
            }
        }
        // If no point is deeper than the new point, don't add it
        if (biggestIndex >= 0) {
            return biggestIndex;
        }
        // Find the point that contributes least to the contact area
        let res0 = 0, res1 = 0, res2 = 0, res3 = 0;
        if (MANIFOLD_CACHE_SIZE >= 4) {
            const a0 = pt.m_localPointA.subtract(this.m_pointCache[1].m_localPointA);
            const b0 = this.m_pointCache[3].m_localPointA.subtract(this.m_pointCache[2].m_localPointA);
            res0 = a0.cross(b0).length2();
            const a1 = pt.m_localPointA.subtract(this.m_pointCache[0].m_localPointA);
            const b1 = this.m_pointCache[3].m_localPointA.subtract(this.m_pointCache[2].m_localPointA);
            res1 = a1.cross(b1).length2();
            const a2 = pt.m_localPointA.subtract(this.m_pointCache[0].m_localPointA);
            const b2 = this.m_pointCache[3].m_localPointA.subtract(this.m_pointCache[1].m_localPointA);
            res2 = a2.cross(b2).length2();
            const a3 = pt.m_localPointA.subtract(this.m_pointCache[0].m_localPointA);
            const b3 = this.m_pointCache[2].m_localPointA.subtract(this.m_pointCache[1].m_localPointA);
            res3 = a3.cross(b3).length2();
        }
        let biggestarea = res0;
        biggestIndex = 0;
        if (res1 > biggestarea) {
            biggestarea = res1;
            biggestIndex = 1;
        }
        if (res2 > biggestarea) {
            biggestarea = res2;
            biggestIndex = 2;
        }
        if (res3 > biggestarea) {
            biggestarea = res3;
            biggestIndex = 3;
        }
        return biggestIndex;
    }
}
