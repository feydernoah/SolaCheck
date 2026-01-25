# SolaCheck – Entwicklerdokumentation

**Version:** 1.0.0  
**Stand:** Januar 2026  
**Projekt:** AWP – Zukunftsagentur Nachhaltigkeit  
**Live-Demo:** https://nofey.de/solacheck

---

## Inhaltsverzeichnis

1. [Einleitung](#1-einleitung)
2. [Projektübersicht](#2-projektübersicht)
3. [Systemarchitektur](#3-systemarchitektur)
4. [Technologie-Stack](#4-technologie-stack)
5. [Projektstruktur](#5-projektstruktur)
6. [Kernkomponenten](#6-kernkomponenten)
7. [API-Schnittstellen](#7-api-schnittstellen)
8. [Datenmodelle & Typen](#8-datenmodelle--typen)
9. [Berechnungslogik](#9-berechnungslogik)
10. [Frontend-Architektur](#10-frontend-architektur)
11. [State Management](#11-state-management)
12. [Testing-Strategie](#12-testing-strategie)
13. [CI/CD Pipeline & DevOps](#13-cicd-pipeline--devops)
14. [Deployment](#14-deployment)
15. [Konfiguration](#15-konfiguration)
16. [Entwicklungsworkflow](#16-entwicklungsworkflow)
17. [Externe Datenquellen & APIs](#17-externe-datenquellen--apis)
18. [Sicherheitsaspekte](#18-sicherheitsaspekte)
19. [Performance-Optimierungen](#19-performance-optimierungen)
20. [Glossar](#20-glossar)
21. [Anhang](#21-anhang)

---

## 1. Einleitung

### 1.1 Zweck des Dokuments

Diese Entwicklerdokumentation beschreibt die technische Architektur, den Aufbau und die Implementierung der SolaCheck-Webanwendung. Sie dient als Referenz für Entwickler, die an der Wartung oder Weiterentwicklung des Projekts beteiligt sind.

### 1.2 Zielgruppe

- Software-Entwickler
- DevOps-Engineers
- Quality Assurance Engineers
- Technische Projektleiter

### 1.3 Projektkontext

SolaCheck wurde im Rahmen des AWP-Projekts für das Zukunftsagentur Nachhaltigkeit entwickelt. Das Projekt wurde nach der **Scrum-Methodik** durchgeführt, wobei **Jira** für das Feature- und Issue-Tracking sowie **Confluence** für die inhaltliche Dokumentation eingesetzt wurde.

---

## 2. Projektübersicht

### 2.1 Anwendungszweck

SolaCheck ist ein quiz-basiertes Beratungstool, das Nutzern hilft zu entscheiden, ob ein Balkonkraftwerk (BKW) für ihre individuelle Situation sinnvoll ist.

### 2.2 Kernfunktionalitäten

| Funktion | Beschreibung |
|----------|--------------|
| **Quiz-System** | 12-Fragen-Fragebogen zur Erfassung der Wohnsituation |
| **Standortanalyse** | Automatische Ermittlung von Sonnenstunden via PVGIS |
| **Wirtschaftlichkeitsberechnung** | Amortisation, Ersparnisse, Eigenverbrauch |
| **Ökobilanz** | CO₂-Fußabdruck und Payback-Zeitraum |
| **Produktempfehlungen** | Ranking basierend auf individuellen Kriterien |
| **E-Mail-Versand** | Persönliche Ergebnisse per E-Mail |
| **PWA-Unterstützung** | Offline-Fähigkeit und App-ähnliches Verhalten |

### 2.3 Benutzerfluss

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Landing    │───▶│    Quiz     │───▶│   Loading   │───▶│  Ergebnis   │
│    Page     │    │  (12 Fragen)│    │   Screen    │    │    Page     │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
                                                                ▼
                                                       ┌─────────────┐
                                                       │   CO₂-      │
                                                       │   Bilanz    │
                                                       └─────────────┘
```

---

## 3. Systemarchitektur

### 3.1 Architekturübersicht

SolaCheck folgt einer **monolithischen Next.js-Architektur** mit klarer Trennung zwischen Frontend und Backend-Logik durch API-Routes.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   React Components                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │    │
│  │  │   Quiz   │ │ Results  │ │ Address  │ │ Recommendation│   │    │
│  │  │   Page   │ │   Page   │ │  Input   │ │     Card     │   │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                    Custom Hooks                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ useQuizProgress │ useSolarData │ useGeolocation │ useReverse│    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Next.js API Routes                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ /api/solar- │ │   /api/     │ │ /api/scrape │ │ /api/enrich │   │
│  │    data     │ │recommendation│ │    -bkw    │ │   -gemini   │   │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘   │
└─────────┼───────────────┼───────────────┼───────────────┼───────────┘
          │               │               │               │
          ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                            │
│  ┌──────────────────┐ ┌────────────────┐ ┌─────────────────────┐   │
│  │ economicCalculator│ │ecologicCalculator│ │recommendationEngine│   │
│  └──────────────────┘ └────────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     External Services                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  PVGIS   │  │  Photon  │  │ SerpAPI  │  │ Gemini   │           │
│  │  (Solar) │  │(Geocode) │  │ (Preise) │  │   (AI)   │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Schichtenarchitektur

| Schicht | Verantwortung | Technologien |
|---------|---------------|--------------|
| **Präsentation** | UI-Komponenten, Benutzerinteraktion | React, Tailwind CSS |
| **Anwendungslogik** | Custom Hooks, State Management | React Hooks, Cookies |
| **API-Schicht** | Request-Handling, Datenvalidierung | Next.js API Routes |
| **Business Logic** | Berechnungen, Algorithmen | TypeScript Module |
| **Datenzugriff** | Externe APIs, statische Daten | Fetch, JSON-Dateien |

### 3.3 Datenfluss

```
Quiz-Antworten → API-Request → PVGIS-Abfrage → Berechnungen → Ranking → Response → UI
        ↓
  Cookie-Storage
```

---

## 4. Technologie-Stack

### 4.1 Frontend

| Technologie | Version | Verwendungszweck |
|-------------|---------|------------------|
| **React** | 19.2.0 | UI-Framework |
| **Next.js** | 16.0.1 | React-Framework mit SSR/API-Routes |
| **TypeScript** | 5.9.3 | Typsicherheit |
| **Tailwind CSS** | 4.1.16 | Utility-First CSS |
| **react-icons** | 5.5.0 | Icon-Bibliothek |
| **next-pwa** | 5.6.0 | Progressive Web App |

### 4.2 Backend & APIs

| Technologie | Version | Verwendungszweck |
|-------------|---------|------------------|
| **Next.js API Routes** | - | Server-seitige Endpoints |
| **Cheerio** | 1.1.2 | HTML-Parsing (Web Scraping) |
| **EmailJS** | 4.4.1 | E-Mail-Versand |

### 4.3 Entwicklung & Testing

| Technologie | Version | Verwendungszweck |
|-------------|---------|------------------|
| **ESLint** | 9.39.1 | Linting |
| **Playwright** | 1.56.1 | E2E-Testing |
| **Docker** | - | Containerisierung |
| **Docker Compose** | - | Multi-Container-Orchestrierung |

### 4.4 Externe Dienste

| Dienst | Zweck |
|--------|-------|
| **PVGIS** | Solarstrahlungsdaten (EU JRC) |
| **Photon** | Geocoding (Komoot/Nominatim) |
| **SerpAPI** | Google Shopping Preise |
| **Gemini AI** | Produktanreicherung |
| **EmailJS** | E-Mail-Versand |
| **Traefik** | Reverse Proxy & TLS |

---

## 5. Projektstruktur

### 5.1 Verzeichnisübersicht

```
SolaCheck/
├── 📁 public/                    # Statische Assets
│   ├── manifest.json             # PWA-Manifest
│   ├── solaCalculating/          # Lade-Animation Frames
│   ├── SolaQuizPages/            # Quiz-Hintergrundbilder
│   └── solaWalking/              # Walking-Animation Frames
│
├── 📁 scripts/                   # Build- & Utility-Scripts
│   └── refresh-products.ts       # Produkt-Update-Pipeline
│
├── 📁 src/                       # Quellcode
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── layout.tsx            # Root-Layout
│   │   ├── page.tsx              # Landing Page
│   │   ├── globals.css           # Globale Styles
│   │   ├── 📁 api/               # API-Endpunkte
│   │   │   ├── enrich-gemini/    # AI-Anreicherung
│   │   │   ├── recommendation/   # Empfehlungs-API
│   │   │   ├── scrape-bkw/       # Produkt-Scraping
│   │   │   └── solar-data/       # PVGIS-Proxy
│   │   ├── 📁 carbon-footprint/  # CO₂-Bilanz-Seite
│   │   ├── 📁 datenschutz/       # Datenschutz
│   │   ├── 📁 impressum/         # Impressum
│   │   ├── 📁 info-page/         # Info-Seite
│   │   ├── 📁 offline/           # PWA Offline-Fallback
│   │   ├── 📁 quiz/              # Haupt-Quiz
│   │   └── 📁 results/           # Ergebnis-Seite
│   │
│   ├── 📁 components/            # React-Komponenten
│   │   ├── 📁 ui/                # Wiederverwendbare UI
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── OptionTile.tsx
│   │   │   └── index.ts
│   │   ├── AddressInput.tsx      # Standorteingabe + GPS
│   │   ├── BurgerMenu.tsx        # Navigation
│   │   ├── CompassSelector.tsx   # Himmelsrichtungswahl
│   │   ├── Footer.tsx
│   │   ├── InfoButton.tsx
│   │   ├── InfoModal.tsx
│   │   ├── LoadingScreen.tsx
│   │   ├── NumberInput.tsx
│   │   ├── RecommendationCard.tsx
│   │   └── ...
│   │
│   ├── 📁 data/                  # Statische Daten
│   │   ├── bkwProducts.ts        # Produkt-Definitionen
│   │   ├── loadProducts.ts       # Produkt-Loader
│   │   ├── questionInfoData.tsx  # Info-Texte
│   │   └── 📁 scraped/           # Gecachte Produktdaten
│   │       ├── bkw-latest.json
│   │       └── bkw-enrichment-latest.json
│   │
│   ├── 📁 hooks/                 # Custom React Hooks
│   │   ├── useGeolocation.ts
│   │   ├── useQuizProgress.ts
│   │   ├── useReverseGeocoding.ts
│   │   └── useSolarData.ts
│   │
│   ├── 📁 lib/                   # Business Logic
│   │   ├── constants.ts          # Konstanten
│   │   ├── ecologicCalculator.ts # Ökobilanz
│   │   ├── economicCalculator.ts # Wirtschaftlichkeit
│   │   ├── emailService.ts       # E-Mail-Versand
│   │   ├── quizConstants.ts      # Quiz-IDs
│   │   └── recommendationEngine.ts# Empfehlungs-Algorithmus
│   │
│   └── 📁 types/                 # TypeScript-Typen
│       ├── css.d.ts
│       ├── economic.ts
│       └── scraped.ts
│
├── 📁 tests/                     # Playwright E2E-Tests
│   ├── 📁 utils/
│   ├── *.spec.ts
│   └── ...
│
├── docker-compose.yml            # Produktions-Deployment
├── docker-compose.test.yml       # Test-Container
├── Dockerfile                    # Produktions-Image
├── Dockerfile.test               # Test-Image
├── playwright.config.ts          # Playwright-Konfiguration
├── next.config.js                # Next.js-Konfiguration
├── tailwind.config.ts            # Tailwind-Konfiguration
├── tsconfig.json                 # TypeScript-Konfiguration
├── eslint.config.mjs             # ESLint-Konfiguration
└── package.json                  # Dependencies & Scripts
```

### 5.2 Namenskonventionen

| Element | Konvention | Beispiel |
|---------|------------|----------|
| Komponenten | PascalCase | `RecommendationCard.tsx` |
| Hooks | camelCase mit `use`-Prefix | `useQuizProgress.ts` |
| API-Routes | kebab-case | `solar-data/route.ts` |
| Typen | PascalCase | `ProductEconomics` |
| Konstanten | SCREAMING_SNAKE_CASE | `LEGAL_AC_LIMIT_W` |

---

## 6. Kernkomponenten

### 6.1 Quiz-System

Das Quiz besteht aus 12 Fragen in verschiedenen Kategorien:

```typescript
// src/lib/quizConstants.ts
export const QUESTION_IDS = {
  LOCATION: 1,           // PLZ/Stadt + Koordinaten
  HOUSEHOLD_SIZE: 2,     // Haushaltsgröße
  HOUSING_TYPE: 3,       // Wohnform (Miete/Eigentum)
  APARTMENT_SIZE: 4,     // Wohnfläche m²
  MOUNTING_LOCATION: 5,  // Montageort
  ORIENTATION: 6,        // Himmelsrichtung
  BALCONY_SIZE: 7,       // Balkongröße
  SHADING: 8,            // Verschattung
  APPLIANCES: 9,         // Geräte (Multiselect)
  CONSUMPTION: 10,       // Stromverbrauch kWh
  BUDGET: 11,            // Budget €
  ECO_IMPORTANCE: 12,    // Umweltbewusstsein
};
```

#### Fragetypen

| Typ | Beschreibung | Verwendung |
|-----|--------------|------------|
| `tile` | Bildkacheln | Wohnform, Montageort |
| `button` | Auswahl-Buttons | Haushaltsgröße, Budget |
| `text` | Texteingabe | Standort |
| `number` | Zahleneingabe | Verbrauch |
| `multiselect` | Mehrfachauswahl | Geräte |
| `compass` | Kompass-Auswahl | Himmelsrichtung |

### 6.2 AddressInput-Komponente

Die `AddressInput`-Komponente ermöglicht Standorteingabe mit Autovervollständigung und GPS-Support:

```
┌───────────────────────────────────────────────────┐
│  📍 Eingabe: "Berlin"                          🔍 │
├───────────────────────────────────────────────────┤
│  ● 10115 Berlin, Deutschland                      │
│  ● 10117 Berlin-Mitte, Deutschland                │
│  ● Berlin-Spandau, Deutschland                    │
└───────────────────────────────────────────────────┘
          │
          ▼
     Photon API (Geocoding)
          │
          ▼
     { lat: 52.52, lon: 13.405 }
```

**Features:**
- Debounced Suchanfragen (300ms)
- GPS-Geolocation mit Fallback
- Länder-Filter (DE, AT, CH)
- Koordinaten-Speicherung als JSON

### 6.3 CompassSelector-Komponente

Interaktive Auswahl der Balkon-Ausrichtung mit visueller Kompassdarstellung.

```
        N (0.55)
    NW     NE
   (0.65) (0.65)
  W         E
(0.80)    (0.80)
   SW     SE
  (0.95) (0.95)
        S (1.0)
```

*Zahlen = Ertragsfaktoren relativ zu Süden*

### 6.4 RecommendationCard

Darstellung eines empfohlenen Produkts mit:
- Produktbild
- Technische Daten (Leistung, Speicher, Garantie)
- Wirtschaftliche Kennzahlen
- Match-Gründe und Warnungen
- Link zur CO₂-Bilanz

---

## 7. API-Schnittstellen

### 7.1 Übersicht

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/api/solar-data` | GET | PVGIS-Proxy für Solarstrahlungsdaten |
| `/api/recommendation` | POST/GET | Produktempfehlungen |
| `/api/scrape-bkw` | GET | FAZ-Scraping + Preise |
| `/api/enrich-gemini` | GET | AI-Produktanreicherung |

### 7.2 `/api/solar-data`

**Zweck:** Proxy für PVGIS-API (CORS-Umgehung)

**Request:**
```
GET /api/solar-data?lat=52.52&lon=13.405&orientation=sueden&mounting=balkonbruestung
```

**Query-Parameter:**

| Parameter | Typ | Pflicht | Beschreibung |
|-----------|-----|---------|--------------|
| `lat` | number | ✓ | Breitengrad |
| `lon` | number | ✓ | Längengrad |
| `orientation` | string | ✗ | Himmelsrichtung (default: "weiss-nicht") |
| `mounting` | string | ✗ | Montagetyp (default: "weiss-nicht") |

**Response:**
```typescript
{
  success: boolean;
  data?: {
    annualYieldKwhPerKwp: number;    // kWh/kWp/Jahr
    averageDailyYieldKwh: number;
    averageMonthlyYieldKwh: number;
    yearlyIrradiationKwhPerM2: number;
    monthlyYields: number[];         // 12 Werte
    totalLossPercent: number;
    location: { lat, lon, elevation };
    systemParams: { angle, aspect, peakPower, loss };
  };
  error?: string;
  fallbackUsed?: boolean;
}
```

### 7.3 `/api/recommendation`

**Zweck:** Hauptendpunkt für Produktempfehlungen

**POST Request:**
```typescript
{
  1: '{"lat":52.52,"lon":13.405}',  // Standort als JSON
  2: '2',                            // Haushaltsgröße
  5: 'balkonbruestung',              // Montageort
  6: 'sueden',                       // Ausrichtung
  8: 'keine',                        // Verschattung
  10: '3000',                        // Verbrauch kWh
  11: '1000',                        // Budget €
  12: 'wichtig',                     // Öko-Wichtigkeit
  coordinates: { lat: 52.52, lon: 13.405 }
}
```

**Response:**
```typescript
{
  success: boolean;
  recommendations: ProductRanking[];
  assumptions: CalculationAssumptions;
  solarData?: SolarData;
  totalProducts: number;
  filteredProducts: number;
  processingTimeMs: number;
}
```

### 7.4 `/api/scrape-bkw`

**Zweck:** Scraping von FAZ Kaufkompass + SerpAPI-Preise

**Ablauf:**
```
FAZ Website → Cheerio Parse → Produkte extrahieren
                                    │
                                    ▼
                           SerpAPI (pro Produkt)
                                    │
                                    ▼
                      bkw-YYYY-MM-DD.json speichern
```

**Response:**
```typescript
{
  success: boolean;
  products: ScrapedBKWProduct[];
  scrapedAt: string;
  fazUrl: string;
  files: string[];
}
```

### 7.5 `/api/enrich-gemini`

**Zweck:** AI-gestützte Produktanreicherung

**Angereicherte Felder:**
- `mountingTypes` – Passende Montagearten
- `manufacturingOrigin` – Herstellungsland
- `bifacial` – Bifaziale Module
- `moduleEfficiency` – Modulwirkungsgrad
- `inverterACPower` – Wechselrichterleistung
- `storageCapacity` – Speicherkapazität
- `description` – Deutsche Beschreibung

---

## 8. Datenmodelle & Typen

### 8.1 Haupt-Interfaces

```typescript
// src/types/economic.ts

interface BKWProduct {
  id: string;
  name: string;
  brand: string;
  wattage: number;              // Peak-Leistung in Wp
  moduleCount: number;
  price: number;                // Preis in €
  includesInverter: boolean;
  inverterACPower?: number;     // AC-Leistung in W (max 800)
  includesStorage: boolean;
  storageCapacity?: number;     // kWh
  mountingTypes: MountingType[];
  bifacial: boolean;
  moduleEfficiency: number;     // Prozent (z.B. 21.5)
  warrantyYears: number;
  description: string;
  manufacturingOrigin: ManufacturingOrigin;
  manufacturingCo2Kg: number;
  // Optionale Felder aus Scraping
  imageUrl?: string;
  priceSource?: string;
  priceLink?: string;
  category?: string;
}

interface ProductEconomics {
  annualYieldKwh: number;       // Jahresertrag
  selfConsumptionKwh: number;   // Eigenverbrauch
  feedInKwh: number;            // Einspeisung
  annualSavingsEuro: number;    // Jährliche Ersparnis
  savingsFromSelfConsumption: number;
  feedInRevenueEuro: number;
  amortizationYears: number;    // Amortisationszeit
  totalSavings10Years: number;
  totalSavings20Years: number;
  co2SavingsKgPerYear: number;
}

interface ProductEcological {
  manufacturingCo2Kg: number;   // Herstellungs-CO₂
  resourceExtractionCo2Kg: number;
  productionCo2Kg: number;
  transportCo2Kg: number;
  paybackPeriodYears: number;   // CO₂-Amortisation
  lifecycleEmissionsKg: number; // Lebenszyklusemissionen
  ecologicalScore: number;      // 0-100
}

interface ProductRanking {
  product: BKWProduct;
  economics: ProductEconomics;
  ecological: ProductEcological;
  score: number;
  matchReasons: string[];
  warnings: string[];
}
```

### 8.2 Quiz-Typen

```typescript
type Orientation = 
  | 'sueden' | 'suedost' | 'suedwest' 
  | 'westen' | 'osten' 
  | 'norden' | 'nordost' | 'nordwest' 
  | 'weiss-nicht';

type ShadingLevel = 
  | 'keine' | 'etwas' | 'mehrere-stunden' | 'ganzen-tag';

type HouseholdSize = '1' | '2' | '3-4' | '5+';

type MountingType = 
  | 'balkonbruestung' | 'balkonboden' 
  | 'hauswand' | 'flachdach' | 'weiss-nicht';

type ManufacturingOrigin = 
  | 'germany' | 'europe' | 'asia' | 'china' | 'unknown';
```

---

## 9. Berechnungslogik

### 9.1 Wirtschaftlichkeitsberechnung

**Modul:** `src/lib/economicCalculator.ts`

#### 9.1.1 Jahresertrag

```typescript
function calculateAnnualYield(
  product: BKWProduct,
  orientationFactor: number,  // 0.55 - 1.0
  shadingFactor: number,      // 0.40 - 1.0
  pvgisYieldKwhPerKwp?: number
): number
```

**Berechnung mit PVGIS:**
```
Jahresertrag = PVGIS_Yield × Wattage/1000 × Shading × Bifacial_Bonus
```

**Fallback ohne PVGIS:**
```
Jahresertrag = 0.95 kWh/Wp × Wattage × Orientation × Shading × Bifacial
```

**Wichtig:** AC-Limit-Clipping

```
LEGAL_AC_LIMIT_W = 800 W

Wenn Produkt > 800 Wp ohne Speicher:
  → Clipping-Verluste berechnen
  → Effektive Nutzung = min(Ertrag, 800W × Sonnenstunden)

Wenn Produkt hat Speicher:
  → Überschuss wird gespeichert
  → Verlust nur durch Speichereffizienz (90%)
```

#### 9.1.2 Eigenverbrauchsquote

```typescript
const SELF_CONSUMPTION_BY_HOUSEHOLD = {
  '1':   { baseRate: 0.20, storageBonus: 0.20 },
  '2':   { baseRate: 0.25, storageBonus: 0.20 },
  '3-4': { baseRate: 0.30, storageBonus: 0.20 },
  '5+':  { baseRate: 0.35, storageBonus: 0.20 },
};
```

**Zusätzliche Boni:**
- West/Ost-Ausrichtung: +5% (bessere Tagesverteilung)
- Mit Speicher: +20%
- Maximum: 75%

#### 9.1.3 Amortisation

```
Jährliche Ersparnis = (Eigenverbrauch × Strompreis) + (Einspeisung × Einspeisevergütung)

Strompreis = 40 ct/kWh
Einspeisevergütung = 8.2 ct/kWh

Amortisation = Anschaffungskosten / Jährliche Ersparnis
```

### 9.2 Ökobilanzberechnung

**Modul:** `src/lib/ecologicCalculator.ts`

#### 9.2.1 Herstellungs-CO₂

```
Modul-CO₂ = Wattage × 800 g/Wp

Aufschlüsselung:
- Ressourcengewinnung: 60%
- Produktion: 35%
- Transport: 5%

Batterie-CO₂ = Kapazität × 61 kg/kWh
Wechselrichter-CO₂ = Leistung × 0.015 g/W
Transport-CO₂ = Gewicht × Distanz × 0.1 kg/tkm
```

#### 9.2.2 CO₂-Payback

```
Jährliche CO₂-Einsparung = Eigenverbrauch × 380 g/kWh

CO₂-Payback = Herstellungs-CO₂ / Jährliche CO₂-Einsparung
```

#### 9.2.3 Lebenszyklusemissionen

```
Lebenszyklus (25 Jahre):
  = Herstellungs-CO₂ - (25 × Jährliche Einsparung)

→ Typisch: -3.000 bis -8.000 kg CO₂ (netto positiv!)
```

### 9.3 Scoring-Algorithmus

**Modul:** `src/lib/recommendationEngine.ts`

```typescript
function calculateProductScore(
  product: BKWProduct,
  economics: ProductEconomics,
  ecological: ProductEcological,
  answers: QuizAnswers,
  assumptions: CalculationAssumptions
): number {
  // Basis: Je kürzer Amortisation, desto besser (40%)
  const amortScore = Math.max(0, 100 - economics.amortizationYears * 5);
  
  // Eigenverbrauchsquote (20%)
  const selfConsumptionRate = economics.selfConsumptionKwh / economics.annualYieldKwh;
  const consumptionScore = selfConsumptionRate * 100;
  
  // Ökologischer Score (20%)
  const ecoScore = ecological.ecologicalScore;
  
  // Preis-Leistung (20%)
  const pricePerWp = product.price / product.wattage;
  const priceScore = Math.max(0, 100 - pricePerWp * 50);
  
  // Gewichtung nach User-Präferenz
  const ecoImportance = answers[QUESTION_IDS.ECO_IMPORTANCE];
  const ecoWeight = ecoImportance === 'sehr-wichtig' ? 0.35 
                  : ecoImportance === 'wichtig' ? 0.20 
                  : 0.10;
  
  return (
    amortScore * 0.40 +
    consumptionScore * 0.20 +
    ecoScore * ecoWeight +
    priceScore * (0.40 - ecoWeight)
  );
}
```

---

## 10. Frontend-Architektur

### 10.1 Routing (App Router)

```
/                    → Landing Page (src/app/page.tsx)
/quiz               → Quiz-Seite (src/app/quiz/page.tsx)
/results            → Ergebnis-Seite (src/app/results/page.tsx)
/carbon-footprint   → CO₂-Bilanz (src/app/carbon-footprint/page.tsx)
/info-page          → Informationen (src/app/info-page/page.tsx)
/impressum          → Impressum
/datenschutz        → Datenschutz
/offline            → PWA Offline-Fallback
```

### 10.2 Komponentenhierarchie

```
RootLayout
├── Header/BurgerMenu
├── Page Content
│   ├── Quiz Page
│   │   ├── ProgressBar
│   │   ├── QuestionCard
│   │   │   ├── OptionTile / Button / CompassSelector / AddressInput
│   │   │   └── InfoButton → InfoModal
│   │   └── NavigationButtons
│   │
│   ├── Results Page
│   │   ├── LoadingScreen
│   │   ├── RecommendationCard (×3)
│   │   └── EmailForm
│   │
│   └── CarbonFootprint Page
│       ├── ProductDetails
│       └── EcologicalMetrics
│
└── Footer
```

### 10.3 Styling-System

**Tailwind CSS 4.x** mit benutzerdefinierten Design-Tokens:

```css
/* globals.css */
:root {
  --color-primary: #FEC107;      /* Gelb */
  --color-secondary: #4CAF50;    /* Grün */
  --color-accent: #FF9800;       /* Orange */
  
  --text-heading-1: 2.5rem;
  --text-heading-2: 1.75rem;
  --text-heading-3: 1.25rem;
  --text-body: 1rem;
  --text-body-sm: 0.875rem;
}
```

### 10.4 Responsive Design

| Breakpoint | Breite | Verhalten |
|------------|--------|-----------|
| Mobile | < 640px | Stacked Layout, volle Breite |
| Tablet | 640-1024px | 2-Spalten für Karten |
| Desktop | > 1024px | 3-Spalten, max-width Container |

---

## 11. State Management

### 11.1 Cookie-basiertes State

Quiz-Fortschritt und Solar-Daten werden in Cookies gespeichert für Persistenz:

```typescript
// useQuizProgress.ts
const COOKIE_NAME = 'solacheck_quiz_progress';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 Tage

interface QuizProgress {
  currentQuestion: number;
  answers: Record<number, string | string[]>;
}
```

```typescript
// useSolarData.ts
const SOLAR_DATA_COOKIE_NAME = 'solacheck_pvgis_data';
const COOKIE_MAX_AGE_DAYS = 1; // 1 Tag
```

### 11.2 SessionStorage

CO₂-Bilanz-Daten werden temporär in SessionStorage gespeichert:

```typescript
sessionStorage.setItem('carbon-footprint-data', JSON.stringify(ranking));
```

### 11.3 State-Fluss

```
┌─────────────────┐
│  User Input     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  React State    │────▶│   Cookie/       │
│  (useState)     │     │   Storage       │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  API Request    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Server Response│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  UI Update      │
└─────────────────┘
```

---

## 12. Testing-Strategie

### 12.1 Test-Pyramide

```
         /\
        /  \        E2E Tests (Playwright)
       /    \       - Vollständige User Journeys
      /──────\      - Kritische Pfade
     /        \
    /──────────\    Integration Tests
   /            \   - API-Endpunkte
  /──────────────\  - Komponenten-Interaktion
 /                \
/──────────────────\ Unit Tests (implizit durch TypeScript)
                     - Type Checking
                     - ESLint Rules
```

### 12.2 Playwright E2E-Tests

**Konfiguration:** `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```

### 12.3 Test-Kategorien

| Datei | Fokus |
|-------|-------|
| `health-check.spec.ts` | Basis-Verfügbarkeit |
| `landing-page.spec.ts` | Start-Seite |
| `quiz-progress.spec.ts` | Quiz-Navigation |
| `quiz-dependencies.spec.ts` | Fragen-Abhängigkeiten |
| `results-page.spec.ts` | Ergebnis-Darstellung |
| `address-input.spec.ts` | Geocoding-Komponente |
| `burger-menu-reset.spec.ts` | Navigation & Reset |
| `economicEcologic-aclimit.spec.ts` | Berechnungslogik |
| `info-button.spec.ts` | Info-Modals |
| `footer.spec.ts` | Footer-Links |
| `logo.spec.ts` | Branding |

### 12.4 Test-Ausführung

```bash
# Lokale Entwicklung
npm run dev          # Terminal 1
npm run test         # Terminal 2

# Mit Browser-UI
npm run test:ui

# Sichtbarer Browser
npm run test:headed

# CI-äquivalente Umgebung (Docker)
npm run test:docker
npm run test:docker:down
```

### 12.5 Test-Utilities

**Photon Mock:** `tests/utils/photon-mock.ts`

Ermöglicht deterministische Tests für Geocoding ohne externe API-Aufrufe.

---

## 13. CI/CD Pipeline & DevOps

### 13.1 Development Workflow (Scrum)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Jira      │───▶│   Feature   │───▶│    Code     │
│   Ticket    │    │   Branch    │    │   Review    │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
      ┌───────────────────────────────────────┘
      │
      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Merge     │───▶│   Docker    │───▶│ Deployment  │
│   to Main   │    │   Build     │    │ (Traefik)   │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 13.2 Branching-Strategie

| Branch | Zweck |
|--------|-------|
| `main` | Produktions-Branch |
| `feature/*` | Feature-Entwicklung |
| `bugfix/*` | Bug-Fixes |
| `hotfix/*` | Kritische Fixes |

### 13.3 Build-Pipeline

```yaml
# Typischer CI-Ablauf (GitHub Actions oder Jenkins)

1. Checkout Code
2. Setup Node.js 20.x
3. npm ci
4. npm run lint
5. npm run build
6. npm run test:docker
7. Docker Build & Push
8. Deploy to Production
```

### 13.4 Docker-basiertes Testing

**`docker-compose.test.yml`:**

```yaml
services:
  test:
    build:
      context: .
      dockerfile: Dockerfile.test
    container_name: solacheck-test
    environment:
      - CI=true
      - NODE_ENV=production
    volumes:
      - ./playwright-report:/app/playwright-report
      - ./test-results:/app/test-results
```

**`Dockerfile.test`:**

- Basiert auf Playwright-Image
- Baut App und führt Tests im selben Container aus
- Vermeidet Netzwerk-Probleme zwischen Containern

### 13.5 Automatisierungsskripte

```bash
# package.json scripts

"dev": "next dev"
"build": "npm run lint && next build"
"build:test": "next build"  # Ohne Lint für Tests
"start": "next start"
"lint": "eslint --cache --cache-location .next/cache/eslint/"
"lint:fix": "eslint --fix"
"test": "playwright test"
"test:docker": "docker compose -f docker-compose.test.yml up --build --abort-on-container-exit"
"test:docker:down": "docker compose -f docker-compose.test.yml down -v --remove-orphans"
"refresh-products": "npx tsx scripts/refresh-products.ts"
```

---

## 14. Deployment

### 14.1 Produktions-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Traefik Reverse Proxy                    │
│  - HTTPS/TLS (Let's Encrypt)                                │
│  - Routing: nofey.de/solacheck → SolaCheck Container        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Docker Container                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              SolaCheck (Next.js)                      │  │
│  │              Port 3000                                │  │
│  │              node server.js (standalone)              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 Docker Production Build

**`Dockerfile` (Multi-Stage):**

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner (minimal)
FROM node:20-alpine AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### 14.3 Docker Compose (Production)

```yaml
# docker-compose.yml
services:
  solacheck:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: solacheck
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.solacheck.rule=Host(`nofey.de`) && PathPrefix(`/solacheck`)"
      - "traefik.http.routers.solacheck.entrypoints=websecure"
      - "traefik.http.routers.solacheck.tls.certresolver=letsencrypt"
      - "traefik.http.services.solacheck.loadbalancer.server.port=3000"
    networks:
      - traefik-net
    environment:
      - NODE_ENV=production

networks:
  traefik-net:
    external: true
```

### 14.4 Deployment-Befehle

```bash
# Auf dem Server
cd /path/to/SolaCheck
git pull origin main
docker compose build
docker compose up -d
docker compose logs -f solacheck
```

---

## 15. Konfiguration

### 15.1 Next.js Konfiguration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: { document: '/solacheck/offline' },
});

module.exports = withPWA({
  reactStrictMode: true,
  turbopack: {},
  output: 'standalone',           // Für Docker
  basePath: '/solacheck',         // Sub-Path
  assetPrefix: '/solacheck',
});
```

### 15.2 TypeScript Konfiguration

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 15.3 ESLint Konfiguration

```javascript
// eslint.config.mjs (Flat Config)
- ESLint Recommended
- TypeScript ESLint (strict, type-checked)
- React Plugin
- React Hooks Plugin
- JSX A11y Plugin
- Next.js Plugin

// Custom Rules:
- @typescript-eslint/no-floating-promises: error
- @typescript-eslint/strict-boolean-expressions: error
- react/jsx-no-target-blank: error
- jsx-a11y/anchor-is-valid: warn
```

### 15.4 Umgebungsvariablen

| Variable | Erforderlich | Beschreibung |
|----------|--------------|--------------|
| `NODE_ENV` | ✓ | development / production |
| `SERPAPI_KEY` | ✗ | SerpAPI für Google Shopping |
| `GEMINI_API_KEY` | ✗ | Google Gemini AI |
| `PLAYWRIGHT_BASE_URL` | ✗ | Test-URL (Docker) |

---

## 16. Entwicklungsworkflow

### 16.1 Lokale Entwicklung

```bash
# 1. Repository klonen
git clone https://github.com/feydernoah/SolaCheck.git
cd SolaCheck

# 2. Dependencies installieren
npm install

# 3. Entwicklungsserver starten
npm run dev

# 4. Browser öffnen
open http://localhost:3000/solacheck
```

### 16.2 Feature-Entwicklung

```bash
# 1. Feature-Branch erstellen
git checkout -b feature/JIRA-123-neue-funktion

# 2. Änderungen implementieren
# ...

# 3. Linting prüfen
npm run lint
npm run lint:fix  # Automatische Fixes

# 4. Tests ausführen
npm run test

# 5. Build testen
npm run build

# 6. Committen
git add .
git commit -m "feat: JIRA-123 Neue Funktion implementiert"

# 7. Push & Pull Request
git push origin feature/JIRA-123-neue-funktion
```

### 16.3 Produkt-Daten aktualisieren

```bash
# Voraussetzung: Dev-Server läuft
npm run dev

# In neuem Terminal:
npm run refresh-products

# Prüft:
# 1. FAZ-Scraping
# 2. SerpAPI-Preise
# 3. Gemini-Enrichment
# 4. Validierung
```

### 16.4 Debug-Tipps

```typescript
// API-Logs aktivieren (route.ts)
console.log(`[API] Request: ${JSON.stringify(params)}`);

// React DevTools
// Chrome Extension installieren

// Network Tab
// PVGIS/Photon Requests prüfen

// Playwright Debug
PWDEBUG=1 npm run test
```

---

## 17. Externe Datenquellen & APIs

### 17.1 PVGIS (Photovoltaic Geographical Information System)

**Anbieter:** EU Joint Research Centre  
**URL:** https://re.jrc.ec.europa.eu/pvg_tools/en/  
**Dokumentation:** https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en

**Verwendung:** Solarstrahlungsdaten basierend auf Koordinaten

**Parameter:**
- `lat`, `lon` – Koordinaten
- `peakpower` – Normiert auf 1 kWp
- `loss` – Systemverluste (14%)
- `angle` – Neigungswinkel
- `aspect` – Azimut (0 = Süd)
- `raddatabase` – PVGIS-SARAH3

**Rate Limits:** Keine dokumentiert, aber respektvoller Umgang empfohlen

### 17.2 Photon (Geocoding)

**Anbieter:** Komoot  
**URL:** https://photon.komoot.io/  
**Basis:** OpenStreetMap / Nominatim

**Verwendung:** Adress-Autovervollständigung, Koordinaten-Lookup

**Parameter:**
- `q` – Suchtext
- `lat`, `lon` – Bias-Koordinaten
- `lang` – Sprache (de)
- `limit` – Ergebnisanzahl

**Vorteile:**
- Kostenlos
- Keine API-Keys erforderlich
- Schnelle Autovervollständigung

### 17.3 SerpAPI (Google Shopping)

**Anbieter:** SerpAPI  
**URL:** https://serpapi.com/  
**Typ:** Kostenpflichtig (API-Key erforderlich)

**Verwendung:** Aktuelle Produktpreise aus Google Shopping

**Limits:** Abhängig vom Plan

### 17.4 Google Gemini AI

**Anbieter:** Google  
**Typ:** Kostenpflichtig (API-Key erforderlich)

**Verwendung:** Produktdaten-Anreicherung mit strukturiertem Output

**Features:**
- JSON Schema für garantiert valide Responses
- Deutsche Beschreibungen generieren
- Technische Spezifikationen extrahieren

### 17.5 EmailJS

**Anbieter:** EmailJS  
**URL:** https://www.emailjs.com/

**Verwendung:** Client-seitiger E-Mail-Versand ohne Backend

**Konfiguration:**
```typescript
const EMAILJS_CONFIG = {
  serviceId: 'service_bu73sja',
  templateId: 'template_7btuxvj',
  publicKey: '62B1neEqWDwLpKI8Q',
};
```

---

## 18. Sicherheitsaspekte

### 18.1 Datenschutz

- **Keine Server-seitige Speicherung** von Benutzerdaten
- Koordinaten werden nur client-seitig in Cookies gespeichert
- Cookie-Lifetime: 7 Tage (Quiz), 1 Tag (Solar-Daten)
- Keine Tracking-Cookies oder Analytics

### 18.2 API-Sicherheit

- PVGIS-Proxy verhindert CORS-Leaking
- Keine sensiblen Daten in Client-seitigem Code
- API-Keys nur serverseitig (Environment Variables)

### 18.3 Content Security

```typescript
// next.config.js Headers (falls konfiguriert)
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

### 18.4 Input-Validierung

- TypeScript für Compile-Zeit-Checks
- Quiz-IDs werden gegen `VALID_QUESTION_IDS` validiert
- Koordinaten werden auf gültige Bereiche geprüft

---

## 19. Performance-Optimierungen

### 19.1 Build-Optimierungen

- **Standalone Output:** Minimiertes Docker-Image
- **Tree Shaking:** Nicht verwendeter Code entfernt
- **Code Splitting:** Automatisch durch Next.js

### 19.2 Laufzeit-Optimierungen

- **Cookie-Caching:** PVGIS-Daten 24h gecacht
- **Debouncing:** Geocoding-Anfragen (300ms)
- **Lazy Loading:** Bilder mit `next/image`

### 19.3 PWA-Optimierungen

- **Service Worker:** Offline-Fähigkeit
- **Asset Caching:** Statische Ressourcen gecacht
- **Fallback Page:** `/offline` bei Netzwerkfehler

### 19.4 Bundle-Analyse

```bash
# Bundle-Größe analysieren
npm run build
# Siehe .next/analyze/client.html
```

---

## 20. Glossar

| Begriff | Bedeutung |
|---------|-----------|
| **BKW** | Balkonkraftwerk |
| **Wp** | Watt-Peak (Spitzenleistung) |
| **kWh** | Kilowattstunde |
| **Amortisation** | Zeitraum bis zur Kostendeckung |
| **Eigenverbrauch** | Selbst genutzter Solarstrom |
| **Einspeisung** | Ins Netz eingespeister Strom |
| **PVGIS** | Photovoltaic Geographical Information System |
| **Bifazial** | Beidseitig lichtempfindliche Module |
| **PWA** | Progressive Web App |
| **SSR** | Server-Side Rendering |
| **API Route** | Next.js Backend-Endpunkt |

---

## 21. Anhang

### 21.1 Wichtige Konstanten

```typescript
// src/lib/constants.ts
export const LEGAL_AC_LIMIT_W = 800;              // Gesetzliches AC-Limit
export const ELECTRICITY_PRICE_CT_PER_KWH = 40;   // Strompreis
export const FEED_IN_TARIFF_CT_PER_KWH = 8.2;     // Einspeisevergütung
export const CO2_GRAMS_PER_KWH = 380;             // Strommix CO₂
export const BASE_YIELD_KWH_PER_WP = 0.95;        // Fallback-Ertrag
export const BIFACIAL_GAIN = 0.08;                // +8% für bifazial
export const BATTERY_EFFICIENCY = 0.90;           // 90% Speichereffizienz
```

### 21.2 Produkt-Datenpipeline

```
┌─────────────────┐
│  FAZ Kaufkompass │
│  (Scraping)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Cheerio Parse  │────▶│ bkw-YYYY-MM-DD  │
│  Produktliste   │     │     .json       │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  SerpAPI        │────▶│  Aktuelle       │
│  Google Shopping│     │  Preise         │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Gemini AI      │────▶│ bkw-enrichment  │
│  Enrichment     │     │     .json       │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  loadProducts.ts│
│  Merge & Type   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  BKWProduct[]   │
│  Ready to use   │
└─────────────────┘
```

### 21.3 Referenzen

- **Next.js Dokumentation:** https://nextjs.org/docs
- **Playwright Dokumentation:** https://playwright.dev/docs
- **PVGIS User Manual:** https://joint-research-centre.ec.europa.eu/pvgis
- **Tailwind CSS:** https://tailwindcss.com/docs
- **EmailJS:** https://www.emailjs.com/docs/

### 21.4 Ansprechpartner

| Rolle | Verantwortung |
|-------|---------------|
| Product Owner | Feature-Priorisierung (Jira) |
| Scrum Master | Sprint-Organisation |
| Entwicklungsteam | Implementierung |

**Projekt-Dokumentation:** Confluence  
**Issue-Tracking:** Jira  
**Code-Repository:** GitHub (https://github.com/feydernoah/SolaCheck)

---

*Letzte Aktualisierung: Januar 2026*
