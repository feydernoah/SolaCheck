/**
 * Ecological Calculator for Balkonkraftwerk (BKW) environmental impact assessment
 * 
 * Calculates the environmental footprint of BKW products considering:
 * - Manufacturing CO2 emissions (resource extraction, production, transportation)
 * - CO2 payback period (time until environmental gain exceeds production impact)
 * - Lifecycle environmental assessment
 */

import type {
  BKWProduct,
  ProductEcological,
  ProductEconomics,
} from '@/types/economic';

/**
 * CO2 emissions from German grid electricity (g/kWh)
 * Source: Umweltbundesamt 2023 - Strommix Deutschland (see confluence page for details)
 */
const GRID_CO2_GRAMS_PER_KWH = 380;

/**
 * Manufacturing CO2 emissions per Wp of PV module
 * Includes: silicon processing, cell production, module assembly
 */
const MODULE_MANUFACTURING_CO2_PER_WP = 800; // g CO2/Wp (average)

/**
 * Resource extraction CO2 per Wp (mining, purification, silicon production)
 * Approximately 60% of total manufacturing emissions
 */
const RESOURCE_EXTRACTION_RATIO = 0.60;

/**
 * Factory production CO2 per Wp (cell, module, assembly)
 * Approximately 35% of total manufacturing emissions
 */
const PRODUCTION_RATIO = 0.35;

/**
 * Transportation CO2 per Wp
 * Approximately 5% of total manufacturing emissions
 */
const TRANSPORT_RATIO = 0.05;

/**
 * CO2 emissions per ton-km for transportation
 * Average mix: ship (30%), truck (50%), air (20%)
 * Source: ICCT and DEFRA emission factors
 */
const TRANSPORT_CO2_PER_TONKM = 0.1; // kg CO2/ton-km (blended average)

/**
 * Inverter manufacturing CO2 per watt
 * Inverters are typically 5-8% of system weight but have high manufacturing intensity
 */
const INVERTER_MANUFACTURING_CO2_PER_W = 0.015; // g CO2/W

/**
 * Battery storage manufacturing CO2 per kWh
 * Source: Fraunhofer ISE 2023 - includes pack assembly
 */
const BATTERY_MANUFACTURING_CO2_PER_KWH = 61000; // g CO2/kWh (approx 61 kg CO2/kWh)

/**
 * Transport distance CO2 factor by manufacturing origin
 * Estimated average distances from manufacturing to Germany
 */
const TRANSPORT_DISTANCE_BY_ORIGIN: Record<string, number> = {
  germany: 500,      // km - within Germany
  europe: 1500,      // km - average European distance
  asia: 8000,        // km - ship from Asia (via Suez)
  china: 9000,       // km - primary manufacturing location
  unknown: 4000,     // km - conservative estimate
};

/**
 * System weight by component (for transport CO2calculation)
 * PV modules: ~20 kg per 400W, Inverter: ~2-3 kg, Mounting: ~5-10 kg
 */
const PRODUCT_WEIGHT_KG_PER_400W = 30; // kg per 400W system

/**
 * Expected product lifetime (conservative estimate)
 */
const PRODUCT_LIFETIME_YEARS = 25;

// === MANUFACTURING CARBON FOOTPRINT CALCULATION ===

/**
 * Calculate resource extraction CO2 for PV modules
 */
function calculateResourceExtractionCo2(wattage: number): number {
  // Convert from g to kg
  const moduleManufacturingCo2Kg = (wattage * MODULE_MANUFACTURING_CO2_PER_WP) / 1000;
  return moduleManufacturingCo2Kg * RESOURCE_EXTRACTION_RATIO;
}

/**
 * Calculate factory production CO2 for PV modules
 */
function calculateProductionCo2(wattage: number): number {
  const moduleManufacturingCo2Kg = (wattage * MODULE_MANUFACTURING_CO2_PER_WP) / 1000;
  return moduleManufacturingCo2Kg * PRODUCTION_RATIO;
}

/**
 * Calculate transportation CO2 based on origin and distance
 */
