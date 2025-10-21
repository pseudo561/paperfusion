import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ExternalLink, Heart, Loader2, Trash2, Tag, X, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Favorites() {
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const utils = trpc.useUtils();
  
  const { data: favorites, isLoading } = trpc.favorites.getUserFavorites.useQuery(
    selectedTag ? { tag: selectedTag } : undefined
  );

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

  // すべてのタグを収集
  const allTags = favorites
    ? Array.from(
        new Set(
          favorites.flatMap((f) => {
            if (!f.tags) return [];
            try {
              return JSON.parse(f.tags as string);
            } catch {
              return [];
            }
          })
        )
      )
    : [];

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

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">タグでフィルター</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={selectedTag === undefined ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(undefined)}
              >
                すべて
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {favorites && favorites.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {favorites.length}件の論文を保存しています
          </p>

          <div className="space-y-4">
            {favorites.map((favorite) => (
              <FavoriteCard
                key={favorite.id}
                favorite={favorite}
                onRemove={handleRemoveFavorite}
                isRemoving={removeFavoriteMutation.isPending}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {selectedTag
                ? `タグ「${selectedTag}」の論文がありません`
                : "まだお気に入りの論文がありません"}
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

function FavoriteCard({
  favorite,
  onRemove,
  isRemoving,
}: {
  favorite: any;
  onRemove: (paperId: string) => void;
  isRemoving: boolean;
}) {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>(() => {
    if (!favorite.tags) return [];
    try {
      return JSON.parse(favorite.tags as string);
    } catch {
      return [];
    }
  });

  const utils = trpc.useUtils();
  const updateTagsMutation = trpc.favorites.updateTags.useMutation({
    onSuccess: () => {
      utils.favorites.getUserFavorites.invalidate();
      toast.success("タグを更新しました");
      setIsEditingTags(false);
    },
    onError: () => {
      toast.error("タグの更新に失敗しました");
    },
  });

  const generateTagsMutation = trpc.favorites.generateTags.useMutation({
    onSuccess: (data) => {
      utils.favorites.getUserFavorites.invalidate();
      setTags(data.tags);
      toast.success("タAIグを生成しました");
    },
    onError: () => {
      toast.error("タグの生成に失敗しました");
    },
  });

  const { data: paperData } = trpc.papers.getById.useQuery(
    { id: favorite.paperId },
    { enabled: !!favorite.paperId }
  );

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    setNewTag("");
    updateTagsMutation.mutate({
      paperId: favorite.paperId,
      tags: updatedTags,
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    updateTagsMutation.mutate({
      paperId: favorite.paperId,
      tags: updatedTags,
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight">
              {paperData?.title || `論文ID: ${favorite.paperId}`}
            </CardTitle>
            <CardDescription className="mt-2">
              {paperData?.authors && typeof paperData.authors === 'string'
                ? paperData.authors
                : new Date(favorite.createdAt!).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) + "に追加"}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(favorite.paperId)}
            disabled={isRemoving}
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {paperData?.abstract && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {paperData.abstract}
          </p>
        )}

        {/* Tags Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">タグ</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => {
                if (paperData?.title) {
                  generateTagsMutation.mutate({
                    paperId: favorite.paperId,
                    title: paperData.title,
                    abstract: paperData.abstract || undefined,
                  });
                }
              }}
              disabled={generateTagsMutation.isPending}
            >
              {generateTagsMutation.isPending ? "AI生成中..." : "AIタグ生成"}
            </Button>
            <Dialog open={isEditingTags} onOpenChange={setIsEditingTags}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Plus className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>タグを追加</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                  <Input
                    placeholder="新しいタグ"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag();
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} disabled={updateTagsMutation.isPending}>
                    追加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">タグなし</span>
            )}
          </div>
        </div>

        {paperData?.pdfUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const viewerUrl = `/viewer?url=${encodeURIComponent(paperData.pdfUrl || '')}&title=${encodeURIComponent(paperData.title || '')}`;
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

