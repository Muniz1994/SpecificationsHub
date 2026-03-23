/**
 * Redux store configuration.
 *
 * Combines the RTK Query API middleware with the auth slice.
 * The store is the single source of truth for the entire app.
 */
import { configureStore } from '@reduxjs/toolkit';
import { api } from '@/app/api';
import authReducer from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
