/**
 * @fileoverview CommonRenderInterface - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonRenderInterface.h
 *
 * This interface defines the common rendering functionality used across Bullet3 examples,
 * including graphics instance management, shader/texture handling, and primitive drawing.
 */

import type { CommonCameraInterface } from './CommonCameraInterface';

/**
 * Primitive types for rendering
 */
export enum PrimitiveType {
  B3_GL_TRIANGLES = 1,
  B3_GL_POINTS = 2
}

/**
 * Instance flags for rendering configuration
 */
export enum InstanceFlags {
  B3_INSTANCE_TRANSPARANCY = 1,
  B3_INSTANCE_TEXTURE = 2,
  B3_INSTANCE_DOUBLE_SIDED = 4
}

/**
 * Render modes for different rendering passes
 */
export enum RenderMode {
  B3_DEFAULT_RENDERMODE = 1,
  // B3_WIREFRAME_RENDERMODE, // Commented out in original
  B3_CREATE_SHADOWMAP_RENDERMODE = 2,
  B3_USE_SHADOWMAP_RENDERMODE = 3,
  B3_USE_SHADOWMAP_RENDERMODE_REFLECTION = 4,
  B3_USE_SHADOWMAP_RENDERMODE_REFLECTION_PLANE = 5,
  B3_USE_PROJECTIVE_TEXTURE_RENDERMODE = 6,
  B3_SEGMENTATION_MASK_RENDERMODE = 7
}

/**
 * Vertex format with position and texture coordinates.
 * Layout 0: position (x,y,z,w), unused padding, texture coordinates (u,v)
 */
export interface GfxVertexFormat0 {
  x: number;
  y: number;
  z: number;
  w: number;
  unused0: number;
  unused1: number;
  unused2: number;
  unused3: number;
  u: number;
  v: number;
}

/**
 * Vertex format with position, normal, and texture coordinates.
 * Layout 1: position (x,y,z,w), normal (nx,ny,nz), texture coordinates (u,v)
 */
export interface GfxVertexFormat1 {
  x: number;
  y: number;
  z: number;
  w: number;
  nx: number;
  ny: number;
  nz: number;
  u: number;
  v: number;
}

/**
 * Internal data structure for OpenGL-specific rendering implementations.
 * This is primarily used for OpenCL-OpenGL interoperability.
 */
export interface GLInstanceRendererInternalData {
  // Implementation-specific data
  [key: string]: any;
}

/**
 * Common rendering interface for Bullet3 examples.
 *
 * This interface provides a unified API for rendering graphics instances,
 * managing textures, drawing primitives, and handling camera/lighting setup.
 * Implementations can use different graphics APIs (OpenGL, WebGL, etc.).
 */
export interface CommonRenderInterface {
  /**
   * Initialize the renderer.
   */
  init(): void;

  /**
   * Update camera matrices based on the specified up axis.
   * @param upAxis - The up axis (0=X, 1=Y, 2=Z)
   */
  updateCamera(upAxis: number): void;

  /**
   * Remove all graphics instances from the renderer.
   */
  removeAllInstances(): void;

  /**
   * Remove a specific graphics instance.
   * @param instanceUid - Unique identifier of the instance to remove
   */
  removeGraphicsInstance(instanceUid: number): void;

  /**
   * Get the currently active camera (read-only).
   * @returns The active camera interface, or null if none set
   */
  getActiveCamera(): CommonCameraInterface | null;

  /**
   * Set the active camera for rendering.
   * @param cam - Camera interface to use for rendering
   */
  setActiveCamera(cam: CommonCameraInterface): void;

  /**
   * Set the light position (float precision).
   * @param lightPos - Light position [x, y, z]
   */
  setLightPosition(lightPos: readonly [number, number, number] | Float32Array | number[]): void;

  /**
   * Set the background color.
   * @param rgbBackground - Background color [r, g, b] in range [0, 1]
   */
  setBackgroundColor(rgbBackground: readonly [number, number, number] | number[]): void;

  /**
   * Set the shadow map resolution.
   * @param shadowMapResolution - Resolution in pixels (e.g., 1024, 2048)
   */
  setShadowMapResolution(shadowMapResolution: number): void;

