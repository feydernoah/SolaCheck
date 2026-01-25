import { NextRequest, NextResponse } from 'next/server';

const PVGIS_BASE_URL = 'https://re.jrc.ec.europa.eu/api/v5_3/PVcalc';

const DEFAULT_PARAMS = {
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
        E_d: number;
        E_m: number;
        E_y: number;
        H_d: number;
        H_m: number;
        H_y: number;
        SD_m: number;
        SD_y: number;
        l_aoi: number;
        l_spec: number;
        l_tg: number;
        l_total: number;
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
    annualYieldKwhPerKwp: number;
    averageDailyYieldKwh: number;
    averageMonthlyYieldKwh: number;
    yearlyIrradiationKwhPerM2: number;
    monthlyYields: number[];
    totalLossPercent: number;
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

export async function GET(request: NextRequest): Promise<NextResponse<SolarDataResponse>> {
  const searchParams = request.nextUrl.searchParams;
  
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
  
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      {
        success: false,
        error: 'Coordinates out of range',
      },
      { status: 400 }
    );
  }
  
  const orientation = searchParams.get('orientation') ?? 'weiss-nicht';
  const mounting = searchParams.get('mounting') ?? 'weiss-nicht';
  const angleOverride = searchParams.get('angle');
  
  const aspect = ORIENTATION_TO_ASPECT[orientation] ?? ORIENTATION_TO_ASPECT['weiss-nicht'];
  
  const angle = angleOverride 
    ? parseFloat(angleOverride) 
    : (MOUNTING_TO_ANGLE[mounting] ?? MOUNTING_TO_ANGLE['weiss-nicht']);
  
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
      
      return NextResponse.json(
        {
          success: false,
          error: `PVGIS API error: ${String(response.status)} - ${errorText}`,
          fallbackUsed: true,
        },
        { status: 200 }
      );
    }
    
    const pvgisData: PVGISResponse = await response.json();
    
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
      { status: 200 }
    );
  }
}
