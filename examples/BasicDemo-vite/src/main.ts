import './style.css'
import { BrowserDemo } from './BrowserDemo'

// Hide loading indicator
function hideLoading(): void {
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.display = 'none'
  }
}

// Show error message
function showError(message: string): void {
  const container = document.getElementById('demo-container')
  if (container) {
    const errorDiv = document.createElement('div')
    errorDiv.className = 'error'
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 80%;
      z-index: 3000;
    `
    errorDiv.innerHTML = `
      <h3>Error Loading Demo</h3>
      <p>${message}</p>
      <p><small>Check the browser console for detailed error information.</small></p>
      <button onclick="location.reload()">Reload Page</button>
    `
    container.appendChild(errorDiv)
  }
}

// Error handling
window.addEventListener('error', (event) => {
  console.error('Runtime error:', event.error)
  hideLoading()
  showError(`Runtime Error: ${event.error?.message || 'Unknown error'}`)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  hideLoading()
  showError(`Promise Error: ${event.reason}`)
})

// Initialize the demo
async function initDemo(): Promise<void> {
  try {
    console.log('🚀 Starting Bullet3 Demo with Vite + TypeScript...')
    
    // Initialize the demo
    const demo = new BrowserDemo()
    
    // Hide loading after a short delay to show the UI
    setTimeout(hideLoading, 800)
    
    console.log('✅ Demo initialized successfully!')
    
  } catch (error) {
    console.error('❌ Failed to initialize demo:', error)
    hideLoading()
    showError(`Failed to initialize: ${error}`)
  }
}

// Start the demo when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemo)
} else {
  initDemo()
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  // Any cleanup if needed
  console.log('👋 Demo unloading...')
})