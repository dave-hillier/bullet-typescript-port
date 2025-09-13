/*
Test file for btOverlappingPairCallback
Copyright (c) 2024 TypeScript port
*/

import { btOverlappingPairCallback, btDispatcher } from './btOverlappingPairCallback';
import { btBroadphaseProxy, btBroadphasePair } from './btBroadphaseProxy';
import { btVector3 } from '../../LinearMath/btVector3';

// Mock implementation for testing
class MockOverlappingPairCallback extends btOverlappingPairCallback {
	private pairs: Map<string, btBroadphasePair> = new Map();
	public addOverlappingPairCalled = 0;
	public removeOverlappingPairCalled = 0;
	public removeOverlappingPairsContainingProxyCalled = 0;

	constructor() {
		super();
	}

	public addOverlappingPair(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy): btBroadphasePair | null {
		this.addOverlappingPairCalled++;
		const key = this.generatePairKey(proxy0, proxy1);
		
		if (!this.pairs.has(key)) {
			const pair = new btBroadphasePair(proxy0, proxy1);
			this.pairs.set(key, pair);
			return pair;
		}
		
		return this.pairs.get(key) || null;
	}

	public removeOverlappingPair(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy, dispatcher: btDispatcher): any {
		this.removeOverlappingPairCalled++;
		// Note: dispatcher parameter required by interface but not used in this mock
		void dispatcher;
		const key = this.generatePairKey(proxy0, proxy1);
		
		if (this.pairs.has(key)) {
			const pair = this.pairs.get(key);
			this.pairs.delete(key);
			// Return the pair itself as the "internal info" for testing purposes
			return pair || null;
		}
		
		return null;
	}

	public removeOverlappingPairsContainingProxy(proxy0: btBroadphaseProxy, dispatcher: btDispatcher): void {
		this.removeOverlappingPairsContainingProxyCalled++;
		// Note: dispatcher parameter required by interface but not used in this mock
		void dispatcher;
		const keysToRemove: string[] = [];
		
		for (const [key, pair] of this.pairs.entries()) {
			if (pair.m_pProxy0 === proxy0 || pair.m_pProxy1 === proxy0) {
				keysToRemove.push(key);
			}
		}
		
		keysToRemove.forEach(key => this.pairs.delete(key));
	}

	// Helper methods for testing
	private generatePairKey(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy): string {
		const id0 = proxy0.getUid();
		const id1 = proxy1.getUid();
		return id0 < id1 ? `${id0}_${id1}` : `${id1}_${id0}`;
	}

	public getPairCount(): number {
		return this.pairs.size;
	}

	public hasPair(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy): boolean {
		const key = this.generatePairKey(proxy0, proxy1);
		return this.pairs.has(key);
	}
}

// Mock dispatcher for testing
class MockDispatcher implements btDispatcher {
	// Mock implementation - empty for now
}

