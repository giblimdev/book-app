//@/app/components/Book/BookForm.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
//import type { Book } from "@/lib/generated/prisma/client"; 
import { Book } from "@prisma/client";
const formSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type BookFormProps = {
  open: boolean;
  onClose: () => void;
  book?: Book | null; // Utilisation du type Prisma Book
  onSuccess?: () => void;
};

export default function BookForm({ open, onClose, book, onSuccess }: BookFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: book?.title ?? "",
      description: book?.description ?? undefined,
      image: book?.image ?? undefined,
    },
  });

  useEffect(() => {
    if (book) {
      reset({
        title: book.title ?? "",
        description: book.description ?? undefined,
        image: book.image ?? undefined,
      });
    } else {
      reset({
        title: "",
        description: undefined,
        image: undefined,
      });
    }
  }, [book, reset]);

  const onSubmit = async (data: FormValues) => {
    const url = book?.id ? `/api/books/${book.id}` : "/api/books";
    const method = book?.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        image: data.image?.trim() === "" ? undefined : data.image?.trim(),
      }),
    });

    if (!response.ok) {
      let message = "Erreur lors de l'opération";
      try {
        const errorData = await response.json();
        if (errorData?.error) message = errorData.error;
      } catch {
        // JSON non parsable ignoré
      }
      throw new Error(message);
    }

    onClose();
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-slate-800 bg-slate-900/95 text-slate-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {book?.id ? "Modifier le livre" : "Ajouter un livre"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-slate-200">Titre</Label>
            <Input
              {...register("title")}
              className="bg-slate-900 border-slate-700 focus-visible:ring-slate-300"
              placeholder="Titre du livre"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Description</Label>
            <Textarea
              {...register("description")}
              className="bg-slate-900 border-slate-700 focus-visible:ring-slate-300 min-h-[100px]"
              placeholder="Description (optionnelle)"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Image (URL, optionnelle)</Label>
            <Input
              {...register("image")}
              className="bg-slate-900 border-slate-700 focus-visible:ring-slate-300"
              placeholder="https://exemple.com/couverture.jpg"
            />
            <p className="text-[11px] text-slate-500">
              Laisse vide si tu ne veux pas d&apos;image.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-slate-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "En cours..." : book?.id ? "Sauvegarder" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
