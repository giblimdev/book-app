//@/components/creatBook/BookList.tsx
/**
 * Rôle :
 *  - Affiche la liste des livres de l’utilisateur connecté.
 * 
 * Fonctionnalités :
 *  - Affiche les titres des livres sous forme de liste.
 *  - Permet la sélection, la modification, la suppression et le réordonnancement.
 *  - Met en surbrillance le livre actif (selectedBookId du store Zustand).
 * 
 * Props :
 *  - books: Book[] — liste des livres récupérés depuis SWR.
 *  - selectedBookId?: string | null — identifiant du livre sélectionné.
 *  - onSelect(bookId: string): void — met à jour le store (useBookSession).
 *  - onEdit(book: Book): void — ouvre le BookForm pour édition.
 *  - onDelete(bookId: string): void — supprime un livre.
 *  - onReorder(orderedIds: string[]): void — met à jour l’ordre (PATCH).
 * 
 * UI :
 *  - shadcnUI : ScrollArea, Button, Card
 *  - lucide-react : icons (Edit, Trash, ArrowUp, ArrowDown)
 *  - Design responsive, contrasté, accessible
 */

"use client";

import React from "react";
import { Book } from "@/lib/generated/prisma";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useBookSession } from "@/Store/useBookNavStore";

type BookListProps = {
  books: Book[];
  selectedBookId?: string | null;
  onSelect: (bookId: string) => void; 
  onEdit: (book: Book) => void;
  onDelete: (bookId: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

export default function BookList({
  books,
  selectedBookId,
  onSelect,
  onEdit,
  onDelete,
  onReorder,
}: BookListProps) {
  const { selectedBookId: storeBookId } = useBookSession();

  const handleMove = (index: number, direction: "up" | "down") => {
    const newBooks = [...books];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= books.length) return;

    // Swap
    [newBooks[index], newBooks[targetIndex]] = [
      newBooks[targetIndex],
      newBooks[index],
    ];

    onReorder(newBooks.map((b) => b.id));
  };

  return (
    <ScrollArea className="max-h-[65vh] pr-2">
      <ul className="flex flex-col gap-2">
        {books.map((book, index) => {
          const isActive = selectedBookId === book.id || storeBookId === book.id;
          return (
            <li
              key={book.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 border-primary text-primary-foreground"
                  : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onSelect(book.id)}
            >
              <span className="font-medium truncate flex-1">{book.title}</span>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Déplacer vers le haut"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, "up");
                  }}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Déplacer vers le bas"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove(index, "down");
                  }}
                  disabled={index === books.length - 1}
                >
                  <ArrowDown className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Modifier le livre"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(book);
                  }}
                >
                  <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Supprimer le livre"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {books.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Aucun livre trouvé.
        </p>
      )}
    </ScrollArea>
  );
}
