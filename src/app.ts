import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/error';
import courtRoutes from './routes/courtRoutes';
import matchRoutes from './routes/matchRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true
};

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/e_o_voley';

mongoose
  .connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.reason) {
      console.error('Error reason:', error.reason);
    }
    console.error('Please ensure MongoDB is running and accessible');
    process.exit(1);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/matches', matchRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 