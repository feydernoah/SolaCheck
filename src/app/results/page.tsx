'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BurgerMenu } from '@/components/BurgerMenu';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/LoadingScreen';
import { RecommendationCard } from '@/components/RecommendationCard';
import { useQuizProgress } from '@/hooks/useQuizProgress';
import { RecommendationResponse } from '@/types/economic';

export default function ResultsPage() {
  const router = useRouter();
  const { answers, resetWithConfirmation, isLoaded } = useQuizProgress();
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

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
        const response = await fetch('/solacheck/api/recommendation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ answers }),
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
  }, [answers, router, isLoaded]);

  const handleNewQuiz = () => {
    if (resetWithConfirmation()) {
      router.push('/');
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
      <BurgerMenu showHome showQuiz={false} onHomeClick={resetWithConfirmation} />

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

          {/* Recommendation Cards Section */}
          {recommendation.isRecommended && topRankings.length > 0 && (
            <div className="mb-12 animate-slide-up">
              <h2 className="text-heading-2 font-bold text-gray-800 mb-8 text-center">
                Unsere Top-Empfehlungen für dich
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {topRankings.map((ranking, index) => {
                  const badges = [
                    { text: '🥇 Beste Wahl', color: 'yellow' as const },
                    { text: '🥈 Zweite Wahl', color: 'blue' as const },
                    { text: '🥉 Dritte Wahl', color: 'green' as const },
                  ];
                  
                  return (
                    <div 
                      key={ranking.product.id} 
                      className="animate-scale-in" 
                      style={{ animationDelay: `${String(0.1 * (index + 1))}s` }}
                    >
                      <RecommendationCard
                        ranking={ranking}
                        badge={badges[index]?.text}
                        badgeColor={badges[index]?.color}
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
                      Alle gezeigten Modelle sind nach kürzester Amortisationszeit sortiert. 
                      Das bedeutet, du bekommst dein investiertes Geld am schnellsten zurück.
                      Die Empfehlungen basieren auf deinen Angaben zu Standort, Ausrichtung und Verbrauch.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {recommendation.isRecommended ? (
              <>
                <Link href="/carbon-footprint">
                  <Button variant="primary" size="lg" className="px-12">
                    CO₂-Bilanz berechnen →
                  </Button>
                </Link>
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
