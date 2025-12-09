/**
 * Economic Calculator for Balkonkraftwerk (BKW) recommendations
 * 
 * Implements calculations based on the documentation:
 * - Amortization time calculation
 * - Self-consumption vs feed-in
 * - Orientation and shading factors
 * - Household consumption estimates
 */

import type {
  BKWProduct,
  QuizAnswers,
  ProductEconomics,
  CalculationAssumptions,
  ProductRanking,
  RecommendationResponse,
  Orientation,
  ShadingLevel,
  HouseholdSize,
  MountingType,
} from '@/types/economic';
import { bkwProducts, getBudgetMaxValue } from '@/data/bkwProducts';
import { calculateProductEcological, generateEcologicalInsights } from '@/lib/ecologicCalculator';

// === CONSTANTS ===

/**
 * Electricity price in ct/kWh (2024/2025 average)
 * Source: BDEW Strompreisanalyse
 */
const ELECTRICITY_PRICE_CT_PER_KWH = 40;

/**
 * Feed-in tariff for <10 kWp (EEG 2023)
 * Source: §48 Abs. 2 EEG
 */
const FEED_IN_TARIFF_CT_PER_KWH = 8.2;

/**
 * CO2 emissions from German grid electricity (g/kWh)
 * Source: Umweltbundesamt 2023
 */
const CO2_GRAMS_PER_KWH = 380;

/**
 * Base annual yield per Wp in Germany (kWh/Wp)
 * This is for optimal conditions (south, no shading)
 * Source: PVGIS for central Germany
 */
const BASE_YIELD_KWH_PER_WP = 0.95;

/**
 * Bifacial gain factor (additional yield from rear side)
 */
const BIFACIAL_GAIN = 0.08; // 8% extra yield

// === ORIENTATION FACTORS ===
// Based on documentation and PVGIS data

const ORIENTATION_FACTORS: Record<Orientation, number> = {
  'sueden': 1.0,      // Optimal, 100%
  'suedost': 0.95,    // 95%
  'suedwest': 0.95,   // 95%
  'westen': 0.80,     // 80% (doc says 85% but evening peak is lower)
  'osten': 0.80,      // 80%
  'norden': 0.55,     // 55% (significantly reduced)
  'weiss-nicht': 0.85, // Assume average
};

// === SHADING FACTORS ===
// Based on documentation

const SHADING_FACTORS: Record<ShadingLevel, number> = {
  'keine': 1.0,           // No shading, 100%
  'etwas': 0.85,          // Some shading, 85%
  'mehrere-stunden': 0.65, // Multiple hours, 65%
  'ganzen-tag': 0.40,     // All day shade, 40%
};

// === SELF-CONSUMPTION RATES ===
// Based on documentation table

interface SelfConsumptionConfig {
  baseRate: number;
  storageBonus: number;
}

const SELF_CONSUMPTION_BY_HOUSEHOLD: Record<HouseholdSize, SelfConsumptionConfig> = {
  '1': { baseRate: 0.25, storageBonus: 0.20 },     // 1 person: 25% base, +20% with storage
  '2': { baseRate: 0.35, storageBonus: 0.20 },     // 2 persons: 35% base, +20% with storage
  '3-4': { baseRate: 0.40, storageBonus: 0.15 },   // 3-4 persons: 40% base, +15% with storage
  '5+': { baseRate: 0.45, storageBonus: 0.15 },    // 5+ persons: 45% base, +15% with storage
};

// === ANNUAL CONSUMPTION ESTIMATES ===
// Average German household consumption by size

const ANNUAL_CONSUMPTION_KWH: Record<HouseholdSize, number> = {
  '1': 1500,    // 1 person
  '2': 2500,    // 2 persons
  '3-4': 3500,  // 3-4 persons
  '5+': 5000,   // 5+ persons
};

// === HELPER FUNCTIONS ===

/**
 * Get orientation factor from quiz answer
 */