  /**
   * Set the shadow map intensity.
   * @param shadowMapIntensity - Intensity multiplier for shadows
   */
  setShadowMapIntensity(shadowMapIntensity: number): void;

  /**
   * Set the shadow map world size for orthographic projection.
   * @param worldSize - Size of the shadow map coverage in world units
   */
  setShadowMapWorldSize(worldSize: number): void;

  /**
   * Set matrices for projective texture mapping (optional).
   * @param viewMatrix - 4x4 view matrix (16 elements)
   * @param projectionMatrix - 4x4 projection matrix (16 elements)
   */
  setProjectiveTextureMatrices?(viewMatrix: readonly number[] | Float32Array, projectionMatrix: readonly number[] | Float32Array): void;

  /**
   * Enable or disable projective texture mapping (optional).
   * @param useProjectiveTexture - Whether to use projective texturing
   */
  setProjectiveTexture?(useProjectiveTexture: boolean): void;

  /**
   * Render the entire scene with default settings.
   */
  renderScene(): void;

  /**
   * Render the scene with a specific render mode (optional).
   * @param renderMode - Rendering mode to use (defaults to B3_DEFAULT_RENDERMODE)
   */
  renderSceneInternal?(renderMode?: RenderMode): void;

  /**
   * Get the current screen/viewport width.
   * @returns Screen width in pixels
   */
  getScreenWidth(): number;

  /**
   * Get the current screen/viewport height.
   * @returns Screen height in pixels
   */
  getScreenHeight(): number;

  /**
   * Resize the renderer viewport.
   * @param width - New width in pixels
   * @param height - New height in pixels
   */
  resize(width: number, height: number): void;

  /**
   * Register a graphics instance with float parameters.
   * @param shapeIndex - Index of the shape to instantiate
   * @param position - Position [x, y, z] or [x, y, z, w]
   * @param quaternion - Rotation quaternion [x, y, z, w]
   * @param color - Color [r, g, b] or [r, g, b, a]
   * @param scaling - Scale [x, y, z] or [x, y, z, w]
   * @returns Unique instance identifier
   */
  registerGraphicsInstance(
    shapeIndex: number,
    position: readonly number[] | Float32Array,
    quaternion: readonly number[] | Float32Array,
    color: readonly number[] | Float32Array,
    scaling: readonly number[] | Float32Array
  ): number;

  /**
   * Draw multiple lines from vertex data.
   * @param positions - Vertex positions (packed array)
   * @param color - Line color [r, g, b, a]
   * @param numPoints - Number of points in the positions array
   * @param pointStrideInBytes - Byte stride between consecutive points
   * @param indices - Indices defining line segments (pairs of point indices)
   * @param numIndices - Number of indices
   * @param pointDrawSize - Size for point rendering (if applicable)
   */
  drawLines(
    positions: readonly number[] | Float32Array,
    color: readonly [number, number, number, number],
    numPoints: number,
    pointStrideInBytes: number,
    indices: readonly number[] | Uint32Array,
    numIndices: number,
    pointDrawSize: number
  ): void;

  /**
   * Draw a single line (float precision).
   * @param from - Start point [x, y, z, w]
   * @param to - End point [x, y, z, w]
   * @param color - Line color [r, g, b, a]
   * @param lineWidth - Width of the line
   */
  drawLine(
    from: readonly [number, number, number, number],
    to: readonly [number, number, number, number],
    color: readonly [number, number, number, number],
    lineWidth: number
  ): void;

  /**
   * Draw a single point (float precision).
   * @param position - Point position [x, y, z] or [x, y, z, w]
   * @param color - Point color [r, g, b, a]
   * @param pointDrawSize - Size of the point
   */
  drawPoint(
    position: readonly number[] | Float32Array,
    color: readonly [number, number, number, number],
    pointDrawSize: number
  ): void;

  /**
   * Draw multiple points from vertex data.
   * @param positions - Point positions (packed array)
   * @param colors - Point colors (packed array, 4 components per point)
   * @param numPoints - Number of points
   * @param pointStrideInBytes - Byte stride between consecutive points
   * @param pointDrawSize - Size for point rendering
   */
  drawPoints(
    positions: readonly number[] | Float32Array,
    colors: readonly number[] | Float32Array,
    numPoints: number,
    pointStrideInBytes: number,
    pointDrawSize: number
  ): void;

