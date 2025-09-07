import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Palette, 
  Gamepad2, 
  Plus, 
  TrendingUp, 
  Users, 
  Heart,
  Play,
  Settings,
  Crown,
  Zap,
  Target,
  Trophy
} from "lucide-react";
import type { Game, Drawing } from "@shared/schema";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's games
  const { data: games = [], isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    enabled: isAuthenticated,
  });

  // Fetch user's drawings
  const { data: drawings = [], isLoading: drawingsLoading } = useQuery<Drawing[]>({
    queryKey: ["/api/drawings"],
    enabled: isAuthenticated,
  });

  // Like game mutation
  const likeMutation = useMutation({
    mutationFn: async (gameId: string) => {
      await apiRequest("POST", `/api/games/${gameId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to like game",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4 pulse-animation">
            <Palette className="text-white" size={24} />
          </div>
          <p className="text-muted-foreground">Loading your creative space...</p>
        </div>
      </div>
    );
  }

  const subscription = user?.subscription;
  const isProUser = subscription?.plan === 'pro' || subscription?.plan === 'school';
  const gamesThisMonth = subscription?.gamesCreatedThisMonth || 0;
  const maxGames = subscription?.maxGamesPerMonth || 3;
  const canCreateMore = isProUser || gamesThisMonth < maxGames;

  const totalLikes = games.reduce((sum, game) => sum + (game.likes || 0), 0);
  const totalPlays = games.reduce((sum, game) => sum + (game.plays || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4" data-testid="welcome-title">
            Welcome back, {user?.firstName || 'Creator'}! 🎨
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Ready to turn your imagination into playable games?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/create">
              <Button className="btn-coral" data-testid="button-create-new">
                <Plus className="mr-2" />
                Create New Game
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" data-testid="button-browse-gallery">
                <Users className="mr-2" />
                Browse Community
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center mr-4">
                  <Gamepad2 className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-games-created">{games.length}</p>
                  <p className="text-sm text-muted-foreground">Games Created</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-turquoise rounded-lg flex items-center justify-center mr-4">
                  <Heart className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-likes">{totalLikes}</p>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center mr-4">
                  <Play className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-total-plays">{totalPlays}</p>
                  <p className="text-sm text-muted-foreground">Total Plays</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange rounded-lg flex items-center justify-center mr-4">
                  <Palette className="text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground" data-testid="stat-drawings-count">{drawings.length}</p>
                  <p className="text-sm text-muted-foreground">Drawings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${isProUser ? 'bg-gold' : 'bg-muted'} rounded-lg flex items-center justify-center mr-4`}>
                  {isProUser ? (
                    <Crown className="text-white" />
                  ) : (
                    <Target className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground" data-testid="subscription-plan">
                    {subscription?.plan === 'pro' ? 'Pro Creator' : 
                     subscription?.plan === 'school' ? 'School Edition' : 'Free Explorer'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isProUser ? 'Unlimited games this month' : `${gamesThisMonth}/${maxGames} games used this month`}
                  </p>
                </div>
              </div>
              
              {!isProUser && (
                <Button className="btn-gold" data-testid="button-upgrade">
                  <Zap className="mr-2" size={16} />
                  Upgrade to Pro
                </Button>
              )}
            </div>
            
            {!isProUser && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Usage</span>
                  <span data-testid="usage-fraction">{gamesThisMonth}/{maxGames}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-coral h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(gamesThisMonth / maxGames) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Games */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-primary">Your Recent Games</h2>
              <Link href="/gallery">
                <Button variant="ghost" size="sm" data-testid="button-view-all-games">
                  View All
                </Button>
              </Link>
            </div>
            
            {gamesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : games.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2" data-testid="no-games-title">No games yet</h3>
                  <p className="text-muted-foreground mb-4">Start creating your first game!</p>
                  <Link href="/create">
                    <Button className="btn-coral" data-testid="button-create-first-game">
                      <Plus className="mr-2" />
                      Create Your First Game
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {games.slice(0, 3).map((game) => (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1" data-testid={`game-title-${game.id}`}>
                            {game.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2" data-testid={`game-type-${game.id}`}>
                            {game.gameType} • {new Date(game.createdAt || '').toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center" data-testid={`game-likes-${game.id}`}>
                              <Heart size={12} className="mr-1" />
                              {game.likes || 0}
                            </span>
                            <span className="flex items-center" data-testid={`game-plays-${game.id}`}>
                              <Play size={12} className="mr-1" />
                              {game.plays || 0} plays
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => likeMutation.mutate(game.id)}
                            disabled={likeMutation.isPending}
                            data-testid={`button-like-${game.id}`}
                          >
                            <Heart size={14} />
                          </Button>
                          <Button
                            size="sm"
                            className="btn-turquoise"
                            onClick={() => window.open(`/game/${game.id}`, '_blank')}
                            data-testid={`button-play-${game.id}`}
                          >
                            <Play size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-heading text-2xl text-primary mb-6">Quick Actions</h2>
            
            <div className="space-y-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/create">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-coral rounded-lg flex items-center justify-center mr-4">
                        <Plus className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Create New Game</h3>
                        <p className="text-sm text-muted-foreground">
                          {canCreateMore ? 'Start with a drawing' : 'Upgrade to create more'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/gallery">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-turquoise rounded-lg flex items-center justify-center mr-4">
                        <TrendingUp className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Explore Community</h3>
                        <p className="text-sm text-muted-foreground">Discover amazing games</p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center mr-4">
                      <Settings className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Account Settings</h3>
                      <p className="text-sm text-muted-foreground">Manage your profile</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isProUser && (
                <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center mr-4">
                        <Crown className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Upgrade to Pro</h3>
                        <p className="text-sm text-muted-foreground">Unlimited games & features</p>
                      </div>
                    </div>
                    <Button className="btn-gold w-full mt-4" data-testid="button-upgrade-pro">
                      <Trophy className="mr-2" size={16} />
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
