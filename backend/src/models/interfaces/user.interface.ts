/**
 * Interface for User data model
 */
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  preferences?: {
    favoriteGenres?: string[];
    favoriteAuthors?: string[];
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}
