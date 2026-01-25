import { NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { ScrapedDataResult } from "@/types/scraped";

interface GeminiEnrichment {
  name: string;
  mountingTypes: string[];
  manufacturingOrigin: string;
  bifacial: boolean;
  moduleEfficiency: number;
  moduleCount: number;
  includesInverter: boolean;
  inverterACPower: number;
  description: string;
}

interface EnrichmentResult {
  enrichments: GeminiEnrichment[];
  enrichedAt: string;
  source: string;
  totalProducts: number;
}

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const dataDir = path.join(process.cwd(), "src", "data", "scraped");
  const latestPath = path.join(dataDir, "bkw-latest.json");

  let scrapedData: ScrapedDataResult;
  try {
    const fileContent = await readFile(latestPath, "utf-8");
    scrapedData = JSON.parse(fileContent) as ScrapedDataResult;
  } catch (error) {
    return NextResponse.json(
      {
        error: "No scraped data found. Run /api/scrape-bkw first.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 404 }
    );
  }

  const productCount = scrapedData.products.length;
  console.log(`Enriching ${String(productCount)} products with Gemini AI...`);

  const productList = scrapedData.products
    .map((p) => {
      const { name, brand, specs } = p;
      const wattageValue = specs.wattage;
      const wattage = wattageValue !== undefined ? String(wattageValue) : "unknown";
      const storageValue = specs.storageCapacity;
      const storage =
        storageValue !== undefined ? `${String(storageValue)}kWh storage` : "no storage";
      return `- ${name} (${brand}, ${wattage}W, ${storage})`;
    })
    .join("\n");

  const prompt = `You are an expert on German Balkonkraftwerk (balcony solar power systems).
For each product below, provide enrichment data.

Products:
${productList}

Return data for each product with mounting options, manufacturing origin, whether panels are bifacial,
module efficiency, module count, whether inverter is included, the inverter AC output power in watts,
the battery storage capacity in kWh (0 if no storage), and a short German description.

IMPORTANT for storageCapacity:
- Many products include battery storage (Speicher)
- Common capacities: 1.6kWh, 1.92kWh, 2.0kWh, 2.68kWh
- Products with "Solarbank", "Hyper", "PowerStream", "SolarFlow" usually have storage
- If no storage, set to 0

IMPORTANT for inverterACPower:
- Most Balkonkraftwerke have 800W inverters (legal limit in Germany)
- Some budget models have 600W or lower inverters  
- Research each product to find the actual inverter AC output power
- If unknown, default to 800 (the legal maximum)`;

  const responseSchema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Exact product name" },
        mountingTypes: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "Valid values: balkonbruestung, balkonboden, hauswand, flachdach",
        },
        manufacturingOrigin: {
          type: "STRING",
          description: "One of: china, germany, europe, asia, unknown",
        },
        bifacial: { type: "BOOLEAN", description: "Whether panels are bifacial" },
        moduleEfficiency: { type: "NUMBER", description: "Panel efficiency percentage (18-23)" },
        moduleCount: { type: "INTEGER", description: "Number of solar panels" },
        includesInverter: { type: "BOOLEAN", description: "Whether inverter is included" },
        inverterACPower: { 
          type: "INTEGER", 
          description: "Inverter AC output power in watts (W). Usually 800 for legal compliance, some have 600 or lower." 
        },
        storageCapacity: {
          type: "NUMBER",
          description: "Battery storage capacity in kWh. 0 if no storage included. Common values: 1.6, 1.92, 2.0, 2.68"
        },
        description: { type: "STRING", description: "Short German description" },
      },
      required: [
        "name",
        "mountingTypes",
        "manufacturingOrigin",
        "bifacial",
        "moduleEfficiency",
        "moduleCount",
        "includesInverter",
        "inverterACPower",
        "storageCapacity",
        "description",
      ],
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Gemini API error: ${String(response.status)}`, details: errorText },
        { status: response.status }
      );
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    console.log("Gemini response received, length:", text.length);

    let enrichments: GeminiEnrichment[];
    try {
      enrichments = JSON.parse(text) as GeminiEnrichment[];
    } catch (parseError) {
      return NextResponse.json({
        error: "Failed to parse Gemini response",
        rawText: text.substring(0, 500),
        parseError: parseError instanceof Error ? parseError.message : "Unknown error",
      });
    }

    const result: EnrichmentResult = {
      enrichments,
      enrichedAt: new Date().toISOString(),
      source: "Gemini 2.5 Flash",
      totalProducts: enrichments.length,
    };

    await mkdir(dataDir, { recursive: true });

    const date = new Date().toISOString().split("T")[0];
    const filename = `bkw-enrichment-${date}.json`;
    const filepath = path.join(dataDir, filename);

    await writeFile(filepath, JSON.stringify(result, null, 2), "utf-8");

    const latestEnrichmentPath = path.join(dataDir, "bkw-enrichment-latest.json");
    await writeFile(latestEnrichmentPath, JSON.stringify(result, null, 2), "utf-8");

    console.log(`Saved enrichment to: ${filepath}`);

    return NextResponse.json({
      success: true,
      message: `Enriched ${String(enrichments.length)} products with Gemini AI`,
      savedTo: filepath,
      data: result,
    });
  } catch (error) {
    console.error("Gemini enrichment failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
