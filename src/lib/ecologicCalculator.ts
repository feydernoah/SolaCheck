import type {
  BKWProduct,
  ProductEcological,
  ProductEconomics,
} from '@/types/economic';
import { CO2_GRAMS_PER_KWH } from '@/lib/constants';

const GRID_CO2_GRAMS_PER_KWH = CO2_GRAMS_PER_KWH;

const MODULE_MANUFACTURING_CO2_PER_WP = 800;

const RESOURCE_EXTRACTION_RATIO = 0.60;

const PRODUCTION_RATIO = 0.35;

const TRANSPORT_RATIO = 0.05;

const TRANSPORT_CO2_PER_TONKM = 0.1;

const INVERTER_MANUFACTURING_CO2_PER_W = 0.015;

const BATTERY_MANUFACTURING_CO2_PER_KWH = 61000;

const TRANSPORT_DISTANCE_BY_ORIGIN: Record<string, number> = {
  germany: 500,
  europe: 1500,
  asia: 8000,
  china: 9000,
  unknown: 4000,
};

const PRODUCT_WEIGHT_KG_PER_400W = 30;

const PRODUCT_LIFETIME_YEARS = 25;

function calculateResourceExtractionCo2(wattage: number): number {
  const moduleManufacturingCo2Kg = (wattage * MODULE_MANUFACTURING_CO2_PER_WP) / 1000;
  return moduleManufacturingCo2Kg * RESOURCE_EXTRACTION_RATIO;
}

function calculateProductionCo2(wattage: number): number {
  const moduleManufacturingCo2Kg = (wattage * MODULE_MANUFACTURING_CO2_PER_WP) / 1000;
  return moduleManufacturingCo2Kg * PRODUCTION_RATIO;
}

function calculateTransportCo2(
  wattage: number,
  includesInverter: boolean,
  includesStorage: boolean,
  storageCapacity: number | undefined,
  manufacturingOrigin: string
): number {
  const systemWeightKg = (wattage / 400) * PRODUCT_WEIGHT_KG_PER_400W;
  const inverterWeightKg = includesInverter ? 2.5 : 0;
  const batteryWeightKg = includesStorage && storageCapacity ? storageCapacity * 30 : 0;
  
  const totalWeightKg = systemWeightKg + inverterWeightKg + batteryWeightKg;
  const distanceKm = TRANSPORT_DISTANCE_BY_ORIGIN[manufacturingOrigin] ?? 4000;
  
  const tonKm = (totalWeightKg / 1000) * distanceKm;
  const transportCo2FromModules = (wattage * MODULE_MANUFACTURING_CO2_PER_WP) / 1000 * TRANSPORT_RATIO;
  const transportCo2FromDistance = (tonKm * TRANSPORT_CO2_PER_TONKM) / 1000;
  
  return transportCo2FromModules + transportCo2FromDistance;
}

function calculateInverterCo2(wattage: number): number {
  return (wattage * INVERTER_MANUFACTURING_CO2_PER_W) / 1000;
}

function calculateBatteryCo2(storageCapacity: number | undefined): number {
  if (!storageCapacity || storageCapacity === 0) return 0;
  return (storageCapacity * BATTERY_MANUFACTURING_CO2_PER_KWH) / 1000;
}

