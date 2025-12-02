/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/files/FileForm.tsx
/*
Responsabilité unique :
Afficher et valider un formulaire de création / édition d'un fichier ou dossier.
Ne fait aucun appel réseau : il émet uniquement l'objet prêt à être sauvegardé.
*/

"use client";

import React, { useState, useCallback } from "react";
import { z } from "zod";
import type { File } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileIcon,
  Save,
  X,
  Folder,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ---------- Types ---------- */
export type FileType = "FILE" | "FOLDER";

export enum FileCategoryEnum {
  PAGE = "PAGE",
  COMPONENT = "COMPONENT",
  LAYOUT = "LAYOUT",
  HOOK = "HOOK",
  UTIL = "UTIL",
  LIB = "LIB",
  STYLE = "STYLE",
  ASSET = "ASSET",
  CONFIG = "CONFIG",
  DOCUMENTATION = "DOCUMENTATION",
  TEST = "TEST",
}

export type FileCategory = keyof typeof FileCategoryEnum;

export interface FileFormData {
  name: string;
  slug: string;
  type: FileType;
  category?: FileCategory | null;
  content?: string | null;
  url?: string | null;
  role?: string | null;
  relation?: string | null;
  isPublic: boolean;
  parentId?: string | null;
  mimeType?: string | null;
  order?: number;
  userId?: string | null;
  size?: number | null;
  metadata?: Record<string, any> | null;
}

/* ---------- Props ---------- */
interface FileFormProps {
  initialFile?: Partial<File>;
  folders: File[];
  onSave: (data: FileFormData) => void;
  onCancel?: () => void;
}

/* ---------- Validation ---------- */
const fileFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").trim(),
  slug: z.string().min(1, "Le slug est requis").trim(),
  type: z.enum(["FILE", "FOLDER"]),
  category: z.nativeEnum(FileCategoryEnum).nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  relation: z.string().nullable().optional(),
  isPublic: z.boolean(),
  parentId: z.string().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  order: z.number().optional(),
  userId: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

