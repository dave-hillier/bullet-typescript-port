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

import { btConvexShape } from './btConvexShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btTransformAabbOverload as btTransformAabb } from '../../LinearMath/btAabbUtil2';
import { multiplyMatrixVector } from '../../LinearMath/btMatrix3x3';
import { CONVEX_DISTANCE_MARGIN } from './btCollisionMargin';
import { btAssert, SIMD_EPSILON } from '../../LinearMath/btScalar';
import { btCollisionShapeData } from './btCollisionShape';

/**
 * Serialization data structure for btConvexInternalShape
 * Used for save/load functionality
 */
export interface btConvexInternalShapeData {
    collisionShapeData: btCollisionShapeData;
    localScaling: { x: number; y: number; z: number };
    implicitShapeDimensions: { x: number; y: number; z: number };
    collisionMargin: number;
    padding: number;
}

/**
 * The btConvexInternalShape is an internal base class, shared by most convex shape implementations.
 * The btConvexInternalShape uses a default collision margin set to CONVEX_DISTANCE_MARGIN.
 * This collision margin used by Gjk and some other algorithms, see also btCollisionMargin.h
 * Note that when creating small shapes (derived from btConvexInternalShape),
 * you need to make sure to set a smaller collision margin, using the 'setMargin' API
 * There is a automatic mechanism 'setSafeMargin' used by btBoxShape and btCylinderShape
 */
export abstract class btConvexInternalShape extends btConvexShape {
    protected localScaling: btVector3;
    protected implicitShapeDimensions: btVector3;
    protected collisionMargin: number;
    protected padding: number;

    protected constructor() {
        super();
        this.localScaling = new btVector3(1, 1, 1);
        this.implicitShapeDimensions = new btVector3(0, 0, 0);
        this.collisionMargin = CONVEX_DISTANCE_MARGIN;
        this.padding = 0;
    }

    /**
     * Get supporting vertex in local coordinate system, including margin
     */
    localGetSupportingVertex(vec: btVector3): btVector3 {
        const supVertex = this.localGetSupportingVertexWithoutMargin(vec);

        if (this.getMargin() !== 0) {
            const vecnorm = vec.clone();
            if (vecnorm.length2() < (SIMD_EPSILON * SIMD_EPSILON)) {
                vecnorm.setValue(-1, -1, -1);
            }
            vecnorm.normalize();
            supVertex.addAssign(vecnorm.multiply(this.getMargin()));
        }
        return supVertex;
    }

    /**
     * Get the implicit shape dimensions
     */
    getImplicitShapeDimensions(): btVector3 {
        return this.implicitShapeDimensions.clone();
    }

    /**
     * Warning: use setImplicitShapeDimensions with care
     * changing a collision shape while the body is in the world is not recommended,
     * it is best to remove the body from the world, then make the change, and re-add it
     * alternatively flush the contact points, see documentation for 'cleanProxyFromPairs'
     */
    setImplicitShapeDimensions(dimensions: btVector3): void {
        this.implicitShapeDimensions.copy(dimensions);
    }

    /**
     * Set safe margin based on minimum dimension
     */
    setSafeMargin(minDimension: number, defaultMarginMultiplier?: number): void;
    setSafeMargin(halfExtents: btVector3, defaultMarginMultiplier?: number): void;
    setSafeMargin(
        minDimensionOrHalfExtents: number | btVector3, 
        defaultMarginMultiplier: number = 0.1
    ): void {
        let minDimension: number;
        
        if (typeof minDimensionOrHalfExtents === 'number') {
            minDimension = minDimensionOrHalfExtents;
        } else {
            // see http://code.google.com/p/bullet/issues/detail?id=349
            // this margin check could be added to other collision shapes too,
            // or add some assert/warning somewhere
            const axis = minDimensionOrHalfExtents.minAxis();
            minDimension = axis === 0 ? minDimensionOrHalfExtents.x() : 
                          axis === 1 ? minDimensionOrHalfExtents.y() : 
                          minDimensionOrHalfExtents.z();
        }

        const safeMargin = defaultMarginMultiplier * minDimension;
        if (safeMargin < this.getMargin()) {
            this.setMargin(safeMargin);
        }
    }

