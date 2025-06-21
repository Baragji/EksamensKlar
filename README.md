# ExamKlar - Din Personlige Eksamen App 📚

En moderne, AI-powered mikrolærings platform hvor du kan skabe dine egne kurser og mestre hvilket som helst emne gennem interaktive flashcards, quizzer og spaced repetition.

## 🎯 Filosofi: Simpel, Modulær, Effektiv

ExamKlar er bygget på princippet om **minimal kompleksitet, maksimal værdi**:

- ✅ **Ingen build tools** - Åbn bare `index.html` i browseren
- ✅ **Ingen dependencies** - Kun vanilla HTML, CSS og JavaScript 
- ✅ **Modulær arkitektur** - Hver feature kan udvikles uafhængigt
- ✅ **Progressive enhancement** - Fungerer uden JavaScript, bedre med
- ✅ **Mobile-first** - Optimeret til smartphones og tablets
- ✅ **Offline-first** - Fungerer uden internetforbindelse
- ✅ **User-generated content** - Skab dine egne læringsemner

## 🚀 Hurtig Start

```bash
# 1. Clone eller download projektet
git clone <repo-url>

# 2. Åbn i browser - INGEN INSTALLATION NØDVENDIG!
open index.html

# Eller start en lokal server (valgfrit)
python -m http.server 8000
# Gå til http://localhost:8000
```

## 📁 Projekt Struktur

```
examklar-web/
├── index.html                    # Hovedside med navigation
├── manifest.json                 # PWA manifest
│
├── core/                         # Kerne funktionalitet
│   ├── app.js                   # Hoved app logik og routing
│   ├── storage.js               # localStorage management
│   └── utils.js                 # Hjælpe funktioner
│
├── styles/                       # CSS styling
│   ├── global.css               # Globale styles og variabler
│   └── components.css           # Genbrugelige komponenter
│
├── modules/                      # Selvstændige læringsmoduler
│   ├── content/                 # Dagligt læringsindhold
│   ├── flashcards/              # Interaktive flashcards
│   ├── quiz/                    # Quiz system
│   └── dashboard/               # Fremskridt dashboard
│
└── assets/                       # Statiske ressourcer
    ├── images/
    ├── icons/
    └── fonts/
```

## 🧩 Moduler

### 📖 Content Module
**Status:** 🚧 Under udvikling
- 7 dages struktureret læringsindhold
- JSON-baseret content management
- Offline tilgængelighed
- Progressive disclosure

### 🗂️ Flashcards Module  
**Status:** 🚧 Under udvikling
- Interaktive flashcards med swipe/click
- Spaced repetition algoritme (2357 metoden)
- Personlig favoritter og svære kort
- localStorage persistence

### ❓ Quiz Module
**Status:** 🚧 Under udvikling  
- Multiple choice spørgsmål
- Øjeblikkelig feedback
- Detaljerede forklaringer
- Fremskridt tracking

### 📊 Dashboard Module
**Status:** 🚧 Under udvikling
- Komplet fremskridts oversigt
- Læringsstatistikker og grafer
- Streak counter og badges
- Personaliserede anbefalinger

## 🛠 Teknisk Stack

| Komponent | Teknologi | Rationale |
|-----------|-----------|-----------|
| **Frontend** | Vanilla HTML/CSS/JS | Zero dependencies, maximum performance |
| **Styling** | CSS Custom Properties | Modern, maintainable styling |
| **State Management** | localStorage + JSON | Simple, persistent, offline-first |
| **Routing** | URL params + History API | SEO-friendly, bookmarkable |
| **Module Loading** | Dynamic imports | Lazy loading, smaller initial bundle |
| **PWA** | Service Worker + Manifest | App-like experience, offline support |
| **Deployment** | GitHub Pages / Netlify | Zero-config, automatic deployment |

## 📱 Progressive Web App Features

ExamKlar fungerer som en rigtig app:

- **🏠 Add to Home Screen** - Installer som app på telefon/tablet
- **⚡ Offline Support** - Fungerer uden internet efter første besøg  
- **🔄 Background Sync** - Synkroniserer data når online igen
- **📬 Push Notifications** - Daily study reminders (valgfrit)
- **⌨️ Keyboard Shortcuts** - Hurtig navigation (Alt + 1-5)
- **🎨 Theme Support** - Light/dark mode baseret på system

