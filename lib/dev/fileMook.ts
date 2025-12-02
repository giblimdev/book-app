// @/dev/devData.ts
/*
puis injecter directement le fichier dans script ?


*/
type DevItem = {
  path: string;
  order: number;
  script: string;
  error: string;
  relations?: string[];
};

export const devData: DevItem[] = [
  {
    path: "@/app/book/page.tsx",
    order: 1,
    script: `// @/app/book/page.tsx 
"use client";

import { useState } from "react";
import BookList from "@/components/Book/BookList";
import BookForm from "@/components/Book/BookForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Page() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (book: any) => {
    setEditingBook(book);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingBook(null);
  };

  const handleAdd = () => {
    setEditingBook(null);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
              Mes livres
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Gérez votre bibliothèque personnelle, ajoutez et modifiez vos livres.
            </p>
          </div>
          <Button
            onClick={handleAdd}
            className="gap-2 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un livre
          </Button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-slate-950/40">
          <BookList
            key={refreshTrigger}
            onEdit={handleEdit}
          />
        </div>

        <BookForm
          open={formOpen}
          onClose={handleClose}
          book={editingBook}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}`,
    relations: [
      "@/components/Book/BookList.tsx",
      "@/components/Book/BookForm.tsx",
      "@/app/api/books/route.ts",
    ],
    error:
      "Type '{ open: boolean; onClose: () => void; book: any; onSuccess: () => void; }' is not assignable to type 'IntrinsicAttributes & { open: boolean; onClose: () => void; book?: ({ title: string; description?: string | undefined; image?: string | undefined; } & { id?: string | undefined; }) | null | undefined; }'.\n  Property 'onSuccess' does not exist on type 'IntrinsicAttributes & { open: boolean; onClose: () => void; book?: ({ title: string; description?: string | undefined; image?: string | undefined; } & { id?: string | undefined; }) | null | undefined; }'.",
  },
  {
    path: "@/components/Book/BookList.tsx",
    order: 2,
    script: `// Fichier en cours de développement`,
    relations: ["@/app/api/books/route.ts"],
    error: "none",
  },
  {
    path: "@/components/Book/BookForm.tsx",
    order: 3,
    relations: ["@/app/api/books/route.ts"],
    script: `// @/components/Book/BookForm.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
  image: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BookForm({
  open,
  onClose,
  book,
}: {
  open: boolean;
  onClose: () => void;
  book?: (FormValues & { id?: string | undefined }) | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      ...(book ?? {}),
    },
  });

  useEffect(() => {
    if (book) {
      reset({
        title: book.title ?? "",
        description: book.description ?? "",
        image: book.image ?? "",
      });
    } else {
      reset({
        title: "",
        description: "",
        image: "",
      });
    }
  }, [book, reset]);

  const onSubmit = async (data: FormValues) => {
    const url = book?.id ? \`/api/books/\${book.id}\` : "/api/books";
    const method = book?.id ? "PUT" : "POST";

    console.log("BookForm submit:", { url, method, data }); // debug

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        image: data.image?.trim() === "" ? undefined : data.image?.trim(),
      }),
    });

    console.log("Réponse /api/books status:", response.status); // debug

    if (!response.ok) {
      let message = "Erreur lors de l'opération";
      try {
        const errorData = await response.json();
        console.log("Erreur JSON /api/books:", errorData); // debug
        if (errorData?.error) message = errorData.error;
      } catch (e) {
        console.log("Impossible de parser le JSON d'erreur:", e); // debug
      }
      throw new Error(message);
    }

    onClose();
    window.location.reload();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-slate-800 bg-slate-900/95 text-slate-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {book?.id ? "Modifier le livre" : "Ajouter un livre"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-slate-200">Titre</Label>
            <Input
              {...register("title")}
              className="bg-slate-900 border-slate-700 focus-visible:ring-slate-300"
              placeholder="Titre du livre"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Description</Label>
            <Textarea
              {...register("description")}
              className="bg-slate-900 border-slate-700 focus-visible:ring-slate-300 min-h-[100px]"
              placeholder="Description (optionnelle)"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Image (URL, optionnelle)</Label>
            <Input
              {...register("image")}
              className="bg-slate-900 border-slate-700 focus-visible:ring-slate-300"
              placeholder="https://exemple.com/couverture.jpg"
            />
            <p className="text-[11px] text-slate-500">
              Laisse vide si tu ne veux pas d&apos;image.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 rounded-md border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 hover:text-slate-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-md bg-indigo-500 hover:bg-indigo-400 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "En cours..."
                : book?.id
                ? "Sauvegarder"
                : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
`,
    error: "none",
  },
  {
    path: "@/book/[bookId]/page.tsx",
    order: 4,
    script: `// Fichier en cours de développement`,
    relations: ["@/components/Book/BookNodeTree"],
    error: "none",
  },
  {
    path: "@/components/Book/BookNodeTree",
    order: 5,
    script: `// Fichier en cours de développement`,
    relations: ["@/app/books/[bookId]/nodes/route.ts"],
    error: "none",
  },
  {
    path: "@/",
    order: 6,
    script: `// Fichier en cours de développement`,
    relations: [],
    error: "none",
  },
  {
    path: "@/api/books/route.ts",
    order: 100,
    script: `// Fichier en cours de développement`,
    relations: [
      "@/app/book/page.tsx",
      "@/components/Book/BookList.tsx",
      "@/components/Book/BookForm.tsx",
    ],
    error: "none",
  },
  {
    path: "@/app/books/[bookId]/route.ts",
    order: 101,
    script: `// Fichier en cours de développement`,
    relations: ["@/book/[bookId]/page.tsx"],
    error: "none",
  },
  {
    path: "@/app/books/[bookId]/nodes/route.ts",
    order: 102,
    script: `// Fichier en cours de développement`,
    relations: ["@/components/Book/BookNodeTree"],
    error: "none",
  },
  {
    path: "/api/books/[bookId]/nodes/reorder/route.ts",
    order: 103,
    script: `// Fichier en cours de développement`,
    relations: ["@/components/Book/BookNodeTree"],
    error: "none",
  },
  {
    path: "@/app/books/[bookId]/[nodeId]/route.ts",
    order: 104,
    script: `// Fichier en cours de développement`,
    relations: ["@/components/Book/BookNodeTree"],
    error: "none",
  },
  {
    path: "@/app/",
    order: 105,
    script: `// Fichier en cours de développement`,
    relations: [],
    error: "none",
  },
];
