// @/components/Book/BookList.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import Link from "next/link";
//import type { Book } from "@/lib/generated/prisma/client";
import { Book } from "@prisma/client";

export default function BookList({ onEdit }: { onEdit: (book: Book) => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const sortBooks = (list: Book[]) => {
    return [...list].sort((a, b) => {
      if (a.order != null && b.order != null) {
        return a.order - b.order;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/books");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des livres");
      }

      const data: Book[] = await response.json();
      setBooks(sortBooks(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) return;

    try {
      const response = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Erreur lors de la suppression du livre");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    setBooks((prev) => {
      const sorted = sortBooks(prev);
      const index = sorted.findIndex((b) => b.id === id);
      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev;

      [sorted[index], sorted[targetIndex]] = [sorted[targetIndex], sorted[index]];

      return sorted.map((b, i) => ({ ...b, order: i }));
    });

    // Persist orders for all books
    try {
      await Promise.all(
        books.map((book, i) =>
          fetch(`/api/books/${book.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          })
        )
      );
    } catch {
      // optionally refetch or handle error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-400 text-sm">
        Chargement des livres...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <Button
          onClick={fetchBooks}
          variant="outline"
          className="mt-4 border-slate-700 text-slate-100 hover:bg-slate-800"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (!books.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-slate-200 font-medium">Aucun livre pour le moment.</p>
        <p className="text-slate-500 text-sm mt-1">
          Cliquez sur « Ajouter un livre » pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {books.map((book, index) => (
        <Card
          key={book.id}
          className="border-slate-800 bg-slate-900/80 hover:bg-slate-900 transition-colors flex flex-col overflow-hidden"
        >
          {book.image && (
            <div className="h-40 w-full relative">
              <Link href={`/book/${book.id}`}>
                  <Image
                    src={book.image}
                    alt={book.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t"
                  />
                
              </Link>
            </div>
          )}
          <CardHeader className="space-y-1">
            <CardTitle className="text-slate-50 line-clamp-1">{book.title}</CardTitle>
            {book.description && (
              <CardDescription className="text-slate-400 line-clamp-2">
                {book.description}
              </CardDescription>
            )}
            <div className="text-xs text-slate-500">
              Auteur&nbsp;: {book.authorId}
            </div>
          </CardHeader>
          <CardContent className="mt-auto flex justify-between items-center pt-2">
            <span className="text-xs text-slate-500">
              {new Date(book.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                onClick={() => handleReorder(book.id, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                onClick={() => handleReorder(book.id, "down")}
                disabled={index === books.length - 1}
              >
                <ArrowDown className="w-4 h-4" />
              </Button>

              <Link href={`/book/${book.id}`}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-slate-300 hover:text-slate-50 hover:bg-slate-800"
                  aria-label="Ouvrir le livre"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 border-slate-700 text-indigo-400 hover:text-indigo-200 hover:bg-slate-800"
                onClick={() => onEdit(book)}
              >
                <Pencil className="w-4 h-4" />
              </Button>

              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={() => handleDelete(book.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