## 🗄 Data Management

### Local Storage Structure
```javascript
// User Progress
examklar_user_progress: {
    totalDaysCompleted: 0,
    currentDay: 1,
    completedModules: [],
    streakCount: 0,
    lastActiveDate: "2024-01-15T10:30:00Z"
}

// Flashcard Data  
examklar_flashcard_data: {
    completed: ["card-1", "card-2"],
    favorites: ["card-5"],
    difficult: ["card-10"],
    lastReviewed: {
        "card-1": "2024-01-15T09:30:00Z"
    }
}

// Spaced Repetition
examklar_spaced_repetition: {
    cards: {
        "card-1": {
            interval: 3,
            nextReview: "2024-01-18T09:30:00Z",
            easeFactor: 2.5
        }
    }
}
```

### Spaced Repetition Algorithm (2357 Method)
```javascript
// Intervals: 2, 3, 5, 7, 14, 30, 60 days
const intervals = [2, 3, 5, 7, 14, 30, 60];

function calculateNextReview(difficulty, currentInterval) {
    if (difficulty === 'easy') return intervals[Math.min(currentInterval + 2, intervals.length - 1)];
    if (difficulty === 'medium') return intervals[Math.min(currentInterval + 1, intervals.length - 1)];
    if (difficulty === 'hard') return intervals[Math.max(currentInterval - 1, 0)];
}
```

## 🎨 Design System

### Color Palette
```css
:root {
    --primary-color: #2563eb;    /* Blue 600 */
    --secondary-color: #7c3aed;  /* Purple 600 */
    --accent-color: #10b981;     /* Green 500 */
    --warning-color: #f59e0b;    /* Yellow 500 */
    --error-color: #ef4444;      /* Red 500 */
    
    --text-primary: #1f2937;     /* Gray 800 */
    --text-secondary: #6b7280;   /* Gray 500 */
    --bg-primary: #ffffff;       /* White */
    --bg-secondary: #f8fafc;     /* Gray 50 */
}
```

### Typography Scale
```css
:root {
    --font-size-xs: 0.75rem;     /* 12px */
    --font-size-sm: 0.875rem;    /* 14px */
    --font-size-base: 1rem;      /* 16px */
    --font-size-lg: 1.125rem;    /* 18px */
    --font-size-xl: 1.25rem;     /* 20px */
    --font-size-2xl: 1.5rem;     /* 24px */
    --font-size-3xl: 1.875rem;   /* 30px */
}
```

### Component Library
- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`
- **Cards:** `.card`, `.module-card`, `.stat-card`  
- **Progress:** `.progress-bar`, `.progress-fill`
- **Alerts:** `.alert`, `.alert-success`, `.alert-warning`
- **Forms:** `.form-group`, `.form-input`, `.form-label`

## 🚀 Development Workflow

### 1. Start Simple
```bash
# Åbn index.html direkte i browser
open index.html

# Eller brug en simpel server
python -m http.server 8000
```

### 2. Udvikl Moduler Uafhængigt
```bash
# Arbejd på ét modul ad gangen
# Eksempel: content module
cd modules/content/
# Edit index.html, content.js, data/*.json
```

### 3. Test Løbende
```bash
# Ingen build step - bare refresh browser
# Test på forskellige devices med browser dev tools
```

### 4. Deploy Automatisk
```bash
git add .
git commit -m "Added flashcard module"
git push origin main
# Automatic deploy via GitHub Pages
```

## 📈 Performance Optimizations

### Critical Rendering Path
1. **HTML** loads instantly (no external dependencies)
2. **CSS** loads with single request (concatenated files)
3. **JavaScript** loads progressively (core → modules)
4. **Images** lazy load when needed

### Bundle Size
- **HTML:** ~15KB (gzipped)
- **CSS:** ~25KB (gzipped)  
- **JavaScript:** ~30KB (gzipped)
- **Total:** ~70KB initial load

### Loading Strategy
```javascript
// Critical resources (inline or preload)
<style>/* Critical CSS */</style>
<script>/* Core app logic */</script>

