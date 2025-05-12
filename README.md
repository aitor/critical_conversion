# D&D Metric Converter

A browser extension that converts imperial units to metric units on D&D websites.

## Features

- Automatically converts imperial units to metric units on D&D websites
- Supports both D&D Beyond and Roll20
- Converts various units:
  - Length (feet to meters, inches to centimeters, miles to kilometers)
  - Weight (pounds to kilograms)
  - Volume (gallons to liters, quarts to liters)
  - Temperature (Fahrenheit to Celsius)
- Highlights converted values for easy identification
- Shows original imperial value in a tooltip on hover
- Toggle extension on/off with a popup button

## Installation for Development

### Chrome

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" and select the folder containing this extension
5. The extension should now be installed and active

### Firefox (Future Support)

*Firefox support will be added in a future version*

## Local Testing

To test the extension locally:

1. Install the extension in Chrome using the steps above
2. Visit a D&D website like [D&D Beyond](https://www.dndbeyond.com/) or [Roll20](https://roll20.net/)
3. The extension should automatically convert imperial units to metric
4. Click the extension icon in the browser toolbar to access the toggle for enabling/disabling conversions

## Development

The extension is structured with modularity in mind to support both Chrome and Firefox:

- `manifest.json` - Extension configuration
- `popup.html` and `popup.js` - UI for toggling the extension
- `background.js` - Background service worker
- `content.js` - Main content script that performs conversions
- `conversion.js` - Core conversion utilities (reusable across platforms)
- `styles.css` - Styling for converted units

To add support for Firefox, a separate `manifest-firefox.json` will be needed with Firefox-specific configurations.

## Contributing

Contributions are welcome! Here are some ways to contribute:

- Add support for additional units
- Improve regex patterns for better unit detection
- Add Firefox support
- Improve the UI
- Add additional D&D website support
