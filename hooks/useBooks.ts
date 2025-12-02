//@/hooks/useBooks.ts
/**
 * Rôle :
 *  - Fournir des hooks React pour interagir avec les livres et leurs nœuds.
 *  - Utilise SWR pour la mise en cache et la synchronisation.
 *  - Fournit également des fonctions de mutation (CRUD) via les clés SWR.
 * 
 * Dépendances :
 *  - @/lib/generated/prisma : types Book, BookNode
 *  - @/lib/fetcher : fonction fetcher générique
 *  - SWR pour la gestion du cache et des requêtes.
 * 
 * Routes utilisées :
 *  - /api/book
 *  - /api/bookNode?bookId={id}
 */

import useSWR, { mutate } from 'swr';
import { Book, BookNode } from '@/lib/generated/prisma';
import { toast } from 'sonner';

/**
 * Fonction générique de fetch :
 * Utilisée par SWR pour récupérer des données JSON.
 */
export const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Erreur réseau');
  return res.json();
});

/**
 * Hook : Récupère la liste des livres
 */
export function useBooks() {
  const { data, error, isLoading } = useSWR<Book[]>('/api/book', fetcher);

  return {
    books: data ?? [],
    isLoading,
    isError: !!error,
    refresh: () => mutate('/api/book'),
  };
}

/**
 * Hook : Récupère les nœuds d’un livre
 */
export function useBookNodes(bookId: string | null) {
  const { data, error, isLoading } = useSWR<BookNode[]>(
    bookId ? `/api/bookNode?bookId=${bookId}` : null,
    fetcher
  );

  return {
    nodes: data ?? [],
    isLoading,
    isError: !!error,
    refresh: () => mutate(`/api/bookNode?bookId=${bookId}`),
  };
}

/**
 * Fonctions CRUD avec feedback visuel
 */
export const useBookActions = () => {
  const createBook = async (newBook: Partial<Book>) => {
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });
      if (!res.ok) throw new Error('Erreur lors de la création du livre');
      toast.success('Livre créé avec succès');
      mutate('/api/book');
    } catch (err) {
      toast.error('Erreur : impossible de créer le livre');
      console.error(err);
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      const res = await fetch(`/api/book/${bookId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      toast.success('Livre supprimé');
      mutate('/api/book');
    } catch (err) {
      toast.error('Erreur : suppression impossible');
      console.error(err);
    }
  };

  return { createBook, deleteBook };
};
