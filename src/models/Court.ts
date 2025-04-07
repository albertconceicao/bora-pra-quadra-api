import mongoose, { Document, Schema } from 'mongoose';

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ICourt extends Document {
  name: string;
  location: {
    type: string;
    coordinates: number[];
  };
  address: string;
  city: string;
  neighborhood: string;
  whatsApp: string;
  responsible: string;
  surface: string;
  dimensions: {
    width: number;
    length: number;
  };
  schedule: Schedule[];
  isAvailable: boolean;
  photoUrl: string;
  creatorId: mongoose.Types.ObjectId;
  affiliatedUsers: mongoose.Types.ObjectId[];
  pendingAffiliations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const courtSchema = new Schema<ICourt>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    neighborhood: {
      type: String,
      required: true,
      trim: true,
    },
    whatsApp: {
      type: String,
      required: true,
      trim: true,
    },
    responsible: {
      type: String,
      required: true,
      trim: true,
    },
    surface: {
      type: String,
      required: true,
      trim: true,
    },
    dimensions: {
      width: {
        type: Number,
        required: true,
      },
      length: {
        type: Number,
        required: true,
      },
    },
    schedule: [{
      dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6,
      },
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    photoUrl: {
      type: String,
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    affiliatedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    pendingAffiliations: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index for location-based queries
courtSchema.index({ location: '2dsphere' });

export const Court = mongoose.model<ICourt>('Court', courtSchema); 