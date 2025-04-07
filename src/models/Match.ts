import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  courtId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  maxPlayers: number;
  description: string;
  attendees: mongoose.Types.ObjectId[];
  creatorId: mongoose.Types.ObjectId;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    courtId: {
      type: Schema.Types.ObjectId,
      ref: 'Court',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    maxPlayers: {
      type: Number,
      required: true,
      min: 2,
    },
    description: {
      type: String,
      trim: true,
    },
    attendees: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying matches by date and court
matchSchema.index({ courtId: 1, date: 1 });

// Middleware to validate max attendees
matchSchema.pre('save', function(next) {
  if (this.attendees.length > this.maxPlayers) {
    next(new Error('Number of attendees cannot exceed maxPlayers'));
  }
  next();
});

export const Match = mongoose.model<IMatch>('Match', matchSchema); 