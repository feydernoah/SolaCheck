import { ReactNode } from 'react';

export interface QuestionInfo {
  questionId: number;
  title: string;
  content: ReactNode;
  hasChart?: boolean;
}

// Info content for each quiz question
// You can add charts by setting hasChart: true and including chart components in content
export const questionInfoData: QuestionInfo[] = [
  {
    questionId: 1,
    title: 'Alter & Energieprofil',
    content: (
      <div className="space-y-3">
        <p>
          Dein Alter hilft uns, dein <strong>Energieprofil</strong> besser einzuschätzen.
        </p>
        <p>
          Verschiedene Altersgruppen haben unterschiedliche Verbrauchsmuster:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>18–34 Jahre:</strong> Oft tagsüber außer Haus, höherer Abendverbrauch</li>
          <li><strong>35–49 Jahre:</strong> Häufig Familien, Verbrauch über den Tag verteilt</li>
          <li><strong>50–64 Jahre:</strong> Teilweise Homeoffice, mehr Tagverbrauch</li>
          <li><strong>65+ Jahre:</strong> Meist tagsüber zu Hause, idealer Eigenverbrauch</li>
        </ul>
        <p className="text-sm text-gray-500">
          Wir nutzen diese Info, um mit einem durchschnittlichen Energieprofil deiner Altersgruppe zu rechnen.
        </p>
      </div>
    ),
  },
  {
    questionId: 2,
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
    questionId: 3,
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
    questionId: 4,
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
    questionId: 5,
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
    questionId: 6,
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
    questionId: 7,
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
    questionId: 8,
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
    questionId: 9,
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
    questionId: 10,
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
    questionId: 11,
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
    questionId: 12,
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
    questionId: 13,
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

// Helper function to get info for a specific question
export function getQuestionInfo(questionId: number): QuestionInfo | undefined {
  return questionInfoData.find((info) => info.questionId === questionId);
}
