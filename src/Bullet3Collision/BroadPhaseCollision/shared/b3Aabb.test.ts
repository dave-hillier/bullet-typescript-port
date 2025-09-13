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
 * Unit tests for b3Aabb TypeScript port
 */

import { 
    b3Aabb,
    b3TransformAabb2,
    b3TestAabbAgainstAabb,
    b3MakeAabb,
    b3AabbGetCenter,
    b3AabbGetExtent,
    b3AabbExpand,
    b3Quat
} from './b3Aabb';
import { b3Float4, b3MakeFloat4 } from '../../../Bullet3Common/shared/b3Float4';

describe('b3Aabb', () => {
    describe('Constructor and basic operations', () => {
        it('should create empty AABB with default constructor', () => {
            const aabb = new b3Aabb();
            expect(aabb.m_minVec.x).toBe(0);
            expect(aabb.m_minVec.y).toBe(0);
            expect(aabb.m_minVec.z).toBe(0);
            expect(aabb.m_maxVec.x).toBe(0);
            expect(aabb.m_maxVec.y).toBe(0);
            expect(aabb.m_maxVec.z).toBe(0);
        });

        it('should create AABB with specified bounds', () => {
            const min = b3MakeFloat4(-1, -2, -3, 0);
            const max = b3MakeFloat4(1, 2, 3, 0);
            const aabb = new b3Aabb(min, max);
            
            expect(aabb.m_minVec.x).toBe(-1);
            expect(aabb.m_minVec.y).toBe(-2);
            expect(aabb.m_minVec.z).toBe(-3);
            expect(aabb.m_maxVec.x).toBe(1);
            expect(aabb.m_maxVec.y).toBe(2);
            expect(aabb.m_maxVec.z).toBe(3);
        });

        it('should clone correctly', () => {
            const min = b3MakeFloat4(-1, -2, -3, 0);
            const max = b3MakeFloat4(1, 2, 3, 0);
            const original = new b3Aabb(min, max);
            const cloned = original.clone();
            
            expect(cloned.m_minVec.x).toBe(original.m_minVec.x);
            expect(cloned.m_minVec.y).toBe(original.m_minVec.y);
            expect(cloned.m_minVec.z).toBe(original.m_minVec.z);
            expect(cloned.m_maxVec.x).toBe(original.m_maxVec.x);
            expect(cloned.m_maxVec.y).toBe(original.m_maxVec.y);
            expect(cloned.m_maxVec.z).toBe(original.m_maxVec.z);
            
            // Ensure they are separate objects
            expect(cloned).not.toBe(original);
            expect(cloned.m_minVec).not.toBe(original.m_minVec);
            expect(cloned.m_maxVec).not.toBe(original.m_maxVec);
        });
    });

    describe('Point containment', () => {
        it('should correctly test point containment', () => {
            const min = b3MakeFloat4(-1, -1, -1, 0);
            const max = b3MakeFloat4(1, 1, 1, 0);
            const aabb = new b3Aabb(min, max);
            
            // Points inside
            expect(aabb.contains(b3MakeFloat4(0, 0, 0, 0))).toBe(true);
            expect(aabb.contains(b3MakeFloat4(0.5, 0.5, 0.5, 0))).toBe(true);
            expect(aabb.contains(b3MakeFloat4(-0.5, -0.5, -0.5, 0))).toBe(true);
            
            // Points on boundary (should be included)
            expect(aabb.contains(b3MakeFloat4(1, 1, 1, 0))).toBe(true);
            expect(aabb.contains(b3MakeFloat4(-1, -1, -1, 0))).toBe(true);
            
            // Points outside
            expect(aabb.contains(b3MakeFloat4(2, 0, 0, 0))).toBe(false);
            expect(aabb.contains(b3MakeFloat4(0, 2, 0, 0))).toBe(false);
            expect(aabb.contains(b3MakeFloat4(0, 0, 2, 0))).toBe(false);
            expect(aabb.contains(b3MakeFloat4(-2, 0, 0, 0))).toBe(false);
        });
    });

    describe('AABB utility functions', () => {
        it('should calculate center correctly', () => {
            const aabb = b3MakeAabb(
                b3MakeFloat4(-2, -4, -6, 0),
                b3MakeFloat4(2, 4, 6, 0)
            );
            const center = b3AabbGetCenter(aabb);
            
            expect(center.x).toBe(0);
            expect(center.y).toBe(0);
            expect(center.z).toBe(0);
        });

        it('should calculate extent correctly', () => {
            const aabb = b3MakeAabb(
                b3MakeFloat4(-2, -4, -6, 0),
                b3MakeFloat4(2, 4, 6, 0)
            );
            const extent = b3AabbGetExtent(aabb);
            
            expect(extent.x).toBe(2);
            expect(extent.y).toBe(4);
            expect(extent.z).toBe(6);
        });

        it('should expand AABB correctly', () => {
            const original = b3MakeAabb(
                b3MakeFloat4(-1, -1, -1, 0),
                b3MakeFloat4(1, 1, 1, 0)
            );
            const expanded = b3AabbExpand(original, 0.5);
            
            expect(expanded.m_minVec.x).toBe(-1.5);
            expect(expanded.m_minVec.y).toBe(-1.5);
            expect(expanded.m_minVec.z).toBe(-1.5);
            expect(expanded.m_maxVec.x).toBe(1.5);
            expect(expanded.m_maxVec.y).toBe(1.5);
            expect(expanded.m_maxVec.z).toBe(1.5);
        });
    });
    
    describe('AABB overlap testing', () => {
        it('should detect overlapping AABBs', () => {
            const min1 = b3MakeFloat4(-1, -1, -1, 0);
            const max1 = b3MakeFloat4(1, 1, 1, 0);
            const min2 = b3MakeFloat4(0, 0, 0, 0);
            const max2 = b3MakeFloat4(2, 2, 2, 0);
            
            expect(b3TestAabbAgainstAabb(min1, max1, min2, max2)).toBe(true);
        });

        it('should detect non-overlapping AABBs', () => {
            const min1 = b3MakeFloat4(-2, -2, -2, 0);
            const max1 = b3MakeFloat4(-1, -1, -1, 0);
            const min2 = b3MakeFloat4(1, 1, 1, 0);
            const max2 = b3MakeFloat4(2, 2, 2, 0);
            
            expect(b3TestAabbAgainstAabb(min1, max1, min2, max2)).toBe(false);
        });

        it('should detect touching AABBs as overlapping', () => {
            const min1 = b3MakeFloat4(-1, -1, -1, 0);
            const max1 = b3MakeFloat4(0, 0, 0, 0);
            const min2 = b3MakeFloat4(0, 0, 0, 0);
            const max2 = b3MakeFloat4(1, 1, 1, 0);
            
            expect(b3TestAabbAgainstAabb(min1, max1, min2, max2)).toBe(true);
        });

        it('should detect separation on single axis', () => {
            // Separated on X axis
            const min1 = b3MakeFloat4(-2, -1, -1, 0);
            const max1 = b3MakeFloat4(-1, 1, 1, 0);
            const min2 = b3MakeFloat4(1, -1, -1, 0);
            const max2 = b3MakeFloat4(2, 1, 1, 0);
            
            expect(b3TestAabbAgainstAabb(min1, max1, min2, max2)).toBe(false);
            
            // Separated on Y axis
            const min3 = b3MakeFloat4(-1, -2, -1, 0);
            const max3 = b3MakeFloat4(1, -1, 1, 0);
            const min4 = b3MakeFloat4(-1, 1, -1, 0);
            const max4 = b3MakeFloat4(1, 2, 1, 0);
            
            expect(b3TestAabbAgainstAabb(min3, max3, min4, max4)).toBe(false);
            
            // Separated on Z axis
            const min5 = b3MakeFloat4(-1, -1, -2, 0);
            const max5 = b3MakeFloat4(1, 1, -1, 0);
            const min6 = b3MakeFloat4(-1, -1, 1, 0);
            const max6 = b3MakeFloat4(1, 1, 2, 0);
            
            expect(b3TestAabbAgainstAabb(min5, max5, min6, max6)).toBe(false);
        });
    });

    describe('AABB transformation', () => {
        it('should transform AABB with identity transform', () => {
            const localMin = b3MakeFloat4(-1, -1, -1, 0);
            const localMax = b3MakeFloat4(1, 1, 1, 0);
            const pos = b3MakeFloat4(0, 0, 0, 0);
            const orn: b3Quat = { x: 0, y: 0, z: 0, w: 1 }; // Identity quaternion
            const margin = 0;
            
            const aabbMin = new b3Float4();
            const aabbMax = new b3Float4();
            
            b3TransformAabb2(localMin, localMax, margin, pos, orn, aabbMin, aabbMax);
            
            expect(aabbMin.x).toBeCloseTo(-1);
            expect(aabbMin.y).toBeCloseTo(-1);
            expect(aabbMin.z).toBeCloseTo(-1);
            expect(aabbMax.x).toBeCloseTo(1);
            expect(aabbMax.y).toBeCloseTo(1);
            expect(aabbMax.z).toBeCloseTo(1);
        });

        it('should transform AABB with translation', () => {
            const localMin = b3MakeFloat4(-1, -1, -1, 0);
            const localMax = b3MakeFloat4(1, 1, 1, 0);
            const pos = b3MakeFloat4(5, 10, 15, 0);
            const orn: b3Quat = { x: 0, y: 0, z: 0, w: 1 }; // Identity quaternion
            const margin = 0;
            
            const aabbMin = new b3Float4();
            const aabbMax = new b3Float4();
            
            b3TransformAabb2(localMin, localMax, margin, pos, orn, aabbMin, aabbMax);
            
            expect(aabbMin.x).toBeCloseTo(4);  // 5 - 1
            expect(aabbMin.y).toBeCloseTo(9);  // 10 - 1
            expect(aabbMin.z).toBeCloseTo(14); // 15 - 1
            expect(aabbMax.x).toBeCloseTo(6);  // 5 + 1
            expect(aabbMax.y).toBeCloseTo(11); // 10 + 1
            expect(aabbMax.z).toBeCloseTo(16); // 15 + 1
        });

        it('should transform AABB with margin', () => {
            const localMin = b3MakeFloat4(-1, -1, -1, 0);
            const localMax = b3MakeFloat4(1, 1, 1, 0);
            const pos = b3MakeFloat4(0, 0, 0, 0);
            const orn: b3Quat = { x: 0, y: 0, z: 0, w: 1 }; // Identity quaternion  
            const margin = 0.5;
            
            const aabbMin = new b3Float4();
            const aabbMax = new b3Float4();
            
            b3TransformAabb2(localMin, localMax, margin, pos, orn, aabbMin, aabbMax);
            
            expect(aabbMin.x).toBeCloseTo(-1.5); // -1 - 0.5
            expect(aabbMin.y).toBeCloseTo(-1.5); // -1 - 0.5
            expect(aabbMin.z).toBeCloseTo(-1.5); // -1 - 0.5
            expect(aabbMax.x).toBeCloseTo(1.5);  // 1 + 0.5
            expect(aabbMax.y).toBeCloseTo(1.5);  // 1 + 0.5
            expect(aabbMax.z).toBeCloseTo(1.5);  // 1 + 0.5
        });
    });
});