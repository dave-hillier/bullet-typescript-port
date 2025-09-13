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

import { BasicExample } from './BasicExample';
import type { btRigidBody } from '@bullet3/BulletDynamics/Dynamics/btRigidBody';

export class BrowserDemo {
    private example: BasicExample;
    private isRunning = false;
    private frameCount = 0;
    private lastTime = 0;
    
    constructor() {
        this.example = new BasicExample();
        this.setupUI();
    }

    private setupUI(): void {
        const container = document.getElementById('demo-container') || document.body;
        
        // Create control panel
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        
        const title = document.createElement('h3');
        title.textContent = '🚀 Bullet3 Basic Demo (Vite + TypeScript)';
        controlPanel.appendChild(title);
        
        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Simulation';
        startBtn.onclick = () => this.startSimulation();
        controlPanel.appendChild(startBtn);
        
        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Simulation';
        stopBtn.onclick = () => this.stopSimulation();
        controlPanel.appendChild(stopBtn);
        
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.onclick = () => this.resetSimulation();
        controlPanel.appendChild(resetBtn);
        
        const infoDiv = document.createElement('div');
        infoDiv.id = 'info';
        infoDiv.className = 'info-display';
        controlPanel.appendChild(infoDiv);
        
        container.appendChild(controlPanel);
        
        // Create output area
        const outputArea = document.createElement('div');
        outputArea.id = 'output';
        outputArea.className = 'output-area';
        container.appendChild(outputArea);
        
        this.log('🎯 Bullet3 TypeScript Demo initialized with Vite!');
        this.log('📦 Using modern ES modules and hot reload');
        this.log('▶️ Click "Start Simulation" to begin physics simulation');
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
        if (info && this.example.getDynamicsWorld()) {
            const world = this.example.getDynamicsWorld()!;
            info.innerHTML = `
                <div>Status: <span style="color: ${this.isRunning ? '#28a745' : '#ffc107'}">${this.isRunning ? 'Running' : 'Stopped'}</span></div>
                <div>Frame: <span style="color: #61dafb">${this.frameCount}</span></div>
                <div>Objects: <span style="color: #61dafb">${world.getNumCollisionObjects()}</span></div>
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
            // Step the simulation
            this.example.stepSimulation(Math.min(deltaTime, 1/30)); // Cap at 30fps for stability
            
            this.frameCount++;
            
            // Update info every 60 frames
            if (this.frameCount % 60 === 0) {
                this.updateInfo();
                this.logObjectPositions();
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
        const world = this.example.getDynamicsWorld();
        if (!world) return;

        const objects = world.getCollisionObjectArray();
        const dynamicObjects = objects.filter((obj) => {
            const body = obj as btRigidBody;
            return body && body.getMass && body.getMass() > 0;
        });

        if (dynamicObjects.length > 0) {
            // Log first few dynamic objects
            const samplesToLog = Math.min(3, dynamicObjects.length);
            let positionInfo = `📍 Object positions (first ${samplesToLog}): `;
            
            for (let i = 0; i < samplesToLog; i++) {
                const body = dynamicObjects[i] as btRigidBody;
                const transform = body.getWorldTransform();
                const origin = transform.getOrigin();
                positionInfo += `[${i}](${origin.x().toFixed(2)}, ${origin.y().toFixed(2)}, ${origin.z().toFixed(2)}) `;
            }
            
            this.log(positionInfo);
        }
    }
}