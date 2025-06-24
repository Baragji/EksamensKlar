# ExamKlar Shared Modules

Denne mappe indeholder alle delte komponenter, utilities og services der bruges på tværs af hele ExamKlar applikationen.

## 📁 Struktur

```
shared/
├── components/          # Genbrugelige UI komponenter
│   ├── modal-component.js
│   └── notification-component.js
├── constants/           # Applikations konstanter
│   └── app-constants.js
├── services/           # Delte services
│   ├── event-bus.js
│   ├── http-service.js
│   ├── legacy-storage.js
│   └── storage-service.js
├── utilities/          # Hjælpefunktioner
│   ├── dom-utils.js
│   ├── legacy-utils.js
│   └── validation-utils.js
├── index.js           # Central export punkt
└── README.md          # Denne fil
```

## 🚀 Brug

### Import af hele shared modulet
```javascript
import ExamKlarShared from './shared/index.js';

// Brug services
ExamKlarShared.Services.Notification.show('Besked', 'success');
ExamKlarShared.Services.Storage.set('key', 'value');

// Brug utilities
const isValid = ExamKlarShared.ValidationUtils.isValidEmail('test@example.com');
const element = ExamKlarShared.DOMUtils.querySelector('#myElement');
```

### Import af specifikke moduler
```javascript
import { NotificationComponent, ValidationUtils } from './shared/index.js';

// Eller direkte import
import { NotificationComponent } from './shared/components/notification-component.js';
import { isValidEmail } from './shared/utilities/validation-utils.js';
```

## 📦 Komponenter

### NotificationComponent
Genbrugelig notification/toast komponent med forskellige typer og animationer.

```javascript
const notification = new NotificationComponent();
notification.show('Besked', 'success', { duration: 3000 });
```

### ModalComponent
Genbrugelig modal dialog komponent med accessibility support.

```javascript
const modal = new ModalComponent();
modal.show({
    title: 'Bekræft handling',
    content: 'Er du sikker?',
    actions: [{ text: 'Ja', action: () => console.log('Bekræftet') }]
});
```

## 🛠 Services

### HttpService
Centraliseret HTTP client med error handling, retry logic og interceptors.

```javascript
const httpService = new HttpService();
const data = await httpService.get('/api/data');
```

### StorageService
Avanceret storage service med encryption, compression og TTL support.

```javascript
const storageService = new StorageService();
storageService.set('userData', data, { ttl: 3600000 }); // 1 time
```

## 🔧 Utilities

### DOMUtils
DOM manipulation og query funktioner.

```javascript
import { querySelector, debounce } from './shared/utilities/dom-utils.js';

const element = querySelector('#myElement');
const debouncedFn = debounce(() => console.log('Debounced!'), 300);
```

### ValidationUtils
Validering og data manipulation funktioner.

```javascript
import { isValidEmail, sanitizeHTML } from './shared/utilities/validation-utils.js';

const isValid = isValidEmail('test@example.com');
const clean = sanitizeHTML('<script>alert("xss")</script>Hello');
```

## 📋 Konstanter

Alle applikations konstanter er centraliseret i `constants/app-constants.js`:

```javascript
import { APP_CONFIG, EVENT_TYPES } from './shared/constants/app-constants.js';

console.log(APP_CONFIG.name); // 'ExamKlar'
eventBus.emit(EVENT_TYPES.MODULE_LOADED, data);
```

## 🔄 Migration fra Legacy

Legacy filer er bevaret for bagudkompatibilitet:
- `utilities/legacy-utils.js` - Original utils.js
- `services/legacy-storage.js` - Original storage.js

Disse vil gradvist blive udfaset til fordel for de nye modulære versioner.

## 🎯 Best Practices

1. **Import kun hvad du bruger** - Undgå at importere hele shared modulet hvis du kun bruger få funktioner
2. **Brug TypeScript-style JSDoc** - Alle funktioner er dokumenteret med JSDoc
3. **Error handling** - Alle services har indbygget error handling
4. **Accessibility** - Alle komponenter følger WCAG 2.1 AA guidelines
5. **Performance** - Lazy loading og tree shaking understøttes

## 🔮 Fremtidige Udvidelser

- **Theme Service** - Centraliseret theme management
- **Animation Service** - Genbrugelige animationer
- **Form Components** - Avancerede form komponenter
- **Chart Components** - Data visualisering komponenter
- **Accessibility Service** - Udvidet accessibility support