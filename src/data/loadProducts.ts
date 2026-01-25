import type { BKWProduct, MountingType, ManufacturingOrigin } from "@/types/economic";
import type { ScrapedDataResult } from "@/types/scraped";

import scrapedData from "@/data/scraped/bkw-latest.json";
import enrichmentData from "@/data/scraped/bkw-enrichment-latest.json";

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

const VALID_MOUNTING_TYPES: MountingType[] = [
  "balkonbruestung",
  "balkonboden",
  "hauswand",
  "flachdach",
  "weiss-nicht",
];

const VALID_ORIGINS: ManufacturingOrigin[] = [
  "germany",
  "europe",
  "asia",
  "china",
  "unknown",
];

function parseMountingTypes(types: string[]): MountingType[] {
  return types.filter((t): t is MountingType =>
    VALID_MOUNTING_TYPES.includes(t as MountingType)
  );
}

function parseOrigin(origin: string): ManufacturingOrigin {
  const normalized = origin.toLowerCase();
  if (VALID_ORIGINS.includes(normalized as ManufacturingOrigin)) {
    return normalized as ManufacturingOrigin;
  }
  return "unknown";
}

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

export function loadScrapedProducts(): BKWProduct[] {
  const scraped = scrapedData as ScrapedDataResult;
  const enrichment = enrichmentData as EnrichmentResult;

  const enrichmentMap = new Map<string, GeminiEnrichment>();
  for (const e of enrichment.enrichments) {
    enrichmentMap.set(e.name, e);
  }

  const products: BKWProduct[] = [];

  for (const p of scraped.products) {
    let gemini = enrichmentMap.get(p.name);
    if (!gemini) {
      const normalizedName = p.name.replace(/\s+/g, " ").trim();
      for (const [key, value] of enrichmentMap.entries()) {
        if (key.replace(/\s+/g, " ").trim() === normalizedName) {
          gemini = value;
          break;
        }
      }
    }

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
    const inverterACPower = gemini?.inverterACPower ?? 800;
    const description = gemini?.description ?? p.specs.description ?? "";
    const warrantyYears = p.specs.warranty ?? 10;
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
      imageUrl: p.imageUrl,
      priceSource: p.priceSource,
      priceLink: p.priceLink,
      category: p.category,
    };

    products.push(product);
  }

  return products;
}

export function getAllProducts(): BKWProduct[] {
  try {
    const scraped = loadScrapedProducts();
    if (scraped.length > 0) {
      return scraped;
    }
  } catch (error) {
    console.warn("Failed to load scraped products, using static fallback:", error);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { bkwProducts } = require("@/data/bkwProducts");
  return bkwProducts as BKWProduct[];
}
