/*
Copyright (c) 2003-2013 Gino van den Bergen / Erwin Coumans  http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

/**
 * TypeScript port of Bullet3Collision/NarrowPhaseCollision/shared/b3Collidable.h
 * 
 * This module provides data structures for collision detection in Bullet3:
 * - b3ShapeTypes enum: Different types of collision shapes
 * - b3Collidable: Main collidable data structure with shape information
 * - b3GpuChildShape: Child shapes for compound objects
 * - b3CompoundOverlappingPair: Pairs of overlapping compound shapes
 * 
 * Key differences from C++ version:
 * - C++ unions are replaced with separate properties and type discrimination
 * - Uses TypeScript enums instead of C++ enums
 * - No typedef structs (uses class/interface exports directly)
 * - All data is stored as TypeScript number type instead of int/float distinction
 */

import { b3Float4 } from '../../../Bullet3Common/shared/b3Float4';
import { b3Quat } from '../../BroadPhaseCollision/shared/b3Aabb';
import { b3Scalar } from '../../../Bullet3Common/b3Scalar';

/**
 * Enumeration of supported collision shape types in Bullet3
 */
export enum b3ShapeTypes {
    SHAPE_HEIGHT_FIELD = 1,
    SHAPE_CONVEX_HULL = 3,
    SHAPE_PLANE = 4,
    SHAPE_CONCAVE_TRIMESH = 5,
    SHAPE_COMPOUND_OF_CONVEX_HULLS = 6,
    SHAPE_SPHERE = 7,
    MAX_NUM_SHAPE_TYPES
}

/**
 * Main collidable data structure representing a collision shape
 * 
 * In C++, this uses unions to overlay different data interpretations.
 * In TypeScript, we use separate properties with appropriate naming
 * to indicate their usage context.
 */
export class b3Collidable {
    /**
     * First union: number of child shapes OR BVH index
     * Use m_numChildShapes for compound shapes
     * Use m_bvhIndex for BVH-based shapes
     */
    public m_numChildShapes: number;
    public m_bvhIndex: number;

    /**
     * Second union: radius OR compound BVH index
     * Use m_radius for spheres and other shapes with radius
     * Use m_compoundBvhIndex for compound shapes
     */
    public m_radius: b3Scalar;
    public m_compoundBvhIndex: number;

    /**
     * Shape type identifier
     */
    public m_shapeType: number;

    /**
     * Third union: shape index OR height
     * Use m_shapeIndex for referencing shape data
     * Use m_height for height fields and capsules
     */
    public m_shapeIndex: number;
    public m_height: b3Scalar;

    constructor(
        numChildShapes: number = 0,
        radius: b3Scalar = 0,
        shapeType: number = 0,
        shapeIndex: number = 0
    ) {
        // Initialize all union members to the same values initially
        // Users should set the appropriate ones based on shape type
        this.m_numChildShapes = numChildShapes;
        this.m_bvhIndex = numChildShapes;
        
        this.m_radius = radius;
        this.m_compoundBvhIndex = radius;
        
        this.m_shapeType = shapeType;
        
        this.m_shapeIndex = shapeIndex;
        this.m_height = shapeIndex;
    }

    /**
     * Set values for compound shapes
     */
    setCompoundShape(numChildShapes: number, compoundBvhIndex: number): void {
        this.m_numChildShapes = numChildShapes;
        this.m_bvhIndex = numChildShapes; // Keep union members in sync
        this.m_compoundBvhIndex = compoundBvhIndex;
        this.m_radius = compoundBvhIndex; // Keep union members in sync
    }

    /**
     * Set values for sphere shapes
     */
    setSphere(radius: b3Scalar, shapeIndex: number): void {
        this.m_radius = radius;
        this.m_compoundBvhIndex = radius; // Keep union members in sync
        this.m_shapeIndex = shapeIndex;
        this.m_height = shapeIndex; // Keep union members in sync
        this.m_shapeType = b3ShapeTypes.SHAPE_SPHERE;
    }

    /**
     * Set values for height field shapes
     */
    setHeightField(bvhIndex: number, height: b3Scalar): void {
        this.m_bvhIndex = bvhIndex;
        this.m_numChildShapes = bvhIndex; // Keep union members in sync
        this.m_height = height;
        this.m_shapeIndex = height; // Keep union members in sync
        this.m_shapeType = b3ShapeTypes.SHAPE_HEIGHT_FIELD;
    }

