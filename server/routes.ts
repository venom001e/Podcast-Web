import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, authStorage } from "./replit_integrations/auth";
import { insertPodcastSchema } from "@shared/schema";

async function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = (req.user as any).claims.sub;
  const user = await authStorage.getUser(userId);
  if (user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Podcast Routes
  app.get(api.podcasts.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const podcasts = await storage.getPodcasts(category, search);
    res.json(podcasts);
  });

  app.get(api.podcasts.get.path, async (req, res) => {
    const podcast = await storage.getPodcast(Number(req.params.id));
    if (!podcast) {
      return res.status(404).json({ message: "Podcast not found" });
    }
    res.json(podcast);
  });

  app.post(api.podcasts.create.path, async (req, res) => {
    try {
      const input = api.podcasts.create.input.parse(req.body);
      const podcast = await storage.createPodcast(input);
      res.status(201).json(podcast);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Subscription Route
  app.post(api.users.subscribe.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Toggle subscription (in a real app this would handle payment)
    // For demo, we just set it to true
    const userId = (req.user as any).claims.sub;
    await storage.updateUserSubscription(userId, true);
    
    res.json({ isSubscribed: true });
  });

  // Admin Routes
  app.get(api.admin.stats.path, isAdmin, async (req, res) => {
    const allUsers = await storage.getUsers();
    const allPodcasts = await storage.getPodcasts();
    res.json({
      totalUsers: allUsers.length,
      totalPodcasts: allPodcasts.length,
      totalPremiumPodcasts: allPodcasts.filter(p => p.isPremium).length,
    });
  });

  app.get(api.admin.podcasts.list.path, isAdmin, async (req, res) => {
    const podcasts = await storage.getPodcasts();
    res.json(podcasts);
  });

  app.put(api.admin.podcasts.update.path, isAdmin, async (req, res) => {
    try {
      const input = api.admin.podcasts.update.input.parse(req.body);
      const podcast = await storage.updatePodcast(Number(req.params.id), input);
      res.json(podcast);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.admin.podcasts.delete.path, isAdmin, async (req, res) => {
    await storage.deletePodcast(Number(req.params.id));
    res.status(204).end();
  });

  app.get(api.admin.users.list.path, isAdmin, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.put(api.admin.users.update.path, isAdmin, async (req, res) => {
    try {
      const input = api.admin.users.update.input.parse(req.body);
      const user = await storage.updateUser(req.params.id, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.admin.users.delete.path, isAdmin, async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.status(204).end();
  });

  // Seed data if empty
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getPodcasts();
  if (existing.length === 0) {
    const dummyPodcasts = [
      {
        title: "The Daily Grind",
        description: "Tips and tricks for productivity in the modern workplace. We discuss tools, mindsets, and strategies to get more done in less time.",
        thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&q=80&w=1000",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        category: "Business",
        isPremium: false,
      },
      {
        title: "Midnight Stories",
        description: "Spooky tales to keep you awake at night. From urban legends to true crime, we cover it all.",
        thumbnail: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?auto=format&fit=crop&q=80&w=1000",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        category: "Stories",
        isPremium: true,
      },
      {
        title: "Tech Talk",
        description: "Deep dive into the latest technologies and frameworks. This week: React Server Components.",
        thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        category: "Education",
        isPremium: false,
      },
      {
        title: "Morning Motivation",
        description: "Start your day with energy and purpose. Affirmations and advice for a better life.",
        thumbnail: "https://images.unsplash.com/photo-1499750310159-5254f4b38fa9?auto=format&fit=crop&q=80&w=1000",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        category: "Motivation",
        isPremium: true,
      },
      {
        title: "History Uncovered",
        description: "Things you didn't learn in school. Uncovering the truth about historical events.",
        thumbnail: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=1000",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        category: "Education",
        isPremium: false,
      },
      {
        title: "Startup Journey",
        description: "Follow the journey of building a startup from scratch. Highs, lows, and everything in between.",
        thumbnail: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1000",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        category: "Business",
        isPremium: true,
      }
    ];

    for (const p of dummyPodcasts) {
      await storage.createPodcast(p);
    }
    console.log("Seeded database with podcasts");
  }
}
