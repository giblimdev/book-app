// @/app/dev/file/page.tsx
/*
Orchestrer la page « Explorateur de fichiers » :
charger la liste des fichiers (via /api/files)
gérer l’état global de la page (recherche, vue, dossier courant, modales, erreurs)
fournir les callbacks (handleEdit, handleDelete, handleMove, etc.) aux composants enfants
État interne principal :
files: File[]
selectedFile: Partial<File> | null
searchQuery: string
viewMode: 'list' | 'grid' | 'tree'
currentPath: string[]
isDialogOpen: boolean
error: string | null

Données passées aux enfants :
<FileForm> : initialFile, folders, onSave, onCancel
<FileList> : files, onEdit, onDelete, onMoveUp, onMoveDown, viewMode
*/

/*
Page explorateur de fichiers
- charge la liste des fichiers
- gère la recherche, la vue (list/grid/tree), le dossier courant
- ouvre le formulaire FileForm dans un Dialog
*/

"use client";

import { useEffect, useState } from "react";
import type { File } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import FileForm from "@/components/files/FileForm";
import FileList from "@/components/files/FileList";

import {
  FolderOpen, Plus, RefreshCw, Search, List, Grid, FolderTree, ArrowUpDown,
  FolderPlus, FilePlus, Filter, ChevronRight, Folder, FileIcon
} from "lucide-react";