function calculateTotalManufacturingCo2(
  product: BKWProduct
): { total: number; breakdown: { resourceExtraction: number; production: number; transport: number } } {
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

function calculateCo2PaybackPeriod(
  manufacturingCo2Kg: number,
  annualCo2SavingsKg: number
): number {
  if (annualCo2SavingsKg <= 0) {
    return Infinity;
  }
  return manufacturingCo2Kg / annualCo2SavingsKg;
}

function calculateLifecycleCo2(
  manufacturingCo2Kg: number,
  annualCo2SavingsKg: number,
  lifetimeYears: number = PRODUCT_LIFETIME_YEARS
): number {
  let lifecycleEmissions = manufacturingCo2Kg;
  
  const totalOperationalSavingsKg = annualCo2SavingsKg * lifetimeYears;
  
  lifecycleEmissions = manufacturingCo2Kg - totalOperationalSavingsKg;
  return lifecycleEmissions;
}

function calculateEcologicalScore(
  manufacturingCo2Kg: number,
  co2PaybackYears: number
): number {
  let paybackScore = 0;
  if (co2PaybackYears < 3) paybackScore = 100;
  else if (co2PaybackYears < 5) paybackScore = 100 - ((co2PaybackYears - 3) / 2) * 25;
  else if (co2PaybackYears < 10) paybackScore = 75 - ((co2PaybackYears - 5) / 5) * 25;
  else paybackScore = Math.max(0, 50 - ((co2PaybackYears - 10) / 5) * 50);

  const manufacturingScore = Math.max(0, Math.min(100, ((150 - manufacturingCo2Kg) / 100) * 100));

  const ecologicalScore = Math.round(paybackScore * 0.6 + manufacturingScore * 0.4);

  return ecologicalScore;
}

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

function generateEcologicalReasons(
  product: BKWProduct,
  ecological: ProductEcological,
  co2PaybackYears: number
): string[] {
  const reasons: string[] = [];

  if (co2PaybackYears < 1) {
    reasons.push(`Amortisiert die CO₂-Emissionen der Herstellung in unter 1 Jahr – hervorragende Umweltbilanz`);
  } else if (co2PaybackYears < 5) {
    reasons.push(`Gute CO₂-Amortisationszeit von ca. ${co2PaybackYears.toFixed(1)} Jahren`);
  }

  if (product.manufacturingOrigin === 'germany' || product.manufacturingOrigin === 'europe') {
    reasons.push(`Hergestellt in ${getManufacturingOriginLabel(product.manufacturingOrigin)} – geringere Transportemissionen`);
  }

  if (ecological.manufacturingCo2Kg < 80) {
    reasons.push(`Niedrige CO₂-Emissionen in der Herstellung: (~${Math.round(ecological.manufacturingCo2Kg).toString()} kg)`);
  }

  if (product.bifacial) {
    reasons.push(`Bifaziale Module erhöhen die CO₂-Einsparungen über die Lebensdauer um ca. 8%`);
  }

  if (product.includesStorage) {
    reasons.push(`Integrierter Speicher erhöht den Eigenverbrauch und verbessert die Dekarbonisierung`);
  }

  return reasons;
}

function generateEcologicalWarnings(
  product: BKWProduct,
  ecological: ProductEcological,
  co2PaybackYears: number
): string[] {
  const warnings: string[] = [];

  if (co2PaybackYears > 2) {
    warnings.push(`Lange CO₂-Amortisationszeit (${Math.round(co2PaybackYears).toString()} Jahre) – Standort und Nutzungsverhalten prüfen`);
  }

  if (ecological.manufacturingCo2Kg > 95) {
    warnings.push(`Hohe CO₂-Emissionen in der Herstellung: (${Math.round(ecological.manufacturingCo2Kg).toString()} kg CO₂)`);
  }

  if (product.manufacturingOrigin === 'china' || product.manufacturingOrigin === 'asia') {
    warnings.push(`Herstellung in ${getManufacturingOriginLabel(product.manufacturingOrigin)} erhöht Transportemissionen`);
  }

  if (product.warrantyYears < 10) {
    warnings.push(`Kurze Garantie (${product.warrantyYears.toString()} Jahre) – potentiell geringere Lebensdauer.`);
  }

  return warnings;
}

export function calculateProductEcological(
  product: BKWProduct,
  economics: ProductEconomics
): ProductEcological {
  const manufacturingCo2Data = calculateTotalManufacturingCo2(product);
  const manufacturingCo2Kg = manufacturingCo2Data.total;

  const lifespan = product.warrantyYears;

  const co2PaybackYears = calculateCo2PaybackPeriod(
    manufacturingCo2Kg,
    economics.co2SavingsKgPerYear
  );

  const lifecycleEmissionsKg = calculateLifecycleCo2(
    manufacturingCo2Kg,
    economics.co2SavingsKgPerYear,
    lifespan
  );

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
