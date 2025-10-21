import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function Proposals() {
  // TODO: Add research proposals query when implemented

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">研究テーマ提案</h1>
          <p className="text-muted-foreground mt-2">
            複数の論文から新しい研究アイデアを生成します
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          新規提案を作成
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">この機能について</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p className="text-sm">
            複数の論文を選択すると、AIがそれらの内容を分析し、新しい研究テーマを提案します。
            また、関連するオープンプロブレムの検索や自動サーベイも実行できます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            研究提案がまだありません
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            「新規提案を作成」ボタンから研究テーマの提案を開始できます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

