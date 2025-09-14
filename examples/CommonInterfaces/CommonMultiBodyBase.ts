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

/**
 * @fileoverview CommonMultiBodyBase - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonMultiBodyBase.h
 *
 * This class provides a common base implementation for multi-body physics examples,
 * extending beyond rigid body physics to include articulated body dynamics using
 * the Featherstone algorithm. This includes multi-body constraints, dynamics, and
 * specialized picking for articulated bodies.
 */

// Import interfaces from already ported files
import type { CommonExampleInterface } from './CommonExampleInterface';
import type { GUIHelperInterface } from './CommonGUIHelperInterface';
import type { CommonRenderInterface } from './CommonRenderInterface';
import type { CommonWindowInterface } from './CommonWindowInterface';

// Import keyboard constants
import { B3G_F3, B3G_ALT, B3G_CONTROL } from './CommonCallbacks';

// Import Bullet physics classes from the ported codebase
import { btVector3 } from '../../src/LinearMath/btVector3';
import { btVector4 } from './CommonRigidBodyBase'; // btVector4 is defined in CommonRigidBodyBase
import { btTransform } from '../../src/LinearMath/btTransform';
import { btAssert, btAtan } from '../../src/LinearMath/btScalar';

// Collision shapes
import type { btCollisionShape } from '../../src/BulletCollision/CollisionShapes/btCollisionShape';
import { btBoxShape } from '../../src/BulletCollision/CollisionShapes/btBoxShape';

// Collision detection
import type { btBroadphaseInterface } from '../../src/BulletCollision/BroadphaseCollision/btBroadphaseInterface';
import { btDbvtBroadphase } from '../../src/BulletCollision/BroadphaseCollision/btDbvtBroadphase';
import { btCollisionDispatcher } from '../../src/BulletCollision/CollisionDispatch/btCollisionDispatcher';
import { btDefaultCollisionConfiguration } from '../../src/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration';
import type { btCollisionObject } from '../../src/BulletCollision/CollisionDispatch/btCollisionObject';
import { btCollisionWorld } from '../../src/BulletCollision/CollisionDispatch/btCollisionWorld';
import { DISABLE_DEACTIVATION, ACTIVE_TAG } from '../../src/BulletCollision/CollisionDispatch/btCollisionObject';
import type { btOverlappingPairCallback } from '../../src/BulletCollision/BroadphaseCollision/btOverlappingPairCallback';
import type { btBroadphaseProxy } from '../../src/BulletCollision/BroadphaseCollision/btBroadphaseProxy';

// Dynamics
import { btRigidBody } from '../../src/BulletDynamics/Dynamics/btRigidBody';
import type { btTypedConstraint } from '../../src/BulletDynamics/ConstraintSolver/btTypedConstraint';

/**
 * Filter modes for overlap filtering
 */
export enum MyFilterModes {
  FILTER_GROUPAMASKB_AND_GROUPBMASKA2 = 0,
  FILTER_GROUPAMASKB_OR_GROUPBMASKA2 = 1
}

/**
 * Custom overlap filter callback for multi-body collision filtering
 */
export class MyOverlapFilterCallback2 implements btOverlappingPairCallback {
  public m_filterMode: MyFilterModes;

  constructor() {
    this.m_filterMode = MyFilterModes.FILTER_GROUPAMASKB_AND_GROUPBMASKA2;
  }

  /**
   * Determine if two broadphase proxies need collision detection
   */
  needBroadphaseCollision(proxy0: btBroadphaseProxy, proxy1: btBroadphaseProxy): boolean {
    if (this.m_filterMode === MyFilterModes.FILTER_GROUPAMASKB_AND_GROUPBMASKA2) {
      let collides = (proxy0.m_collisionFilterGroup & proxy1.m_collisionFilterMask) !== 0;
      collides = collides && ((proxy1.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0);
      return collides;
    }

    if (this.m_filterMode === MyFilterModes.FILTER_GROUPAMASKB_OR_GROUPBMASKA2) {
      let collides = (proxy0.m_collisionFilterGroup & proxy1.m_collisionFilterMask) !== 0;
      collides = collides || ((proxy1.m_collisionFilterGroup & proxy0.m_collisionFilterMask) !== 0);
      return collides;
    }

    return false;
  }
}

// Mock overlapping pair cache interface (to be ported later)
interface btOverlappingPairCache {
  setOverlapFilterCallback(callback: btOverlappingPairCallback): void;
}

class MockOverlappingPairCache implements btOverlappingPairCache {
  private m_filterCallback: btOverlappingPairCallback | null = null;

