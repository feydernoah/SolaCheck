"use client";

import { BurgerMenu } from "@/components/BurgerMenu";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white relative px-4 py-16">
      <BurgerMenu showHome showQuiz />

      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-heading-1 md:text-display font-bold text-gray-800 mb-4">
              Datenschutzerklärung
            </h1>
            <p className="text-body text-gray-600">
              Informationen zur Verarbeitung personenbezogener Daten
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-10 text-gray-700 text-sm md:text-base leading-relaxed">

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                1. Verantwortliche Stelle
              </h2>
              <p>
                SolaCheck - Studienprojekt<br />
                Zukunftsagentur Nachhaltigkeit<br />
                Fakultät für Elektro- und Informationstechnik<br />
                Moltkestraße 30, 76133 Karlsruhe<br />
                Deutschland<br />
                E-Mail: cosima.klischat@h-ka.de
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                2. Allgemeiner Hinweis zur Datenverarbeitung
              </h2>
              <p>
                Der Schutz deiner persönlichen Daten ist uns wichtig. Diese Website
                ist ein nicht-kommerzielles Studienprojekt. Wir verarbeiten
                personenbezogene Daten ausschließlich, soweit dies zur
                Bereitstellung der Quiz-Funktion und zur Berechnung der Ergebnisse
                erforderlich ist.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                3. Welche Daten werden verarbeitet?
              </h2>
              <p>
                Im Rahmen des Quiz werden folgende Angaben verarbeitet:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Wohnort oder Postleitzahl (zur Berechnung der Sonnenstunden)</li>
                <li>Anzahl der Personen im Haushalt</li>
                <li>Wohnsituation (z.B. Wohnung oder Haus)</li>
                <li>Wohnungs- bzw. Wohnflächengröße</li>
                <li>Angaben zur baulichen Situation (z.B. Vorhandensein eines Balkons,Ausrichtung oder Montagemöglichkeiten)</li>
                <li>Angaben zum Stromverbrauch</li>
              </ul>
              <p className="mt-2">
                Diese Angaben dienen ausschließlich der Berechnung und Darstellung
                eines individuellen Ergebnisses.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                4. Speicherung der Daten
              </h2>
              <p>
                Die eingegebenen Daten werden <strong>nicht dauerhaft gespeichert</strong>.
                Sie werden nur temporär im Browser (z.B. über technisch notwendige
                Cookies oder Local Storage) verarbeitet, um den Quiz-Fortschritt
                und das Ergebnis darzustellen.
              </p>
              <p className="mt-2">
                Die gespeicherten Daten können jederzeit gelöscht werden, z.B.
                durch das Zurücksetzen des Quiz oder durch das Schließen des Browsers.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                5. Cookies
              </h2>
              <p>
                Diese Website verwendet ausschließlich technisch notwendige Cookies,
                die für die Durchführung des Quiz erforderlich sind (z.B. zur
                Zwischenspeicherung des Quiz-Fortschritts).
              </p>
              <p className="mt-2">
                Diese Cookies werden nicht für Tracking-, Analyse- oder
                Marketingzwecke verwendet und nach Abschluss oder Zurücksetzen
                des Quiz gelöscht.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                6. Ergebnisversand per E-Mail
              </h2>
              <p>
                Nutzer:innen haben die Möglichkeit, sich ihr Ergebnis per E-Mail
                zusenden zu lassen. Die dafür angegebene E-Mail-Adresse sowie die
                Ergebnisdaten werden ausschließlich zum Versand der E-Mail verwendet.
              </p>
              <p className="mt-2">
                Die E-Mail-Adresse und die Ergebnisse werden <strong>nicht bei uns gespeichert </strong> 
                und nach dem Versand nicht weiterverwendet oder archiviert.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                7. Weitergabe von Daten
              </h2>
              <p>
                Es findet keine Weitergabe der erhobenen Daten an Dritte statt.
                Die Verarbeitung erfolgt ausschließlich im Rahmen dieses
                Studienprojekts.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 mb-2">
                8. Rechte der betroffenen Personen
              </h2>
              <p>
                Du hast das Recht auf Auskunft über die Verarbeitung deiner Daten
                sowie auf Berichtigung oder Löschung. Außerdem hast du das Recht,
                die Einschränkung der Verarbeitung zu verlangen und dich bei einer
                zuständigen Datenschutzaufsichtsbehörde zu beschweren.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
