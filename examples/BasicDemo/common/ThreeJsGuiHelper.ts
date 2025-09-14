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
*/

import * as THREE from 'three';
import type { btRigidBody } from '../../../src/BulletDynamics/Dynamics/btRigidBody';
import type { btDiscreteDynamicsWorld } from '../../../src/BulletDynamics/Dynamics/btDiscreteDynamicsWorld';
import type { btBoxShape } from '../../../src/BulletCollision/CollisionShapes/btBoxShape';
import { btVector3 } from '../../../src/LinearMath/btVector3';
import { GuiHelper } from './CommonHelpers';

export class ThreeJsGuiHelper implements GuiHelper {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private rigidBodyMeshMap = new Map<btRigidBody, THREE.Mesh>();
    private container: HTMLElement;
    private upAxis: number = 1; // Y-up by default

    constructor(container: HTMLElement) {
        this.container = container;
        this.initThreeJS();
        this.setupLighting();
        this.setupEventListeners();
        this.resetCamera(); // Set initial camera position
    }

    private initThreeJS(): void {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // Aspect
            0.1, // Near
            1000 // Far
        );

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add canvas to container
        this.container.appendChild(this.renderer.domElement);
    }

    private setupLighting(): void {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }

    private setupEventListeners(): void {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // GuiHelper interface implementation
    public setUpAxis(axis: number): void {
        this.upAxis = axis;
    }

    public resetCamera(
        dist: number = 4, 
        yaw: number = 52, 
        pitch: number = -35, 
        targetX: number = 0, 
        targetY: number = 0, 
        targetZ: number = 0
    ): void {
        // Convert angles to radians
        const pitchRad = pitch * (Math.PI / 180);
        const yawRad = yaw * (Math.PI / 180);
        
        const x = dist * Math.cos(pitchRad) * Math.sin(yawRad);
        const y = dist * Math.sin(pitchRad);
        const z = dist * Math.cos(pitchRad) * Math.cos(yawRad);
        
        this.camera.position.set(x, -y, z); // Negative y for correct pitch direction
        this.camera.lookAt(targetX, targetY, targetZ);
    }

    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public syncPhysicsToGraphics(world: btDiscreteDynamicsWorld): void {
        // Update all rigid body positions from physics world
        for (const [rigidBody, mesh] of this.rigidBodyMeshMap) {
            const transform = rigidBody.getWorldTransform();
            const origin = transform.getOrigin();
            const rotation = transform.getRotation();

            // Update position
            mesh.position.set(origin.x(), origin.y(), origin.z());

            // Update rotation (convert Bullet quaternion to Three.js quaternion)
            mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
        }
    }

    // Methods for managing visual objects
    public addGroundPlane(size: number = 50, yPos: number = -50): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
        const material = new THREE.MeshLambertMaterial({ 
            color: 0x888888,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, yPos, 0);
        mesh.receiveShadow = true;
        
        this.scene.add(mesh);
        return mesh;
    }

    public addRigidBodyVisual(
        rigidBody: btRigidBody, 
        shape: btBoxShape, 
        color: btVector3 = new btVector3(1, 0, 0)
    ): THREE.Mesh {
        // Get shape dimensions
        const halfExtents = shape.getHalfExtentsWithMargin();
        
        // Create box mesh
        const geometry = new THREE.BoxGeometry(
            halfExtents.x() * 2, 
            halfExtents.y() * 2, 
            halfExtents.z() * 2
        );
        
        const material = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color(color.x(), color.y(), color.z())
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        this.scene.add(mesh);
        this.rigidBodyMeshMap.set(rigidBody, mesh);
        
        return mesh;
    }

    public removeRigidBodyVisual(rigidBody: btRigidBody): void {
        const mesh = this.rigidBodyMeshMap.get(rigidBody);
        if (mesh) {
            this.scene.remove(mesh);
            this.rigidBodyMeshMap.delete(rigidBody);
        }
    }

    public setWireframeMode(enabled: boolean): void {
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                if (object.material instanceof THREE.MeshLambertMaterial) {
                    object.material.wireframe = enabled;
                }
            }
        });
    }

    public getCanvas(): HTMLCanvasElement {
        return this.renderer.domElement;
    }

    public getSceneStats(): { meshes: number, triangles: number } {
        let meshCount = 0;
        let triangles = 0;
        
        this.scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                meshCount++;
                if (object.geometry instanceof THREE.BufferGeometry) {
                    const positionAttribute = object.geometry.getAttribute('position');
                    if (positionAttribute) {
                        triangles += positionAttribute.count / 3;
                    }
                }
            }
        });
        
        return { meshes: meshCount, triangles };
    }

    public dispose(): void {
        // Clean up Three.js resources
        this.scene.clear();
        this.rigidBodyMeshMap.clear();
        this.renderer.dispose();
        if (this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}