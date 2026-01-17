"use client";

import Image from "next/image";
import Link from "next/link";
import { useResetConfirmation } from "@/components/ResetConfirmDialog";

interface LogoProps {
  href?: string;
  size?: number;
  className?: string;
  resetOnClick?: boolean;
}

export function Logo({
  href = "/",
  size = 64,
  className = "rounded-lg hover:opacity-90 transition-opacity",
  resetOnClick = false,
}: LogoProps) {
  const { confirmAndReset } = useResetConfirmation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!resetOnClick) return;

    e.preventDefault();
    confirmAndReset({ navigateTo: href });
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