function getOrientationFactor(orientation: string | undefined): number {
  if (!orientation || !(orientation in ORIENTATION_FACTORS)) {
    return ORIENTATION_FACTORS['weiss-nicht'];
  }
  return ORIENTATION_FACTORS[orientation as Orientation];
}

/**
 * Get shading factor from quiz answer
 */
function getShadingFactor(shading: string | undefined): number {
  if (!shading || !(shading in SHADING_FACTORS)) {
    return SHADING_FACTORS.etwas; // Default to some shading
  }
  return SHADING_FACTORS[shading as ShadingLevel];
}

/**
 * Get self-consumption rate based on household and storage
 */
function getSelfConsumptionRate(
  householdSize: string | undefined, 
  hasStorage: boolean,
  orientation: string | undefined
): number {
  const size = (householdSize && householdSize in SELF_CONSUMPTION_BY_HOUSEHOLD) 
    ? householdSize as HouseholdSize 
    : '2';
  const config = SELF_CONSUMPTION_BY_HOUSEHOLD[size];
  
  let rate = config.baseRate;
  
  // Add storage bonus if product has storage
  if (hasStorage) {
    rate += config.storageBonus;
  }
  
  // West/East orientation increases self-consumption (afternoon/morning generation)
  // as per documentation notes
  if (orientation === 'westen' || orientation === 'osten') {
    rate += 0.05; // +5% for better alignment with usage patterns
  }
  
  // Cap at 75% - very high self-consumption is unrealistic
  return Math.min(rate, 0.75);
}

/**
 * Get estimated annual household consumption
 */
function getAnnualConsumption(householdSize: string | undefined): number {
  const size = (householdSize && householdSize in ANNUAL_CONSUMPTION_KWH)
    ? householdSize as HouseholdSize
    : '2';
  return ANNUAL_CONSUMPTION_KWH[size];
}

/**
 * Calculate annual yield for a product
 */
function calculateAnnualYield(
  product: BKWProduct,
  orientationFactor: number,
  shadingFactor: number
): number {
  let yield_kwh = product.wattage * BASE_YIELD_KWH_PER_WP;
  
  // Apply orientation factor
  yield_kwh *= orientationFactor;
  
  // Apply shading factor
  yield_kwh *= shadingFactor;
  
  // Add bifacial bonus
  if (product.bifacial) {
    yield_kwh *= (1 + BIFACIAL_GAIN);
  }
  
  return Math.round(yield_kwh);
}

/**
 * Calculate economics for a single product
 */
function calculateProductEconomics(
  product: BKWProduct,
  orientationFactor: number,
  shadingFactor: number,
  selfConsumptionRate: number,
  annualConsumption: number
): ProductEconomics {
  // Calculate annual yield
  const annualYieldKwh = calculateAnnualYield(product, orientationFactor, shadingFactor);
  
  // Calculate self-consumption (limited by actual consumption)
  // If production exceeds what can be self-consumed, excess goes to grid
  const maxSelfConsumption = annualConsumption * selfConsumptionRate;
  const theoreticalSelfConsumption = annualYieldKwh * selfConsumptionRate;
  const selfConsumptionKwh = Math.min(theoreticalSelfConsumption, maxSelfConsumption, annualYieldKwh);
  
  // Excess goes to grid (feed-in)
  const feedInKwh = Math.max(0, annualYieldKwh - selfConsumptionKwh);
  
  // Calculate savings from self-consumption
  const savingsFromSelfConsumption = (selfConsumptionKwh * ELECTRICITY_PRICE_CT_PER_KWH) / 100;
  
  // Calculate feed-in revenue
  const feedInRevenueEuro = (feedInKwh * FEED_IN_TARIFF_CT_PER_KWH) / 100;
  
  // Total annual savings
  const annualSavingsEuro = savingsFromSelfConsumption + feedInRevenueEuro;
  
  // Amortization time (simple payback)
  const amortizationYears = annualSavingsEuro > 0 
    ? product.price / annualSavingsEuro 
    : Infinity;
  
  // Long-term savings (assuming stable prices)
  const totalSavings10Years = (annualSavingsEuro * 10) - product.price;
  const totalSavings20Years = (annualSavingsEuro * 20) - product.price;
  
  // CO2 savings (all produced electricity displaces grid electricity)
  const co2SavingsKgPerYear = (annualYieldKwh * CO2_GRAMS_PER_KWH) / 1000;
  
  return {
    annualYieldKwh,
    selfConsumptionKwh: Math.round(selfConsumptionKwh),
    feedInKwh: Math.round(feedInKwh),
    annualSavingsEuro: Math.round(annualSavingsEuro * 100) / 100,
    savingsFromSelfConsumption: Math.round(savingsFromSelfConsumption * 100) / 100,
    feedInRevenueEuro: Math.round(feedInRevenueEuro * 100) / 100,
    amortizationYears: Math.round(amortizationYears * 10) / 10,
    totalSavings10Years: Math.round(totalSavings10Years),
    totalSavings20Years: Math.round(totalSavings20Years),
    co2SavingsKgPerYear: Math.round(co2SavingsKgPerYear),
  };
}

