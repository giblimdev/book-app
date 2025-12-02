//@/app/api/book/comment/route.ts
/*
Rôle : Endpoints API pour les opérations CRUD sur comment 
Endpoints :
•	POST /api/comment - Créer un comment 
•	GET /api/comment - Lister les comment
•	GET /api/comment - Récupérer un comment spécifique
•	PUT /api/comment - Mettre à jour un comment spécifique
•	PATCH /api/comment - Mise à jour partielle (ordre, etc.) un comment spécifique
•	DELETE /api/comment - Supprimer un comment spécifique

*/
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1, "Le commentaire ne peut pas être vide"),
  nodeId: z.string().min(1),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get("nodeId");

  if (!nodeId) return NextResponse.json({ error: "nodeId requis" }, { status: 400 });

  try {
    const comments = await prisma.comment.findMany({
      where: { nodeId },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // TODO: Auth check
    // const session = await auth...
    const userId = "user1"; // Mock

    const body = await req.json();
    const parsed = commentSchema.parse(body);

    const comment = await prisma.comment.create({
      data: {
        content: parsed.content,
        node: { connect: { id: parsed.nodeId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur création commentaire" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  // TODO: Vérifier que l'utilisateur est l'auteur ou admin

  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  try {
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ message: "Commentaire supprimé" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
