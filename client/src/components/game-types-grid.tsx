import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Car, 
  Swords, 
  Heart, 
  Castle, 
  Dice6,
  Trophy,
  Zap,
  Users,
  Sparkles
} from "lucide-react";

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  available: boolean;
}

const gameTypes: GameType[] = [
  {
    id: 'platformer',
    name: 'Platformer Adventure',
    description: 'Your character jumps, runs, and explores colorful worlds with custom physics',
    icon: <Play className="text-white" />,
    color: 'coral',
    badge: 'Most Popular',
    available: true,
  },
  {
    id: 'racing',
    name: 'Speed Racer',
    description: 'Draw vehicles and tracks, then race with realistic physics',
    icon: <Car className="text-white" />,
    color: 'turquoise',
    badge: 'New',
    available: true,
  },
  {
    id: 'battle',
    name: 'Battle Arena',
    description: 'Create monsters and warriors for epic multiplayer battles',
    icon: <Swords className="text-white" />,
    color: 'orange',
    badge: 'Multiplayer',
    available: true,
  },
  {
    id: 'pet',
    name: 'Pet Adventure',
    description: 'Draw your pets and watch them explore magical worlds',
    icon: <Heart className="text-white" />,
    color: 'gold',
    badge: 'Kid Friendly',
    available: true,
  },
  {
    id: 'story',
    name: 'Story World',
    description: 'Build entire worlds with quests, NPCs, and adventures',
    icon: <Castle className="text-white" />,
    color: 'primary',
    badge: 'RPG Mode',
    available: false,
  },
  {
    id: 'board',
    name: 'Board Game Maker',
    description: 'Design custom cards, boards, and pieces for family fun',
    icon: <Dice6 className="text-white" />,
    color: 'secondary',
    badge: 'Family Fun',
    available: false,
  },
];

interface GameTypesGridProps {
  onSelectType: (gameType: string) => void;
  selectedType?: string;
  disabled?: boolean;
}

export default function GameTypesGrid({ 
  onSelectType, 
  selectedType, 
  disabled = false 
}: GameTypesGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gameTypes.map((gameType) => (
        <Card 
          key={gameType.id}
          className={`game-card ${
            selectedType === gameType.id ? 'ring-2 ring-coral' : ''
          } ${
            !gameType.available ? 'opacity-50' : ''
          } ${
            disabled ? 'pointer-events-none opacity-75' : ''
          }`}
          onClick={() => gameType.available && !disabled && onSelectType(gameType.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-center mb-3">
              <div className={`w-12 h-12 bg-${gameType.color} rounded-lg flex items-center justify-center mr-3`}>
                {gameType.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg text-primary mb-1">{gameType.name}</h3>
                {!gameType.available && (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Zap size={12} className="mr-1" />
                    Coming Soon
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {gameType.description}
            </p>
            
            <div className="flex justify-between items-center">
              {gameType.badge && (
                <span className={`text-xs px-3 py-1 rounded-full bg-${gameType.color}/10 text-${gameType.color} font-medium`}>
                  {gameType.badge}
                </span>
              )}
              
              {gameType.available ? (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-auto"
                  data-testid={`button-select-${gameType.id}`}
                >
                  <Play size={16} />
                </Button>
              ) : (
                <div className="flex items-center text-xs text-muted-foreground ml-auto">
                  <Users size={12} className="mr-1" />
                  Soon
                </div>
              )}
            </div>
            
            {selectedType === gameType.id && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-center text-coral">
                  <Sparkles size={16} className="mr-2" />
                  <span className="text-sm font-medium">Selected</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
