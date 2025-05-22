document.addEventListener('DOMContentLoaded', () => {
  const enabledCheckbox = document.getElementById('enabledCheckbox');
  const smartRoundingCheckbox = document.getElementById('smartRoundingCheckbox');

  // Load current settings from storage and update checkboxes
  chrome.storage.sync.get(['enabled', 'smartRounding'], (data) => {
    enabledCheckbox.checked = data.enabled !== false; // Default to true if not set
    smartRoundingCheckbox.checked = data.smartRounding === true; // Default to false if not set

    // Initially, smart rounding checkbox is disabled if conversions are disabled
    smartRoundingCheckbox.disabled = !enabledCheckbox.checked;
  });

  // Function to update settings and notify content script
  function updateSettings() {
    const isEnabled = enabledCheckbox.checked;
    const isSmartRounding = smartRoundingCheckbox.checked;

    // Smart rounding checkbox should be disabled if main conversion is off
    smartRoundingCheckbox.disabled = !isEnabled;

    chrome.storage.sync.set({ enabled: isEnabled, smartRounding: isSmartRounding }, () => {
      console.log('Settings saved:', { enabled: isEnabled, smartRounding: isSmartRounding });

      // Send message to active tab's content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggle',
            settings: {
              enabled: isEnabled,
              smartRounding: isSmartRounding
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
            } else if (response) {
              console.log('Content script responded:', response);
            }
          });
        } else {
          console.log("No active tab found to send message to.");
        }
      });
    });
  }

  // Add event listeners to checkboxes
  enabledCheckbox.addEventListener('change', updateSettings);
  smartRoundingCheckbox.addEventListener('change', updateSettings);
});
