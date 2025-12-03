// @/app/api/files/route.ts
/* ----------------------------------------------------------
  LISTE  /api/files
  POST   /api/files
---------------------------------------------------------- */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma"; // ← client custom
import { z } from "zod";

/* ---------- schémas ---------- */
const querySchema = z.object({
  parentId: z.string().uuid().nullish(),
  type:     z.enum(['FILE','FOLDER']).nullish(),
  category: z.string().nullish(),
  userId:   z.string().uuid().nullish(),
});

const createSchema = z.object({
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
  parentId: z.string().uuid().nullish(),
  userId:   z.string().uuid().nullish(),
});

/* ---------- helper ---------- */
function fileInclude() {
  return Prisma.validator<Prisma.FileInclude>()({
    parent:  { select: { id: true, name: true, slug: true, type: true } },
    children:{ select: { id: true, name: true, slug: true, type: true, order: true, category: true },
               orderBy: { order: 'asc' } },
    user:    { select: { id: true, name: true, email: true, image: true } },
  });
}

/* ---------- GET ---------- */
export async function GET(request: NextRequest) {
  console.log("🔍 GET /api/files - Début");
  try {
    const { searchParams } = new URL(request.url);
    const type      = searchParams.get('type') as 'FILE' | 'FOLDER' | null;
    const category  = searchParams.get('category');
    const parentId  = searchParams.get('parentId');
    const onlyPublic= searchParams.get('onlyPublic') === 'true';
    const slug      = searchParams.get('slug');

    console.log("📋 Filtres:", { type, category, parentId, onlyPublic, slug });

    const where: Prisma.FileWhereInput = {};
    if (type)      where.type     = type;
    if (category)  where.category = category;
    if (parentId)  where.parentId = parentId === 'null' ? null : parentId;
    if (slug)      where.slug     = slug;
    if (onlyPublic)where.isPublic = true;

    const files = await prisma.file.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: fileInclude(),
    });

    console.log(`✅ GET /api/files - ${files.length} fichiers trouvés`);
    return NextResponse.json(files);
  } catch (error) {
    console.error("❌ GET /api/files - Erreur:", error);
    return NextResponse.json({ error: "Erreur lors de la récupération des fichiers" }, { status: 500 });
  }
}

/* ---------- POST ---------- */
export async function POST(request: NextRequest) {
  console.log("📝 POST /api/files - Début");
  try {
    const body = await request.json();
    console.log("📦 Body reçu:", body);

    if (!body.name || !body.slug || !body.type) {
      console.log("❌ POST /api/files - Données manquantes");
      return NextResponse.json({ error: "Les champs 'name', 'slug' et 'type' sont requis" }, { status: 400 });
    }

    const existingFile = await prisma.file.findUnique({ where: { slug: body.slug } });
    if (existingFile) return NextResponse.json({ error: "Un fichier avec ce slug existe déjà" }, { status: 409 });

    if (body.parentId) {
      const parent = await prisma.file.findUnique({ where: { id: body.parentId } });
      if (!parent) return NextResponse.json({ error: "Le dossier parent spécifié n'existe pas" }, { status: 404 });
      if (parent.type !== 'FOLDER') return NextResponse.json({ error: "Le parent spécifié n'est pas un dossier" }, { status: 400 });
    }

    let order = body.order;
    if (order === undefined) {
      const lastFile = await prisma.file.findFirst({
        where: { parentId: body.parentId || null },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = lastFile ? lastFile.order + 1 : 0;
    }

    if (body.type === 'FOLDER') {
      body.content = null; body.url = null; body.mimeType = null; body.size = null;
    }

    let size = body.size;
    if (body.content && typeof body.content === 'string') size = Buffer.byteLength(body.content, 'utf8');

    const data: Prisma.FileCreateInput = {
      name:     body.name.trim(),
      slug:     body.slug,
      type:     body.type,
      category: body.category || null,
      content:  body.content || null,
      url:      body.url || null,
      role:     body.role || null,
      relation: body.relation || null,
      mimeType: body.mimeType || null,
      size:     size || null,
      isPublic: body.isPublic || false,
      order,
      metadata: body.metadata === null ? Prisma.DbNull : body.metadata as Prisma.InputJsonValue,
      parent:   body.parentId ? { connect: { id: body.parentId } } : undefined,
      user:     body.userId   ? { connect: { id: body.userId } }   : undefined,
    };

    const file = await prisma.file.create({ data, include: fileInclude() });
    console.log(`✅ POST /api/files - Fichier créé: ${file.id} (${file.type})`);
    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error("❌ POST /api/files - Erreur:", error);
    return NextResponse.json({ error: "Erreur lors de la création du fichier" }, { status: 500 });
  }
}