import { test, expect } from '@playwright/test';
import { calculateProductEconomics, LEGAL_AC_LIMIT_W } from '../src/lib/economicCalculator';
import { calculateProductEcological } from '../src/lib/ecologicCalculator';
import type { BKWProduct } from '../src/types/economic';

test.describe('Economic and Ecological Calculators (AC Limit)', () => {
  const baseProduct: BKWProduct = {
    id: 'test-bkw',
    name: 'Test BKW',
    brand: 'TestBrand',
    wattage: 1200, // DC > AC
    moduleCount: 2,
    price: 1000,
    includesInverter: true,
    inverterBrand: 'TestInverter',
    inverterACPower: 800, // Legal limit
    includesStorage: false,
    mountingTypes: ['balkonbruestung'],
    bifacial: false,
    moduleEfficiency: 20,
    warrantyYears: 20,
    description: 'Test product',
    manufacturingOrigin: 'china',
    manufacturingCo2Kg: 100,
  };

  test('caps annual yield at the legal AC limit', () => {
    // Simulate optimal conditions, no shading, orientation 1.0
    const orientationFactor = 1.0;
    const shadingFactor = 1.0;
    const selfConsumptionRate = 0.5;
    const annualConsumption = 3000;
    // Use a very high PVGIS yield to force clipping
    const pvgisYieldKwhPerKwp = 1200; // unrealistically high
    const economics = calculateProductEconomics(
      baseProduct,
      orientationFactor,
      shadingFactor,
      selfConsumptionRate,
      annualConsumption,
      pvgisYieldKwhPerKwp
    );
    // Max possible annual AC output at 800 W
    const maxACAnnualYield = LEGAL_AC_LIMIT_W * 365 * 24 / 1000;
    expect(economics.annualYieldKwh).toBeLessThanOrEqual(Math.round(maxACAnnualYield));
  });

  test('uses AC-limited yield for ecological calculations', () => {
    const orientationFactor = 1.0;
    const shadingFactor = 1.0;
    const selfConsumptionRate = 0.5;
    const annualConsumption = 3000;
    const pvgisYieldKwhPerKwp = 1200;
    const economics = calculateProductEconomics(
      baseProduct,
      orientationFactor,
      shadingFactor,
      selfConsumptionRate,
      annualConsumption,
      pvgisYieldKwhPerKwp
    );
    const ecological = calculateProductEcological(baseProduct, economics);
    // The CO2 savings per year must be based on the AC-limited yield
    const expectedCO2 = economics.annualYieldKwh * 380 / 1000;
    expect(ecological.paybackPeriodYears).toBeGreaterThan(0);
    expect(ecological.manufacturingCo2Kg).toBeGreaterThan(0);
    expect(economics.co2SavingsKgPerYear).toBe(Math.round(expectedCO2));
  });
});
