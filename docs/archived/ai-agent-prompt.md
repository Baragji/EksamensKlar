# AI Agent Prompt til UI Layout Fejlfinding

## Instruktioner til AI-agent

Kør følgende kommandoer i rækkefølge og analyser resultaterne:

### 1. Kør UI Crawl Test
```bash
npm run test:ui-crawl
```

### 2. Start Diff Server
```bash
npm run serve-diffs
```
(Serveren kører på http://localhost:3333)

### 3. Hent Test Resultater
Hent JSON-data fra: `http://localhost:3333/diffs`

### 4. Analyser Resultater

For hvert screenshot og diff, beskriv:

**🔍 Hvilken side eller funktion:**
- URL eller side navn
- Knap/element der blev klikket
- Brugerflow context

**❌ Hvad ser forkert ud:**
- Layout problemer (overlap, forkert placering)
- Responsivitet problemer
- Farve- eller styling-fejl
- Manglende eller forkerte elementer
- Animationer der ikke virker korrekt

**💡 Forslag til CSS-fix:**
- Specifikke CSS-ændringer
- Hvilke filer der skal rettes
- Media queries hvis nødvendigt

**🔧 Prioritering:**
- Kritisk (blokerer brugerfunktioner)
- Høj (påvirker brugeroplevelse betydeligt)
- Medium (mindre kosmetiske problemer)
- Lav (mindre justeringer)

### 5. Returner Rapport

Format svaret som:

```markdown
# UI Layout Fejl Rapport

## Oversigt
- Antal screenshots taget: X
- Antal fejl fundet: Y
- Kritiske fejl: Z

## Detaljeret Analyse

### 1. [Side/Funktion Navn] - [Prioritet]
**Problem:** [Beskrivelse]
**Screenshot:** [Filnavn]
**Fix:** [CSS-ændringer]
**Filer:** [Hvilke filer skal rettes]

### 2. [Næste fejl...]
...
```

## Ekstra Kommandoer

### Opdater Baseline Screenshots
```bash
npm run test:crawl-baseline
```

### Få Server Status
```bash
curl http://localhost:3333/health
```

### Få Test Summary
```bash
curl http://localhost:3333/summary
```

## Teknisk Note

- Testen bruger Playwright's `toHaveScreenshot()` for automatisk diff
- Screenshots gemmes i `test-results/` mappen
- Baseline screenshots gemmes når `--update-snapshots` bruges
- Serveren eksponerer både test data og screenshot filer

## Troubleshooting

Hvis testen fejler:
1. Sørg for serveren kører på port 8080: `npm start`
2. Check at alle dependencies er installeret: `npm install`
3. Opdater Playwright: `npm run install-playwright`
4. Tjek browser kompatibilitet i `playwright.config.js`

## Responsive Testing

Testen inkluderer:
- Desktop views (Chrome, Firefox, Safari)
- Mobile views (iPhone, Android)
- Tablet views
- Forskellige screen sizes

Agent skal rapportere responsivitet problemer separat for hver device type.