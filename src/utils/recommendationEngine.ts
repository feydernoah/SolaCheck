import { BalconyPowerPlant, RecommendationResult } from '@/types/recommendations';
import { balconyPowerPlants } from '@/data/balconyPowerPlants';

// Interface für Standort-Daten
interface LocationData {
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

/**
 * Extrahiert Standortinformationen aus dem JSON-String
 */
function getLocationText(locationData: string | string[]): string {
  if (!locationData || typeof locationData !== 'string') {
    return '';
  }
  
  try {
    const parsed = JSON.parse(locationData) as LocationData;
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
 * Konvertiert Budget-Auswahl in maximalen Preis
 */
function getBudgetLimit(budget: string): number {
  switch (budget) {
    case 'bis-400':
      return 400;
    case '400-700':
      return 700;
    case '700-1000':
      return 1000;
    case '>1000':
      return Infinity;
    case 'weiss-nicht':
    default:
      return Infinity;
  }
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
  const maxBudget = getBudgetLimit(budget);
  
  // Wenn zu viel Schatten oder zu wenig Budget → keine Empfehlung
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

  // Filtere BKWs nach Budget
  const affordablePlants = balconyPowerPlants.filter(plant => plant.price <= maxBudget);
  
  // Berechne günstigstes, leistungsstärkstes und bestes Preis-Leistungs-Verhältnis
  const cheapest = [...affordablePlants].sort((a, b) => a.price - b.price)[0];
  const mostPowerful = [...affordablePlants].sort((a, b) => b.power - a.power)[0];
  
  // Sortiere nach Preis pro Watt für beste Preis-Leistung
  // Aber schließe bereits ausgewählte Modelle aus (cheapest und mostPowerful)
  const excludedIds = new Set([cheapest.id, mostPowerful.id].filter(Boolean));
  const remainingPlants = affordablePlants.filter(plant => !excludedIds.has(plant.id));
  
  // Falls nach Ausschluss noch Modelle übrig sind, wähle bestes Preis-Leistungs-Verhältnis
  // Ansonsten: Wähle das Modell mit dem besten Kompromiss (höchste Leistung bei niedrigstem Preis)
  let bestValue: BalconyPowerPlant | undefined;
  
  if (remainingPlants.length > 0) {
    // Normale Auswahl: Bester €/W Wert aus verbleibenden Modellen
    bestValue = [...remainingPlants]
      .sort((a, b) => (a.pricePerWatt ?? Infinity) - (b.pricePerWatt ?? Infinity))[0];
  } else if (affordablePlants.length > 2) {
    // Fallback: Wenn nur 2 unterschiedliche vorhanden sind (cheapest + mostPowerful identisch)
    // Wähle das mit dem zweitbesten Preis-Leistungs-Verhältnis
    const sorted = [...affordablePlants]
      .sort((a, b) => (a.pricePerWatt ?? Infinity) - (b.pricePerWatt ?? Infinity));
    bestValue = sorted[1] || sorted[0]; // Zweites Element oder erstes als Fallback
  } else {
    // Nur 1-2 Modelle verfügbar: Nimm das beste verfügbare
    bestValue = [...affordablePlants]
      .sort((a, b) => (a.pricePerWatt ?? Infinity) - (b.pricePerWatt ?? Infinity))[0];
  }

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