/**
 * Generate match reasons for a product
 */
function generateMatchReasons(
  product: BKWProduct,
  economics: ProductEconomics,
  answers: QuizAnswers
): string[] {
  const reasons: string[] = [];
  
  // Fast amortization
  if (economics.amortizationYears <= 6) {
    reasons.push('Sehr schnelle Amortisation unter 6 Jahren');
  } else if (economics.amortizationYears <= 8) {
    reasons.push('Gute Amortisation unter 8 Jahren');
  }
  
  // Storage benefit
  if (product.includesStorage && product.storageCapacity) {
    reasons.push(`Inkl. ${String(product.storageCapacity)} kWh Speicher für höheren Eigenverbrauch`);
  }
  
  // Bifacial bonus
  if (product.bifacial) {
    reasons.push('Bifaziale Module für bis zu 8% Mehrertrag');
  }
  
  // High self-consumption
  if (economics.annualYieldKwh > 0 && economics.selfConsumptionKwh / economics.annualYieldKwh > 0.5) {
    reasons.push('Hohe Eigenverbrauchsquote möglich');
  }
  
  // Good warranty
  if (product.warrantyYears >= 25) {
    reasons.push(`Lange Garantie (${String(product.warrantyYears)} Jahre)`);
  }
  
  // Mounting type match
  const mountingType = answers[6];
  if (mountingType && mountingType !== 'weiss-nicht') {
    reasons.push(`Passend für ${getMountingLabel(mountingType)}`);
  }
  
  // Budget friendly
  const budget = answers[11];
  if (budget === 'bis-400' && product.price <= 400) {
    reasons.push('Passt ins Budget unter 400€');
  } else if (budget === '400-700' && product.price <= 700) {
    reasons.push('Passt ins Budget 400-700€');
  }
  
  return reasons;
}

/**
 * Generate warnings for a product
 */
function generateWarnings(
  product: BKWProduct,
  economics: ProductEconomics,
  answers: QuizAnswers
): string[] {
  const warnings: string[] = [];
  
  // Long amortization
  if (economics.amortizationYears > 12) {
    warnings.push('Lange Amortisationszeit über 12 Jahre');
  }
  
  // Low yield due to orientation
  const orientation = answers[7];
  if (orientation === 'norden') {
    warnings.push('Nordausrichtung reduziert den Ertrag erheblich');
  }
  
  // Heavy shading
  const shading = answers[9];
  if (shading === 'ganzen-tag') {
    warnings.push('Starke Verschattung reduziert den Ertrag deutlich');
  }
  
  // High feed-in (wasted potential)
  if (economics.feedInKwh > economics.selfConsumptionKwh) {
    warnings.push('Mehr Einspeisung als Eigenverbrauch - Speicher könnte sich lohnen');
  }
  
  return warnings;
}

/**
 * Get human-readable mounting type label
 */
