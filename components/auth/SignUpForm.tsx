// @/components/auth/SignUpForm.tsx
"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Upload, ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!acceptTerms) {
      setError(
        "Vous devez accepter les conditions d'utilisation pour continuer"
      );
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        image: formData.avatarUrl || undefined,
      });

      if (error) {
        setError(
          error.message || "Une erreur est survenue lors de l'inscription"
        );
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError("Une erreur inattendue est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError("");
    };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData((prev) => ({ ...prev, avatarUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-tr from-indigo-500 to-sky-500 rounded-2xl mb-4 shadow-lg shadow-slate-950/60">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-slate-50 mb-2">
            Créer un compte
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Rejoins ton atelier d’écriture maçonnique.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-xl shadow-slate-950/60">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-lg shadow-slate-950/70"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-500 transition-colors shadow-lg shadow-slate-950/70"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-lg shadow-slate-950/70">
                    <User className="h-10 w-10 text-slate-500" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800 transition-colors">
                  <Upload className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-medium">Choisir un avatar</span>
                </div>
              </label>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-slate-100 mb-2"
              >
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange("name")}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-50 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                placeholder="TRF Gilbert Gasquier"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-100 mb-2"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-50 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                placeholder="marie.curie@sorbonne.fr"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-100 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-950 border border-slate-700 text-slate-50 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                  placeholder="••••••••••••"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400 font-medium">
                Minimum 6 caractères requis
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-slate-100 mb-2"
              >
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-950 border border-slate-700 text-slate-50 placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-colors"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Acceptation des conditions */}
            <div className="border-t border-slate-800 pt-6">
              <div className="flex items-start space-x-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (error) setError("");
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-400"
                  required
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm text-slate-300 leading-relaxed"
                >
                  En créant un compte, vous acceptez nos{" "}
                  <Link
                    href="/legacy-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                  >
                    conditions d'utilisation
                  </Link>{" "}
                  et notre{" "}
                  <Link
                    href="/legacy/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                  >
                    politique de confidentialité
                  </Link>
                  .
                </label>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-950/40 border border-red-900 rounded-xl p-4">
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="w-full bg-linear-to-r from-indigo-500 to-sky-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-400 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-950/70 hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Création en cours...</span>
                </div>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-300 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour à la connexion</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
