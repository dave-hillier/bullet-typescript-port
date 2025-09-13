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
/// btDispatcher uses these types
/// IMPORTANT NOTE: The types are ordered polyhedral, implicit convex and concave
/// to facilitate type checking
/// CUSTOM_POLYHEDRAL_SHAPE_TYPE, CUSTOM_CONVEX_SHAPE_TYPE and CUSTOM_CONCAVE_SHAPE_TYPE can be used to extend Bullet without modifying source code
export var BroadphaseNativeTypes;
(function (BroadphaseNativeTypes) {
    // polyhedral convex shapes
    BroadphaseNativeTypes[BroadphaseNativeTypes["BOX_SHAPE_PROXYTYPE"] = 0] = "BOX_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["TRIANGLE_SHAPE_PROXYTYPE"] = 1] = "TRIANGLE_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["TETRAHEDRAL_SHAPE_PROXYTYPE"] = 2] = "TETRAHEDRAL_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE"] = 3] = "CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_HULL_SHAPE_PROXYTYPE"] = 4] = "CONVEX_HULL_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE"] = 5] = "CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CUSTOM_POLYHEDRAL_SHAPE_TYPE"] = 6] = "CUSTOM_POLYHEDRAL_SHAPE_TYPE";
    // implicit convex shapes
    BroadphaseNativeTypes[BroadphaseNativeTypes["IMPLICIT_CONVEX_SHAPES_START_HERE"] = 7] = "IMPLICIT_CONVEX_SHAPES_START_HERE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["SPHERE_SHAPE_PROXYTYPE"] = 8] = "SPHERE_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["MULTI_SPHERE_SHAPE_PROXYTYPE"] = 9] = "MULTI_SPHERE_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CAPSULE_SHAPE_PROXYTYPE"] = 10] = "CAPSULE_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONE_SHAPE_PROXYTYPE"] = 11] = "CONE_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_SHAPE_PROXYTYPE"] = 12] = "CONVEX_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CYLINDER_SHAPE_PROXYTYPE"] = 13] = "CYLINDER_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["UNIFORM_SCALING_SHAPE_PROXYTYPE"] = 14] = "UNIFORM_SCALING_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["MINKOWSKI_SUM_SHAPE_PROXYTYPE"] = 15] = "MINKOWSKI_SUM_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE"] = 16] = "MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["BOX_2D_SHAPE_PROXYTYPE"] = 17] = "BOX_2D_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONVEX_2D_SHAPE_PROXYTYPE"] = 18] = "CONVEX_2D_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CUSTOM_CONVEX_SHAPE_TYPE"] = 19] = "CUSTOM_CONVEX_SHAPE_TYPE";
    // concave shapes
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONCAVE_SHAPES_START_HERE"] = 20] = "CONCAVE_SHAPES_START_HERE";
    // keep all the convex shapetype below here, for the check IsConvexShape in broadphase proxy!
    BroadphaseNativeTypes[BroadphaseNativeTypes["TRIANGLE_MESH_SHAPE_PROXYTYPE"] = 21] = "TRIANGLE_MESH_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE"] = 22] = "SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE";
    /// used for demo integration FAST/Swift collision library and Bullet
    BroadphaseNativeTypes[BroadphaseNativeTypes["FAST_CONCAVE_MESH_PROXYTYPE"] = 23] = "FAST_CONCAVE_MESH_PROXYTYPE";
    // terrain
    BroadphaseNativeTypes[BroadphaseNativeTypes["TERRAIN_SHAPE_PROXYTYPE"] = 24] = "TERRAIN_SHAPE_PROXYTYPE";
    /// Used for GIMPACT Trimesh integration
    BroadphaseNativeTypes[BroadphaseNativeTypes["GIMPACT_SHAPE_PROXYTYPE"] = 25] = "GIMPACT_SHAPE_PROXYTYPE";
    /// Multimaterial mesh
    BroadphaseNativeTypes[BroadphaseNativeTypes["MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE"] = 26] = "MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["EMPTY_SHAPE_PROXYTYPE"] = 27] = "EMPTY_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["STATIC_PLANE_PROXYTYPE"] = 28] = "STATIC_PLANE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CUSTOM_CONCAVE_SHAPE_TYPE"] = 29] = "CUSTOM_CONCAVE_SHAPE_TYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["SDF_SHAPE_PROXYTYPE"] = 29] = "SDF_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["CONCAVE_SHAPES_END_HERE"] = 30] = "CONCAVE_SHAPES_END_HERE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["COMPOUND_SHAPE_PROXYTYPE"] = 31] = "COMPOUND_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["SOFTBODY_SHAPE_PROXYTYPE"] = 32] = "SOFTBODY_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["HFFLUID_SHAPE_PROXYTYPE"] = 33] = "HFFLUID_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE"] = 34] = "HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["INVALID_SHAPE_PROXYTYPE"] = 35] = "INVALID_SHAPE_PROXYTYPE";
    BroadphaseNativeTypes[BroadphaseNativeTypes["MAX_BROADPHASE_COLLISION_TYPES"] = 36] = "MAX_BROADPHASE_COLLISION_TYPES";
})(BroadphaseNativeTypes || (BroadphaseNativeTypes = {}));
/// The btBroadphaseProxy is the main class that can be used with the Bullet broadphases.
/// It stores collision shape type information, collision filter information and a client object, typically a btCollisionObject or btRigidBody.
export class btBroadphaseProxy {
    getUid() {
        return this.m_uniqueId;
    }
    constructor(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask) {
        // Usually the client btCollisionObject or Rigidbody class
        this.m_clientObject = null;
        this.m_collisionFilterGroup = 0;
        this.m_collisionFilterMask = 0;
        this.m_uniqueId = 0; // m_uniqueId is introduced for paircache. could get rid of this, by calculating the address offset etc.
        if (aabbMin && aabbMax && userPtr !== undefined && collisionFilterGroup !== undefined && collisionFilterMask !== undefined) {
            this.m_clientObject = userPtr;
            this.m_collisionFilterGroup = collisionFilterGroup;
            this.m_collisionFilterMask = collisionFilterMask;
            this.m_aabbMin = aabbMin;
            this.m_aabbMax = aabbMax;
        }
        else {
            this.m_clientObject = null;
            this.m_collisionFilterGroup = 0;
            this.m_collisionFilterMask = 0;
            this.m_aabbMin = new btVector3(0, 0, 0);
            this.m_aabbMax = new btVector3(0, 0, 0);
        }
    }
    static isPolyhedral(proxyType) {
        return proxyType < BroadphaseNativeTypes.IMPLICIT_CONVEX_SHAPES_START_HERE;
    }
    static isConvex(proxyType) {
        return proxyType < BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE;
    }
    static isNonMoving(proxyType) {
        return btBroadphaseProxy.isConcave(proxyType) && !(proxyType === BroadphaseNativeTypes.GIMPACT_SHAPE_PROXYTYPE);
    }
    static isConcave(proxyType) {
        return (proxyType > BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE) &&
            (proxyType < BroadphaseNativeTypes.CONCAVE_SHAPES_END_HERE);
    }
    static isCompound(proxyType) {
        return proxyType === BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;
    }
    static isSoftBody(proxyType) {
        return proxyType === BroadphaseNativeTypes.SOFTBODY_SHAPE_PROXYTYPE;
    }
    static isInfinite(proxyType) {
        return proxyType === BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE;
    }
    static isConvex2d(proxyType) {
        return (proxyType === BroadphaseNativeTypes.BOX_2D_SHAPE_PROXYTYPE) ||
            (proxyType === BroadphaseNativeTypes.CONVEX_2D_SHAPE_PROXYTYPE);
    }
}
/// optional filtering to cull potential collisions
btBroadphaseProxy.CollisionFilterGroups = {
    DefaultFilter: 1,
    StaticFilter: 2,
    KinematicFilter: 4,
    DebrisFilter: 8,
    SensorTrigger: 16,
    CharacterFilter: 32,
    AllFilter: -1 // all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
};
/// The btBroadphasePair class contains a pair of aabb-overlapping objects.
/// A btDispatcher can search a btCollisionAlgorithm that performs exact/narrowphase collision detection on the actual collision shapes.
export class btBroadphasePair {
    constructor(proxy0, proxy1) {
        this.m_pProxy0 = null;
        this.m_pProxy1 = null;
        this.m_algorithm = null;
        this.m_internalInfo1 = null;
        this.m_internalTmpValue = 0;
        if (proxy0 && proxy1) {
            // keep them sorted, so the std::set operations work
            if (proxy0.m_uniqueId < proxy1.m_uniqueId) {
                this.m_pProxy0 = proxy0;
                this.m_pProxy1 = proxy1;
            }
            else {
                this.m_pProxy0 = proxy1;
                this.m_pProxy1 = proxy0;
            }
            this.m_algorithm = null;
            this.m_internalInfo1 = null;
        }
    }
}
export class btBroadphasePairSortPredicate {
    compare(a, b) {
        const uidA0 = a.m_pProxy0 ? a.m_pProxy0.m_uniqueId : -1;
        const uidB0 = b.m_pProxy0 ? b.m_pProxy0.m_uniqueId : -1;
        const uidA1 = a.m_pProxy1 ? a.m_pProxy1.m_uniqueId : -1;
        const uidB1 = b.m_pProxy1 ? b.m_pProxy1.m_uniqueId : -1;
        // For algorithm comparison, we use object identity (similar to pointer comparison in C++)
        // This is a simple comparison by object reference
        const algorithmComparison = () => {
            if (!a.m_algorithm && !b.m_algorithm)
                return false;
            if (!a.m_algorithm)
                return false;
            if (!b.m_algorithm)
                return true;
            // Compare by object reference hash (simplified pointer comparison)
            return a.m_algorithm !== b.m_algorithm;
        };
        return uidA0 > uidB0 ||
            (a.m_pProxy0 === b.m_pProxy0 && uidA1 > uidB1) ||
            (a.m_pProxy0 === b.m_pProxy0 && a.m_pProxy1 === b.m_pProxy1 && algorithmComparison());
    }
}
export function btBroadphasePairEquals(a, b) {
    return (a.m_pProxy0 === b.m_pProxy0) && (a.m_pProxy1 === b.m_pProxy1);
}
