"use client";

import { useState } from "react";
import HKAButton from "./ui/hka-button";

const questions = [
  {
    id: 1,
    question: 'What is your name?',
    type: 'text' as const,
  },
  {
    id: 2,
    question: 'What is your favorite color?',
    type: 'text' as const,
  },
  {
    id: 3,
    question: 'Which programming languages do you know?',
    type: 'checkbox' as const,
    options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
  },
  {
    id: 4,
    question: 'What is your experience level?',
    type: 'checkbox' as const,
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
  },
  {
    id: 5,
    question: 'Any additional comments?',
    type: 'text' as const,
  },
];

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
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

  const handleTextAnswer = (value: string) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleCheckboxAnswer = (option: string) => {
    const currentAnswers = answers[questions[currentQuestion].id] as string[] | undefined;
    const existingAnswers = currentAnswers ?? [];
    const newAnswers = existingAnswers.includes(option)
      ? existingAnswers.filter((a) => a !== option)
      : [...existingAnswers, option];
    setAnswers({ ...answers, [questions[currentQuestion].id]: newAnswers });
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
              🔄 Reset & Start Over
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
          {/* Question Box */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 transition-all duration-300">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(((currentQuestion + 1) / questions.length) * 100).toString()}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-8">
              {currentQ.question}
            </h2>

            {/* Answer Input */}
            <div className="mb-8">
              {currentQ.type === 'text' ? (
                <input
                  type="text"
                  value={(currentAnswer as string) || ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-indigo-600 focus:outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Type your answer here..."
                />
              ) : (
                <div className="space-y-3">
                  {currentQ.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(currentAnswer as string[] | undefined ?? []).includes(option)}
                        onChange={() => handleCheckboxAnswer(option)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-gray-800 dark:text-white">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <HKAButton
                  onClick={() => alert('Survey completed! Answers: ' + JSON.stringify(answers, null, 2))}
                  color="approve"
                  size="medium"
                >
                  Submit ✓
                </HKAButton>
              ) : (
                <HKAButton
                  onClick={handleNext}
                  color="primary"
                  size="medium"
                >
                  Next
                  <span className="text-xl"> {'>'}</span>
                </HKAButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
