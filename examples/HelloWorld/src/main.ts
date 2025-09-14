/*
HelloWorld Demo - Main Entry Point
TypeScript port of Bullet3 HelloWorld example
*/

import { SimpleHelloWorldDemo } from './SimpleHelloWorld';

/**
 * Console interface that outputs to the HTML console div
 */
class HTMLConsole {
  private outputElement: HTMLElement;

  constructor(elementId: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Console element ${elementId} not found`);
    }
    this.outputElement = element;
  }

  log(message: string): void {
    // Create a new div for each log message
    const logLine = document.createElement('div');
    logLine.style.marginBottom = '2px';

    // Color code different types of messages
    if (message.includes('❌')) {
      logLine.style.color = '#f87171'; // red
    } else if (message.includes('✅')) {
      logLine.style.color = '#4ade80'; // green
    } else if (message.includes('🚀') || message.includes('⚽') || message.includes('📦')) {
      logLine.style.color = '#60a5fa'; // blue
    } else if (message.includes('⚠️')) {
      logLine.style.color = '#fbbf24'; // yellow
    } else if (message.startsWith('world pos')) {
      logLine.style.color = '#c084fc'; // purple for position data
      logLine.style.fontSize = '12px';
      logLine.style.fontFamily = 'monospace';
    } else {
      logLine.style.color = '#d1d5db'; // light gray
    }

    logLine.textContent = message;
    this.outputElement.appendChild(logLine);

    // Auto-scroll to bottom
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }
}

/**
 * Status manager for UI updates
 */
class StatusManager {
  private statusElement: HTMLElement;
  private startBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;

  constructor() {
    this.statusElement = document.getElementById('status') as HTMLElement;
    this.startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;

    if (!this.statusElement || !this.startBtn || !this.stopBtn) {
      throw new Error('Required UI elements not found');
    }
  }

  updateStatus(status: string, isRunning: boolean): void {
    this.statusElement.textContent = status;

    // Update button states
    this.startBtn.disabled = isRunning;
    this.stopBtn.disabled = !isRunning;

    // Update status styling
    this.statusElement.className = 'status ' + (
      isRunning ? 'running' :
      status.includes('complete') ? 'complete' :
      'stopped'
    );
  }
}

/**
 * Application class that manages the HelloWorld demo
 */
class HelloWorldApp {
  private demo!: SimpleHelloWorldDemo;
  private console!: HTMLConsole;
  private statusManager!: StatusManager;

  constructor() {
    try {
      // Initialize console and status manager
      this.console = new HTMLConsole('console-output');
      this.statusManager = new StatusManager();

      // Create the HelloWorld demo
      this.demo = new SimpleHelloWorldDemo(this.console);

      // Set up status change callback
      this.demo.onStatusChange = (status: string, isRunning: boolean) => {
        this.statusManager.updateStatus(status, isRunning);
      };

      // Initialize physics
      this.demo.initPhysics();

      // Make demo available globally for button callbacks
      (window as any).helloWorld = this;

      this.console.log('🎮 HelloWorld app initialized successfully');
      this.statusManager.updateStatus('Ready to start', false);

    } catch (error) {
      console.error('Failed to initialize HelloWorld app:', error);
      this.showError(`Initialization failed: ${error}`);
    }
  }

  /**
   * Start the simulation
   */
  start(): void {
    try {
      this.demo.start();
    } catch (error) {
      console.error('Failed to start simulation:', error);
      this.console.log(`❌ Failed to start: ${error}`);
    }
  }

  /**
   * Stop the simulation
   */
  stop(): void {
    try {
      this.demo.stop();
    } catch (error) {
      console.error('Failed to stop simulation:', error);
      this.console.log(`❌ Failed to stop: ${error}`);
    }
  }

  /**
   * Reset the simulation
   */
  reset(): void {
    try {
      this.demo.reset();
    } catch (error) {
      console.error('Failed to reset simulation:', error);
      this.console.log(`❌ Failed to reset: ${error}`);
    }
  }

  private showError(message: string): void {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = `Error: ${message}`;
      statusElement.className = 'status stopped';
    }
  }
}

/**
 * Initialize the application when the DOM is ready
 */
function initApp(): void {
  try {
    console.log('🚀 Starting HelloWorld Demo...');
    new HelloWorldApp();
    console.log('✅ HelloWorld Demo ready!');
  } catch (error) {
    console.error('❌ Failed to start HelloWorld Demo:', error);

    // Show error in the UI
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = `Failed to initialize: ${error}`;
      statusElement.className = 'status stopped';
    }
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Handle page unload cleanup
window.addEventListener('beforeunload', () => {
  console.log('👋 HelloWorld Demo unloading...');
});