"use client";

import Link from "next/link";

type LogoProps = {
  variant?: "full" | "compact";
  href?: string;
  className?: string;
};

/**
 * Logo da 5R Energia Solar
 * Posicionado no header ou sidebar conforme diretrizes do Módulo 05
 * Suporta fallback textual quando a imagem não está disponível
 */
export function Logo({ variant = "full", href = "/", className = "" }: LogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-5r.png"
        alt="5R Energias Renováveis"
        className="h-9 w-auto object-contain md:h-11 max-w-[140px] md:max-w-[160px]"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const next = e.currentTarget.nextElementSibling;
          if (next instanceof HTMLElement) next.style.display = "flex";
        }}
      />
      <div
        className="hidden items-center gap-2 text-brand-navy-800 font-bold uppercase tracking-tight"
        style={{ fontSize: "1rem" }}
      >
        <span className="text-brand-orange">5R</span>
        <span>Energias Renováveis</span>
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="flex items-center focus:outline-none focus:ring-2 focus:ring-brand-orange focus:ring-offset-2 rounded-lg transition-opacity hover:opacity-90"
    >
      {logoContent}
    </Link>
  ) : (
    logoContent
  );
}
