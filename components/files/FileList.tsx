// @/components/files/FileList.tsx
/*
components/files/FileList.tsx :
Rendre une collection de fichiers/dossiers sous forme d'arborescence et proposer les actions rapides (éditer, supprimer, monter, descendre).
Ne charge pas les données : il reçoit le tableau déjà filtré/trié.
Props (interface FileListProps) :

interface FileListProps {
  files: (File & { children?: File[] })[] // déjà filtrés / triés
  viewMode: 'list' | 'grid' | 'tree'
  onEdit: (file: File) => void
  onDelete: (file: File) => void
  onMoveUp: (file: File) => void
  onMoveDown: (file: File) => void
  onAddFile?: () => void
  onAddFolder?: () => void
}

Comportements :
clic sur « Éditer » → onEdit(file)
clic sur « Supprimer » → confirmation + onDelete(file)
icônes flèches → onMoveUp / onMoveDown
si viewMode === 'tree' : rendu récursif avec repliement/dépliement des dossiers
*/

"use client";

import React, { useState } from "react";
import type { File } from "@prisma/client";
import {
  FileIcon,
  FolderIcon,
  FolderOpen,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  //Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */
interface FileListProps {
  files: (File & { children?: File[] })[];
  viewMode: "list" | "grid" | "tree";
  onEdit: (file: File) => void;
  onDelete: (file: File) => void;
  onMoveUp: (file: File) => void;
  onMoveDown: (file: File) => void;
  onAddFile?: () => void;
  onAddFolder?: () => void;
}

/* ---------- Item de la liste ---------- */
function FileItem({
  file,
  level = 0,
  viewMode,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddFile,
  onAddFolder,
}: {
  file: File & { children?: File[] };
  level?: number;
  viewMode: "list" | "grid" | "tree";
  onEdit: (file: File) => void;
  onDelete: (file: File) => void;
  onMoveUp: (file: File) => void;
  onMoveDown: (file: File) => void;
  onAddFile?: () => void;
  onAddFolder?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isFolder = file.type === "FOLDER";

  const toggleExpand = () => setExpanded(!expanded);

  const handleDelete = () => {
    if (confirm(`Supprimer « ${file.name} » ?`)) {
      onDelete(file);
    }
  };

  return (
    <div
      className={cn(
        "border border-border/50 rounded-md mb-1 bg-card hover:bg-accent/20 transition-colors",
        viewMode === "grid" && "p-4 text-center"
      )}
      style={viewMode !== "grid" ? { paddingLeft: `${level * 1.5 + 1}rem` } : undefined}
    >
      <div className="flex items-center justify-between px-3 py-2">
        {/* Icône + nom */}
        <div
          className={cn(
            "flex items-center gap-2 cursor-pointer truncate",
            viewMode === "grid" && "justify-center"
          )}
          onClick={isFolder ? toggleExpand : undefined}
        >
          {isFolder ? (
            expanded ? (
              <FolderOpen className="h-5 w-5 text-yellow-600" />
            ) : (
              <FolderIcon className="h-5 w-5 text-yellow-600" />
            )
          ) : (
            <FileIcon className="h-5 w-5 text-gray-600" />
          )}
          <span className="truncate font-medium">{file.name}</span>
          {isFolder && file.children && file.children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              className="ml-1 hover:text-primary transition-colors"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onMoveUp(file)}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onMoveDown(file)}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(file)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enfants pour mode tree */}
      {viewMode === "tree" && expanded && file.children && file.children.length > 0 && (
        <div className="ml-4 mt-1">
          {file.children.map((child) => (
            <FileItem
              key={child.id}
              file={child}
              level={level + 1}
              viewMode={viewMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onAddFile={onAddFile}
              onAddFolder={onAddFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Composant principal ---------- */
export default function FileList({
  files,
  viewMode,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddFile,
  onAddFolder,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <FolderIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
        Aucun fichier ou dossier
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
          : "space-y-1"
      )}
    >
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          viewMode={viewMode}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onAddFile={onAddFile}
          onAddFolder={onAddFolder}
        />
      ))}
    </div>
  );
}
