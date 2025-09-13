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
export enum BroadphaseNativeTypes {
	// polyhedral convex shapes
	BOX_SHAPE_PROXYTYPE = 0,
	TRIANGLE_SHAPE_PROXYTYPE,
	TETRAHEDRAL_SHAPE_PROXYTYPE,
	CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE,
	CONVEX_HULL_SHAPE_PROXYTYPE,
	CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE,
	CUSTOM_POLYHEDRAL_SHAPE_TYPE,
	
	// implicit convex shapes
	IMPLICIT_CONVEX_SHAPES_START_HERE,
	SPHERE_SHAPE_PROXYTYPE,
	MULTI_SPHERE_SHAPE_PROXYTYPE,
	CAPSULE_SHAPE_PROXYTYPE,
	CONE_SHAPE_PROXYTYPE,
	CONVEX_SHAPE_PROXYTYPE,
	CYLINDER_SHAPE_PROXYTYPE,
	UNIFORM_SCALING_SHAPE_PROXYTYPE,
	MINKOWSKI_SUM_SHAPE_PROXYTYPE,
	MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE,
	BOX_2D_SHAPE_PROXYTYPE,
	CONVEX_2D_SHAPE_PROXYTYPE,
	CUSTOM_CONVEX_SHAPE_TYPE,
	
	// concave shapes
	CONCAVE_SHAPES_START_HERE,
	// keep all the convex shapetype below here, for the check IsConvexShape in broadphase proxy!
	TRIANGLE_MESH_SHAPE_PROXYTYPE,
	SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE,
	/// used for demo integration FAST/Swift collision library and Bullet
	FAST_CONCAVE_MESH_PROXYTYPE,
	// terrain
	TERRAIN_SHAPE_PROXYTYPE,
	/// Used for GIMPACT Trimesh integration
	GIMPACT_SHAPE_PROXYTYPE,
	/// Multimaterial mesh
	MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE,

	EMPTY_SHAPE_PROXYTYPE,
	STATIC_PLANE_PROXYTYPE,
	CUSTOM_CONCAVE_SHAPE_TYPE,
	SDF_SHAPE_PROXYTYPE = CUSTOM_CONCAVE_SHAPE_TYPE,
	CONCAVE_SHAPES_END_HERE,

	COMPOUND_SHAPE_PROXYTYPE,

	SOFTBODY_SHAPE_PROXYTYPE,
	HFFLUID_SHAPE_PROXYTYPE,
	HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE,
	INVALID_SHAPE_PROXYTYPE,

	MAX_BROADPHASE_COLLISION_TYPES
}

/// The btBroadphaseProxy is the main class that can be used with the Bullet broadphases.
/// It stores collision shape type information, collision filter information and a client object, typically a btCollisionObject or btRigidBody.
export class btBroadphaseProxy {
	/// optional filtering to cull potential collisions
	public static readonly CollisionFilterGroups = {
		DefaultFilter: 1,
		StaticFilter: 2,
		KinematicFilter: 4,
		DebrisFilter: 8,
		SensorTrigger: 16,
		CharacterFilter: 32,
		AllFilter: -1  // all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
	} as const;

	// Usually the client btCollisionObject or Rigidbody class
	public m_clientObject: any = null;
	public m_collisionFilterGroup: number = 0;
	public m_collisionFilterMask: number = 0;
	public m_uniqueId: number = 0; // m_uniqueId is introduced for paircache. could get rid of this, by calculating the address offset etc.
	public m_aabbMin: btVector3;
	public m_aabbMax: btVector3;

	public getUid(): number {
		return this.m_uniqueId;
	}

	// used for memory pools
	constructor();
	constructor(aabbMin: btVector3, aabbMax: btVector3, userPtr: any, collisionFilterGroup: number, collisionFilterMask: number);
	constructor(aabbMin?: btVector3, aabbMax?: btVector3, userPtr?: any, collisionFilterGroup?: number, collisionFilterMask?: number) {
		if (aabbMin && aabbMax && userPtr !== undefined && collisionFilterGroup !== undefined && collisionFilterMask !== undefined) {
			this.m_clientObject = userPtr;
			this.m_collisionFilterGroup = collisionFilterGroup;
			this.m_collisionFilterMask = collisionFilterMask;
			this.m_aabbMin = aabbMin;
			this.m_aabbMax = aabbMax;
		} else {
			this.m_clientObject = null;
			this.m_collisionFilterGroup = 0;
			this.m_collisionFilterMask = 0;
			this.m_aabbMin = new btVector3(0, 0, 0);
			this.m_aabbMax = new btVector3(0, 0, 0);
		}
	}

