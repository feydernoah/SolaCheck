/**
 * Mock BKW (Balkonkraftwerk) Product Data
 * 
 * Based on popular products available in Germany 2024/2025:
 * - Priwatt priBalcony/priFlat series
 * - Yuma Balcony/Flat series  
 * - Anker SOLIX series
 * - EcoFlow PowerStream
 * - Kleines Kraftwerk sets
 * - Green Solar sets
 * 
 * Prices reflect 0% VAT (since 2023 for private PV)
 */

import type { BKWProduct } from '@/types/economic';

export const bkwProducts: BKWProduct[] = [
  // === BUDGET SEGMENT (under 400€) ===
  {
    id: 'yuma-basic-400',
    name: 'Yuma Basic 400',
    brand: 'Yuma',
    wattage: 400,
    moduleCount: 1,
    price: 299,
    includesInverter: true,
    inverterBrand: 'Hoymiles',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'hauswand', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 20.5,
    warrantyYears: 25,
    description: 'Kompaktes Einsteiger-Set mit einem 400W Modul. Ideal für kleine Balkone.',
  },
  {
    id: 'greensolar-light-380',
    name: 'Green Solar Light 380',
    brand: 'Green Solar',
    wattage: 380,
    moduleCount: 1,
    price: 279,
    includesInverter: true,
    inverterBrand: 'Deye',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'hauswand'],
    bifacial: false,
    moduleEfficiency: 19.8,
    warrantyYears: 12,
    description: 'Günstiges Einsteigermodell für den kleinen Geldbeutel.',
  },

  // === MID-RANGE SEGMENT (400-700€) ===
  {
    id: 'priwatt-pribalcony-duo',
    name: 'priBalcony Duo',
    brand: 'priwatt',
    wattage: 800,
    moduleCount: 2,
    price: 499,
    includesInverter: true,
    inverterBrand: 'Hoymiles HMS-800',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden'],
    bifacial: false,
    moduleEfficiency: 21.3,
    warrantyYears: 25,
    description: 'Bestseller von priwatt. Zwei Module mit 800W Gesamtleistung für optimale Balkonnutzung.',
  },
  {
    id: 'yuma-balcony-800-pro',
    name: 'Yuma Balcony 800 Pro',
    brand: 'Yuma',
    wattage: 830,
    moduleCount: 2,
    price: 549,
    includesInverter: true,
    inverterBrand: 'Hoymiles HMS-800W-2T',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'hauswand'],
    bifacial: true,
    moduleEfficiency: 21.8,
    warrantyYears: 25,
    description: 'Bifaziale Module für bis zu 8% mehr Ertrag durch Rückseitennutzung.',
  },
  {
    id: 'anker-solix-rs40p',
    name: 'Anker SOLIX RS40P',
    brand: 'Anker',
    wattage: 800,
    moduleCount: 2,
    price: 599,
    includesInverter: true,
    inverterBrand: 'Anker MI80',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 22.0,
    warrantyYears: 25,
    description: 'Premium-Set von Anker mit hochwertigen Komponenten und App-Steuerung.',
  },
  {
    id: 'kleines-kraftwerk-classic-800',
    name: 'KK Classic 800',
    brand: 'Kleines Kraftwerk',
    wattage: 800,
    moduleCount: 2,
    price: 479,
    includesInverter: true,
    inverterBrand: 'TSUN TSOL-MS800',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'hauswand', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 20.9,
    warrantyYears: 15,
    description: 'Solides Set vom deutschen Anbieter mit gutem Preis-Leistungs-Verhältnis.',
  },
  {
    id: 'priwatt-priflat-duo',
    name: 'priFlat Duo',
    brand: 'priwatt',
    wattage: 800,
    moduleCount: 2,
    price: 549,
    includesInverter: true,
    inverterBrand: 'Hoymiles HMS-800',
    includesStorage: false,
    mountingTypes: ['flachdach', 'balkonboden'],
    bifacial: false,
    moduleEfficiency: 21.3,
    warrantyYears: 25,
    description: 'Optimiert für Flachdach und Terrassen mit anpassbarem Aufstellwinkel.',
  },
  {
    id: 'greensolar-bifacial-830',
    name: 'Green Solar Bifacial 830',
    brand: 'Green Solar',
    wattage: 830,
    moduleCount: 2,
    price: 519,
    includesInverter: true,
    inverterBrand: 'Hoymiles HMS-800W-2T',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'hauswand', 'flachdach'],
    bifacial: true,
    moduleEfficiency: 21.5,
    warrantyYears: 25,
    description: 'Bifaziale Module für Mehrerträge, besonders bei hellem Untergrund.',
  },

  // === UPPER MID-RANGE (700-1000€) ===
  {
    id: 'ecoflow-powerstream-800',
    name: 'EcoFlow PowerStream 800W',
    brand: 'EcoFlow',
    wattage: 800,
    moduleCount: 2,
    price: 899,
    includesInverter: true,
    inverterBrand: 'EcoFlow PowerStream',
    includesStorage: false,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 22.4,
    warrantyYears: 10,
    description: 'Smarter Wechselrichter mit App, kompatibel mit EcoFlow Powerstation-Speicher.',
  },
  {
    id: 'anker-solix-solarbank-e1600',
    name: 'Anker SOLIX Solarbank E1600',
    brand: 'Anker',
    wattage: 800,
    moduleCount: 2,
    price: 999,
    includesInverter: true,
    inverterBrand: 'Anker',
    includesStorage: true,
    storageCapacity: 1.6,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 22.0,
    warrantyYears: 10,
    description: 'Komplettset mit 1,6 kWh Speicher für maximalen Eigenverbrauch.',
  },
  {
    id: 'yuma-flat-800-bifacial',
    name: 'Yuma Flat 800 Bifacial Pro',
    brand: 'Yuma',
    wattage: 860,
    moduleCount: 2,
    price: 749,
    includesInverter: true,
    inverterBrand: 'Hoymiles HMS-800W-2T',
    includesStorage: false,
    mountingTypes: ['flachdach', 'balkonboden'],
    bifacial: true,
    moduleEfficiency: 22.2,
    warrantyYears: 30,
    description: 'Premium Flachdach-Set mit bifazialen Modulen und 30 Jahren Garantie.',
  },
  {
    id: 'priwatt-pribalcony-quattro',
    name: 'priBalcony Quattro',
    brand: 'priwatt',
    wattage: 1640,
    moduleCount: 4,
    price: 949,
    includesInverter: true,
    inverterBrand: 'Hoymiles HMS-1600-4T',
    includesStorage: false,
    mountingTypes: ['hauswand', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 21.3,
    warrantyYears: 25,
    description: 'Großes Set für maximale Leistung. Ideal für Hauswand oder große Terrassen.',
  },

  // === PREMIUM SEGMENT (over 1000€) ===
  {
    id: 'ecoflow-delta-2-bundle',
    name: 'EcoFlow PowerStream + Delta 2',
    brand: 'EcoFlow',
    wattage: 800,
    moduleCount: 2,
    price: 1499,
    includesInverter: true,
    inverterBrand: 'EcoFlow PowerStream',
    includesStorage: true,
    storageCapacity: 1.0,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 22.4,
    warrantyYears: 10,
    description: 'Premium Bundle mit tragbarem Speicher. Auch als Notstromversorgung nutzbar.',
  },
  {
    id: 'anker-solix-solarbank-2-pro',
    name: 'Anker SOLIX Solarbank 2 Pro',
    brand: 'Anker',
    wattage: 890,
    moduleCount: 2,
    price: 1699,
    includesInverter: true,
    inverterBrand: 'Anker',
    includesStorage: true,
    storageCapacity: 2.4,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'flachdach', 'hauswand'],
    bifacial: true,
    moduleEfficiency: 23.0,
    warrantyYears: 15,
    description: 'Top-Modell mit 2,4 kWh Speicher, bifazialen Modulen und Smart-Home Integration.',
  },
  {
    id: 'zendure-solarflow-ace',
    name: 'Zendure SolarFlow Ace Bundle',
    brand: 'Zendure',
    wattage: 800,
    moduleCount: 2,
    price: 1299,
    includesInverter: true,
    inverterBrand: 'Zendure Hub 2000',
    includesStorage: true,
    storageCapacity: 1.92,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'flachdach'],
    bifacial: false,
    moduleEfficiency: 21.5,
    warrantyYears: 10,
    description: 'Modulares System mit erweiterbarem Speicher bis 7,68 kWh.',
  },
  {
    id: 'priwatt-speicher-bundle-2kwh',
    name: 'priwatt priStorage Bundle 2kWh',
    brand: 'priwatt',
    wattage: 800,
    moduleCount: 2,
    price: 1399,
    includesInverter: true,
    inverterBrand: 'Hoymiles HMS-800',
    includesStorage: true,
    storageCapacity: 2.0,
    mountingTypes: ['balkonbruestung', 'balkonboden', 'flachdach'],
    bifacial: true,
    moduleEfficiency: 21.8,
    warrantyYears: 10,
    description: 'priwatt Komplettlösung mit Speicher für optimalen Eigenverbrauch.',
  },
];

/**
 * Helper function to get products filtered by budget
 */
export function getProductsByBudget(budgetRange: string): BKWProduct[] {
  const maxBudget = getBudgetMaxValue(budgetRange);
  if (maxBudget === Infinity) {
    return bkwProducts;
  }
  return bkwProducts.filter(product => product.price <= maxBudget);
}

/**
 * Convert budget range string to max value
 */
export function getBudgetMaxValue(budgetRange: string): number {
  switch (budgetRange) {
    case 'bis-400':
      return 400;
    case '400-700':
      return 700;
    case '700-1000':
      return 1000;
    case '>1000':
      return Infinity;
    case 'weiss-nicht':
      return Infinity;
    default:
      return Infinity;
  }
}

/**
 * Get products compatible with a mounting type
 */
export function getProductsByMounting(mountingType: string): BKWProduct[] {
  if (mountingType === 'weiss-nicht') {
    return bkwProducts;
  }
  return bkwProducts.filter(product => 
    product.mountingTypes.includes(mountingType as BKWProduct['mountingTypes'][number])
  );
}
