//@/Store/useBookNavStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

/**
 * Interface de l'état du store
 */
interface BookNavState {
  selectedBookId: string | null;
  selectedNodeId: string | null;
  selectedContentId: string | null;

  setBookId: (id: string | null) => void;
  setNodeId: (id: string | null) => void;
  setContentId: (id: string | null) => void;
  resetSession: () => void;
}

/**
 * @file Store/useBookNavStore.ts
 * @type Zustand Store (Persistant + DevTools)
 * @role Gérer l'état de navigation de l'éditeur.
 */
export const useBookNavStore = create<BookNavState>()(
  devtools(
    persist(
      (set) => ({
        selectedBookId: null,
        selectedNodeId: null,
        selectedContentId: null,

        setBookId: (id) => set({ 
          selectedBookId: id, 
          selectedNodeId: null, 
          selectedContentId: null 
        }, false, 'setBookId'),

        setNodeId: (id) => set({ 
          selectedNodeId: id, 
          selectedContentId: null 
        }, false, 'setNodeId'),

        setContentId: (id) => set({ selectedContentId: id }, false, 'setContentId'),

        resetSession: () => set({ 
          selectedBookId: null, 
          selectedNodeId: null, 
          selectedContentId: null 
        }, false, 'resetSession'),
      }),
      {
        name: 'book-nav-storage',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: 'BookNavStore' }
  )
);

// --- CORRECTION ICI ---
// Export alias pour maintenir la compatibilité avec le code existant (BookNodeManager, etc.)
export const useBookSession = useBookNavStore;
