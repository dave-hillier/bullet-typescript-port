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
 * Dispatcher information structure containing settings and state for collision detection
 */
export class btDispatcherInfo {
    constructor() {
        this.m_timeStep = 0.0;
        this.m_stepCount = 0;
        this.m_dispatchFunc = btDispatcherInfo.DispatchFunc.DISPATCH_DISCRETE;
        this.m_timeOfImpact = 1.0;
        this.m_useContinuous = true;
        this.m_debugDraw = null;
        this.m_enableSatConvex = false;
        this.m_enableSPU = true;
        this.m_useEpa = true;
        this.m_allowedCcdPenetration = 0.04;
        this.m_useConvexConservativeDistanceUtil = false;
        this.m_convexConservativeDistanceThreshold = 0.0;
        this.m_deterministicOverlappingPairs = false;
    }
}
btDispatcherInfo.DispatchFunc = {
    DISPATCH_DISCRETE: 1,
    DISPATCH_CONTINUOUS: 2
};
/**
 * Enumeration for dispatcher query types
 */
export var ebtDispatcherQueryType;
(function (ebtDispatcherQueryType) {
    ebtDispatcherQueryType[ebtDispatcherQueryType["BT_CONTACT_POINT_ALGORITHMS"] = 1] = "BT_CONTACT_POINT_ALGORITHMS";
    ebtDispatcherQueryType[ebtDispatcherQueryType["BT_CLOSEST_POINT_ALGORITHMS"] = 2] = "BT_CLOSEST_POINT_ALGORITHMS";
})(ebtDispatcherQueryType || (ebtDispatcherQueryType = {}));
/**
 * The btDispatcher interface class can be used in combination with broadphase to dispatch calculations for overlapping pairs.
 * For example for pairwise collision detection, calculating contact points stored in btPersistentManifold or user callbacks (game logic).
 */
export class btDispatcher {
}
