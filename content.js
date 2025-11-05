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
  
  // ===== STEP 5: Fetch race results from UltraSignup's JSON API =====
  async function fetchRaceResults() {
    const apiUrl = `https://ultrasignup.com/service/events.svc/results/${raceId}/json`;
    console.log(`Fetching data from: ${apiUrl}`);
    
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include' // Include cookies if needed
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} results`);
      return data;
    } catch (error) {
      console.error('Error fetching race results:', error);
      throw error;
    }
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
    try {
      console.log('UltraSignup Visualizer: Starting...');
      
      // Chart.js is automatically loaded by the manifest
      
      // Fetch race results
      const results = await fetchRaceResults();
      
      if (!results || results.length === 0) {
        console.log('No results found');
        return;
      }
      
      // Detect active distance and filter results
      const activeDistance = getActiveDistance();
      const filteredResults = filterByDistance(results, activeDistance);
      
      // Create histogram data
      const histogramData = createHistogramData(filteredResults, 30);
      
      if (histogramData.data.length === 0) {
        console.log('No valid finish times to display');
        return;
      }
      
      // Create chart container and render
      createChartContainer();
      renderHistogram(histogramData, activeDistance);
      
    } catch (error) {
      console.error('UltraSignup Visualizer error:', error);
    }
  }
  
  // Run when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
  
})();

