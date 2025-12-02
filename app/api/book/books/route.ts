 //@/app/api/book/books/route.ts 
/* Rôle : 
Gestion CRUD des Livres. La sécurité sera pour la v2 
 - GET : Récupérer les livres.
 - POST : Créer un livre 
 - PATCH/DELETE : 
*/ 
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assurez-vous que ce chemin est correct
import { z } from "zod";

// Schéma de validation pour un livre
const bookSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

// GET: Récupérer tous les livres (ou un seul si ?id=...)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const book = await prisma.book.findUnique({
        where: { id },
        include: { bookNodes: true }, // Inclure les nœuds si besoin
      });
      if (!book) {
        return NextResponse.json({ error: "Livre non trouvé" }, { status: 404 });
      }
      return NextResponse.json(book);
    }

    // Liste de tous les livres (filtrer par auteur si auth implémenté)
    const books = await prisma.book.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(books);
  } catch (error) {
    console.error("Erreur GET /api/book:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Créer un nouveau livre
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // TODO: Récupérer l'ID de l'utilisateur connecté via session
    // const session = await auth.api.getSession({ headers: req.headers });
    // const authorId = session?.user?.id;
    const authorId = "user1"; // Mock ID pour l'exemple, à remplacer

    const parsed = bookSchema.parse(body);

    const newBook = await prisma.book.create({
      data: {
        ...parsed,
        authorId: authorId, 
      },
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/book:", error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

// PATCH: Mise à jour partielle (ex: titre, ordre)
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    const body = await req.json();
    const parsed = bookSchema.partial().parse(body);

    const updatedBook = await prisma.book.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Erreur PATCH /api/book:", error);
    return NextResponse.json({ error: "Erreur de mise à jour" }, { status: 500 });
  }
}

// DELETE: Supprimer un livre
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Livre supprimé" });
  } catch (error) {
    console.error("Erreur DELETE /api/book:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
