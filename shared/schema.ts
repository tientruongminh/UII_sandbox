import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
type LotWithCoords = ParkingLot & { lat: number; lng: number };

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  vehicleType: text("vehicle_type").notNull().default("motorcycle"), // motorcycle, car, both
  points: integer("points").notNull().default(0),
  memberTier: text("member_tier").notNull().default("bronze"), // bronze, silver, gold
  createdAt: timestamp("created_at").defaultNow(),
});

export const parkingLots = pgTable("parking_lots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  motorcycleCapacity: integer("motorcycle_capacity").notNull().default(0),
  carCapacity: integer("car_capacity").notNull().default(0),
  motorcyclePrice: integer("motorcycle_price").notNull().default(0), // VND per hour
  carPrice: integer("car_price").notNull().default(0), // VND per hour
  currentMotorcycleSpots: integer("current_motorcycle_spots").notNull().default(0),
  currentCarSpots: integer("current_car_spots").notNull().default(0),
  facilities: json("facilities").$type<string[]>().default([]), // covered, security, camera, toilet, water, wifi
  operatingHours: json("operating_hours").$type<{openTime: string, closeTime: string, is24h: boolean}>().notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  status: text("status").notNull().default("active"), // active, inactive, pending
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parkingLotId: varchar("parking_lot_id").references(() => parkingLots.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const communityUpdates = pgTable("community_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parkingLotId: varchar("parking_lot_id").references(() => parkingLots.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: text("status").notNull(), // available, full, almost_full
  comment: text("comment"),
  pointsEarned: integer("points_earned").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pointsCost: integer("points_cost").notNull(),
  category: text("category").notNull(), // transport, food, fuel, other
  icon: text("icon").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const userRewards = pgTable("user_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  rewardId: varchar("reward_id").references(() => rewards.id).notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
});

export const pointsHistory = pgTable("points_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(), // positive for earned, negative for spent
  activity: text("activity").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  points: true,
  memberTier: true,
  createdAt: true,
});

export const insertParkingLotSchema = createInsertSchema(parkingLots).omit({
  id: true,
  currentMotorcycleSpots: true,
  currentCarSpots: true,
  rating: true,
  totalReviews: true,
  status: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityUpdateSchema = createInsertSchema(communityUpdates).omit({
  id: true,
  pointsEarned: true,
  createdAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ParkingLot = typeof parkingLots.$inferSelect;
export type InsertParkingLot = z.infer<typeof insertParkingLotSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CommunityUpdate = typeof communityUpdates.$inferSelect;
export type InsertCommunityUpdate = z.infer<typeof insertCommunityUpdateSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type UserReward = typeof userRewards.$inferSelect;
export type PointsHistory = typeof pointsHistory.$inferSelect;
