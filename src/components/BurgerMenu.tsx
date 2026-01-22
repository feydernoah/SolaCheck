"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useResetConfirmation } from "@/components/ResetConfirmDialog";

const COOKIE_NAME = 'solacheck_quiz_progress';

/**
 * Check if there's quiz progress in the cookie
 */
function hasQuizProgress(): boolean {
  if (typeof document === 'undefined') return false;
  const regex = new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)');
  const match = regex.exec(document.cookie);
  if (!match) return false;
  
  try {
    const progress = JSON.parse(decodeURIComponent(match[2])) as { answers?: Record<string, unknown> };
    // Check if there are any answers saved
    return progress.answers && Object.keys(progress.answers).length > 0;
  } catch {
    return false;
  }
}

interface BurgerMenuProps {
  showHome?: boolean;
  showQuiz?: boolean;
  /** @deprecated Use confirmOnHome instead */
  onHomeClick?: () => boolean;
  /** Whether to show confirmation dialog when clicking Home (auto-detects quiz progress if not set) */
  confirmOnHome?: boolean;
  additionalItems?: {
    label: string;
    href: string;
    onClick?: () => void;
  }[];
  /** When true, the menu button won't have fixed positioning (useful when placed in a custom container) */
  inline?: boolean;
}

export function BurgerMenu({ 
  showHome = true, 
  showQuiz = true,
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  onHomeClick,
  confirmOnHome,
  additionalItems = [],
  inline = false,
}: BurgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quizInProgress, setQuizInProgress] = useState(false);
  const { confirmAndReset } = useResetConfirmation();
  const router = useRouter();

  // Check for quiz progress on mount and when menu opens
  useEffect(() => {
    if (menuOpen) {
      setQuizInProgress(hasQuizProgress());
    }
  }, [menuOpen]);

  // Determine if we should confirm: explicit prop or auto-detect quiz progress
  const shouldConfirm = confirmOnHome ?? quizInProgress;

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Support legacy onHomeClick prop
    if (onHomeClick) {
      const shouldNavigate = onHomeClick();
      if (!shouldNavigate) {
        setMenuOpen(false);
        return;
      }
    } else if (shouldConfirm) {
      const confirmed = confirmAndReset({ navigateTo: "/" });
      if (!confirmed) {
        setMenuOpen(false);
        return;
      }
      // confirmAndReset handles navigation
      return;
    }
    // Navigate to home
    setMenuOpen(false);
    router.push("/");
  };

  const containerClasses = inline 
    ? "relative z-50"
    : "fixed top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 z-50";

  return (
    <div className={containerClasses}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="bg-white p-3 sm:p-4 md:p-4 lg:p-5 xl:p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
        aria-label="Menu"
      >
        <div className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8 h-0.5 bg-gray-800 mb-2"></div>
        <div className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8 h-0.5 bg-gray-800 mb-2"></div>
        <div className="w-6 sm:w-7 md:w-7 lg:w-8 xl:w-8 h-0.5 bg-gray-800"></div>
      </button>

      {/* Menu Dropdown */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 md:w-56 lg:w-64 xl:w-64 bg-white rounded-lg shadow-xl p-2 border border-gray-200">
          {showHome && (
            shouldConfirm ? (
              <button
                onClick={handleHomeClick}
                className="block w-full text-left px-4 py-3 md:py-3 lg:py-4 xl:py-4 text-sm md:text-base lg:text-lg xl:text-lg active:bg-gray-100 md:hover:bg-gray-100 rounded transition-colors text-gray-800"
              >
                Home
              </button>
            ) : (
              <Link
                href="/"
                className="block w-full text-left px-4 py-3 md:py-3 lg:py-4 xl:py-4 text-sm md:text-base lg:text-lg xl:text-lg active:bg-gray-100 md:hover:bg-gray-100 rounded transition-colors text-gray-800"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            )
          )}
          
          {showQuiz && (
            <Link
              href="/quiz"
              className="block w-full text-left px-4 py-3 md:py-3 lg:py-4 xl:py-4 text-sm md:text-base lg:text-lg xl:text-lg active:bg-gray-100 md:hover:bg-gray-100 rounded transition-colors text-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              Quiz starten
            </Link>
          )}

          {additionalItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block w-full text-left px-4 py-3 md:py-3 lg:py-4 xl:py-4 text-sm md:text-base lg:text-lg xl:text-lg active:bg-gray-100 md:hover:bg-gray-100 rounded transition-colors text-gray-800"
              onClick={() => {
                setMenuOpen(false);
                item.onClick?.();
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
