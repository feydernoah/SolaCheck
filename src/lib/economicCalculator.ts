/**
 * Economic Calculator for Balkonkraftwerk (BKW) recommendations
 * 
 * Implements calculations based on the documentation:
 * - Amortization time calculation
 * - Self-consumption vs feed-in
 * - Orientation and shading factors
 * - Household consumption estimates
 * - PVGIS-based location-specific yield (when available)
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
  SolarData,
} from '@/types/economic';
import { bkwProducts, getBudgetMaxValue } from '@/data/bkwProducts';
import { calculateProductEcological, generateEcologicalInsights } from '@/lib/ecologicCalculator';


// === CONSTANTS ===

/**
 * LEGAL AC FEED-IN LIMIT (Germany)
 *
 * In Germany, Balkonkraftwerke (plug-in PV systems) are legally limited to a maximum
 * AC feed-in power of 800 W via the inverter. This cap is defined by grid safety regulations
 * and applies to the inverter’s AC output, not the installed DC module power.
 *
 * All economic and ecological calculations must respect this cap for:
 * - maximum usable annual energy yield
 * - self-consumption calculations
 * - amortization time
 * - annual CO₂ savings and CO₂ payback period
 *
 * DO NOT expose this as a user input. It is a system constraint.
 */
export const LEGAL_AC_LIMIT_W = 800;

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
 * FALLBACK VALUE - used when PVGIS API is unavailable
 */
const BASE_YIELD_KWH_PER_WP = 0.95;

/**
 * Convert PVGIS yield (kWh/kWp) to per-Wp value
 * PVGIS returns kWh per kWp (1000 Wp), we need per Wp
 */
