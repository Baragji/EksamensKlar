# 🧹 ExamKlar Cache Troubleshooting

## Problem: App Crasher eller Fryser

Hvis ExamKlar appen crasher, fryser eller opfører sig mærkeligt, kan det skyldes korrupte cache-filer. Dette er ligesom når man skal slette "build/cache" i TypeScript projekter.

## 🚀 Hurtige Løsninger

### 1. Browser Cache Rydning
```bash
# Åbn cache rydning siden
npm run clean:cache
```
Eller åbn direkte: `clear-cache.html`

### 2. Build Cache Rydning
```bash
# Ryd alle build filer og geninstaller
npm run clean
```

### 3. Komplet Reset
```bash
# Ryd alt og genstart serveren
npm run reset
```

### 4. Manuel Rydning
```bash
# Kør shell scriptet direkte
./clean-build.sh
```

## 🔧 Hvad Ryddes?

### Browser Cache (`clear-cache.html`)
- ✅ Service Worker cache
- ✅ localStorage og sessionStorage
- ✅ Module cache
- ✅ IndexedDB
- ✅ PWA cache

### Build Cache (`clean-build.sh`)
- ✅ `node_modules/`
- ✅ `package-lock.json`
- ✅ `test-results/`
- ✅ `playwright-report/`
- ✅ `.cache/`, `dist/`, `build/`
- ✅ Log filer
- ✅ OS-specifikke filer (.DS_Store)

## 📋 Trin-for-Trin Fejlfinding

### Trin 1: Browser Cache
1. Åbn `clear-cache.html` i browseren
2. Klik "🧹 Ryd Al Cache"
3. Genindlæs siden

### Trin 2: Build Cache (hvis Trin 1 ikke virker)
1. Kør `npm run clean`
2. Vent på geninstallation
3. Start appen: `npm start`

### Trin 3: Komplet Reset (hvis alt andet fejler)
1. Kør `npm run clean:all`
2. Ryd browser cache i den åbnede side
3. Genstart serveren

## 🆘 Nødsituationer

Hvis intet virker:

```bash
# Manuel total rydning
rm -rf node_modules package-lock.json
rm -rf test-results playwright-report .cache dist build
npm install
```

Derefter åbn `clear-cache.html` og ryd browser cache.

## 🔍 Debugging

### Tjek Console Fejl
1. Åbn Developer Tools (F12)
2. Gå til Console tab
3. Genindlæs siden
4. Se efter røde fejlmeddelelser

### Tjek Network Tab
1. Åbn Developer Tools (F12)
2. Gå til Network tab
3. Genindlæs siden
4. Se efter fejlede requests (røde)

### Tjek Service Worker
1. Åbn Developer Tools (F12)
2. Gå til Application tab
3. Klik på "Service Workers"
4. Unregister alle service workers

## 💡 Forebyggelse

### Regelmæssig Rydning
- Kør `npm run clean` hver uge
- Ryd browser cache efter større opdateringer
- Genstart browseren efter længere udviklingssessioner

### Development Best Practices
- Brug "Hard Refresh" (Ctrl+Shift+R / Cmd+Shift+R)
- Åbn Developer Tools og disable cache under Network tab
- Brug Incognito/Private browsing til test

## 📞 Support

Hvis problemet fortsætter efter alle ovenstående trin:

1. Dokumenter fejlen (screenshots, console logs)
2. Noter hvilke trin du har prøvet
3. Inkluder browser version og OS
4. Opret en issue i projektet

## 🎯 Hurtig Reference

| Problem | Løsning | Kommando |
|---------|---------|----------|
| App fryser | Browser cache | `npm run clean:cache` |
| Moduler loader ikke | Build cache | `npm run clean` |
| Intet virker | Komplet reset | `npm run reset` |
| Service Worker fejl | Manuel rydning | Åbn `clear-cache.html` |
| Node fejl | Geninstaller | `rm -rf node_modules && npm install` |

---

**💡 Tip:** Bookmark `clear-cache.html` for hurtig adgang til browser cache rydning!