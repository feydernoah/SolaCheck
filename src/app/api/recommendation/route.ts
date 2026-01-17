/**
 * API Route: /api/recommendation
 * 
 * Receives quiz answers and returns BKW product recommendations
 * sorted by shortest amortization time, including economic and ecological analysis.
 * 
 * POST endpoint:
 * - Fetches PVGIS solar data for location-specific yield (if coordinates provided)
 * - Analyzes quiz answers to calculate economic viability and environmental impact
 * - Returns ranked products with detailed breakdowns
 * - Includes CO2 payback periods and lifecycle assessments
 * 
 * GET endpoint:
 * - Returns sample recommendations for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateRecommendations } from '@/lib/recommendationEngine';
import type { QuizAnswers, RecommendationResponse, SolarData } from '@/types/economic';

// PVGIS API configuration (same as solar-data route)
const PVGIS_BASE_URL = 'https://re.jrc.ec.europa.eu/api/v5_3/PVcalc';

const DEFAULT_PVGIS_PARAMS = {
  peakpower: 1,
  loss: 14,
  pvtechchoice: 'crystSi',
  mountingplace: 'building',
  raddatabase: 'PVGIS-SARAH3',
  outputformat: 'json',
};

const ORIENTATION_TO_ASPECT: Record<string, number> = {
  'sueden': 0,
  'suedost': -45,
  'suedwest': 45,
  'westen': 90,
  'osten': -90,
  'norden': 180,
  'weiss-nicht': 0,
};

const MOUNTING_TO_ANGLE: Record<string, number> = {
  'balkonbruestung': 90,
  'balkonboden': 30,
  'hauswand': 90,
  'flachdach': 15,
  'weiss-nicht': 35,
};

/**
 * Fetch solar data from PVGIS API (server-side)
 */
