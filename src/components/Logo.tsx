"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LogoProps {
  href?: string;
  size?: number;
  className?: string;
  resetOnClick?: boolean;
  confirmText?: string;
}

function deleteClientCookies() {
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

export function Logo({
  href = "/",
  size = 64,
  className = "rounded-lg hover:opacity-90 transition-opacity",
  resetOnClick = false,
  confirmText = "Willst du wirklich zur Startseite zurückkehren? Dein Fortschritt und Cookies werden gelöscht.",
}: LogoProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!resetOnClick) return;

    e.preventDefault();

    const confirmed = window.confirm(confirmText);
    if (!confirmed) return;

    try {
      localStorage.clear();
      sessionStorage.clear();
      deleteClientCookies();
    } catch (err) {
      console.warn("Reset fehlgeschlagen", err);
    }

    router.push(href);
    router.refresh();
  };

  return (
    <Link
      href={href}
      aria-label="Zur Startseite"
      onClick={handleClick}
      className="inline-flex cursor-pointer"
    >
      <Image
        src="/solacheck/SolaSunLOGO.png"
        alt="SolaCheck Logo"
        width={size}
        height={size}
        priority
        className={className}
      />
    </Link>
  );
}