function getMountingLabel(mountingType: string): string {
  const labels: Record<string, string> = {
    'balkonbruestung': 'Balkonbrüstung',
    'balkonboden': 'Balkonboden/Terrasse',
    'hauswand': 'Hauswand',
    'flachdach': 'Flachdach',
    'weiss-nicht': 'Verschiedene Montageorte',
  };
  return labels[mountingType] ?? mountingType;
}

/**
 * Determine if a BKW is recommended and provide reasoning
 */
function determineRecommendation(
  rankings: ProductRanking[],
  orientationFactor: number,
  shadingFactor: number
): { isRecommended: boolean; reason: string } {
  // No products available in budget
  if (rankings.length === 0) {
    return {
      isRecommended: false,
      reason: 'Leider haben wir in deinem Budget kein passendes Balkonkraftwerk gefunden. Erwäge ein höheres Budget für mehr Optionen.',
    };
  }

  // Extremely poor conditions (north + heavy shade = factor < 0.25)
  const combinedFactor = orientationFactor * shadingFactor;
  if (combinedFactor < 0.25) {
    return {
      isRecommended: false,
      reason: 'Die Kombination aus Ausrichtung und Verschattung ist leider nicht ideal für ein Balkonkraftwerk. Der Ertrag wäre zu gering, um wirtschaftlich sinnvoll zu sein.',
    };
  }

  // Best option has too long amortization (> 15 years)
  const bestProduct = rankings[0];
  if (bestProduct.economics.amortizationYears > 15) {
    return {
      isRecommended: false,
      reason: `Mit einer Amortisationszeit von über ${Math.round(bestProduct.economics.amortizationYears).toString()} Jahren ist ein Balkonkraftwerk für deine Situation aktuell nicht wirtschaftlich sinnvoll.`,
    };
  }

  // Good conditions - recommend!
  let reason = 'Basierend auf deinen Angaben sind die Bedingungen für ein Balkonkraftwerk sehr gut! ';
  
  if (combinedFactor >= 0.8) {
    reason += 'Dein Standort bietet optimale Bedingungen für maximale Erträge. ';
  } else if (combinedFactor >= 0.6) {
    reason += 'Dein Standort bietet gute Bedingungen für solide Erträge. ';
  } else {
    reason += 'Trotz einiger Einschränkungen kann sich ein Balkonkraftwerk für dich lohnen. ';
  }

  reason += 'Hier sind unsere Top-Empfehlungen für dich:';

  return { isRecommended: true, reason };
}

/**
 * Main calculation function - generates full recommendations
 */
