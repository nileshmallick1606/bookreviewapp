// src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { Server } from 'http';

// Import services
import { updateTopRatedBooksIndex } from './services/book/book.service';
import { StorageServiceProvider } from './services/storageServiceProvider';
import { registerServices } from './services/serviceAdapter';

// Load environment variables
dotenv.config();

/**
 * Create and configure the Express application
 * @param testing Whether the app is being set up for testing
 */
export async function setupApp(testing: boolean = false): Promise<Application> {
  const app = express();

  // Set up middleware
  app.use(helmet()); // Security headers
  
  // Skip logging in test environment
  if (!testing) {
    app.use(morgan('dev')); // Logging
  }
  
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Important for cookies
  }));
  app.use(express.json()); // Parse JSON request body
  app.use(cookieParser()); // Parse cookies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body

  // Serve static uploads
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // Register services
  registerServices(app);

  // API routes
  app.use('/api/v1', apiRouter);

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // Error handling middleware
  app.use(errorHandler);
  
  // Initialize storage services
  if (!testing) {
    try {
      const storageProvider = StorageServiceProvider.getInstance();
      await storageProvider.initialize();
      console.log('Storage services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize storage services:', error);
    }
  }

  return app;
}

/**
 * Start the Express server
 * @returns HTTP server instance
 */
export async function startServer(): Promise<Server> {
  const app = await setupApp();
   console.log(`test`);
  const PORT = process.env.PORT || 3001;
  const server = app.listen(PORT, async () => {
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
  
  return server;
}

// For backwards compatibility
export default startServer();
