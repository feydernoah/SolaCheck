/**
 * API Route: /api/solar-data
 * 
 * Proxy endpoint for PVGIS (Photovoltaic Geographical Information System) API
 * PVGIS does not allow CORS, so we need a server-side proxy
 * 
 * Documentation: https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en
 */

import { NextRequest, NextResponse } from 'next/server';

// PVGIS API configuration
const PVGIS_BASE_URL = 'https://re.jrc.ec.europa.eu/api/v5_3/PVcalc';

// Default system parameters for balcony solar systems
const DEFAULT_PARAMS = {
  peakpower: 1, // 1 kWp for normalized output (we scale by actual wattage later)
  loss: 14, // System losses in % (industry standard)
  pvtechchoice: 'crystSi', // Crystalline silicon (most common)
  mountingplace: 'building', // Building-integrated (balcony)
  raddatabase: 'PVGIS-SARAH3', // Best database for Europe
  outputformat: 'json',
};

// Map orientation answers to PVGIS aspect (azimuth) values
// PVGIS: 0 = south, 90 = west, -90 = east, 180/-180 = north
const ORIENTATION_TO_ASPECT: Record<string, number> = {
  'sueden': 0,
  'suedost': -45,
  'suedwest': 45,
  'westen': 90,
  'osten': -90,
  'norden': 180,
  'weiss-nicht': 0, // Default to south (optimal)
};

// Map mounting types to typical tilt angles
// Balcony railings are typically vertical or near-vertical
const MOUNTING_TO_ANGLE: Record<string, number> = {
  'balkonbruestung': 90, // Vertical mounting on railing
  'balkonboden': 30, // Ground/floor mounting with stand (optimal ~30°)
  'hauswand': 90, // Wall mounting (vertical)
  'flachdach': 15, // Flat roof with slight tilt
  'weiss-nicht': 35, // Default to near-optimal angle
};

export interface PVGISResponse {
  inputs: {
    location: {
      latitude: number;
      longitude: number;
      elevation: number;
    };
    mounting_system: {
      fixed: {
        slope: { value: number };
        azimuth: { value: number };
      };
    };
    pv_module: {
      technology: string;
      peak_power: number;
      system_loss: number;
    };
  };
  outputs: {
    totals: {
      fixed: {
        E_d: number; // Average daily energy production (kWh/day)
        E_m: number; // Average monthly energy production (kWh/month)
        E_y: number; // Average yearly energy production (kWh/year)
        H_d: number; // Average daily sum of global irradiation (kWh/m²/day)
        H_m: number; // Average monthly sum of global irradiation (kWh/m²/month)
        H_y: number; // Average yearly sum of global irradiation (kWh/m²/year)
        SD_m: number; // Standard deviation of monthly production
        SD_y: number; // Standard deviation of yearly production
        l_aoi: number; // Angle of incidence loss (%)
        l_spec: number; // Spectral loss (%)
        l_tg: number; // Temperature and irradiance loss (%)
        l_total: number; // Total loss (%)
      };
    };
    monthly: {
      fixed: {
        month: number;
        E_d: number;
        E_m: number;
        H_d: number;
        H_m: number;
        SD_m: number;
      }[];
    };
  };
}

export interface SolarDataResponse {
  success: boolean;
  data?: {
    annualYieldKwhPerKwp: number; // E_y - key metric for calculations
    averageDailyYieldKwh: number; // E_d
    averageMonthlyYieldKwh: number; // E_m
    yearlyIrradiationKwhPerM2: number; // H_y
    monthlyYields: number[]; // E_m for each month (Jan-Dec)
    totalLossPercent: number; // l_total
    location: {
      lat: number;
      lon: number;
      elevation: number;
    };
    systemParams: {
      angle: number;
      aspect: number;
      peakPower: number;
      loss: number;
    };
  };
  error?: string;
  fallbackUsed?: boolean;
}

/**
 * GET /api/solar-data
 * 
 * Query parameters:
 * - lat: Latitude (required)
 * - lon: Longitude (required)
 * - orientation: User's orientation answer (optional, defaults to 'sueden')
 * - mounting: User's mounting type answer (optional, defaults to 'weiss-nicht')
 * - angle: Override tilt angle (optional)
 */
export async function GET(request: NextRequest): Promise<NextResponse<SolarDataResponse>> {
  const searchParams = request.nextUrl.searchParams;
  
  // Extract and validate coordinates
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');
  
  if (!latStr || !lonStr) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameters: lat and lon',
      },
      { status: 400 }
    );
  }
  
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  
  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid coordinates: lat and lon must be numbers',
      },
      { status: 400 }
    );
  }
  
  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      {
        success: false,
        error: 'Coordinates out of range',
      },
      { status: 400 }
    );
  }
  
  // Get optional parameters
  const orientation = searchParams.get('orientation') ?? 'weiss-nicht';
  const mounting = searchParams.get('mounting') ?? 'weiss-nicht';
  const angleOverride = searchParams.get('angle');
  
  // Calculate aspect (azimuth) from orientation
  const aspect = ORIENTATION_TO_ASPECT[orientation] ?? ORIENTATION_TO_ASPECT['weiss-nicht'];
  
  // Calculate angle (tilt) from mounting type, or use override
  const angle = angleOverride 
    ? parseFloat(angleOverride) 
    : (MOUNTING_TO_ANGLE[mounting] ?? MOUNTING_TO_ANGLE['weiss-nicht']);
  
  // Build PVGIS API URL
  const pvgisParams = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    peakpower: DEFAULT_PARAMS.peakpower.toString(),
    loss: DEFAULT_PARAMS.loss.toString(),
    pvtechchoice: DEFAULT_PARAMS.pvtechchoice,
    mountingplace: DEFAULT_PARAMS.mountingplace,
    raddatabase: DEFAULT_PARAMS.raddatabase,
    angle: angle.toString(),
    aspect: aspect.toString(),
    outputformat: DEFAULT_PARAMS.outputformat,
  });
  
  const pvgisUrl = `${PVGIS_BASE_URL}?${pvgisParams.toString()}`;
  
  try {
    console.log(`[PVGIS] Fetching: ${pvgisUrl}`);
    
    const response = await fetch(pvgisUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PVGIS] Error response (${String(response.status)}):`, errorText);
      
      // Return fallback for client, but log the actual error
      return NextResponse.json(
        {
          success: false,
          error: `PVGIS API error: ${String(response.status)} - ${errorText}`,
          fallbackUsed: true,
        },
        { status: 200 } // Return 200 so client can use fallback
      );
    }
    
    const pvgisData: PVGISResponse = await response.json();
    
    // Extract monthly yields
    const monthlyYields = pvgisData.outputs.monthly.fixed
      .sort((a, b) => a.month - b.month)
      .map(m => m.E_m);
    
    const solarData: SolarDataResponse = {
      success: true,
      data: {
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
      },
    };
    
    console.log(`[PVGIS] Success: ${String(solarData.data?.annualYieldKwhPerKwp ?? 0)} kWh/kWp/year for (${String(lat)}, ${String(lon)})`);
    
    return NextResponse.json(solarData, { status: 200 });
    
  } catch (error) {
    console.error('[PVGIS] Fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching PVGIS data',
        fallbackUsed: true,
      },
      { status: 200 } // Return 200 so client can use fallback
    );
  }
}
