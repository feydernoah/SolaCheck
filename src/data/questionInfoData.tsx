import { ReactNode } from 'react';

export interface QuestionInfo {
  questionId: number;
  title: string;
  content: ReactNode;
  hasChart?: boolean;
}

export const questionInfoData: QuestionInfo[] = [
  {
    questionId: 1,
    title: 'Warum ist dein Standort wichtig?',
    content: (
      <div className="space-y-3">
        <p>
          Der Standort bestimmt die <strong>Sonneneinstrahlung</strong> und damit 
          den potenziellen Ertrag deines Balkonkraftwerks.
        </p>
        <p>
          In Deutschland variiert die Globalstrahlung zwischen ca. <strong>900–1.200 kWh/m²</strong> pro Jahr – 
          im Süden mehr, im Norden weniger.
        </p>
        <p className="text-sm text-gray-500">
          Deine Daten werden nicht gespeichert, sondern nur zur Berechnung genutzt.
        </p>
      </div>
    ),
  },
  {
    questionId: 2,
    title: 'Haushaltsgröße & Stromverbrauch',
    content: (
      <div className="space-y-3">
        <p>
          Die Anzahl der Personen beeinflusst deinen <strong>Grundverbrauch</strong>.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>1 Person: ca. 1.500 kWh/Jahr</li>
          <li>2 Personen: ca. 2.500 kWh/Jahr</li>
          <li>3-4 Personen: ca. 3.500 kWh/Jahr</li>
          <li>5+ Personen: ca. 4.500+ kWh/Jahr</li>
        </ul>
        <p className="text-sm text-gray-500">
          Ein Balkonkraftwerk kann 10-30% dieses Verbrauchs decken.
        </p>
      </div>
    ),
  },
  {
    questionId: 3,
    title: 'Wohnsituation & Montagemöglichkeiten',
    content: (
      <div className="space-y-3">
        <p>
          Deine Wohnsituation bestimmt, welche <strong>Montageorte</strong> für ein Balkonkraftwerk realistisch sind.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Mietwohnung:</strong> Meist nur Balkonbrüstung oder Balkonboden möglich</li>
          <li><strong>Eigentumswohnung:</strong> Balkon, ggf. Fassade nach WEG-Beschluss</li>
          <li><strong>Einfamilienhaus:</strong> Alle Optionen – Balkon, Terrasse, Hauswand, Flachdach</li>
          <li><strong>Reihenhaus:</strong> Meist Garten, Terrasse oder Hauswand möglich</li>
        </ul>
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Hinweis:</strong> Für Montage an Hauswand, Fassade oder Dach ist meist eine Genehmigung vom Vermieter oder der Eigentümergemeinschaft erforderlich.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Wir passen die Montageoptionen im nächsten Schritt automatisch an deine Wohnsituation an.
        </p>
      </div>
    ),
  },
  {
    questionId: 4,
    title: 'Wohnfläche & Verbrauch',
    content: (
      <div className="space-y-3">
        <p>
          Größere Wohnungen haben meist einen <strong>höheren Grundverbrauch</strong> 
          durch mehr Beleuchtung, Heizung und Geräte.
        </p>
        <p>
          Dies hilft uns, den möglichen Eigenverbrauchsanteil deines 
          Balkonkraftwerks realistisch einzuschätzen.
        </p>
      </div>
    ),
  },
  {
    questionId: 5,
    title: 'Der richtige Montageort',
    content: (
      <div className="space-y-3">
        <p>
          Der Montageort beeinflusst <strong>Ausrichtung</strong>, <strong>Neigung</strong> 
          und damit den Ertrag.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Balkonbrüstung:</strong> Oft senkrecht, ca. 70% Ertrag</li>
          <li><strong>Boden/Terrasse:</strong> Mit Aufständerung optimal</li>
          <li><strong>Hauswand:</strong> Gut bei Südausrichtung</li>
          <li><strong>Flachdach:</strong> Beste Flexibilität bei Neigung</li>
        </ul>
      </div>
    ),
  },
  {
    questionId: 6,
    title: 'Ausrichtung & Ertrag',
    content: (
      <div className="space-y-3">
        <p>
          Die <strong>Himmelsrichtung</strong> ist entscheidend für den Ertrag:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Süden:</strong> 100% Ertrag (optimal)</li>
          <li><strong>Südost/Südwest:</strong> ca. 95% Ertrag</li>
          <li><strong>Osten/Westen:</strong> ca. 80-85% Ertrag</li>
          <li><strong>Norden:</strong> ca. 50-60% Ertrag</li>
        </ul>
        <p className="text-sm text-gray-500">
          Tipp: Nutze den Kompass auf deinem Smartphone, um die Richtung zu bestimmen.
        </p>
      </div>
    ),
  },
  {
    questionId: 7,
    title: 'Balkongröße & Modulanzahl',
    content: (
      <div className="space-y-3">
        <p>
          Die Balkongröße bestimmt, wie viele <strong>Module</strong> Platz haben:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Klein (1-2m):</strong> 1 Modul (ca. 400W)</li>
          <li><strong>Mittel (2-3m):</strong> 1-2 Module (400-800W)</li>
          <li><strong>Groß (3m+):</strong> 2 Module (bis 800W erlaubt)</li>
        </ul>
        <p className="text-sm text-gray-500">
          Standard-Module sind ca. 1,7m x 1m groß.
        </p>
      </div>
    ),
  },
  {
    questionId: 8,
    title: 'Verschattung verstehen',
    content: (
      <div className="space-y-3">
        <p>
          Schatten reduziert den Ertrag <strong>überproportional</strong>.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Keine Verschattung:</strong> 100% Ertrag möglich</li>
          <li><strong>Etwas Schatten:</strong> ca. 80-90% Ertrag</li>
          <li><strong>Mehrere Stunden:</strong> ca. 50-70% Ertrag</li>
          <li><strong>Ganztägig:</strong> Balkonkraftwerk wenig sinnvoll</li>
        </ul>
        <p className="text-sm text-gray-500">
          Schon kleine Schatten auf einer Zelle können die gesamte Modulleistung senken.
        </p>
      </div>
    ),
  },
  {
    questionId: 9,
    title: 'Geräte & Eigenverbrauch',
    content: (
      <div className="space-y-3">
        <p>
          Der <strong>Eigenverbrauch</strong> ist entscheidend für die Wirtschaftlichkeit.
        </p>
        <p>
          Geräte, die tagsüber laufen, nutzen den Solarstrom direkt:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Ideal:</strong> Kühlschrank, Router, Standby-Geräte</li>
          <li><strong>Planbar:</strong> Waschmaschine, Spülmaschine mittags</li>
          <li><strong>Homeoffice:</strong> PC/Laptop tagsüber ideal</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Speicher sinnvoll?</strong> Wenn du tagsüber wenig zu Hause bist und abends viel Strom verbrauchst, kann ein BKW mit Speicher sinnvoll sein. Der Speicher speichert überschüssigen Strom für später.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Je mehr Grundlast tagsüber, desto höher der Eigenverbrauch – und desto weniger lohnt sich ein Speicher.
        </p>
      </div>
    ),
  },
  {
    questionId: 10,
    title: 'Budget & Qualität',
    content: (
      <div className="space-y-3">
        <p>
          Die <strong>Preisspanne</strong> bei Balkonkraftwerken ist groß:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Bis 400€:</strong> Einsteigermodelle, 1 Modul</li>
          <li><strong>400-700€:</strong> Gute Qualität, 2 Module</li>
          <li><strong>700-1.000€:</strong> Premium mit Extras</li>
          <li><strong>1.000€+:</strong> Mit Speicher oder Profi-Montage</li>
        </ul>
        <p className="text-sm text-gray-500">
          Amortisation: Typisch 3-6 Jahre je nach Strompreis und Ertrag.
        </p>
      </div>
    ),
  },
  {
    questionId: 11,
    title: 'CO₂-Einsparung',
    content: (
      <div className="space-y-3">
        <p>
          Ein Balkonkraftwerk spart ca. <strong>300-400 kg CO₂</strong> pro Jahr.
        </p>
        <p>
          Das entspricht etwa:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>2.000 km Autofahrt (Mittelklasse)</li>
          <li>1 Flug München-Berlin (hin und zurück)</li>
          <li>15 neue T-Shirts (Produktion)</li>
        </ul>
        <p className="text-sm text-gray-500">
          Über 20 Jahre Lebensdauer: 6-8 Tonnen CO₂ eingespart.
        </p>
      </div>
    ),
  },
  {
    questionId: 12,
    title: 'Dein tatsächlicher Stromverbrauch',
    content: (
      <div className="space-y-3">
        <p>
          Wenn du deinen <strong>genauen Jahresverbrauch</strong> kennst, können wir deine 
          Einsparpotenziale präziser berechnen.
        </p>
        <p>
          <strong>Wo findest du diese Zahl?</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Auf deiner <strong>letzten Stromrechnung</strong></li>
          <li>Im <strong>Kundenportal</strong> deines Stromanbieters</li>
          <li>Auf dem <strong>Jahresabrechnungsschreiben</strong></li>
        </ul>
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>💡 Keine Sorge:</strong> Wenn du die Zahl nicht kennst, überspringe 
            einfach diese Frage. Wir schätzen dann anhand deiner Haushaltsgröße.
          </p>
        </div>
        <p className="text-sm text-gray-500">
          Typische Werte: 1-Person: ~1.500 kWh, 2-Personen: ~2.500 kWh, Familie: ~3.500 kWh
        </p>
      </div>
    ),
  },
];

