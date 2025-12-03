/**
 * @file lib/utils/date.ts
 * @type Bibliothèque utilitaire de gestion des dates
 * @role Fournir des fonctions réutilisables, robustes et localisées pour le formatage, 
 *       le calcul et l'affichage des dates dans toute l'application.
 */

import { 
  format, 
  formatDistance, 
  formatDistanceToNow,
  isToday as dateFnsIsToday,
  isYesterday as dateFnsIsYesterday,
  isSameDay as dateFnsIsSameDay,
  startOfDay as dateFnsStartOfDay,
  endOfDay as dateFnsEndOfDay,
  parseISO,
  isValid
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Type helper pour accepter différents formats de dates
type DateInput = Date | string | number | null | undefined;

/**
 * Convertit n'importe quelle entrée en Date valide ou retourne null
 */
export function safeDate(input: DateInput): Date | null {
  if (!input) return null;
  
  try {
    let date: Date;
    
    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'string') {
      date = parseISO(input);
    } else if (typeof input === 'number') {
      date = new Date(input);
    } else {
      return null;
    }
    
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Formate une date au format court français : 14/03/2025
 */
export function formatDate(input: DateInput): string {
  const date = safeDate(input);
  if (!date) return '---';
  
  try {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return '---';
  }
}

/**
 * Formate une date avec heure : 14/03/2025 à 15:30
 */
export function formatDateTime(input: DateInput): string {
  const date = safeDate(input);
  if (!date) return '---';
  
  try {
    return format(date, "dd/MM/yyyy 'à' HH:mm", { locale: fr });
  } catch {
    return '---';
  }
}

/**
 * Formate une date au format long : 14 mars 2025
 */
export function formatDateLong(input: DateInput): string {
  const date = safeDate(input);
  if (!date) return '---';
  
  try {
    return format(date, 'd MMMM yyyy', { locale: fr });
  } catch {
    return '---';
  }
}

/**
 * Formate une date de manière relative : "il y a 2 heures", "hier", "dans 3 jours"
 */
export function formatRelative(input: DateInput): string {
  const date = safeDate(input);
  if (!date) return 'Non définie';
  
  try {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: fr 
    });
  } catch {
    return 'Non définie';
  }
}

/**
 * Alias de formatRelative pour une API plus intuitive
 */
export function fromNow(input: DateInput): string {
  return formatRelative(input);
}

/**
 * Formate une distance entre deux dates de manière courte : "2j", "5h", "30min"
 */
export function formatDistanceShort(from: DateInput, to: DateInput = new Date()): string {
  const dateFrom = safeDate(from);
  const dateTo = safeDate(to);
  
  if (!dateFrom || !dateTo) return '---';
  
  try {
    const distance = formatDistance(dateFrom, dateTo, { locale: fr });
    
    // Simplification ultra-courte
    return distance
      .replace('environ ', '')
      .replace('moins de ', '<')
      .replace('plus de ', '>')
      .replace(' minutes', 'min')
      .replace(' minute', 'min')
      .replace(' heures', 'h')
      .replace(' heure', 'h')
      .replace(' jours', 'j')
      .replace(' jour', 'j')
      .replace(' mois', 'm')
      .replace(' ans', 'a')
      .replace(' an', 'a');
  } catch {
    return '---';
  }
}

/**
 * Vérifie si une date est aujourd'hui
 */
export function isToday(input: DateInput): boolean {
  const date = safeDate(input);
  if (!date) return false;
  return dateFnsIsToday(date);
}

/**
 * Vérifie si une date est hier
 */
export function isYesterday(input: DateInput): boolean {
  const date = safeDate(input);
  if (!date) return false;
  return dateFnsIsYesterday(date);
}

/**
 * Vérifie si deux dates sont le même jour
 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  const d1 = safeDate(date1);
  const d2 = safeDate(date2);
  if (!d1 || !d2) return false;
  return dateFnsIsSameDay(d1, d2);
}

/**
 * Retourne le début de journée (00:00:00) pour une date
 */
export function startOfDay(input: DateInput): Date | null {
  const date = safeDate(input);
  if (!date) return null;
  return dateFnsStartOfDay(date);
}

/**
 * Retourne la fin de journée (23:59:59) pour une date
 */
export function endOfDay(input: DateInput): Date | null {
  const date = safeDate(input);
  if (!date) return null;
  return dateFnsEndOfDay(date);
}

/**
 * Formate une date au format ISO pour les inputs HTML : YYYY-MM-DD
 */
export function toISODate(input: DateInput): string {
  const date = safeDate(input);
  if (!date) return '';
  
  try {
    return format(date, 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

/**
 * Formate une date au format ISO complet pour les API : 2025-03-14T15:30:00.000Z
 */
export function toISOString(input: DateInput): string | null {
  const date = safeDate(input);
  if (!date) return null;
  
  try {
    return date.toISOString();
  } catch {
    return null;
  }
}