async function fetchPVGISData(
  lat: number,
  lon: number,
  orientation?: string,
  mounting?: string
): Promise<SolarData | null> {
  const aspect = ORIENTATION_TO_ASPECT[orientation ?? 'weiss-nicht'] ?? 0;
  const angle = MOUNTING_TO_ANGLE[mounting ?? 'weiss-nicht'] ?? 35;
  
  const pvgisParams = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    peakpower: DEFAULT_PVGIS_PARAMS.peakpower.toString(),
    loss: DEFAULT_PVGIS_PARAMS.loss.toString(),
    pvtechchoice: DEFAULT_PVGIS_PARAMS.pvtechchoice,
    mountingplace: DEFAULT_PVGIS_PARAMS.mountingplace,
    raddatabase: DEFAULT_PVGIS_PARAMS.raddatabase,
    angle: angle.toString(),
    aspect: aspect.toString(),
    outputformat: DEFAULT_PVGIS_PARAMS.outputformat,
  });
  
  const pvgisUrl = `${PVGIS_BASE_URL}?${pvgisParams.toString()}`;
  
  try {
    console.log(`[Recommendation API] Fetching PVGIS: ${pvgisUrl}`);
    
    const response = await fetch(pvgisUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Recommendation API] PVGIS error (${String(response.status)}):`, errorText);
      return null;
    }
    
    const pvgisData = await response.json();
    
    // Extract monthly yields
    const monthlyYields = pvgisData.outputs.monthly.fixed
      .sort((a: { month: number }, b: { month: number }) => a.month - b.month)
      .map((m: { E_m: number }) => m.E_m);
    
    const solarData: SolarData = {
      annualYieldKwhPerKwp: pvgisData.outputs.totals.fixed.E_y,
      averageDailyYieldKwh: pvgisData.outputs.totals.fixed.E_d,
      averageMonthlyYieldKwh: pvgisData.outputs.totals.fixed.E_m,
      yearlyIrradiationKwhPerM2: pvgisData.outputs.totals.fixed.H_y,
      monthlyYields,
      totalLossPercent: pvgisData.outputs.totals.fixed.l_total,
      location: {
        lat: pvgisData.inputs.location.latitude,
        lon: pvgisData.inputs.location.longitude,
        elevation: pvgisData.inputs.location.elevation,
      },
      systemParams: {
        angle: pvgisData.inputs.mounting_system.fixed.slope.value,
        aspect: pvgisData.inputs.mounting_system.fixed.azimuth.value,
        peakPower: pvgisData.inputs.pv_module.peak_power,
        loss: pvgisData.inputs.pv_module.system_loss,
      },
    };
    
    console.log(`[Recommendation API] PVGIS success: ${String(solarData.annualYieldKwhPerKwp)} kWh/kWp/year`);
    return solarData;
    
  } catch (error) {
    console.error('[Recommendation API] PVGIS fetch error:', error);
    return null;
  }
}

/**
 * POST /api/recommendation
 * 
 * Request body:
 * {
 *   "answers": {
 *     "1": "25-34",
 *     "2": "Berlin",
 *     "3": "2",
 *     "6": "balkonbruestung",
 *     "7": "sueden",
 *     "9": "keine",
 *     "11": "400-700",
 *     "12": "wichtig",
 *     "coordinates": { "lat": 52.52, "lon": 13.405 }
 *   },
 *   "solarData": { ... } // Optional: pre-fetched PVGIS data from cookie
 * }
 * 
 * Response includes:
 * - Economic analysis: amortization times, annual savings, 10/20-year returns
 * - Ecological analysis: manufacturing CO2, payback period, lifecycle assessment
 * - Detailed product rankings with match reasons and warnings
 * - User quiz summary and calculation assumptions
 */
export async function POST(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  try {
    // Parse request body
    const body = await request.json() as { 
      answers?: QuizAnswers;
      solarData?: SolarData; // Can be passed from cookie
    };
    
    // Validate that answers exist
    if (!body.answers || typeof body.answers !== 'object') {
      return NextResponse.json(
        {
          success: false,
          isRecommended: false,
          recommendationReason: 'Fehlerhafte Anfrage',
          rankings: [],
          assumptions: {
            electricityPriceCentPerKwh: 0,
            feedInTariffCentPerKwh: 0,
            orientationFactor: 0,
            shadingFactor: 0,
            selfConsumptionRate: 0,
            estimatedAnnualConsumptionKwh: 0,
            co2PerKwhGrams: 0,
            usedPvgisData: false,
            usedUserProvidedConsumption: false,
          },
          quizSummary: {
            location: '',
            orientation: '',
            householdSize: '',
            budget: '',
            mountingLocation: '',
            shading: '',
            ecoImportance: '',
          },
          filteredOutCount: 0,
          error: 'Missing or invalid answers object in request body',
        },
        { status: 400 }
      );
    }
    
    const answers = body.answers;
    
    // Get solar data - either from request body (cookie) or fetch from PVGIS
    let solarData: SolarData | null | undefined = body.solarData;
    
    if (!solarData && answers.coordinates) {
      // Fetch PVGIS data if coordinates are available and no cached data provided
      solarData = await fetchPVGISData(
        answers.coordinates.lat,
        answers.coordinates.lon,
        answers[7], // orientation
        answers[6]  // mounting
      );
    }
    
    // Calculate recommendations (will use fallback if solarData is null)
    const result = calculateRecommendations(answers, solarData ?? undefined);
    
    // Return successful response
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Error in recommendation API:', error);
    
    return NextResponse.json(
      {
        success: false,
        isRecommended: false,
        recommendationReason: 'Interner Serverfehler',
        rankings: [],
        assumptions: {
          electricityPriceCentPerKwh: 0,
          feedInTariffCentPerKwh: 0,
          orientationFactor: 0,
          shadingFactor: 0,
          selfConsumptionRate: 0,
          estimatedAnnualConsumptionKwh: 0,
          co2PerKwhGrams: 0,
          usedPvgisData: false,
          usedUserProvidedConsumption: false,
        },
        quizSummary: {
          location: '',
          orientation: '',
          householdSize: '',
          budget: '',
          mountingLocation: '',
          shading: '',
          ecoImportance: '',
        },
        filteredOutCount: 0,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recommendation
 * 
 * Returns a sample response with default values for testing
 */
export async function GET(): Promise<NextResponse<RecommendationResponse>> {
  // Sample quiz answers for testing (Berlin coordinates)
  const sampleAnswers: QuizAnswers = {
    1: '25-34',
    2: 'Berlin',
    3: '2',
    4: 'mietwohnung',
    5: '40-70',
    6: 'balkonbruestung',
    7: 'sueden',
    8: 'mittel',
    9: 'etwas',
    10: ['kuehlschrank', 'waschmaschine', 'laptop'],
    11: '1200', 
    12: 'wichtig',
    coordinates: { lat: 52.52, lon: 13.405 }, // Berlin
  };
  
  // Try to fetch PVGIS data for sample
  const coords = sampleAnswers.coordinates;
  const solarData = coords 
    ? await fetchPVGISData(
        coords.lat,
        coords.lon,
        sampleAnswers[7],
        sampleAnswers[6]
      )
    : null;
  
  const result = calculateRecommendations(sampleAnswers, solarData ?? undefined);
  
  return NextResponse.json(result, { status: 200 });
}
