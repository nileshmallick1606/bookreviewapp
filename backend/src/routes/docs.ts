import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger.config';

const router = Router();

/**
 * @swagger
 * /api-docs:
 *   get:
 *     summary: Access the API documentation UI
 *     description: Provides interactive API documentation via Swagger UI
 *     responses:
 *       200:
 *         description: HTML page with Swagger UI
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec));

export { router as docsRouter };
