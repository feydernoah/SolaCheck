import { BalconyPowerPlant, RecommendationResult } from '@/types/recommendations';

// Mock-Daten für BKWs
const mockBalconyPowerPlants: BalconyPowerPlant[] = [
  {
    id: 'aukee-400',
    name: 'AuKEE 400W',
    manufacturer: 'AuKEE',
    power: 400,
    price: 299,
    efficiency: 22,
    warranty: 10,
    description: 'Kompakt und anfängerfreundlich',
    pricePerWatt: 0.75,
  },
  {
    id: 'deye-800',
    name: 'DEYE 800W',
    manufacturer: 'DEYE',
    power: 800,
    price: 649,
    efficiency: 22.5,
    warranty: 12,
    description: 'Doppelmodule für maximale Leistung',
    pricePerWatt: 0.81,
  },
  {
    id: 'trina-600',
    name: 'Trina 600W',
    manufacturer: 'Trina Solar',
    power: 600,
    price: 449,
    efficiency: 23,
    warranty: 15,
    description: 'Beste Preis-Leistungs-Ratio',
    pricePerWatt: 0.75,
  },
  {
    id: 'longi-800',
    name: 'LONGi 800W Premium',
    manufacturer: 'LONGi',
    power: 800,
    price: 799,
    efficiency: 24,
    warranty: 15,
    description: 'Premium Qualität mit höchster Effizienz',
    pricePerWatt: 0.99,
  },
  {
    id: 'growatt-600',
    name: 'Growatt 600W',
    manufacturer: 'Growatt',
    power: 600,
    price: 399,
    efficiency: 22,
    warranty: 10,
    description: 'Zuverlässig und günstig',
    pricePerWatt: 0.67,
  },
];

/**
 * Extrahiert Standortinformationen aus dem JSON-String
 */
function getLocationText(locationData: string | string[]): string {
  if (!locationData || typeof locationData !== 'string') {
    return '';
  }
  
  try {
    const parsed = JSON.parse(locationData);
    if (parsed.city && parsed.postalCode) {
      return `${parsed.city} (${parsed.postalCode})`;
    } else if (parsed.city) {
      return parsed.city;
    }
  } catch {
    // Falls es kein JSON ist, direkt zurückgeben
    return locationData;
  }
  
  return '';
}

/**
 * Bestimmt basierend auf Quiz-Antworten, ob ein BKW empfohlen wird
 * und wählt passende Modelle aus
 */
export function generateRecommendation(answers: Record<number, string | string[]>): RecommendationResult {
  // Mock-Logik: Empfehlung basierend auf Budget und Standort
  const budget = answers[11] as string; // Frage 11: Budget
  const locationRaw = answers[2] as string; // Frage 2: Standort
  const shadow = answers[9] as string; // Frage 9: Verschattung
  const direction = answers[7] as string; // Frage 7: Himmelsrichtung
  
  const locationText = getLocationText(locationRaw);
  
  // Wenn zu viel Schatten oder zu wenig Budget → kein Empfehlung
  const isRecommended = 
    shadow !== 'ganzen-tag' && 
    budget !== 'weiss-nicht';

  if (!isRecommended) {
    return {
      isRecommended: false,
      recommendation: 'Leider nicht ideal für ein Balkonkraftwerk',
      reasoning: 'Basierend auf deinen Angaben ist ein Balkonkraftwerk für dich aktuell nicht die beste Lösung. Entweder ist der Standort zu stark verschattet oder das Budget noch unklar. Wir empfehlen dir, die Bedingungen nochmal zu überprüfen oder zu einem späteren Zeitpunkt erneut zu bewerten.',
    };
  }

  // Berechne günstigstes, leistungsstärkstes und bestes Preis-Leistungs-Verhältnis
  const cheapest = [...mockBalconyPowerPlants].sort((a, b) => a.price - b.price)[0];
  const mostPowerful = [...mockBalconyPowerPlants].sort((a, b) => b.power - a.power)[0];
  
  // Sortiere nach Preis pro Watt für beste Preis-Leistung
  const bestValue = [...mockBalconyPowerPlants]
    .sort((a, b) => (a.pricePerWatt ?? Infinity) - (b.pricePerWatt ?? Infinity))[0];

  // Erstelle personalisierten Text basierend auf Antworten
  let reasoningText = 'Basierend auf deinen Angaben sind die Bedingungen für ein Balkonkraftwerk sehr gut! ';
  
  if (locationText) {
    reasoningText += `Dein Standort in ${locationText} bietet ausreichend Sonneneinstrahlung. `;
  } else {
    reasoningText += 'Dein Standort bietet ausreichend Sonneneinstrahlung. ';
  }
  
  // Ergänze Info zur Ausrichtung falls vorhanden
  if (direction === 'sueden' || direction === 'suedost' || direction === 'suedwest') {
    reasoningText += 'Die südliche Ausrichtung ist optimal für maximale Energiegewinnung. ';
  } else if (direction === 'osten' || direction === 'westen') {
    reasoningText += 'Die Ausrichtung ermöglicht eine gute Energiegewinnung. ';
  }
  
  reasoningText += 'Hier sind unsere Top-Empfehlungen für dich:';

  return {
    isRecommended: true,
    recommendation: '✓ Ein Balkonkraftwerk ist für dich eine gute Wahl!',
    reasoning: reasoningText,
    cheapest,
    mostPowerful,
    bestValue,
  };
}
