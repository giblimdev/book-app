//@/components/creatBook/BookList.tsx
'use client';

import React from 'react';
import { Book } from '@/lib/generated/prisma';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Edit2, Trash2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookListProps {
  books: Book[];
  selectedBookId: string | null;
  onSelect: (id: string) => void;
  onEditRequest: (book: Book) => void;
  onDelete?: (id: string) => void; // Modifié pour remonter l'ID simplement
}

export default function BookList({
  books,
  selectedBookId,
  onSelect,
  onEditRequest,
  onDelete,
}: BookListProps) {
  
  if (books.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
        <p>Aucun livre disponible.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {books.map((book) => {
          const isSelected = book.id === selectedBookId;

          return (
            <div
              key={book.id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer hover:bg-accent",
                isSelected ? "bg-primary/10 border-primary/50" : "bg-card border-transparent hover:border-border"
              )}
              onClick={() => onSelect(book.id)}
            >
              {/* Info Livre */}
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {isSelected ? <Check className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                </div>
                <div className="truncate">
                  <p className="font-medium text-sm truncate">{book.title}</p>
                  {book.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {book.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Rapides (Visibles au hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditRequest(book);
                  }}
                  title="Modifier"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(book.id);
                    }}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
