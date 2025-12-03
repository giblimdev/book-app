//@/components/creatBook/CommentManager.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/hooks/fetcher';
import { useSession } from '@/lib/auth/auth-client';
import { Comment, User } from '@/lib/generated/prisma';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import CommentManagerList from '@/components/creatBook/CommentList';
import CommentManagerForm from '@/components/creatBook/CommentForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

type CommentWithAuthor = Comment & { user: User };

interface CommentManagerProps {
  nodeId: string;
}

export default function CommentManager({ nodeId }: CommentManagerProps) {
  // Session pour identifier l'auteur (pour les suppressions)
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Référence pour le scroll automatique
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  // 1. Data Fetching (SWR)
  const swrKey = `/api/comment?nodeId=${nodeId}`;
  const { data, error, isLoading, mutate } = useSWR<CommentWithAuthor[]>(swrKey, fetcher);

  // Tri chronologique (ancien -> récent)
  const comments = data 
    ? [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) 
    : [];

  // 2. État pour la suppression
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 3. Gestion du scroll automatique après un nouvel ajout
  useEffect(() => {
    if (shouldScrollToBottom && scrollViewportRef.current) {
      // Petit délai pour laisser le temps au DOM de se mettre à jour
      setTimeout(() => {
        const viewport = scrollViewportRef.current;
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
      setShouldScrollToBottom(false);
    }
  }, [comments.length, shouldScrollToBottom]);

  // Handlers
  const handleCommentAdded = () => {
    mutate(); // Revalidate les données
    setShouldScrollToBottom(true); // Trigger scroll
  };

  const handleDeleteRequest = (id: string) => {
    setCommentToDelete(id);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/comment?id=${commentToDelete}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erreur API');

      toast.success('Commentaire supprimé');
      
      // Mise à jour optimiste locale
      mutate(
        comments.filter((c) => c.id !== commentToDelete),
        false // Ne pas revalider immédiatement pour éviter le "flash"
      );
    } catch (error) {
      toast.error('Impossible de supprimer le commentaire.');
    } finally {
      setIsDeleting(false);
      setCommentToDelete(null);
    }
  };

  // Rendu Loading / Erreur
  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-4 p-4">
        <div className="space-y-4 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-4 text-center">Erreur lors du chargement des commentaires.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Zone Scrollable des commentaires */}
      <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollViewportRef as any}>
        <div className="py-4">
          <CommentManagerList
            comments={comments}
            currentUserId={currentUserId}
            onDelete={handleDeleteRequest}
          />
        </div>
      </ScrollArea>

      {/* Formulaire sticky en bas */}
      <div className="pt-4 border-t mt-auto bg-background sticky bottom-0 z-10">
        <CommentManagerForm
          nodeId={nodeId}
          onCommentAdded={handleCommentAdded}
        />
      </div>

      {/* Dialogue de confirmation suppression */}
      <ConfirmDialog
        open={!!commentToDelete}
        onOpenChange={(open) => !open && setCommentToDelete(null)}
        title="Supprimer le commentaire ?"
        description="Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
