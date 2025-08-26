// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  register, login, getCurrentUser,
  RegisterData, LoginData, UserData, ErrorResponse 
} from '../../services/authService';

// State type definition
interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk<
  UserData,
  RegisterData,
  { rejectValue: ErrorResponse }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await register(userData);
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error as ErrorResponse);
  }
});

// Async thunk for user login
export const loginUser = createAsyncThunk<
  UserData,
  LoginData & { rememberMe?: boolean },
  { rejectValue: ErrorResponse }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await login(credentials);
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error as ErrorResponse);
  }
});

// Async thunk to fetch current user
export const fetchCurrentUser = createAsyncThunk<
  UserData,
  void,
  { rejectValue: ErrorResponse }
>('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await getCurrentUser();
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error as ErrorResponse);
  }
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Registration
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<UserData>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Registration failed';
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<UserData>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error?.message || 'Login failed';
      })
      
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserData>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        // Don't show errors for auth checks, just set not authenticated
        state.isAuthenticated = false;
      });
  },
});

// Export actions and reducer
export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