/* ---------- helpers ---------- */
const buildTree = (files: File[], parentId: string | null = null): (File & { children?: File[] })[] =>
  files
    .filter(f => f.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map(f => ({ ...f, children: buildTree(files, f.id) }));

/* ---------- page ---------- */
export default function FilesPage() {
  /* ----- state ----- */
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "tree">("tree");
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<Partial<File> | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ----- data ----- */
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/file");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: File[] = await res.json();
      setFiles(data);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ----- computed ----- */
  const treeData = buildTree(files);
 

  const currentFolderId =
    currentPath.length > 0
      ? files.find(f => f.name === currentPath[currentPath.length - 1] && f.type === "FOLDER")?.id ?? null
      : null;

  const currentFiles = files.filter(f => f.parentId === currentFolderId);

  /* ----- actions ----- */
  const handleDelete = async (file: File) => {
    if (!confirm(`Supprimer « ${file.name} » ?`)) return;
    try {
      const res = await fetch(`/api/file/${file.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur");
      setFiles(f => f.filter(item => item.id !== file.id));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    }
  };

  const handleSave = async (data: Partial<File>) => {
    try {
      const isUpdate = !!data.id;
      const res = await fetch(isUpdate ? `/api/file/${data.id}` : "/api/file", {
        method: isUpdate ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Erreur");
      const saved: File = await res.json();
      setFiles(f => isUpdate ? f.map(item => (item.id === saved.id ? saved : item)) : [...f, saved]);
      setSelectedFile(null);
      setIsDialogOpen(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    }
  };

  const handleEdit = (file: File) => {
    setSelectedFile(file);
    setIsDialogOpen(true);
  };

  const handleAdd = (type: "FILE" | "FOLDER") => {
    setSelectedFile({
      name: "",
      type,
      category: type === "FOLDER" ? undefined : "PAGE",
      order: currentFiles.filter(f => f.type === type).length,
      parentId: currentFolderId,
      isPublic: false,
      size: 0,
    });
    setIsDialogOpen(true);
  };

  const handleMove = async (file: File, direction: "up" | "down") => {
    const siblings = files
      .filter(f => f.parentId === file.parentId)
      .sort((a, b) => a.order - b.order);
    const idx = siblings.findIndex(f => f.id === file.id);
    const target = siblings[direction === "up" ? idx - 1 : idx + 1];
    if (!target) return;

    try {
      await Promise.all([
        fetch(`/api/files/${file.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: target.order }),
        }),
        fetch(`/api/files/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: file.order }),
        }),
      ]);
      setFiles(f =>
        f
          .map(item =>
            item.id === file.id ? { ...item, order: target.order } :
            item.id === target.id ? { ...item, order: file.order } : item
          )
          .sort((a, b) => (a.parentId === b.parentId ? a.order - b.order : 0))
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    }
  };

  /* ----- render ----- */
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/dev">Dev</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                File Explorer
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">File Explorer</h1>
            <p className="text-muted-foreground mt-2">Gérez vos fichiers et dossiers de développement</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={fetchFiles}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => handleAdd("FOLDER")}><FolderPlus className="h-4 w-4 mr-2" />Dossier</Button>
            <Button onClick={() => handleAdd("FILE")}><Plus className="h-4 w-4 mr-2" />Fichier</Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>✕</Button>
            </AlertDescription>
          </Alert>
        )}

        <Separator className="mb-6" />

        {/* Search + view switcher */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des fichiers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}><List className="h-4 w-4" /></Button>
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}><Grid className="h-4 w-4" /></Button>
                <Button variant={viewMode === "tree" ? "default" : "outline"} size="icon" onClick={() => setViewMode("tree")}><FolderTree className="h-4 w-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar : tree + stats */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FolderTree className="h-5 w-5" />Arborescence</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                  ) : (
                    <TreeNav data={treeData} onSelect={(f) => f.type === "FOLDER" && setCurrentPath([f.name])} />
                  )}
                </ScrollArea>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="border rounded p-2"><div className="text-xl font-bold text-primary">{files.filter(f => f.type === "FILE").length}</div><div className="text-xs text-muted-foreground">Fichiers</div></div>
                  <div className="border rounded p-2"><div className="text-xl font-bold text-primary">{files.filter(f => f.type === "FOLDER").length}</div><div className="text-xs text-muted-foreground">Dossiers</div></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fichiers</CardTitle>
                    <CardDescription>{viewMode === "tree" ? `${treeData.length} élément(s) dans l'arborescence` : `${currentFiles.length} élément(s) dans ce dossier`}</CardDescription>
                  </div>
                  <Badge variant="outline">{files.length} total</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
                ) : (
                  <FileList
                    files={viewMode === "tree" ? treeData : currentFiles}
                    viewMode={viewMode}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMoveUp={f => handleMove(f, "up")}
                    onMoveDown={f => handleMove(f, "down")}
                  />
                )}
              </CardContent>
              <CardFooter className="border-t pt-6">
                <div className="flex justify-between items-center w-full">
                  <div className="text-sm text-muted-foreground">Trier par : <Button variant="ghost" className="h-auto p-0">Ordre<ArrowUpDown className="h-3 w-3 ml-1" /></Button></div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleAdd("FOLDER")}><FolderPlus className="h-4 w-4 mr-2" />Nouveau dossier</Button>
                    <Button onClick={() => handleAdd("FILE")}><FilePlus className="h-4 w-4 mr-2" />Nouveau fichier</Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Dialog formulaire */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedFile?.id ? "Modifier le fichier" : "Nouveau fichier"}</DialogTitle>
              <DialogDescription>Remplissez les détails du fichier ou dossier</DialogDescription>
            </DialogHeader>
            {selectedFile && (
              <FileForm
                initialFile={selectedFile}
                folders={files.filter(f => f.type === "FOLDER")}
                onSave={handleSave}
                onCancel={() => {
                  setSelectedFile(null);
                  setIsDialogOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/* ---------- composants annexes ---------- */
function TreeNav({ data, onSelect }: { data: (File & { children?: File[] })[], onSelect: (f: File) => void }) {
  return (
    <div className="space-y-1">
      {data.map(f => (
        <div key={f.id}>
          <Button
            variant="ghost"
            className="w-full justify-start h-auto py-1.5"
            onClick={() => onSelect(f)}
          >
            {f.type === "FOLDER" ? <Folder className="h-4 w-4 mr-2" /> : <FileIcon className="h-4 w-4 mr-2" />}
            <span className="truncate">{f.name}</span>
            {f.children?.length ? <ChevronRight className="h-3 w-3 ml-auto" /> : null}
          </Button>
          {f.children && f.children.length > 0 && (
            <div className="ml-4">
              <TreeNav data={f.children} onSelect={onSelect} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
