// Import conversion utilities
// Since this is a content script, we need to define these inline
// The following is copied from conversion.js but adapted for direct use

const ConversionUtils = {
  // Length conversions
  feetToMeters: (feet) => {
    const meters = feet * 0.3048;
    return Math.round(meters * 10) / 10; // Round to 1 decimal place
  },

  milesToKilometers: (miles) => {
    const km = miles * 1.60934;
    return Math.round(km * 10) / 10; // Round to 1 decimal place
  },

  inchesToCentimeters: (inches) => {
    const cm = inches * 2.54;
    return Math.round(cm); // Round to nearest whole number
  },

  // Weight conversions
  poundsToKilograms: (pounds) => {
    const kg = pounds * 0.453592;
    return Math.round(kg * 10) / 10; // Round to 1 decimal place
  },

  // Volume conversions
  gallonsToLiters: (gallons) => {
    const liters = gallons * 3.78541;
    return Math.round(liters); // Round to nearest whole liter
  },

  quartToLiters: (quart) => {
    const liters = quart * 0.946353;
    return Math.round(liters * 10) / 10; // Round to 1 decimal place
  },

  // Temperature conversions
  fahrenheitToCelsius: (fahrenheit) => {
    const celsius = (fahrenheit - 32) * 5/9;
    return Math.round(celsius); // Round to nearest whole degree
  }
};

/**
 * Regular expressions for matching different imperial unit formats
 * Using word boundaries (\b) and lookahead (?!\w) to ensure we only match complete words
 */
const UnitRegexPatterns = {
  // Length
  feet: /(\d+(?:\.\d+)?)\s*(foot|feet|ft\.?|′)(?!\w)/gi,
  miles: /(\d+(?:\.\d+)?)\s*(mile|miles|mi\.?)(?!\w)/gi,
  inches: /(\d+(?:\.\d+)?)\s*(inch|inches|in\.?|″)(?!\w)/gi,

  // Weight
  pounds: /(\d+(?:\.\d+)?)\s*(pound|pounds|lb|lbs\.?)(?!\w)/gi,

  // Volume
  gallons: /(\d+(?:\.\d+)?)\s*(gallon|gallons|gal\.?)(?!\w)/gi,
  quarts: /(\d+(?:\.\d+)?)\s*(quart|quarts|qt\.?)(?!\w)/gi,

  // Temperature
  fahrenheit: /(\d+(?:\.\d+)?)\s*(°F|degrees Fahrenheit|Fahrenheit)(?!\w)/gi
};

/**
 * Conversion pairs for matching regex and corresponding conversion function
 */
const ConversionPairs = [
  { regex: UnitRegexPatterns.feet, convert: ConversionUtils.feetToMeters, unit: 'meters' },
  { regex: UnitRegexPatterns.miles, convert: ConversionUtils.milesToKilometers, unit: 'km' },
  { regex: UnitRegexPatterns.inches, convert: ConversionUtils.inchesToCentimeters, unit: 'cm' },
  { regex: UnitRegexPatterns.pounds, convert: ConversionUtils.poundsToKilograms, unit: 'kg' },
  { regex: UnitRegexPatterns.gallons, convert: ConversionUtils.gallonsToLiters, unit: 'liters' },
  { regex: UnitRegexPatterns.quarts, convert: ConversionUtils.quartToLiters, unit: 'liters' },
  { regex: UnitRegexPatterns.fahrenheit, convert: ConversionUtils.fahrenheitToCelsius, unit: '°C' }
];

// Class to handle text node conversions
class TextConverter {
  constructor() {
    this.convertedNodes = new WeakMap(); // Track nodes we've already processed
    this.enabled = true;
  }

  // Primary conversion function
  convertUnits() {
    if (!this.enabled) return;

    this.walkTextNodes(document.body);
  }

  // Enable or disable conversions
  setEnabled(enabled) {
    this.enabled = enabled;

    // When disabling, we need to revert all conversions
    if (!enabled) {
      this.revertConversions();
    } else {
      this.convertUnits();
    }
  }

  // Remove all conversions and restore original text
  revertConversions() {
    const convertedElements = document.querySelectorAll('.dnd-metric-converted');
    convertedElements.forEach(element => {
      const originalText = element.getAttribute('data-original');
      if (originalText) {
        const textNode = document.createTextNode(originalText);
        element.parentNode.replaceChild(textNode, element);
      }
    });
  }

  // Process all text nodes in the document recursively
  walkTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      this.processTextNode(node);
      return;
    }

    // Skip already processed nodes or nodes we shouldn't process
    if (node.nodeType !== Node.ELEMENT_NODE ||
        node.classList.contains('dnd-metric-converted') ||
        node.tagName === 'SCRIPT' ||
        node.tagName === 'STYLE' ||
        node.tagName === 'TEXTAREA' ||
        node.tagName === 'INPUT') {
      return;
    }

    // Recursively process child nodes
    const children = Array.from(node.childNodes);
    children.forEach(child => this.walkTextNodes(child));
  }

  // Process a single text node
  processTextNode(textNode) {
    // Skip empty text or nodes we've already processed
    if (!textNode.textContent.trim() || this.convertedNodes.has(textNode)) return;

    let originalText = textNode.textContent;
    let hasMatch = false;

    // Try each conversion pattern
    ConversionPairs.forEach(pair => {
      // Reset regex lastIndex due to /g flag
      pair.regex.lastIndex = 0;

      let match;
      while ((match = pair.regex.exec(originalText)) !== null) {
        hasMatch = true;
        const value = parseFloat(match[1]);
        const convertedValue = pair.convert(value);

        // Create span with converted value and tooltip
        const span = document.createElement('span');
        span.className = 'dnd-metric-converted';
        span.textContent = `${convertedValue} ${pair.unit}`;
        span.setAttribute('data-original', match[0]);

        // Add tooltip with original value
        const tooltip = document.createElement('span');
        tooltip.className = 'dnd-metric-tooltip';
        tooltip.textContent = `Original: ${match[0]}`;
        span.appendChild(tooltip);

        // Split text node and insert conversion
        const beforeText = originalText.substring(0, match.index);
        const afterText = originalText.substring(match.index + match[0].length);

        const parent = textNode.parentNode;
        if (beforeText) {
          parent.insertBefore(document.createTextNode(beforeText), textNode);
        }
        parent.insertBefore(span, textNode);

        // Update the text node with remaining text
        textNode.textContent = afterText;
        originalText = afterText;

        // Reset regex since we modified the text
        pair.regex.lastIndex = 0;
      }
    });

    // Mark this node as processed
    if (hasMatch) {
      this.convertedNodes.set(textNode, true);
    }
  }
}

// Initialize the converter
const converter = new TextConverter();

// Run on page load
window.addEventListener('load', () => {
  chrome.storage.sync.get('enabled', (data) => {
    converter.setEnabled(data.enabled !== false);
    converter.convertUnits();
  });
});

// Listen for DOM changes to convert new content
const observer = new MutationObserver(mutations => {
  chrome.storage.sync.get('enabled', (data) => {
    if (data.enabled !== false) {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            converter.walkTextNodes(node);
          });
        }
      });
    }
  });
});

// Start observing DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    converter.setEnabled(message.enabled);
  } else if (message.action === 'convert') {
    converter.convertUnits();
  }
  sendResponse({ success: true });
  return true;
});
