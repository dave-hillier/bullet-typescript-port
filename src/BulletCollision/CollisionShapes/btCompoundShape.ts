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

import { btCollisionShape, btCollisionShapeData } from './btCollisionShape';
import { btTransform } from '../../LinearMath/btTransform';
import { btVector3 } from '../../LinearMath/btVector3';
import { btMatrix3x3, multiplyMatrixScalar, multiplyMatrices } from '../../LinearMath/btMatrix3x3';
import { btAssert, BT_LARGE_FLOAT } from '../../LinearMath/btScalar';
import { BroadphaseNativeTypes } from '../BroadphaseCollision/btBroadphaseProxy';

// Simplified btDbvt interfaces for TypeScript port
// TODO: Implement full btDbvt when needed for performance optimization
interface btDbvtNode {
    dataAsInt: number;
}

interface btDbvtVolume {
    // Simplified volume interface
}

interface btDbvt {
    insert(volume: btDbvtVolume, data: any): btDbvtNode;
    update(node: btDbvtNode, volume: btDbvtVolume): void;
    remove(node: btDbvtNode): void;
}

// Stub implementation of btDbvtVolume for now
class btDbvtVolumeStub implements btDbvtVolume {
    static FromMM(_min: btVector3, _max: btVector3): btDbvtVolume {
        return new btDbvtVolumeStub();
    }
}

// Stub implementation of btDbvt for now
class btDbvtStub implements btDbvt {
    insert(_volume: btDbvtVolume, data: any): btDbvtNode {
        return { dataAsInt: data as number };
    }

    update(_node: btDbvtNode, _volume: btDbvtVolume): void {
        // No-op for now
    }

    remove(_node: btDbvtNode): void {
        // No-op for now
    }
}

/**
 * Compound shape child data structure
 */
export interface btCompoundShapeChild {
    m_transform: btTransform;
    m_childShape: btCollisionShape;
    m_childShapeType: number;
    m_childMargin: number;
    m_node: btDbvtNode | null;
}

/**
 * Equality comparison for compound shape children
 */
export function btCompoundShapeChildEqual(c1: btCompoundShapeChild, c2: btCompoundShapeChild): boolean {
    return (c1.m_transform.equals(c2.m_transform) &&
            c1.m_childShape === c2.m_childShape &&
            c1.m_childShapeType === c2.m_childShapeType &&
            c1.m_childMargin === c2.m_childMargin);
}

/**
 * Serialization data structures
 */
export interface btCompoundShapeChildData {
    m_transform: any; // btTransformFloatData equivalent
    m_childShape: btCollisionShapeData;
    m_childShapeType: number;
    m_childMargin: number;
}

export interface btCompoundShapeData extends btCollisionShapeData {
    m_childShapePtr: btCompoundShapeChildData[] | null;
    m_numChildShapes: number;
    m_collisionMargin: number;
}

/**
 * The btCompoundShape allows to store multiple other btCollisionShapes
 * This allows for moving concave collision objects. This is more general than the static concave btBvhTriangleMeshShape.
 * It has an (optional) dynamic aabb tree to accelerate early rejection tests.
 *
 * Note: Currently, removal of child shapes is only supported when disabling the aabb tree (pass 'false' in the constructor of btCompoundShape)
 */
export class btCompoundShape extends btCollisionShape {
    protected m_children: btCompoundShapeChild[];
    protected m_localAabbMin: btVector3;
    protected m_localAabbMax: btVector3;
    protected m_dynamicAabbTree: btDbvt | null;
    protected m_updateRevision: number;
    protected m_collisionMargin: number;
    protected m_localScaling: btVector3;

