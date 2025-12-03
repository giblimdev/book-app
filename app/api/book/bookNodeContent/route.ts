//@/app/api/book/bookNodeContent
/**
 * @file app/api/book/bookNodeContent/route.ts
 * @type Route API Next.js (App Router)
 * @role CRUD complet pour les NodeContent (Blocs de contenu)
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';
import { 
  nodeContentCreateSchema, 
  nodeContentPatchSchema, 
  nodeContentDeleteSchema 
} from '@/lib/validators/nodeContentSchema';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nodeId = searchParams.get('nodeId');
  const id = searchParams.get('id');

  try {
    if (id) {
      const content = await prisma.nodeContent.findUnique({ where: { id } });
      if (!content) return NextResponse.json({ error: 'Contenu non trouvé' }, { status: 404 });
      return NextResponse.json(content);
    }

    if (!nodeId) {
      return NextResponse.json({ error: 'nodeId est requis' }, { status: 400 });
    }

    const contents = await prisma.nodeContent.findMany({
      where: { nodeId },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error('[CONTENTS_GET]', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = nodeContentCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    // 1. Séparer metadata pour traitement spécial
    const { metadata, ...rest } = validation.data;

    // 2. Convertir null/undefined en Prisma.DbNull
    const metadataInput = (metadata === null || metadata === undefined) 
      ? Prisma.DbNull 
      : (metadata as Prisma.InputJsonValue);

    // 3. Créer avec le type compatible
    const newContent = await prisma.nodeContent.create({
      data: {
        ...rest,
        metadata: metadataInput,
      }
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('[CONTENTS_POST]', error);
    return NextResponse.json({ error: 'Erreur création' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = nodeContentPatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { id, metadata, ...rest } = validation.data;
    
    // 1. Préparer l'objet d'update avec le bon type Prisma
    const updateData: Prisma.NodeContentUpdateInput = {
      ...rest,
    };

    // 2. Assigner metadata seulement si présent dans la requête
    if (metadata !== undefined) {
      updateData.metadata = (metadata === null) 
        ? Prisma.DbNull 
        : (metadata as Prisma.InputJsonValue);
    }

    const updatedContent = await prisma.nodeContent.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('[CONTENTS_PATCH]', error);
    return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = nodeContentDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await prisma.nodeContent.delete({
      where: { id: validation.data.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONTENTS_DELETE]', error);
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
  }
}
