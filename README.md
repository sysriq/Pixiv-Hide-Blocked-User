# Pixiv Blocker

Pixiv Blocker is a browser extension that helps you manage and hide blocked users on Pixiv. It gets your blocked user list, hide content from such blocked users, and provides a modern, user-friendly popup interface with search and pagination.

<img width="252" height="425" alt="image" src="https://github.com/user-attachments/assets/6bf95d09-2338-48c1-ac8c-6f67ca4661e2" />


## Features
- Sync your Pixiv block list with one click
- Hide all content from blocked users automatically
- Toggle extension on/off instantly
- Search and filter blocked users in the popup
- Paginated blocked user list (20 per page)
- Choose to display by username or user ID
- Modern, compact popup UI

## How It Works
- The extension fetches your block list from Pixiv using their API.
- Blocked users are stored locally and used to hide their content on Pixiv pages.
- The popup allows you to view, search, and filter your block list.
- The extension can be enabled or disabled at any time.

## Installation
1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select this extension's folder.

## Usage
- Click the Pixiv Blocker icon in your Chrome toolbar.
- Use the toggle to enable/disable blocking.
- Click "Update Block List" to sync your block list from Pixiv.
- Use the search bar to filter blocked users.
- Use the pagination controls to browse the list.

## Permissions
- `storage`: To save your block list and settings.
- `host_permissions`: To access Pixiv.net and hide blocked users.

## Notes
- You must be logged in to Pixiv for syncing to work.
- The extension only hides users present in your Pixiv block list.

## Issues (to be fixed)
- There are some instance where a user is blocked but the extension doesn't hide the post from that user
- The extension does not show the correct amount of blocked user