  /**
   * Draw a textured triangle mesh.
   * @param worldPosition - World position [x, y, z]
   * @param worldOrientation - World orientation quaternion [x, y, z, w]
   * @param vertices - Vertex data (format depends on vertexLayout)
   * @param numvertices - Number of vertices
   * @param indices - Triangle indices
   * @param numIndices - Number of indices
   * @param color - Mesh color [r, g, b, a]
   * @param textureIndex - Texture index (-1 for no texture)
   * @param vertexLayout - Vertex format (0 = GfxVertexFormat0, 1 = GfxVertexFormat1)
   */
  drawTexturedTriangleMesh(
    worldPosition: readonly [number, number, number],
    worldOrientation: readonly [number, number, number, number],
    vertices: readonly number[] | Float32Array,
    numvertices: number,
    indices: readonly number[] | Uint32Array,
    numIndices: number,
    color: readonly [number, number, number, number],
    textureIndex?: number,
    vertexLayout?: number
  ): void;

  /**
   * Register a shape for rendering.
   * @param vertices - Vertex data
   * @param numvertices - Number of vertices
   * @param indices - Index data
   * @param numIndices - Number of indices
   * @param primitiveType - Type of primitive (triangles, points, etc.)
   * @param textureIndex - Associated texture index (-1 for none)
   * @returns Shape index for future reference
   */
  registerShape(
    vertices: readonly number[] | Float32Array,
    numvertices: number,
    indices: readonly number[] | Int32Array,
    numIndices: number,
    primitiveType?: PrimitiveType,
    textureIndex?: number
  ): number;

  /**
   * Update vertex data for an existing shape.
   * @param shapeIndex - Index of the shape to update
   * @param vertices - New vertex data
   * @param numVertices - Number of vertices
   */
  updateShape(shapeIndex: number, vertices: readonly number[] | Float32Array, numVertices: number): void;

  /**
   * Register a texture from pixel data.
   * @param texels - Texture pixel data (RGBA format)
   * @param width - Texture width in pixels
   * @param height - Texture height in pixels
   * @param flipPixelsY - Whether to flip pixels vertically
   * @returns Texture index for future reference
   */
  registerTexture(texels: Uint8Array, width: number, height: number, flipPixelsY?: boolean): number;

  /**
   * Update an existing texture with new pixel data.
   * @param textureIndex - Index of texture to update
   * @param texels - New texture pixel data
   * @param flipPixelsY - Whether to flip pixels vertically
   */
  updateTexture(textureIndex: number, texels: Uint8Array, flipPixelsY?: boolean): void;

  /**
   * Activate a texture for rendering.
   * @param textureIndex - Index of texture to activate
   */
  activateTexture(textureIndex: number): void;

  /**
   * Replace the texture used by a shape (optional).
   * @param shapeIndex - Index of the shape
   * @param textureIndex - New texture index to use
   */
  replaceTexture?(shapeIndex: number, textureIndex: number): void;

  /**
   * Remove a texture from memory.
   * @param textureIndex - Index of texture to remove
   */
  removeTexture(textureIndex: number): void;

  /**
   * Set the shape index for plane reflection (optional).
   * @param index - Shape index to use for reflections
   */
  setPlaneReflectionShapeIndex?(index: number): void;

  /**
   * Get the shape index from an instance index (optional).
   * @param srcIndex - Instance index
   * @returns Shape index, or -1 if not found
   */
  getShapeIndexFromInstance?(srcIndex: number): number;

  /**
   * Read transform data from GPU to CPU for a single instance.
   * @param position - Array to receive position [x, y, z]
   * @param orientation - Array to receive orientation quaternion [x, y, z, w]
   * @param srcIndex - Instance index
   * @returns true if successful, false otherwise
   */
  readSingleInstanceTransformToCPU(position: number[], orientation: number[], srcIndex: number): boolean;

  /**
   * Write transform data from CPU to GPU for a single instance (float precision).
   * @param position - Position [x, y, z]
   * @param orientation - Orientation quaternion [x, y, z, w]
   * @param srcIndex - Instance index
   */
  writeSingleInstanceTransformToCPU(
    position: readonly number[] | Float32Array,
    orientation: readonly number[] | Float32Array,
    srcIndex: number
  ): void;

