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

import { btConvexInternalShape } from './btConvexInternalShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btTransformAabbOverload as btTransformAabb } from '../../LinearMath/btAabbUtil2';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
import { btSqrt, SIMD_EPSILON } from '../../LinearMath/btScalar';

/**
 * Cylinder support function for X-axis aligned cylinders
 */
function CylinderLocalSupportX(halfExtents: btVector3, v: btVector3): btVector3 {
    // mapping depends on how cylinder local orientation is
    // extents of the cylinder is: X,Y is for radius, and Z for height
    // For X-aligned cylinder: radius is in Y, height is in X

    const radius = halfExtents.y();
    const halfHeight = halfExtents.x();

    const tmp = new btVector3(0, 0, 0);

    const s = btSqrt(v.y() * v.y() + v.z() * v.z());
    if (s !== 0.0) {
        const d = radius / s;
        tmp.setValue(
            v.x() < 0.0 ? -halfHeight : halfHeight,
            v.y() * d,
            v.z() * d
        );
        return tmp;
    } else {
        tmp.setValue(
            v.x() < 0.0 ? -halfHeight : halfHeight,
            radius,
            0.0
        );
        return tmp;
    }
}

/**
 * Cylinder support function for Y-axis aligned cylinders
 */
function CylinderLocalSupportY(halfExtents: btVector3, v: btVector3): btVector3 {
    // For Y-aligned cylinder: radius is in X, height is in Y
    const radius = halfExtents.x();
    const halfHeight = halfExtents.y();

    const tmp = new btVector3(0, 0, 0);

    const s = btSqrt(v.x() * v.x() + v.z() * v.z());
    if (s !== 0.0) {
        const d = radius / s;
        tmp.setValue(
            v.x() * d,
            v.y() < 0.0 ? -halfHeight : halfHeight,
            v.z() * d
        );
        return tmp;
    } else {
        tmp.setValue(
            radius,
            v.y() < 0.0 ? -halfHeight : halfHeight,
            0.0
        );
        return tmp;
    }
}

/**
 * Cylinder support function for Z-axis aligned cylinders
 */
function CylinderLocalSupportZ(halfExtents: btVector3, v: btVector3): btVector3 {
    // mapping depends on how cylinder local orientation is
    // extents of the cylinder is: X,Y is for radius, and Z for height
    // For Z-aligned cylinder: radius is in X, height is in Z

    const radius = halfExtents.x();
    const halfHeight = halfExtents.z();

    const tmp = new btVector3(0, 0, 0);

    const s = btSqrt(v.x() * v.x() + v.y() * v.y());
    if (s !== 0.0) {
        const d = radius / s;
        tmp.setValue(
            v.x() * d,
            v.y() * d,
            v.z() < 0.0 ? -halfHeight : halfHeight
        );
        return tmp;
    } else {
        tmp.setValue(
            radius,
            0.0,
            v.z() < 0.0 ? -halfHeight : halfHeight
        );
        return tmp;
    }
}

/**
 * Serialization data structure for btCylinderShape
 */
export interface btCylinderShapeData {
    convexInternalShapeData: any;
    upAxis: number;
    padding: number[];
}

/**
 * The btCylinderShape class implements a cylinder shape primitive, centered around the origin.
 * Its central axis aligned with the Y axis. btCylinderShapeX is aligned with the X axis and
 * btCylinderShapeZ around the Z axis.
 */
export class btCylinderShape extends btConvexInternalShape {
    protected upAxis: number;

    constructor(halfExtents: btVector3) {
        super();
        this.upAxis = 1;

        const margin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        this.implicitShapeDimensions = btVector3.multiply(halfExtents, this.localScaling).subtract(margin);

        this.setSafeMargin(halfExtents);

        this.m_shapeType = BroadphaseNativeTypes.CYLINDER_SHAPE_PROXYTYPE;
    }

    /**
     * Get half extents with collision margin included
     */
    getHalfExtentsWithMargin(): btVector3 {
        const halfExtents = this.getHalfExtentsWithoutMargin();
        const margin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        return halfExtents.add(margin);
    }

    /**
     * Get half extents without collision margin
     */
    getHalfExtentsWithoutMargin(): btVector3 {
        return this.implicitShapeDimensions.clone(); // changed in Bullet 2.63: assume the scaling and margin are included
    }

