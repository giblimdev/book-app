"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FileText, Folder, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  type: z.enum(["FILE", "FOLDER"]),
  category: z.string().optional(),
  content: z.string().optional(),
  url: z.string().optional(),
  role: z.string().optional(),
  isPublic: z.boolean().default(false),
  parentId: z.string().optional(),
  mimeType: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface FileFormProps {
  file?: any
  onSuccess: () => void
  onCancel?: () => void
}

export function FileForm({ file, onSuccess, onCancel }: FileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [folders, setFolders] = useState<any[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: file?.name || "",
      slug: file?.slug || "",
      type: file?.type || "FILE",
      category: file?.category || "",
      content: file?.content || "",
      url: file?.url || "",
      role: file?.role || "",
      isPublic: file?.isPublic || false,
      parentId: file?.parentId || "",
      mimeType: file?.mimeType || "",
    },
  })

  useEffect(() => {
    fetchFolders()
  }, [])

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/files?type=FOLDER")
      const data = await response.json()
      setFolders(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const url = file ? `/api/files/${file.id}` : "/api/files"
      const method = file ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement")
      }

      toast.success(file ? "Fichier mis à jour" : "Fichier créé") // ✅ Utilisation de Sonner
      onSuccess()
    } catch (error) {
      toast.error("Une erreur est survenue") // ✅ Utilisation de Sonner
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Les champs du formulaire restent identiques --- */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nom du fichier ou dossier"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    if (!file && !form.getValues("slug")) {
                      form.setValue("slug", generateSlug(e.target.value))
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="slug-du-fichier" {...field} />
              </FormControl>
              <FormDescription>Identifiant unique pour l&apos;URL</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FILE">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Fichier
                    </div>
                  </SelectItem>
                  <SelectItem value="FOLDER">
                    <div className="flex items-center">
                      <Folder className="mr-2 h-4 w-4" />
                      Dossier
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dossier parent</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un dossier (optionnel)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PAGE">Page</SelectItem>
                  <SelectItem value="COMPONENT">Component</SelectItem>
                  <SelectItem value="LAYOUT">Layout</SelectItem>
                  <SelectItem value="HOOK">Hook</SelectItem>
                  <SelectItem value="UTIL">Util</SelectItem>
                  <SelectItem value="LIB">Lib</SelectItem>
                  <SelectItem value="STYLE">Style</SelectItem>
                  <SelectItem value="ASSET">Asset</SelectItem>
                  <SelectItem value="CONFIG">Config</SelectItem>
                  <SelectItem value="DOCUMENTATION">Documentation</SelectItem>
                  <SelectItem value="TEST">Test</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("type") === "FILE" && (
          <>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenu</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contenu du fichier..."
                      className="min-h-[200px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>URL externe si applicable</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mimeType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type MIME</FormLabel>
                  <FormControl>
                    <Input placeholder="text/javascript" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rôle</FormLabel>
              <FormControl>
                <Input placeholder="Rôle dans l'application" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public</FormLabel>
                <FormDescription>
                  Rendre ce fichier accessible publiquement
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {file ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  )
}


/*
Unexpected any. Specify a different type.

## Error Type
Console Error

## Error Message
Erreur 404: Not Found


    at fetchFiles (app\dev\file\page.tsx:128:15)

## Code Frame
  126 |       
  127 |       if (!res.ok) {
> 128 |         throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      |               ^
  129 |       }
  130 |       
  131 |       const data: File[] = await res.json();

Next.js version: 15.5.6 (Webpack)

*/