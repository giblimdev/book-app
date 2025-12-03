//@/components/creatBook/BookManager.tsx
'use client';

import React, { useState } from 'react';
import { useBooks, useBookActions } from '@/hooks/useBooks';
import { useBookNavStore } from '@/Store/useBookNavStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { BookOpen, Edit2, Plus, RotateCw } from 'lucide-react';
import { Book } from '@/lib/generated/prisma';

import BookList from './BookList';
import BookForm from './BookForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function BookManager() {
  // État global (Zustand)
  const { selectedBookId, setBookId } = useBookNavStore();
  
  // Données & Actions (SWR)
  const { books, isLoading, isError } = useBooks();
  const { deleteBook } = useBookActions();

  // États locaux pour Dialogs
  const [isListOpen, setIsListOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  
  // État pour suppression
  const [bookToDelete, setBookToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Livre actuellement sélectionné
  const currentBook = books.find((b) => b.id === selectedBookId);

  // --- Handlers ---

  const handleCreateClick = () => {
    setEditingBook(null);
    setIsFormOpen(true);
  };

  const handleEditClick = () => {
    if (currentBook) {
      setEditingBook(currentBook);
      setIsFormOpen(true);
    }
  };

  const handleBookSelect = (id: string) => {
    setBookId(id);
    setIsListOpen(false);
    toast.success('Livre sélectionné');
  };

  const handleEditRequest = (book: Book) => {
    setEditingBook(book);
    setIsListOpen(false); // Ferme la liste
    setIsFormOpen(true);  // Ouvre le formulaire
  };

  const handleDeleteRequest = async (id: string) => {
    setBookToDelete(id);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBook(bookToDelete);
      if (selectedBookId === bookToDelete) {
        setBookId(null); // Désélectionner si c'était le livre actif
      }
      setBookToDelete(null);
    } catch (error) {
      // Erreur déjà gérée par useBookActions
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = (book: Book) => {
    setBookId(book.id); // Sélectionner automatiquement le nouveau/modifié
    setIsFormOpen(false);
  };

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-lg" />;
  }

  if (isError) {
    return (
      <Card className="p-4 border-destructive text-destructive">
        Erreur de chargement des livres.
      </Card>
    );
  }

  return (
    <Card className="p-4 shadow-sm bg-card text-card-foreground">
      {/* Header: Titre + Actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>{currentBook ? currentBook.title : 'Aucun livre sélectionné'}</span>
        </div>
        
        {/* Actions Principales */}
        <div className="flex gap-2">
          {currentBook ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsListOpen(true)}>
                <RotateCw className="h-4 w-4 mr-2" />
                Changer
              </Button>
              <Button variant="secondary" size="icon" onClick={handleEditClick} title="Modifier">
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsListOpen(true)} variant="outline">
              Sélectionner
            </Button>
          )}
        </div>
      </div>

      {/* État vide: Bouton Créer proéminent */}
      {!currentBook && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Commencez par créer ou ouvrir un livre pour éditer son contenu.
          </p>
          <Button onClick={handleCreateClick} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Créer un livre
          </Button>
        </div>
      )}

      {/* --- DIALOG 1: LISTE DES LIVRES --- */}
      <Dialog open={isListOpen} onOpenChange={setIsListOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Vos livres</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <div className="flex justify-end mb-4">
              <Button onClick={() => { setIsListOpen(false); handleCreateClick(); }}>
                <Plus className="h-4 w-4 mr-2" /> Nouveau livre
              </Button>
            </div>
            <BookList
              books={books}
              selectedBookId={selectedBookId}
              onSelect={handleBookSelect}
              onEditRequest={handleEditRequest}
              onDelete={handleDeleteRequest} // Passe la demande de suppression au Manager
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* --- DIALOG 2: FORMULAIRE (CRÉATION / ÉDITION) --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Modifier le livre' : 'Nouveau livre'}</DialogTitle>
          </DialogHeader>
          <BookForm
            bookInit={editingBook}
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* --- DIALOG 3: CONFIRMATION SUPPRESSION --- */}
      <ConfirmDialog
        open={!!bookToDelete}
        onOpenChange={(open) => !open && setBookToDelete(null)}
        title="Supprimer ce livre ?"
        description="Cette action supprimera définitivement le livre et tous ses chapitres."
        confirmLabel="Supprimer"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
