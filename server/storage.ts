import {
  users,
  drawings,
  games,
  userSubscriptions,
  type User,
  type UpsertUser,
  type Drawing,
  type InsertDrawing,
  type Game,
  type InsertGame,
  type UserSubscription,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Drawing operations
  createDrawing(drawing: InsertDrawing): Promise<Drawing>;
  getDrawing(id: string): Promise<Drawing | undefined>;
  getUserDrawings(userId: string): Promise<Drawing[]>;
  deleteDrawing(id: string): Promise<void>;
  
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  getUserGames(userId: string): Promise<Game[]>;
  getPublicGames(limit?: number): Promise<Game[]>;
  updateGameLikes(id: string, likes: number): Promise<void>;
  incrementGamePlays(id: string): Promise<void>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<UserSubscription | undefined>;
  createUserSubscription(userId: string, plan: string): Promise<UserSubscription>;
  updateUserSubscription(userId: string, data: Partial<UserSubscription>): Promise<UserSubscription>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private drawings: Map<string, Drawing> = new Map();
  private games: Map<string, Game> = new Map();
  private subscriptions: Map<string, UserSubscription> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...existingUser,
      ...userData,
      id: userData.id || randomUUID(),
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    
    // Create default free subscription if not exists
    if (!this.subscriptions.has(user.id)) {
      await this.createUserSubscription(user.id, 'free');
    }
    
    return user;
  }

  // Drawing operations
  async createDrawing(drawingData: InsertDrawing): Promise<Drawing> {
    const id = randomUUID();
    const drawing: Drawing = {
      ...drawingData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.drawings.set(id, drawing);
    return drawing;
  }

  async getDrawing(id: string): Promise<Drawing | undefined> {
    return this.drawings.get(id);
  }

  async getUserDrawings(userId: string): Promise<Drawing[]> {
    return Array.from(this.drawings.values())
      .filter(drawing => drawing.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async deleteDrawing(id: string): Promise<void> {
    this.drawings.delete(id);
  }

  // Game operations
  async createGame(gameData: InsertGame): Promise<Game> {
    const id = randomUUID();
    const game: Game = {
      ...gameData,
      id,
      likes: 0,
      plays: 0,
      isPublic: gameData.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.games.set(id, game);
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getUserGames(userId: string): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPublicGames(limit = 20): Promise<Game[]> {
    return Array.from(this.games.values())
      .filter(game => game.isPublic)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);
  }

  async updateGameLikes(id: string, likes: number): Promise<void> {
    const game = this.games.get(id);
    if (game) {
      game.likes = likes;
      game.updatedAt = new Date();
      this.games.set(id, game);
    }
  }

  async incrementGamePlays(id: string): Promise<void> {
    const game = this.games.get(id);
    if (game) {
      game.plays += 1;
      game.updatedAt = new Date();
      this.games.set(id, game);
    }
  }

  // Subscription operations
  async getUserSubscription(userId: string): Promise<UserSubscription | undefined> {
    return this.subscriptions.get(userId);
  }

  async createUserSubscription(userId: string, plan: string): Promise<UserSubscription> {
    const maxGames = plan === 'free' ? 3 : plan === 'pro' ? -1 : 1000; // -1 for unlimited
    const subscription: UserSubscription = {
      id: randomUUID(),
      userId,
      plan,
      status: 'active',
      gamesCreatedThisMonth: 0,
      maxGamesPerMonth: maxGames,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.set(userId, subscription);
    return subscription;
  }

  async updateUserSubscription(userId: string, data: Partial<UserSubscription>): Promise<UserSubscription> {
    const existing = this.subscriptions.get(userId);
    if (!existing) {
      throw new Error('Subscription not found');
    }
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.subscriptions.set(userId, updated);
    return updated;
  }
}

export const storage = new MemStorage();
