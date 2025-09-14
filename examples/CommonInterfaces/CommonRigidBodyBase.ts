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
 * @fileoverview CommonRigidBodyBase - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonRigidBodyBase.h
 *
 * This class provides a common base implementation for rigid body physics examples,
 * including physics world setup, object picking, and simulation stepping.
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
import { btTransform } from '../../src/LinearMath/btTransform';
import { btAssert, btAtan } from '../../src/LinearMath/btScalar';
import { btDefaultMotionState } from '../../src/LinearMath/btMotionState';

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
import { DISABLE_DEACTIVATION } from '../../src/BulletCollision/CollisionDispatch/btCollisionObject';

// Dynamics
import { btDiscreteDynamicsWorld } from '../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody } from '../../src/BulletDynamics/Dynamics/btRigidBody';
import type { btConstraintSolver } from '../../src/BulletDynamics/ConstraintSolver/btConstraintSolver';
import { btSequentialImpulseConstraintSolver } from '../../src/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver';
import type { btTypedConstraint } from '../../src/BulletDynamics/ConstraintSolver/btTypedConstraint';

/**
 * Placeholder for constraint classes that are not yet ported
 * TODO: Port these constraint classes when needed
 */
interface btPoint2PointConstraint extends btTypedConstraint {
  m_setting: {
    m_impulseClamp: number;
    m_tau: number;
  };
  setPivotB(pivotB: btVector3): void;
}

// Mock implementation for classes not yet ported
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

  // Additional btTypedConstraint interface methods (minimal implementation)
  getType(): number { return 0; }
  getRigidBodyA(): btRigidBody { return null as any; }
  getRigidBodyB(): btRigidBody { return null as any; }
  setEnabled(enabled: boolean): void { }
  isEnabled(): boolean { return true; }
}

interface btDefaultSerializer {
  getBufferPointer(): ArrayBuffer;
  getCurrentBufferSize(): number;
}

// Mock implementation for serializer
class MockDefaultSerializer implements btDefaultSerializer {
  getBufferPointer(): ArrayBuffer {
    return new ArrayBuffer(0);
  }

  getCurrentBufferSize(): number {
    return 0;
  }
}

/**
 * Mock triangle raycast callback flags
 * TODO: Port proper raycast callback classes
 */
interface btTriangleRaycastCallback {
  kF_UseGjkConvexCastRaytest: number;
}

const MockTriangleRaycastCallback = {
  kF_UseGjkConvexCastRaytest: 1
};

/**
 * Vector4 type for colors (RGBA)
 */
export class btVector4 {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0,
    public w: number = 0
  ) {}
}

/**
 * CommonRigidBodyBase - Base class for rigid body physics examples
 *
 * This class provides common functionality for physics examples including:
 * - Physics world setup and cleanup
 * - Object picking and manipulation
 * - Simulation stepping
 * - Debug drawing
 */
export class CommonRigidBodyBase implements CommonExampleInterface {
  // Keep the collision shapes for deletion/cleanup
  protected m_collisionShapes: btCollisionShape[] = [];
  protected m_broadphase: btBroadphaseInterface | null = null;
  protected m_dispatcher: btCollisionDispatcher | null = null;
  protected m_solver: btConstraintSolver | null = null;
  protected m_collisionConfiguration: btDefaultCollisionConfiguration | null = null;
  protected m_dynamicsWorld: btDiscreteDynamicsWorld | null = null;

  // Data for picking objects
  protected m_pickedBody: btRigidBody | null = null;
  protected m_pickedConstraint: btTypedConstraint | null = null;
  protected m_savedState: number = 0;
  protected m_oldPickingPos: btVector3 = new btVector3();
  protected m_hitPos: btVector3 = new btVector3();
  protected m_oldPickingDist: number = 0;
  protected m_guiHelper: GUIHelperInterface;

  constructor(helper: GUIHelperInterface) {
    this.m_guiHelper = helper;
  }

  /**
   * Get the dynamics world instance
   */
  getDynamicsWorld(): btDiscreteDynamicsWorld | null {
    return this.m_dynamicsWorld;
  }

  /**
   * Initialize physics - must be implemented by subclasses
   */
  initPhysics(): void {
    this.createEmptyDynamicsWorld();
  }

