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

/**
 * TypeScript port of Bullet3's btQuantizedBvh
 * Quantized Bounding Volume Hierarchy for efficient collision detection
 */

import { btVector3 } from '../../LinearMath/btVector3';
import { btAssert, BT_BULLET_VERSION, SIMD_INFINITY, BT_LARGE_FLOAT } from '../../LinearMath/btScalar';
import { 
    TestAabbAgainstAabb2, 
    testQuantizedAabbAgainstQuantizedAabb, 
    btRayAabb2 
} from '../../LinearMath/btAabbUtil2';

// Constants
export const MAX_SUBTREE_SIZE_IN_BYTES = 2048;
export const MAX_NUM_PARTS_IN_BITS = 4;

/**
 * Traversal modes for BVH queries
 */
export enum btTraversalMode {
    TRAVERSAL_STACKLESS = 0,
    TRAVERSAL_STACKLESS_CACHE_FRIENDLY = 1,
    TRAVERSAL_RECURSIVE = 2
}

/**
 * Interface for node overlap callbacks
 */
export interface btNodeOverlapCallback {
    processNode(subPart: number, triangleIndex: number): void;
}

/**
 * Compressed AABB node, 16 bytes.
 * Can be used for leaf node or internal node.
 */
export class btQuantizedBvhNode {
    // 12 bytes
    public readonly m_quantizedAabbMin: [number, number, number] = [0, 0, 0];
    public readonly m_quantizedAabbMax: [number, number, number] = [0, 0, 0];
    // 4 bytes
    public m_escapeIndexOrTriangleIndex: number = 0;

    /**
     * Check if this node is a leaf node
     * @returns True if this is a leaf node (contains triangle data)
     */
    public isLeafNode(): boolean {
        // Skip index is negative (internal node), triangle index >= 0 (leaf node)
        return this.m_escapeIndexOrTriangleIndex >= 0;
    }

    /**
     * Get the escape index for internal nodes
     * @returns The escape index (skip distance to next sibling)
     */
    public getEscapeIndex(): number {
        btAssert(!this.isLeafNode());
        return -this.m_escapeIndexOrTriangleIndex;
    }

    /**
     * Get the triangle index for leaf nodes
     * @returns The triangle index
     */
    public getTriangleIndex(): number {
        btAssert(this.isLeafNode());
        const x = 0;
        const y = (~(x & 0)) << (31 - MAX_NUM_PARTS_IN_BITS);
        // Get only the lower bits where the triangle index is stored
        return this.m_escapeIndexOrTriangleIndex & ~y;
    }

    /**
     * Get the part ID for leaf nodes
     * @returns The part ID
     */
    public getPartId(): number {
        btAssert(this.isLeafNode());
        // Get only the highest bits where the part index is stored
        return this.m_escapeIndexOrTriangleIndex >> (31 - MAX_NUM_PARTS_IN_BITS);
    }
}

/**
 * Optimized BVH node containing both internal and leaf node information.
 * Total node size is larger but uncompressed for faster access.
 */
export class btOptimizedBvhNode {
    // 32 bytes
    public m_aabbMinOrg: btVector3 = new btVector3(0, 0, 0);
    public m_aabbMaxOrg: btVector3 = new btVector3(0, 0, 0);

    // 4 bytes
    public m_escapeIndex: number = 0;

    // 8 bytes - for child nodes
    public m_subPart: number = 0;
    public m_triangleIndex: number = 0;
}

/**
 * Subtree info for cache-friendly traversal
 */
export class btBvhSubtreeInfo {
    // 12 bytes
    public readonly m_quantizedAabbMin: [number, number, number] = [0, 0, 0];
    public readonly m_quantizedAabbMax: [number, number, number] = [0, 0, 0];
    // 4 bytes - points to the root of the subtree
    public m_rootNodeIndex: number = 0;
    // 4 bytes
    public m_subtreeSize: number = 0;

    /**
     * Set AABB from a quantized node
     * @param quantizedNode Source quantized node
     */
    public setAabbFromQuantizeNode(quantizedNode: btQuantizedBvhNode): void {
        this.m_quantizedAabbMin[0] = quantizedNode.m_quantizedAabbMin[0];
        this.m_quantizedAabbMin[1] = quantizedNode.m_quantizedAabbMin[1];
        this.m_quantizedAabbMin[2] = quantizedNode.m_quantizedAabbMin[2];
        this.m_quantizedAabbMax[0] = quantizedNode.m_quantizedAabbMax[0];
        this.m_quantizedAabbMax[1] = quantizedNode.m_quantizedAabbMax[1];
        this.m_quantizedAabbMax[2] = quantizedNode.m_quantizedAabbMax[2];
    }
}

// Type aliases for better code readability
export type NodeArray = btOptimizedBvhNode[];
export type QuantizedNodeArray = btQuantizedBvhNode[];
export type BvhSubtreeInfoArray = btBvhSubtreeInfo[];

/**
 * The btQuantizedBvh class stores an AABB tree that can be quickly traversed.
 * It is used by collision shapes as a midphase acceleration structure.
 * Quantization provides better performance and lower memory requirements.
 */
