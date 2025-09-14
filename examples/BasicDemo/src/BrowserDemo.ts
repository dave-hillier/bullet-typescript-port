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

import { BasicExample, BasicExampleCreateFunc } from './BasicExample.js';
import { SimpleThreeJsGUIHelper } from './SimpleThreeJsGUIHelper.js';
import type { btRigidBody } from '../../../src/BulletDynamics/Dynamics/btRigidBody.js';
import type { CommonExampleInterface } from '../../CommonInterfaces/CommonExampleInterface.js';

export class BrowserDemo {
    private example: CommonExampleInterface;
    private guiHelper: SimpleThreeJsGUIHelper;
    private isRunning = false;
    private frameCount = 0;
    private lastTime = 0;
    private isWireframe = false;
    
    constructor() {
        // Create the 3D renderer
        const canvas = this.createCanvas();
        this.guiHelper = new SimpleThreeJsGUIHelper(canvas);

        // Create the example with GUI helper
        this.example = BasicExampleCreateFunc(this.guiHelper);

        this.setupUI();
    }

    private createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.id = 'render-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1;
        `;
        document.body.appendChild(canvas);
        return canvas;
    }
    

    private setupUI(): void {
        const container = document.getElementById('demo-container') || document.body;
        
        // Create control panel with higher z-index to appear over 3D scene
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        controlPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: monospace;
            min-width: 250px;
        `;
        
        const title = document.createElement('h3');
        title.textContent = '🚀 Bullet3 3D Demo (Vite + TypeScript + Three.js)';
        title.style.margin = '0 0 10px 0';
        controlPanel.appendChild(title);
        
        const buttonStyle = `
            margin: 5px;
            padding: 8px 15px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        `;
        
        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Simulation';
        startBtn.style.cssText = buttonStyle + 'background: #28a745; color: white;';
        startBtn.onclick = () => this.startSimulation();
        controlPanel.appendChild(startBtn);
        
        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Simulation';
        stopBtn.style.cssText = buttonStyle + 'background: #ffc107; color: black;';
        stopBtn.onclick = () => this.stopSimulation();
        controlPanel.appendChild(stopBtn);
        
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.style.cssText = buttonStyle + 'background: #dc3545; color: white;';
        resetBtn.onclick = () => this.resetSimulation();
        controlPanel.appendChild(resetBtn);
        
        const wireframeBtn = document.createElement('button');
        wireframeBtn.textContent = 'Toggle Wireframe';
        wireframeBtn.style.cssText = buttonStyle + 'background: #6c757d; color: white;';
        wireframeBtn.onclick = () => this.toggleWireframe();
        controlPanel.appendChild(wireframeBtn);
        
        const infoDiv = document.createElement('div');
        infoDiv.id = 'info';
        infoDiv.className = 'info-display';
        infoDiv.style.cssText = `
            margin-top: 10px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            font-size: 12px;
        `;
        controlPanel.appendChild(infoDiv);
        
        container.appendChild(controlPanel);
        
