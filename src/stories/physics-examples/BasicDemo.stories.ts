/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a Storybook story for the BasicDemo physics example using Three.js visualization.
*/

/**
 * @fileoverview BasicDemo.stories - BasicDemo physics example with 5x5x5 falling boxes
 */

import type { Meta, StoryObj } from '@storybook/html';
import * as THREE from 'three';

// Import physics classes
import { btDefaultCollisionConfiguration } from '../../../src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration';
import { btCollisionDispatcher } from '../../../src/BulletCollision/CollisionDispatch/btCollisionDispatcher';
import { btDbvtBroadphase } from '../../../src/BulletCollision/BroadphaseCollision/btDbvtBroadphase';
import { btSequentialImpulseConstraintSolver } from '../../../src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver';
import { btDiscreteDynamicsWorld } from '../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody } from '../../../src/BulletDynamics/Dynamics/btRigidBody';
import { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btVector3 } from '../../../src/LinearMath/btVector3';
import { btTransform } from '../../../src/LinearMath/btTransform';
import { btDefaultMotionState } from '../../../src/LinearMath/btMotionState';

// Constants from the original BasicExample.cpp
const ARRAY_SIZE_X = 5;
const ARRAY_SIZE_Y = 5;
const ARRAY_SIZE_Z = 5;

/**
 * BasicDemo Physics Example
 *
 * Faithful port of the Bullet3 BasicExample.cpp with Three.js rendering.
 * Features:
 * - Large ground box at y = -50
 * - 5x5x5 grid of small falling boxes (125 total)
 * - Real-time physics simulation
 * - Interactive camera controls
 */
class BasicDemo {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;

  // Physics world components
  private collisionConfiguration: btDefaultCollisionConfiguration | null = null;
  private dispatcher: btCollisionDispatcher | null = null;
  private broadphase: btDbvtBroadphase | null = null;
  private solver: btSequentialImpulseConstraintSolver | null = null;
  private dynamicsWorld: btDiscreteDynamicsWorld | null = null;

  // Physics bodies and their Three.js counterparts
  private physicsObjects: Array<{
    rigidBody: btRigidBody;
    mesh: THREE.Mesh;
  }> = [];

  // Animation state
  private isRunning: boolean = false;
  private animationId: number | null = null;
  private stepCount: number = 0;