  setOverlapFilterCallback(callback: btOverlappingPairCallback): void {
    this.m_filterCallback = callback;
  }
}

// Mock multi-body classes (placeholders until Featherstone system is ported)
interface btMultiBody {
  getCanSleep(): boolean;
  setCanSleep(canSleep: boolean): void;
  worldPosToLocal(link: number, worldPos: btVector3): btVector3;
}

interface btMultiBodyLinkCollider extends btCollisionObject {
  m_multiBody: btMultiBody | null;
  m_link: number;
}

interface btMultiBodyConstraint {
  // Base interface for multi-body constraints
}

interface btMultiBodyPoint2Point extends btMultiBodyConstraint {
  setMaxAppliedImpulse(maxImpulse: number): void;
  setPivotInB(pivot: btVector3): void;
  getMultiBodyA(): btMultiBody;
}

interface btMultiBodyConstraintSolver {
  // Placeholder for multi-body constraint solver
}

interface btMultiBodyDynamicsWorld {
  // Extended dynamics world interface
  setGravity(gravity: btVector3): void;
  stepSimulation(timeStep: number, maxSubSteps?: number, fixedTimeStep?: number): number;
  rayTest(rayFromWorld: btVector3, rayToWorld: btVector3, resultCallback: btCollisionWorld.RayResultCallback): void;
  getNumConstraints(): number;
  getConstraint(index: number): btTypedConstraint;
  removeConstraint(constraint: btTypedConstraint): void;
  getNumMultiBodyConstraints(): number;
  getMultiBodyConstraint(index: number): btMultiBodyConstraint;
  removeMultiBodyConstraint(constraint: btMultiBodyConstraint): void;
  addMultiBodyConstraint(constraint: btMultiBodyConstraint): void;
  getNumMultibodies(): number;
  getMultiBody(index: number): btMultiBody;
  removeMultiBody(body: btMultiBody): void;
  getNumCollisionObjects(): number;
  getCollisionObjectArray(): btCollisionObject[];
  removeCollisionObject(obj: btCollisionObject): void;
  addRigidBody(body: btRigidBody): void;
  addConstraint(constraint: btTypedConstraint, disableCollisionsBetweenLinkedBodies?: boolean): void;
  getDebugDrawer(): any; // btIDebugDraw interface
  debugDrawWorld(): void;
  serialize(serializer: any): void; // btDefaultSerializer interface
}

// Mock implementations for multi-body classes (to be replaced when properly ported)
class MockMultiBody implements btMultiBody {
  private m_canSleep = true;

  getCanSleep(): boolean {
    return this.m_canSleep;
  }

  setCanSleep(canSleep: boolean): void {
    this.m_canSleep = canSleep;
  }

  worldPosToLocal(link: number, worldPos: btVector3): btVector3 {
    // Mock implementation - just return the world position
    return worldPos.clone();
  }
}

class MockMultiBodyLinkCollider implements btMultiBodyLinkCollider {
  m_multiBody: btMultiBody | null = null;
  m_link: number = -1;

  // btCollisionObject interface methods (minimal implementation)
  getCollisionShape(): btCollisionShape | null { return null; }
  setCollisionShape(shape: btCollisionShape): void { }
  getWorldTransform(): btTransform { return new btTransform(); }
  setWorldTransform(transform: btTransform): void { }
  getUserIndex(): number { return -1; }
  setUserIndex(index: number): void { }

  static upcast(obj: btCollisionObject | null): MockMultiBodyLinkCollider | null {
    // In a real implementation, this would properly check types
    return obj as MockMultiBodyLinkCollider;
  }
}

class MockMultiBodyPoint2Point implements btMultiBodyPoint2Point {
  private m_multiBodyA: btMultiBody;
  private m_link: number;
  private m_maxAppliedImpulse: number = 0;

