import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { Court, ICourt } from '../models/Court';
import { User } from '../models/User';
import { AuthRequest, CourtFilters, LocationQuery } from '../types/common';
import { BaseController } from './BaseController';

export class CourtController extends BaseController<ICourt> {
  constructor() {
    super(Court);
  }

  public async createCourt(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const courtData = {
        ...req.body,
        creatorId: req.user._id,
        affiliatedUsers: [req.user._id], // Creator is automatically affiliated
      };

      const court = await Court.create(courtData);

      // Update user's createdCourts and affiliatedCourts
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          createdCourts: court._id,
          affiliatedCourts: court._id,
        },
      });

      res.status(201).json({
        success: true,
        data: court,
      });
    } catch (error) {
      next(error);
    }
  }

  public async searchCourts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { latitude, longitude, maxDistance = 10 } = req.query as unknown as LocationQuery;
      const {
        city,
        neighborhood,
        surface,
        isAvailable,
        dayOfWeek,
      } = req.query as unknown as CourtFilters;

      const filter: any = {};

      // Location-based search
      if (latitude && longitude) {
        filter.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance * 1000, // Convert km to meters
          },
        };
      }

      // Additional filters
      if (city) filter.city = city;
      if (neighborhood) filter.neighborhood = neighborhood;
      if (surface) filter.surface = surface;
      if (isAvailable !== undefined) filter.isAvailable = isAvailable;
      if (dayOfWeek !== undefined) {
        filter['schedule.dayOfWeek'] = dayOfWeek;
      }

      await this.getAll(req, res, next, filter);
    } catch (error) {
      next(error);
    }
  }

  public async requestAffiliation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      // Check if user is already affiliated or has pending request
      if (
        court.affiliatedUsers.some(id => id.equals(req.user._id)) ||
        court.pendingAffiliations.some(id => id.equals(req.user._id))
      ) {
        return res.status(400).json({
          success: false,
          error: 'User is already affiliated or has a pending request',
        });
      }

      // Add user to pending affiliations
      court.pendingAffiliations.push(req.user._id);
      await court.save();

      // Update user's pending affiliations
      await User.findByIdAndUpdate(req.user._id, {
        $push: { pendingAffiliations: court._id },
      });

      res.status(200).json({
        success: true,
        message: 'Affiliation request sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  public async handleAffiliationRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const { courtId, userId, action } = req.body;

      const court = await Court.findOne({
        _id: courtId,
        creatorId: req.user._id,
      });

      if (!court) {
        return res.status(404).json({
          success: false,
          error: 'Court not found or you are not the creator',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Remove from pending affiliations
      court.pendingAffiliations = court.pendingAffiliations.filter(
        (id) => !id.equals(new Types.ObjectId(userId))
      );

      if (action === 'approve') {
        // Add to affiliated users
        court.affiliatedUsers.push(new Types.ObjectId(userId));
        await User.findByIdAndUpdate(userId, {
          $push: { affiliatedCourts: courtId },
          $pull: { pendingAffiliations: courtId },
        });
      } else {
        // Remove from user's pending affiliations
        await User.findByIdAndUpdate(userId, {
          $pull: { pendingAffiliations: courtId },
        });
      }

      await court.save();

      res.status(200).json({
        success: true,
        message: `Affiliation request ${action}ed successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  public async removeAffiliation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
      }

      const { courtId, userId } = req.body;

      // Check if the requester is the court creator or the user being removed
      const court = await Court.findById(courtId);
      if (!court) {
        return res.status(404).json({
          success: false,
          error: 'Court not found',
        });
      }

      if (
        !court.creatorId.equals(req.user._id) &&
        userId !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to remove this affiliation',
        });
      }

      // Remove affiliation
      court.affiliatedUsers = court.affiliatedUsers.filter(
        (id) => !id.equals(new Types.ObjectId(userId))
      );
      await court.save();

      // Update user's affiliated courts
      await User.findByIdAndUpdate(userId, {
        $pull: { affiliatedCourts: courtId },
      });

      res.status(200).json({
        success: true,
        message: 'Affiliation removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
} 