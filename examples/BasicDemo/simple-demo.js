// Simple standalone demo without modules for debugging
console.log('Starting simple Bullet3 demo...');

// Basic demo functionality
class SimpleBulletDemo {
    constructor() {
        this.isRunning = false;
        this.frameCount = 0;
        this.objects = [];
        
        // Create some mock physics objects for testing
        for (let i = 0; i < 10; i++) {
            this.objects.push({
                position: { x: Math.random() * 2 - 1, y: 10 + i * 0.5, z: Math.random() * 2 - 1 },
                velocity: { x: 0, y: 0, z: 0 },
                mass: 1.0
            });
        }
        
        this.setupUI();
    }
    
    setupUI() {
        const container = document.getElementById('demo-container');
        if (!container) return;
        
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
        title.textContent = 'Simple Bullet3 Demo (Testing)';
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
        
        this.log('Simple demo initialized. This is a test version without full physics.');
        this.log('Click Start to begin basic gravity simulation.');
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
        if (info) {
            info.innerHTML = `
                <div>Frame: ${this.frameCount}</div>
                <div>Objects: ${this.objects.length}</div>
                <div>Status: ${this.isRunning ? 'Running' : 'Stopped'}</div>
            `;
        }
    }
    
    startSimulation() {
        if (!this.isRunning) {
            this.log('Starting basic gravity simulation...');
            this.isRunning = true;
            this.frameCount = 0;
            this.lastTime = performance.now();
            this.simulationLoop();
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
        this.log('Resetting simulation...');
        
        // Reset all objects
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].position.y = 10 + i * 0.5;
            this.objects[i].velocity = { x: 0, y: 0, z: 0 };
        }
        
        this.frameCount = 0;
        this.updateInfo();
        this.log('Simulation reset');
    }
    
    simulationLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Basic gravity simulation
        const gravity = -9.81;
        const groundY = -5;
        
        for (const obj of this.objects) {
            // Apply gravity
            obj.velocity.y += gravity * deltaTime;
            
            // Update position
            obj.position.y += obj.velocity.y * deltaTime;
            
            // Simple ground collision
            if (obj.position.y < groundY) {
                obj.position.y = groundY;
                obj.velocity.y = -obj.velocity.y * 0.8; // Bounce with damping
            }
        }
        
        this.frameCount++;
        
        // Update info every 60 frames
        if (this.frameCount % 60 === 0) {
            this.updateInfo();
            this.logObjectPositions();
        }
        
        // Continue the loop
        requestAnimationFrame(() => this.simulationLoop());
    }
    
    logObjectPositions() {
        if (this.objects.length > 0) {
            const obj = this.objects[0];
            this.log(`Object 0 position: (${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})`);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing simple demo...');
    new SimpleBulletDemo();
});

console.log('Simple demo script loaded');