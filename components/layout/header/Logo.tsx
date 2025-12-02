// @/components/layout/Logo.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
  alt?: string;
  clickable?: boolean;
}

const sizeMap = {
  sm: { width: 80, height: 26 },
  md: { width: 120, height: 40 },
  lg: { width: 160, height: 53 },
  xl: { width: 200, height: 66 },
};

export default function Logo({
  size = "md",
  className = "rounded-4xl",
  priority = false,
  alt = "Logo de l'application",
  clickable = true,
}: LogoProps) {
  const { width, height } = sizeMap[size];
  const [imageError, setImageError] = useState(false);

  // Logo de fallback - identique côté serveur et client
  const FallbackLogo = () => (
    <div
      className={`flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${Math.min(width, height) / 4}px`,
      }}
    >
      LOGO
    </div>
  );

  const logoContent = imageError ? (
    <FallbackLogo />
  ) : (
    <Image
      src="/logo.png"
      width={width}
      height={height}
      alt={alt}
      priority={priority}
      className={`object-contain transition-transform hover:scale-105 ${className}`}
      style={{
        maxWidth: "100%",
        height: "auto",
      }}
      onError={() => setImageError(true)}
    />
  );

  if (clickable) {
    return (
      <Link
        href="/"
        className="inline-block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-transform duration-200 hover:scale-105"
        aria-label="Retour à l'accueil"
      >
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
