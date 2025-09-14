/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2007 Erwin Coumans  http://bulletphysics.org

This is a TypeScript port of the HelloWorld example from Bullet3.
Original file: bullet3/examples/HelloWorld/HelloWorld.cpp

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
 * @fileoverview HelloWorldDemo - TypeScript port of Bullet3 HelloWorld
 *
 * This is a Hello World program for running a basic Bullet physics simulation
 * Ported from: bullet3/examples/HelloWorld/HelloWorld.cpp
 */

// Import CommonRigidBodyBase and required physics components
import { CommonRigidBodyBase } from '../../../examples/CommonInterfaces/CommonRigidBodyBase';
import type { GUIHelperInterface } from '../../../examples/CommonInterfaces/CommonGUIHelperInterface';

// Import physics classes from the ported codebase
import { btVector3 } from '../../../src/LinearMath/btVector3';
import { btTransform } from '../../../src/LinearMath/btTransform';

// Import collision shapes
import { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btSphereShape } from '../../../src/BulletCollision/CollisionShapes/btSphereShape';

/**
 * Console interface for output
 */
interface ConsoleInterface {
  log(message: string): void;
}

/**
 * Mock GUI Helper implementation for console-only output
 */
class MockGUIHelper implements GUIHelperInterface {
  constructor(consoleInterface: ConsoleInterface) {
    // Store console for potential future use
    void consoleInterface;
  }

  // Minimal required implementations
  getRenderInterface(): any { return null; }
  getAppInterface(): any {
    return {
      getUpAxis(): number { return 1; }, // Y-up
      m_window: {
        isModifierKeyPressed(): boolean { return false; }
      }
    };
  }
  removeGraphicsInstance(_uid: number): void {}
  syncPhysicsToGraphics(_world: any): void {}
  render(_world: any): void {}
}

/**
 * HelloWorld Demo - Basic physics simulation with falling sphere
 *
 * This demo creates:
 * - A large ground box (100x100x100, positioned at y=-56)
 * - A small falling sphere (radius=1, mass=1, starts at (2,10,0))
 *
 * The simulation runs for 150 steps and prints object positions.
 */
export class HelloWorldDemo extends CommonRigidBodyBase {
  private console: ConsoleInterface;
  private isRunning: boolean = false;
  private stepCount: number = 0;
  private maxSteps: number = 150;
  private stepInterval: number | null = null;

  // Callback functions for external control
  onStatusChange?: (status: string, isRunning: boolean) => void;

  constructor(consoleInterface: ConsoleInterface) {
    // Create mock GUI helper for console output
    const mockHelper = new MockGUIHelper(consoleInterface);
    super(mockHelper);
    this.console = consoleInterface;
  }

  /**
   * Initialize the physics world and create objects
   * This replicates the setup from the original C++ HelloWorld example
   */
  initPhysics(): void {
    this.console.log('🔧 Initializing HelloWorld physics...');

    // Initialize the base physics world with default configuration
    super.initPhysics();

    const world = this.getDynamicsWorld();
    if (!world) {
      this.console.log('❌ Failed to create dynamics world');
      return;
    }

    this.console.log('✅ Physics world initialized with gravity (0, -10, 0)');

    // Create the ground - a large static box
    this.createGround();

    // Create the falling sphere
    this.createFallingSphere();

    this.console.log('✅ HelloWorld physics setup complete');
    this.console.log(`📊 Total objects: ${world.getNumCollisionObjects()}`);
  }

  /**
   * Create the ground - a large static box
   * Equivalent to the ground creation in the original C++ code
   */
  private createGround(): void {
    // The ground is a cube of side 100 at position y = -56
    // The sphere will hit it at y = -6, with center at -5
    const groundShape = new btBoxShape(new btVector3(50, 50, 50));

    const groundTransform = new btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new btVector3(0, -56, 0));

    const mass = 0; // Static body (mass = 0)

    // Create the rigid body using base class method
    this.createRigidBody(mass, groundTransform, groundShape);

