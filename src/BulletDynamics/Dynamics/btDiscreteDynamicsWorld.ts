/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a TypeScript port of the original Bullet Physics Engine C++ source code.
This version has been substantially modified from the original.

Original software license:
This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

import { btDynamicsWorld, btDynamicsWorldType, btTypedConstraint } from './btDynamicsWorld';
import { btDispatcher } from '../../BulletCollision/BroadphaseCollision/btDispatcher';
import { btBroadphaseInterface } from '../../BulletCollision/BroadphaseCollision/btBroadphaseInterface';
import { btCollisionConfiguration } from '../../BulletCollision/CollisionDispatch/btCollisionConfiguration';
import { btConstraintSolver } from '../ConstraintSolver/btConstraintSolver';
// import { btSimulationIslandManager } from '../../BulletCollision/CollisionDispatch/btSimulationIslandManager'; // Temporarily disabled
import { btRigidBody } from './btRigidBody';
import { btVector3 } from '../../LinearMath/btVector3';
import { btTransform } from '../../LinearMath/btTransform';
import { btActionInterface } from './btActionInterface';
import { btContactSolverInfo } from '../ConstraintSolver/btContactSolverInfo';
import { btCollisionObject } from '../../BulletCollision/CollisionDispatch/btCollisionObject';

// Helper function to check if number is approximately zero
function btFuzzyZero(x: number): boolean {
  return Math.abs(x) < Number.EPSILON;
}

/**
 * btDiscreteDynamicsWorld provides discrete rigid body simulation
 * those classes replace the obsolete CcdPhysicsEnvironment/CcdPhysicsController
 */
export class btDiscreteDynamicsWorld extends btDynamicsWorld {
  protected m_sortedConstraints: btTypedConstraint[] = [];
  protected m_constraintSolver: btConstraintSolver;
  // protected m_islandManager: btSimulationIslandManager; // Temporarily disabled
  protected m_constraints: btTypedConstraint[] = [];
  protected m_nonStaticRigidBodies: btRigidBody[] = [];
  protected m_gravity: btVector3 = new btVector3(0, -10, 0);
  
  // For variable timesteps
  protected m_localTime: number = 0;
  protected m_fixedTimeStep: number = 0;
  
  protected m_ownsIslandManager: boolean = true;
  protected m_ownsConstraintSolver: boolean = true;
  protected m_synchronizeAllMotionStates: boolean = false;
  protected m_applySpeculativeContactRestitution: boolean = false;
  
  protected m_actions: btActionInterface[] = [];
  protected m_profileTimings: number = 0;
  protected m_latencyMotionStateInterpolation: boolean = true;

  constructor(
    dispatcher: btDispatcher,
    pairCache: btBroadphaseInterface,
    constraintSolver: btConstraintSolver | null,
    collisionConfiguration: btCollisionConfiguration
  ) {
    super(dispatcher, pairCache, collisionConfiguration);

    if (!constraintSolver) {
      // Create default constraint solver if none provided
      this.m_constraintSolver = {
        solveGroup: () => 0,
        reset: () => {},
        getSolverType: () => 1,
        prepareSolve: () => {},
        allSolved: () => {}
      } as any;
      this.m_ownsConstraintSolver = true;
    } else {
      this.m_constraintSolver = constraintSolver;
      this.m_ownsConstraintSolver = false;
    }

    // this.m_islandManager = new btSimulationIslandManager(); // Temporarily disabled
  }

