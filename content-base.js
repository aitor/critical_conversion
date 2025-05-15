// Class to handle text node conversions
class TextConverter {
  constructor() {
    this.convertedNodes = new WeakMap(); // Track nodes we've already processed
    this.enabled = true;

    // Create ConversionPairs using utilities from conversion.js
    this.ConversionPairs = [
      { regex: UnitRegexPatterns.feet, convert: ConversionUtils.feetToMeters, unit: 'meters' },
      { regex: UnitRegexPatterns.miles, convert: ConversionUtils.milesToKilometers, unit: 'km' },
      { regex: UnitRegexPatterns.inches, convert: ConversionUtils.inchesToCentimeters, unit: 'cm' },
      { regex: UnitRegexPatterns.pounds, convert: ConversionUtils.poundsToKilograms, unit: 'kg' },
      { regex: UnitRegexPatterns.gallons, convert: ConversionUtils.gallonsToLiters, unit: 'liters' },
      { regex: UnitRegexPatterns.quarts, convert: ConversionUtils.quartToLiters, unit: 'liters' },
      { regex: UnitRegexPatterns.fahrenheit, convert: ConversionUtils.fahrenheitToCelsius, unit: '°C' }
    ];
  }

  // Primary conversion function
  convertUnits() {
    if (!this.enabled) return;

    console.log("Starting conversion process...");
    this.walkTextNodes(document.body);
  }

  // Enable or disable conversions
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log("Conversion enabled:", enabled);

    // When disabling, we need to revert all conversions
    if (!enabled) {
      this.revertConversions();
    } else {
      this.convertUnits();
    }
  }

  // Remove all conversions and restore original text
  revertConversions() {
    console.log("Reverting conversions...");
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
    this.ConversionPairs.forEach(pair => {
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
  console.log("Page loaded, initializing converter...");
  chrome.storage.sync.get('enabled', (data) => {
    converter.setEnabled(data.enabled !== false);
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
  console.log("Message received:", message);
  if (message.action === 'toggle') {
    converter.setEnabled(message.enabled);
  } else if (message.action === 'convert') {
    converter.convertUnits();
  }
  sendResponse({ success: true });
  return true;
});
