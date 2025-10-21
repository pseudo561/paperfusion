import axios from "axios";

const SEMANTIC_SCHOLAR_API_BASE = "https://api.semanticscholar.org/graph/v1";

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract?: string;
  year?: number;
  authors: Array<{ name: string; authorId?: string }>;
  citationCount: number;
  referenceCount: number;
  url: string;
  venue?: string;
  publicationDate?: string;
}

export interface Citation {
  paperId: string;
  title: string;
  authors: Array<{ name: string }>;
  year?: number;
}

const DEFAULT_FIELDS = [
  "paperId",
  "title",
  "abstract",
  "year",
  "authors",
  "citationCount",
  "referenceCount",
  "url",
  "venue",
  "publicationDate",
].join(",");

export async function searchSemanticScholar(
  query: string,
  limit = 20,
  offset = 0
): Promise<SemanticScholarPaper[]> {
  try {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      offset: offset.toString(),
      fields: DEFAULT_FIELDS,
    });

    const response = await axios.get(
      `${SEMANTIC_SCHOLAR_API_BASE}/paper/search?${params.toString()}`
    );

    return response.data?.data || [];
  } catch (error) {
    console.error("Error searching Semantic Scholar:", error);
    return [];
  }
}

export async function getSemanticScholarPaper(
  paperId: string
): Promise<SemanticScholarPaper | null> {
  try {
    const response = await axios.get(
      `${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}?fields=${DEFAULT_FIELDS}`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching Semantic Scholar paper:", error);
    return null;
  }
}

export async function getPaperCitations(
  paperId: string,
  limit = 100
): Promise<Citation[]> {
  try {
    const response = await axios.get(
      `${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}/citations?fields=paperId,title,authors,year&limit=${limit}`
    );

    return response.data?.data?.map((item: any) => item.citedPaper) || [];
  } catch (error) {
    console.error("Error fetching citations:", error);
    return [];
  }
}

export async function getPaperReferences(
  paperId: string,
  limit = 100
): Promise<Citation[]> {
  try {
    const response = await axios.get(
      `${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}/references?fields=paperId,title,authors,year&limit=${limit}`
    );

    return response.data?.data?.map((item: any) => item.citedPaper) || [];
  } catch (error) {
    console.error("Error fetching references:", error);
    return [];
  }
}

// レート制限対策のための遅延関数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getRecommendedPapers(
  paperId: string,
  limit = 10
): Promise<SemanticScholarPaper[]> {
  try {
    // まずSemantic Scholar IDを取得
    let semanticScholarId = paperId;
    
    // arXiv IDの場合は変換
    if (paperId.includes('v') || paperId.match(/^\d{4}\.\d{5}$/)) {
      const arxivId = paperId.replace(/v\d+$/, ''); // v1等のバージョンを削除
      
      // レート制限対策：リクエスト間に遅延を追加
      await delay(1000);
      
      const paperResponse = await axios.get(
        `${SEMANTIC_SCHOLAR_API_BASE}/paper/ARXIV:${arxivId}?fields=paperId`
      );
      semanticScholarId = paperResponse.data?.paperId;
      if (!semanticScholarId) {
        console.error(`Could not find Semantic Scholar ID for arXiv:${arxivId}`);
        return [];
      }
    }

    // レート制限対策：リクエスト間に遅延を追加
    await delay(1000);

    // 正しいエンドポイントを使用
    const response = await axios.get(
      `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${semanticScholarId}?fields=${DEFAULT_FIELDS}&limit=${limit}`
    );

    return response.data?.recommendedPapers || [];
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded for Semantic Scholar API");
    } else {
      console.error("Error fetching recommendations:", error);
    }
    return [];
  }
}

export async function searchPapersByArxivId(
  arxivId: string
): Promise<SemanticScholarPaper | null> {
  try {
    const response = await axios.get(
      `${SEMANTIC_SCHOLAR_API_BASE}/paper/ARXIV:${arxivId}?fields=${DEFAULT_FIELDS}`
    );

    return response.data;
  } catch (error) {
    console.error("Error searching by arXiv ID:", error);
    return null;
  }
}

