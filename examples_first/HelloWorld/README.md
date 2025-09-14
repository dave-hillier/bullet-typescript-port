# HelloWorld Example - TypeScript Port

This is a TypeScript port of the classic Bullet3 HelloWorld physics example. It demonstrates basic physics simulation with a falling sphere and ground collision.

## Overview

The HelloWorld demo creates a simple physics simulation:
- A falling sphere (radius=1, mass=1) starts at position (2, 10, 0)
- A ground plane at y=-6 (where the sphere center hits the ground)
- Gravity pulls the sphere down at -10 m/s²
- The sphere bounces on the ground with energy loss

This matches the behavior of the original C++ HelloWorld example from `bullet3/examples/HelloWorld/HelloWorld.cpp`.

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm

### Installation and Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Using the Demo

1. Open the demo in your browser (typically http://localhost:3000 or 3001)
2. Click "Start Simulation" to begin the physics simulation
3. Watch the console output showing object positions for 150 simulation steps
4. Use the controls to Stop, Reset, or Clear the console

## Implementation Details

### Architecture

This demo uses a simplified physics implementation rather than the full Bullet3 TypeScript port to avoid complex dependencies while demonstrating the core physics concept.

**Files:**
- `src/SimpleHelloWorld.ts` - Core physics simulation with basic sphere-ground collision
- `src/main.ts` - Browser interface and console output management
- `index.html` - Web interface with controls and console display

### Physics Implementation

The simplified physics includes:
- **Gravity**: Applied as acceleration to sphere velocity
- **Integration**: Simple Euler integration for position/velocity updates
- **Collision Detection**: Basic sphere-plane intersection test
- **Collision Response**: Bounce with coefficient of restitution
- **Energy Loss**: Realistic damping to stop tiny bounces

### Output Format

The demo replicates the exact console output format from the original C++ version:
```
world pos object 1 = 0.000000, -56.000000, 0.000000    # Ground
world pos object 0 = 2.000000, 9.833333, 0.000000     # Sphere
```

## Comparison to Original

**Original C++ HelloWorld (`bullet3/examples/HelloWorld/HelloWorld.cpp`):**
- Uses full Bullet3 physics engine
- Creates btDiscreteDynamicsWorld with collision detection
- Runs 150 steps at 60 FPS
- Prints object positions using printf

**TypeScript Port:**
- Simplified physics simulation for demonstration
- Same timing and output format
- Interactive browser interface with controls
- Visual console output with syntax highlighting

## Future Enhancements

To make this a full Bullet3 TypeScript port:
1. Replace SimpleHelloWorld with the full HelloWorldDemo that uses CommonRigidBodyBase
2. Complete the porting of missing physics classes (btRigidBody, btSphereShape, etc.)
3. Implement proper btCollisionWorld and physics pipeline
4. Add 3D visualization using Three.js

## Project Structure

```
examples/HelloWorld/
├── src/
│   ├── SimpleHelloWorld.ts    # Simplified physics demo
│   ├── HelloWorldDemo.ts      # Full Bullet3 demo (incomplete)
│   └── main.ts               # Browser interface
├── index.html                # Web page
├── package.json              # Dependencies
├── vite.config.ts           # Build configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

This HelloWorld example serves as both a working physics demonstration and a template for future Bullet3 TypeScript example ports.