//@/components/creatBook/BookNodeContentForm.tsx
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NodeContent } from '@/lib/generated/prisma';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Schéma de validation
const contentSchema = z.object({
  type: z.string(),
  content: z.string().min(1, "Le contenu ne peut pas être vide"),
  // metadata: z.any().optional(), // Pour plus tard (ex: langage code, alt image)
});

type FormValues = z.infer<typeof contentSchema>;

interface BookNodeContentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeId: string;
  contentInit: NodeContent | null;
  initialType?: string; // Type par défaut si création
  onSuccess: () => void;
}

export default function BookNodeContentForm({
  open,
  onOpenChange,
  nodeId,
  contentInit,
  initialType = 'TEXT',
  onSuccess,
}: BookNodeContentFormProps) {
  
  const isEdit = !!contentInit;

  const form = useForm<FormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: initialType,
      content: '',
    },
  });

  // Reset du formulaire à l'ouverture ou changement de mode
  useEffect(() => {
    if (open) {
      form.reset({
        type: contentInit?.type || initialType,
        content: contentInit?.content || '',
      });
    }
  }, [open, contentInit, initialType, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const url = '/api/book/bookNodeContent';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = isEdit
        ? { id: contentInit.id, ...values }
        : { nodeId, ...values, order: 0 }; // Order géré côté backend ou optimisé ici
 
      const res = await fetch(url, {
        method, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      toast.success(isEdit ? 'Bloc mis à jour' : 'Bloc ajouté');
      onSuccess(); // Ferme et refresh
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier le bloc' : 'Ajouter un bloc'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col overflow-hidden p-1">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Selector */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de contenu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="TEXT">Texte standard</SelectItem>
                        <SelectItem value="CODE">Bloc de code</SelectItem>
                        <SelectItem value="IMAGE">Image (URL)</SelectItem>
                        <SelectItem value="TIP">Astuce</SelectItem>
                        <SelectItem value="WARNING">Avertissement</SelectItem>
                        <SelectItem value="QUOTE">Citation</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* Zone d'édition principale */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1 flex flex-col">
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Rédigez votre contenu ici..." 
                      className="flex-1 min-h-[200px] font-mono text-sm resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
