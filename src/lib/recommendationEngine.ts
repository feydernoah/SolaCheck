/**
 * Recommendation Engine for Balkonkraftwerk (BKW) Products
 * 
 * Orchestrates the recommendation process by:
 * - Loading and filtering products
 * - Calculating economic metrics for each product
 * - Calculating ecological metrics for each product
 * - Scoring and ranking products
 * - Generating match reasons and warnings
 * - Building the final recommendation response
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
import { loadScrapedProducts } from '@/data/loadProducts';
import {
  calculateProductEconomics,
  getOrientationFactor,
  getShadingFactor,
  getSelfConsumptionRate,
  getAnnualConsumption,
} from '@/lib/economicCalculator';
import { calculateProductEcological, generateEcologicalInsights } from '@/lib/ecologicCalculator';
import {
  CO2_GRAMS_PER_KWH,
  BASE_YIELD_KWH_PER_WP,
  ELECTRICITY_PRICE_CT_PER_KWH,
  FEED_IN_TARIFF_CT_PER_KWH,
  ORIENTATION_LABELS,
  HOUSEHOLD_LABELS,
  SHADING_LABELS,
  MOUNTING_LABELS,
  ECO_IMPORTANCE_LABELS,
} from '@/lib/constants';

// === MATCH REASONS & WARNINGS ===

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
    reasons.push(`Passend für ${MOUNTING_LABELS[mountingType] ?? mountingType}`);
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
  answers: QuizAnswers,
  annualConsumption: number
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
  } else if (orientation === 'nordost' || orientation === 'nordwest') {
    warnings.push('Nordost/Nordwest-Ausrichtung reduziert den Ertrag spürbar');
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
  
  // Low consumption warning (500-1500 kWh range)
  if (annualConsumption < 1500 && annualConsumption >= 500) {
    const selfConsumptionPercent = Math.round((economics.selfConsumptionKwh / economics.annualYieldKwh) * 100);
    warnings.push(`Niedriger Verbrauch (${String(annualConsumption)} kWh/Jahr) - nur ${String(selfConsumptionPercent)}% Eigenverbrauch möglich`);
  }
  
  return warnings;
}

/**
 * Determine if a BKW is recommended and provide reasoning
 */