function calculateTransportCo2(
  wattage: number,
  includesInverter: boolean,
  includesStorage: boolean,
  storageCapacity: number | undefined,
  manufacturingOrigin: string
): number {
  // Calculate total weight in kg
  const systemWeightKg = (wattage / 400) * PRODUCT_WEIGHT_KG_PER_400W;
  const inverterWeightKg = includesInverter ? 2.5 : 0;
  const batteryWeightKg = includesStorage && storageCapacity ? storageCapacity * 30 : 0; // ~30 kg per kWh
  
  const totalWeightKg = systemWeightKg + inverterWeightKg + batteryWeightKg;
  const distanceKm = TRANSPORT_DISTANCE_BY_ORIGIN[manufacturingOrigin] ?? 4000;
  
  // Calculate ton-km and convert to CO2
  const tonKm = (totalWeightKg / 1000) * distanceKm;
  const transportCo2FromModules = (wattage * MODULE_MANUFACTURING_CO2_PER_WP) / 1000 * TRANSPORT_RATIO;
  const transportCo2FromDistance = (tonKm * TRANSPORT_CO2_PER_TONKM) / 1000; // Convert to kg
  
  return transportCo2FromModules + transportCo2FromDistance;
}

/**
 * Calculate inverter manufacturing CO2
 */
function calculateInverterCo2(wattage: number): number {
  return (wattage * INVERTER_MANUFACTURING_CO2_PER_W) / 1000; // Convert g to kg
}

/**
 * Calculate battery storage manufacturing CO2
 */
function calculateBatteryCo2(storageCapacity: number | undefined): number {
  if (!storageCapacity || storageCapacity === 0) return 0;
  return (storageCapacity * BATTERY_MANUFACTURING_CO2_PER_KWH) / 1000; // Convert g to kg
}

/**
 * Calculate total manufacturing CO2
 */
function calculateTotalManufacturingCo2(
  product: BKWProduct
): { total: number; breakdown: { resourceExtraction: number; production: number; transport: number } } {
  // Use product's manufacturingCo2Kg, estimate breakdown using ratios
  if (product.manufacturingCo2Kg > 0) {
    return {
      total: product.manufacturingCo2Kg,
      breakdown: {
        resourceExtraction: product.manufacturingCo2Kg * RESOURCE_EXTRACTION_RATIO,
        production: product.manufacturingCo2Kg * PRODUCTION_RATIO,
        transport: product.manufacturingCo2Kg * TRANSPORT_RATIO,
      },
    };
  }

  // Calculate manufacturing CO2
  const resourceExtractionCo2 = calculateResourceExtractionCo2(product.wattage);
  const productionCo2 = calculateProductionCo2(product.wattage);
  const transportCo2 = calculateTransportCo2(
    product.wattage,
    product.includesInverter,
    product.includesStorage,
    product.storageCapacity,
    product.manufacturingOrigin
  );
  const inverterCo2 = product.includesInverter ? calculateInverterCo2(product.wattage) : 0;
  const batteryCo2 = calculateBatteryCo2(product.storageCapacity);

  const total = resourceExtractionCo2 + productionCo2 + transportCo2 + inverterCo2 + batteryCo2;

  return {
    total,
    breakdown: {
      resourceExtraction: resourceExtractionCo2,
      production: productionCo2 + inverterCo2 + batteryCo2,
      transport: transportCo2,
    },
  };
}

/**
 * Calculate CO2 payback period (time until production offsets manufacturing emissions)
 */
function calculateCo2PaybackPeriod(
  manufacturingCo2Kg: number,
  annualYieldKwh: number
): number {
  // Annual CO2 savings from produced electricity (using grid CO2 intensity)
  const annualCo2SavingsKg = (annualYieldKwh * GRID_CO2_GRAMS_PER_KWH) / 1000;
  
  if (annualCo2SavingsKg <= 0) return Infinity;
  
  // Years until manufacturing CO2 is offset
  return manufacturingCo2Kg / annualCo2SavingsKg;
}

/**
 * Calculate lifecycle CO2 emissions
 */
function calculateLifecycleCo2(
  manufacturingCo2Kg: number,
  annualYieldKwh: number,
  lifetimeYears: number = PRODUCT_LIFETIME_YEARS
): number {
  // Manufacturing emissions (one-time)
  let lifecycleEmissions = manufacturingCo2Kg;
  
  // Operational CO2 (avoided through production)
  // Negative impact = CO2 saved
  const annualCo2SavingsKg = (annualYieldKwh * GRID_CO2_GRAMS_PER_KWH) / 1000;
  const totalOperationalSavingsKg = annualCo2SavingsKg * lifetimeYears;
  
  // Net lifecycle emissions = manufacturing CO2 minus operational savings
  // Negative value = net CO2 savings (environmental benefit)
  lifecycleEmissions = manufacturingCo2Kg - totalOperationalSavingsKg;
  
  return lifecycleEmissions;
}

