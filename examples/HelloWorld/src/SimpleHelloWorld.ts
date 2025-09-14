/*
HelloWorld Demo - Simple Console Version
TypeScript port of Bullet3 HelloWorld example
*/

/**
 * Console interface for output
 */
interface ConsoleInterface {
  log(message: string): void;
}

/**
 * Simple HelloWorld Demo - Basic physics simulation without complex dependencies
 *
 * This is a simplified version of the HelloWorld demo that focuses on the core
 * physics simulation without relying on the full CommonRigidBodyBase infrastructure.
 *
 * It demonstrates the same physics concept: a falling sphere hitting a ground plane.
 */
export class SimpleHelloWorldDemo {
  private console: ConsoleInterface;
  private isRunning: boolean = false;
  private stepCount: number = 0;
  private maxSteps: number = 150;
  private stepInterval: number | null = null;

  // Simple physics state
  private spherePosition: { x: number, y: number, z: number } = { x: 2, y: 10, z: 0 };
  private sphereVelocity: { x: number, y: number, z: number } = { x: 0, y: 0, z: 0 };
  private gravity: number = -10; // m/s^2
  private groundY: number = -6; // ground level (sphere center hits at y=-6)
  private bounceCoeff: number = 0.8; // coefficient of restitution

  // Callback functions for external control
  onStatusChange?: (status: string, isRunning: boolean) => void;

  constructor(consoleInterface: ConsoleInterface) {
    this.console = consoleInterface;
  }

  /**
   * Initialize the simulation
   */
  initPhysics(): void {
    this.console.log('🔧 Initializing Simple HelloWorld physics...');

    // Reset physics state
    this.spherePosition = { x: 2, y: 10, z: 0 };
    this.sphereVelocity = { x: 0, y: 0, z: 0 };

    this.console.log('📦 Created ground plane at y = -6');
    this.console.log('⚽ Created falling sphere (radius=1, mass=1) at position (2, 10, 0)');
    this.console.log('🌍 Gravity set to -10 m/s²');
    this.console.log('✅ Simple physics setup complete');
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
    if (!this.isRunning) {
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
    this.stepPhysics(1.0 / 60.0);

    // Print positions of objects (matching original C++ output)
    this.printObjectPositions();

    this.stepCount++;

    // Schedule next step
    this.stepInterval = window.setTimeout(() => {
      this.runSimulationStep();
    }, 16); // ~60 FPS
  }

  /**
   * Simple physics simulation step
   */
  private stepPhysics(deltaTime: number): void {
    // Apply gravity to velocity
    this.sphereVelocity.y += this.gravity * deltaTime;

    // Update position based on velocity
    this.spherePosition.x += this.sphereVelocity.x * deltaTime;
    this.spherePosition.y += this.sphereVelocity.y * deltaTime;
    this.spherePosition.z += this.sphereVelocity.z * deltaTime;

    // Check for ground collision (sphere radius = 1, so center at groundY + 1)
    const groundLevel = this.groundY + 1; // sphere center when touching ground
    if (this.spherePosition.y <= groundLevel && this.sphereVelocity.y < 0) {
      // Collision with ground
      this.spherePosition.y = groundLevel; // place on ground
      this.sphereVelocity.y = -this.sphereVelocity.y * this.bounceCoeff; // bounce

      // Add some energy loss for realism
      if (Math.abs(this.sphereVelocity.y) < 0.1) {
        this.sphereVelocity.y = 0; // stop tiny bounces
      }
    }
  }

  /**
   * Print positions of all objects
   * Replicates the printf output from the original C++ code
   */
  private printObjectPositions(): void {
    // Print ground position (object 0 - static, always at same position)
    this.console.log(`world pos object 1 = 0.000000, -56.000000, 0.000000`);

    // Print sphere position (object 1)
    const x = this.spherePosition.x.toFixed(6);
    const y = this.spherePosition.y.toFixed(6);
    const z = this.spherePosition.z.toFixed(6);
    this.console.log(`world pos object 0 = ${x}, ${y}, ${z}`);
  }

  /**
   * Clean up simulation
   */
  exitPhysics(): void {
    this.stop();
    this.console.log('🧹 Physics cleanup complete');
  }
}