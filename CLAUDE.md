# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript port of the Bullet3 physics engine. The original C++ source is in `../bullet3` for reference only. The port follows a bottom-up approach, starting with leaf dependencies and building up to complex systems.

**Current Status**: ✅ Core physics engine ported and working with example demos using Vite + TypeScript

## Porting Strategy

### Core Principles

1. **Compilation Unit Isolation**: Port one file at a time, maintaining the same structure as the original
2. **Follow TypeScript Conventions**: Use TypeScript idioms instead of C++ patterns
3. **Drop Unnecessary Optimizations**: Remove low-level optimizations that are handled by the JavaScript runtime
4. **Testability First**: Each ported module should have comprehensive unit tests before moving to dependents

### Dependency Order (Leaf to Root)

**Implementation Progress**: Core systems implemented, demos working

1. **LinearMath Foundation** (✅ **COMPLETED**):
   - `btScalar` → TypeScript number types and math constants  
   - `btMinMax` → Simple min/max utilities
   - `btVector3` → 3D vector class (depends on btScalar)
   - `btQuaternion` → Quaternion for rotations (depends on btVector3)
   - `btMatrix3x3` → 3x3 matrix operations (depends on btVector3, btQuaternion)
   - `btTransform` → Combined rotation and translation (depends on btMatrix3x3, btVector3)
   - `btAlignedObjectArray` → Use TypeScript arrays instead

