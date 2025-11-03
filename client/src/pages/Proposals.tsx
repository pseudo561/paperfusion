import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { getLanguage, t } from "@/lib/i18n";
import { FileText, Lightbulb, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Proposals() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const utils = trpc.useUtils();

  // お気に入り論文を取得
  const { data: favorites, isLoading: favoritesLoading } = trpc.favorites.getUserFavorites.useQuery();

  // 研究提案を取得
  const { data: proposals, isLoading: proposalsLoading } = trpc.proposals.list.useQuery();

  // 研究提案を生成
  const generateProposal = trpc.proposals.generate.useMutation({
    onSuccess: () => {
      toast.success(t('proposalGenerated'));
      utils.proposals.list.invalidate();
      setIsCreateDialogOpen(false);
      setSelectedPapers([]);
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(`${t('error')}: ${error.message}`);
      setIsGenerating(false);
    },
  });

  // 研究提案を削除
  const deleteProposal = trpc.proposals.delete.useMutation({
    onSuccess: () => {
      toast.success(t('proposalDeleted'));
      utils.proposals.list.invalidate();
    },
    onError: (error) => {
      toast.error(`${t('error')}: ${error.message}`);
    },
  });

  const handleGenerateProposal = async () => {
    if (selectedPapers.length === 0) {
      toast.error(t('selectAtLeastOne'));
      return;
    }

    setIsGenerating(true);
    generateProposal.mutate({ 
      paperIds: selectedPapers,
      language: getLanguage()
    });
  };

  const handleTogglePaper = (paperId: string) => {
    setSelectedPapers((prev) =>
      prev.includes(paperId) ? prev.filter((id) => id !== paperId) : [...prev, paperId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('researchProposals')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('researchProposalsDesc')}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('createNewProposal')}
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">{t('aboutThisFeature')}</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p className="text-sm">
            {t('proposalFeatureDesc')}
          </p>
        </CardContent>
      </Card>

      {proposalsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : proposals && proposals.length > 0 ? (
        <div className="grid gap-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      {proposal.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString("ja-JP") : ""}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("この研究提案を削除しますか？")) {
                        deleteProposal.mutate({ id: proposal.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">提案内容</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proposal.description}
                  </p>
                </div>
                {proposal.openProblems && (
                  <div>
                    <h4 className="font-semibold mb-2">関連するオープンプロブレム</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {proposal.openProblems}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('noProposalsYet')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('noProposalsDesc')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 新規提案作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              {t('selectPapersForProposal')}
            </DialogTitle>
            <DialogDescription>
              {t('proposalFeatureDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {favoritesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="space-y-2">
                {favorites.map((favorite: any) => {
                  const paper = favorite.paper;
                  if (!paper) return null;

                  return (
                    <div
                      key={favorite.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                      onClick={() => handleTogglePaper(favorite.paperId)}
                    >
                      <Checkbox
                        checked={selectedPapers.includes(favorite.paperId)}
                        onCheckedChange={() => handleTogglePaper(favorite.paperId)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{paper.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {paper.authors}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('noFavoritesForProposal')}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isGenerating}>
              {t('cancel')}
            </Button>
            <Button onClick={handleGenerateProposal} disabled={selectedPapers.length === 0 || isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('generateProposal')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

