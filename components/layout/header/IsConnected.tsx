// @/components/layout/IsConnected.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth/auth-client";
import {
  User,
  ChevronDown,
  Calendar,
  Settings,
  LogOut,
  Loader2,
} from "lucide-react";

interface IsConnectedProps {
  mobileMode?: boolean;
  onItemClick?: () => void;
}

export default function IsConnected({
  mobileMode = false,
  onItemClick,
}: IsConnectedProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Récupérer la session avec Better Auth
  const { data: session, isPending } = useSession();

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setIsDropdownOpen(false);
      onItemClick?.();
      router.push("/auth/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleMenuClick = () => {
    closeDropdown();
    onItemClick?.();
  };

  // Affichage pendant le chargement
  if (isPending) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // Si pas de session : afficher le bouton de connexion
  if (!session) {
    return (
      <Link
        href="/auth/login"
        onClick={onItemClick}
        className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
          mobileMode ? "w-full" : "w-full lg:w-auto"
        }`}
      >
        Se connecter
      </Link>
    );
  }

  // Mode mobile : affichage étendu avec options directement visibles
  if (mobileMode) {
    return (
      <div className="space-y-4">
        {/* Profil utilisateur */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={`Avatar de ${session.user.name || "Utilisateur"}`}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium text-gray-900 truncate">
                {session.user.name || "Utilisateur"}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="space-y-2">
            <Link
              href="/user/dashboard"
              onClick={handleMenuClick}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-white hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <Calendar className="mr-3 h-4 w-4 text-gray-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/user/profile"
              onClick={handleMenuClick}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-white hover:text-gray-900 rounded-lg transition-colors duration-200"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400" />
              <span>Mon profil</span>
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex items-center w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-800 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-3 h-4 w-4 text-red-500" />
              )}
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode desktop : dropdown classique
  return (
    <div className="relative w-full lg:w-auto" ref={dropdownRef}>
      {/* Bouton utilisateur */}
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-3 p-3 lg:p-2 rounded-xl lg:rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 group w-full lg:w-auto"
        aria-expanded={isDropdownOpen}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={`Avatar de ${session.user.name || "Utilisateur"}`}
              className="h-10 w-10 lg:h-9 lg:w-9 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-300 transition-colors duration-200"
            />
          ) : (
            <div className="h-10 w-10 lg:h-9 lg:w-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-gray-300 transition-colors duration-200">
              <User className="h-5 w-5 lg:h-5 lg:w-5 text-white" />
            </div>
          )}
        </div>

        {/* Nom utilisateur */}
        <div className="text-left min-w-0 flex-1 lg:flex-none">
          <p className="text-base lg:text-sm font-medium text-gray-900 truncate">
            {session.user.name || "Utilisateur"}
          </p>
          <p className="text-sm lg:text-xs text-gray-500 truncate lg:max-w-[160px]">
            {session.user.email}
          </p>
        </div>

        {/* Icône flèche - visible sur desktop seulement */}
        <ChevronDown
          className={`h-5 w-5 lg:h-4 lg:w-4 text-gray-400 transition-transform duration-200 hidden lg:block ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Menu déroulant - seulement sur desktop */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-50 overflow-hidden hidden lg:block">
          {/* En-tête utilisateur */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={`Avatar de ${session.user.name || "Utilisateur"}`}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name || "Utilisateur"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Options du menu */}
          <div className="py-1">
            <Link
              href="/user/dashboard"
              onClick={closeDropdown}
              className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <Calendar className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              <div>
                <p className="font-medium">Dashboard</p>
                <p className="text-xs text-gray-500">
                  Vos rituels et autres informations
                </p>
              </div>
            </Link>

            <Link
              href="/user/profile"
              onClick={closeDropdown}
              className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              <div>
                <p className="font-medium">Mon profil</p>
                <p className="text-xs text-gray-500">
                  Informations personnelles
                </p>
              </div>
            </Link>
          </div>

          {/* Séparateur */}
          <div className="border-t border-gray-100"></div>

          {/* Déconnexion */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="group flex items-center w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600" />
              )}
              <div>
                <p className="font-medium">Se déconnecter</p>
                <p className="text-xs text-red-500">Fermer la session</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
