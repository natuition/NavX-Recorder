/**
 * Génère l'URL complète d'un asset en tenant compte de VITE_BASE_URL.
 * Compatible chemins absolus, relatifs et URLs externes.
 */
export const urlFor = (path?: string | null): string | undefined => {
  const base = import.meta.env.VITE_BASE_URL || "/";

  if (!path) return path ?? undefined;

  // URL externe → on retourne tel quel
  if (/^(https?:)?\/\//.test(path)) return path;

  // Supprime slash final de la base
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;

  // Supprime ./ ou / initial du path
  const cleanPath = path.replace(/^(\.\/|\/)+/, "");

  // Concatène proprement
  return `${cleanBase}/${cleanPath}`;
}

