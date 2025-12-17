import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { ScrapedBKWProduct, ScrapedDataResult, ScrapedSpecs } from "@/types/scraped";

const FAZ_URL =
  "https://www.faz.net/kaufkompass/test/das-beste-balkonkraftwerk/";

// SerpAPI Google Shopping search
async function searchGoogleShopping(
  productName: string
): Promise<{ price: number | null; currency: string; source: string; link: string }> {
  const apiKey = process.env.SERPAPI_KEY;

  if (!apiKey) {
    console.warn("SERPAPI_KEY not configured - skipping price lookup");
    return { price: null, currency: "EUR", source: "", link: "" };
  }

  try {
    // Build search query - add "Balkonkraftwerk" for better results
    const query = encodeURIComponent(`${productName} Balkonkraftwerk kaufen`);
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&location=Germany&hl=de&gl=de&api_key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`SerpAPI error: ${String(response.status)} ${response.statusText}`);
      return { price: null, currency: "EUR", source: "", link: "" };
    }

    const data = await response.json();

    // Get shopping results
    const results: Record<string, unknown>[] = (data.shopping_results as Record<string, unknown>[] | undefined) ?? [];
    if (results.length === 0) {
      console.log(`No shopping results for: ${productName}`);
      return { price: null, currency: "EUR", source: "", link: "" };
    }

    // Use the first result (most relevant) instead of lowest price
    const firstResult = results[0];
    
    // Extract price from first result
    let price: number | null = null;
    const priceValue = firstResult.extracted_price ?? firstResult.price;
    if (typeof priceValue === "number") {
      price = priceValue;
    } else if (typeof priceValue === "string") {
      const parsed = parseFloat(priceValue.replace(/[^\d.,]/g, "").replace(",", "."));
      if (!isNaN(parsed)) price = parsed;
    }

    return {
      price,
      currency: "EUR",
      source: typeof firstResult.source === "string" ? firstResult.source : "",
      link: typeof firstResult.link === "string" ? firstResult.link : "",
    };
  } catch (error) {
    console.error(`SerpAPI lookup failed for ${productName}:`, error);
    return { price: null, currency: "EUR", source: "", link: "" };
  }
}

