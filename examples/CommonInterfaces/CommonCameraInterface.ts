/**
 * @fileoverview CommonCameraInterface - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonCameraInterface.h
 *
 * This interface defines the common camera functionality used across Bullet3 examples,
 * including view/projection matrix access, VR camera support, and camera positioning.
 */

/**
 * Common camera interface for Bullet3 examples.
 *
 * This interface provides access to camera matrices, positioning, and VR functionality.
 * Implementations should handle both regular and VR camera modes.
 */
export interface CommonCameraInterface {
  /**
   * Get the camera projection matrix.
   * @param m - Float32Array or number array to receive the 4x4 projection matrix (16 elements)
   */
  getCameraProjectionMatrix(m: Float32Array | number[]): void;

  /**
   * Get the camera view matrix.
   * @param m - Float32Array or number array to receive the 4x4 view matrix (16 elements)
   */
  getCameraViewMatrix(m: Float32Array | number[]): void;

  /**
   * Set up VR camera with custom view and projection matrices.
   * @param viewMat - 4x4 view matrix (16 elements)
   * @param projectionMatrix - 4x4 projection matrix (16 elements)
   */
  setVRCamera(viewMat: readonly number[] | Float32Array, projectionMatrix: readonly number[] | Float32Array): void;

  /**
   * Disable VR camera mode and return to regular camera.
   */
  disableVRCamera(): void;

  /**
   * Check if currently using VR camera mode.
   * @returns true if VR camera is active, false otherwise
   */
  isVRCamera(): boolean;

  /**
   * Set VR camera offset transform matrix.
   * @param offset - 4x4 transform matrix (16 elements)
   */
  setVRCameraOffsetTransform(offset: readonly number[] | Float32Array): void;

  /**
   * Get the camera target position (float precision).
   * @param pos - Array to receive target position [x, y, z]
   */
  getCameraTargetPosition(pos: number[]): void;

  /**
   * Get the camera position (float precision).
   * @param pos - Array to receive camera position [x, y, z]
   */
  getCameraPosition(pos: number[]): void;

  /**
   * Get the camera target position (double precision).
   * @param pos - Array to receive target position [x, y, z]
   */
  getCameraTargetPositionDouble(pos: number[]): void;

  /**
   * Get the camera position (double precision).
   * @param pos - Array to receive camera position [x, y, z]
   */
  getCameraPositionDouble(pos: number[]): void;

  /**
   * Set the camera target position.
   * @param x - Target X coordinate
   * @param y - Target Y coordinate
   * @param z - Target Z coordinate
   */
  setCameraTargetPosition(x: number, y: number, z: number): void;

  /**
   * Set the camera distance from target.
   * @param dist - Distance value
   */
  setCameraDistance(dist: number): void;

  /**
   * Get the current camera distance from target.
   * @returns Current camera distance
   */
  getCameraDistance(): number;

  /**
   * Set the camera up vector.
   * @param x - Up vector X component
   * @param y - Up vector Y component
   * @param z - Up vector Z component
   */
  setCameraUpVector(x: number, y: number, z: number): void;

  /**
   * Get the camera up vector.
   * @param up - Array to receive up vector [x, y, z]
   */
  getCameraUpVector(up: number[]): void;

  /**
   * Get the camera forward vector.
   * @param fwd - Array to receive forward vector [x, y, z]
   */
  getCameraForwardVector(fwd: number[]): void;

  /**
   * Set the camera up axis. This will call setCameraUpVector and setCameraForwardVector.
   * @param axis - Axis index (typically 0=X, 1=Y, 2=Z)
   */
  setCameraUpAxis(axis: number): void;

  /**
   * Get the current camera up axis.
   * @returns Current up axis index
   */
  getCameraUpAxis(): number;

  /**
   * Set the camera yaw angle.
   * @param yaw - Yaw angle in radians
   */
  setCameraYaw(yaw: number): void;

  /**
   * Get the current camera yaw angle.
   * @returns Yaw angle in radians
   */
  getCameraYaw(): number;

  /**
   * Set the camera pitch angle.
   * @param pitch - Pitch angle in radians
   */
  setCameraPitch(pitch: number): void;

  /**
   * Get the current camera pitch angle.
   * @returns Pitch angle in radians
   */
  getCameraPitch(): number;

  /**
   * Set the camera aspect ratio.
   * @param ratio - Aspect ratio (width/height)
   */
  setAspectRatio(ratio: number): void;

  /**
   * Get the current camera aspect ratio.
   * @returns Current aspect ratio
   */
  getAspectRatio(): number;

  /**
   * Get the camera frustum far plane distance.
   * @returns Far plane distance
   */
  getCameraFrustumFar(): number;

  /**
   * Get the camera frustum near plane distance.
   * @returns Near plane distance
   */
  getCameraFrustumNear(): number;
}