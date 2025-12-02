//@/components/creatBook/BookNodeList.tsx
/**
 * Rôle :
 *  - Affiche l’arborescence des chapitres (BookNodes) sous forme d’accordéon.
 *  - Permet la sélection d’un nœud, son déplacement et sa visualisation hiérarchique.
 * 
 * Props :
 *  - nodes: BookNode[] — liste hiérarchique de nœuds du livre
 *  - selectedNodeId: string | null — identifiant du nœud sélectionné
 *  - onSelectNode(nodeId: string): void — met à jour le store Zustand
 *  - onMoveNode(nodeId: string, direction: 'up'|'down'|'in'|'out'): void — déplace un nœud dans la hiérarchie
 * 
 * UI :
 *  - shadcnUI : Accordion, Button, ScrollArea
 *  - lucide-react : icons (ChevronUp, ChevronDown, ArrowUp, ArrowDown, CornerUpRight, CornerDownLeft)
 */

"use client";

import React from "react";
import { BookNode } from "@/lib/generated/prisma";
import { useBookSession } from "@/Store/useBookNavStore";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ArrowUp, 
  ArrowDown,
  CornerUpRight,
  CornerDownLeft,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type BookNodeListProps = {
  nodes: BookNode[];
  selectedNodeId?: string | null;
  onSelectNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, direction: "up" | "down" | "in" | "out") => void;
};

/**
 * Fonction utilitaire pour construire la hiérarchie
 */
function buildTree(nodes: BookNode[]): BookNode[] {
  const map = new Map<string, BookNode & { children: BookNode[] }>();
  const roots: (BookNode & { children: BookNode[] })[] = [];

  nodes.forEach((node) => {
    map.set(node.id, { ...node, children: [] });
  });

  nodes.forEach((node) => {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(map.get(node.id)!);
    } else {
      roots.push(map.get(node.id)!);
    }
  });

  return roots;
}

export default function BookNodeList({
  nodes,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
}: BookNodeListProps) {
  const { selectedNodeId: storeNodeId, setNodeId } = useBookSession();
  const activeNodeId = selectedNodeId ?? storeNodeId;
  const tree = buildTree(nodes);

  const renderNode = (node: BookNode & { children?: BookNode[] }) => {
    const isActive = activeNodeId === node.id;

    return (
      <AccordionItem key={node.id} value={node.id} className="border-none">
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
            isActive
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted hover:text-foreground"
          )}
          onClick={() => {
            onSelectNode(node.id);
            setNodeId(node.id);
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-medium truncate">{node.title}</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, "up");
              }}
              aria-label="Monter"
            >
              <ArrowUp className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, "down");
              }}
              aria-label="Descendre"
            >
              <ArrowDown className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, "in");
              }}
              aria-label="Indenter"
            >
              <CornerUpRight className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onMoveNode(node.id, "out");
              }}
              aria-label="Désindenter"
            >
              <CornerDownLeft className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </Button>
          </div>
        </div>

        {node.children && node.children.length > 0 && (
          <AccordionContent>
            <div className="ml-4 border-l border-border pl-2">
              {node.children.map((child) => renderNode(child))}
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    );
  };

  return (
    <ScrollArea className="max-h-[70vh] pr-2">
      {tree.length > 0 ? (
        <Accordion type="multiple" className="space-y-1">
          {tree.map((node) => renderNode(node))}
        </Accordion>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-6">
          Aucun chapitre trouvé pour ce livre.
        </p>
      )}
    </ScrollArea>
  );
}
