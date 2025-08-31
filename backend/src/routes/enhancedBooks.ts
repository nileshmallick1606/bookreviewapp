// src/routes/enhancedBooks.ts
import { Router } from 'express';
import { EnhancedBookController, bookValidation } from '../controllers/enhancedBookController';
import { authenticate } from '../middlewares/auth.enhanced';
import { validate } from '../middlewares/validation.middleware';
import { reviewUpload } from '../middlewares/upload.middleware';
import { createReview, getBookReviews } from '../controllers/review.controller';

const router = Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get a paginated list of books
 *     description: Returns a paginated list of books with sorting options
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of books per page (default 10)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, author, publishedYear]
 *         description: Field to sort by (default title)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction (default asc)
 *     responses:
 *       200:
 *         description: A paginated list of books
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
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     total:
 *                       type: integer
 *                       example: 100
 *                 error:
 *                   type: null
 *                   example: null
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', validate(bookValidation.getBooks), EnhancedBookController.getBooks);

/**
 * @swagger
 * /books/search:
 *   get:
 *     summary: Search for books
 *     description: Search for books by title or author
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of books per page (default 10)
 *     responses:
 *       200:
 *         description: Search results
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
 *                     books:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Book'
 *                     total:
 *                       type: integer
 *                       example: 5
 *                 error:
 *                   type: null
 *                   example: null
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/search', validate(bookValidation.searchBooks), EnhancedBookController.searchBooks);

/**
 * @swagger
 * /books/suggestions:
 *   get:
 *     summary: Get book title suggestions
 *     description: Returns book title suggestions based on a query string
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Number of suggestions to return (default 5)
 *     responses:
 *       200:
 *         description: Book title suggestions
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
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["The Great Gatsby", "The Catcher in the Rye"]
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/suggestions', validate(bookValidation.searchBooks), EnhancedBookController.getSuggestions);

/**
 * @swagger
 * /books/top-rated:
 *   get:
 *     summary: Get top rated books
 *     description: Returns a list of top rated books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of books to return (default 10)
 *     responses:
 *       200:
 *         description: Top rated books
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 error:
 *                   type: null
 *                   example: null
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/top-rated', EnhancedBookController.getTopRatedBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book details
 *     description: Returns details for a specific book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *                 error:
 *                   type: null
 *                   example: null
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', validate(bookValidation.getBookById), EnhancedBookController.getBookById);

// Import auth middleware for protected routes
/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     description: Creates a new book (admin only)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Great Gatsby
 *               author:
 *                 type: string
 *                 example: F. Scott Fitzgerald
 *               description:
 *                 type: string
 *                 example: A novel about the American Dream...
 *               publishedYear:
 *                 type: integer
 *                 example: 1925
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Fiction", "Classic"]
 *               coverImage:
 *                 type: string
 *                 format: url
 *                 example: https://example.com/covers/great-gatsby.jpg
 *     responses:
 *       201:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticate(), validate(bookValidation.createBook), EnhancedBookController.createBook);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     description: Updates an existing book (admin only)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: The Great Gatsby
 *               author:
 *                 type: string
 *                 example: F. Scott Fitzgerald
 *               description:
 *                 type: string
 *                 example: A novel about the American Dream...
 *               publishedYear:
 *                 type: integer
 *                 example: 1925
 *               genres:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Fiction", "Classic"]
 *               coverImage:
 *                 type: string
 *                 format: url
 *                 example: https://example.com/covers/great-gatsby.jpg
 *     responses:
 *       200:
 *         description: Book updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Book'
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', authenticate(), validate(bookValidation.updateBook), EnhancedBookController.updateBook);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Deletes an existing book (admin only)
 *     tags: [Books]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The book ID
 *     responses:
 *       204:
 *         description: Book deleted (no content)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', authenticate(), validate(bookValidation.getBookById), EnhancedBookController.deleteBook);

// Review routes
/**
 * @swagger
 * /books/{bookId}/reviews:
 *   post:
 *     summary: Create a book review
 *     description: Creates a new review for a book
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - rating
 *             properties:
 *               text:
 *                 type: string
 *                 example: This book was amazing...
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *                 error:
 *                   type: null
 *                   example: null
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Book not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:bookId/reviews', authenticate(), reviewUpload, createReview);

/**
 * @swagger
 * /books/{bookId}/reviews:
 *   get:
 *     summary: Get book reviews
 *     description: Returns reviews for a specific book
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: bookId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The book ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of reviews per page (default 10)
 *     responses:
 *       200:
 *         description: Book reviews
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
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Review'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                 error:
 *                   type: null
 *                   example: null
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *       404:
 *         description: Book not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:bookId/reviews', getBookReviews);

// Export the router
export { router as enhancedBooksRouter };