    /**
     * Get AABB (axis-aligned bounding box) for this shape
     */
    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        const halfExtents = this.getHalfExtentsWithoutMargin();
        const localAabbMin = halfExtents.negate();
        const localAabbMax = halfExtents.clone();
        btTransformAabb(localAabbMin, localAabbMax, this.getMargin(), t, aabbMin, aabbMax);
    }

    /**
     * Calculate local inertia tensor for the cylinder
     */
    calculateLocalInertia(mass: number, inertia: btVector3): void {
        // Until Bullet 2.77 a box approximation was used, so uncomment this if you need backwards compatibility
        // #define USE_BOX_INERTIA_APPROXIMATION 1
        // #ifndef USE_BOX_INERTIA_APPROXIMATION

        /*
        cylinder is defined as following:
        *
        * - principle axis aligned along y by default, radius in x, z-value not used
        * - for btCylinderShapeX: principle axis aligned along x, radius in y direction, z-value not used
        * - for btCylinderShapeZ: principle axis aligned along z, radius in x direction, y-value not used
        *
        */

        let radius2: number;                                  // square of cylinder radius
        let height2: number;                                  // square of cylinder height
        const halfExtents = this.getHalfExtentsWithMargin();  // get cylinder dimension
        const div12 = mass / 12.0;
        const div4 = mass / 4.0;
        const div2 = mass / 2.0;
        let idxRadius: number, idxHeight: number;

        switch (this.upAxis) { // get indices of radius and height of cylinder
            case 0:  // cylinder is aligned along x
                idxRadius = 1;
                idxHeight = 0;
                break;
            case 2:  // cylinder is aligned along z
                idxRadius = 0;
                idxHeight = 2;
                break;
            default:  // cylinder is aligned along y
                idxRadius = 0;
                idxHeight = 1;
        }

        // calculate squares
        const radiusValue = idxRadius === 0 ? halfExtents.x() : idxRadius === 1 ? halfExtents.y() : halfExtents.z();
        const heightValue = idxHeight === 0 ? halfExtents.x() : idxHeight === 1 ? halfExtents.y() : halfExtents.z();

        radius2 = radiusValue * radiusValue;
        height2 = 4.0 * heightValue * heightValue;

        // calculate tensor terms
        const t1 = div12 * height2 + div4 * radius2;
        const t2 = div2 * radius2;

        switch (this.upAxis) { // set diagonal elements of inertia tensor
            case 0:  // cylinder is aligned along x
                inertia.setValue(t2, t1, t1);
                break;
            case 2:  // cylinder is aligned along z
                inertia.setValue(t1, t1, t2);
                break;
            default:  // cylinder is aligned along y
                inertia.setValue(t1, t2, t1);
        }
    }

    /**
     * Get supporting vertex without margin in local coordinates
     */
    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        return CylinderLocalSupportY(this.getHalfExtentsWithoutMargin(), vec);
    }

    /**
     * Batch computation of supporting vertices without margin
     */
    batchedUnitVectorGetSupportingVertexWithoutMargin(vectors: btVector3[], supportVerticesOut: btVector3[], numVectors: number): void {
        for (let i = 0; i < numVectors; i++) {
            supportVerticesOut[i] = CylinderLocalSupportY(this.getHalfExtentsWithoutMargin(), vectors[i]);
        }
    }

    /**
     * Set collision margin and adjust implicit shape dimensions
     */
    setMargin(collisionMargin: number): void {
        // correct the implicitShapeDimensions for the margin
        const oldMargin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        const implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add(oldMargin);

        super.setMargin(collisionMargin);
        const newMargin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        this.implicitShapeDimensions = implicitShapeDimensionsWithMargin.subtract(newMargin);
    }

    /**
     * Get supporting vertex with margin in local coordinates
     */
    localGetSupportingVertex(vec: btVector3): btVector3 {
        const supVertex = this.localGetSupportingVertexWithoutMargin(vec);

        if (this.getMargin() !== 0.0) {
            const vecnorm = vec.clone();
            if (vecnorm.length2() < (SIMD_EPSILON * SIMD_EPSILON)) {
                vecnorm.setValue(-1.0, -1.0, -1.0);
            }
            vecnorm.normalize();
            supVertex.addAssign(vecnorm.multiply(this.getMargin()));
        }
        return supVertex;
    }

    /**
     * Get the up axis (0=X, 1=Y, 2=Z)
     */
    getUpAxis(): number {
        return this.upAxis;
    }

    /**
     * Get anisotropic rolling friction direction
     */
    getAnisotropicRollingFrictionDirection(): btVector3 {
        const aniDir = new btVector3(0, 0, 0);
        aniDir.setValue(
            this.getUpAxis() === 0 ? 1 : 0,
            this.getUpAxis() === 1 ? 1 : 0,
            this.getUpAxis() === 2 ? 1 : 0
        );
        return aniDir;
    }

    /**
     * Get the radius of the cylinder
     */
    getRadius(): number {
        return this.getHalfExtentsWithMargin().x();
    }

    /**
     * Set local scaling and adjust shape dimensions
     */
    setLocalScaling(scaling: btVector3): void {
        const oldMargin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        const implicitShapeDimensionsWithMargin = this.implicitShapeDimensions.add(oldMargin);
        const unScaledImplicitShapeDimensionsWithMargin = btVector3.divide(implicitShapeDimensionsWithMargin, this.localScaling);

        super.setLocalScaling(scaling);

        this.implicitShapeDimensions = btVector3.multiply(unScaledImplicitShapeDimensionsWithMargin, this.localScaling).subtract(oldMargin);
    }

    /**
     * Get shape name for debugging
     */
    getName(): string {
        return "CylinderY";
    }

    /**
     * Calculate size needed for serialization buffer
     */
    calculateSerializeBufferSize(): number {
        // In TypeScript, we don't need to calculate buffer sizes for serialization
        // This method exists for API compatibility
        return 0;
    }

    /**
     * Serialize shape data
     */
    serialize(_dataBuffer?: any, _serializer?: any): string {
        return "btCylinderShapeData";
    }

    /**
     * Get serialization data
     */
    getCylinderShapeData(): btCylinderShapeData {
        return {
            convexInternalShapeData: super.getSerializationData(),
            upAxis: this.upAxis,
            padding: [0, 0, 0, 0]
        };
    }
}

