import axios from "axios";
import { parseStringPromise } from "xml2js";

const ARXIV_API_BASE = "http://export.arxiv.org/api/query";

export interface ArxivPaper {
  id: string;
  arxivId: string;
  title: string;
  authors: string[];
  abstract: string;
  categories: string[];
  publishedDate: Date;
  pdfUrl: string;
}

export async function searchArxiv(
  query: string,
  maxResults = 20,
  start = 0
): Promise<ArxivPaper[]> {
  try {
    const params = new URLSearchParams({
      search_query: query,
      start: start.toString(),
      max_results: maxResults.toString(),
      sortBy: "relevance",
      sortOrder: "descending",
    });

    const response = await axios.get(`${ARXIV_API_BASE}?${params.toString()}`);
    const xmlData = response.data;

    const parsed = await parseStringPromise(xmlData);
    const entries = parsed.feed?.entry || [];

    if (!Array.isArray(entries)) {
      return entries ? [parseArxivEntry(entries)] : [];
    }

    return entries.map(parseArxivEntry);
  } catch (error) {
    console.error("Error fetching from arXiv:", error);
    return [];
  }
}

export async function getArxivPaperById(arxivId: string): Promise<ArxivPaper | null> {
  try {
    const params = new URLSearchParams({
      id_list: arxivId,
    });

    const response = await axios.get(`${ARXIV_API_BASE}?${params.toString()}`);
    const xmlData = response.data;

    const parsed = await parseStringPromise(xmlData);
    const entries = parsed.feed?.entry || [];

    if (!entries || entries.length === 0) {
      return null;
    }

    return parseArxivEntry(Array.isArray(entries) ? entries[0] : entries);
  } catch (error) {
    console.error("Error fetching arXiv paper by ID:", error);
    return null;
  }
}

function parseArxivEntry(entry: any): ArxivPaper {
  const id = entry.id?.[0] || "";
  const arxivId = id.split("/abs/")[1] || id;

  const title = (entry.title?.[0] || "").trim().replace(/\s+/g, " ");
  
  const authors = Array.isArray(entry.author)
    ? entry.author.map((a: any) => a.name?.[0] || "")
    : entry.author?.name
    ? [entry.author.name[0]]
    : [];

  const abstract = (entry.summary?.[0] || "").trim().replace(/\s+/g, " ");

  const categories = Array.isArray(entry.category)
    ? entry.category.map((c: any) => c.$.term)
    : entry.category?.$?.term
    ? [entry.category.$.term]
    : [];

  const publishedDate = new Date(entry.published?.[0] || Date.now());

  const links = Array.isArray(entry.link) ? entry.link : [entry.link];
  const pdfLink = links.find((l: any) => l.$?.type === "application/pdf");
  const pdfUrl = pdfLink?.$?.href || `http://arxiv.org/pdf/${arxivId}.pdf`;

  return {
    id: arxivId,
    arxivId,
    title,
    authors,
    abstract,
    categories,
    publishedDate,
    pdfUrl,
  };
}

export function buildArxivQuery(options: {
  title?: string;
  author?: string;
  abstract?: string;
  category?: string;
  all?: string;
}): string {
  const parts: string[] = [];

  if (options.title) {
    parts.push(`ti:${options.title}`);
  }
  if (options.author) {
    parts.push(`au:${options.author}`);
  }
  if (options.abstract) {
    parts.push(`abs:${options.abstract}`);
  }
  if (options.category) {
    parts.push(`cat:${options.category}`);
  }
  if (options.all) {
    parts.push(`all:${options.all}`);
  }

  return parts.join(" AND ");
}

