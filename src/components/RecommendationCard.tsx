import { BalconyPowerPlant } from '@/types/recommendations';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface RecommendationCardProps {
  plant: BalconyPowerPlant;
  badge?: string;
  badgeColor?: 'yellow' | 'green' | 'blue';
}

export function RecommendationCard({ 
  plant, 
  badge,
  badgeColor = 'yellow'
}: RecommendationCardProps) {
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

      {/* Image Placeholder */}
      <div className="w-full h-40 bg-gradient-to-br from-yellow-50 to-gray-100 rounded-xl mb-4 flex items-center justify-center">
        <span className="text-gray-400 text-sm font-semibold">BKW Bild</span>
      </div>

      {/* Manufacturer & Name */}
      <h3 className="text-heading-3 font-bold text-gray-800 mb-1">
        {plant.name}
      </h3>
      <p className="text-body-sm text-gray-600 mb-4">
        {plant.manufacturer}
      </p>

      {/* Specs */}
      <div className="space-y-3 mb-6 flex-grow">
        {/* Power */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Leistung</span>
          <span className="text-body font-semibold text-gray-800">{plant.power} W</span>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Preis</span>
          <span className="text-heading-3 font-bold text-yellow-600">{plant.price} €</span>
        </div>

        {/* Price per Watt */}
        {plant.pricePerWatt && (
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-body-sm text-gray-600">€/Watt</span>
            <span className="text-body font-semibold text-gray-800">
              {plant.pricePerWatt.toFixed(2)} €
            </span>
          </div>
        )}

        {/* Warranty */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-body-sm text-gray-600">Garantie</span>
          <span className="text-body font-semibold text-gray-800">{plant.warranty} Jahre</span>
        </div>
      </div>

      {/* Description */}
      {plant.description && (
        <p className="text-body-sm text-gray-700 mb-6 italic">
          &quot;{plant.description}&quot;
        </p>
      )}

      {/* CTA Button */}
      <Button variant="primary" size="lg" fullWidth>
        Mehr Info →
      </Button>
    </Card>
  );
}
