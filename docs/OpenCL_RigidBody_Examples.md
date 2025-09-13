# OpenCL RigidBody Examples Porting Guide

This document details how to port the Bullet3 OpenCL rigid body examples from C++ to TypeScript for web deployment.

## Overview

The OpenCL/rigidbody examples demonstrate Bullet3's GPU-accelerated rigid body physics pipeline. These examples showcase high-performance collision detection and physics simulation using OpenCL compute shaders.

**Source Location**: `examples/OpenCL/rigidbody/`  
**Target**: Web-based TypeScript implementation with WebGL/WebGPU

## Examples Analysis

### 1. GpuSphereScene.cpp
**Purpose**: Basic sphere collision simulation  
**Key Features**:
- Mass-spring sphere generation
- GPU-based collision detection
- Sphere-sphere contact resolution
- Performance benchmarking

#### Porting Strategy:
```typescript
// Original C++ pattern
class GpuSphereScene {
    b3GpuDynamicsWorld* m_dynamicsWorld;
    b3GpuRigidBodyPipeline* m_rigidBodyPipeline;
};

// TypeScript adaptation
class WebSphereScene {
    private dynamicsWorld: b3CpuRigidBodyPipeline; // CPU equivalent
    private sphereBodies: b3RigidBodyData[] = [];
    private contacts: b3Contact4[] = [];
    
    initPhysics(): void {
        // Initialize sphere bodies in TypeScript arrays
        this.createSphereField(10, 10, 10);
    }
    
    stepSimulation(deltaTime: number): void {
        // CPU-based integration and collision detection
        this.integrateBodies(deltaTime);
        this.detectCollisions();
        this.resolveContacts();
    }
}
```

#### Key Adaptations:
1. **GPU Buffers → TypeScript Arrays**: Replace OpenCL buffers with native arrays
2. **Kernel Execution → JavaScript Loops**: Convert parallel kernels to sequential processing
3. **Memory Management**: Use JavaScript garbage collection instead of manual allocation

### 2. GpuConvexScene.cpp  
**Purpose**: Convex hull collision demonstration  
**Key Features**:
- Convex polyhedron shapes
- SAT-based collision detection
- Contact point generation
- Convex-convex interactions

#### Porting Strategy:
```typescript
class WebConvexScene {
    private convexShapes: b3ConvexPolyhedronData[] = [];
    private rigidBodies: b3RigidBodyData[] = [];
    
    createConvexShape(vertices: b3Vector3[], faces: number[][]): b3ConvexPolyhedronData {
        const shape = new b3ConvexPolyhedronData();
        shape.m_numVertices = vertices.length;
        shape.m_numFaces = faces.length;
        // Set up vertex and face data
        return shape;
    }
    
    private detectConvexConvexCollisions(): b3Contact4[] {
        const contacts: b3Contact4[] = [];
        
        for (let i = 0; i < this.rigidBodies.length; i++) {
            for (let j = i + 1; j < this.rigidBodies.length; j++) {
                const contact = this.checkConvexConvexSAT(
                    this.rigidBodies[i], 
                    this.rigidBodies[j]
                );
                if (contact) {
                    contacts.push(contact);
                }
            }
        }
        
        return contacts;
    }
}
```

#### Implementation Notes:
- Use the ported `b3FindSeparatingAxis` for collision detection
- Leverage `b3ConvexPolyhedronData` for shape representation
- Implement contact reduction using `b3ReduceContacts`

### 3. GpuCompoundScene.cpp
**Purpose**: Compound shape physics simulation  
**Key Features**:
- Hierarchical shape composition
- Child shape transformations
- Complex collision geometry
- Performance optimization for compound objects