/**
 * Cylinder shape aligned with X axis
 */
export class btCylinderShapeX extends btCylinderShape {
    constructor(halfExtents: btVector3) {
        super(halfExtents);
        this.upAxis = 0;
    }

    /**
     * Get supporting vertex without margin in local coordinates
     */
    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        return CylinderLocalSupportX(this.getHalfExtentsWithoutMargin(), vec);
    }

    /**
     * Batch computation of supporting vertices without margin
     */
    batchedUnitVectorGetSupportingVertexWithoutMargin(vectors: btVector3[], supportVerticesOut: btVector3[], numVectors: number): void {
        for (let i = 0; i < numVectors; i++) {
            supportVerticesOut[i] = CylinderLocalSupportX(this.getHalfExtentsWithoutMargin(), vectors[i]);
        }
    }

    /**
     * Get shape name for debugging
     */
    getName(): string {
        return "CylinderX";
    }

    /**
     * Get the radius of the cylinder (Y extent for X-aligned cylinder)
     */
    getRadius(): number {
        return this.getHalfExtentsWithMargin().y();
    }
}

/**
 * Cylinder shape aligned with Z axis
 */
export class btCylinderShapeZ extends btCylinderShape {
    constructor(halfExtents: btVector3) {
        super(halfExtents);
        this.upAxis = 2;
    }

    /**
     * Get supporting vertex without margin in local coordinates
     */
    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        return CylinderLocalSupportZ(this.getHalfExtentsWithoutMargin(), vec);
    }

    /**
     * Batch computation of supporting vertices without margin
     */
    batchedUnitVectorGetSupportingVertexWithoutMargin(vectors: btVector3[], supportVerticesOut: btVector3[], numVectors: number): void {
        for (let i = 0; i < numVectors; i++) {
            supportVerticesOut[i] = CylinderLocalSupportZ(this.getHalfExtentsWithoutMargin(), vectors[i]);
        }
    }

    /**
     * Get shape name for debugging
     */
    getName(): string {
        return "CylinderZ";
    }

    /**
     * Get the radius of the cylinder (X extent for Z-aligned cylinder)
     */
    getRadius(): number {
        return this.getHalfExtentsWithMargin().x();
    }
}