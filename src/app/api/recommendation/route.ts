/**
 * API Route: /api/recommendation
 * 
 * Receives quiz answers and returns BKW product recommendations
 * sorted by shortest amortization time.
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateRecommendations } from '@/lib/economicCalculator';
import type { QuizAnswers, RecommendationResponse } from '@/types/economic';

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
 *     ...
 *   }
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "rankings": [...],
 *   "assumptions": {...},
 *   "quizSummary": {...},
 *   "filteredOutCount": 5
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse<RecommendationResponse>> {
  try {
    // Parse request body
    const body = await request.json() as { answers?: QuizAnswers };
    
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
          },
          quizSummary: {
            location: '',
            orientation: '',
            householdSize: '',
            budget: '',
            mountingLocation: '',
            shading: '',
          },
          filteredOutCount: 0,
          error: 'Missing or invalid answers object in request body',
        },
        { status: 400 }
      );
    }
    
    const answers = body.answers;
    
    // Calculate recommendations
    const result = calculateRecommendations(answers);
    
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
        },
        quizSummary: {
          location: '',
          orientation: '',
          householdSize: '',
          budget: '',
          mountingLocation: '',
          shading: '',
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
export function GET(): NextResponse<RecommendationResponse> {
  // Sample quiz answers for testing
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
    11: '700-1000',
    12: 'wichtig',
  };
  
  const result = calculateRecommendations(sampleAnswers);
  
  return NextResponse.json(result, { status: 200 });
}
