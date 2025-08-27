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
  averageRating?: number | null; // Optional as it may be calculated from reviews
  totalReviews?: number;         // Count of reviews for this book
  ratingDistribution?: {         // Distribution of ratings (count of each rating)
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
