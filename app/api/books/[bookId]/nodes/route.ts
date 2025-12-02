// @/app/api/books/[bookId]/nodes/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const body = await req.json();
    const { title, description, type, parentId, order } = body;

    // Vérifier que le livre existe
    const book = await prisma.book.findUnique({
      where: { id: params.bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Livre non trouvé" }, { status: 404 });
    }

    // Créer le nouveau BookNode
    const newNode = await prisma.bookNode.create({
      data: {
        title,
        description: description || null,
        type,
        order: order || 0,
        parentId: parentId || null,
        bookId: params.bookId,
      },
    });

    return NextResponse.json(newNode, { status: 201 });
  } catch (error) {
    console.error("Error creating BookNode:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du nœud" },
      { status: 500 }
    );
  }
}
