/*
Unit tests for btDiscreteDynamicsWorld
Tests the main physics simulation world functionality
*/

import { btDiscreteDynamicsWorld } from './btDiscreteDynamicsWorld';
import { btDynamicsWorldType } from './btDynamicsWorld';
import { btVector3 } from '../../LinearMath/btVector3';

// Simple mock implementations for testing
class MockDispatcher {
  getNumManifolds(): number { return 0; }
  getManifoldByIndexInternal(_index: number): any { return null; }
}

class MockBroadphase {
  // Minimal mock implementation
}

class MockConstraintSolver {
  solveGroup(): number { return 0; }
  reset(): void {}
  getSolverType(): number { return 1; }
  prepareSolve(): void {}
  allSolved(): void {}
}

class MockCollisionConfiguration {
  // Minimal mock implementation
}

describe('btDiscreteDynamicsWorld Basic Tests', () => {
  let world: btDiscreteDynamicsWorld;

  beforeEach(() => {
    const dispatcher = new MockDispatcher() as any;
    const broadphase = new MockBroadphase() as any;
    const constraintSolver = new MockConstraintSolver() as any;
    const collisionConfig = new MockCollisionConfiguration() as any;
    
    world = new btDiscreteDynamicsWorld(
      dispatcher,
      broadphase,
      constraintSolver,
      collisionConfig
    );
  });

  describe('Construction and Basic Properties', () => {
    test('should construct with correct world type', () => {
      expect(world.getWorldType()).toBe(btDynamicsWorldType.BT_DISCRETE_DYNAMICS_WORLD);
    });

    test('should initialize with default gravity', () => {
      const gravity = world.getGravity();
      expect(gravity.x()).toBe(0);
      expect(gravity.y()).toBe(-10);
      expect(gravity.z()).toBe(0);
    });

    test('should initialize with no constraints', () => {
      expect(world.getNumConstraints()).toBe(0);
    });

    test('should initialize with constraint solver', () => {
      const solver = world.getConstraintSolver();
      expect(solver).toBeDefined();
    });

    // test('should initialize with simulation island manager', () => {
    //   const islandManager = world.getSimulationIslandManager();
    //   expect(islandManager).toBeDefined();
    // }); // Temporarily disabled
  });

  describe('Gravity Management', () => {
    test('should set and get gravity', () => {
      const newGravity = new btVector3(1, 2, 3);
      world.setGravity(newGravity);
      
      const retrievedGravity = world.getGravity();
      expect(retrievedGravity.x()).toBe(1);
      expect(retrievedGravity.y()).toBe(2);
      expect(retrievedGravity.z()).toBe(3);
    });

    test('should not modify original gravity vector when setting', () => {
      const originalGravity = new btVector3(1, 2, 3);
      world.setGravity(originalGravity);
      
      originalGravity.setValue(4, 5, 6);
      
      const worldGravity = world.getGravity();
      expect(worldGravity.x()).toBe(1);
      expect(worldGravity.y()).toBe(2);
      expect(worldGravity.z()).toBe(3);
    });
  });

  describe('Physics Simulation', () => {
    test('should step simulation with variable timestep', () => {
      const numSteps = world.stepSimulation(1.0 / 60.0, 0); // maxSubSteps = 0 means variable timestep
      expect(numSteps).toBe(1);
    });

    test('should step simulation with fixed timestep', () => {
      const numSteps = world.stepSimulation(1.0 / 30.0, 2, 1.0 / 60.0);
      expect(numSteps).toBeGreaterThanOrEqual(0);
      expect(numSteps).toBeLessThanOrEqual(2);
    });

    test('should handle zero timestep', () => {
      const numSteps = world.stepSimulation(0, 1);
      expect(numSteps).toBe(0);
    });

    test('should handle very small timestep', () => {
      const numSteps = world.stepSimulation(0.0001, 1);
      expect(numSteps).toBeGreaterThanOrEqual(0);
    });

    test('should handle large timestep with clamping', () => {
      const numSteps = world.stepSimulation(1.0, 2, 1.0 / 60.0); // Many substeps requested, max 2
      expect(numSteps).toBeLessThanOrEqual(2);
    });
  });

  describe('Settings and Configuration', () => {
    test('should manage synchronize all motion states setting', () => {
      expect(world.getSynchronizeAllMotionStates()).toBe(false);
      
      world.setSynchronizeAllMotionStates(true);
      expect(world.getSynchronizeAllMotionStates()).toBe(true);
      
      world.setSynchronizeAllMotionStates(false);
      expect(world.getSynchronizeAllMotionStates()).toBe(false);
    });

    test('should manage speculative contact restitution setting', () => {
      expect(world.getApplySpeculativeContactRestitution()).toBe(false);
      
      world.setApplySpeculativeContactRestitution(true);
      expect(world.getApplySpeculativeContactRestitution()).toBe(true);
      
      world.setApplySpeculativeContactRestitution(false);
      expect(world.getApplySpeculativeContactRestitution()).toBe(false);
    });

    test('should manage latency motion state interpolation setting', () => {
      expect(world.getLatencyMotionStateInterpolation()).toBe(true);
      
      world.setLatencyMotionStateInterpolation(false);
      expect(world.getLatencyMotionStateInterpolation()).toBe(false);
      
      world.setLatencyMotionStateInterpolation(true);
      expect(world.getLatencyMotionStateInterpolation()).toBe(true);
    });

    test('should allow constraint solver replacement', () => {
      const newSolver = new MockConstraintSolver() as any;
      const originalSolver = world.getConstraintSolver();
      
      world.setConstraintSolver(newSolver);
      expect(world.getConstraintSolver()).toBe(newSolver);
      expect(world.getConstraintSolver()).not.toBe(originalSolver);
    });
  });

  describe('Non-static Rigid Bodies Tracking', () => {
    test('should initialize with empty non-static rigid bodies array', () => {
      const bodies = world.getNonStaticRigidBodies();
      expect(bodies).toBeDefined();
      expect(bodies.length).toBe(0);
    });

    test('should return copy of non-static rigid bodies array', () => {
      const bodies1 = world.getNonStaticRigidBodies();
      const bodies2 = world.getNonStaticRigidBodies();
      
      expect(bodies1).toEqual(bodies2);
      expect(bodies1).not.toBe(bodies2); // Should be different array instances
    });
  });

  describe('Constraint Management', () => {
    test('should handle empty constraint list', () => {
      expect(world.getNumConstraints()).toBe(0);
      expect(world.getConstraint(0)).toBeNull();
      expect(world.getConstraint(-1)).toBeNull();
      expect(world.getConstraint(100)).toBeNull();
    });
  });

  describe('Force Management', () => {
    test('should execute clear forces without errors', () => {
      expect(() => {
        world.clearForces();
      }).not.toThrow();
    });

    test('should execute apply gravity without errors', () => {
      expect(() => {
        world.applyGravity();
      }).not.toThrow();
    });
  });

  describe('Motion State Synchronization', () => {
    test('should synchronize motion states without errors', () => {
      expect(() => {
        world.synchronizeMotionStates();
      }).not.toThrow();
    });
  });

  describe('Debug Drawing', () => {
    test('should call debug draw without errors', () => {
      expect(() => {
        world.debugDrawWorld();
      }).not.toThrow();
    });
  });

  describe('Error Conditions and Edge Cases', () => {
    test('should handle null constraint solver in constructor', () => {
      const dispatcher = new MockDispatcher() as any;
      const broadphase = new MockBroadphase() as any;
      const collisionConfig = new MockCollisionConfiguration() as any;
      
      expect(() => {
        const testWorld = new btDiscreteDynamicsWorld(
          dispatcher,
          broadphase,
          null,
          collisionConfig
        );
        // Should create default solver and not crash
        expect(testWorld.getConstraintSolver()).toBeDefined();
        expect(testWorld.getWorldType()).toBe(btDynamicsWorldType.BT_DISCRETE_DYNAMICS_WORLD);
      }).not.toThrow();
    });

    test('should handle multiple simulation steps', () => {
      expect(() => {
        for (let i = 0; i < 10; i++) {
          world.stepSimulation(1.0 / 60.0, 1, 1.0 / 60.0);
        }
      }).not.toThrow();
    });

    test('should handle negative timestep gracefully', () => {
      const numSteps = world.stepSimulation(-1.0 / 60.0, 1);
      expect(numSteps).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Solver Info Management', () => {
    test('should have solver info accessible', () => {
      const solverInfo = world.getSolverInfo();
      expect(solverInfo).toBeDefined();
      expect(typeof solverInfo.m_timeStep).toBe('number');
      expect(typeof solverInfo.m_numIterations).toBe('number');
    });

    test('should have reasonable default solver settings', () => {
      const solverInfo = world.getSolverInfo();
      expect(solverInfo.m_numIterations).toBeGreaterThan(0);
      expect(solverInfo.m_timeStep).toBeGreaterThan(0);
      expect(solverInfo.m_damping).toBeGreaterThanOrEqual(0);
      expect(solverInfo.m_friction).toBeGreaterThanOrEqual(0);
    });
  });
});