export class btQuantizedBvh {
    protected m_bvhAabbMin: btVector3 = new btVector3(0, 0, 0);
    protected m_bvhAabbMax: btVector3 = new btVector3(0, 0, 0);
    protected m_bvhQuantization: btVector3 = new btVector3(0, 0, 0);

    protected m_bulletVersion: number = BT_BULLET_VERSION;
    protected m_curNodeIndex: number = 0;
    protected m_useQuantization: boolean = false;

    protected m_leafNodes: NodeArray = [];
    protected m_contiguousNodes: NodeArray = [];
    protected m_quantizedLeafNodes: QuantizedNodeArray = [];
    protected m_quantizedContiguousNodes: QuantizedNodeArray = [];

    protected m_traversalMode: btTraversalMode = btTraversalMode.TRAVERSAL_STACKLESS;
    protected m_SubtreeHeaders: BvhSubtreeInfoArray = [];
    protected m_subtreeHeaderCount: number = 0;

    /**
     * Constructor
     */
    constructor() {
        this.m_bvhAabbMin.setValue(-SIMD_INFINITY, -SIMD_INFINITY, -SIMD_INFINITY);
        this.m_bvhAabbMax.setValue(SIMD_INFINITY, SIMD_INFINITY, SIMD_INFINITY);
    }

    /**
     * Set quantization values for the BVH
     * @param bvhAabbMin Minimum AABB bounds
     * @param bvhAabbMax Maximum AABB bounds
     * @param quantizationMargin Safety margin for quantization
     */
    public setQuantizationValues(
        bvhAabbMin: btVector3, 
        bvhAabbMax: btVector3, 
        quantizationMargin: number = 1.0
    ): void {
        // Enlarge the AABB to avoid division by zero when initializing the quantization values
        const clampValue = new btVector3(quantizationMargin, quantizationMargin, quantizationMargin);
        this.m_bvhAabbMin.copy(bvhAabbMin.subtract(clampValue));
        this.m_bvhAabbMax.copy(bvhAabbMax.add(clampValue));
        let aabbSize = this.m_bvhAabbMax.subtract(this.m_bvhAabbMin);
        this.m_bvhQuantization = new btVector3(
            65533.0 / aabbSize.getX(),
            65533.0 / aabbSize.getY(),
            65533.0 / aabbSize.getZ()
        );

        this.m_useQuantization = true;

        // Verify quantization by round-trip testing
        {
            const vecIn: [number, number, number] = [0, 0, 0];
            let v: btVector3;
            {
                this.quantize(vecIn, this.m_bvhAabbMin, false);
                v = this.unQuantize(vecIn);
                this.m_bvhAabbMin.setMin(v.subtract(clampValue));
            }
            aabbSize = this.m_bvhAabbMax.subtract(this.m_bvhAabbMin);
            this.m_bvhQuantization = new btVector3(
                65533.0 / aabbSize.getX(),
                65533.0 / aabbSize.getY(),
                65533.0 / aabbSize.getZ()
            );
            {
                this.quantize(vecIn, this.m_bvhAabbMax, true);
                v = this.unQuantize(vecIn);
                this.m_bvhAabbMax.setMax(v.add(clampValue));
            }
            aabbSize = this.m_bvhAabbMax.subtract(this.m_bvhAabbMin);
            this.m_bvhQuantization = new btVector3(
                65533.0 / aabbSize.getX(),
                65533.0 / aabbSize.getY(),
                65533.0 / aabbSize.getZ()
            );
        }
    }

    /**
     * Get the leaf node array
     * @returns Reference to the quantized leaf nodes array
     */
    public getLeafNodeArray(): QuantizedNodeArray {
        return this.m_quantizedLeafNodes;
    }

    /**
     * Build the BVH internal structure
     * Assumes that setQuantizationValues and LeafNodeArray are initialized
     */
    public buildInternal(): void {
        // Assumes that caller filled in the m_quantizedLeafNodes
        this.m_useQuantization = true;
        let numLeafNodes = 0;

        if (this.m_useQuantization) {
            // Now we have an array of leaf nodes in m_leafNodes
            numLeafNodes = this.m_quantizedLeafNodes.length;
            
            // Resize contiguous nodes array
            this.m_quantizedContiguousNodes = new Array(2 * numLeafNodes);
            for (let i = 0; i < this.m_quantizedContiguousNodes.length; i++) {
                this.m_quantizedContiguousNodes[i] = new btQuantizedBvhNode();
            }
        }

        this.m_curNodeIndex = 0;

        this.buildTree(0, numLeafNodes);

        // If the entire tree is small then subtree size, we need to create a header info for the tree
        if (this.m_useQuantization && this.m_SubtreeHeaders.length === 0) {
            const subtree = new btBvhSubtreeInfo();
            this.m_SubtreeHeaders.push(subtree);
            subtree.setAabbFromQuantizeNode(this.m_quantizedContiguousNodes[0]);
            subtree.m_rootNodeIndex = 0;
            subtree.m_subtreeSize = this.m_quantizedContiguousNodes[0].isLeafNode() ? 
                1 : this.m_quantizedContiguousNodes[0].getEscapeIndex();
        }

        // Update the copy of the size
        this.m_subtreeHeaderCount = this.m_SubtreeHeaders.length;

        // Clear temporary arrays
        this.m_quantizedLeafNodes.length = 0;
        this.m_leafNodes.length = 0;
    }

