"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OptionTile } from "@/components/ui/OptionTile";
import { BurgerMenu } from "@/components/BurgerMenu";
import { InfoButton } from "@/components/InfoButton";
import { InfoModal } from "@/components/InfoModal";
import { AddressInput } from "@/components/AddressInput";
import { NumberInput } from "@/components/NumberInput";
import { CompassSelector } from "@/components/CompassSelector";
import { SolaWalkingAnimation } from "@/components/SolaWalkingAnimation";
import { LandingPageSnapshot } from "@/components/LandingPageSnapshot";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { getQuestionInfo } from "@/data/questionInfoData";
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
  type: 'tile' | 'button' | 'text' | 'number' | 'multiselect' | 'slider' | 'compass';
  options?: QuestionOption[];
  infoHint?: string;
  placeholder?: string;
  unit?: string;
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    unit: string;
  };
  dependencies?: {
    questionId: number;
    answerValue: string | string[];
    excludeOptions?: string[];
    includeOptions?: string[];
  }[];
}

const questions: Question[] = [
  // Kategorie 1: Über dich & deine Wohnsituation
  {
    id: 1,
    category: 'Über dich & deine Wohnsituation',
    question: 'Wo wohnst du?',
    type: 'text',
    placeholder: 'PLZ oder Stadt eingeben',
    infoHint: 'Wir nutzen deinen Wohnort nur, um Sonnenstunden und Strahlung für deinen Standort zu berechnen. Die Daten werden nicht gespeichert.',
  },
  {
    id: 2,
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
    id: 3,
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
    id: 4,
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
  
  // Kategorie 2: Balkon & Installationsort
  {
    id: 5,
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
    dependencies: [
      {
        questionId: 3,
        answerValue: 'mietwohnung',
        excludeOptions: ['flachdach'],
      },
    ],
  },
  {
    id: 6,
    category: 'Balkon & Installationsort',
    question: 'In welche Richtung zeigt dein Balkon bzw. der geplante Montageort?',
    type: 'compass',
    infoHint: 'Klicke auf die Himmelsrichtung im Kompass. Die Farben zeigen dir, wie gut die jeweilige Ausrichtung für Solarertrag ist. Süden ist optimal!',
    dependencies: [
      {
        questionId: 5,
        answerValue: ['flachdach', 'weiss-nicht'],
        excludeOptions: [],
      },
    ],
  },
  {
    id: 7,
    category: 'Balkon & Installationsort',
    question: 'Wie groß ist dein Balkon ungefähr?',
    type: 'button',
    options: [
      { value: 'klein', label: 'Klein (1–2 m breit)' },
      { value: 'mittel', label: 'Mittel (2–3 m breit)' },
      { value: 'gross', label: 'Groß (mehr als 3 m)' },
    ],
    infoHint: 'Es reicht eine grobe Einschätzung, wir wollen nur einschätzen, ob ein oder zwei Module Platz haben könnten.',
    dependencies: [
      {
        questionId: 5,
        answerValue: ['hauswand', 'flachdach', 'weiss-nicht'],
        excludeOptions: [],
      },
    ],
  },
  {
    id: 8,
    category: 'Balkon & Installationsort',
    question: 'Wie stark ist dein Balkon / Montageort normalerweise beschattet?',
    type: 'button',
    options: [
      { value: 'keine', label: 'Keine oder kaum Verschattung' },
      { value: 'etwas', label: 'Ab und zu etwas Schatten' },
      { value: 'mehrere-stunden', label: 'Mehrere Stunden am Tag im Schatten' },
      { value: 'ganzen-tag', label: 'Fast den ganzen Tag im Schatten' },
    ],
    dependencies: [
      {
        questionId: 5,
        answerValue: 'weiss-nicht',
      },
    ],
  },

  // Kategorie 3: Geräte & Nutzungsmuster
  {
    id: 9,
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
    id: 10,
    category: 'Geräte & Nutzungsmuster',
    question: 'Kennst du deinen jährlichen Stromverbrauch?',
    type: 'number',
    placeholder: 'z.B. 2500',
    unit: 'kWh/Jahr',
    infoHint: 'Du findest deinen Jahresverbrauch auf der Stromrechnung oder im Kundenportal deines Anbieters. Wenn du ihn nicht kennst, überspringe diese Frage einfach – wir schätzen dann anhand deiner Haushaltsgröße.',
  },

  // Kategorie 4: Budget & Investitionsbereitschaft
  {
    id: 11,
    category: 'Budget & Investitionsbereitschaft',
    question: 'Wie viel würdest du ungefähr in ein Balkonkraftwerk investieren wollen?',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 2000,
      step: 10,
      unit: '€',
    },
    infoHint: 'Stelle den Regler auf dein maximales Budget. Bei "Kein Limit" zeigen wir dir alle Produkte unabhängig vom Preis.',
  },
  {
    id: 12,
    category: 'Interesse an Nachhaltigkeit',
    question: 'Wie wichtig ist dir die CO₂-Einsparung durch ein Balkonkraftwerk?',
    type: 'button',
    options: [
      { value: 'sehr-wichtig', label: 'Sehr wichtig' },
      { value: 'wichtig', label: 'Wichtig' },
      { value: 'nebensaechlich', label: 'Eher nebensächlich' },
    ],
  },
];

