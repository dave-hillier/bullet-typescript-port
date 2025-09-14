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
import { btSqrt, btAssert, SIMD_EPSILON } from '../../LinearMath/btScalar';

/**
 * Serialization data structure for btConeShape
 */
export interface btConeShapeData {
    convexInternalShapeData: btConvexInternalShapeData;
    upIndex: number;
    padding: number[];
}

/**
 * The btConeShape implements a cone shape primitive, centered around the origin and aligned with the Y axis.
 * The btConeShapeX is aligned around the X axis and btConeShapeZ around the Z axis.
 */
export class btConeShape extends btConvexInternalShape {
    protected sinAngle: number;
    protected radius: number;
    protected height: number;
    protected coneIndices: number[];

    constructor(radius: number, height: number) {
        super();
        this.m_shapeType = BroadphaseNativeTypes.CONE_SHAPE_PROXYTYPE;
        this.radius = radius;
        this.height = height;
        this.coneIndices = [0, 1, 2];
        this.setConeUpIndex(1);
        this.sinAngle = this.radius / btSqrt(this.radius * this.radius + this.height * this.height);
    }

    /**
     * Get cone radius
     */
    getRadius(): number {
        return this.radius;
    }

    /**
     * Get cone height
     */
    getHeight(): number {
        return this.height;
    }

    /**
     * Set cone radius
     */
    setRadius(radius: number): void {
        this.radius = radius;
    }

    /**
     * Set cone height
     */
    setHeight(height: number): void {
        this.height = height;
    }

    /**
     * Choose up axis index (0=X, 1=Y, 2=Z)
     */
    setConeUpIndex(upIndex: number): void {
        switch (upIndex) {
            case 0:
                this.coneIndices[0] = 1;
                this.coneIndices[1] = 0;
                this.coneIndices[2] = 2;
                break;
            case 1:
                this.coneIndices[0] = 0;
                this.coneIndices[1] = 1;
                this.coneIndices[2] = 2;
                break;
            case 2:
                this.coneIndices[0] = 0;
                this.coneIndices[1] = 2;
                this.coneIndices[2] = 1;
                break;
            default:
                btAssert(false, 'Invalid cone up index');
        }

        this.implicitShapeDimensions.setValue(0, 0, 0);
        const temp = this.implicitShapeDimensions.clone();
        if (this.coneIndices[0] === 0) temp.setX(this.radius);
        else if (this.coneIndices[0] === 1) temp.setY(this.radius);
        else temp.setZ(this.radius);

        if (this.coneIndices[1] === 0) temp.setX(this.height);
        else if (this.coneIndices[1] === 1) temp.setY(this.height);
        else temp.setZ(this.height);

        if (this.coneIndices[2] === 0) temp.setX(this.radius);
        else if (this.coneIndices[2] === 1) temp.setY(this.radius);
        else temp.setZ(this.radius);

        this.implicitShapeDimensions.copy(temp);
    }

    /**
     * Get cone up axis index
     */
    getConeUpIndex(): number {
        return this.coneIndices[1];
    }

    /**
     * Get cone local support vector
     */
    protected coneLocalSupport(v: btVector3): btVector3 {
        const halfHeight = this.height * 0.5;

        const vAxis = this.coneIndices[1] === 0 ? v.x() :
                     this.coneIndices[1] === 1 ? v.y() : v.z();

        if (vAxis > v.length() * this.sinAngle) {
            const tmp = new btVector3(0, 0, 0);
            if (this.coneIndices[0] === 0) tmp.setX(0);
            else if (this.coneIndices[0] === 1) tmp.setY(0);
            else tmp.setZ(0);

            if (this.coneIndices[1] === 0) tmp.setX(halfHeight);
            else if (this.coneIndices[1] === 1) tmp.setY(halfHeight);
            else tmp.setZ(halfHeight);

            if (this.coneIndices[2] === 0) tmp.setX(0);
            else if (this.coneIndices[2] === 1) tmp.setY(0);
            else tmp.setZ(0);

            return tmp;
        } else {
            const v0 = this.coneIndices[0] === 0 ? v.x() :
                      this.coneIndices[0] === 1 ? v.y() : v.z();
            const v2 = this.coneIndices[2] === 0 ? v.x() :
                      this.coneIndices[2] === 1 ? v.y() : v.z();

            const s = btSqrt(v0 * v0 + v2 * v2);
            if (s > SIMD_EPSILON) {
                const d = this.radius / s;
                const tmp = new btVector3(0, 0, 0);

                if (this.coneIndices[0] === 0) tmp.setX(v0 * d);
                else if (this.coneIndices[0] === 1) tmp.setY(v0 * d);
                else tmp.setZ(v0 * d);

                if (this.coneIndices[1] === 0) tmp.setX(-halfHeight);
                else if (this.coneIndices[1] === 1) tmp.setY(-halfHeight);
                else tmp.setZ(-halfHeight);

                if (this.coneIndices[2] === 0) tmp.setX(v2 * d);
                else if (this.coneIndices[2] === 1) tmp.setY(v2 * d);
                else tmp.setZ(v2 * d);

                return tmp;
            } else {
                const tmp = new btVector3(0, 0, 0);

                if (this.coneIndices[0] === 0) tmp.setX(0);
                else if (this.coneIndices[0] === 1) tmp.setY(0);
                else tmp.setZ(0);

                if (this.coneIndices[1] === 0) tmp.setX(-halfHeight);
                else if (this.coneIndices[1] === 1) tmp.setY(-halfHeight);
                else tmp.setZ(-halfHeight);

                if (this.coneIndices[2] === 0) tmp.setX(0);
                else if (this.coneIndices[2] === 1) tmp.setY(0);
                else tmp.setZ(0);

                return tmp;
            }
        }
    }