function pvgisToPerWp(pvgisYield: number): number {
  return pvgisYield / 1000;
}

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
 * 
 * When PVGIS data is available:
 * - Uses location-specific yield from PVGIS (already accounts for orientation/tilt)
 * - Still applies shading factor (PVGIS can't know about local obstructions)
 * - Still applies bifacial bonus
 * 
 * Fallback (no PVGIS):
 * - Uses hardcoded BASE_YIELD_KWH_PER_WP
 * - Applies orientation and shading factors
 */

/**
 * Calculate annual yield for a product, respecting the legal AC feed-in limit.
 *
 * The usable annual yield is capped by the inverter's AC output, limited to LEGAL_AC_LIMIT_W.
 * This models inverter clipping when DC/AC ratio > 1, as required by German law.
 *
 * @returns Usable annual yield in kWh (capped by AC limit)
 */
function calculateAnnualYield(
  product: BKWProduct,
  orientationFactor: number,
  shadingFactor: number,
  pvgisYieldKwhPerKwp?: number
): number {
  let rawYieldKwh: number;
  
  if (pvgisYieldKwhPerKwp !== undefined) {
    // PVGIS-based calculation
    // PVGIS yield already includes orientation/tilt losses
    // We only apply shading factor (user-reported local obstructions)
    rawYieldKwh = product.wattage * pvgisToPerWp(pvgisYieldKwhPerKwp) * shadingFactor;
  } else {
    // Fallback calculation with hardcoded values
    rawYieldKwh = product.wattage * BASE_YIELD_KWH_PER_WP;
    rawYieldKwh *= orientationFactor;
    rawYieldKwh *= shadingFactor;
  }
  // Add bifacial bonus (applies to both methods)
  if (product.bifacial) {
    rawYieldKwh *= (1 + BIFACIAL_GAIN);
  }

  // === AC LIMIT ENFORCEMENT ===
  // The usable AC output is limited by the inverter's AC power, capped at LEGAL_AC_LIMIT_W.
  // This models the legal 800 W AC cap for Balkonkraftwerke in Germany.
  // If the DC module power is higher, the system will clip excess production.
  //
  // Calculate the maximum possible annual AC output (kWh) at the legal cap:
  // maxACAnnualYield = LEGAL_AC_LIMIT_W * 365 * 24 / 1000
  // Ensure inverterACPower is always a number for Math.min
  const acPower = typeof product.inverterACPower === 'number' ? product.inverterACPower : LEGAL_AC_LIMIT_W;
  const effectiveACPower = Math.min(acPower, LEGAL_AC_LIMIT_W);
  const maxACAnnualYield = effectiveACPower * 365 * 24 / 1000;
  // The actual usable yield is the lower of the raw yield and the legal AC cap
  const usableYieldKwh = Math.min(rawYieldKwh, maxACAnnualYield);
  return Math.round(usableYieldKwh);
}

/**
 * Calculate economics for a single product
 */

/**
 * Calculate economics for a single product, using AC-limited annual yield.
 *
 * All calculations (self-consumption, feed-in, amortization, CO₂ savings) are based on
 * the usable annual yield, which is capped by the legal AC limit (see LEGAL_AC_LIMIT_W).
 */
export function calculateProductEconomics(
  product: BKWProduct,
  orientationFactor: number,
  shadingFactor: number,
  selfConsumptionRate: number,
  annualConsumption: number,
  pvgisYieldKwhPerKwp?: number
): ProductEconomics {
  // Calculate annual yield (already AC-limited)
  const annualYieldKwh = calculateAnnualYield(
    product,
    orientationFactor,
    shadingFactor,
    pvgisYieldKwhPerKwp
  );

  // All downstream calculations use the AC-limited yield
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
  if (budget) {
    const budgetNum = parseInt(budget, 10);
    if (!isNaN(budgetNum) && budgetNum > 0 && product.price <= budgetNum) {
      reasons.push(`Passt ins Budget (unter ${String(budgetNum)}€)`);
    }
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
 * 
 * @param answers - Quiz answers from user
 * @param solarData - Optional PVGIS solar data for location-specific yield
 */
export function calculateRecommendations(
  answers: QuizAnswers,
  solarData?: SolarData
): RecommendationResponse {
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
  
  // Get PVGIS yield if available
  const pvgisYieldKwhPerKwp = solarData?.annualYieldKwhPerKwp;
  const usedPvgisData = pvgisYieldKwhPerKwp !== undefined;
  
  // Log for dev purposes
  if (usedPvgisData) {
    console.log(`[Calculator] Using PVGIS yield: ${String(pvgisYieldKwhPerKwp)} kWh/kWp/year`);
  } else {
    console.log(`[Calculator] Using fallback yield: ${String(BASE_YIELD_KWH_PER_WP * 1000)} kWh/kWp/year`);
  }
  
  // Get budget max
  const maxBudget = getBudgetMaxValue(budget ?? '0');
  
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
    // === AC LIMIT ENFORCEMENT ===
    // For all calculations, use the effective AC power (min of inverterACPower and LEGAL_AC_LIMIT_W)
    // This ensures the legal cap is respected for all recommendations.
    // Ensure inverterACPower is always a number for Math.min
    const acPower = typeof product.inverterACPower === 'number' ? product.inverterACPower : LEGAL_AC_LIMIT_W;
    const effectiveACPower = Math.min(acPower, LEGAL_AC_LIMIT_W);
    // Clone product with effectiveACPower for calculation (do not mutate original)
    const productWithEffectiveAC = { ...product, inverterACPower: effectiveACPower };

    const selfConsumptionRate = getSelfConsumptionRate(
      householdSize,
      product.includesStorage,
      orientation
    );

    const economics = calculateProductEconomics(
      productWithEffectiveAC,
      orientationFactor,
      shadingFactor,
      selfConsumptionRate,
      annualConsumption,
      pvgisYieldKwhPerKwp
    );

    // Calculate ecological impact
    const ecological = calculateProductEcological(productWithEffectiveAC, economics);
    const { reasons: ecologicalReasons, warnings: ecologicalWarnings } = generateEcologicalInsights(productWithEffectiveAC, ecological);

    return {
      rank: 0, // Will be set after sorting
      product: productWithEffectiveAC,
      economics,
      ecological,
      score: economics.amortizationYears, // Lower is better
      matchReasons: generateMatchReasons(productWithEffectiveAC, economics, answers),
      warnings: generateWarnings(productWithEffectiveAC, economics, answers),
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
    pvgisYieldKwhPerKwp,
    usedPvgisData,
  };
  
  // Build quiz summary
  // Check if we have coordinates (new format stores only coordinates)
  let locationDisplay = 'Nicht angegeben';
  const addressAnswer = answers[2];
  if (addressAnswer) {
    try {
      const parsed = JSON.parse(addressAnswer) as { lat?: number; lon?: number; city?: string; postalCode?: string };
      
      // New format: just coordinates
      if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
        locationDisplay = 'Standort erfasst';
      } else if (parsed.city) {
        // Old format: full address (backwards compatibility)
        locationDisplay = parsed.postalCode 
          ? `${parsed.postalCode} ${parsed.city}`
          : parsed.city;
      }
    } catch {
      // Not JSON, use as-is
      locationDisplay = addressAnswer;
    }
  }
  
  const quizSummary = {
    location: locationDisplay,
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
  // Only numeric slider values are used; return as-is
  return budget;
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