export interface EcologicalInfo {
  id: string;
  title: string;
  content: ReactNode;
  sources?: string;
}

export const ecologicalInfoData: EcologicalInfo[] = [
  {
    id: 'manufacturing',
    title: 'CO₂-Emissionen bei der Herstellung',
    content: (
      <div className="space-y-3">
        <p>
          Die Herstellung eines Balkonkraftwerks verursacht <strong>CO₂-Emissionen</strong> durch:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Rohstoffgewinnung:</strong> Bergbau und Aufbereitung von Silizium und Metallen (~60%)</li>
          <li><strong>Produktion:</strong> Fabrikprozesse zur Herstellung von Modulen, Inverter und Komponenten (~35%)</li>
          <li><strong>Transport:</strong> Versand vom Herstellungsort bis nach Deutschland (~5%)</li>
        </ul>
        <p className="text-sm text-gray-700 mt-3">
          Der Ort der Herstellung ist wichtig: Produkte aus Deutschland oder Europa haben einen geringeren 
          Transportfußabdruck als solche aus Asien oder China.
        </p>
      </div>
    ),
    sources: 'Quellen: Fraunhofer ISE, PVGIS, Datenbank ecoinvent',
  },
  {
    id: 'payback',
    title: 'Was ist CO₂-Amortisation?',
    content: (
      <div className="space-y-3">
        <p>
          Die <strong>CO₂-Amortisationszeit</strong> ist die Zeitspanne, in der dein Balkonkraftwerk 
          durch die Stromerzeugung genau so viel CO₂ einspart, wie bei der Herstellung ausgestoßen wurde.
        </p>
        <p className="text-sm">
          <strong>Beispiel:</strong> Ein Produkt mit 200 kg Herstellungs-CO₂ und 464 kg/Jahr CO₂-Einsparung 
          amortisiert sich in: 200 ÷ 464 = <strong>0,43 Jahren</strong> (ca. 5 Monate).
        </p>
        <p className="text-sm text-gray-700">
          Nach dieser Zeit ist das System CO₂-positiv: Jeder weitere Tag erzeugt ein &quot;Guthaben&quot; anstatt Schulden.
        </p>
      </div>
    ),
    sources: 'Berechnung basierend auf: Herstellungs-CO₂ ÷ jährliche CO₂-Einsparung',
  },
  {
    id: 'lifecycle',
    title: 'Lebenszyklusanalyse (LCA)',
    content: (
      <div className="space-y-3">
        <p>
          Die <strong>Lebenszyklusanalyse</strong> zeigt die gesamte CO₂-Bilanz über die Garantiezeit:
        </p>
        <p className="text-sm">
          <strong>Berechnung:</strong> CO₂-Einsparung über X Jahre = (jährliche Einsparung) × (Anzahl Jahre) - (Herstellungs-CO₂)
        </p>
        <p className="text-sm">
          <strong>Beispiel (10 Jahre):</strong> (464 kg/Jahr × 10) - 200 kg = 4.440 kg CO₂ Gesamteinsparung
        </p>
        <p className="text-sm text-gray-700">
          Ein negativer Wert (z.B. -150 kg) würde bedeuten, dass das System seine ökologischen Schulden noch nicht amortisiert hat. 
          Ein positiver Wert zeigt die Gesamteinsparung an CO₂.
        </p>
      </div>
    ),
    sources: 'Quelle: Produktgarantie und PVGIS-Ertragsdaten',
  },
];

export function getQuestionInfo(questionId: number): QuestionInfo | undefined {
  return questionInfoData.find((info) => info.questionId === questionId);
}

export function getEcologicalInfo(id: string): EcologicalInfo | undefined {
  return ecologicalInfoData.find((info) => info.id === id);
}
