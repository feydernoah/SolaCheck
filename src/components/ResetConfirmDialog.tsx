"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

const COOKIE_NAME = 'solacheck_quiz_progress';

function deleteClientCookies() {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean);

  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  const hostname = window.location.hostname;

  for (const c of cookies) {
    const name = c.split("=")[0];

    document.cookie = `${name}=; expires=${expires}; path=/`;

    document.cookie = `${name}=; expires=${expires}; path=/; domain=${hostname}`;
    document.cookie = `${name}=; expires=${expires}; path=/; domain=.${hostname}`;
  }
}

function clearAllAppStorage() {
  try {
    localStorage.clear();
    sessionStorage.clear();
    deleteClientCookies();
  } catch (err) {
    console.warn("Fehler beim Zurücksetzen des Speichers:", err);
  }
}

function deleteQuizCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export interface ResetConfirmOptions {
  message?: string;
  clearAll?: boolean;
  navigateTo?: string;
  refresh?: boolean;
}

const DEFAULT_MESSAGE = "Möchtest du wirklich zur Startseite zurückkehren? Dein bisheriger Fortschritt geht verloren.";

export function useResetConfirmation() {
  const router = useRouter();

  const confirmAndReset = useCallback((options: ResetConfirmOptions = {}): boolean => {
    const {
      message = DEFAULT_MESSAGE,
      clearAll = true,
      navigateTo = "/",
      refresh = true,
    } = options;

    const confirmed = window.confirm(message);
    if (!confirmed) return false;

    if (clearAll) {
      clearAllAppStorage();
    } else {
      deleteQuizCookie();
    }

    router.push(navigateTo);
    
    if (refresh) {
      router.refresh();
    }

    return true;
  }, [router]);

  return { confirmAndReset };
}

export function showResetConfirmation(message: string = DEFAULT_MESSAGE): boolean {
  return window.confirm(message);
}