    /**
     * Quantize a point to unsigned short coordinates
     * @param out Output array for quantized coordinates
     * @param point Point to quantize
     * @param isMax Whether this is for maximum bounds
     */
    public quantize(out: [number, number, number], point: btVector3, isMax: boolean): void {
        btAssert(this.m_useQuantization);

        btAssert(point.getX() <= this.m_bvhAabbMax.getX());
        btAssert(point.getY() <= this.m_bvhAabbMax.getY());
        btAssert(point.getZ() <= this.m_bvhAabbMax.getZ());

        btAssert(point.getX() >= this.m_bvhAabbMin.getX());
        btAssert(point.getY() >= this.m_bvhAabbMin.getY());
        btAssert(point.getZ() >= this.m_bvhAabbMin.getZ());

        const v = point.subtract(this.m_bvhAabbMin).multiplyVector(this.m_bvhQuantization);
        
        // Make sure rounding is done in a way that unQuantize(quantizeWithClamp(...)) is conservative
        // End-points always set the first bit, so that they are sorted properly
        if (isMax) {
            out[0] = ((Math.floor(v.getX() + 1.0)) | 1) & 0xFFFF;
            out[1] = ((Math.floor(v.getY() + 1.0)) | 1) & 0xFFFF;
            out[2] = ((Math.floor(v.getZ() + 1.0)) | 1) & 0xFFFF;
        } else {
            out[0] = (Math.floor(v.getX()) & 0xFFFE) & 0xFFFF;
            out[1] = (Math.floor(v.getY()) & 0xFFFE) & 0xFFFF;
            out[2] = (Math.floor(v.getZ()) & 0xFFFE) & 0xFFFF;
        }
    }

    /**
     * Quantize with clamping to valid bounds
     * @param out Output array for quantized coordinates
     * @param point2 Point to quantize
     * @param isMax Whether this is for maximum bounds
     */
    public quantizeWithClamp(out: [number, number, number], point2: btVector3, isMax: boolean): void {
        btAssert(this.m_useQuantization);

        const clampedPoint = point2.clone();
        clampedPoint.setMax(this.m_bvhAabbMin);
        clampedPoint.setMin(this.m_bvhAabbMax);

        this.quantize(out, clampedPoint, isMax);
    }

    /**
     * Convert quantized coordinates back to world coordinates
     * @param vecIn Quantized input coordinates
     * @returns World space vector
     */
    public unQuantize(vecIn: [number, number, number]): btVector3 {
        const vecOut = new btVector3(
            vecIn[0] / this.m_bvhQuantization.getX(),
            vecIn[1] / this.m_bvhQuantization.getY(),
            vecIn[2] / this.m_bvhQuantization.getZ()
        );
        return vecOut.add(this.m_bvhAabbMin);
    }

    /**
     * Set traversal mode for queries
     * @param traversalMode The traversal mode to use
     */
    public setTraversalMode(traversalMode: btTraversalMode): void {
        this.m_traversalMode = traversalMode;
    }

    /**
     * Get the quantized node array
     * @returns Reference to quantized contiguous nodes
     */
    public getQuantizedNodeArray(): QuantizedNodeArray {
        return this.m_quantizedContiguousNodes;
    }

    /**
     * Get subtree info array
     * @returns Reference to subtree headers
     */
    public getSubtreeInfoArray(): BvhSubtreeInfoArray {
        return this.m_SubtreeHeaders;
    }

    /**
     * Check if quantization is enabled
     * @returns True if quantization is used
     */
    public isQuantized(): boolean {
        return this.m_useQuantization;
    }

    /**
     * Report all nodes overlapping with the given AABB
     * @param nodeCallback Callback to process overlapping nodes
     * @param aabbMin Minimum bounds of query AABB
     * @param aabbMax Maximum bounds of query AABB
     */
    public reportAabbOverlappingNodex(
        nodeCallback: btNodeOverlapCallback,
        aabbMin: btVector3,
        aabbMax: btVector3
    ): void {
        // Either choose recursive traversal or stackless
        if (this.m_useQuantization) {
            // Quantize query AABB
            const quantizedQueryAabbMin: [number, number, number] = [0, 0, 0];
            const quantizedQueryAabbMax: [number, number, number] = [0, 0, 0];
            this.quantizeWithClamp(quantizedQueryAabbMin, aabbMin, false);
            this.quantizeWithClamp(quantizedQueryAabbMax, aabbMax, true);

            switch (this.m_traversalMode) {
                case btTraversalMode.TRAVERSAL_STACKLESS:
                    this.walkStacklessQuantizedTree(
                        nodeCallback, 
                        quantizedQueryAabbMin, 
                        quantizedQueryAabbMax, 
                        0, 
                        this.m_curNodeIndex
                    );
                    break;
                case btTraversalMode.TRAVERSAL_STACKLESS_CACHE_FRIENDLY:
                    this.walkStacklessQuantizedTreeCacheFriendly(
                        nodeCallback, 
                        quantizedQueryAabbMin, 
                        quantizedQueryAabbMax
                    );
                    break;
                case btTraversalMode.TRAVERSAL_RECURSIVE:
                    {
                        const rootNode = this.m_quantizedContiguousNodes[0];
                        this.walkRecursiveQuantizedTreeAgainstQueryAabb(
                            rootNode, 
                            nodeCallback, 
                            quantizedQueryAabbMin, 
                            quantizedQueryAabbMax
                        );
                    }
                    break;
                default:
                    // Unsupported
                    btAssert(false);
            }
        } else {
            this.walkStacklessTree(nodeCallback, aabbMin, aabbMax);
        }
    }

