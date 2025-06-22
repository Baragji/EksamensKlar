# 🎓 ExamKlar - AI-Powered Learning Platform

En avanceret læringsplatform med AI-drevet personalisering for eksamensforberedelse.

## 📁 Projektstruktur

```
ExamKlar/
├── 📋 README.md                      # Dette dokument
├── 🏠 index.html                     # Hovedside
├── ⚙️ package.json                   # Node.js dependencies
├── 🎭 playwright.config.js           # Test konfiguration
├── 📄 manifest.json                  # PWA manifest
├── 🔧 server.js                      # Udviklings server
├── 💾 sw.js                          # Service Worker
│
├── 📁 core/                          # Kerne funktionalitet
│   ├── app.js                        # Hoved app logik
│   ├── storage.js                    # Data persistering
│   ├── utils.js                      # Utility funktioner
│   └── ...                          # Andre kerne filer
│
├── 📁 modules/                       # Feature moduler
│   ├── onboarding/                   # ✅ Onboarding flow (EXCELLENT)
│   ├── subjects/                     # 📚 Emne håndtering
│   ├── flashcards/                   # 🗂️ Flashcard system
│   ├── quiz/                         # 🎯 Quiz system
│   ├── dashboard/                    # 📊 Analytics dashboard
│   ├── content/                      # 📖 Content management
│   └── ai-assistant/                 # 🤖 AI tutor
│
├── 📁 styles/                        # CSS styling
│   ├── global.css                    # Global styles
│   ├── components.css                # Component styles
│   └── premium.css                   # Premium styling
│
├── 📁 assets/                        # Statiske filer
│   ├── icons/                        # Ikoner
│   └── images/                       # Billeder
│
├── 📁 tests/                         # Test suite
│   ├── ui-visual-regression.spec.js  # Visual regression tests
│   ├── ui-summary.spec.js            # UI summary tests
│   └── archived/                     # Arkiverede tests
│
├── 📁 docs/                          # Dokumentation
│   ├── FINAL-UI-ASSESSMENT.md        # UI analyse rapport
│   ├── UI-INCONSISTENCY-REPORT.md    # UI inkonsistens rapport
│   └── archived/                     # Arkiverede dokumenter
│
└── 📁 tools/                         # Udviklings værktøjer
    ├── ui-analyzer.html              # UI analyse værktøj
    └── automated-test-suite.html     # Test suite
```

## 🚀 Quick Start

### Installation
```bash
npm install
npx playwright install
```

### Udvikling
```bash
# Start udviklings server
npm start
# eller
node server.js

# Åben i browser
http://localhost:8080
```

### Testing
```bash
# Kør alle tests
npm test

# Kør specifikke UI tests
npx playwright test tests/ui-summary.spec.js
npx playwright test tests/ui-visual-regression.spec.js
```

## 📊 Nuværende Status

### ✅ Fungerer Godt
- **Onboarding**: Excellent design og UX - bruges som baseline
- **Grundlæggende navigation**: Fungerer på tværs af moduler
- **PWA features**: Service worker og manifest

### ❌ Kræver Opmærksomhed
- **Dashboard**: Layout problemer og inkonsistens
- **Subjects**: Manglende subject.html fil (404 fejl)
- **Quiz**: Data formatting problemer (NaN værdier)
- **Sprog**: Inkonsistent engelsk/dansk mix
- **Responsive design**: Mobile layout problemer

## 🎯 Prioriteret Roadmap

### Phase 1: Kritiske Fixes (Uge 1-2)
1. ✅ Fix 404 fejl (opret subject.html)
2. ✅ Dashboard layout cleanup
3. ✅ Data formatering (fjern NaN)
4. ✅ Sprog standardisering

### Phase 2: UI Konsistens (Uge 3-4)
1. ✅ Navigation standardisering
2. ✅ Responsive design fixes
3. ✅ Component consistency

### Phase 3: Polish (Uge 5-6)
1. ✅ Dark mode completion
2. ✅ Performance optimization
3. ✅ Accessibility improvements

## 📖 Key Documents

- **[UI Analysis Report](docs/FINAL-UI-ASSESSMENT.md)** - Komprehensiv UI analyse
- **[UI Inconsistency Report](docs/UI-INCONSISTENCY-REPORT.md)** - Detaljerede inkonsistenser
- **[Archived Documents](docs/archived/)** - Historiske dokumenter

## 🧪 Testing Strategy

- **Visual Regression**: Automated screenshots til UI consistency
- **Functional Testing**: Core user journeys og workflows
- **Cross-Browser**: Chrome, Firefox, Safari, Mobile browsers
- **Responsive**: Multiple viewport sizes og orientations

## 🎨 Design System

**Baseline**: Onboarding modulet demonstrerer excellent design:
- Konsistent typography
- God spacing og layout
- Clear visual hierarchy
- Responsive design
- Professional appearance

**Goal**: Anvend samme design patterns på alle moduler.

## 🤝 Bidrag

Før ændringer:
1. Kør tests: `npm test`
2. Check UI consistency med visual regression tests
3. Test på mobile og desktop
4. Følg eksisterende design patterns fra onboarding

## 📞 Support

For spørgsmål om projektstruktur eller UI inconsistencies, se dokumentationen i `docs/` mappen.

---

*Sidste opdatering: Januar 2025*
*UI Analysis: Komplet med 100+ visual regression tests*