export function calculateRecommendations(answers: QuizAnswers): RecommendationResponse {
  // Extract relevant answers
  const householdSize = answers[3] as HouseholdSize | undefined;
  const mountingLocation = answers[6] as MountingType | undefined;
  const orientation = answers[7] as Orientation | undefined;
  const shading = answers[9] as ShadingLevel | undefined;
  const budget = answers[11];
  
  // Calculate factors
  const orientationFactor = getOrientationFactor(orientation);
  const shadingFactor = getShadingFactor(shading);
  const annualConsumption = getAnnualConsumption(householdSize);
  
  // Get budget max
  const maxBudget = getBudgetMaxValue(budget ?? 'weiss-nicht');
  
  // Filter products by budget (strict) and mounting type
  let eligibleProducts = bkwProducts.filter(product => product.price <= maxBudget);
  const filteredOutCount = bkwProducts.length - eligibleProducts.length;
  
  // Filter by mounting type if specified
  if (mountingLocation && mountingLocation !== 'weiss-nicht') {
    eligibleProducts = eligibleProducts.filter(product =>
      product.mountingTypes.includes(mountingLocation)
    );
  }
  
  // Calculate economics for each product
  const rankings: ProductRanking[] = eligibleProducts.map(product => {
    const selfConsumptionRate = getSelfConsumptionRate(
      householdSize,
      product.includesStorage,
      orientation
    );
    
    const economics = calculateProductEconomics(
      product,
      orientationFactor,
      shadingFactor,
      selfConsumptionRate,
      annualConsumption
    );

    // Calculate ecological impact
    const ecological = calculateProductEcological(product, economics);
    const { reasons: ecologicalReasons, warnings: ecologicalWarnings } = generateEcologicalInsights(product, ecological);
    
    return {
      rank: 0, // Will be set after sorting
      product,
      economics,
      ecological,
      score: economics.amortizationYears, // Lower is better
      matchReasons: generateMatchReasons(product, economics, answers),
      warnings: generateWarnings(product, economics, answers),
      ecologicalReasons,
      ecologicalWarnings,
    };
  });
  
  // Sort by amortization time (shortest first)
  rankings.sort((a, b) => a.score - b.score);
  
  // Assign ranks
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  // Determine if we should recommend a BKW
  const { isRecommended, reason: recommendationReason } = determineRecommendation(
    rankings,
    orientationFactor,
    shadingFactor
  );
  
  // Build assumptions object
  const assumptions: CalculationAssumptions = {
    electricityPriceCentPerKwh: ELECTRICITY_PRICE_CT_PER_KWH,
    feedInTariffCentPerKwh: FEED_IN_TARIFF_CT_PER_KWH,
    orientationFactor,
    shadingFactor,
    selfConsumptionRate: getSelfConsumptionRate(householdSize, false, orientation),
    estimatedAnnualConsumptionKwh: annualConsumption,
    co2PerKwhGrams: CO2_GRAMS_PER_KWH,
  };
  
  // Build quiz summary
  const quizSummary = {
    location: answers[2] ?? 'Nicht angegeben',
    orientation: orientation ? getOrientationLabel(orientation) : 'Nicht angegeben',
    householdSize: householdSize ? getHouseholdLabel(householdSize) : 'Nicht angegeben',
    budget: budget ? getBudgetLabel(budget) : 'Nicht angegeben',
    mountingLocation: mountingLocation ? getMountingLabel(mountingLocation) : 'Nicht angegeben',
    shading: shading ? getShadingLabel(shading) : 'Nicht angegeben',
    ecoImportance: answers[12] ? getEcoImportanceLabel(answers[12]) : 'Nicht angegeben',
  };
  
  return {
    success: true,
    isRecommended,
    recommendationReason,
    rankings,
    assumptions,
    quizSummary,
    filteredOutCount,
  };
}

// === LABEL HELPERS ===

function getOrientationLabel(orientation: Orientation): string {
  const labels: Record<Orientation, string> = {
    'sueden': 'Süden',
    'suedost': 'Südost',
    'suedwest': 'Südwest',
    'westen': 'Westen',
    'osten': 'Osten',
    'norden': 'Norden',
    'weiss-nicht': 'Unbekannt',
  };
  return labels[orientation];
}

function getHouseholdLabel(size: HouseholdSize): string {
  const labels: Record<HouseholdSize, string> = {
    '1': '1 Person',
    '2': '2 Personen',
    '3-4': '3-4 Personen',
    '5+': '5+ Personen',
  };
  return labels[size];
}

function getBudgetLabel(budget: string): string {
  const labels: Record<string, string> = {
    'bis-400': 'Bis 400 €',
    '400-700': '400-700 €',
    '700-1000': '700-1.000 €',
    '>1000': 'Über 1.000 €',
    'weiss-nicht': 'Kein Limit',
  };
  return labels[budget] ?? budget;
}

function getShadingLabel(shading: ShadingLevel): string {
  const labels: Record<ShadingLevel, string> = {
    'keine': 'Keine/kaum Verschattung',
    'etwas': 'Etwas Schatten',
    'mehrere-stunden': 'Mehrere Stunden Schatten',
    'ganzen-tag': 'Fast ganztags Schatten',
  };
  return labels[shading];
}

function getEcoImportanceLabel(ecoImportance: string): string {
  const labels: Record<string, string> = {
    'sehr-wichtig': 'Sehr wichtig',
    'wichtig': 'Wichtig',
    'nebensaechlich': 'Eher nebensächlich',
  };
  return labels[ecoImportance] ?? ecoImportance;
}
