import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
  List,
} from "lucide-react";
import type { Game } from "@shared/schema";

interface PublicGame extends Game {
  creator?: {
    firstName?: string;
    profileImageUrl?: string;
  };
}

export default function Gallery() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [publicGames, setPublicGames] = useState<PublicGame[]>([]);
  const [userGames, setUserGames] = useState<Game[]>([]);

  const gameTypes = [
    "all",
    "platformer",
    "racing",
    "battle",
    "pet",
    "story",
    "board",
  ];

  const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5001";


  useEffect(() => {
  const fetchGames = async () => {
    try {
      // ✅ Always fetch public games
      const publicResp = await fetch(`${API_BASE}/api/v1/games/public`);
      const publicData = await publicResp.json();
      console.log("Public games response:", publicData);

      setPublicGames(
        Array.isArray(publicData.games) ? publicData.games : []
      );

      // ✅ Fetch user games only if logged in
      const token = localStorage.getItem("access_token");
      if (token) {
        const userResp = await fetch(`${API_BASE}/api/v1/games/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResp.ok) {
          const result = await userResp.json();
          console.log("User games response:", result);

          setUserGames(
            Array.isArray(result.games) ? result.games : []
          );
        } else if (userResp.status === 401) {
          console.warn("Unauthorized: Token is missing or expired");
          setUserGames([]);
        }
      } else {
        console.log("No token found, skipping /games/me");
        setUserGames([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setPublicGames([]);
      setUserGames([]);
    }
  };

  fetchGames();
}, [isAuthenticated, searchQuery, selectedFilter]);

  const filterGames = (games: Game[] | PublicGame[]) => {
    return games.filter((game) => {
      const matchesSearch =
        game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.gameType?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" || game.gameType === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  };

  const filteredPublicGames = filterGames(publicGames);
  const filteredUserGames = filterGames(userGames);

  const handleLikeGame = async (gameId: string) => {
    setPublicGames((prev) =>
      prev.map((g) =>
        g.id === gameId ? { ...g, likes: (g.likes || 0) + 1 } : g
      )
    );

    try {
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const resp = await fetch(
        `${API_BASE}/api/v1/games/${encodeURIComponent(gameId)}/like`,
        {
          method: "POST",
          headers,
        }
      );

      if (resp.ok) {
        const updated = await resp.json();
        setPublicGames((prev) =>
          prev.map((g) =>
            g.id === gameId ? { ...g, likes: updated.likes ?? g.likes } : g
          )
        );
        toast({
          title: "Liked!",
          description: "Thanks for showing love to this creator!",
        });
      } else {
        toast({
          title: "Like failed",
          description: "Could not register like. Try again later.",
        });
      }
    } catch (err) {
      console.error("Error liking game:", err);
      toast({
        title: "Like failed",
        description: "Could not register like. Try again later.",
      });
    }
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

  const GameCard = ({
    game,
    isUserGame = false,
  }: {
    game: Game | PublicGame;
    isUserGame?: boolean;
  }) => {
    const publicGame = game as PublicGame;

    return (
      <Card className="game-card">
        <CardContent className="p-0">
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
                onClick={() => setLocation(`/game/${game.id}`)}
              >
                <Play size={14} className="mr-1" /> Play
              </Button>
            </div>
            {game.likes && game.likes > 10 && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gold text-white">
                  <Star size={12} className="mr-1" /> Popular
                </Badge>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-2">{game.title}</h3>
            {!isUserGame && publicGame.creator && (
              <p className="text-sm text-muted-foreground mb-3">
                By {publicGame.creator.firstName || "Anonymous"}
              </p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex space-x-3 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Heart size={12} className="mr-1" />
                  {game.likes || 0}
                </span>
                <span className="flex items-center">
                  <Play size={12} className="mr-1" />
                  {game.plays || 0}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleLikeGame(game.id)}
                >
                  <Heart size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => shareGame(game)}
                >
                  <Share2 size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/game/${game.id}`, "_blank")}
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
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4">
            Game Gallery
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover community games and manage your own creations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg bg-background"
            >
              {gameTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all"
                    ? "All Types"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-1 border border-border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 size={16} />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="community">
              <TrendingUp size={16} className="mr-2" />
              Community Games
            </TabsTrigger>
            <TabsTrigger value="my-games">
              <Users size={16} className="mr-2" />
              My Games ({userGames.length})
            </TabsTrigger>
          </TabsList>

          {/* Community Games */}
          <TabsContent value="community">
            {filteredPublicGames.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    {searchQuery || selectedFilter !== "all"
                      ? "No games found"
                      : "No public games yet"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || selectedFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Be the first to share a game!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredPublicGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Games */}
          <TabsContent value="my-games">
            {filteredUserGames.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">
                    {searchQuery || selectedFilter !== "all"
                      ? "No games found"
                      : "No games created yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start creating your first game!"}
                  </p>
                  {!searchQuery && selectedFilter === "all" && (
                    <Button
                      className="btn-coral"
                      onClick={() => setLocation("/create")}
                    >
                      <Gamepad2 className="mr-2" /> Create Your First Game
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredUserGames.map((game) => (
                  <GameCard key={game.id} game={game} isUserGame />
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
