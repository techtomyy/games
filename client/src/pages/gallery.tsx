import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Heart,
  Play,
  Share2,
  ExternalLink,
  TrendingUp,
  Clock,
  Star,
  Users,
  Gamepad2,
  Filter,
  Grid3X3,
  List
} from "lucide-react";
import type { Game } from "@shared/schema";

interface PublicGame extends Game {
  creator?: {
    firstName?: string;
    profileImageUrl?: string;
  };
}

export default function Gallery() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [publicGames, setPublicGames] = useState<PublicGame[]>([]);
  const [userGames, setUserGames] = useState<Game[]>([]);

  // Load mock data from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      // Load public games
      const savedPublicGames = localStorage.getItem('drawplay-public-games');
      if (savedPublicGames) {
        setPublicGames(JSON.parse(savedPublicGames));
      } else {
        // Create some mock public games
        const mockPublicGames: PublicGame[] = [
          {
            id: 'public-1',
            title: 'Dragon Quest',
            gameType: 'platformer',
            likes: 234,
            plays: 1200,
            createdAt: new Date().toISOString(),
            creator: { firstName: 'Emma', profileImageUrl: '' },
          },
          {
            id: 'public-2',
            title: 'Super Speedster',
            gameType: 'racing',
            likes: 189,
            plays: 800,
            createdAt: new Date().toISOString(),
            creator: { firstName: 'Alex', profileImageUrl: '' },
          },
        ];
        setPublicGames(mockPublicGames);
        localStorage.setItem('drawplay-public-games', JSON.stringify(mockPublicGames));
      }

      // Load user games
      const savedUserGames = localStorage.getItem('drawplay-games');
      if (savedUserGames) {
        setUserGames(JSON.parse(savedUserGames));
      }
    }
  }, [isAuthenticated]);

  // Like game function
  const handleLikeGame = (gameId: string) => {
    // Update local state
    setPublicGames(prevGames => 
      prevGames.map(game => 
        game.id === gameId 
          ? { ...game, likes: (game.likes || 0) + 1 }
          : game
      )
    );
    
    // Save to localStorage
    const updatedGames = publicGames.map(game => 
      game.id === gameId 
        ? { ...game, likes: (game.likes || 0) + 1 }
        : game
    );
    localStorage.setItem('drawplay-public-games', JSON.stringify(updatedGames));
    
      toast({
        title: "Liked!",
        description: "Thanks for showing love to this creator!",
      });
  };

  const shareGame = (game: Game) => {
    const url = `${window.location.origin}/game/${game.id}`;
    if (navigator.share) {
      navigator.share({
        title: game.title,
        text: `Check out this amazing ${game.gameType} game I found!`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Game link copied to clipboard",
      });
    }
  };

  // Filter games based on search and filter
  const filterGames = (games: Game[] | PublicGame[]) => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           game.gameType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || game.gameType === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  };

  const filteredPublicGames = filterGames(publicGames);
  const filteredUserGames = filterGames(userGames);

  const gameTypes = ['all', 'platformer', 'racing', 'battle', 'pet', 'story', 'board'];

  const GameCard = ({ game, isUserGame = false }: { game: Game | PublicGame; isUserGame?: boolean }) => {
    const publicGame = game as PublicGame;
    
    if (viewMode === 'list') {
      return (
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-foreground" data-testid={`game-title-${game.id}`}>
                    {game.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {game.gameType}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                  {!isUserGame && publicGame.creator && (
                    <span className="flex items-center" data-testid={`creator-${game.id}`}>
                      {publicGame.creator.profileImageUrl ? (
                        <img 
                          src={publicGame.creator.profileImageUrl} 
                          alt="Creator" 
                          className="w-4 h-4 rounded-full mr-1"
                        />
                      ) : (
                        <Users size={14} className="mr-1" />
                      )}
                      {publicGame.creator.firstName || 'Anonymous'}
                    </span>
                  )}
                  <span className="flex items-center" data-testid={`game-stats-${game.id}`}>
                    <Heart size={12} className="mr-1" />
                    {game.likes || 0}
                  </span>
                  <span className="flex items-center">
                    <Play size={12} className="mr-1" />
                    {game.plays || 0} plays
                  </span>
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {new Date(game.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLikeGame(game.id)}
                  disabled={false}
                  data-testid={`button-like-${game.id}`}
                >
                  <Heart size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => shareGame(game)}
                  data-testid={`button-share-${game.id}`}
                >
                  <Share2 size={14} />
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
      );
    }

    return (
      <Card className="game-card">
        <CardContent className="p-0">
          {/* Game Preview */}
          <div className="h-48 bg-gradient-to-br from-coral/20 to-turquoise/20 flex items-center justify-center relative">
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-xs">
                {game.gameType}
              </Badge>
            </div>
            
            <div className="text-center">
              <Gamepad2 className="w-16 h-16 text-coral mx-auto mb-2" />
              <Button
                size="sm"
                className="btn-coral"
                onClick={() => window.open(`/game/${game.id}`, '_blank')}
                data-testid={`button-play-${game.id}`}
              >
                <Play size={14} className="mr-1" />
                Play
              </Button>
            </div>
            
            {game.likes && game.likes > 10 && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gold text-white">
                  <Star size={12} className="mr-1" />
                  Popular
                </Badge>
              </div>
            )}
          </div>
          
          {/* Game Info */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2" data-testid={`game-title-${game.id}`}>
              {game.title}
            </h3>
            
            {!isUserGame && publicGame.creator && (
              <p className="text-sm text-muted-foreground mb-3" data-testid={`creator-${game.id}`}>
                By {publicGame.creator.firstName || 'Anonymous Creator'}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-3 text-sm text-muted-foreground">
                <span className="flex items-center" data-testid={`game-likes-${game.id}`}>
                  <Heart size={12} className="mr-1" />
                  {game.likes || 0}
                </span>
                <span className="flex items-center" data-testid={`game-plays-${game.id}`}>
                  <Play size={12} className="mr-1" />
                  {game.plays || 0}
                </span>
              </div>
              
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLikeGame(game.id)}
                  disabled={false}
                  data-testid={`button-like-${game.id}`}
                >
                  <Heart size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => shareGame(game)}
                  data-testid={`button-share-${game.id}`}
                >
                  <Share2 size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/game/${game.id}`, '_blank')}
                  data-testid={`button-open-${game.id}`}
                >
                  <ExternalLink size={14} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4 pulse-animation">
            <Gamepad2 className="text-white" size={24} />
          </div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4" data-testid="gallery-title">
            Game Gallery
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover amazing games created by our community and manage your own creations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background"
              data-testid="select-filter"
            >
              {gameTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-1 border border-border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              data-testid="button-view-grid"
            >
              <Grid3X3 size={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              data-testid="button-view-list"
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="community" data-testid="tab-community">
              <TrendingUp size={16} className="mr-2" />
              Community Games
            </TabsTrigger>
            <TabsTrigger value="my-games" data-testid="tab-my-games">
              <Users size={16} className="mr-2" />
              My Games ({userGames.length})
            </TabsTrigger>
          </TabsList>

          {/* Community Games */}
          <TabsContent value="community">
            {false ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-48 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPublicGames.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2" data-testid="no-public-games">
                    {searchQuery || selectedFilter !== 'all' ? 'No games found' : 'No public games yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Be the first to share a game with the community!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {filteredPublicGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Games */}
          <TabsContent value="my-games">
            {false ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-48 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUserGames.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2" data-testid="no-user-games">
                    {searchQuery || selectedFilter !== 'all' ? 'No games found' : 'No games created yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria' 
                      : 'Start creating your first game!'}
                  </p>
                  {(!searchQuery && selectedFilter === 'all') && (
                    <Button className="btn-coral" onClick={() => window.location.href = '/create'} data-testid="button-create-first">
                      <Gamepad2 className="mr-2" />
                      Create Your First Game
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
              }>
                {filteredUserGames.map((game) => (
                  <GameCard key={game.id} game={game} isUserGame={true} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
