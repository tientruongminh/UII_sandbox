import { 
  type User, 
  type InsertUser, 
  type ParkingLot, 
  type InsertParkingLot,
  type Review,
  type InsertReview,
  type CommunityUpdate,
  type InsertCommunityUpdate,
  type Reward,
  type UserReward,
  type PointsHistory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Parking Lots
  getParkingLots(): Promise<ParkingLot[]>;
  getParkingLot(id: string): Promise<ParkingLot | undefined>;
  getParkingLotsByOwner(ownerId: string): Promise<ParkingLot[]>;
  createParkingLot(lot: InsertParkingLot): Promise<ParkingLot>;
  updateParkingLot(id: string, updates: Partial<ParkingLot>): Promise<ParkingLot | undefined>;
  searchParkingLots(filters: {
    search?: string;
    vehicleType?: string;
    maxDistance?: number;
    maxPrice?: number;
    availableOnly?: boolean;
    minRating?: number;
  }): Promise<ParkingLot[]>;
  
  // Reviews
  getReviewsByParkingLot(parkingLotId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Community Updates
  getCommunityUpdates(limit?: number): Promise<CommunityUpdate[]>;
  createCommunityUpdate(update: InsertCommunityUpdate): Promise<CommunityUpdate>;
  
  // Rewards
  getRewards(): Promise<Reward[]>;
  getUserRewards(userId: string): Promise<UserReward[]>;
  redeemReward(userId: string, rewardId: string): Promise<void>;
  
  // Points
  getPointsHistory(userId: string): Promise<PointsHistory[]>;
  addPoints(userId: string, points: number, activity: string, description?: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private parkingLots: Map<string, ParkingLot> = new Map();
  private reviews: Map<string, Review> = new Map();
  private communityUpdates: Map<string, CommunityUpdate> = new Map();
  private rewards: Map<string, Reward> = new Map();
  private userRewards: Map<string, UserReward> = new Map();
  private pointsHistory: Map<string, PointsHistory> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed initial rewards
    const rewardsData = [
      { name: "Voucher Grab 20k", description: "Giảm 20,000đ cho chuyến đi", pointsCost: 100, category: "transport", icon: "fas fa-gift" },
      { name: "Voucher Starbucks", description: "Giảm 25,000đ đồ uống", pointsCost: 150, category: "food", icon: "fas fa-coffee" },
      { name: "Voucher xăng 50k", description: "Petrolimex/Shell", pointsCost: 300, category: "fuel", icon: "fas fa-gas-pump" },
    ];

    rewardsData.forEach(reward => {
      const id = randomUUID();
      this.rewards.set(id, { ...reward, id, isActive: true });
    });

    // Seed sample parking lots in Ho Chi Minh City
    const parkingLotsData = [
      {
        name: "Bãi xe Nguyễn Huệ",
        address: "78 Nguyễn Huệ, Quận 1, TP.HCM",
        latitude: "10.7769",
        longitude: "106.7009",
        ownerId: "owner1",
        motorcycleCapacity: 50,
        carCapacity: 20,
        motorcyclePrice: 5000,
        carPrice: 15000,
        currentMotorcycleSpots: 35,
        currentCarSpots: 8,
        facilities: ["covered", "security"],
        operatingHours: { openTime: "06:00", closeTime: "22:00", is24h: false },
        rating: "4.8",
        totalReviews: 24,
        status: "active",
        description: "Bãi xe rộng rãi tại trung tâm thành phố"
      },
      {
        name: "Bãi xe Vincom Center",
        address: "70-72 Lê Thánh Tôn, Quận 1, TP.HCM",
        latitude: "10.7829",
        longitude: "106.7024",
        ownerId: "owner2", 
        motorcycleCapacity: 100,
        carCapacity: 50,
        motorcyclePrice: 8000,
        carPrice: 15000,
        currentMotorcycleSpots: 0,
        currentCarSpots: 0,
        facilities: ["covered", "security", "camera", "toilet"],
        operatingHours: { openTime: "08:00", closeTime: "22:00", is24h: false },
        rating: "4.5",
        totalReviews: 156,
        status: "active",
        description: "Bãi xe tại trung tâm thương mại Vincom"
      },
      {
        name: "Bãi xe Chợ Bến Thành",
        address: "Lê Lợi, Quận 1, TP.HCM",
        latitude: "10.7720",
        longitude: "106.6980",
        ownerId: "owner3",
        motorcycleCapacity: 80,
        carCapacity: 30,
        motorcyclePrice: 3000,
        carPrice: 12000,
        currentMotorcycleSpots: 45,
        currentCarSpots: 15,
        facilities: ["security"],
        operatingHours: { openTime: "05:00", closeTime: "23:00", is24h: false },
        rating: "4.2",
        totalReviews: 89,
        status: "active",
        description: "Bãi xe gần chợ Bến Thành, thuận tiện mua sắm"
      }
    ];

    parkingLotsData.forEach(lot => {
      const id = randomUUID();
      this.parkingLots.set(id, { ...lot, id, createdAt: new Date() });
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      points: 0,
      memberTier: "bronze",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Parking Lots
  async getParkingLots(): Promise<ParkingLot[]> {
    return Array.from(this.parkingLots.values());
  }

  async getParkingLot(id: string): Promise<ParkingLot | undefined> {
    return this.parkingLots.get(id);
  }

  async getParkingLotsByOwner(ownerId: string): Promise<ParkingLot[]> {
    return Array.from(this.parkingLots.values()).filter(lot => lot.ownerId === ownerId);
  }

  async createParkingLot(insertLot: InsertParkingLot): Promise<ParkingLot> {
    const id = randomUUID();
    const lot: ParkingLot = { 
      ...insertLot, 
      id,
      currentMotorcycleSpots: insertLot.motorcycleCapacity,
      currentCarSpots: insertLot.carCapacity,
      rating: "0",
      totalReviews: 0,
      status: "active",
      createdAt: new Date()
    };
    this.parkingLots.set(id, lot);
    return lot;
  }

  async updateParkingLot(id: string, updates: Partial<ParkingLot>): Promise<ParkingLot | undefined> {
    const lot = this.parkingLots.get(id);
    if (!lot) return undefined;
    
    const updatedLot = { ...lot, ...updates };
    this.parkingLots.set(id, updatedLot);
    return updatedLot;
  }

  async searchParkingLots(filters: {
    search?: string;
    vehicleType?: string;
    maxDistance?: number;
    maxPrice?: number;
    availableOnly?: boolean;
    minRating?: number;
  }): Promise<ParkingLot[]> {
    let lots = Array.from(this.parkingLots.values()).filter(lot => lot.status === "active");

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      lots = lots.filter(lot => 
        lot.name.toLowerCase().includes(searchLower) || 
        lot.address.toLowerCase().includes(searchLower)
      );
    }

    if (filters.availableOnly) {
      lots = lots.filter(lot => 
        lot.currentMotorcycleSpots > 0 || lot.currentCarSpots > 0
      );
    }

    if (filters.vehicleType === "motorcycle") {
      lots = lots.filter(lot => lot.motorcycleCapacity > 0);
      if (filters.maxPrice) {
        lots = lots.filter(lot => lot.motorcyclePrice <= filters.maxPrice!);
      }
    }

    if (filters.vehicleType === "car") {
      lots = lots.filter(lot => lot.carCapacity > 0);
      if (filters.maxPrice) {
        lots = lots.filter(lot => lot.carPrice <= filters.maxPrice!);
      }
    }

    if (filters.minRating) {
      lots = lots.filter(lot => parseFloat(lot.rating || "0") >= filters.minRating!);
    }

    return lots;
  }

  // Reviews
  async getReviewsByParkingLot(parkingLotId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.parkingLotId === parkingLotId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = { ...insertReview, id, createdAt: new Date() };
    this.reviews.set(id, review);

    // Update parking lot rating
    const lot = this.parkingLots.get(insertReview.parkingLotId);
    if (lot) {
      const reviews = await this.getReviewsByParkingLot(insertReview.parkingLotId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = (totalRating / reviews.length).toFixed(2);
      
      await this.updateParkingLot(insertReview.parkingLotId, {
        rating: avgRating,
        totalReviews: reviews.length
      });
    }

    return review;
  }

  // Community Updates
  async getCommunityUpdates(limit = 50): Promise<CommunityUpdate[]> {
    const updates = Array.from(this.communityUpdates.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
    return updates;
  }

  async createCommunityUpdate(insertUpdate: InsertCommunityUpdate): Promise<CommunityUpdate> {
    const id = randomUUID();
    const update: CommunityUpdate = { 
      ...insertUpdate, 
      id, 
      pointsEarned: 10,
      createdAt: new Date() 
    };
    this.communityUpdates.set(id, update);

    // Award points to user
    await this.addPoints(insertUpdate.userId, 10, "status_update", "Cập nhật tình trạng bãi xe");

    return update;
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(reward => reward.isActive);
  }

  async getUserRewards(userId: string): Promise<UserReward[]> {
    return Array.from(this.userRewards.values()).filter(reward => reward.userId === userId);
  }

  async redeemReward(userId: string, rewardId: string): Promise<void> {
    const reward = this.rewards.get(rewardId);
    const user = this.users.get(userId);
    
    if (!reward || !user) {
      throw new Error("Reward or user not found");
    }

    if (user.points < reward.pointsCost) {
      throw new Error("Insufficient points");
    }

    // Deduct points
    await this.updateUser(userId, { points: user.points - reward.pointsCost });
    
    // Record redemption
    const userRewardId = randomUUID();
    this.userRewards.set(userRewardId, {
      id: userRewardId,
      userId,
      rewardId,
      redeemedAt: new Date()
    });

    // Add to points history
    await this.addPoints(userId, -reward.pointsCost, "reward_redemption", reward.name);
  }

  // Points
  async getPointsHistory(userId: string): Promise<PointsHistory[]> {
    return Array.from(this.pointsHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async addPoints(userId: string, points: number, activity: string, description?: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;

    // Update user points
    const newPoints = Math.max(0, user.points + points);
    let newTier = user.memberTier;
    
    if (newPoints >= 1500) newTier = "gold";
    else if (newPoints >= 500) newTier = "silver";
    else newTier = "bronze";

    await this.updateUser(userId, { points: newPoints, memberTier: newTier });

    // Add to history
    const historyId = randomUUID();
    this.pointsHistory.set(historyId, {
      id: historyId,
      userId,
      points,
      activity,
      description,
      createdAt: new Date()
    });
  }
}

export const storage = new MemStorage();