    /**
     * Report ray overlapping nodes (simplified version without swept volume)
     * @param nodeCallback Callback to process overlapping nodes
     * @param raySource Ray origin
     * @param rayTarget Ray target
     */
    public reportRayOverlappingNodex(
        nodeCallback: btNodeOverlapCallback,
        raySource: btVector3,
        rayTarget: btVector3
    ): void {
        this.reportBoxCastOverlappingNodex(
            nodeCallback, 
            raySource, 
            rayTarget, 
            new btVector3(0, 0, 0), 
            new btVector3(0, 0, 0)
        );
    }

    /**
     * Report box cast overlapping nodes
     * @param nodeCallback Callback to process overlapping nodes
     * @param raySource Ray origin
     * @param rayTarget Ray target
     * @param aabbMin Box minimum bounds
     * @param aabbMax Box maximum bounds
     */
    public reportBoxCastOverlappingNodex(
        nodeCallback: btNodeOverlapCallback,
        raySource: btVector3,
        rayTarget: btVector3,
        aabbMin: btVector3,
        aabbMax: btVector3
    ): void {
        // Always use stackless
        if (this.m_useQuantization) {
            this.walkStacklessQuantizedTreeAgainstRay(
                nodeCallback, 
                raySource, 
                rayTarget, 
                aabbMin, 
                aabbMax, 
                0, 
                this.m_curNodeIndex
            );
        } else {
            this.walkStacklessTreeAgainstRay(
                nodeCallback, 
                raySource, 
                rayTarget, 
                aabbMin, 
                aabbMax, 
                0, 
                this.m_curNodeIndex
            );
        }
    }

    // Protected methods for internal use

    protected setInternalNodeAabbMin(nodeIndex: number, aabbMin: btVector3): void {
        if (this.m_useQuantization) {
            this.quantize(this.m_quantizedContiguousNodes[nodeIndex].m_quantizedAabbMin, aabbMin, false);
        } else {
            this.m_contiguousNodes[nodeIndex].m_aabbMinOrg.copy(aabbMin);
        }
    }

    protected setInternalNodeAabbMax(nodeIndex: number, aabbMax: btVector3): void {
        if (this.m_useQuantization) {
            this.quantize(this.m_quantizedContiguousNodes[nodeIndex].m_quantizedAabbMax, aabbMax, true);
        } else {
            this.m_contiguousNodes[nodeIndex].m_aabbMaxOrg.copy(aabbMax);
        }
    }

    protected getAabbMin(nodeIndex: number): btVector3 {
        if (this.m_useQuantization) {
            return this.unQuantize(this.m_quantizedLeafNodes[nodeIndex].m_quantizedAabbMin);
        }
        // Non-quantized
        return this.m_leafNodes[nodeIndex].m_aabbMinOrg.clone();
    }

    protected getAabbMax(nodeIndex: number): btVector3 {
        if (this.m_useQuantization) {
            return this.unQuantize(this.m_quantizedLeafNodes[nodeIndex].m_quantizedAabbMax);
        }
        // Non-quantized
        return this.m_leafNodes[nodeIndex].m_aabbMaxOrg.clone();
    }

    protected setInternalNodeEscapeIndex(nodeIndex: number, escapeIndex: number): void {
        if (this.m_useQuantization) {
            this.m_quantizedContiguousNodes[nodeIndex].m_escapeIndexOrTriangleIndex = -escapeIndex;
        } else {
            this.m_contiguousNodes[nodeIndex].m_escapeIndex = escapeIndex;
        }
    }

    protected mergeInternalNodeAabb(nodeIndex: number, newAabbMin: btVector3, newAabbMax: btVector3): void {
        if (this.m_useQuantization) {
            const quantizedAabbMin: [number, number, number] = [0, 0, 0];
            const quantizedAabbMax: [number, number, number] = [0, 0, 0];
            this.quantize(quantizedAabbMin, newAabbMin, false);
            this.quantize(quantizedAabbMax, newAabbMax, true);
            
            for (let i = 0; i < 3; i++) {
                if (this.m_quantizedContiguousNodes[nodeIndex].m_quantizedAabbMin[i] > quantizedAabbMin[i]) {
                    this.m_quantizedContiguousNodes[nodeIndex].m_quantizedAabbMin[i] = quantizedAabbMin[i];
                }
                if (this.m_quantizedContiguousNodes[nodeIndex].m_quantizedAabbMax[i] < quantizedAabbMax[i]) {
                    this.m_quantizedContiguousNodes[nodeIndex].m_quantizedAabbMax[i] = quantizedAabbMax[i];
                }
            }
        } else {
            // Non-quantized
            this.m_contiguousNodes[nodeIndex].m_aabbMinOrg.setMin(newAabbMin);
            this.m_contiguousNodes[nodeIndex].m_aabbMaxOrg.setMax(newAabbMax);
        }
    }

