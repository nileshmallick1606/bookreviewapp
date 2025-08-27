// src/routes/data.ts
import { Router } from 'express';
import { DataController } from '../controllers/dataController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Health check route (not protected)
router.get('/health', DataController.checkDataDirectories);

// All other routes are protected by authentication
router.use(authenticate);

// Data generation routes
router.post('/generate/books', DataController.generateBooks);

// Export the router
export { router as dataRouter };
