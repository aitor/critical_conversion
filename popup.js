document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('conversionToggle');

  // Load saved state
  chrome.storage.sync.get('enabled', function(data) {
    toggle.checked = data.enabled !== false; // Default to enabled
  });

  // Save state when toggled
  toggle.addEventListener('change', function() {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ enabled: enabled }, function() {
      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', enabled: enabled });
        }
      });
    });
  });
});
