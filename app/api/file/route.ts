
// @/app/api/files/route.ts
/*
GET	/api/files	Charger tous les files
POST	/api/files	Créer un nouveau file (fichier/dossier)
*/


// @/app/api/files/route.ts
/*
GET	/api/files	Charger tous les files
POST	/api/files	Créer un nouveau file (fichier/dossier)
*/

// @/app/api/files/route.ts
/*
GET	/api/files	Charger tous les files
POST	/api/files	Créer un nouveau file (fichier/dossier)
*/
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/files - Récupère tous les fichiers avec filtres
export async function GET(request: NextRequest) {
  console.log("🔍 GET /api/files - Début");
  
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'FILE' | 'FOLDER' | null;
    const category = searchParams.get('category');
    const parentId = searchParams.get('parentId');
    const includeChildren = searchParams.get('includeChildren') === 'true';
    const onlyPublic = searchParams.get('onlyPublic') === 'true';
    const slug = searchParams.get('slug');

    console.log("📋 Filtres:", { type, category, parentId, onlyPublic, slug });

    // Construire les conditions de filtre avec un type spécifique
    const where: Prisma.FileWhereInput = {};

    // Appliquer les filtres optionnels
    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (parentId) {
      where.parentId = parentId === 'null' ? null : parentId;
    }

    if (slug) {
      where.slug = slug;
    }

    if (onlyPublic) {
      where.isPublic = true;
    }

    // Pour l'authentification, vous devrez ajouter cela plus tard
    // const session = await getServerSession(authOptions);
    // if (session?.user?.email) {
    //   where.OR = [
    //     { isPublic: true },
    //     { user: { email: session.user.email } },
    //     { userId: null }
    //   ];
    // }

    const files = await prisma.file.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        children: includeChildren ? {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            category: true,
            order: true,
            isPublic: true,
            createdAt: true,
          },
          orderBy: {
            order: 'asc'
          }
        } : false,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    console.log(`✅ GET /api/files - ${files.length} fichiers trouvés`);
    return NextResponse.json(files);
    
  } catch (error) {
    console.error("❌ GET /api/files - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des fichiers" },
      { status: 500 }
    );
  }
}
 
// POST /api/files - Crée un nouveau fichier/dossier
export async function POST(request: NextRequest) {
  console.log("📝 POST /api/files - Début");
  
  try {
    const body = await request.json();
    console.log("📦 Body reçu:", body);
    
    // Validation des données requises
    if (!body.name || !body.slug || !body.type) {
      console.log("❌ POST /api/files - Données manquantes");
      return NextResponse.json(
        { error: "Les champs 'name', 'slug' et 'type' sont requis" },
        { status: 400 }
      );
    }

    // Vérifier l'unicité du slug
    const existingFile = await prisma.file.findUnique({
      where: { slug: body.slug }
    });

    if (existingFile) {
      return NextResponse.json(
        { error: "Un fichier avec ce slug existe déjà" },
        { status: 409 }
      );
    }

    // Si parentId est fourni, vérifier que le parent existe
    if (body.parentId) {
      const parent = await prisma.file.findUnique({
        where: { id: body.parentId }
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Le dossier parent spécifié n'existe pas" },
          { status: 404 }
        );
      }

      if (parent.type !== 'FOLDER') {
        return NextResponse.json(
          { error: "Le parent spécifié n'est pas un dossier" },
          { status: 400 }
        );
      }
    }

    // Calculer l'ordre si non fourni
    let order = body.order;
    if (order === undefined) {
      const lastFile = await prisma.file.findFirst({
        where: { parentId: body.parentId || null },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      order = lastFile ? lastFile.order + 1 : 0;
    }

    // Si c'est un dossier, certains champs ne sont pas applicables
    if (body.type === 'FOLDER') {
      body.content = null;
      body.url = null;
      body.mimeType = null;
      body.size = null;
    }

    // Si c'est un fichier avec content, calculer la taille
    let size = body.size;
    if (body.content && typeof body.content === 'string') {
      size = Buffer.byteLength(body.content, 'utf8');
    }

    // Pour l'authentification, vous devrez ajouter cela plus tard
    // const session = await getServerSession(authOptions);
    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email }
    // });
    // const userId = user?.id;

    // Créer le fichier
    const file = await prisma.file.create({
      data: {
        name: body.name.trim(),
        slug: body.slug,
        type: body.type,
        category: body.category || null,
        content: body.content || null,
        url: body.url || null,
        role: body.role || null,
        relation: body.relation || null,
        mimeType: body.mimeType || null,
        size: size || null,
        isPublic: body.isPublic || false,
        parentId: body.parentId || null,
        userId: body.userId || null, // À remplir par l'authentification plus tard
        order: order,
        metadata: body.metadata || {},
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            order: true,
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    console.log(`✅ POST /api/files - Fichier créé: ${file.id} (${file.type})`);
    return NextResponse.json(file, { status: 201 });
    
  } catch (error: unknown) {  // <-- Correction ici: remplacé "any" par "unknown"
    console.error("❌ POST /api/files - Erreur:", error);
    
    // Gérer les erreurs Prisma spécifiques
    // Type guard pour vérifier si c'est une erreur Prisma
    if (error instanceof Error && 'code' in error) {
      const prismaError = error as { code?: string };
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { error: "Un fichier avec ce slug existe déjà" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la création du fichier" },
      { status: 500 }
    );
  }
}