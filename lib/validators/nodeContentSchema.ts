/**
 * @file lib/validators/nodeContentSchema.ts
 * @type Schémas de validation Zod pour NodeContent
 * @role Valider tous les blocs de contenu avec gestion dynamique selon le type
 */

import { z } from 'zod';

/**
 * Enum des types de contenu supportés (synchronisé avec Prisma schema)
 */
export const ContentType = z.enum([
  'TEXT',
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'CODE',
  'QUOTE',
  'WARNING',
  'INFO',
  'TIP',
  'QUESTION',
  'EXERCISE',
  'SOLUTION',
  'TABLE',
  'LIST',
]);

export type ContentTypeEnum = z.infer<typeof ContentType>;

/**
 * Schéma des métadonnées selon le type de contenu
 */
export const contentMetadataSchema = z.object({
  // Pour CODE
  language: z.string().optional(),
  fileName: z.string().optional(),
  lineNumbers: z.boolean().optional(),
  
  // Pour IMAGE/VIDEO/AUDIO
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  
  // Pour TABLE
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
  
  // Pour LIST
  items: z.array(z.string()).optional(),
  ordered: z.boolean().optional(),
  
  // Pour EXERCISE/SOLUTION
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  points: z.number().optional(),
  
  // Champs génériques
  style: z.string().optional(),
  className: z.string().optional(),
}).passthrough(); // Accepte les champs supplémentaires

/**
 * Schéma de base pour un NodeContent (tous les champs possibles)
 */
export const nodeContentSchema = z.object({
  id: z.string().cuid().optional(),
  order: z.number()
    .int('L\'ordre doit être un nombre entier')
    .min(0, 'L\'ordre doit être positif ou nul')
    .default(0),
  type: ContentType.default('TEXT'),
  content: z.string()
    .max(50000, 'Le contenu ne peut pas dépasser 50000 caractères')
    .default('a rédiger'),
  metadata: contentMetadataSchema.optional().nullable(),
  imageId: z.string().cuid('ID image invalide').optional().nullable(),
  nodeId: z.string().cuid('ID nœud invalide'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schéma pour la CRÉATION d'un bloc de contenu (POST)
 */
export const nodeContentCreateSchema = z.object({
  order: z.number()
    .int()
    .min(0)
    .default(0)
    .optional(),
  type: ContentType.default('TEXT'),
  content: z.string()
    .max(50000, 'Le contenu ne peut pas dépasser 50000 caractères')
    .default('a rédiger'),
  metadata: contentMetadataSchema.optional().nullable(),
  imageId: z.string().cuid('ID image invalide').optional().nullable(),
  nodeId: z.string().cuid('ID nœud invalide'),
}).refine((data) => {
  // Validation contextuelle selon le type
  if (data.type === 'CODE' && !data.content) {
    return false;
  }
  if (data.type === 'IMAGE' && !data.imageId && !data.content) {
    return false;
  }
  return true;
}, {
  message: 'Le contenu doit être fourni selon le type',
});

/**
 * Schéma pour la MISE À JOUR complète d'un contenu (PUT)
 */
export const nodeContentUpdateSchema = z.object({
  id: z.string().cuid('ID invalide'),
  order: z.number()
    .int()
    .min(0)
    .default(0),
  type: ContentType,
  content: z.string()
    .max(50000, 'Le contenu ne peut pas dépasser 50000 caractères'),
  metadata: contentMetadataSchema.optional().nullable(),
  imageId: z.string().cuid('ID image invalide').optional().nullable(),
  nodeId: z.string().cuid('ID nœud invalide'),
});

/**
 * Schéma pour la MISE À JOUR PARTIELLE d'un contenu (PATCH)
 */
export const nodeContentPatchSchema = z.object({
  id: z.string().cuid('ID invalide'),
  order: z.number()
    .int()
    .min(0)
    .optional(),
  type: ContentType.optional(),
  content: z.string()
    .max(50000, 'Le contenu ne peut pas dépasser 50000 caractères')
    .optional(),
  metadata: contentMetadataSchema.optional().nullable(),
  imageId: z.string().cuid('ID image invalide').optional().nullable(),
}).strict();

/**
 * Schéma pour la SUPPRESSION d'un contenu (DELETE)
 */
export const nodeContentDeleteSchema = z.object({
  id: z.string().cuid('ID invalide'),
});

/**
 * Schéma pour la requête GET de tous les contenus d'un nœud
 */
export const nodeContentGetByNodeSchema = z.object({
  nodeId: z.string().cuid('ID nœud invalide'),
});

/**
 * Schéma pour le réordonnancement par lot (drag & drop)
 */
export const nodeContentReorderSchema = z.object({
  nodeId: z.string().cuid('ID nœud invalide'),
  contents: z.array(
    z.object({
      id: z.string().cuid('ID invalide'),
      order: z.number().int().min(0),
    })
  ).min(1, 'Au moins un contenu doit être fourni'),
}).refine((data) => {
  // Vérifier que les ordres sont uniques
  const orders = data.contents.map(c => c.order);
  return new Set(orders).size === orders.length;
}, {
  message: 'Les ordres doivent être uniques',
});

/**
 * Types TypeScript inférés depuis les schémas
 */
export type NodeContent = z.infer<typeof nodeContentSchema>;
export type NodeContentCreate = z.infer<typeof nodeContentCreateSchema>;
export type NodeContentUpdate = z.infer<typeof nodeContentUpdateSchema>;
export type NodeContentPatch = z.infer<typeof nodeContentPatchSchema>;
export type NodeContentDelete = z.infer<typeof nodeContentDeleteSchema>;
export type NodeContentReorder = z.infer<typeof nodeContentReorderSchema>;
export type ContentMetadata = z.infer<typeof contentMetadataSchema>;
