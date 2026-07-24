import type { PhilosopherAdmin, UserAdmin, UserAdminUpdate } from "@talk-to-god/shared";
import { getAdminKey, clearAdminKey } from "./admin";
import { apiUrl } from "./paths";

function adminHeaders(): Record<string, string> {
  const key = getAdminKey();
  return {
    "Content-Type": "application/json",
    ...(key ? { "X-Admin-Key": key } : {}),
  };
}

async function parseError(res: Response, fallback: string): Promise<never> {
  const err = await res.json().catch(() => ({ error: fallback }));
  if (res.status === 401) clearAdminKey();
  throw new Error(err.error || fallback);
}

export async function verifyAdminKey(key: string): Promise<boolean> {
  const res = await fetch(apiUrl("/api/admin/philosophers"), {
    headers: { "X-Admin-Key": key },
  });
  return res.ok;
}

export async function fetchAdminPhilosophers(): Promise<PhilosopherAdmin[]> {
  const res = await fetch(apiUrl("/api/admin/philosophers"), { headers: adminHeaders() });
  if (!res.ok) await parseError(res, "获取列表失败");
  return res.json();
}

export async function fetchAdminPhilosopher(id: string): Promise<PhilosopherAdmin> {
  const res = await fetch(apiUrl(`/api/admin/philosophers/${id}`), { headers: adminHeaders() });
  if (!res.ok) await parseError(res, "获取详情失败");
  return res.json();
}

export async function createAdminPhilosopher(data: PhilosopherAdmin): Promise<PhilosopherAdmin> {
  const res = await fetch(apiUrl("/api/admin/philosophers"), {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res, "创建失败");
  return res.json();
}

export async function updateAdminPhilosopher(
  id: string,
  data: PhilosopherAdmin
): Promise<PhilosopherAdmin> {
  const res = await fetch(apiUrl(`/api/admin/philosophers/${id}`), {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res, "更新失败");
  return res.json();
}

export async function deleteAdminPhilosopher(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/philosophers/${id}`), {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) await parseError(res, "删除失败");
}

export async function fetchAdminUsers(): Promise<UserAdmin[]> {
  const res = await fetch(apiUrl("/api/admin/users"), { headers: adminHeaders() });
  if (!res.ok) await parseError(res, "获取用户列表失败");
  return res.json();
}

export async function fetchAdminUser(id: string): Promise<UserAdmin> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), { headers: adminHeaders() });
  if (!res.ok) await parseError(res, "获取用户详情失败");
  return res.json();
}

export async function updateAdminUser(id: string, data: UserAdminUpdate): Promise<UserAdmin> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) await parseError(res, "更新失败");
  return res.json();
}

export async function deleteAdminUser(id: string): Promise<void> {
  const res = await fetch(apiUrl(`/api/admin/users/${id}`), {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) await parseError(res, "删除失败");
}
