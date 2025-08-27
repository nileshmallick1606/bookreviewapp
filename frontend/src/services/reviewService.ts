import api from './api';

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  text: string;
  imageUrls?: string[];
  likes: string[];
  comments: ReviewComment[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

/**
 * Create a new review for a book
 * @param bookId - ID of the book to review
 * @param formData - FormData containing review data (rating, text, images)
 * @returns The created review
 */
export const createReview = async (bookId: string, formData: FormData): Promise<Review> => {
  // Get current cookies from document
  console.log('Cookies being sent:', document.cookie);
  
  const response = await api.post(`/books/${bookId}/reviews`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true // Ensure credentials are sent with the request
  });
  return response.data.data;
};

/**
 * Get a specific review by ID
 * @param reviewId - ID of the review
 * @returns The review
 */
export const getReview = async (reviewId: string): Promise<Review> => {
  const response = await api.get(`/reviews/${reviewId}`);
  return response.data.data;
};

/**
 * Get all reviews for a book
 * @param bookId - ID of the book
 * @returns Array of reviews
 */
export const getBookReviews = async (bookId: string): Promise<Review[]> => {
  try {
    // First try the expected path format
    const response = await api.get(`/books/${bookId}/reviews`);
    return response.data.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      // If 404, try alternate path format
      console.log('Trying alternate reviews endpoint path...');
      const response = await api.get(`/reviews/books/${bookId}`);
      return response.data.data;
    }
    throw error;
  }
};

/**
 * Update an existing review
 * @param reviewId - ID of the review to update
 * @param formData - FormData containing updated review data
 * @returns The updated review
 */
export const updateReview = async (reviewId: string, formData: FormData): Promise<Review> => {
  const response = await api.put(`/reviews/${reviewId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data.data;
};

/**
 * Delete a review
 * @param reviewId - ID of the review to delete
 * @returns Success status
 */
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data.status === 'success';
};

/**
 * Toggle like status for a review
 * @param reviewId - ID of the review to like/unlike
 * @returns Updated review with new like status
 */
export const toggleLikeReview = async (reviewId: string): Promise<Review> => {
  const response = await api.post(`/reviews/${reviewId}/like`);
  return response.data.data;
};

/**
 * Add a comment to a review
 * @param reviewId - ID of the review to comment on
 * @param text - Comment text
 * @returns Updated review with new comment
 */
export const addReviewComment = async (reviewId: string, text: string): Promise<Review> => {
  const response = await api.post(`/reviews/${reviewId}/comment`, { text });
  return response.data.data;
};
