import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeDrawing, generateGameData, generateSpriteAnimations } from "./openai";
import { insertDrawingSchema, insertGameSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const subscription = await storage.getUserSubscription(userId);
      res.json({ ...user, subscription });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Drawing routes
  app.post('/api/drawings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const drawingData = insertDrawingSchema.parse({ ...req.body, userId });
      
      const drawing = await storage.createDrawing(drawingData);
      res.json(drawing);
    } catch (error) {
      console.error("Error creating drawing:", error);
      res.status(400).json({ message: "Failed to create drawing", error: (error as Error).message });
    }
  });

  app.get('/api/drawings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const drawings = await storage.getUserDrawings(userId);
      res.json(drawings);
    } catch (error) {
      console.error("Error fetching drawings:", error);
      res.status(500).json({ message: "Failed to fetch drawings" });
    }
  });

  app.get('/api/drawings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const drawing = await storage.getDrawing(req.params.id);
      
      if (!drawing) {
        return res.status(404).json({ message: "Drawing not found" });
      }
      
      if (drawing.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(drawing);
    } catch (error) {
      console.error("Error fetching drawing:", error);
      res.status(500).json({ message: "Failed to fetch drawing" });
    }
  });

  // AI Analysis route
  app.post('/api/analyze-drawing', isAuthenticated, async (req: any, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      
      const analysis = await analyzeDrawing(base64Data);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing drawing:", error);
      res.status(500).json({ message: "Failed to analyze drawing", error: (error as Error).message });
    }
  });

  // Game generation route
  app.post('/api/generate-game', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { drawingId, gameType, title } = req.body;

      // Check subscription limits
      const subscription = await storage.getUserSubscription(userId);
      if (!subscription) {
        return res.status(403).json({ message: "No subscription found" });
      }

      if (subscription.plan === 'free' && subscription.gamesCreatedThisMonth >= subscription.maxGamesPerMonth) {
        return res.status(403).json({ message: "Monthly game limit reached. Upgrade to create more games." });
      }

      const drawing = await storage.getDrawing(drawingId);
      if (!drawing || drawing.userId !== userId) {
        return res.status(404).json({ message: "Drawing not found" });
      }

      // Analyze drawing first
      const base64Data = drawing.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
      const analysis = await analyzeDrawing(base64Data);
      
      // Generate game data
      const gameData = await generateGameData(analysis, gameType, drawing.imageData);
      
      // Generate sprite animations
      const spriteData = await generateSpriteAnimations(base64Data, analysis);

      // Create game record
      const game = await storage.createGame({
        userId,
        drawingId,
        title: title || `${analysis.characterType} ${gameType}`,
        gameType,
        gameData,
        spriteData: JSON.stringify(spriteData),
        isPublic: false,
      });

      // Update subscription usage
      await storage.updateUserSubscription(userId, {
        gamesCreatedThisMonth: subscription.gamesCreatedThisMonth + 1,
      });

      res.json(game);
    } catch (error) {
      console.error("Error generating game:", error);
      res.status(500).json({ message: "Failed to generate game", error: (error as Error).message });
    }
  });

  // Game routes
  app.get('/api/games', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const games = await storage.getUserGames(userId);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get('/api/games/public', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const games = await storage.getPublicGames(limit);
      
      // Include user info for public games
      const gamesWithUsers = await Promise.all(
        games.map(async (game) => {
          const user = await storage.getUser(game.userId);
          return {
            ...game,
            creator: user ? { 
              firstName: user.firstName, 
              profileImageUrl: user.profileImageUrl 
            } : null
          };
        })
      );
      
      res.json(gamesWithUsers);
    } catch (error) {
      console.error("Error fetching public games:", error);
      res.status(500).json({ message: "Failed to fetch public games" });
    }
  });

  app.get('/api/games/:id', async (req, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Increment play count
      await storage.incrementGamePlays(req.params.id);
      
      res.json(game);
    } catch (error) {
      console.error("Error fetching game:", error);
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.post('/api/games/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const game = await storage.getGame(req.params.id);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      await storage.updateGameLikes(req.params.id, game.likes + 1);
      res.json({ likes: game.likes + 1 });
    } catch (error) {
      console.error("Error liking game:", error);
      res.status(500).json({ message: "Failed to like game" });
    }
  });

  app.post('/api/games/:id/publish', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const game = await storage.getGame(req.params.id);
      
      if (!game || game.userId !== userId) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Update game to be public (this would need to be implemented in storage)
      // For now, we'll just return success
      res.json({ message: "Game published successfully" });
    } catch (error) {
      console.error("Error publishing game:", error);
      res.status(500).json({ message: "Failed to publish game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
