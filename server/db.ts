import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Paper queries
import { favorites, InsertPaper, InsertUserHistory, InsertUserRating, papers, userHistory, userRatings, InsertFavorite, InsertPaperSummary, paperSummaries, InsertPaperTranslation, paperTranslations, InsertResearchProposal, researchProposals, InsertSurveyReport, surveyReports } from "../drizzle/schema";
import { desc, and, like, inArray } from "drizzle-orm";

export async function upsertPaper(paper: InsertPaper): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(papers).values(paper).onDuplicateKeyUpdate({
    set: {
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      categories: paper.categories,
      publishedDate: paper.publishedDate,
      pdfUrl: paper.pdfUrl,
      citationsCount: paper.citationsCount,
    },
  });
}

export async function getPaper(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  // まずidで検索
  let result = await db.select().from(papers).where(eq(papers.id, id)).limit(1);
  
  // 見つからない場合はsemanticScholarIdで検索
  if (result.length === 0) {
    result = await db.select().from(papers).where(eq(papers.semanticScholarId, id)).limit(1);
  }
  
  return result.length > 0 ? result[0] : undefined;
}

export async function searchPapers(query: string, category?: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];
  if (query) {
    conditions.push(
      like(papers.title, `%${query}%`)
    );
  }
  if (category) {
    conditions.push(like(papers.categories, `%${category}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(papers).where(whereClause).limit(limit).orderBy(desc(papers.publishedDate));
}

// User rating queries
export async function addRating(rating: InsertUserRating): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(userRatings).values(rating);
}

export async function getUserRatings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(userRatings).where(eq(userRatings.userId, userId));
}

export async function getUserRating(userId: number, paperId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(userRatings)
    .where(and(eq(userRatings.userId, userId), eq(userRatings.paperId, paperId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// History queries
export async function addHistory(history: InsertUserHistory): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(userHistory).values(history);
}

export async function getUserHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(userHistory)
    .where(eq(userHistory.userId, userId))
    .orderBy(desc(userHistory.viewedAt))
    .limit(limit);
}

// Favorites queries
export async function addFavorite(favorite: InsertFavorite): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(favorites).values(favorite).onDuplicateKeyUpdate({
    set: { tags: favorite.tags },
  });
}

export async function removeFavorite(userId: number, paperId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(favorites).where(
    and(eq(favorites.userId, userId), eq(favorites.paperId, paperId))
  );
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
}

export async function isFavorite(userId: number, paperId: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.paperId, paperId)))
    .limit(1);

  return result.length > 0;
}

// Paper summary queries
export async function addPaperSummary(summary: InsertPaperSummary): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(paperSummaries).values(summary);
}

export async function getPaperSummary(paperId: string, language = "en") {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(paperSummaries)
    .where(and(eq(paperSummaries.paperId, paperId), eq(paperSummaries.language, language)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Paper translation queries
export async function addPaperTranslation(translation: InsertPaperTranslation): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(paperTranslations).values(translation);
}

export async function getPaperTranslation(paperId: string, targetLanguage = "ja") {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(paperTranslations)
    .where(and(eq(paperTranslations.paperId, paperId), eq(paperTranslations.targetLanguage, targetLanguage)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Research proposal queries
export async function addResearchProposal(proposal: InsertResearchProposal): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(researchProposals).values(proposal);
}

export async function getUserResearchProposals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(researchProposals)
    .where(eq(researchProposals.userId, userId))
    .orderBy(desc(researchProposals.createdAt));
}

export async function getResearchProposal(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(researchProposals).where(eq(researchProposals.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Survey report queries
export async function addSurveyReport(report: InsertSurveyReport): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(surveyReports).values(report);
}

export async function getUserSurveyReports(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(surveyReports)
    .where(eq(surveyReports.userId, userId))
    .orderBy(desc(surveyReports.createdAt));
}

export async function getSurveyReport(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(surveyReports).where(eq(surveyReports.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}
