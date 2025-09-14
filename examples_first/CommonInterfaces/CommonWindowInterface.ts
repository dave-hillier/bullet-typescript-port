/**
 * Common window interface for managing rendering windows and input handling
 * Ported from Bullet3 CommonWindowInterface.h
 */

import {
  b3MouseMoveCallback,
  b3MouseButtonCallback,
  b3ResizeCallback,
  b3WheelCallback,
  b3KeyboardCallback,
  b3RenderCallback
} from './CommonCallbacks.js';

/**
 * Configuration information for window construction
 */
export interface b3gWindowConstructionInfo {
  /** Window width in pixels */
  width: number;
  /** Window height in pixels */
  height: number;
  /** Whether to create a fullscreen window */
  fullscreen: boolean;
  /** Color depth in bits per pixel */
  colorBitsPerPixel: number;
  /** Native window handle (platform-specific) */
  windowHandle: any;
  /** Window title */
  title: string;
  /** OpenGL version to request */
  openglVersion: number;
  /** Render device identifier */
  renderDevice: number;
}

/**
 * Create a default window construction info object
 */
export function createWindowConstructionInfo(
  width: number = 1024,
  height: number = 768
): b3gWindowConstructionInfo {
  return {
    width,
    height,
    fullscreen: false,
    colorBitsPerPixel: 32,
    windowHandle: null,
    title: 'title',
    openglVersion: 3,
    renderDevice: -1
  };
}

/**
 * Common interface for window management and input handling
 */
export interface CommonWindowInterface {
  /**
   * Create a default window with specified dimensions and title
   * @param width Window width in pixels
   * @param height Window height in pixels
   * @param title Window title
   */
  createDefaultWindow(width: number, height: number, title: string): void;

  /**
   * Create a window with the specified configuration
   * @param ci Window construction information
   */
  createWindow(ci: b3gWindowConstructionInfo): void;

  /**
   * Close the window
   */
  closeWindow(): void;

  /**
   * Run the main rendering loop
   */
  runMainLoop(): void;

  /**
   * Get the current time in seconds
   * @returns Current time in seconds
   */
  getTimeInSeconds(): number;

  /**
   * Check if the window has been requested to exit
   * @returns True if exit has been requested
   */
  requestedExit(): boolean;

  /**
   * Request that the window should exit
   */
  setRequestExit(): void;

  /**
   * Start a rendering frame
   */
  startRendering(): void;

  /**
   * End a rendering frame
   */
  endRendering(): void;

  /**
   * Check if a modifier key is currently pressed
   * @param key Key code to check
   * @returns True if the modifier key is pressed
   */
  isModifierKeyPressed(key: number): boolean;

  /**
   * Set the mouse move callback
   * @param mouseCallback Callback function for mouse move events
   */
  setMouseMoveCallback(mouseCallback: b3MouseMoveCallback): void;

  /**
   * Get the current mouse move callback
   * @returns Current mouse move callback
   */
  getMouseMoveCallback(): b3MouseMoveCallback;

  /**
   * Set the mouse button callback
   * @param mouseCallback Callback function for mouse button events
   */
  setMouseButtonCallback(mouseCallback: b3MouseButtonCallback): void;

  /**
   * Get the current mouse button callback
   * @returns Current mouse button callback
   */
  getMouseButtonCallback(): b3MouseButtonCallback;

  /**
   * Set the window resize callback
   * @param resizeCallback Callback function for resize events
   */
  setResizeCallback(resizeCallback: b3ResizeCallback): void;

  /**
   * Get the current resize callback
   * @returns Current resize callback
   */
  getResizeCallback(): b3ResizeCallback;

  /**
   * Set the mouse wheel callback
   * @param wheelCallback Callback function for wheel events
   */
  setWheelCallback(wheelCallback: b3WheelCallback): void;

  /**
   * Get the current wheel callback
   * @returns Current wheel callback
   */
  getWheelCallback(): b3WheelCallback;

  /**
   * Set the keyboard callback
   * @param keyboardCallback Callback function for keyboard events
   */
  setKeyboardCallback(keyboardCallback: b3KeyboardCallback): void;

  /**
   * Get the current keyboard callback
   * @returns Current keyboard callback
   */
  getKeyboardCallback(): b3KeyboardCallback;

  /**
   * Set the render callback
   * @param renderCallback Callback function for rendering
   */
  setRenderCallback(renderCallback: b3RenderCallback): void;

  /**
   * Set the window title
   * @param title New window title
   */
  setWindowTitle(title: string): void;

  /**
   * Get the retina/high-DPI scale factor
   * @returns Scale factor for high-DPI displays
   */
  getRetinaScale(): number;

  /**
   * Set whether to allow retina/high-DPI rendering
   * @param allow True to enable retina rendering
   */
  setAllowRetina(allow: boolean): void;

  /**
   * Get the current window width
   * @returns Window width in pixels
   */
  getWidth(): number;

  /**
   * Get the current window height
   * @returns Window height in pixels
   */
  getHeight(): number;

  /**
   * Open a file dialog for selecting a file
   * @param maxFileNameLength Maximum length for the file name
   * @returns Length of the selected file name, or 0 if cancelled
   */
  fileOpenDialog(maxFileNameLength: number): { fileName: string; length: number };
}