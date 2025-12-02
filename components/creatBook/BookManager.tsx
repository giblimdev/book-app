//@/components/creatBook/BookManager.tsx
/**
 * Rôle :
 *  - Composant de gestion de la création/édition d'un livre (Book) dans une boîte de dialogue.
 *  - Encapsule le formulaire <BookForm /> dans un Dialog shadcn/ui.
 *
 * Responsabilités :
 *  - Afficher un Dialog contrôlé (open / onClose) pour créer ou modifier un livre.
 *  - Passer le Book en cours d'édition au formulaire.
 *  - Notifier le parent via onSuccess après une création/mise à jour réussie.
 *
 * Utilisé par :
 *  - @/app/viewBook/page.tsx
 *    • <BookManager
 *        isOpen={isBookDialogOpen}
 *        onClose={...}
 *        onSuccess={...}
 *        editingBook={editingBook}
 *      />
 *
 * Composants enfants :
 *  - @/components/creatBook/BookForm
 *
 * UI :
 *  - shadcnUI : Dialog
 *  - Icônes : lucide-react (si besoin dans le futur)
 */

"use client";

import React from "react";
import { Book } from "@/lib/generated/prisma";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BookForm from "@/components/creatBook/BookForm";

export interface BookManagerProps {
  /**
   * État d'ouverture du Dialog (contrôlé par le parent).
   */
  isOpen: boolean;
  /**
   * Callback appelé lorsque le Dialog doit se fermer.
   */
  onClose: () => void;
  /**
   * Callback appelé après succès (create / update) dans le formulaire.
   * Le parent peut en profiter pour rafraîchir la liste (SWR mutate).
   */
  onSuccess: () => void;
  /**
   * Livre en cours d'édition.
   * - null ou undefined => mode création.
   * - Book => mode édition.
   */
  editingBook?: Book | null;
}

const BookManager: React.FC<BookManagerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingBook,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl border border-border bg-card shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {editingBook ? "Modifier le Livre" : "Créer un Nouveau Livre"}
          </DialogTitle>
        </DialogHeader>

        {/* Formulaire de création/édition de livre */}
        <BookForm
          book={editingBook ?? null}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BookManager; 
