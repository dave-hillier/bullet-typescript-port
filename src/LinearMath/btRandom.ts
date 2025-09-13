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

/**
 * TypeScript port of Bullet3's btRandom.h
 * Provides random number generation utilities for the physics engine
 */

/**
 * Maximum value that can be returned by GEN_rand()
 * Using JavaScript's safe integer limit as the maximum value
 */
export const GEN_RAND_MAX = 0x7FFFFFFF; // 2^31 - 1

/**
 * Internal random number generator state
 * Uses a simple Linear Congruential Generator (LCG) for deterministic results
 */
class RandomGenerator {
    private seed: number = 1;

    /**
     * Set the random seed
     * @param newSeed The seed value for the random number generator
     */
    setSeed(newSeed: number): void {
        this.seed = Math.abs(Math.floor(newSeed)) || 1;
    }

    /**
     * Generate the next random number using LCG algorithm
     * Uses the same constants as many standard library implementations
     * @returns A random integer between 0 and GEN_RAND_MAX
     */
    next(): number {
        // Linear Congruential Generator: (a * seed + c) mod m
        // Using constants from Numerical Recipes and glibc
        this.seed = (this.seed * 1103515245 + 12345) & 0x7FFFFFFF;
        return this.seed;
    }
}

// Global random number generator instance
const globalRng = new RandomGenerator();

/**
 * Seed the random number generator
 * @param seed The seed value for deterministic random number generation
 */
export function GEN_srand(seed: number): void {
    globalRng.setSeed(seed);
}

/**
 * Generate a random integer between 0 and GEN_RAND_MAX
 * @returns A random integer in the range [0, GEN_RAND_MAX]
 */
export function GEN_rand(): number {
    return globalRng.next();
}

/**
 * Generate a random floating-point number between 0.0 and 1.0
 * @returns A random number in the range [0.0, 1.0]
 */
export function btRandFloat(): number {
    return GEN_rand() / GEN_RAND_MAX;
}

/**
 * Generate a random floating-point number in a specified range
 * @param min The minimum value (inclusive)
 * @param max The maximum value (inclusive)
 * @returns A random number in the range [min, max]
 */
export function btRandRange(min: number, max: number): number {
    return min + (max - min) * btRandFloat();
}

/**
 * Generate a random integer in a specified range
 * @param min The minimum value (inclusive)
 * @param max The maximum value (exclusive)
 * @returns A random integer in the range [min, max)
 */
export function btRandInt(min: number, max: number): number {
    return Math.floor(min + (max - min) * btRandFloat());
}

/**
 * Generate a random floating-point number with normal (Gaussian) distribution
 * Uses the Box-Muller transform to convert uniform random numbers to normal distribution
 * @param mean The mean of the distribution (default: 0.0)
 * @param standardDeviation The standard deviation of the distribution (default: 1.0)
 * @returns A random number from the normal distribution
 */
export function btRandNormal(mean: number = 0.0, standardDeviation: number = 1.0): number {
    // Box-Muller transform
    // We generate two normal random variables but only return one
    // This could be optimized to cache the second value for the next call
    let u1: number, u2: number;
    
    do {
        u1 = btRandFloat();
    } while (u1 <= Number.EPSILON); // Ensure u1 > 0
    
    u2 = btRandFloat();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + standardDeviation * z0;
}

/**
 * Generate a random unit vector on the unit sphere (3D)
 * Uses Marsaglia's method for uniform distribution on sphere
 * @returns An array of 3 numbers representing a unit vector [x, y, z]
 */
export function btRandUnitVector3(): [number, number, number] {
    let x1: number, x2: number, w: number;
    
    // Generate random point in unit circle
    do {
        x1 = 2.0 * btRandFloat() - 1.0;
        x2 = 2.0 * btRandFloat() - 1.0;
        w = x1 * x1 + x2 * x2;
    } while (w >= 1.0 || w === 0.0);
    
    const multiplier = Math.sqrt(-2.0 * Math.log(w) / w);
    const y1 = x1 * multiplier;
    const y2 = x2 * multiplier;
    
    // Generate third coordinate
    const y3 = btRandNormal();
    
    // Normalize the vector
    const length = Math.sqrt(y1 * y1 + y2 * y2 + y3 * y3);
    return [y1 / length, y2 / length, y3 / length];
}

/**
 * Generate a random unit vector on the unit circle (2D)
 * @returns An array of 2 numbers representing a unit vector [x, y]
 */
export function btRandUnitVector2(): [number, number] {
    const angle = btRandRange(0.0, 2.0 * Math.PI);
    return [Math.cos(angle), Math.sin(angle)];
}

/**
 * Generate a random boolean value
 * @param probability The probability of returning true (default: 0.5)
 * @returns true or false based on the given probability
 */
export function btRandBool(probability: number = 0.5): boolean {
    return btRandFloat() < probability;
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 * @param array The array to shuffle
 */
export function btShuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = btRandInt(0, i + 1);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

/**
 * Select a random element from an array
 * @param array The array to select from
 * @returns A random element from the array, or undefined if array is empty
 */
export function btRandChoice<T>(array: T[]): T | undefined {
    if (array.length === 0) {
        return undefined;
    }
    const index = btRandInt(0, array.length);
    return array[index];
}