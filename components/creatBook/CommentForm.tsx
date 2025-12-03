//@/components/creatBook/CommentForm.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';

// Schéma de validation local ou importé de @/lib/validators/commentSchema.ts
const commentSchema = z.object({
  content: z.string().min(1, 'Le commentaire ne peut pas être vide.'),
});
type CommentFormValues = z.infer<typeof commentSchema>;

interface CommentManagerFormProps {
  nodeId: string;
  onCommentAdded: () => void; // Callback pour revalider les données
}

export default function CommentManagerForm({ nodeId, onCommentAdded }: CommentManagerFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: '' },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CommentFormValues) => {
    const promise = fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodeId,
        content: values.content,
      }),
    });

    toast.promise(promise, {
      loading: 'Envoi du commentaire...',
      success: () => {
        form.reset();
        onCommentAdded(); // Déclenche la revalidation et le scroll dans le parent
        return 'Commentaire ajouté !';
      },
      error: 'Erreur lors de l\'envoi.',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Textarea
                  placeholder="Ajouter un commentaire..."
                  className="min-h-[40px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} size="icon" className="shrink-0 mt-1">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Envoyer</span>
        </Button>
      </form>
    </Form>
  );
}
