// @/app/api/books/[bookId]/[nodeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteParams = {
  params: { bookId: string; nodeId: string };
};

// Mettre à jour un BookNode
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const body = await req.json();
    const { title, description, type } = body;

    // Validation basique
    if (!title || !type) {
      return NextResponse.json(
        { error: "Titre et type sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que le node existe et appartient bien au livre
    const existingNode = await prisma.bookNode.findFirst({
      where: {
        id: params.nodeId,
        bookId: params.bookId,
      },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Nœud non trouvé" }, { status: 404 });
    }

    // Mettre à jour le node
    const updatedNode = await prisma.bookNode.update({
      where: { id: params.nodeId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error("Error updating BookNode:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du nœud" },
      { status: 500 }
    );
  }
}

// Supprimer un BookNode et tous ses enfants
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // Vérifier que le node existe et appartient bien au livre
    const existingNode = await prisma.bookNode.findFirst({
      where: {
        id: params.nodeId,
        bookId: params.bookId,
      },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Nœud non trouvé" }, { status: 404 });
    }

    // Fonction récursive pour supprimer un node et tous ses enfants
    const deleteNodeAndChildren = async (nodeId: string): Promise<void> => {
      // Trouver tous les enfants directs
      const children = await prisma.bookNode.findMany({
        where: { parentId: nodeId },
        select: { id: true },
      });

      // Supprimer récursivement chaque enfant
      for (const child of children) {
        await deleteNodeAndChildren(child.id);
      }

      // Supprimer le node lui-même (avec cascade sur nodeContents et comments)
      await prisma.bookNode.delete({
        where: { id: nodeId },
      });
    };

    // Lancer la suppression récursive
    await deleteNodeAndChildren(params.nodeId);

    return NextResponse.json({
      success: true,
      message: "Nœud et ses enfants supprimés avec succès",
    });
  } catch (error) {
    console.error("Error deleting BookNode:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du nœud" },
      { status: 500 }
    );
  }
}
