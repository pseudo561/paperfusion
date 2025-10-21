import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function PaperViewer() {
  const [, setLocation] = useLocation();
  
  // URLパラメータからPDF URLを取得
  const params = new URLSearchParams(window.location.search);
  const pdfUrl = params.get("url");
  const title = params.get("title") || "論文閲覧";

  if (!pdfUrl) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              PDFのURLが指定されていません
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold truncate max-w-md">{title}</h1>
          <Button variant="outline" size="sm" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              新しいタブで開く
            </a>
          </Button>
        </div>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden bg-white">
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          style={{ minHeight: "calc(100vh - 200px)" }}
          title={title}
        />
      </div>
    </div>
  );
}

