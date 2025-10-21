import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Heart, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Recommendations() {
  const utils = trpc.useUtils();
  const { data: recommendations, isLoading } = trpc.recommendations.getForUser.useQuery({
    limit: 10,
  });

  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      utils.favorites.getUserFavorites.invalidate();
      toast.success("お気に入りに追加しました");
    },
    onError: () => {
      toast.error("お気に入りの追加に失敗しました");
    },
  });

  const handleAddFavorite = (paperId: string) => {
    addFavoriteMutation.mutate({ paperId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AIレコメンド</h1>
        <p className="text-muted-foreground mt-2">
          お気に入りや評価に基づいて、興味のある論文を推薦します
        </p>
      </div>

      {recommendations && recommendations.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {recommendations.length}件の推薦論文
          </p>

          <div className="space-y-4">
            {recommendations.map((paper: any) => (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddFavorite(paper.paperId)}
                      disabled={addFavoriteMutation.isPending}
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
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
                    <Button variant="outline" size="sm" asChild>
                      <a href={paper.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        詳細を見る
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
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

