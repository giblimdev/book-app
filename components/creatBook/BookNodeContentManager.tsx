//@/components/creatBook/BookNodeContentManager.tsx
'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useBookSession } from '@/Store/useBookNavStore';
import { fetcher } from '@/hooks/fetcher';
import { NodeContent } from '@/lib/generated/prisma';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Plus, FileText, Image as ImageIcon, Code2, 
  Lightbulb, Quote, AlertTriangle, MessageSquare 
} from 'lucide-react';
  
import BookNodeContentList from '@/components/creatBook/BookNodeContentList';
import BookNodeContentForm from '@/components/creatBook/BookNodeContentForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
 
// --- Types de Blocs Disponibles ---
const BLOCK_TYPES = [
  { type: 'TEXT', label: 'Texte', icon: FileText },
  { type: 'IMAGE', label: 'Image', icon: ImageIcon },
  { type: 'CODE', label: 'Code', icon: Code2 },
  { type: 'TIP', label: 'Astuce', icon: Lightbulb },
  { type: 'WARNING', label: 'Attention', icon: AlertTriangle },
  { type: 'QUOTE', label: 'Citation', icon: Quote },
];

export default function BookNodeContentManager() {
  const { selectedNodeId } = useBookSession();

  // SWR Fetching
  const { data: contents, isLoading, error } = useSWR<NodeContent[]>(
    selectedNodeId ? `/api/book/bookNodeContent?nodeId=${selectedNodeId}` : null,
    fetcher
  );

  // États locaux
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<NodeContent | null>(null);
  const [newContentType, setNewContentType] = useState<string>('TEXT');
  
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tri des contenus par ordre
  const sortedContents = contents ? [...contents].sort((a, b) => a.order - b.order) : [];

  // --- Handlers ---

  const handleAddBlock = (type: string) => {
    setEditingContent(null);
    setNewContentType(type);
    setIsFormOpen(true);
  };

  const handleEditBlock = (content: NodeContent) => {
    setEditingContent(content);
    setNewContentType(content.type); // préremplir le type pour le form
    setIsFormOpen(true);
  };

  const handleDeleteRequest = async (id: string) => {
    setContentToDelete(id);
  };

  const confirmDelete = async () => {
    if (!contentToDelete || !selectedNodeId) return;
    setIsDeleting(true);

    // Optimistic update (optionnel, ici on fait simple avec revalidation)
    try {
      const res = await fetch('/api/book/bookNodeContent', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contentToDelete }),
      });

      if (!res.ok) throw new Error();

      toast.success('Bloc supprimé');
      mutate(`/api/book/bookNodeContent?nodeId=${selectedNodeId}`);
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setContentToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    mutate(`/api/book/BookNodeContent?nodeId=${selectedNodeId}`);
  };

  // --- Rendu ---

  if (!selectedNodeId) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border-dashed">
        <div className="bg-muted p-4 rounded-full mb-4">
          <FileText className="h-8 w-8 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold">Aucun contenu sélectionné</h3>
        <p className="text-sm mt-2">Sélectionnez un chapitre dans la barre latérale pour éditer son contenu.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full p-6 space-y-4">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  if (error) {
    return <div className="p-4 text-destructive">Erreur de chargement du contenu.</div>;
  }

  return (
    <Card className="h-full flex flex-col shadow-sm border-none rounded-none">
      
      {/* Header Fixe: Tabs + Toolbar */}
      <div className="border-b bg-card p-4 flex items-center justify-between sticky top-0 z-10">
        <Tabs defaultValue="edit" className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Édition</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
           {/* Barre d'outils rapide */}
           {BLOCK_TYPES.map((block) => (
             <Button 
               key={block.type} 
               variant="ghost" 
               size="sm" 
               title={`Ajouter ${block.label}`}
               onClick={() => handleAddBlock(block.type)}
             >
               <block.icon className="h-4 w-4 text-muted-foreground" />
             </Button>
           ))}
           <Button size="sm" onClick={() => handleAddBlock('TEXT')}>
             <Plus className="h-4 w-4 mr-2" /> Ajouter
           </Button>
        </div>
      </div>

      {/* Zone Contenu Scrollable */}
      <ScrollArea className="flex-1 p-6 bg-muted/10">
        <div className="max-w-3xl mx-auto space-y-4 min-h-[50vh]">
          
          {sortedContents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">Ce chapitre est vide.</p>
              <Button variant="outline" onClick={() => handleAddBlock('TEXT')}>
                Commencer à rédiger
              </Button>
            </div>
          ) : (
            <BookNodeContentList
              contents={sortedContents}
              onEdit={handleEditBlock}
              onDelete={handleDeleteRequest}
            />
          )}

        </div>
      </ScrollArea>

      {/* Dialogs */}
      <BookNodeContentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        nodeId={selectedNodeId}
        contentInit={editingContent}
        initialType={newContentType}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        open={!!contentToDelete}
        onOpenChange={(open) => !open && setContentToDelete(null)}
        title="Supprimer ce bloc ?"
        description="Le contenu sera définitivement perdu."
        confirmLabel="Supprimer"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />

    </Card>
  );
}
 