    /**
     * getAabb's default implementation is brute force, expected derived classes to implement a fast dedicated version
     */
    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        this.getAabbSlow(t, aabbMin, aabbMax);
    }

    /**
     * Slow AABB calculation using support function queries
     */
    getAabbSlow(trans: btTransform, minAabb: btVector3, maxAabb: btVector3): void {
        const margin = this.getMargin();
        
        for (let i = 0; i < 3; i++) {
            let vec = new btVector3(0, 0, 0);
            if (i === 0) vec.setValue(1, 0, 0);
            else if (i === 1) vec.setValue(0, 1, 0);
            else vec.setValue(0, 0, 1);

            const transformedVec = multiplyMatrixVector(trans.getBasis(), vec);
            const sv = this.localGetSupportingVertexWithoutMargin(transformedVec);
            const tmp = trans.transformPoint(sv);
            
            vec = vec.negate();
            const transformedVec2 = multiplyMatrixVector(trans.getBasis(), vec);
            const sv2 = this.localGetSupportingVertexWithoutMargin(transformedVec2);
            const tmp2 = trans.transformPoint(sv2);
            
            if (i === 0) {
                maxAabb.setValue(tmp.x() + margin, 0, 0);
                minAabb.setValue(tmp2.x() - margin, 0, 0);
            } else if (i === 1) {
                maxAabb.setValue(maxAabb.x(), tmp.y() + margin, maxAabb.z());
                minAabb.setValue(minAabb.x(), tmp2.y() - margin, minAabb.z());
            } else {
                maxAabb.setValue(maxAabb.x(), maxAabb.y(), tmp.z() + margin);
                minAabb.setValue(minAabb.x(), minAabb.y(), tmp2.z() - margin);
            }
        }
    }

    /**
     * Set local scaling of the convex shape
     */
    setLocalScaling(scaling: btVector3): void {
        this.localScaling.copy(scaling.absolute());
    }

    /**
     * Get local scaling of the convex shape
     */
    getLocalScaling(): btVector3 {
        return this.localScaling.clone();
    }

    /**
     * Get local scaling without creating a copy (non-virtual version)
     */
    getLocalScalingNV(): btVector3 {
        return this.localScaling;
    }

    /**
     * Set the collision margin
     */
    setMargin(margin: number): void {
        this.collisionMargin = margin;
    }

    /**
     * Get the collision margin
     */
    getMargin(): number {
        return this.collisionMargin;
    }

    /**
     * Get collision margin without virtual call
     */
    getMarginNV(): number {
        return this.collisionMargin;
    }

    /**
     * Get the number of preferred penetration directions
     */
    getNumPreferredPenetrationDirections(): number {
        return 0;
    }

    /**
     * Get the preferred penetration direction at given index
     */
    getPreferredPenetrationDirection(_index: number, _penetrationVector: btVector3): void {
        btAssert(false, 'getPreferredPenetrationDirection not implemented');
    }

    /**
     * Calculate the size needed for serialization
     */
    calculateSerializeBufferSize(): number {
        // In TypeScript, we don't need to calculate buffer sizes for serialization
        // This method exists for API compatibility
        return 0;
    }

    /**
     * Serialize the shape data
     * Returns serialization type name for compatibility
     */
    serialize(_dataBuffer?: any, _serializer?: any): string {
        // In TypeScript, we can return a simple object structure
        // This method exists for API compatibility with C++ version
        return 'btConvexInternalShapeData';
    }

    /**
     * Create serialization data object
     */
    getSerializationData(): btConvexInternalShapeData {
        return {
            collisionShapeData: {} as btCollisionShapeData,
            localScaling: {
                x: this.localScaling.x(),
                y: this.localScaling.y(),
                z: this.localScaling.z()
            },
            implicitShapeDimensions: {
                x: this.implicitShapeDimensions.x(),
                y: this.implicitShapeDimensions.y(),
                z: this.implicitShapeDimensions.z()
            },
            collisionMargin: this.collisionMargin,
            padding: 0
        };
    }
}

