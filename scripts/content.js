// content.js

let blockedData = [];
let extensionEnabled = true;

// Load data from storage
const loadSettings = async () => {
  const settings = await chrome.storage.local.get(['pixivBlockedData', 'extensionEnabled']);
  blockedData = settings.pixivBlockedData || [];
  extensionEnabled = settings.extensionEnabled !== false; // default true
  applyHider(document.body);
};

// Debounce utility
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Hide blocked users in a given root node (defaults to document.body)
const applyHider = (root = document.body) => {
  if (!extensionEnabled) return;
  if (!blockedData.length) return;
  blockedData.forEach(user => {
    const userId = user.userId || user.user_id;
    if (!userId) return;
    // Only search within the root node
    const xpath = `.//li[.//a[@data-gtm-value="${userId}"]]`;
    const result = document.evaluate(
      xpath,
      root,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    for (let i = 0; i < result.snapshotLength; i++) {
      const node = result.snapshotItem(i);
      if (node && node.style.display !== 'none') {
        node.style.display = 'none';
      }
    }
  });
};

// Initialize
loadSettings();

// Debounced observer callback
const debouncedApplyHider = debounce(() => applyHider(document.body), 200);

// Watch for dynamic content loading (scrolling)
const observer = new MutationObserver(mutations => {
  // Only process added nodes for efficiency
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1) { // ELEMENT_NODE
        applyHider(node);
      }
    }
  }
  // Fallback: debounce a full scan in case of complex changes
  debouncedApplyHider();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Re-run if settings change while the page is open
chrome.storage.onChanged.addListener((changes) => {
  if (changes.pixivBlockedData || changes.extensionEnabled) {
    loadSettings();
  }
});