// Hilfsfunktion um gefilterte Optionen basierend auf Abhängigkeiten zu berechnen
const getFilteredOptions = (question: Question, answers: Record<number, string | string[]>): QuestionOption[] => {
  if (!question.options) return [];
  
  if (!question.dependencies || question.dependencies.length === 0) {
    return question.options;
  }

  let filteredOptions = [...question.options];

  for (const dependency of question.dependencies) {
    const answerToCheck = answers[dependency.questionId];
    const dependencyMet = Array.isArray(dependency.answerValue)
      ? dependency.answerValue.includes(answerToCheck as string)
      : answerToCheck === dependency.answerValue;

    if (dependencyMet) {
      if (dependency.excludeOptions) {
        filteredOptions = filteredOptions.filter(
          (option) => !dependency.excludeOptions?.includes(option.value)
        );
      }
      if (dependency.includeOptions) {
        filteredOptions = filteredOptions.filter(
          (option) => dependency.includeOptions?.includes(option.value)
        );
      }
    }
  }

  return filteredOptions;
};

// Hilfsfunktion um zu prüfen, ob eine Frage angezeigt werden soll
const isQuestionVisible = (question: Question, answers: Record<number, string | string[]>): boolean => {
  if (!question.dependencies || question.dependencies.length === 0) {
    return true;
  }

  for (const dependency of question.dependencies) {
    const answerToCheck = answers[dependency.questionId];
    const dependencyMet = Array.isArray(dependency.answerValue)
      ? dependency.answerValue.includes(answerToCheck as string)
      : answerToCheck === dependency.answerValue;

    // Abhängigkeiten für Sichtbarkeit: Haben excludeOptions oder includeOptions, aber NICHT leer
    const hasFilterOptions = 
      ((dependency.excludeOptions ?? []).length > 0) ||
      ((dependency.includeOptions ?? []).length > 0);

    // Nur Abhängigkeiten berücksichtigen, die KEINE Filteroptionen haben
    // Diese definieren Sichtbarkeitsbedingungen für ganze Fragen
    if (!hasFilterOptions) {
      // Wenn die Abhängigkeit erfüllt ist, soll die Frage NICHT angezeigt werden
      if (dependencyMet) {
        return false;
      }
    }
  }

  return true;
};