  // Callbacks
  onStatusChange?: (status: string, isRunning: boolean, step: number) => void;
  onLog?: (message: string) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Camera setup matching BasicExample camera position
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.resetCamera();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
  }

  /**
   * Reset camera to match the original BasicExample camera position
   */
  resetCamera(): void {
    // From BasicExample: dist=4, pitch=-35, yaw=52, target=(0,0,0)
    const distance = 8; // Slightly further back to see all boxes
    const pitch = -35;
    const yaw = 52;

    const pitchRad = (pitch * Math.PI) / 180;
    const yawRad = (yaw * Math.PI) / 180;

    const x = distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const y = distance * Math.sin(pitchRad);
    const z = distance * Math.cos(pitchRad) * Math.cos(yawRad);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
  }

  /**
   * Initialize physics world and create objects
   */
  initPhysics(): void {
    this.log('🔧 Initializing BasicDemo physics...');

    // Create physics world (matching BasicExample setup)
    this.collisionConfiguration = new btDefaultCollisionConfiguration();
    this.dispatcher = new btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new btDbvtBroadphase();
    this.solver = new btSequentialImpulseConstraintSolver();

    this.dynamicsWorld = new btDiscreteDynamicsWorld(
      this.dispatcher,
      this.broadphase,
      this.solver,
      this.collisionConfiguration
    );

    // Set gravity (matching the original)
    this.dynamicsWorld.setGravity(new btVector3(0, -10, 0));

    // Create ground and falling boxes
    this.createGround();
    this.createFallingBoxes();

    this.log('✅ BasicDemo physics setup complete');
    this.log(`📊 Total objects: ${this.physicsObjects.length}`);
    this.onStatusChange?.('Ready to start', false, 0);
  }

  private createGround(): void {
    // Create ground matching BasicExample: btBoxShape with half-extents (50, 50, 50)
    const groundShape = new btBoxShape(new btVector3(50, 50, 50));
    const groundTransform = new btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new btVector3(0, -50, 0)); // Match BasicExample position

    const groundMotionState = new btDefaultMotionState(groundTransform);
    const groundRbInfo = new btRigidBody.btRigidBodyConstructionInfo(
      0, // mass = 0 for static body
      groundMotionState,
      groundShape,
      new btVector3(0, 0, 0)
    );
    const groundBody = new btRigidBody(groundRbInfo);
    this.dynamicsWorld!.addRigidBody(groundBody);

    // Graphics - blue ground to match the original
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshLambertMaterial({ color: 0x2244aa });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -50, 0);
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: groundBody, mesh });
    this.log('📦 Created ground box (100x100x100) at position (0, -50, 0)');
  }

  private createFallingBoxes(): void {
    // Create small boxes matching BasicExample: half-extents (0.1, 0.1, 0.1)
    const boxShape = new btBoxShape(new btVector3(0.1, 0.1, 0.1));

    let boxCount = 0;

    // Create 5x5x5 grid of boxes
    for (let k = 0; k < ARRAY_SIZE_Y; k++) {
      for (let i = 0; i < ARRAY_SIZE_X; i++) {
        for (let j = 0; j < ARRAY_SIZE_Z; j++) {
          // Physics
          const startTransform = new btTransform();
          startTransform.setIdentity();

          // Position matching BasicExample
          startTransform.setOrigin(new btVector3(
            0.2 * i,
            2 + 0.2 * k,
            0.2 * j
          ));

          const mass = 1.0; // Dynamic body
          const localInertia = new btVector3(0, 0, 0);
          boxShape.calculateLocalInertia(mass, localInertia);

          const motionState = new btDefaultMotionState(startTransform);
          const rbInfo = new btRigidBody.btRigidBodyConstructionInfo(
            mass,
            motionState,
            boxShape,
            localInertia
          );
          const boxBody = new btRigidBody(rbInfo);
          this.dynamicsWorld!.addRigidBody(boxBody);

          // Graphics - vary colors by layer for visual interest
          const hue = (k / ARRAY_SIZE_Y) * 0.8; // Vary hue by layer
          const color = new THREE.Color().setHSL(hue, 0.7, 0.5);

          const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
          const material = new THREE.MeshLambertMaterial({ color });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(0.2 * i, 2 + 0.2 * k, 0.2 * j);
          mesh.castShadow = true;
          this.scene.add(mesh);

          this.physicsObjects.push({ rigidBody: boxBody, mesh });
          boxCount++;
        }
      }
    }

    this.log(`📦 Created ${boxCount} falling boxes in ${ARRAY_SIZE_X}x${ARRAY_SIZE_Y}x${ARRAY_SIZE_Z} grid`);
  }

  start(): void {
    if (this.isRunning) {
      this.log('⚠️  Simulation already running');
      return;
    }

    this.log('🚀 Starting BasicDemo simulation...');
    this.log(`📈 Running simulation with ${this.physicsObjects.length} objects at 60 FPS`);
    this.isRunning = true;
    this.stepCount = 0;
    this.onStatusChange?.('Running simulation...', true, 0);

    this.runSimulationStep();
  }

  stop(): void {
    if (!this.isRunning) return;

    this.log('⏹️  Simulation stopped');
    this.isRunning = false;
    this.onStatusChange?.('Stopped', false, this.stepCount);

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  reset(): void {
    this.stop();
    this.log('🔄 Resetting BasicDemo...');

    // Clear graphics
    for (const obj of this.physicsObjects) {
      this.scene.remove(obj.mesh);
    }
    this.physicsObjects = [];

    // Reset physics
    this.exitPhysics();
    this.initPhysics();

    this.stepCount = 0;
    this.resetCamera(); // Reset camera position
    this.onStatusChange?.('Ready to start', false, 0);
    this.log('✅ BasicDemo reset complete');
  }

  private runSimulationStep(): void {
    if (!this.isRunning || !this.dynamicsWorld) return;

    // Step physics
    this.dynamicsWorld.stepSimulation(1.0 / 60.0);
    this.stepCount++;

    // Update graphics
    this.syncPhysicsToGraphics();

    // Log FPS and object status periodically
    if (this.stepCount % 120 === 0) { // Every 2 seconds
      this.logStatus();
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    this.onStatusChange?.('Running simulation...', true, this.stepCount);

    // Continue animation
    this.animationId = requestAnimationFrame(() => {
      this.runSimulationStep();
    });
  }

  private syncPhysicsToGraphics(): void {
    for (const obj of this.physicsObjects) {
      const transform = new btTransform();

      if (obj.rigidBody.getMotionState()) {
        obj.rigidBody.getMotionState()!.getWorldTransform(transform);
      } else {
        transform.copy(obj.rigidBody.getWorldTransform());
      }

      const origin = transform.getOrigin();
      const rotation = transform.getRotation();

      obj.mesh.position.set(origin.x(), origin.y(), origin.z());
      obj.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
    }
  }

  private logStatus(): void {
    const seconds = (this.stepCount / 60).toFixed(1);
    const fps = 60; // We're targeting 60 FPS
    this.log(`Time: ${seconds}s, FPS: ${fps}, Objects: ${this.physicsObjects.length}`);

    // Count objects by height for debugging
    let aboveGround = 0;
    let belowGround = 0;
    for (const obj of this.physicsObjects) {
      if (obj.mesh.position.y > -50) {
        aboveGround++;
      } else {
        belowGround++;
      }
    }
    if (belowGround > 1) { // More than just the ground
      this.log(`Objects above ground: ${aboveGround}, settled: ${belowGround - 1}`);
    }
  }

  private exitPhysics(): void {
    if (this.dynamicsWorld) {
      // Remove rigid bodies
      for (const obj of this.physicsObjects) {
        this.dynamicsWorld.removeRigidBody(obj.rigidBody);
      }
    }

    // Clean up physics world
    this.dynamicsWorld = null;
    this.solver = null;
    this.broadphase = null;
    this.dispatcher = null;
    this.collisionConfiguration = null;
  }

  private log(message: string): void {
    console.log(message);
    this.onLog?.(message);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

// Story configuration
const meta: Meta = {
  title: 'Physics Examples/BasicDemo',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story: `
The classic Bullet Physics BasicDemo example with 125 falling boxes in a 5x5x5 grid.

**Features:**
- Large ground box (static)
- 125 small boxes arranged in a 5x5x5 grid
- Real-time physics simulation
- Colorful boxes with different hues per layer
- Performance monitoring (FPS, object counts)

**Original C++ equivalent:** \`bullet3/examples/BasicDemo/BasicExample.cpp\`
        `
      }
    }
  }
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => {
    // Create container
    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 600;
    canvas.style.cssText = `
      width: 100%;
      height: auto;
      border: 1px solid #ccc;
      border-radius: 4px;
      display: block;
    `;

    // Create controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      margin-top: 10px;
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
    `;

    // Create buttons
    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start';
    startBtn.style.cssText = 'padding: 8px 16px; cursor: pointer;';

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop';
    stopBtn.style.cssText = 'padding: 8px 16px; cursor: pointer;';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.cssText = 'padding: 8px 16px; cursor: pointer;';

    const resetCameraBtn = document.createElement('button');
    resetCameraBtn.textContent = 'Reset Camera';
    resetCameraBtn.style.cssText = 'padding: 8px 16px; cursor: pointer;';

    // Create status display
    const status = document.createElement('span');
    status.textContent = 'Initializing...';
    status.style.cssText = 'margin-left: auto; font-weight: bold; font-size: 14px;';

    // Create log output
    const logOutput = document.createElement('div');
    logOutput.style.cssText = `
      margin-top: 10px;
      height: 120px;
      overflow-y: auto;
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
      white-space: pre-wrap;
    `;

    controls.append(startBtn, stopBtn, resetBtn, resetCameraBtn, status);
    container.append(canvas, controls, logOutput);

    // Initialize demo
    const demo = new BasicDemo(canvas);

    // Log handler
    const logs: string[] = [];
    demo.onLog = (message: string) => {
      logs.push(message);
      if (logs.length > 100) {
        logs.shift();
      }
      logOutput.textContent = logs.join('\n');
      logOutput.scrollTop = logOutput.scrollHeight;
    };

    // Status handler
    demo.onStatusChange = (statusText: string, isRunning: boolean, step: number) => {
      if (step > 0) {
        const seconds = (step / 60).toFixed(1);
        status.textContent = `${statusText} (${seconds}s, Step: ${step})`;
      } else {
        status.textContent = statusText;
      }

      startBtn.disabled = isRunning;
      stopBtn.disabled = !isRunning;
    };

    // Button handlers
    startBtn.onclick = () => demo.start();
    stopBtn.onclick = () => demo.stop();
    resetBtn.onclick = () => demo.reset();
    resetCameraBtn.onclick = () => {
      demo.resetCamera();
      demo.render();
    };

    // Initialize
    demo.initPhysics();
    demo.render(); // Initial render

    return container;
  }
};

export const AutoRun: Story = {
  ...Default,
  parameters: {
    docs: {
      description: {
        story: 'BasicDemo that starts automatically when loaded.'
      }
    }
  },
  render: () => {
    const container = Default.render!();

    // Auto-start after a brief delay
    setTimeout(() => {
      const startBtn = container.querySelector('button') as HTMLButtonElement;
      if (startBtn && !startBtn.disabled) {
        startBtn.click();
      }
    }, 1000);

    return container;
  }
};