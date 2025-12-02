// @/components/bookNode/BookNodeList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BookNodeForm from "./BookNodeForm";
import { BookNode } from "@/lib/generated/prisma/client";

// Type étendu qui inclut les relations
type BookNodeWithRelations = BookNode & {
  children?: BookNodeWithRelations[];
  parent?: BookNodeWithRelations | null;
};

type BookNodeListProps = {
  nodes: BookNodeWithRelations[];
  bookId: string;
};

export default function BookNodeList({ nodes, bookId }: BookNodeListProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingNode, setEditingNode] = useState<BookNodeWithRelations | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const handleDelete = async (nodeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce nœud et tous ses enfants ?")) {
      return;
    }

    setLoading(nodeId);
    try {
      const response = await fetch(`/api/booknode/${nodeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du nœud");
    } finally {
      setLoading(null);
    }
  };

  const handleMoveUp = async (node: BookNodeWithRelations, siblings: BookNodeWithRelations[]) => {
    const currentIndex = siblings.findIndex((n) => n.id === node.id);
    if (currentIndex <= 0) return;

    const previousNode = siblings[currentIndex - 1];
    await swapOrder(node, previousNode);
  };

  const handleMoveDown = async (node: BookNodeWithRelations, siblings: BookNodeWithRelations[]) => {
    const currentIndex = siblings.findIndex((n) => n.id === node.id);
    if (currentIndex >= siblings.length - 1) return;

    const nextNode = siblings[currentIndex + 1];
    await swapOrder(node, nextNode);
  };

  const swapOrder = async (node1: BookNodeWithRelations, node2: BookNodeWithRelations) => {
    setLoading(node1.id);
    try {
      const updatePromises = [
        fetch(`/api/booknode/${node1.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: node2.order }),
        }),
        fetch(`/api/booknode/${node2.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: node1.order }),
        }),
      ];

      const responses = await Promise.all(updatePromises);
      const allOk = responses.every(response => response.ok);
      if (!allOk) {
        throw new Error("Certaines requêtes de mise à jour ont échoué");
      }

      router.refresh();
    } catch (error) {
      console.error("Erreur lors du déplacement:", error);
      alert("Erreur lors du déplacement du nœud");
    } finally {
      setLoading(null);
    }
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const findSiblings = (node: BookNodeWithRelations, nodeList: BookNodeWithRelations[]): BookNodeWithRelations[] => {
    // Si le nœud n'a pas de parent, les frères et sœurs sont les nœuds racine
    if (!node.parentId) {
      return nodeList.filter(n => !n.parentId);
    }
    
    // Sinon, trouver le parent et retourner ses enfants
    const findParentAndChildren = (nodes: BookNodeWithRelations[]): BookNodeWithRelations[] | null => {
      for (const n of nodes) {
        if (n.id === node.parentId) {
          return n.children || [];
        }
        if (n.children) {
          const result = findParentAndChildren(n.children);
          if (result) return result;
        }
      }
      return null;
    };
    
    return findParentAndChildren(nodeList) || [];
  };

  const renderNode = (node: BookNodeWithRelations, nodeList: BookNodeWithRelations[], level: number = 0) => {
    const siblings = findSiblings(node, nodeList);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const currentIndex = siblings.findIndex((n) => n.id === node.id);
    const canMoveUp = currentIndex > 0;
    const canMoveDown = currentIndex < siblings.length - 1;
    const isLoading = loading === node.id;

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`flex items-center gap-2 p-3 bg-white border rounded transition-all ${
            isLoading ? "opacity-50" : "hover:shadow-md"
          }`}
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Bouton Expand/Collapse */}
          <div className="w-6 flex-shrink-0">
            {hasChildren && (
              <button
                onClick={() => toggleExpand(node.id)}
                className="text-gray-600 hover:text-gray-900 transition-colors w-6 h-6 flex items-center justify-center"
                disabled={isLoading}
              >
                {isExpanded ? "▼" : "▶"}
              </button>
            )}
          </div>

          {/* Flèches de déplacement */}
          <div className="flex flex-col gap-0.5 flex-shrink-0">
            <button
              onClick={() => handleMoveUp(node, siblings)}
              disabled={!canMoveUp || isLoading}
              className={`text-xs w-6 h-6 flex items-center justify-center ${
                canMoveUp
                  ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Déplacer vers le haut"
            >
              ▲
            </button>
            <button
              onClick={() => handleMoveDown(node, siblings)}
              disabled={!canMoveDown || isLoading}
              className={`text-xs w-6 h-6 flex items-center justify-center ${
                canMoveDown
                  ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                  : "text-gray-300 cursor-not-allowed"
              }`}
              title="Déplacer vers le bas"
            >
              ▼
            </button>
          </div>

          {/* Informations du nœud */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold flex-shrink-0">
                {node.type}
              </span>
              <h3 className="font-semibold text-gray-900 truncate">{node.title}</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                Ordre: {node.order}
              </span>
            </div>
            {node.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {node.description}
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setEditingNode(node)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              title="Modifier"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() => handleDelete(node.id)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
              title="Supprimer"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>

        {/* Enfants (nœuds imbriqués) */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">
            {node.children!.map((child) => 
              renderNode(child, nodeList, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Mode édition
  if (editingNode) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setEditingNode(null)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Retour à la liste
        </button>
        <BookNodeForm
          bookId={bookId}
          parentId={editingNode.parentId ?? undefined}
          initialData={{
            id: editingNode.id,
            title: editingNode.title,
            description: editingNode.description ?? undefined,
            type: editingNode.type as "BOOK" | "PART" | "CHAPTER" | "SECTION" | "SUBSECTION" | "ARTICLE",
            order: editingNode.order,
          }}
          onSuccess={() => {
            setEditingNode(null);
            router.refresh();
          }}
        />
      </div>
    );
  }

  // Mode création
  if (showForm) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowForm(false)}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          ← Retour à la liste
        </button>
        <BookNodeForm
          bookId={bookId}
          onSuccess={() => {
            setShowForm(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  // Affichage de la liste
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Structure du livre</h2>
          <p className="text-sm text-gray-600 mt-1">
            {nodes.filter(n => !n.parentId).length} nœud{nodes.filter(n => !n.parentId).length > 1 ? "s" : ""} au niveau racine
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Ajouter un nœud
        </button>
      </div>

      {nodes.filter(n => !n.parentId).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-5xl mb-4">📚</div>
          <p className="text-gray-600 text-lg font-medium mb-2">
            Aucun nœud pour le moment
          </p>
          <p className="text-gray-500 text-sm">
            Commencez par créer votre premier nœud pour structurer votre livre
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {nodes
            .filter(node => !node.parentId)
            .map((node) => renderNode(node, nodes))}
        </div>
      )}
    </div>
  );
}