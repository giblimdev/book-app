//@/Store/useBookNavStore.ts
/*
  Store Zustand minimal – uniquement les IDs de navigation
Rôle : État global de la session d’édition
- selectedBookId
- selectedNodeId
- selectedContentId
- mode: "create" | "edit" | "view"
- Actions : setBookId, setNodeId, setContentId, resetSession
*/
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
type BookSessionState = {
  selectedBookId:   string | null;
  selectedNodeId:   string | null;
  selectedContentId:string | null;
};
type BookSessionActions = {
  setBookId:    (id: string | null) => void;
  setNodeId:    (id: string | null) => void;
  setContentId: (id: string | null) => void;
  resetSession: () => void;
};
const initialState: BookSessionState = {
  selectedBookId:   null,
  selectedNodeId:   null,
  selectedContentId:null,
};
export const useBookSession = create<BookSessionState & BookSessionActions>()(
  devtools(
    (set) => ({
      ...initialState,
      setBookId: (id) =>
        set({ selectedBookId: id, selectedNodeId: null, selectedContentId: null }, false, 'bookSession/setBookId'),
      setNodeId: (id) =>
        set({ selectedNodeId: id, selectedContentId: null }, false, 'bookSession/setNodeId'),
      setContentId: (id) =>
        set({ selectedContentId: id }, false, 'bookSession/setContentId'),
      resetSession: () => set(initialState, false, 'bookSession/reset'),
    }),
    { name: 'bookSession' }
  )
);