  constructor(multiBody: btMultiBody, link: number, rigidBody: btRigidBody | null, pivotInA: btVector3, pivotInB: btVector3) {
    this.m_multiBodyA = multiBody;
    this.m_link = link;
  }

  setMaxAppliedImpulse(maxImpulse: number): void {
    this.m_maxAppliedImpulse = maxImpulse;
  }

  setPivotInB(pivot: btVector3): void {
    // Mock implementation
  }

  getMultiBodyA(): btMultiBody {
    return this.m_multiBodyA;
  }
}

class MockMultiBodyConstraintSolver implements btMultiBodyConstraintSolver {
  // Mock implementation
}

class MockMultiBodyDynamicsWorld implements btMultiBodyDynamicsWorld {
  private m_gravity = new btVector3(0, -10, 0);
  private m_constraints: btTypedConstraint[] = [];
  private m_multiBodyConstraints: btMultiBodyConstraint[] = [];
  private m_multiBodies: btMultiBody[] = [];
  private m_collisionObjects: btCollisionObject[] = [];

  setGravity(gravity: btVector3): void {
    this.m_gravity = gravity.clone();
  }

  stepSimulation(timeStep: number, maxSubSteps = 1, fixedTimeStep = 1.0/60.0): number {
    // Mock simulation step
    return 1;
  }

  rayTest(rayFromWorld: btVector3, rayToWorld: btVector3, resultCallback: btCollisionWorld.RayResultCallback): void {
    // Mock raycast implementation
  }

  getNumConstraints(): number {
    return this.m_constraints.length;
  }

  getConstraint(index: number): btTypedConstraint {
    return this.m_constraints[index];
  }

  removeConstraint(constraint: btTypedConstraint): void {
    const index = this.m_constraints.indexOf(constraint);
    if (index !== -1) {
      this.m_constraints.splice(index, 1);
    }
  }

  getNumMultiBodyConstraints(): number {
    return this.m_multiBodyConstraints.length;
  }

  getMultiBodyConstraint(index: number): btMultiBodyConstraint {
    return this.m_multiBodyConstraints[index];
  }

  removeMultiBodyConstraint(constraint: btMultiBodyConstraint): void {
    const index = this.m_multiBodyConstraints.indexOf(constraint);
    if (index !== -1) {
      this.m_multiBodyConstraints.splice(index, 1);
    }
  }

  addMultiBodyConstraint(constraint: btMultiBodyConstraint): void {
    this.m_multiBodyConstraints.push(constraint);
  }

  getNumMultibodies(): number {
    return this.m_multiBodies.length;
  }

  getMultiBody(index: number): btMultiBody {
    return this.m_multiBodies[index];
  }

  removeMultiBody(body: btMultiBody): void {
    const index = this.m_multiBodies.indexOf(body);
    if (index !== -1) {
      this.m_multiBodies.splice(index, 1);
    }
  }

  getNumCollisionObjects(): number {
    return this.m_collisionObjects.length;
  }

  getCollisionObjectArray(): btCollisionObject[] {
    return this.m_collisionObjects;
  }

  removeCollisionObject(obj: btCollisionObject): void {
    const index = this.m_collisionObjects.indexOf(obj);
    if (index !== -1) {
      this.m_collisionObjects.splice(index, 1);
    }
  }

  addRigidBody(body: btRigidBody): void {
    this.m_collisionObjects.push(body);
  }

  addConstraint(constraint: btTypedConstraint, disableCollisionsBetweenLinkedBodies = false): void {
    this.m_constraints.push(constraint);
  }

  getDebugDrawer(): any {
    return null;
  }

  debugDrawWorld(): void {
    // Mock debug drawing
  }

  serialize(serializer: any): void {
    // Mock serialization
  }
}

// Point-to-point constraint mock for picking
interface btPoint2PointConstraint extends btTypedConstraint {
  m_setting: {
    m_impulseClamp: number;
    m_tau: number;
  };
  setPivotB(pivotB: btVector3): void;
}

class MockPoint2PointConstraint implements btPoint2PointConstraint {
  m_setting = {
    m_impulseClamp: 0,
    m_tau: 0
  };

