/**
 * SNAPSHOT: Original Design (Current State)
 * - Rounded corners (rounded-lg, rounded-xl)
 * - Yellow/Green/Orange color scheme
 * - Soft backgrounds (50 intensity)
 * - Modern styling with transitions
 * 
 * Saved: 2025-12-04 - Baseline for comparison
 */

'use client';

import { useState } from 'react';
import { ProductRanking } from '@/types/economic';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface RecommendationCardProps {
  ranking: ProductRanking;
  badge?: string;
  badgeColor?: 'yellow' | 'green' | 'blue';
}

export function RecommendationCard({ 
  ranking, 
  badge,
  badgeColor = 'yellow'
}: RecommendationCardProps) {
  const { product, economics, ecological, ecologicalReasons, ecologicalWarnings } = ranking;
  const [isEcoOpen, setIsEcoOpen] = useState(false);
  
  const badgeColors = {
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
  };

  // Bestimme Payback-Farbe basierend auf Jahren
  const getPaybackColor = (years: number) => {
    if (years < 2) return 'text-green-700 bg-green-50';
    if (years < 4) return 'text-yellow-700 bg-yellow-50';
    return 'text-orange-700 bg-orange-50';
  };

  return (
    <Card padding="lg" hover className="flex flex-col h-full transition-all duration-300">
      {/* Badge */}
      {badge && (
        <div className="mb-4 flex justify-between items-start">
          <span className={`inline-block ${badgeColors[badgeColor]} text-sm font-bold px-3 py-1 rounded-full`}>
            {badge}
          </span>
        </div>
      )}

      {/* Image Placeholder */}
      <div className="w-full h-40 bg-linear-to-br from-yellow-50 to-gray-100 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-gray-400 text-sm font-semibold">BKW Bild</span>
      </div>

      {/* Manufacturer & Name */}
      <h3 className="text-heading-3 font-bold text-gray-800 mb-1">
        {product.name}
      </h3>
      <p className="text-body-sm text-gray-600 mb-4">
        {product.brand}
      </p>

      {/* Specs */}
      <div className="space-y-3 mb-6">
        {/* Power */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Leistung</span>
          <span className="text-body font-semibold text-gray-800">{product.wattage} Wp</span>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Preis</span>
          <span className="text-heading-3 font-bold text-yellow-600">{product.price} €</span>
        </div>

        {/* Amortization */}
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Amortisation</span>
          <span className="text-body font-semibold text-green-700">
            {economics.amortizationYears.toFixed(1)} Jahre
          </span>
        </div>

        {/* Annual Savings */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Ersparnis/Jahr</span>
          <span className="text-body font-semibold text-gray-800">
            {Math.round(economics.annualSavingsEuro)} €
          </span>
        </div>

        {/* Warranty */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Garantie</span>
          <span className="text-body font-semibold text-gray-800">{product.warrantyYears} Jahre</span>
        </div>

      </div>

      {/* Umwelt & Nachhaltigkeit - Collapsible Section */}
      <div className="mb-4">
        <button 
          onClick={() => setIsEcoOpen(!isEcoOpen)}
          className="w-full cursor-pointer p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
        >
          <div className="flex justify-between items-center">
            <span className="text-body font-semibold text-green-800">🌱 Umwelt & Nachhaltigkeit</span>
            <span className={`text-green-600 transition-transform duration-300 ${isEcoOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
        </button>
        
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isEcoOpen ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-3">
          {/* CO2 Payback Period */}
          {ecological && (
            <div className={`flex justify-between items-center p-3 rounded-lg ${getPaybackColor(ecological.paybackPeriodYears)}`}>
              <span className="text-body-sm text-gray-700 font-medium">CO₂-Amortisation</span>
              <span className="text-body font-semibold">
                {ecological.paybackPeriodYears < 1 
                  ? `${Math.round(ecological.paybackPeriodYears * 12)} Monate`
                  : `${ecological.paybackPeriodYears.toFixed(1)} Jahre`
                }
              </span>
            </div>
          )}

          {/* CO2 Lifecycle */}
          {ecological && (
            <div className={`flex flex-col p-3 rounded-lg ${getPaybackColor(ecological.paybackPeriodYears)}`}>
              <span className="text-body-sm text-gray-700 font-medium mb-2">CO₂-Bilanz (25 Jahre) :</span>
              <span className="text-body font-semibold">
                {ecological.lifecycleEmissionsKg < 0
                  ? `${Math.round(-ecological.lifecycleEmissionsKg)} kg CO₂ über die Lebensdauer eingespart!`
                  : `${Math.round(ecological.lifecycleEmissionsKg)} kg CO₂ produziert. :(` 
                }
              </span>
            </div>
          )}

          {/* Umweltvorteile */}
          {ecologicalReasons && ecologicalReasons.length > 0 && (
            <div className="bg-green-50 rounded-lg border border-green-200 p-3">
              <p className="text-body-sm font-semibold text-green-800 mb-2">♻️ Umweltvorteile</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {ecologicalReasons.map((reason, idx) => (
                      <tr key={idx} className="border-t border-green-100">
                        <td className="py-2 pr-4 align-top text-green-800">{idx + 1}.</td>
                        <td className="py-2 text-green-700">{reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warnings */}
          {ecologicalWarnings && ecologicalWarnings.length > 0 && (
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-3">
              <p className="text-body-sm font-semibold text-orange-800 mb-2">⚠️ Aber Achtung...</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {ecologicalWarnings.map((warn, idx) => (
                      <tr key={idx} className="border-t border-orange-100">
                        <td className="py-2 pr-4 align-top text-orange-800">{idx + 1}.</td>
                        <td className="py-2 text-orange-700">{warn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-body-sm text-gray-700 mb-6 italic">
          &quot;{product.description}&quot;
        </p>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-grow"></div>

      {/* CTA Button */}
      <Button variant="primary" size="lg" fullWidth>
        Mehr Info →
      </Button>
    </Card>
  );
}
