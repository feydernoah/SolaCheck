import emailjs from '@emailjs/browser';
import type { ProductRanking, ProductEcological } from '@/types/economic';

const EMAILJS_CONFIG = {
  serviceId: 'service_bu73sja', 
  templateId: 'template_7btuxvj', 
  publicKey: '62B1neEqWDwLpKI8Q',
};

export interface SendRecommendationEmailParams {
  toEmail: string;
  recommendations: ProductRanking[];
  carbonfootprint?: ProductEcological[];
  includeCarbonFootprint: boolean;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  error?: string;
}

function formatRecommendationsHTML(
  recommendations: ProductRanking[],
  includeCarbonFootprint: boolean
): string {
  if (recommendations.length === 0) {
    return '<p>Leider konnten keine passenden Balkonkraftwerke für Sie gefunden werden.</p>';
  }

  const topRecommendations = recommendations.slice(0, 3);

  let html = '<div style="font-family: Arial, sans-serif;">';
  html += '<h2 style="color: #2563eb;">Ihre personalisierten Balkonkraftwerk-Empfehlungen</h2>';

  topRecommendations.forEach((ranking, index) => {
    const { product, economics, ecological } = ranking;
    
    html += `<div style="margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">`;
    html += `<h3 style="color: #1e40af; margin-top: 0;">
      ${(index + 1).toString()}. ${product.brand} ${product.name}
    </h3>`;
    
    html += `<div style="margin: 10px 0;">`;
    html += `<p style="margin: 5px 0;"><strong>Leistung:</strong> ${product.wattage.toString()} Wp</p>`;
    html += `<p style="margin: 5px 0;"><strong>Preis:</strong> ${product.price.toFixed(2)} €</p>`;
    html += `<p style="margin: 5px 0;"><strong>Module:</strong> ${product.moduleCount.toString()} Stück</p>`;
    html += `<p style="margin: 5px 0;"><strong>Wirkungsgrad:</strong> ${product.moduleEfficiency.toString()}%</p>`;
    html += `</div>`;

    html += `<div style="margin: 15px 0; padding: 10px; background-color: #f0f9ff; border-radius: 4px;">`;
    html += `<h4 style="margin-top: 0; color: #0369a1;">Wirtschaftliche Kennzahlen</h4>`;
    html += `<p style="margin: 5px 0;"><strong>Jährlicher Ertrag:</strong> ${economics.annualYieldKwh.toFixed(0)} kWh/Jahr</p>`;
    html += `<p style="margin: 5px 0;"><strong>Eigenverbrauch:</strong> ${economics.selfConsumptionKwh.toFixed(0)} kWh/Jahr</p>`;
    html += `<p style="margin: 5px 0;"><strong>Jährliche Ersparnis:</strong> ${economics.annualSavingsEuro.toFixed(2)} €/Jahr</p>`;
    html += `<p style="margin: 5px 0;"><strong>Amortisation:</strong> ${economics.amortizationYears.toFixed(1)} Jahre</p>`;
    html += `<p style="margin: 5px 0;"><strong>Ersparnis nach 10 Jahren:</strong> ${economics.totalSavings10Years.toFixed(2)} €</p>`;
    html += `</div>`;

    if (includeCarbonFootprint) {
      const forestAbsorptionPerYearKg = 100 * 24;
      const forestYearsToOffset = (ecological.lifecycleEmissionsKg / forestAbsorptionPerYearKg) * -1;
      
      html += `<div style="margin: 15px 0; padding: 10px; background-color: #f0fdf4; border-radius: 4px;">`;
      html += `<h4 style="margin-top: 0; color: #065f46;">Ökologischer Fußabdruck</h4>`;
      html += `<p style="margin: 5px 0;"><strong>CO₂ Herstellung:</strong> ${ecological.manufacturingCo2Kg.toFixed(0)} kg</p>`;
      html += `<p style="margin: 5px 0;"><strong>CO₂ Amortisation:</strong> ${ecological.paybackPeriodYears.toFixed(1)} Jahre</p>`;
      html += `<p style="margin: 5px 0;"><strong>Lebenszyklusemissionen (25 Jahre):</strong> ${Math.abs(ecological.lifecycleEmissionsKg).toFixed(0)} kg CO₂ Gesamteinsparung</p>`;
      html += `<p style="margin: 5px 0;"><strong>CO₂-Einsparung pro Jahr:</strong> ${economics.co2SavingsKgPerYear.toFixed(0)} kg/Jahr</p>`;
      
      html += `<p style="margin: 10px 0 5px 0; font-size: 0.9em;"><strong>Herstellungs-CO₂ Aufschlüsselung:</strong></p>`;
      html += `<ul style="margin: 5px 0; padding-left: 20px; font-size: 0.9em;">`;
      html += `<li>Rohstoffgewinnung: ${ecological.resourceExtractionCo2Kg.toFixed(0)} kg</li>`;
      html += `<li>Produktion: ${ecological.productionCo2Kg.toFixed(0)} kg</li>`;
      html += `<li>Transport: ${ecological.transportCo2Kg.toFixed(0)} kg</li>`;
      html += `</ul>`;
      
      html += `<div style="margin: 10px 0; padding: 8px; background-color: #ecfdf5; border-left: 4px solid #10b981;">`;
      html += `<p style="margin: 0;"><strong>🌳 Vergleich:</strong> Ein kleiner Wald mit 100 Bäumen bräuchte etwa <strong>${forestYearsToOffset.toFixed(1)} Jahre</strong>, um diese Menge an CO₂ aufzunehmen.</p>`;
      html += `</div>`;
      html += `</div>`;
    }

    if (ranking.matchReasons.length > 0) {
      html += `<div style="margin: 10px 0;">`;
      html += `<p style="margin: 5px 0;"><strong>Warum diese Empfehlung?</strong></p>`;
      html += `<ul style="margin: 5px 0; padding-left: 20px;">`;
      ranking.matchReasons.forEach(reason => {
        html += `<li>${reason}</li>`;
      });
      html += `</ul>`;
      html += `</div>`;
    }

    if (ranking.warnings.length > 0) {
      html += `<div style="margin: 10px 0; padding: 8px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">`;
      html += `<p style="margin: 0 0 5px 0;"><strong>Hinweise:</strong></p>`;
      html += `<ul style="margin: 5px 0; padding-left: 20px;">`;
      ranking.warnings.forEach(warning => {
        html += `<li>${warning}</li>`;
      });
      html += `</ul>`;
      html += `</div>`;
    }

    html += `</div>`;
  });

  html += '</div>';
  return html;
}

