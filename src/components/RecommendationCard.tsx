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
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { product, economics } = ranking;
  const [imageError, setImageError] = useState(false);
  
  const badgeColors = {
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
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

      {/* Product Image */}
      <div className="w-full h-40 bg-linear-to-br from-yellow-50 to-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl && !imageError ? (
          <Image 
            src={product.imageUrl} 
            alt={product.name}
            fill
            className="object-contain p-2"
            onError={() => setImageError(true)}
            unoptimized // External images from FAZ
          />
        ) : (
          <span className="text-gray-400 text-sm font-semibold">BKW Bild</span>
        )}
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

      {/* Description */}
      {product.description && (
        <p className="text-body-sm text-gray-700 mb-6 italic">
          &quot;{product.description}&quot;
        </p>
      )}

      {/* Spacer to push button to bottom */}
      <div className="grow"></div>

      {/* CTA Button */}
      <Button 
        variant="primary" 
        size="lg" 
        fullWidth
        onClick={() => {
          // Store ranking data in sessionStorage to avoid long URLs
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('carbon-footprint-data', JSON.stringify(ranking));
          }
          router.push('/carbon-footprint');
        }}
      >
        CO₂ Bilanz anzeigen →
      </Button>
    </Card>
  );
}
