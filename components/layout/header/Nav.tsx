// @/components/layout/Nav.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Plus, GraduationCap, Ambulance } from "lucide-react";

interface NavProps {
  onItemClick?: () => void;
}

const navLinks = [
  {
    href: "/",
    label: "Home",
    icon: Plus,
  },
  {
    href: "/book",
    label: "Mes-books",
    icon: BookOpen,
  },
  {
    href: "/viewBook",
    label: "test",
    icon: Plus,
  },
  {
    href: "/public/help",
    label: "FAQ",
    icon: GraduationCap,
  },
  {
    href: "/dev",
    label: "Developpement",
    icon: Ambulance,
  },
];

export default function Nav({ onItemClick }: NavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-3 lg:space-y-0">
      {navLinks.map((link) => {
        const IconComponent = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onItemClick}
            className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
              isActive
                ? "text-blue-700 bg-blue-50 lg:bg-transparent lg:border-b-2 lg:border-blue-700 lg:pb-1 lg:rounded-none"
                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-600"
            }`}
          >
            <IconComponent
              className={`mr-4 lg:mr-2 h-6 w-6 lg:h-5 lg:w-5 transition-colors duration-200 ${
                isActive
                  ? "text-blue-700"
                  : "text-gray-400 group-hover:text-gray-600 lg:group-hover:text-blue-600"
              }`}
            />
            <span className="lg:hidden xl:inline text-left">{link.label}</span>
            <span className="hidden lg:inline xl:hidden">
              {link.label.split(" ")[0]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
