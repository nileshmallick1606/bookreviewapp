// src/store/reducers/booksReducer.ts

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  genres: string[];
  averageRating: number;
  reviews: string[];
  createdAt: string;
  updatedAt: string;
}

interface BooksState {
  books: Book[];
  loading: boolean;
  error: string | null;
  selectedBook: Book | null;
}

const initialState: BooksState = {
  books: [],
  loading: false,
  error: null,
  selectedBook: null,
};

export const booksReducer = (state = initialState, action: any): BooksState => {
  switch (action.type) {
    default:
      return state;
  }
};
