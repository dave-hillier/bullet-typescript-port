/*
MODIFIED VERSION - TypeScript port of Bullet Physics Engine
Original Copyright (c) 2003-2009 Erwin Coumans  http://bulletphysics.org

This is a TypeScript implementation of Three.js-based rendering for physics examples.
*/

/**
 * @fileoverview ThreeJSRenderInterface - Three.js implementation of CommonRenderInterface
 */

import * as THREE from 'three';
import type { CommonRenderInterface } from '../../../../examples/CommonInterfaces/CommonRenderInterface';
import type { CommonCameraInterface } from '../../../../examples/CommonInterfaces/CommonCameraInterface';
import { btVector3 } from '../../../../src/LinearMath/btVector3';

/**
 * Three.js implementation of CommonCameraInterface
 */
export class ThreeJSCamera implements CommonCameraInterface {
  private camera: THREE.PerspectiveCamera;
  private controls: any; // Orbit controls when available

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  getCameraPosition(pos: btVector3): void {
    pos.setValue(this.camera.position.x, this.camera.position.y, this.camera.position.z);
  }

  getCameraTargetPosition(target: btVector3): void {
    // For perspective camera, we need to calculate target from position + direction
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);

    const targetPos = this.camera.position.clone().add(direction.multiplyScalar(10));
    target.setValue(targetPos.x, targetPos.y, targetPos.z);
  }

  setCameraDistance(dist: number): void {
    if (this.controls && 'object' in this.controls) {
      // If orbit controls are available, use them
      const direction = new THREE.Vector3();
      this.camera.getWorldDirection(direction);
      direction.multiplyScalar(-dist);
      this.camera.position.copy(direction);
    }
  }

  setControls(controls: any): void {
    this.controls = controls;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}

/**
 * Three.js implementation of CommonRenderInterface
 */
export class ThreeJSRenderInterface implements CommonRenderInterface {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private cameraInterface: ThreeJSCamera;
  private canvas: HTMLCanvasElement;

  // Graphics object tracking
  private graphicsObjects: Map<number, THREE.Object3D> = new Map();
  private nextGraphicsId: number = 1;

  // Material library
  private materials: {
    default: THREE.MeshLambertMaterial;
    wireframe: THREE.MeshBasicMaterial;
    debug: THREE.LineBasicMaterial;
  };

  constructor(canvas: HTMLCanvasElement, width: number = 800, height: number = 600) {
    this.canvas = canvas;

    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(4, 4, 4);
    this.camera.lookAt(0, 0, 0);
    this.cameraInterface = new ThreeJSCamera(this.camera);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize materials
    this.materials = {
      default: new THREE.MeshLambertMaterial({ color: 0x00ff00 }),
      wireframe: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true
      }),
      debug: new THREE.LineBasicMaterial({ color: 0xff0000 })
    };

    // Add basic lighting
    this.setupLighting();
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);
  }

  getActiveCamera(): CommonCameraInterface {
    return this.cameraInterface;
  }

  getScreenWidth(): number {
    return this.canvas.width;
  }

  getScreenHeight(): number {
    return this.canvas.height;
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Create a graphics object for a physics body
   */
  createGraphicsObject(
    shapeType: string,
    dimensions: btVector3,
    color: [number, number, number, number] = [0, 1, 0, 1]
  ): number {
    let geometry: THREE.BufferGeometry;

    switch (shapeType.toLowerCase()) {
      case 'box':
        geometry = new THREE.BoxGeometry(
          dimensions.x() * 2,
          dimensions.y() * 2,
          dimensions.z() * 2
        );
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(dimensions.x(), 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          dimensions.x(),
          dimensions.x(),
          dimensions.y() * 2,
          32
        );
        break;
      default:
        // Default to box
        geometry = new THREE.BoxGeometry(
          dimensions.x() * 2,
          dimensions.y() * 2,
          dimensions.z() * 2
        );
    }

    // Create material with specified color
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(color[0], color[1], color[2]),
      transparent: color[3] < 1.0,
      opacity: color[3]
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add to scene and track
    this.scene.add(mesh);
    const id = this.nextGraphicsId++;
    this.graphicsObjects.set(id, mesh);

    return id;
  }

  /**
   * Update graphics object transform
   */
  updateGraphicsObject(
    graphicsId: number,
    position: btVector3,
    rotation: { x: number; y: number; z: number; w: number }
  ): void {
    const object = this.graphicsObjects.get(graphicsId);
    if (!object) return;

    // Update position
    object.position.set(position.x(), position.y(), position.z());

    // Update rotation (quaternion)
    object.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  /**
   * Remove a graphics object
   */
  removeGraphicsObject(graphicsId: number): void {
    const object = this.graphicsObjects.get(graphicsId);
    if (object) {
      this.scene.remove(object);
      this.graphicsObjects.delete(graphicsId);

      // Dispose of geometry and material
      if ('geometry' in object) {
        (object as any).geometry.dispose();
      }
      if ('material' in object) {
        const material = (object as any).material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose());
        } else {
          material.dispose();
        }
      }
    }
  }

  /**
   * Render the scene
   */
  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get the Three.js scene for direct manipulation if needed
   */
  getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the Three.js renderer
   */
  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Clear all graphics objects
   */
  clearAll(): void {
    for (const [id, object] of this.graphicsObjects) {
      this.scene.remove(object);
      // Dispose resources
      if ('geometry' in object) {
        (object as any).geometry.dispose();
      }
      if ('material' in object) {
        const material = (object as any).material;
        if (Array.isArray(material)) {
          material.forEach(mat => mat.dispose());
        } else {
          material.dispose();
        }
      }
    }
    this.graphicsObjects.clear();
    this.nextGraphicsId = 1;
  }

  /**
   * Add debug line drawing capability
   */
  drawLine(from: btVector3, to: btVector3, color: [number, number, number] = [1, 0, 0]): void {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(from.x(), from.y(), from.z()),
      new THREE.Vector3(to.x(), to.y(), to.z())
    ]);

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color[0], color[1], color[2])
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);

    // Auto-remove after a short time (for debug drawing)
    setTimeout(() => {
      this.scene.remove(line);
      geometry.dispose();
      material.dispose();
    }, 100);
  }
}