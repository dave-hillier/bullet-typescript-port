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
 * @fileoverview CommonGUIHelperInterface - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonGUIHelperInterface.h
 *
 * This interface provides the GUI bridge between the physics engine and graphics rendering,
 * allowing graphics engines to create visual representations and synchronize with physics objects.
 */

// Import interfaces from already ported files
import type { Common2dCanvasInterface } from './Common2dCanvasInterface';
import type { CommonParameterInterface } from './CommonParameterInterface';
import type { CommonRenderInterface } from './CommonRenderInterface';
import type { CommonGraphicsApp } from './CommonGraphicsAppInterface';

// Import Bullet physics classes - these are the main physics engine classes
import type { btRigidBody } from '../../src/BulletDynamics/Dynamics/btRigidBody';
import type { btVector3 } from '../../src/LinearMath/btVector3';
import type { btCollisionObject } from '../../src/BulletCollision/CollisionDispatch/btCollisionObject';
import type { btDiscreteDynamicsWorld } from '../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import type { btCollisionShape } from '../../src/BulletCollision/CollisionShapes/btCollisionShape';

/**
 * Structure for synchronizing physics object positions and orientations to graphics
 */
export interface GUISyncPosition {
  /** Graphics instance ID for this object */
  m_graphicsInstanceId: number;
  /** Position array [x, y, z, w] */
  m_pos: [number, number, number, number];
  /** Orientation quaternion array [x, y, z, w] */
  m_orn: [number, number, number, number];
}

/**
 * Callback type for visualizer flag changes
 */
export type VisualizerFlagCallback = (flag: number, enable: boolean) => void;

/**
 * The main GUI Helper Interface that provides the bridge between Bullet physics and graphics.
 * This interface allows graphics engines to create graphics representations and synchronize
 * with the physics world.
 */
export interface GUIHelperInterface {
  /**
   * Create graphics object for a rigid body
   */
  createRigidBodyGraphicsObject(body: btRigidBody, color: btVector3): void;

  /**
   * Create graphics object for a collision object
   */
  createCollisionObjectGraphicsObject(obj: btCollisionObject, color: btVector3): void;

  /**
   * Create graphics object for a collision shape
   */
  createCollisionShapeGraphicsObject(collisionShape: btCollisionShape): void;

  /**
   * Synchronize physics world to graphics rendering
   */
  syncPhysicsToGraphics(rbWorld: btDiscreteDynamicsWorld): void;

  /**
   * Alternative synchronization method (optional implementation)
   */
  syncPhysicsToGraphics2(rbWorld: btDiscreteDynamicsWorld): void;

  /**
   * Alternative synchronization using position array (optional implementation)
   */
  syncPhysicsToGraphics2FromPositions(positions: GUISyncPosition[], numPositions: number): void;

  /**
   * Render the physics world
   */
  render(rbWorld: btDiscreteDynamicsWorld): void;

  /**
   * Create physics debug drawer for visualization
   */
  createPhysicsDebugDrawer(rbWorld: btDiscreteDynamicsWorld): void;

  // Graphics registration and management methods
  /**
   * Register a texture and return texture ID
   */
  registerTexture(texels: Uint8Array, width: number, height: number): number;

  /**
   * Register graphics shape and return shape index
   */
  registerGraphicsShape(
    vertices: Float32Array,
    numvertices: number,
    indices: Int32Array,
    numIndices: number,
    primitiveType: number,
    textureId: number
  ): number;

  /**
   * Register graphics instance and return instance ID
   */
  registerGraphicsInstance(
    shapeIndex: number,
    position: Float32Array,
    quaternion: Float32Array,
    color: Float32Array,
    scaling: Float32Array
  ): number;

  /**
   * Remove all graphics instances
   */
  removeAllGraphicsInstances(): void;

  /**
   * Remove specific graphics instance (optional implementation)
   */
  removeGraphicsInstance(graphicsUid: number): void;

  /**
   * Change instance flags (optional implementation)
   */
  changeInstanceFlags(instanceUid: number, flags: number): void;

  /**
   * Change RGBA color of instance (optional implementation)
   */
  changeRGBAColor(instanceUid: number, rgbaColor: [number, number, number, number]): void;

  /**
   * Change scaling of instance (optional implementation)
   */
  changeScaling(instanceUid: number, scaling: [number, number, number]): void;

  /**
   * Change specular color of instance (optional implementation)
   */
  changeSpecularColor(instanceUid: number, specularColor: [number, number, number]): void;

  /**
   * Change texture (optional implementation)
   */
  changeTexture(textureUniqueId: number, rgbTexels: Uint8Array, width: number, height: number): void;

