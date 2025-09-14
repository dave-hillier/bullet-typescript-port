/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2015 Google Inc. http://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it freely,
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.

Modified for TypeScript port by Claude Code.
*/

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { btVector3 } from '../../../src/LinearMath/btVector3.js';
import { btTransform } from '../../../src/LinearMath/btTransform.js';
import { btRigidBody } from '../../../src/BulletDynamics/Dynamics/btRigidBody.js';
import { btDiscreteDynamicsWorld } from '../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld.js';
import type { btCollisionShape } from '../../../src/BulletCollision/CollisionShapes/btCollisionShape.js';

/**
 * Simplified Three.js GUI helper for basic physics demonstrations
 * Implements only the essential methods needed for BasicDemo
 */
export class SimpleThreeJsGUIHelper {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private rigidBodies: Map<btRigidBody, THREE.Mesh> = new Map();
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x404040);

        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Initialize controls
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Set up lighting
        this.setupLighting();

        // Set default camera position
        this.resetCamera();

        // Handle resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    private setupLighting(): void {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(-1, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    private handleResize(): void {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private createMeshFromShape(shape: btCollisionShape, color?: btVector3): THREE.Mesh {
        // For now, create simple box geometry for all shapes
        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

        const materialColor = color ?
            new THREE.Color(color.x(), color.y(), color.z()) :
            new THREE.Color(Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2);

        const material = new THREE.MeshLambertMaterial({
            color: materialColor
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // Essential methods for BasicDemo
    setUpAxis(axis: number): void {
        // Axis setup (0=X, 1=Y, 2=Z up)
        // Three.js defaults to Y-up, so this is mainly for compatibility
    }

    resetCamera(dist: number = 15, yaw: number = 35, pitch: number = 50,
                targetX: number = 0, targetY: number = 3, targetZ: number = 0): void {
        // Convert spherical to cartesian coordinates
        const yawRad = (yaw * Math.PI) / 180;
        const pitchRad = (pitch * Math.PI) / 180;

        const x = targetX + dist * Math.cos(pitchRad) * Math.sin(yawRad);
        const y = targetY + dist * Math.sin(pitchRad);
        const z = targetZ + dist * Math.cos(pitchRad) * Math.cos(yawRad);

        this.camera.position.set(x, y, z);
        this.camera.lookAt(targetX, targetY, targetZ);
        this.controls.target.set(targetX, targetY, targetZ);
        this.controls.update();
    }

    addRigidBody(body: btRigidBody, shape: btCollisionShape, color?: btVector3): void {
        const mesh = this.createMeshFromShape(shape, color);
        this.rigidBodies.set(body, mesh);
        this.scene.add(mesh);
    }

    removeRigidBody(body: btRigidBody): void {
        const mesh = this.rigidBodies.get(body);
        if (mesh) {
            this.scene.remove(mesh);
            this.rigidBodies.delete(body);
        }
    }

    syncPhysicsToGraphics(world: btDiscreteDynamicsWorld): void {
        // Update Three.js mesh positions from physics bodies
        this.rigidBodies.forEach((mesh, body) => {
            const transform = new btTransform();
            body.getMotionState()?.getWorldTransform(transform);

            const origin = transform.getOrigin();
            const rotation = transform.getRotation();

            // Update position
            mesh.position.set(origin.x(), origin.y(), origin.z());

            // Update rotation
            mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
        });
    }

    render(): void {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // Ground plane helper
    addGroundPlane(size: number = 50, yPos: number = 0): void {
        const geometry = new THREE.PlaneGeometry(size * 2, size * 2);
        const material = new THREE.MeshLambertMaterial({
            color: 0x808080,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = yPos;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    // Get scene statistics for debugging
    getSceneStats(): { meshes: number; triangles: number } {
        let meshCount = 0;
        let triangleCount = 0;

        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                meshCount++;
                if (object.geometry) {
                    const geometry = object.geometry;
                    if (geometry.index) {
                        triangleCount += geometry.index.count / 3;
                    } else if (geometry.attributes.position) {
                        triangleCount += geometry.attributes.position.count / 3;
                    }
                }
            }
        });

        return {
            meshes: meshCount,
            triangles: triangleCount
        };
    }
}