    protected swapLeafNodes(i: number, splitIndex: number): void {
        if (this.m_useQuantization) {
            const tmp = this.m_quantizedLeafNodes[i];
            this.m_quantizedLeafNodes[i] = this.m_quantizedLeafNodes[splitIndex];
            this.m_quantizedLeafNodes[splitIndex] = tmp;
        } else {
            const tmp = this.m_leafNodes[i];
            this.m_leafNodes[i] = this.m_leafNodes[splitIndex];
            this.m_leafNodes[splitIndex] = tmp;
        }
    }

    protected assignInternalNodeFromLeafNode(internalNode: number, leafNodeIndex: number): void {
        if (this.m_useQuantization) {
            // Copy quantized node data
            const leafNode = this.m_quantizedLeafNodes[leafNodeIndex];
            const internalQNode = this.m_quantizedContiguousNodes[internalNode];
            
            internalQNode.m_quantizedAabbMin[0] = leafNode.m_quantizedAabbMin[0];
            internalQNode.m_quantizedAabbMin[1] = leafNode.m_quantizedAabbMin[1];
            internalQNode.m_quantizedAabbMin[2] = leafNode.m_quantizedAabbMin[2];
            internalQNode.m_quantizedAabbMax[0] = leafNode.m_quantizedAabbMax[0];
            internalQNode.m_quantizedAabbMax[1] = leafNode.m_quantizedAabbMax[1];
            internalQNode.m_quantizedAabbMax[2] = leafNode.m_quantizedAabbMax[2];
            internalQNode.m_escapeIndexOrTriangleIndex = leafNode.m_escapeIndexOrTriangleIndex;
        } else {
            this.m_contiguousNodes[internalNode] = this.m_leafNodes[leafNodeIndex];
        }
    }

    protected buildTree(startIndex: number, endIndex: number): void {
        const numIndices = endIndex - startIndex;
        const curIndex = this.m_curNodeIndex;

        btAssert(numIndices > 0);

        if (numIndices === 1) {
            this.assignInternalNodeFromLeafNode(this.m_curNodeIndex, startIndex);
            this.m_curNodeIndex++;
            return;
        }

        // Calculate best splitting axis and where to split it
        const splitAxis = this.calcSplittingAxis(startIndex, endIndex);
        const splitIndex = this.sortAndCalcSplittingIndex(startIndex, endIndex, splitAxis);
        const internalNodeIndex = this.m_curNodeIndex;

        // Set the min aabb to 'inf' or a max value, and set the max aabb to a -inf/minimum value
        // The aabb will be expanded during buildTree/mergeInternalNodeAabb with actual node values
        this.setInternalNodeAabbMin(this.m_curNodeIndex, this.m_bvhAabbMax);
        this.setInternalNodeAabbMax(this.m_curNodeIndex, this.m_bvhAabbMin);

        for (let i = startIndex; i < endIndex; i++) {
            this.mergeInternalNodeAabb(this.m_curNodeIndex, this.getAabbMin(i), this.getAabbMax(i));
        }

        this.m_curNodeIndex++;

        const leftChildNodexIndex = this.m_curNodeIndex;

        // Build left child tree
        this.buildTree(startIndex, splitIndex);

        const rightChildNodexIndex = this.m_curNodeIndex;
        // Build right child tree
        this.buildTree(splitIndex, endIndex);

        const escapeIndex = this.m_curNodeIndex - curIndex;

        if (this.m_useQuantization) {
            // Escape index is the number of nodes of this subtree
            const sizeQuantizedNode = 16; // Size of btQuantizedBvhNode in bytes
            const treeSizeInBytes = escapeIndex * sizeQuantizedNode;
            if (treeSizeInBytes > MAX_SUBTREE_SIZE_IN_BYTES) {
                this.updateSubtreeHeaders(leftChildNodexIndex, rightChildNodexIndex);
            }
        }

        this.setInternalNodeEscapeIndex(internalNodeIndex, escapeIndex);
    }

