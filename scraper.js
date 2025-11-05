// UltraSignup HTML Table Scraper
// Extracts race data from the HTML table when API is unavailable

/**
 * Scrape race results from the HTML table on the page
 * @returns {Array} - Array of race result objects matching API format
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
  
  console.log('Found results table:', table);
  
  // Find the header row to identify column positions
  const headerRow = table.querySelector('thead tr, tr:first-child');
  if (!headerRow) {
    console.error('Could not find table header');
    return [];
  }
  
  // Parse headers to find column indices
  const headers = Array.from(headerRow.querySelectorAll('th, td')).map(h => h.textContent.trim().toLowerCase());
  console.log('Table headers:', headers);
  
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
  
  console.log('Column indices:', columnIndices);
  
  // Get distance from active tab if available
  const activeDistance = getActiveDistance();
  console.log('Active distance:', activeDistance);
  
  // Extract data rows (skip header row)
  const rows = Array.from(table.querySelectorAll('tbody tr, tr')).slice(1);
  console.log(`Found ${rows.length} data rows`);
  
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
  
  console.log(`Scraped ${results.length} valid results`);
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

/**
 * Detect which distance tab is currently active
 * @returns {string|null} - Active distance name
 */
function getActiveDistance() {
  // Look for the active tab in the distance selector
  const activeTab = document.querySelector('.nav-tabs .active a, .nav-tabs li.active a');
  if (activeTab) {
    const distanceText = activeTab.textContent.trim();
    console.log(`Active distance tab: ${distanceText}`);
    return distanceText;
  }
  
  // Also check for heading or title that might indicate distance
  const pageTitle = document.querySelector('h1, h2, .page-title');
  if (pageTitle) {
    const titleText = pageTitle.textContent;
    // Look for common distance patterns like "100 Mile", "50K", etc.
    const distanceMatch = titleText.match(/\d+\s*(mile|miler|k|km|marathon)/i);
    if (distanceMatch) {
      return distanceMatch[0];
    }
  }
  
  return null;
}

// Export for different environments
if (typeof window !== 'undefined') {
  window.scrapeTableData = scrapeTableData;
  window.getActiveDistance = getActiveDistance;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    scrapeTableData,
    getActiveDistance,
    findColumnIndex
  };
}

