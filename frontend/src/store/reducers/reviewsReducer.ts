// src/store/reducers/reviewsReducer.ts

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  text: string;
  likes: string[];
  comments: {
    id: string;
    userId: string;
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  loading: false,
  error: null,
};

export const reviewsReducer = (state = initialState, action: any): ReviewsState => {
  switch (action.type) {
    default:
      return state;
  }
};