        // Create output area in bottom right
        const outputArea = document.createElement('div');
        outputArea.id = 'output';
        outputArea.className = 'output-area';
        outputArea.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 400px;
            height: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: #61dafb;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 11px;
            overflow-y: auto;
            z-index: 1000;
        `;
        container.appendChild(outputArea);
        
        this.log('🎯 Bullet3 TypeScript Demo with 3D Rendering!');
        this.log('📦 Using Vite + TypeScript + Three.js');
        this.log('🎮 Use mouse to orbit the 3D scene');
        this.log('▶️ Click "Start Simulation" to begin physics simulation');
    }
    
    private toggleWireframe(): void {
        this.isWireframe = this.guiHelper.toggleWireframe();
        this.log(`🔧 Wireframe mode: ${this.isWireframe ? 'ON' : 'OFF'}`);

        // Update the button text to reflect current state
        const wireframeBtn = document.querySelector('button[onclick*="toggleWireframe"]') as HTMLButtonElement;
        if (wireframeBtn) {
            wireframeBtn.textContent = this.isWireframe ? 'Solid Mode' : 'Wireframe Mode';
        }
    }

    private log(message: string): void {
        const output = document.getElementById('output');
        if (output) {
            const time = new Date().toLocaleTimeString();
            output.innerHTML += `<span style="color: #61dafb;">[${time}]</span> ${message}<br>`;
            output.scrollTop = output.scrollHeight;
        }
        console.log(message);
    }

    private updateInfo(): void {
        const info = document.getElementById('info');
        if (info && this.example.getDynamicsWorld && this.example.getDynamicsWorld()) {
            const world = this.example.getDynamicsWorld()!;
            const sceneStats = this.guiHelper.getSceneStats();

            info.innerHTML = `
                <div>Status: <span style="color: ${this.isRunning ? '#28a745' : '#ffc107'}">${this.isRunning ? 'Running' : 'Stopped'}</span></div>
                <div>Frame: <span style="color: #61dafb">${this.frameCount}</span></div>
                <div>Objects: <span style="color: #61dafb">${world.getNumCollisionObjects()}</span></div>
                <div>3D Meshes: <span style="color: #61dafb">${sceneStats.meshes}</span></div>
                <div>Triangles: <span style="color: #61dafb">${Math.round(sceneStats.triangles)}</span></div>
                <div>Render Mode: <span style="color: ${this.isWireframe ? '#ffc107' : '#28a745'}">${this.isWireframe ? 'Wireframe' : 'Solid'}</span></div>
                <div>FPS: <span style="color: #61dafb">~${Math.round(1000 / (performance.now() - this.lastTime + 1))}</span></div>
            `;
        }
    }

    private startSimulation(): void {
        if (!this.isRunning) {
            this.log('🔥 Initializing Bullet3 physics world...');
            try {
                this.example.initPhysics();
                this.isRunning = true;
                this.frameCount = 0;
                this.lastTime = performance.now();
                this.log('✅ Physics initialized successfully!');
                this.log('📊 125 rigid bodies created (5×5×5 stack)');
                this.log('🌍 Gravity: -10 m/s²');
                this.simulationLoop();
            } catch (error) {
                this.log(`❌ Error initializing physics: ${error}`);
                console.error(error);
            }
        }
    }

    private stopSimulation(): void {
        if (this.isRunning) {
            this.isRunning = false;
            this.log('⏸️ Simulation paused');
        }
    }

    private resetSimulation(): void {
        this.stopSimulation();
        this.log('🧹 Cleaning up physics world...');
        try {
            this.example.exitPhysics();
            if (this.guiHelper && 'dispose' in this.guiHelper) {
                // Don't dispose the renderer, just clear the scene for reset
            }
            this.log('✅ Physics world cleaned up successfully');
            this.frameCount = 0;
            this.updateInfo();
        } catch (error) {
            this.log(`❌ Error cleaning up physics: ${error}`);
            console.error(error);
        }
    }

    private simulationLoop(): void {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        try {
            // Step the physics simulation
            this.example.stepSimulation(Math.min(deltaTime, 1/30)); // Cap at 30fps for stability

            // Render the 3D scene
            this.example.renderScene();
            this.guiHelper.render();

            this.frameCount++;

            // Update info every 60 frames
            if (this.frameCount % 60 === 0) {
                this.updateInfo();
                this.logObjectPositions();
            }

            // Debug physics stepping occasionally
            if (this.frameCount % 120 === 0) { // Every 2 seconds at 60fps
                const world = this.example.getDynamicsWorld ? this.example.getDynamicsWorld() : null;
                if (world) {
                    console.log(`Physics step ${this.frameCount}: ${world.getNumCollisionObjects()} objects, deltaTime: ${deltaTime.toFixed(4)}`);
                }
            }

        } catch (error) {
            this.log(`❌ Simulation error: ${error}`);
            console.error(error);
            this.stopSimulation();
            return;
        }

        // Continue the loop
        requestAnimationFrame(() => this.simulationLoop());
    }

    private logObjectPositions(): void {
        const world = this.example.getDynamicsWorld ? this.example.getDynamicsWorld() : null;
        if (!world) return;

        const objects = world.getCollisionObjectArray();
        const dynamicObjects = objects.filter((obj: any) => {
            const body = obj as btRigidBody;
            return body && body.getMass && body.getMass() > 0;
        });

        console.log(`Total objects: ${objects.length}, Dynamic objects: ${dynamicObjects.length}`);

        if (dynamicObjects.length > 0) {
            // Log first few dynamic objects
            const samplesToLog = Math.min(3, dynamicObjects.length);
            let positionInfo = `📍 Object positions (first ${samplesToLog}): `;

            for (let i = 0; i < samplesToLog; i++) {
                const body = dynamicObjects[i] as btRigidBody;
                const transform = body.getWorldTransform();
                const origin = transform.getOrigin();
                const mass = body.getMass ? body.getMass() : 'unknown';
                positionInfo += `[${i}](${origin.x().toFixed(2)}, ${origin.y().toFixed(2)}, ${origin.z().toFixed(2)}, m=${mass}) `;
            }

            this.log(positionInfo);

            // Check if objects are actually moving
            if (this.frameCount > 120) { // After 2 seconds
                const firstBody = dynamicObjects[0] as btRigidBody;
                const pos = firstBody.getWorldTransform().getOrigin();
                if (Math.abs(pos.y() - 3.0) < 0.1) { // Still near starting Y position
                    console.warn("⚠️ Objects don't seem to be falling! Y position still near starting position:", pos.y());
                }
            }
        } else {
            console.warn("⚠️ No dynamic objects found in physics world!");
        }
    }
}