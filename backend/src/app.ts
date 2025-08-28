// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';

// Load environment variables
dotenv.config();

const app = express();

// Set up middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Important for cookies
}));
app.use(express.json()); // Parse JSON request body
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import the function to update top-rated books index
import { updateTopRatedBooksIndex } from './services/book/book.service';

// API routes
app.use('/api/v1', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Update the top-rated books index when the server starts, but not in development mode with nodemon
  if (process.env.NODE_ENV !== 'development' || process.env.FORCE_UPDATE_INDEX === 'true') {
    try {
      await updateTopRatedBooksIndex();
      console.log('Top-rated books index updated successfully');
    } catch (error) {
      console.error('Failed to update top-rated books index:', error);
    }
  } else {
    console.log('Skipping top-rated books index update in development mode');
  }
});

export default app;
