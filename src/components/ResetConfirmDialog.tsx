"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

const COOKIE_NAME = 'solacheck_quiz_progress';

/**
 * Deletes all client-side cookies
 */
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

    // host-only
    document.cookie = `${name}=; expires=${expires}; path=/`;

    // domain variants
    document.cookie = `${name}=; expires=${expires}; path=/; domain=${hostname}`;
    document.cookie = `${name}=; expires=${expires}; path=/; domain=.${hostname}`;
  }
}

/**
 * Clears all app storage (localStorage, sessionStorage, cookies)
 */
function clearAllAppStorage() {
  try {
    localStorage.clear();
    sessionStorage.clear();
    deleteClientCookies();
  } catch (err) {
    console.warn("Fehler beim Zurücksetzen des Speichers:", err);
  }
}

/**
 * Deletes only the quiz progress cookie
 */
function deleteQuizCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

export interface ResetConfirmOptions {
  /** The confirmation message to show */
  message?: string;
  /** Whether to clear all storage or just the quiz cookie */
  clearAll?: boolean;
  /** The path to navigate to after reset */
  navigateTo?: string;
  /** Whether to refresh the page after navigation */
  refresh?: boolean;
}

const DEFAULT_MESSAGE = "Möchtest du wirklich zur Startseite zurückkehren? Dein bisheriger Fortschritt geht verloren.";

/**
 * Hook that provides a unified reset confirmation function
 */
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

/**
 * Standalone function for use outside of React components
 * Returns true if the user confirmed, false otherwise
 */
export function showResetConfirmation(message: string = DEFAULT_MESSAGE): boolean {
  return window.confirm(message);
}