	public static isPolyhedral(proxyType: number): boolean {
		return proxyType < BroadphaseNativeTypes.IMPLICIT_CONVEX_SHAPES_START_HERE;
	}

	public static isConvex(proxyType: number): boolean {
		return proxyType < BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE;
	}

	public static isNonMoving(proxyType: number): boolean {
		return btBroadphaseProxy.isConcave(proxyType) && !(proxyType === BroadphaseNativeTypes.GIMPACT_SHAPE_PROXYTYPE);
	}

	public static isConcave(proxyType: number): boolean {
		return (proxyType > BroadphaseNativeTypes.CONCAVE_SHAPES_START_HERE) &&
			   (proxyType < BroadphaseNativeTypes.CONCAVE_SHAPES_END_HERE);
	}

	public static isCompound(proxyType: number): boolean {
		return proxyType === BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;
	}

	public static isSoftBody(proxyType: number): boolean {
		return proxyType === BroadphaseNativeTypes.SOFTBODY_SHAPE_PROXYTYPE;
	}

	public static isInfinite(proxyType: number): boolean {
		return proxyType === BroadphaseNativeTypes.STATIC_PLANE_PROXYTYPE;
	}

	public static isConvex2d(proxyType: number): boolean {
		return (proxyType === BroadphaseNativeTypes.BOX_2D_SHAPE_PROXYTYPE) || 
			   (proxyType === BroadphaseNativeTypes.CONVEX_2D_SHAPE_PROXYTYPE);
	}
}

// Forward declaration for collision algorithm
export interface btCollisionAlgorithm {
	// Interface placeholder - will be defined when porting collision algorithms
}

/// The btBroadphasePair class contains a pair of aabb-overlapping objects.
/// A btDispatcher can search a btCollisionAlgorithm that performs exact/narrowphase collision detection on the actual collision shapes.
export class btBroadphasePair {
	public m_pProxy0: btBroadphaseProxy | null = null;
	public m_pProxy1: btBroadphaseProxy | null = null;
	public m_algorithm: btCollisionAlgorithm | null = null;
	public m_internalInfo1: any = null;
	public m_internalTmpValue: number = 0;

	constructor();
	constructor(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy);
	constructor(proxy0?: btBroadphaseProxy, proxy1?: btBroadphaseProxy) {
		if (proxy0 && proxy1) {
			// keep them sorted, so the std::set operations work
			if (proxy0.m_uniqueId < proxy1.m_uniqueId) {
				this.m_pProxy0 = proxy0;
				this.m_pProxy1 = proxy1;
			} else {
				this.m_pProxy0 = proxy1;
				this.m_pProxy1 = proxy0;
			}

			this.m_algorithm = null;
			this.m_internalInfo1 = null;
		}
	}
}

export class btBroadphasePairSortPredicate {
	public compare(a: btBroadphasePair, b: btBroadphasePair): boolean {
		const uidA0 = a.m_pProxy0 ? a.m_pProxy0.m_uniqueId : -1;
		const uidB0 = b.m_pProxy0 ? b.m_pProxy0.m_uniqueId : -1;
		const uidA1 = a.m_pProxy1 ? a.m_pProxy1.m_uniqueId : -1;
		const uidB1 = b.m_pProxy1 ? b.m_pProxy1.m_uniqueId : -1;

		// For algorithm comparison, we use object identity (similar to pointer comparison in C++)
		// This is a simple comparison by object reference
		const algorithmComparison = () => {
			if (!a.m_algorithm && !b.m_algorithm) return false;
			if (!a.m_algorithm) return false;
			if (!b.m_algorithm) return true;
			// Compare by object reference hash (simplified pointer comparison)
			return a.m_algorithm !== b.m_algorithm;
		};

		return uidA0 > uidB0 ||
			   (a.m_pProxy0 === b.m_pProxy0 && uidA1 > uidB1) ||
			   (a.m_pProxy0 === b.m_pProxy0 && a.m_pProxy1 === b.m_pProxy1 && algorithmComparison());
	}
}

export function btBroadphasePairEquals(a: btBroadphasePair, b: btBroadphasePair): boolean {
	return (a.m_pProxy0 === b.m_pProxy0) && (a.m_pProxy1 === b.m_pProxy1);
}