  /**
   * Main physics simulation step
   * If maxSubSteps > 0, it will interpolate motion between fixedTimeStep's
   */
  stepSimulation(timeStep: number, maxSubSteps: number = 1, fixedTimeStep: number = 1.0 / 60.0): number {
    this.startProfiling(timeStep);

    let numSimulationSubSteps = 0;

    if (maxSubSteps) {
      // Fixed timestep with interpolation
      this.m_fixedTimeStep = fixedTimeStep;
      this.m_localTime += timeStep;
      if (this.m_localTime >= fixedTimeStep) {
        numSimulationSubSteps = Math.floor(this.m_localTime / fixedTimeStep);
        this.m_localTime -= numSimulationSubSteps * fixedTimeStep;
      }
    } else {
      // Variable timestep
      fixedTimeStep = timeStep;
      this.m_localTime = this.m_latencyMotionStateInterpolation ? 0 : timeStep;
      this.m_fixedTimeStep = 0;
      if (btFuzzyZero(timeStep)) {
        numSimulationSubSteps = 0;
        maxSubSteps = 0;
      } else {
        numSimulationSubSteps = 1;
        maxSubSteps = 1;
      }
    }

    if (numSimulationSubSteps) {
      // Clamp the number of substeps to prevent simulation grinding
      const clampedSimulationSteps = Math.min(numSimulationSubSteps, maxSubSteps);

      this.saveKinematicState(fixedTimeStep * clampedSimulationSteps);
      this.applyGravity();

      for (let i = 0; i < clampedSimulationSteps; i++) {
        this.internalSingleStepSimulation(fixedTimeStep);
        this.synchronizeMotionStates();
      }
    } else {
      this.synchronizeMotionStates();
    }

    this.clearForces();

    return numSimulationSubSteps;
  }

  protected startProfiling(_timeStep: number): void {
    // Profiling implementation would go here
  }

  protected saveKinematicState(timeStep: number): void {
    // Iterate over collision objects to save kinematic state
    for (let i = 0; i < this.m_collisionObjects.length; i++) {
      const colObj = this.m_collisionObjects[i];
      const body = colObj as btRigidBody;
      
      if (body && body.getActivationState && body.getActivationState() !== 2) { // ISLAND_SLEEPING = 2
        if (body.isKinematicObject && body.isKinematicObject()) {
          // Save kinematic state for next frame velocity calculation
          if (body.saveKinematicState) {
            body.saveKinematicState(timeStep);
          }
        }
      }
    }
  }

  protected internalSingleStepSimulation(timeStep: number): void {
    // Call pre-tick callback if set
    if (this.m_internalPreTickCallback) {
      this.m_internalPreTickCallback(this, timeStep);
    }

    // Apply gravity and predict motion
    this.predictUnconstraintMotion(timeStep);

    const dispatchInfo = this.getDispatchInfo();
    dispatchInfo.m_timeStep = timeStep;
    dispatchInfo.m_stepCount = 0;

    // Perform collision detection
    this.performDiscreteCollisionDetection();

    this.calculateSimulationIslands();

    this.getSolverInfo().m_timeStep = timeStep;

    // Solve contact and other joint constraints
    this.solveConstraints(this.getSolverInfo());

    // Integrate transforms
    this.integrateTransforms(timeStep);

    // Update vehicle simulation
    this.updateActions(timeStep);

    this.updateActivationState(timeStep);

    // Call post-tick callback if set
    if (this.m_internalTickCallback) {
      this.m_internalTickCallback(this, timeStep);
    }
  }

  protected predictUnconstraintMotion(timeStep: number): void {
    for (const body of this.m_nonStaticRigidBodies) {
      if (!body.isStaticOrKinematicObject()) {
        // Don't integrate/update velocities here, it happens in the constraint solver
        // Simplified prediction - in full implementation this would predict transforms
        if (body.predictIntegratedTransform && body.getWorldTransform) {
          const predictedTransform = body.getWorldTransform().clone();
          body.predictIntegratedTransform(timeStep, predictedTransform);
        }
      }
    }
  }

  protected integrateTransforms(timeStep: number): void {
    // Integrate transforms for all non-static rigid bodies
    const predictedTrans = new btTransform();
    for (const body of this.m_nonStaticRigidBodies) {
      if (body.isActive() && !body.isStaticOrKinematicObject()) {
        // Predict integrated transform (position integration)
        if (body.predictIntegratedTransform) {
          body.predictIntegratedTransform(timeStep, predictedTrans);
          // Apply the predicted transform to update the body's position
          body.proceedToTransform(predictedTrans);
        }
      }
    }
  }

  protected updateActions(timeStep: number): void {
    for (const action of this.m_actions) {
      action.updateAction(this, timeStep);
    }
  }

