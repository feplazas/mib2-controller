import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Command Logs Table
 * Stores history of all commands executed on MIB2 units
 */
export const commandLogs = mysqlTable("command_logs", {
  id: int("id").autoincrement().primaryKey(),
  command: text("command").notNull(),
  output: text("output"),
  error: text("error"),
  success: int("success").notNull().default(0), // 0 = false, 1 = true
  executedAt: timestamp("executedAt").defaultNow().notNull(),
  host: varchar("host", { length: 15 }),
  port: int("port"),
  userId: int("userId"),
});

/**
 * Predefined Commands Table
 * Stores library of known safe commands for MIB2
 */
export const predefinedCommands = mysqlTable("predefined_commands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  description: text("description").notNull(),
  command: text("command").notNull(),
  requiresConfirmation: int("requiresConfirmation").notNull().default(0),
  firmwareVersion: varchar("firmwareVersion", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Connection History Table
 * Tracks all connection attempts to MIB2 units
 */
export const connectionHistory = mysqlTable("connection_history", {
  id: int("id").autoincrement().primaryKey(),
  host: varchar("host", { length: 15 }).notNull(),
  port: int("port").notNull(),
  success: int("success").notNull(), // 0 = false, 1 = true
  errorMessage: text("errorMessage"),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  disconnectedAt: timestamp("disconnectedAt"),
  userId: int("userId"),
});

export type CommandLog = typeof commandLogs.$inferSelect;
export type NewCommandLog = typeof commandLogs.$inferInsert;

export type PredefinedCommand = typeof predefinedCommands.$inferSelect;
export type NewPredefinedCommand = typeof predefinedCommands.$inferInsert;

export type ConnectionHistory = typeof connectionHistory.$inferSelect;
export type NewConnectionHistory = typeof connectionHistory.$inferInsert;