  /**
   * Update shape vertices (optional implementation)
   */
  updateShape(shapeIndex: number, vertices: Float32Array, numVertices: number): void;

  /**
   * Get shape index from instance (optional implementation)
   */
  getShapeIndexFromInstance(instanceUid: number): number;

  /**
   * Replace texture on shape (optional implementation)
   */
  replaceTexture(shapeIndex: number, textureUid: number): void;

  /**
   * Remove texture (optional implementation)
   */
  removeTexture(textureUid: number): void;

  /**
   * Set background color (optional implementation)
   */
  setBackgroundColor(rgbBackground: [number, number, number]): void;

  // Interface getters
  /**
   * Get 2D canvas interface
   */
  get2dCanvasInterface(): Common2dCanvasInterface;

  /**
   * Get parameter interface
   */
  getParameterInterface(): CommonParameterInterface;

  /**
   * Get render interface
   */
  getRenderInterface(): CommonRenderInterface;

  /**
   * Get render interface (const version)
   */
  getRenderInterfaceConst(): CommonRenderInterface | null;

  /**
   * Get application interface
   */
  getAppInterface(): CommonGraphicsApp;

  // Camera and view methods
  /**
   * Set up axis (0=X, 1=Y, 2=Z)
   */
  setUpAxis(axis: number): void;

  /**
   * Reset camera to specified position and orientation
   */
  resetCamera(
    camDist: number,
    yaw: number,
    pitch: number,
    camPosX: number,
    camPosY: number,
    camPosZ: number
  ): void;

  /**
   * Get camera information (optional implementation)
   */
  getCameraInfo(
    width: { value: number },
    height: { value: number },
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    camUp: Float32Array,
    camForward: Float32Array,
    hor: Float32Array,
    vert: Float32Array,
    yaw: { value: number },
    pitch: { value: number },
    camDist: { value: number },
    camTarget: Float32Array
  ): boolean;

  /**
   * Set visualizer flag (optional implementation)
   */
  setVisualizerFlag(flag: number, enable: number): void;

  // Image capture methods
  /**
   * Copy camera image data (simplified version)
   */
  copyCameraImageData(
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    pixelsRGBA: Uint8Array,
    rgbaBufferSizeInPixels: number,
    depthBuffer: Float32Array,
    depthBufferSizeInPixels: number,
    startPixelIndex: number,
    destinationWidth: number,
    destinationHeight: number,
    numPixelsCopied: { value: number }
  ): void;

  /**
   * Copy camera image data (full version)
   */
  copyCameraImageDataFull(
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    pixelsRGBA: Uint8Array,
    rgbaBufferSizeInPixels: number,
    depthBuffer: Float32Array,
    depthBufferSizeInPixels: number,
    segmentationMaskBuffer: Int32Array,
    segmentationMaskBufferSizeInPixels: number,
    startPixelIndex: number,
    destinationWidth: number,
    destinationHeight: number,
    numPixelsCopied: { value: number }
  ): void;

  /**
   * Debug display camera image data (optional implementation)
   */
  debugDisplayCameraImageData(
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    pixelsRGBA: Uint8Array,
    rgbaBufferSizeInPixels: number,
    depthBuffer: Float32Array,
    depthBufferSizeInPixels: number,
    segmentationMaskBuffer: Int32Array,
    segmentationMaskBufferSizeInPixels: number,
    startPixelIndex: number,
    destinationWidth: number,
    destinationHeight: number,
    numPixelsCopied: { value: number }
  ): void;

  // Projective texture methods (optional implementations)
  /**
   * Set projective texture matrices (optional implementation)
   */
  setProjectiveTextureMatrices(viewMatrix: Float32Array, projectionMatrix: Float32Array): void;

  /**
   * Set projective texture usage (optional implementation)
   */
  setProjectiveTexture(useProjectiveTexture: boolean): void;

  /**
   * Auto-generate graphics objects for physics world
   */
  autogenerateGraphicsObjects(rbWorld: btDiscreteDynamicsWorld): void;

  // Text rendering methods (optional implementations)
  /**
   * Draw 3D text at specified position (simple version)
   */
  drawText3D(txt: string, posX: number, posY: number, posZ: number, size: number): void;

  /**
   * Draw 3D text with full parameters (optional implementation)
   */
  drawText3DFull(
    txt: string,
    position: Float32Array,
    orientation: Float32Array,
    color: Float32Array,
    size: number,
    optionFlag: number
  ): void;

  // User debug drawing methods (optional implementations)
  /**
   * Add user debug text (optional implementation)
   */
  addUserDebugText3D(
    txt: string,
    positionXYZ: [number, number, number],
    orientation: [number, number, number, number],
    textColorRGB: [number, number, number],
    size: number,
    lifeTime: number,
    trackingVisualShapeIndex: number,
    optionFlags: number,
    replaceItemUid: number
  ): number;

