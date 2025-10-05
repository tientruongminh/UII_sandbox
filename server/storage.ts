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
      },
      {
        name: "Bãi xe Landmark 81",
        address: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
        latitude: "10.7944",
        longitude: "106.7219",
        ownerId: "owner4",
        motorcycleCapacity: 150,
        carCapacity: 80,
        motorcyclePrice: 10000,
        carPrice: 20000,
        currentMotorcycleSpots: 120,
        currentCarSpots: 50,
        facilities: ["covered", "security", "camera", "toilet", "ev_charging"],
        operatingHours: { openTime: "00:00", closeTime: "23:59", is24h: true },
        rating: "4.9",
        totalReviews: 342,
        status: "active",
        description: "Bãi xe hiện đại tại tòa nhà cao nhất Việt Nam"
      },
      {
        name: "Bãi xe Nhà Thờ Đức Bà",
        address: "01 Công xã Paris, Quận 1, TP.HCM",
        latitude: "10.7797",
        longitude: "106.6990",
        ownerId: "owner5",
        motorcycleCapacity: 60,
        carCapacity: 25,
        motorcyclePrice: 4000,
        carPrice: 15000,
        currentMotorcycleSpots: 40,
        currentCarSpots: 12,
        facilities: ["security", "camera"],
        operatingHours: { openTime: "06:00", closeTime: "21:00", is24h: false },
        rating: "4.3",
        totalReviews: 67,
        status: "active",
        description: "Bãi xe gần địa danh nổi tiếng, thuận tiện tham quan"
      },
      {
        name: "Bãi xe Bưu Điện Trung Tâm",
        address: "02 Công xã Paris, Quận 1, TP.HCM",
        latitude: "10.7798",
        longitude: "106.7000",
        ownerId: "owner6",
        motorcycleCapacity: 40,
        carCapacity: 15,
        motorcyclePrice: 3500,
        carPrice: 12000,
        currentMotorcycleSpots: 25,
        currentCarSpots: 8,
        facilities: ["security"],
        operatingHours: { openTime: "07:00", closeTime: "20:00", is24h: false },
        rating: "4.1",
        totalReviews: 45,
        status: "active",
        description: "Bãi xe nhỏ gọn gần bưu điện trung tâm"
      },
      {
        name: "Bãi xe Bitexco Financial Tower",
        address: "02 Hải Triều, Quận 1, TP.HCM",
        latitude: "10.7718",
        longitude: "106.7038",
        ownerId: "owner7",
        motorcycleCapacity: 120,
        carCapacity: 60,
        motorcyclePrice: 9000,
        carPrice: 18000,
        currentMotorcycleSpots: 80,
        currentCarSpots: 35,
        facilities: ["covered", "security", "camera", "toilet", "valet"],
        operatingHours: { openTime: "00:00", closeTime: "23:59", is24h: true },
        rating: "4.7",
        totalReviews: 198,
        status: "active",
        description: "Bãi xe cao cấp với dịch vụ valet parking"
      },
      {
        name: "Bãi xe Phố Đi Bộ Nguyễn Huệ",
        address: "Nguyễn Huệ, Quận 1, TP.HCM",
        latitude: "10.7743",
        longitude: "106.7019",
        ownerId: "owner8",
        motorcycleCapacity: 90,
        carCapacity: 0,
        motorcyclePrice: 6000,
        carPrice: 0,
        currentMotorcycleSpots: 60,
        currentCarSpots: 0,
        facilities: ["security", "camera"],
        operatingHours: { openTime: "06:00", closeTime: "23:00", is24h: false },
        rating: "4.4",
        totalReviews: 112,
        status: "active",
        description: "Bãi xe dành cho xe máy gần phố đi bộ"
      },
      {
        name: "Bãi xe Crescent Mall",
        address: "101 Tôn Dật Tiên, Quận 7, TP.HCM",
        latitude: "10.7265",
        longitude: "106.7193",
        ownerId: "owner9",
        motorcycleCapacity: 200,
        carCapacity: 100,
        motorcyclePrice: 7000,
        carPrice: 15000,
        currentMotorcycleSpots: 150,
        currentCarSpots: 70,
        facilities: ["covered", "security", "camera", "toilet"],
        operatingHours: { openTime: "08:00", closeTime: "22:00", is24h: false },
        rating: "4.6",
        totalReviews: 234,
        status: "active",
        description: "Bãi xe rộng rãi tại trung tâm thương mại Crescent"
      },
      {
        name: "Bãi xe Đại Học Khoa Học Xã Hội",
        address: "10-12 Đinh Tiên Hoàng, Quận 1, TP.HCM",
        latitude: "10.7763",
        longitude: "106.7044",
        ownerId: "owner10",
        motorcycleCapacity: 100,
        carCapacity: 20,
        motorcyclePrice: 2000,
        carPrice: 8000,
        currentMotorcycleSpots: 70,
        currentCarSpots: 10,
        facilities: ["covered", "security"],
        operatingHours: { openTime: "06:00", closeTime: "22:00", is24h: false },
        rating: "4.0",
        totalReviews: 78,
        status: "active",
        description: "Bãi xe sinh viên, giá rẻ"
      },
      {
        name: "Bãi xe Bệnh Viện Chợ Rẫy",
        address: "201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
        latitude: "10.7556",
        longitude: "106.6652",
        ownerId: "owner11",
        motorcycleCapacity: 120,
        carCapacity: 50,
        motorcyclePrice: 5000,
        carPrice: 15000,
        currentMotorcycleSpots: 30,
        currentCarSpots: 5,
        facilities: ["covered", "security", "camera"],
        operatingHours: { openTime: "00:00", closeTime: "23:59", is24h: true },
        rating: "3.8",
        totalReviews: 156,
        status: "active",
        description: "Bãi xe bệnh viện, hoạt động 24/7"
      },
      {
        name: "Bãi xe Aeon Mall Tân Phú",
        address: "30 Bộ Đề, Quận Tân Phú, TP.HCM",
        latitude: "10.7907",
        longitude: "106.6266",
        ownerId: "owner12",
        motorcycleCapacity: 250,
        carCapacity: 120,
        motorcyclePrice: 6000,
        carPrice: 15000,
        currentMotorcycleSpots: 200,
        currentCarSpots: 90,
        facilities: ["covered", "security", "camera", "toilet", "elevator"],
        operatingHours: { openTime: "08:00", closeTime: "22:00", is24h: false },
        rating: "4.5",
        totalReviews: 289,
        status: "active",
        description: "Bãi xe ngầm hiện đại tại Aeon Mall"
      },
      {
        name: "Bãi xe Sân Bay Tân Sơn Nhất",
        address: "Trường Sơn, Tân Bình, TP.HCM",
        latitude: "10.8188",
        longitude: "106.6595",
        ownerId: "owner13",
        motorcycleCapacity: 300,
        carCapacity: 200,
        motorcyclePrice: 15000,
        carPrice: 40000,
        currentMotorcycleSpots: 250,
        currentCarSpots: 150,
        facilities: ["covered", "security", "camera", "toilet", "ev_charging"],
        operatingHours: { openTime: "00:00", closeTime: "23:59", is24h: true },
        rating: "4.2",
        totalReviews: 567,
        status: "active",
        description: "Bãi xe sân bay, giá theo giờ"
      },
      {
        name: "Bãi xe Thảo Cầm Viên",
        address: "02 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM",
        latitude: "10.7875",
        longitude: "106.7059",
        ownerId: "owner14",
        motorcycleCapacity: 70,
        carCapacity: 35,
        motorcyclePrice: 4000,
        carPrice: 10000,
        currentMotorcycleSpots: 50,
        currentCarSpots: 20,
        facilities: ["security", "camera"],
        operatingHours: { openTime: "07:00", closeTime: "19:00", is24h: false },
        rating: "4.3",
        totalReviews: 92,
        status: "active",
        description: "Bãi xe gần sở thú, phù hợp cho gia đình"
      },
      {
        name: "Bãi xe Công Viên Gia Định",
        address: "Hoàng Minh Giám, Phú Nhuận, TP.HCM",
        latitude: "10.7998",
        longitude: "106.6787",
        ownerId: "owner15",
        motorcycleCapacity: 60,
        carCapacity: 30,
        motorcyclePrice: 3000,
        carPrice: 10000,
        currentMotorcycleSpots: 45,
        currentCarSpots: 22,
        facilities: ["security"],
        operatingHours: { openTime: "05:00", closeTime: "22:00", is24h: false },
        rating: "4.1",
        totalReviews: 58,
        status: "active",
        description: "Bãi xe công viên, thoáng mát"
      },
      {
        name: "Bãi xe Đầm Sen",
        address: "03 Hòa Bình, Quận 11, TP.HCM",
        latitude: "10.7639",
        longitude: "106.6375",
        ownerId: "owner16",
        motorcycleCapacity: 180,
        carCapacity: 70,
        motorcyclePrice: 5000,
        carPrice: 15000,
        currentMotorcycleSpots: 100,
        currentCarSpots: 40,
        facilities: ["covered", "security", "camera", "toilet"],
        operatingHours: { openTime: "07:00", closeTime: "21:00", is24h: false },
        rating: "4.4",
        totalReviews: 145,
        status: "active",
        description: "Bãi xe khu vui chơi Đầm Sen"
      },
      {
        name: "Bãi xe Chợ Hoa Hồ Thị Kỷ",
        address: "375A Hồ Thị Kỷ, Quận 10, TP.HCM",
        latitude: "10.7716",
        longitude: "106.6734",
        ownerId: "owner17",
        motorcycleCapacity: 50,
        carCapacity: 20,
        motorcyclePrice: 2000,
        carPrice: 8000,
        currentMotorcycleSpots: 35,
        currentCarSpots: 12,
        facilities: ["security"],
        operatingHours: { openTime: "00:00", closeTime: "23:59", is24h: true },
        rating: "3.9",
        totalReviews: 73,
        status: "active",
        description: "Bãi xe chợ hoa, hoạt động cả đêm"
      },
      {
        name: "Bãi xe Giga Mall",
        address: "240-242 Phạm Văn Đồng, Thủ Đức, TP.HCM",
        latitude: "10.8491",
        longitude: "106.7627",
        ownerId: "owner18",
        motorcycleCapacity: 200,
        carCapacity: 100,
        motorcyclePrice: 7000,
        carPrice: 15000,
        currentMotorcycleSpots: 170,
        currentCarSpots: 80,
        facilities: ["covered", "security", "camera", "toilet", "elevator"],
        operatingHours: { openTime: "08:00", closeTime: "22:00", is24h: false },
        rating: "4.6",
        totalReviews: 201,
        status: "active",
        description: "Bãi xe hiện đại tại Giga Mall Thủ Đức"
      },
      {
        name: "Bãi xe TTTM Sense City",
        address: "290 Lê Văn Sỹ, Quận 3, TP.HCM",
        latitude: "10.7825",
        longitude: "106.6893",
        ownerId: "owner19",
        motorcycleCapacity: 90,
        carCapacity: 40,
        motorcyclePrice: 6000,
        carPrice: 15000,
        currentMotorcycleSpots: 60,
        currentCarSpots: 25,
        facilities: ["covered", "security", "camera", "toilet"],
        operatingHours: { openTime: "08:00", closeTime: "22:00", is24h: false },
        rating: "4.4",
        totalReviews: 118,
        status: "active",
        description: "Bãi xe trung tâm thương mại Sense City"
      },
      {
        name: "Bãi xe Chợ Tân Định",
        address: "Hai Bà Trưng, Quận 1, TP.HCM",
        latitude: "10.7891",
        longitude: "106.6931",
        ownerId: "owner20",
        motorcycleCapacity: 70,
        carCapacity: 25,
        motorcyclePrice: 3000,
        carPrice: 10000,
        currentMotorcycleSpots: 50,
        currentCarSpots: 15,
        facilities: ["security", "camera"],
        operatingHours: { openTime: "05:00", closeTime: "20:00", is24h: false },
        rating: "4.0",
        totalReviews: 64,
        status: "active",
        description: "Bãi xe chợ truyền thống, giá bình dân"
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
      createdAt: new Date(),
      phone: insertUser.phone || null,
      vehicleType: insertUser.vehicleType || "motorcycle"
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

// Thay thế nguyên hàm createParkingLot hiện tại bằng hàm dưới đây
async createParkingLot(insertLot: InsertParkingLot): Promise<ParkingLot> {
  // Cho phép payload gửi vào có thể dùng lat/lng hoặc latitude/longitude
  const payload = insertLot as any;

  // Chuẩn hóa toNumber an toàn
  const toNumber = (v: any, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  // Chuẩn hóa toString cho tọa độ theo schema đang dùng (chuỗi)
  const normCoord = (v: any) => String(toNumber(v));

  // Lấy tọa độ, ưu tiên latitude/longitude, nếu không có thì nhận lat/lng
  const latitude  = payload.latitude  != null ? normCoord(payload.latitude)  : 
                    payload.lat       != null ? normCoord(payload.lat)       : "0";
  const longitude = payload.longitude != null ? normCoord(payload.longitude) : 
                    payload.lng       != null ? normCoord(payload.lng)       : "0";

  // Ép kiểu và điền mặc định cho các số
  const motorcycleCapacity   = toNumber(payload.motorcycleCapacity, 0);
  const carCapacity          = toNumber(payload.carCapacity, 0);
  const motorcyclePrice      = toNumber(payload.motorcyclePrice, 0);
  const carPrice             = toNumber(payload.carPrice, 0);

  // Nếu người gọi không truyền current* thì mặc định bằng capacity
  const currentMotorcycleSpots = payload.currentMotorcycleSpots != null
    ? toNumber(payload.currentMotorcycleSpots, 0)
    : motorcycleCapacity;

  const currentCarSpots = payload.currentCarSpots != null
    ? toNumber(payload.currentCarSpots, 0)
    : carCapacity;

  // facilities có thể là string hoặc string[], chuẩn hóa về string[] hoặc null
  let facilities: string[] | null = null;
  if (Array.isArray(payload.facilities)) {
    facilities = payload.facilities.map(String);
  } else if (typeof payload.facilities === "string" && payload.facilities.trim() !== "") {
    facilities = [payload.facilities];
  }

  const id = randomUUID();

  const lot: ParkingLot = {
    // giữ lại các field hợp lệ đã gửi
    ...insertLot,

    // các field chuẩn hóa, ghi đè để đảm bảo đúng schema và mặc định
    id,
    latitude,
    longitude,
    motorcycleCapacity,
    carCapacity,
    motorcyclePrice,
    carPrice,
    currentMotorcycleSpots,
    currentCarSpots,
    facilities,
    operatingHours: insertLot.operatingHours ?? null,
    description: insertLot.description ?? null,

    // các field hệ thống
    rating: "0",
    totalReviews: 0,
    status: "active",
    createdAt: new Date(),
  };

  // Nếu thiếu ownerId thì cho default "anonymous" để test cURL cho nhanh
  if (!(lot as any).ownerId) {
    (lot as any).ownerId = "anonymous";
  }

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
    const review: Review = { ...insertReview, id, createdAt: new Date(), comment: insertReview.comment || null };
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
      createdAt: new Date(),
      comment: insertUpdate.comment || null
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
      description: description || null,
      createdAt: new Date()
    });
  }
}

export const storage = new MemStorage();
