import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Heart, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

function RecommendationFavoriteButton({ paperId, paper, onToggle, isToggling }: {
  paperId: string;
  paper?: any;
  onToggle: (paperId: string, paper?: any) => void;
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
      onClick={() => onToggle(paperId, paper)}
      disabled={isToggling}
      className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
    >
      <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
    </Button>
  );
}

export default function Recommendations() {
  const utils = trpc.useUtils();
  const [, setLocation] = useLocation();
  const [displayCount, setDisplayCount] = useState(10);
  const [allRecommendations, setAllRecommendations] = useState<any[]>([]);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // 認証済みの場合のみレコメンドを取得
  const { data: recommendations, isLoading, error } = trpc.recommendations.getForUser.useQuery({
    limit: 50,
  }, {
    enabled: isAuthenticated && !authLoading, // 認証済みかつ認証チェック完了後のみ実行
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
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

  const handleToggleFavorite = (paperId: string, paper?: any) => {
    toggleFavoriteMutation.mutate({ 
      paperId,
      paperData: paper ? {
        title: paper.title,
        authors: paper.authors?.map((a: any) => a.name) || [],
        abstract: paper.abstract,
        year: paper.year,
        venue: paper.venue,
        url: paper.url,
        citationCount: paper.citationCount,
      } : undefined
    });
  };

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + 10, allRecommendations.length));
  };

  // 認証チェック中
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">認証状態を確認しています...</p>
        </div>
      </div>
    );
  }

  // 未認証
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">ログインが必要です</h2>
          <p className="text-muted-foreground mb-6">
            AIレコメンド機能を使用するには、ログインしてお気に入り論文を追加してください。
          </p>
          <Button onClick={() => setLocation("/")}>
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  // レコメンド取得中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">推薦論文を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  // エラー発生
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-destructive mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">エラーが発生しました</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || "推薦論文の取得に失敗しました"}
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              お気に入り論文を追加すると、AIが関連する論文を推薦します。
            </p>
            <Button onClick={() => setLocation("/favorites")}>
              お気に入りページへ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // お気に入りがない場合
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AIレコメンド</h1>
          <p className="text-muted-foreground">
            お気に入りや評価から興味のある論文を推薦
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center max-w-md">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">推薦論文がありません</h2>
            <p className="text-muted-foreground mb-6">
              お気に入りに論文を追加すると、AIが関連する論文を自動的に推薦します。
            </p>
            <Button onClick={() => setLocation("/search")}>
              論文を検索
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayedRecommendations = allRecommendations.slice(0, displayCount);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AIレコメンド</h1>
        <p className="text-muted-foreground">
          お気に入りや評価から興味のある論文を推薦
        </p>
      </div>

      <div className="space-y-4">
        {displayedRecommendations.map((paper: any) => (
          <div
            key={paper.paperId}
            className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{paper.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {paper.authors?.map((a: any) => a.name).join(", ") || "著者不明"}
                </p>
                {paper.abstract && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {paper.abstract}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {paper.year && <span>{paper.year}年</span>}
                  {paper.citationCount !== undefined && (
                    <span>引用数: {paper.citationCount}</span>
                  )}
                  {paper.venue && <span>{paper.venue}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <RecommendationFavoriteButton
                  paperId={paper.paperId}
                  paper={paper}
                  onToggle={handleToggleFavorite}
                  isToggling={toggleFavoriteMutation.isPending}
                />
                {paper.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setLocation(`/paper-viewer?url=${encodeURIComponent(paper.url)}`)}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayCount < allRecommendations.length && (
        <div className="mt-8 text-center">
          <Button onClick={handleLoadMore} variant="outline" size="lg">
            さらに表示 ({allRecommendations.length - displayCount}件)
          </Button>
        </div>
      )}
    </div>
  );
}

