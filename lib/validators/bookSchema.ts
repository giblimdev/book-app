/**
 * @file lib/validators/bookSchema.ts
 * @type Schémas de validation Zod pour Book
 * @role Valider toutes les données liées aux livres (création, mise à jour, recherche)
 */

import { z } from 'zod';

/**
 * Schéma de base pour un Book (tous les champs possibles)
 */
export const bookSchema = z.object({
  id: z.string().cuid().optional(),
  title: z.string()
    .min(1, 'Le titre est obligatoire')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères')
    .trim(),
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim()
    .optional()
    .nullable(),
  image: z.string()
    .url('L\'URL de l\'image doit être valide')
    .optional()
    .nullable(),
  order: z.number()
    .int('L\'ordre doit être un nombre entier')
    .min(0, 'L\'ordre doit être positif ou nul')
    .default(0),
  authorId: z.string().cuid('ID auteur invalide'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schéma pour la CRÉATION d'un livre (POST)
 * Seuls les champs obligatoires + optionnels utilisateur
 */
export const bookCreateSchema = z.object({
  title: z.string()
    .min(1, 'Le titre est obligatoire')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères')
    .trim(),
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim()
    .optional()
    .nullable(),
  image: z.string()
    .url('L\'URL de l\'image doit être valide')
    .optional()
    .nullable(),
  order: z.number()
    .int()
    .min(0)
    .default(0)
    .optional(),
  authorId: z.string().cuid('ID auteur invalide'),
});

/**
 * Schéma pour la MISE À JOUR complète d'un livre (PUT)
 * Tous les champs obligatoires sauf timestamps
 */
export const bookUpdateSchema = z.object({
  id: z.string().cuid('ID invalide'),
  title: z.string()
    .min(1, 'Le titre est obligatoire')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères')
    .trim(),
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim()
    .optional()
    .nullable(),
  image: z.string()
    .url('L\'URL de l\'image doit être valide')
    .optional()
    .nullable(),
  order: z.number()
    .int()
    .min(0)
    .default(0),
  authorId: z.string().cuid('ID auteur invalide'),
});

/**
 * Schéma pour la MISE À JOUR PARTIELLE d'un livre (PATCH)
 * Tous les champs sont optionnels sauf l'ID
 */
export const bookPatchSchema = z.object({
  id: z.string().cuid('ID invalide'),
  title: z.string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(255, 'Le titre ne peut pas dépasser 255 caractères')
    .trim()
    .optional(),
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim()
    .optional()
    .nullable(),
  image: z.string()
    .url('L\'URL de l\'image doit être valide')
    .optional()
    .nullable(),
  order: z.number()
    .int()
    .min(0)
    .optional(),
}).strict(); // Refuse les champs non définis

/**
 * Schéma pour la SUPPRESSION d'un livre (DELETE)
 */
export const bookDeleteSchema = z.object({
  id: z.string().cuid('ID invalide'),
});

/**
 * Schéma pour la requête GET d'un livre unique
 */
export const bookGetByIdSchema = z.object({
  id: z.string().cuid('ID invalide'),
});

/**
 * Schéma pour la requête GET de tous les livres d'un auteur
 */
export const bookGetByAuthorSchema = z.object({
  authorId: z.string().cuid('ID auteur invalide'),
});

/**
 * Types TypeScript inférés depuis les schémas
 */
export type Book = z.infer<typeof bookSchema>;
export type BookCreate = z.infer<typeof bookCreateSchema>;
export type BookUpdate = z.infer<typeof bookUpdateSchema>;
export type BookPatch = z.infer<typeof bookPatchSchema>;
export type BookDelete = z.infer<typeof bookDeleteSchema>;
