/*
Copyright (c) 2003-2014 Erwin Coumans  http://bullet.googlecode.com

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
 * TypeScript port of Bullet3's btThreads.h
 * 
 * This port adapts C++ threading concepts to JavaScript's concurrency model:
 * - JavaScript is single-threaded with an event loop, but supports async operations
 * - Web Workers/Worker Threads can be used for true parallelism where available
 * - Promises and async/await replace traditional threading primitives
 * - Mutexes are simplified since JavaScript's main thread execution is atomic
 */


// Maximum thread count - reduced for JavaScript context
export const BT_MAX_THREAD_COUNT = 16;

// Thread state tracking for compatibility
let currentThreadIndex = 0;
let isMainThread = true;
let threadsRunning = false;

/**
 * Check if we're running on the main thread
 */
export function btIsMainThread(): boolean {
    return isMainThread;
}

/**
 * Check if worker threads are currently running
 */
export function btThreadsAreRunning(): boolean {
    return threadsRunning;
}

/**
 * Get current thread index (simulated for single-threaded JavaScript)
 */
export function btGetCurrentThreadIndex(): number {
    return currentThreadIndex;
}

/**
 * Reset thread index counter
 */
export function btResetThreadIndexCounter(): void {
    currentThreadIndex = 0;
    threadsRunning = false;
}

/**
 * btSpinMutex - Simplified mutex for JavaScript
 * 
 * In JavaScript's single-threaded main thread, this is mostly ceremonial,
 * but it maintains API compatibility and can be useful with Web Workers.
 */
export class btSpinMutex {
    private locked = false;
    private lockPromise: Promise<void> | null = null;
    private resolveLock: (() => void) | null = null;

    constructor() {
        this.locked = false;
        this.lockPromise = null;
        this.resolveLock = null;
    }

    /**
     * Acquire the lock (async in JavaScript context)
     */
    async lock(): Promise<void> {
        while (this.locked) {
            if (this.lockPromise) {
                await this.lockPromise;
            }
        }
        
        this.locked = true;
        this.lockPromise = new Promise<void>((resolve) => {
            this.resolveLock = resolve;
        });
    }

    /**
     * Release the lock
     */
    unlock(): void {
        if (this.locked) {
            this.locked = false;
            if (this.resolveLock) {
                this.resolveLock();
                this.resolveLock = null;
            }
            this.lockPromise = null;
        }
    }

    /**
     * Try to acquire lock without blocking
     */
    tryLock(): boolean {
        if (!this.locked) {
            this.locked = true;
            this.lockPromise = new Promise<void>((resolve) => {
                this.resolveLock = resolve;
            });
            return true;
        }
        return false;
    }
}

/**
 * Mutex utility functions - simplified for JavaScript context
 */
export function btMutexLock(mutex: btSpinMutex): Promise<void> {
    return mutex.lock();
}

export function btMutexUnlock(mutex: btSpinMutex): void {
    mutex.unlock();
}

export function btMutexTryLock(mutex: btSpinMutex): boolean {
    return mutex.tryLock();
}

/**
 * Interface for parallel work bodies
 */
export interface btIParallelForBody {
    forLoop(iBegin: number, iEnd: number): void | Promise<void>;
}

/**
 * Interface for parallel sum operations
 */
export interface btIParallelSumBody {
    sumLoop(iBegin: number, iEnd: number): number | Promise<number>;
}

/**
 * Task scheduler interface - adapted for JavaScript async patterns
 */
export abstract class btITaskScheduler {
    protected m_name: string;
    protected m_savedThreadCounter: number;
    public m_isActive: boolean;

    constructor(name: string) {
        this.m_name = name;
        this.m_savedThreadCounter = 0;
        this.m_isActive = false;
    }

    getName(): string {
        return this.m_name;
    }

    abstract getMaxNumThreads(): number;
    abstract getNumThreads(): number;
    abstract setNumThreads(numThreads: number): void;
    abstract parallelFor(iBegin: number, iEnd: number, grainSize: number, body: btIParallelForBody): Promise<void>;
    abstract parallelSum(iBegin: number, iEnd: number, grainSize: number, body: btIParallelSumBody): Promise<number>;

