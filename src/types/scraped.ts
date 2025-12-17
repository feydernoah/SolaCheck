/**
 * Types for scraped BKW (Balkonkraftwerk) product data from FAZ Kaufkompass
 * with price data from SerpAPI Google Shopping
 */

export interface ScrapedSpecs {
  wattage?: number; // Maximale PV-Eingangsleistung in Watt
  storageCapacity?: number; // Interner Speicher in kWh
  dimensions?: string; // Abmessungen
  weight?: number; // Gewicht in kg
  warranty?: number; // Garantie in years
  // Enriched via Gemini AI
  bifacial?: boolean;
  moduleEfficiency?: number; // Percentage, e.g., 21.5
  manufacturingOrigin?: string; // "germany" | "europe" | "asia" | "china" | "unknown"
  moduleCount?: number;
  includesInverter?: boolean;
  mountingTypes?: string[]; // e.g., ["balkonbruestung", "balkonboden"]
  description?: string;
}

// Enrichment data from Gemini AI
export interface EnrichmentData {
  mountingTypes: string[]; // e.g., ["balkonbruestung", "balkonboden", "hauswand", "flachdach"]
  manufacturingOrigin: string; // "germany" | "europe" | "asia" | "china" | "unknown"
  bifacial: boolean;
  moduleEfficiency: number; // Percentage, e.g., 21.5
  moduleCount: number;
  includesInverter: boolean;
  description: string;
}

export interface ScrapedBKWProduct {
  id: string;
  name: string;
  brand: string; // Extracted from first word of product name
  category?: string; // e.g., "Testsieger", "Fürs Wohnzimmer", etc.
  imageUrl?: string;
  // Price info from SerpAPI Google Shopping
  price?: number;
  priceCurrency?: string;
  priceSource?: string; // Shop name from Google Shopping
  priceLink?: string; // Link to the product
  // Specs from FAZ
  specs: ScrapedSpecs;
  // Enrichment from Gemini AI
  enrichment?: EnrichmentData;
  scrapedAt: string; // ISO timestamp
}

export interface ScrapedDataResult {
  products: ScrapedBKWProduct[];
  scrapedAt: string; // ISO date string
  sources: {
    productInfo: string; // FAZ URL
    pricing: string; // "SerpAPI Google Shopping"
  };
  totalProducts: number;
}