/**
 * btConvexInternalAabbCachingShape adds local aabb caching for convex shapes, 
 * to avoid expensive bounding box calculations
 */
export abstract class btConvexInternalAabbCachingShape extends btConvexInternalShape {
    private localAabbMin: btVector3;
    private localAabbMax: btVector3;
    private isLocalAabbValid: boolean;

    protected constructor() {
        super();
        this.localAabbMin = new btVector3(1, 1, 1);
        this.localAabbMax = new btVector3(-1, -1, -1);
        this.isLocalAabbValid = false;
    }

    /**
     * Set cached local AABB
     */
    protected setCachedLocalAabb(aabbMin: btVector3, aabbMax: btVector3): void {
        this.isLocalAabbValid = true;
        this.localAabbMin.copy(aabbMin);
        this.localAabbMax.copy(aabbMax);
    }

    /**
     * Get cached local AABB
     */
    protected getCachedLocalAabb(aabbMin: btVector3, aabbMax: btVector3): void {
        btAssert(this.isLocalAabbValid, 'Local AABB cache is not valid');
        aabbMin.copy(this.localAabbMin);
        aabbMax.copy(this.localAabbMax);
    }

    /**
     * Get non-virtual AABB using cached local bounds
     */
    protected getNonvirtualAabb(trans: btTransform, aabbMin: btVector3, aabbMax: btVector3, _margin: number): void {
        // lazy evaluation of local aabb
        btAssert(this.isLocalAabbValid, 'Local AABB cache is not valid');
        // The cached local bounds already include margin, so we pass 0 as margin to avoid double-adding
        btTransformAabb(this.localAabbMin, this.localAabbMax, 0, trans, aabbMin, aabbMax);
    }

    /**
     * Set local scaling and recalculate cached AABB
     */
    setLocalScaling(scaling: btVector3): void {
        super.setLocalScaling(scaling);
        this.recalcLocalAabb();
    }

    /**
     * Get AABB using cached local bounds
     */
    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        this.getNonvirtualAabb(t, aabbMin, aabbMax, this.getMargin());
    }

    /**
     * Recalculate local AABB cache
     */
    recalcLocalAabb(): void {
        this.isLocalAabbValid = true;

        // Use optimized approach with batched queries
        const directions = [
            new btVector3(1, 0, 0),
            new btVector3(0, 1, 0),
            new btVector3(0, 0, 1),
            new btVector3(-1, 0, 0),
            new btVector3(0, -1, 0),
            new btVector3(0, 0, -1)
        ];

        const supporting = [
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0),
            new btVector3(0, 0, 0)
        ];

        this.batchedUnitVectorGetSupportingVertexWithoutMargin(directions, supporting, 6);

        for (let i = 0; i < 3; ++i) {
            const maxCoord = (i === 0 ? supporting[i].x() : i === 1 ? supporting[i].y() : supporting[i].z()) + this.collisionMargin;
            const minCoord = (i === 0 ? supporting[i + 3].x() : i === 1 ? supporting[i + 3].y() : supporting[i + 3].z()) - this.collisionMargin;
            
            if (i === 0) {
                this.localAabbMax.setValue(maxCoord, this.localAabbMax.y(), this.localAabbMax.z());
                this.localAabbMin.setValue(minCoord, this.localAabbMin.y(), this.localAabbMin.z());
            } else if (i === 1) {
                this.localAabbMax.setValue(this.localAabbMax.x(), maxCoord, this.localAabbMax.z());
                this.localAabbMin.setValue(this.localAabbMin.x(), minCoord, this.localAabbMin.z());
            } else {
                this.localAabbMax.setValue(this.localAabbMax.x(), this.localAabbMax.y(), maxCoord);
                this.localAabbMin.setValue(this.localAabbMin.x(), this.localAabbMin.y(), minCoord);
            }
        }
    }
}