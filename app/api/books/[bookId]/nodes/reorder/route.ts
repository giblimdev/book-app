// @/app/api/books/[bookId]/nodes/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assurez-vous de l'import { prisma } ou défaut selon votre config

// Définition correcte du type pour Next.js 15
type RouteParams = {
  params: Promise<{ bookId: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Attendre la résolution des paramètres
    const { bookId } = await params;

    const body = await req.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    // Optionnel : Vérifier que le livre existe (bonnes pratiques)
    // const bookExists = await prisma.book.findUnique({ where: { id: bookId }});
    // if (!bookExists) return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });

    // Mettre à jour l'ordre de tous les nodes en une transaction
    await prisma.$transaction(
      updates.map((update: { id: string; order: number }) =>
        prisma.bookNode.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering BookNodes:", error);
    return NextResponse.json(
      { error: "Erreur lors du réordonnancement des nœuds" },
      { status: 500 }
    );
  }
}