    /**
     * Hint that worker threads may not be used for a while
     */
    sleepWorkerThreadsHint(): void {
        // No-op in JavaScript context
    }

    /**
     * Activate the task scheduler
     */
    activate(): void {
        this.m_savedThreadCounter = currentThreadIndex;
        this.m_isActive = true;
        threadsRunning = true;
    }

    /**
     * Deactivate the task scheduler
     */
    deactivate(): void {
        currentThreadIndex = this.m_savedThreadCounter;
        this.m_isActive = false;
        threadsRunning = false;
    }
}

/**
 * Sequential task scheduler - executes tasks in order on main thread
 */
class btSequentialTaskScheduler extends btITaskScheduler {
    constructor() {
        super("Sequential");
    }

    getMaxNumThreads(): number {
        return 1;
    }

    getNumThreads(): number {
        return 1;
    }

    setNumThreads(_numThreads: number): void {
        // Cannot change thread count for sequential scheduler
    }

    async parallelFor(iBegin: number, iEnd: number, grainSize: number, body: btIParallelForBody): Promise<void> {
        // Execute sequentially in chunks
        for (let i = iBegin; i < iEnd; i += grainSize) {
            const chunkEnd = Math.min(i + grainSize, iEnd);
            const result = body.forLoop(i, chunkEnd);
            if (result instanceof Promise) {
                await result;
            }
        }
    }

    async parallelSum(iBegin: number, iEnd: number, grainSize: number, body: btIParallelSumBody): Promise<number> {
        let totalSum = 0;
        
        // Execute sequentially in chunks
        for (let i = iBegin; i < iEnd; i += grainSize) {
            const chunkEnd = Math.min(i + grainSize, iEnd);
            const result = body.sumLoop(i, chunkEnd);
            const chunkSum = result instanceof Promise ? await result : result;
            totalSum += chunkSum;
        }
        
        return totalSum;
    }
}

/**
 * Web Worker-based task scheduler (for environments that support it)
 */
class btWebWorkerTaskScheduler extends btITaskScheduler {
    private maxThreads: number;
    private numThreads: number;

    constructor(maxThreads: number = navigator.hardwareConcurrency || 4) {
        super("WebWorker");
        this.maxThreads = Math.min(maxThreads, BT_MAX_THREAD_COUNT);
        this.numThreads = Math.min(4, this.maxThreads);
    }

    getMaxNumThreads(): number {
        return this.maxThreads;
    }

    getNumThreads(): number {
        return this.numThreads;
    }

    setNumThreads(numThreads: number): void {
        this.numThreads = Math.max(1, Math.min(numThreads, this.maxThreads));
    }

    async parallelFor(iBegin: number, iEnd: number, grainSize: number, body: btIParallelForBody): Promise<void> {
        // For now, fall back to sequential execution
        // In a full implementation, this would create and manage Web Workers
        const sequential = new btSequentialTaskScheduler();
        return sequential.parallelFor(iBegin, iEnd, grainSize, body);
    }

    async parallelSum(iBegin: number, iEnd: number, grainSize: number, body: btIParallelSumBody): Promise<number> {
        // For now, fall back to sequential execution
        // In a full implementation, this would create and manage Web Workers
        const sequential = new btSequentialTaskScheduler();
        return sequential.parallelSum(iBegin, iEnd, grainSize, body);
    }
}

// Global task scheduler management
let globalTaskScheduler: btITaskScheduler | null = null;
let sequentialTaskScheduler: btITaskScheduler | null = null;

/**
 * Set the global task scheduler
 */
export function btSetTaskScheduler(ts: btITaskScheduler): void {
    if (globalTaskScheduler && globalTaskScheduler.m_isActive) {
        globalTaskScheduler.deactivate();
    }
    globalTaskScheduler = ts;
    if (globalTaskScheduler) {
        globalTaskScheduler.activate();
    }
}

/**
 * Get the current task scheduler
 */
