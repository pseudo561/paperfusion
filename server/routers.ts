import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { favorites, userRatings } from "../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  papers: router({
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        category: z.string().optional(),
        source: z.enum(["arxiv", "semantic_scholar", "both"]).default("both"),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        const { searchArxiv, buildArxivQuery } = await import("./services/arxiv");
        const { searchSemanticScholar } = await import("./services/semanticScholar");
        const { upsertPaper } = await import("./db");

        let results: any[] = [];

        if (input.source === "arxiv" || input.source === "both") {
          const arxivQuery = input.category
            ? buildArxivQuery({ all: input.query, category: input.category })
            : buildArxivQuery({ all: input.query });
          
          const arxivResults = await searchArxiv(arxivQuery, input.limit);
          
          for (const paper of arxivResults) {
            await upsertPaper({
              id: paper.arxivId,
              arxivId: paper.arxivId,
              semanticScholarId: null,
              title: paper.title,
              authors: JSON.stringify(paper.authors),
              abstract: paper.abstract,
              categories: JSON.stringify(paper.categories),
              publishedDate: paper.publishedDate,
              pdfUrl: paper.pdfUrl,
              citationsCount: 0,
            });
          }
          
          results.push(...arxivResults);
        }

        if (input.source === "semantic_scholar" || input.source === "both") {
          const ssResults = await searchSemanticScholar(input.query, input.limit);
          
          for (const paper of ssResults) {
            await upsertPaper({
              id: paper.paperId,
              arxivId: null,
              semanticScholarId: paper.paperId,
              title: paper.title,
              authors: JSON.stringify(paper.authors.map(a => a.name)),
              abstract: paper.abstract || null,
              categories: paper.venue ? JSON.stringify([paper.venue]) : null,
              publishedDate: paper.publicationDate ? new Date(paper.publicationDate) : null,
              pdfUrl: paper.url,
              citationsCount: paper.citationCount,
            });
          }
          
          results.push(...ssResults.map(p => ({
            id: p.paperId,
            title: p.title,
            authors: p.authors.map(a => a.name),
            abstract: p.abstract,
            categories: p.venue ? [p.venue] : [],
            publishedDate: p.publicationDate ? new Date(p.publicationDate) : null,
            pdfUrl: p.url,
            citationsCount: p.citationCount,
          })));
        }

        return results;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const { getPaper } = await import("./db");
        return getPaper(input.id);
      }),

    getCitations: publicProcedure
      .input(z.object({ paperId: z.string() }))
      .query(async ({ input }) => {
        const { getPaperCitations, getPaperReferences } = await import("./services/semanticScholar");
        
        const [citations, references] = await Promise.all([
          getPaperCitations(input.paperId),
          getPaperReferences(input.paperId),
        ]);

        return {
          citations,
          references,
        };
      }),
  }),

  ratings: router({
    add: protectedProcedure
      .input(z.object({
        paperId: z.string(),
        rating: z.number().int().min(-1).max(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { addRating } = await import("./db");
        const { randomUUID } = await import("crypto");
        
        await addRating({
          id: randomUUID(),
          userId: ctx.user.id,
          paperId: input.paperId,
          rating: input.rating,
        });

        return { success: true };
      }),

    getUserRatings: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserRatings } = await import("./db");
        return getUserRatings(ctx.user.id);
      }),
  }),

  history: router({
    add: protectedProcedure
      .input(z.object({
        paperId: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { addHistory } = await import("./db");
        const { randomUUID } = await import("crypto");
        
        await addHistory({
          id: randomUUID(),
          userId: ctx.user.id,
          paperId: input.paperId,
          category: input.category || null,
        });

        return { success: true };
      }),

    getUserHistory: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        limit: z.number().default(50),
      }))
      .query(async ({ input, ctx }) => {
        const { getUserHistory } = await import("./db");
        return getUserHistory(ctx.user.id, input.category, input.limit);
      }),
  }),

  favorites: router({
    add: protectedProcedure
      .input(z.object({ paperId: z.string(), tags: z.array(z.string()).optional() }))
      .mutation(async ({ input, ctx }) => {
        const { addFavorite } = await import("./db");
        const { randomUUID } = await import("crypto");
        
        try {
          await addFavorite({
            id: randomUUID(),
            userId: ctx.user.id,
            paperId: input.paperId,
            tags: input.tags ? JSON.stringify(input.tags) : null,
          });
          return { success: true, action: 'added' as const };
        } catch (error: any) {
          if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, action: 'duplicate' as const };
          }
          throw error;
        }
      }),

    remove: protectedProcedure
      .input(z.object({ paperId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { removeFavorite } = await import("./db");
        await removeFavorite(ctx.user.id, input.paperId);
        return { success: true, action: 'removed' as const };
      }),

    toggle: protectedProcedure
      .input(z.object({ paperId: z.string(), tags: z.array(z.string()).optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { randomUUID } = await import("crypto");

        const existing = await db
          .select()
          .from(favorites)
          .where(and(eq(favorites.userId, ctx.user.id), eq(favorites.paperId, input.paperId)))
          .limit(1);

        if (existing.length > 0) {
          await db
            .delete(favorites)
            .where(and(eq(favorites.userId, ctx.user.id), eq(favorites.paperId, input.paperId)));
          return { success: true, action: 'removed' as const, isFavorite: false };
        } else {
          await db.insert(favorites).values({
            id: randomUUID(),
            userId: ctx.user.id,
            paperId: input.paperId,
            tags: input.tags ? JSON.stringify(input.tags) : null,
          });
          return { success: true, action: 'added' as const, isFavorite: true };
        }
      }),

    checkFavorite: protectedProcedure
      .input(z.object({ paperId: z.string() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return { isFavorite: false };

        const existing = await db
          .select()
          .from(favorites)
          .where(and(eq(favorites.userId, ctx.user.id), eq(favorites.paperId, input.paperId)))
          .limit(1);

        return { isFavorite: existing.length > 0 };
      }),

    updateTags: protectedProcedure
      .input(z.object({ paperId: z.string(), tags: z.array(z.string()) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(favorites)
          .set({ tags: JSON.stringify(input.tags) })
          .where(and(eq(favorites.userId, ctx.user.id), eq(favorites.paperId, input.paperId)));

        return { success: true };
      }),

    generateTags: protectedProcedure
      .input(z.object({ paperId: z.string(), title: z.string(), abstract: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        const prompt = `以下の論文のタイトルと要約から、適切なタグを3-5個生成してください。タグは日本語で、カンマ区切りで返してください。

タイトル: ${input.title}
要約: ${input.abstract || '要約なし'}

タグ（カンマ区切り）:`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "あなたは学術論文の分類を支援するAIアシスタントです。" },
              { role: "user", content: prompt },
            ],
          });

          const content = response.choices[0]?.message?.content;
          const tagsText = typeof content === 'string' ? content : "";
          const tags = tagsText
            .split(/[,、]/)
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0)
            .slice(0, 5);

          const db = await getDb();
          if (db) {
            await db
              .update(favorites)
              .set({ tags: JSON.stringify(tags) })
              .where(and(eq(favorites.userId, ctx.user.id), eq(favorites.paperId, input.paperId)));
          }

          return { success: true, tags };
        } catch (error) {
          console.error("Failed to generate tags:", error);
          throw new Error("タグの生成に失敗しました");
        }
      }),

    getUserFavorites: protectedProcedure
      .input(z.object({ tag: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];

        let query = db
          .select()
          .from(favorites)
          .where(eq(favorites.userId, ctx.user.id));

        const results = await query;

        if (input?.tag) {
          return results.filter(f => {
            if (!f.tags) return false;
            const tags = JSON.parse(f.tags as string);
            return tags.includes(input.tag);
          });
        }

        return results;
      }),
  }),

  recommendations: router({
    getForUser: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];

        const { getRecommendedPapers } = await import("./services/semanticScholar");
        
        // お気に入りと評価を取得
        const [favoritesData, ratingsData] = await Promise.all([
          db.select().from(favorites).where(eq(favorites.userId, ctx.user.id)),
          db.select().from(userRatings).where(eq(userRatings.userId, ctx.user.id)),
        ]);

        const likedPapers = ratingsData
          .filter(r => r.rating === 1)
          .map(r => r.paperId);

        const sourcePaperIds = Array.from(new Set([...favoritesData.map(f => f.paperId), ...likedPapers]));

        if (sourcePaperIds.length === 0) {
          return [];
        }

        try {
          const recommendations = await Promise.all(
            sourcePaperIds.slice(0, 3).map(paperId => 
              getRecommendedPapers(paperId, Math.ceil(input.limit / 3))
            )
          );

          const uniqueRecommendations = Array.from(
            new Map(
              recommendations.flat().map(p => [p.paperId, p])
            ).values()
          ).slice(0, input.limit);

          return uniqueRecommendations;
        } catch (error) {
          console.error("Failed to get recommendations:", error);
          return [];
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
