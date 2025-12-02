// @/app/api/files/[fileId]/route.ts
/*
GET	/api/files/[fileId]	Charger le file spécifique [fileId]
PUT	/api/files/[fileId]	Mettre à jour un fichier
PATCH	/api/files/[fileId]	Changer order
DELETE	/api/files/[fileId]	Supprimer un fichier
*/

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/files/[fileId] - Récupère un fichier spécifique
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const { params } = context;
  const { fileId } = await params;
  console.log(`🔍 GET /api/files/${fileId} - Début`);
  
  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
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
            category: true,
          },
          orderBy: { order: 'asc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    if (!file) {
      console.log(`❌ GET /api/files/${fileId} - Fichier non trouvé`);
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    console.log(`✅ GET /api/files/${fileId} - Fichier trouvé`);
    return NextResponse.json(file);
    
  } catch (error) {
    console.error(`❌ GET /api/files/${fileId} - Erreur:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du fichier" },
      { status: 500 }
    );
  }
}

// PUT /api/files/[fileId] - Met à jour complètement un fichier
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const { params } = context;
  const { fileId } = await params;
  console.log(`📝 PUT /api/files/${fileId} - Début`);
  
  try {
    const body = await request.json();
    console.log("📦 Body reçu:", body);
    
    // Vérifier si le fichier existe
    const existingFile = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!existingFile) {
      console.log(`❌ PUT /api/files/${fileId} - Fichier non trouvé`);
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // Vérification des données requises pour PUT (remplacement complet)
    if (!body.name || !body.slug || !body.type) {
      return NextResponse.json(
        { error: "Les champs 'name', 'slug' et 'type' sont requis pour PUT" },
        { status: 400 }
      );
    }

    // Vérifier l'unicité du slug si modifié
    if (body.slug !== existingFile.slug) {
      const slugExists = await prisma.file.findUnique({
        where: { slug: body.slug }
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Un fichier avec ce slug existe déjà" },
          { status: 409 }
        );
      }
    }

    // Si parentId est fourni, vérifier le parent
    if (body.parentId !== undefined && body.parentId !== existingFile.parentId) {
      if (body.parentId === fileId) {
        return NextResponse.json(
          { error: "Un fichier ne peut pas être son propre parent" },
          { status: 400 }
        );
      }

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
    }

    // Si c'est un dossier, certains champs doivent être null
    if (body.type === 'FOLDER') {
      body.content = null;
      body.url = null;
      body.mimeType = null;
      body.size = null;
    }

    // Si le contenu est fourni, calculer la taille
    let size = body.size;
    if (body.content && typeof body.content === 'string') {
      size = Buffer.byteLength(body.content, 'utf8');
    }

    // Préparer les données de mise à jour
    const updateData: Prisma.FileUpdateInput = {
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
      isPublic: body.isPublic !== undefined ? body.isPublic : existingFile.isPublic,
      order: body.order !== undefined ? parseInt(body.order.toString()) : existingFile.order,
      metadata: body.metadata || Prisma.DbNull,
    };

    // Gérer la relation parent
    if (body.parentId !== undefined) {
      if (body.parentId) {
        // Connecter à un parent existant
        updateData.parent = { connect: { id: body.parentId } };
      } else {
        // Déconnecter le parent (mettre à null)
        updateData.parent = { disconnect: true };
      }
    }

    // Gérer la relation user
    if (body.userId !== undefined) {
      if (body.userId) {
        // Connecter à un utilisateur existant
        updateData.user = { connect: { id: body.userId } };
      } else {
        // Déconnecter l'utilisateur (mettre à null)
        updateData.user = { disconnect: true };
      }
    }

    // Mettre à jour le fichier (remplacement complet)
    const file = await prisma.file.update({
      where: { id: fileId },
      data: updateData,
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
            image: true
          }
        }
      }
    });

    console.log(`✅ PUT /api/files/${fileId} - Fichier mis à jour`);
    return NextResponse.json(file);
    
  } catch (error: unknown) {
    console.error(`❌ PUT /api/files/${fileId} - Erreur:`, error);
    
    // Gérer les erreurs Prisma spécifiques
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
      { error: "Erreur lors de la mise à jour du fichier" },
      { status: 500 }
    );
  }
}

// PATCH /api/files/[fileId] - Met à jour uniquement l'ordre
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const { params } = context;
  const { fileId } = await params;
  console.log(`🔄 PATCH /api/files/${fileId} - Début`);
  
  try {
    const body = await request.json();
    console.log("📦 Body reçu:", body);
    
    // Vérifier si le fichier existe
    const existingFile = await prisma.file.findUnique({
      where: { id: fileId }
    });

    if (!existingFile) {
      console.log(`❌ PATCH /api/files/${fileId} - Fichier non trouvé`);
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'ordre est fourni
    if (body.order === undefined) {
      return NextResponse.json(
        { error: "Le champ 'order' est requis pour PATCH" },
        { status: 400 }
      );
    }

    // Valider que l'ordre est un nombre
    const newOrder = parseInt(body.order.toString());
    if (isNaN(newOrder)) {
      return NextResponse.json(
        { error: "L'ordre doit être un nombre valide" },
        { status: 400 }
      );
    }

    // Préparer les données de mise à jour - seulement l'ordre
    const updateData: Prisma.FileUpdateInput = {
      order: newOrder
    };

    // Mettre à jour le fichier
    const file = await prisma.file.update({
      where: { id: fileId },
      data: updateData,
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
            image: true
          }
        }
      }
    });

    console.log(`✅ PATCH /api/files/${fileId} - Ordre mis à jour: ${newOrder}`);
    return NextResponse.json(file);
    
  } catch (error: unknown) {
    console.error(`❌ PATCH /api/files/${fileId} - Erreur:`, error);
    
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'ordre" },
      { status: 500 }
    );
  }
}

// DELETE /api/files/[fileId] - Supprime un fichier
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const { params } = context;
  const { fileId } = await params;
  console.log(`🗑️ DELETE /api/files/${fileId} - Début`);
  
  try {
    // Vérifier si le fichier existe
    const existingFile = await prisma.file.findUnique({
      where: { id: fileId },
      include: { 
        children: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      }
    });

    if (!existingFile) {
      console.log(`❌ DELETE /api/files/${fileId} - Fichier non trouvé`);
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le dossier contient des enfants
    if (existingFile.type === "FOLDER" && existingFile.children && existingFile.children.length > 0) {
      console.log(`⚠️ DELETE /api/files/${fileId} - Dossier non vide`);
      return NextResponse.json(
        { 
          error: "Le dossier n'est pas vide. Veuillez d'abord supprimer son contenu.",
          children: existingFile.children
        },
        { status: 400 }
      );
    }

    // Supprimer le fichier
    await prisma.file.delete({
      where: { id: fileId }
    });

    console.log(`✅ DELETE /api/files/${fileId} - Fichier supprimé`);
    return NextResponse.json({ 
      success: true,
      message: "Fichier supprimé avec succès"
    });
    
  } catch (error) {
    console.error(`❌ DELETE /api/files/${fileId} - Erreur:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du fichier" },
      { status: 500 }
    );
  }
}