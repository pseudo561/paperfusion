import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { t } from "@/lib/i18n";
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
      title: t('featureSearchTitle'),
      description: t('featureSearchDesc'),
      link: "/search",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Lightbulb,
      title: t('featureRecommendTitle'),
      description: t('featureRecommendDesc'),
      link: "/recommendations",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Heart,
      title: t('featureFavoritesTitle'),
      description: t('featureFavoritesDesc'),
      link: "/favorites",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: TrendingUp,
      title: t('featureProposalsTitle'),
      description: t('featureProposalsDesc'),
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
          {t('welcomeTitle')}{APP_TITLE}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('homeDescription')}
        </p>
        {isAuthenticated && user && (
          <p className="text-lg text-primary font-medium">
            {t('greeting')}{user.name || user.email}{t('greetingSuffix') !== '' ? t('greetingSuffix') : ''}
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
                {t('statsFavorites')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {favorites?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('statsFavoritesDesc')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('statsHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {history?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('statsHistoryDesc')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('statsAccuracy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {favorites && favorites.length > 0 ? t('statsAccuracyHigh') : t('statsAccuracyPreparing')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('statsAccuracyDesc')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CTA Section */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">{t('ctaTitle')}</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {t('ctaDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/search">
            <Button variant="secondary" size="lg" className="w-full md:w-auto">
              <Search className="w-5 h-5 mr-2" />
              {t('ctaSearchButton')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
