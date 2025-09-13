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
class BrowserDemo {
    constructor() {
        this.isRunning = false;
        this.frameCount = 0;
        this.lastTime = 0;
        this.example = new BasicExample();
        this.setupUI();
    }
    setupUI() {
        const container = document.getElementById('demo-container') || document.body;
        // Create control panel
        const controlPanel = document.createElement('div');
        controlPanel.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
        `;
        const title = document.createElement('h3');
        title.textContent = 'Bullet3 Basic Demo (TypeScript)';
        title.style.margin = '0 0 10px 0';
        controlPanel.appendChild(title);
        const startBtn = document.createElement('button');
        startBtn.textContent = 'Start Simulation';
        startBtn.onclick = () => this.startSimulation();
        controlPanel.appendChild(startBtn);
        const stopBtn = document.createElement('button');
        stopBtn.textContent = 'Stop Simulation';
        stopBtn.onclick = () => this.stopSimulation();
        stopBtn.style.marginLeft = '10px';
        controlPanel.appendChild(stopBtn);
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.onclick = () => this.resetSimulation();
        resetBtn.style.marginLeft = '10px';
        controlPanel.appendChild(resetBtn);
        const infoDiv = document.createElement('div');
        infoDiv.id = 'info';
        infoDiv.style.marginTop = '10px';
        controlPanel.appendChild(infoDiv);
        container.appendChild(controlPanel);
        // Create output area
        const outputArea = document.createElement('div');
        outputArea.id = 'output';
        outputArea.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            height: 200px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 11px;
            overflow-y: auto;
            border-radius: 5px;
        `;
        container.appendChild(outputArea);
        this.log('Basic Demo initialized. Click Start to begin simulation.');
    }
    log(message) {
        const output = document.getElementById('output');
        if (output) {
            const time = new Date().toLocaleTimeString();
            output.innerHTML += `[${time}] ${message}<br>`;
            output.scrollTop = output.scrollHeight;
        }
        console.log(message);
    }
    updateInfo() {
        const info = document.getElementById('info');
        if (info && this.example.getDynamicsWorld()) {
            const world = this.example.getDynamicsWorld();
            info.innerHTML = `
                <div>Frame: ${this.frameCount}</div>
                <div>Objects: ${world.getNumCollisionObjects()}</div>
                <div>Status: ${this.isRunning ? 'Running' : 'Stopped'}</div>
            `;
        }
    }
    startSimulation() {
        if (!this.isRunning) {
            this.log('Initializing physics...');
            try {
                this.example.initPhysics();
                this.isRunning = true;
                this.frameCount = 0;
                this.lastTime = performance.now();
                this.log('Physics initialized successfully');
                this.simulationLoop();
            }
            catch (error) {
                this.log(`Error initializing physics: ${error}`);
                console.error(error);
            }
        }
    }
    stopSimulation() {
        if (this.isRunning) {
            this.isRunning = false;
            this.log('Simulation stopped');
        }
    }
    resetSimulation() {
        this.stopSimulation();
        this.log('Cleaning up physics...');
        try {
            this.example.exitPhysics();
            this.log('Physics cleaned up');
            this.frameCount = 0;
            this.updateInfo();
        }
        catch (error) {
            this.log(`Error cleaning up physics: ${error}`);
            console.error(error);
        }
    }
    simulationLoop() {
        if (!this.isRunning)
            return;
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        try {
            // Step the simulation
            this.example.stepSimulation(Math.min(deltaTime, 1 / 30)); // Cap at 30fps for stability
            this.frameCount++;
            // Update info every 60 frames
            if (this.frameCount % 60 === 0) {
                this.updateInfo();
                this.logObjectPositions();
            }
        }
        catch (error) {
            this.log(`Simulation error: ${error}`);
            console.error(error);
            this.stopSimulation();
            return;
        }
        // Continue the loop
        requestAnimationFrame(() => this.simulationLoop());
    }
    logObjectPositions() {
        const world = this.example.getDynamicsWorld();
        if (!world)
            return;
        const objects = world.getCollisionObjectArray();
        const dynamicObjects = objects.filter((obj, index) => {
            const body = obj;
            return body && body.getMass && body.getMass() > 0;
        });
        if (dynamicObjects.length > 0) {
            // Log first few dynamic objects
            const samplesToLog = Math.min(3, dynamicObjects.length);
            let positionInfo = `Dynamic object positions (first ${samplesToLog}): `;
            for (let i = 0; i < samplesToLog; i++) {
                const body = dynamicObjects[i];
                const transform = body.getWorldTransform();
                const origin = transform.getOrigin();
                positionInfo += `[${i}](${origin.x().toFixed(2)}, ${origin.y().toFixed(2)}, ${origin.z().toFixed(2)}) `;
            }
            this.log(positionInfo);
        }
    }
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BrowserDemo();
});
// Handle page unload
window.addEventListener('beforeunload', () => {
    // Any cleanup if needed
});
