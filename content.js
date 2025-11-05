// UltraSignup Race Visualizer - Content Script
// This script runs automatically on UltraSignup race results pages

(function() {
  'use strict';
  
  // ===== STEP 1: Check if we're on a valid results page =====
  // Extract the race ID (did parameter) from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const raceId = urlParams.get('did');
  
  if (!raceId) {
    console.log('UltraSignup Visualizer: No race ID found in URL');
    return;
  }
  
  console.log(`UltraSignup Visualizer: Found race ID ${raceId}`);
  
  // ===== STEP 2: Convert time strings to seconds =====
  // Race times come in format "HH:MM:SS" (e.g., "16:50:30" or "26:45:12")
  // Note: Chart.js is automatically loaded by manifest.json before this script runs
  function timeToSeconds(timeStr) {
    if (!timeStr || timeStr.trim() === '') return null;
    
    const parts = timeStr.split(':');
    if (parts.length !== 3) return null;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  // ===== STEP 3: Convert seconds back to readable format =====
  function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // ===== STEP 4: Detect which distance tab is currently active =====
  // UltraSignup shows different distances (100M, 100K, 50K) in tabs
  function getActiveDistance() {
    // Look for the active tab in the distance selector
    const activeTab = document.querySelector('.nav-tabs .active a, .nav-tabs li.active a');
    if (activeTab) {
      const distanceText = activeTab.textContent.trim();
      console.log(`Active distance tab: ${distanceText}`);
      return distanceText;
    }
    return null;
  }
  
  // ===== STEP 5: Fetch race results from UltraSignup's JSON API or HTML =====
  async function fetchRaceResults() {
    // Try multiple API endpoint patterns
    const apiEndpoints = [
      `https://ultrasignup.com/service/events.svc/results/${raceId}/json`,
      `https://ultrasignup.com/m/service/events.svc/results/${raceId}/json`,
      `https://ultrasignup.com/results/${raceId}/json`
    ];
    
    // Try each API endpoint
    for (const apiUrl of apiEndpoints) {
      console.log(`Trying API: ${apiUrl}`);
      
      try {
        const response = await fetch(apiUrl, {
          credentials: 'include' // Include cookies if needed
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✓ API success! Fetched ${data.length} results from ${apiUrl}`);
          return { data, source: 'api', url: apiUrl };
        }
      } catch (error) {
        console.log(`✗ API failed: ${apiUrl} - ${error.message}`);
      }
    }
    
    // All APIs failed, fall back to HTML scraping
    console.log('All API endpoints failed, falling back to HTML scraping...');
    try {
      const data = scrapeTableData();
      if (data && data.length > 0) {
        console.log(`✓ HTML scraping success! Scraped ${data.length} results`);
        return { data, source: 'scrape' };
      }
    } catch (error) {
      console.error('HTML scraping failed:', error);
    }
    
    // Both methods failed
    throw new Error('Could not fetch race results from API or HTML table');
  }
  
  // ===== HTML Scraping Functions =====
  
  /**
   * Scrape race results from the HTML table on the page
   * @returns {Array} - Array of race result objects
   */
  function scrapeTableData() {
    console.log('Attempting to scrape data from HTML table...');
    
    // Find the results table - try multiple selectors
    const table = document.querySelector('table.ultra-table') || 
                  document.querySelector('table[id*="result"]') ||
                  document.querySelector('table[class*="result"]') ||
                  document.querySelector('div.container table');
    
    if (!table) {
      console.error('Could not find results table');
      return [];
    }
    
    // Find the header row to identify column positions
    const headerRow = table.querySelector('thead tr, tr:first-child');
    if (!headerRow) {
      console.error('Could not find table header');
      return [];
    }
    
    // Parse headers to find column indices
    const headers = Array.from(headerRow.querySelectorAll('th, td')).map(h => h.textContent.trim().toLowerCase());
    
    const columnIndices = {
      place: findColumnIndex(headers, ['place', 'rank', 'pos', '#']),
      name: findColumnIndex(headers, ['name', 'runner', 'participant']),
      time: findColumnIndex(headers, ['time', 'finish', 'finish time', 'gun time', 'chip time']),
      gender: findColumnIndex(headers, ['gender', 'sex', 'm/f']),
      age: findColumnIndex(headers, ['age', 'ag']),
      city: findColumnIndex(headers, ['city', 'location']),
      state: findColumnIndex(headers, ['state', 'st']),
      distance: findColumnIndex(headers, ['distance', 'race', 'event'])
    };
    
    // Get distance from active tab if available
    const activeDistance = getActiveDistance();
    
    // Extract data rows (skip header row)
    const rows = Array.from(table.querySelectorAll('tbody tr, tr')).slice(1);
    
    const results = [];
    
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td, th'));
      
      // Skip empty rows or header rows
      if (cells.length === 0 || row.querySelector('th')) continue;
      
      // Extract data from cells
      const result = {
        Place: columnIndices.place >= 0 ? cells[columnIndices.place]?.textContent.trim() : '',
        Name: columnIndices.name >= 0 ? cells[columnIndices.name]?.textContent.trim() : '',
        Time: columnIndices.time >= 0 ? cells[columnIndices.time]?.textContent.trim() : '',
        Gender: columnIndices.gender >= 0 ? cells[columnIndices.gender]?.textContent.trim() : '',
        Age: columnIndices.age >= 0 ? cells[columnIndices.age]?.textContent.trim() : '',
        City: columnIndices.city >= 0 ? cells[columnIndices.city]?.textContent.trim() : '',
        State: columnIndices.state >= 0 ? cells[columnIndices.state]?.textContent.trim() : '',
        Race: columnIndices.distance >= 0 ? cells[columnIndices.distance]?.textContent.trim() : activeDistance || ''
      };
      
      // Only add rows with valid time data
      if (result.Time && result.Time.match(/\d+:\d+:\d+/)) {
        results.push(result);
      }
    }
    
    return results;
  }
  
  /**
   * Find column index by matching header names
   * @param {Array} headers - Array of header strings
   * @param {Array} possibleNames - Array of possible column names to match
   * @returns {number} - Column index, or -1 if not found
   */
  function findColumnIndex(headers, possibleNames) {
    for (let i = 0; i < headers.length; i++) {
      for (const name of possibleNames) {
        if (headers[i].includes(name)) {
          return i;
        }
      }
    }
    return -1;
  }
  
  // ===== STEP 6: Filter results by active distance =====
  function filterByDistance(results, activeDistance) {
    if (!activeDistance) return results;
    
    // Filter results that match the active distance
    // The JSON data has a "Race" field that contains the distance name
    const filtered = results.filter(result => {
      return result.Race && result.Race.includes(activeDistance);
    });
    
    console.log(`Filtered to ${filtered.length} results for distance: ${activeDistance}`);
    return filtered.length > 0 ? filtered : results;
  }
  
  // ===== STEP 7: Create histogram data =====
  // Group finish times into bins (e.g., every 30 minutes)
  function createHistogramData(results, binSizeMinutes = 30) {
    // Extract and convert all valid finish times to seconds
    const times = results
      .map(r => timeToSeconds(r.Time))
      .filter(t => t !== null)
      .sort((a, b) => a - b);
    
    if (times.length === 0) {
      return { labels: [], data: [] };
    }
    
    const minTime = times[0];
    const maxTime = times[times.length - 1];
    const binSizeSeconds = binSizeMinutes * 60;
    
    // Create bins from min to max time
    const bins = [];
    const binCounts = [];
    
    for (let binStart = minTime; binStart <= maxTime; binStart += binSizeSeconds) {
      const binEnd = binStart + binSizeSeconds;
      const count = times.filter(t => t >= binStart && t < binEnd).length;
      
      // Create label like "16:00-16:30"
      const label = `${secondsToTime(binStart)}-${secondsToTime(binEnd)}`;
      bins.push(label);
      binCounts.push(count);
    }
    
    return { labels: bins, data: binCounts };
  }
  
  // ===== STEP 8: Create and inject the chart container =====
  function createChartContainer() {
    // Check if we already added a chart
    if (document.getElementById('us-viz-container')) {
      return document.getElementById('us-viz-container');
    }
    
    // Find where to insert the chart (above the results table)
    const resultsTable = document.querySelector('table.ultra-table, table');
    if (!resultsTable) {
      console.error('Could not find results table');
      return null;
    }
    
    // Create container div
    const container = document.createElement('div');
    container.id = 'us-viz-container';
    container.className = 'ultrasignup-viz-container';
    
    // Create canvas element for Chart.js
    const canvas = document.createElement('canvas');
    canvas.id = 'us-viz-chart';
    container.appendChild(canvas);
    
    // Insert before the table
    resultsTable.parentNode.insertBefore(container, resultsTable);
    
    return container;
  }
  
  // ===== STEP 9: Render the histogram using Chart.js =====
  function renderHistogram(histogramData, raceName) {
    const canvas = document.getElementById('us-viz-chart');
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }
    
    // Destroy existing chart if present
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
    
    // Create new chart
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: histogramData.labels,
        datasets: [{
          label: 'Number of Finishers',
          data: histogramData.data,
          backgroundColor: 'rgba(76, 175, 80, 0.6)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          title: {
            display: true,
            text: `Finish Time Distribution${raceName ? ` - ${raceName}` : ''}`,
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          legend: {
            display: true
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `Finishers: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Finish Time (HH:MM)'
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            title: {
              display: true,
              text: 'Number of Finishers'
            },
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
    
    console.log('Chart rendered successfully!');
  }
  
  // ===== MAIN EXECUTION =====
  async function main() {
    const debugMode = window.DebugPanel && window.DebugPanel.isEnabled();
    const timings = {};
    const errors = [];
    let debugInfo = {};
    
    try {
      const startTime = performance.now();
      console.log('UltraSignup Visualizer: Starting...');
      
      if (debugMode) {
        console.log('🐛 Debug mode is ENABLED');
      }
      
      // Chart.js is automatically loaded by the manifest
      
      // Fetch race results (now returns {data, source})
      const fetchStart = performance.now();
      const resultInfo = await fetchRaceResults();
      timings.dataFetch = Math.round(performance.now() - fetchStart);
      
      if (!resultInfo || !resultInfo.data || resultInfo.data.length === 0) {
        console.log('No results found');
        showErrorMessage('No race results found. The race may not have results available yet.');
        errors.push('No results found from API or HTML scraping');
        
        if (debugMode) {
          window.DebugPanel.create({
            source: 'none',
            dataCount: 0,
            filteredCount: 0,
            activeDistance: '',
            binCount: 0,
            sampleData: [],
            timings,
            errors
          });
        }
        return;
      }
      
      console.log(`Data fetched via ${resultInfo.source}`);
      const results = resultInfo.data;
      
      // Detect active distance and filter results
      const filterStart = performance.now();
      const activeDistance = getActiveDistance();
      const filteredResults = filterByDistance(results, activeDistance);
      timings.filtering = Math.round(performance.now() - filterStart);
      
      // Create histogram data
      const histogramStart = performance.now();
      const histogramData = createHistogramData(filteredResults, 30);
      timings.histogram = Math.round(performance.now() - histogramStart);
      
      if (histogramData.data.length === 0) {
        console.log('No valid finish times to display');
        showErrorMessage('No valid finish times found in the results.');
        errors.push('No valid finish times in the data');
        
        if (debugMode) {
          window.DebugPanel.create({
            source: resultInfo.source,
            url: resultInfo.url || '',
            dataCount: results.length,
            filteredCount: filteredResults.length,
            activeDistance: activeDistance || 'All',
            binCount: 0,
            sampleData: results.slice(0, 5),
            timings,
            errors
          });
        }
        return;
      }
      
      // Create chart container and render
      const renderStart = performance.now();
      createChartContainer();
      renderHistogram(histogramData, activeDistance);
      timings.rendering = Math.round(performance.now() - renderStart);
      
      timings.total = Math.round(performance.now() - startTime);
      
      console.log(`✓ Visualization complete in ${timings.total}ms`);
      
      // Show debug panel if enabled
      if (debugMode) {
        debugInfo = {
          source: resultInfo.source,
          url: resultInfo.url || '',
          dataCount: results.length,
          filteredCount: filteredResults.length,
          activeDistance: activeDistance || 'All',
          binCount: histogramData.labels.length,
          sampleData: filteredResults.slice(0, 5),
          timings,
          errors
        };
        
        window.DebugPanel.create(debugInfo);
        console.log('🐛 Debug info:', debugInfo);
      }
      
    } catch (error) {
      console.error('UltraSignup Visualizer error:', error);
      showErrorMessage(`Error loading race data: ${error.message}`);
      errors.push(error.message);
      
      if (debugMode) {
        window.DebugPanel.create({
          source: 'error',
          dataCount: 0,
          filteredCount: 0,
          activeDistance: '',
          binCount: 0,
          sampleData: [],
          timings,
          errors
        });
      }
    }
  }
  
  // ===== ERROR DISPLAY =====
  function showErrorMessage(message) {
    // Check if we already added an error message
    if (document.getElementById('us-viz-error')) {
      return;
    }
    
    // Find where to insert the error (above the results table)
    const resultsTable = document.querySelector('table.ultra-table, table');
    if (!resultsTable) {
      return;
    }
    
    // Create error container
    const errorDiv = document.createElement('div');
    errorDiv.id = 'us-viz-error';
    errorDiv.className = 'ultrasignup-viz-error';
    errorDiv.innerHTML = `
      <strong>⚠️ UltraSignup Visualizer:</strong> ${message}
    `;
    
    // Insert before the table
    resultsTable.parentNode.insertBefore(errorDiv, resultsTable);
  }
  
  // Run when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
  
  // ===== DEBUG MODE HELPERS =====
  // Expose debug controls to console
  if (window.DebugPanel) {
    window.UltraSignupDebug = {
      enable: () => {
        window.DebugPanel.enable();
        console.log('✓ Debug mode enabled. Reload the page to see debug panel.');
        return 'Reload the page to see debug panel';
      },
      disable: () => {
        window.DebugPanel.disable();
        console.log('✓ Debug mode disabled.');
        return 'Debug mode disabled';
      },
      toggle: () => {
        const newState = window.DebugPanel.toggle();
        console.log(`✓ Debug mode ${newState ? 'enabled' : 'disabled'}. Reload the page.`);
        return `Debug mode ${newState ? 'enabled' : 'disabled'}. Reload the page.`;
      },
      status: () => {
        const enabled = window.DebugPanel.isEnabled();
        console.log(`Debug mode is currently ${enabled ? 'ENABLED' : 'DISABLED'}`);
        return enabled ? 'ENABLED' : 'DISABLED';
      }
    };
    
    // Show helper message
    console.log('%c💡 UltraSignup Visualizer Debug Commands:', 'color: #4CAF50; font-weight: bold; font-size: 14px');
    console.log('%cUltraSignupDebug.enable()  - Enable debug mode', 'color: #666');
    console.log('%cUltraSignupDebug.disable() - Disable debug mode', 'color: #666');
    console.log('%cUltraSignupDebug.toggle()  - Toggle debug mode', 'color: #666');
    console.log('%cUltraSignupDebug.status()  - Check debug status', 'color: #666');
  }
  
})();

