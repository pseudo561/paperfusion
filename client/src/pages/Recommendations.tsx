import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Heart, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

function RecommendationFavoriteButton({ paperId, onToggle, isToggling }: {
  paperId: string;
  onToggle: (paperId: string) => void;
  isToggling: boolean;
}) {
  const { data: favoriteStatus } = trpc.favorites.checkFavorite.useQuery(
    { paperId },
    { enabled: !!paperId }
  );

  const isFavorite = favoriteStatus?.isFavorite || false;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onToggle(paperId)}
      disabled={isToggling}
      className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
    >
      <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  );
}

export default function Recommendations() {
  const utils = trpc.useUtils();
  const [displayCount, setDisplayCount] = useState(10);
  const [allRecommendations, setAllRecommendations] = useState<any[]>([]);

  const { data: recommendations, isLoading } = trpc.recommendations.getForUser.useQuery({
    limit: 50, // より多くの推薦を取得
  });

  useEffect(() => {
    if (recommendations) {
      setAllRecommendations(recommendations);
    }
  }, [recommendations]);

  const toggleFavoriteMutation = trpc.favorites.toggle.useMutation({
    onSuccess: (data) => {
      utils.favorites.getUserFavorites.invalidate();
      utils.favorites.checkFavorite.invalidate();
      if (data.action === 'added') {
        toast.success("お気に入りに追加しました");
      } else {
        toast.success("お気に入りから削除しました");
      }
    },
    onError: () => {
      toast.error("操作に失敗しました");
    },
  });

  const handleToggleFavorite = (paperId: string) => {
    toggleFavoriteMutation.mutate({ paperId });
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 10, allRecommendations.length));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayedRecommendations = allRecommendations.slice(0, displayCount);
  const hasMore = displayCount < allRecommendations.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AIレコメンド</h1>
        <p className="text-muted-foreground mt-2">
          お気に入りや評価に基づいて、興味のある論文を推薦します
        </p>
      </div>

      {allRecommendations && allRecommendations.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {allRecommendations.length}件の推薦論文（{displayCount}件表示中）
          </p>

          <div className="space-y-4">
            {displayedRecommendations.map((paper: any) => (
              <Card key={paper.paperId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight">
                        {paper.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {paper.authors?.slice(0, 3).map((a: any) => a.name).join(", ")}
                        {paper.authors?.length > 3 && " ほか"}
                      </CardDescription>
                    </div>
                    <RecommendationFavoriteButton
                      paperId={paper.paperId}
                      onToggle={handleToggleFavorite}
                      isToggling={toggleFavoriteMutation.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paper.abstract && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {paper.abstract}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {paper.year && <span>{paper.year}年</span>}
                    {paper.citationCount !== undefined && (
                      <span>引用数: {paper.citationCount}</span>
                    )}
                    {paper.venue && (
                      <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded text-xs">
                        {paper.venue}
                      </span>
                    )}
                  </div>

                  {paper.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const viewerUrl = `/viewer?url=${encodeURIComponent(paper.url)}&title=${encodeURIComponent(paper.title)}`;
                        window.location.href = viewerUrl;
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      PDFを開く
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="text-center py-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                className="w-full max-w-md"
                size="lg"
              >
                さらに表示 ({allRecommendations.length - displayCount}件)
              </Button>
            </div>
          )}

          {!hasMore && allRecommendations.length > 10 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              すべての推薦論文を表示しました
            </p>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              推薦論文を生成できません
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              お気に入りに論文を追加すると、AIが関連する論文を推薦します
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

