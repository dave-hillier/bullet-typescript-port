/**
 * Bullet3Common module exports
 * Core mathematical types and utilities for the Bullet3 physics engine
 */

// Core scalar types and mathematical functions
export * from './b3Scalar';

// Min/max utility functions
export * from './b3MinMax';

// 3D vector mathematics
export * from './b3Vector3';

// Transform representation
export * from './b3Transform';

// Dynamic array container
export * from './b3AlignedObjectArray';

// Shared SIMD-friendly data structures
export * from './shared/b3Float4';
export * from './shared/b3Int4';
export * from './shared/b3Mat3x3';