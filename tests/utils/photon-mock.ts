import { type Page } from '@playwright/test';

/**
 * Mock Photon API responses for fast, reliable testing.
 * 
 * This utility intercepts requests to photon.komoot.io and returns
 * pre-defined responses, eliminating network latency and external
 * API dependencies in tests.
 */

/**
 * Mock responses for different city searches.
 * Keys are matched against the search query (case-insensitive).
 */
export const MOCK_RESPONSES: Record<string, object> = {
  'berlin': {
    features: [
      {
        geometry: { coordinates: [13.405, 52.52] },
        properties: {
          osm_id: 62422,
          osm_type: 'relation',
          name: 'Berlin',
          city: 'Berlin',
          state: 'Berlin',
          countrycode: 'DE',
          type: 'city',
        },
      },
      {
        geometry: { coordinates: [13.388, 52.517] },
        properties: {
          osm_id: 123456,
          osm_type: 'way',
          name: 'Berlin Mitte',
          city: 'Berlin',
          state: 'Berlin',
          countrycode: 'DE',
          type: 'district',
        },
      },
    ],
  },
  '10115': {
    features: [
      {
        geometry: { coordinates: [13.388, 52.532] },
        properties: {
          osm_id: 789012,
          osm_type: 'node',
          name: 'Mitte',
          city: 'Berlin',
          postcode: '10115',
          state: 'Berlin',
          countrycode: 'DE',
          type: 'district',
        },
      },
    ],
  },
  'münchen': {
    features: [
      {
        geometry: { coordinates: [11.576, 48.137] },
        properties: {
          osm_id: 62428,
          osm_type: 'relation',
          name: 'München',
          city: 'München',
          state: 'Bayern',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'hamburg': {
    features: [
      {
        geometry: { coordinates: [9.993, 53.551] },
        properties: {
          osm_id: 62782,
          osm_type: 'relation',
          name: 'Hamburg',
          city: 'Hamburg',
          state: 'Hamburg',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'köln': {
    features: [
      {
        geometry: { coordinates: [6.958, 50.938] },
        properties: {
          osm_id: 62578,
          osm_type: 'relation',
          name: 'Köln',
          city: 'Köln',
          state: 'Nordrhein-Westfalen',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'frankfurt': {
    features: [
      {
        geometry: { coordinates: [8.682, 50.110] },
        properties: {
          osm_id: 62400,
          osm_type: 'relation',
          name: 'Frankfurt am Main',
          city: 'Frankfurt am Main',
          state: 'Hessen',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'stuttgart': {
    features: [
      {
        geometry: { coordinates: [9.179, 48.776] },
        properties: {
          osm_id: 62649,
          osm_type: 'relation',
          name: 'Stuttgart',
          city: 'Stuttgart',
          state: 'Baden-Württemberg',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'düsseldorf': {
    features: [
      {
        geometry: { coordinates: [6.773, 51.228] },
        properties: {
          osm_id: 62539,
          osm_type: 'relation',
          name: 'Düsseldorf',
          city: 'Düsseldorf',
          state: 'Nordrhein-Westfalen',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'leipzig': {
    features: [
      {
        geometry: { coordinates: [12.374, 51.340] },
        properties: {
          osm_id: 62649,
          osm_type: 'relation',
          name: 'Leipzig',
          city: 'Leipzig',
          state: 'Sachsen',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'bremen': {
    features: [
      {
        geometry: { coordinates: [8.807, 53.075] },
        properties: {
          osm_id: 62559,
          osm_type: 'relation',
          name: 'Bremen',
          city: 'Bremen',
          state: 'Bremen',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'hannover': {
    features: [
      {
        geometry: { coordinates: [9.732, 52.375] },
        properties: {
          osm_id: 59418,
          osm_type: 'relation',
          name: 'Hannover',
          city: 'Hannover',
          state: 'Niedersachsen',
          countrycode: 'DE',
          type: 'city',
        },
      },
    ],
  },
  'brandenburger': {
    features: [
      {
        geometry: { coordinates: [13.378, 52.516] },
        properties: {
          osm_id: 26945532,
          osm_type: 'way',
          name: 'Brandenburger Tor',
          street: 'Pariser Platz',
          city: 'Berlin',
          postcode: '10117',
          state: 'Berlin',
          countrycode: 'DE',
          type: 'attraction',
        },
      },
    ],
  },
  'bern': {
    features: [
      {
        geometry: { coordinates: [7.447, 46.948] },
        properties: {
          osm_id: 1682248,
          osm_type: 'relation',
          name: 'Bern',
          city: 'Bern',
          postcode: '3011',
          state: 'Bern',
          countrycode: 'CH',
          type: 'city',
        },
      },
    ],
  },
  '3011': {
    features: [
      {
        geometry: { coordinates: [7.447, 46.948] },
        properties: {
          osm_id: 1682248,
          osm_type: 'relation',
          name: 'Bern',
          city: 'Bern',
          postcode: '3011',
          state: 'Bern',
          countrycode: 'CH',
          type: 'city',
        },
      },
    ],
  },
  // Empty response for invalid searches
  'qzqzqzqzqz99999zzz': {
    features: [],
  },
};

/**
 * Default response for reverse geocoding (GPS location lookup)
 */
const DEFAULT_REVERSE_RESPONSE = {
  features: [
    {
      geometry: { coordinates: [13.405, 52.52] },
      properties: {
        name: 'Mocked Location',
        city: 'Berlin',
        countrycode: 'DE',
        type: 'city',
      },
    },
  ],
};

/**
 * Setup Photon API mock for a Playwright page.
 * 
 * Intercepts all requests to photon.komoot.io and returns mock responses
 * based on the search query. This makes tests:
 * - Fast (no network latency)
 * - Reliable (no external API dependencies)
 * - Deterministic (same response every time)
 * 
 * @param page - Playwright Page object
 * @param options - Optional configuration
 * @param options.useFullMocks - If true, uses the full MOCK_RESPONSES for query matching.
 *                               If false, returns a simple Berlin response for all queries.
 *                               Default: true
 */
export async function setupPhotonMock(
  page: Page, 
  options: { useFullMocks?: boolean } = {}
): Promise<void> {
  const { useFullMocks = true } = options;

  await page.route('**/photon.komoot.io/api/**', async (route) => {
    if (useFullMocks) {
      const url = new URL(route.request().url());
      const query = url.searchParams.get('q')?.toLowerCase() ?? '';
      
      // Find matching mock response
      let response: object = { features: [] };
      for (const [key, value] of Object.entries(MOCK_RESPONSES)) {
        if (query.includes(key)) {
          response = value;
          break;
        }
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    } else {
      // Simple response - always return Berlin
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_RESPONSES.berlin),
      });
    }
  });
  
  // Mock reverse geocoding for GPS location lookup
  await page.route('**/photon.komoot.io/reverse**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(DEFAULT_REVERSE_RESPONSE),
    });
  });
}
