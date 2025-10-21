import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
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
      .input(z.object({ paperId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { addFavorite } = await import("./db");
        const { randomUUID } = await import("crypto");
        
        await addFavorite({
          id: randomUUID(),
          userId: ctx.user.id,
          paperId: input.paperId,
        });

        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({ paperId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { removeFavorite } = await import("./db");
        await removeFavorite(ctx.user.id, input.paperId);
        return { success: true };
      }),

    getUserFavorites: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserFavorites } = await import("./db");
        return getUserFavorites(ctx.user.id);
      }),
  }),

  recommendations: router({
    getForUser: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input, ctx }) => {
        const { getUserFavorites, getUserRatings } = await import("./db");
        const { getRecommendedPapers } = await import("./services/semanticScholar");
        
        const [favorites, ratings] = await Promise.all([
          getUserFavorites(ctx.user.id),
          getUserRatings(ctx.user.id),
        ]);

        const likedPapers = ratings
          .filter(r => r.rating === 1)
          .map(r => r.paperId);

        const sourcePaperIds = Array.from(new Set([...favorites.map(f => f.paperId), ...likedPapers]));

        if (sourcePaperIds.length === 0) {
          return [];
        }

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
      }),
  }),
});

export type AppRouter = typeof appRouter;