// Non-critical resources (lazy load)
<link rel="preload" href="styles/components.css" as="style">
<script src="modules/flashcards/flashcards.js" defer></script>
```

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] **Cross-browser:** Chrome, Firefox, Safari, Edge
- [ ] **Mobile devices:** iOS Safari, Android Chrome
- [ ] **Offline functionality:** Disconnect internet, test features
- [ ] **PWA installation:** Add to home screen works
- [ ] **Performance:** Lighthouse score > 90
- [ ] **Accessibility:** Screen reader compatible

### Automated Testing (Future)
```bash
# Potential additions
npm install --save-dev cypress        # E2E testing
npm install --save-dev lighthouse     # Performance testing
npm install --save-dev axe-core       # Accessibility testing
```

## 🔒 Security Considerations

### Data Protection
- **No server-side data** - All data stored locally
- **XSS Prevention** - Input sanitization in utils.js
- **CSP Headers** - Content Security Policy for production
- **HTTPS Only** - Force secure connections in production

### Privacy
- **No tracking** - No analytics or external scripts
- **No data collection** - All learning data stays on device
- **Export/Import** - Users own their data completely

## 🌍 Internationalization (Future)

### Language Support Structure
```javascript
// i18n/da.json
{
    "navigation": {
        "home": "Hjem",
        "content": "Indhold", 
        "flashcards": "Flashcards",
        "quiz": "Quiz",
        "dashboard": "Dashboard"
    }
}

// i18n/en.json  
{
    "navigation": {
        "home": "Home",
        "content": "Content",
        "flashcards": "Flashcards", 
        "quiz": "Quiz",
        "dashboard": "Dashboard"
    }
}
```

## 📊 Analytics & Monitoring (Privacy-First)

### Client-Side Analytics Only
```javascript
// No external services - all analytics stored locally
const analytics = {
    trackEvent(event, data) {
        const events = storage.get('analytics_events', []);
        events.push({
            event,
            data,
            timestamp: new Date().toISOString()
        });
        storage.set('analytics_events', events);
    }
};
```

## 🤝 Contributing

### Development Setup
1. **Fork** repository
2. **Clone** locally: `git clone <your-fork>`
3. **Create branch:** `git checkout -b feature/new-module`
4. **Develop** using browser + text editor
5. **Test** on multiple devices/browsers
6. **Submit** pull request

### Code Style
- **HTML:** Semantic, accessible markup
- **CSS:** BEM methodology, mobile-first
- **JavaScript:** ES6+, functional style, comprehensive comments
- **File naming:** kebab-case for files, camelCase for variables

### Commit Messages
```bash
git commit -m "feat: add flashcard swipe gestures"
git commit -m "fix: resolve localStorage quota exceeded error"  
git commit -m "docs: update API documentation"
git commit -m "style: improve mobile navigation UX"
```

## 📋 Roadmap

### Phase 1: Foundation ✅ 
- [x] Basic HTML structure
- [x] Core CSS system  
- [x] JavaScript utilities
- [x] Navigation system
- [x] Local storage setup

### Phase 2: Core Modules 🚧
- [ ] Content module (7 days learning material)
- [ ] Flashcards system with spaced repetition
- [ ] Quiz engine with feedback
- [ ] Progress dashboard

### Phase 3: Enhanced Features
- [ ] PWA functionality (offline, install)
- [ ] Advanced spaced repetition
- [ ] Study streaks and gamification
- [ ] Data export/import

### Phase 4: Polish & Scale
- [ ] Performance optimizations
- [ ] Accessibility improvements  
- [ ] Multi-language support
- [ ] Advanced analytics

## 🎓 Learning Outcomes

Efter 7 dage med ExamKlar vil brugere kunne:

1. **Forstå** grundlæggende protein purification principper
2. **Identificere** forskellige rensningsmetoder og deres anvendelser
3. **Analysere** protein rensningsresultater
4. **Planlægge** en komplet protein purification strategi
5. **Troubleshoote** almindelige problemer i processen
6. **Optimere** rensningsprotokoller for specifik anvendelse
7. **Kommunikere** tekniske resultater klart og præcist

## 📞 Support

### Self-Service
- **GitHub Issues:** Rapporter bugs eller feature requests
- **Documentation:** Komplet i README.md og kode kommentarer
- **Examples:** Live eksempler i hver modul

### Community
- **Discussions:** GitHub Discussions for spørgsmål
- **Wiki:** Community-vedligeholdt tips og tricks

---

**ExamKlar** - Fordi læring skal være enkelt, effektivt og engagerende! 🚀

*Bygget med ❤️ og vanilla JavaScript*