export default function Home() {
  const router = useRouter();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [solaSpeechBubbleVisible, setSolaSpeechBubbleVisible] = useState(false);
  const [showInitialSolaHint, setShowInitialSolaHint] = useState(false);
  const { 
    currentQuestion, 
    answers, 
    setCurrentQuestion, 
    updateAnswer,
  } = useQuizProgress();

  // Only show walking animation on absolute first visit (use sessionStorage to track)
  const [showWalkingAnimation, setShowWalkingAnimation] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasSeenAnimation = sessionStorage.getItem('hasSeenQuizAnimation');
      const hasAnswers = Object.keys(answers).length > 0;
      return !hasSeenAnimation && !hasAnswers;
    }
    return false;
  });

  // Mark animation as seen when it completes
  const handleAnimationComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hasSeenQuizAnimation', 'true');
    }
    setShowWalkingAnimation(false);
  };

  // Safety fallback: ensure currentQuestion is always within valid bounds
  // The hook already validates cookies, but this guards against any edge cases
  // If out of bounds, correct the persisted state as well
  const isOutOfBounds = currentQuestion < 0 || currentQuestion >= questions.length;
  const safeCurrentQuestion = isOutOfBounds ? 0 : currentQuestion;
  
  // Correct the persisted state if it was out of bounds
  useEffect(() => {
    if (isOutOfBounds) {
      setCurrentQuestion(0);
    }
  }, [isOutOfBounds, setCurrentQuestion]);

  // Timer für initialen Sola Hint (nach 10 Sekunden)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitialSolaHint(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [safeCurrentQuestion]); // Reset bei neuer Frage

  const handleNext = () => {
    let nextQuestion = safeCurrentQuestion + 1;
    while (nextQuestion < questions.length && !isQuestionVisible(questions[nextQuestion], answers)) {
      nextQuestion++;
    }
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    }
  };

  const handlePrevious = () => {
    let previousQuestion = safeCurrentQuestion - 1;
    while (previousQuestion >= 0 && !isQuestionVisible(questions[previousQuestion], answers)) {
      previousQuestion--;
    }
    if (previousQuestion >= 0) {
      setCurrentQuestion(previousQuestion);
    }
  };

  const handleAnswer = (value: string) => {
    updateAnswer(questions[safeCurrentQuestion].id, value);
  };

  const handleMultiSelectAnswer = (value: string) => {
    const currentValue = answers[questions[safeCurrentQuestion].id];
    const currentAnswers = Array.isArray(currentValue) ? currentValue : [];
    const newAnswers = currentAnswers.includes(value)
      ? currentAnswers.filter((v) => v !== value)
      : [...currentAnswers, value];
    updateAnswer(questions[safeCurrentQuestion].id, newAnswers);
  };

  const handleTextAnswer = useCallback((value: string) => {
    updateAnswer(questions[safeCurrentQuestion].id, value);
  }, [safeCurrentQuestion, updateAnswer]);

  const currentQ = questions[safeCurrentQuestion];
  const currentAnswer = answers[currentQ.id];
  const currentMultiSelectAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
  const currentTextAnswer = typeof currentAnswer === 'string' ? currentAnswer : '';
  const sliderValue = typeof currentAnswer === 'string' ? currentAnswer : '';
  const filteredOptions = getFilteredOptions(currentQ, answers);
  const currentQuestionInfo = getQuestionInfo(currentQ.id);

  const isAnswered = () => {
    if (currentQ.type === 'multiselect') {
      return currentMultiSelectAnswers.length > 0;
    }
    // For address question (id 2), check validation state
    if (currentQ.id === 2) {
      return isAddressValid;
    }
    // For slider type (budget), default state (no limit) should be considered answered
    if (currentQ.type === 'slider') {
      return true;
    }
    // For number type (electricity consumption), it's optional so always allow proceeding
    if (currentQ.type === 'number') {
      return true;
    }
    return !!currentAnswer;
  };

  // Show walking animation on first visit
  if (showWalkingAnimation) {
    const firstQuestion = questions[0];
    return (
      <SolaWalkingAnimation 
        onComplete={handleAnimationComplete}
        fromPage={<LandingPageSnapshot hideBuddy={true} />}
        toPage={
          <div className="min-h-screen bg-white relative overflow-hidden p-4">
            <div className="fixed top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 z-40 flex items-center gap-4">
              <InfoButton onClick={() => setIsInfoModalOpen(true)} />
              <BurgerMenu showHome showQuiz={false} confirmOnHome inline />
            </div>
            <div className="flex items-center justify-center min-h-screen">
              <div className="w-full max-w-4xl px-4">
                <Card padding="lg" className="animate-fade-in">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                      {firstQuestion.category}
                    </span>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="mb-8">
                    <div className="flex justify-end text-sm text-gray-600 mb-2">
                      <span>{Math.round((1 / questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((1 / questions.length) * 100).toString()}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Question */}
                  <h2 className="text-heading-2 md:text-heading-1 font-bold text-gray-800 mb-8">
                    {firstQuestion.question}
                  </h2>

                  {/* Info Hint */}
                  {firstQuestion.infoHint && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">💡 Info: </span>
                        {firstQuestion.infoHint}
                      </p>
                    </div>
                  )}

                  {/* Answer Input */}
                  <div className="mb-8">
                    {firstQuestion.type === 'text' && (
                      <AddressInput
                        value=""
                        onChange={() => { /* disabled */ }}
                        onValidationChange={() => { /* disabled */ }}
                      />
                    )}
                    {firstQuestion.type === 'button' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {firstQuestion.options?.map((option) => (
                          <Button
                            key={option.value}
                            variant="outline"
                            size="lg"
                            className="w-full"
                            disabled
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <Button variant="ghost" size="md" disabled>
                      ← Zurück
                    </Button>
                    <Button variant="primary" size="lg" disabled>
                      Weiter →
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden p-4">
      {/* Burger Menu and Info Button */}
      <div className="fixed top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 z-50 flex items-center gap-4">
        <InfoButton onClick={() => setIsInfoModalOpen(true)} />
        <BurgerMenu showHome showQuiz={false} confirmOnHome inline />
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        info={currentQuestionInfo}
      />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl px-4">
          {/* Question Card */}
          <Card padding="lg" className="animate-fade-in relative overflow-visible">
            {/* Sola Buddy - nur für Frage 1 (Wohnort) */}
            {currentQ.id === 1 && (
              <>
                <button
                  onClick={() => {
                    setSolaSpeechBubbleVisible(!solaSpeechBubbleVisible);
                    setShowInitialSolaHint(false);
                  }}
                  className="absolute -top-17 right-2 md:-top-25 md:right-4 w-24 h-24 md:w-36 md:h-36 z-20 cursor-pointer hover:scale-105 transition-transform"
                  aria-label="Sola für Hilfe anklicken"
                >
                  <Image 
                    src="/solacheck/SolaQuizPages/Sola_chillt_winkend.png" 
                    alt="Sola winkt"
                    width={144}
                    height={144}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </button>

                {/* Sola Sprechblase mit Info oder Initial Hint */}
                {(solaSpeechBubbleVisible || showInitialSolaHint) && (
                  <div className="absolute -top-8 right-28 md:-top-12 md:right-40 bg-white p-4 md:p-5 rounded-2xl rounded-tr-none shadow-lg border border-gray-200 max-w-[240px] md:max-w-sm z-20 animate-fade-in">
                    {solaSpeechBubbleVisible && currentQ.infoHint ? (
                      <p className="text-sm md:text-base text-gray-700">
                        <span className="font-semibold">💡 </span>
                        {currentQ.infoHint}
                      </p>
                    ) : (
                      <p className="text-sm md:text-base text-gray-700">
                        Wenn du Hilfe brauchst, klick mich an! 👋
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                {currentQ.category}
              </span>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-end text-sm text-gray-600 mb-2">
                <span>{Math.round(((safeCurrentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(((safeCurrentQuestion + 1) / questions.length) * 100).toString()}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-heading-2 md:text-heading-1 font-bold text-gray-800 mb-8">
              {currentQ.question}
            </h2>

            {/* Answer Input */}
            <div className="mb-8">
              {/* Tile Type */}
              {currentQ.type === 'tile' && filteredOptions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOptions.map((option) => (
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
              {currentQ.type === 'button' && filteredOptions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredOptions.map((option) => (
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
                  {/* Spezielle AddressInput für Frage 1 (Wohnort) */}
                  {currentQ.id === 1 ? (
                    <AddressInput
                      value={currentTextAnswer}
                      onChange={handleTextAnswer}
                      onValidationChange={setIsAddressValid}
                    />
                  ) : (
                    /* Normaler Text Input für andere Fragen */
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentTextAnswer}
                          onChange={(e) => handleTextAnswer(e.target.value)}
                          placeholder={currentQ.placeholder}
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

              {/* Number Input Type (optional, can be skipped) */}
              {currentQ.type === 'number' && (
                <NumberInput
                  value={currentTextAnswer}
                  onChange={handleTextAnswer}
                  placeholder={currentQ.placeholder}
                  unit={currentQ.unit}
                  min={0}
                  optional={true}
                />
              )}

              {/* Compass Selector Type */}
              {currentQ.type === 'compass' && (
                <CompassSelector
                  value={currentTextAnswer}
                  onChange={handleAnswer}
                  showUnknownOption={true}
                />
              )}

              {/* Multiselect Type */}
              {currentQ.type === 'multiselect' && filteredOptions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredOptions.map((option) => (
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

              {/* Slider Type */}
              {currentQ.type === 'slider' && currentQ.sliderConfig && (
                <div className="max-w-xl mx-auto">
                  <div className="mb-10">
                    <div className="text-center mb-10">
                      <span className="text-2xl font-bold text-gray-800">
                        {sliderValue === '0' || sliderValue === '' ? 'Kein Limit' : `${sliderValue} ${currentQ.sliderConfig.unit}`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={currentQ.sliderConfig.min}
                      max={currentQ.sliderConfig.max}
                      step={currentQ.sliderConfig.step}
                      value={sliderValue || '0'}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-yellow"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Kein Limit</span>
                      <span>{currentQ.sliderConfig.max} {currentQ.sliderConfig.unit}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevious}
                disabled={safeCurrentQuestion === 0}
                variant="primary"
                size="lg"
              >
                ← Zurück
              </Button>

              {safeCurrentQuestion === questions.length - 1 ? (
                <Button
                  onClick={() => router.push('/results')}
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
