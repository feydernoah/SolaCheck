"use client";

import Link from "next/link";
import { useState } from "react";

interface BurgerMenuProps {
  showHome?: boolean;
  showQuiz?: boolean;
  additionalItems?: {
    label: string;
    href: string;
    onClick?: () => void;
  }[];
}

export function BurgerMenu({ 
  showHome = true, 
  showQuiz = true,
  additionalItems = []
}: BurgerMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 sm:top-5 sm:right-5 md:top-6 md:right-6 z-50">
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
            <Link
              href="/"
              className="block w-full text-left px-4 py-3 md:py-3 lg:py-4 xl:py-4 text-sm md:text-base lg:text-lg xl:text-lg active:bg-gray-100 md:hover:bg-gray-100 rounded transition-colors text-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
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
