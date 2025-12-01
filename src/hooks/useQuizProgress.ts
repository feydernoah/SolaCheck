import { useState, useEffect, useCallback } from 'react';

const COOKIE_NAME = 'solacheck_quiz_progress';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface QuizProgress {
  currentQuestion: number;
  answers: Record<number, string | string[]>;
}

interface UseQuizProgressReturn {
  currentQuestion: number;
  answers: Record<number, string | string[]>;
  setCurrentQuestion: (question: number) => void;
  setAnswers: (answers: Record<number, string | string[]>) => void;
  updateAnswer: (questionId: number, answer: string | string[]) => void;
  resetProgress: () => void;
  resetWithConfirmation: () => boolean;
  isLoaded: boolean;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${String(maxAge)}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const regex = new RegExp('(^| )' + name + '=([^;]+)');
  const match = regex.exec(document.cookie);
  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

function getProgressFromCookie(): QuizProgress {
  const savedProgress = getCookie(COOKIE_NAME);
  if (savedProgress) {
    try {
      return JSON.parse(savedProgress) as QuizProgress;
    } catch {
      deleteCookie(COOKIE_NAME);
    }
  }
  return { currentQuestion: 0, answers: {} };
}

export function useQuizProgress(): UseQuizProgressReturn {
  const [currentQuestion, setCurrentQuestionState] = useState(0);
  const [answers, setAnswersState] = useState<Record<number, string | string[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from cookie on mount (client-side only)
  useEffect(() => {
    const progress = getProgressFromCookie();
    setCurrentQuestionState(progress.currentQuestion);
    setAnswersState(progress.answers);
    setIsLoaded(true);
  }, []);

  // Save to cookie whenever state changes
  const saveToStorage = useCallback((question: number, ans: Record<number, string | string[]>) => {
    const progress: QuizProgress = { currentQuestion: question, answers: ans };
    setCookie(COOKIE_NAME, JSON.stringify(progress), COOKIE_MAX_AGE);
  }, []);

  const setCurrentQuestion = useCallback((question: number) => {
    setCurrentQuestionState(question);
    saveToStorage(question, answers);
  }, [answers, saveToStorage]);

  const setAnswers = useCallback((newAnswers: Record<number, string | string[]>) => {
    setAnswersState(newAnswers);
    saveToStorage(currentQuestion, newAnswers);
  }, [currentQuestion, saveToStorage]);

  const updateAnswer = useCallback((questionId: number, answer: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswersState(newAnswers);
    saveToStorage(currentQuestion, newAnswers);
  }, [answers, currentQuestion, saveToStorage]);

  const resetProgress = useCallback(() => {
    setCurrentQuestionState(0);
    setAnswersState({});
    deleteCookie(COOKIE_NAME);
  }, []);

  const resetWithConfirmation = useCallback(() => {
    const confirmed = window.confirm('Möchtest du das Quiz wirklich zurücksetzen? Dein bisheriger Fortschritt geht verloren.');
    if (confirmed) {
      resetProgress();
      return true;
    }
    return false;
  }, [resetProgress]);

  return {
    currentQuestion,
    answers,
    setCurrentQuestion,
    setAnswers,
    updateAnswer,
    resetProgress,
    resetWithConfirmation,
    isLoaded,
  };
}
