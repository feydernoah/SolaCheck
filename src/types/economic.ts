export interface Coordinates {
  lat: number;
  lon: number;
}

export interface SolarData {
  annualYieldKwhPerKwp: number;
  averageDailyYieldKwh: number;
  averageMonthlyYieldKwh: number;
  yearlyIrradiationKwhPerM2: number;
  monthlyYields: number[];
  totalLossPercent: number;
  location: {
    lat: number;
    lon: number;
    elevation: number;
  };
  systemParams: {
    angle: number;
    aspect: number;
    peakPower: number;
    loss: number;
  };
}

export interface QuizAnswers {
  1?: string;
  2?: string;
  3?: string;
  4?: string;
  5?: string;
  6?: string;
  7?: string;
  8?: string;
  9?: string[];
  10?: string;
  11?: string;
  12?: string;
  coordinates?: Coordinates;
}

export type ManufacturingOrigin = 
  | 'germany'
  | 'europe'
  | 'asia'
  | 'china'
  | 'unknown';

export interface BKWProduct {
  id: string;
  name: string;
  brand: string;
  wattage: number;
  moduleCount: number;
  price: number;
  includesInverter: boolean;
  inverterBrand?: string;
  inverterACPower?: number;
  includesStorage: boolean;
  storageCapacity?: number;
  mountingTypes: MountingType[];
  bifacial: boolean;
  moduleEfficiency: number;
  warrantyYears: number;
  description: string;
  manufacturingOrigin: ManufacturingOrigin;
  manufacturingCo2Kg: number;
  imageUrl?: string;
  priceSource?: string;
  priceLink?: string;
  category?: string;
}

export type MountingType = 
  | 'balkonbruestung'
  | 'balkonboden'
  | 'hauswand'
  | 'flachdach'
  | 'weiss-nicht';

export type Orientation =
  | 'sueden'
  | 'suedost'
  | 'suedwest'
  | 'westen'
  | 'osten'
  | 'norden'
  | 'nordost'
  | 'nordwest'
  | 'weiss-nicht';

export type ShadingLevel =
  | 'keine'
  | 'etwas'
  | 'mehrere-stunden'
  | 'ganzen-tag';

export type HouseholdSize = '1' | '2' | '3-4' | '5+';

export type BudgetRange = 
  string;

export interface ProductEconomics {
  annualYieldKwh: number;
  selfConsumptionKwh: number;
  feedInKwh: number;
  annualSavingsEuro: number;
  savingsFromSelfConsumption: number;
  feedInRevenueEuro: number;
  amortizationYears: number;
  totalSavings10Years: number;
  totalSavings20Years: number;
  co2SavingsKgPerYear: number;
}

export interface ProductEcological {
  manufacturingCo2Kg: number;
  resourceExtractionCo2Kg: number;
  productionCo2Kg: number;
  transportCo2Kg: number;
  paybackPeriodYears: number;
  lifecycleEmissionsKg: number;
  ecologicalScore: number;
}

export interface CalculationAssumptions {
  electricityPriceCentPerKwh: number;
  feedInTariffCentPerKwh: number;
  orientationFactor: number;
  shadingFactor: number;
  selfConsumptionRate: number;
  estimatedAnnualConsumptionKwh: number;
  usedUserProvidedConsumption: boolean;
  co2PerKwhGrams: number;
  pvgisYieldKwhPerKwp?: number;
  usedPvgisData: boolean;
}

export interface ProductRanking {
  rank: number;
  product: BKWProduct;
  economics: ProductEconomics;
  ecological: ProductEcological;
  score: number;
  matchReasons: string[];
  warnings: string[];
  ecologicalReasons?: string[];
  ecologicalWarnings?: string[];
}

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
    ecoImportance: string;
  };
  filteredOutCount: number;
  error?: string;
}

export interface RecommendationRequest {
  answers: QuizAnswers;
}