    /**
     * Set values for convex hull shapes
     */
    setConvexHull(shapeIndex: number): void {
        this.m_shapeIndex = shapeIndex;
        this.m_height = shapeIndex; // Keep union members in sync
        this.m_shapeType = b3ShapeTypes.SHAPE_CONVEX_HULL;
    }

    /**
     * Clone this collidable
     */
    clone(): b3Collidable {
        const clone = new b3Collidable();
        clone.m_numChildShapes = this.m_numChildShapes;
        clone.m_bvhIndex = this.m_bvhIndex;
        clone.m_radius = this.m_radius;
        clone.m_compoundBvhIndex = this.m_compoundBvhIndex;
        clone.m_shapeType = this.m_shapeType;
        clone.m_shapeIndex = this.m_shapeIndex;
        clone.m_height = this.m_height;
        return clone;
    }
}

/**
 * Type alias for C-style struct typedef
 */
export type b3Collidable_t = b3Collidable;

/**
 * GPU child shape data structure for compound shapes
 * 
 * Represents individual child shapes within compound collision objects
 */
export class b3GpuChildShape {
    /**
     * Local position of child shape relative to compound center
     */
    public m_childPosition: b3Float4;

    /**
     * Local orientation of child shape relative to compound orientation
     */
    public m_childOrientation: b3Quat;

    /**
     * First union: shape index OR capsule axis
     * Use m_shapeIndex for SHAPE_COMPOUND_OF_CONVEX_HULLS
     * Use m_capsuleAxis for capsule shapes (0=X, 1=Y, 2=Z)
     */
    public m_shapeIndex: number;
    public m_capsuleAxis: number;

    /**
     * Second union: radius OR number of child shapes
     * Use m_radius for SHAPE_COMPOUND_OF_SPHERES or SHAPE_COMPOUND_OF_CAPSULES
     * Use m_numChildShapes for compound shapes
     */
    public m_radius: b3Scalar;
    public m_numChildShapes: number;

    /**
     * Third union: height OR collidable shape index
     * Use m_height for SHAPE_COMPOUND_OF_CAPSULES
     * Use m_collidableShapeIndex for other shapes
     */
    public m_height: b3Scalar;
    public m_collidableShapeIndex: number;

    /**
     * Child shape type
     */
    public m_shapeType: number;

    constructor() {
        this.m_childPosition = new b3Float4();
        this.m_childOrientation = { x: 0, y: 0, z: 0, w: 1 };
        this.m_shapeIndex = 0;
        this.m_capsuleAxis = 0;
        this.m_radius = 0;
        this.m_numChildShapes = 0;
        this.m_height = 0;
        this.m_collidableShapeIndex = 0;
        this.m_shapeType = 0;
    }

    /**
     * Set values for convex hull child shapes
     */
    setConvexHull(
        position: b3Float4,
        orientation: b3Quat,
        shapeIndex: number,
        collidableShapeIndex: number
    ): void {
        this.m_childPosition = position.clone();
        this.m_childOrientation = { ...orientation };
        this.m_shapeIndex = shapeIndex;
        this.m_capsuleAxis = shapeIndex; // Keep union members in sync
        this.m_collidableShapeIndex = collidableShapeIndex;
        this.m_height = collidableShapeIndex; // Keep union members in sync
        this.m_shapeType = b3ShapeTypes.SHAPE_CONVEX_HULL;
    }

    /**
     * Set values for sphere child shapes
     */
    setSphere(
        position: b3Float4,
        orientation: b3Quat,
        radius: b3Scalar,
        collidableShapeIndex: number
    ): void {
        this.m_childPosition = position.clone();
        this.m_childOrientation = { ...orientation };
        this.m_radius = radius;
        this.m_numChildShapes = radius; // Keep union members in sync
        this.m_collidableShapeIndex = collidableShapeIndex;
        this.m_height = collidableShapeIndex; // Keep union members in sync
        this.m_shapeType = b3ShapeTypes.SHAPE_SPHERE;
    }

    /**
     * Set values for capsule child shapes
     */
    setCapsule(
        position: b3Float4,
        orientation: b3Quat,
        capsuleAxis: number,
        radius: b3Scalar,
        height: b3Scalar
    ): void {
        this.m_childPosition = position.clone();
        this.m_childOrientation = { ...orientation };
        this.m_capsuleAxis = capsuleAxis;
        this.m_shapeIndex = capsuleAxis; // Keep union members in sync
        this.m_radius = radius;
        this.m_numChildShapes = radius; // Keep union members in sync
        this.m_height = height;
        this.m_collidableShapeIndex = height; // Keep union members in sync
    }

