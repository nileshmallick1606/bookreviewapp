// src/models/book/book.model.ts
/**
 * Summary of a book, used when displaying book details in other contexts
 */
export interface BookSummary {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
}

/**
 * Book model, representing a book in the system
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverImage?: string;
  genres: string[];
  publishedYear?: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}
