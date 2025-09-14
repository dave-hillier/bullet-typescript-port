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
 * @fileoverview CommonExampleInterface - TypeScript port
 *
 * Ported from: bullet3/examples/CommonInterfaces/CommonExampleInterface.h
 *
 * This interface provides the base structure for physics examples, defining
 * the common interface that all physics demonstrations must implement.
 */

import type { GUIHelperInterface } from './CommonGUIHelperInterface';

/**
 * Command Processor Interface - for command line processing
 * This is a placeholder interface for systems that process commands
 */
export interface CommandProcessorInterface {
  // Placeholder - to be implemented when command processing is needed
  processCommand?(command: string): boolean;
}

/**
 * Command Processor Creation Interface - factory for creating command processors
 */
export interface CommandProcessorCreationInterface {
  /**
   * Create a command processor instance
   */
  createCommandProcessor(): CommandProcessorInterface;

  /**
   * Delete/cleanup a command processor instance
   */
  deleteCommandProcessor(processor: CommandProcessorInterface): void;
}

/**
 * Shared Memory Interface - for inter-process communication
 * This is a placeholder interface for shared memory systems
 */
export interface SharedMemoryInterface {
  // Placeholder - to be implemented when shared memory is needed
  connect?(): boolean;
  disconnect?(): void;
}

/**
 * Common Example Options - configuration structure for physics examples
 */
export interface CommonExampleOptions {
  /** GUI Helper interface for graphics operations */
  m_guiHelper: GUIHelperInterface;

  /** Optional configuration option - examples may use this or not */
  m_option: number;

  /** Optional filename parameter - examples may use this or not */
  m_fileName: string | null;

  /** Optional shared memory interface - examples may use this or not */
  m_sharedMem: SharedMemoryInterface | null;

  /** Optional command processor creation interface */
  m_commandProcessorCreation: CommandProcessorCreationInterface | null;

  /** Whether to skip graphics updates (for headless operation) */
  m_skipGraphicsUpdate: boolean;
}

/**
 * Create CommonExampleOptions with default values
 */
export function createCommonExampleOptions(
  helper: GUIHelperInterface,
  option: number = 0
): CommonExampleOptions {
  return {
    m_guiHelper: helper,
    m_option: option,
    m_fileName: null,
    m_sharedMem: null,
    m_commandProcessorCreation: null,
    m_skipGraphicsUpdate: false
  };
}

/**
 * Type definition for example creation function
 */
export type CreateFunc = (options: CommonExampleOptions) => CommonExampleInterface;

/**
 * Common Example Interface - base interface for all physics examples
 *
 * This interface defines the lifecycle and interaction methods that every
 * physics example must implement. Examples include initialization, physics
 * simulation stepping, rendering, and input handling.
 */
export interface CommonExampleInterface {
  /**
   * Initialize the physics world and objects
   */
  initPhysics(): void;

  /**
   * Clean up and exit the physics simulation
   */
  exitPhysics(): void;

  /**
   * Update graphics/rendering state (optional - default implementation does nothing)
   */
  updateGraphics?(): void;

  /**
   * Step the physics simulation forward by deltaTime
   */
  stepSimulation(deltaTime: number): void;

  /**
   * Render the current scene
   */
  renderScene(): void;

  /**
   * Perform physics debug drawing
   * @param debugFlags Debug flags (reuses flags from Bullet/src/LinearMath/btIDebugDraw.h)
   */
  physicsDebugDraw(debugFlags: number): void;

  /**
   * Reset camera - only called when switching demos
   * This allows restarting (initPhysics) while maintaining a specific camera view
   */
  resetCamera?(): void;

  /**
   * Handle mouse move events
   */
  mouseMoveCallback(x: number, y: number): boolean;

  /**
   * Handle mouse button events
   */
  mouseButtonCallback(button: number, state: number, x: number, y: number): boolean;

  /**
   * Handle keyboard events
   */
  keyboardCallback(key: number, state: number): boolean;

  /**
   * Handle VR controller movement (optional)
   */
  vrControllerMoveCallback?(
    controllerId: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number],
    analogAxis: number,
    auxAnalogAxes: number[]
  ): void;

  /**
   * Handle VR controller button events (optional)
   */
  vrControllerButtonCallback?(
    controllerId: number,
    button: number,
    state: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number]
  ): void;

  /**
   * Handle VR HMD (Head-Mounted Display) movement (optional)
   */
  vrHMDMoveCallback?(
    controllerId: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number]
  ): void;

  /**
   * Handle VR generic tracker movement (optional)
   */
  vrGenericTrackerMoveCallback?(
    controllerId: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number]
  ): void;

  /**
   * Process command line arguments (optional)
   */
  processCommandLineArgs?(argc: number, argv: string[]): void;
}

