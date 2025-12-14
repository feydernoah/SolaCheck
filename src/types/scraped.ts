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
}

export interface ScrapedBKWProduct {
  id: string;
  name: string;
  category?: string; // e.g., "Testsieger", "Fürs Wohnzimmer", etc.
  imageUrl?: string;
  // Price info from SerpAPI Google Shopping
  price?: number;
  priceCurrency?: string;
  priceSource?: string; // Shop name from Google Shopping
  priceLink?: string; // Link to the product
  // Specs from FAZ
  specs: ScrapedSpecs;
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
