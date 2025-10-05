import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertParkingLotSchema, 
  insertReviewSchema,
  insertCommunityUpdateSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Parking Lots
  app.get("/api/parking-lots", async (req, res) => {
    try {
      const lots = await storage.getParkingLots();
      res.json(lots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parking lots" });
    }
  });

  app.get("/api/parking-lots/search", async (req, res) => {
    try {
      const { search, vehicleType, maxPrice, availableOnly, minRating } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (vehicleType) filters.vehicleType = vehicleType as string;
      if (maxPrice) filters.maxPrice = parseInt(maxPrice as string);
      if (availableOnly === 'true') filters.availableOnly = true;
      if (minRating) filters.minRating = parseFloat(minRating as string);

      const lots = await storage.searchParkingLots(filters);
      res.json(lots);
    } catch (error) {
      res.status(500).json({ message: "Failed to search parking lots" });
    }
  });

  app.get("/api/parking-lots/:id", async (req, res) => {
    try {
      const lot = await storage.getParkingLot(req.params.id);
      if (!lot) {
        return res.status(404).json({ message: "Parking lot not found" });
      }
      res.json(lot);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parking lot" });
    }
  });

 app.get("/api/parking-lots", async (req, res) => {
  try {
    const lots = await storage.getParkingLots();
    
    // Transform latitude/longitude thành lat/lng (number)
    const transformed = lots.map(lot => ({
      ...lot,
      lat: parseFloat(lot.latitude),
      lng: parseFloat(lot.longitude)
    }));
    
    res.json(transformed);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch parking lots" });
  }
});

  // Reviews
  app.get("/api/parking-lots/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByParkingLot(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(data);
      
      // Award points for review
      await storage.addPoints(data.userId, 5, "review", "Đánh giá bãi xe");
      
      res.status(201).json(review);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Community Updates
  app.get("/api/community-updates", async (req, res) => {
    try {
      const updates = await storage.getCommunityUpdates();
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community updates" });
    }
  });

  app.post("/api/community-updates", async (req, res) => {
    try {
      const data = insertCommunityUpdateSchema.parse(req.body);
      const update = await storage.createCommunityUpdate(data);
      res.status(201).json(update);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Rewards
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.post("/api/rewards/:id/redeem", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      await storage.redeemReward(userId, req.params.id);
      res.json({ message: "Reward redeemed successfully" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to redeem reward" });
    }
  });

  // Points History
  app.get("/api/users/:id/points-history", async (req, res) => {
    try {
      const history = await storage.getPointsHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch points history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
