import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, Heart, History, Lightbulb, Search, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: favorites } = trpc.favorites.getUserFavorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: history } = trpc.history.getUserHistory.useQuery(
    { limit: 5 },
    { enabled: isAuthenticated }
  );

  const features = [
    {
      icon: Search,
      title: "論文検索",
      description: "arXivとSemantic Scholarから最新の論文を検索",
      link: "/search",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Lightbulb,
      title: "AIレコメンド",
      description: "お気に入りや評価から興味のある論文を推薦",
      link: "/recommendations",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Heart,
      title: "お気に入り管理",
      description: "重要な論文をブックマークして整理",
      link: "/favorites",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: TrendingUp,
      title: "研究テーマ提案",
      description: "複数の論文から新しい研究アイデアを生成",
      link: "/proposals",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold text-foreground">
          {APP_TITLE}へようこそ
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI駆動の論文検索・レコメンドプラットフォーム。最新の研究を発見し、新しいアイデアを創出しましょう。
        </p>
        {isAuthenticated && user && (
          <p className="text-lg text-primary font-medium">
            こんにちは、{user.name || user.email}さん
          </p>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.link} href={feature.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      {isAuthenticated && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                お気に入り
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {favorites?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                保存された論文
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                閲覧履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {history?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                最近の閲覧
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                推薦精度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {favorites && favorites.length > 0 ? "高" : "準備中"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                お気に入りを増やして精度向上
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA Section */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">今すぐ始めましょう</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            キーワードを入力して、関心のある論文を検索してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/search">
            <Button variant="secondary" size="lg" className="w-full md:w-auto">
              <Search className="w-5 h-5 mr-2" />
              論文を検索
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

