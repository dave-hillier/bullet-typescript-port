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

import { btConvexInternalShape, btConvexInternalShapeData } from './btConvexInternalShape';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';
import { BT_LARGE_FLOAT, btSqrt } from '../../LinearMath/btScalar';

/**
 * Serialization data structure for btCapsuleShape
 */
export interface btCapsuleShapeData {
    convexInternalShapeData: btConvexInternalShapeData;
    upAxis: number;
    padding: number[];
}

/**
 * The btCapsuleShape represents a capsule around the Y axis, there is also the btCapsuleShapeX aligned around the X axis and btCapsuleShapeZ around the Z axis.
 * The total height is height+2*radius, so the height is just the height between the center of each 'sphere' of the capsule caps.
 * The btCapsuleShape is a convex hull of two spheres. The btMultiSphereShape is a more general collision shape that takes the convex hull of multiple sphere, so it can also represent a capsule when just using two spheres.
 */
export class btCapsuleShape extends btConvexInternalShape {
    protected upAxis: number;

    /**
     * Protected constructor for subclasses (btCapsuleShapeX and btCapsuleShapeZ)
     */
    protected constructor() {
        super();
        this.m_shapeType = BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE;
        this.upAxis = 1; // Default Y-axis
    }

    /**
     * Create a capsule shape with the given radius and height
     * @param radius The radius of the capsule
     * @param height The height between the centers of the spherical caps (not total height)
     */
    static create(radius: number, height: number): btCapsuleShape {
        const shape = new btCapsuleShape();
        shape.collisionMargin = radius;
        shape.m_shapeType = BroadphaseNativeTypes.CAPSULE_SHAPE_PROXYTYPE;
        shape.upAxis = 1; // Y-axis
        shape.implicitShapeDimensions.setValue(radius, 0.5 * height, radius);
        return shape;
    }

    /**
     * CollisionShape Interface - Calculate local inertia
     */
    calculateLocalInertia(mass: number, inertia: btVector3): void {
        // As an approximation, take the inertia of the box that bounds the spheres
        const radius = this.getRadius();
        const halfExtents = new btVector3(radius, radius, radius);
        halfExtents.setValue(
            halfExtents.x(),
            halfExtents.y(),
            halfExtents.z()
        );
        
        // Set the up-axis dimension to radius + half height
        if (this.upAxis === 0) {
            halfExtents.setValue(halfExtents.x() + this.getHalfHeight(), halfExtents.y(), halfExtents.z());
        } else if (this.upAxis === 1) {
            halfExtents.setValue(halfExtents.x(), halfExtents.y() + this.getHalfHeight(), halfExtents.z());
        } else {
            halfExtents.setValue(halfExtents.x(), halfExtents.y(), halfExtents.z() + this.getHalfHeight());
        }

        const lx = 2.0 * halfExtents.x();
        const ly = 2.0 * halfExtents.y();
        const lz = 2.0 * halfExtents.z();
        const x2 = lx * lx;
        const y2 = ly * ly;
        const z2 = lz * lz;
        const scaledMass = mass * 0.08333333; // 1/12

        inertia.setValue(
            scaledMass * (y2 + z2),
            scaledMass * (x2 + z2),
            scaledMass * (x2 + y2)
        );
    }

