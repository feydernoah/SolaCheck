/**
 * Centralized Quiz Question IDs
 * 
 * This is the SINGLE SOURCE OF TRUTH for question IDs.
 * Both the quiz page and the recommendation engine import from here.
 * 
 * If you reorder or add questions, update this file and both consumers
 * will automatically use the correct IDs.
 */

export const QUESTION_IDS = {
  /** Question 1: Location (PLZ/City) - stores coordinates as JSON */
  LOCATION: 1,
  /** Question 2: Household size (1, 2, 3-4, 5+) */
  HOUSEHOLD_SIZE: 2,
  /** Question 3: Housing type (mietwohnung, eigentumswohnung, etc.) */
  HOUSING_TYPE: 3,
  /** Question 4: Apartment/house size in m² */
  APARTMENT_SIZE: 4,
  /** Question 5: Mounting location (balkonbruestung, hauswand, etc.) */
  MOUNTING_LOCATION: 5,
  /** Question 6: Orientation/compass direction (sueden, norden, etc.) */
  ORIENTATION: 6,
  /** Question 7: Balcony size (klein, mittel, gross) */
  BALCONY_SIZE: 7,
  /** Question 8: Shading level (keine, etwas, mehrere-stunden, ganzen-tag) */
  SHADING: 8,
  /** Question 9: Appliances used (multiselect array) */
  APPLIANCES: 9,
  /** Question 10: User-provided yearly electricity consumption in kWh (optional) */
  CONSUMPTION: 10,
  /** Question 11: Budget in € (0 = no limit) */
  BUDGET: 11,
  /** Question 12: CO₂/ecological importance (sehr-wichtig, wichtig, nebensaechlich) */
  ECO_IMPORTANCE: 12,
} as const;

/** Type for valid question IDs */
export type QuestionId = typeof QUESTION_IDS[keyof typeof QUESTION_IDS];

/** All valid question IDs as an array (for validation) */
export const VALID_QUESTION_IDS = Object.values(QUESTION_IDS);

/** Total number of questions in the quiz */
export const TOTAL_QUESTIONS = VALID_QUESTION_IDS.length;
