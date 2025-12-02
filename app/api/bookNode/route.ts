//@/app/api/bookNode/route.ts
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
import prisma from "@/lib/prisma";
import { z } from "zod";

/**
 * Validation du payload pour la création / mise à jour
 */
const bookNodeSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères"),
  description: z.string().optional(),
  type: z
    .string()
    .default("CHAPTER")
    .refine(
      (val) =>
        [
          "BOOK",
          "PART",
          "CHAPTER",
          "SECTION",
          "SUBSECTION",
          "ARTICLE",
        ].includes(val),
      "Type invalide"
    ),
  parentId: z.string().nullable().optional(),
  order: z.number().optional(),
  bookId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

/**
 * GET → Liste les nœuds pour un livre (via bookId)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get("bookId");

  if (!bookId) {
    return NextResponse.json(
      { error: "bookId est requis dans les paramètres" },
      { status: 400 }
    );
  }

  try {
    const nodes = await prisma.bookNode.findMany({
      where: { bookId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(nodes);
  } catch (error) {
    console.error("Erreur GET /bookNode:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des chapitres" },
      { status: 500 }
    );
  }
}

/**
 * POST → Créer un nouveau BookNode
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookNodeSchema.parse(body);

    const newNode = await prisma.bookNode.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        type: parsed.type,
        parentId: parsed.parentId,
        bookId: parsed.bookId,
        order: parsed.order ?? 0,
        isPublished: parsed.isPublished ?? false,
      },
    });

    return NextResponse.json(newNode, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /bookNode:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du chapitre" },
      { status: 500 }
    );
  }
}

/**
 * PATCH → Met à jour partiellement un BookNode (titre, ordre, publication, etc.)
 */
export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("id");

    if (!nodeId) {
      return NextResponse.json(
        { error: "id requis dans les paramètres (ex: /bookNode?id=...)" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = bookNodeSchema.partial().parse(body);

    const updated = await prisma.bookNode.update({
      where: { id: nodeId },
      data: parsed,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur PATCH /bookNode:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du chapitre" },
      { status: 500 }
    );
  }
}

/**
 * DELETE → Supprime un BookNode par ID
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const nodeId = searchParams.get("id");

    if (!nodeId) {
      return NextResponse.json(
        { error: "id requis dans les paramètres (ex: /bookNode?id=...)" },
        { status: 400 }
      );
    }

    await prisma.bookNode.delete({
      where: { id: nodeId },
    });

    return NextResponse.json({ message: "Chapitre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur DELETE /bookNode:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du chapitre" },
      { status: 500 }
    );
  }
}