    protected updateSubtreeHeaders(leftChildNodexIndex: number, rightChildNodexIndex: number): void {
        btAssert(this.m_useQuantization);

        const leftChildNode = this.m_quantizedContiguousNodes[leftChildNodexIndex];
        const leftSubTreeSize = leftChildNode.isLeafNode() ? 1 : leftChildNode.getEscapeIndex();
        const leftSubTreeSizeInBytes = leftSubTreeSize * 16; // sizeof(btQuantizedBvhNode)

        const rightChildNode = this.m_quantizedContiguousNodes[rightChildNodexIndex];
        const rightSubTreeSize = rightChildNode.isLeafNode() ? 1 : rightChildNode.getEscapeIndex();
        const rightSubTreeSizeInBytes = rightSubTreeSize * 16; // sizeof(btQuantizedBvhNode)

        if (leftSubTreeSizeInBytes <= MAX_SUBTREE_SIZE_IN_BYTES) {
            const subtree = new btBvhSubtreeInfo();
            this.m_SubtreeHeaders.push(subtree);
            subtree.setAabbFromQuantizeNode(leftChildNode);
            subtree.m_rootNodeIndex = leftChildNodexIndex;
            subtree.m_subtreeSize = leftSubTreeSize;
        }

        if (rightSubTreeSizeInBytes <= MAX_SUBTREE_SIZE_IN_BYTES) {
            const subtree = new btBvhSubtreeInfo();
            this.m_SubtreeHeaders.push(subtree);
            subtree.setAabbFromQuantizeNode(rightChildNode);
            subtree.m_rootNodeIndex = rightChildNodexIndex;
            subtree.m_subtreeSize = rightSubTreeSize;
        }

        // Update the copy of the size
        this.m_subtreeHeaderCount = this.m_SubtreeHeaders.length;
    }

    protected sortAndCalcSplittingIndex(startIndex: number, endIndex: number, splitAxis: number): number {
        let splitIndex = startIndex;
        const numIndices = endIndex - startIndex;

        let means = new btVector3(0, 0, 0);
        for (let i = startIndex; i < endIndex; i++) {
            const center = this.getAabbMax(i).add(this.getAabbMin(i)).multiply(0.5);
            means = means.add(center);
        }
        means = means.multiply(1.0 / numIndices);

        const splitValue = splitAxis === 0 ? means.getX() : (splitAxis === 1 ? means.getY() : means.getZ());

        // Sort leaf nodes so all values larger than splitValue comes first
        for (let i = startIndex; i < endIndex; i++) {
            const center = this.getAabbMax(i).add(this.getAabbMin(i)).multiply(0.5);
            const centerAxis = splitAxis === 0 ? center.getX() : (splitAxis === 1 ? center.getY() : center.getZ());
            if (centerAxis > splitValue) {
                // Swap
                this.swapLeafNodes(i, splitIndex);
                splitIndex++;
            }
        }

        // If the splitIndex causes unbalanced trees, fix this by using the center
        const rangeBalancedIndices = Math.floor(numIndices / 3);
        const unbalanced = ((splitIndex <= (startIndex + rangeBalancedIndices)) || 
                           (splitIndex >= (endIndex - 1 - rangeBalancedIndices)));

        if (unbalanced) {
            splitIndex = startIndex + Math.floor(numIndices / 2);
        }

        const unbal = (splitIndex === startIndex) || (splitIndex === endIndex);
        btAssert(!unbal);

        return splitIndex;
    }

    protected calcSplittingAxis(startIndex: number, endIndex: number): number {
        let means = new btVector3(0, 0, 0);
        let variance = new btVector3(0, 0, 0);
        const numIndices = endIndex - startIndex;

        for (let i = startIndex; i < endIndex; i++) {
            const center = this.getAabbMax(i).add(this.getAabbMin(i)).multiply(0.5);
            means = means.add(center);
        }
        means = means.multiply(1.0 / numIndices);

        for (let i = startIndex; i < endIndex; i++) {
            const center = this.getAabbMax(i).add(this.getAabbMin(i)).multiply(0.5);
            const diff2 = center.subtract(means);
            const squared = new btVector3(diff2.getX() * diff2.getX(), diff2.getY() * diff2.getY(), diff2.getZ() * diff2.getZ());
            variance = variance.add(squared);
        }
        variance = variance.multiply(1.0 / (numIndices - 1));

        return variance.maxAxis();
    }

    protected walkStacklessTree(
        nodeCallback: btNodeOverlapCallback,
        aabbMin: btVector3,
        aabbMax: btVector3
    ): void {
        btAssert(!this.m_useQuantization);

        let curIndex = 0;
        let walkIterations = 0;

        while (curIndex < this.m_curNodeIndex) {
            // Catch bugs in tree data
            btAssert(walkIterations < this.m_curNodeIndex);

            walkIterations++;
            const rootNode = this.m_contiguousNodes[curIndex];
            const aabbOverlap = TestAabbAgainstAabb2(aabbMin, aabbMax, rootNode.m_aabbMinOrg, rootNode.m_aabbMaxOrg);
            const isLeafNode = rootNode.m_escapeIndex === -1;

            if (isLeafNode && aabbOverlap) {
                nodeCallback.processNode(rootNode.m_subPart, rootNode.m_triangleIndex);
            }

            if (aabbOverlap || isLeafNode) {
                curIndex++;
            } else {
                curIndex += rootNode.m_escapeIndex;
            }
        }
    }

