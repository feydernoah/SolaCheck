"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BurgerMenu } from "@/components/BurgerMenu";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { buildAmazonLink } from "@/utils/amazonLink";

export default function ErgebnisPage() {
  const searchParams = useSearchParams();
  const budgetFromUrl = searchParams.get("budget");
  const recommendedPower = 800; // Dummy-Wert
  const amazonLink = buildAmazonLink(recommendedPower, budgetFromUrl ?? undefined);
  return (
    <div className="min-h-screen bg-white relative overflow-hidden p-4">
      {/* Burger Menu */}
      <BurgerMenu showHome showQuiz />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl px-4">
          <Card padding="lg" className="animate-fade-in">
            {/* Titel */}
            <div className="mb-4 flex justify-between items-center">
              <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                Dein Ergebnis
              </span>
            </div>

            {/* Überschrift */}
            <h1 className="text-heading-2 md:text-heading-1 font-bold text-gray-800 mb-4">
              Deine Balkonkraftwerk-Empfehlung
            </h1>

            {/* Kurze Zusammenfassung */}
            <p className="text-base sm:text-lg text-gray-700 mb-6">
              Basierend auf deinen Angaben empfehlen wir dir aktuell ein{" "}
              <span className="font-semibold">{recommendedPower} W</span>{" "}
              Balkonkraftwerk.
            </p>

            {/* Amazon-Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
              <a
                href={amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Zu passenden Angeboten auf Amazon
                </Button>
              </a>

              <Link href="/quiz" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Quiz erneut ausfüllen
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
