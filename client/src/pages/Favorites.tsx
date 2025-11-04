import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLanguage, t } from "@/lib/i18n";
import { ExternalLink, Heart, Loader2, Trash2, Tag, X, Plus, Sparkles, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function RelatedPapersButton({ paperId }: { paperId: string }) {
  const [showRelated, setShowRelated] = useState(false);
  const { data: citations, isLoading, error } = trpc.papers.getCitations.useQuery(
    { paperId },
    { enabled: showRelated }
  );

  const hasCitations = citations?.citations && citations.citations.length > 0;
  const hasReferences = citations?.references && citations.references.length > 0;
  const hasAnyRelated = hasCitations || hasReferences;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowRelated(!showRelated)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('relatedSearching')}
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            {showRelated ? t('relatedClose') : t('relatedSearch')}
          </>
        )}
      </Button>
      
      {showRelated && !isLoading && (
        <div className="mt-4 p-4 bg-muted rounded-lg space-y-3 w-full">
          {error && (
            <p className="text-sm text-destructive">
              {t('relatedError')}
            </p>
          )}
          
          {!error && !hasAnyRelated && (
            <p className="text-sm text-muted-foreground">
              {t('relatedNotFound')}
            </p>
          )}
          
          {hasCitations && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t('citedBy')} ({citations.citations.length}{t('citedByCount')})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {citations.citations.slice(0, 5).map((paper: any, index: number) => (
                  <div key={index} className="text-sm p-2 bg-background rounded border">
                    <p className="font-medium">{paper.title}</p>
                    {paper.authors && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {paper.authors.slice(0, 2).map((a: any) => a.name).join(", ")}
                        {paper.authors.length > 2 && ` ${t('andOthers')}`}
                      </p>
                    )}
                    {paper.year && (
                      <p className="text-xs text-muted-foreground">{paper.year}{t('yearSuffix')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {hasReferences && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">{t('references')} ({citations.references.length}{t('referencesCount')})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {citations.references.slice(0, 5).map((paper: any, index: number) => (
                  <div key={index} className="text-sm p-2 bg-background rounded border">
                    <p className="font-medium">{paper.title}</p>
                    {paper.authors && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {paper.authors.slice(0, 2).map((a: any) => a.name).join(", ")}
                        {paper.authors.length > 2 && ` ${t('andOthers')}`}
                      </p>
                    )}
                    {paper.year && (
                      <p className="text-xs text-muted-foreground">{paper.year}{t('yearSuffix')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function Favorites() {
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const utils = trpc.useUtils();
  
  const { data: favorites, isLoading } = trpc.favorites.getUserFavorites.useQuery(
    selectedTag ? { tag: selectedTag } : undefined
  );

  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      utils.favorites.getUserFavorites.invalidate();
      toast.success(t('toastFavoriteRemoved'));
    },
    onError: () => {
      toast.error(t('toastRemoveFailed'));
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
        <h1 className="text-3xl font-bold text-foreground">{t('favoritesTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('favoritesDescription')}
        </p>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('filterByTag')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={selectedTag === undefined ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(undefined)}
              >
                {t('all')}
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {favorites.length}{t('favoritesCount')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsBulkGenerating(true);
                let successCount = 0;
                let errorCount = 0;
                
                for (const favorite of favorites) {
                  try {
                    const paperData = await utils.client.papers.getById.query({ id: favorite.paperId });
                    if (paperData?.title) {
                      await utils.client.favorites.generateTags.mutate({
                        paperId: favorite.paperId,
                        title: paperData.title,
                        abstract: paperData.abstract || undefined,
                        language: getLanguage(),
                      });
                      successCount++;
                    }
                  } catch (error) {
                    errorCount++;
                  }
                }
                
                setIsBulkGenerating(false);
                utils.favorites.getUserFavorites.invalidate();
                
                if (successCount > 0) {
                  toast.success(`${successCount}${t('toastBulkGenerated')}`);
                }
                if (errorCount > 0) {
                  toast.error(`${errorCount}${t('toastBulkGenerateFailed')}`);
                }
              }}
              disabled={isBulkGenerating}
            >
              {isBulkGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('bulkGenerating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('bulkGenerate')}
                </>
              )}
            </Button>
          </div>

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
                ? `${t('tagPrefix')}${selectedTag}${t('tagSuffix')}${t('noFavoritesWithTag')}`
                : t('noFavorites')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('noFavoritesDesc')}
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
      toast.success(t('toastTagsUpdated'));
      setIsEditingTags(false);
    },
    onError: () => {
      toast.error(t('toastTagsUpdateFailed'));
    },
  });

  const generateTagsMutation = trpc.favorites.generateTags.useMutation({
    onSuccess: (data) => {
      utils.favorites.getUserFavorites.invalidate();
      setTags(data.tags);
      toast.success(t('toastTagsGenerated'));
    },
    onError: () => {
      toast.error(t('toastTagsGenerateFailed'));
    },
  });

  const { data: paperData, isLoading: isPaperLoading } = trpc.papers.getById.useQuery(
    { id: favorite.paperId },
    { enabled: !!favorite.paperId }
  );

  // paperDataがnullの場合の処理
  if (isPaperLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!paperData) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">
                {t('paperId')}: {favorite.paperId}
              </CardTitle>
              <CardDescription className="mt-2">
                {t('paperNotFound')}
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
      </Card>
    );
  }

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
              {paperData?.title || `${t('paperId')}: ${favorite.paperId}`}
            </CardTitle>
            <CardDescription className="mt-2">
              {paperData?.authors && typeof paperData.authors === 'string'
                ? paperData.authors
                : new Date(favorite.createdAt!).toLocaleDateString(getLanguage() === 'ja' ? 'ja-JP' : getLanguage() === 'zh' ? 'zh-CN' : 'en-US', {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) + t('addedOn')}
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
            <span className="text-sm font-medium">{t('tags')}</span>
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
              {generateTagsMutation.isPending ? t('aiGenerating') : t('aiGenerate')}
            </Button>
            <Dialog open={isEditingTags} onOpenChange={setIsEditingTags}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Plus className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('addTag')}</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('newTag')}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddTag();
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} disabled={updateTagsMutation.isPending}>
                    {t('add')}
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
              <span className="text-xs text-muted-foreground">{t('noTags')}</span>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
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
              {t('openPdf')}
            </Button>
          )}
        </div>
        
        <RelatedPapersButton paperId={favorite.paperId} />
      </CardContent>
    </Card>
  );
}