  /**
   * Create an empty dynamics world with default configuration
   */
  createEmptyDynamicsWorld(): void {
    // Collision configuration contains default setup for memory, collision setup
    this.m_collisionConfiguration = new btDefaultCollisionConfiguration();

    // Use the default collision dispatcher. For parallel processing you can use a different dispatcher
    this.m_dispatcher = new btCollisionDispatcher(this.m_collisionConfiguration);

    this.m_broadphase = new btDbvtBroadphase();

    // The default constraint solver. For parallel processing you can use a different solver
    const sol = new btSequentialImpulseConstraintSolver();
    this.m_solver = sol;

    this.m_dynamicsWorld = new btDiscreteDynamicsWorld(
      this.m_dispatcher,
      this.m_broadphase,
      this.m_solver,
      this.m_collisionConfiguration
    );

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
   * Perform physics debug drawing
   */
  physicsDebugDraw(debugFlags: number): void {
    if (this.m_dynamicsWorld && this.m_dynamicsWorld.getDebugDrawer()) {
      this.m_dynamicsWorld.getDebugDrawer()!.setDebugMode(debugFlags);
      this.m_dynamicsWorld.debugDrawWorld();
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

      // Remove collision objects
      for (let i = this.m_dynamicsWorld.getNumCollisionObjects() - 1; i >= 0; i--) {
        const obj = this.m_dynamicsWorld.getCollisionObjectArray()[i];
        const body = btRigidBody.upcast(obj);
        if (body && body.getMotionState()) {
          // In TypeScript, we don't need to explicitly delete motion states
          // as they will be garbage collected
        }
        this.m_dynamicsWorld.removeCollisionObject(obj);
        // In TypeScript, objects will be garbage collected automatically
      }
    }

    // Delete collision shapes
    for (const shape of this.m_collisionShapes) {
      // In TypeScript, objects will be garbage collected automatically
    }
    this.m_collisionShapes.length = 0;

    // Reset references to allow garbage collection
    this.m_dynamicsWorld = null;
    this.m_solver = null;
    this.m_broadphase = null;
    this.m_dispatcher = null;
    this.m_collisionConfiguration = null;
  }

  /**
   * Debug draw (alternative interface)
   */
  debugDraw(debugDrawFlags: number): void {
    if (this.m_dynamicsWorld) {
      if (this.m_dynamicsWorld.getDebugDrawer()) {
        this.m_dynamicsWorld.getDebugDrawer()!.setDebugMode(debugDrawFlags);
      }
      this.m_dynamicsWorld.debugDrawWorld();
    }
  }

  /**
   * Handle keyboard input
   */
  keyboardCallback(key: number, state: number): boolean {
    if ((key === B3G_F3) && state && this.m_dynamicsWorld) {
      // TODO: Implement proper serialization when btDefaultSerializer is ported
      const serializer = new MockDefaultSerializer();

      // Mock serialization - in a real implementation this would serialize the world
      console.warn("Serialization not yet implemented - btDefaultSerializer needs to be ported");

      // In browser environment, we can't write files directly like C++
      // This would need to be handled differently (e.g., download blob, save to localStorage, etc.)
      const buffer = serializer.getBufferPointer();
      console.log("Would serialize world with buffer size:", serializer.getCurrentBufferSize());

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
    cameraUp.setValue(
      this.m_guiHelper.getAppInterface().getUpAxis(),
      1
    );

    const vertical = cameraUp.clone();

    const hor = rayForward.cross(vertical);
    hor.safeNormalize();
    vertical.assign(hor.cross(rayForward));
    vertical.safeNormalize();

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
   * Pick a body using raycasting
   */
  pickBody(rayFromWorld: btVector3, rayToWorld: btVector3): boolean {
    if (this.m_dynamicsWorld === null) {
      return false;
    }

    const rayCallback = new btCollisionWorld.ClosestRayResultCallback(rayFromWorld, rayToWorld);

    // TODO: Port proper triangle raycast callback
    // rayCallback.m_flags |= MockTriangleRaycastCallback.kF_UseGjkConvexCastRaytest;

    this.m_dynamicsWorld.rayTest(rayFromWorld, rayToWorld, rayCallback);

    if (rayCallback.hasHit()) {
      const pickPos = rayCallback.m_hitPointWorld.clone();
      const body = btRigidBody.upcast(rayCallback.m_collisionObject);

      if (body) {
        // Other exclusions?
        if (!(body.isStaticObject() || body.isKinematicObject())) {
          this.m_pickedBody = body;
          this.m_savedState = this.m_pickedBody.getActivationState();
          this.m_pickedBody.setActivationState(DISABLE_DEACTIVATION);

          const localPivot = body.getCenterOfMassTransform().inverse().multiply(pickPos);

          // TODO: Use proper btPoint2PointConstraint when ported
          const p2p = new MockPoint2PointConstraint(body, localPivot);
          this.m_dynamicsWorld.addConstraint(p2p, true);
          this.m_pickedConstraint = p2p;

          const mousePickClamping = 30.0;
          p2p.m_setting.m_impulseClamp = mousePickClamping;
          // Very weak constraint for picking
          p2p.m_setting.m_tau = 0.001;
        }
      }

      this.m_oldPickingPos.assign(rayToWorld);
      this.m_hitPos.assign(pickPos);
      this.m_oldPickingDist = pickPos.subtract(rayFromWorld).length();
    }
    return false;
  }

  /**
   * Move a picked body
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
        return true;
      }
    }
    return false;
  }

  /**
   * Remove picking constraint
   */
  removePickingConstraint(): void {
    if (this.m_pickedConstraint) {
      this.m_pickedBody!.forceActivationState(this.m_savedState);
      this.m_pickedBody!.activate();
      this.m_dynamicsWorld!.removeConstraint(this.m_pickedConstraint);
      // In TypeScript, constraint will be garbage collected
      this.m_pickedConstraint = null;
      this.m_pickedBody = null;
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
   * Delete a rigid body and cleanup graphics
   */
  deleteRigidBody(body: btRigidBody): void {
    const graphicsUid = body.getUserIndex();
    this.m_guiHelper.removeGraphicsInstance(graphicsUid);

    this.m_dynamicsWorld!.removeRigidBody(body);
    const ms = body.getMotionState();
    // In TypeScript, motion state will be garbage collected automatically
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

    // Using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
    const myMotionState = new btDefaultMotionState(startTransform);

    const cInfo = new btRigidBody.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);

    const body = new btRigidBody(cInfo);

    body.setUserIndex(-1);
    this.m_dynamicsWorld!.addRigidBody(body);
    return body;
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
}

export default CommonRigidBodyBase;