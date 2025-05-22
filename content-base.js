// Class to handle text node conversions
class TextConverter {
  constructor() {
    this.convertedNodes = new WeakMap(); // Track nodes we've already processed
    this.enabled = true; // Default state
    this.smartRoundingEnabled = false; // Default state

    // Create ConversionPairs using utilities from conversion.js
    // Order matters for range vs single: range regexes should come before their single counterparts.
    this.ConversionPairs = [
      { regex: UnitRegexPatterns.feetRange, convert: ConversionUtils.feetToMeters, unit: 'meters', type: 'range' }, // Range before single
      { regex: UnitRegexPatterns.feet, convert: ConversionUtils.feetToMeters, unit: 'meters' },
      { regex: UnitRegexPatterns.miles, convert: ConversionUtils.milesToKilometers, unit: 'km' },
      { regex: UnitRegexPatterns.inches, convert: ConversionUtils.inchesToCentimeters, unit: 'cm' },
      { regex: UnitRegexPatterns.pounds, convert: ConversionUtils.poundsToKilograms, unit: 'kg' },
      { regex: UnitRegexPatterns.gallons, convert: ConversionUtils.gallonsToLiters, unit: 'liters' },
      { regex: UnitRegexPatterns.quarts, convert: ConversionUtils.quartToLiters, unit: 'liters' },
      { regex: UnitRegexPatterns.cubicFeet, convert: ConversionUtils.cubicFeetToCubicMeters, unit: 'm³' }, // Ensure this was added if cubicFeet is in UnitRegexPatterns
      { regex: UnitRegexPatterns.fahrenheit, convert: ConversionUtils.fahrenheitToCelsius, unit: '°C' }
    ];
  }

  // Primary conversion function (called by refresh logic)
  convertUnits() {
    // Note: this.enabled should be true if this is called by _triggerConversionRefresh
    console.log("Converting units. Smart Rounding:", this.smartRoundingEnabled);
    this.revertConversions(); // Always revert before applying new conversions for consistency
    this.walkTextNodes(document.body);
  }

  // Central method to refresh conversions based on current state
  _triggerConversionRefresh() {
    console.log("Triggering conversion refresh. Enabled:", this.enabled, "Smart Rounding:", this.smartRoundingEnabled);
    if (!this.enabled) {
      this.revertConversions();
    } else {
      this.convertUnits();
    }
  }

  setEnabled(isEnabled) {
    if (typeof isEnabled !== 'boolean' || this.enabled === isEnabled) {
      return; // No change or invalid type
    }
    this.enabled = isEnabled;
    console.log("Conversion enabled state set to:", this.enabled);
    this._triggerConversionRefresh();
  }

