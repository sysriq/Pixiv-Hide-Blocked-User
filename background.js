// background.js

// Fetch all pages of blocked users from Pixiv
async function fetchPixivBlockedList() {
  let allBlockedUsers = [];
  let offset = 0;
  const limit = 48; // Maximize limit to reduce number of requests
  let hasMore = true;

  console.log("Starting Pixiv Block List Sync...");

  try {
    while (hasMore) {
      let response;
      try {
        response = await fetch(
          `https://www.pixiv.net/ajax/block/list?offset=${offset}&limit=${limit}&lang=en`,
          { credentials: 'include' }
        );
      } catch (networkError) {
        throw new Error("Network error: " + networkError.message);
      }
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (data.error) {
        if (data.message && data.message.includes('login')) {
          throw new Error("Pixiv login required. Please log in to Pixiv.");
        }
        throw new Error(data.message || "Pixiv API Error");
      }
      const items = (data.body.block_items || []).map(item => ({
        ...item,
        userName: item.label // Always set userName to label
      }));
      // Stop if no more items
      if (!items.length) {
        console.log('No more block_items returned, stopping sync.');
        break;
      }
      allBlockedUsers = allBlockedUsers.concat(items);
      offset += limit;
      // Small delay to prevent hitting rate limits if the list is huge
      await new Promise(r => setTimeout(r, 500));
    }
    // Save to storage
    return new Promise((resolve) => {
      chrome.storage.local.set({
        pixivBlockedData: allBlockedUsers,
        lastSync: new Date().toISOString()
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log(`Sync Complete: ${allBlockedUsers.length} users blocked.`);
          resolve({ success: true, count: allBlockedUsers.length });
        }
      });
    });
  } catch (error) {
    console.error("Sync Failed:", error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from the Popup or Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sync_blocks") {
    fetchPixivBlockedList().then(sendResponse);
    return true; // Keep channel open for async response
  }
});