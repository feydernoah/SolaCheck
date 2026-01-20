"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BurgerMenu } from "@/components/BurgerMenu";
import { Button } from "@/components/ui/Button";

// File: app/info-page/page.tsx

interface TextSubSection {
  type?: "text"; // optional (default)
  heading: string;
  bullets: string[];
};

interface ImageSubSection  {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
};

type SubSection = TextSubSection | ImageSubSection;

interface Section {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subSections?: SubSection[];
};

const SECTIONS = [
  {
    id: "grundlagen",
    title: "Grundlagen: Was ist ein Balkonkraftwerk?",
    paragraphs: [
      "Ein Balkonkraftwerk (auch Mini-PV- oder Steckersolargerät genannt) ist eine kleine Photovoltaikanlage, die auf dem Balkon, der Terrasse, im Garten oder an der Hauswand installiert werden kann.",
      "Es erzeugt Solarstrom, der direkt im eigenen Haushalt verbraucht wird und so den Bezug von Strom aus dem öffentlichen Netz reduziert.",
      "☀️ Solarmodul → 🔌 Mikrowechselrichter → 🏠 Hausnetz / Geräte",
    ],
    subSections: [
      {
        heading: "So funktioniert es",
        bullets: [
          "Die Solarmodule wandeln Sonnenlicht in Gleichstrom um.",
          "Ein Mikrowechselrichter verwandelt diesen Gleichstrom in haushaltsüblichen Wechselstrom.",
          "Der erzeugte Strom fließt in das Hausnetz und wird von laufenden Geräten direkt genutzt.",
        ],
      },
      {
        heading: "Vorteile für Nutzer:innen",
        bullets: [
          "Reduzierung der Stromkosten durch direkten Eigenverbrauch.",
          "Einfacher Einstieg in die Solarenergie ohne aufwendige Baumaßnahmen.",
          "Aktiver Beitrag zum Klimaschutz durch geringeren Netzstromverbrauch.",
          "Geringer Wartungsaufwand im laufenden Betrieb.",
        ],
      },
    ],
  },
  {
    id: "komponenten",
    title: "Komponenten: Was gehört dazu?",
    subSections: [
      {
        heading: "Typische Teile",
        bullets: [
          "PV-Module: wandeln Sonnenlicht in elektrischen Strom (Gleichstrom) um.",
          "Mikrowechselrichter: macht daraus nutzbaren Haushaltsstrom (Wechselstrom).",
          "Montagesystem: sorgt für eine sichere Befestigung am Balkon, an der Wand oder auf dem Dach.",
          "Kabel & Stecker: verbinden die Anlage und ermöglichen den Anschluss an den Haushalt (z. B. Schuko oder Wieland).",
          "Stromzähler: misst Strombezug und ggf. Einspeisung automatisch mit.",
          "Optional: Speicher/Batterie speichert Überschuss für später (z. B. abends).",
          "Optional: Monitoring zeigt Ertrag, Verbrauch und Einsparung an.",
        ],
      },
      {
        type: "image",
        src: "/solacheck/komponente_grafik.jpg",
        alt: "Vereinfachte Darstellung der Komponenten eines Balkonkraftwerks",
        caption:
          "Vereinfachte Darstellung: Stromfluss vom Solarmodul über den Wechselrichter zu Haushalt, Speicher und Stromnetz.",
      },
      {
        heading: "Worauf achten beim Kauf",
        bullets: [
          "Zertifizierungen: z. B. CE- und VDE-Konformität.",
          "Passende Halterung: muss zu Geländerform und Windlast passen.",
          "Wechselrichter-Leistung: sollte zur Modulleistung abgestimmt sein.",
          "Robuste Qualität: wetterfeste Materialien und saubere Kabelführung.",
          "Anschlussart: Schuko oder Wieland, abhängig vom Setup und Empfehlungen.",
        ],
      },
    ],
  },
  {
    id: "recht",
    title: "Recht & Anmeldung (Deutschland, Stand 2025)",
    subSections: [
      {
        heading: "Leistung",
        bullets: [
          "Pro Haushalt sind bis zu 800 W Einspeiseleistung erlaubt – entscheidend ist dabei die Leistung des Wechselrichters.",
        ],
      },
      {
        heading: "Anmeldung & Registrierung",
        bullets: [
          "Den Netzbetreiber informieren (meist reicht ein kurzes Online-Formular).",
          "Im Marktstammdatenregister (MaStR) registrieren – das ist verpflichtend.",
        ],
      },
      {
        heading: "Genehmigung",
        bullets: [
          "In der Regel ist keine separate Genehmigung nötig, solange die Anlage normgerecht installiert und betrieben wird.",
        ],
      },
      {
        heading: "Für Mieter:innen",
        bullets: [
          "Grundsätzlich ist die Nutzung meist möglich, besonders bei rückbaubarer Montage.",
          "Eine kurze Abstimmung mit Vermieter:in oder Hausverwaltung ist sinnvoll, vor allem bei sichtbarer Montage (z. B. Fassade).",
        ],
      },
      {
        heading: "Steuern",
        bullets: [
          "Bei privater Nutzung fällt in der Regel keine Einkommensteuer an.",
          "Für viele PV-Komponenten gilt 0 % MwSt, abhängig vom konkreten Fall.",
        ],
      },
    ],
  },
  {
    id: "standort-ertrag",
    title: "Standort & Ertrag: Wie viel bringt es wirklich?",
    paragraphs: [
      "Wie viel Strom ein Balkonkraftwerk tatsächlich erzeugt, hängt stark vom Standort und den örtlichen Gegebenheiten ab.",
    ],
    subSections: [
      {
        heading: "Wichtige Einflussfaktoren",
        bullets: [
          "Standort (Region): In südlicheren Regionen ist die Sonneneinstrahlung im Jahresverlauf meist höher als im Norden.",
          "Ausrichtung: Eine Südausrichtung liefert in der Regel den höchsten Ertrag, Ost- oder Westausrichtungen etwas weniger.",
          "Neigung & Winkel: Der richtige Neigungswinkel verbessert die Stromausbeute über das Jahr.",
          "Verschattung: Schatten durch Geländer, Bäume oder Nachbargebäude kann den Ertrag deutlich reduzieren.",
        ],
      },
      {
        type: "image",
        src: "/solacheck/photovoltaik-ausrichtung-grafik.jpg",
        alt: "Einfluss von Ausrichtung und Neigung auf den Ertrag eines Balkonkraftwerks",
        caption:
          "Ausrichtung und Neigung haben großen Einfluss auf den Jahresertrag. Südausrichtung erzielt in der Regel die höchsten Werte.",
      },
      {
        heading: "Typische Jahreserträge (800 W Anlage)",
        bullets: [
          "Sehr gute Bedingungen (Süd, kaum Schatten): etwa 700–800 kWh pro Jahr.",
          "Mittlere Bedingungen (Ost oder West): ungefähr 550–700 kWh pro Jahr.",
          "Starke Verschattung: der Ertrag kann deutlich darunter liegen.",
        ],
      },
      {
        heading: "Wichtig: Theorie ≠ Realität",
        bullets: [
          "In der Praxis liegen die tatsächlichen Erträge oft bei etwa 70–85 % des theoretischen Idealwerts, z. B. durch Temperaturverluste, Wechselrichterverluste, Kabel und zeitweise Verschattung.",
        ],
      },
    ],
  },
  {
    id: "eigenverbrauch",
    title: "Eigenverbrauch & Stromkosten: Was spare ich?",
    paragraphs: [
      "Eigenverbrauch beschreibt den Anteil des erzeugten Solarstroms, den du direkt selbst im Haushalt nutzt. Je höher dieser Anteil ist, desto größer fällt deine Stromkostenersparnis aus.",
    ],
    subSections: [
      {
        heading: "Typische Eigenverbrauchsanteile",
        bullets: [
          "Ohne Speicher werden meist etwa 20–40 % des Solarstroms direkt selbst genutzt.",
          "Bei Homeoffice oder generell viel Anwesenheit tagsüber liegt der Eigenverbrauch oft höher.",
          "Mit Speicher oder gezielter Lastverschiebung (z. B. Waschmaschine mittags) sind bis zu 50–70 % möglich.",
        ],
      },
      {
        heading: "Beispielrechnung",
        bullets: [
          "Jahreserzeugung: ca. 750 kWh.",
          "Eigenverbrauch: 35 % → rund 260 kWh werden selbst genutzt.",
          "Bei einem Strompreis von 0,40 €/kWh ergibt das eine Ersparnis von etwa 100 € pro Jahr.",
        ],
      },
      {
        heading: "Tipps für mehr Eigenverbrauch",
        bullets: [
          "Stromintensive Geräte möglichst tagsüber betreiben.",
          "Timer oder smarte Steckdosen zur automatischen Steuerung nutzen.",
          "Ein Speicher kann sinnvoll sein, wenn der Eigenverbrauch deutlich erhöht wird.",
        ],
      },
    ],
  },
  {
    id: "wirtschaftlichkeit",
    title: "Wirtschaftlichkeit: Kosten & Amortisation",
    subSections: [
      {
        heading: "Typische Gesamtkosten",
        bullets: [
          "Die Anschaffungskosten liegen meist zwischen 400 und 1.000 €, abhängig von Qualität, Modulleistung, Halterung und Zubehör.",
          "Einfachere Sets ohne Speicher sind günstiger, hochwertige Systeme entsprechend teurer.",
        ],
      },
      {
        heading: "Lebensdauer der Komponenten",
        bullets: [
          "Solarmodule haben in der Regel eine Lebensdauer von etwa 20–25 Jahren.",
          "Mikrowechselrichter halten oft kürzer und müssen nach etwa 8–12 Jahren eventuell ersetzt werden.",
        ],
      },
      {
        heading: "Amortisation (grob geschätzt)",
        bullets: [
          "Viele Balkonkraftwerke amortisieren sich nach etwa 7–11 Jahren.",
          "Durch Förderungen von Städten oder Bundesländern kann sich die Amortisationszeit verkürzen.",
        ],
      },
      {
        type: "image",
        src: "/solacheck/amortisation_grafik.png",
        alt: "Diagramm zur Amortisation / Payback-Periode einer Solaranlage",
        caption:
          "Beispielrechnung: Die Balken zeigen die jährliche Stromkostenersparnis, die Linie die einmaligen Anschaffungskosten. Ab dem Schnittpunkt lohnt sich das Balkonkraftwerk finanziell.",
      },
      {
        heading: "Warum Eigenverbrauch wichtiger ist als Einspeisung",
        bullets: [
          "Selbst genutzter Solarstrom spart dir den vollen Strompreis pro Kilowattstunde.",
          "Die Vergütung für eingespeisten Strom ist deutlich niedriger und wirtschaftlich weniger relevant.",
        ],
      },
    ],
  },
  {
    id: "nachhaltigkeit",
    title: "Nachhaltigkeit & CO₂-Einsparung",
    paragraphs: [
      "Solarstrom verursacht über seinen gesamten Lebenszyklus deutlich weniger CO₂ als Strom aus dem öffentlichen Netz.",
    ],
    subSections: [
      {
        heading: "Daumenregel",
        bullets: [
          "Netzstrom: ca. 0,35 kg CO₂ pro kWh",
          "Solarstrom: ca. 0,05 kg CO₂ pro kWh",
          "Ersparnis: rund 0,30 kg CO₂ pro kWh",
        ],
      },
      {
        type: "image",
        src: "/solacheck/netzstrom_vs_solarstrom_grafik.png",
        alt: "Vergleich der CO₂-Emissionen von Netzstrom und Solarstrom",
        caption:
          "CO₂-Emissionen verschiedener Stromquellen: Photovoltaik verursacht im Vergleich zu fossilem Netzstrom deutlich weniger CO₂ pro Kilowattstunde.",
      },
      {
        heading: "Beispielrechnung",
        bullets: [
          "Jahresertrag: 750 kWh × 0,30 kg CO₂ ≈ 225 kg CO₂ pro Jahr",
          "Über 20 Jahre ergibt das eine Einsparung von rund 4,5 Tonnen CO₂",
        ],
      },
      {
        heading: "Hinweis zur Herstellung (graue Energie)",
        bullets: [
          "CO₂ entsteht bei Photovoltaik vor allem während der Produktion der Module.",
          "Im laufenden Betrieb arbeitet die Anlage nahezu emissionsfrei und gleicht diesen Aufwand über die Lebensdauer deutlich aus.",
        ],
      },
    ],
  },
  {
    id: "sicherheit",
    title: "Installation & Sicherheit",
    subSections: [
      {
        heading: "Sicherheit zuerst",
        bullets: [
          "Verwende nur geprüfte, zertifizierte Komponenten (z. B. CE/VDE).",
          "Montiere das System stabil und sturmsicher (Windlast am Balkon beachten).",
          "Verlege Kabel sauber: keine Quetschstellen, keine Stolperfallen, keine scharfen Kanten.",
          "Nutze nur wetterfeste Materialien und UV-beständige Kabel für den Außenbereich.",
          "Wenn du unsicher bist: Installation oder Check durch eine Fachperson durchführen lassen.",
        ],
      },
      {
        heading: "Anschluss & Betrieb",
        bullets: [
          "Der Anschluss erfolgt je nach Setup über eine Schuko-Steckdose oder eine Wieland-Einspeisesteckdose.",
          "Wichtig: Die Anlage muss normgerecht betrieben werden (passender Wechselrichter, Schutzfunktionen).",
          "Der Solarstrom wird zuerst im Haushalt genutzt, Überschuss kann je nach Zähler/Setup ins Netz fließen.",
          "Achte darauf, dass Steckdose und Leitungen in gutem Zustand sind (keine lockeren oder überhitzten Steckverbindungen).",
        ],
      },
      {
        heading: "Kurz-Checkliste",
        bullets: [
          "Halterung sitzt fest und wackelt nicht.",
          "Kabel sind geschützt und ordentlich befestigt.",
          "Stecker sitzt sauber und sicher in der Steckdose.",
          "Wechselrichter ist gut belüftet und nicht dauerhaft direkter Hitze ausgesetzt.",
          "Registrierung/Anmeldung erledigt (Netzbetreiber + MaStR).",
        ],
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ – häufige Fragen zu Balkonkraftwerken",
    subSections: [
      {
        heading: "Lohnt sich ein Balkonkraftwerk für mich?",
        bullets: [
          "In den meisten Fällen ja – besonders, wenn du tagsüber Strom verbrauchst.",
          "Ein sonniger, wenig verschatteter Balkon erhöht den Ertrag deutlich.",
          "Auch bei Ost- oder Westausrichtung kann sich ein Balkonkraftwerk lohnen.",
        ],
      },
      {
        heading: "Was passiert bei schlechtem Wetter oder im Winter?",
        bullets: [
          "Bei Wolken und im Winter ist der Ertrag geringer, aber nicht null.",
          "Über das gesamte Jahr verteilt kann sich die Anlage trotzdem rechnen.",
          "Im Sommer werden die niedrigeren Wintererträge meist ausgeglichen.",
        ],
      },
      {
        heading: "Kann ich ein Balkonkraftwerk als Mieter:in nutzen?",
        bullets: [
          "Ja, das ist in den meisten Fällen möglich.",
          "Wichtig ist eine rückbaubare Montage ohne dauerhafte Veränderungen.",
          "Bei Fassadenmontage kann eine Absprache mit Vermieter oder Hausverwaltung sinnvoll sein.",
        ],
      },
      {
        heading: "Muss ich mein Balkonkraftwerk anmelden?",
        bullets: [
          "Ja, die Anmeldung ist verpflichtend.",
          "Du musst dein Balkonkraftwerk beim Netzbetreiber melden.",
          "Zusätzlich ist eine Registrierung im Marktstammdatenregister (MaStR) erforderlich.",
        ],
      },
      {
        heading: "Ist ein Balkonkraftwerk sicher?",
        bullets: [
          "Ja, wenn ausschließlich geprüfte und zugelassene Komponenten verwendet werden.",
          "Der Wechselrichter schaltet sich automatisch ab, wenn das Netz ausfällt.",
          "Eine fachgerechte Montage ist wichtig für Sicherheit und Langlebigkeit.",
        ],
      },
      {
        heading: "Kann ich mehr als ein Modul anschließen?",
        bullets: [
          "Ja, solange die maximale Einspeiseleistung von 800 Watt eingehalten wird.",
          "Entscheidend ist die Leistung des Wechselrichters, nicht die Modulanzahl.",
        ],
      },
      {
        heading: "Was passiert mit überschüssigem Strom?",
        bullets: [
          "Nicht genutzter Strom fließt zuerst ins Hausnetz.",
          "Je nach Zähler und Setup kann überschüssiger Strom ins öffentliche Netz gelangen.",
          "Eine Vergütung ist meist gering, Eigenverbrauch ist wirtschaftlich sinnvoller.",
        ],
      },
      {
        heading: "Brauche ich einen speziellen Stromzähler?",
        bullets: [
          "In vielen Fällen kann der vorhandene Zähler weiter genutzt werden.",
          "Alte Ferraris-Zähler werden vom Netzbetreiber ggf. ausgetauscht.",
          "Du musst dich in der Regel nicht selbst um den Austausch kümmern.",
        ],
      },
    ],
  },
{
  id: "quellen",
  title: "Quellen & weiterführende Informationen",
  paragraphs: [
    "Die folgenden Quellen wurden zur Erstellung und inhaltlichen Einordnung der Informationen auf dieser Seite genutzt. Sie dienen der Transparenz sowie der weiterführenden Information.",
  ],
  bullets: [
    "Umweltbundesamt (2024) - Entwicklung der spezifischen Treibhausgas-Emissionen des deutschen Strommix: https://www.umweltbundesamt.de/publikationen/entwicklung-der-spezifischen-treibhausgas-emissionen",
    "Fraunhofer ISE (2024) - Energy Charts (Stromerzeugung / PV-Daten): https://energy-charts.info",
    "Fraunhofer ISE (2024) - Life Cycle Assessment of Photovoltaic Systems: https://www.ise.fraunhofer.de",
    "PVGIS (EU Joint Research Centre) - Photovoltaic Geographical Information System: https://joint-research-centre.ec.europa.eu/pvgis_en",
    "Deutscher Wetterdienst (DWD) - Climate Data Center (Strahlungsdaten): https://www.dwd.de/EN/ourservices/cdc/cdc.html",
    "Deutscher Wetterdienst (DWD) - Testreferenzjahre (TRY-Daten): https://www.dwd.de/DE/leistungen/testreferenzjahre/testreferenzjahre.html",
    "Solargis - Solar Resource Maps & GIS-Daten (Deutschland): https://solargis.com/resources/free-maps-and-gis-data?locality=germany",
    "Bundesnetzagentur & Bundeskartellamt (2024) - Monitoringbericht Strom & Gas: https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Monitoringberichte/monitoringberichte_node.html",
    "Bundesnetzagentur - Marktstammdatenregister (MaStR): https://www.marktstammdatenregister.de",
    "BDEW (2024) - Strompreisanalyse Deutschland: https://www.bdew.de/energie/strompreisanalyse/",
    "BDEW - Standardlastprofile Strom : https://www.bdew.de/energie/standardlastprofile-strom/",
    "EEG 2023 - Gesetz zur Förderung Erneuerbarer Energien (u. a. § 48 Abs. 2): https://www.gesetze-im-internet.de/eeg_2023/",
    "Verbraucherzentrale (2025) - Leitfaden Mini-Solaranlagen / Balkonkraftwerke: https://www.verbraucherzentrale.de/wissen/energie/erneuerbare-energien/balkonkraftwerk-energie-vom-balkon-14147",
  ],
}

] satisfies Section[];

function classNames(...parts: (string | false | undefined | null)[]) {
  return parts.filter(Boolean).join(" ");
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={classNames(
        "h-5 w-5 transition-transform duration-200",
        isOpen && "rotate-180"
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SectionBody({ section }: { section: Section }) {
  return (
    <div className="px-4 pb-4 pt-2 sm:px-6">
      {section.paragraphs?.map((text, idx) => (
        <p key={idx} className="mt-2 text-sm leading-6 text-slate-700">
          {text}
        </p>
      ))}

      {section.bullets?.length ? (
      <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-slate-700 break-words">
         {section.bullets.map((item) => {
   const urlRegex = /https?:\/\/\S+/;
   const urlMatch = urlRegex.exec(item);

  if (!urlMatch) {
    return <li key={item}>{item}</li>;
  }

  const url = urlMatch[0];
  const text = item.replace(url, "").trim();

  return (
    <li key={item}>
      <span>{text} </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all hover:text-blue-800"
      >
        {url}
      </a>
    </li>
  );
})}

        </ul>
      ) : null}

      {section.subSections?.map((sub, idx) => {
        if (sub.type === "image") {
          return (
            <figure key={idx} className="my-4">
              <div className="flex justify-center">
                <Image
                  src={sub.src}
                  alt={sub.alt}
                  width={420}
                  height={420}
                  className="w-full max-w-sm rounded-xl border border-slate-200 shadow-sm"
                  unoptimized
                />
              </div>
              {sub.caption && (
                <figcaption className="mt-2 text-xs text-slate-500 text-center">
                  {sub.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        return (
            <div key={`${sub.heading}-${String(idx)}`} className="mt-4">
                <h4 className="text-sm font-semibold text-slate-900">{sub.heading}</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                {sub.bullets.map((b) => (
                    <li key={b}>{b}</li>
                ))}
                </ul>
            </div>
        );
      })}
    </div>
  );
}

function AccordionItem({
  section,
  isOpen,
  onToggle,
}: {
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const buttonId = `${section.id}-button`;
  const panelId = `${section.id}-panel`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className={classNames(
            "flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left sm:px-6",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          )}
        >
          <span className="text-sm font-semibold text-slate-900 sm:text-base">
            {section.title}
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ChevronIcon isOpen={isOpen} />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={classNames(
          "grid overflow-hidden transition-all duration-200",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className={classNames("min-h-0", isOpen && "border-t border-slate-200")}>
          <SectionBody section={section} />
        </div>
      </div>
    </div>
  );
}

export default function SolaCheckInfoPage() {
  const sections = useMemo(() => SECTIONS, []);
  const [openSectionId, setOpenSectionId] = useState<string | null>(
    sections[0]?.id ?? null
  );

  const toggle = useCallback((id: string) => {
    setOpenSectionId((current) => (current === id ? null : id));
  }, []);

  const [buddyIndex, setBuddyIndex] = useState(0);

  const buddyMessages = useMemo(
    () => [
      "Spannend, oder? Viele unterschätzen, wie viel Wissen hinter Balkonkraftwerken steckt.",
      "Wenn man es einmal versteht, wirkt das Thema gleich viel überschaubarer.",
      "Gut, dass du dir Zeit nimmst – die Details machen später den Unterschied.",
    ],
    []
  );

  useEffect(() => {
    if (buddyMessages.length === 0) return;

    const interval = setInterval(() => {
      setBuddyIndex((prev) => (prev + 1) % buddyMessages.length);
    }, 10_000);

    return () => clearInterval(interval);
  }, [buddyMessages.length]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <BurgerMenu showHome showQuiz />
      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl px-4 pt-24 pb-24 sm:px-6 sm:pt-28">
        <header className="mb-8">
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Wissensbereich
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            Tippe auf eine Kategorie, um die Inhalte auszuklappen. Die Infos sind kompakt gehalten und
            speziell für Nutzer:innen von SolaCheck aufbereitet.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link href="/quiz">
              <Button className="rounded-full px-6 py-2 whitespace-nowrap transition-colors duration-150 hover:bg-[#facc15] active:bg-[#facc15]">
                Zum Quiz
              </Button>
            </Link>

            <Link href="/">
              <Button className="sola-secondary-button">Zurück</Button>
            </Link>
          </div>
        </header>

        <section className="space-y-3">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              section={section}
              isOpen={openSectionId === section.id}
              onToggle={() => toggle(section.id)}
            />
          ))}
        </section>
        <footer className="mt-10 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600 shadow-sm sm:p-6">
          <p className="font-semibold text-slate-900">Hinweis</p>
          <p className="mt-1">
            Diese Seite ersetzt keine Rechtsberatung oder Elektro-Fachplanung. Für konkrete Installations-
            und Sicherheitsfragen im Zweifel Fachpersonal hinzuziehen.
          </p>
        </footer>
      </main>

      {/* Info Buddy – Bottom Left */}
      <div className="fixed bottom-4 left-4 z-30">
        <div className="relative">
          <button
            onClick={() =>
              setBuddyIndex((prev) => (prev + 1) % buddyMessages.length)
            }
            className="flex-shrink-0 active:scale-95 transition-transform"
            aria-label="Info-Hilfe anzeigen"
            type="button"
          >
            <Image
              src="/solacheck/Sola_liest.png"
              alt="Sola liest und erklärt"
              width={90}
              height={90}
              className="h-auto w-[90px]"
              unoptimized
            />
          </button>

          <div
            className="
              pointer-events-none
              absolute
              left-full
              bottom-16
              ml-3
              w-[220px]
              bg-white
              rounded-2xl
              rounded-bl-none
              border border-gray-200
              shadow-md
              px-4 py-3
            "
          >
            <p className="text-xs leading-snug text-gray-800">
              {buddyMessages[buddyIndex]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
