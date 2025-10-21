import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Favorites() {
  const utils = trpc.useUtils();
  const { data: favorites, isLoading } = trpc.favorites.getUserFavorites.useQuery();

  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.getUserFavorites.invalidate();
      toast.success("お気に入りから削除しました");
    },
    onError: () => {
      toast.error("削除に失敗しました");
    },
  });

  const handleRemoveFavorite = (paperId: string) => {
    removeFavoriteMutation.mutate({ paperId });
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
        <h1 className="text-3xl font-bold text-foreground">お気に入り</h1>
        <p className="text-muted-foreground mt-2">
          保存した論文を管理できます
        </p>
      </div>

      {favorites && favorites.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {favorites.length}件の論文を保存しています
          </p>

          <div className="space-y-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight">
                        論文ID: {favorite.paperId}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {new Date(favorite.createdAt!).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}に追加
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFavorite(favorite.paperId)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              まだお気に入りの論文がありません
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              検索ページで論文を見つけてお気に入りに追加しましょう
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

