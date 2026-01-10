// Get UI elements safely
const modeSelect = document.getElementById('mode');
const syncBtn = document.getElementById('syncBtn');
const statusDiv = document.getElementById('status');
const toggleEnabled = document.getElementById('toggleEnabled');
const statusDot = document.querySelector('.status-dot');
const searchBar = document.getElementById('searchBar');

// Check if elements exist
if (!modeSelect || !syncBtn || !statusDiv || !toggleEnabled) {
  console.error('Popup UI elements missing.');
} else {
  // Load saved settings
  chrome.storage.local.get(['mode', 'lastSync', 'extensionEnabled'], (data) => {
    if (chrome.runtime.lastError) {
      statusDiv.innerText = 'Error loading settings.';
      console.error(chrome.runtime.lastError);
      return;
    }
    if (data.mode) modeSelect.value = data.mode;
    if (data.lastSync) statusDiv.innerText = 'Last sync: ' + data.lastSync;
    // Load enabled state
    extensionEnabled = data.extensionEnabled !== false; // default true
    toggleEnabled.checked = extensionEnabled;
    updateStatusDot();
  });

  // Save mode on change
  modeSelect.addEventListener('change', () => {
    chrome.storage.local.set({ mode: modeSelect.value }, () => {
      if (chrome.runtime.lastError) {
        statusDiv.innerText = 'Error saving mode.';
        console.error(chrome.runtime.lastError);
      }
    });
  });

  // Trigger Sync
  syncBtn.addEventListener('click', () => {
    statusDiv.innerText = 'Syncing...';
    chrome.runtime.sendMessage({ action: 'sync_blocks' }, (response) => {
      if (!response) {
        statusDiv.innerText = 'No response from background.';
        return;
      }
      if (response.success) {
        statusDiv.innerText = `Synced ${response.count} users.`;
        loadBlockedUsers(); // Immediately refresh the blocked users list and badge
      } else {
        statusDiv.innerText = 'Error: ' + response.error;
      }
    });
  });

  // Update status dot color
  function updateStatusDot() {
    if (statusDot) {
      statusDot.style.background = extensionEnabled ? '#22c55e' : '#ef4444';
    }
  }

  // Save enabled state on toggle
  if (toggleEnabled) {
    toggleEnabled.addEventListener('change', () => {
      extensionEnabled = toggleEnabled.checked;
      chrome.storage.local.set({ extensionEnabled });
      updateStatusDot();
    });
  }
}

// Pagination and Block List UI
const blockListEl = document.getElementById('blockList');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfoEl = document.getElementById('pageInfo');
const blockCountBadge = document.querySelector('#blockListContainer h4 span');

let blockedUsers = [];
let currentPage = 1;
const PAGE_SIZE = 20;
let searchQuery = '';

function renderBlockList() {
  if (!blockListEl) return;
  blockListEl.innerHTML = '';
  // Filter users by search query
  let filteredUsers = blockedUsers;
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredUsers = blockedUsers.filter(user => {
      const name = (user.userName || user.label || user.name || user.user_name || '').toLowerCase();
      const id = (user.userId || user.user_id || '').toString();
      return name.includes(q) || id.includes(q);
    });
  }
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, filteredUsers.length);
  // Determine display mode
  const mode = modeSelect ? modeSelect.value : 'username';
  for (let i = startIdx; i < endIdx; i++) {
    const user = filteredUsers[i];
    const li = document.createElement('li');
    if (mode === 'username') {
      li.textContent = user.userName || user.label || user.name || user.user_name || '(No username)';
    } else {
      li.textContent = user.userId || user.user_id || '(No user ID)';
    }
    blockListEl.appendChild(li);
  }
  // Update pagination info
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  pageInfoEl.textContent = `Page ${currentPage} / ${totalPages}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;
  // Update blocked users count badge
  if (blockCountBadge) blockCountBadge.textContent = filteredUsers.length;
}

function loadBlockedUsers() {
  chrome.storage.local.get(['pixivBlockedData'], (data) => {
    blockedUsers = Array.isArray(data.pixivBlockedData) ? data.pixivBlockedData : [];
    currentPage = 1;
    renderBlockList();
  });
}

if (blockListEl && prevPageBtn && nextPageBtn) {
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderBlockList();
    }
  });
  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.max(1, Math.ceil(blockedUsers.length / PAGE_SIZE));
    if (currentPage < totalPages) {
      currentPage++;
      renderBlockList();
    }
  });
  loadBlockedUsers();
}

// After sync, reload block list
if (syncBtn) {
  syncBtn.addEventListener('click', () => {
    setTimeout(loadBlockedUsers, 1000); // Delay to allow background sync
  });
}

// Re-render block list when mode changes
if (modeSelect) {
  modeSelect.addEventListener('change', () => {
    renderBlockList();
  });
}

if (searchBar) {
  searchBar.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    renderBlockList();
  });
}