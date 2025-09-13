/*
Copyright (c) 2003-2009 Erwin Coumans  http://bullet.googlecode.com

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
 * TypeScript port of Bullet3's btCpuFeatureUtility.h
 * 
 * Rudimentary CPU feature detection utility for CPU features that Bullet uses.
 * Since JavaScript/TypeScript runs on various platforms and doesn't have direct
 * access to CPU instruction detection, this implementation provides sensible defaults
 * and can be configured programmatically if needed.
 * 
 * In the original C++ code, this was used to detect SSE4/FMA3 and NEON_HPFP features.
 * For JavaScript environments, we assume modern runtime optimizations handle
 * performance optimizations automatically.
 */

/**
 * CPU feature flags enum
 * These match the original C++ enum values for compatibility
 */
export enum btCpuFeature {
    CPU_FEATURE_FMA3 = 1,      // Fused Multiply-Add 3-operand
    CPU_FEATURE_SSE4_1 = 2,    // Streaming SIMD Extensions 4.1
    CPU_FEATURE_NEON_HPFP = 4  // ARM NEON Half Precision Floating Point
}

/**
 * CPU feature detection utility class
 * 
 * In JavaScript/TypeScript environments, direct CPU feature detection is not available
 * for security and portability reasons. This implementation provides:
 * 
 * 1. Sensible defaults based on the runtime environment
 * 2. Manual configuration capability for testing or specific use cases
 * 3. Compatibility with the original C++ API
 */
export class btCpuFeatureUtility {
    private static capabilities: number = 0;
    private static testedCapabilities: boolean = false;
    private static manuallyConfigured: boolean = false;

    /**
     * Get supported CPU features
     * 
     * Since JavaScript engines handle optimization automatically and we don't have
     * direct access to CPU features, this method returns conservative defaults:
     * 
     * - In Node.js: Assumes modern CPU capabilities on desktop/server environments
     * - In browsers: Assumes no specific CPU features (JavaScript engine optimizes automatically)
     * - Can be overridden using setCpuFeatures() for testing or specific requirements
     */
    static getCpuFeatures(): number {
        if (this.testedCapabilities) {
            return this.capabilities;
        }

        // If manually configured, use those settings
        if (this.manuallyConfigured) {
            this.testedCapabilities = true;
            return this.capabilities;
        }

        // Auto-detect based on environment
        this.capabilities = this.detectEnvironmentCapabilities();
        this.testedCapabilities = true;
        
        return this.capabilities;
    }

    /**
     * Manually set CPU feature capabilities
     * This allows for testing specific configurations or overriding auto-detection
     * 
     * @param features Bitwise OR of btCpuFeature flags
     */
    static setCpuFeatures(features: number): void {
        this.capabilities = features;
        this.manuallyConfigured = true;
        this.testedCapabilities = true;
    }

    /**
     * Reset CPU feature detection to auto-detect mode
     */
    static resetToAutoDetect(): void {
        this.capabilities = 0;
        this.testedCapabilities = false;
        this.manuallyConfigured = false;
    }

    /**
     * Check if a specific CPU feature is available
     * 
     * @param feature The CPU feature to check
     * @returns true if the feature is available
     */
    static hasFeature(feature: btCpuFeature): boolean {
        return (this.getCpuFeatures() & feature) !== 0;
    }

    /**
     * Get a string representation of available features
     * Useful for debugging and logging
     */
    static getFeaturesString(): string {
        const features = this.getCpuFeatures();
        const featureNames: string[] = [];

        if (features & btCpuFeature.CPU_FEATURE_FMA3) {
            featureNames.push("FMA3");
        }
        if (features & btCpuFeature.CPU_FEATURE_SSE4_1) {
            featureNames.push("SSE4.1");
        }
        if (features & btCpuFeature.CPU_FEATURE_NEON_HPFP) {
            featureNames.push("NEON_HPFP");
        }

        return featureNames.length > 0 ? featureNames.join(", ") : "None";
    }

    /**
     * Detect capabilities based on the runtime environment
     * 
     * This is a heuristic approach since JavaScript doesn't provide direct CPU feature access:
     * - Node.js on desktop/server: Assume modern CPU features are available
     * - Browser environments: Conservative approach, assume JavaScript engine optimization
     * - Mobile/embedded: Assume limited features
     * 
     * @returns Detected feature flags
     */
    private static detectEnvironmentCapabilities(): number {
        let detectedFeatures = 0;

        // Check if we're in Node.js environment
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            // In Node.js, we can make educated guesses based on the platform
            const platform = process.platform;
            const arch = process.arch;

            // Desktop/server environments likely have modern CPU features
            if (platform === 'win32' || platform === 'darwin' || platform === 'linux') {
                if (arch === 'x64' || arch === 'ia32') {
                    // x86/x64 desktop systems likely support SSE4.1 and FMA3
                    detectedFeatures |= btCpuFeature.CPU_FEATURE_SSE4_1;
                    detectedFeatures |= btCpuFeature.CPU_FEATURE_FMA3;
                } else if (arch === 'arm' || arch === 'arm64') {
                    // ARM systems may have NEON support
                    detectedFeatures |= btCpuFeature.CPU_FEATURE_NEON_HPFP;
                }
            }
        } else if (typeof navigator !== 'undefined') {
            // Browser environment - be conservative
            // Modern browsers and JavaScript engines handle optimization automatically
            // We could potentially use navigator.hardwareConcurrency or other hints,
            // but it's safer to assume no specific features and let the JS engine optimize
            
            // Check for hints about the platform
            const userAgent = navigator.userAgent.toLowerCase();
            
            if (userAgent.includes('arm') || userAgent.includes('mobile')) {
                // Mobile devices might have ARM/NEON
                // But be conservative since performance characteristics vary widely
                detectedFeatures |= btCpuFeature.CPU_FEATURE_NEON_HPFP;
            } else {
                // Desktop browsers - assume modern x86/x64 features might be available
                // But again, be conservative since JavaScript engine does the optimization
                detectedFeatures |= btCpuFeature.CPU_FEATURE_SSE4_1;
            }
        }

        return detectedFeatures;
    }
}

/**
 * Convenience functions for checking specific features
 * These provide a more readable API for common feature checks
 */

export function hasFMA3(): boolean {
    return btCpuFeatureUtility.hasFeature(btCpuFeature.CPU_FEATURE_FMA3);
}

export function hasSSE4_1(): boolean {
    return btCpuFeatureUtility.hasFeature(btCpuFeature.CPU_FEATURE_SSE4_1);
}

export function hasNeonHPFP(): boolean {
    return btCpuFeatureUtility.hasFeature(btCpuFeature.CPU_FEATURE_NEON_HPFP);
}

/**
 * Initialize CPU feature detection
 * This function can be called at application startup to trigger feature detection
 * Returns the detected features for logging/debugging purposes
 */
export function initializeCpuFeatureDetection(): number {
    return btCpuFeatureUtility.getCpuFeatures();
}