/** Vite base path, e.g. "/" or "/talk-to-god/" */
export const BASE_PATH = import.meta.env.BASE_URL;

/** Join API path under the app base, e.g. "/talk-to-god/api/philosophers" */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${BASE_PATH}${normalized}`;
}
