import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function PaperViewer() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  // URLパラメータからPDF URLを取得
  const params = new URLSearchParams(window.location.search);
  const pdfUrl = params.get("url");
  const title = params.get("title") || t('viewerTitle');

  if (!pdfUrl) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('viewerBack')}
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t('viewerNoUrl')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Google Docs Viewerを使用してPDFを表示
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('viewerBack')}
        </Button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('viewerOpenInNewTab')}
          </a>
        </Button>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('viewerLoading')}</p>
            </div>
          </div>
        )}
        <iframe
          src={viewerUrl}
          className="w-full h-full"
          style={{ minHeight: "calc(100vh - 200px)" }}
          title={title}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            console.error("Failed to load PDF");
          }}
        />
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {t('viewerTroubleshoot')}
      </div>
    </div>
  );
}
