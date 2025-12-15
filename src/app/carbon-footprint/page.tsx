'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BurgerMenu } from '@/components/BurgerMenu';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProductRanking } from '@/types/economic';

export default function CarbonFootprintPage() {
  const [ranking, setRanking] = useState<ProductRanking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ranking data is stored in sessionStorage
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('carbon-footprint-data');
      
      if (storedData) {
        try {
          const decodedRanking = JSON.parse(storedData) as ProductRanking;
          setRanking(decodedRanking);
        } catch (error) {
          console.error('Fehler beim Dekodieren der Produktdaten:', error);
        }
      }
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade CO₂-Bilanz...</p>
        </div>
      </div>
    );
  }

  if (!ranking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <BurgerMenu showHome showQuiz />
        <Card padding="lg" className="max-w-md">
          <h1 className="text-heading-2 font-bold text-gray-800 mb-4">Fehler</h1>
          <p className="text-body text-gray-700 mb-6">
            Keine Produktdaten verfügbar. Bitte versuchen Sie es erneut.
          </p>
          <Link href="/results">
            <Button variant="primary" size="lg" fullWidth>
              Zurück zu Ergebnissen
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { product, ecological, economics } = ranking;

  const getPaybackColor = (years: number) => {
    if (years < 2) return 'text-green-700 bg-green-50';
    if (years < 4) return 'text-yellow-700 bg-yellow-50';
    return 'text-orange-700 bg-orange-50';
  };

  // Kleiner Wald (100 Bäume) absorbiert pro Jahr ca. 2400 kg CO₂
  const forestAbsorptionPerYearKg = 100 * 24;
  const forestYearsToOffset = (ecological.lifecycleEmissionsKg / forestAbsorptionPerYearKg)*-1;

  return (
    <div className="min-h-screen bg-white">
      <BurgerMenu showHome showQuiz />

      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 md:py-16">
        <Card padding="lg" className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-4">
              CO₂-Bilanz
            </h1>
            <p className="text-heading-2 md:text-heading-1 font-semibold text-gray-700 mb-2">{product.name}</p>
            <p className="text-body text-gray-600">{product.brand}</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Manufacturing CO2 Section */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
              <h2 className="text-heading-2 font-bold text-orange-900 mb-4" style={{ fontSize: '1.875rem', lineHeight: '1.2' }}>Herstellung</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-md">
                  <span className="text-body-sm text-gray-700 font-bold">CO₂-Emissionen</span>
                  <span className="text-heading-3 font-bold text-orange-700">
                    {ecological.manufacturingCo2Kg.toFixed(1)} kg
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-md text-body-sm text-gray-700">
                  <p className="font-bold mb-2">Aufschlüsselung:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Rohstoffgewinnung: {ecological.resourceExtractionCo2Kg.toFixed(1)} kg</li>
                    <li>• Produktion: {ecological.productionCo2Kg.toFixed(1)} kg</li>
                    <li>• Transport: {ecological.transportCo2Kg.toFixed(1)} kg</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-md">
                  <p className="text-body-sm text-gray-700 font-bold mb-1">Herkunft</p>
                  <p className="text-body-sm text-gray-600">
                    {product.manufacturingOrigin === 'germany' && '🇩🇪 Deutschland'}
                    {product.manufacturingOrigin === 'europe' && '🇪🇺 Europa'}
                    {product.manufacturingOrigin === 'asia' && 'Asien'}
                    {product.manufacturingOrigin === 'china' && '🇨🇳 China'}
                    {product.manufacturingOrigin === 'unknown' && 'Unbekannt'}
                  </p>
                </div>
              </div>
            </div>

            {/* CO2 Payback Section */}
            <div className={`bg-gradient-to-br border rounded-lg p-6 ${
              getPaybackColor(ecological.paybackPeriodYears).includes('green')
                ? 'from-green-50 to-green-100 border-green-200'
                : getPaybackColor(ecological.paybackPeriodYears).includes('yellow')
                ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                : 'from-orange-50 to-orange-100 border-orange-200'
            }`}>
              <h2 className="text-heading-2 font-bold mb-4" style={{ fontSize: '1.875rem', lineHeight: '1.2' }}>CO₂-Amortisation</h2>
              <div className="space-y-4">
                <div className={`flex justify-between items-center p-4 rounded-lg shadow-md font-semibold text-white ${
                  getPaybackColor(ecological.paybackPeriodYears).includes('green')
                    ? 'bg-green-600'
                    : getPaybackColor(ecological.paybackPeriodYears).includes('yellow')
                    ? 'bg-yellow-600'
                    : 'bg-orange-600'
                }`}>
                  <span className="font-bold">Amortisationszeit</span>
                  <span className="text-heading-2">
                    {ecological.paybackPeriodYears < 1
                      ? `${String(Math.round(ecological.paybackPeriodYears * 12))} Monate`
                      : `${ecological.paybackPeriodYears.toFixed(1)} Jahre`}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-md">
                  <p className="text-body-sm text-gray-700">
                    Nach dieser Zeit hat das Kraftwerk durch die Stromerzeugung genauso viel CO₂ eingespart, 
                    wie bei der Herstellung ausgestoßen wurde.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lifecycle Section */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-green-900 mb-4" style={{ fontSize: '1.875rem', lineHeight: '1.2' }}>Lebenszyklusanalyse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-body-sm text-gray-600 font-bold mb-2">CO₂-Bilanz über die Garantiezeit von {product.warrantyYears} Jahren:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-display font-bold text-green-700">
                    {Math.abs(ecological.lifecycleEmissionsKg).toFixed(0)}
                  </span>
                  <span className="text-body-sm text-gray-600">kg CO₂ Gesamteinsparung</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-body-sm text-gray-600 mb-2 font-bold">Jährliche CO₂-Einsparung:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-display font-bold text-green-700">
                    {economics.co2SavingsKgPerYear.toFixed(0)}
                  </span>
                  <span className="text-body-sm text-gray-600">kg CO₂/Jahr</span>
                </div>
              </div>
            </div>

            {/* Wald-Vergleich */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow-md flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex justify-center md:justify-start shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/solacheck/z-image_00004_transparent.png"
                  alt="Kleiner Wald"
                  width="180"
                  height="120"
                  style={{ maxWidth: '180px', height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className="flex-1 text-left">
                <p className="text-body text-gray-800">
                  Ein kleiner Wald mit 100 Bäumen bräuchte etwa <span className="font-bold">{forestYearsToOffset.toFixed(1)} Jahre</span>,
                  um diese Menge an CO₂ aufzunehmen.
                </p>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-heading-1 font-bold text-gray-800 mb-4">Produktdetails</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-md">
                <p className="text-body-xs text-gray-600 mb-1">Leistung</p>
                <p className="text-body font-semibold text-gray-800">{product.wattage} Wp</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md">
                <p className="text-body-xs text-gray-600 mb-1">Garantie</p>
                <p className="text-body font-semibold text-gray-800">{product.warrantyYears} Jahre</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md">
                <p className="text-body-xs text-gray-600 mb-1">Preis</p>
                <p className="text-body font-semibold text-gray-800">{product.price} €</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md">
                <p className="text-body-xs text-gray-600 mb-1">Module</p>
                <p className="text-body font-semibold text-gray-800">{product.moduleCount}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md">
                <p className="text-body-xs text-gray-600 mb-1">Inverter</p>
                <p className="text-body font-semibold text-gray-800">{product.inverterBrand ?? 'Enthalten'}</p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-md">
                <p className="text-body-xs text-gray-600 mb-1">Bifazial</p>
                <p className="text-body font-semibold text-gray-800">{product.bifacial ? 'Ja' : 'Nein'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-4">
            <Link href="/results" className="flex-1">
              <Button variant="primary" size="lg" fullWidth>
                ← Zurück zu Ergebnissen
              </Button>
            </Link>
            <Link href="/quiz" className="flex-1">
              <Button variant="secondary" size="lg" fullWidth>
                Zurück zum Quiz
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
