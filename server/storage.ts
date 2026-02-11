import { podcasts, type Podcast, type InsertPodcast, users, type User } from "@shared/schema";
import { db } from "./db";
import { eq, like, or } from "drizzle-orm";

export interface IStorage {
  // Podcast operations
  getPodcasts(category?: string, search?: string): Promise<Podcast[]>;
  getPodcast(id: number): Promise<Podcast | undefined>;
  createPodcast(podcast: InsertPodcast): Promise<Podcast>;
  
  // User subscription operations
  updateUserSubscription(userId: string, isSubscribed: boolean): Promise<void>;

  // Admin operations
  getUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updatePodcast(id: number, updates: Partial<Podcast>): Promise<Podcast>;
  deletePodcast(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getPodcasts(category?: string, search?: string): Promise<Podcast[]> {
    let query = db.select().from(podcasts);
    
    if (category && category !== 'All') {
      // @ts-ignore - simple where clause construction
      query = query.where(eq(podcasts.category, category));
    }
    
    if (search) {
      // @ts-ignore
      query = query.where(or(like(podcasts.title, `%${search}%`), like(podcasts.description, `%${search}%`)));
    }
    
    return await query;
  }

  async getPodcast(id: number): Promise<Podcast | undefined> {
    const [podcast] = await db.select().from(podcasts).where(eq(podcasts.id, id));
    return podcast;
  }

  async createPodcast(insertPodcast: InsertPodcast): Promise<Podcast> {
    const [podcast] = await db.insert(podcasts).values(insertPodcast).returning();
    return podcast;
  }

  async updateUserSubscription(userId: string, isSubscribed: boolean): Promise<void> {
    await db.update(users)
      .set({ isSubscribed })
      .where(eq(users.id, userId));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updatePodcast(id: number, updates: Partial<Podcast>): Promise<Podcast> {
    const [podcast] = await db.update(podcasts).set(updates).where(eq(podcasts.id, id)).returning();
    return podcast;
  }

  async deletePodcast(id: number): Promise<void> {
    await db.delete(podcasts).where(eq(podcasts.id, id));
  }
}

export const storage = new DatabaseStorage();
