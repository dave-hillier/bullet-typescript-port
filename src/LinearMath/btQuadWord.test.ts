/*
Copyright (c) 2003-2006 Gino van den Bergen / Erwin Coumans  https://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btQuadWord } from './btQuadWord';

describe('btQuadWord', () => {
    describe('Constructor', () => {
        test('default constructor creates uninitialized quad word', () => {
            const q = new btQuadWord();
            expect(q).toBeDefined();
            expect(q.getFloatArray()).toHaveLength(4);
        });

        test('three argument constructor sets xyz and zeros w', () => {
            const q = new btQuadWord(1, 2, 3);
            expect(q.getX()).toBe(1);
            expect(q.getY()).toBe(2);
            expect(q.getZ()).toBe(3);
            expect(q.getW()).toBe(0);
        });

        test('four argument constructor sets all components', () => {
            const q = new btQuadWord(1, 2, 3, 4);
            expect(q.getX()).toBe(1);
            expect(q.getY()).toBe(2);
            expect(q.getZ()).toBe(3);
            expect(q.getW()).toBe(4);
        });
    });

    describe('Accessors', () => {
        test('getters return correct values', () => {
            const q = new btQuadWord(1.5, 2.5, 3.5, 4.5);
            expect(q.getX()).toBe(1.5);
            expect(q.getY()).toBe(2.5);
            expect(q.getZ()).toBe(3.5);
            expect(q.getW()).toBe(4.5);
        });

        test('short accessors return correct values', () => {
            const q = new btQuadWord(1.5, 2.5, 3.5, 4.5);
            expect(q.x()).toBe(1.5);
            expect(q.y()).toBe(2.5);
            expect(q.z()).toBe(3.5);
            expect(q.w()).toBe(4.5);
        });

        test('setters modify values correctly', () => {
            const q = new btQuadWord();
            q.setX(10);
            q.setY(20);
            q.setZ(30);
            q.setW(40);
            expect(q.getX()).toBe(10);
            expect(q.getY()).toBe(20);
            expect(q.getZ()).toBe(30);
            expect(q.getW()).toBe(40);
        });

        test('array access works correctly', () => {
            const q = new btQuadWord(1, 2, 3, 4);
            expect(q.getAt(0)).toBe(1);
            expect(q.getAt(1)).toBe(2);
            expect(q.getAt(2)).toBe(3);
            expect(q.getAt(3)).toBe(4);

            q.setAt(0, 10);
            q.setAt(1, 20);
            expect(q.getAt(0)).toBe(10);
            expect(q.getAt(1)).toBe(20);
        });
    });

    describe('setValue', () => {
        test('setValue with three arguments zeros w', () => {
            const q = new btQuadWord();
            q.setValue(1, 2, 3);
            expect(q.getX()).toBe(1);
            expect(q.getY()).toBe(2);
            expect(q.getZ()).toBe(3);
            expect(q.getW()).toBe(0);
        });

        test('setValue with four arguments sets all components', () => {
            const q = new btQuadWord();
            q.setValue(1, 2, 3, 4);
            expect(q.getX()).toBe(1);
            expect(q.getY()).toBe(2);
            expect(q.getZ()).toBe(3);
            expect(q.getW()).toBe(4);
        });
    });

    describe('Comparison', () => {
        test('equals returns true for identical quad words', () => {
            const q1 = new btQuadWord(1, 2, 3, 4);
            const q2 = new btQuadWord(1, 2, 3, 4);
            expect(q1.equals(q2)).toBe(true);
        });

        test('equals returns false for different quad words', () => {
            const q1 = new btQuadWord(1, 2, 3, 4);
            const q2 = new btQuadWord(1, 2, 3, 5);
            expect(q1.equals(q2)).toBe(false);
        });

        test('notEquals returns false for identical quad words', () => {
            const q1 = new btQuadWord(1, 2, 3, 4);
            const q2 = new btQuadWord(1, 2, 3, 4);
            expect(q1.notEquals(q2)).toBe(false);
        });

        test('notEquals returns true for different quad words', () => {
            const q1 = new btQuadWord(1, 2, 3, 4);
            const q2 = new btQuadWord(1, 2, 3, 5);
            expect(q1.notEquals(q2)).toBe(true);
        });
    });

    describe('Min/Max operations', () => {
        test('setMax sets each component to maximum', () => {
            const q1 = new btQuadWord(1, 5, 2, 8);
            const q2 = new btQuadWord(3, 2, 6, 4);
            q1.setMax(q2);
            expect(q1.getX()).toBe(3); // max(1, 3)
            expect(q1.getY()).toBe(5); // max(5, 2)
            expect(q1.getZ()).toBe(6); // max(2, 6)
            expect(q1.getW()).toBe(8); // max(8, 4)
        });

        test('setMin sets each component to minimum', () => {
            const q1 = new btQuadWord(1, 5, 2, 8);
            const q2 = new btQuadWord(3, 2, 6, 4);
            q1.setMin(q2);
            expect(q1.getX()).toBe(1); // min(1, 3)
            expect(q1.getY()).toBe(2); // min(5, 2)
            expect(q1.getZ()).toBe(2); // min(2, 6)
            expect(q1.getW()).toBe(4); // min(8, 4)
        });
    });

    describe('Clone and Copy', () => {
        test('clone creates a new instance with same values', () => {
            const q1 = new btQuadWord(1, 2, 3, 4);
            const q2 = q1.clone();
            expect(q2.equals(q1)).toBe(true);
            expect(q2).not.toBe(q1); // Different instances
            
            // Modifying clone shouldn't affect original
            q2.setX(10);
            expect(q1.getX()).toBe(1);
            expect(q2.getX()).toBe(10);
        });

        test('copy copies values from another quad word', () => {
            const q1 = new btQuadWord(1, 2, 3, 4);
            const q2 = new btQuadWord();
            q2.copy(q1);
            expect(q2.equals(q1)).toBe(true);
            
            // Modifying source shouldn't affect copy
            q1.setX(10);
            expect(q1.getX()).toBe(10);
            expect(q2.getX()).toBe(1);
        });
    });

    describe('Array access', () => {
        test('getFloatArray returns internal array', () => {
            const q = new btQuadWord(1, 2, 3, 4);
            const arr = q.getFloatArray();
            expect(arr).toEqual([1, 2, 3, 4]);
            
            // Modifying the returned array should affect the original
            arr[0] = 10;
            expect(q.getX()).toBe(10);
        });

        test('getFloatArrayConst returns readonly array', () => {
            const q = new btQuadWord(1, 2, 3, 4);
            const arr = q.getFloatArrayConst();
            expect(arr).toEqual([1, 2, 3, 4]);
        });
    });

    describe('toString', () => {
        test('toString returns formatted string representation', () => {
            const q = new btQuadWord(1, 2, 3, 4);
            expect(q.toString()).toBe('[1, 2, 3, 4]');
        });

        test('toString handles floating point numbers', () => {
            const q = new btQuadWord(1.5, 2.25, 3.75, 4.125);
            expect(q.toString()).toBe('[1.5, 2.25, 3.75, 4.125]');
        });
    });
});