# Page Lock - Edge Browser Extension

A lightweight Microsoft Edge browser extension that locks the current page, allowing only browsing and copying while blocking insertion, editing, and dragging of content.

## Features

- **One-click Lock** - Click the toolbar icon or press `Ctrl+Shift+L` to lock the current page
- **Block Insertion** - Prevent inserting new content into the page
- **Block Dragging** - Prevent dragging page elements
- **Block Editing** - Set editable areas to read-only
- **Allow Copying** - Browse and copy content normally
- **Auto Lock** - Support URL matching rules to auto-lock specified pages
- **Beautiful Banner** - Gradient notification banner at the top when locked

## Installation

### Developer Mode

1. Open Edge browser, go to `edge://extensions/`
2. Enable **Developer mode** in the bottom left
3. Click **Load unpacked**
4. Select the `page-lock` folder
5. Done! A lock icon will appear in the toolbar

### Package (Optional)

1. On `edge://extensions/`, click **Pack extension**
2. Select the `page-lock` folder
3. Generate `.crx` file and `.pem` private key

## Usage

### Manual Lock/Unlock

- **Method 1**: Click the Page Lock icon in the Edge toolbar
- **Method 2**: Press `Ctrl+Shift+L` (Mac: `Cmd+Shift+L`)

### Auto Lock

1. Click extension icon → Settings (or right-click → Options)
2. Go to **Auto Lock** page
3. Enable **Enable auto lock**
4. Add URL matching rules (one per line), e.g.:
   ```
   cloud.tencent.com/document
   docs.google.com
   notion.so
   ```
5. Click preset buttons to quickly add common sites

## Project Structure

```
page-lock/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Background Service Worker
├── content.js             # Content script (core lock logic)
├── content.css            # Lock state styles
├── popup/                 # Popup window
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/               # Settings page
│   ├── options.html
│   ├── options.js
│   └── options.css
├── icons/                 # Icon files
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   ├── icon16-locked.png
│   ├── icon32-locked.png
│   ├── icon48-locked.png
│   └── icon128-locked.png
├── privacy.html           # Privacy policy (English)
├── privacy.zh.html        # Privacy policy (Chinese)
├── README.md              # This file (English)
└── README.zh.md           # README (Chinese)
```

## Technical Implementation

### Lock Mechanism

| Interception Method | Description |
|---------------------|-------------|
| `dragstart` | Block drag start |
| `drop` / `dragover` | Block drag-and-drop operations |
| `keydown` | Intercept input (preserve copy shortcuts) |
| `paste` / `cut` | Block paste and cut |
| `beforeinput` | Intercept all input events |
| `MutationObserver` | Listen and remove `contenteditable` attributes |
| CSS `user-drag` | Global drag prevention style |
| CSS `user-modify` | Global edit prevention style |

### Storage

- `chrome.storage.local` - Persistent user settings
- `chrome.storage.session` - Session-level lock state

## Use Cases

- Online documents (Tencent Cloud Docs, Alibaba Cloud Docs, etc.)
- Collaboration platforms (Google Docs, Notion, Yuque, etc.)
- Tech blogs (Zhihu, Juejin, CSDN, etc.)
- Corporate knowledge bases, Wiki systems
- Any webpage where accidental editing should be prevented

## Notes

- This extension only provides client-side protection and cannot prevent intentional DevTools operations
- Some websites may use special content editing frameworks where lock effectiveness may be limited
- Browsing, scrolling, and copying work normally when locked
- Does not support browser internal pages like `chrome://` and `edge://`

## License

MIT License

## Languages

- [中文文档](README.zh.md)
- [中文隐私政策](privacy.zh.html)
