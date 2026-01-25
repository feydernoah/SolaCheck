import type {
  Orientation,
  ShadingLevel,
  HouseholdSize,
} from '@/types/economic';

export const LEGAL_AC_LIMIT_W = 800;

export const ELECTRICITY_PRICE_CT_PER_KWH = 40;

export const FEED_IN_TARIFF_CT_PER_KWH = 8.2;

export const CO2_GRAMS_PER_KWH = 380;

export const BASE_YIELD_KWH_PER_WP = 0.95;

export const BIFACIAL_GAIN = 0.08;

export const BATTERY_EFFICIENCY = 0.90;

export const ORIENTATION_FACTORS: Record<Orientation, number> = {
  'sueden': 1.0,
  'suedost': 0.95,
  'suedwest': 0.95,
  'westen': 0.80,
  'osten': 0.80,
  'nordost': 0.65,
  'nordwest': 0.65,
  'norden': 0.55,
  'weiss-nicht': 0.85,
};

export const SHADING_FACTORS: Record<ShadingLevel, number> = {
  'keine': 1.0,
  'etwas': 0.85,
  'mehrere-stunden': 0.65,
  'ganzen-tag': 0.40,
};

export interface SelfConsumptionConfig {
  baseRate: number;
  storageBonus: number;
}

export const SELF_CONSUMPTION_BY_HOUSEHOLD: Record<HouseholdSize, SelfConsumptionConfig> = {
  '1': { baseRate: 0.25, storageBonus: 0.20 },
  '2': { baseRate: 0.35, storageBonus: 0.20 },
  '3-4': { baseRate: 0.40, storageBonus: 0.15 },
  '5+': { baseRate: 0.45, storageBonus: 0.15 },
};

export const ANNUAL_CONSUMPTION_KWH: Record<HouseholdSize, number> = {
  '1': 1500,
  '2': 2500,
  '3-4': 3500,
  '5+': 5000,
};

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  'sueden': 'Süden',
  'suedost': 'Südost',
  'suedwest': 'Südwest',
  'westen': 'Westen',
  'osten': 'Osten',
  'nordost': 'Nordost',
  'nordwest': 'Nordwest',
  'norden': 'Norden',
  'weiss-nicht': 'Unbekannt',
};

export const HOUSEHOLD_LABELS: Record<HouseholdSize, string> = {
  '1': '1 Person',
  '2': '2 Personen',
  '3-4': '3-4 Personen',
  '5+': '5+ Personen',
};

export const SHADING_LABELS: Record<ShadingLevel, string> = {
  'keine': 'Keine/kaum Verschattung',
  'etwas': 'Etwas Schatten',
  'mehrere-stunden': 'Mehrere Stunden Schatten',
  'ganzen-tag': 'Fast ganztags Schatten',
};

export const MOUNTING_LABELS: Record<string, string> = {
  'balkonbruestung': 'Balkonbrüstung',
  'balkonboden': 'Balkonboden/Terrasse',
  'hauswand': 'Hauswand',
  'flachdach': 'Flachdach',
  'weiss-nicht': 'Verschiedene Montageorte',
};

export const ECO_IMPORTANCE_LABELS: Record<string, string> = {
  'sehr-wichtig': 'Sehr wichtig',
  'wichtig': 'Wichtig',
  'nebensaechlich': 'Eher nebensächlich',
};
