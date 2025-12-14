/**
 * Types for economic calculations and BKW product recommendations
 */

// Coordinates for location-based calculations
export interface Coordinates {
  lat: number;
  lon: number;
}

// Solar radiation data from PVGIS API
export interface SolarData {
  annualYieldKwhPerKwp: number; // kWh/kWp/year - main yield metric
  averageDailyYieldKwh: number;
  averageMonthlyYieldKwh: number;
  yearlyIrradiationKwhPerM2: number;
  monthlyYields: number[]; // 12 values for Jan-Dec
  totalLossPercent: number;
  location: {
    lat: number;
    lon: number;
    elevation: number;
  };
  systemParams: {
    angle: number; // Tilt angle used
    aspect: number; // Azimuth used
    peakPower: number;
    loss: number;
  };
}

// Quiz answer types (mirrors the quiz structure)
export interface QuizAnswers {
  1?: string; // Age
  2?: string; // Location (PLZ/City)
  3?: string; // Household size
  4?: string; // Housing type
  5?: string; // Apartment size
  6?: string; // Mounting location
  7?: string; // Orientation
  8?: string; // Balcony size
  9?: string; // Shading
  10?: string[]; // Appliances (multiselect)
  11?: string; // Budget
  12?: string; // CO2 importance
  // Location coordinates for PVGIS API
  coordinates?: Coordinates;
}

// Manufacturing origin/location
export type ManufacturingOrigin = 
  | 'germany'
  | 'europe'
  | 'asia'
  | 'china'
  | 'unknown';

// BKW Product definition
export interface BKWProduct {
  id: string;
  name: string;
  brand: string;
  wattage: number; // Peak wattage in Wp
  moduleCount: number;
  price: number; // Total price in €
  includesInverter: boolean;
  inverterBrand?: string;
  /**
   * Inverter AC output power in watts (W). This is the maximum AC power the inverter can feed into the grid.
   * For legal compliance, this should be 800 for most German BKWs, but some products may have lower values.
   */
  inverterACPower?: number;
  includesStorage: boolean;
  storageCapacity?: number; // kWh
  mountingTypes: MountingType[];
  bifacial: boolean;
  moduleEfficiency: number; // Percentage (e.g., 21.5)
  warrantyYears: number;
  description: string;
  // Ecological metrics
  manufacturingOrigin: ManufacturingOrigin; // Where the product is manufactured
  manufacturingCo2Kg: number; // Total CO2 emissions for manufacturing in kg
  // Note: manufacturingCo2Breakdown, recyclingPotential and hazardousComponents removed
}

// Mounting types matching quiz options
export type MountingType = 
  | 'balkonbruestung'
  | 'balkonboden'
  | 'hauswand'
  | 'flachdach'
  | 'weiss-nicht';

// Orientation types from quiz
export type Orientation =
  | 'sueden'
  | 'suedost'
  | 'suedwest'
  | 'westen'
  | 'osten'
  | 'norden'
  | 'weiss-nicht';

// Shading levels from quiz
export type ShadingLevel =
  | 'keine'
  | 'etwas'
  | 'mehrere-stunden'
  | 'ganzen-tag';

// Household size from quiz
export type HouseholdSize = '1' | '2' | '3-4' | '5+';

// Budget ranges from quiz
export type BudgetRange = 
  string; // Only numeric string values are valid now

// Economic calculation result for a product
export interface ProductEconomics {
  annualYieldKwh: number; // Total annual production in kWh
  selfConsumptionKwh: number; // Self-consumed energy in kWh
  feedInKwh: number; // Energy fed into grid in kWh
  annualSavingsEuro: number; // Total annual savings in €
  savingsFromSelfConsumption: number; // Savings from self-consumption
  feedInRevenueEuro: number; // Revenue from feed-in tariff
  amortizationYears: number; // Years until investment is recovered
  totalSavings10Years: number; // Total savings over 10 years
  totalSavings20Years: number; // Total savings over 20 years
  co2SavingsKgPerYear: number; // CO2 saved per year in kg
}

// Ecological impact calculation for a product
export interface ProductEcological {
  manufacturingCo2Kg: number; // Total CO2 emissions for manufacturing
  resourceExtractionCo2Kg: number; // CO2 from mining/resource extraction
  productionCo2Kg: number; // CO2 from factory production
  transportCo2Kg: number; // CO2 from transportation to market
  paybackPeriodYears: number; // Years until CO2 from manufacturing is offset by savings
  lifecycleEmissionsKg: number; // Total CO2 emissions over 25-year lifecycle
  // Note: recyclablePercentage and hazardousComponents removed
  ecologicalScore: number; // Composite score (0-100, higher is better)
}

// Calculation assumptions/factors
export interface CalculationAssumptions {
  electricityPriceCentPerKwh: number; // Current electricity price
  feedInTariffCentPerKwh: number; // Feed-in tariff
  orientationFactor: number; // Yield factor based on orientation (only used for fallback)
  shadingFactor: number; // Yield reduction due to shading
  selfConsumptionRate: number; // Percentage of self-consumption
  estimatedAnnualConsumptionKwh: number; // Estimated household consumption
  co2PerKwhGrams: number; // CO2 emissions per kWh from grid
  // PVGIS-based yield data
  pvgisYieldKwhPerKwp?: number; // Yield from PVGIS API (if available)
  usedPvgisData: boolean; // Whether PVGIS data was used or fallback
}

// Product ranking result
export interface ProductRanking {
  rank: number;
  product: BKWProduct;
  economics: ProductEconomics;
  ecological: ProductEcological;
  score: number; // Composite score (lower amortization = better)
  matchReasons: string[];
  warnings: string[];
  ecologicalReasons?: string[]; // Reasons based on ecological impact
  ecologicalWarnings?: string[]; // Warnings from ecological analysis
}

// Full recommendation response
export interface RecommendationResponse {
  success: boolean;
  isRecommended: boolean;
  recommendationReason: string;
  rankings: ProductRanking[];
  assumptions: CalculationAssumptions;
  quizSummary: {
    location: string;
    orientation: string;
    householdSize: string;
    budget: string;
    mountingLocation: string;
    shading: string;
    ecoImportance: string; // User's environmental importance rating
  };
  filteredOutCount: number; // Number of products filtered due to budget
  error?: string;
}

// Request body for the API
export interface RecommendationRequest {
  answers: QuizAnswers;
}
