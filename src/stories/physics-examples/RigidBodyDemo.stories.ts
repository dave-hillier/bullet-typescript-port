/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a Storybook story for a RigidBody physics example using Three.js visualization.
*/

/**
 * @fileoverview RigidBodyDemo.stories - Various rigid body physics demonstrations
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
import { btSphereShape } from '../../../src/BulletCollision/CollisionShapes/btSphereShape';
import { btCylinderShape } from '../../../src/BulletCollision/CollisionShapes/btCylinderShape';
import { btVector3 } from '../../../src/LinearMath/btVector3';
import { btTransform } from '../../../src/LinearMath/btTransform';
import { btDefaultMotionState } from '../../../src/LinearMath/btMotionState';

/**
 * RigidBody Physics Demo
 *
 * Demonstrates various rigid body shapes and physics interactions.
 * Features:
 * - Multiple shape types (boxes, spheres, cylinders)
 * - Different masses and materials
 * - Interactive object spawning
 * - Real-time physics simulation
 */
class RigidBodyDemo {
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
    type: string;
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
    this.resetCamera();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setupLighting();
  }

  resetCamera(): void {
    this.camera.position.set(12, 8, 12);
    this.camera.lookAt(0, 2, 0);
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    this.scene.add(directionalLight);

    // Point light for additional illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-10, 10, 10);
    this.scene.add(pointLight);
  }

  /**
   * Initialize physics world and create objects
   */
  initPhysics(): void {
    this.log('🔧 Initializing RigidBody physics...');

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

    this.dynamicsWorld.setGravity(new btVector3(0, -9.8, 0));

    // Create initial scene
    this.createGround();
    this.createInitialObjects();

    this.log('✅ RigidBody physics setup complete');
    this.log(`📊 Total objects: ${this.physicsObjects.length}`);
    this.onStatusChange?.('Ready to start', false, 0);
  }

  private createGround(): void {
    // Create ground
    const groundShape = new btBoxShape(new btVector3(20, 1, 20));
    const groundTransform = new btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new btVector3(0, -1, 0));

    const groundMotionState = new btDefaultMotionState(groundTransform);
    const groundRbInfo = new btRigidBody.btRigidBodyConstructionInfo(
      0, // static
      groundMotionState,
      groundShape,
      new btVector3(0, 0, 0)
    );
    const groundBody = new btRigidBody(groundRbInfo);
    this.dynamicsWorld!.addRigidBody(groundBody);

    // Graphics
    const geometry = new THREE.BoxGeometry(40, 2, 40);
    const material = new THREE.MeshLambertMaterial({
      color: 0x228833,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -1, 0);
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: groundBody, mesh, type: 'ground' });
    this.log('📦 Created ground plane (40x2x40) at position (0, -1, 0)');
  }

  private createInitialObjects(): void {
    // Create a variety of initial objects
    this.addBox(new btVector3(-3, 5, 0), 1.0, 0xff4444);
    this.addSphere(new btVector3(0, 5, 0), 1.0, 2.0, 0x44ff44);
    this.addCylinder(new btVector3(3, 5, 0), 1.0, 1.5, 0x4444ff);

    this.addBox(new btVector3(-2, 8, -2), 0.5, 0xffaa44);
    this.addSphere(new btVector3(2, 8, 2), 0.8, 1.5, 0xaa44ff);

    this.log('🎯 Created initial demonstration objects');
  }

  addBox(position: btVector3, size: number, color: number): void {
    const boxShape = new btBoxShape(new btVector3(size, size, size));
    const transform = new btTransform();
    transform.setIdentity();
    transform.setOrigin(position);

    const mass = size * size * 2; // Volume-based mass
    const localInertia = new btVector3(0, 0, 0);
    boxShape.calculateLocalInertia(mass, localInertia);

    const motionState = new btDefaultMotionState(transform);
    const rbInfo = new btRigidBody.btRigidBodyConstructionInfo(
      mass,
      motionState,
      boxShape,
      localInertia
    );
    const boxBody = new btRigidBody(rbInfo);
    this.dynamicsWorld!.addRigidBody(boxBody);

    // Graphics
    const geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x(), position.y(), position.z());
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: boxBody, mesh, type: 'box' });
  }

  addSphere(position: btVector3, radius: number, mass: number, color: number): void {
    const sphereShape = new btSphereShape(radius);
    const transform = new btTransform();
    transform.setIdentity();
    transform.setOrigin(position);

    const localInertia = new btVector3(0, 0, 0);
    sphereShape.calculateLocalInertia(mass, localInertia);

    const motionState = new btDefaultMotionState(transform);
    const rbInfo = new btRigidBody.btRigidBodyConstructionInfo(
      mass,
      motionState,
      sphereShape,
      localInertia
    );
    const sphereBody = new btRigidBody(rbInfo);
    this.dynamicsWorld!.addRigidBody(sphereBody);

    // Graphics
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x(), position.y(), position.z());
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: sphereBody, mesh, type: 'sphere' });
  }

  addCylinder(position: btVector3, radius: number, height: number, color: number): void {
    const cylinderShape = new btCylinderShape(new btVector3(radius, height / 2, radius));
    const transform = new btTransform();
    transform.setIdentity();
    transform.setOrigin(position);

    const mass = radius * radius * height * 1.5; // Volume-based mass
    const localInertia = new btVector3(0, 0, 0);
    cylinderShape.calculateLocalInertia(mass, localInertia);

    const motionState = new btDefaultMotionState(transform);
    const rbInfo = new btRigidBody.btRigidBodyConstructionInfo(
      mass,
      motionState,
      cylinderShape,
      localInertia
    );
    const cylinderBody = new btRigidBody(rbInfo);
    this.dynamicsWorld!.addRigidBody(cylinderBody);

    // Graphics
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x(), position.y(), position.z());
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.physicsObjects.push({ rigidBody: cylinderBody, mesh, type: 'cylinder' });
  }

  spawnRandomObject(): void {
    const types = ['box', 'sphere', 'cylinder'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0xa55eea];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const x = (Math.random() - 0.5) * 8;
    const z = (Math.random() - 0.5) * 8;
    const position = new btVector3(x, 8 + Math.random() * 4, z);

    switch (type) {
      case 'box':
        const size = 0.5 + Math.random() * 1;
        this.addBox(position, size, color);
        this.log(`📦 Spawned box at (${x.toFixed(1)}, ${position.y().toFixed(1)}, ${z.toFixed(1)})`);
        break;
      case 'sphere':
        const radius = 0.5 + Math.random() * 1;
        const mass = radius * radius * 3;
        this.addSphere(position, radius, mass, color);
        this.log(`⚽ Spawned sphere at (${x.toFixed(1)}, ${position.y().toFixed(1)}, ${z.toFixed(1)})`);
        break;
      case 'cylinder':
        const cylRadius = 0.3 + Math.random() * 0.7;
        const height = 0.5 + Math.random() * 1.5;
        this.addCylinder(position, cylRadius, height, color);
        this.log(`🥫 Spawned cylinder at (${x.toFixed(1)}, ${position.y().toFixed(1)}, ${z.toFixed(1)})`);
        break;
    }
  }

  start(): void {
    if (this.isRunning) {
      this.log('⚠️  Simulation already running');
      return;
    }

    this.log('🚀 Starting RigidBody simulation...');
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
    this.log('🔄 Resetting RigidBody demo...');

    // Clear graphics
    for (const obj of this.physicsObjects) {
      this.scene.remove(obj.mesh);
    }
    this.physicsObjects = [];

    // Reset physics
    this.exitPhysics();
    this.initPhysics();

    this.stepCount = 0;
    this.resetCamera();
    this.onStatusChange?.('Ready to start', false, 0);
    this.log('✅ RigidBody demo reset complete');
  }

  private runSimulationStep(): void {
    if (!this.isRunning || !this.dynamicsWorld) return;

    // Step physics
    this.dynamicsWorld.stepSimulation(1.0 / 60.0);
    this.stepCount++;

    // Update graphics
    this.syncPhysicsToGraphics();

    // Log status periodically
    if (this.stepCount % 300 === 0) { // Every 5 seconds
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

    // Count objects by type
    const counts = {
      box: 0,
      sphere: 0,
      cylinder: 0,
      ground: 0
    };

    for (const obj of this.physicsObjects) {
      counts[obj.type as keyof typeof counts]++;
    }

    this.log(`Time: ${seconds}s, Objects: ${this.physicsObjects.length} (boxes: ${counts.box}, spheres: ${counts.sphere}, cylinders: ${counts.cylinder})`);
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
  title: 'Physics Examples/RigidBody Demo',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story: `
Advanced rigid body physics demonstration with multiple shape types and interactive spawning.

**Features:**
- Multiple rigid body shapes (boxes, spheres, cylinders)
- Interactive object spawning
- Different masses and materials
- Real-time physics simulation with shadows
- Performance monitoring

**Inspired by:** \`bullet3/examples/RigidBody/\` examples
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
    startBtn.style.cssText = 'padding: 8px 16px; cursor: pointer; background: #28a745; color: white; border: none; border-radius: 4px;';

    const stopBtn = document.createElement('button');
    stopBtn.textContent = 'Stop';
    stopBtn.style.cssText = 'padding: 8px 16px; cursor: pointer; background: #dc3545; color: white; border: none; border-radius: 4px;';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.cssText = 'padding: 8px 16px; cursor: pointer; background: #6c757d; color: white; border: none; border-radius: 4px;';

    const spawnBtn = document.createElement('button');
    spawnBtn.textContent = 'Spawn Object';
    spawnBtn.style.cssText = 'padding: 8px 16px; cursor: pointer; background: #17a2b8; color: white; border: none; border-radius: 4px;';

    const resetCameraBtn = document.createElement('button');
    resetCameraBtn.textContent = 'Reset Camera';
    resetCameraBtn.style.cssText = 'padding: 8px 16px; cursor: pointer; background: #ffc107; color: black; border: none; border-radius: 4px;';

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
      border: 1px solid #ddd;
    `;

    controls.append(startBtn, stopBtn, resetBtn, spawnBtn, resetCameraBtn, status);
    container.append(canvas, controls, logOutput);

    // Initialize demo
    const demo = new RigidBodyDemo(canvas);

    // Log handler
    const logs: string[] = [];
    demo.onLog = (message: string) => {
      logs.push(`${new Date().toLocaleTimeString()}: ${message}`);
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
        status.textContent = `${statusText} (${seconds}s)`;
      } else {
        status.textContent = statusText;
      }

      startBtn.disabled = isRunning;
      stopBtn.disabled = !isRunning;
      spawnBtn.disabled = !isRunning;
    };

    // Button handlers
    startBtn.onclick = () => demo.start();
    stopBtn.onclick = () => demo.stop();
    resetBtn.onclick = () => demo.reset();
    spawnBtn.onclick = () => demo.spawnRandomObject();
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