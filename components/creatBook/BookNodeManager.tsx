//@/components/creatBook/BookNodeManager.tsx
'use client';

import React, { useState } from 'react';
import { useBookSession } from '@/Store/useBookNavStore'; 
import { useBookNodes } from '@/hooks/useBooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { BookNode } from '@/lib/generated/prisma';

import BookNodeList from './BookNodeList';
import BookNodeForm from './BookNodeForm';
import CommentManager from './CommentManager'; // Assurez-vous qu'il existe
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// Utilitaire pour reconstruire l'arbre hiérarchique à partir de la liste plate
function buildTree(nodes: BookNode[]) {
  const nodeMap = new Map<string, BookNode & { children: BookNode[] }>();
  const roots: (BookNode & { children: BookNode[] })[] = [];

  // 1. Initialiser la map avec children vides
  nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] });
  });

  // 2. Construire la hiérarchie
  nodes.forEach(node => {
    const nodeWithChildren = nodeMap.get(node.id)!;
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children.push(nodeWithChildren);
      } else {
        // Orphelin par sécurité
        roots.push(nodeWithChildren);
      }
    } else {
      roots.push(nodeWithChildren);
    }
  });

  // 3. Trier par ordre
  const sortNodes = (n: any[]) => {
    n.sort((a, b) => a.order - b.order);
    n.forEach(child => sortNodes(child.children));
  };
  sortNodes(roots);
  
  return roots;
}

export default function BookNodeManager() {
  // 1. États Globaux
  const { selectedBookId, selectedNodeId, setNodeId } = useBookSession();
  
  // 2. Data Fetching (SWR)
  const { nodes, isLoading, isError, refresh } = useBookNodes(selectedBookId);

  // 3. États Locaux (Dialogs)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<BookNode | null>(null);
  const [parentNodeId, setParentNodeId] = useState<string | null>(null);
  
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentTargetNodeId, setCommentTargetNodeId] = useState<string | null>(null);

  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Handlers ---

  const handleSelectNode = (id: string) => {
    setNodeId(id);
  };

  const handleCreateRoot = () => {
    setEditingNode(null);
    setParentNodeId(null);
    setIsFormOpen(true);
  };

  const handleCreateChild = (parentId: string) => {
    setEditingNode(null);
    setParentNodeId(parentId);
    setIsFormOpen(true);
  };

  const handleEdit = (node: BookNode) => {
    setEditingNode(node);
    setParentNodeId(node.parentId);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setNodeToDelete(id);
  };

  const handleComments = (id: string) => {
    setCommentTargetNodeId(id);
    setIsCommentOpen(true);
  };

  const confirmDelete = async () => {
    if (!nodeToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/book/bookNode', {
        method: 'DELETE',
        body: JSON.stringify({ id: nodeToDelete }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error();
      
      toast.success('Chapitre supprimé');
      refresh(); // Revalidate SWR
      
      if (selectedNodeId === nodeToDelete) setNodeId(null);
    } catch {
      toast.error('Erreur suppression');
    } finally {
      setIsDeleting(false);
      setNodeToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refresh(); // Rafraîchir la liste via SWR
  };

  // --- Rendu ---

  if (!selectedBookId) {
    return (
      <Card className="h-full p-6 flex flex-col items-center justify-center text-muted-foreground border-dashed">
        <FolderPlus className="h-12 w-12 mb-4 opacity-20" />
        <p>Sélectionnez un livre pour voir sa structure</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full p-4 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </Card>
    );
  }

  if (isError) return <div className="text-destructive p-4">Erreur de chargement</div>;

  const treeData = buildTree(nodes);

  return (
    <Card className="h-full flex flex-col shadow-sm border-none rounded-none">
      {/* Header Fixe */}
      <div className="p-4 border-b flex items-center justify-between bg-card z-10">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Structure</h3>
        <Button size="sm" variant="outline" onClick={handleCreateRoot}>
          <Plus className="h-4 w-4 mr-2" /> Racine
        </Button>
      </div>

      {/* Zone Scrollable */}
      <div className="flex-1 overflow-y-auto p-2">
        {nodes.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="mb-4">Ce livre est vide.</p>
            <Button onClick={handleCreateRoot}>Commencer par ajouter un chapitre</Button>
          </div>
        ) : (
          <BookNodeList
            nodes={treeData} // On passe l'arbre reconstruit
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            onEditNode={handleEdit}
            onDeleteNode={handleDeleteRequest}
            onAddChild={handleCreateChild}
            onComments={handleComments}
          />
        )}
      </div>

      {/* --- Dialogs --- */}

      {/* Formulaire Création / Édition */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingNode ? 'Modifier le chapitre' : 'Nouveau chapitre'}</DialogTitle>
          </DialogHeader>
          <BookNodeForm
            bookId={selectedBookId}
            nodeInit={editingNode}
            parentId={parentNodeId}
            onSuccess={handleFormSuccess}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Commentaires */}
      <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
        <DialogContent className="sm:max-w-lg h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Commentaires</DialogTitle>
          </DialogHeader>
          {commentTargetNodeId && (
            <div className="flex-1 overflow-hidden">
              <CommentManager nodeId={commentTargetNodeId} />
            </div>
          )}
        </DialogContent>
      </Dialog>
 
      {/* Confirmation Suppression */}
      <ConfirmDialog
        open={!!nodeToDelete}
        onOpenChange={(open) => !open && setNodeToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Supprimer ce chapitre ?"
        description="Attention, cela supprimera également tous les sous-chapitres et contenus associés."
      />
    </Card>
  );
}
 /*Module '"@/Store/useBookNavStore"' has no exported member 'useBookSession'. */