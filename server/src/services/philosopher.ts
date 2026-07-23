import type { Philosopher, PhilosopherDetail } from "@talk-to-god/shared";

interface DbPhilosopher {
  id: string;
  name: string;
  nameEn: string | null;
  avatarUrl: string | null;
  birthYear: number | null;
  deathYear: number | null;
  school: string;
  era: string | null;
  region: string | null;
  tagline: string | null;
  bio: string | null;
  keyConcepts: string;
  representativeWorks: string;
  personaPrompt: string;
  openingLine: string | null;
}

export function mapPhilosopher(row: DbPhilosopher, includePrompt = false): Philosopher | PhilosopherDetail {
  const base: Philosopher = {
    philosopherId: row.id,
    name: row.name,
    nameEn: row.nameEn ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    birthYear: row.birthYear ?? undefined,
    deathYear: row.deathYear ?? undefined,
    school: JSON.parse(row.school),
    era: row.era ?? undefined,
    region: row.region ?? undefined,
    tagline: row.tagline ?? undefined,
    bio: row.bio ?? undefined,
    keyConcepts: JSON.parse(row.keyConcepts),
    representativeWorks: JSON.parse(row.representativeWorks),
    openingLine: row.openingLine ?? undefined,
  };

  if (includePrompt) {
    return { ...base, personaPrompt: row.personaPrompt };
  }
  return base;
}
