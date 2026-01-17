/**
 * Economic Calculator for Balkonkraftwerk (BKW) Products
 * 
 * Pure economic calculations:
 * - Annual yield calculation (with AC limit enforcement)
 * - Self-consumption and feed-in calculations
 * - Amortization time calculation
 * - Savings calculations
 * 
 * This module contains only calculation logic - no orchestration or ranking.
 * See recommendationEngine.ts for the full recommendation pipeline.
 */

import type {
  BKWProduct,
  ProductEconomics,
  Orientation,
  ShadingLevel,
  HouseholdSize,
} from '@/types/economic';
import {
  LEGAL_AC_LIMIT_W,
  ELECTRICITY_PRICE_CT_PER_KWH,
  FEED_IN_TARIFF_CT_PER_KWH,
  CO2_GRAMS_PER_KWH,
  BASE_YIELD_KWH_PER_WP,
  BIFACIAL_GAIN,
  BATTERY_EFFICIENCY,
  ORIENTATION_FACTORS,
  SHADING_FACTORS,
  SELF_CONSUMPTION_BY_HOUSEHOLD,
  ANNUAL_CONSUMPTION_KWH,
} from '@/lib/constants';

// Re-export the legal AC limit for external use
export { LEGAL_AC_LIMIT_W };

// === HELPER FUNCTIONS ===

/**
 * Convert PVGIS yield (kWh/kWp) to per-Wp value
 * PVGIS returns kWh per kWp (1000 Wp), we need per Wp
 */
function pvgisToPerWp(pvgisYield: number): number {
  return pvgisYield / 1000;
}

/**
 * Get orientation factor from quiz answer
 */
export function getOrientationFactor(orientation: string | undefined): number {
  if (!orientation || !(orientation in ORIENTATION_FACTORS)) {
    return ORIENTATION_FACTORS['weiss-nicht'];
  }
  return ORIENTATION_FACTORS[orientation as Orientation];
}

/**
 * Get shading factor from quiz answer
 */
export function getShadingFactor(shading: string | undefined): number {
  if (!shading || !(shading in SHADING_FACTORS)) {
    return SHADING_FACTORS.etwas; // Default to some shading
  }
  return SHADING_FACTORS[shading as ShadingLevel];
}

/**
 * Get self-consumption rate based on household and storage
 */
export function getSelfConsumptionRate(
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
  // as per documentation notes - these orientations align with typical usage patterns
  if (orientation === 'westen' || orientation === 'osten') {
    rate += 0.05; // +5% for better alignment with usage patterns
  } else if (orientation === 'nordwest' || orientation === 'nordost') {
    rate += 0.03; // +3% for partial alignment (has some east/west component)
  }
  
  // Cap at 75% - very high self-consumption is unrealistic
  return Math.min(rate, 0.75);
}

/**
 * Get estimated annual household consumption
 * If user provides their own consumption value, use it; otherwise estimate from household size
 */
export function getAnnualConsumption(
  householdSize: string | undefined,
  userProvidedConsumption?: string | undefined
): number {
  // If user provided their consumption, use it
  if (userProvidedConsumption) {
    const parsed = parseInt(userProvidedConsumption, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  
  // Fall back to household size estimate
  const size = (householdSize && householdSize in ANNUAL_CONSUMPTION_KWH)
    ? householdSize as HouseholdSize
    : '2';
  return ANNUAL_CONSUMPTION_KWH[size];
}

// === YIELD CALCULATION ===

/**
 * Calculate annual yield for a product, respecting the legal AC feed-in limit.
 *
 * For systems WITHOUT battery:
 * - The usable annual yield is capped by the inverter's AC output (max 800W)
 * - Excess DC power during peak sun is "clipped" and lost
 *
 * For systems WITH battery:
 * - The battery stores excess DC power before it reaches the inverter
 * - This energy is discharged later through the inverter at ≤800W
 * - Battery round-trip efficiency losses apply (~10%)
 * - Result: Much more of the panel's production is usable
 *
 * When PVGIS data is available:
 * - Uses location-specific yield from PVGIS (already accounts for orientation/tilt)
 * - Still applies shading factor (PVGIS can't know about local obstructions)
 * - Still applies bifacial bonus
 *
 * @returns Usable annual yield in kWh
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

  // === AC LIMIT CALCULATION (applies to all systems) ===
  // The usable AC output is limited by the inverter's AC power, capped at LEGAL_AC_LIMIT_W.
  const acPower = typeof product.inverterACPower === 'number' ? product.inverterACPower : LEGAL_AC_LIMIT_W;
  const effectiveACPower = Math.min(acPower, LEGAL_AC_LIMIT_W);
  
  // Calculate max AC yield (what can pass through the inverter without clipping)
  let maxACAnnualYield: number;
  if (pvgisYieldKwhPerKwp !== undefined) {
    maxACAnnualYield = effectiveACPower * pvgisToPerWp(pvgisYieldKwhPerKwp) * shadingFactor;
  } else {
    maxACAnnualYield = effectiveACPower * BASE_YIELD_KWH_PER_WP * orientationFactor * shadingFactor;
  }

  // === BATTERY SYSTEMS: RECOVER CLIPPED ENERGY ===
  // Systems with battery storage can capture excess DC power that would be clipped.
  // The battery charges during peak sun and discharges later through the inverter.
  // 
  // Key constraint: Battery can only cycle once per day.
  // Max annual storage recovery = storageCapacity × 365 × battery efficiency
  if (product.includesStorage && product.storageCapacity && product.storageCapacity > 0) {
    // Calculate clipped energy (what would be lost without battery)
    const clippedEnergy = Math.max(0, rawYieldKwh - maxACAnnualYield);
    
    // Battery can recover up to its daily capacity × 365 days
    // This models one charge/discharge cycle per day
    const maxAnnualStorageRecovery = product.storageCapacity * 365 * BATTERY_EFFICIENCY;
    
    // Actual recovered energy is the lesser of clipped energy and battery capacity
    const recoveredEnergy = Math.min(clippedEnergy, maxAnnualStorageRecovery);
    
    // Total yield = AC-passed energy + recovered stored energy
    const usableYieldKwh = maxACAnnualYield + recoveredEnergy;
    return Math.round(usableYieldKwh);
  }

  // === NON-BATTERY SYSTEMS ===
  // The actual usable yield is the lower of the raw DC yield and the AC-limited yield
  const usableYieldKwh = Math.min(rawYieldKwh, maxACAnnualYield);
  return Math.round(usableYieldKwh);
}

// === MAIN ECONOMIC CALCULATION ===

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