/**
 * Calculate ecological score (0-100, higher is better)
 * Weighted composite of several factors:
 * - CO2 payback period (40% weight)
 * - Manufacturing intensity (30% weight)
 * - Recycling potential (20% weight)
 * - Hazardous components (10% weight)
 */
function calculateEcologicalScore(
  manufacturingCo2Kg: number,
  co2PaybackYears: number
): number {
  // Normalize scores to 0-100 range
  
  // CO2 payback score (lower is better)
  // Excellent: < 3 years (100), Good: 3-5 years (75), Fair: 5-10 years (50), Poor: > 10 years (0)
  let paybackScore = 0;
  if (co2PaybackYears < 3) paybackScore = 100;
  else if (co2PaybackYears < 5) paybackScore = 100 - ((co2PaybackYears - 3) / 2) * 25;
  else if (co2PaybackYears < 10) paybackScore = 75 - ((co2PaybackYears - 5) / 5) * 25;
  else paybackScore = Math.max(0, 50 - ((co2PaybackYears - 10) / 5) * 50);

  // Manufacturing intensity score (lower CO2 is better)
  // Normalize to 0-100 based on typical range (50-150 kg CO2)
  const manufacturingScore = Math.max(0, Math.min(100, ((150 - manufacturingCo2Kg) / 100) * 100));

  // New weighted score using only payback and manufacturing intensity
  // Weights: payback 60%, manufacturing intensity 40%
  const ecologicalScore = Math.round(paybackScore * 0.6 + manufacturingScore * 0.4);

  return ecologicalScore;
}

/**
 * Helper: German label for manufacturing origin
 */
function getManufacturingOriginLabel(origin: string): string {
  switch (origin) {
    case 'germany':
      return 'Deutschland';
    case 'europe':
      return 'Europa';
    case 'china':
      return 'China';
    case 'asia':
      return 'Asien';
    default:
      return 'Unbekannt';
  }
}

/**
 * Generate ecological match reasons based on environmental impact
 */
function generateEcologicalReasons(
  product: BKWProduct,
  ecological: ProductEcological,
  co2PaybackYears: number
): string[] {
  const reasons: string[] = [];

  // CO2 payback period
  if (co2PaybackYears < 1) {
    reasons.push(`Amortisiert die CO₂-Emissionen der Herstellung in unter 1 Jahr – hervorragende Umweltbilanz`);
  } else if (co2PaybackYears < 5) {
    reasons.push(`Gute CO₂-Amortisationszeit von ca. ${co2PaybackYears.toFixed(1)} Jahren`);
  }

  // Manufacturing origin
  if (product.manufacturingOrigin === 'germany' || product.manufacturingOrigin === 'europe') {
    reasons.push(`Hergestellt in ${getManufacturingOriginLabel(product.manufacturingOrigin)} – geringere Transportemissionen`);
  }

  // Low manufacturing emissions
  if (ecological.manufacturingCo2Kg < 80) {
    reasons.push(`Niedrige CO₂-Emissionen in der Herstellung: (~${Math.round(ecological.manufacturingCo2Kg).toString()} kg)`);
  }
  // Recycling and hazardous component details are not tracked in this version

  // Bifacial bonus (better lifetime yield = faster payback)
  if (product.bifacial) {
    reasons.push(`Bifaziale Module erhöhen die CO₂-Einsparungen über die Lebensdauer um ca. 8%`);
  }

  // Storage bonus (increased self-consumption = more effective)
  if (product.includesStorage) {
    reasons.push(`Integrierter Speicher erhöht den Eigenverbrauch und verbessert die Dekarbonisierung`);
  }

  return reasons;
}

/**
 * Generate ecological warnings
 */
