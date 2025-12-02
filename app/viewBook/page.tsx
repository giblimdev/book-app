//@/app/viewBook/page.tsx
/**
 * Rôle :
 *  - Page principale pour visualiser, créer et gérer les livres et leurs nœuds.
 *  - Affiche la sélection d'un livre, puis le plan (BookNodes) et le contenu.
 *  - Utilise Zustand pour suivre l'état de la sélection.
 * 
 * Composants utilisés :
 *  - @/components/creatBook/UserInfo
 *  - @/components/creatBook/BookManager (Dialog pour créer/éditer un livre)
 *  - @/components/creatBook/BookNodeManager (Affiche l'arbre hiérarchique)
 *  - @/components/creatBook/BookNodeContentManager (Éditeur de contenu)
 *  - @/components/creatBook/CommentManager (Section commentaires)
 * 
 * Hooks :
 *  - useBooks (SWR - récupération liste livres)
 *  - useBookNodes (SWR - récupération nœuds)
 *  - useBookSession (Zustand - état navigation)
 * 
 * Routes API utilisées :
 *  - GET /api/book (via useBooks)
 *  - GET /api/bookNode?bookId={id} (via useBookNodes)
 * 
 * Props envoyées :
 *  - BookManager: { isOpen, onClose, onSuccess, editingBook? }
 *  - BookNodeManager: { nodes, bookId }
 *  - BookNodeContentManager: (aucune prop - utilise le store)
 *  - CommentManager: (aucune prop - utilise le store)
 * 
 * UI :
 *  - shadcn/ui : Card, Button, Dialog
 *  - lucide-react : icônes
 *  - Responsive (mobile-first) avec Tailwind CSS
 *  - Accessible (ARIA, focus states, contraste)
 */

'use client';

import React, { useState } from 'react';
import { useBooks, useBookNodes } from '@/hooks/useBooks';
import { useBookSession } from '@/Store/useBookNavStore';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, PlusCircle, FolderTree, RefreshCw } from 'lucide-react';
import { Book } from '@/lib/generated/prisma';

// Composants métier
import UserInfo from '@/components/creatBook/UserInfo';
import BookManager from '@/components/creatBook/BookManager';
import BookNodeManager from '@/components/creatBook/BookNodeManager';
import BookNodeContentManager from '@/components/creatBook/BookNodeContentManager';
import CommentManager from '@/components/creatBook/CommentManager';

export default function ViewBookPage() {
  // État local pour le dialog de création/édition de livre
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Hooks SWR pour récupération des données
  const { books, isLoading, isError, refresh } = useBooks();
  
  // Store Zustand pour l'état de navigation
  const { selectedBookId, setBookId, resetSession } = useBookSession();
  
  // Hook pour récupérer les nœuds du livre sélectionné
  const { nodes, isLoading: isLoadingNodes } = useBookNodes(selectedBookId);

  /**
   * Ouvre le dialog de création de livre
   */
  const handleCreateBook = () => {
    setEditingBook(null);
    setIsBookDialogOpen(true);
  };

  /**
   * Ouvre le dialog d'édition de livre
   */
  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsBookDialogOpen(true);
  };

  /**
   * Callback après succès de création/édition
   */
  const handleBookSuccess = () => {
    setIsBookDialogOpen(false);
    setEditingBook(null);
    refresh(); // Rafraîchit la liste SWR
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* SECTION 1 : User Info + Sélecteur de Livre */}
      <aside className="lg:w-1/4 space-y-4">
        {/* Informations utilisateur */}
        <UserInfo />

        {/* Liste des livres */}
        <Card className="border-2 border-border/50 bg-card rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" /> 
                Mes Livres
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 hover:bg-primary/10 transition-colors"
                onClick={handleCreateBook}
                aria-label="Créer un nouveau livre"
              >
                <PlusCircle className="w-4 h-4" aria-hidden="true" /> 
                Nouveau
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* État : Chargement */}
            {isLoading && (
              <div className="flex justify-center py-8 text-muted-foreground" role="status">
                <Loader2 className="animate-spin h-6 w-6" aria-label="Chargement des livres" />
              </div>
            )}

            {/* État : Erreur */}
            {isError && (
              <div className="py-4 text-center">
                <p className="text-sm text-destructive mb-2">Erreur lors du chargement</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refresh}
                  className="flex items-center gap-2 mx-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  Réessayer
                </Button>
              </div>
            )}

            {/* État : Liste des livres */}
            {!isLoading && !isError && (
              <div className="flex flex-col gap-2">
                {books.map((book) => (
                  <div key={book.id} className="flex items-center gap-2">
                    <Button
                      variant={selectedBookId === book.id ? 'default' : 'ghost'}
                      className="justify-start flex-1 text-left hover:bg-accent"
                      onClick={() => setBookId(book.id)}
                      aria-pressed={selectedBookId === book.id}
                    >
                      <span className="truncate">{book.title}</span>
                    </Button>
                    
                    {/* Bouton d'édition (visible au survol) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
                      onClick={() => handleEditBook(book)}
                      aria-label={`Éditer ${book.title}`}
                    >
                      ✏️
                    </Button>
                  </div>
                ))}

                {/* État vide */}
                {books.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucun livre trouvé. Créez-en un !
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* SECTION 2 : Arbre des nœuds (Plan du livre) */}
      <aside className="lg:w-1/4 space-y-4">
        <Card className="border-2 border-border/50 bg-card rounded-2xl shadow-md h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <FolderTree className="w-5 h-5 text-primary" aria-hidden="true" /> 
                Plan du Livre
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSession}
                disabled={!selectedBookId}
                aria-label="Réinitialiser la sélection"
                className="hover:bg-destructive/10 disabled:opacity-50"
              >
                Réinitialiser
              </Button>
            </div>
          </CardHeader>

          <CardContent className="overflow-y-auto flex-1 max-h-[70vh]">
            {/* État : Aucun livre sélectionné */}
            {!selectedBookId && (
              <p className="text-sm text-muted-foreground text-center py-10">
                👈 Sélectionne un livre pour afficher sa structure.
              </p>
            )}

            {/* État : Chargement des nœuds */}
            {selectedBookId && isLoadingNodes && (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
              </div>
            )}

            {/* État : Affichage de l'arbre */}
            {selectedBookId && !isLoadingNodes && (
              <BookNodeManager 
                nodes={nodes} 
                bookId={selectedBookId} 
              />
            )}
          </CardContent>
        </Card>
      </aside>

      {/* SECTION 3 : Contenu + Commentaires */}
      <main className="flex-1 space-y-4">
        {/* Éditeur de contenu (dépend du nodeId sélectionné dans le store) */}
        <BookNodeContentManager />

        {/* Section commentaires (dépend du nodeId sélectionné) */}
        <CommentManager />
      </main>

      {/* DIALOG : Création/Édition de livre */}
      <BookManager
        isOpen={isBookDialogOpen}
        onClose={() => {
          setIsBookDialogOpen(false);
          setEditingBook(null);
        }}
        onSuccess={handleBookSuccess}
        editingBook={editingBook}
      />
    </div>
  );
}
