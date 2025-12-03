// @/app/api/books/[bookId]/[nodeId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assurez-vous que l'import est nommé { prisma } si c'est un export nommé

// Correction du type pour Next.js 15
type RouteParams = {
  params: Promise<{ bookId: string; nodeId: string }>;
};

// Mettre à jour un BookNode
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // 1. Attendre la résolution des params (Spécifique Next.js 15)
    const { bookId, nodeId } = await params;

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
        id: nodeId,
        bookId: bookId,
      },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Nœud non trouvé" }, { status: 404 });
    }

    // Mettre à jour le node
    const updatedNode = await prisma.bookNode.update({
      where: { id: nodeId },
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
    // 1. Attendre la résolution des params
    const { bookId, nodeId } = await params;

    // Vérifier que le node existe et appartient bien au livre
    const existingNode = await prisma.bookNode.findFirst({
      where: {
        id: nodeId,
        bookId: bookId,
      },
    });

    if (!existingNode) {
      return NextResponse.json({ error: "Nœud non trouvé" }, { status: 404 });
    }

    // Note: Si votre schéma Prisma a `onDelete: Cascade` sur la relation parent-enfants,
    // cette fonction récursive n'est pas nécessaire, un simple delete suffit.
    // Cependant, je garde votre logique actuelle au cas où le Cascade n'est pas configuré en DB.
    
    const deleteNodeAndChildren = async (targetNodeId: string): Promise<void> => {
      // Trouver tous les enfants directs
      const children = await prisma.bookNode.findMany({
        where: { parentId: targetNodeId },
        select: { id: true },
      });

      // Supprimer récursivement chaque enfant
      for (const child of children) {
        await deleteNodeAndChildren(child.id);
      }

      // Supprimer le node lui-même
      await prisma.bookNode.delete({
        where: { id: targetNodeId },
      });
    };

    // Lancer la suppression récursive
    await deleteNodeAndChildren(nodeId);

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
