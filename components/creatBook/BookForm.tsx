//@/components/creatBook/BookForm.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookCreateSchema, bookUpdateSchema } from '@/lib/validators/bookSchema'; // Assurez-vous que ce fichier existe
import { Book } from '@/lib/generated/prisma';
import { useBookActions } from '@/hooks/useBooks';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

// Schéma unifié pour le formulaire (création ou update)
const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  // Ajoutez d'autres champs ici (image, etc.)
});

type FormValues = z.infer<typeof formSchema>;

interface BookFormProps {
  bookInit?: Book | null; // null = mode création
  onClose: () => void;
  onSuccess: (book: Book) => void;
}

export default function BookForm({ bookInit, onClose, onSuccess }: BookFormProps) {
  const { createBook, updateBook } = useBookActions();
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
    try {
      let resultBook: Book;

      if (isEditMode && bookInit) {
        // Mode Édition
        await updateBook(bookInit.id, values);
        resultBook = { ...bookInit, ...values } as Book; // Optimistic ou retour API à adapter
      } else {
        // Mode Création
        resultBook = await createBook({
          title: values.title,
          description: values.description,
          // Auteur, ordre, etc. gérés par l'API par défaut
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
                  className="resize-none min-h-[80px]"
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Enregistrer' : 'Créer le livre'}
          </Button>
        </div>

      </form>
    </Form>
  );
}
