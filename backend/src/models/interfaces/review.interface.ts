/**
 * Interface for Review data model
 */
export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  text?: string;
  imageUrls?: string[];
  likes?: number;
  createdAt: Date;
  updatedAt: Date;
}
