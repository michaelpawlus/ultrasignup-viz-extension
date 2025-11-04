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

The extension uses three main components:

1. **manifest.json** - Configuration file that tells Chrome:
   - What permissions the extension needs
   - Which pages to run on
   - What files to inject

2. **content.js** - Main logic that:
   - Extracts the race ID from the URL (`did` parameter)
   - Fetches JSON data from UltraSignup's API endpoint
   - Parses finish times (HH:MM:SS format)
   - Creates histogram bins (30-minute intervals)
   - Renders chart using Chart.js library

3. **styles.css** - Styling to make the chart look clean and integrate with the existing page

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

## Troubleshooting

### Chart doesn't appear

**Check the browser console:**
1. Right-click on the page → "Inspect" → "Console" tab
2. Look for messages starting with "UltraSignup Visualizer:"
3. Common issues:
   - "No race ID found in URL" - Make sure you're on a `results_event.aspx` page
   - API errors - The race may not have results yet, or the API might be down

### Chart shows wrong data

- If the race has multiple distances, make sure you're on the correct tab
- The extension filters by the active tab (e.g., "100 Miler", "50K")

### Extension not loading

1. Go to `chrome://extensions/`
2. Check if "UltraSignup Race Visualizer" is enabled
3. Try clicking the refresh icon on the extension card
4. If errors appear, check that all files are in the folder

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

