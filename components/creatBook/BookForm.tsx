//@/components/creatBook/BookForm.tsx
/**
 * Rôle :
 *  - Formulaire pour Créer ou Éditer un Livre (Book).
 *  - Utilisé dans le Dialog de BookManager.
 * 
 * Props (mise à jour pour correspondre à BookManager) :
 *  - book: Book | null → Si présent, mode Édition ; sinon, mode Création.
 *  - onClose(): void → Callback pour fermer le formulaire/dialog.
 *  - onSuccess(): void → Callback de succès pour revalidation SWR.
 * 
 * Logique :
 *  - Utilise react-hook-form + zodResolver pour la validation.
 *  - Schema Zod :
 *      { title: string.min(3), description?: string, image?: string.url() }
 *  - Soumission :
 *      POST → /api/book      (création)
 *      PATCH → /api/book/:id (édition)
 * 
 * Fichiers parents :
 *  - @/components/creatBook/BookManager (encapsule ce form dans un Dialog)
 * 
 * Routes API utilisées :
 *  - POST /api/book (création)
 *  - PATCH /api/book/:id (édition)
 * 
 * UI :
 *  - shadcnUI : Input, Label, Textarea, Button, Card
 *  - lucide-react : icons (Save, XCircle, Loader2)
 *  - Validation en temps réel avec Zod
 *  - Messages d'erreur accessibles (aria-describedby implicite via id)
 */

"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Book } from "@/lib/generated/prisma";
import { toast } from "sonner";
import { Loader2, Save, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Schéma de validation Zod pour le formulaire Book
 */
const bookSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit comporter au moins 3 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .url("L'URL de l'image doit être valide")
    .optional()
    .or(z.literal("")),
});

type BookFormValues = z.infer<typeof bookSchema>;

/**
 * Props du composant BookForm
 */
export interface BookFormProps {
  /**
   * Livre en cours d'édition.
   * - null => mode création
   * - Book => mode édition
   */
  book: Book | null;
  /**
   * Callback appelé pour fermer le formulaire/dialog
   */
  onClose: () => void;
  /**
   * Callback appelé après succès (create/update)
   */
  onSuccess: () => void;
}

export default function BookForm({ book, onClose, onSuccess }: BookFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
    },
  });

  /**
   * useEffect pour mettre à jour les valeurs du formulaire
   * quand le prop `book` change (passage en mode édition)
   */
  useEffect(() => {
    if (book) {
      reset({
        title: book.title ?? "",
        description: book.description ?? "",
        image: book.image ?? "",
      });
    } else {
      // Mode création : réinitialiser avec des valeurs vides
      reset({
        title: "",
        description: "",
        image: "",
      });
    }
  }, [book, reset]);

  /**
   * Soumission du formulaire
   */
  const onSubmit = async (values: BookFormValues) => {
    try {
      const method = book ? "PATCH" : "POST";
      const url = book ? `/api/book/${book.id}` : "/api/book";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }

      toast.success(
        book
          ? "Livre mis à jour avec succès ✅"
          : "Livre créé avec succès 🎉"
      );

      // Appelle le callback de succès (revalidation SWR dans le parent)
      onSuccess();
      
      // Réinitialise le formulaire
      reset();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Impossible d'enregistrer le livre ❌"
      );
    }
  };

  /**
   * Annulation : ferme le dialog et reset le formulaire
   */
  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Card className="border-none shadow-none p-0">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CardContent className="space-y-4 pt-4">
          {/* Champ : Titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Titre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="ex: Introduction à React"
              {...register("title")}
              className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Champ : Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Courte description du contenu du livre..."
              rows={4}
              {...register("description")}
              className={
                errors.description
                  ? "border-destructive focus-visible:ring-destructive resize-none"
                  : "resize-none"
              }
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Champ : Image (URL) */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Image de couverture (URL)
            </Label>
            <Input
              id="image"
              type="url"
              placeholder="https://exemple.com/cover.jpg"
              {...register("image")}
              className={errors.image ? "border-destructive focus-visible:ring-destructive" : ""}
              aria-invalid={errors.image ? "true" : "false"}
              aria-describedby={errors.image ? "image-error" : undefined}
            />
            {errors.image && (
              <p id="image-error" className="text-xs text-destructive mt-1" role="alert">
                {errors.image.message}
              </p>
            )}
          </div>
        </CardContent>

        {/* Footer : Boutons d'action */}
        <CardFooter className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2"
            aria-label="Annuler et fermer le formulaire"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
            Annuler
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 min-w-[120px]"
            aria-label={book ? "Mettre à jour le livre" : "Créer le livre"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                <span>{book ? "Mettre à jour" : "Créer"}</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
