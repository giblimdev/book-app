//@/components/creatBook/BookNodeManager.tsx
/** 
 * Rôle :
 *  - Affiche la structure hiérarchique (arbre) du livre.
 *  - Permet de naviguer entre les chapitres/sections.
 * 
 * Responsabilités :
 *  - Recevoir la liste des nœuds (nodes) et l'ID du livre (bookId).
 *  - Construire l'arbre hiérarchique.
 *  - Mettre à jour le store Zustand lors du clic sur un nœud.
 * 
 * Props :
 *  - nodes: BookNode[]
 *  - bookId: string
 */

"use client";

import React from "react";
import { BookNode } from "@/lib/generated/prisma";
import { useBookSession } from "@/Store/useBookNavStore";
import { Button } from "@/components/ui/button";
import { 
  Folder, 
  FileText, 
  PlusCircle, 
  ChevronRight, 
  ChevronDown 
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Définition explicite des props attendues
export interface BookNodeManagerProps {
  nodes: BookNode[];
  bookId: string;
}

interface TreeNode extends BookNode {
  children: TreeNode[];
}

/**
 * Construit l'arbre à partir de la liste plate
 */
const buildTree = (nodes: BookNode[], parentId: string | null): TreeNode[] => {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((node) => ({
      ...node,
      children: buildTree(nodes, node.id),
    }));
};

/**
 * Composant récursif pour afficher un nœud et ses enfants
 */
const NodeItem = ({ node, level }: { node: TreeNode; level: number }) => {
  const { selectedNodeId, setNodeId } = useBookSession();
  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-1">
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-8 text-sm font-normal",
          isSelected && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={() => setNodeId(node.id)}
      >
        {/* Icône selon le type */}
        {hasChildren ? (
          <Folder className="w-4 h-4 mr-2 text-muted-foreground fill-muted-foreground/20" />
        ) : (
          <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
        )}
        
        <span className="truncate">{node.title}</span>
      </Button>

      {/* Rendu récursif des enfants */}
      {hasChildren && (
        <div className="border-l border-border/50 ml-4">
          {node.children.map((child) => (
            <NodeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Composant principal exporté
 */
export default function BookNodeManager({ nodes, bookId }: BookNodeManagerProps) {
  const tree = buildTree(nodes, null);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="p-3 bg-muted rounded-full">
          <Folder className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Livre vide</p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Commencez par créer la structure de votre livre.
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <PlusCircle className="w-3.5 h-3.5 mr-2" />
          Ajouter un chapitre
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Structure
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Ajouter à la racine">
          <PlusCircle className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-0.5">
        {tree.map((node) => (
          <NodeItem key={node.id} node={node} level={0} />
        ))}
      </div>
    </div>
  );
}
