//@/components/creatBook/BookNodeList.tsx
'use client'; 

import React from 'react';
import { BookNode } from '@/lib/generated/prisma';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { 
  FileText, Folder, FolderOpen, MessageSquare, 
  Plus, Edit2, Trash2, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Extension du type pour inclure les enfants récursifs
type TreeNode = BookNode & { children?: TreeNode[] };

interface BookNodeListProps {
  nodes: TreeNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  // Callbacks d'actions
  onEditNode: (node: BookNode) => void;
  onDeleteNode: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onComments: (id: string) => void;
  level?: number; // Niveau de profondeur (interne)
}

export default function BookNodeList({
  nodes,
  selectedNodeId,
  onSelectNode,
  onEditNode,
  onDeleteNode,
  onAddChild,
  onComments,
  level = 0
}: BookNodeListProps) {

  // Stop récursion sécurité
  if (level > 10) return null;

  return (
    <Accordion type="multiple" className="w-full space-y-1">
      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const hasChildren = node.children && node.children.length > 0;

        return (
          <AccordionItem key={node.id} value={node.id} className="border-none">
            <div
              className={cn(
                "group flex items-center justify-between py-1 px-2 rounded-md transition-colors hover:bg-accent/50",
                isSelected && "bg-primary/10 text-primary font-medium"
              )}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              {/* Zone clicable gauche (Sélection + Expand) */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Trigger Accordion (seulement si enfants) */}
                {hasChildren ? (
                  <AccordionTrigger className="py-0 hover:no-underline">
                    {/* Chevron géré par AccordionTrigger par défaut, on peut le customiser si besoin */}
                    {/* Ici on laisse le défaut shadcn ou on ajoute une icône dossier */}
                  </AccordionTrigger>
                ) : (
                  <span className="w-4" /> // Espaceur
                )}

                <div 
                  className="flex items-center gap-2 flex-1 cursor-pointer truncate"
                  onClick={() => onSelectNode(node.id)}
                >
                  {hasChildren ? (
                    <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate text-sm">{node.title}</span>
                </div>
              </div>

              {/* Actions (visibles au hover group) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAddChild(node.id)} title="Ajouter sous-chapitre">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onComments(node.id)} title="Commentaires">
                  <MessageSquare className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditNode(node)} title="Modifier">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDeleteNode(node.id)} title="Supprimer">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Rendu récursif des enfants */}
            {hasChildren && (
              <AccordionContent className="pb-0">
                <BookNodeList
                  nodes={node.children!}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  onEditNode={onEditNode}
                  onDeleteNode={onDeleteNode}
                  onAddChild={onAddChild}
                  onComments={onComments}
                  level={level + 1}
                />
              </AccordionContent>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
