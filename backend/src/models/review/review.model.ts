import { v4 as uuidv4 } from 'uuid';

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number; // 1-5 stars
  text: string;
  imageUrls?: string[];
  likes: string[]; // array of user IDs who liked the review
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

export interface ReviewCreationParams {
  userId: string;
  bookId: string;
  rating: number;
  text: string;
  imageUrls?: string[];
}

export interface ReviewUpdateParams {
  rating?: number;
  text?: string;
  imageUrls?: string[];
}

export const createReview = (params: ReviewCreationParams): Review => {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    userId: params.userId,
    bookId: params.bookId,
    rating: params.rating,
    text: params.text,
    imageUrls: params.imageUrls || [],
    likes: [],
    comments: [],
    createdAt: now,
    updatedAt: now
  };
};
