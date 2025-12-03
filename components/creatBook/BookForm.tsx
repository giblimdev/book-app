//@/components/creatBook/BookForm.tsx
'use client'; 

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Book } from '@/lib/generated/prisma';
import { useBookActions } from '@/hooks/useBooks';
import { useSession } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

// Schéma unifié pour le formulaire
const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BookFormProps {
  bookInit?: Book | null; // null = mode création
  onClose: () => void;
  onSuccess: (book: Book) => void;
}

export default function BookForm({ bookInit, onClose, onSuccess }: BookFormProps) {
  const { createBook, updateBook } = useBookActions();
  const { data: session } = useSession();
  const isEditMode = !!bookInit;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: bookInit?.title || '',
      description: bookInit?.description || '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: FormValues) => {
    if (!session?.user?.id) {
      // Sécurité supplémentaire si la session est perdue
      console.error("Utilisateur non connecté");
      return;
    }

    try {
      let resultBook: Book;

      if (isEditMode && bookInit) {
        // Mode Édition
        await updateBook(bookInit.id, values);
        // Optimistic update ou reconstruction partielle du résultat
        resultBook = { ...bookInit, ...values } as Book; 
      } else {
        // Mode Création
        // On passe l'authorId récupéré de la session
        resultBook = await createBook({
          title: values.title,
          description: values.description,
          authorId: session.user.id, // ID obligatoire selon votre schéma
        });
      }

      form.reset();
      onSuccess(resultBook);
    } catch (error) {
      // L'erreur est déjà toastée par useBookActions
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du livre</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Guide de l'Architecture Hexagonale" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnelle)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Court résumé du contenu..." 
                  className="resize-none min-h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || (!isEditMode && !session?.user)}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Enregistrer' : 'Créer le livre'}
          </Button>
        </div>

      </form>
    </Form>
  );
}