    this.console.log('📦 Created ground box (100x100x100) at position (0, -56, 0)');
  }

  /**
   * Create the falling sphere
   * Equivalent to the dynamic object creation in the original C++ code
   */
  private createFallingSphere(): void {
    // Create a dynamic rigidbody - a sphere
    const sphereShape = new btSphereShape(1.0); // radius = 1

    const startTransform = new btTransform();
    startTransform.setIdentity();
    startTransform.setOrigin(new btVector3(2, 10, 0));

    const mass = 1.0; // Dynamic body

    // Create the rigid body using base class method
    this.createRigidBody(mass, startTransform, sphereShape);

    this.console.log('⚽ Created falling sphere (radius=1, mass=1) at position (2, 10, 0)');
  }

  /**
   * Start the simulation
   */
  start(): void {
    if (this.isRunning) {
      this.console.log('⚠️  Simulation already running');
      return;
    }

    this.console.log('🚀 Starting HelloWorld simulation...');
    this.console.log(`📈 Running ${this.maxSteps} simulation steps at 60 FPS`);
    this.console.log('');

    this.isRunning = true;
    this.stepCount = 0;
    this.onStatusChange?.('Running simulation...', true);

    // Run simulation steps with timing
    this.runSimulationStep();
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.console.log('');
    this.console.log('⏹️  Simulation stopped by user');
    this.isRunning = false;
    this.onStatusChange?.('Stopped', false);

    if (this.stepInterval) {
      clearTimeout(this.stepInterval);
      this.stepInterval = null;
    }
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    this.stop();

    this.console.log('');
    this.console.log('🔄 Resetting simulation...');

    // Clean up existing physics
    this.exitPhysics();

    // Reinitialize
    this.initPhysics();

    this.stepCount = 0;
    this.onStatusChange?.('Ready to start', false);
    this.console.log('✅ Simulation reset complete');
  }

  /**
   * Run a single simulation step
   */
  private runSimulationStep(): void {
    const world = this.getDynamicsWorld();
    if (!this.isRunning || !world) {
      return;
    }

    if (this.stepCount >= this.maxSteps) {
      this.console.log('');
      this.console.log(`✅ Simulation completed after ${this.maxSteps} steps`);
      this.isRunning = false;
      this.onStatusChange?.('Simulation complete', false);
      return;
    }

    // Step the simulation (60 FPS = 1/60 seconds per step)
    super.stepSimulation(1.0 / 60.0);

    // Print positions of all objects (matching original C++ output)
    this.printObjectPositions();

    this.stepCount++;

    // Schedule next step
    this.stepInterval = window.setTimeout(() => {
      this.runSimulationStep();
    }, 16); // ~60 FPS
  }

  /**
   * Print positions of all objects
   * Replicates the printf output from the original C++ code
   */
  private printObjectPositions(): void {
    const world = this.getDynamicsWorld();
    if (!world) return;

    // Print positions of all objects (from last to first, like the original)
    for (let j = world.getNumCollisionObjects() - 1; j >= 0; j--) {
      const obj = world.getCollisionObjectArray()[j];
      const body = obj; // In our TypeScript port, all objects are rigid bodies

      let trans: btTransform;

      // Get world transform
      if (body && body.getMotionState && body.getMotionState()) {
        trans = new btTransform();
        body.getMotionState()!.getWorldTransform(trans);
      } else {
        trans = obj.getWorldTransform();
      }

      const origin = trans.getOrigin();

      // Format to match original C++ printf output
      const x = origin.x().toFixed(6);
      const y = origin.y().toFixed(6);
      const z = origin.z().toFixed(6);

      this.console.log(`world pos object ${j} = ${x}, ${y}, ${z}`);
    }
  }

  /**
   * Override exit physics to ensure cleanup
   */
  exitPhysics(): void {
    this.stop();
    super.exitPhysics();
    this.console.log('🧹 Physics cleanup complete');
  }

  /**
   * Required interface implementations
   */
  mouseMoveCallback(_x: number, _y: number): boolean {
    return false; // No mouse interaction in HelloWorld
  }

  mouseButtonCallback(_button: number, _state: number, _x: number, _y: number): boolean {
    return false; // No mouse interaction in HelloWorld
  }

  keyboardCallback(_key: number, _state: number): boolean {
    return false; // No keyboard interaction in HelloWorld
  }

  physicsDebugDraw(_debugFlags: number): void {
    // No debug drawing in console-only HelloWorld
  }

  renderScene(): void {
    // No rendering in console-only HelloWorld
  }
}