  /**
   * Write color data for a single instance.
   * @param color - Color [r, g, b, a]
   * @param srcIndex - Instance index
   */
  writeSingleInstanceColorToCPU(color: readonly number[] | Float32Array, srcIndex: number): void;

  /**
   * Write scale data for a single instance.
   * @param scale - Scale [x, y, z]
   * @param srcIndex - Instance index
   */
  writeSingleInstanceScaleToCPU(scale: readonly number[] | Float32Array, srcIndex: number): void;

  /**
   * Write specular color for a single instance.
   * @param specular - Specular color [r, g, b, a]
   * @param srcIndex - Instance index
   */
  writeSingleInstanceSpecularColorToCPU(specular: readonly number[] | Float32Array, srcIndex: number): void;

  /**
   * Write flags for a single instance.
   * @param flags - Instance flags (combination of InstanceFlags)
   * @param srcIndex - Instance index
   */
  writeSingleInstanceFlagsToCPU(flags: number, srcIndex: number): void;

  /**
   * Get the total number of graphics instances.
   * @returns Total instance count
   */
  getTotalNumInstances(): number;

  /**
   * Write all pending transforms to the GPU.
   */
  writeTransforms(): void;

  /**
   * Clear the depth buffer.
   */
  clearZBuffer(): void;

  /**
   * Get internal OpenGL-specific data for interoperability (optional).
   * This is mainly used for OpenCL-OpenGL interop. Most implementations
   * should return null.
   * @returns Internal data structure or null
   */
  getInternalData?(): GLInstanceRendererInternalData | null;
}

/**
 * Project world coordinates to screen coordinates.
 * This is a utility function for converting 3D world positions to 2D screen positions.
 *
 * @param objx - Object X coordinate in world space
 * @param objy - Object Y coordinate in world space
 * @param objz - Object Z coordinate in world space
 * @param modelMatrix - 4x4 model matrix (16 elements)
 * @param projMatrix - 4x4 projection matrix (16 elements)
 * @param viewport - Viewport [x, y, width, height]
 * @param result - Object to receive screen coordinates {winx, winy, winz}
 * @returns 1 if successful, 0 if failed (division by zero)
 */
export function projectWorldCoordToScreen(
  objx: number,
  objy: number,
  objz: number,
  modelMatrix: readonly number[] | Float32Array,
  projMatrix: readonly number[] | Float32Array,
  viewport: readonly [number, number, number, number],
  result: { winx: number; winy: number; winz: number }
): number {
  const in2: [number, number, number, number] = [objx, objy, objz, 1.0];
  const tmp: [number, number, number, number] = [0, 0, 0, 0];

  // Transform by model matrix
  for (let i = 0; i < 4; i++) {
    tmp[i] = in2[0] * modelMatrix[0 * 4 + i] +
             in2[1] * modelMatrix[1 * 4 + i] +
             in2[2] * modelMatrix[2 * 4 + i] +
             in2[3] * modelMatrix[3 * 4 + i];
  }

  const out: [number, number, number, number] = [0, 0, 0, 0];

  // Transform by projection matrix
  for (let i = 0; i < 4; i++) {
    out[i] = tmp[0] * projMatrix[0 * 4 + i] +
             tmp[1] * projMatrix[1 * 4 + i] +
             tmp[2] * projMatrix[2 * 4 + i] +
             tmp[3] * projMatrix[3 * 4 + i];
  }

  if (out[3] === 0.0) {
    return 0;
  }

  // Perspective divide
  out[0] /= out[3];
  out[1] /= out[3];
  out[2] /= out[3];

  // Map x, y and z to range 0-1
  out[0] = out[0] * 0.5 + 0.5;
  out[1] = out[1] * 0.5 + 0.5;
  out[2] = out[2] * 0.5 + 0.5;

  // Map x,y to viewport
  out[0] = out[0] * viewport[2] + viewport[0];
  out[1] = out[1] * viewport[3] + viewport[1];

  result.winx = out[0];
  result.winy = out[1];
  result.winz = out[2];
  return 1;
}