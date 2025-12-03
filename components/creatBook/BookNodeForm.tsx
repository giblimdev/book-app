//@/components/creatBook/BookNodeForm.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BookNode } from '@/lib/generated/prisma';

// Schéma Zod local (ou importé)
const nodeSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(['PART', 'CHAPTER', 'SECTION', 'SUBSECTION', 'ARTICLE']),
});

type NodeFormValues = z.infer<typeof nodeSchema>;

interface BookNodeFormProps {
  bookId: string;
  nodeInit?: BookNode | null; // null = création
  parentId?: string | null;   // Pour création enfant
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookNodeForm({ 
  bookId, 
  nodeInit, 
  parentId, 
  onClose, 
  onSuccess 
}: BookNodeFormProps) {
  
  const isEdit = !!nodeInit;

  const form = useForm<NodeFormValues>({
    resolver: zodResolver(nodeSchema),
    defaultValues: {
      title: nodeInit?.title || '',
      type: (nodeInit?.type as any) || 'CHAPTER',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: NodeFormValues) => {
    try {
      const url = '/api/book/bookNode';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit 
        ? { id: nodeInit.id, ...values } 
        : { bookId, parentId, ...values };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Erreur API');

      toast.success(isEdit ? 'Chapitre modifié' : 'Chapitre créé');
      onSuccess();
    } catch (error) {
      toast.error("Une erreur est survenue");
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
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Introduction..." {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PART">Partie</SelectItem>
                  <SelectItem value="CHAPTER">Chapitre</SelectItem>
                  <SelectItem value="SECTION">Section</SelectItem>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>

      </form>
    </Form>
  );
}