    /**
     * Constructor
     * @param enableDynamicAabbTree Enable dynamic AABB tree for acceleration
     * @param initialChildCapacity Initial capacity for child array
     */
    constructor(enableDynamicAabbTree: boolean = true, initialChildCapacity: number = 0) {
        super();

        this.m_children = [];
        this.m_localAabbMin = new btVector3(BT_LARGE_FLOAT, BT_LARGE_FLOAT, BT_LARGE_FLOAT);
        this.m_localAabbMax = new btVector3(-BT_LARGE_FLOAT, -BT_LARGE_FLOAT, -BT_LARGE_FLOAT);
        this.m_dynamicAabbTree = null;
        this.m_updateRevision = 1;
        this.m_collisionMargin = 0.0;
        this.m_localScaling = new btVector3(1.0, 1.0, 1.0);

        this.m_shapeType = BroadphaseNativeTypes.COMPOUND_SHAPE_PROXYTYPE;

        if (enableDynamicAabbTree) {
            // TODO: Replace with proper btDbvt implementation when available
            this.m_dynamicAabbTree = new btDbvtStub();
        }

        if (initialChildCapacity > 0) {
            // Pre-allocate array capacity if specified
            this.m_children = new Array(initialChildCapacity);
            this.m_children.length = 0; // Reset length to 0 but keep capacity
        }
    }

    /**
     * Add a child shape with local transform
     * @param localTransform Local transform of the child shape
     * @param shape Child shape to add
     */
    addChildShape(localTransform: btTransform, shape: btCollisionShape): void {
        this.m_updateRevision++;

        const child: btCompoundShapeChild = {
            m_node: null,
            m_transform: new btTransform(localTransform),
            m_childShape: shape,
            m_childShapeType: shape.getShapeType(),
            m_childMargin: shape.getMargin()
        };

        // Extend the local AABB
        const localAabbMin = new btVector3();
        const localAabbMax = new btVector3();
        shape.getAabb(localTransform, localAabbMin, localAabbMax);

        // Update AABB min/max
        if (this.m_localAabbMin.getX() > localAabbMin.getX()) {
            this.m_localAabbMin.setX(localAabbMin.getX());
        }
        if (this.m_localAabbMin.getY() > localAabbMin.getY()) {
            this.m_localAabbMin.setY(localAabbMin.getY());
        }
        if (this.m_localAabbMin.getZ() > localAabbMin.getZ()) {
            this.m_localAabbMin.setZ(localAabbMin.getZ());
        }
        if (this.m_localAabbMax.getX() < localAabbMax.getX()) {
            this.m_localAabbMax.setX(localAabbMax.getX());
        }
        if (this.m_localAabbMax.getY() < localAabbMax.getY()) {
            this.m_localAabbMax.setY(localAabbMax.getY());
        }
        if (this.m_localAabbMax.getZ() < localAabbMax.getZ()) {
            this.m_localAabbMax.setZ(localAabbMax.getZ());
        }

        if (this.m_dynamicAabbTree) {
            const bounds = btDbvtVolumeStub.FromMM(localAabbMin, localAabbMax);
            const index = this.m_children.length;
            child.m_node = this.m_dynamicAabbTree.insert(bounds, index);
        }

        this.m_children.push(child);
    }

    /**
     * Update child transform and optionally recalculate local AABB
     * @param childIndex Index of child to update
     * @param newChildTransform New transform for the child
     * @param shouldRecalculateLocalAabb Whether to recalculate local AABB
     */
    updateChildTransform(childIndex: number, newChildTransform: btTransform, shouldRecalculateLocalAabb: boolean = true): void {
        this.m_children[childIndex].m_transform = new btTransform(newChildTransform);

        if (this.m_dynamicAabbTree) {
            // Update the dynamic AABB tree
            const localAabbMin = new btVector3();
            const localAabbMax = new btVector3();
            this.m_children[childIndex].m_childShape.getAabb(newChildTransform, localAabbMin, localAabbMax);
            const bounds = btDbvtVolumeStub.FromMM(localAabbMin, localAabbMax);
            this.m_dynamicAabbTree.update(this.m_children[childIndex].m_node!, bounds);
        }

        if (shouldRecalculateLocalAabb) {
            this.recalculateLocalAabb();
        }
    }