function formatRecommendationsText(
  recommendations: ProductRanking[],
  includeCarbonFootprint: boolean
): string {
  if (recommendations.length === 0) {
    return 'Leider konnten keine passenden Balkonkraftwerke für Sie gefunden werden.';
  }

  const topRecommendations = recommendations.slice(0, 3);

  let text = 'IHRE PERSONALISIERTEN BALKONKRAFTWERK-EMPFEHLUNGEN\n\n';
  text += '='.repeat(60) + '\n\n';

  topRecommendations.forEach((ranking, index) => {
    const { product, economics, ecological } = ranking;
    
    text += `${(index + 1).toString()}. ${product.brand} ${product.name}\n`;
    text += '-'.repeat(60) + '\n\n';
    
    text += `Leistung: ${product.wattage.toString()} Wp\n`;
    text += `Preis: ${product.price.toFixed(2)} €\n`;
    text += `Module: ${product.moduleCount.toString()} Stück\n`;
    text += `Wirkungsgrad: ${product.moduleEfficiency.toString()}%\n\n`;

    text += `WIRTSCHAFTLICHE KENNZAHLEN:\n`;
    text += `  • Jährlicher Ertrag: ${economics.annualYieldKwh.toFixed(0)} kWh/Jahr\n`;
    text += `  • Eigenverbrauch: ${economics.selfConsumptionKwh.toFixed(0)} kWh/Jahr\n`;
    text += `  • Jährliche Ersparnis: ${economics.annualSavingsEuro.toFixed(2)} €/Jahr\n`;
    text += `  • Amortisation: ${economics.amortizationYears.toFixed(1)} Jahre\n`;
    text += `  • Ersparnis nach 10 Jahren: ${economics.totalSavings10Years.toFixed(2)} €\n`;
    text += `  • CO₂-Einsparung: ${economics.co2SavingsKgPerYear.toFixed(0)} kg/Jahr\n\n`;

    if (includeCarbonFootprint) {
      const forestAbsorptionPerYearKg = 100 * 15;
      const forestYearsToOffset = (ecological.lifecycleEmissionsKg / forestAbsorptionPerYearKg) * -1;
      
      text += `ÖKOLOGISCHER FUSSABDRUCK:\n`;
      text += `  • CO₂ Herstellung: ${ecological.manufacturingCo2Kg.toFixed(0)} kg\n`;
      text += `  • CO₂ Amortisation: ${ecological.paybackPeriodYears.toFixed(1)} Jahre\n`;
      text += `  • Lebenszyklusemissionen (25 Jahre): ${Math.abs(ecological.lifecycleEmissionsKg).toFixed(0)} kg CO₂ Gesamteinsparung\n`;
      text += `  • Herstellungs-CO₂ Aufschlüsselung:\n`;
      text += `    - Rohstoffgewinnung: ${ecological.resourceExtractionCo2Kg.toFixed(0)} kg\n`;
      text += `    - Produktion: ${ecological.productionCo2Kg.toFixed(0)} kg\n`;
      text += `    - Transport: ${ecological.transportCo2Kg.toFixed(0)} kg\n`;
      text += `  🌳 Vergleich: Ein kleiner Wald mit 100 Bäumen bräuchte etwa ${forestYearsToOffset.toFixed(1)} Jahre,\n`;
      text += `    um diese Menge an CO₂ aufzunehmen.\n\n`;
    }

    if (ranking.matchReasons.length > 0) {
      text += `WARUM DIESE EMPFEHLUNG?\n`;
      ranking.matchReasons.forEach(reason => {
        text += `  • ${reason}\n`;
      });
      text += '\n';
    }

    if (ranking.warnings.length > 0) {
      text += `HINWEISE:\n`;
      ranking.warnings.forEach(warning => {
        text += `  ⚠ ${warning}\n`;
      });
      text += '\n';
    }

    text += '\n';
  });

  return text;
}

