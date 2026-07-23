import "../config.js";
import { db, initDatabase } from "./index.js";
import { philosophers } from "./schema.js";
import { seedPhilosophers } from "./seed-data.js";
import { eq } from "drizzle-orm";

initDatabase();

for (const p of seedPhilosophers) {
  const existing = db.select().from(philosophers).where(eq(philosophers.id, p.id)).get();
  if (existing) {
    console.log(`跳过已存在: ${p.name}`);
    continue;
  }

  db.insert(philosophers).values({
    id: p.id,
    name: p.name,
    nameEn: p.nameEn,
    avatarUrl: null,
    birthYear: p.birthYear,
    deathYear: p.deathYear,
    school: JSON.stringify(p.school),
    era: p.era,
    region: p.region,
    tagline: p.tagline,
    bio: p.bio,
    keyConcepts: JSON.stringify(p.keyConcepts),
    representativeWorks: JSON.stringify(p.representativeWorks),
    personaPrompt: p.personaPrompt,
    openingLine: p.openingLine,
  }).run();

  console.log(`已添加: ${p.name}`);
}

console.log("种子数据导入完成。");
