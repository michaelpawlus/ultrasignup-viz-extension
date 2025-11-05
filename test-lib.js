// UltraSignup Visualizer - Testable Library Functions
// These functions are extracted from content.js for testing and reuse

// ===== Time Conversion Functions =====

/**
 * Convert time string to seconds
 * @param {string} timeStr - Time in format "HH:MM:SS"
 * @returns {number|null} - Time in seconds, or null if invalid
 */
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

/**
 * Convert seconds back to readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Time in format "HH:MM"
 */
function secondsToTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

// ===== Data Filtering Functions =====

/**
 * Filter results by active distance
 * @param {Array} results - Array of race results
 * @param {string} activeDistance - Distance name to filter by
 * @returns {Array} - Filtered results
 */
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

// ===== Histogram Functions =====

/**
 * Create histogram data from race results
 * @param {Array} results - Array of race results with Time field
 * @param {number} binSizeMinutes - Size of each bin in minutes
 * @returns {Object} - Object with labels and data arrays
 */
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

// ===== Export for different environments =====

// For browser (including test.html)
if (typeof window !== 'undefined') {
  window.UltraSignupLib = {
    timeToSeconds,
    secondsToTime,
    filterByDistance,
    createHistogramData
  };
}

// For Node.js (Jest tests)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    timeToSeconds,
    secondsToTime,
    filterByDistance,
    createHistogramData
  };
}