    /**
     * Remove child shape by index
     * @param childShapeIndex Index of child to remove
     */
    removeChildShapeByIndex(childShapeIndex: number): void {
        this.m_updateRevision++;
        btAssert(childShapeIndex >= 0 && childShapeIndex < this.m_children.length,
                 "Child shape index out of bounds");

        if (this.m_dynamicAabbTree && this.m_children[childShapeIndex].m_node) {
            this.m_dynamicAabbTree.remove(this.m_children[childShapeIndex].m_node);
        }

        // Swap with last element and remove (efficient removal)
        const lastIndex = this.m_children.length - 1;
        if (childShapeIndex !== lastIndex) {
            this.m_children[childShapeIndex] = this.m_children[lastIndex];
            if (this.m_dynamicAabbTree && this.m_children[childShapeIndex].m_node) {
                this.m_children[childShapeIndex].m_node.dataAsInt = childShapeIndex;
            }
        }
        this.m_children.pop();
    }

    /**
     * Remove all children shapes that contain the specified shape
     * @param shape Shape to remove
     */
    removeChildShape(shape: btCollisionShape): void {
        this.m_updateRevision++;

        // Find the children containing the shape specified, and remove those children.
        // Note: there might be multiple children using the same shape!
        for (let i = this.m_children.length - 1; i >= 0; i--) {
            if (this.m_children[i].m_childShape === shape) {
                this.removeChildShapeByIndex(i);
            }
        }

        this.recalculateLocalAabb();
    }

    /**
     * Get number of child shapes
     */
    getNumChildShapes(): number {
        return this.m_children.length;
    }

    /**
     * Get child shape by index
     * @param index Child index
     */
    getChildShape(index: number): btCollisionShape {
        return this.m_children[index].m_childShape;
    }

    /**
     * Get child transform by index
     * @param index Child index
     */
    getChildTransform(index: number): btTransform {
        return this.m_children[index].m_transform;
    }

    /**
     * Get child list (for internal use)
     */
    getChildList(): btCompoundShapeChild[] {
        return this.m_children;
    }

    /**
     * Get axis aligned bounding box
     * @param t Transform to apply
     * @param aabbMin Output minimum bounds
     * @param aabbMax Output maximum bounds
     */
    getAabb(t: btTransform, aabbMin: btVector3, aabbMax: btVector3): void {
        const localHalfExtents = this.m_localAabbMax.subtract(this.m_localAabbMin).multiply(0.5);
        const localCenter = this.m_localAabbMax.add(this.m_localAabbMin).multiply(0.5);

        // Avoid an illegal AABB when there are no children
        if (this.m_children.length === 0) {
            localHalfExtents.setValue(0, 0, 0);
            localCenter.setValue(0, 0, 0);
        }

        const margin = new btVector3(this.getMargin(), this.getMargin(), this.getMargin());
        localHalfExtents.addAssign(margin);

        const abs_b = t.getBasis().absolute();
        const center = t.multiplyVector(localCenter);
        const extent = new btVector3(
            localHalfExtents.dot(abs_b.getRow(0)),
            localHalfExtents.dot(abs_b.getRow(1)),
            localHalfExtents.dot(abs_b.getRow(2))
        );

        aabbMin.copy(center.subtract(extent));
        aabbMax.copy(center.add(extent));
    }

    /**
     * Re-calculate the local AABB. Is called at the end of removeChildShapes.
     * Use this yourself if you modify the children or their transforms.
     */
    recalculateLocalAabb(): void {
        // Recalculate the local AABB
        // Brute force, it iterates over all the shapes left.
        this.m_localAabbMin.setValue(BT_LARGE_FLOAT, BT_LARGE_FLOAT, BT_LARGE_FLOAT);
        this.m_localAabbMax.setValue(-BT_LARGE_FLOAT, -BT_LARGE_FLOAT, -BT_LARGE_FLOAT);

        // Extend the local AABB for each child
        for (let j = 0; j < this.m_children.length; j++) {
            const localAabbMin = new btVector3();
            const localAabbMax = new btVector3();
            this.m_children[j].m_childShape.getAabb(this.m_children[j].m_transform, localAabbMin, localAabbMax);

            // Update AABB min/max
            if (this.m_localAabbMin.getX() > localAabbMin.getX()) {
                this.m_localAabbMin.setX(localAabbMin.getX());
            }
            if (this.m_localAabbMin.getY() > localAabbMin.getY()) {
                this.m_localAabbMin.setY(localAabbMin.getY());
            }
            if (this.m_localAabbMin.getZ() > localAabbMin.getZ()) {
                this.m_localAabbMin.setZ(localAabbMin.getZ());
            }
            if (this.m_localAabbMax.getX() < localAabbMax.getX()) {
                this.m_localAabbMax.setX(localAabbMax.getX());
            }
            if (this.m_localAabbMax.getY() < localAabbMax.getY()) {
                this.m_localAabbMax.setY(localAabbMax.getY());
            }
            if (this.m_localAabbMax.getZ() < localAabbMax.getZ()) {
                this.m_localAabbMax.setZ(localAabbMax.getZ());
            }
        }
    }

