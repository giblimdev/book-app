/**
 * @file app/api/book/bookNode/reorder/route.ts
 * @role Réordonnancement par lot (Batch Reorder)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const reorderSchema = z.object({
  bookId: z.string().cuid(),
  nodes: z.array(z.object({
    id: z.string().cuid(),
    order: z.number().int().min(0)
  })).min(1)
});

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = reorderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { bookId, nodes } = validation.data;

    // Transaction pour intégrité : mise à jour de tous les ordres en une fois
    const updates = nodes.map(({ id, order }) => 
      prisma.bookNode.update({
        where: { id, bookId }, // Sécurité: vérifie que le node appartient bien au livre
        data: { order }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, count: nodes.length });
  } catch (error) {
    console.error('[REORDER_PATCH]', error);
    return NextResponse.json({ error: 'Erreur réordonnancement' }, { status: 500 });
  }
}
