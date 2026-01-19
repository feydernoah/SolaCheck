'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BurgerMenu } from '@/components/BurgerMenu';
import { useResetConfirmation } from '@/components/ResetConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { RecommendationCard } from '@/components/RecommendationCard';
import { useQuizProgress } from '@/hooks/useQuizProgress';
import { useSolarData } from '@/hooks/useSolarData';
import { RecommendationResponse, QuizAnswers, Coordinates } from '@/types/economic';
import { initEmailJS, sendRecommendationEmail } from '@/lib/emailService';

/**
 * Extract coordinates from the address answer (stored as JSON string)
 */
function extractCoordinatesFromAnswers(answers: Record<number, string | string[]>): Coordinates | undefined {
  const addressAnswer = answers[1];
  if (typeof addressAnswer !== 'string') return undefined;
  
  try {
    const parsed = JSON.parse(addressAnswer) as { lat?: number; lon?: number; coordinates?: Coordinates };
    
    // New format: direct coordinates { lat, lon }
    if (typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
      return { lat: parsed.lat, lon: parsed.lon };
    }
    
    // Old format: nested coordinates { coordinates: { lat, lon } }
    const coords = parsed.coordinates;
    if (coords && typeof coords.lat === 'number' && typeof coords.lon === 'number') {
      return coords;
    }
  } catch {
    // Not JSON or no coordinates
  }
  return undefined;
}

