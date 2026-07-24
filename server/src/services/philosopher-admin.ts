import type { PhilosopherInput } from "@talk-to-god/shared";
import type { DbPhilosopher } from "./philosopher.js";
import { mapPhilosopher } from "./philosopher.js";

export function mapPhilosopherAdmin(row: DbPhilosopher) {
  const base = mapPhilosopher(row, true) as ReturnType<typeof mapPhilosopher> & {
    personaPrompt?: string;
  };
  return {
    id: row.id,
    name: base.name,
    nameEn: base.nameEn,
    avatarUrl: base.avatarUrl,
    birthYear: base.birthYear,
    deathYear: base.deathYear,
    school: base.school,
    era: base.era,
    region: base.region,
    tagline: base.tagline,
    bio: base.bio,
    keyConcepts: base.keyConcepts,
    representativeWorks: base.representativeWorks,
    personaPrompt: row.personaPrompt,
    openingLine: base.openingLine,
  };
}

export function philosopherInputToDbValues(input: PhilosopherInput) {
  return {
    id: input.id.trim(),
    name: input.name.trim(),
    nameEn: input.nameEn?.trim() || null,
    avatarUrl: input.avatarUrl?.trim() || null,
    birthYear: input.birthYear ?? null,
    deathYear: input.deathYear ?? null,
    school: JSON.stringify(input.school),
    era: input.era?.trim() || null,
    region: input.region?.trim() || null,
    tagline: input.tagline?.trim() || null,
    bio: input.bio?.trim() || null,
    keyConcepts: JSON.stringify(input.keyConcepts),
    representativeWorks: JSON.stringify(input.representativeWorks),
    personaPrompt: input.personaPrompt.trim(),
    openingLine: input.openingLine?.trim() || null,
  };
}

export function validatePhilosopherInput(input: Partial<PhilosopherInput>): string | null {
  if (!input.id?.trim()) return "ID 不能为空（英文 slug，如 nietzsche）";
  if (!/^[a-z0-9-]+$/.test(input.id.trim())) return "ID 只能包含小写字母、数字和连字符";
  if (!input.name?.trim()) return "姓名不能为空";
  if (!input.personaPrompt?.trim()) return "系统提示词不能为空";
  if (!input.school?.length) return "至少填写一个流派标签";
  if (!input.keyConcepts?.length) return "至少填写一个核心概念";
  return null;
}

export function parsePhilosopherBody(body: Record<string, unknown>): PhilosopherInput {
  const parseList = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof value === "string") {
      return value
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const parseWorks = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) {
      try {
        return JSON.parse(value) as PhilosopherInput["representativeWorks"];
      } catch {
        return [];
      }
    }
    return [];
  };

  return {
    id: String(body.id ?? ""),
    name: String(body.name ?? ""),
    nameEn: body.nameEn ? String(body.nameEn) : undefined,
    avatarUrl: body.avatarUrl ? String(body.avatarUrl) : undefined,
    birthYear: body.birthYear !== undefined && body.birthYear !== "" ? Number(body.birthYear) : undefined,
    deathYear: body.deathYear !== undefined && body.deathYear !== "" ? Number(body.deathYear) : undefined,
    school: parseList(body.school),
    era: body.era ? String(body.era) : undefined,
    region: body.region ? String(body.region) : undefined,
    tagline: body.tagline ? String(body.tagline) : undefined,
    bio: body.bio ? String(body.bio) : undefined,
    keyConcepts: parseList(body.keyConcepts),
    representativeWorks: parseWorks(body.representativeWorks),
    personaPrompt: String(body.personaPrompt ?? ""),
    openingLine: body.openingLine ? String(body.openingLine) : undefined,
  };
}
