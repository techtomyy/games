import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const drawings = pgTable("drawings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  imageData: text("image_data").notNull(), // Base64 encoded drawing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  drawingId: varchar("drawing_id").references(() => drawings.id).notNull(),
  title: varchar("title").notNull(),
  gameType: varchar("game_type").notNull(), // "platformer", "racing", "battle", etc.
  gameData: jsonb("game_data").notNull(), // Generated game configuration
  spriteData: text("sprite_data"), // Processed sprite from AI
  isPublic: boolean("is_public").default(false),
  likes: integer("likes").default(0),
  plays: integer("plays").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull(), // "free", "pro", "school"
  status: varchar("status").notNull(), // "active", "cancelled", "expired"
  gamesCreatedThisMonth: integer("games_created_this_month").default(0),
  maxGamesPerMonth: integer("max_games_per_month").default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertDrawingSchema = createInsertSchema(drawings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDrawing = z.infer<typeof insertDrawingSchema>;
export type Drawing = typeof drawings.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