    protected walkRecursiveQuantizedTreeAgainstQueryAabb(
        currentNode: btQuantizedBvhNode,
        nodeCallback: btNodeOverlapCallback,
        quantizedQueryAabbMin: [number, number, number],
        quantizedQueryAabbMax: [number, number, number]
    ): void {
        btAssert(this.m_useQuantization);

        const aabbOverlap = testQuantizedAabbAgainstQuantizedAabb(
            quantizedQueryAabbMin, 
            quantizedQueryAabbMax, 
            currentNode.m_quantizedAabbMin, 
            currentNode.m_quantizedAabbMax
        );
        const isLeafNode = currentNode.isLeafNode();

        if (aabbOverlap) {
            if (isLeafNode) {
                nodeCallback.processNode(currentNode.getPartId(), currentNode.getTriangleIndex());
            } else {
                // Process left and right children
                const nodeIndex = this.m_quantizedContiguousNodes.indexOf(currentNode);
                const leftChildNode = this.m_quantizedContiguousNodes[nodeIndex + 1];
                this.walkRecursiveQuantizedTreeAgainstQueryAabb(
                    leftChildNode, 
                    nodeCallback, 
                    quantizedQueryAabbMin, 
                    quantizedQueryAabbMax
                );

                const rightChildIndex = leftChildNode.isLeafNode() ? 
                    nodeIndex + 2 : nodeIndex + 1 + leftChildNode.getEscapeIndex();
                const rightChildNode = this.m_quantizedContiguousNodes[rightChildIndex];
                this.walkRecursiveQuantizedTreeAgainstQueryAabb(
                    rightChildNode, 
                    nodeCallback, 
                    quantizedQueryAabbMin, 
                    quantizedQueryAabbMax
                );
            }
        }
    }

    protected walkStacklessTreeAgainstRay(
        nodeCallback: btNodeOverlapCallback,
        raySource: btVector3,
        rayTarget: btVector3,
        aabbMin: btVector3,
        aabbMax: btVector3,
        _startNodeIndex: number,
        _endNodeIndex: number
    ): void {
        btAssert(!this.m_useQuantization);

        let curIndex = 0;
        let walkIterations = 0;
        let lambdaMax = 1.0;

        // Quick pruning by quantized box
        const rayAabbMin = raySource.clone();
        const rayAabbMax = raySource.clone();
        rayAabbMin.setMin(rayTarget);
        rayAabbMax.setMax(rayTarget);

        // Add box cast extents to bounding box
        rayAabbMin.copy(rayAabbMin.add(aabbMin));
        rayAabbMax.copy(rayAabbMax.add(aabbMax));

        const rayDir = rayTarget.subtract(raySource);
        rayDir.safeNormalize();
        lambdaMax = rayDir.dot(rayTarget.subtract(raySource));

        // Ray direction inverse for optimization
        const rayDirectionInverse = new btVector3(
            rayDir.getX() === 0.0 ? BT_LARGE_FLOAT : 1.0 / rayDir.getX(),
            rayDir.getY() === 0.0 ? BT_LARGE_FLOAT : 1.0 / rayDir.getY(),
            rayDir.getZ() === 0.0 ? BT_LARGE_FLOAT : 1.0 / rayDir.getZ()
        );
        const sign = [
            rayDirectionInverse.getX() < 0.0 ? 1 : 0,
            rayDirectionInverse.getY() < 0.0 ? 1 : 0,
            rayDirectionInverse.getZ() < 0.0 ? 1 : 0
        ];

        while (curIndex < this.m_curNodeIndex) {
            let param = 1.0;
            // Catch bugs in tree data
            btAssert(walkIterations < this.m_curNodeIndex);

            walkIterations++;
            const rootNode = this.m_contiguousNodes[curIndex];

            const bounds = [
                rootNode.m_aabbMinOrg.subtract(aabbMax),
                rootNode.m_aabbMaxOrg.subtract(aabbMin)
            ];

            const aabbOverlap = TestAabbAgainstAabb2(rayAabbMin, rayAabbMax, rootNode.m_aabbMinOrg, rootNode.m_aabbMaxOrg);
            const paramRef = { value: param };
            const rayBoxOverlap = aabbOverlap ? 
                btRayAabb2(raySource, rayDirectionInverse, sign, bounds, paramRef, 0.0, lambdaMax) : false;

            const isLeafNode = rootNode.m_escapeIndex === -1;

            if (isLeafNode && rayBoxOverlap) {
                nodeCallback.processNode(rootNode.m_subPart, rootNode.m_triangleIndex);
            }

            if (rayBoxOverlap || isLeafNode) {
                curIndex++;
            } else {
                curIndex += rootNode.m_escapeIndex;
            }
        }
    }

