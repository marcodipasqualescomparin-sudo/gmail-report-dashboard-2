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

// TODO: Add your tables here

/**
 * Report Fabio Andreani - Email con classificazione priorità
 */
export const andreaniReports = mysqlTable("andreani_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: text("subject").notNull(),
  priority: mysqlEnum("priority", ["ALTA", "MEDIA", "BASSA"]).notNull(),
  summary: text("summary"),
  sender: varchar("sender", { length: 255 }),
  messageId: varchar("messageId", { length: 255 }).unique(),
  receivedAt: timestamp("receivedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AndreaniReport = typeof andreaniReports.$inferSelect;
export type InsertAndreaniReport = typeof andreaniReports.$inferInsert;

/**
 * Report DDT e Trasferimenti - Prodotti HERO
 */
export const ddtReports = mysqlTable("ddt_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reportType: mysqlEnum("reportType", ["DDT", "TRASFERIMENTO"]).notNull(),
  reportNumber: varchar("reportNumber", { length: 100 }).notNull(),
  sender: varchar("sender", { length: 255 }),
  recipient: varchar("recipient", { length: 255 }),
  supplier: varchar("supplier", { length: 255 }),
  productCategory: mysqlEnum("productCategory", ["iPhone", "iPad", "MacBook", "Apple Watch"]).notNull(),
  quantity: int("quantity"),
  details: text("details"),
  messageId: varchar("messageId", { length: 255 }).unique(),
  receivedAt: timestamp("receivedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DdtReport = typeof ddtReports.$inferSelect;
export type InsertDdtReport = typeof ddtReports.$inferInsert;


/**
 * Inviti - Per condividere la dashboard con altri utenti
 */
export const invites = mysqlTable("invites", {
  id: int("id").autoincrement().primaryKey(),
  invitedBy: int("invitedBy").notNull(),
  invitedEmail: varchar("invitedEmail", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Invite = typeof invites.$inferSelect;
export type InsertInvite = typeof invites.$inferInsert;

/**
 * Accessi - Traccia quali utenti hanno accesso ai report
 */
export const accesses = mysqlTable("accesses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  grantedBy: int("grantedBy").notNull(),
  permission: mysqlEnum("permission", ["view", "view_export", "admin"]).default("view").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Access = typeof accesses.$inferSelect;
export type InsertAccess = typeof accesses.$inferInsert;


/**
 * Notifiche - Per avvisare gli utenti di nuovi report e operazioni importanti
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["success", "error", "info", "warning", "event_added", "report_generated", "export_completed", "high_priority_email", "ddt_alert", "system"]).notNull(),
  reportId: int("reportId"),
  reportType: mysqlEnum("reportType", ["andreani", "ddt"]),
  actionLabel: varchar("actionLabel", { length: 100 }),
  actionUrl: text("actionUrl"),
  isRead: int("isRead").default(0).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


/**
 * Eventi - Per tracciare eventi da mittenti come Factorial, SalesCoach, etc.
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sender: mysqlEnum("sender", ["Factorial", "SalesCoach", "Other"]).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // es. "Webinar", "Workshop", "Corso"
  title: text("title").notNull(),
  description: text("description"),
  registrationLink: text("registrationLink"), // Link per la registrazione
  eventDate: timestamp("eventDate"), // Data dell'evento
  messageId: varchar("messageId", { length: 255 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
