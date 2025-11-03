import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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

// Papers table - stores academic paper metadata
export const papers = mysqlTable("papers", {
  id: varchar("id", { length: 64 }).primaryKey(), // arxiv_id or semantic_scholar_id
  arxivId: varchar("arxivId", { length: 64 }),
  semanticScholarId: varchar("semanticScholarId", { length: 64 }),
  title: text("title").notNull(),
  authors: text("authors").notNull(), // JSON string array
  abstract: text("abstract"),
  categories: text("categories"), // JSON string array
  publishedDate: timestamp("publishedDate"),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  citationsCount: int("citationsCount").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;

// User ratings table - stores like/dislike ratings
export const userRatings = mysqlTable("userRatings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paperId: varchar("paperId", { length: 64 }).notNull(),
  rating: int("rating").notNull(), // 1 for like, -1 for dislike
  createdAt: timestamp("createdAt").defaultNow(),
});

export type UserRating = typeof userRatings.$inferSelect;
export type InsertUserRating = typeof userRatings.$inferInsert;

// User history table - stores paper viewing history
export const userHistory = mysqlTable("userHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paperId: varchar("paperId", { length: 64 }).notNull(),
  viewedAt: timestamp("viewedAt").defaultNow(),
  category: varchar("category", { length: 128 }), // primary category tag
});

export type UserHistory = typeof userHistory.$inferSelect;
export type InsertUserHistory = typeof userHistory.$inferInsert;

// Favorites table - stores user's favorite papers
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paperId: varchar("paperId", { length: 64 }).notNull(),
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("createdAt").defaultNow(),
}, (table) => ({
  userPaperUnique: uniqueIndex("user_paper_unique").on(table.userId, table.paperId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// Paper summaries table - stores AI-generated summaries
export const paperSummaries = mysqlTable("paperSummaries", {
  id: int("id").autoincrement().primaryKey(),
  paperId: varchar("paperId", { length: 64 }).notNull(),
  summary: text("summary").notNull(),
  language: varchar("language", { length: 16 }).default("en"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PaperSummary = typeof paperSummaries.$inferSelect;
export type InsertPaperSummary = typeof paperSummaries.$inferInsert;

// Paper translations table - stores AI-generated translations
export const paperTranslations = mysqlTable("paperTranslations", {
  id: int("id").autoincrement().primaryKey(),
  paperId: varchar("paperId", { length: 64 }).notNull(),
  translatedTitle: text("translatedTitle"),
  translatedAbstract: text("translatedAbstract"),
  targetLanguage: varchar("targetLanguage", { length: 16 }).default("ja"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type PaperTranslation = typeof paperTranslations.$inferSelect;
export type InsertPaperTranslation = typeof paperTranslations.$inferInsert;

// Research proposals table - stores AI-generated research theme proposals
export const researchProposals = mysqlTable("researchProposals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sourcePaperIds: text("sourcePaperIds").notNull(), // JSON array of paper IDs
  openProblems: text("openProblems"), // JSON array of identified open problems
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ResearchProposal = typeof researchProposals.$inferSelect;
export type InsertResearchProposal = typeof researchProposals.$inferInsert;

// Survey reports table - stores auto-generated survey reports
export const surveyReports = mysqlTable("surveyReports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  proposalId: int("proposalId"),
  title: text("title").notNull(),
  content: text("content").notNull(), // Full survey report in markdown
  relatedPaperIds: text("relatedPaperIds"), // JSON array of paper IDs
  createdAt: timestamp("createdAt").defaultNow(),
});

export type SurveyReport = typeof surveyReports.$inferSelect;
export type InsertSurveyReport = typeof surveyReports.$inferInsert;
