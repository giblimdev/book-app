//@/app/api/book/bookNode/route.ts
/**
 * Rôle :
 *  - Endpoints API pour les opérations CRUD sur BookNode (chapitres / sections d’un livre).
 *
 * Endpoints :
 *  - POST   /api/bookNode        → Créer un BookNode
 *  - GET    /api/bookNode        → Lister les BookNode (par bookId)
 *  - GET    /api/bookNode/:id    → Récupérer un BookNode spécifique
 *  - PUT    /api/bookNode/:id    → Mettre à jour un BookNode complet
 *  - PATCH  /api/bookNode/:id    → Mise à jour partielle (ordre, publication, etc.)
 *  - DELETE /api/bookNode/:id    → Supprimer un BookNode
 *
 * Utilise :
 *  - Prisma Client depuis @/lib/prisma
 *  - Zod pour la validation d’entrée
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation
const bookNodeSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  type: z.enum(["PART", "CHAPTER", "SECTION", "SUBSECTION", "ARTICLE"]).default("CHAPTER"),
  order: z.number().int().default(0),
  parentId: z.string().nullable().optional(),
  bookId: z.string().min(1, "Book ID requis"),
  isPublished: z.boolean().optional(),
});

// GET: Récupérer les nœuds d'un livre
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");
  const id = searchParams.get("id");

  try {
    if (id) {
        const node = await prisma.bookNode.findUnique({ where: { id }});
        return NextResponse.json(node);
    }

    if (!bookId) {
      return NextResponse.json({ error: "bookId requis" }, { status: 400 });
    }

    const nodes = await prisma.bookNode.findMany({
      where: { bookId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(nodes);
  } catch (error) {
    console.error("Erreur GET /api/bookNode:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Créer un nœud
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookNodeSchema.parse(body);

    const newNode = await prisma.bookNode.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        type: parsed.type,
        order: parsed.order,
        isPublished: parsed.isPublished ?? false,
        book: { connect: { id: parsed.bookId } },
        parent: parsed.parentId ? { connect: { id: parsed.parentId } } : undefined,
        // Auteurs par défaut à l'utilisateur courant si besoin
      },
    });

    return NextResponse.json(newNode, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/bookNode:", error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH: Mise à jour (ex: changer de parent, réordonner)
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    const body = await req.json();
    const parsed = bookNodeSchema.partial().parse(body);

    const updatedNode = await prisma.bookNode.update({
      where: { id },
      data: {
        ...parsed,
        // Gestion spécifique si parentId change pour éviter les cycles si nécessaire
      },
    });

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error("Erreur PATCH /api/bookNode:", error);
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

// DELETE: Supprimer un nœud (et ses enfants via Cascade dans le schéma)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

    await prisma.bookNode.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Chapitre supprimé" });
  } catch (error) {
    console.error("Erreur DELETE /api/bookNode:", error);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
