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

import { btBroadphaseProxy, btBroadphasePair } from './btBroadphaseProxy';

// Forward declaration for btDispatcher
export interface btDispatcher {
	// Interface placeholder - will be defined when porting collision dispatch system
}

/**
 * The btOverlappingPairCallback class is an additional optional broadphase user callback 
 * for adding/removing overlapping pairs, similar interface to btOverlappingPairCache.
 */
export abstract class btOverlappingPairCallback {
	protected constructor() {
		// Protected constructor to prevent direct instantiation
	}

	/**
	 * Add an overlapping pair between two broadphase proxies.
	 * @param proxy0 First broadphase proxy
	 * @param proxy1 Second broadphase proxy
	 * @returns The created broadphase pair or null if creation failed
	 */
	public abstract addOverlappingPair(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy): btBroadphasePair | null;

	/**
	 * Remove an overlapping pair between two broadphase proxies.
	 * @param proxy0 First broadphase proxy
	 * @param proxy1 Second broadphase proxy
	 * @param dispatcher Dispatcher instance for collision processing
	 * @returns Internal data associated with the removed pair, or null if not found
	 */
	public abstract removeOverlappingPair(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy, dispatcher: btDispatcher): any;

	/**
	 * Remove all overlapping pairs containing the specified proxy.
	 * @param proxy0 Broadphase proxy whose pairs should be removed
	 * @param dispatcher Dispatcher instance for collision processing
	 */
	public abstract removeOverlappingPairsContainingProxy(proxy0: btBroadphaseProxy, dispatcher: btDispatcher): void;
}