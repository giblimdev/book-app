/**
 * @file Store/useUIStore.ts
 * @type Zustand Store (UI-only)
 * @role Gérer l’état global purement lié à l’interface utilisateur (non persistant, non métier).
 */

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

/**
 * Types pour les états UI
 */
type Theme = 'light' | 'dark' | 'system' | 'custom';
type ActivePanel = 'tree' | 'comments' | 'properties' | null;

interface UIState {
  // États
  theme: Theme;
  sidebarCollapsed: boolean;
  activePanel: ActivePanel;
  isMobileMenuOpen: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePanel: (panel: ActivePanel) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Valeurs par défaut
        theme: 'system',
        sidebarCollapsed: false,
        activePanel: null,
        isMobileMenuOpen: false,

        // Actions
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        
        toggleSidebar: () => set((state) => ({ 
          sidebarCollapsed: !state.sidebarCollapsed 
        }), false, 'toggleSidebar'),

        setSidebarCollapsed: (collapsed) => set({ 
          sidebarCollapsed: collapsed 
        }, false, 'setSidebarCollapsed'),

        setActivePanel: (panel) => set({ 
          activePanel: panel 
        }, false, 'setActivePanel'),

        toggleMobileMenu: () => set((state) => ({ 
          isMobileMenuOpen: !state.isMobileMenuOpen 
        }), false, 'toggleMobileMenu'),

        setMobileMenuOpen: (isOpen) => set({ 
          isMobileMenuOpen: isOpen 
        }, false, 'setMobileMenuOpen'),
      }),
      {
        name: 'ui-storage', // Clé pour localStorage
        storage: createJSONStorage(() => localStorage),
        // On ne persiste que les préférences durables, pas l'état transitoire du menu mobile
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          activePanel: state.activePanel,
        }),
      }
    ),
    { name: 'uiStore' } // Nom pour Redux DevTools
  )
);
