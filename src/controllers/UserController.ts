import { NextFunction, Request, Response } from 'express';
import { generateToken } from '../config/jwt';
import { IUser, User } from '../models/User';
import { AuthRequest } from '../types/common';
import { BaseController } from './BaseController';

export class UserController extends BaseController<IUser> {
  constructor() {
    super(User);
  }

  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered',
        });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Generate token
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findById(req.user?._id)
        .select('-password')
        .populate('createdCourts')
        .populate('affiliatedCourts')
        .populate('pendingAffiliations');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email } = req.body;

      // Check if email is taken
      if (email) {
        const existingUser = await User.findOne({ email, _id: { $ne: req.user?._id } });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Email already taken',
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user?._id,
        { name, email },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user?._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Current password is incorrect',
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
} 