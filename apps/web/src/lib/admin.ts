const ADMIN_KEY = "talk-to-god-admin-key";

export function getAdminKey(): string | null {
  return sessionStorage.getItem(ADMIN_KEY);
}

export function setAdminKey(key: string) {
  sessionStorage.setItem(ADMIN_KEY, key);
}

export function clearAdminKey() {
  sessionStorage.removeItem(ADMIN_KEY);
}