  /**
   * Add user debug line (optional implementation)
   */
  addUserDebugLine(
    debugLineFromXYZ: [number, number, number],
    debugLineToXYZ: [number, number, number],
    debugLineColorRGB: [number, number, number],
    lineWidth: number,
    lifeTime: number,
    trackingVisualShapeIndex: number,
    replaceItemUid: number
  ): number;

  /**
   * Add user debug points (optional implementation)
   */
  addUserDebugPoints(
    debugPointPositionXYZ: number[],
    debugPointColorRGB: [number, number, number],
    pointSize: number,
    lifeTime: number,
    trackingVisualShapeIndex: number,
    replaceItemUid: number,
    debugPointNum: number
  ): number;

  /**
   * Add user debug parameter (optional implementation)
   */
  addUserDebugParameter(txt: string, rangeMin: number, rangeMax: number, startValue: number): number;

  /**
   * Read user debug parameter (optional implementation)
   */
  readUserDebugParameter(itemUniqueId: number, value: { value: number }): number;

  /**
   * Remove user debug item (optional implementation)
   */
  removeUserDebugItem(debugItemUniqueId: number): void;

  /**
   * Remove all user debug items (optional implementation)
   */
  removeAllUserDebugItems(): void;

  /**
   * Remove all user parameters (optional implementation)
   */
  removeAllUserParameters(): void;

  /**
   * Set visualizer flag callback (optional implementation)
   */
  setVisualizerFlagCallback(callback: VisualizerFlagCallback): void;

  /**
   * Dump frames to video (optional implementation)
   */
  dumpFramesToVideo(mp4FileName: string): void;

  /**
   * Draw debug drawer lines (optional implementation)
   */
  drawDebugDrawerLines(): void;

  /**
   * Clear debug lines (optional implementation)
   */
  clearLines(): void;

  /**
   * Check if this is a remote visualizer (optional implementation)
   */
  isRemoteVisualizer(): boolean;
}

/**
 * Dummy GUI Helper implementation that does nothing.
 * This can be used to test examples without GUI/graphics (in 'console mode').
 */
export class DummyGUIHelper implements GUIHelperInterface {
  constructor() {}

  createRigidBodyGraphicsObject(body: btRigidBody, color: btVector3): void {}

  createCollisionObjectGraphicsObject(obj: btCollisionObject, color: btVector3): void {}

  createCollisionShapeGraphicsObject(collisionShape: btCollisionShape): void {}

  syncPhysicsToGraphics(rbWorld: btDiscreteDynamicsWorld): void {}

  syncPhysicsToGraphics2(rbWorld: btDiscreteDynamicsWorld): void {}

  syncPhysicsToGraphics2FromPositions(positions: GUISyncPosition[], numPositions: number): void {}

  render(rbWorld: btDiscreteDynamicsWorld): void {}

  createPhysicsDebugDrawer(rbWorld: btDiscreteDynamicsWorld): void {}

  registerTexture(texels: Uint8Array, width: number, height: number): number {
    return -1;
  }

  registerGraphicsShape(
    vertices: Float32Array,
    numvertices: number,
    indices: Int32Array,
    numIndices: number,
    primitiveType: number,
    textureId: number
  ): number {
    return -1;
  }

  registerGraphicsInstance(
    shapeIndex: number,
    position: Float32Array,
    quaternion: Float32Array,
    color: Float32Array,
    scaling: Float32Array
  ): number {
    return -1;
  }

  removeAllGraphicsInstances(): void {}

  removeGraphicsInstance(graphicsUid: number): void {}

  changeInstanceFlags(instanceUid: number, flags: number): void {}

  changeRGBAColor(instanceUid: number, rgbaColor: [number, number, number, number]): void {}

  changeScaling(instanceUid: number, scaling: [number, number, number]): void {}

  changeSpecularColor(instanceUid: number, specularColor: [number, number, number]): void {}

  changeTexture(textureUniqueId: number, rgbTexels: Uint8Array, width: number, height: number): void {}

  updateShape(shapeIndex: number, vertices: Float32Array, numVertices: number): void {}

  getShapeIndexFromInstance(instanceUid: number): number {
    return -1;
  }

  replaceTexture(shapeIndex: number, textureUid: number): void {}

  removeTexture(textureUid: number): void {}

  setBackgroundColor(rgbBackground: [number, number, number]): void {}

  get2dCanvasInterface(): Common2dCanvasInterface {
    return null as any;
  }

