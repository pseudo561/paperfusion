import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { History as HistoryIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export default function History() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  
  const { data: history, isLoading } = trpc.history.getUserHistory.useQuery({
    category,
    limit: 50,
  });

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
        <h1 className="text-3xl font-bold text-foreground">{t('historyTitle')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('historyDescription')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('filter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Select value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="math">Mathematics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {history && history.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {history.length}{t('historyCount')}
          </p>

          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight">
                        {t('paperId')}: {item.paperId}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {t('viewedOn')}{new Date(item.viewedAt!).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    {item.category && (
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm">
                        {item.category}
                      </span>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <HistoryIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('noHistory')}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('noHistoryDesc')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
