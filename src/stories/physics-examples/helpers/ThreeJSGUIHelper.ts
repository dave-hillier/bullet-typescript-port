/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a TypeScript implementation of Three.js-based GUI helper for physics examples.
*/

/**
 * @fileoverview ThreeJSGUIHelper - Three.js implementation of GUIHelperInterface
 */

import type { GUIHelperInterface } from '../../../../examples/CommonInterfaces/CommonGUIHelperInterface';
import type { CommonRenderInterface } from '../../../../examples/CommonInterfaces/CommonRenderInterface';
import type { CommonGraphicsAppInterface } from '../../../../examples/CommonInterfaces/CommonGraphicsAppInterface';
import { ThreeJSRenderInterface } from './ThreeJSRenderInterface';
import { PhysicsToThreeSync, getShapeInfo, getObjectColor } from './PhysicsToThreeSync';
import { btDiscreteDynamicsWorld } from '../../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody } from '../../../../src/BulletDynamics/Dynamics/btRigidBody';
import { btVector3 } from '../../../../src/LinearMath/btVector3';

/**
 * Mock window interface for Three.js GUI
 */
class ThreeJSWindow {
  isModifierKeyPressed(keyCode: number): boolean {
    // In a browser environment, we could check actual modifier keys
    // For now, return false
    return false;
  }
}

/**
 * Three.js implementation of CommonGraphicsAppInterface
 */
class ThreeJSGraphicsApp implements CommonGraphicsAppInterface {
  m_window = new ThreeJSWindow();
  private upAxis: number = 1; // Y-up by default

  getUpAxis(): number {
    return this.upAxis;
  }

  setUpAxis(axis: number): void {
    this.upAxis = axis;
  }

  // Additional methods that might be needed
  swapBuffer(): void {
    // Not needed in WebGL context
  }

  drawGrid(): void {
    // Could implement grid drawing here
  }
}

/**
 * Three.js implementation of GUIHelperInterface
 */
export class ThreeJSGUIHelper implements GUIHelperInterface {
  private renderInterface: ThreeJSRenderInterface;
  private appInterface: ThreeJSGraphicsApp;
  private physicsSync: PhysicsToThreeSync;
  private canvas: HTMLCanvasElement;
  private animationId: number | null = null;
  private isRendering: boolean = false;

  // Callbacks for external control
  onRender?: () => void;
  onPhysicsStep?: () => void;

  constructor(canvas: HTMLCanvasElement, width: number = 800, height: number = 600) {
    this.canvas = canvas;
    this.renderInterface = new ThreeJSRenderInterface(canvas, width, height);
    this.appInterface = new ThreeJSGraphicsApp();
    this.physicsSync = new PhysicsToThreeSync(this.renderInterface);
  }

  getRenderInterface(): CommonRenderInterface {
    return this.renderInterface;
  }

  getAppInterface(): CommonGraphicsAppInterface {
    return this.appInterface;
  }

  /**
   * Create a physics debug drawer (placeholder implementation)
   */
  createPhysicsDebugDrawer(dynamicsWorld: btDiscreteDynamicsWorld): void {
    // In a full implementation, we could create a debug drawer that uses
    // this.renderInterface.drawLine() for debug visualization
    console.log('Debug drawer created for dynamics world');
  }

  /**
   * Set the up axis (0=X, 1=Y, 2=Z)
   */
  setUpAxis(axis: number): void {
    this.appInterface.setUpAxis(axis);
  }

  /**
   * Reset camera to default position
   */
  resetCamera(
    distance: number = 5,
    yaw: number = 0,
    pitch: number = -30,
    targetX: number = 0,
    targetY: number = 0,
    targetZ: number = 0
  ): void {
    const camera = this.renderInterface.getActiveCamera().getCamera();

    // Convert spherical coordinates to Cartesian
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    const x = distance * Math.cos(pitchRad) * Math.sin(yawRad);
    const y = distance * Math.sin(pitchRad);
    const z = distance * Math.cos(pitchRad) * Math.cos(yawRad);

    camera.position.set(targetX + x, targetY + y, targetZ + z);
    camera.lookAt(targetX, targetY, targetZ);
  }

  /**
   * Auto-generate graphics objects for all physics bodies in the world
   */
  autogenerateGraphicsObjects(dynamicsWorld: btDiscreteDynamicsWorld): void {
    const numObjects = dynamicsWorld.getNumCollisionObjects();

    for (let i = 0; i < numObjects; i++) {
      const collisionObject = dynamicsWorld.getCollisionObjectArray()[i];
      const rigidBody = btRigidBody.upcast(collisionObject);

      if (rigidBody) {
        const shape = rigidBody.getCollisionShape();
        const shapeInfo = getShapeInfo(shape);
        const mass = rigidBody.getMass();
        const isStatic = mass === 0;
        const color = getObjectColor(mass, isStatic);

        // Register the body with graphics
        const graphicsId = this.physicsSync.registerBody(
          rigidBody,
          shapeInfo.type,
          shapeInfo.dimensions,
          color
        );

        // Store graphics ID in the rigid body's user index
        rigidBody.setUserIndex(graphicsId);
      }
    }

    console.log(`Auto-generated graphics for ${numObjects} objects`);
  }

  /**
   * Synchronize physics world to graphics
   */
  syncPhysicsToGraphics(dynamicsWorld: btDiscreteDynamicsWorld): void {
    this.physicsSync.syncDynamicsWorld(dynamicsWorld);
  }

  /**
   * Render the world
   */
  render(dynamicsWorld: btDiscreteDynamicsWorld): void {
    // Sync physics to graphics
    this.syncPhysicsToGraphics(dynamicsWorld);

    // Render the scene
    this.renderInterface.render();

    // Call external callback if provided
    this.onRender?.();
  }

  /**
   * Remove a graphics instance
   */
  removeGraphicsInstance(graphicsId: number): void {
    this.renderInterface.removeGraphicsObject(graphicsId);
  }

  /**
   * Start continuous rendering loop
   */
  startRenderLoop(dynamicsWorld: btDiscreteDynamicsWorld): void {
    if (this.isRendering) return;

    this.isRendering = true;

    const renderLoop = () => {
      if (!this.isRendering) return;

      this.render(dynamicsWorld);
      this.animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  /**
   * Stop rendering loop
   */
  stopRenderLoop(): void {
    this.isRendering = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void {
    this.renderInterface.resize(width, height);
  }

  /**
   * Clear all graphics objects
   */
  clearGraphics(): void {
    this.physicsSync.clearAll();
  }

  /**
   * Get the Three.js render interface for direct access
   */
  getThreeJSRenderer(): ThreeJSRenderInterface {
    return this.renderInterface;
  }

  /**
   * Get the physics synchronization helper
   */
  getPhysicsSync(): PhysicsToThreeSync {
    return this.physicsSync;
  }

  /**
   * Get the canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Create a manual graphics object
   */
  createGraphicsObject(
    shapeType: string,
    dimensions: btVector3,
    color: [number, number, number, number] = [0, 1, 0, 1]
  ): number {
    return this.renderInterface.createGraphicsObject(shapeType, dimensions, color);
  }

  /**
   * Update a graphics object transform
   */
  updateGraphicsObject(
    graphicsId: number,
    position: btVector3,
    rotation: { x: number; y: number; z: number; w: number }
  ): void {
    this.renderInterface.updateGraphicsObject(graphicsId, position, rotation);
  }
}