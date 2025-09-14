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
 * @fileoverview CommonGraphicsAppInterface - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonGraphicsAppInterface.h
 *
 * This interface brings together graphics, window, and rendering functionality,
 * providing the main application interface for Bullet3 examples with integrated
 * mouse/camera controls and drawing capabilities.
 */

import { b3Vector3, b3MakeVector3 } from '../../dist/Bullet3Common/b3Vector3';
import { b3Scalar, b3Fabs } from '../../dist/Bullet3Common/b3Scalar';
import type { CommonRenderInterface } from './CommonRenderInterface';
import type { CommonWindowInterface } from './CommonWindowInterface';
import type { CommonCameraInterface } from './CommonCameraInterface';
import type { Common2dCanvasInterface } from './Common2dCanvasInterface';
import type { CommonParameterInterface } from './CommonParameterInterface';
import { B3G_ALT, B3G_CONTROL } from './CommonCallbacks';

/**
 * Drawing grid data configuration
 */
export interface DrawGridData {
  gridSize: number;
  upOffset: number;
  upAxis: number;
  gridColor: [number, number, number, number];
}

/**
 * Create default grid data
 */
export function createDrawGridData(upAx: number = 1): DrawGridData {
  return {
    gridSize: 10,
    upOffset: 0.001,
    upAxis: upAx,
    gridColor: [0.6, 0.6, 0.6, 1.0]
  };
}

/**
 * Sphere level of detail enumeration
 */
export enum EnumSphereLevelOfDetail {
  SPHERE_LOD_POINT_SPRITE = 0,
  SPHERE_LOD_LOW,
  SPHERE_LOD_MEDIUM,
  SPHERE_LOD_HIGH
}

/**
 * 3D text drawing options
 */
export enum DrawText3DOption {
  eDrawText3D_OrtogonalFaceCamera = 1,
  eDrawText3D_TrueType = 2,
  eDrawText3D_TrackObject = 4
}

/**
 * Common graphics application interface.
 *
 * This interface provides the main application functionality for Bullet3 examples,
 * integrating window management, rendering, parameter interfaces, and mouse/camera controls.
 */
export interface CommonGraphicsApp {
  // Interface references
  m_window: CommonWindowInterface | null;
  m_renderer: CommonRenderInterface | null;
  m_parameterInterface: CommonParameterInterface | null;
  m_2dCanvasInterface: Common2dCanvasInterface | null;

  // Mouse state
  m_leftMouseButton: boolean;
  m_middleMouseButton: boolean;
  m_rightMouseButton: boolean;
  m_wheelMultiplier: number;
  m_mouseMoveMultiplier: number;
  m_mouseXpos: number;
  m_mouseYpos: number;
  m_mouseInitialized: boolean;
  m_backgroundColorRGB: [number, number, number];

  // Frame dumping methods
  dumpNextFrameToPng(pngFilename: string): void;
  dumpFramesToVideo(mp4Filename: string): void;

  // Screen capture
  getScreenPixels(rgbaBuffer: Uint8Array, bufferSizeInBytes: number, depthBuffer: Float32Array | null, depthBufferSizeInBytes: number): void;
  setViewport(width: number, height: number): void;

  // Background color management
  getBackgroundColor(): { red: number; green: number; blue: number };
  setBackgroundColor(red: number, green: number, blue: number): void;

  // Video settings
  setMp4Fps(fps: number): void;

  // Mouse settings
  setMouseWheelMultiplier(mult: number): void;
  getMouseWheelMultiplier(): number;
  setMouseMoveMultiplier(mult: number): void;
  getMouseMoveMultiplier(): number;

  // Core rendering methods
  drawGrid(data?: DrawGridData): void;
  setUpAxis(axis: number): void;
  getUpAxis(): number;
  swapBuffer(): void;

  // Text drawing methods
  drawText(txt: string, posX: number, posY: number, size?: number, colorRGBA?: [number, number, number, number]): void;
  drawText3D(txt: string, posX: number, posY: number, posZ: number, size: number): void;
  drawText3DAdvanced(txt: string, position: [number, number, number], orientation: [number, number, number, number], color: [number, number, number, number], size: number, optionFlag: number): void;

  // Shape rendering
  drawTexturedRect(x0: number, y0: number, x1: number, y1: number, color: [number, number, number, number], u0: number, v0: number, u1: number, v1: number, useRGBA: number): void;
  registerCubeShape(halfExtentsX: number, halfExtentsY: number, halfExtentsZ: number, textureIndex?: number, textureScaling?: number): number;
  registerGraphicsUnitSphereShape(lod: EnumSphereLevelOfDetail, textureId?: number): number;
  registerGrid(xres: number, yres: number, color0: [number, number, number, number], color1: [number, number, number, number]): void;

  // Default mouse callbacks
  defaultMouseButtonCallback(button: number, state: number, x: number, y: number): void;
  defaultMouseMoveCallback(x: number, y: number): void;
  defaultWheelCallback(deltax: number, deltay: number): void;
}