    /**
     * Set local scaling
     * @param scaling New scaling vector
     */
    setLocalScaling(scaling: btVector3): void {
        for (let i = 0; i < this.m_children.length; i++) {
            const childTrans = this.getChildTransform(i);
            const childScale = this.m_children[i].m_childShape.getLocalScaling();

            // Scale child shape
            const newChildScale = btVector3.divide(childScale.multiplyVector(scaling), this.m_localScaling);
            this.m_children[i].m_childShape.setLocalScaling(newChildScale);

            // Scale child transform origin
            const newOrigin = btVector3.divide(childTrans.getOrigin().multiplyVector(scaling), this.m_localScaling);
            childTrans.setOrigin(newOrigin);
            this.updateChildTransform(i, childTrans, false);
        }

        this.m_localScaling = new btVector3(scaling);
        this.recalculateLocalAabb();
    }

    /**
     * Get local scaling
     */
    getLocalScaling(): btVector3 {
        return new btVector3(this.m_localScaling);
    }

    /**
     * Calculate local inertia
     * @param mass Mass value
     * @param inertia Output inertia vector
     */
    calculateLocalInertia(mass: number, inertia: btVector3): void {
        // Approximation: take the inertia from the AABB for now
        const ident = new btTransform();
        ident.setIdentity();
        const aabbMin = new btVector3();
        const aabbMax = new btVector3();
        this.getAabb(ident, aabbMin, aabbMax);

        const halfExtents = aabbMax.subtract(aabbMin).multiply(0.5);

        const lx = 2.0 * halfExtents.x();
        const ly = 2.0 * halfExtents.y();
        const lz = 2.0 * halfExtents.z();

        inertia.setValue(
            mass / 12.0 * (ly * ly + lz * lz),
            mass / 12.0 * (lx * lx + lz * lz),
            mass / 12.0 * (lx * lx + ly * ly)
        );
    }

    /**
     * Computes the exact moment of inertia and the transform from the coordinate system defined by the principal axes
     * of the moment of inertia and the center of mass to the current coordinate system.
     * @param masses Array of masses of the children
     * @param principal Output principal transform
     * @param inertia Output inertia vector
     */
    calculatePrincipalAxisTransform(masses: number[], principal: btTransform, inertia: btVector3): void {
        const n = this.m_children.length;

        let totalMass = 0.0;
        const center = new btVector3(0, 0, 0);

        for (let k = 0; k < n; k++) {
            btAssert(masses[k] > 0, "Mass must be positive");
            center.addAssign(this.m_children[k].m_transform.getOrigin().multiply(masses[k]));
            totalMass += masses[k];
        }

        btAssert(totalMass > 0, "Total mass must be positive");

        center.divideAssign(totalMass);
        principal.setOrigin(center);

        const tensor = new btMatrix3x3();
        tensor.setValue(0, 0, 0, 0, 0, 0, 0, 0, 0);

        for (let k = 0; k < n; k++) {
            const i = new btVector3();
            this.m_children[k].m_childShape.calculateLocalInertia(masses[k], i);

            const t = this.m_children[k].m_transform;
            const o = t.getOrigin().subtract(center);

            // Compute inertia tensor in coordinate system of compound shape
            let j = t.getBasis().transpose();
            const inertiaRow0 = j.getRow(0).multiply(i.getX());
            const inertiaRow1 = j.getRow(1).multiply(i.getY());
            const inertiaRow2 = j.getRow(2).multiply(i.getZ());
            j.setValue(
                inertiaRow0.getX(), inertiaRow0.getY(), inertiaRow0.getZ(),
                inertiaRow1.getX(), inertiaRow1.getY(), inertiaRow1.getZ(),
                inertiaRow2.getX(), inertiaRow2.getY(), inertiaRow2.getZ()
            );
            j = multiplyMatrices(t.getBasis(), j);

            // Add inertia tensor
            tensor.addAssign(j);

            // Compute inertia tensor of point mass at o
            const o2 = o.length2();
            const pointMassInertia = new btMatrix3x3();
            pointMassInertia.setValue(
                o2, 0, 0,
                0, o2, 0,
                0, 0, o2
            );
            const massRow0 = pointMassInertia.getRow(0).subtract(o.multiply(o.getX()));
            const massRow1 = pointMassInertia.getRow(1).subtract(o.multiply(o.getY()));
            const massRow2 = pointMassInertia.getRow(2).subtract(o.multiply(o.getZ()));
            pointMassInertia.setValue(
                massRow0.getX(), massRow0.getY(), massRow0.getZ(),
                massRow1.getX(), massRow1.getY(), massRow1.getZ(),
                massRow2.getX(), massRow2.getY(), massRow2.getZ()
            );

            // Add inertia tensor of point mass
            const scaledMassInertia = multiplyMatrixScalar(pointMassInertia, masses[k]);
            tensor.addAssign(scaledMassInertia);
        }

        const basis = new btMatrix3x3();
        tensor.diagonalize(basis, 0.00001, 20);
        principal.setBasis(basis);
        inertia.setValue(tensor.getValue(0, 0), tensor.getValue(1, 1), tensor.getValue(2, 2));
    }

