// @/app/welcome/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { Loader2, User, ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user) {
      // Redirection automatique vers le dashboard après 2 secondes
      const timer = setTimeout(() => {
        router.push("/book");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Header avec animation */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-blue-600 to-blue-700 rounded-3xl mb-6 shadow-2xl animate-pulse">
            <User className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Bienvenue, {session.user.name} !
          </h1>

          <p className="text-slate-600 text-lg mb-8">
            Votre compte a été créé avec succès. Vous allez être redirigé vers
            votre tableau de bord.
          </p>
        </div>

        {/* Message de redirection */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <ArrowRight className="h-6 w-6 text-blue-600 animate-bounce" />
            <span className="text-slate-700 font-medium">
              Redirection en cours...
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 h-2 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Bouton manuel au cas où */}
        <button
          onClick={() => router.push("/book")}
          className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Accéder maintenant à mon dashboard
        </button>
      </div>
    </div>
  );
}
