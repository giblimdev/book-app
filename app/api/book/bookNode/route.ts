/**
 * @file app/api/book/bookNode/route.ts
 * @type Route API Next.js (App Router)
 * @role CRUD complet pour les BookNode (Chapitres/Sections)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Schémas Zod locaux (à déplacer si besoin dans lib/validators/bookNodeSchema.ts)
const nodeCreateSchema = z.object({
  title: z.string().min(1),
  bookId: z.string().cuid(),
  parentId: z.string().cuid().nullable().optional(),
  type: z.enum(['PART', 'CHAPTER', 'SECTION', 'SUBSECTION', 'ARTICLE']).default('CHAPTER'),
  order: z.number().int().min(0).default(0),
  description: z.string().optional(),
});

const nodePatchSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).optional(),
  type: z.string().optional(),
  order: z.number().int().optional(),
  parentId: z.string().cuid().nullable().optional(),
  description: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bookId = searchParams.get('bookId');
  const id = searchParams.get('id');

  try {
    if (id) {
      const node = await prisma.bookNode.findUnique({ where: { id } });
      if (!node) return NextResponse.json({ error: 'Nœud non trouvé' }, { status: 404 });
      return NextResponse.json(node);
    }

    if (!bookId) {
      return NextResponse.json({ error: 'bookId est requis' }, { status: 400 });
    }

    // Récupérer tous les nœuds du livre triés par ordre
    const nodes = await prisma.bookNode.findMany({
      where: { bookId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(nodes);
  } catch (error) {
    console.error('[NODES_GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = nodeCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const newNode = await prisma.bookNode.create({
      data: validation.data
    });

    return NextResponse.json(newNode, { status: 201 });
  } catch (error) {
    console.error('[NODES_POST]', error);
    return NextResponse.json({ error: 'Erreur création' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = nodePatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { id, ...data } = validation.data;

    const updatedNode = await prisma.bookNode.update({
      where: { id },
      data
    });

    return NextResponse.json(updatedNode);
  } catch (error) {
    console.error('[NODES_PATCH]', error);
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    // Suppression en cascade gérée par Prisma (onDelete: Cascade)
    await prisma.bookNode.delete({
      where: { id: body.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[NODES_DELETE]', error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
