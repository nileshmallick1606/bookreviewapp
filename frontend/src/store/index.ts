// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { booksReducer } from './reducers/booksReducer';
import { userReducer } from './reducers/userReducer';
import { reviewsReducer } from './reducers/reviewsReducer';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    books: booksReducer,
    user: userReducer,
    reviews: reviewsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
