/**
 * Interface for Book data model
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genres: string[];
  publishedYear: number;
  createdAt: Date;
  updatedAt: Date;
  averageRating?: number; // Optional as it may be calculated from reviews
  reviewCount?: number;   // Optional as it may be calculated from reviews
}
