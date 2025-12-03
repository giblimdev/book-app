// @/app/api/books/[bookId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-server";

// Définition du type pour les params asynchrones (Next.js 15)
type RouteParams = {
  params: Promise<{ bookId: string }>;
};

// PUT /api/books/[bookId]
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    // 1. Await des params
    const { bookId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = (await req.json()) as {
      title?: string;
      description?: string | null;
      image?: string | null;
    };

    const existingBook = await prisma.book.findFirst({
      where: {
        id: bookId, // Utilisation de la variable destructurée
        authorId: user.id,
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "Livre non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    const book = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: body.title?.trim(),
        description: body.description?.trim() || null,
        image:
          body.image && body.image.trim() !== "" ? body.image.trim() : null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("PUT /api/books/[bookId] error", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du livre" },
      { status: 500 }
    );
  }
}

// PATCH /api/books/[bookId] - mise à jour de l'ordre
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    // 1. Await des params
    const { bookId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = (await req.json()) as {
      order?: number;
    };

    if (typeof body.order !== "number") {
      return NextResponse.json(
        { error: "Champ 'order' invalide ou manquant" },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findFirst({
      where: {
        id: bookId,
        authorId: user.id,
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "Livre non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        order: body.order,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        createdAt: true,
        order: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/books/[bookId] error", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'ordre" },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[bookId]
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    // 1. Await des params
    const { bookId } = await params;

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const existingBook = await prisma.book.findFirst({
      where: {
        id: bookId,
        authorId: user.id,
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { error: "Livre non trouvé ou non autorisé" },
        { status: 404 }
      );
    }

    await prisma.book.delete({
      where: { id: bookId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/books/[bookId] error", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du livre" },
      { status: 500 }
    );
  }
}
