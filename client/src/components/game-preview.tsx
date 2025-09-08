import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Heart, Share2, ExternalLink, Loader2 } from "lucide-react";
import GameEngine from "./game-engine";

interface Game {
  id: string;
  title: string;
  gameType: string;
  gameData: any;
  spriteData?: string;
  likes?: number;
  plays?: number;
  createdAt?: string;
}

interface GamePreviewProps {
  game?: Game;
  isGenerating?: boolean;
  onPlay?: () => void;
  onLike?: () => void;
  onShare?: () => void;
}

export default function GamePreview({ 
  game, 
  isGenerating = false, 
  onPlay, 
  onLike, 
  onShare 
}: GamePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [isGenerating]);

  if (isLoading || isGenerating) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center">
          <Loader2 className="text-gold mr-2 animate-spin" />
          Generating Game...
        </h4>
        
        <div className="game-preview rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-border">
          <div className="text-center">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 pulse-animation">
              <Loader2 className="text-white animate-spin" size={24} />
            </div>
            <p className="text-muted-foreground mb-2" data-testid="text-generating">Creating your game...</p>
            <p className="text-xs text-muted-foreground">This may take a few seconds</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">AI Analysis</span>
            <Loader2 className="text-turquoise animate-spin" size={16} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Sprite Generation</span>
            <Loader2 className="text-orange animate-spin" size={16} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Game Assembly</span>
            <Loader2 className="text-coral animate-spin" size={16} />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="font-semibold text-foreground mb-4 flex items-center">
          <Play className="text-gold mr-2" />
          Game Preview
        </h4>
        
        <div className="game-preview rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-border">
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="text-muted-foreground" size={24} />
            </div>
            <p className="text-muted-foreground" data-testid="text-no-game">Draw something to generate a game!</p>
          </div>
        </div>
      </div>
    );
  }

  const gameTypeColors = {
    platformer: 'coral',
    racing: 'turquoise', 
    battle: 'orange',
    pet: 'gold',
    story: 'primary',
    board: 'secondary'
  };

  const gameTypeColor = gameTypeColors[game.gameType as keyof typeof gameTypeColors] || 'coral';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground flex items-center">
          <Play className="text-gold mr-2" />
          {game.title}
        </h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${gameTypeColor}/10 text-${gameTypeColor}`}>
          {game.gameType}
        </div>
      </div>
      
      {/* Game Engine */}
      <div className="mb-4">
        <GameEngine 
          gameData={game.gameData} 
          onGameEnd={(score) => {
            console.log('Game ended with score:', score);
          }}
        />
      </div>

      {/* Game Stats */}
      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <div className="flex space-x-4">
          <span className="flex items-center" data-testid="stat-likes">
            <Heart size={14} className="mr-1" />
            {game.likes || 0}
          </span>
          <span className="flex items-center" data-testid="stat-plays">
            <Play size={14} className="mr-1" />
            {game.plays || 0} plays
          </span>
        </div>
        <span className="text-xs" data-testid="game-date">
          {new Date(game.createdAt || '').toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          onClick={onPlay}
          className="btn-coral flex-1"
          data-testid="button-play-full"
        >
          <Play size={16} className="mr-2" />
          Play
        </Button>
        
        <Button
          variant="outline"
          onClick={onLike}
          data-testid="button-like"
        >
          <Heart size={16} />
        </Button>
        
        <Button
          variant="outline"
          onClick={onShare}
          data-testid="button-share"
        >
          <Share2 size={16} />
        </Button>
        
        <Button
          variant="outline"
          onClick={() => window.open(`/game/${game.id}`, '_blank')}
          data-testid="button-open-game"
        >
          <ExternalLink size={16} />
        </Button>
      </div>
    </div>
  );
}
