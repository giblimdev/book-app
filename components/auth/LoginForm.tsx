// @/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error) {
        setError(
          error.message || "Une erreur est survenue lors de la connexion"
        );
      } else {
        router.push("/auth/welcome");
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-500 to-sky-500 px-8 py-8 text-center">
          <span className="inline-flex items-center rounded-full bg-black/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-100 mb-3">
            FM-Book · Connexion
          </span>
          <h1 className="text-2xl font-semibold text-white mb-1">
            Content de te revoir
          </h1>
          <p className="text-sm text-indigo-100">
            Connecte-toi à ton atelier d’écriture.
          </p>
        </div>

        <div className="px-6 py-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-100 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={clearError}
                required
                placeholder="toi@example.com"
                className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-100 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={clearError}
                  required
                  placeholder="Ton mot de passe"
                  className="w-full px-3 py-2 pr-10 rounded-md bg-slate-950 border border-slate-700 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-400"
                />
                <label htmlFor="rememberMe" className="ml-2 text-slate-300">
                  Se souvenir de moi
                </label>
              </div>

              <Link
                href="/auth/forgot-password"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-900 rounded-md p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-500 text-white py-2.5 px-4 text-sm font-medium hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              <span>{isLoading ? "Connexion..." : "Se connecter"}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-center text-sm text-slate-400">
              Nouveau ici ?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-indigo-400 hover:text-indigo-300"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
