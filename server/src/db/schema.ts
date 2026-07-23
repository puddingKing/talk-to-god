import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const philosophers = sqliteTable("philosophers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  avatarUrl: text("avatar_url"),
  birthYear: integer("birth_year"),
  deathYear: integer("death_year"),
  school: text("school").notNull(), // JSON array
  era: text("era"),
  region: text("region"),
  tagline: text("tagline"),
  bio: text("bio"),
  keyConcepts: text("key_concepts").notNull(), // JSON array
  representativeWorks: text("representative_works").notNull(), // JSON array
  personaPrompt: text("persona_prompt").notNull(),
  openingLine: text("opening_line"),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  guestId: text("guest_id"),
  createdAt: text("created_at").notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  philosopherId: text("philosopher_id").notNull(),
  title: text("title"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});
