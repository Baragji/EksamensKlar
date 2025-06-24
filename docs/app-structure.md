# ExamKlar Application Structure

Denne dokumentation beskriver den nye, reorganiserede kodestruktur for ExamKlar applikationen.

## 📁 Overordnet Struktur

```
ExamKlar/
├── config/                 # Konfigurationsfiler
├── shared/                 # Delte komponenter og services
├── core/                   # Kernefunktionalitet
├── modules/                # Funktionsmoduler
├── styles/                 # Styling og design system
├── assets/                 # Statiske ressourcer
├── docs/                   # Dokumentation
├── tools/                  # Udviklerværktøjer
└── tests/                  # Test filer
```

## 🔧 Config Mappe

**Formål**: Centraliseret konfiguration for hele applikationen

```
config/
└── app-config.js          # Hovedkonfiguration
```

### app-config.js
- Applikationsmetadata
- Miljøindstillinger
- API konfiguration
- Performance indstillinger
- Sikkerhedsindstillinger
- UI/UX indstillinger
- Feature flags

## 🤝 Shared Mappe

**Formål**: Genbrugelige komponenter, services og utilities på tværs af hele applikationen

```
shared/
├── components/            # Genbrugelige UI komponenter
│   ├── modal-component.js
│   └── notification-component.js
├── constants/             # Applikations konstanter
│   └── app-constants.js
├── services/              # Delte services
│   ├── event-bus.js
│   ├── http-service.js
│   ├── legacy-storage.js
│   └── storage-service.js
├── utilities/             # Hjælpefunktioner
│   ├── dom-utils.js
│   ├── legacy-utils.js
│   └── validation-utils.js
├── index.js              # Central export punkt
└── README.md             # Dokumentation
```

### Komponenter
- **NotificationComponent**: Toast notifications med animationer
- **ModalComponent**: Genbrugelige modal dialogs med accessibility

### Services
- **HttpService**: Centraliseret HTTP client med retry logic
- **StorageService**: Avanceret storage med encryption og TTL
- **EventBus**: Global event kommunikation

### Utilities
- **DOMUtils**: DOM manipulation og queries
- **ValidationUtils**: Data validering og manipulation

## 🏗 Core Mappe

**Formål**: Kernefunktionalitet og systemkomponenter

```
core/
├── accessibility-manager.js    # Accessibility management
├── app.js                     # Hovedapplikation
├── browser-compatibility.js   # Browser kompatibilitet
├── event-bus.js              # Event system (flyttet til shared/)
├── lazy-loader.js            # Lazy loading system
├── module-loader.js          # Modul indlæsning
├── performance.js            # Performance monitoring
├── security-manager.js       # Sikkerhedshåndtering
├── storage.js               # Storage (flyttet til shared/)
├── utils.js                 # Utilities (flyttet til shared/)
└── ...
```

## 📦 Modules Mappe

**Formål**: Funktionsspecifikke moduler

```
modules/
├── dashboard/             # Dashboard modul
├── flashcards/           # Flashcard system
├── quiz/                 # Quiz funktionalitet
├── onboarding/           # Bruger onboarding
├── subjects/             # Fag management
├── content/              # Indhold management
├── ai-assistant/         # AI assistent
└── advanced/             # Avancerede funktioner
```

Hvert modul har sin egen struktur:
```
module-name/
├── index.html            # Modul HTML
├── module-name.js        # Modul logik
├── module-name.css       # Modul styling
├── components/           # Modul-specifikke komponenter
├── data/                 # Modul data
└── config/               # Modul konfiguration
```

## 🎨 Styles Mappe

**Formål**: Styling og design system

```
styles/
├── global.css                    # Globale styles
├── components.css                # Komponent styles
├── premium.css                   # Premium styling
├── animations.css                # Animationer
├── responsive.css                # Responsive design
├── interactive-components.css    # Interaktive komponenter
└── design-system/               # Design system
    ├── tokens/                  # Design tokens
    └── components/              # Design system komponenter
```

## 📋 Migration Plan

### Fase 1: Grundlæggende Struktur ✅
- [x] Opret shared/ mappe struktur
- [x] Opret config/ mappe
- [x] Flyt utils.js til shared/utilities/legacy-utils.js
- [x] Flyt storage.js til shared/services/legacy-storage.js
- [x] Flyt event-bus.js til shared/services/
- [x] Opret nye modulære komponenter
- [x] Opdater index.html imports

### Fase 2: Modul Opdateringer
- [ ] Opdater alle moduler til at bruge shared komponenter
- [ ] Refaktorer module-loader til ny struktur
- [ ] Opdater import paths i alle filer
- [ ] Test alle moduler med ny struktur

### Fase 3: Legacy Cleanup
- [ ] Fjern legacy filer når alle moduler er opdateret
- [ ] Optimér import struktur
- [ ] Opdater build process
- [ ] Opdater dokumentation

## 🔄 Import Patterns

### Før (Legacy)
```javascript
// Spredt imports fra forskellige steder
import utils from '../core/utils.js';
import storage from '../core/storage.js';
```

### Efter (Ny Struktur)
```javascript
// Centraliseret import fra shared
import { ValidationUtils, StorageService } from '../shared/index.js';

// Eller specifik import
import { NotificationComponent } from '../shared/components/notification-component.js';
```

## 🎯 Fordele ved Ny Struktur

1. **Bedre Separation of Concerns**: Klar adskillelse mellem shared, core og modules
2. **Genbrugelighed**: Shared komponenter kan bruges på tværs af moduler
3. **Vedligeholdelse**: Lettere at finde og opdatere kode
4. **Skalerbarhed**: Nem at tilføje nye moduler og komponenter
5. **Testing**: Bedre testbarhed med modulær struktur
6. **Performance**: Tree shaking og lazy loading support
7. **Dokumentation**: Klar struktur gør dokumentation lettere

## 🔍 Best Practices

1. **Import kun hvad du bruger**: Undgå at importere hele shared modulet
2. **Brug TypeScript-style JSDoc**: Dokumenter alle funktioner
3. **Følg naming conventions**: Konsistent navngivning på tværs af projektet
4. **Error handling**: Alle services skal have robust error handling
5. **Accessibility**: Alle komponenter skal følge WCAG guidelines
6. **Performance**: Optimer for lazy loading og tree shaking

## 🚀 Næste Skridt

1. Opdater alle moduler til at bruge den nye shared struktur
2. Implementer automatiseret testing af ny struktur
3. Optimér build process for ny struktur
4. Dokumenter migration guide for udviklere
5. Implementer performance monitoring for ny struktur