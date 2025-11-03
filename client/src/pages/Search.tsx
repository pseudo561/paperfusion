import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { getLanguage, t } from "@/lib/i18n";
import { ExternalLink, Heart, Loader2, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Search() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"arxiv" | "semantic_scholar" | "both">("both");
  const [shouldSearch, setShouldSearch] = useState(false);
  const [searchParams, setSearchParams] = useState<{ query: string; source: "arxiv" | "semantic_scholar" | "both"; limit: number }>({ query: "", source: "both", limit: 20 });

  const utils = trpc.useUtils();
  const { data: searchResults, isLoading: isSearching } = trpc.papers.search.useQuery(
    searchParams,
    {
      enabled: shouldSearch && searchParams.query.length > 0,
    }
  );

  const toggleFavoriteMutation = trpc.favorites.toggle.useMutation({
    onSuccess: (data) => {
      utils.favorites.getUserFavorites.invalidate();
      utils.favorites.checkFavorite.invalidate();
      const lang = getLanguage();
      if (data.action === 'added') {
        toast.success(lang === 'ja' ? 'お気に入りに追加しました' : lang === 'zh' ? '已添加到收藏' : 'Added to favorites');
      } else {
        toast.success(lang === 'ja' ? 'お気に入りから削除しました' : lang === 'zh' ? '已从收藏中移除' : 'Removed from favorites');
      }
    },
    onError: () => {
      toast.error(t('error'));
    },
  });

  const handleSearch = () => {
    if (!query.trim()) {
      const lang = getLanguage();
      toast.error(lang === 'ja' ? '検索キーワードを入力してください' : lang === 'zh' ? '请输入搜索关键词' : 'Please enter search keywords');
      return;
    }

    setSearchParams({
      query: query.trim(),
      source,
      limit: 20,
    });
    setShouldSearch(true);
  };

  const handleToggleFavorite = (paperId: string, paper?: any) => {
    toggleFavoriteMutation.mutate({ 
      paperId,
      paperData: paper ? {
        title: paper.title,
        authors: paper.authors || [],
        abstract: paper.abstract,
        year: paper.publishedDate ? new Date(paper.publishedDate).getFullYear() : undefined,
        venue: paper.categories?.[0],
        url: paper.pdfUrl,
        citationCount: paper.citationsCount,
      } : undefined
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">論文検索</h1>
        <p className="text-muted-foreground mt-2">
          arXivとSemantic Scholarから最新の研究論文を検索できます
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>検索条件</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">キーワード</Label>
            <Input
              id="query"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">{t('searchSource')}</Label>
            <Select value={source} onValueChange={(v: any) => setSource(v)}>
              <SelectTrigger id="source">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">{t('both')}</SelectItem>
                <SelectItem value="arxiv">arXiv</SelectItem>
                <SelectItem value="semantic_scholar">Semantic Scholar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                検索中...
              </>
            ) : (
              <>
                <SearchIcon className="w-4 h-4 mr-2" />
                検索
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            検索結果 ({searchResults.length}件)
          </h2>

          <div className="space-y-4">
            {searchResults.map((paper: any, index: number) => (
              <PaperCard
                key={paper.id || index}
                paper={paper}
                onToggleFavorite={handleToggleFavorite}
                isTogglingFavorite={toggleFavoriteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {(!searchResults || searchResults.length === 0) && !isSearching && shouldSearch && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              検索結果が見つかりませんでした
            </p>
          </CardContent>
        </Card>
      )}

      {!shouldSearch && (
        <Card>
          <CardContent className="py-12 text-center">
            <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              キーワードを入力して検索を開始してください
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PaperCard({ paper, onToggleFavorite, isTogglingFavorite }: {
  paper: any;
  onToggleFavorite: (paperId: string, paper?: any) => void;
  isTogglingFavorite: boolean;
}) {
  const { data: favoriteStatus } = trpc.favorites.checkFavorite.useQuery(
    { paperId: paper.id },
    { enabled: !!paper.id }
  );

  const isFavorite = favoriteStatus?.isFavorite || false;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">
              {paper.title}
            </CardTitle>
            <CardDescription className="mt-2">
              {Array.isArray(paper.authors)
                ? paper.authors.slice(0, 3).join(", ")
                : "著者不明"}
              {Array.isArray(paper.authors) && paper.authors.length > 3 && " ほか"}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(paper.id, paper)}
            disabled={isTogglingFavorite}
            className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {paper.abstract && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {paper.abstract}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          {paper.publishedDate && (
            <span>
              {new Date(paper.publishedDate).toLocaleDateString("ja-JP")}
            </span>
          )}
          {paper.citationsCount !== undefined && (
            <span>引用数: {paper.citationsCount}</span>
          )}
          {paper.categories && Array.isArray(paper.categories) && (
            <span className="flex gap-1 flex-wrap">
              {paper.categories.slice(0, 2).map((cat: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs"
                >
                  {cat}
                </span>
              ))}
            </span>
          )}
        </div>

        {paper.pdfUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const viewerUrl = `/viewer?url=${encodeURIComponent(paper.pdfUrl)}&title=${encodeURIComponent(paper.title)}`;
              window.location.href = viewerUrl;
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            PDFを開く
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

