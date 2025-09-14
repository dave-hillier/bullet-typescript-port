/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a TypeScript implementation of physics-to-graphics synchronization for Three.js rendering.
*/

/**
 * @fileoverview PhysicsToThreeSync - Synchronization between physics world and Three.js graphics
 */

import { btDiscreteDynamicsWorld } from '../../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import { btRigidBody } from '../../../../src/BulletDynamics/Dynamics/btRigidBody';
import { btTransform } from '../../../../src/LinearMath/btTransform';
import { btVector3 } from '../../../../src/LinearMath/btVector3';
import { btQuaternion } from '../../../../src/LinearMath/btQuaternion';
import type { ThreeJSRenderInterface } from './ThreeJSRenderInterface';

/**
 * Mapping between physics bodies and graphics objects
 */
interface PhysicsGraphicsMapping {
  physicsBody: btRigidBody;
  graphicsId: number;
  shapeType: string;
}

/**
 * Synchronizes physics world state to Three.js graphics
 */
export class PhysicsToThreeSync {
  private renderInterface: ThreeJSRenderInterface;
  private mappings: PhysicsGraphicsMapping[] = [];

  constructor(renderInterface: ThreeJSRenderInterface) {
    this.renderInterface = renderInterface;
  }

  /**
   * Register a physics body with its corresponding graphics object
   */
  registerBody(
    physicsBody: btRigidBody,
    shapeType: string,
    dimensions: btVector3,
    color: [number, number, number, number] = [0, 1, 0, 1]
  ): number {
    const graphicsId = this.renderInterface.createGraphicsObject(shapeType, dimensions, color);

    this.mappings.push({
      physicsBody,
      graphicsId,
      shapeType
    });

    // Set initial position
    this.syncSingleBody(physicsBody, graphicsId);

    return graphicsId;
  }

  /**
   * Unregister a physics body and remove its graphics
   */
  unregisterBody(physicsBody: btRigidBody): void {
    const index = this.mappings.findIndex(mapping => mapping.physicsBody === physicsBody);
    if (index >= 0) {
      const mapping = this.mappings[index];
      this.renderInterface.removeGraphicsObject(mapping.graphicsId);
      this.mappings.splice(index, 1);
    }
  }

  /**
   * Synchronize all registered physics bodies to their graphics objects
   */
  syncAll(): void {
    for (const mapping of this.mappings) {
      this.syncSingleBody(mapping.physicsBody, mapping.graphicsId);
    }
  }

  /**
   * Synchronize a single physics body to its graphics object
   */
  private syncSingleBody(physicsBody: btRigidBody, graphicsId: number): void {
    const transform = new btTransform();

    // Get world transform from physics body
    if (physicsBody.getMotionState()) {
      physicsBody.getMotionState()!.getWorldTransform(transform);
    } else {
      transform.copy(physicsBody.getWorldTransform());
    }

    const origin = transform.getOrigin();
    const rotation = transform.getRotation();

    // Update graphics object
    this.renderInterface.updateGraphicsObject(
      graphicsId,
      origin,
      {
        x: rotation.x(),
        y: rotation.y(),
        z: rotation.z(),
        w: rotation.w()
      }
    );
  }

  /**
   * Synchronize entire dynamics world
   */
  syncDynamicsWorld(dynamicsWorld: btDiscreteDynamicsWorld): void {
    // First, sync all registered mappings
    this.syncAll();

    // Optionally, we could auto-register new bodies found in the world
    // but for now we rely on explicit registration
  }

  /**
   * Clear all mappings and graphics objects
   */
  clearAll(): void {
    for (const mapping of this.mappings) {
      this.renderInterface.removeGraphicsObject(mapping.graphicsId);
    }
    this.mappings.length = 0;
    this.renderInterface.clearAll();
  }

  /**
   * Get the number of registered mappings
   */
  getNumMappings(): number {
    return this.mappings.length;
  }

  /**
   * Find graphics ID for a physics body
   */
  findGraphicsId(physicsBody: btRigidBody): number | null {
    const mapping = this.mappings.find(m => m.physicsBody === physicsBody);
    return mapping ? mapping.graphicsId : null;
  }

  /**
   * Debug helper - get all mappings
   */
  getMappings(): readonly PhysicsGraphicsMapping[] {
    return this.mappings;
  }
}

/**
 * Utility function to get shape dimensions from Bullet collision shape
 */
export function getShapeInfo(shape: any): { type: string; dimensions: btVector3 } {
  // This is a simplified version - in a full implementation, we'd check shape types
  // For now, we'll make reasonable defaults based on common shapes

  if (shape && typeof shape.getHalfExtentsWithMargin === 'function') {
    // Box shape
    const halfExtents = shape.getHalfExtentsWithMargin();
    return {
      type: 'box',
      dimensions: halfExtents
    };
  } else if (shape && typeof shape.getRadius === 'function') {
    // Sphere shape
    const radius = shape.getRadius();
    return {
      type: 'sphere',
      dimensions: new btVector3(radius, radius, radius)
    };
  } else {
    // Default to small box
    return {
      type: 'box',
      dimensions: new btVector3(0.5, 0.5, 0.5)
    };
  }
}

/**
 * Helper function to create reasonable colors for different object types
 */
export function getObjectColor(mass: number, isStatic: boolean = false): [number, number, number, number] {
  if (isStatic || mass === 0) {
    // Static objects - blue/grey
    return [0.5, 0.5, 1.0, 1.0];
  } else {
    // Dynamic objects - green to red based on mass
    const massScale = Math.min(mass, 10) / 10; // Normalize to 0-1
    return [0.2 + massScale * 0.8, 1.0 - massScale * 0.5, 0.2, 1.0];
  }
}