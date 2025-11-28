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
import { generateRecommendation } from '@/utils/recommendationEngine';
import { RecommendationResult } from '@/types/recommendations';

export default function ResultsPage() {
  const router = useRouter();
  const { answers, resetProgress } = useQuizProgress();
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuliere Ladezeit (1.5 Sekunden)
    const timer = setTimeout(() => {
      // Wenn keine Antworten vorhanden, zurück zum Quiz
      if (Object.keys(answers).length === 0) {
        router.push('/quiz');
        return;
      }

      // Generiere Empfehlung basierend auf Antworten
      const result = generateRecommendation(answers);
      setRecommendation(result);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [answers, router]);

  if (!recommendation) {
    return <LoadingScreen isVisible={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Burger Menu */}
      <BurgerMenu showHome showQuiz={false} />

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
                  {recommendation.recommendation}
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
                  {recommendation.recommendation}
                </h1>
              </>
            )}

            <p className="text-body-lg text-gray-700 max-w-2xl mx-auto">
              {recommendation.reasoning}
            </p>
          </div>

          {/* Recommendation Cards Section */}
          {recommendation.isRecommended && (
            <div className="mb-12 animate-slide-up">
              <h2 className="text-heading-2 font-bold text-gray-800 mb-8 text-center">
                Unsere Top-Empfehlungen für dich
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Cheapest */}
                {recommendation.cheapest && (
                  <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <RecommendationCard
                      plant={recommendation.cheapest}
                      badge="💰 Günstigstes"
                      badgeColor="blue"
                    />
                  </div>
                )}

                {/* Best Value */}
                {recommendation.bestValue && (
                  <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
                    <RecommendationCard
                      plant={recommendation.bestValue}
                      badge="⭐ Beste Preis-Leistung"
                      badgeColor="yellow"
                    />
                  </div>
                )}

                {/* Most Powerful */}
                {recommendation.mostPowerful && (
                  <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
                    <RecommendationCard
                      plant={recommendation.mostPowerful}
                      badge="⚡ Maximale Leistung"
                      badgeColor="green"
                    />
                  </div>
                )}
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
                      Alle gezeigten Modelle sind zuverlässig und haben gute Kundenbewertungen. 
                      Wähle basierend auf deinem Budget und deinen Prioritäten. 
                      Klick auf &quot;Mehr Info&quot; für detaillierte Spezifikationen.
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
                  onClick={() => {
                    resetProgress();
                    router.push('/');
                  }}
                >
                  Neues Quiz starten
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="px-12"
                onClick={() => {
                  resetProgress();
                  router.push('/');
                }}
              >
                Zur Startseite
              </Button>
            )}
          </div>

          {/* Additional Info */}
          <Card padding="md" className="bg-gray-50 text-center">
            <p className="text-body-sm text-gray-600">
              💾 Deine Quiz-Antworten werden nicht gespeichert. 
              Bei erneutem Besuch startest du wieder von vorne.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
