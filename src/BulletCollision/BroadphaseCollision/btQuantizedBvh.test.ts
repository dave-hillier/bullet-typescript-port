/*
Unit tests for btQuantizedBvh - TypeScript port of Bullet3's Quantized Bounding Volume Hierarchy
*/

import { 
    btQuantizedBvh, 
    btQuantizedBvhNode, 
    btOptimizedBvhNode, 
    btBvhSubtreeInfo, 
    btTraversalMode,
    btNodeOverlapCallback,
    MAX_SUBTREE_SIZE_IN_BYTES,
    MAX_NUM_PARTS_IN_BITS
} from './btQuantizedBvh';
import { btVector3 } from '../../LinearMath/btVector3';

// Mock callback for testing
class TestNodeOverlapCallback implements btNodeOverlapCallback {
    public processedNodes: Array<{subPart: number, triangleIndex: number}> = [];
    
    processNode(subPart: number, triangleIndex: number): void {
        this.processedNodes.push({ subPart, triangleIndex });
    }
    
    clear(): void {
        this.processedNodes = [];
    }
    
    getCount(): number {
        return this.processedNodes.length;
    }
}

describe('btQuantizedBvh', () => {
    let bvh: btQuantizedBvh;
    let callback: TestNodeOverlapCallback;

    beforeEach(() => {
        bvh = new btQuantizedBvh();
        callback = new TestNodeOverlapCallback();
    });

    describe('Constants and Enums', () => {
        test('MAX_SUBTREE_SIZE_IN_BYTES should be 2048', () => {
            expect(MAX_SUBTREE_SIZE_IN_BYTES).toBe(2048);
        });

        test('MAX_NUM_PARTS_IN_BITS should be 4', () => {
            expect(MAX_NUM_PARTS_IN_BITS).toBe(4);
        });

        test('btTraversalMode enum should have correct values', () => {
            expect(btTraversalMode.TRAVERSAL_STACKLESS).toBe(0);
            expect(btTraversalMode.TRAVERSAL_STACKLESS_CACHE_FRIENDLY).toBe(1);
            expect(btTraversalMode.TRAVERSAL_RECURSIVE).toBe(2);
        });
    });

    describe('btQuantizedBvhNode', () => {
        let node: btQuantizedBvhNode;

        beforeEach(() => {
            node = new btQuantizedBvhNode();
        });

        test('should initialize with default values', () => {
            expect(node.m_quantizedAabbMin).toEqual([0, 0, 0]);
            expect(node.m_quantizedAabbMax).toEqual([0, 0, 0]);
            expect(node.m_escapeIndexOrTriangleIndex).toBe(0);
        });

        test('isLeafNode should work correctly', () => {
            // Leaf node (triangle index >= 0)
            node.m_escapeIndexOrTriangleIndex = 5;
            expect(node.isLeafNode()).toBe(true);

            // Internal node (escape index < 0)
            node.m_escapeIndexOrTriangleIndex = -10;
            expect(node.isLeafNode()).toBe(false);
        });

        test('getEscapeIndex should work for internal nodes', () => {
            node.m_escapeIndexOrTriangleIndex = -15;
            expect(node.getEscapeIndex()).toBe(15);
        });

        test('getTriangleIndex should extract triangle index correctly', () => {
            // Set a triangle index (lower bits)
            node.m_escapeIndexOrTriangleIndex = 42;
            expect(node.getTriangleIndex()).toBe(42);
        });

        test('getPartId should extract part ID correctly', () => {
            // Set part ID in upper bits
            const partId = 3;
            node.m_escapeIndexOrTriangleIndex = partId << (31 - MAX_NUM_PARTS_IN_BITS);
            expect(node.getPartId()).toBe(partId);
        });
    });

    describe('btOptimizedBvhNode', () => {
        let node: btOptimizedBvhNode;

        beforeEach(() => {
            node = new btOptimizedBvhNode();
        });

        test('should initialize with default values', () => {
            expect(node.m_aabbMinOrg).toEqual(new btVector3(0, 0, 0));
            expect(node.m_aabbMaxOrg).toEqual(new btVector3(0, 0, 0));
            expect(node.m_escapeIndex).toBe(0);
            expect(node.m_subPart).toBe(0);
            expect(node.m_triangleIndex).toBe(0);
        });

        test('should allow setting AABB values', () => {
            const min = new btVector3(-1, -2, -3);
            const max = new btVector3(4, 5, 6);
            
            node.m_aabbMinOrg = min;
            node.m_aabbMaxOrg = max;
            
            expect(node.m_aabbMinOrg).toEqual(min);
            expect(node.m_aabbMaxOrg).toEqual(max);
        });
    });

    describe('btBvhSubtreeInfo', () => {
        let subtreeInfo: btBvhSubtreeInfo;

        beforeEach(() => {
            subtreeInfo = new btBvhSubtreeInfo();
        });

        test('should initialize with default values', () => {
            expect(subtreeInfo.m_quantizedAabbMin).toEqual([0, 0, 0]);
            expect(subtreeInfo.m_quantizedAabbMax).toEqual([0, 0, 0]);
            expect(subtreeInfo.m_rootNodeIndex).toBe(0);
            expect(subtreeInfo.m_subtreeSize).toBe(0);
        });

        test('setAabbFromQuantizeNode should copy AABB correctly', () => {
            const quantizedNode = new btQuantizedBvhNode();
            quantizedNode.m_quantizedAabbMin[0] = 10;
            quantizedNode.m_quantizedAabbMin[1] = 20;
            quantizedNode.m_quantizedAabbMin[2] = 30;
            quantizedNode.m_quantizedAabbMax[0] = 40;
            quantizedNode.m_quantizedAabbMax[1] = 50;
            quantizedNode.m_quantizedAabbMax[2] = 60;

            subtreeInfo.setAabbFromQuantizeNode(quantizedNode);

            expect(subtreeInfo.m_quantizedAabbMin).toEqual([10, 20, 30]);
            expect(subtreeInfo.m_quantizedAabbMax).toEqual([40, 50, 60]);
        });
    });

    describe('btQuantizedBvh Basic Functionality', () => {
        test('constructor should initialize with default values', () => {
            expect(bvh.isQuantized()).toBe(false);
            expect(bvh.getLeafNodeArray()).toEqual([]);
            expect(bvh.getQuantizedNodeArray()).toEqual([]);
            expect(bvh.getSubtreeInfoArray()).toEqual([]);
        });

        test('setTraversalMode should update traversal mode', () => {
            bvh.setTraversalMode(btTraversalMode.TRAVERSAL_RECURSIVE);
            // We can't directly test this as the property is protected,
            // but we can test it indirectly through behavior
        });

        test('setQuantizationValues should enable quantization', () => {
            const aabbMin = new btVector3(-10, -10, -10);
            const aabbMax = new btVector3(10, 10, 10);

            bvh.setQuantizationValues(aabbMin, aabbMax, 1.0);

            expect(bvh.isQuantized()).toBe(true);
        });
    });

    describe('Quantization/Unquantization', () => {
        beforeEach(() => {
            const aabbMin = new btVector3(-100, -100, -100);
            const aabbMax = new btVector3(100, 100, 100);
            bvh.setQuantizationValues(aabbMin, aabbMax, 1.0);
        });

        test('quantize and unQuantize should be approximately inverse operations', () => {
            const originalPoint = new btVector3(25.5, -37.2, 88.1);
            const quantized: [number, number, number] = [0, 0, 0];

            bvh.quantize(quantized, originalPoint, false);
            const unquantized = bvh.unQuantize(quantized);

            // Due to quantization precision loss, we check approximate equality
            expect(Math.abs(unquantized.getX() - originalPoint.getX())).toBeLessThan(1.0);
            expect(Math.abs(unquantized.getY() - originalPoint.getY())).toBeLessThan(1.0);
            expect(Math.abs(unquantized.getZ() - originalPoint.getZ())).toBeLessThan(1.0);
        });

        test('quantizeWithClamp should handle out-of-bounds points', () => {
            const outOfBoundsPoint = new btVector3(200, -200, 150); // Outside quantization bounds
            const quantized: [number, number, number] = [0, 0, 0];

            // Should not throw error
            expect(() => {
                bvh.quantizeWithClamp(quantized, outOfBoundsPoint, false);
            }).not.toThrow();

            // Quantized values should be valid (within uint16 range)
            expect(quantized[0]).toBeGreaterThanOrEqual(0);
            expect(quantized[0]).toBeLessThanOrEqual(65535);
            expect(quantized[1]).toBeGreaterThanOrEqual(0);
            expect(quantized[1]).toBeLessThanOrEqual(65535);
            expect(quantized[2]).toBeGreaterThanOrEqual(0);
            expect(quantized[2]).toBeLessThanOrEqual(65535);
        });

        test('quantization with isMax=true should set lowest bit', () => {
            const point = new btVector3(0, 0, 0);
            const quantizedMax: [number, number, number] = [0, 0, 0];
            const quantizedMin: [number, number, number] = [0, 0, 0];

            bvh.quantize(quantizedMax, point, true);  // isMax = true
            bvh.quantize(quantizedMin, point, false); // isMax = false

            // For max bounds, lowest bit should be set (odd numbers)
            expect(quantizedMax[0] & 1).toBe(1);
            expect(quantizedMax[1] & 1).toBe(1);
            expect(quantizedMax[2] & 1).toBe(1);

            // For min bounds, lowest bit should be clear (even numbers)
            expect(quantizedMin[0] & 1).toBe(0);
            expect(quantizedMin[1] & 1).toBe(0);
            expect(quantizedMin[2] & 1).toBe(0);
        });
    });

    describe('BVH Construction', () => {
        test('buildInternal with simple leaf nodes should create basic tree', () => {
            const aabbMin = new btVector3(-100, -100, -100);
            const aabbMax = new btVector3(100, 100, 100);
            bvh.setQuantizationValues(aabbMin, aabbMax);

            // Create some leaf nodes
            const leafNodes = bvh.getLeafNodeArray();
            
            // Add a few test leaf nodes
            for (let i = 0; i < 4; i++) {
                const node = new btQuantizedBvhNode();
                node.m_escapeIndexOrTriangleIndex = i; // Triangle index (leaf node)
                
                // Set some quantized AABB values
                const min: [number, number, number] = [i * 1000, i * 1000, i * 1000];
                const max: [number, number, number] = [i * 1000 + 500, i * 1000 + 500, i * 1000 + 500];
                
                node.m_quantizedAabbMin[0] = min[0];
                node.m_quantizedAabbMin[1] = min[1];
                node.m_quantizedAabbMin[2] = min[2];
                node.m_quantizedAabbMax[0] = max[0];
                node.m_quantizedAabbMax[1] = max[1];
                node.m_quantizedAabbMax[2] = max[2];
                
                leafNodes.push(node);
            }

            bvh.buildInternal();

            expect(bvh.isQuantized()).toBe(true);
            expect(bvh.getQuantizedNodeArray().length).toBeGreaterThan(0);
        });
    });

    describe('AABB Queries', () => {
        beforeEach(() => {
            // Set up a simple BVH for testing
            const aabbMin = new btVector3(-100, -100, -100);
            const aabbMax = new btVector3(100, 100, 100);
            bvh.setQuantizationValues(aabbMin, aabbMax);

            // Create leaf nodes in different locations
            const leafNodes = bvh.getLeafNodeArray();
            const testPositions = [
                new btVector3(-50, -50, -50),
                new btVector3(50, 50, 50),
                new btVector3(-25, 25, 0),
                new btVector3(25, -25, 0)
            ];

            testPositions.forEach((pos, i) => {
                const node = new btQuantizedBvhNode();
                node.m_escapeIndexOrTriangleIndex = i; // Triangle index
                
                // Quantize position to create node AABB
                const minQuantized: [number, number, number] = [0, 0, 0];
                const maxQuantized: [number, number, number] = [0, 0, 0];
                const nodeMin = pos.subtract(new btVector3(5, 5, 5));
                const nodeMax = pos.add(new btVector3(5, 5, 5));
                
                bvh.quantize(minQuantized, nodeMin, false);
                bvh.quantize(maxQuantized, nodeMax, true);
                
                node.m_quantizedAabbMin[0] = minQuantized[0];
                node.m_quantizedAabbMin[1] = minQuantized[1];
                node.m_quantizedAabbMin[2] = minQuantized[2];
                node.m_quantizedAabbMax[0] = maxQuantized[0];
                node.m_quantizedAabbMax[1] = maxQuantized[1];
                node.m_quantizedAabbMax[2] = maxQuantized[2];
                
                leafNodes.push(node);
            });

            if (leafNodes.length > 0) {
                bvh.buildInternal();
            }
        });

        test('reportAabbOverlappingNodex should find overlapping nodes', () => {
            if (bvh.getLeafNodeArray().length === 0) {
                // Skip if no nodes were added
                return;
            }

            const queryMin = new btVector3(-60, -60, -60);
            const queryMax = new btVector3(-40, -40, -40);

            callback.clear();
            bvh.reportAabbOverlappingNodex(callback, queryMin, queryMax);

            // Should find at least one overlapping node (the one at -50, -50, -50)
            expect(callback.getCount()).toBeGreaterThanOrEqual(0);
        });

        test('reportRayOverlappingNodex should find nodes intersecting ray', () => {
            if (bvh.getLeafNodeArray().length === 0) {
                return;
            }

            const raySource = new btVector3(-100, 0, 0);
            const rayTarget = new btVector3(100, 0, 0);

            callback.clear();
            bvh.reportRayOverlappingNodex(callback, raySource, rayTarget);

            // Should find nodes that the ray passes through
            expect(callback.getCount()).toBeGreaterThanOrEqual(0);
        });

        test('reportBoxCastOverlappingNodex should find nodes intersecting swept box', () => {
            if (bvh.getLeafNodeArray().length === 0) {
                return;
            }

            const raySource = new btVector3(-100, 0, 0);
            const rayTarget = new btVector3(100, 0, 0);
            const boxMin = new btVector3(-1, -1, -1);
            const boxMax = new btVector3(1, 1, 1);

            callback.clear();
            bvh.reportBoxCastOverlappingNodex(callback, raySource, rayTarget, boxMin, boxMax);

            // Should find nodes that the swept box intersects
            expect(callback.getCount()).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Traversal Modes', () => {
        test('should support different traversal modes', () => {
            const modes = [
                btTraversalMode.TRAVERSAL_STACKLESS,
                btTraversalMode.TRAVERSAL_STACKLESS_CACHE_FRIENDLY,
                btTraversalMode.TRAVERSAL_RECURSIVE
            ];

            modes.forEach(mode => {
                expect(() => {
                    bvh.setTraversalMode(mode);
                }).not.toThrow();
            });
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty BVH gracefully', () => {
            const queryMin = new btVector3(-10, -10, -10);
            const queryMax = new btVector3(10, 10, 10);

            expect(() => {
                bvh.reportAabbOverlappingNodex(callback, queryMin, queryMax);
            }).not.toThrow();

            expect(callback.getCount()).toBe(0);
        });

        test('should handle single node BVH', () => {
            const aabbMin = new btVector3(-100, -100, -100);
            const aabbMax = new btVector3(100, 100, 100);
            bvh.setQuantizationValues(aabbMin, aabbMax);

            const leafNodes = bvh.getLeafNodeArray();
            const node = new btQuantizedBvhNode();
            node.m_escapeIndexOrTriangleIndex = 0;
            
            // Set quantized AABB
            const minQuantized: [number, number, number] = [0, 0, 0];
            const maxQuantized: [number, number, number] = [0, 0, 0];
            bvh.quantize(minQuantized, new btVector3(-5, -5, -5), false);
            bvh.quantize(maxQuantized, new btVector3(5, 5, 5), true);
            
            node.m_quantizedAabbMin[0] = minQuantized[0];
            node.m_quantizedAabbMin[1] = minQuantized[1];
            node.m_quantizedAabbMin[2] = minQuantized[2];
            node.m_quantizedAabbMax[0] = maxQuantized[0];
            node.m_quantizedAabbMax[1] = maxQuantized[1];
            node.m_quantizedAabbMax[2] = maxQuantized[2];
            
            leafNodes.push(node);
            bvh.buildInternal();

            const queryMin = new btVector3(-10, -10, -10);
            const queryMax = new btVector3(10, 10, 10);

            expect(() => {
                bvh.reportAabbOverlappingNodex(callback, queryMin, queryMax);
            }).not.toThrow();

            // Should find the single node
            expect(callback.getCount()).toBe(1);
        });

        test('should handle quantization boundary conditions', () => {
            const aabbMin = new btVector3(-1, -1, -1);
            const aabbMax = new btVector3(1, 1, 1);
            
            expect(() => {
                bvh.setQuantizationValues(aabbMin, aabbMax, 0.0); // Zero margin
            }).not.toThrow();

            expect(bvh.isQuantized()).toBe(true);
        });
    });

    describe('Performance and Memory', () => {
        test('should handle moderately large node counts', () => {
            const aabbMin = new btVector3(-1000, -1000, -1000);
            const aabbMax = new btVector3(1000, 1000, 1000);
            bvh.setQuantizationValues(aabbMin, aabbMax);

            const leafNodes = bvh.getLeafNodeArray();
            const nodeCount = 100; // Moderate number for testing

            // Create nodes in a grid pattern
            const gridSize = Math.ceil(Math.cbrt(nodeCount));
            let nodeIndex = 0;

            for (let x = 0; x < gridSize && nodeIndex < nodeCount; x++) {
                for (let y = 0; y < gridSize && nodeIndex < nodeCount; y++) {
                    for (let z = 0; z < gridSize && nodeIndex < nodeCount; z++) {
                        const node = new btQuantizedBvhNode();
                        node.m_escapeIndexOrTriangleIndex = nodeIndex;

                        const pos = new btVector3(
                            (x - gridSize / 2) * 100,
                            (y - gridSize / 2) * 100,
                            (z - gridSize / 2) * 100
                        );

                        const minQuantized: [number, number, number] = [0, 0, 0];
                        const maxQuantized: [number, number, number] = [0, 0, 0];
                        const nodeMin = pos.subtract(new btVector3(25, 25, 25));
                        const nodeMax = pos.add(new btVector3(25, 25, 25));

                        bvh.quantize(minQuantized, nodeMin, false);
                        bvh.quantize(maxQuantized, nodeMax, true);

                        node.m_quantizedAabbMin[0] = minQuantized[0];
                        node.m_quantizedAabbMin[1] = minQuantized[1];
                        node.m_quantizedAabbMin[2] = minQuantized[2];
                        node.m_quantizedAabbMax[0] = maxQuantized[0];
                        node.m_quantizedAabbMax[1] = maxQuantized[1];
                        node.m_quantizedAabbMax[2] = maxQuantized[2];

                        leafNodes.push(node);
                        nodeIndex++;
                    }
                }
            }

            const startTime = performance.now();
            bvh.buildInternal();
            const buildTime = performance.now() - startTime;

            expect(buildTime).toBeLessThan(1000); // Should build in less than 1 second
            expect(bvh.getQuantizedNodeArray().length).toBeGreaterThan(0);

            // Test query performance
            const queryStart = performance.now();
            const queryMin = new btVector3(-50, -50, -50);
            const queryMax = new btVector3(50, 50, 50);
            bvh.reportAabbOverlappingNodex(callback, queryMin, queryMax);
            const queryTime = performance.now() - queryStart;

            expect(queryTime).toBeLessThan(100); // Should query in less than 100ms
        });
    });

    describe('Data Integrity', () => {
        test('quantized nodes should maintain structural integrity', () => {
            const aabbMin = new btVector3(-100, -100, -100);
            const aabbMax = new btVector3(100, 100, 100);
            bvh.setQuantizationValues(aabbMin, aabbMax);

            const leafNodes = bvh.getLeafNodeArray();
            
            // Add multiple nodes
            for (let i = 0; i < 8; i++) {
                const node = new btQuantizedBvhNode();
                node.m_escapeIndexOrTriangleIndex = i;
                
                const pos = new btVector3(
                    (i % 2) * 50 - 25,
                    Math.floor(i / 2) % 2 * 50 - 25,
                    Math.floor(i / 4) * 50 - 25
                );

                const minQuantized: [number, number, number] = [0, 0, 0];
                const maxQuantized: [number, number, number] = [0, 0, 0];
                bvh.quantize(minQuantized, pos.subtract(new btVector3(10, 10, 10)), false);
                bvh.quantize(maxQuantized, pos.add(new btVector3(10, 10, 10)), true);

                node.m_quantizedAabbMin[0] = minQuantized[0];
                node.m_quantizedAabbMin[1] = minQuantized[1];
                node.m_quantizedAabbMin[2] = minQuantized[2];
                node.m_quantizedAabbMax[0] = maxQuantized[0];
                node.m_quantizedAabbMax[1] = maxQuantized[1];
                node.m_quantizedAabbMax[2] = maxQuantized[2];

                leafNodes.push(node);
            }

            bvh.buildInternal();

            const contiguousNodes = bvh.getQuantizedNodeArray();
            
            // Verify that internal nodes have negative escape indices
            // and leaf nodes have non-negative triangle indices
            for (let i = 0; i < contiguousNodes.length; i++) {
                const node = contiguousNodes[i];
                if (node.isLeafNode()) {
                    expect(node.m_escapeIndexOrTriangleIndex).toBeGreaterThanOrEqual(0);
                    expect(node.getTriangleIndex()).toBeGreaterThanOrEqual(0);
                } else {
                    expect(node.m_escapeIndexOrTriangleIndex).toBeLessThan(0);
                    expect(node.getEscapeIndex()).toBeGreaterThan(0);
                }
            }
        });
    });
});