/**
 * Base implementation of CommonGraphicsApp interface.
 *
 * Provides default implementations for all interface methods and standard
 * mouse/camera interaction behavior.
 */
export class BaseCommonGraphicsApp implements CommonGraphicsApp {
  // Interface references
  m_window: CommonWindowInterface | null = null;
  m_renderer: CommonRenderInterface | null = null;
  m_parameterInterface: CommonParameterInterface | null = null;
  m_2dCanvasInterface: Common2dCanvasInterface | null = null;

  // Mouse state
  m_leftMouseButton: boolean = false;
  m_middleMouseButton: boolean = false;
  m_rightMouseButton: boolean = false;
  m_wheelMultiplier: number = 0.01;
  m_mouseMoveMultiplier: number = 0.4;
  m_mouseXpos: number = 0.0;
  m_mouseYpos: number = 0.0;
  m_mouseInitialized: boolean = false;
  m_backgroundColorRGB: [number, number, number] = [0.7, 0.7, 0.8];

  // Frame dumping methods (empty implementations)
  dumpNextFrameToPng(pngFilename: string): void {
    // Implementation depends on specific graphics backend
  }

  dumpFramesToVideo(mp4Filename: string): void {
    // Implementation depends on specific graphics backend
  }

  // Screen capture
  getScreenPixels(rgbaBuffer: Uint8Array, bufferSizeInBytes: number, depthBuffer: Float32Array | null, depthBufferSizeInBytes: number): void {
    // Implementation depends on specific graphics backend
  }

  setViewport(width: number, height: number): void {
    // Implementation depends on specific graphics backend
  }

  // Background color management
  getBackgroundColor(): { red: number; green: number; blue: number } {
    return {
      red: this.m_backgroundColorRGB[0],
      green: this.m_backgroundColorRGB[1],
      blue: this.m_backgroundColorRGB[2]
    };
  }

  setBackgroundColor(red: number, green: number, blue: number): void {
    this.m_backgroundColorRGB[0] = red;
    this.m_backgroundColorRGB[1] = green;
    this.m_backgroundColorRGB[2] = blue;
  }

  // Video settings
  setMp4Fps(fps: number): void {
    // Implementation depends on specific graphics backend
  }

  // Mouse settings
  setMouseWheelMultiplier(mult: number): void {
    this.m_wheelMultiplier = mult;
  }

  getMouseWheelMultiplier(): number {
    return this.m_wheelMultiplier;
  }

  setMouseMoveMultiplier(mult: number): void {
    this.m_mouseMoveMultiplier = mult;
  }

  getMouseMoveMultiplier(): number {
    return this.m_mouseMoveMultiplier;
  }

  // Core rendering methods (abstract - must be implemented by subclasses)
  drawGrid(data: DrawGridData = createDrawGridData()): void {
    throw new Error('drawGrid must be implemented by subclass');
  }

  setUpAxis(axis: number): void {
    throw new Error('setUpAxis must be implemented by subclass');
  }

  getUpAxis(): number {
    throw new Error('getUpAxis must be implemented by subclass');
  }

  swapBuffer(): void {
    throw new Error('swapBuffer must be implemented by subclass');
  }

  // Text drawing methods
  drawText(txt: string, posX: number, posY: number, size: number = 1, colorRGBA: [number, number, number, number] = [0, 0, 0, 1]): void {
    throw new Error('drawText must be implemented by subclass');
  }

  drawText3D(txt: string, posX: number, posY: number, posZ: number, size: number): void {
    throw new Error('drawText3D must be implemented by subclass');
  }

  drawText3DAdvanced(txt: string, position: [number, number, number], orientation: [number, number, number, number], color: [number, number, number, number], size: number, optionFlag: number): void {
    throw new Error('drawText3DAdvanced must be implemented by subclass');
  }

  // Shape rendering
  drawTexturedRect(x0: number, y0: number, x1: number, y1: number, color: [number, number, number, number], u0: number, v0: number, u1: number, v1: number, useRGBA: number): void {
    throw new Error('drawTexturedRect must be implemented by subclass');
  }

  registerCubeShape(halfExtentsX: number, halfExtentsY: number, halfExtentsZ: number, textureIndex: number = -1, textureScaling: number = 1): number {
    throw new Error('registerCubeShape must be implemented by subclass');
  }

  registerGraphicsUnitSphereShape(lod: EnumSphereLevelOfDetail, textureId: number = -1): number {
    throw new Error('registerGraphicsUnitSphereShape must be implemented by subclass');
  }

  registerGrid(xres: number, yres: number, color0: [number, number, number, number], color1: [number, number, number, number]): void {
    throw new Error('registerGrid must be implemented by subclass');
  }

  // Default mouse callbacks
  defaultMouseButtonCallback(button: number, state: number, x: number, y: number): void {
    if (button === 0) {
      this.m_leftMouseButton = (state === 1);
    }
    if (button === 1) {
      this.m_middleMouseButton = (state === 1);
    }
    if (button === 2) {
      this.m_rightMouseButton = (state === 1);
    }

    this.m_mouseXpos = x;
    this.m_mouseYpos = y;
    this.m_mouseInitialized = true;
  }

