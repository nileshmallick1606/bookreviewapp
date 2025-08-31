// src/routes/enhancedAuth.ts
import { Router } from 'express';
import { EnhancedAuthController, authValidation } from '../controllers/enhancedAuthController';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.enhanced';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *   schemas:
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         fullName:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, admin]
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication information is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               data:
 *                 type: null
 *                 example: null
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                     example: 401
 *                   message:
 *                     type: string
 *                     example: You are not authenticated. Please login.
 *     ForbiddenError:
 *       description: You do not have permission to perform this action
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               data:
 *                 type: null
 *                 example: null
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: integer
 *                     example: 403
 *                   message:
 *                     type: string
 *                     example: You do not have permission to perform this action.
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *                 error:
 *                   type: null
 *                   example: null
 *       409:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 409
 *                     message:
 *                       type: string
 *                       example: User with this email already exists
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', validate(authValidation.register), EnhancedAuthController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and returns a JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=...; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: Invalid email or password
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', validate(authValidation.login), EnhancedAuthController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     description: Uses a refresh token to generate a new access token
 *     tags: [Authentication]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: accessToken=...; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *                 error:
 *                   type: null
 *                   example: null
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 data:
 *                   type: null
 *                   example: null
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: integer
 *                       example: 401
 *                     message:
 *                       type: string
 *                       example: Invalid or expired refresh token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/refresh', validate(authValidation.refreshToken), EnhancedAuthController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the user's refresh token and clears cookies
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Logged out successfully
 *                 error:
 *                   type: null
 *                   example: null
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/logout', authenticate(), EnhancedAuthController.logout);

// Export the router
export { router as enhancedAuthRouter };
