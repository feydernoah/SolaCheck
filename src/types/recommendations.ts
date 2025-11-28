export interface BalconyPowerPlant {
  id: string;
  name: string;
  manufacturer: string;
  power: number; // in Watt
  price: number; // in Euro
  efficiency: number; // in Prozent
  warranty: number; // in Jahren
  image?: string;
  description?: string;
  pricePerWatt?: number; // calculated: price / power
}

export interface RecommendationResult {
  isRecommended: boolean;
  recommendation: string;
  reasoning: string;
  bestValue?: BalconyPowerPlant; // Beste Preis-Leistung
  cheapest?: BalconyPowerPlant; // Günstigstes
  mostPowerful?: BalconyPowerPlant; // Meiste Leistung
}

export type QuizAnswers = Record<number, string | string[]>;
