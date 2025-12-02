//@/components/creatBook/CommentManager.tsx
/**
 * Rôle :
 *  - Gestionnaire des commentaires pour un nœud sélectionné.
 *  - Visible uniquement si un `selectedNodeId` est défini dans le store.
 * 
 * Responsabilités :
 *  - Récupérer les commentaires via SWR (/api/comment?nodeId=...).
 *  - Afficher la liste des commentaires (CommentManagerList).
 *  - Permettre l'ajout de commentaire (CommentManagerForm).
 *  - Mise à jour optimiste de l'UI lors de l'ajout.
 * 
 * UI :
 *  - shadcnUI : Card, Button, Textarea, Avatar, ScrollArea, Separator
 *  - lucide-react : MessageSquare, Send, Trash2, Loader2, User
 */

"use client";

import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { useBookSession } from "@/Store/useBookNavStore";
import { fetcher } from "@/hooks/useBooks";
import { Comment, User } from "@/lib/generated/prisma";
import { toast } from "sonner";

import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, Trash2, Loader2, User as UserIcon } from "lucide-react";

// Type étendu pour inclure l'auteur dans le commentaire
type CommentWithAuthor = Comment & {
  user: Pick<User, "name" | "image">;
};

/**
 * SOUS-COMPOSANT : Liste des commentaires
 */
const CommentManagerList = ({ 
  comments, 
  isLoading,
  onDelete 
}: { 
  comments: CommentWithAuthor[] | undefined; 
  isLoading: boolean;
  onDelete: (id: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="text-center py-10 px-4 text-muted-foreground space-y-2">
        <MessageSquare className="w-10 h-10 mx-auto opacity-20" />
        <p className="text-sm">Aucun commentaire pour le moment.</p>
        <p className="text-xs">Soyez le premier à laisser une note sur ce chapitre.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage src={comment.user?.image || ""} />
              <AvatarFallback>
                <UserIcon className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{comment.user?.name || "Utilisateur"}</span>
                  {/* Affichage simple de la date sans librairie externe */}
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => onDelete(comment.id)}
                  aria-label="Supprimer le commentaire"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

/**
 * SOUS-COMPOSANT : Formulaire d'ajout
 */
const CommentManagerForm = ({ 
  nodeId, 
  onAdd 
}: { 
  nodeId: string; 
  onAdd: (content: string) => Promise<void>; 
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(content);
      setContent(""); // Reset après succès
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Textarea
        placeholder="Ajouter une note ou un commentaire..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-20 resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      /> 
      <Button 
        type="submit" 
        size="icon" 
        disabled={!content.trim() || isSubmitting}
        className="h-10 w-10 mb-1 shrink-0"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
};

/**
 * COMPOSANT PRINCIPAL
 */
export default function CommentManager() {
  // 1. Récupération du nœud sélectionné
  const selectedNodeId = useBookSession((state) => state.selectedNodeId);
  const apiEndpoint = selectedNodeId ? `/api/comment?nodeId=${selectedNodeId}` : null;

  // 2. Fetching des commentaires
  const { data: comments, isLoading, mutate: refreshComments } = useSWR<CommentWithAuthor[]>(
    apiEndpoint, 
    fetcher
  );

  // 3. Gestionnaire d'ajout (Optimistic UI)
  const handleAddComment = async (content: string) => {
    if (!selectedNodeId) return;

    // Création d'un commentaire temporaire pour l'affichage immédiat
    const tempComment: CommentWithAuthor = {
      id: `temp-${Date.now()}`,
      content,
      nodeId: selectedNodeId,
      userId: "me", // Simulé
      createdAt: new Date(),
      updatedAt: new Date(),
      isEdited: false,
      user: { name: "Moi", image: null } // Placeholder optimiste
    };

    // Mutation optimiste
    await mutate(
      apiEndpoint,
      async () => {
        const res = await fetch("/api/comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeId: selectedNodeId, content }),
        });
        
        if (!res.ok) throw new Error("Erreur d'envoi");
        return [...(comments || []), await res.json()];
      },
      {
        optimisticData: [...(comments || []), tempComment],
        rollbackOnError: true,
        populateCache: true,
        revalidate: false
      }
    );
    
    toast.success("Commentaire ajouté");
  };

  // 4. Gestionnaire de suppression
  const handleDeleteComment = async (commentId: string) => {
    const newComments = comments?.filter(c => c.id !== commentId);
    
    await mutate(
      apiEndpoint,
      async () => {
        await fetch(`/api/comment/${commentId}`, { method: "DELETE" });
        return newComments;
      },
      {
        optimisticData: newComments,
        rollbackOnError: true,
        revalidate: false
      }
    );
    
    toast.success("Commentaire supprimé");
  };

  // Si aucun nœud n'est sélectionné, on affiche un placeholder
  if (!selectedNodeId) {
    return (
      <Card className="bg-muted/10 border-dashed h-full flex items-center justify-center">
        <div className="text-muted-foreground text-sm p-4 text-center">
          Sélectionnez un nœud pour voir les commentaires
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-border shadow-sm flex flex-col h-full">
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/5">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Commentaires & Notes
          {comments && comments.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal ml-auto">
              {comments.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 flex-1">
        <CommentManagerList 
          comments={comments} 
          isLoading={isLoading} 
          onDelete={handleDeleteComment}
        />
      </CardContent>
      
      <Separator />
      
      <CardFooter className="p-4 bg-muted/5">
        <div className="w-full">
          <CommentManagerForm nodeId={selectedNodeId} onAdd={handleAddComment} />
        </div>
      </CardFooter>
    </Card>
  );
}
