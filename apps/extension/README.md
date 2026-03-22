# Extension Setup

This folder contains the browser extension for The Cart.

## Development

1. Install dependencies:
```bash
bun install
```

2. Build the extension:
```bash
bun run build
```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

4. For development with auto-rebuild:
```bash
bun run dev
```

## Extension Features

- **Context Menu**: Right-click any link → "Add to Cart"
- **Toolbar Icon**: Click to add current page
- **Popup**: View recently added items and open cart

## File Structure

```
extension/
├── manifest.json          # Extension manifest (entry point)
├── background/            # Service worker scripts
│   └── index.ts          # Handles context menu, notifications
├── content/              # Content scripts (injected into pages)
│   └── index.ts
├── popup/               # Extension popup UI
│   ├── index.html
│   ├── index.tsx
│   └── components/
├── options/             # Extension settings page
│   └── index.html
├── lib/                 # Shared utilities
│   └── api.ts          # API client for backend
├── icons/               # Extension icons (16x16, 48x48, 128x128)
└── dist/               # Build output (generated)
```

## Icons

You need to add icon files to the `icons/` folder:
- `icon16.png` - 16x16px
- `icon48.png` - 48x48px  
- `icon128.png` - 128x128px

## API Communication

The extension communicates with the backend API at `http://localhost:3000` (dev) or your production URL.

Authentication is handled via cookies (same session as web app).