  constructor(body: btRigidBody, localPivot: btVector3) {
    // Mock implementation
  }

  setPivotB(pivotB: btVector3): void {
    // Mock implementation
  }

  // btTypedConstraint interface methods (minimal implementation)
  getType(): number { return 0; }
  getRigidBodyA(): btRigidBody { return null as any; }
  getRigidBodyB(): btRigidBody { return null as any; }
  setEnabled(enabled: boolean): void { }
  isEnabled(): boolean { return true; }
}

/**
 * CommonMultiBodyBase - Base class for multi-body physics examples
 *
 * This class extends the basic physics functionality to support articulated
 * body dynamics using the Featherstone algorithm. It includes:
 * - Multi-body dynamics world setup
 * - Multi-body constraint management
 * - Specialized picking for articulated bodies
 * - Custom collision filtering
 */
export class CommonMultiBodyBase implements CommonExampleInterface {
  // Keep collision shapes for deletion/cleanup
  protected m_collisionShapes: btCollisionShape[] = [];
  protected m_filterCallback: MyOverlapFilterCallback2 | null = null;
  protected m_pairCache: btOverlappingPairCache | null = null;
  protected m_broadphase: btBroadphaseInterface | null = null;
  protected m_dispatcher: btCollisionDispatcher | null = null;
  protected m_solver: btMultiBodyConstraintSolver | null = null;
  protected m_collisionConfiguration: btDefaultCollisionConfiguration | null = null;
  protected m_dynamicsWorld: btMultiBodyDynamicsWorld | null = null;

  // Data for picking objects
  protected m_pickedBody: btRigidBody | null = null;
  protected m_pickedConstraint: btTypedConstraint | null = null;
  protected m_pickingMultiBodyPoint2Point: btMultiBodyPoint2Point | null = null;

  protected m_oldPickingPos: btVector3 = new btVector3();
  protected m_hitPos: btVector3 = new btVector3();
  protected m_oldPickingDist: number = 0;
  protected m_prevCanSleep: boolean = false;

  protected m_guiHelper: GUIHelperInterface;

  constructor(helper: GUIHelperInterface) {
    this.m_guiHelper = helper;
  }

  /**
   * Initialize physics - must be implemented by subclasses
   */
  initPhysics(): void {
    this.createEmptyDynamicsWorld();
  }

  /**
   * Create an empty multi-body dynamics world
   */
  createEmptyDynamicsWorld(): void {
    // Collision configuration contains default setup for memory, collision setup
    this.m_collisionConfiguration = new btDefaultCollisionConfiguration();

    this.m_filterCallback = new MyOverlapFilterCallback2();

    // Use the default collision dispatcher
    this.m_dispatcher = new btCollisionDispatcher(this.m_collisionConfiguration);

    this.m_pairCache = new MockOverlappingPairCache();
    this.m_pairCache.setOverlapFilterCallback(this.m_filterCallback);

    this.m_broadphase = new btDbvtBroadphase(); // Could pass m_pairCache as parameter

    this.m_solver = new MockMultiBodyConstraintSolver();

    this.m_dynamicsWorld = new MockMultiBodyDynamicsWorld();

    this.m_dynamicsWorld.setGravity(new btVector3(0, -10, 0));
  }

  /**
   * Step the physics simulation
   */
  stepSimulation(deltaTime: number): void {
    if (this.m_dynamicsWorld) {
      this.m_dynamicsWorld.stepSimulation(deltaTime);
    }
  }

