/**
 * @file app/api/book/books/route.ts
 * @type Route API Next.js (App Router)
 * @role API CRUD complète pour les Livres (Book)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  bookCreateSchema, 
  bookUpdateSchema, 
  bookPatchSchema, 
  bookDeleteSchema 
} from '@/lib/validators/bookSchema';

// GET: Récupérer tous les livres ou un livre spécifique
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const authorId = searchParams.get('authorId');

    // Cas 1: Livre unique par ID
    if (id) {
      const book = await prisma.book.findUnique({
        where: { id },
        include: { author: { select: { name: true, image: true } } }
      });
      
      if (!book) return NextResponse.json({ error: 'Livre non trouvé' }, { status: 404 });
      return NextResponse.json(book);
    }

    // Cas 2: Filtrage par auteur (optionnel, sinon tous les livres)
    const where = authorId ? { authorId } : {};
    
    const books = await prisma.book.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: { author: { select: { name: true, image: true } } }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('[BOOKS_GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// POST: Créer un nouveau livre
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bookCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const newBook = await prisma.book.create({
      data: validation.data
    });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('[BOOKS_POST]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// PUT: Mise à jour complète
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bookUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { id, ...data } = validation.data;

    // Vérification existence
    const exists = await prisma.book.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 });

    const updatedBook = await prisma.book.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('[BOOKS_PUT]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

// PATCH: Mise à jour partielle
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bookPatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { id, ...data } = validation.data;

    const updatedBook = await prisma.book.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    // Gestion erreur Prisma si ID inexistant
    console.error('[BOOKS_PATCH]', error);
    return NextResponse.json({ error: 'Erreur mise à jour ou ID invalide' }, { status: 500 });
  }
}

// DELETE: Supprimer un livre
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = bookDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'ID requis dans le body' }, { status: 400 });
    }

    await prisma.book.delete({
      where: { id: validation.data.id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[BOOKS_DELETE]', error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