  setSmartRounding(isSmart) {
    if (typeof isSmart !== 'boolean' || this.smartRoundingEnabled === isSmart) {
      return; // No change or invalid type
    }
    this.smartRoundingEnabled = isSmart;
    console.log("Smart Rounding state set to:", this.smartRoundingEnabled);
    if (this.enabled) { // Only refresh if conversions are generally enabled
      this._triggerConversionRefresh();
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

    let originalTextContent = textNode.textContent; // Store original for processing
    let currentSegment = textNode; // This will be the node we operate on, potentially a new text node after splits
    let hasMatch = false; // Track if any conversion happened in this text node

    // Try each conversion pattern
    this.ConversionPairs.forEach(pair => {
      if (!currentSegment || !currentSegment.parentNode) return; // Segment might have been removed

      pair.regex.lastIndex = 0;
      let tempTextContent = currentSegment.textContent;
      let match;
      let lastIndexProcessed = 0;
      const newNodesBefore = [];

      while ((match = pair.regex.exec(tempTextContent)) !== null) {
        hasMatch = true;
        let convertedTextContent;
        let originalMatchText = match[0];
        let convertedValueForTooltip1, convertedValueForTooltip2;

        if (pair.type === 'range') {
          const value1 = parseFloat(match[1]);
          const value2 = parseFloat(match[2]); // Second number from the range regex
          const unitString = match[3]; // The unit string like 'feet', 'ft' etc.

          const convertedValue1 = pair.convert(value1, this.smartRoundingEnabled);
          const convertedValue2 = pair.convert(value2, this.smartRoundingEnabled);
          convertedTextContent = `${convertedValue1}–${convertedValue2} ${pair.unit}`;

          if (this.smartRoundingEnabled) {
            convertedValueForTooltip1 = pair.convert(value1, false); // Precise for tooltip
            convertedValueForTooltip2 = pair.convert(value2, false); // Precise for tooltip
          }
        } else {
          const value = parseFloat(match[1]);
          const convertedValue = pair.convert(value, this.smartRoundingEnabled);
          convertedTextContent = `${convertedValue} ${pair.unit}`;
          if (this.smartRoundingEnabled) {
            convertedValueForTooltip1 = pair.convert(value, false); // Precise for tooltip
          }
        }

        const span = document.createElement('span');
        span.className = 'dnd-metric-converted';
        span.textContent = convertedTextContent;
        span.setAttribute('data-original', originalMatchText);

        const tooltip = document.createElement('span');
        tooltip.className = 'dnd-metric-tooltip';
        if (this.smartRoundingEnabled) {
          if (pair.type === 'range') {
            tooltip.textContent = `${originalMatchText} = ${convertedValueForTooltip1}–${convertedValueForTooltip2} ${pair.unit}`;
          } else {
            tooltip.textContent = `${originalMatchText} = ${convertedValueForTooltip1} ${pair.unit}`;
          }
        } else {
          tooltip.textContent = `Original: ${originalMatchText}`;
        }
        span.appendChild(tooltip);

        const beforeText = tempTextContent.substring(lastIndexProcessed, match.index);
        if (beforeText) {
          newNodesBefore.push(document.createTextNode(beforeText));
        }
        newNodesBefore.push(span);
        lastIndexProcessed = match.index + originalMatchText.length;
      }

      if (newNodesBefore.length > 0) {
        const parent = currentSegment.parentNode;
        if (parent) {
          newNodesBefore.forEach(newNode => {
            parent.insertBefore(newNode, currentSegment);
          });
          const afterText = tempTextContent.substring(lastIndexProcessed);
          if (afterText) {
            currentSegment.textContent = afterText;
          } else {
            parent.removeChild(currentSegment);
            currentSegment = null; // Mark as removed
          }
        }
      }
    });

    if (hasMatch && textNode.parentNode) { // Ensure original textNode still part of DOM before marking
        this.convertedNodes.set(textNode, true);
    }
  }
}

// Initialize the converter
const converter = new TextConverter();

// Run on page load
window.addEventListener('load', () => {
  console.log("Page loaded, initializing converter...");
  chrome.storage.sync.get(['enabled', 'smartRounding'], (data) => {
    const initialEnabled = data.enabled !== false; // Default to true if not set
    const initialSmartRounding = data.smartRounding === true; // Default to false if not set

    console.log("Initial settings from storage - Enabled:", initialEnabled, "Smart Rounding:", initialSmartRounding);

    if (converter.smartRoundingEnabled !== initialSmartRounding) {
        converter.smartRoundingEnabled = initialSmartRounding;
        console.log("Internal smartRoundingEnabled initialized to:", converter.smartRoundingEnabled);
    }

    if (converter.enabled !== initialEnabled) {
        converter.setEnabled(initialEnabled);
    } else if (initialEnabled) {
        console.log("Enabled by default and matches storage, triggering initial conversion.");
        converter._triggerConversionRefresh();
    }
    console.log("Converter initialized. Final state - Enabled:", converter.enabled, "Smart Rounding:", converter.smartRoundingEnabled);
  });
});

// Listen for DOM changes to convert new content
const observer = new MutationObserver(mutations => {
  if (converter.enabled) {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('dnd-metric-converted') || node.classList.contains('dnd-metric-tooltip'))) {
            return;
          }
          if (node.parentNode && node.parentNode.nodeType === Node.ELEMENT_NODE && (node.parentNode.classList.contains('dnd-metric-converted') || node.parentNode.classList.contains('dnd-metric-tooltip'))) {
            return;
          }
          converter.walkTextNodes(node);
        });
      }
    });
  }
});

// Start observing DOM changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in content-base.js:", message);

  if (message.action === 'toggle' && message.settings) {
    let responseSettings = {
      enabled: converter.enabled,
      smartRounding: converter.smartRoundingEnabled
    };

    if (typeof message.settings.enabled === 'boolean') {
      converter.setEnabled(message.settings.enabled);
      responseSettings.enabled = converter.enabled;
    }

    if (typeof message.settings.smartRounding === 'boolean') {
      converter.setSmartRounding(message.settings.smartRounding);
      responseSettings.smartRounding = converter.smartRoundingEnabled;
    }

    sendResponse({ success: true, newSettings: responseSettings });

  } else if (message.action === 'convert') {
    chrome.storage.sync.get(['enabled', 'smartRounding'], (data) => {
      const storedEnabled = data.enabled !== false;
      const storedSmartRounding = data.smartRounding === true;

      let needsRefresh = false;
      if (converter.enabled !== storedEnabled) {
        converter.enabled = storedEnabled;
        needsRefresh = true;
      }
      if (converter.smartRoundingEnabled !== storedSmartRounding) {
        converter.smartRoundingEnabled = storedSmartRounding;
        needsRefresh = true;
      }

      if (needsRefresh) {
        console.log("Applying stored settings for 'convert' action and refreshing.");
        converter._triggerConversionRefresh();
      } else if (converter.enabled) {
        console.log("Settings match stored, re-running conversion due to 'convert' action.");
        converter.convertUnits();
      } else {
        console.log("'convert' action received, but conversions are disabled.");
      }
      sendResponse({ success: true, appliedSettings: { enabled: converter.enabled, smartRounding: converter.smartRoundingEnabled } });
    });
    return true;

  } else {
    sendResponse({ success: false, error: "Unknown action" });
  }
  return true;
});