  protected updateActivationState(timeStep: number): void {
    for (const body of this.m_nonStaticRigidBodies) {
      if (body.updateDeactivation) {
        body.updateDeactivation(timeStep);

        if (body.wantsSleeping && body.wantsSleeping()) {
          if (body.isStaticOrKinematicObject()) {
            body.setActivationState(2); // ISLAND_SLEEPING
          } else {
            if (body.getActivationState() === 1) { // ACTIVE_TAG
              body.setActivationState(3); // WANTS_DEACTIVATION
            }
            if (body.getActivationState() === 2) { // ISLAND_SLEEPING
              body.setAngularVelocity(new btVector3(0, 0, 0));
              body.setLinearVelocity(new btVector3(0, 0, 0));
            }
          }
        } else {
          if (body.getActivationState() !== 5) { // DISABLE_DEACTIVATION
            body.setActivationState(1); // ACTIVE_TAG
          }
        }
      }
    }
  }

  protected calculateSimulationIslands(): void {
    // this.getSimulationIslandManager().updateActivationState(this, this.getDispatcher()); // Temporarily disabled

    // Store the island id in each body
    // this.getSimulationIslandManager().storeIslandActivationState(this); // Temporarily disabled
  }

  solveConstraints(solverInfo: btContactSolverInfo): void {
    // Sort constraints by island ID - simplified version
    this.m_sortedConstraints = [...this.m_constraints];

    this.m_constraintSolver.prepareSolve(
      this.getNumCollisionObjects(),
      this.getDispatcher().getNumManifolds()
    );

    // Simplified constraint solving - full implementation would use islands
    this.m_constraintSolver.solveGroup(
      this.m_collisionObjects,
      this.m_collisionObjects.length,
      [],
      0,
      this.m_sortedConstraints,
      this.m_sortedConstraints.length,
      solverInfo,
      this.getDebugDrawer(),
      this.getDispatcher()
    );

    this.m_constraintSolver.allSolved(solverInfo, this.getDebugDrawer());
  }

  synchronizeMotionStates(): void {
    if (this.m_synchronizeAllMotionStates) {
      // Synchronize all collision objects
      for (const colObj of this.m_collisionObjects) {
        const body = colObj as btRigidBody;
        if (body) {
          this.synchronizeSingleMotionState(body);
        }
      }
    } else {
      // Synchronize only active rigid bodies
      for (const body of this.m_nonStaticRigidBodies) {
        if (body.isActive()) {
          this.synchronizeSingleMotionState(body);
        }
      }
    }
  }

  synchronizeSingleMotionState(body: btRigidBody): void {
    if (body.getMotionState && body.getMotionState() && !body.isStaticOrKinematicObject()) {
      // Update motion state with interpolated transform
      // Simplified implementation
      if (body.getWorldTransform) {
        const motionState = body.getMotionState();
        if (motionState) {
          motionState.setWorldTransform(body.getWorldTransform());
        }
      }
    }
  }

  // World management methods
  setGravity(gravity: btVector3): void {
    this.m_gravity = gravity.clone();
    for (const body of this.m_nonStaticRigidBodies) {
      if (body.isActive() && body.setGravity) {
        body.setGravity(gravity);
      }
    }
  }

  getGravity(): btVector3 {
    return this.m_gravity.clone();
  }

  addRigidBody(body: btRigidBody, group?: number, mask?: number): void {
    if (!body.isStaticOrKinematicObject()) {
      body.setGravity(this.m_gravity);
    }

    if (body.getCollisionShape()) {
      if (!body.isStaticObject()) {
        this.m_nonStaticRigidBodies.push(body);
      } else {
        body.setActivationState(2); // ISLAND_SLEEPING
      }

      // Simplified collision filter setup - using default values
      const collisionFilterGroup = group !== undefined ? group : 1; // Default
      const collisionFilterMask = mask !== undefined ? mask : -1; // All

      this.addCollisionObject(body, collisionFilterGroup, collisionFilterMask);
    }
  }

  removeRigidBody(body: btRigidBody): void {
    const index = this.m_nonStaticRigidBodies.indexOf(body);
    if (index !== -1) {
      this.m_nonStaticRigidBodies.splice(index, 1);
    }
    this.removeCollisionObject(body);
  }

