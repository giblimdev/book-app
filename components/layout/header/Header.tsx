// @/components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Nav from "./Nav";
import IsConnected from "./IsConnected";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Fermer le menu lors du redimensionnement de l'écran
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Navigation desktop - cachée sur mobile */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Nav />
          </div>

          {/* Section droite - Desktop seulement */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <IsConnected />
          </div>

          {/* Section mobile - seulement bouton menu */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              aria-expanded={isMenuOpen}
              aria-label="Menu principal"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu mobile - plein écran avec fond blanc */}
          <div className="fixed inset-0 z-50 lg:hidden bg-white">
            <div className="flex flex-col h-full">
              {/* En-tête du menu mobile */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <Logo size="sm" />
                <button
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation mobile */}
              <div className="flex-1 py-6 bg-white">
                <nav className="px-4">
                  <Nav onItemClick={closeMenu} />
                </nav>
              </div>

              {/* Section utilisateur en bas du menu mobile */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <IsConnected mobileMode={true} onItemClick={closeMenu} />
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
