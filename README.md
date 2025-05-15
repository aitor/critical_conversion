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
2. Run `./build.sh` to generate the content.js file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top right)
5. Click "Load unpacked" and select the folder containing this extension
6. The extension should now be installed and active

### Firefox (Future Support)

*Firefox support will be added in a future version*

## Local Testing

To test the extension locally:

1. Install the extension in Chrome using the steps above
2. Visit a D&D website like [D&D Beyond](https://www.dndbeyond.com/) or [Roll20](https://roll20.net/)
3. The extension should automatically convert imperial units to metric
4. Click the extension icon in the browser toolbar to access the toggle for enabling/disabling conversions
5. For quick testing, you can also open the included `test.html` file in Chrome with the extension enabled

## Development

The extension has a modular structure:

- `manifest.json` - Extension configuration for Chrome
- `manifest-firefox.json` - Compatible manifest for Firefox (future use)
- `popup.html` and `popup.js` - UI for toggling the extension
- `background.js` - Background service worker
- `conversion.js` - Core conversion utilities (unit conversions and regex patterns)
- `content-base.js` - Base content script implementation (uses conversion.js)
- `content.js` - Generated file (do not edit directly)
- `styles.css` - Styling for converted units
- `build.sh` - Build script to generate content.js

### Development Workflow

1. Edit `conversion.js` and `content-base.js` as needed
2. Run `./build.sh` to generate the updated content.js
3. Reload the extension in Chrome
4. Test the changes

## Converting Between Browsers

To build for Firefox:
1. Rename `manifest-firefox.json` to `manifest.json`
2. Run `./build.sh` to generate the content.js
3. Package the extension as usual

## Contributing

Contributions are welcome! Here are some ways to contribute:

- Add support for additional units
- Improve regex patterns for better unit detection
- Add more D&D website support
- Improve the visual presentation of converted units
