/**
 * Shared Constants for BKW Calculations
 * 
 * Contains all constants used across economic and ecological calculators.
 * Centralizing these ensures consistency and makes updates easier.
 */

import type {
  Orientation,
  ShadingLevel,
  HouseholdSize,
} from '@/types/economic';

// === LEGAL LIMITS ===

/**
 * LEGAL AC FEED-IN LIMIT (Germany)
 *
 * In Germany, Balkonkraftwerke (plug-in PV systems) are legally limited to a maximum
 * AC feed-in power of 800 W via the inverter. This cap is defined by grid safety regulations
 * and applies to the inverter's AC output, not the installed DC module power.
 *
 * All economic and ecological calculations must respect this cap for:
 * - maximum usable annual energy yield
 * - self-consumption calculations
 * - amortization time
 * - annual CO₂ savings and CO₂ payback period
 *
 * DO NOT expose this as a user input. It is a system constraint.
 */
export const LEGAL_AC_LIMIT_W = 800;

// === ELECTRICITY PRICES ===

/**
 * Electricity price in ct/kWh (2024/2025 average)
 * Source: BDEW Strompreisanalyse
 */
export const ELECTRICITY_PRICE_CT_PER_KWH = 40;

/**
 * Feed-in tariff for <10 kWp (EEG 2023)
 * Source: §48 Abs. 2 EEG
 */
export const FEED_IN_TARIFF_CT_PER_KWH = 8.2;

// === CO2 EMISSIONS ===

/**
 * CO2 emissions from German grid electricity (g/kWh)
 * Source: Umweltbundesamt 2023
 */
export const CO2_GRAMS_PER_KWH = 380;

// === YIELD FACTORS ===

/**
 * Base annual yield per Wp in Germany (kWh/Wp)
 * This is for optimal conditions (south, no shading)
 * Source: PVGIS for central Germany
 * FALLBACK VALUE - used when PVGIS API is unavailable
 */
export const BASE_YIELD_KWH_PER_WP = 0.95;

/**
 * Bifacial gain factor (additional yield from rear side)
 */
export const BIFACIAL_GAIN = 0.08; // 8% extra yield

// === ORIENTATION FACTORS ===
// Based on documentation and PVGIS data

export const ORIENTATION_FACTORS: Record<Orientation, number> = {
  'sueden': 1.0,      // Optimal, 100%
  'suedost': 0.95,    // 95%
  'suedwest': 0.95,   // 95%
  'westen': 0.80,     // 80% (doc says 85% but evening peak is lower)
  'osten': 0.80,      // 80%
  'norden': 0.55,     // 55% (significantly reduced)
  'weiss-nicht': 0.85, // Assume average
};

// === SHADING FACTORS ===
// Based on documentation

export const SHADING_FACTORS: Record<ShadingLevel, number> = {
  'keine': 1.0,           // No shading, 100%
  'etwas': 0.85,          // Some shading, 85%
  'mehrere-stunden': 0.65, // Multiple hours, 65%
  'ganzen-tag': 0.40,     // All day shade, 40%
};

// === SELF-CONSUMPTION RATES ===
// Based on documentation table

export interface SelfConsumptionConfig {
  baseRate: number;
  storageBonus: number;
}

export const SELF_CONSUMPTION_BY_HOUSEHOLD: Record<HouseholdSize, SelfConsumptionConfig> = {
  '1': { baseRate: 0.25, storageBonus: 0.20 },     // 1 person: 25% base, +20% with storage
  '2': { baseRate: 0.35, storageBonus: 0.20 },     // 2 persons: 35% base, +20% with storage
  '3-4': { baseRate: 0.40, storageBonus: 0.15 },   // 3-4 persons: 40% base, +15% with storage
  '5+': { baseRate: 0.45, storageBonus: 0.15 },    // 5+ persons: 45% base, +15% with storage
};

// === ANNUAL CONSUMPTION ESTIMATES ===
// Average German household consumption by size

export const ANNUAL_CONSUMPTION_KWH: Record<HouseholdSize, number> = {
  '1': 1500,    // 1 person
  '2': 2500,    // 2 persons
  '3-4': 3500,  // 3-4 persons
  '5+': 5000,   // 5+ persons
};

// === LABEL MAPPINGS ===

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  'sueden': 'Süden',
  'suedost': 'Südost',
  'suedwest': 'Südwest',
  'westen': 'Westen',
  'osten': 'Osten',
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