#### Porting Strategy:
```typescript
interface CompoundChildShape {
    shape: b3ConvexPolyhedronData;
    localTransform: b3Transform;
    shapeIndex: number;
}

class WebCompoundScene {
    private compoundShapes: Map<number, CompoundChildShape[]> = new Map();
    
    createCompoundShape(children: CompoundChildShape[]): number {
        const shapeId = this.getNextShapeId();
        this.compoundShapes.set(shapeId, children);
        return shapeId;
    }
    
    private detectCompoundCollisions(bodyA: b3RigidBodyData, bodyB: b3RigidBodyData): b3Contact4[] {
        const contacts: b3Contact4[] = [];
        const childrenA = this.compoundShapes.get(bodyA.m_collidableIndex) || [];
        const childrenB = this.compoundShapes.get(bodyB.m_collidableIndex) || [];
        
        // Test all child shape combinations
        for (const childA of childrenA) {
            for (const childB of childrenB) {
                const contact = this.testChildShapes(bodyA, childA, bodyB, childB);
                if (contact) {
                    contacts.push(contact);
                }
            }
        }
        
        return contacts;
    }
}
```

#### Web-Specific Optimizations:
- Use spatial partitioning to reduce collision pairs
- Implement level-of-detail for distant compound objects
- Cache transformed child shapes to avoid recalculation

### 4. ConcaveScene.cpp
**Purpose**: Concave mesh collision handling  
**Key Features**:
- Triangle mesh collision
- Convex-concave interactions
- BVH (Bounding Volume Hierarchy) traversal
- Mesh optimization

#### Porting Strategy:
```typescript
class WebConcaveScene {
    private meshData: b3QuantizedBvhNodeData[] = [];
    private triangles: b3Vector3[][] = [];
    
    loadMesh(vertices: b3Vector3[], indices: number[]): void {
        // Convert indexed mesh to triangle array
        for (let i = 0; i < indices.length; i += 3) {
            const triangle = [
                vertices[indices[i]],
                vertices[indices[i + 1]], 
                vertices[indices[i + 2]]
            ];
            this.triangles.push(triangle);
        }
        
        // Build BVH for efficient traversal
        this.buildBVH();
    }
    
    private detectConvexMeshCollision(convexBody: b3RigidBodyData): b3Contact4[] {
        const contacts: b3Contact4[] = [];
        
        // Use BVH to find potentially colliding triangles
        const candidateTriangles = this.queryBVH(convexBody.m_pos);
        
        for (const triangle of candidateTriangles) {
            const contact = this.testConvexTriangle(convexBody, triangle);
            if (contact) {
                contacts.push(contact);
            }
        }
        
        return contacts;
    }
}
```

### 5. GpuRigidBodyDemo.cpp
**Purpose**: Main demonstration framework  
**Key Features**:
- Scene management
- Rendering integration
- Performance monitoring
- User interaction

#### Porting Strategy:
```typescript
class WebRigidBodyDemo {
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private currentScene: PhysicsScene;
    private renderer: WebGLRenderer;
    private performanceMonitor: PerformanceMonitor;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2')!;
        this.setupEventHandlers();
        this.initRenderer();
    }
    
    private setupEventHandlers(): void {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }
    
    private runSimulation(): void {
        const animate = (timestamp: number) => {
            const deltaTime = this.calculateDeltaTime(timestamp);
            
            // Physics simulation step
            this.currentScene.stepSimulation(deltaTime);
            
            // Render frame
            this.renderer.render(this.currentScene.getBodies());
            
            // Update performance metrics
            this.performanceMonitor.update(deltaTime);
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }
}
```

## Web Integration Patterns

### 1. Asset Loading
```typescript
class AssetLoader {
    static async loadMesh(url: string): Promise<MeshData> {
        const response = await fetch(url);
        const data = await response.json();
        return this.parseMeshData(data);
    }
    
    static async loadTexture(url: string): Promise<WebGLTexture> {
        const image = new Image();
        return new Promise((resolve, reject) => {
            image.onload = () => resolve(this.createTexture(image));
            image.onerror = reject;
            image.src = url;
        });
    }
}
```