  /**
   * Clean up and exit physics
   */
  exitPhysics(): void {
    this.removePickingConstraint();
    // Cleanup in the reverse order of creation/initialization

    // Remove the rigidbodies from the dynamics world and delete them
    if (this.m_dynamicsWorld) {
      // Remove constraints
      for (let i = this.m_dynamicsWorld.getNumConstraints() - 1; i >= 0; i--) {
        this.m_dynamicsWorld.removeConstraint(this.m_dynamicsWorld.getConstraint(i));
      }

      // Remove multi-body constraints
      for (let i = this.m_dynamicsWorld.getNumMultiBodyConstraints() - 1; i >= 0; i--) {
        const mbc = this.m_dynamicsWorld.getMultiBodyConstraint(i);
        this.m_dynamicsWorld.removeMultiBodyConstraint(mbc);
        // In TypeScript, objects are garbage collected
      }

      // Remove multi-bodies
      for (let i = this.m_dynamicsWorld.getNumMultibodies() - 1; i >= 0; i--) {
        const mb = this.m_dynamicsWorld.getMultiBody(i);
        this.m_dynamicsWorld.removeMultiBody(mb);
        // In TypeScript, objects are garbage collected
      }

      // Remove collision objects
      for (let i = this.m_dynamicsWorld.getNumCollisionObjects() - 1; i >= 0; i--) {
        const obj = this.m_dynamicsWorld.getCollisionObjectArray()[i];
        const body = btRigidBody.upcast(obj);
        if (body && body.getMotionState()) {
          // In TypeScript, motion state will be garbage collected
        }
        this.m_dynamicsWorld.removeCollisionObject(obj);
        // In TypeScript, objects are garbage collected
      }
    }

    // Delete collision shapes
    for (const shape of this.m_collisionShapes) {
      // In TypeScript, objects will be garbage collected
    }
    this.m_collisionShapes.length = 0;

    // Reset references to allow garbage collection
    this.m_dynamicsWorld = null;
    this.m_solver = null;
    this.m_broadphase = null;
    this.m_dispatcher = null;
    this.m_pairCache = null;
    this.m_filterCallback = null;
    this.m_collisionConfiguration = null;
  }

  /**
   * Sync physics to graphics
   */
  syncPhysicsToGraphics(): void {
    if (this.m_dynamicsWorld) {
      this.m_guiHelper.syncPhysicsToGraphics(this.m_dynamicsWorld);
    }
  }

  /**
   * Render the scene
   */
  renderScene(): void {
    if (this.m_dynamicsWorld) {
      this.m_guiHelper.syncPhysicsToGraphics(this.m_dynamicsWorld);
      this.m_guiHelper.render(this.m_dynamicsWorld);
    }
  }

  /**
   * Perform physics debug drawing
   */
  physicsDebugDraw(debugDrawFlags: number): void {
    if (this.m_dynamicsWorld) {
      const debugDrawer = this.m_dynamicsWorld.getDebugDrawer();
      if (debugDrawer) {
        debugDrawer.setDebugMode(debugDrawFlags);
      }
      this.m_dynamicsWorld.debugDrawWorld();
    }
  }

  /**
   * Handle keyboard input
   */
  keyboardCallback(key: number, state: number): boolean {
    if ((key === B3G_F3) && state && this.m_dynamicsWorld) {
      // Mock serialization - proper implementation would use btDefaultSerializer
      console.warn("Multi-body world serialization not yet implemented");

      // In browser environment, we can't write files directly like C++
      // This would need to be handled differently (e.g., download blob, save to localStorage, etc.)
      console.log("Would serialize multi-body world to testFile.bullet");

      return true;
    }
    return false; // Don't handle this key
  }

  /**
   * Convert screen coordinates to world ray direction
   */
  getRayTo(x: number, y: number): btVector3 {
    const renderer = this.m_guiHelper.getRenderInterface();

    if (!renderer) {
      btAssert(false, "No render interface available");
      return new btVector3(0, 0, 0);
    }

    const top = 1.0;
    const bottom = -1.0;
    const nearPlane = 1.0;
    const tanFov = (top - bottom) * 0.5 / nearPlane;
    const fov = 2.0 * btAtan(tanFov);

    const camPos = new btVector3();
    const camTarget = new btVector3();

    renderer.getActiveCamera().getCameraPosition(camPos);
    renderer.getActiveCamera().getCameraTargetPosition(camTarget);

    const rayFrom = camPos.clone();
    const rayForward = camTarget.subtract(camPos);
    rayForward.normalize();
    const farPlane = 10000.0;
    rayForward.scale(farPlane);

    const cameraUp = new btVector3(0, 0, 0);
    cameraUp.setValue(this.m_guiHelper.getAppInterface().getUpAxis(), 1);

    const vertical = cameraUp.clone();

    const hor = rayForward.cross(vertical);
    hor.normalize();
    vertical.assign(hor.cross(rayForward));
    vertical.normalize();

    const tanfov = Math.tan(0.5 * fov);

    hor.scale(2.0 * farPlane * tanfov);
    vertical.scale(2.0 * farPlane * tanfov);

    const width = renderer.getScreenWidth();
    const height = renderer.getScreenHeight();

    const aspect = width / height;

    hor.scale(aspect);

    const rayToCenter = rayFrom.add(rayForward);
    const dHor = hor.scale(1.0 / width);
    const dVert = vertical.scale(1.0 / height);

    const rayTo = rayToCenter.subtract(hor.scale(0.5)).add(vertical.scale(0.5));
    rayTo.add(dHor.scale(x));
    rayTo.subtract(dVert.scale(y));
    return rayTo;
  }

