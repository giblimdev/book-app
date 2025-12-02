// @/app/api/books/[bookId]/nodes/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const body = await req.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

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