export async function sendRecommendationEmail(
  params: SendRecommendationEmailParams
): Promise<EmailResponse> {
  const { toEmail, recommendations, includeCarbonFootprint } = params;

  if (!toEmail.includes('@')) {
    return {
      success: false,
      message: 'Ungültige E-Mail-Adresse.',
      error: 'Invalid email address provided',
    };
  }

  if (recommendations.length === 0) {
    return {
      success: false,
      message: 'Keine Empfehlungen zum Versenden vorhanden.',
      error: 'No recommendations provided',
    };
  }

  try {
    const htmlContent = formatRecommendationsHTML(recommendations, includeCarbonFootprint);
    const textContent = formatRecommendationsText(recommendations, includeCarbonFootprint);

    const templateParams = {
      to_email: toEmail,
      to_name: toEmail.split('@')[0],
      subject: 'Ihre persönlichen Balkonkraftwerk-Empfehlungen von SolaCheck',
      message_html: htmlContent,
      message_text: textContent,
      recommendations_count: recommendations.length,
      top_recommendation: `${recommendations[0].product.brand} ${recommendations[0].product.name}`,
      estimated_savings: `${recommendations[0].economics.annualSavingsEuro.toFixed(2)} €/Jahr`,
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    if (response.status === 200) {
      return {
        success: true,
        message: `E-Mail erfolgreich an ${toEmail} gesendet.`,
      };
    } else {
      throw new Error(`EmailJS returned status ${String(response.status)}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      success: false,
      message: 'Fehler beim Versenden der E-Mail.',
      error: errorMessage,
    };
  }
}

export function initEmailJS(publicKey?: string): void {
  const key = publicKey ?? EMAILJS_CONFIG.publicKey;
  emailjs.init(key);
  console.log('EmailJS initialized successfully');
}

export function demoEmailSending(): EmailResponse {
  const sampleRecommendations: ProductRanking[] = [
    {
      rank: 1,
      product: {
        id: 'demo-1',
        name: 'priFlat Duo',
        brand: 'Priwatt',
        wattage: 820,
        moduleCount: 2,
        price: 549,
        includesInverter: true,
        inverterBrand: 'Hoymiles',
        inverterACPower: 800,
        includesStorage: false,
        mountingTypes: ['balkonbruestung'],
        bifacial: false,
        moduleEfficiency: 21.5,
        warrantyYears: 25,
        description: 'Premium Balkonkraftwerk mit Hoymiles Wechselrichter',
        manufacturingOrigin: 'china',
        manufacturingCo2Kg: 450,
      },
      economics: {
        annualYieldKwh: 780,
        selfConsumptionKwh: 585,
        feedInKwh: 195,
        annualSavingsEuro: 250.15,
        savingsFromSelfConsumption: 234.00,
        feedInRevenueEuro: 16.15,
        amortizationYears: 2.2,
        totalSavings10Years: 2501.50,
        totalSavings20Years: 5003.00,
        co2SavingsKgPerYear: 296.4,
      },
      ecological: {
        manufacturingCo2Kg: 450,
        resourceExtractionCo2Kg: 270,
        productionCo2Kg: 157.5,
        transportCo2Kg: 22.5,
        paybackPeriodYears: 1.5,
        lifecycleEmissionsKg: -6960,
        ecologicalScore: 87,
      },
      score: 2.2,
      matchReasons: [
        'Passt perfekt zu Ihrem Budget von 300-700€',
        'Optimale Größe für Ihre Balkonbrüstung',
        'Sehr kurze Amortisationszeit',
      ],
      warnings: [
        'Bei Verschattung kann der Ertrag niedriger ausfallen',
      ],
    },
  ];

  console.log('=== DEMO: Email Sending Test ===');
  console.log('To:', 'demo@example.com');
  console.log('Recommendations:', sampleRecommendations.length);
  console.log('Include Carbon Footprint:', true);
  console.log('\n--- HTML Content Preview ---');
  console.log(formatRecommendationsHTML(sampleRecommendations, true).substring(0, 500) + '...');
  console.log('\n--- Plain Text Content Preview ---');
  console.log(formatRecommendationsText(sampleRecommendations, true).substring(0, 500) + '...');
  console.log('=== END DEMO ===');

  return {
    success: true,
    message: 'Demo completed - check console for output. No actual email was sent.',
  };
}
