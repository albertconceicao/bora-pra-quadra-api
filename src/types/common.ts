import { Request } from 'express';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user: IUser & {
    _id: Types.ObjectId;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface LocationQuery {
  latitude: number;
  longitude: number;
  maxDistance?: number; // in kilometers
}

export interface CourtFilters {
  city?: string;
  neighborhood?: string;
  surface?: string;
  isAvailable?: boolean;
  dayOfWeek?: number;
}

export interface MatchFilters {
  courtId?: string;
  date?: Date;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  hasAvailableSpots?: boolean;
} 