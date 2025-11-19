"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OptionTile } from "@/components/ui/OptionTile";

const questions = [
  {
    id: 1,
    question: 'Wo soll das BKW installiert werden?',
    type: 'tile' as const,
    options: [
      { value: 'balkon', label: 'Balkon', icon: '🏢' },
      { value: 'terrasse', label: 'Terrasse', icon: '🏡' },
      { value: 'hauswand', label: 'Hauswand', icon: '🧱' },
    ],
  },
];

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleTileAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setMenuOpen(false);
  };

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Burger Menu */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          aria-label="Menu"
        >
          <div className="w-6 h-0.5 bg-gray-800 dark:bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-gray-800 dark:bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-gray-800 dark:bg-white"></div>
        </button>

        {/* Menu Dropdown */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-2">
            <button
              onClick={handleReset}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              🔄 Neu starten
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl px-4">
          {/* Question Card */}
          <Card padding="lg" className="animate-fade-in">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Frage {currentQuestion + 1} von {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-brand-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(((currentQuestion + 1) / questions.length) * 100).toString()}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-heading-2 md:text-heading-1 font-bold text-gray-800 dark:text-white mb-8">
              {currentQ.question}
            </h2>

            {/* Answer Input */}
            <div className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentQ.options.map((option) => (
                  <OptionTile
                    key={option.value}
                    label={option.label}
                    icon={<span className="text-5xl">{option.icon}</span>}
                    selected={currentAnswer === option.value}
                    onClick={() => handleTileAnswer(option.value)}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="secondary"
                size="lg"
              >
                ← Zurück
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={() => alert('Fragebogen abgeschlossen! Antworten: ' + JSON.stringify(answers, null, 2))}
                  variant="primary"
                  size="lg"
                >
                  Absenden ✓
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="lg"
                  disabled={!currentAnswer}
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