function generateEcologicalWarnings(
  product: BKWProduct,
  ecological: ProductEcological,
  co2PaybackYears: number
): string[] {
  const warnings: string[] = [];

  // Slow payback period
  if (co2PaybackYears > 2) {
    warnings.push(`Lange CO₂-Amortisationszeit (${Math.round(co2PaybackYears).toString()} Jahre) – Standort und Nutzungsverhalten prüfen`);
  }

  // High manufacturing emissions
  if (ecological.manufacturingCo2Kg > 95) {
    warnings.push(`Hohe CO₂-Emissionen in der Herstellung: (${Math.round(ecological.manufacturingCo2Kg).toString()} kg CO₂)`);
  }

  // Long transport distance
  if (product.manufacturingOrigin === 'china' || product.manufacturingOrigin === 'asia') {
    warnings.push(`Herstellung in ${getManufacturingOriginLabel(product.manufacturingOrigin)} erhöht Transportemissionen`);
  }

  // Low warranty (shorter lifetime = worse environmental case)
  if (product.warrantyYears < 10) {
    warnings.push(`Kurze Garantie (${product.warrantyYears.toString()} Jahre) – potentiell geringere Lebensdauer.`);
  }

  return warnings;
}

// === PUBLIC API ===

/**
 * Calculate complete ecological impact for a BKW product
 */
export function calculateProductEcological(
  product: BKWProduct,
  economics: ProductEconomics
): ProductEcological {
  // Calculate manufacturing CO2 breakdown
  const manufacturingCo2Data = calculateTotalManufacturingCo2(product);
  const manufacturingCo2Kg = manufacturingCo2Data.total;

  // Calculate CO2 payback period
  const co2PaybackYears = calculateCo2PaybackPeriod(
    manufacturingCo2Kg,
    economics.annualYieldKwh
  );

  // Calculate lifecycle CO2 (operational savings minus manufacturing)
  const lifecycleEmissionsKg = calculateLifecycleCo2(
    manufacturingCo2Kg,
    economics.annualYieldKwh,
    PRODUCT_LIFETIME_YEARS
  );

  // Calculate ecological score
  const ecologicalScore = calculateEcologicalScore(
    manufacturingCo2Kg,
    co2PaybackYears
  );

  return {
    manufacturingCo2Kg: Math.round(manufacturingCo2Kg * 100) / 100,
    resourceExtractionCo2Kg: Math.round(manufacturingCo2Data.breakdown.resourceExtraction * 100) / 100,
    productionCo2Kg: Math.round(manufacturingCo2Data.breakdown.production * 100) / 100,
    transportCo2Kg: Math.round(manufacturingCo2Data.breakdown.transport * 100) / 100,
    paybackPeriodYears: Math.round(co2PaybackYears * 10) / 10,
    lifecycleEmissionsKg: Math.round(lifecycleEmissionsKg * 100) / 100,
    ecologicalScore,
  };
}

/**
 * Generate ecological insights for recommendation reasons/warnings
 */
export function generateEcologicalInsights(
  product: BKWProduct,
  ecological: ProductEcological,
): { reasons: string[]; warnings: string[] } {
  const reasons = generateEcologicalReasons(
    product,
    ecological,
    ecological.paybackPeriodYears
  );
  const warnings = generateEcologicalWarnings(
    product,
    ecological,
    ecological.paybackPeriodYears
  );

  return { reasons, warnings };
}

/**
 * Generate comprehensive ecological summary for user understanding
 */
export function generateEcologicalSummary(
  product: BKWProduct,
  ecological: ProductEcological,
  economics: ProductEconomics
): string {
  const paybackText =
    ecological.paybackPeriodYears < 5
      ? `amortisiert die CO₂-Emissionen der Herstellung in nur ${ecological.paybackPeriodYears.toFixed(1)} Jahren`
      : `amortisiert die CO₂-Emissionen der Herstellung in ${ecological.paybackPeriodYears.toFixed(1)} Jahren`;

  const lifecycleText =
    ecological.lifecycleEmissionsKg < 10
      ? `Mit einer Lebenszyklus-CO₂-Bilanz von nur ${ecological.lifecycleEmissionsKg.toFixed(0)} kg hat dieses Produkt hervorragende Umweltwerte`
      : `Über seine ${PRODUCT_LIFETIME_YEARS.toString()}-jährige Lebensdauer kompensiert es die Herstellungs-Emissionen mehrfach`;

  return (
    `${product.name} ${paybackText}. ` +
    `Die Herstellung verursacht ${ecological.manufacturingCo2Kg.toFixed(1)} kg CO₂, ` +
    `während die jährliche Erzeugung ca. ${Math.round((economics.annualYieldKwh * GRID_CO2_GRAMS_PER_KWH) / 1000).toString()} kg CO₂ pro Jahr einspart. ` +
    `${lifecycleText}. `
  );
}
