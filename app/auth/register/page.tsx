// @/app/auth/register/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/auth/SignUpForm";

export default async function RegisterPage() {
  return (
    <main className="min-h-screen">
      {/* SEO et Accessibility */}
      <div className="sr-only">
        <h1>Page d'inscription</h1>
        <p>Créez votre compte pour accéder à notre plateforme</p>
      </div>

      {/* Composant d'inscription */}
      <SignUpForm />
    </main>
  );
}
