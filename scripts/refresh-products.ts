#!/usr/bin/env npx tsx
/**
 * Product Refresh Script
 * 
 * Runs the full product data pipeline:
 * 1. Scrape products from FAZ website + get prices from SerpAPI
 * 2. Enrich with Gemini AI (adds storageCapacity, mounting types, etc.)
 * 3. Validate that all required fields are present
 * 
 * Usage: npm run refresh-products
 * 
 * Requirements:
 * - Dev server must be running (npm run dev)
 * - Environment variables: SERPAPI_KEY, GEMINI_API_KEY
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000/solacheck';

interface ScrapedProduct {
  id: string;
  name: string;
  brand: string;
  price?: number;
  specs: {
    wattage?: number;
    storageCapacity?: number;
    warranty?: number;
    bifacial?: boolean;
    moduleEfficiency?: number;
    moduleCount?: number;
    includesInverter?: boolean;
  };
}

interface EnrichedProduct {
  name: string;
  mountingTypes: string[];
  manufacturingOrigin: string;
  bifacial: boolean;
  moduleEfficiency: number;
  moduleCount: number;
  includesInverter: boolean;
  includesStorage: boolean;
  inverterACPower: number;
  storageCapacity?: number;
  description: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalProducts: number;
    withPrice: number;
    withStorage: number;
    withWattage: number;
    enriched: number;
  };
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: number, message: string): void {
  log(`\n${colors.bold}[Step ${String(step)}]${colors.reset} ${message}`, colors.cyan);
}

function logSuccess(message: string): void {
  log(`[OK] ${message}`, colors.green);
}

function logWarning(message: string): void {
  log(`[WARN] ${message}`, colors.yellow);
}

function logError(message: string): void {
  log(`[ERROR] ${message}`, colors.red);
}

async function callApi(endpoint: string): Promise<unknown> {
  const url = `${BASE_URL}${endpoint}`;
  log(`   Calling ${url}...`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API call failed: ${String(response.status)} ${response.statusText}`);
  }
  
  return response.json();
}

function validateProducts(
  scrapedProducts: ScrapedProduct[],
  enrichments: EnrichedProduct[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const stats = {
    totalProducts: scrapedProducts.length,
    withPrice: 0,
    withStorage: 0,
    withWattage: 0,
    enriched: 0,
  };
  
  // Build enrichment lookup
  const enrichmentMap = new Map<string, EnrichedProduct>();
  for (const e of enrichments) {
    enrichmentMap.set(e.name.toLowerCase().replace(/\s+/g, ' ').trim(), e);
  }
  
  for (const product of scrapedProducts) {
    const normalizedName = product.name.toLowerCase().replace(/\s+/g, ' ').trim();
    const enrichment = enrichmentMap.get(normalizedName);
    
    // Check required fields
    if (!product.price || product.price <= 0) {
      warnings.push(`${product.name}: Missing price`);
    } else {
      stats.withPrice++;
    }
    
    if (!product.specs.wattage || product.specs.wattage <= 0) {
      errors.push(`${product.name}: Missing wattage (critical for calculations)`);
    } else {
      stats.withWattage++;
    }
    
    // Check for enrichment
    if (!enrichment) {
      warnings.push(`${product.name}: No Gemini enrichment found`);
    } else {
      stats.enriched++;
      
      // Check if product name suggests storage but storageCapacity is missing
      const hasStorageInScraped = product.specs.storageCapacity && product.specs.storageCapacity > 0;
      const hasStorageInEnrichment = enrichment.storageCapacity && enrichment.storageCapacity > 0;
      
      // Use Gemini's includesStorage field to determine if battery is expected
      if (enrichment.includesStorage && !hasStorageInScraped && !hasStorageInEnrichment) {
        warnings.push(`${product.name}: Gemini says it includes storage but storageCapacity is missing`);
      }
      
      if (hasStorageInScraped || hasStorageInEnrichment) {
        stats.withStorage++;
      }
    }
  }
  
  // Overall validation
  const isValid = errors.length === 0 && stats.withWattage === stats.totalProducts;
  
  return { isValid, errors, warnings, stats };
}

async function main(): Promise<void> {
  log('\n' + '='.repeat(60), colors.bold);
  log('  Product Refresh Pipeline', colors.bold);
  log('='.repeat(60) + '\n', colors.bold);
  
  try {
    // Step 1: Scrape products
    logStep(1, 'Scraping products from FAZ + SerpAPI prices...');
    const scrapeResult = await callApi('/api/scrape-bkw') as {
      success: boolean;
      data?: { products: ScrapedProduct[]; totalProducts: number };
      error?: string;
    };
    
    if (!scrapeResult.success) {
      throw new Error(`Scraping failed: ${scrapeResult.error ?? 'Unknown error'}`);
    }
    
    const scrapedProducts = scrapeResult.data?.products ?? [];
    logSuccess(`Scraped ${String(scrapedProducts.length)} products`);
    
    // Step 2: Enrich with Gemini
    logStep(2, 'Enriching with Gemini AI...');
    const enrichResult = await callApi('/api/enrich-gemini') as {
      success: boolean;
      data?: { enrichments: EnrichedProduct[] };
      error?: string;
    };
    
    if (!enrichResult.success) {
      throw new Error(`Enrichment failed: ${enrichResult.error ?? 'Unknown error'}`);
    }
    
    const enrichments = enrichResult.data?.enrichments ?? [];
    logSuccess(`Enriched ${String(enrichments.length)} products`);
    
    // Step 3: Validate
    logStep(3, 'Validating data completeness...');
    const validation = validateProducts(scrapedProducts, enrichments);
    
    // Print stats
    log('\nStatistics:', colors.bold);
    log(`   Total products: ${String(validation.stats.totalProducts)}`);
    log(`   With price: ${String(validation.stats.withPrice)}/${String(validation.stats.totalProducts)}`);
    log(`   With wattage: ${String(validation.stats.withWattage)}/${String(validation.stats.totalProducts)}`);
    log(`   With storage: ${String(validation.stats.withStorage)}/${String(validation.stats.totalProducts)}`);
    log(`   Enriched: ${String(validation.stats.enriched)}/${String(validation.stats.totalProducts)}`);
    
    // Print errors
    if (validation.errors.length > 0) {
      log('\nErrors (must fix):', colors.bold);
      for (const error of validation.errors) {
        logError(error);
      }
    }
    
    // Print warnings
    if (validation.warnings.length > 0) {
      log('\nWarnings:', colors.bold);
      for (const warning of validation.warnings.slice(0, 10)) {
        logWarning(warning);
      }
      if (validation.warnings.length > 10) {
        log(`   ... and ${String(validation.warnings.length - 10)} more warnings`);
      }
    }
    
    // Final result
    log('\n' + '='.repeat(60), colors.bold);
    if (validation.isValid) {
      logSuccess('Product refresh completed successfully.');
      log(`   Files saved to src/data/scraped/`);
      log(`   - bkw-latest.json (scraped data)`);
      log(`   - bkw-enrichment-latest.json (Gemini enrichment)`);
    } else {
      logError('Product refresh completed with errors.');
      log('   Please review the errors above and fix the data manually if needed.');
      process.exit(1);
    }
    log('='.repeat(60) + '\n', colors.bold);
    
  } catch (error) {
    logError(`Pipeline failed: ${error instanceof Error ? error.message : String(error)}`);
    log('\nMake sure:');
    log('  1. Dev server is running (npm run dev)');
    log('  2. Environment variables are set (SERPAPI_KEY, GEMINI_API_KEY)');
    process.exit(1);
  }
}

void main();
