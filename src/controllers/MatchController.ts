import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Court } from '../models/Court';
import { Match } from '../models/Match';
import { AuthRequest } from '../types/common';
import { BaseController } from './BaseController';

export class MatchController extends BaseController<typeof Match> {
  constructor() {
    super(Match);
  }

  public async createMatch(req: AuthRequest, res: Response): Promise<void> {
    const { courtId, date, startTime, endTime, maxPlayers, description } = req.body;
    const userId = req.user!._id;

    // Check if court exists
    const court = await Court.findById(courtId);
    if (!court) {
      res.status(404).json({ message: 'Court not found' });
      return;
    }

    // Check if court is affiliated with the user
    if (!court.affiliatedUsers.some((id: Types.ObjectId) => id.equals(userId))) {
      res.status(403).json({ message: 'You must be affiliated with the court to create matches' });
      return;
    }

    // Check for time slot availability
    const conflictingMatch = await Match.findOne({
      court: courtId,
      date,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        }
      ]
    });

    if (conflictingMatch) {
      res.status(400).json({ message: 'Time slot is not available' });
      return;
    }

    const match = new Match({
      court: courtId,
      organizer: userId,
      date,
      startTime,
      endTime,
      maxPlayers,
      description,
      attendees: [userId], // Organizer is automatically added as an attendee
      status: 'scheduled'
    });

    await match.save();
    res.status(201).json(match);
  }

  public async searchMatches(req: Request, res: Response): Promise<void> {
    const {
      courtId,
      date,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const query: any = {};

    if (courtId) query.court = courtId;
    if (date) query.date = date;
    if (status) query.status = status;

    const matches = await Match.find(query)
      .populate('court', 'name location')
      .populate('organizer', 'name')
      .populate('attendees', 'name')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ date: 1, startTime: 1 });

    const total = await Match.countDocuments(query);

    res.json({
      matches,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  }

  public async joinMatch(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!._id;
    const matchId = req.params.id;

    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    if (match.status !== 'scheduled') {
      res.status(400).json({ message: 'Match is not available for joining' });
      return;
    }

    if (match.attendees.length >= match.maxPlayers) {
      res.status(400).json({ message: 'Match is full' });
      return;
    }

    if (match.attendees.some((id: Types.ObjectId) => id.equals(userId))) {
      res.status(400).json({ message: 'You are already in this match' });
      return;
    }

    match.attendees.push(userId);
    await match.save();

    res.json(match);
  }

  public async leaveMatch(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!._id;
    const matchId = req.params.id;

    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    if (match.status !== 'scheduled') {
      res.status(400).json({ message: 'Cannot leave a match that is not scheduled' });
      return;
    }

    if (match.organizer.equals(userId)) {
      res.status(400).json({ message: 'Organizer cannot leave the match' });
      return;
    }

    const attendeeIndex = match.attendees.findIndex((id: Types.ObjectId) => id.equals(userId));
    if (attendeeIndex === -1) {
      res.status(400).json({ message: 'You are not in this match' });
      return;
    }

    match.attendees.splice(attendeeIndex, 1);
    await match.save();

    res.json(match);
  }

  public async updateMatchStatus(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!._id;
    const matchId = req.params.id;
    const { status } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    if (!match.organizer.equals(userId)) {
      res.status(403).json({ message: 'Only the organizer can update match status' });
      return;
    }

    const validStatusTransitions: { [key: string]: string[] } = {
      'scheduled': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validStatusTransitions[match.status].includes(status)) {
      res.status(400).json({ message: 'Invalid status transition' });
      return;
    }

    match.status = status;
    await match.save();

    res.json(match);
  }
} 