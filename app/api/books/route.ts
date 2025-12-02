//@/app/api/books/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/auth-server";

// GET /api/books
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const books = await prisma.book.findMany({
      where: {
        authorId: user.id, // un user -> plusieurs livres
      },
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(books);
  } catch (error) {
    console.error("GET /api/books error", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des livres" },
      { status: 500 }
    );
  }
}

// POST /api/books
export async function POST(req: Request) {
  console.log("DEBUG POST /api/books reached");

  try {
    const user = await getCurrentUser();
    console.log("DEBUG current user:", user);

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = (await req.json()) as {
      title?: string;
      description?: string | null;
      image?: string | null;
    };
    console.log("DEBUG body /api/books:", body);

    if (!body.title || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        image:
          body.image && body.image.trim() !== "" ? body.image.trim() : null,
        author: {
          connect: { id: user.id }, // relation 1‑N avec User
        },
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

    console.log("DEBUG book created:", book);

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("POST /api/books error", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du livre" },
      { status: 500 }
    );
  }
}
