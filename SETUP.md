# Tab Chaos Analyzer - Setup Guide

Complete setup instructions for local development and testing.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd tab-chaos-analyzer
npm install
```

### 2. Development Build

```bash
npm run dev
```

This starts Vite in development mode with hot reloading.

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist` folder from your project directory
5. The extension icon will appear in your Chrome toolbar

### 4. Test the Extension

1. Click the extension icon in your toolbar
2. Open some tabs to test with:
   - Open duplicate tabs (same URLs)
   - Open multiple tabs from the same domain
   - Let some tabs sit unused for a while
   - Try opening 5+ tabs quickly to trigger "panic burst"
3. Click the extension icon to see your chaos score!

## 🛠 Development Workflow

### File Structure
```
tab-chaos-analyzer/
├── src/
│   ├── lib/
│   │   ├── chaos-analyzer.ts    # Core analysis logic
│   │   └── types.ts             # TypeScript interfaces
│   ├── popup/
│   │   ├── components/          # React UI components
│   │   ├── App.tsx             # Main popup app
│   │   ├── index.html          # Popup HTML
│   │   └── index.tsx           # React entry point
│   └── background/
│       └── index.ts            # Service worker
├── manifest.json               # Extension manifest
├── icons/                      # Extension icons
└── dist/                      # Built extension (auto-generated)
```

### Making Changes

1. **Edit source files** in the `src/` directory
2. **Vite rebuilds automatically** when you save
3. **Reload the extension** in `chrome://extensions/`:
   - Click the refresh icon on your extension
   - Or disable/enable the extension
4. **Test changes** by clicking the extension icon

### Key Files to Know

- **`src/lib/chaos-analyzer.ts`**: Core scoring and analysis logic
- **`src/popup/App.tsx`**: Main popup UI
- **`src/background/index.ts`**: Background event tracking
- **`manifest.json`**: Extension permissions and metadata

## 🧪 Testing Scenarios

### Test Different Chaos Levels

**Zen Master (90-100):**
- Keep only 3-5 tabs open
- No duplicates
- All tabs recently accessed
- Different domains

**Organized (75-89):**
- 6-10 tabs open
- Maybe 1 duplicate
- Most tabs recently accessed
- Mix of domains

**Controlled Chaos (50-74):**
- 10-15 tabs open
- 2-3 duplicates
- Some stale tabs (2+ hours old)
- Some domain clustering

**Digital Hoarder (25-49):**
- 20+ tabs open
- Multiple duplicates
- Many stale tabs
- Heavy domain clustering

**Browser Apocalypse (0-24):**
- 30+ tabs open
- Many duplicates
- Lots of stale tabs
- Panic opening bursts
- Heavy clustering

### Test Actions

1. **Close Duplicates:**
   - Open same URL in multiple tabs
   - Extension should detect and offer to close extras

2. **Group by Domain:**
   - Open multiple tabs from same website
   - Extension should offer to group them

3. **Archive Stale:**
   - Let tabs sit unused for 2+ hours
   - Extension should offer to bookmark and close them

4. **Panic Burst Detection:**
   - Open 5+ tabs within 30 seconds
   - Check if extension detects the burst

## 🔧 Build Commands

```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

## 📦 Production Build

For final packaging or Chrome Web Store submission:

```bash
npm run build
```

The `dist/` folder contains the complete extension ready for:
- Loading as unpacked extension
- Zipping for Chrome Web Store
- Distribution

## 🐛 Common Issues

### Extension Not Loading
- Check `chrome://extensions/` for error messages
- Ensure `dist/` folder exists (run `npm run build`)
- Verify manifest.json is valid

### Changes Not Reflecting
- Make sure development server is running (`npm run dev`)
- Reload extension in `chrome://extensions/`
- Hard refresh popup (Ctrl/Cmd + Shift + R)

### TypeScript Errors
```bash
npm run type-check
```

### Permission Errors
- Check manifest.json permissions match code usage
- Ensure Chrome supports required APIs

## 🎯 Testing Checklist

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Popup opens and displays score
- [ ] Refresh button works
- [ ] Score updates when tabs change

### Scoring Accuracy
- [ ] Score decreases with duplicates
- [ ] Stale tabs reduce score
- [ ] Panic bursts detected
- [ ] Domain clustering recognized
- [ ] High tab count penalized

### Actions Work
- [ ] Close duplicates removes correct tabs
- [ ] Group by domain creates tab groups (Chrome 88+)
- [ ] Archive stale bookmarks and closes tabs
- [ ] Actions refresh the analysis

### UI/UX
- [ ] Loading states show properly
- [ ] Error states handled gracefully
- [ ] Witty comments display
- [ ] Icons and colors appropriate for chaos level

### Edge Cases
- [ ] Works with no extra tabs
- [ ] Handles pinned tabs correctly
- [ ] Works with very high tab counts (50+)
- [ ] Graceful handling of permission issues

## 🔒 Privacy Verification

The extension is designed to be privacy-first:

### Data Storage Check
1. Open Chrome DevTools on extension popup
2. Go to Application → Storage → Local Storage
3. Verify only timestamps and counts are stored, no URLs or personal data

### Network Activity Check
1. Open Chrome DevTools → Network tab
2. Use the extension for several minutes
3. Verify NO network requests are made by the extension

### Permissions Audit
- `tabs`: Only used to count and analyze tabs
- `storage`: Only used for local temporary data
- No host permissions requested
- No external API calls

## 🚢 Distribution

### Chrome Web Store
1. Build production version: `npm run build`
2. Zip the `dist/` folder
3. Upload to Chrome Developer Dashboard
4. Complete store listing with screenshots

### Manual Distribution
1. Build: `npm run build`
2. Share the `dist/` folder
3. Users load as unpacked extension

## 📈 Performance Notes

- Analysis runs only when popup is opened
- Background worker is lightweight (event tracking only)  
- No continuous monitoring or polling
- Memory usage scales with tab history (auto-purged)
- UI renders smoothly even with 100+ tabs

---

**Ready to analyze some tab chaos? Happy developing! 🎉**