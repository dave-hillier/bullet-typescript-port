/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2007 Erwin Coumans  http://bulletphysics.org

This is a Storybook story for the HelloWorld physics example using Three.js visualization.
*/

/**
 * @fileoverview HelloWorld.stories - Storybook story for HelloWorld physics demo
 */

import type { Meta, StoryObj } from '@storybook/html';
import { CommonRigidBodyBase } from '../../../examples/CommonInterfaces/CommonRigidBodyBase';
import { ThreeJSGUIHelper } from './helpers/ThreeJSGUIHelper';
import { btVector3 } from '../../../src/LinearMath/btVector3';
import { btTransform } from '../../../src/LinearMath/btTransform';
import { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btSphereShape } from '../../../src/BulletCollision/CollisionShapes/btSphereShape';

/**
 * HelloWorld Physics Demo
 *
 * This is a faithful port of the classic Bullet HelloWorld example.
 * Features:
 * - Large ground box (100x100x100) at position (0, -56, 0)
 * - Small falling sphere (radius=1, mass=1) starting at (2, 10, 0)
 * - Real-time physics simulation with Three.js visualization
 * - Interactive controls (Play/Pause/Reset)
 */
class HelloWorldDemo extends CommonRigidBodyBase {
  private isRunning: boolean = false;
  private stepCount: number = 0;
  private maxSteps: number = 300; // Run longer for visual effect
  private animationId: number | null = null;
  private guiHelper: ThreeJSGUIHelper;

  // UI callbacks
  onStatusChange?: (status: string, isRunning: boolean, step: number) => void;
  onLog?: (message: string) => void;

  constructor(guiHelper: ThreeJSGUIHelper) {
    super(guiHelper);
    this.guiHelper = guiHelper;
  }

  /**
   * Initialize the physics world and create objects
   */
  initPhysics(): void {
    this.log('🔧 Initializing HelloWorld physics...');

    // Initialize the base physics world
    super.initPhysics();

    const world = this.getDynamicsWorld();
    if (!world) {
      this.log('❌ Failed to create dynamics world');
      return;
    }

    // Create the ground and falling sphere
    this.createGround();
    this.createFallingSphere();

    // Auto-generate graphics for all physics objects
    this.guiHelper.autogenerateGraphicsObjects(world);

    // Reset camera to a good viewing angle
    this.guiHelper.resetCamera(15, 45, -20, 0, 0, 0);

    this.log('✅ HelloWorld physics setup complete');
    this.log(`📊 Total objects: ${world.getNumCollisionObjects()}`);
    this.onStatusChange?.('Ready to start', false, 0);
  }

  /**
   * Create the ground - a large static box
   */
  private createGround(): void {
    // The ground is a cube of side 100 at position y = -56
    const groundShape = new btBoxShape(new btVector3(50, 50, 50));

    const groundTransform = new btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new btVector3(0, -56, 0));

    const mass = 0; // Static body
    this.createRigidBody(mass, groundTransform, groundShape);

