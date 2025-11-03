import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb, getPaper } from "./db";
import { invokeLLM } from "./_core/llm";
import { favorites, papers, researchProposals, userRatings } from "../drizzle/schema";
import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
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
        const paper = await getPaper(input.id);
        return paper || null;
      }),

    getCitations: publicProcedure
      .input(z.object({ paperId: z.string() }))
      .query(async ({ input }) => {
        const { getPaperCitations, getPaperReferences, searchPapersByArxivId } = await import("./services/semanticScholar");
        
        let semanticScholarId = input.paperId;
        
        // arXiv IDの場合はSemantic Scholar IDに変換
        if (input.paperId.includes('v') || input.paperId.match(/^\d{4}\.\d{5}$/)) {
          const arxivId = input.paperId.replace(/v\d+$/, ''); // v1等のバージョンを削除
          const paper = await searchPapersByArxivId(arxivId);
          if (paper?.paperId) {
            semanticScholarId = paper.paperId;
          } else {
            // Semantic Scholar IDが見つからない場合は空の結果を返す
            return {
              citations: [],
              references: [],
            };
          }
        }
        
        const [citations, references] = await Promise.all([
          getPaperCitations(semanticScholarId),
          getPaperReferences(semanticScholarId),
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
        
        await addRating({
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
        await addHistory({
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
        return getUserHistory(ctx.user.id, input.limit);
      }),
  }),

  favorites: router({
    add: protectedProcedure
      .input(z.object({ paperId: z.string(), tags: z.array(z.string()).optional() }))
      .mutation(async ({ input, ctx }) => {
        const { addFavorite } = await import("./db");
        
        try {
          await addFavorite({
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
      .input(z.object({ 
        paperId: z.string(), 
        tags: z.array(z.string()).optional(),
        paperData: z.object({
          title: z.string(),
          authors: z.array(z.string()),
          abstract: z.string().optional(),
          year: z.number().optional(),
          venue: z.string().optional(),
          url: z.string().optional(),
          citationCount: z.number().optional(),
        }).optional()
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { randomUUID } = await import("crypto");
        const { upsertPaper } = await import("./db");

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
          // 論文データが提供されている場合はデータベースに保存
          if (input.paperData) {
            await upsertPaper({
              id: input.paperId,
              arxivId: null,
              semanticScholarId: input.paperId,
              title: input.paperData.title,
              authors: JSON.stringify(input.paperData.authors),
              abstract: input.paperData.abstract || null,
              categories: input.paperData.venue ? JSON.stringify([input.paperData.venue]) : null,
              publishedDate: input.paperData.year ? new Date(input.paperData.year, 0, 1) : null,
              pdfUrl: input.paperData.url || null,
              citationsCount: input.paperData.citationCount || 0,
            });
          }

          await db.insert(favorites).values({
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
      .input(z.object({ 
        paperId: z.string(), 
        title: z.string(), 
        abstract: z.string().optional(),
        language: z.enum(['ja', 'en', 'zh']).optional().default('en')
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        
        const prompts = {
          ja: `以下の論文のタイトルと要約から、適切なタグを3-5個生成してください。タグは日本語で、カンマ区切りで返してください。

タイトル: ${input.title}
要約: ${input.abstract || '要約なし'}

タグ（カンマ区切り）:`,
          en: `Generate 3-5 appropriate tags from the following paper title and abstract. Return tags in English, separated by commas.

Title: ${input.title}
Abstract: ${input.abstract || 'No abstract'}

Tags (comma-separated):`,
          zh: `从以下论文标题和摘要生成3-5个适当的标签。请用中文返回标签，用逗号分隔。

标题: ${input.title}
摘要: ${input.abstract || '无摘要'}

标签（逗号分隔）:`
        };
        
        const systemMessages = {
          ja: "あなたは学術論文の分類を支援するAIアシスタントです。",
          en: "You are an AI assistant that helps classify academic papers.",
          zh: "你是一个帮助分类学术论文的AI助手。"
        };
        
        const lang = input.language || 'en';
        const prompt = prompts[lang];
        const systemMessage = systemMessages[lang];

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemMessage },
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

        const results = await db
          .select()
          .from(favorites)
          .where(eq(favorites.userId, ctx.user.id));

        // 論文情報を取得
        const favoritesWithPapers = await Promise.all(
          results.map(async (fav) => {
            const paper = await getPaper(fav.paperId);
            return {
              ...fav,
              paper,
            };
          })
        );

        if (input?.tag) {
          return favoritesWithPapers.filter(f => {
            if (!f.tags) return false;
            const tags = JSON.parse(f.tags as string);
            return tags.includes(input.tag);
          });
        }

        return favoritesWithPapers;
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

        // レート制限対策：順次処理に変更
        const recommendations: any[] = [];
        const maxSourcePapers = Math.min(3, sourcePaperIds.length);
        const perPaperLimit = Math.ceil(input.limit / maxSourcePapers);

        for (let i = 0; i < maxSourcePapers; i++) {
          try {
            const paperId = sourcePaperIds[i];
            console.log(`Fetching recommendations for paper ${i + 1}/${maxSourcePapers}: ${paperId}`);
            const recs = await getRecommendedPapers(paperId, perPaperLimit);
            recommendations.push(...recs);
            console.log(`Got ${recs.length} recommendations`);
          } catch (error) {
            console.error(`Failed to get recommendations for paper ${sourcePaperIds[i]}:`, error);
            // エラーが発生しても続行
          }
        }

        // 重複を除去して返却
        const uniqueRecommendations = Array.from(
          new Map(
            recommendations.map(p => [p.paperId, p])
          ).values()
        ).slice(0, input.limit);

        console.log(`Returning ${uniqueRecommendations.length} unique recommendations`);
        return uniqueRecommendations;
      }),
  }),

  proposals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const results = await db
        .select()
        .from(researchProposals)
        .where(eq(researchProposals.userId, ctx.user.id))
        .orderBy(desc(researchProposals.createdAt));

      return results;
    }),

    generate: protectedProcedure
      .input(z.object({
        paperIds: z.array(z.string()),
        language: z.enum(['ja', 'en', 'zh']).optional().default('en')
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // 選択された論文を取得
        const papers = await Promise.all(
          input.paperIds.map(id => getPaper(id))
        );

        const validPapers = papers.filter(p => p !== undefined);

        if (validPapers.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No valid papers found" });
        }

        // LLMで研究テーマを提案
        const paperSummaries = validPapers.map(p => 
          `Title: ${p.title}\nAuthors: ${p.authors}\nAbstract: ${p.abstract || "N/A"}`
        ).join("\n\n---\n\n");

        const lang = input.language || 'en';
        
        const prompts = {
          ja: `以下の論文を分析して、新しい研究テーマを提案してください。

${paperSummaries}

以下の形式で回答してください：
1. 研究テーマのタイトル（簡潔に）
2. 提案内容（詳細な説明、300-500字程度）
3. 関連するオープンプロブレム（3-5個）
4. 研究の方向性と期待される貢献`,
          en: `Analyze the following papers and propose a new research theme.

${paperSummaries}

Please respond in the following format:
1. Research Theme Title (concise)
2. Proposal Content (detailed explanation, 300-500 words)
3. Related Open Problems (3-5 items)
4. Research Direction and Expected Contributions`,
          zh: `分析以下论文并提出新的研究主题。

${paperSummaries}

请按以下格式回答：
1. 研究主题标题（简洁）
2. 提案内容（详细说明，300-500字）
3. 相关开放问题（3-5个）
4. 研究方向和预期贡献`
        };
        
        const systemMessages = {
          ja: "あなたは研究者を支援するAIアシスタントです。論文を分析し、新しい研究テーマを提案します。",
          en: "You are an AI assistant that helps researchers. You analyze papers and propose new research themes.",
          zh: "你是一个帮助研究人员的AI助手。你分析论文并提出新的研究主题。"
        };
        
        const proposalPrompt = prompts[lang];
        const systemMessage = systemMessages[lang];

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: proposalPrompt },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const generatedText = typeof messageContent === 'string' ? messageContent : "研究提案の生成に失敗しました";

        // タイトルと内容を分離
        const lines = generatedText.split("\n");
        const title = lines[0]?.replace(/^1\.\s*/, "").trim() || "新しい研究テーマ";
        const content = generatedText;

        // オープンプロブレムを抽出
        const openProblemsMatch = generatedText.match(/3\.\s*関連するオープンプロブレム[\s\S]*?(?=4\.|$)/);
        const openProblems = openProblemsMatch ? openProblemsMatch[0] : null;

        // データベースに保存
        await db.insert(researchProposals).values({
          userId: ctx.user.id,
          title,
          description: content,
          openProblems,
          sourcePaperIds: JSON.stringify(input.paperIds),
        });

        return { success: true, title, content };
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        await db
          .delete(researchProposals)
          .where(
            and(
              eq(researchProposals.id, input.id),
              eq(researchProposals.userId, ctx.user.id)
            )
          );

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