2. **BulletCollision System** (✅ **CORE COMPLETED**):
   - **CollisionShapes/**: Start with basic shapes (`btSphereShape`, `btBoxShape`, `btCapsuleShape`)
   - **BroadphaseCollision/**: Broad phase collision detection algorithms  
   - **NarrowPhaseCollision/**: Narrow phase collision algorithms
   - **CollisionDispatch/**: Collision dispatching and management
   - **Gimpact/**: Triangle mesh collision (advanced)

3. **BulletDynamics System** (✅ **CORE COMPLETED**):
   - **Dynamics/**: Core rigid body dynamics (`btRigidBody`, `btDiscreteDynamicsWorld`)
   - **ConstraintSolver/**: Constraint solving algorithms
   - **Character/**: Character controller functionality
   - **Vehicle/**: Vehicle simulation components
   - **Featherstone/**: Multi-body dynamics (advanced)

4. **Advanced Systems** (📋 **PLANNED** - port last):
   - **BulletSoftBody/**: Soft body physics simulation
   - **BulletInverseDynamics/**: Inverse dynamics calculations
   - **Bullet3Serialize/**: Save/load functionality

5. **GPU Systems** (❌ **SKIPPED** - removed from port):
   - **Bullet3Common/**, **Bullet3Collision/**, **Bullet3Dynamics/**: GPU implementations (removed - failed experiment)
   - **Bullet3OpenCL/**: OpenCL specific code (not applicable for TypeScript port)
   - **Note**: The Bullet3 GPU systems were initially attempted but removed as they don't translate well to TypeScript and add unnecessary complexity for the initial port goals.

## Translation Guidelines

### Type Mappings

```typescript
// C++ → TypeScript
btScalar → number
int → number
bool → boolean
void* → any (avoid when possible, use specific types)
btVector3* → btVector3 (no pointers in TS)
const btVector3& → btVector3 (pass by value)
btAlignedObjectArray<T> → T[]
```

### Pattern Translations

#### C++ Macros → TypeScript Constants
```cpp
// C++
#define SIMD_EPSILON 1.192092896e-07F
```
```typescript
// TypeScript
export const SIMD_EPSILON = 1.192092896e-07;
```

#### C++ Operator Overloading → Named Methods
```cpp
// C++
btVector3 operator+(const btVector3& v1, const btVector3& v2);
```
```typescript
// TypeScript
class btVector3 {
  add(v: btVector3): btVector3 { }
  static add(v1: btVector3, v2: btVector3): btVector3 { }
}
```

#### C++ Templates → TypeScript Generics
```cpp
// C++
template <typename T>
class btAlignedObjectArray { };
```
```typescript
// TypeScript
class btAlignedObjectArray<T> { }
// But prefer native arrays: T[]
```

#### SIMD/Assembly → Pure TypeScript
```cpp
// C++ with SIMD
#ifdef BT_USE_SSE
  // SSE optimized code
#else
  // Scalar fallback
#endif
```
```typescript
// TypeScript - use only the scalar version
// Let V8/JavaScript engine handle optimization
```

### Specific Removals

1. **Memory Management**: Remove all manual memory management
   - No `new`/`delete` → Use object literals and constructors
   - No memory pools → Use JavaScript GC
   - No aligned allocation → Not needed in TypeScript

2. **Platform-Specific Code**: Remove all `#ifdef` platform checks
   - Use only portable implementations
   - Remove assembly optimizations
   - Remove compiler-specific attributes

3. **Debug/Assert Macros**: Convert to TypeScript assertions
   ```typescript
   function btAssert(condition: boolean, message?: string): asserts condition {
     if (!condition) {
       throw new Error(message || "Assertion failed");
     }
   }
   ```

## File Structure

**Target Structure** (work-in-progress - directories exist but most files are not yet implemented):

```
src/
├── LinearMath/                          # Core math primitives (port first)
│   ├── btScalar.ts
│   ├── btMinMax.ts
│   ├── btVector3.ts
│   ├── btVector3.test.ts
│   ├── btQuaternion.ts
│   ├── btQuaternion.test.ts
│   ├── btMatrix3x3.ts
│   ├── btMatrix3x3.test.ts
│   ├── btTransform.ts
│   ├── btTransform.test.ts
│   └── ...
├── BulletCollision/                     # Collision detection system
│   ├── CollisionShapes/                 # Basic collision shapes
│   ├── BroadphaseCollision/            # Broad phase algorithms
│   ├── NarrowPhaseCollision/           # Narrow phase algorithms
│   ├── CollisionDispatch/              # Collision dispatching
│   └── Gimpact/                        # GIMPACT mesh collision
├── BulletDynamics/                      # Rigid body dynamics
│   ├── Dynamics/                        # Core dynamics
│   ├── ConstraintSolver/               # Constraint solving
│   ├── Character/                       # Character controllers
│   ├── Vehicle/                         # Vehicle simulation
│   ├── Featherstone/                   # Featherstone articulated bodies
│   └── MLCPSolvers/                    # MLCP solvers
├── BulletSoftBody/                      # Soft body physics
│   └── BulletReducedDeformableBody/    # Reduced deformable bodies
├── BulletInverseDynamics/              # Inverse dynamics
│   └── details/
└── Bullet3Serialize/                    # Serialization (port later)
    └── Bullet2FileLoader/
```

## Testing Requirements

Each ported class must have:
1. **Unit tests** covering all public methods
2. **Property tests** for mathematical invariants
3. **Comparison tests** against expected values from C++ version (when feasible)

Test file naming: `[ClassName].test.ts` in the same directory

## Development Environment

This project uses **Vite + TypeScript** for modern development workflow with hot module replacement.

### Examples and Demos

All examples use Vite for optimal development experience:

**`examples/BasicDemo/`** - Main physics demonstration
- **125 rigid bodies** (5×5×5 falling boxes)  
- **Ground collision** detection
- **Real-time physics** simulation
- **Interactive controls** (Start/Stop/Reset)
- **Live monitoring** (FPS, object positions)

To run any example:
```bash
cd examples/BasicDemo
npm install
npm run dev    # Start development server with hot reload
npm run build  # Build for production
```

### Build Commands

**Development:**
```bash
cd examples/BasicDemo
npm run dev    # Vite dev server at http://localhost:3000
```

**Production:**
```bash
npm run build  # TypeScript + Vite build
npm run preview # Preview production build
```

**Testing:**
```bash
npm test       # Run unit tests
npm test:watch # Run tests in watch mode
npm test:coverage # Run tests with coverage
```

## Important Notes

- **ALWAYS** check `../bullet3/src/` for the original implementation
- **ALWAYS** write tests before considering a module complete
- **ALWAYS** work in order of fewest dependencies first
- **ALWAYS** ensure dependent code is first implemented before attemting any fix up