    this.log('📦 Created ground box (100x100x100) at position (0, -56, 0)');
  }

  /**
   * Create the falling sphere
   */
  private createFallingSphere(): void {
    // Create a dynamic rigidbody - a sphere
    const sphereShape = new btSphereShape(1.0); // radius = 1

    const startTransform = new btTransform();
    startTransform.setIdentity();
    startTransform.setOrigin(new btVector3(2, 10, 0));

    const mass = 1.0; // Dynamic body
    this.createRigidBody(mass, startTransform, sphereShape);

    this.log('⚽ Created falling sphere (radius=1, mass=1) at position (2, 10, 0)');
  }

  /**
   * Start the simulation
   */
  start(): void {
    if (this.isRunning) {
      this.log('⚠️  Simulation already running');
      return;
    }

    this.log('🚀 Starting HelloWorld simulation...');
    this.log(`📈 Running simulation at 60 FPS`);

    this.isRunning = true;
    this.stepCount = 0;
    this.onStatusChange?.('Running simulation...', true, 0);

    // Start the render loop
    const world = this.getDynamicsWorld();
    if (world) {
      this.guiHelper.startRenderLoop(world);
    }

    // Start physics simulation
    this.runSimulationStep();
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.log('⏹️  Simulation stopped');
    this.isRunning = false;
    this.onStatusChange?.('Stopped', false, this.stepCount);

    this.guiHelper.stopRenderLoop();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    this.stop();
    this.log('🔄 Resetting simulation...');

    // Clean up existing physics
    this.exitPhysics();

    // Clear graphics
    this.guiHelper.clearGraphics();

    // Reinitialize
    this.initPhysics();

    this.stepCount = 0;
    this.onStatusChange?.('Ready to start', false, 0);
    this.log('✅ Simulation reset complete');
  }

  /**
   * Run a single simulation step
   */
  private runSimulationStep(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.stepCount >= this.maxSteps) {
      this.log(`✅ Simulation completed after ${this.maxSteps} steps`);
      this.stop();
      return;
    }

    // Step the simulation (60 FPS)
    super.stepSimulation(1.0 / 60.0);
    this.stepCount++;

    // Log position periodically (every 30 steps = every 0.5 seconds)
    if (this.stepCount % 30 === 0) {
      this.printObjectPositions();
    }

    this.onStatusChange?.('Running simulation...', true, this.stepCount);

    // Schedule next step
    this.animationId = window.setTimeout(() => {
      this.runSimulationStep();
    }, 16); // ~60 FPS
  }

  /**
   * Print positions of all objects
   */
  private printObjectPositions(): void {
    const world = this.getDynamicsWorld();
    if (!world) return;

    this.log(`--- Step ${this.stepCount} ---`);

    for (let j = world.getNumCollisionObjects() - 1; j >= 0; j--) {
      const obj = world.getCollisionObjectArray()[j];
      const body = obj;

      let trans: btTransform;

      if (body && body.getMotionState && body.getMotionState()) {
        trans = new btTransform();
        body.getMotionState()!.getWorldTransform(trans);
      } else {
        trans = obj.getWorldTransform();
      }

      const origin = trans.getOrigin();
      const x = origin.x().toFixed(3);
      const y = origin.y().toFixed(3);
      const z = origin.z().toFixed(3);

      this.log(`object ${j} pos: (${x}, ${y}, ${z})`);
    }
  }

  /**
   * Helper method for logging
   */
  private log(message: string): void {
    console.log(message);
    this.onLog?.(message);
  }

  /**
   * Required interface implementations
   */
  mouseMoveCallback(_x: number, _y: number): boolean {
    return false;
  }

  mouseButtonCallback(_button: number, _state: number, _x: number, _y: number): boolean {
    return false;
  }

  keyboardCallback(_key: number, _state: number): boolean {
    return false;
  }

  physicsDebugDraw(_debugFlags: number): void {
    // Debug drawing handled by Three.js renderer
  }

  renderScene(): void {
    // Rendering handled by ThreeJSGUIHelper
  }
}

// Story configuration
const meta: Meta = {
  title: 'Physics Examples/HelloWorld',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        story: `
The classic Bullet Physics HelloWorld example with Three.js visualization.

**Features:**
- Large ground box (static)
- Falling sphere with gravity
- Real-time physics simulation
- Interactive controls

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

    // Initialize physics demo
    const guiHelper = new ThreeJSGUIHelper(canvas, 800, 600);
    const demo = new HelloWorldDemo(guiHelper);

    // Log output handler
    const logs: string[] = [];
    demo.onLog = (message: string) => {
      logs.push(message);
      // Keep last 50 log entries
      if (logs.length > 50) {
        logs.shift();
      }
      logOutput.textContent = logs.join('\n');
      logOutput.scrollTop = logOutput.scrollHeight;
    };

    // Status change handler
    demo.onStatusChange = (statusText: string, isRunning: boolean, step: number) => {
      if (step > 0) {
        status.textContent = `${statusText} (Step: ${step})`;
      } else {
        status.textContent = statusText;
      }

      startBtn.disabled = isRunning;
      stopBtn.disabled = !isRunning;
    };

    // Button event handlers
    startBtn.onclick = () => demo.start();
    stopBtn.onclick = () => demo.stop();
    resetBtn.onclick = () => demo.reset();

    // Initialize the physics world
    demo.initPhysics();

    // Handle cleanup when story is removed
    const cleanup = () => {
      demo.stop();
      demo.exitPhysics();
    };

    // Store cleanup function on container for potential cleanup
    (container as any).cleanup = cleanup;

    return container;
  }
};

export const AutoRun: Story = {
  ...Default,
  parameters: {
    docs: {
      description: {
        story: 'HelloWorld demo that starts automatically when loaded.'
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
    }, 500);

    return container;
  }
};