/**
 * Example Entries Interface - registry for managing multiple physics examples
 *
 * This interface provides methods to register, enumerate, and access
 * different physics examples/demos.
 */
export interface ExampleEntries {
  /**
   * Initialize example entries registry
   */
  initExampleEntries(): void;

  /**
   * Initialize OpenCL-based example entries (optional for advanced GPU examples)
   */
  initOpenCLExampleEntries(): void;

  /**
   * Get the total number of registered examples
   */
  getNumRegisteredExamples(): number;

  /**
   * Get the creation function for a specific example by index
   */
  getExampleCreateFunc(index: number): CreateFunc | null;

  /**
   * Get the name of a specific example by index
   */
  getExampleName(index: number): string | null;

  /**
   * Get the description of a specific example by index
   */
  getExampleDescription(index: number): string | null;

  /**
   * Get the option value for a specific example by index
   */
  getExampleOption(index: number): number;
}

/**
 * Standalone example creation function
 * This function is used for examples that can run independently
 */
export declare function StandaloneExampleCreateFunc(options: CommonExampleOptions): CommonExampleInterface;

/**
 * Base class implementation for CommonExampleInterface
 * Provides default implementations for optional methods
 */
export abstract class BaseCommonExample implements CommonExampleInterface {
  protected options: CommonExampleOptions;

  constructor(options: CommonExampleOptions) {
    this.options = options;
  }

  // Abstract methods that must be implemented by subclasses
  abstract initPhysics(): void;
  abstract exitPhysics(): void;
  abstract stepSimulation(deltaTime: number): void;
  abstract renderScene(): void;
  abstract physicsDebugDraw(debugFlags: number): void;
  abstract mouseMoveCallback(x: number, y: number): boolean;
  abstract mouseButtonCallback(button: number, state: number, x: number, y: number): boolean;
  abstract keyboardCallback(key: number, state: number): boolean;

  // Default implementations for optional methods
  updateGraphics(): void {
    // Default: do nothing
  }

  resetCamera(): void {
    // Default: do nothing
  }

  vrControllerMoveCallback(
    controllerId: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number],
    analogAxis: number,
    auxAnalogAxes: number[]
  ): void {
    // Default: do nothing
  }

  vrControllerButtonCallback(
    controllerId: number,
    button: number,
    state: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number]
  ): void {
    // Default: do nothing
  }

  vrHMDMoveCallback(
    controllerId: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number]
  ): void {
    // Default: do nothing
  }

  vrGenericTrackerMoveCallback(
    controllerId: number,
    pos: [number, number, number, number],
    orientation: [number, number, number, number]
  ): void {
    // Default: do nothing
  }

  processCommandLineArgs(argc: number, argv: string[]): void {
    // Default: do nothing
  }
}

/**
 * Registry implementation for managing example entries
 */
export class SimpleExampleEntries implements ExampleEntries {
  private examples: Array<{
    name: string;
    description: string;
    createFunc: CreateFunc;
    option: number;
  }> = [];

  initExampleEntries(): void {
    // Override in subclasses to register examples
  }

  initOpenCLExampleEntries(): void {
    // Override in subclasses for OpenCL examples
  }

  getNumRegisteredExamples(): number {
    return this.examples.length;
  }

  getExampleCreateFunc(index: number): CreateFunc | null {
    if (index >= 0 && index < this.examples.length) {
      return this.examples[index].createFunc;
    }
    return null;
  }

  getExampleName(index: number): string | null {
    if (index >= 0 && index < this.examples.length) {
      return this.examples[index].name;
    }
    return null;
  }

  getExampleDescription(index: number): string | null {
    if (index >= 0 && index < this.examples.length) {
      return this.examples[index].description;
    }
    return null;
  }

  getExampleOption(index: number): number {
    if (index >= 0 && index < this.examples.length) {
      return this.examples[index].option;
    }
    return 0;
  }

  /**
   * Register a new example
   */
  protected registerExample(
    name: string,
    description: string,
    createFunc: CreateFunc,
    option: number = 0
  ): void {
    this.examples.push({
      name,
      description,
      createFunc,
      option
    });
  }
}