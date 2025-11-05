# UltraSignup Visualizer - Testing & Debug Guide

## Quick Start

### 1. Test the Extension Locally (test.html)

Open `test.html` in your browser for immediate testing:

```bash
# Just open the file in any browser
open test.html  # macOS
start test.html # Windows
```

**What you can do:**
- Load sample race data
- Test time conversion functions
- Generate histograms with different bin sizes
- Test distance filtering
- Run edge case tests
- Export data as JSON

### 2. Enable Debug Mode in Extension

When using the extension on UltraSignup.com:

```javascript
// In browser console (F12)
UltraSignupDebug.enable()
// Then reload the page
```

**Debug panel shows:**
- Data source (API vs HTML scraping)
- Performance timings
- Sample data
- Error messages
- Export capability

### 3. Run Automated Tests

```bash
cd tests
npm install
npm test
```

## What Was Fixed

### Problem: API 404 Errors
**Solution:** Dual-fetch strategy
1. Try 3 different API endpoint patterns
2. Fall back to HTML table scraping
3. Extract data directly from page if APIs fail

### Problem: No Testing Infrastructure
**Solution:** Three testing approaches
1. **Interactive** - test.html for manual testing
2. **Automated** - Jest test suite with comprehensive coverage
3. **Debug Mode** - Real-time debugging on live pages

## File Structure

```
ultrasignup_viz_extension/
├── manifest.json           # Chrome extension config (updated)
├── content.js             # Main logic (updated with debug & scraping)
├── styles.css             # Styles (added debug panel styles)
├── debugPanel.js          # NEW: Debug UI component
├── test-lib.js            # NEW: Extracted testable functions
├── scraper.js             # NEW: HTML scraping module
├── test.html              # NEW: Standalone test page
├── tests/
│   ├── package.json       # NEW: Jest configuration
│   ├── time-conversion.test.js
│   ├── histogram.test.js
│   ├── data-filtering.test.js
│   ├── sample-data.json
│   └── sample-table.html
└── README.md              # Updated with testing docs
```

## Testing Workflow

### When Developing Features
1. Write function in `test-lib.js`
2. Test in `test.html` interactively
3. Write Jest tests
4. Integrate into `content.js`
5. Test with debug mode enabled

### When Debugging Issues
1. Enable debug mode: `UltraSignupDebug.enable()`
2. Reload the page
3. Check debug panel for:
   - Which data source worked
   - Performance bottlenecks
   - Sample data structure
4. Export debug data if needed
5. Check console for detailed logs

## Console Commands Reference

```javascript
// Debug Mode Controls
UltraSignupDebug.enable()   // Turn on debug mode
UltraSignupDebug.disable()  // Turn off debug mode
UltraSignupDebug.toggle()   // Toggle debug mode
UltraSignupDebug.status()   // Check if enabled

// Available after enabling and reloading
```

## Common Issues & Solutions

### Issue: Extension not loading
**Check:**
1. All files present in folder
2. Extension enabled in chrome://extensions/
3. Console for errors (F12)

### Issue: No chart appears
**Debug:**
1. Enable debug mode
2. Check debug panel data source
3. Look for errors in debug panel
4. Verify table structure matches expected format

### Issue: Chart shows wrong data
**Debug:**
1. Check "Filtered Results" count in debug panel
2. Verify active distance tab matches
3. Export debug data to inspect raw results

### Issue: Tests failing
**Check:**
1. Node.js installed (`node --version`)
2. Dependencies installed (`npm install` in tests/)
3. Check test output for specific failures

## Performance Metrics

Debug mode tracks:
- **dataFetch**: Time to fetch/scrape data
- **filtering**: Time to filter by distance
- **histogram**: Time to create bins
- **rendering**: Time to render chart
- **total**: Total execution time

Typical performance:
- API fetch: 100-500ms
- HTML scraping: 50-200ms
- Histogram generation: 1-10ms
- Chart rendering: 50-100ms

## Data Flow

```
1. Page Load
   ↓
2. Extract Race ID from URL
   ↓
3. Try API Endpoints
   ↓ (if all fail)
4. Scrape HTML Table
   ↓
5. Filter by Active Distance
   ↓
6. Create Histogram (30min bins)
   ↓
7. Render Chart with Chart.js
   ↓
8. Show Debug Panel (if enabled)
```

## Next Steps

1. **Reload the extension** in Chrome to pick up changes
2. **Visit a race results page** on UltraSignup
3. **Enable debug mode** to verify data fetching works
4. **Run tests** to ensure all functions pass
5. **Open test.html** to experiment with different scenarios

## Tips

- Keep debug mode enabled during development
- Export debug data when reporting issues
- Use test.html for quick function testing
- Run Jest tests before committing changes
- Check console messages for helpful hints