  /**
   * Handle mouse move events
   */
  mouseMoveCallback(x: number, y: number): boolean {
    const renderer = this.m_guiHelper.getRenderInterface();

    if (!renderer) {
      btAssert(false, "No render interface available");
      return false;
    }

    const rayTo = this.getRayTo(x, y);
    const rayFrom = new btVector3();
    renderer.getActiveCamera().getCameraPosition(rayFrom);
    this.movePickedBody(rayFrom, rayTo);

    return false;
  }

  /**
   * Handle mouse button events
   */
  mouseButtonCallback(button: number, state: number, x: number, y: number): boolean {
    const renderer = this.m_guiHelper.getRenderInterface();

    if (!renderer) {
      btAssert(false, "No render interface available");
      return false;
    }

    const window = this.m_guiHelper.getAppInterface().m_window;

    if (state === 1) {
      if (button === 0 && (!window.isModifierKeyPressed(B3G_ALT) && !window.isModifierKeyPressed(B3G_CONTROL))) {
        const camPos = new btVector3();
        renderer.getActiveCamera().getCameraPosition(camPos);

        const rayFrom = camPos;
        const rayTo = this.getRayTo(x, y);

        this.pickBody(rayFrom, rayTo);
      }
    } else {
      if (button === 0) {
        this.removePickingConstraint();
      }
    }

    return false;
  }

  /**
   * Pick a body using raycasting (supports both rigid bodies and multi-bodies)
   */
  pickBody(rayFromWorld: btVector3, rayToWorld: btVector3): boolean {
    if (this.m_dynamicsWorld === null) {
      return false;
    }

    const rayCallback = new btCollisionWorld.ClosestRayResultCallback(rayFromWorld, rayToWorld);

    this.m_dynamicsWorld.rayTest(rayFromWorld, rayToWorld, rayCallback);

    if (rayCallback.hasHit()) {
      const pickPos = rayCallback.m_hitPointWorld.clone();
      const body = btRigidBody.upcast(rayCallback.m_collisionObject);

      if (body) {
        // Other exclusions?
        if (!(body.isStaticObject() || body.isKinematicObject())) {
          this.m_pickedBody = body;
          this.m_pickedBody.setActivationState(DISABLE_DEACTIVATION);

          const localPivot = body.getCenterOfMassTransform().inverse().multiply(pickPos);
          const p2p = new MockPoint2PointConstraint(body, localPivot);
          this.m_dynamicsWorld.addConstraint(p2p, true);
          this.m_pickedConstraint = p2p;

          const mousePickClamping = 30.0;
          p2p.m_setting.m_impulseClamp = mousePickClamping;
          // Very weak constraint for picking
          p2p.m_setting.m_tau = 0.001;
        }
      } else {
        // Try to pick multi-body link collider
        const multiCol = MockMultiBodyLinkCollider.upcast(rayCallback.m_collisionObject);
        if (multiCol && multiCol.m_multiBody) {
          this.m_prevCanSleep = multiCol.m_multiBody.getCanSleep();
          multiCol.m_multiBody.setCanSleep(false);

          const pivotInA = multiCol.m_multiBody.worldPosToLocal(multiCol.m_link, pickPos);

          const p2p = new MockMultiBodyPoint2Point(
            multiCol.m_multiBody,
            multiCol.m_link,
            null, // no rigid body
            pivotInA,
            pickPos
          );

          // If you add too much energy to the system, causing high angular velocities,
          // simulation 'explodes'. So we try to avoid it by clamping the maximum impulse
          const scaling = 1;
          p2p.setMaxAppliedImpulse(2 * scaling);

          this.m_dynamicsWorld.addMultiBodyConstraint(p2p);
          this.m_pickingMultiBodyPoint2Point = p2p;
        }
      }

      this.m_oldPickingPos.assign(rayToWorld);
      this.m_hitPos.assign(pickPos);
      this.m_oldPickingDist = pickPos.subtract(rayFromWorld).length();
    }
    return false;
  }