### 2. Input Handling
```typescript
class InputManager {
    private keys: Set<string> = new Set();
    private mousePos = { x: 0, y: 0 };
    private mouseButtons: Set<number> = new Set();
    
    constructor(canvas: HTMLCanvasElement) {
        window.addEventListener('keydown', (e) => this.keys.add(e.code));
        window.addEventListener('keyup', (e) => this.keys.delete(e.code));
        
        canvas.addEventListener('mousedown', (e) => {
            this.mouseButtons.add(e.button);
            this.updateMousePos(e);
        });
        
        canvas.addEventListener('mousemove', (e) => this.updateMousePos(e));
    }
    
    isKeyPressed(key: string): boolean {
        return this.keys.has(key);
    }
}
```

### 3. Performance Monitoring
```typescript
class PerformanceMonitor {
    private frameCount = 0;
    private lastTime = 0;
    private fps = 0;
    private physicsTime = 0;
    private renderTime = 0;
    
    update(deltaTime: number): void {
        this.frameCount++;
        
        if (this.frameCount % 60 === 0) {
            this.fps = 1000 / deltaTime;
            this.updateDisplays();
        }
    }
    
    measurePhysics<T>(fn: () => T): T {
        const start = performance.now();
        const result = fn();
        this.physicsTime = performance.now() - start;
        return result;
    }
}
```

## Rendering Adaptations

### 1. WebGL Shader Setup
```glsl
// Vertex shader
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vNormal;

void main() {
    vNormal = normal;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}

// Fragment shader
precision mediump float;
varying vec3 vNormal;

void main() {
    float lighting = max(0.1, dot(normalize(vNormal), vec3(0.5, 0.7, 1.0)));
    gl_FragColor = vec4(0.8 * lighting, 0.6 * lighting, 1.0 * lighting, 1.0);
}
```

### 2. Instance Rendering
```typescript
class InstancedRenderer {
    private instanceBuffer: WebGLBuffer;
    private maxInstances = 10000;
    
    setupInstancedDrawing(): void {
        this.instanceBuffer = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER, 
            this.maxInstances * 16 * 4, // 4x4 matrix per instance
            this.gl.DYNAMIC_DRAW
        );
    }
    
    renderInstances(bodies: b3RigidBodyData[]): void {
        const matrices = this.buildInstanceMatrices(bodies);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, matrices);
        
        this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, this.vertexCount, bodies.length);
    }
}
```

## Performance Considerations

### 1. Memory Management
- Use object pools for frequently created/destroyed objects
- Minimize garbage collection pressure
- Pre-allocate arrays for fixed-size collections

### 2. Computational Optimization  
- Use typed arrays for numerical computations
- Implement spatial partitioning (octree/grid) for broad phase
- Consider Web Workers for parallel processing

### 3. Rendering Optimization
- Use instanced rendering for similar objects
- Implement frustum culling
- Level-of-detail for distant objects
- Occlusion culling for hidden objects

## Deployment Considerations

### 1. Browser Compatibility
- Target modern browsers with WebGL2 support
- Provide fallbacks for older browsers
- Test across different GPU vendors

### 2. Mobile Optimization
- Reduce geometry complexity for mobile devices
- Optimize shader complexity
- Handle touch input events
- Manage thermal throttling

### 3. Progressive Loading
- Load assets incrementally
- Show loading progress
- Enable offline functionality with service workers

## Testing Strategy

1. **Unit Tests**: Test individual physics components
2. **Performance Tests**: Benchmark against target frame rates
3. **Visual Tests**: Compare with reference implementations
4. **Compatibility Tests**: Verify cross-browser functionality
5. **Stress Tests**: Test with large numbers of objects

## Conclusion

The OpenCL rigid body examples provide excellent demonstrations of Bullet3's capabilities. By adapting these patterns to web technologies, developers can create impressive physics simulations that run efficiently in browsers while maintaining the scientific accuracy and performance characteristics of the original Bullet3 engine.