export function btGetTaskScheduler(): btITaskScheduler {
    if (!globalTaskScheduler) {
        globalTaskScheduler = btGetSequentialTaskScheduler();
    }
    return globalTaskScheduler;
}

/**
 * Get the sequential task scheduler (always available)
 */
export function btGetSequentialTaskScheduler(): btITaskScheduler {
    if (!sequentialTaskScheduler) {
        sequentialTaskScheduler = new btSequentialTaskScheduler();
    }
    return sequentialTaskScheduler;
}

/**
 * Create a default task scheduler
 * In browser environments, this will attempt to use Web Workers
 * In Node.js, this could use worker_threads
 */
export function btCreateDefaultTaskScheduler(): btITaskScheduler {
    // Check if we're in a Web Worker environment
    if (typeof globalThis !== 'undefined' && 
        typeof (globalThis as any).Worker !== 'undefined' && 
        typeof navigator !== 'undefined') {
        return new btWebWorkerTaskScheduler();
    }
    
    // Fall back to sequential scheduler
    return btGetSequentialTaskScheduler();
}

/**
 * Get OpenMP task scheduler - not available in JavaScript
 */
export function btGetOpenMPTaskScheduler(): btITaskScheduler | null {
    return null;
}

/**
 * Get Intel TBB task scheduler - not available in JavaScript
 */
export function btGetTBBTaskScheduler(): btITaskScheduler | null {
    return null;
}

/**
 * Get PPL task scheduler - not available in JavaScript
 */
export function btGetPPLTaskScheduler(): btITaskScheduler | null {
    return null;
}

/**
 * Parallel for loop - dispatch work that can be done in parallel
 * Iterations may be done out of order, so no dependencies are allowed
 */
export async function btParallelFor(
    iBegin: number, 
    iEnd: number, 
    grainSize: number, 
    body: btIParallelForBody
): Promise<void> {
    const scheduler = btGetTaskScheduler();
    return scheduler.parallelFor(iBegin, iEnd, grainSize, body);
}

/**
 * Parallel sum - dispatch work like a for-loop, returns the sum of all iterations
 * Iterations may be done out of order, so no dependencies are allowed
 */
export async function btParallelSum(
    iBegin: number, 
    iEnd: number, 
    grainSize: number, 
    body: btIParallelSumBody
): Promise<number> {
    const scheduler = btGetTaskScheduler();
    return scheduler.parallelSum(iBegin, iEnd, grainSize, body);
}

/**
 * Utility class for simple parallel tasks with lambdas/functions
 */
export class btParallelForBodyWrapper implements btIParallelForBody {
    private func: (iBegin: number, iEnd: number) => void | Promise<void>;

    constructor(func: (iBegin: number, iEnd: number) => void | Promise<void>) {
        this.func = func;
    }

    forLoop(iBegin: number, iEnd: number): void | Promise<void> {
        return this.func(iBegin, iEnd);
    }
}

export class btParallelSumBodyWrapper implements btIParallelSumBody {
    private func: (iBegin: number, iEnd: number) => number | Promise<number>;

    constructor(func: (iBegin: number, iEnd: number) => number | Promise<number>) {
        this.func = func;
    }

    sumLoop(iBegin: number, iEnd: number): number | Promise<number> {
        return this.func(iBegin, iEnd);
    }
}

/**
 * Helper functions for creating parallel work more easily
 */
export async function btParallelForWithFunction(
    iBegin: number,
    iEnd: number,
    grainSize: number,
    func: (iBegin: number, iEnd: number) => void | Promise<void>
): Promise<void> {
    const wrapper = new btParallelForBodyWrapper(func);
    return btParallelFor(iBegin, iEnd, grainSize, wrapper);
}

export async function btParallelSumWithFunction(
    iBegin: number,
    iEnd: number,
    grainSize: number,
    func: (iBegin: number, iEnd: number) => number | Promise<number>
): Promise<number> {
    const wrapper = new btParallelSumBodyWrapper(func);
    return btParallelSum(iBegin, iEnd, grainSize, wrapper);
}