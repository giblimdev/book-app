//@/components/ui/ConfirmDialog.tsx
'use client';

/**
 * @file components/ui/ConfirmDialog.tsx
 * @type Composant React (Client Component)
 * @role Boîte de dialogue de confirmation réutilisable (suppression, action critique, etc.).
 *
 * @features
 *  - Affichage d'un titre, d'une description et d'une icône d'avertissement.
 *  - Boutons "Annuler" et "Confirmer" avec variant destructif optionnel.
 *  - Gestion d'un état de chargement (isLoading) pour les actions asynchrones.
 *  - Contrôle externe de l'ouverture via props (open, onOpenChange).
 *
 * @dependencies
 *  - shadcn/ui : Dialog, Button
 *  - lucide-react : AlertTriangle, Loader2
 *
 * @props
 *  - open: boolean                    → état d'ouverture du dialog (contrôlé par le parent)
 *  - onOpenChange(open: boolean): void→ callback quand l'ouverture change
 *  - title?: string                   → titre de la boîte de dialogue
 *  - description?: string             → message descriptif
 *  - confirmLabel?: string            → libellé du bouton de confirmation (par défaut: "Confirmer")
 *  - cancelLabel?: string             → libellé du bouton d'annulation (par défaut: "Annuler")
 *  - variant?: "default" | "destructive" → style du bouton de confirmation
 *  - isLoading?: boolean              → état de chargement (désactive les boutons)
 *  - onConfirm(): Promise<void> | void→ action à exécuter lors de la confirmation
 *
 * @devnotes
 *  - Le parent doit gérer l'état `open` et fermer le dialog après succès (`onOpenChange(false)`).
 *  - Prévu pour être utilisé dans BookManager, listes, suppression de nœuds, contenus, etc.
 *
 * @promptGuide
 *  > Pour ajouter un champ "dangerMessage" supplémentaire :
 *    - Ajouter une prop optionnelle et l'afficher sous la description.
 */

import * as React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export type ConfirmDialogVariant = 'default' | 'destructive';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isLoading?: boolean;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirmer l’action',
  description = 'Cette action est irréversible. Voulez-vous continuer ?',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'destructive',
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = React.useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && (
            <DialogDescription className="mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