    /**
     * btConvexShape Interface - Get supporting vertex without margin
     */
    localGetSupportingVertexWithoutMargin(vec0: btVector3): btVector3 {
        let supVec = new btVector3(0, 0, 0);
        let maxDot = -BT_LARGE_FLOAT;

        let vec = vec0.clone();
        const lenSqr = vec.length2();
        if (lenSqr < 0.0001) {
            vec.setValue(1, 0, 0);
        } else {
            const rlen = 1.0 / btSqrt(lenSqr);
            vec.multiplyAssign(rlen);
        }

        // Check the positive end of the capsule
        {
            const pos = new btVector3(0, 0, 0);
            if (this.upAxis === 0) {
                pos.setValue(this.getHalfHeight(), 0, 0);
            } else if (this.upAxis === 1) {
                pos.setValue(0, this.getHalfHeight(), 0);
            } else {
                pos.setValue(0, 0, this.getHalfHeight());
            }

            const newDot = vec.dot(pos);
            if (newDot > maxDot) {
                maxDot = newDot;
                supVec = pos;
            }
        }

        // Check the negative end of the capsule
        {
            const pos = new btVector3(0, 0, 0);
            if (this.upAxis === 0) {
                pos.setValue(-this.getHalfHeight(), 0, 0);
            } else if (this.upAxis === 1) {
                pos.setValue(0, -this.getHalfHeight(), 0);
            } else {
                pos.setValue(0, 0, -this.getHalfHeight());
            }

            const newDot = vec.dot(pos);
            if (newDot > maxDot) {
                maxDot = newDot;
                supVec = pos;
            }
        }

        return supVec;
    }

    /**
     * Batched unit vector support vertex calculation
     */
    batchedUnitVectorGetSupportingVertexWithoutMargin(vectors: btVector3[], supportVerticesOut: btVector3[], numVectors: number): void {
        for (let j = 0; j < numVectors; j++) {
            let maxDot = -BT_LARGE_FLOAT;
            const vec = vectors[j];

            // Check the positive end of the capsule
            {
                const pos = new btVector3(0, 0, 0);
                if (this.upAxis === 0) {
                    pos.setValue(this.getHalfHeight(), 0, 0);
                } else if (this.upAxis === 1) {
                    pos.setValue(0, this.getHalfHeight(), 0);
                } else {
                    pos.setValue(0, 0, this.getHalfHeight());
                }

                const newDot = vec.dot(pos);
                if (newDot > maxDot) {
                    maxDot = newDot;
                    supportVerticesOut[j] = pos;
                }
            }

            // Check the negative end of the capsule
            {
                const pos = new btVector3(0, 0, 0);
                if (this.upAxis === 0) {
                    pos.setValue(-this.getHalfHeight(), 0, 0);
                } else if (this.upAxis === 1) {
                    pos.setValue(0, -this.getHalfHeight(), 0);
                } else {
                    pos.setValue(0, 0, -this.getHalfHeight());
                }

                const newDot = vec.dot(pos);
                if (newDot > maxDot) {
                    maxDot = newDot;
                    supportVerticesOut[j] = pos;
                }
            }
        }
    }

    /**
     * Don't override the margin for capsules, their entire radius == margin
     */
    setMargin(_collisionMargin: number): void {
        // Don't override the margin for capsules, their entire radius == margin
        // The parameter is ignored as documented in the C++ version
    }

    /**
     * Get axis-aligned bounding box
     */
    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        const halfExtents = new btVector3(this.getRadius(), this.getRadius(), this.getRadius());
        
        // Set the up-axis dimension
        if (this.upAxis === 0) {
            halfExtents.setValue(this.getRadius() + this.getHalfHeight(), halfExtents.y(), halfExtents.z());
        } else if (this.upAxis === 1) {
            halfExtents.setValue(halfExtents.x(), this.getRadius() + this.getHalfHeight(), halfExtents.z());
        } else {
            halfExtents.setValue(halfExtents.x(), halfExtents.y(), this.getRadius() + this.getHalfHeight());
        }

        const abs_b = t.getBasis().absolute();
        const center = t.getOrigin();
        const extent = halfExtents.dot3(abs_b.getRow(0), abs_b.getRow(1), abs_b.getRow(2));

