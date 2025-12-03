// @/app/api/files/[fileId]/route.ts
/*
GET    /api/files/[fileId]  → récupérer un fichier
PUT    /api/files/[fileId]  → remplacement complet
PATCH  /api/files/[fileId]  → changer l’ordre
DELETE /api/files/[fileId]  → supprimer
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma';   // client custom
import { z } from 'zod';

/* ---------- schemas de validation ---------- */
const putSchema = z.object({
  name:     z.string().min(1).trim(),
  slug:     z.string().min(1),
  type:     z.enum(['FILE','FOLDER']),
  category: z.string().nullish(),
  content:  z.string().nullish(),
  url:      z.string().nullish(),
  role:     z.string().nullish(),
  relation: z.string().nullish(),
  mimeType: z.string().nullish(),
  size:     z.number().int().min(0).nullish(),
  isPublic: z.boolean().nullish(),
  order:    z.number().int().min(0).nullish(),
  metadata: z.unknown().nullish(),
  parentId: z.string().nullish(),
  userId:   z.string().nullish(),
});

const patchSchema = z.object({
  order: z.number().int().min(0),
});

/* ---------- helpers ---------- */
function fileInclude() {
  return Prisma.validator<Prisma.FileInclude>()({
    parent:  { select: { id: true, name: true, slug: true, type: true } },
    children:{ select: { id: true, name: true, slug: true, type: true, order: true, category: true },
               orderBy: { order: 'asc' } },
    user:    { select: { id: true, name: true, email: true, image: true } },
  });
}

/* ---------- GET ---------- */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const file = await prisma.file.findUnique({ where: { id: fileId }, include: fileInclude() });
  if (!file) return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
  return NextResponse.json(file);
}

/* ---------- PUT ---------- */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const body = putSchema.parse(await req.json());

  const existing = await prisma.file.findUnique({ where: { id: fileId } });
  if (!existing) return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });

  /* slug unique */
  if (body.slug !== existing.slug) {
    const dup = await prisma.file.findUnique({ where: { slug: body.slug } });
    if (dup) return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
  }

  /* parent */
  if (body.parentId !== undefined) {
    if (body.parentId === fileId) return NextResponse.json({ error: 'Un fichier ne peut pas être son propre parent' }, { status: 400 });
    if (body.parentId) {
      const parent = await prisma.file.findUnique({ where: { id: body.parentId } });
      if (!parent) return NextResponse.json({ error: 'Parent inexistant' }, { status: 404 });
      if (parent.type !== 'FOLDER') return NextResponse.json({ error: 'Le parent doit être un dossier' }, { status: 400 });
    }
  }

  /* dossier → pas de contenu/url/mime/size */
  if (body.type === 'FOLDER') {
    body.content = null; body.url = null; body.mimeType = null; body.size = null;
  }

  /* taille automatique si content fourni */
  let size = body.size;
  if (body.content) size = Buffer.byteLength(body.content, 'utf8');

  const data: Prisma.FileUpdateInput = {
    name: body.name,
    slug: body.slug,
    type: body.type,
    category: body.category ?? null,
    content: body.content ?? null,
    url: body.url ?? null,
    role: body.role ?? null,
    relation: body.relation ?? null,
    mimeType: body.mimeType ?? null,
    size,
    isPublic: body.isPublic ?? existing.isPublic,
    order: body.order ?? existing.order,
    /* 🔽 metadata corrigé 🔽 */
    metadata:
      body.metadata === null
        ? Prisma.DbNull
        : (body.metadata ?? existing.metadata) as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput,
    parent: body.parentId === undefined ? undefined
            : body.parentId ? { connect: { id: body.parentId } }
            : { disconnect: true },
    user: body.userId === undefined ? undefined
          : body.userId ? { connect: { id: body.userId } }
          : { disconnect: true },
  };

  const updated = await prisma.file.update({ where: { id: fileId }, data, include: fileInclude() });
  return NextResponse.json(updated);
}

/* ---------- PATCH (ordre uniquement) ---------- */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const { order } = patchSchema.parse(await req.json());

  const existing = await prisma.file.findUnique({ where: { id: fileId } });
  if (!existing) return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });

  const updated = await prisma.file.update({
    where: { id: fileId },
    data: { order },
    include: fileInclude(),
  });
  return NextResponse.json(updated);
}

/* ---------- DELETE ---------- */
export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const existing = await prisma.file.findUnique({
    where: { id: fileId },
    include: { children: { select: { id: true } } },
  });
  if (!existing) return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
  if (existing.type === 'FOLDER' && existing.children.length > 0) {
    return NextResponse.json({ error: 'Dossier non vide' }, { status: 400 });
  }

  await prisma.file.delete({ where: { id: fileId } });
  return NextResponse.json({ success: true });
}