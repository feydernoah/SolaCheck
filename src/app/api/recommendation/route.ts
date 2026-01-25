import { NextRequest, NextResponse } from 'next/server';
import { calculateRecommendations } from '@/lib/recommendationEngine';
import { QUESTION_IDS } from '@/lib/quizConstants';
import type { QuizAnswers, RecommendationResponse, SolarData } from '@/types/economic';

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

export async function POST(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  try {
    const body = await request.json() as { 
      answers?: QuizAnswers;
      solarData?: SolarData;
    };
    
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
    
    let solarData: SolarData | null | undefined = body.solarData;
    
    if (!solarData && answers.coordinates) {
      solarData = await fetchPVGISData(
        answers.coordinates.lat,
        answers.coordinates.lon,
        answers[QUESTION_IDS.ORIENTATION],
        answers[QUESTION_IDS.MOUNTING_LOCATION]
      );
    }
    
    const result = calculateRecommendations(answers, solarData ?? undefined);
    
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

export async function GET(): Promise<NextResponse<RecommendationResponse>> {
  const sampleAnswers: QuizAnswers = {
    1: '25-34',
    2: 'Berlin',
    3: '2',
    4: 'mietwohnung',
    5: '40-70',
    6: 'balkonbruestung',
    7: 'sueden',
    8: 'mittel',
    9: ['kuehlschrank', 'waschmaschine', 'laptop'],
    10: '1200',
    11: 'etwas',
    12: 'wichtig',
    coordinates: { lat: 52.52, lon: 13.405 },
  };
  
  const coords = sampleAnswers.coordinates;
  const solarData = coords 
    ? await fetchPVGISData(
        coords.lat,
        coords.lon,
        sampleAnswers[QUESTION_IDS.ORIENTATION],
        sampleAnswers[QUESTION_IDS.MOUNTING_LOCATION]
      )
    : null;
  
  const result = calculateRecommendations(sampleAnswers, solarData ?? undefined);
  
  return NextResponse.json(result, { status: 200 });
}