// Scrape FAZ for product info
async function scrapeFAZProducts(): Promise<{
  products: Partial<ScrapedBKWProduct>[];
  fazUrl: string;
}> {
  const response = await fetch(FAZ_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`FAZ fetch failed: ${String(response.status)}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  
  // First, build a map of box-id -> specs from the specs section
  const specsMap = new Map<string, ScrapedSpecs>();
  
  $(".ab-comparison--infos .ab-comparison--track").each((_, trackEl) => {
    const track = $(trackEl);
    const boxId = track.attr("data-box-id");
    if (!boxId) return;
    
    const specs: ScrapedSpecs = {};
    
    track.find(".ab-comparison--spec").each((_, specEl) => {
      const $spec = $(specEl);
      const label = $spec.attr("data-label") ?? "";
      const value = $spec.text().trim();
      
      if (!value || value === "–") return;
      
      // Parse and map to our specific fields
      if (label === "Maximale PV-Eingangsleistung") {
        // Extract number like "3.600 Watt" or "2000 Watt"
        const match = /([\d.]+)/.exec(value);
        if (match) {
          // Remove dots used as thousands separator and parse
          specs.wattage = parseInt(match[1].replace(/\./g, ""));
        }
      } else if (label === "Interner Speicher") {
        const match = /(\d+(?:[.,]\d+)?)/.exec(value);
        if (match) specs.storageCapacity = parseFloat(match[1].replace(",", "."));
      } else if (label === "Abmessungen") {
        specs.dimensions = value;
      } else if (label === "Gewicht") {
        const match = /(\d+(?:[.,]\d+)?)/.exec(value);
        if (match) specs.weight = parseFloat(match[1].replace(",", "."));
      } else if (label === "Garantie") {
        const match = /(\d+)/.exec(value);
        if (match) specs.warranty = parseInt(match[1]);
      }
    });
    
    specsMap.set(boxId, specs);
  });
  
  console.log(`Found specs for ${String(specsMap.size)} products`);
  
  // Now extract products from the header section with product names
  const products: Partial<ScrapedBKWProduct>[] = [];
  const seenNames = new Set<string>();
  
  // Find product tracks that have the model name
  $(".ab-comparison--track[data-id]").each((_, element) => {
    const track = $(element);
    const dataId = track.attr("data-id") ?? "";
    // Convert "box-1" to "1" for matching with specs
    const boxId = dataId.replace("box-", "");
    
    // Extract product name
    const name = track.find(".ab-comparison--model").text().trim();
    if (!name || seenNames.has(name)) return;
    seenNames.add(name);
    
    // Extract category/badge
    const category = track.find(".ab-comparison--heading").text().trim();
    
    // Extract image
    const imgElement = track.find(".ab-comparison--image img").first();
    const imageUrl = imgElement.attr("src") ?? "";
    
    // Get specs for this product
    const specs = specsMap.get(boxId) ?? {};
    
    products.push({
      id: `faz-${String(products.length + 1)}`,
      name,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      specs,
      scrapedAt: new Date().toISOString(),
    });
  });

  console.log(`Found ${String(products.length)} products on FAZ`);
  return { products, fazUrl: FAZ_URL };
}

// Enrich FAZ products with SerpAPI prices
async function enrichWithPrices(
  products: Partial<ScrapedBKWProduct>[]
): Promise<ScrapedBKWProduct[]> {
  const enrichedProducts: ScrapedBKWProduct[] = [];

  for (const product of products) {
    if (!product.name) continue;

    console.log(`Looking up price for: ${product.name}`);

    // Query SerpAPI for price
    const priceData = await searchGoogleShopping(product.name);

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Extract brand from first word of product name
    const brand = product.name.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "");

    enrichedProducts.push({
      id: product.id ?? `bkw-${String(enrichedProducts.length + 1)}`,
      name: product.name,
      brand,
      category: product.category,
      price: priceData.price ?? undefined,
      priceCurrency: priceData.currency,
      priceSource: priceData.source || undefined,
      priceLink: priceData.link || undefined,
      imageUrl: product.imageUrl,
      specs: product.specs ?? {},
      scrapedAt: new Date().toISOString(),
    });
  }

  return enrichedProducts;
}

// Save scraped data to JSON
async function saveScrapedData(result: ScrapedDataResult): Promise<string> {
  const dataDir = path.join(process.cwd(), "src", "data", "scraped");
  await mkdir(dataDir, { recursive: true });

  const date = new Date().toISOString().split("T")[0];
  const filename = `bkw-${date}.json`;
  const filepath = path.join(dataDir, filename);

  await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");

  // Also save as latest
  const latestPath = path.join(dataDir, "bkw-latest.json");
  await writeFile(latestPath, JSON.stringify(result, null, 2), "utf-8");

  return filepath;
}

export async function GET() {
  try {
    console.log("Starting BKW scrape...");

    // Step 1: Scrape FAZ for product info
    console.log("Scraping FAZ for product info...");
    const { products: fazProducts, fazUrl } = await scrapeFAZProducts();
    console.log(`Found ${String(fazProducts.length)} products on FAZ`);

    if (fazProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No products found on FAZ",
          hint: "The page structure may have changed",
        },
        { status: 404 }
      );
    }

    // Step 2: Enrich with SerpAPI prices
    console.log("Enriching with Google Shopping prices...");
    const enrichedProducts = await enrichWithPrices(fazProducts);

    // Step 3: Build result
    const result: ScrapedDataResult = {
      products: enrichedProducts,
      scrapedAt: new Date().toISOString(),
      sources: {
        productInfo: fazUrl,
        pricing: "Google Shopping via SerpAPI",
      },
      totalProducts: enrichedProducts.length,
    };

    // Step 4: Save to file
    const savedPath = await saveScrapedData(result);
    console.log(`Saved to: ${savedPath}`);

    return NextResponse.json({
      success: true,
      message: `Scraped ${String(enrichedProducts.length)} products with prices`,
      savedTo: savedPath,
      data: result,
    });
  } catch (error) {
    console.error("Scrape failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
