import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface GameEngineProps {
  gameData: {
    gameType: string;
    playerSprite: string;
    characterAnalysis: any;
    levels: Array<{ name: string; difficulty: string }>;
  };
  onGameEnd?: (score: number) => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  type: 'player' | 'platform' | 'enemy' | 'collectible';
  sprite?: string;
  collected?: boolean;
}

export default function GameEngine({ gameData, onGameEnd }: GameEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver' | 'paused'>('menu');

  // Game objects
  const [player, setPlayer] = useState<GameObject>({
    x: 50,
    y: 300,
    width: 40,
    height: 40,
    vx: 0,
    vy: 0,
    type: 'player',
  });

  const [platforms, setPlatforms] = useState<GameObject[]>([]);
  const [enemies, setEnemies] = useState<GameObject[]>([]);
  const [collectibles, setCollectibles] = useState<GameObject[]>([]);

  // Game physics
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 5;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;

  // Initialize game based on type
  useEffect(() => {
    initializeGame();
  }, [gameData.gameType]);

  const initializeGame = useCallback(() => {
    const newPlatforms: GameObject[] = [];
    const newEnemies: GameObject[] = [];
    const newCollectibles: GameObject[] = [];

    // Create platforms based on game type
    if (gameData.gameType === 'platformer') {
      // Ground platforms
      for (let i = 0; i < 20; i++) {
        newPlatforms.push({
          x: i * 40,
          y: CANVAS_HEIGHT - 40,
          width: 40,
          height: 40,
          vx: 0,
          vy: 0,
          type: 'platform',
        });
      }

      // Floating platforms
      newPlatforms.push(
        { x: 200, y: 300, width: 80, height: 20, vx: 0, vy: 0, type: 'platform' },
        { x: 400, y: 250, width: 80, height: 20, vx: 0, vy: 0, type: 'platform' },
        { x: 600, y: 200, width: 80, height: 20, vx: 0, vy: 0, type: 'platform' }
      );

      // Enemies
      newEnemies.push(
        { x: 300, y: CANVAS_HEIGHT - 80, width: 30, height: 30, vx: -1, vy: 0, type: 'enemy' },
        { x: 500, y: CANVAS_HEIGHT - 80, width: 30, height: 30, vx: 1, vy: 0, type: 'enemy' }
      );

      // Collectibles
      for (let i = 0; i < 5; i++) {
        newCollectibles.push({
          x: 150 + i * 100,
          y: CANVAS_HEIGHT - 100,
          width: 20,
          height: 20,
          vx: 0,
          vy: 0,
          type: 'collectible',
          collected: false,
        });
      }
    } else if (gameData.gameType === 'racing') {
      // Racing track
      for (let i = 0; i < 20; i++) {
        newPlatforms.push({
          x: i * 40,
          y: CANVAS_HEIGHT - 40,
          width: 40,
          height: 40,
          vx: 0,
          vy: 0,
          type: 'platform',
        });
        newPlatforms.push({
          x: i * 40,
          y: 0,
          width: 40,
          height: 40,
          vx: 0,
          vy: 0,
          type: 'platform',
        });
      }

      // Racing obstacles
      for (let i = 0; i < 8; i++) {
        newEnemies.push({
          x: 200 + i * 80,
          y: CANVAS_HEIGHT - 100,
          width: 30,
          height: 30,
          vx: 0,
          vy: 0,
          type: 'enemy',
        });
      }
    }

    setPlatforms(newPlatforms);
    setEnemies(newEnemies);
    setCollectibles(newCollectibles);
    setPlayer({ x: 50, y: 300, width: 40, height: 40, vx: 0, vy: 0, type: 'player' });
    setScore(0);
    setLives(3);
  }, [gameData.gameType]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (isPaused || gameState !== 'playing') return;

    const context = contextRef.current;
    if (!context) return;

    // Clear canvas
    context.fillStyle = '#87CEEB'; // Sky blue
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Update player physics
    setPlayer(prevPlayer => {
      let newPlayer = { ...prevPlayer };

      // Apply gravity
      newPlayer.vy += GRAVITY;

      // Update position
      newPlayer.x += newPlayer.vx;
      newPlayer.y += newPlayer.vy;

      // Keep player in bounds
      if (newPlayer.x < 0) newPlayer.x = 0;
      if (newPlayer.x + newPlayer.width > CANVAS_WIDTH) newPlayer.x = CANVAS_WIDTH - newPlayer.width;
      if (newPlayer.y + newPlayer.height > CANVAS_HEIGHT) {
        newPlayer.y = CANVAS_HEIGHT - newPlayer.height;
        newPlayer.vy = 0;
      }

      return newPlayer;
    });

    // Update enemies
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => ({
        ...enemy,
        x: enemy.x + enemy.vx,
        y: enemy.y + enemy.vy,
      }))
    );

    // Check collisions
    checkCollisions();

    // Draw everything
    drawGame();

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [isPaused, gameState]);

  const checkCollisions = useCallback(() => {
    // Platform collisions
    setPlayer(prevPlayer => {
      let newPlayer = { ...prevPlayer };
      let onGround = false;

      platforms.forEach(platform => {
        if (newPlayer.x < platform.x + platform.width &&
            newPlayer.x + newPlayer.width > platform.x &&
            newPlayer.y < platform.y + platform.height &&
            newPlayer.y + newPlayer.height > platform.y) {
          
          // Landing on top of platform
          if (newPlayer.vy > 0 && newPlayer.y < platform.y) {
            newPlayer.y = platform.y - newPlayer.height;
            newPlayer.vy = 0;
            onGround = true;
          }
        }
      });

      return { ...newPlayer, onGround };
    });

    // Enemy collisions
    setPlayer(prevPlayer => {
      enemies.forEach(enemy => {
        if (prevPlayer.x < enemy.x + enemy.width &&
            prevPlayer.x + prevPlayer.width > enemy.x &&
            prevPlayer.y < enemy.y + enemy.height &&
            prevPlayer.y + prevPlayer.height > enemy.y) {
          
          setLives(prev => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameState('gameOver');
              onGameEnd?.(score);
            }
            return newLives;
          });
        }
      });
      return prevPlayer;
    });

    // Collectible collisions
    setCollectibles(prevCollectibles => 
      prevCollectibles.map(collectible => {
        if (!collectible.collected &&
            player.x < collectible.x + collectible.width &&
            player.x + player.width > collectible.x &&
            player.y < collectible.y + collectible.height &&
            player.y + player.height > collectible.y) {
          
          setScore(prev => prev + 10);
          return { ...collectible, collected: true };
        }
        return collectible;
      })
    );
  }, [player, platforms, enemies, collectibles, score, onGameEnd]);

  const drawGame = useCallback(() => {
    const context = contextRef.current;
    if (!context) return;

    // Draw platforms
    context.fillStyle = '#8B4513'; // Brown
    platforms.forEach(platform => {
      context.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw enemies
    context.fillStyle = '#FF0000'; // Red
    enemies.forEach(enemy => {
      context.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw collectibles
    context.fillStyle = '#FFD700'; // Gold
    collectibles.forEach(collectible => {
      if (!collectible.collected) {
        context.fillRect(collectible.x, collectible.y, collectible.width, collectible.height);
      }
    });

    // Draw player
    if (gameData.playerSprite) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, player.x, player.y, player.width, player.height);
      };
      img.src = gameData.playerSprite;
    } else {
      context.fillStyle = '#00FF00'; // Green fallback
      context.fillRect(player.x, player.y, player.width, player.height);
    }

    // Draw UI
    context.fillStyle = '#000000';
    context.font = '20px Arial';
    context.fillText(`Score: ${score}`, 10, 30);
    context.fillText(`Lives: ${lives}`, 10, 60);
  }, [player, platforms, enemies, collectibles, score, lives, gameData.playerSprite]);

  // Input handling
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
        setPlayer(prev => ({ ...prev, vx: -MOVE_SPEED }));
        break;
      case 'ArrowRight':
      case 'KeyD':
        setPlayer(prev => ({ ...prev, vx: MOVE_SPEED }));
        break;
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        event.preventDefault();
        setPlayer(prev => ({ ...prev, vy: JUMP_FORCE }));
        break;
    }
  }, [gameState]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    switch (event.code) {
      case 'ArrowLeft':
      case 'KeyA':
      case 'ArrowRight':
      case 'KeyD':
        setPlayer(prev => ({ ...prev, vx: 0 }));
        break;
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, handleKeyDown, handleKeyUp, gameLoop]);

  const startGame = () => {
    setGameState('playing');
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  const resetGame = () => {
    setGameState('menu');
    setIsPlaying(false);
    setIsPaused(false);
    initializeGame();
  };

  return (
    <div className="bg-gradient-to-br from-cream to-background rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center">
          <Play className="text-coral mr-2" />
          {gameData.gameType.charAt(0).toUpperCase() + gameData.gameType.slice(1)} Game
        </h3>
        <div className="flex space-x-2">
          {gameState === 'menu' && (
            <Button onClick={startGame} className="btn-coral">
              <Play className="mr-2" size={16} />
              Start Game
            </Button>
          )}
          {gameState === 'playing' && (
            <Button onClick={pauseGame} variant="outline">
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </Button>
          )}
          <Button onClick={resetGame} variant="outline">
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      <div className="bg-white border-2 border-dashed border-border rounded-lg flex justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas rounded-lg max-w-full h-auto"
        />
      </div>

      {gameState === 'gameOver' && (
        <div className="mt-4 text-center">
          <h4 className="text-xl font-bold text-red-600 mb-2">Game Over!</h4>
          <p className="text-lg">Final Score: {score}</p>
        </div>
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        <p><strong>Controls:</strong></p>
        <p>Arrow Keys or WASD to move, Space/Up/W to jump</p>
      </div>
    </div>
  );
}