        aabbMin.copy(center.subtract(extent));
        aabbMax.copy(center.add(extent));
    }

    /**
     * Get shape name
     */
    getName(): string {
        return "CapsuleShape";
    }

    /**
     * Get the up axis (0=X, 1=Y, 2=Z)
     */
    getUpAxis(): number {
        return this.upAxis;
    }

    /**
     * Get the radius of the capsule
     */
    getRadius(): number {
        const radiusAxis = (this.upAxis + 2) % 3;
        if (radiusAxis === 0) return this.implicitShapeDimensions.x();
        else if (radiusAxis === 1) return this.implicitShapeDimensions.y();
        else return this.implicitShapeDimensions.z();
    }

    /**
     * Get the half height of the capsule (distance from center to spherical cap center)
     */
    getHalfHeight(): number {
        if (this.upAxis === 0) return this.implicitShapeDimensions.x();
        else if (this.upAxis === 1) return this.implicitShapeDimensions.y();
        else return this.implicitShapeDimensions.z();
    }

    /**
     * Set local scaling
     */
    setLocalScaling(scaling: btVector3): void {
        const unScaledImplicitShapeDimensions = btVector3.divide(this.implicitShapeDimensions, this.localScaling);
        super.setLocalScaling(scaling);
        this.implicitShapeDimensions.copy(unScaledImplicitShapeDimensions.multiplyVector(scaling));
        
        // Update collision margin, since entire radius == margin
        const radiusAxis = (this.upAxis + 2) % 3;
        if (radiusAxis === 0) this.collisionMargin = this.implicitShapeDimensions.x();
        else if (radiusAxis === 1) this.collisionMargin = this.implicitShapeDimensions.y();
        else this.collisionMargin = this.implicitShapeDimensions.z();
    }

    /**
     * Get anisotropic rolling friction direction
     */
    getAnisotropicRollingFrictionDirection(): btVector3 {
        const aniDir = new btVector3(0, 0, 0);
        if (this.upAxis === 0) {
            aniDir.setValue(1, 0, 0);
        } else if (this.upAxis === 1) {
            aniDir.setValue(0, 1, 0);
        } else {
            aniDir.setValue(0, 0, 1);
        }
        return aniDir;
    }

    /**
     * Calculate serialize buffer size (for API compatibility)
     */
    calculateSerializeBufferSize(): number {
        // In TypeScript, we don't need to calculate buffer sizes for serialization
        return 0;
    }

    /**
     * Serialize the shape data (for API compatibility)
     */
    serialize(_dataBuffer?: any, _serializer?: any): string {
        return "btCapsuleShapeData";
    }

    /**
     * Create serialization data object (capsule-specific)
     */
    getCapsuleSerializationData(): btCapsuleShapeData {
        return {
            convexInternalShapeData: super.getSerializationData(),
            upAxis: this.upAxis,
            padding: [0, 0, 0, 0]
        };
    }
}

/**
 * btCapsuleShapeX represents a capsule around the X axis
 * The total height is height+2*radius, so the height is just the height between the center of each 'sphere' of the capsule caps.
 */
export class btCapsuleShapeX extends btCapsuleShape {
    /**
     * Create a capsule shape aligned along the X axis
     * @param radius The radius of the capsule
     * @param height The height between the centers of the spherical caps (not total height)
     */
    static create(radius: number, height: number): btCapsuleShapeX {
        const shape = new btCapsuleShapeX();
        shape.collisionMargin = radius;
        shape.upAxis = 0; // X-axis
        shape.implicitShapeDimensions.setValue(0.5 * height, radius, radius);
        return shape;
    }

    /**
     * Get shape name for debugging
     */
    getName(): string {
        return "CapsuleX";
    }
}

/**
 * btCapsuleShapeZ represents a capsule around the Z axis
 * The total height is height+2*radius, so the height is just the height between the center of each 'sphere' of the capsule caps.
 */
export class btCapsuleShapeZ extends btCapsuleShape {
    /**
     * Create a capsule shape aligned along the Z axis
     * @param radius The radius of the capsule
     * @param height The height between the centers of the spherical caps (not total height)
     */
    static create(radius: number, height: number): btCapsuleShapeZ {
        const shape = new btCapsuleShapeZ();
        shape.collisionMargin = radius;
        shape.upAxis = 2; // Z-axis
        shape.implicitShapeDimensions.setValue(radius, radius, 0.5 * height);
        return shape;
    }

    /**
     * Get shape name for debugging
     */
    getName(): string {
        return "CapsuleZ";
    }
}