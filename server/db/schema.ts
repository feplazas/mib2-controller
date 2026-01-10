import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

/**
 * Command Logs Table
 * Stores history of all commands executed on MIB2 units
 */
export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  command: text("command").notNull(),
  output: text("output"),
  error: text("error"),
  success: boolean("success").notNull().default(false),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
  host: text("host"),
  port: integer("port"),
  userId: text("user_id"), // Optional: for multi-user scenarios
});

/**
 * Predefined Commands Table
 * Stores library of known safe commands for MIB2
 */
export const predefinedCommands = pgTable("predefined_commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // diagnostic, configuration, information
  description: text("description").notNull(),
  command: text("command").notNull(),
  requiresConfirmation: boolean("requires_confirmation").notNull().default(false),
  firmwareVersion: text("firmware_version"), // e.g., "P0480T"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Connection History Table
 * Tracks all connection attempts to MIB2 units
 */
export const connectionHistory = pgTable("connection_history", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
  disconnectedAt: timestamp("disconnected_at"),
  userId: text("user_id"),
});

export type CommandLog = typeof commandLogs.$inferSelect;
export type NewCommandLog = typeof commandLogs.$inferInsert;

export type PredefinedCommand = typeof predefinedCommands.$inferSelect;
export type NewPredefinedCommand = typeof predefinedCommands.$inferInsert;

export type ConnectionHistory = typeof connectionHistory.$inferSelect;
export type NewConnectionHistory = typeof connectionHistory.$inferInsert;