    /**
     * Set collision margin
     * @param margin New collision margin
     */
    setMargin(margin: number): void {
        this.m_collisionMargin = margin;
    }

    /**
     * Get collision margin
     */
    getMargin(): number {
        return this.m_collisionMargin;
    }

    /**
     * Get shape name for debugging
     */
    getName(): string {
        return "Compound";
    }

    /**
     * Get dynamic AABB tree (const version)
     */
    getDynamicAabbTree(): btDbvt | null {
        return this.m_dynamicAabbTree;
    }

    /**
     * Create AABB tree from children
     */
    createAabbTreeFromChildren(): void {
        if (!this.m_dynamicAabbTree) {
            this.m_dynamicAabbTree = new btDbvtStub();

            for (let index = 0; index < this.m_children.length; index++) {
                const child = this.m_children[index];

                // Extend the local AABB
                const localAabbMin = new btVector3();
                const localAabbMax = new btVector3();
                child.m_childShape.getAabb(child.m_transform, localAabbMin, localAabbMax);

                const bounds = btDbvtVolumeStub.FromMM(localAabbMin, localAabbMax);
                child.m_node = this.m_dynamicAabbTree.insert(bounds, index);
            }
        }
    }

    /**
     * Get update revision
     */
    getUpdateRevision(): number {
        return this.m_updateRevision;
    }

    /**
     * Calculate serialize buffer size
     */
    calculateSerializeBufferSize(): number {
        return 1; // Simplified for TypeScript
    }

    /**
     * Serialize the compound shape
     * @param dataBuffer Output data buffer
     * @param serializer Serializer instance
     */
    serialize(dataBuffer: any, serializer?: any): string {
        // Simplified serialization for TypeScript port
        const shapeData = dataBuffer as btCompoundShapeData;
        super.serialize(shapeData, serializer);

        shapeData.m_collisionMargin = this.m_collisionMargin;
        shapeData.m_numChildShapes = this.m_children.length;
        shapeData.m_childShapePtr = null;

        if (shapeData.m_numChildShapes > 0) {
            const childData: btCompoundShapeChildData[] = [];

            for (let i = 0; i < shapeData.m_numChildShapes; i++) {
                const child = this.m_children[i];
                const childDataItem: btCompoundShapeChildData = {
                    m_childMargin: child.m_childMargin,
                    m_childShape: { m_name: null, m_shapeType: child.m_childShapeType },
                    m_childShapeType: child.m_childShapeType,
                    m_transform: null // Simplified transform serialization for TypeScript
                };
                childData.push(childDataItem);
            }
            shapeData.m_childShapePtr = childData;
        }

        return "btCompoundShapeData";
    }
}