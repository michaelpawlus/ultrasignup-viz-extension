// UltraSignup Visualizer - Debug Panel Component
// Provides debugging information and data inspection capabilities

/**
 * Create and inject debug panel into the page
 * @param {Object} debugInfo - Debug information to display
 */
function createDebugPanel(debugInfo) {
  // Check if debug panel already exists
  let panel = document.getElementById('us-viz-debug-panel');
  
  if (!panel) {
    // Create new panel
    panel = document.createElement('div');
    panel.id = 'us-viz-debug-panel';
    panel.className = 'us-debug-panel';
    
    // Find chart container or create before table
    const chartContainer = document.getElementById('us-viz-container');
    const resultsTable = document.querySelector('table.ultra-table, table');
    
    if (chartContainer) {
      chartContainer.parentNode.insertBefore(panel, chartContainer);
    } else if (resultsTable) {
      resultsTable.parentNode.insertBefore(panel, resultsTable);
    } else {
      document.body.insertBefore(panel, document.body.firstChild);
    }
  }
  
  // Update panel content
  panel.innerHTML = createDebugHTML(debugInfo);
  
  // Attach event listeners
  attachDebugEventListeners(debugInfo);
}

/**
 * Generate HTML for debug panel
 * @param {Object} debugInfo - Debug information
 * @returns {string} HTML string
 */
function createDebugHTML(debugInfo) {
  const {
    source = 'unknown',
    url = '',
    dataCount = 0,
    filteredCount = 0,
    activeDistance = '',
    binCount = 0,
    sampleData = [],
    timings = {},
    errors = []
  } = debugInfo;
  
  return `
    <div class="debug-header">
      <strong>🐛 Debug Mode</strong>
      <button id="us-debug-toggle" class="debug-btn">Minimize</button>
      <button id="us-debug-close" class="debug-btn-close">✕</button>
    </div>
    
    <div id="us-debug-content" class="debug-content">
      <div class="debug-section">
        <h3>Data Source</h3>
        <div class="debug-info">
          <span class="debug-label">Method:</span>
          <span class="debug-value ${source === 'api' ? 'success' : 'warning'}">${source.toUpperCase()}</span>
        </div>
        ${url ? `<div class="debug-info"><span class="debug-label">URL:</span><span class="debug-value small">${url}</span></div>` : ''}
      </div>
      
      <div class="debug-section">
        <h3>Data Statistics</h3>
        <div class="debug-info">
          <span class="debug-label">Total Results:</span>
          <span class="debug-value">${dataCount}</span>
        </div>
        <div class="debug-info">
          <span class="debug-label">Filtered Results:</span>
          <span class="debug-value">${filteredCount}</span>
        </div>
        <div class="debug-info">
          <span class="debug-label">Active Distance:</span>
          <span class="debug-value">${activeDistance || 'All'}</span>
        </div>
        <div class="debug-info">
          <span class="debug-label">Histogram Bins:</span>
          <span class="debug-value">${binCount}</span>
        </div>
      </div>
      
      ${Object.keys(timings).length > 0 ? `
      <div class="debug-section">
        <h3>Performance</h3>
        ${Object.entries(timings).map(([key, value]) => `
          <div class="debug-info">
            <span class="debug-label">${key}:</span>
            <span class="debug-value">${value}ms</span>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${sampleData.length > 0 ? `
      <div class="debug-section">
        <h3>Sample Data (first ${Math.min(5, sampleData.length)} entries)</h3>
        <pre class="debug-code">${JSON.stringify(sampleData.slice(0, 5), null, 2)}</pre>
      </div>
      ` : ''}
      
      ${errors.length > 0 ? `
      <div class="debug-section error">
        <h3>Errors</h3>
        ${errors.map(err => `<div class="debug-error">${err}</div>`).join('')}
      </div>
      ` : ''}
      
      <div class="debug-section">
        <h3>Actions</h3>
        <div class="debug-actions">
          <button id="us-debug-export" class="debug-btn">Export Debug Data</button>
          <button id="us-debug-console" class="debug-btn">Log to Console</button>
          <button id="us-debug-refresh" class="debug-btn">Refresh Data</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners to debug panel buttons
 * @param {Object} debugInfo - Debug information
 */
function attachDebugEventListeners(debugInfo) {
  // Toggle minimize/maximize
  const toggleBtn = document.getElementById('us-debug-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const content = document.getElementById('us-debug-content');
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Minimize' : 'Expand';
    });
  }
  
  // Close debug panel
  const closeBtn = document.getElementById('us-debug-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const panel = document.getElementById('us-viz-debug-panel');
      if (panel) {
        panel.remove();
      }
      // Disable debug mode
      localStorage.setItem('us-viz-debug', 'false');
    });
  }
  
  // Export debug data
  const exportBtn = document.getElementById('us-debug-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportDebugData(debugInfo);
    });
  }
  
  // Log to console
  const consoleBtn = document.getElementById('us-debug-console');
  if (consoleBtn) {
    consoleBtn.addEventListener('click', () => {
      console.log('UltraSignup Visualizer Debug Info:', debugInfo);
      alert('Debug info logged to console (F12)');
    });
  }
  
  // Refresh data
  const refreshBtn = document.getElementById('us-debug-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      location.reload();
    });
  }
}

/**
 * Export debug data as JSON file
 * @param {Object} debugInfo - Debug information
 */
function exportDebugData(debugInfo) {
  const exportData = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    ...debugInfo
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ultrasignup-debug-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
function isDebugMode() {
  return localStorage.getItem('us-viz-debug') === 'true';
}

/**
 * Enable debug mode
 */
function enableDebugMode() {
  localStorage.setItem('us-viz-debug', 'true');
}

/**
 * Disable debug mode
 */
function disableDebugMode() {
  localStorage.setItem('us-viz-debug', 'false');
  const panel = document.getElementById('us-viz-debug-panel');
  if (panel) {
    panel.remove();
  }
}

/**
 * Toggle debug mode
 * @returns {boolean} New debug mode state
 */
function toggleDebugMode() {
  const currentState = isDebugMode();
  if (currentState) {
    disableDebugMode();
  } else {
    enableDebugMode();
  }
  return !currentState;
}

// Export functions for use in content.js
if (typeof window !== 'undefined') {
  window.DebugPanel = {
    create: createDebugPanel,
    isEnabled: isDebugMode,
    enable: enableDebugMode,
    disable: disableDebugMode,
    toggle: toggleDebugMode
  };
}