    protected walkStacklessQuantizedTreeAgainstRay(
        nodeCallback: btNodeOverlapCallback,
        raySource: btVector3,
        rayTarget: btVector3,
        aabbMin: btVector3,
        aabbMax: btVector3,
        startNodeIndex: number,
        endNodeIndex: number
    ): void {
        btAssert(this.m_useQuantization);

        let curIndex = startNodeIndex;
        let walkIterations = 0;
        const subTreeSize = endNodeIndex - startNodeIndex;
        let lambdaMax = 1.0;

        const rayDirection = rayTarget.subtract(raySource);
        rayDirection.safeNormalize();
        lambdaMax = rayDirection.dot(rayTarget.subtract(raySource));
        
        // Ray direction inverse
        const rayDirInv = new btVector3(
            rayDirection.getX() === 0.0 ? BT_LARGE_FLOAT : 1.0 / rayDirection.getX(),
            rayDirection.getY() === 0.0 ? BT_LARGE_FLOAT : 1.0 / rayDirection.getY(),
            rayDirection.getZ() === 0.0 ? BT_LARGE_FLOAT : 1.0 / rayDirection.getZ()
        );
        const sign = [
            rayDirInv.getX() < 0.0 ? 1 : 0,
            rayDirInv.getY() < 0.0 ? 1 : 0,
            rayDirInv.getZ() < 0.0 ? 1 : 0
        ];

        // Quick pruning by quantized box
        const rayAabbMin = raySource.clone();
        const rayAabbMax = raySource.clone();
        rayAabbMin.setMin(rayTarget);
        rayAabbMax.setMax(rayTarget);

        // Add box cast extents to bounding box
        rayAabbMin.copy(rayAabbMin.add(aabbMin));
        rayAabbMax.copy(rayAabbMax.add(aabbMax));

        const quantizedQueryAabbMin: [number, number, number] = [0, 0, 0];
        const quantizedQueryAabbMax: [number, number, number] = [0, 0, 0];
        this.quantizeWithClamp(quantizedQueryAabbMin, rayAabbMin, false);
        this.quantizeWithClamp(quantizedQueryAabbMax, rayAabbMax, true);

        while (curIndex < endNodeIndex) {
            // Catch bugs in tree data
            btAssert(walkIterations < subTreeSize);

            walkIterations++;
            const rootNode = this.m_quantizedContiguousNodes[curIndex];
            let param = 1.0;
            let rayBoxOverlap = false;
            
            const boxBoxOverlap = testQuantizedAabbAgainstQuantizedAabb(
                quantizedQueryAabbMin, 
                quantizedQueryAabbMax, 
                rootNode.m_quantizedAabbMin, 
                rootNode.m_quantizedAabbMax
            );
            const isLeafNode = rootNode.isLeafNode();
            
            if (boxBoxOverlap) {
                const bounds = [
                    this.unQuantize(rootNode.m_quantizedAabbMin).subtract(aabbMax),
                    this.unQuantize(rootNode.m_quantizedAabbMax).subtract(aabbMin)
                ];
                
                const paramRef = { value: param };
                rayBoxOverlap = btRayAabb2(raySource, rayDirInv, sign, bounds, paramRef, 0.0, lambdaMax);
            }

            if (isLeafNode && rayBoxOverlap) {
                nodeCallback.processNode(rootNode.getPartId(), rootNode.getTriangleIndex());
            }

            if (rayBoxOverlap || isLeafNode) {
                curIndex++;
            } else {
                curIndex += rootNode.getEscapeIndex();
            }
        }
    }

    protected walkStacklessQuantizedTree(
        nodeCallback: btNodeOverlapCallback,
        quantizedQueryAabbMin: [number, number, number],
        quantizedQueryAabbMax: [number, number, number],
        startNodeIndex: number,
        endNodeIndex: number
    ): void {
        btAssert(this.m_useQuantization);

        let curIndex = startNodeIndex;
        let walkIterations = 0;
        const subTreeSize = endNodeIndex - startNodeIndex;

        while (curIndex < endNodeIndex) {
            // Catch bugs in tree data
            btAssert(walkIterations < subTreeSize);

            walkIterations++;
            const rootNode = this.m_quantizedContiguousNodes[curIndex];
            
            const aabbOverlap = testQuantizedAabbAgainstQuantizedAabb(
                quantizedQueryAabbMin, 
                quantizedQueryAabbMax, 
                rootNode.m_quantizedAabbMin, 
                rootNode.m_quantizedAabbMax
            );
            const isLeafNode = rootNode.isLeafNode();

            if (isLeafNode && aabbOverlap) {
                nodeCallback.processNode(rootNode.getPartId(), rootNode.getTriangleIndex());
            }

            if (aabbOverlap || isLeafNode) {
                curIndex++;
            } else {
                curIndex += rootNode.getEscapeIndex();
            }
        }
    }

    protected walkStacklessQuantizedTreeCacheFriendly(
        nodeCallback: btNodeOverlapCallback,
        quantizedQueryAabbMin: [number, number, number],
        quantizedQueryAabbMax: [number, number, number]
    ): void {
        btAssert(this.m_useQuantization);

        for (let i = 0; i < this.m_SubtreeHeaders.length; i++) {
            const subtree = this.m_SubtreeHeaders[i];

            const overlap = testQuantizedAabbAgainstQuantizedAabb(
                quantizedQueryAabbMin, 
                quantizedQueryAabbMax, 
                subtree.m_quantizedAabbMin, 
                subtree.m_quantizedAabbMax
            );
            
            if (overlap) {
                this.walkStacklessQuantizedTree(
                    nodeCallback, 
                    quantizedQueryAabbMin, 
                    quantizedQueryAabbMax,
                    subtree.m_rootNodeIndex,
                    subtree.m_rootNodeIndex + subtree.m_subtreeSize
                );
            }
        }
    }
}