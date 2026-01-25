export interface ScrapedSpecs {
  wattage?: number;
  storageCapacity?: number;
  dimensions?: string;
  weight?: number;
  warranty?: number;
  bifacial?: boolean;
  moduleEfficiency?: number;
  manufacturingOrigin?: string;
  moduleCount?: number;
  includesInverter?: boolean;
  mountingTypes?: string[];
  description?: string;
}

export interface EnrichmentData {
  mountingTypes: string[];
  manufacturingOrigin: string;
  bifacial: boolean;
  moduleEfficiency: number;
  moduleCount: number;
  includesInverter: boolean;
  description: string;
}

export interface ScrapedBKWProduct {
  id: string;
  name: string;
  brand: string;
  category?: string;
  imageUrl?: string;
  price?: number;
  priceCurrency?: string;
  priceSource?: string;
  priceLink?: string;
  specs: ScrapedSpecs;
  enrichment?: EnrichmentData;
  scrapedAt: string;
}

export interface ScrapedDataResult {
  products: ScrapedBKWProduct[];
  scrapedAt: string;
  sources: {
    productInfo: string;
    pricing: string;
  };
  totalProducts: number;
}