    /**
     * Set values for compound child shapes
     */
    setCompound(
        position: b3Float4,
        orientation: b3Quat,
        numChildShapes: number,
        collidableShapeIndex: number
    ): void {
        this.m_childPosition = position.clone();
        this.m_childOrientation = { ...orientation };
        this.m_numChildShapes = numChildShapes;
        this.m_radius = numChildShapes; // Keep union members in sync
        this.m_collidableShapeIndex = collidableShapeIndex;
        this.m_height = collidableShapeIndex; // Keep union members in sync
        this.m_shapeType = b3ShapeTypes.SHAPE_COMPOUND_OF_CONVEX_HULLS;
    }

    /**
     * Clone this child shape
     */
    clone(): b3GpuChildShape {
        const clone = new b3GpuChildShape();
        clone.m_childPosition = this.m_childPosition.clone();
        clone.m_childOrientation = { ...this.m_childOrientation };
        clone.m_shapeIndex = this.m_shapeIndex;
        clone.m_capsuleAxis = this.m_capsuleAxis;
        clone.m_radius = this.m_radius;
        clone.m_numChildShapes = this.m_numChildShapes;
        clone.m_height = this.m_height;
        clone.m_collidableShapeIndex = this.m_collidableShapeIndex;
        clone.m_shapeType = this.m_shapeType;
        return clone;
    }
}

/**
 * Type alias for C-style struct typedef
 */
export type b3GpuChildShape_t = b3GpuChildShape;

/**
 * Represents an overlapping pair of compound shapes
 * Used for broad phase collision detection between compound objects
 */
export class b3CompoundOverlappingPair {
    /**
     * Index of the first body in the collision pair
     */
    public m_bodyIndexA: number;

    /**
     * Index of the second body in the collision pair
     */
    public m_bodyIndexB: number;

    /**
     * Index of the child shape in the first body
     */
    public m_childShapeIndexA: number;

    /**
     * Index of the child shape in the second body
     */
    public m_childShapeIndexB: number;

    constructor(
        bodyIndexA: number = 0,
        bodyIndexB: number = 0,
        childShapeIndexA: number = 0,
        childShapeIndexB: number = 0
    ) {
        this.m_bodyIndexA = bodyIndexA;
        this.m_bodyIndexB = bodyIndexB;
        this.m_childShapeIndexA = childShapeIndexA;
        this.m_childShapeIndexB = childShapeIndexB;
    }

    /**
     * Check if this pair matches another pair (order independent)
     */
    matches(other: b3CompoundOverlappingPair): boolean {
        return (
            (this.m_bodyIndexA === other.m_bodyIndexA && this.m_bodyIndexB === other.m_bodyIndexB &&
             this.m_childShapeIndexA === other.m_childShapeIndexA && this.m_childShapeIndexB === other.m_childShapeIndexB) ||
            (this.m_bodyIndexA === other.m_bodyIndexB && this.m_bodyIndexB === other.m_bodyIndexA &&
             this.m_childShapeIndexA === other.m_childShapeIndexB && this.m_childShapeIndexB === other.m_childShapeIndexA)
        );
    }

    /**
     * Generate a hash code for this pair (useful for hash tables)
     */
    getHashCode(): number {
        // Ensure order independence by using min/max
        const minBodyIndex = Math.min(this.m_bodyIndexA, this.m_bodyIndexB);
        const maxBodyIndex = Math.max(this.m_bodyIndexA, this.m_bodyIndexB);
        const minChildIndex = this.m_bodyIndexA <= this.m_bodyIndexB ? 
            this.m_childShapeIndexA : this.m_childShapeIndexB;
        const maxChildIndex = this.m_bodyIndexA <= this.m_bodyIndexB ? 
            this.m_childShapeIndexB : this.m_childShapeIndexA;
        
        // Simple hash combination
        return ((minBodyIndex * 31 + maxBodyIndex) * 31 + minChildIndex) * 31 + maxChildIndex;
    }

    /**
     * Clone this overlapping pair
     */
    clone(): b3CompoundOverlappingPair {
        return new b3CompoundOverlappingPair(
            this.m_bodyIndexA,
            this.m_bodyIndexB,
            this.m_childShapeIndexA,
            this.m_childShapeIndexB
        );
    }
}