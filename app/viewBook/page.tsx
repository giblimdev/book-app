//@/app/viewBook/page.tsx
/** 
 * Rôle :
 *  - Page principale pour visualiser, créer et gérer les livres et leurs nœuds.
 *  - Structure Responsive :
 *     - Mobile/Tablette : 1 colonne empilée.
 *     - Desktop (lg) : 2 colonnes (1/3 gauche : navigation, 2/3 droite : contenu).
 * 
 * Composants utilisés :
 *  - @/components/creatBook/BookManager (Dialog CRUD livre)
 *  - @/components/creatBook/BookNodeManager (Arbre hiérarchique)
 *  - @/components/creatBook/BookNodeContentManager (Éditeur)
 *  - @/components/creatBook/CommentManager (Commentaires)
 * 
 * Hooks :
 *  - useBooks, useBookNodes (SWR)
 *  - useBookSession (Zustand)
 */

'use client';

import React, { useState } from 'react';
import { useBooks, useBookNodes } from '@/hooks/useBooks';
import { useBookSession } from '@/Store/useBookNavStore';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, PlusCircle, FolderTree, RefreshCw } from 'lucide-react';
import { Book } from '@/lib/generated/prisma';

// Import des composants métier (UserInfo supprimé)
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
    <div className="container mx-auto p-4 min-h-[calc(100vh-80px)]">
      
      {/* LAYOUT GRID : 1 colonne mobile, 3 colonnes desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* =======================================================
            COLONNE GAUCHE (1/3) : Navigation (Livres + Arbre)
           ======================================================= */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          
          {/* CARTE 1 : Liste des Livres */}
          <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-primary">
                  <BookOpen className="w-5 h-5" aria-hidden="true" /> 
                  Mes Livres
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={handleCreateBook}
                  aria-label="Créer un nouveau livre"
                >
                  <PlusCircle className="w-4 h-4" aria-hidden="true" /> 
                  Nouveau
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 max-h-[300px] overflow-y-auto custom-scrollbar">
              {/* État : Chargement */}
              {isLoading && (
                <div className="flex justify-center py-8 text-muted-foreground" role="status">
                  <Loader2 className="animate-spin h-6 w-6" aria-label="Chargement des livres" />
                </div>
              )}

              {/* État : Erreur */}
              {isError && (
                <div className="py-4 text-center">
                  <p className="text-sm text-destructive mb-2">Erreur de chargement</p>
                  <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Réessayer
                  </Button>
                </div>
              )}

              {/* État : Liste */}
              {!isLoading && !isError && (
                <div className="flex flex-col gap-2">
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center gap-2 group">
                      <Button
                        variant={selectedBookId === book.id ? 'default' : 'outline'}
                        className={`justify-start flex-1 text-left transition-all ${
                          selectedBookId === book.id 
                            ? 'bg-primary text-primary-foreground shadow-md' 
                            : 'hover:border-primary/50 hover:bg-accent'
                        }`}
                        onClick={() => setBookId(book.id)}
                        aria-pressed={selectedBookId === book.id}
                      >
                        <span className="truncate">{book.title}</span>
                      </Button>
                      
                      {/* Bouton Édition (visible au survol) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        onClick={() => handleEditBook(book)}
                        aria-label={`Éditer ${book.title}`}
                      >
                        ✏️
                      </Button>
                    </div>
                  ))}
                  
                  {books.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                      <p className="text-sm">Aucun livre.</p>
                      <Button variant="link" onClick={handleCreateBook} className="text-xs">
                        Créez votre premier livre !
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARTE 2 : Arbre du livre (Plan) */}
          <Card className="border-2 border-border bg-card shadow-sm flex-1 min-h-[400px]">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
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
                  className="text-xs hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  Réinitialiser
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {!selectedBookId ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
                  <BookOpen className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">Sélectionnez un livre ci-dessus<br/>pour afficher sa structure.</p>
                </div>
              ) : isLoadingNodes ? (
                <div className="flex justify-center py-10 text-muted-foreground">
                  <Loader2 className="animate-spin h-6 w-6" />
                </div>
              ) : (
                <BookNodeManager 
                  nodes={nodes} 
                  bookId={selectedBookId} 
                />
              )}
            </CardContent>
          </Card>
        </aside>

        {/* =======================================================
            COLONNE DROITE (2/3) : Contenu Principal
           ======================================================= */}
        <main className="lg:col-span-2 flex flex-col gap-6">
          
          {/* BLOC 1 : Éditeur de Contenu */}
          <div className="min-h-[500px]">
            <BookNodeContentManager />
          </div>

          {/* BLOC 2 : Commentaires */}
          <div className="min-h-[300px]">
            <CommentManager />
          </div>
        </main>

      </div>

      {/* MODAL : Gestion Livre (Hors flux) */}
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
