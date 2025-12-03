//@/components/creatBook/CommentList.tsx
'use client';

import React from 'react';
import { Comment, User } from '@/lib/generated/prisma'; 
import { formatRelative, formatDateTime } from '@/lib/utils/date'; 

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Étendre le type pour inclure l'auteur
type CommentWithAuthor = Comment & { user: User };

interface CommentManagerListProps {
  comments: CommentWithAuthor[];
  currentUserId?: string;
  onDelete: (id: string) => void;
}

export default function CommentManagerList({
  comments,
  currentUserId,
  onDelete,
}: CommentManagerListProps) {
  
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="font-semibold">Aucun commentaire</h3>
        <p className="text-sm">Soyez le premier à réagir sur ce chapitre.</p>
      </div>
    );
  }
 
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        {comments.map((comment) => {
          const isAuthor = currentUserId === comment.userId;
          const authorName = comment.user?.name || 'Utilisateur Anonyme';
          const authorInitials = authorName.charAt(0).toUpperCase();

          return (
            <div key={comment.id} className="group flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user?.image || undefined} alt={authorName} />
                <AvatarFallback>{authorInitials}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{authorName}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs text-muted-foreground cursor-default">
                          {formatRelative(comment.createdAt)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formatDateTime(comment.createdAt)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  {isAuthor && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                      onClick={() => onDelete(comment.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-line mt-1">
                  {comment.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
