// Models for the Canteen Management app

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'VENDOR' | 'EMPLOYEE';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
}

export interface FoodItem {
  id?: number;
  name: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
  isActive: boolean;
  averageRating?: number;
  vendor?: { id: number; fullName: string; username: string };
}

export type GoalType = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'MAINTENANCE';

export interface HealthGoal {
  id?: number;
  goalType: GoalType;
  targetDailyCalories?: number;
  targetDailyProtein?: number;
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  age?: number;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalEmployees: number;
  totalFoodItems: number;
  activeFoodItems: number;
}

export type OrderStatus = 'PENDING' | 'DELIVERED';

export interface Order {
  id?: number;
  employee?: { id: number; fullName: string; username: string };
  foodItem: FoodItem;
  orderDate: string;
  deliveryDate?: string;
  status: OrderStatus;
  oneTimeCode: string;
  rating?: { id: number; rating: number; comment?: string };
}

export interface StreakData {
  streak: number;
}