function determineRecommendation(
  rankings: ProductRanking[],
  orientationFactor: number,
  shadingFactor: number,
  annualConsumption: number
): { isRecommended: boolean; reason: string } {
  // No products available in budget
  if (rankings.length === 0) {
    return {
      isRecommended: false,
      reason: 'Leider haben wir in deinem Budget kein passendes Balkonkraftwerk gefunden. Erwäge ein höheres Budget für mehr Optionen.',
    };
  }

  // Very low consumption - BKW doesn't make economic sense
  // A typical BKW produces 600-800 kWh/year, if consumption is below 500 kWh,
  // almost all energy would be fed in at low tariffs
  if (annualConsumption < 500) {
    return {
      isRecommended: false,
      reason: `Mit einem Jahresverbrauch von nur ${String(annualConsumption)} kWh ist ein Balkonkraftwerk wirtschaftlich nicht sinnvoll. Du würdest fast den gesamten erzeugten Strom ins Netz einspeisen und nur 8,2 ct/kWh erhalten – deutlich weniger als der Kaufpreis von ~40 ct/kWh. Ein BKW lohnt sich erst ab ca. 1.000 kWh Jahresverbrauch.`,
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
  
  // Check self-consumption ratio - if less than 20% of yield is self-consumed, warn
  const selfConsumptionRatio = bestProduct.economics.selfConsumptionKwh / bestProduct.economics.annualYieldKwh;
  if (selfConsumptionRatio < 0.20) {
    return {
      isRecommended: false,
      reason: `Bei deinem Verbrauchsprofil würdest du nur etwa ${String(Math.round(selfConsumptionRatio * 100))}% des erzeugten Stroms selbst nutzen können. Der Rest würde zu niedrigen Tarifen eingespeist. Ein Balkonkraftwerk lohnt sich wirtschaftlich erst bei höherem Eigenverbrauch.`,
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

// === MAIN RECOMMENDATION FUNCTION ===

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
  const userProvidedConsumption = answers[13]; // User's actual yearly consumption
  
  // Calculate factors
  const orientationFactor = getOrientationFactor(orientation);
  const shadingFactor = getShadingFactor(shading);
  const annualConsumption = getAnnualConsumption(householdSize, userProvidedConsumption);
  
  // Get PVGIS yield if available
  const pvgisYieldKwhPerKwp = solarData?.annualYieldKwhPerKwp;
  const usedPvgisData = pvgisYieldKwhPerKwp !== undefined;
  
  // Log for dev purposes
  if (usedPvgisData) {
    console.log(`[RecommendationEngine] Using PVGIS yield: ${String(pvgisYieldKwhPerKwp)} kWh/kWp/year`);
  } else {
    console.log(`[RecommendationEngine] Using fallback yield: ${String(BASE_YIELD_KWH_PER_WP * 1000)} kWh/kWp/year`);
  }
  
  // Get budget max
  const maxBudget = getBudgetMaxValue(budget ?? '0');
  
  // Load products from scraped data, falling back to static data
  let allProducts: BKWProduct[];
  try {
    allProducts = loadScrapedProducts();
    console.log(`[RecommendationEngine] Loaded ${String(allProducts.length)} products from scraped data`);
  } catch (error) {
    console.log(`[RecommendationEngine] Failed to load scraped data, using static products`, error);
    allProducts = bkwProducts;
  }
  
  // Filter products by budget (strict) and mounting type
  let eligibleProducts = allProducts.filter(product => product.price <= maxBudget);
  const filteredOutCount = allProducts.length - eligibleProducts.length;
  
  // Filter by mounting type if specified
  if (mountingLocation && mountingLocation !== 'weiss-nicht') {
    eligibleProducts = eligibleProducts.filter(product =>
      product.mountingTypes.includes(mountingLocation)
    );
  }
  
  // Calculate economics and ecological impact for each product
  // Note: AC limit enforcement is handled internally by calculateProductEconomics/calculateAnnualYield
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
      annualConsumption,
      pvgisYieldKwhPerKwp
    );

    // Calculate ecological impact
    const ecological = calculateProductEcological(product, economics);
    const { reasons: ecologicalReasons, warnings: ecologicalWarnings } = generateEcologicalInsights(product, ecological);

    return {
      rank: 0, // Will be set after sorting
      product,
      economics,
      ecological,
      score: ecological.paybackPeriodYears, // Lower CO₂ payback is better (app focus on sustainability)
      matchReasons: generateMatchReasons(product, economics, answers),
      warnings: generateWarnings(product, economics, answers, annualConsumption),
      ecologicalReasons,
      ecologicalWarnings,
    };
  });
  
  // Sort by CO₂ payback period (shortest first) - prioritizing environmental impact
  rankings.sort((a, b) => a.score - b.score);
  
  // Assign ranks
  rankings.forEach((ranking, index) => {
    ranking.rank = index + 1;
  });
  
  // Determine if we should recommend a BKW
  const { isRecommended, reason: recommendationReason } = determineRecommendation(
    rankings,
    orientationFactor,
    shadingFactor,
    annualConsumption
  );
  
  // Build assumptions object
  const usedUserProvidedConsumption = !!(userProvidedConsumption && typeof userProvidedConsumption === 'string' && parseInt(userProvidedConsumption, 10) > 0);
  const assumptions: CalculationAssumptions = {
    electricityPriceCentPerKwh: ELECTRICITY_PRICE_CT_PER_KWH,
    feedInTariffCentPerKwh: FEED_IN_TARIFF_CT_PER_KWH,
    orientationFactor,
    shadingFactor,
    selfConsumptionRate: getSelfConsumptionRate(householdSize, false, orientation),
    estimatedAnnualConsumptionKwh: annualConsumption,
    usedUserProvidedConsumption,
    co2PerKwhGrams: CO2_GRAMS_PER_KWH,
    pvgisYieldKwhPerKwp,
    usedPvgisData,
  };
  
  // Build quiz summary
  const quizSummary = buildQuizSummary(answers, orientation, householdSize, budget, mountingLocation, shading);
  
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

/**
 * Build the quiz summary for the response
 */
function buildQuizSummary(
  answers: QuizAnswers,
  orientation: Orientation | undefined,
  householdSize: HouseholdSize | undefined,
  budget: string | undefined,
  mountingLocation: MountingType | undefined,
  shading: ShadingLevel | undefined
): RecommendationResponse['quizSummary'] {
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
  
  return {
    location: locationDisplay,
    orientation: orientation ? ORIENTATION_LABELS[orientation] : 'Nicht angegeben',
    householdSize: householdSize ? HOUSEHOLD_LABELS[householdSize] : 'Nicht angegeben',
    budget: budget ?? 'Nicht angegeben',
    mountingLocation: mountingLocation ? (MOUNTING_LABELS[mountingLocation] ?? 'Nicht angegeben') : 'Nicht angegeben',
    shading: shading ? SHADING_LABELS[shading] : 'Nicht angegeben',
    ecoImportance: answers[12] ? (ECO_IMPORTANCE_LABELS[answers[12]] ?? answers[12]) : 'Nicht angegeben',
  };
}
