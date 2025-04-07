import { NextFunction, Response } from 'express';
import { verifyToken } from '../config/jwt';
import { Court } from '../models/Court';
import { Match } from '../models/Match';
import { User } from '../models/User';
import { AuthRequest } from '../types/common';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = await verifyToken(token);

    const user = await User.findById(decoded.id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

export const isCourtCreator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const court = await Court.findById(req.params.courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        error: 'Court not found',
      });
    }

    if (court.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only court creator can perform this action',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isMatchCreator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found',
      });
    }

    if (match.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only match creator can perform this action',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}; 