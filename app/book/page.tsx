/* eslint-disable @typescript-eslint/no-explicit-any */
// @/app/book/page.tsx
"use client";

import { useState } from "react";
import BookList from "@/components/book/BookList";
import BookForm from "@/components/book/BookForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (book: any) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingBook(null);
  };

  const handleAdd = () => {
    setEditingBook(null);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    // Déclencher un rafraîchissement de la liste sans rechargement
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              Mes livres
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Gérez votre bibliothèque personnelle, ajoutez et modifiez vos
              livres.
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className="gap-2 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un livre
          </Button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
          <BookList
            key={refreshTrigger} // Force le re-render quand refreshTrigger change
            onEdit={handleEdit}
          />
        </div>

        <BookForm
          open={formOpen}
          onClose={handleClose}
          book={editingBook}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
/*mettre a jours le lien vers la page detaile du book @/app/book/[]/page.tsx*/