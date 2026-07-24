import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";
import { mkdirSync } from "fs";
import { dirname } from "path";

const dbPath = process.env.DATABASE_URL || "./data/talk-to-god.db";
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

export function initDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS philosophers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      avatar_url TEXT,
      birth_year INTEGER,
      death_year INTEGER,
      school TEXT NOT NULL,
      era TEXT,
      region TEXT,
      tagline TEXT,
      bio TEXT,
      key_concepts TEXT NOT NULL,
      representative_works TEXT NOT NULL,
      persona_prompt TEXT NOT NULL,
      opening_line TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      guest_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      philosopher_id TEXT NOT NULL,
      title TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  `);

  migrateUsersTable();
}

function migrateUsersTable() {
  const cols = sqlite.pragma("table_info(users)") as { name: string }[];
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("phone")) sqlite.exec("ALTER TABLE users ADD COLUMN phone TEXT");
  if (!names.has("password_hash")) sqlite.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
  if (!names.has("nickname")) sqlite.exec("ALTER TABLE users ADD COLUMN nickname TEXT");
  if (!names.has("last_ip")) sqlite.exec("ALTER TABLE users ADD COLUMN last_ip TEXT");
  if (!names.has("region")) sqlite.exec("ALTER TABLE users ADD COLUMN region TEXT");
  if (!names.has("last_seen_at")) sqlite.exec("ALTER TABLE users ADD COLUMN last_seen_at TEXT");
  sqlite.exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL"
  );
}
