/**
 * Product Loader - Merges scraped data with Gemini enrichment
 * 
 * Loads products from:
 * - bkw-latest.json (FAZ specs + SerpAPI prices)
 * - bkw-enrichment-latest.json (Gemini AI enrichment)
 * 
 * Returns BKWProduct[] compatible with calculators and frontend
 */

import type { BKWProduct, MountingType, ManufacturingOrigin } from "@/types/economic";
import type { ScrapedDataResult } from "@/types/scraped";

// Import JSON files directly (Next.js supports this)
import scrapedData from "@/data/scraped/bkw-latest.json";
import enrichmentData from "@/data/scraped/bkw-enrichment-latest.json";

// Enrichment data structure
interface GeminiEnrichment {
  name: string;
  mountingTypes: string[];
  manufacturingOrigin: string;
  bifacial: boolean;
  moduleEfficiency: number;
  moduleCount: number;
  includesInverter: boolean;
  inverterACPower?: number;
  storageCapacity?: number;
  description: string;
}

interface EnrichmentResult {
  enrichments: GeminiEnrichment[];
  enrichedAt: string;
  source: string;
  totalProducts: number;
}

// Valid mounting types for type safety
const VALID_MOUNTING_TYPES: MountingType[] = [
  "balkonbruestung",
  "balkonboden",
  "hauswand",
  "flachdach",
  "weiss-nicht",
];

// Valid manufacturing origins
const VALID_ORIGINS: ManufacturingOrigin[] = [
  "germany",
  "europe",
  "asia",
  "china",
  "unknown",
];

/**
 * Validates and converts mounting type strings to MountingType[]
 */
function parseMountingTypes(types: string[]): MountingType[] {
  return types.filter((t): t is MountingType =>
    VALID_MOUNTING_TYPES.includes(t as MountingType)
  );
}

/**
 * Validates and converts origin string to ManufacturingOrigin
 */
function parseOrigin(origin: string): ManufacturingOrigin {
  const normalized = origin.toLowerCase();
  if (VALID_ORIGINS.includes(normalized as ManufacturingOrigin)) {
    return normalized as ManufacturingOrigin;
  }
  return "unknown";
}

/**
 * Estimates CO2 emissions for manufacturing based on origin and wattage
 * Uses rough estimates: China ~100kg/kWp, Europe ~80kg/kWp, Germany ~70kg/kWp
 */
function estimateManufacturingCo2(origin: ManufacturingOrigin, wattage: number): number {
  const kWp = wattage / 1000;
  const co2PerKwp: Record<ManufacturingOrigin, number> = {
    china: 100,
    asia: 95,
    europe: 80,
    germany: 70,
    unknown: 90,
  };
  return Math.round(co2PerKwp[origin] * kWp);
}

/**
 * Loads and merges scraped products with enrichment data
 * Returns BKWProduct[] compatible with calculators
 */
export function loadScrapedProducts(): BKWProduct[] {
  const scraped = scrapedData as ScrapedDataResult;
  const enrichment = enrichmentData as EnrichmentResult;

  // Build enrichment lookup by name
  const enrichmentMap = new Map<string, GeminiEnrichment>();
  for (const e of enrichment.enrichments) {
    enrichmentMap.set(e.name, e);
  }

  const products: BKWProduct[] = [];

  for (const p of scraped.products) {
    // Find matching enrichment (try exact match first, then fuzzy)
    let gemini = enrichmentMap.get(p.name);
    if (!gemini) {
      // Try fuzzy match (remove extra spaces, normalize)
      const normalizedName = p.name.replace(/\s+/g, " ").trim();
      for (const [key, value] of enrichmentMap.entries()) {
        if (key.replace(/\s+/g, " ").trim() === normalizedName) {
          gemini = value;
          break;
        }
      }
    }

    // Default values if no enrichment found
    const mountingTypes = gemini
      ? parseMountingTypes(gemini.mountingTypes)
      : ["balkonbruestung", "balkonboden"] as MountingType[];

    const manufacturingOrigin = gemini
      ? parseOrigin(gemini.manufacturingOrigin)
      : "china";

    const wattage = p.specs.wattage ?? 800;
    const moduleEfficiency = gemini?.moduleEfficiency ?? p.specs.moduleEfficiency ?? 21;
    const moduleCount = gemini?.moduleCount ?? p.specs.moduleCount ?? 2;
    const bifacial = gemini?.bifacial ?? p.specs.bifacial ?? false;
    const includesInverter = gemini?.includesInverter ?? p.specs.includesInverter ?? true;
    const inverterACPower = gemini?.inverterACPower ?? 800; // Default to legal max
    const description = gemini?.description ?? p.specs.description ?? "";
    const warrantyYears = p.specs.warranty ?? 10;
    // Use scraped storageCapacity first, fall back to Gemini enrichment
    const storageCapacity = p.specs.storageCapacity ?? (gemini?.storageCapacity && gemini.storageCapacity > 0 ? gemini.storageCapacity : undefined);

    const product: BKWProduct = {
      id: p.id,
      name: p.name,
      brand: p.brand,
      wattage,
      moduleCount,
      price: p.price ?? 0,
      includesInverter,
      inverterACPower,
      includesStorage: storageCapacity !== undefined && storageCapacity > 0,
      storageCapacity,
      mountingTypes,
      bifacial,
      moduleEfficiency,
      warrantyYears,
      description,
      manufacturingOrigin,
      manufacturingCo2Kg: estimateManufacturingCo2(manufacturingOrigin, wattage),
      // Additional scraped fields
      imageUrl: p.imageUrl,
      priceSource: p.priceSource,
      priceLink: p.priceLink,
      category: p.category,
    };

    products.push(product);
  }

  return products;
}

/**
 * Gets all available products (scraped + fallback to static if needed)
 */
export function getAllProducts(): BKWProduct[] {
  try {
    const scraped = loadScrapedProducts();
    if (scraped.length > 0) {
      return scraped;
    }
  } catch (error) {
    console.warn("Failed to load scraped products, using static fallback:", error);
  }

  // Fallback to static products (import dynamically to avoid circular deps)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { bkwProducts } = require("@/data/bkwProducts");
  return bkwProducts as BKWProduct[];
}