    /**
     * Get supporting vertex without margin
     */
    localGetSupportingVertexWithoutMargin(vec: btVector3): btVector3 {
        return this.coneLocalSupport(vec);
    }

    /**
     * Batch query for supporting vertices without margin
     */
    batchedUnitVectorGetSupportingVertexWithoutMargin(vectors: btVector3[], supportVerticesOut: btVector3[], numVectors: number): void {
        for (let i = 0; i < numVectors; i++) {
            const vec = vectors[i];
            supportVerticesOut[i] = this.coneLocalSupport(vec);
        }
    }

    /**
     * Get supporting vertex including margin
     */
    localGetSupportingVertex(vec: btVector3): btVector3 {
        const supVertex = this.coneLocalSupport(vec);
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
     * Calculate local inertia tensor
     */
    calculateLocalInertia(mass: number, inertia: btVector3): void {
        const identity = new btTransform();
        identity.setIdentity();
        const aabbMin = new btVector3(0, 0, 0);
        const aabbMax = new btVector3(0, 0, 0);
        this.getAabb(identity, aabbMin, aabbMax);

        const halfExtents = aabbMax.subtract(aabbMin).multiply(0.5);

        const margin = this.getMargin();

        const lx = 2.0 * (halfExtents.x() + margin);
        const ly = 2.0 * (halfExtents.y() + margin);
        const lz = 2.0 * (halfExtents.z() + margin);
        const x2 = lx * lx;
        const y2 = ly * ly;
        const z2 = lz * lz;
        const scaledmass = mass * 0.08333333;

        inertia.setValue(scaledmass * (y2 + z2), scaledmass * (x2 + z2), scaledmass * (x2 + y2));
    }

    /**
     * Get anisotropic rolling friction direction
     */
    getAnisotropicRollingFrictionDirection(): btVector3 {
        return new btVector3(0, 1, 0);
    }

    /**
     * Set local scaling of the cone
     */
    setLocalScaling(scaling: btVector3): void {
        const axis = this.coneIndices[1];
        const r1 = this.coneIndices[0];
        const r2 = this.coneIndices[2];

        const axisScale = axis === 0 ? scaling.x() : axis === 1 ? scaling.y() : scaling.z();
        const r1Scale = r1 === 0 ? scaling.x() : r1 === 1 ? scaling.y() : scaling.z();
        const r2Scale = r2 === 0 ? scaling.x() : r2 === 1 ? scaling.y() : scaling.z();

        const axisLocalScale = axis === 0 ? this.localScaling.x() :
                              axis === 1 ? this.localScaling.y() : this.localScaling.z();
        const r1LocalScale = r1 === 0 ? this.localScaling.x() :
                            r1 === 1 ? this.localScaling.y() : this.localScaling.z();
        const r2LocalScale = r2 === 0 ? this.localScaling.x() :
                            r2 === 1 ? this.localScaling.y() : this.localScaling.z();

        this.height *= axisScale / axisLocalScale;
        this.radius *= (r1Scale / r1LocalScale + r2Scale / r2LocalScale) / 2;
        this.sinAngle = this.radius / btSqrt(this.radius * this.radius + this.height * this.height);

        super.setLocalScaling(scaling);
    }

    /**
     * Get shape name
     */
    getName(): string {
        return 'Cone';
    }

    /**
     * Calculate serialization buffer size
     */
    calculateSerializeBufferSize(): number {
        return 0; // Simplified for TypeScript
    }

    /**
     * Serialize shape data
     */
    serialize(_dataBuffer?: any, _serializer?: any): string {
        return 'btConeShapeData';
    }

    /**
     * Get serialization data
     */
    getConeShapeData(): btConeShapeData {
        return {
            convexInternalShapeData: super.getSerializationData(),
            upIndex: this.coneIndices[1],
            padding: [0, 0, 0, 0]
        };
    }
}

/**
 * btConeShapeX implements a Cone shape, around the X axis
 */
export class btConeShapeX extends btConeShape {
    constructor(radius: number, height: number) {
        super(radius, height);
        this.setConeUpIndex(0);
    }

    /**
     * Get anisotropic rolling friction direction
     */
    getAnisotropicRollingFrictionDirection(): btVector3 {
        return new btVector3(1, 0, 0);
    }

    /**
     * Get shape name
     */
    getName(): string {
        return 'ConeX';
    }
}

/**
 * btConeShapeZ implements a Cone shape, around the Z axis
 */
export class btConeShapeZ extends btConeShape {
    constructor(radius: number, height: number) {
        super(radius, height);
        this.setConeUpIndex(2);
    }

    /**
     * Get anisotropic rolling friction direction
     */
    getAnisotropicRollingFrictionDirection(): btVector3 {
        return new btVector3(0, 0, 1);
    }

    /**
     * Get shape name
     */
    getName(): string {
        return 'ConeZ';
    }
}