  /**
   * Move a picked body (supports both rigid bodies and multi-bodies)
   */
  movePickedBody(rayFromWorld: btVector3, rayToWorld: btVector3): boolean {
    if (this.m_pickedBody && this.m_pickedConstraint) {
      const pickCon = this.m_pickedConstraint as btPoint2PointConstraint;
      if (pickCon) {
        // Keep it at the same picking distance
        const dir = rayToWorld.subtract(rayFromWorld);
        dir.normalize();
        dir.scale(this.m_oldPickingDist);

        const newPivotB = rayFromWorld.add(dir);
        pickCon.setPivotB(newPivotB);
      }
    }

    if (this.m_pickingMultiBodyPoint2Point) {
      // Keep it at the same picking distance
      const dir = rayToWorld.subtract(rayFromWorld);
      dir.normalize();
      dir.scale(this.m_oldPickingDist);

      const newPivotB = rayFromWorld.add(dir);

      this.m_pickingMultiBodyPoint2Point.setPivotInB(newPivotB);
    }

    return false;
  }

  /**
   * Remove picking constraint
   */
  removePickingConstraint(): void {
    if (this.m_pickedConstraint) {
      this.m_dynamicsWorld!.removeConstraint(this.m_pickedConstraint);

      if (this.m_pickedBody) {
        this.m_pickedBody.forceActivationState(ACTIVE_TAG);
        this.m_pickedBody.activate(true);
      }
      // In TypeScript, constraint will be garbage collected
      this.m_pickedConstraint = null;
      this.m_pickedBody = null;
    }

    if (this.m_pickingMultiBodyPoint2Point) {
      this.m_pickingMultiBodyPoint2Point.getMultiBodyA().setCanSleep(this.m_prevCanSleep);
      this.m_dynamicsWorld!.removeMultiBodyConstraint(this.m_pickingMultiBodyPoint2Point);
      // In TypeScript, constraint will be garbage collected
      this.m_pickingMultiBodyPoint2Point = null;
    }
  }

  /**
   * Create a box shape
   */
  createBoxShape(halfExtents: btVector3): btBoxShape {
    const box = new btBoxShape(halfExtents);
    return box;
  }

  /**
   * Create a rigid body with graphics
   */
  createRigidBody(
    mass: number,
    startTransform: btTransform,
    shape: btCollisionShape,
    color: btVector4 = new btVector4(1, 0, 0, 1)
  ): btRigidBody {
    btAssert(!shape || shape.getShapeType() !== 0, "Invalid shape type"); // INVALID_SHAPE_PROXYTYPE = 0

    // Rigidbody is dynamic if and only if mass is non zero, otherwise static
    const isDynamic = (mass !== 0.0);

    const localInertia = new btVector3(0, 0, 0);
    if (isDynamic) {
      shape.calculateLocalInertia(mass, localInertia);
    }

    // Using motionstate is recommended, it provides interpolation capabilities
    // and only synchronizes 'active' objects
    const myMotionState = new (class {
      getWorldTransform(worldTrans: btTransform): void {
        worldTrans.assign(startTransform);
      }
      setWorldTransform(worldTrans: btTransform): void {
        // Mock implementation
      }
    })();

    const cInfo = {
      m_mass: mass,
      m_motionState: myMotionState,
      m_collisionShape: shape,
      m_localInertia: localInertia
    };

    const body = new btRigidBody(cInfo);

    body.setUserIndex(-1);
    this.m_dynamicsWorld!.addRigidBody(body);
    return body;
  }
}

export default CommonMultiBodyBase;