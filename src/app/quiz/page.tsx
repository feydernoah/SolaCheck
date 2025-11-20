"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OptionTile } from "@/components/ui/OptionTile";
import { BurgerMenu } from "@/components/BurgerMenu";
import { LocationInput } from "@/components/LocationInput";
import { 
  MdBalcony, 
  MdDeck, 
  MdHomeWork, 
  MdHome,
  MdApartment,
} from "react-icons/md";

interface QuestionOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface Question {
  id: number;
  category: string;
  question: string;
  type: 'tile' | 'button' | 'text' | 'multiselect';
  options?: QuestionOption[];
  infoHint?: string;
  placeholder?: string;
  unit?: string;
}

const questions: Question[] = [
  // Kategorie 1: Über dich & deine Wohnsituation
  {
    id: 1,
    category: 'Über dich & deine Wohnsituation',
    question: 'Wie alt bist du?',
    type: 'button',
    options: [
      { value: '18-24', label: '18–24 Jahre' },
      { value: '25-34', label: '25–34 Jahre' },
      { value: '35-49', label: '35–49 Jahre' },
      { value: '50-64', label: '50–64 Jahre' },
      { value: '65+', label: '65+ Jahre' },
    ],
  },
  {
    id: 2,
    category: 'Über dich & deine Wohnsituation',
    question: 'Wo wohnst du?',
    type: 'text',
    placeholder: 'PLZ oder Stadt eingeben',
    infoHint: 'Wir nutzen deinen Wohnort nur, um Sonnenstunden und Strahlung für deinen Standort zu berechnen. Die Daten werden nicht gespeichert.',
  },
  {
    id: 3,
    category: 'Über dich & deine Wohnsituation',
    question: 'Wie viele Personen leben in deinem Haushalt?',
    type: 'button',
    options: [
      { value: '1', label: '1 Person' },
      { value: '2', label: '2 Personen' },
      { value: '3-4', label: '3–4 Personen' },
      { value: '5+', label: '5 oder mehr Personen' },
    ],
  },
  {
    id: 4,
    category: 'Über dich & deine Wohnsituation',
    question: 'Wie wohnst du aktuell?',
    type: 'tile',
    options: [
      { value: 'mietwohnung', label: 'Mietwohnung im Mehrfamilienhaus', icon: <MdApartment /> },
      { value: 'eigentumswohnung', label: 'Eigentumswohnung', icon: <MdApartment /> },
      { value: 'einfamilienhaus', label: 'Einfamilienhaus / Doppelhaushälfte', icon: <MdHome /> },
      { value: 'reihenhaus', label: 'Reihenhaus', icon: <MdHome /> },
    ],
  },
  {
    id: 5,
    category: 'Über dich & deine Wohnsituation',
    question: 'Wie groß ist deine Wohnung / dein Haus ungefähr?',
    type: 'button',
    options: [
      { value: '<40', label: 'Unter 40 m²' },
      { value: '40-70', label: '40–70 m²' },
      { value: '70-100', label: '70–100 m²' },
      { value: '>100', label: 'Über 100 m²' },
    ],
    infoHint: 'Die Wohnfläche findest du meist im Mietvertrag oder in der Hausdokumentation. Wenn du unsicher bist, schätze einfach grob.',
  },
  {
    id: 6,
    category: 'Über dich & deine Wohnsituation',
    question: 'Wird deine Wohnung überwiegend mit Strom beheizt (z. B. Nachtspeicher, Elektro-Heizung)?',
    type: 'button',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'weiss-nicht', label: 'Weiß ich nicht' },
    ],
  },
  {
    id: 7,
    category: 'Über dich & deine Wohnsituation',
    question: 'Hast du einen elektrisch betriebenen Durchlauferhitzer für Warmwasser?',
    type: 'button',
    options: [
      { value: 'ja', label: 'Ja' },
      { value: 'nein', label: 'Nein' },
      { value: 'weiss-nicht', label: 'Weiß ich nicht' },
    ],
    infoHint: 'Einen Durchlauferhitzer erkennst du meist als Gerät im Bad/Küche, das das Wasser direkt beim Durchlaufen erhitzt.',
  },
  
  // Kategorie 2: Balkon & Installationsort
  {
    id: 8,
    category: 'Balkon & Installationsort',
    question: 'Hast du einen Balkon oder eine Terrasse, auf der ein Balkonkraftwerk montiert werden könnte?',
    type: 'tile',
    options: [
      { value: 'balkon', label: 'Ja, Balkon', icon: <MdBalcony /> },
      { value: 'terrasse', label: 'Ja, Terrasse', icon: <MdDeck /> },
      { value: 'nein', label: 'Nein', icon: <MdHomeWork /> },
    ],
  },
  {
    id: 9,
    category: 'Balkon & Installationsort',
    question: 'Wo würdest du das Balkonkraftwerk am ehesten montieren?',
    type: 'tile',
    options: [
      { value: 'balkonbruestung', label: 'Balkonbrüstung', icon: <MdBalcony /> },
      { value: 'balkonboden', label: 'Balkonboden / Terrasse', icon: <MdDeck /> },
      { value: 'hauswand', label: 'Hauswand', icon: <MdHomeWork /> },
      { value: 'flachdach', label: 'Flachdach', icon: <MdHome /> },
      { value: 'weiss-nicht', label: 'Weiß ich noch nicht', icon: <MdHome /> },
    ],
  },
  {
    id: 10,
    category: 'Balkon & Installationsort',
    question: 'In welche Richtung zeigt dein Balkon bzw. der geplante Montageort?',
    type: 'button',
    options: [
      { value: 'sueden', label: 'Süden' },
      { value: 'suedost', label: 'Südost' },
      { value: 'suedwest', label: 'Südwest' },
      { value: 'westen', label: 'Westen' },
      { value: 'osten', label: 'Osten' },
      { value: 'norden', label: 'Norden' },
      { value: 'weiss-nicht', label: 'Weiß ich nicht' },
    ],
    infoHint: 'Du kannst die Himmelsrichtung z. B. mit dem Kompass am Smartphone herausfinden. Eine grobe Angabe ist vollkommen ausreichend: Sonne morgens = eher Osten, Sonne nachmittags/abends = eher Westen, Sonne mittags = eher Süden.',
  },
  {
    id: 11,
    category: 'Balkon & Installationsort',
    question: 'Wie stark ist dein Balkon / Montageort normalerweise beschattet?',
    type: 'button',
    options: [
      { value: 'keine', label: 'Keine oder kaum Verschattung' },
      { value: 'etwas', label: 'Ab und zu etwas Schatten' },
      { value: 'mehrere-stunden', label: 'Mehrere Stunden am Tag im Schatten' },
      { value: 'ganzen-tag', label: 'Fast den ganzen Tag im Schatten' },
    ],
  },
  {
    id: 12,
    category: 'Balkon & Installationsort',
    question: 'Wie groß ist dein Balkon ungefähr?',
    type: 'button',
    options: [
      { value: 'klein', label: 'Klein (1–2 m breit)' },
      { value: 'mittel', label: 'Mittel (2–3 m breit)' },
      { value: 'gross', label: 'Groß (mehr als 3 m)' },
    ],
    infoHint: 'Es reicht eine grobe Einschätzung, wir wollen nur einschätzen, ob ein oder zwei Module Platz haben könnten.',
  },

  // Kategorie 3: Stromverbrauch & Tarif
  {
    id: 13,
    category: 'Stromverbrauch & Tarif',
    question: 'Wie hoch ist dein jährlicher Stromverbrauch im Durchschnitt?',
    type: 'text',
    placeholder: '2500',
    unit: 'kWh pro Jahr',
    infoHint: 'Du findest den Jahresstromverbrauch in kWh auf deiner letzten Jahresabrechnung oder im Kundenportal deines Stromanbieters. Wenn du es nicht weißt, nutzen wir typische Durchschnittswerte (z. B. nach Haushaltsgröße).',
  },
  {
    id: 14,
    category: 'Stromverbrauch & Tarif',
    question: 'Wie hoch ist dein aktueller Strompreis pro kWh (brutto)?',
    type: 'text',
    placeholder: '0,38',
    unit: '€/kWh',
    infoHint: 'Der Strompreis steht auf deiner Stromrechnung in ct/kWh oder €/kWh. Falls du es nicht weißt, nehmen wir einen durchschnittlichen Richtwert für Deutschland.',
  },

  // Kategorie 4: Geräte & Nutzungsmuster
  {
    id: 15,
    category: 'Geräte & Nutzungsmuster',
    question: 'Welche dieser Geräte nutzt du regelmäßig (mehrmals pro Woche)?',
    type: 'multiselect',
    options: [
      { value: 'kuehlschrank', label: 'Kühlschrank' },
      { value: 'gefrierschrank', label: 'Gefrierschrank' },
      { value: 'waschmaschine', label: 'Waschmaschine' },
      { value: 'trockner', label: 'Trockner' },
      { value: 'spuelmaschine', label: 'Spülmaschine' },
      { value: 'herd', label: 'Herd/Ofen' },
      { value: 'pc', label: 'PC (Homeoffice)' },
      { value: 'laptop', label: 'Laptop (Homeoffice)' },
      { value: 'gaming-pc', label: 'Gaming-PC' },
      { value: 'konsole', label: 'Konsole' },
      { value: 'fernseher', label: 'Fernseher' },
      { value: 'foehn', label: 'Föhn' },
      { value: 'klimaanlage', label: 'Klimaanlage' },
      { value: 'e-auto', label: 'E-Auto (Ladung zu Hause)' },
      { value: 'saugroboter', label: 'Saugroboter / Staubsauger' },
      { value: 'maehroboter', label: 'Rasenmäher / Mähroboter' },
      { value: 'luftentfeuchter', label: 'Luftentfeuchter' },
      { value: 'sonstige', label: 'Sonstige starke Verbraucher' },
    ],
    infoHint: 'Diese Info hilft uns nur grob einzuschätzen, wie hoch dein Stromverbrauch tagsüber ist. Du musst nichts exakt ausrechnen, eine ehrliche Einschätzung reicht.',
  },
  {
    id: 16,
    category: 'Geräte & Nutzungsmuster',
    question: 'Wann bist du normalerweise zuhause?',
    type: 'multiselect',
    options: [
      { value: 'morgens', label: 'Vor allem morgens' },
      { value: 'nachmittags', label: 'Vor allem nachmittags' },
      { value: 'abends', label: 'Vor allem abends' },
      { value: 'tagueber', label: 'Häufig tagsüber (z. B. Homeoffice)' },
      { value: 'unregelmaessig', label: 'Sehr unregelmäßig' },
    ],
    infoHint: 'Diese Angabe hilft uns, deinen möglichen Eigenverbrauch abzuschätzen: Wenn du tagsüber da bist, kannst du mehr Solarstrom direkt selbst nutzen.',
  },

  // Kategorie 5: Budget & Investitionsbereitschaft
  {
    id: 17,
    category: 'Budget & Investitionsbereitschaft',
    question: 'Wie viel würdest du ungefähr in ein Balkonkraftwerk investieren wollen?',
    type: 'button',
    options: [
      { value: 'bis-400', label: 'Bis 400 €' },
      { value: '400-700', label: '400–700 €' },
      { value: '700-1000', label: '700–1.000 €' },
      { value: '>1000', label: 'Mehr als 1.000 €' },
      { value: 'weiss-nicht', label: 'Weiß ich noch nicht' },
    ],
  },
  {
    id: 18,
    category: 'Budget & Investitionsbereitschaft',
    question: 'Gibt es in deiner Stadt/Gemeinde Förderprogramme für Balkonkraftwerke, von denen du profitieren könntest?',
    type: 'button',
    options: [
      { value: 'ja', label: 'Ja, ich kenne ein Förderprogramm' },
      { value: 'vermutlich', label: 'Ich vermute, ja, bin mir aber nicht sicher' },
      { value: 'nein', label: 'Nein / weiß ich nicht' },
    ],
    infoHint: 'Viele Städte und Gemeinden bieten Zuschüsse (z. B. 50–200 €) für Balkonkraftwerke an. Wenn du es nicht weißt, geben wir dir am Ende einen Hinweis, wo du das prüfen kannst.',
  },

  // Kategorie 6: Interesse an Nachhaltigkeit
  {
    id: 19,
    category: 'Interesse an Nachhaltigkeit',
    question: 'Wie wichtig ist dir die CO₂-Einsparung durch ein Balkonkraftwerk?',
    type: 'button',
    options: [
      { value: 'sehr-wichtig', label: 'Sehr wichtig' },
      { value: 'wichtig', label: 'Wichtig' },
      { value: 'nebensaechlich', label: 'Eher nebensächlich' },
    ],
  },
  {
    id: 20,
    category: 'Interesse an Nachhaltigkeit',
    question: 'Wie würdest du deine Einsparungen am liebsten sehen?',
    type: 'button',
    options: [
      { value: 'euro', label: 'In Euro pro Jahr' },
      { value: 'co2', label: 'In kg CO₂ pro Jahr' },
      { value: 'baeume', label: 'In "Baumäquivalenten"' },
      { value: 'egal', label: 'Egal, Hauptsache verständlich' },
    ],
  },
  {
    id: 21,
    category: 'Interesse an Nachhaltigkeit',
    question: 'Bist du bereit, einige Geräte tagsüber laufen zu lassen (z. B. Waschmaschine, Spülmaschine)?',
    type: 'button',
    options: [
      { value: 'ja', label: 'Ja, gerne' },
      { value: 'vielleicht', label: 'Vielleicht' },
      { value: 'nein', label: 'Nein' },
    ],
    infoHint: 'Höherer Eigenverbrauch → bessere Amortisation.',
  },
  {
    id: 22,
    category: 'Interesse an Nachhaltigkeit',
    question: 'Lädst du ein E-Auto regelmäßig zuhause?',
    type: 'button',
    options: [
      { value: 'taeglich', label: 'Ja, täglich' },
      { value: 'gelegentlich', label: 'Ja, gelegentlich' },
      { value: 'nein', label: 'Nein' },
    ],
  },
  {
    id: 23,
    category: 'Interesse an Nachhaltigkeit',
    question: 'Wie lange wirst du voraussichtlich noch an deinem aktuellen Wohnort wohnen?',
    type: 'button',
    options: [
      { value: '<2', label: 'Weniger als 2 Jahre' },
      { value: '2-5', label: '2–5 Jahre' },
      { value: '>5', label: 'Länger als 5 Jahre' },
    ],
  },
];

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleMultiSelectAnswer = (value: string) => {
    const currentValue = answers[questions[currentQuestion].id];
    const currentAnswers = Array.isArray(currentValue) ? currentValue : [];
    const newAnswers = currentAnswers.includes(value)
      ? currentAnswers.filter((v) => v !== value)
      : [...currentAnswers, value];
    setAnswers({ ...answers, [questions[currentQuestion].id]: newAnswers });
  };

  const handleTextAnswer = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [questions[currentQuestion].id]: value }));
  }, [currentQuestion]);

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];
  const currentMultiSelectAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
  const currentTextAnswer = typeof currentAnswer === 'string' ? currentAnswer : '';

  const isAnswered = () => {
    if (currentQ.type === 'multiselect') {
      return currentMultiSelectAnswers.length > 0;
    }
    return !!currentAnswer;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden p-4">
      {/* Burger Menu */}
      <BurgerMenu showHome showQuiz={false} />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl px-4">
          {/* Question Card */}
          <Card padding="lg" className="animate-fade-in">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                {currentQ.category}
              </span>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Frage {currentQuestion + 1} von {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(((currentQuestion + 1) / questions.length) * 100).toString()}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-heading-2 md:text-heading-1 font-bold text-gray-800 mb-8">
              {currentQ.question}
            </h2>

            {/* Info Hint */}
            {currentQ.infoHint && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">💡 Info: </span>
                  {currentQ.infoHint}
                </p>
              </div>
            )}

            {/* Answer Input */}
            <div className="mb-8">
              {/* Tile Type */}
              {currentQ.type === 'tile' && currentQ.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentQ.options.map((option) => (
                    <OptionTile
                      key={option.value}
                      label={option.label}
                      icon={option.icon}
                      selected={currentAnswer === option.value}
                      onClick={() => handleAnswer(option.value)}
                    />
                  ))}
                </div>
              )}

              {/* Button Type */}
              {currentQ.type === 'button' && currentQ.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQ.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                        currentAnswer === option.value
                          ? 'border-yellow-400 bg-yellow-50 text-gray-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-200 hover:bg-yellow-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Text Input Type */}
              {currentQ.type === 'text' && (
                <>
                  {/* Spezielle LocationInput für Frage 2 (Wohnort) */}
                  {currentQ.id === 2 ? (
                    <LocationInput
                      value={currentTextAnswer}
                      onChange={handleTextAnswer}
                      placeholder={currentQ.placeholder}
                    />
                  ) : (
                    /* Normaler Text/Number Input für andere Fragen */
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <input
                          type={currentQ.unit ? 'number' : 'text'}
                          value={currentTextAnswer}
                          onChange={(e) => handleTextAnswer(e.target.value)}
                          placeholder={currentQ.placeholder}
                          step={currentQ.unit === '€/kWh' ? '0.01' : '1'}
                          min="0"
                          className="flex-1 p-4 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors text-lg"
                        />
                        {currentQ.unit && (
                          <span className="text-gray-600 font-medium">{currentQ.unit}</span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Multiselect Type */}
              {currentQ.type === 'multiselect' && currentQ.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentQ.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelectAnswer(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left font-medium ${
                        currentMultiSelectAnswers.includes(option.value)
                          ? 'border-yellow-400 bg-yellow-50 text-gray-800'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-200 hover:bg-yellow-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          currentMultiSelectAnswers.includes(option.value)
                            ? 'border-yellow-400 bg-yellow-400'
                            : 'border-gray-300'
                        }`}>
                          {currentMultiSelectAnswers.includes(option.value) && (
                            <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <span>{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="primary"
                size="lg"
              >
                ← Zurück
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={() => alert('Fragebogen abgeschlossen! Antworten: ' + JSON.stringify(answers, null, 2))}
                  disabled={!isAnswered()}
                  variant="primary"
                  size="lg"
                >
                  Absenden ✓
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered()}
                  variant="primary"
                  size="lg"
                >
                  Weiter →
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
