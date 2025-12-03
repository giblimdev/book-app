//@/hooks/useBooks.ts 
/**
 * @file hooks/useBooks.ts
 * @type Collection de hooks React personnalisés (SWR + mutations)
 * @role Fournir une API claire, typée et centralisée pour toutes les interactions avec les livres et leurs nœuds (Book + BookNode).
 * 
 * @features
 * - useBooks() : Récupère la liste complète des livres (SWR) → Retourne books[], isLoading, isError, refresh
 * - useBookNodes(bookId: string | null) : Récupère tous les nœuds d'un livre donné (chargement conditionnel si null)
 * - useBook(bookId) : Fetcher un livre unique (évite de refetcher toute la liste)
 * - useBookActions() : Ensemble de fonctions de mutation (createBook, updateBook, deleteBook, etc.)
 * - Gestion centralisée des erreurs (toast feedback)
 * - Invalidation automatique du cache SWR après chaque mutation réussie
 * 
 * @dependencies
 * - swr : gestion du cache, revalidation et déduplication
 * - @/lib/generated/prisma : types exacts (Book, BookNode)
 * - sonner : toast.success / toast.error
 * 
 * @api
 * - GET /api/book/books → useBooks()
 * - GET /api/book/bookNode?bookId=xxx → useBookNodes(bookId)
 * - POST /api/book/books → createBook dois passer l'id author où le gérer ? ici ? dans BookForm ? dans BookManager .
 * - PATCH /api/book/books → updateBook (id dans body)
 * - DELETE /api/book/books → deleteBook (id dans body)
 * 
 * @dataflow
 * Composants (BookManager, BookNodeManager, etc.) 
 * → appellent useBooks() ou useBookNodes()
 * → mutations via useBookActions()
 * → succès → mutate('/api/book/...')
 * → UI toujours à jour grâce au cache SWR
 * 
 * @devnotes
 * - Toutes les clés SWR sont explicites et normalisées (facilite le debug et l'invalidation croisée)
 * - useBookNodes accepte `null` → évite les requêtes inutiles quand aucun livre n'est sélectionné
 * - Gestion d'erreur unifiée : toast.error + console.error en dev
 * - Pattern extensible : toute nouvelle action CRUD suit le même schéma (try/catch → toast → mutate)
 * - Performance : dedupingInterval et revalidateOnFocus configurables si besoin
 * 
 * @design
 * - API hook ultra-lisible : un seul fichier, toute la logique livres+nœuds
 * - Retour cohérent entre les hooks : { isLoading, isError, refresh }
 * - Pas de logique métier dans les composants : tout passe par ici
 * 
 * @promptGuide
 * > Pour ajouter une nouvelle action (ex: reorderBooks, duplicateBook) :
 *   -- Ajouter la fonction dans useBookActions()
 *   -- Suivre le pattern : try → fetch → if(!ok) throw → toast.success → mutate
 * > Pour ajouter useBook(bookId) (récupération d'un livre unique) :
 *   -- Créer useBook(id) avec clé `/api/book/books?id=${id}`
 * > Pour pré-charger un livre dans le cache :
 *   -- Utiliser mutate('/api/book/books', data, { revalidate: false })
 */

import useSWR, { mutate } from 'swr';
import { Book, BookNode } from '@/lib/generated/prisma';
import { toast } from 'sonner';
/**
 * Clés API standardisées (REST)
 */ 
const API_KEYS = {
  BOOKS: '/api/book/books',
  NODES: (bookId: string) => `/api/book/bookNode?bookId=${bookId}`,
};

/**
 * Fetcher générique pour SWR
 */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erreur API');
  }
  return res.json();
};

/**
 * @hook useBooks
 * @role Récupérer la liste de tous les livres.
 */
export function useBooks() {
  const { data, error, isLoading } = useSWR<Book[]>(API_KEYS.BOOKS, fetcher);

  return {
    books: data ?? [],
    isLoading,
    isError: !!error,
    refresh: () => mutate(API_KEYS.BOOKS),
  };
}

/**
 * @hook useBookNodes
 * @role Récupérer l'arbre des chapitres d'un livre spécifique.
 * @param bookId - ID du livre sélectionné (vient souvent de useBookNavStore)
 */
export function useBookNodes(bookId: string | null) {
  const { data, error, isLoading } = useSWR<BookNode[]>(
    bookId ? API_KEYS.NODES(bookId) : null, // Ne fetch pas si pas d'ID
    fetcher
  );

  return {
    nodes: data ?? [], // L'API renvoie un tableau plat trié par 'order'
    isLoading,
    isError: !!error,
    refresh: () => bookId && mutate(API_KEYS.NODES(bookId)),
  };
}

/**
 * @hook useBook
 * @role Récupérer un livre unique par son ID (évite de refetcher toute la liste)
 * @param bookId - ID du livre à récupérer
 */
export function useBook(bookId: string | null) {
  const { data, error, isLoading } = useSWR<Book>(
    bookId ? `${API_KEYS.BOOKS}?id=${bookId}` : null,
    fetcher
  );

  return {
    book: data ?? null,
    isLoading,
    isError: !!error,
    refresh: () => bookId && mutate(`${API_KEYS.BOOKS}?id=${bookId}`),
  };
}

/**
 * @hook useBookActions
 * @role Centraliser les mutations (CRUD) pour garder l'UI optimiste et propre.
 */
export const useBookActions = () => {

  // Création d'un livre
  const createBook = async (data: Partial<Book>) => {
    try {
      const res = await fetch(API_KEYS.BOOKS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) throw new Error('Échec de la création');
      
      const newBook = await res.json();
      toast.success('Livre créé avec succès');
      mutate(API_KEYS.BOOKS); // Rafraîchit la liste des livres
      return newBook; // Retourne le livre créé (utile pour le sélectionner direct)
      
    } catch (error) {
      toast.error("Impossible de créer le livre");
      console.error(error);
      throw error;
    }
  };

  // Mise à jour d'un livre
  const updateBook = async (id: string, data: Partial<Book>) => {
    try {
      const res = await fetch(API_KEYS.BOOKS, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (!res.ok) throw new Error('Échec de la mise à jour');

      toast.success('Livre mis à jour');
      mutate(API_KEYS.BOOKS);
      mutate(`${API_KEYS.BOOKS}?id=${id}`); // Invalidation ciblée
      
    } catch (error) {
      toast.error("Erreur lors de la modification");
      console.error(error);
      throw error;
    }
  };

  // Suppression d'un livre
  const deleteBook = async (id: string) => {
    try {
      const res = await fetch(API_KEYS.BOOKS, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Échec de la suppression');

      toast.success('Livre supprimé');
      mutate(API_KEYS.BOOKS); // Revalide la liste
      
    } catch (error) {
      toast.error("Impossible de supprimer le livre");
      console.error(error);
      throw error;
    }
  };

  return { createBook, updateBook, deleteBook };
};
 