  getParameterInterface(): CommonParameterInterface {
    return null as any;
  }

  getRenderInterface(): CommonRenderInterface {
    return null as any;
  }

  getRenderInterfaceConst(): CommonRenderInterface | null {
    return null;
  }

  getAppInterface(): CommonGraphicsApp {
    return null as any;
  }

  setUpAxis(axis: number): void {}

  resetCamera(
    camDist: number,
    yaw: number,
    pitch: number,
    camPosX: number,
    camPosY: number,
    camPosZ: number
  ): void {}

  getCameraInfo(
    width: { value: number },
    height: { value: number },
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    camUp: Float32Array,
    camForward: Float32Array,
    hor: Float32Array,
    vert: Float32Array,
    yaw: { value: number },
    pitch: { value: number },
    camDist: { value: number },
    camTarget: Float32Array
  ): boolean {
    return false;
  }

  setVisualizerFlag(flag: number, enable: number): void {}

  copyCameraImageData(
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    pixelsRGBA: Uint8Array,
    rgbaBufferSizeInPixels: number,
    depthBuffer: Float32Array,
    depthBufferSizeInPixels: number,
    startPixelIndex: number,
    destinationWidth: number,
    destinationHeight: number,
    numPixelsCopied: { value: number }
  ): void {
    if (numPixelsCopied) {
      numPixelsCopied.value = 0;
    }
  }

  copyCameraImageDataFull(
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    pixelsRGBA: Uint8Array,
    rgbaBufferSizeInPixels: number,
    depthBuffer: Float32Array,
    depthBufferSizeInPixels: number,
    segmentationMaskBuffer: Int32Array,
    segmentationMaskBufferSizeInPixels: number,
    startPixelIndex: number,
    destinationWidth: number,
    destinationHeight: number,
    numPixelsCopied: { value: number }
  ): void {
    if (numPixelsCopied) {
      numPixelsCopied.value = 0;
    }
  }

  debugDisplayCameraImageData(
    viewMatrix: Float32Array,
    projectionMatrix: Float32Array,
    pixelsRGBA: Uint8Array,
    rgbaBufferSizeInPixels: number,
    depthBuffer: Float32Array,
    depthBufferSizeInPixels: number,
    segmentationMaskBuffer: Int32Array,
    segmentationMaskBufferSizeInPixels: number,
    startPixelIndex: number,
    destinationWidth: number,
    destinationHeight: number,
    numPixelsCopied: { value: number }
  ): void {}

  setProjectiveTextureMatrices(viewMatrix: Float32Array, projectionMatrix: Float32Array): void {}

  setProjectiveTexture(useProjectiveTexture: boolean): void {}

  autogenerateGraphicsObjects(rbWorld: btDiscreteDynamicsWorld): void {}

  drawText3D(txt: string, posX: number, posY: number, posZ: number, size: number): void {}

  drawText3DFull(
    txt: string,
    position: Float32Array,
    orientation: Float32Array,
    color: Float32Array,
    size: number,
    optionFlag: number
  ): void {}

  addUserDebugText3D(
    txt: string,
    positionXYZ: [number, number, number],
    orientation: [number, number, number, number],
    textColorRGB: [number, number, number],
    size: number,
    lifeTime: number,
    trackingVisualShapeIndex: number,
    optionFlags: number,
    replaceItemUid: number
  ): number {
    return -1;
  }

  addUserDebugLine(
    debugLineFromXYZ: [number, number, number],
    debugLineToXYZ: [number, number, number],
    debugLineColorRGB: [number, number, number],
    lineWidth: number,
    lifeTime: number,
    trackingVisualShapeIndex: number,
    replaceItemUid: number
  ): number {
    return -1;
  }

  addUserDebugPoints(
    debugPointPositionXYZ: number[],
    debugPointColorRGB: [number, number, number],
    pointSize: number,
    lifeTime: number,
    trackingVisualShapeIndex: number,
    replaceItemUid: number,
    debugPointNum: number
  ): number {
    return -1;
  }

  addUserDebugParameter(txt: string, rangeMin: number, rangeMax: number, startValue: number): number {
    return -1;
  }

  readUserDebugParameter(itemUniqueId: number, value: { value: number }): number {
    return 0;
  }

  removeUserDebugItem(debugItemUniqueId: number): void {}

  removeAllUserDebugItems(): void {}

  removeAllUserParameters(): void {}

  setVisualizerFlagCallback(callback: VisualizerFlagCallback): void {}

  dumpFramesToVideo(mp4FileName: string): void {}

  drawDebugDrawerLines(): void {}

  clearLines(): void {}

  isRemoteVisualizer(): boolean {
    return false;
  }
}