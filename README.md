# Tab Chaos Analyzer

A Chrome browser extension that analyzes your browsing habits with humor and actionable insights. Think of it as a productivity coach with personality that helps you understand and clean up tab overload.

![Tab Chaos Analyzer](./docs/screenshot.png)

## 🎯 Features

- **Chaos Score**: 0-100 metric analyzing your tab management skills
- **Smart Detection**: Finds duplicates, stale tabs, domain clustering, and panic-opening patterns
- **Witty Feedback**: Smart, sarcastic productivity coach personality
- **Actionable Suggestions**: One-click cleanup actions with real impact
- **Privacy-First**: All analysis happens locally - no data leaves your browser
- **Modern UI**: Clean, responsive design with smooth animations

## 🏆 Chaos Levels

- **90-100: Zen Master** 🧘‍♀️ - Your tabs are in perfect harmony
- **75-89: Organized Human** 📊 - Functional and efficient browsing
- **50-74: Controlled Chaos** 🤹‍♂️ - Walking the productivity tightrope
- **25-49: Digital Hoarder** 📚 - Your browser is struggling
- **0-24: Browser Apocalypse** 🔥 - Send help immediately

## 🔍 What It Analyzes

### Issues Detected
- **Duplicate Tabs**: Same URLs open multiple times
- **Stale Tabs**: Tabs inactive for >2 hours
- **Domain Clustering**: Too many tabs from the same site (3+ triggers)
- **Panic Bursts**: >5 tabs opened within 30 seconds
- **Memory Hogs**: Resource-intensive tabs (videos, audio)
- **Volume Overload**: General tab accumulation

### Scoring System
- **Base Score**: 100 (Perfect Zen)
- **Duplicates**: -5 points per duplicate tab
- **Domain Clustering**: -2 points per tab beyond 3rd from same domain
- **Stale Tabs**: -3 points per stale tab
- **Panic Opening**: -10 points per burst episode
- **Memory Hogs**: -1 point per resource-heavy tab
- **Volume**: -1 point per tab beyond 10th

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Chrome browser (Manifest V3 support)

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd tab-chaos-analyzer
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `dist` folder from your project
   - The extension icon will appear in your toolbar

4. **Development workflow:**
   - Make changes to source files
   - Vite will rebuild automatically
   - Click refresh on the extension in `chrome://extensions/` to reload
   - Click the extension icon to test your changes

### Production Build

```bash
npm run build
```

The built extension will be in the `dist` folder, ready for packaging or Chrome Web Store submission.

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 8 + CRXJS (optimized for Manifest V3)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Browser APIs**: Chrome Tabs API, Storage API
- **Architecture**: Service Worker + Popup UI

## 📊 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Popup UI      │    │ Service Worker  │    │  Tab Analyzer   │
│   (React)       │◄──►│  (Background)   │◄──►│   (Core Logic)  │
│                 │    │                 │    │                 │
│ • Chaos Display │    │ • Tab Events    │    │ • Score Calc    │
│ • Actions UI    │    │ • Actions       │    │ • Pattern Detection│
│ • Settings      │    │ • Storage       │    │ • Suggestions   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **ChaosAnalyzer**: Core analysis engine with scoring algorithms
- **Background Service Worker**: Tracks tab events, handles actions
- **React Popup**: Modern UI with real-time score display
- **Local Storage**: Privacy-focused data persistence

## 🔒 Privacy & Permissions

### Required Permissions
- **"tabs"**: Read tab information (URLs, titles, timestamps)
- **"storage"**: Store analysis history locally

### Privacy Promise
- ✅ All analysis happens locally in your browser
- ✅ No data is transmitted to external servers
- ✅ No tracking or analytics
- ✅ Tab history is only stored temporarily for pattern detection
- ✅ You can clear stored data anytime from Chrome's extension settings

### Data Storage
- **What**: Tab open/close timestamps, analysis results
- **Where**: Local browser storage only
- **How long**: Events older than 2 hours are automatically purged
- **Access**: Only by this extension, not shared

## 🎨 UI/UX Design

### Design Principles
- **Immediate Value**: Score and issues visible at a glance
- **Personality**: Witty but helpful feedback
- **Action-Oriented**: Clear suggestions with one-click fixes
- **Non-Judgmental**: Gentle nudging, not harsh criticism
- **Modern**: Clean interface following current design trends

### Accessibility
- Semantic HTML structure
- ARIA labels where needed  
- Keyboard navigation support
- High contrast color ratios
- Responsive design (though fixed at 400px width for extension)

## 🧪 Testing

### Manual Testing Checklist

1. **Basic Functionality**
   - [ ] Extension loads without errors
   - [ ] Chaos score calculates correctly
   - [ ] UI displays properly across different tab counts
   - [ ] Refresh button works

2. **Scoring Accuracy**
   - [ ] Open duplicate tabs → Score decreases
   - [ ] Let tabs go stale → Score decreases  
   - [ ] Open many tabs quickly → Detects panic burst
   - [ ] Multiple tabs from same domain → Detects clustering

3. **Actions Work**
   - [ ] Close duplicates removes correct tabs
   - [ ] Group by domain creates tab groups
   - [ ] Bookmark and close saves to bookmarks folder
   - [ ] Actions trigger score refresh

4. **Edge Cases**
   - [ ] No tabs open (besides extension)
   - [ ] Only pinned tabs
   - [ ] Very high tab counts (50+)
   - [ ] Mixed HTTP/HTTPS duplicate detection

### Local Testing Setup

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🚀 Future Improvements

### Short Term
- [ ] Dark mode support
- [ ] Customizable thresholds in settings
- [ ] Export analysis reports
- [ ] Keyboard shortcuts for common actions

### Medium Term  
- [ ] Trend analysis over time
- [ ] Productivity insights and recommendations
- [ ] Integration with bookmark managers
- [ ] Tab session restoration

### Long Term
- [ ] Cross-browser support (Firefox, Safari)
- [ ] Smart tab grouping suggestions
- [ ] Machine learning for personalized recommendations
- [ ] Team/workspace tab analytics

## 🤝 Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier for formatting
- Conventional commits
- Component-based architecture

### Development Guidelines
- Keep components focused and reusable
- Maintain privacy-first approach
- Test across different tab scenarios
- Follow Chrome extension best practices
- Preserve witty but professional tone

## 🐛 Known Limitations

- **Browser Support**: Chrome/Chromium only (Manifest V3)
- **Memory Estimation**: Simplified heuristics for memory usage
- **Tab Groups**: Requires Chrome 88+ for grouping features
- **Incognito**: Limited access to incognito tabs
- **Cross-Window**: Analysis limited to current browser session

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Chrome Extensions team for Manifest V3 APIs
- React team for the excellent framework  
- Tailwind CSS for rapid styling
- Lucide for beautiful icons
- The productivity community for inspiration

---

**Made with ☕ and mild frustration at browser tab chaos**