export default function ResultsPage() {
  const router = useRouter();
  const { answers, isLoaded } = useQuizProgress();
  const { confirmAndReset } = useResetConfirmation();
  const { fetchSolarData, getSolarDataFromCookie } = useSolarData();
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  // Email form state
  const [emailInput, setEmailInput] = useState('');
  const [includeCarbonFootprint, setIncludeCarbonFootprint] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(emailInput);
  // Show error only if user has typed something and it's invalid
  const showEmailError = emailInput.length > 0 && !isEmailValid;

  useEffect(() => { initEmailJS(); }, []);

  useEffect(() => {
    // Wait for cookie to be loaded before checking answers
    if (!isLoaded || hasFetched) {
      return;
    }

    const fetchRecommendation = async () => {
      // Wenn keine Antworten vorhanden, zurück zum Quiz
      if (Object.keys(answers).length === 0) {
        router.push('/quiz');
        return;
      }

      setHasFetched(true);

      try {
        // Extract coordinates from address answer
        const coordinates = extractCoordinatesFromAnswers(answers);
        
        // Build quiz answers with coordinates for the API
        const quizAnswers: QuizAnswers = {
          ...answers as unknown as QuizAnswers,
          coordinates,
        };
        
        // Try to get cached solar data from cookie first
        let cachedSolarData = getSolarDataFromCookie();
        
        // If we have coordinates but no cached data, fetch PVGIS data
        if (coordinates && !cachedSolarData) {
          const orientation = answers[6] as string | undefined;
          const mounting = answers[5] as string | undefined;
          cachedSolarData = await fetchSolarData(coordinates, orientation, mounting);
        }
        
        const response = await fetch('/solacheck/api/recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            answers: quizAnswers,
            solarData: cachedSolarData, // Pass cached data to avoid double fetch
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendation');
        }

        const data = await response.json() as RecommendationResponse;
        setRecommendation(data);
      } catch (err) {
        console.error('Error fetching recommendation:', err);
        setError('Es gab einen Fehler beim Laden der Empfehlung. Bitte versuche es erneut.');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchRecommendation();
  }, [answers, router, isLoaded, hasFetched, fetchSolarData, getSolarDataFromCookie]);

  const handleNewQuiz = () => {
    confirmAndReset({ navigateTo: '/' });
  };

  const handleSendEmail = async () => {
    // Validate email input
    if (!emailInput || !isEmailValid) {
      setEmailStatus({
        type: 'error',
        message: 'Bitte gib eine gültige E-Mail-Adresse ein (z.B. beispiel@email.de).',
      });
      return;
    }

    // Check if we have recommendations
    if (!recommendation?.rankings.length) {
      setEmailStatus({
        type: 'error',
        message: 'Keine Empfehlungen zum Versenden vorhanden.',
      });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      // Send email with recommendations
      const result = await sendRecommendationEmail({
        toEmail: emailInput,
        recommendations: recommendation.rankings,
        includeCarbonFootprint,
      });

      if (result.success) {
        setEmailStatus({
          type: 'success',
          message: `E-Mail erfolgreich an ${emailInput} gesendet!`,
        });
        // Clear email input on success
        setEmailInput('');
        setIncludeCarbonFootprint(false);
      } else {
        setEmailStatus({
          type: 'error',
          message: result.error ?? 'Fehler beim Versenden der E-Mail.',
        });
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setEmailStatus({
        type: 'error',
        message: 'Ein unerwarteter Fehler ist aufgetreten.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen isVisible={true} />;
  }

  if (error || !recommendation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card padding="lg" className="max-w-md text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-heading-2 font-bold text-gray-800 mb-4">
            Etwas ist schiefgelaufen
          </h1>
          <p className="text-body text-gray-600 mb-6">
            {error ?? 'Keine Empfehlung verfügbar.'}
          </p>
          <Button variant="primary" onClick={() => router.push('/quiz')}>
            Zurück zum Quiz
          </Button>
        </Card>
      </div>
    );
  }

  // Get top 3 rankings for display
  const topRankings = recommendation.rankings.slice(0, 3);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Burger Menu */}
      <BurgerMenu showHome showQuiz={false} confirmOnHome />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 md:py-16">
        <div className="w-full max-w-5xl">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            {recommendation.isRecommended ? (
              <>
                <div className="mb-6 flex justify-center">
                  <Image
                    src="/solacheck/SolaGluecklich.png"
                    alt="Sola Happy"
                    width={150}
                    height={150}
                    className="w-28 md:w-36 h-auto"
                    unoptimized
                  />
                </div>
                <h1 className="text-display md:text-display-lg font-bold text-gray-800 mb-4">
                  ✓ Ein Balkonkraftwerk ist für dich eine gute Wahl!
                </h1>
              </>
            ) : (
              <>
                <div className="mb-6 flex justify-center">
                  <Image
                    src="/solacheck/SolaNachdenklich.png"
                    alt="Sola Nachdenklich"
                    width={150}
                    height={150}
                    className="w-28 md:w-36 h-auto"
                    unoptimized
                  />
                </div>
                <h1 className="text-heading-1 md:text-display font-bold text-gray-800 mb-4">
                  Leider nicht ideal für ein Balkonkraftwerk
                </h1>
              </>
            )}

            <p className="text-body-lg text-gray-700 max-w-2xl mx-auto">
              {recommendation.recommendationReason}
            </p>
          </div>

          {/* AC Limit Disclaimer */}
          {recommendation.isRecommended && topRankings.length > 0 && (
            <div className="mb-12 animate-slide-up">
              <Card padding="md" className="mb-6 bg-yellow-50 border-yellow-200">
                <div className="flex gap-3 items-center">
                  <div className="text-xl">⚖️</div>
                  <div className="text-body text-gray-800">
                    <strong>Hinweis:</strong> Alle ökonomischen und ökologischen Berechnungen basieren auf der maximal zulässigen AC-Einspeiseleistung von 800 W, unabhängig von der installierten Modulleistung.
                  </div>
                </div>
              </Card>
              <h2 className="text-heading-2 font-bold text-gray-800 mb-8 text-center">
                Unsere Top-Empfehlungen für dich
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {topRankings.map((ranking, index) => {
                  // Feature-based badges with distinct colors
                  const badges: { text: string; color: 'yellow' | 'blue' | 'green' }[] = [
                    { text: '🌱 Beste CO₂-Bilanz', color: 'green' },
                    { text: '✅ Gute Alternative', color: 'blue' },
                    { text: '✅ Solide Option', color: 'yellow' },
                  ];
                  
                  const badge = badges[index] ?? badges[2];
                  
                  return (
                    <div 
                      key={ranking.product.id} 
                      className="animate-scale-in" 
                      style={{ animationDelay: `${String(0.1 * (index + 1))}s` }}
                    >
                      <RecommendationCard
                        ranking={ranking}
                        badge={badge.text}
                        badgeColor={badge.color}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Info Box */}
              <Card padding="lg" className="mb-8 bg-blue-50 border-blue-200">
                <div className="flex gap-4">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="text-heading-3 font-bold text-gray-800 mb-2">
                      Noch Fragen?
                    </h3>
                    <p className="text-body text-gray-700">
                      Alle gezeigten Modelle sind nach bester CO₂-Bilanz sortiert. 
                      Das bedeutet, die Herstellungs-Emissionen werden am schnellsten durch eingesparten Strom ausgeglichen.
                      Die Empfehlungen basieren auf deinen Angaben zu Standort, Ausrichtung und Verbrauch.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Email Results Box */}
              <Card padding="lg" className="mb-8 bg-yellow-50 border-yellow-200">
                <div className="flex gap-4">
                  <div className="text-2xl">📧</div>
                  <div className="flex-1">
                    <h3 className="text-heading-3 font-bold text-gray-800 mb-2">
                      Ergebnis per E-Mail erhalten
                    </h3>
                    <p className="text-body text-gray-700 mb-4">
                      Lass dir deine personalisierten Empfehlungen direkt per E-Mail zusenden.
                    </p>
                    
                    {/* Email Input */}
                    <div className="mb-3">
                      <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
                        E-Mail-Adresse
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        placeholder="deine@email.de"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-colors ${
                          showEmailError
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'
                        }`}
                        disabled={isSendingEmail}
                      />
                      {showEmailError && (
                        <p className="mt-1 text-sm text-red-600">
                          Bitte gib eine gültige E-Mail-Adresse ein (z.B. beispiel@email.de)
                        </p>
                      )}
                    </div>

                    {/* Checkbox for CO2 Data */}
                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeCarbonFootprint}
                          onChange={(e) => setIncludeCarbonFootprint(e.target.checked)}
                          className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                          disabled={isSendingEmail}
                        />
                        <span className="text-sm text-gray-700">
                          CO₂-Daten einbinden
                        </span>
                      </label>
                    </div>

                    {/* Send Button */}
                    <Button
                      variant="primary"
                      onClick={() => void handleSendEmail()}
                      disabled={isSendingEmail || !emailInput || !isEmailValid}
                      className="w-full sm:w-auto"
                    >
                      {isSendingEmail ? 'Wird gesendet...' : 'Ergebnis erhalten'}
                    </Button>

                    {/* Status Message */}
                    {emailStatus && (
                      <div
                        className={`mt-4 p-3 rounded-lg ${
                          emailStatus.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">
                            {emailStatus.type === 'success' ? '✅' : '❌'}
                          </span>
                          <p className="text-sm flex-1">{emailStatus.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {recommendation.isRecommended ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-12"
                  onClick={handleNewQuiz}
                >
                  Neues Quiz starten
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="px-12"
                onClick={handleNewQuiz}
              >
                Zur Startseite
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
