"use client";

import { BurgerMenu } from "@/components/BurgerMenu";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white relative px-4 py-16">
      {/* Burger Menu – oben rechts */}
      <BurgerMenu showHome showQuiz />

      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-heading-1 md:text-display font-bold text-gray-800 mb-4">
              Impressum
            </h1>
          </div>

          {/* Content */}
          <div className="max-w-3xl mx-auto space-y-8 text-gray-700 text-sm md:text-base leading-relaxed">
            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                Angaben gemäß § 5 DDG
              </h2>
              <p>
                SolaCheck<br />
                Studienprojekt – AWP<br />
                Zukunftsagentur Nachhaltigkeit<br />
                Fakultät für Elektro- und Informationstechnik
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                Verantwortlich für den Inhalt
              </h2>
              <p>
                Dr. phil. Cosima Klischat<br />
                Zukunftsagentur Nachhaltigkeit<br />
                Fakultät für Elektro- und Informationstechnik<br />
                Moltkestraße 30<br />
                76133 Karlsruhe<br />
                Deutschland
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                Kontakt
              </h2>
              <p>
                Tel.: +49 (0)721 925-1461<br />
                E-Mail:{" "}
                <a
                  href="mailto:cosima.klischat@h-ka.de"
                  className="underline hover:text-yellow-600"
                >
                  cosima.klischat@h-ka.de
                </a>
              </p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-800 mb-2">
                Haftungsausschluss
              </h2>
              <p>
                Dieses Angebot ist ein nicht-kommerzielles Studienprojekt.
                Die Inhalte dienen ausschließlich Lehr- und Demonstrationszwecken.
                Trotz sorgfältiger Prüfung übernehmen wir keine Haftung für die
                Aktualität, Richtigkeit und Vollständigkeit der Inhalte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
