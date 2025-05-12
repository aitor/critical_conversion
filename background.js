// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: true });
});

// Listen for tab updates to re-apply conversion
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a local file or one of our target domains
    if (tab.url.startsWith('file://') ||
        tab.url.includes('dndbeyond.com') ||
        tab.url.includes('roll20.net')) {
      chrome.storage.sync.get('enabled', (data) => {
        if (data.enabled) {
          chrome.tabs.sendMessage(tabId, { action: 'convert' });
        }
      });
    }
  }
});
