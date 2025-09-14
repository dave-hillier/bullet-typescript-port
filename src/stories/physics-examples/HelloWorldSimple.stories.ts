/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2007 Erwin Coumans  http://bulletphysics.org

This is a simplified Storybook story for the HelloWorld physics example using Three.js visualization.
*/

/**
 * @fileoverview HelloWorldSimple.stories - Simplified HelloWorld physics demo
 */

import type { Meta, StoryObj } from '@storybook/html';
import * as THREE from 'three';

// Import only the core physics classes we need
import { btDefaultCollisionConfiguration } from '../../../src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration';
import { btCollisionDispatcher } from '../../../src/BulletCollision/CollisionDispatch/btCollisionDispatcher';
import { btDbvtBroadphase } from '../../../src/BulletCollision/BroadphaseCollision/btDbvtBroadphase';
import { btSequentialImpulseConstraintSolver } from '../../../src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver';
import { btDiscreteDynamicsWorld } from '../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody } from '../../../src/BulletDynamics/Dynamics/btRigidBody';
import { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btSphereShape } from '../../../src/BulletCollision/CollisionShapes/btSphereShape';
import { btVector3 } from '../../../src/LinearMath/btVector3';
import { btTransform } from '../../../src/LinearMath/btTransform';
import { btDefaultMotionState } from '../../../src/LinearMath/btMotionState';

/**
 * Simplified HelloWorld Physics Demo
 *
 * This is a self-contained version of the classic Bullet HelloWorld example with Three.js rendering.
 * Features:
 * - Large ground box (100x100x100)
 * - Small falling sphere
 * - Real-time physics simulation with Three.js visualization
 */
class SimpleHelloWorldDemo {
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

    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    this.camera.position.set(15, 10, 15);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
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
    this.scene.add(directionalLight);
  }

  /**
   * Initialize physics world and create objects
   */
  initPhysics(): void {
    this.log('🔧 Initializing HelloWorld physics...');

    // Create physics world
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

    this.dynamicsWorld.setGravity(new btVector3(0, -10, 0));

    // Create ground and falling sphere
    this.createGround();
    this.createFallingSphere();

    this.log('✅ HelloWorld physics setup complete');
    this.log(`📊 Total objects: ${this.physicsObjects.length}`);
    this.onStatusChange?.('Ready to start', false, 0);
  }

  private createGround(): void {
    // Physics
    const groundShape = new btBoxShape(new btVector3(50, 50, 50));
    const groundTransform = new btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new btVector3(0, -56, 0));

    const groundMotionState = new btDefaultMotionState(groundTransform);
    const groundRbInfo = new btRigidBody.btRigidBodyConstructionInfo(
      0, // mass = 0 for static body
      groundMotionState,
      groundShape,
      new btVector3(0, 0, 0)
    );
    const groundBody = new btRigidBody(groundRbInfo);
    this.dynamicsWorld!.addRigidBody(groundBody);

    // Graphics
    const geometry = new THREE.BoxGeometry(100, 100, 100);
    const material = new THREE.MeshLambertMaterial({ color: 0x0044aa });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -56, 0);
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: groundBody, mesh });
    this.log('📦 Created ground box (100x100x100) at position (0, -56, 0)');
  }

  private createFallingSphere(): void {
    // Physics
    const sphereShape = new btSphereShape(1.0);
    const startTransform = new btTransform();
    startTransform.setIdentity();
    startTransform.setOrigin(new btVector3(2, 10, 0));

    const mass = 1.0;
    const localInertia = new btVector3(0, 0, 0);
    sphereShape.calculateLocalInertia(mass, localInertia);

    const motionState = new btDefaultMotionState(startTransform);
    const rbInfo = new btRigidBody.btRigidBodyConstructionInfo(
      mass,
      motionState,
      sphereShape,
      localInertia
    );
    const sphereBody = new btRigidBody(rbInfo);
    this.dynamicsWorld!.addRigidBody(sphereBody);

    // Graphics
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x44aa00 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(2, 10, 0);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: sphereBody, mesh });
    this.log('⚽ Created falling sphere (radius=1, mass=1) at position (2, 10, 0)');
  }

  start(): void {
    if (this.isRunning) {
      this.log('⚠️  Simulation already running');
      return;
    }

    this.log('🚀 Starting HelloWorld simulation...');
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
    this.log('🔄 Resetting simulation...');

    // Clear graphics
    for (const obj of this.physicsObjects) {
      this.scene.remove(obj.mesh);
    }
    this.physicsObjects = [];

    // Reset physics
    this.exitPhysics();
    this.initPhysics();

    this.stepCount = 0;
    this.onStatusChange?.('Ready to start', false, 0);
    this.log('✅ Simulation reset complete');
  }

  private runSimulationStep(): void {
    if (!this.isRunning || !this.dynamicsWorld) return;

    // Step physics
    this.dynamicsWorld.stepSimulation(1.0 / 60.0);
    this.stepCount++;

    // Update graphics
    this.syncPhysicsToGraphics();

    // Log positions periodically
    if (this.stepCount % 60 === 0) {
      this.logPositions();
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

  private logPositions(): void {
    this.log(`--- Step ${this.stepCount} ---`);
    for (let i = 0; i < this.physicsObjects.length; i++) {
      const obj = this.physicsObjects[i];
      const pos = obj.mesh.position;
      this.log(`object ${i}: (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)})`);
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
  title: 'Physics Examples/HelloWorld Simple',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story: `
A simplified version of the classic Bullet Physics HelloWorld example with Three.js visualization.

**Features:**
- Large ground box (static)
- Falling sphere with gravity
- Real-time physics simulation
- Three.js rendering without complex interfaces

**Original C++ equivalent:** \`bullet3/examples/HelloWorld/HelloWorld.cpp\`
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
      max-width: 800px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
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

    // Create status display
    const status = document.createElement('span');
    status.textContent = 'Initializing...';
    status.style.cssText = 'margin-left: auto; font-weight: bold;';

    // Create log output
    const logOutput = document.createElement('div');
    logOutput.style.cssText = `
      margin-top: 10px;
      height: 150px;
      overflow-y: auto;
      background: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    `;

    controls.append(startBtn, stopBtn, resetBtn, status);
    container.append(canvas, controls, logOutput);

    // Initialize demo
    const demo = new SimpleHelloWorldDemo(canvas);

    // Log handler
    const logs: string[] = [];
    demo.onLog = (message: string) => {
      logs.push(message);
      if (logs.length > 50) {
        logs.shift();
      }
      logOutput.textContent = logs.join('\n');
      logOutput.scrollTop = logOutput.scrollHeight;
    };

    // Status handler
    demo.onStatusChange = (statusText: string, isRunning: boolean, step: number) => {
      if (step > 0) {
        status.textContent = `${statusText} (Step: ${step})`;
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

    // Initialize
    demo.initPhysics();
    demo.render(); // Initial render

    return container;
  }
};