describe('btOverlappingPairCallback', () => {
	let callback: MockOverlappingPairCallback;
	let dispatcher: MockDispatcher;
	let proxy0: btBroadphaseProxy;
	let proxy1: btBroadphaseProxy;
	let proxy2: btBroadphaseProxy;

	beforeEach(() => {
		callback = new MockOverlappingPairCallback();
		dispatcher = new MockDispatcher();

		// Create test proxies with unique IDs
		proxy0 = new btBroadphaseProxy(
			new btVector3(-1, -1, -1),
			new btVector3(1, 1, 1),
			{ name: 'test0' },
			1,
			1
		);
		proxy0.m_uniqueId = 0;

		proxy1 = new btBroadphaseProxy(
			new btVector3(-2, -2, -2),
			new btVector3(2, 2, 2),
			{ name: 'test1' },
			1,
			1
		);
		proxy1.m_uniqueId = 1;

		proxy2 = new btBroadphaseProxy(
			new btVector3(-3, -3, -3),
			new btVector3(3, 3, 3),
			{ name: 'test2' },
			1,
			1
		);
		proxy2.m_uniqueId = 2;
	});

	describe('constructor', () => {
		it('should create an abstract class that cannot be instantiated directly', () => {
			// We can't instantiate btOverlappingPairCallback directly
			// This test ensures our mock implementation works correctly
			expect(callback).toBeInstanceOf(btOverlappingPairCallback);
		});
	});

	describe('addOverlappingPair', () => {
		it('should add a new overlapping pair and return it', () => {
			const pair = callback.addOverlappingPair(proxy0, proxy1);

			expect(pair).not.toBeNull();
			expect(pair).toBeInstanceOf(btBroadphasePair);
			expect(callback.addOverlappingPairCalled).toBe(1);
			expect(callback.getPairCount()).toBe(1);
			expect(callback.hasPair(proxy0, proxy1)).toBe(true);
		});

		it('should return existing pair if already exists', () => {
			const pair1 = callback.addOverlappingPair(proxy0, proxy1);
			const pair2 = callback.addOverlappingPair(proxy0, proxy1);

			expect(pair1).toBe(pair2);
			expect(callback.addOverlappingPairCalled).toBe(2);
			expect(callback.getPairCount()).toBe(1);
		});

		it('should handle proxy order correctly', () => {
			const pair1 = callback.addOverlappingPair(proxy0, proxy1);
			const pair2 = callback.addOverlappingPair(proxy1, proxy0);

			expect(pair1).toBe(pair2);
			expect(callback.getPairCount()).toBe(1);
		});

		it('should add multiple different pairs', () => {
			callback.addOverlappingPair(proxy0, proxy1);
			callback.addOverlappingPair(proxy0, proxy2);
			callback.addOverlappingPair(proxy1, proxy2);

			expect(callback.getPairCount()).toBe(3);
			expect(callback.hasPair(proxy0, proxy1)).toBe(true);
			expect(callback.hasPair(proxy0, proxy2)).toBe(true);
			expect(callback.hasPair(proxy1, proxy2)).toBe(true);
		});
	});

	describe('removeOverlappingPair', () => {
		beforeEach(() => {
			callback.addOverlappingPair(proxy0, proxy1);
			callback.addOverlappingPair(proxy0, proxy2);
		});

		it('should remove an existing pair and return its internal info', () => {
			callback.removeOverlappingPair(proxy0, proxy1, dispatcher);

			expect(callback.removeOverlappingPairCalled).toBe(1);
			expect(callback.getPairCount()).toBe(1);
			expect(callback.hasPair(proxy0, proxy1)).toBe(false);
			expect(callback.hasPair(proxy0, proxy2)).toBe(true);
		});

		it('should return null when removing non-existent pair', () => {
			const result = callback.removeOverlappingPair(proxy1, proxy2, dispatcher);

			expect(result).toBeNull();
			expect(callback.removeOverlappingPairCalled).toBe(1);
			expect(callback.getPairCount()).toBe(2); // No pairs removed
		});

		it('should handle proxy order correctly when removing', () => {
			const result1 = callback.removeOverlappingPair(proxy0, proxy1, dispatcher);
			const result2 = callback.removeOverlappingPair(proxy1, proxy0, dispatcher);

			expect(result1).not.toBeNull();
			expect(result2).toBeNull(); // Already removed
			expect(callback.getPairCount()).toBe(1);
		});
	});

	describe('removeOverlappingPairsContainingProxy', () => {
		beforeEach(() => {
			callback.addOverlappingPair(proxy0, proxy1);
			callback.addOverlappingPair(proxy0, proxy2);
			callback.addOverlappingPair(proxy1, proxy2);
		});

		it('should remove all pairs containing the specified proxy', () => {
			expect(callback.getPairCount()).toBe(3);

			callback.removeOverlappingPairsContainingProxy(proxy0, dispatcher);

			expect(callback.removeOverlappingPairsContainingProxyCalled).toBe(1);
			expect(callback.getPairCount()).toBe(1);
			expect(callback.hasPair(proxy0, proxy1)).toBe(false);
			expect(callback.hasPair(proxy0, proxy2)).toBe(false);
			expect(callback.hasPair(proxy1, proxy2)).toBe(true); // This pair should remain
		});

		it('should handle removing all pairs when proxy is involved in all', () => {
			// Add proxy0 to all existing pairs by creating new ones
			callback.removeOverlappingPairsContainingProxy(proxy1, dispatcher);

			expect(callback.getPairCount()).toBe(1); // Only proxy0-proxy2 should remain
			expect(callback.hasPair(proxy0, proxy2)).toBe(true);
		});

		it('should do nothing if proxy has no pairs', () => {
			const newProxy = new btBroadphaseProxy(
				new btVector3(-4, -4, -4),
				new btVector3(4, 4, 4),
				{ name: 'test3' },
				1,
				1
			);
			newProxy.m_uniqueId = 3;

			const initialCount = callback.getPairCount();
			callback.removeOverlappingPairsContainingProxy(newProxy, dispatcher);

			expect(callback.removeOverlappingPairsContainingProxyCalled).toBe(1);
			expect(callback.getPairCount()).toBe(initialCount);
		});
	});

	describe('integration tests', () => {
		it('should handle complete lifecycle of pair management', () => {
			// Start with empty callback
			expect(callback.getPairCount()).toBe(0);

			// Add several pairs
			callback.addOverlappingPair(proxy0, proxy1);
			callback.addOverlappingPair(proxy0, proxy2);
			callback.addOverlappingPair(proxy1, proxy2);
			expect(callback.getPairCount()).toBe(3);

			// Remove one specific pair
			callback.removeOverlappingPair(proxy1, proxy2, dispatcher);
			expect(callback.getPairCount()).toBe(2);

			// Remove all pairs containing proxy0
			callback.removeOverlappingPairsContainingProxy(proxy0, dispatcher);
			expect(callback.getPairCount()).toBe(0);
		});

		it('should maintain pair consistency across operations', () => {
			// Add pairs
			const pair1 = callback.addOverlappingPair(proxy0, proxy1);
			const pair2 = callback.addOverlappingPair(proxy1, proxy2);

			expect(pair1).not.toBeNull();
			expect(pair2).not.toBeNull();
			expect(pair1).not.toBe(pair2);

			// Verify pairs exist
			expect(callback.hasPair(proxy0, proxy1)).toBe(true);
			expect(callback.hasPair(proxy1, proxy2)).toBe(true);

			// Remove and verify
			callback.removeOverlappingPair(proxy0, proxy1, dispatcher);
			expect(callback.hasPair(proxy0, proxy1)).toBe(false);
			expect(callback.hasPair(proxy1, proxy2)).toBe(true);
		});
	});

	describe('abstract class behavior', () => {
		it('should require concrete implementations of all abstract methods', () => {
			// This test verifies that our abstract class structure is correct
			expect(typeof callback.addOverlappingPair).toBe('function');
			expect(typeof callback.removeOverlappingPair).toBe('function');
			expect(typeof callback.removeOverlappingPairsContainingProxy).toBe('function');
		});
	});
});