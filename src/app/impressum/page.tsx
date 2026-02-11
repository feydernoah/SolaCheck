"use client";

import { BurgerMenu } from "@/components/BurgerMenu";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white relative px-4 py-16">
      <BurgerMenu showHome showQuiz />

      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-heading-1 md:text-display font-bold text-gray-800 mb-4">
              Impressum
            </h1>
          </div>

          <div className="max-w-3xl mx-auto space-y-8 text-gray-700 text-sm md:text-base leading-relaxed">
            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                Angaben gemäß § 5 DDG
              </h2>
              <p>
                Noah Feyder<br />
                Zähringerstraße 80<br />
                76133 Karlsruhe<br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                Verantwortlich für den Inhalt & Datenschutz
              </h2>
              <p>
                Noah Feyder<br />
                Zähringerstraße 80<br />
                76133 Karlsruhe<br />
                Deutschland<br />
                E-Mail: <a href="mailto:noahfeyder@gmail.com" className="underline hover:text-yellow-600">noahfeyder@gmail.com</a>
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                Haftungsausschluss
              </h2>
              <p>
                Dieses Angebot ist ein nicht-kommerzielles Projekt. Die Inhalte dienen ausschließlich Informationszwecken. Trotz sorgfältiger Prüfung übernehmen wir keine Haftung für die Aktualität, Richtigkeit und Vollständigkeit der Inhalte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
