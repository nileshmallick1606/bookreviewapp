// src/store/reducers/userReducer.ts

export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  favoriteBooks: string[];
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

export const userReducer = (state = initialState, action: any): UserState => {
  switch (action.type) {
    default:
      return state;
  }
};
