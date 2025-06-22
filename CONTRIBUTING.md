# 🤝 Contributing to ExamKlar

Tak for din interesse i at bidrage til ExamKlar! Dette dokument indeholder guidelines for at sikre konsistent kodekvalitet og struktur.

## 📁 Projektstruktur (Brug Dette!)

```
ExamKlar/
├── core/                    # ⚡ Kerne funktionalitet - rør ikke uden grund
├── modules/                 # 🧩 Feature moduler - følg eksisterende patterns
├── styles/                  # 🎨 CSS - følg component-based approach
├── tests/                   # 🧪 Tests - kun aktuelle tests i root
│   └── archived/            # 📦 Gamle tests - rør ikke
├── docs/                    # 📖 Dokumentation - hold opdateret
│   └── archived/            # 📦 Gamle dokumenter - historisk reference
└── tools/                   # 🔧 Udviklings værktøjer
```

## 🎯 UI Consistency Guidelines

### ✅ FØLG ONBOARDING DESIGN (Vores Standard)
Onboarding modulet er vores **design baseline**. Når du laver ændringer:

1. **Typography**: Brug samme font sizes og weights som onboarding
2. **Spacing**: Følg samme margin/padding patterns
3. **Colors**: Brug established color variables
4. **Layout**: Samme grid system og responsive breakpoints
5. **Navigation**: Konsistent navigation pattern

### ❌ UNDGÅ DISSE PROBLEMER
- Forskellige button styles på tværs af moduler
- Inkonsistent sprog (blanding af engelsk/dansk)
- Overlappende elementer i layout
- Manglende responsive design
- NaN værdier eller formatering fejl

## 🧪 Test Workflow

### Før du committed:
```bash
# 1. Kør UI tests
npx playwright test tests/ui-summary.spec.js
npx playwright test tests/ui-visual-regression.spec.js

# 2. Check final structure
npx playwright test tests/final-structure-test.spec.js

# 3. Manual browser test
npm start  # test på localhost:8080
```

### Kun disse tests er aktuelle:
- `tests/ui-visual-regression.spec.js` - Visual regression testing
- `tests/ui-summary.spec.js` - UI consistency summary
- `tests/final-structure-test.spec.js` - Structure verification

**Alt i `tests/archived/` er gammelt - rør det ikke!**

## 🎨 Design System Rules

### CSS Structure
```css
/* 1. Brug CSS custom properties */
:root {
  --primary-color: #value;
  --text-primary: #value;
}

/* 2. Mobile-first responsive */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet/desktop styles */
  }
}

/* 3. Component-based naming */
.module-card { ... }
.module-card__title { ... }
.module-card__content { ... }
```

### JavaScript Patterns
```javascript
// 1. Modulær struktur
const ModuleName = {
  init() {
    // Initialization
  },
  
  handleEvent() {
    // Event handling
  }
};

// 2. Error handling
try {
  // Risky operation
} catch (error) {
  console.error('ModuleName error:', error);
  // Graceful fallback
}

// 3. Data validation
function validateData(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  // Validation logic
}
```

## 📋 Feature Development Workflow

### 1. Planlægning
- Check eksisterende funktionalitet i `docs/` folder
- Se på onboarding module for design patterns
- Plan responsive design fra start

### 2. Udvikling
```bash
# Arbejd lokalt
npm start

# Test løbende på forskellige skærmstørrelser
# Chrome DevTools -> Responsive mode
```

### 3. UI Consistency Check
```bash
# Før commit - kør visual regression tests
npx playwright test tests/ui-visual-regression.spec.js

# Check for inconsistencies
npx playwright test tests/ui-summary.spec.js
```

### 4. Documentation
- Opdater README.md hvis projektstruktur ændres
- Dokumenter nye features i `docs/` folder
- Opdater ikke old documents i `docs/archived/`

## 🚨 Kritiske "Må Ikke" Regler

### ❌ Arkiverede Filer
- **Rør IKKE** `tests/archived/` - det er historisk reference
- **Rør IKKE** `docs/archived/` - gamle dokumenter
- **Opret IKKE** nye test filer med gamle navne

### ❌ UI Consistency
- **Bland IKKE** engelsk og dansk i samme interface
- **Opret IKKE** nye button styles - brug eksisterende
- **Ignorer IKKE** mobile responsive design
- **Lad IKKE** NaN værdier eller undefined data være synlige

### ❌ Navigation
- **Ændr IKKE** navigation structure uden at teste alle moduler
- **Opret IKKE** 404 errors - test alle links
- **Bland IKKE** forskellige navigation patterns

## 📊 Quality Checklist

Før pull request:
- [ ] ✅ UI følger onboarding design patterns
- [ ] ✅ Responsive design på mobile/tablet/desktop
- [ ] ✅ Consistent language (dansk ELLER engelsk)
- [ ] ✅ No NaN/undefined values visible
- [ ] ✅ All links work (no 404 errors)
- [ ] ✅ Visual regression tests pass
- [ ] ✅ Console errors addressed
- [ ] ✅ Manual browser testing completed

## 🔍 Common Issues & Solutions

### Problem: Layout Overlapping
**Solution**: Check onboarding CSS patterns, use proper grid/flexbox

### Problem: Language Inconsistency
**Solution**: Choose dansk OR engelsk per module, not mixed

### Problem: 404 Errors
**Solution**: Ensure all referenced files exist, test navigation

### Problem: Mobile Layout Broken
**Solution**: Test with Chrome DevTools responsive mode

### Problem: Data Shows "NaN"
**Solution**: Add proper data validation and fallbacks

## 📞 Help & Support

1. **Check Documentation**: `docs/FINAL-UI-ASSESSMENT.md` for UI issues
2. **Reference Design**: Use onboarding module as pattern
3. **Test First**: Run tests before asking for help
4. **Visual Evidence**: Include screenshots of problems

## 🎯 Success Metrics

We measure success by:
- **UI Consistency**: All modules follow same design patterns
- **Functionality**: No 404 errors or broken features
- **Responsive**: Works on all device sizes
- **Performance**: Fast loading and smooth interactions
- **User Experience**: Clear, intuitive navigation

---

**Husk**: Onboarding modulet er vores standard for excellence. Brug det som reference for alt nyt arbejde! 🌟