  defaultMouseMoveCallback(x: number, y: number): void {
    if (this.m_window && this.m_renderer) {
      const camera = this.m_renderer.getActiveCamera();

      const isAltPressed = this.m_window.isModifierKeyPressed(B3G_ALT);
      const isControlPressed = this.m_window.isModifierKeyPressed(B3G_CONTROL);

      if (isAltPressed || isControlPressed) {
        const xDelta = x - this.m_mouseXpos;
        const yDelta = y - this.m_mouseYpos;
        let cameraDistance = camera.getCameraDistance();
        let pitch = camera.getCameraPitch();
        let yaw = camera.getCameraYaw();

        const targPos: [number, number, number] = [0, 0, 0];
        const camPos: [number, number, number] = [0, 0, 0];

        camera.getCameraTargetPosition(targPos);
        camera.getCameraPosition(camPos);

        const cameraPosition = b3MakeVector3(camPos[0], camPos[1], camPos[2]);
        let cameraTargetPosition = b3MakeVector3(targPos[0], targPos[1], targPos[2]);
        const cameraUp = b3MakeVector3(0, 0, 0);
        cameraUp.set(camera.getCameraUpAxis(), 1.0);

        if (this.m_leftMouseButton) {
          pitch -= yDelta * this.m_mouseMoveMultiplier;
          yaw -= xDelta * this.m_mouseMoveMultiplier;
        }

        if (this.m_middleMouseButton) {
          const upMovement = cameraUp.scale(yDelta * this.m_mouseMoveMultiplier * 0.01);
          cameraTargetPosition = cameraTargetPosition.add(upMovement);

          const fwd = cameraTargetPosition.subtract(cameraPosition);
          const side = cameraUp.cross(fwd);
          side.normalize();
          const sideMovement = side.scale(xDelta * this.m_mouseMoveMultiplier * 0.01);
          cameraTargetPosition = cameraTargetPosition.add(sideMovement);
        }

        if (this.m_rightMouseButton) {
          cameraDistance -= xDelta * this.m_mouseMoveMultiplier * 0.01;
          cameraDistance -= yDelta * this.m_mouseMoveMultiplier * 0.01;
          if (cameraDistance < 1) {
            cameraDistance = 1;
          }
          if (cameraDistance > 1000) {
            cameraDistance = 1000;
          }
        }

        camera.setCameraDistance(cameraDistance);
        camera.setCameraPitch(pitch);
        camera.setCameraYaw(yaw);
        camera.setCameraTargetPosition(cameraTargetPosition.x, cameraTargetPosition.y, cameraTargetPosition.z);
      }
    }

    this.m_mouseXpos = x;
    this.m_mouseYpos = y;
    this.m_mouseInitialized = true;
  }

  defaultWheelCallback(deltax: number, deltay: number): void {
    if (this.m_renderer) {
      let cameraTargetPosition: b3Vector3;
      let cameraPosition: b3Vector3;
      const cameraUp = b3MakeVector3(0, 0, 0);
      cameraUp.set(this.getUpAxis(), 1);
      const camera = this.m_renderer.getActiveCamera();

      const camPos: [number, number, number] = [0, 0, 0];
      const targPos: [number, number, number] = [0, 0, 0];
      camera.getCameraPosition(camPos);
      camera.getCameraTargetPosition(targPos);

      cameraPosition = b3MakeVector3(camPos[0], camPos[1], camPos[2]);
      cameraTargetPosition = b3MakeVector3(targPos[0], targPos[1], targPos[2]);

      if (!this.m_leftMouseButton) {
        let cameraDistance = camera.getCameraDistance();
        if (deltay < 0 || cameraDistance > 1) {
          cameraDistance -= deltay * this.m_wheelMultiplier;
          if (cameraDistance < 1) {
            cameraDistance = 1;
          }
          camera.setCameraDistance(cameraDistance);
        } else {
          const fwd = cameraTargetPosition.subtract(cameraPosition);
          fwd.normalize();
          const movement = fwd.scale(deltay * this.m_wheelMultiplier);
          cameraTargetPosition = cameraTargetPosition.add(movement);
        }
      } else {
        if (b3Fabs(deltax) > b3Fabs(deltay)) {
          const fwd = cameraTargetPosition.subtract(cameraPosition);
          const side = cameraUp.cross(fwd);
          side.normalize();
          const movement = side.scale(deltax * this.m_wheelMultiplier);
          cameraTargetPosition = cameraTargetPosition.add(movement);
        } else {
          const movement = cameraUp.scale(-deltay * this.m_wheelMultiplier);
          cameraTargetPosition = cameraTargetPosition.add(movement);
        }
      }

      camera.setCameraTargetPosition(cameraTargetPosition.x, cameraTargetPosition.y, cameraTargetPosition.z);
    }
  }
}

export default CommonGraphicsApp;