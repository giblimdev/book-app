/**
 * @file hooks/fetcher.ts
 * @type Utilitaire global
 * @role Fonction fetcher réutilisable pour SWR - gère les requêtes HTTP avec parsing JSON automatique et gestion d'erreurs unifiée.
 */

/**
 * Fetcher générique pour SWR
 * @param url - URL de l'endpoint API (relative ou absolue)
 * @returns Promise résolue avec les données JSON parsées
 * @throws Error si la réponse HTTP n'est pas OK (status !== 2xx)
 */
export async function fetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url);

  // Gestion des erreurs HTTP (4xx, 5xx)
  if (!res.ok) {
    let errorMessage = `Erreur API: ${res.status}`;
    
    try {
      // Tenter d'extraire un message d'erreur structuré du body
      const errorData = await res.json();
      errorMessage = errorData?.error || errorData?.message || errorMessage;
    } catch {
      // Si le parsing JSON échoue, garder le message par défaut
    }

    // Lance l'erreur pour que SWR la capture
    throw new Error(errorMessage);
  }

  // Parse et retourne le JSON
  return res.json();
}

export default fetcher;
