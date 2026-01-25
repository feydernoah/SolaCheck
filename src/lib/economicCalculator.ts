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

export { LEGAL_AC_LIMIT_W };

function pvgisToPerWp(pvgisYield: number): number {
  return pvgisYield / 1000;
}

export function getOrientationFactor(orientation: string | undefined): number {
  if (!orientation || !(orientation in ORIENTATION_FACTORS)) {
    return ORIENTATION_FACTORS['weiss-nicht'];
  }
  return ORIENTATION_FACTORS[orientation as Orientation];
}

export function getShadingFactor(shading: string | undefined): number {
  if (!shading || !(shading in SHADING_FACTORS)) {
    return SHADING_FACTORS.etwas;
  }
  return SHADING_FACTORS[shading as ShadingLevel];
}

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
  
  if (hasStorage) {
    rate += config.storageBonus;
  }
  
  if (orientation === 'westen' || orientation === 'osten') {
    rate += 0.05;
  } else if (orientation === 'nordwest' || orientation === 'nordost') {
    rate += 0.03;
  }
  
  return Math.min(rate, 0.75);
}

export function getAnnualConsumption(
  householdSize: string | undefined,
  userProvidedConsumption?: string
): number {
  if (userProvidedConsumption !== undefined && userProvidedConsumption !== '') {
    const parsed = parseInt(userProvidedConsumption, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  
  const size = (householdSize && householdSize in ANNUAL_CONSUMPTION_KWH)
    ? householdSize as HouseholdSize
    : '2';
  return ANNUAL_CONSUMPTION_KWH[size];
}

function calculateAnnualYield(
  product: BKWProduct,
  orientationFactor: number,
  shadingFactor: number,
  pvgisYieldKwhPerKwp?: number
): number {
  let rawYieldKwh: number;
  
  if (pvgisYieldKwhPerKwp !== undefined) {
    rawYieldKwh = product.wattage * pvgisToPerWp(pvgisYieldKwhPerKwp) * shadingFactor;
  } else {
    rawYieldKwh = product.wattage * BASE_YIELD_KWH_PER_WP;
    rawYieldKwh *= orientationFactor;
    rawYieldKwh *= shadingFactor;
  }
  
  if (product.bifacial) {
    rawYieldKwh *= (1 + BIFACIAL_GAIN);
  }

  const acPower = typeof product.inverterACPower === 'number' ? product.inverterACPower : LEGAL_AC_LIMIT_W;
  const effectiveACPower = Math.min(acPower, LEGAL_AC_LIMIT_W);
  
  let maxACAnnualYield: number;
  if (pvgisYieldKwhPerKwp !== undefined) {
    maxACAnnualYield = effectiveACPower * pvgisToPerWp(pvgisYieldKwhPerKwp) * shadingFactor;
  } else {
    maxACAnnualYield = effectiveACPower * BASE_YIELD_KWH_PER_WP * orientationFactor * shadingFactor;
  }

  if (product.includesStorage && product.storageCapacity && product.storageCapacity > 0) {
    const clippedEnergy = Math.max(0, rawYieldKwh - maxACAnnualYield);
    
    const maxAnnualStorageRecovery = product.storageCapacity * 365 * BATTERY_EFFICIENCY;
    
    const recoveredEnergy = Math.min(clippedEnergy, maxAnnualStorageRecovery);
    
    const usableYieldKwh = maxACAnnualYield + recoveredEnergy;
    return Math.round(usableYieldKwh);
  }

  const usableYieldKwh = Math.min(rawYieldKwh, maxACAnnualYield);
  return Math.round(usableYieldKwh);
}

export function calculateProductEconomics(
  product: BKWProduct,
  orientationFactor: number,
  shadingFactor: number,
  selfConsumptionRate: number,
  annualConsumption: number,
  pvgisYieldKwhPerKwp?: number
): ProductEconomics {
  const annualYieldKwh = calculateAnnualYield(
    product,
    orientationFactor,
    shadingFactor,
    pvgisYieldKwhPerKwp
  );

  const maxSelfConsumption = annualConsumption * selfConsumptionRate;
  const theoreticalSelfConsumption = annualYieldKwh * selfConsumptionRate;
  const selfConsumptionKwh = Math.min(theoreticalSelfConsumption, maxSelfConsumption, annualYieldKwh);

  const feedInKwh = Math.max(0, annualYieldKwh - selfConsumptionKwh);

  const savingsFromSelfConsumption = (selfConsumptionKwh * ELECTRICITY_PRICE_CT_PER_KWH) / 100;

  const feedInRevenueEuro = (feedInKwh * FEED_IN_TARIFF_CT_PER_KWH) / 100;

  const annualSavingsEuro = savingsFromSelfConsumption + feedInRevenueEuro;

  const amortizationYears = annualSavingsEuro > 0
    ? product.price / annualSavingsEuro
    : Infinity;

  const totalSavings10Years = (annualSavingsEuro * 10) - product.price;
  const totalSavings20Years = (annualSavingsEuro * 20) - product.price;

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