  removeCollisionObject(collisionObject: btCollisionObject): void {
    const body = collisionObject as btRigidBody;
    // Check if it's a rigid body by checking common rigid body properties
    if (body && body.isStaticOrKinematicObject !== undefined) {
      this.removeRigidBody(body);
    } else {
      super.removeCollisionObject(collisionObject);
    }
  }

  // Constraint management
  addConstraint(constraint: btTypedConstraint, _disableCollisionsBetweenLinkedBodies: boolean = false): void {
    this.m_constraints.push(constraint);
  }

  removeConstraint(constraint: btTypedConstraint): void {
    const index = this.m_constraints.indexOf(constraint);
    if (index !== -1) {
      this.m_constraints.splice(index, 1);
    }
  }

  getNumConstraints(): number {
    return this.m_constraints.length;
  }

  getConstraint(index: number): btTypedConstraint | null {
    return index >= 0 && index < this.m_constraints.length ? this.m_constraints[index] : null;
  }

  // Action management
  addAction(action: btActionInterface): void {
    this.m_actions.push(action);
  }

  removeAction(action: btActionInterface): void {
    const index = this.m_actions.indexOf(action);
    if (index !== -1) {
      this.m_actions.splice(index, 1);
    }
  }

  // Solver management
  setConstraintSolver(solver: btConstraintSolver): void {
    this.m_constraintSolver = solver;
  }

  getConstraintSolver(): btConstraintSolver {
    return this.m_constraintSolver;
  }

  // getSimulationIslandManager(): btSimulationIslandManager {
  //   return this.m_islandManager;
  // } // Temporarily disabled

  getWorldType(): btDynamicsWorldType {
    return btDynamicsWorldType.BT_DISCRETE_DYNAMICS_WORLD;
  }

  // Force management
  clearForces(): void {
    for (const body of this.m_nonStaticRigidBodies) {
      if (body.clearForces) {
        body.clearForces();
      }
    }
  }

  applyGravity(): void {
    for (const body of this.m_nonStaticRigidBodies) {
      if (body.isActive() && body.applyGravity) {
        body.applyGravity();
      }
    }
  }

  debugDrawWorld(): void {
    // Simplified debug drawing - would call parent if it had concrete implementation
    const debugDrawer = this.getDebugDrawer();
    if (debugDrawer) {
      // Draw constraints
      for (const constraint of this.m_constraints) {
        this.debugDrawConstraint(constraint);
      }

      // Draw actions
      for (const action of this.m_actions) {
        action.debugDraw(debugDrawer);
      }
    }
  }

  protected debugDrawConstraint(_constraint: btTypedConstraint): void {
    // Debug draw constraint - would need proper constraint implementation
  }

  // Settings
  setSynchronizeAllMotionStates(synchronizeAll: boolean): void {
    this.m_synchronizeAllMotionStates = synchronizeAll;
  }

  getSynchronizeAllMotionStates(): boolean {
    return this.m_synchronizeAllMotionStates;
  }

  setApplySpeculativeContactRestitution(enable: boolean): void {
    this.m_applySpeculativeContactRestitution = enable;
  }

  getApplySpeculativeContactRestitution(): boolean {
    return this.m_applySpeculativeContactRestitution;
  }

  setLatencyMotionStateInterpolation(latencyInterpolation: boolean): void {
    this.m_latencyMotionStateInterpolation = latencyInterpolation;
  }

  getLatencyMotionStateInterpolation(): boolean {
    return this.m_latencyMotionStateInterpolation;
  }

  getNonStaticRigidBodies(): btRigidBody[] {
    return [...this.m_nonStaticRigidBodies];
  }

  // Legacy vehicle/character methods (deprecated, use actions instead)
  addVehicle(vehicle: btActionInterface): void {
    this.addAction(vehicle);
  }

  removeVehicle(vehicle: btActionInterface): void {
    this.removeAction(vehicle);
  }

  addCharacter(character: btActionInterface): void {
    this.addAction(character);
  }

  removeCharacter(character: btActionInterface): void {
    this.removeAction(character);
  }
}