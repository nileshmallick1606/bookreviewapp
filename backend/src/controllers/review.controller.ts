import { Request, Response } from 'express';
import { 
  createNewReview, 
  getReviewById,
  getReviewsByBook,
  getReviewsByUser,
  updateReviewById,
  deleteReviewById,
  toggleReviewLike,
  addCommentToReview
} from '../services/review/review.service';
import { calculateAverageRating } from '../services/book/book.service';
import { ValidationError, NotFoundError, AuthorizationError, FileSystemError } from '../utils/errors';

// Extend Express Request to include files property from multer
declare global {
  namespace Express {
    interface Request {
      files?: Express.Multer.File[];
    }
  }
}

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.id; // Assuming req.user is set by auth middleware
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        error: { code: 401, message: 'Authentication required' },
        data: null
      });
      return;
    }
    
    // Get the text and parse rating as a number
    const text = req.body.text;
    const ratingStr = req.body.rating;
    const rating = parseInt(ratingStr, 10);
    
    // Get uploaded file URLs if any
    const imageUrls = req.files ? (req.files as Express.Multer.File[]).map(
      file => `/uploads/${file.filename}`
    ) : [];
    
    // Validate input
    if (isNaN(rating) || rating < 1 || rating > 5) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'Rating must be between 1 and 5' },
        data: null
      });
      return;
    }
    
    if (!text || text.length > 5000) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'Review text is required and must be less than 5000 characters' },
        data: null
      });
      return;
    }
    
    const review = await createNewReview({
      userId,
      bookId,
      rating,
      text,
      imageUrls
    });
    
    res.status(201).json({
      status: 'success',
      data: review,
      error: null
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: error.message },
        data: null
      });
      return;
    }
    
    // We've removed the duplicate review check since multiple reviews are now allowed
    
    // Check for file system errors
    if (error instanceof FileSystemError) {
      res.status(500).json({
        status: 'error',
        error: { code: 500, message: 'Storage error: ' + error.message },
        data: null
      });
      return;
    }
    
    res.status(500).json({
      status: 'error',
      error: { 
        code: 500, 
        message: 'Failed to create review: ' + (error.message || 'Unknown error') 
      },
      data: null
    });
  }
};

export const getReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const review = await getReviewById(reviewId);
    
    if (!review) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: 'Review not found' },
        data: null
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: review,
      error: null
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to fetch review' },
      data: null
    });
  }
};

export const getBookReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;
    console.log(`Received request for reviews of book: ${bookId}`);
    console.log('Request params:', req.params);
    console.log('Request path:', req.path);
    
    const reviews = await getReviewsByBook(bookId);
    console.log(`Found ${reviews.length} reviews for book ${bookId}`);
    
    res.status(200).json({
      status: 'success',
      data: reviews,
      error: null
    });
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to fetch reviews' },
      data: null
    });
  }
};

export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const reviews = await getReviewsByUser(userId);
    
    res.status(200).json({
      status: 'success',
      data: reviews,
      error: null
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to fetch reviews' },
      data: null
    });
  }
};

// Update an existing review
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id; // From auth middleware
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        error: { code: 401, message: 'Authentication required' },
        data: null
      });
      return;
    }
    
    // Get the existing review
    const existingReview = await getReviewById(reviewId);
    
    if (!existingReview) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: 'Review not found' },
        data: null
      });
      return;
    }
    
    // Check if user is the author
    if (existingReview.userId !== userId) {
      res.status(403).json({
        status: 'error',
        error: { code: 403, message: 'You can only edit your own reviews' },
        data: null
      });
      return;
    }
    
    const { rating, text, imageUrls } = req.body;
    
    // Validate input
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'Rating must be between 1 and 5' },
        data: null
      });
      return;
    }
    
    if (text !== undefined && text.length > 5000) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'Review text must be less than 5000 characters' },
        data: null
      });
      return;
    }
    
    // Update the review
    const updatedReview = await updateReviewById(reviewId, {
      rating: rating !== undefined ? rating : existingReview.rating,
      text: text !== undefined ? text : existingReview.text,
      imageUrls: imageUrls !== undefined ? imageUrls : existingReview.imageUrls
    });
    
    // Recalculate book rating if the rating changed
    if (rating !== undefined && rating !== existingReview.rating) {
      await calculateAverageRating(existingReview.bookId);
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedReview,
      error: null
    });
  } catch (error) {
    console.error('Error updating review:', error);
    
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: error.message },
        data: null
      });
      return;
    }
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: error.message },
        data: null
      });
      return;
    }
    
    if (error instanceof AuthorizationError) {
      res.status(403).json({
        status: 'error',
        error: { code: 403, message: error.message },
        data: null
      });
      return;
    }
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to update review' },
      data: null
    });
  }
};

// Delete a review
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id; // From auth middleware
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        error: { code: 401, message: 'Authentication required' },
        data: null
      });
      return;
    }
    
    // Get the existing review
    const existingReview = await getReviewById(reviewId);
    
    if (!existingReview) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: 'Review not found' },
        data: null
      });
      return;
    }
    
    // Check if user is the author
    if (existingReview.userId !== userId) {
      res.status(403).json({
        status: 'error',
        error: { code: 403, message: 'You can only delete your own reviews' },
        data: null
      });
      return;
    }
    
    // Delete the review
    await deleteReviewById(reviewId);
    
    // Recalculate book rating
    await calculateAverageRating(existingReview.bookId);
    
    res.status(200).json({
      status: 'success',
      data: { message: 'Review deleted successfully' },
      error: null
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: error.message },
        data: null
      });
      return;
    }
    
    if (error instanceof AuthorizationError) {
      res.status(403).json({
        status: 'error',
        error: { code: 403, message: error.message },
        data: null
      });
      return;
    }
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to delete review' },
      data: null
    });
  }
};

// Toggle like on a review
export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id; // From auth middleware
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        error: { code: 401, message: 'Authentication required' },
        data: null
      });
      return;
    }
    
    // Get the existing review
    const existingReview = await getReviewById(reviewId);
    
    if (!existingReview) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: 'Review not found' },
        data: null
      });
      return;
    }
    
    // Don't allow liking your own review
    if (existingReview.userId === userId) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'You cannot like your own review' },
        data: null
      });
      return;
    }
    
    // Toggle like
    const updatedReview = await toggleReviewLike(reviewId, userId);
    
    res.status(200).json({
      status: 'success',
      data: updatedReview,
      error: null
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: error.message },
        data: null
      });
      return;
    }
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to toggle like' },
      data: null
    });
  }
};

// Add comment to a review
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id; // From auth middleware
    const { text } = req.body;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        error: { code: 401, message: 'Authentication required' },
        data: null
      });
      return;
    }
    
    // Validate comment text
    if (!text || text.trim().length === 0) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'Comment text is required' },
        data: null
      });
      return;
    }
    
    if (text.length > 500) {
      res.status(400).json({
        status: 'error',
        error: { code: 400, message: 'Comment text must be less than 500 characters' },
        data: null
      });
      return;
    }
    
    // Add comment
    const updatedReview = await addCommentToReview(reviewId, userId, text);
    
    res.status(201).json({
      status: 'success',
      data: updatedReview,
      error: null
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        status: 'error',
        error: { code: 404, message: error.message },
        data: null
      });
      return;
    }
    
    res.status(500).json({
      status: 'error',
      error: { code: 500, message: 'Failed to add comment' },
      data: null
    });
  }
};