/* ---------- Utils ---------- */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- Composant principal ---------- */
export default function FileForm({
  initialFile = {},
  folders = [],
  onSave,
  onCancel,
}: FileFormProps) {
  // Initialisation correcte du state
  const initialSlug = initialFile.slug || (initialFile.name ? generateSlug(initialFile.name) : "");
  const initialCategory = initialFile.category as FileCategory | undefined;
  
  const [formData, setFormData] = useState<FileFormData>({
    name: initialFile.name ?? "",
    slug: initialSlug,
    type: (initialFile.type as FileType) ?? "FILE",
    category: initialCategory,
    content: initialFile.content ?? undefined,
    url: initialFile.url ?? undefined,
    role: initialFile.role ?? undefined,
    relation: initialFile.relation ?? undefined,
    isPublic: initialFile.isPublic ?? false,
    parentId: initialFile.parentId ?? undefined,
    mimeType: initialFile.mimeType ?? undefined,
    order: initialFile.order ?? 0,
    userId: initialFile.userId ?? undefined,
    size: initialFile.size ?? undefined,
    metadata: initialFile.metadata as Record<string, any> | null | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSlugGenerated, setIsSlugGenerated] = useState(!initialFile.id && !initialFile.slug);

  const handleNameChange = useCallback((name: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, name };
      
      // Générer le slug automatiquement seulement en création et si pas modifié manuellement
      if (!initialFile.id && isSlugGenerated) {
        return {
          ...newFormData,
          slug: generateSlug(name)
        };
      }
      
      return newFormData;
    });

    if (errors.name) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  }, [initialFile.id, isSlugGenerated, errors.name]);

  const handleSlugChange = useCallback((slug: string) => {
    setFormData(prev => ({
      ...prev,
      slug
    }));

    // Si l'utilisateur modifie le slug manuellement, on arrête la génération automatique
    if (!initialFile.id && isSlugGenerated) {
      setIsSlugGenerated(false);
    }

    if (errors.slug) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.slug;
        return newErrors;
      });
    }
  }, [initialFile.id, isSlugGenerated, errors.slug]);

  const handleChange = <K extends keyof FileFormData>(
    field: K, 
    value: FileFormData[K]
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Si c'est un dossier, effacer les champs spécifiques aux fichiers
      if (field === 'type' && value === 'FOLDER') {
        return {
          ...updated,
          content: null,
          url: null,
          mimeType: null,
          size: null,
          category: undefined
        };
      }
      
      return updated;
    });

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Préparer les données pour la validation
    const submitData: FileFormData = {
      ...formData,
      // S'assurer que les champs optionnels sont correctement formatés
      parentId: formData.parentId || null,
      category: formData.category || null,
      content: formData.content || null,
      url: formData.url || null,
      role: formData.role || null,
      relation: formData.relation || null,
      mimeType: formData.mimeType || null,
      // Calculer la taille si c'est un fichier avec du contenu
      size: formData.type === 'FILE' && formData.content ? 
        Buffer.byteLength(formData.content, 'utf8') : 
        formData.size || null,
      metadata: formData.metadata || null
    };

    const validated = fileFormSchema.safeParse(submitData);

    if (!validated.success) {
      const newErrors: Record<string, string> = {};
      validated.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Appeler la fonction de sauvegarde
    onSave(validated.data);
  };

  const filteredFolders = folders.filter((f) => 
    f.type === "FOLDER" && f.id !== initialFile.id
  );

  return (
    <Card className="w-full flex flex-col max-h-[80vh]">
      <CardHeader className="shrink-0">
        <CardTitle>
          {initialFile.id ? "Modifier" : "Créer"} un {formData.type === "FOLDER" ? "dossier" : "fichier"}
        </CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <CardContent className="pt-6 grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              <Tabs defaultValue="general">
                <TabsList className="grid grid-cols-2 sticky top-0 bg-background z-10">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="advanced">Avancé</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 pt-4">
                  {/* Nom */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="Nom du fichier ou dossier"
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={errors.slug ? "border-red-500" : ""}
                        placeholder="slug-du-fichier"
                      />
                      {!initialFile.id && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newSlug = generateSlug(formData.name);
                            handleSlugChange(newSlug);
                            setIsSlugGenerated(true);
                          }}
                        >
                          Générer
                        </Button>
                      )}
                    </div>
                    {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
                    {!initialFile.id && isSlugGenerated && (
                      <p className="text-xs text-muted-foreground">
                        Le slug est généré automatiquement. Modifiez-le si nécessaire.
                      </p>
                    )}
                  </div>

                  {/* Type et catégorie */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(v: FileType) => handleChange("type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FILE">
                            <FileIcon className="h-4 w-4 mr-2 inline" /> Fichier
                          </SelectItem>
                          <SelectItem value="FOLDER">
                            <Folder className="h-4 w-4 mr-2 inline" /> Dossier
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.type === "FILE" && (
                      <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <Select
                          value={formData.category || ""}
                          onValueChange={(v) => handleChange("category", v as FileCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une catégorie..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PAGE">PAGE</SelectItem>
                            <SelectItem value="COMPONENT">COMPONENT</SelectItem>
                            <SelectItem value="LAYOUT">LAYOUT</SelectItem>
                            <SelectItem value="HOOK">HOOK</SelectItem>
                            <SelectItem value="UTIL">UTIL</SelectItem>
                            <SelectItem value="LIB">LIB</SelectItem>
                            <SelectItem value="STYLE">STYLE</SelectItem>
                            <SelectItem value="ASSET">ASSET</SelectItem>
                            <SelectItem value="CONFIG">CONFIG</SelectItem>
                            <SelectItem value="DOCUMENTATION">DOCUMENTATION</SelectItem>
                            <SelectItem value="TEST">TEST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Parent */}
                  <div className="space-y-2">
                    <Label>Dossier parent</Label>
                    <Select
                      value={formData.parentId || "root"}
                      onValueChange={(v) => handleChange("parentId", v === "root" ? null : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Racine (pas de parent)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">Racine</SelectItem>
                        {filteredFolders.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contenu pour les fichiers */}
                  {formData.type === "FILE" && (
                    <div className="space-y-2">
                      <Label>Contenu</Label>
                      <Textarea
                        value={formData.content || ""}
                        onChange={(e) => handleChange("content", e.target.value || null)}
                        className="min-h-[150px] font-mono text-sm"
                        placeholder="Contenu du fichier..."
                      />
                    </div>
                  )}

                  {/* URL pour les fichiers */}
                  {formData.type === "FILE" && (
                    <div className="space-y-2">
                      <Label>URL (optionnel)</Label>
                      <Input
                        value={formData.url || ""}
                        onChange={(e) => handleChange("url", e.target.value || null)}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 pt-4">
                  {/* Ordre */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ordre</Label>
                      <Input
                        type="number"
                        value={formData.order || 0}
                        onChange={(e) => handleChange("order", parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Type MIME pour les fichiers */}
                    {formData.type === "FILE" && (
                      <div className="space-y-2">
                        <Label>Type MIME</Label>
                        <Input
                          value={formData.mimeType || ""}
                          onChange={(e) => handleChange("mimeType", e.target.value || null)}
                          placeholder="text/javascript, text/html, etc."
                        />
                      </div>
                    )}
                  </div>

                  {/* Rôle et relation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rôle (optionnel)</Label>
                      <Input
                        value={formData.role || ""}
                        onChange={(e) => handleChange("role", e.target.value || null)}
                        placeholder="Rôle dans l'application"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Relation (optionnel)</Label>
                      <Input
                        value={formData.relation || ""}
                        onChange={(e) => handleChange("relation", e.target.value || null)}
                        placeholder="ID de l'entité liée"
                      />
                    </div>
                  </div>

                  {/* Switch pour la visibilité publique */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Public</Label>
                      <p className="text-sm text-muted-foreground">
                        Rendre ce fichier accessible publiquement
                      </p>
                    </div>
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleChange("isPublic", checked)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </CardContent>

        <Separator />
        <CardFooter className="pt-6 flex justify-between shrink-0">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" /> Annuler
            </Button>
          )}
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {initialFile.id ? "Mettre à jour" : "Créer"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}