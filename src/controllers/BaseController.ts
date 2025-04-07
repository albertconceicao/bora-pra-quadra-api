import { NextFunction, Request, Response } from 'express';
import { Document, Model } from 'mongoose';
import { PaginationParams } from '../types/common';

export class BaseController<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async getAll(
    req: Request,
    res: Response,
    next: NextFunction,
    filter: object = {}
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, sort = '-createdAt' } = req.query as PaginationParams;
      
      const options = {
        page: Number(page),
        limit: Number(limit),
        sort,
      };

      const data = await this.model
        .find(filter)
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await this.model.countDocuments(filter);

      res.status(200).json({
        success: true,
        data,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await this.model.findById(req.params.id);

      if (!doc) {
        res.status(404).json({
          success: false,
          error: 'Document not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await this.model.create(req.body);

      res.status(201).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doc) {
        res.status(404).json({
          success: false,
          error: 'Document not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id);

      if (!doc) {
        res.status(404).json({
          success: false,
          error: 'Document not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
} 