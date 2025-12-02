//@/app/api/book/bookNodeContent/route.ts
/*
Rôle : Endpoints API pour les opérations CRUD sur bookNodeContent
Endpoints :
•	POST /api/bookNodeContent - Créer un BookNodeContent 
•	GET /api/bookNodeContent - Lister les BookNodeContent
•	GET /api/bookNodeContent - Récupérer un BookNodeContente spécifique
•	PUT /api/bookNodeContent - Mettre à jour un BookNodeContent spécifique
•	PATCH /api/bookNodeContent - Mise à jour partielle (ordre, etc.) un BookNodeContent spécifique
•	DELETE /api/bookNodeContent - Supprimer un BookNodeContent spécifique
*/
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contentSchema = z.object({
  type: z.enum(["TEXT", "IMAGE", "VIDEO", "CODE", "WARNING", "info", "TIP", "EXERCISE"]).default("TEXT"),
  content: z.string().default(""),
  order: z.number().int().default(0),
  nodeId: z.string().min(1, "Node ID requis"),
  metadata: z.record(z.any()).optional(), // Pour stocker fontSize, language, etc.
});

// GET: Récupérer les contenus d'un nœud spécifique
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get("nodeId");

  if (!nodeId) return NextResponse.json({ error: "nodeId requis" }, { status: 400 });

  try {
    const contents = await prisma.nodeContent.findMany({
      where: { nodeId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(contents);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Ajouter un bloc de contenu
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = contentSchema.parse(body);

    const newContent = await prisma.nodeContent.create({
      data: {
        type: parsed.type,
        content: parsed.content,
        order: parsed.order,
        metadata: parsed.metadata || {},
        node: { connect: { id: parsed.nodeId } },
      },
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur création contenu" }, { status: 500 });
  }
}

// PATCH: Mettre à jour un bloc (contenu ou position)
export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  try {
    const body = await req.json();
    const parsed = contentSchema.partial().parse(body);

    const updated = await prisma.nodeContent.update({
      where: { id },
      data: parsed,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

// DELETE: Supprimer un bloc
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });

  try {
    await prisma.nodeContent.delete({ where: { id } });
    return NextResponse.json({ message: "Contenu supprimé" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
