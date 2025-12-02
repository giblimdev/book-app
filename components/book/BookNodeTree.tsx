"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type BookNode = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  order: number;
  parentId: string | null;
};

type BookNodeTreeProps = {
  bookId: string;
  initialNodes: BookNode[];
};

const NODE_TYPES = [
  "BOOK",
  "PART",
  "CHAPTER",
  "SECTION",
  "SUBSECTION",
  "ARTICLE",
];

export default function BookNodeTree({
  bookId,
  initialNodes,
}: BookNodeTreeProps) {
  const [nodes, setNodes] = useState<BookNode[]>(initialNodes);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<BookNode | null>(null);
  const [deletingNodeId, setDeletingNodeId] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<BookNode | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "CHAPTER",
  });

  // Construire l'arbre hiérarchique
  const buildTree = (parentId: string | null = null): BookNode[] => {
    return nodes
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  // Toggle expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Ouvrir le dialogue de création
  const openCreateDialog = (parentId: string | null = null) => {
    setParentIdForNew(parentId);
    setFormData({ title: "", description: "", type: "CHAPTER" });
    setIsCreating(true);
  };

  // Ouvrir le dialogue d'édition
  const openEditDialog = (node: BookNode) => {
    setEditingNode(node);
    setFormData({
      title: node.title,
      description: node.description || "",
      type: node.type,
    });
  };

  // Créer un nouveau node
  const handleCreate = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: parentIdForNew,
          order: nodes.filter((n) => n.parentId === parentIdForNew).length,
        }),
      });

      if (response.ok) {
        const newNode = await response.json();
        setNodes([...nodes, newNode]);
        setIsCreating(false);
        if (parentIdForNew) {
          setExpandedNodes((prev) => new Set(prev).add(parentIdForNew));
        }
      }
    } catch (error) {
      console.error("Error creating node:", error);
    }
  };

  // Mettre à jour un node
  const handleUpdate = async () => {
    if (!editingNode) return;

    try {
      const response = await fetch(
        `/api/books/${bookId}/nodes/${editingNode.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedNode = await response.json();
        setNodes(nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
        setEditingNode(null);
      }
    } catch (error) {
      console.error("Error updating node:", error);
    }
  };

  // Supprimer un node
  const handleDelete = async (nodeId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/nodes/${nodeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNodes(nodes.filter((n) => n.id !== nodeId && n.parentId !== nodeId));
        setDeletingNodeId(null);
      }
    } catch (error) {
      console.error("Error deleting node:", error);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, node: BookNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetNode: BookNode) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverNodeId(targetNode.id);
  };

  const handleDragLeave = () => {
    setDragOverNodeId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetNode: BookNode) => {
    e.preventDefault();
    setDragOverNodeId(null);

    if (!draggedNode || draggedNode.id === targetNode.id) return;

    // Même parent : réorganiser l'ordre
    if (draggedNode.parentId === targetNode.parentId) {
      const siblings = nodes
        .filter((n) => n.parentId === draggedNode.parentId)
        .sort((a, b) => a.order - b.order);

      const draggedIndex = siblings.findIndex((n) => n.id === draggedNode.id);
      const targetIndex = siblings.findIndex((n) => n.id === targetNode.id);

      siblings.splice(draggedIndex, 1);
      siblings.splice(targetIndex, 0, draggedNode);

      // Mettre à jour les ordres
      const updates = siblings.map((node, index) => ({
        ...node,
        order: index,
      }));

      try {
        await fetch(`/api/books/${bookId}/nodes/reorder`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });

        setNodes(nodes.map((n) => updates.find((u) => u.id === n.id) || n));
      } catch (error) {
        console.error("Error reordering nodes:", error);
      }
    }

    setDraggedNode(null);
  };

  // Composant récursif pour afficher un node
  const TreeNode = ({
    node,
    depth = 0,
  }: {
    node: BookNode;
    depth?: number;
  }) => {
    const children = buildTree(node.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isDragOver = dragOverNodeId === node.id;

    return (
      <div>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          className={`group flex items-center gap-2 p-2 rounded-lg transition-colors ${
            isDragOver
              ? "bg-blue-500/20 border-2 border-blue-500"
              : "hover:bg-slate-800/50"
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <GripVertical className="w-4 h-4 text-slate-600 cursor-grab active:cursor-grabbing" />

          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="p-1 hover:bg-slate-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 uppercase">
                {node.type}
              </span>
              <span className="font-medium truncate">{node.title}</span>
            </div>
            {node.description && (
              <p className="text-xs text-slate-400 truncate mt-1">
                {node.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openCreateDialog(node.id)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditDialog(node)}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDeletingNodeId(node.id)}
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const rootNodes = buildTree(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Structure du livre</h2>
        <Button onClick={() => openCreateDialog(null)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un nœud
        </Button>
      </div>

      <div className="space-y-1">
        {rootNodes.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            Aucun nœud. Commencez par en créer un.
          </p>
        ) : (
          rootNodes.map((node) => <TreeNode key={node.id} node={node} />)
        )}
      </div>

      {/* Dialog Création/Édition */}
      <Dialog
        open={isCreating || !!editingNode}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreating(false);
            setEditingNode(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingNode ? "Modifier le nœud" : "Créer un nœud"}
            </DialogTitle>
            <DialogDescription>
              {parentIdForNew
                ? "Ajouter un nœud enfant"
                : "Ajouter un nœud racine"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Titre du nœud"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description (optionnelle)"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value: unknown) =>
                  setFormData({ ...formData, type: value as string })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreating(false);
                setEditingNode(null);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={editingNode ? handleUpdate : handleCreate}
              disabled={!formData.title.trim()}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingNode ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Suppression */}
      <AlertDialog
        open={!!deletingNodeId}
        onOpenChange={(open: unknown) => !open && setDeletingNodeId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce nœud ? Cette action
              supprimera également tous ses enfants et ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingNodeId && handleDelete(deletingNodeId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
