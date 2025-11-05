# UltraSignup Race Visualizer

A Chrome extension that automatically adds visual charts to UltraSignup race results pages, making it easier to understand finish time distributions at a glance.

## Features

- 📊 **Automatic Histogram** - Shows finish time distribution in 30-minute bins
- 🎯 **Distance Detection** - Automatically detects and filters by active race distance (100M, 100K, 50K, etc.)
- 🚀 **Zero Configuration** - Just install and visit any UltraSignup race results page
- 📱 **Responsive** - Works on desktop and mobile browsers

## Installation (Developer Mode)

Since this extension is in development, you'll need to load it manually in Chrome:

### Step 1: Download the Extension Files

Make sure you have all these files in a folder:
- `manifest.json`
- `content.js`
- `styles.css`
- `README.md` (this file)

### Step 2: Load in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
3. **Enable "Developer mode"** by toggling the switch in the top-right corner
4. Click the **"Load unpacked"** button
5. Select the folder containing your extension files
6. You should see "UltraSignup Race Visualizer" appear in your extensions list

### Step 3: Verify Installation

- Look for a green bar chart icon in your extensions toolbar
- The extension should show as "Enabled"

## Usage

1. Navigate to any UltraSignup race results page, for example:
   - [Wolverine State 100 (2025)](https://ultrasignup.com/results_event.aspx?did=131438)
   - Or search for any race on [UltraSignup.com](https://ultrasignup.com)

2. The extension will automatically:
   - Detect the race ID from the URL
   - Fetch the race results
   - Display a histogram above the results table

3. If the race has multiple distances (tabs), the chart will show data for the currently active tab.

## How It Works

### Technical Overview

The extension uses several components working together:

**Core Files:**
1. **manifest.json** - Chrome extension configuration
   - Defines permissions (storage, ultrasignup.com)
   - Specifies content scripts and load order
   - Sets up icons and metadata

2. **content.js** - Main extension logic
   - Extracts race ID from URL
   - Tries multiple API endpoints
   - Falls back to HTML table scraping if APIs fail
   - Creates histogram and renders chart
   - Integrates debug mode

3. **styles.css** - Visual styling
   - Chart container styles
   - Error message styles
   - Debug panel styles

**Supporting Files:**
4. **debugPanel.js** - Debug mode functionality
   - Creates debug UI panel
   - Collects and displays performance metrics
   - Exports debug data

5. **test-lib.js** - Extracted core functions
   - Time conversion utilities
   - Histogram generation
   - Data filtering
   - Reusable across test environments

6. **scraper.js** - HTML scraping (integrated into content.js)
   - Parses result tables
   - Extracts finish times and race data
   - Handles different table formats

**Testing Files:**
7. **test.html** - Interactive test page
   - Standalone testing environment
   - Sample data and controls
   - Visual chart rendering

8. **tests/** - Jest test suite
   - Unit tests for all functions
   - Edge case coverage
   - Sample data fixtures

### Data Source

UltraSignup provides a JSON API endpoint:
```
https://ultrasignup.com/service/events.svc/results/{RACE_ID}/json
```

This returns all the data shown in the results table, including:
- Runner name, age, gender
- Finish time (HH:MM:SS)
- Rank and place
- City/state
- Race distance

## Testing & Debugging

### Standalone Test Page

Open `test.html` in your browser to test the extension functions without installing it:

1. Open `test.html` in any browser
2. Click "Load Sample Data" to populate with test data
3. Use the interactive controls to test:
   - Time conversion functions
   - Histogram generation with different bin sizes
   - Distance filtering
   - Edge cases and error handling
4. Export test data as JSON for further analysis

### Automated Tests

Run the Jest test suite to verify all functions:

```bash
cd tests
npm install
npm test
```

Available test commands:
- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

Test files:
- `time-conversion.test.js` - Tests time parsing and formatting
- `histogram.test.js` - Tests histogram generation
- `data-filtering.test.js` - Tests distance filtering

### Debug Mode

Enable debug mode to see detailed information about data fetching and processing:

**Enable via Console:**
1. Open browser console (F12) on any UltraSignup results page
2. Run: `UltraSignupDebug.enable()`
3. Reload the page
4. A debug panel will appear above the chart

**Debug Panel Features:**
- Data source (API or HTML scraping)
- Data statistics (total/filtered results)
- Performance timings
- Sample data inspection
- Error messages
- Export debug data as JSON

**Console Commands:**
- `UltraSignupDebug.enable()` - Enable debug mode
- `UltraSignupDebug.disable()` - Disable debug mode
- `UltraSignupDebug.toggle()` - Toggle debug mode
- `UltraSignupDebug.status()` - Check if debug mode is enabled

## Troubleshooting

### Chart doesn't appear

**Check the browser console:**
1. Right-click on the page → "Inspect" → "Console" tab
2. Look for messages starting with "UltraSignup Visualizer:"
3. Enable debug mode: `UltraSignupDebug.enable()` and reload
4. Common issues:
   - "No race ID found in URL" - Make sure you're on a `results_event.aspx` page
   - API errors - Extension now falls back to HTML scraping automatically
   - No table data - The race may not have results yet

### Chart shows wrong data

- If the race has multiple distances, make sure you're on the correct tab
- The extension filters by the active tab (e.g., "100 Miler", "50K")
- Enable debug mode to see filtered vs. total result counts

### Extension not loading

1. Go to `chrome://extensions/`
2. Check if "UltraSignup Race Visualizer" is enabled
3. Try clicking the refresh icon on the extension card
4. If errors appear, check that all files are in the folder
5. Check console for error messages

### Data Fetching Issues

The extension now uses a fallback strategy:
1. **First attempt**: Try multiple API endpoints
2. **Fallback**: Scrape data from HTML table
3. **Result**: You'll see which method worked in the console

Enable debug mode to see:
- Which API endpoints were tried
- Whether HTML scraping was used
- Sample of the data that was collected

## Future Enhancements

Ideas for version 2.0:
- ✨ Multiple chart types (box plot, scatter plot)
- 🔄 Tab switching detection (auto-update chart when switching distances)
- 🎨 Gender-based coloring
- 📈 Pace vs. age scatter plots
- ⚙️ Customizable bin sizes
- 💾 Export chart as image
- 🌙 Dark mode support

## Browser Compatibility

- ✅ **Chrome** - Fully supported
- ✅ **Edge** - Should work (Chromium-based)
- ❌ **Firefox** - Not yet (requires Manifest V2 version)
- ❌ **Safari** - Not yet (different extension format)

## Privacy & Permissions

This extension:
- ✅ Only runs on ultrasignup.com
- ✅ Only accesses publicly available race data
- ✅ Does not collect or store any personal information
- ✅ Does not track your browsing
- ✅ All processing happens locally in your browser

## Contributing

Found a bug or have a feature idea? This is a learning project, so feel free to:
- Test it on different races
- Suggest improvements
- Report issues

## License

Free to use and modify for personal use.

## Acknowledgments

- **UltraSignup** - For providing the race data API
- **Chart.js** - For the excellent charting library
- **The ultrarunning community** - For making data-driven racing fun! 🏃‍♂️🏃‍♀️

