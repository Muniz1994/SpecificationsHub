/**
 * Auth Redux slice.
 *
 * Manages JWT tokens and the current user object.
 * Tokens are persisted to localStorage so the user stays logged in
 * across browser refreshes.
 */
import { createSlice } from '@reduxjs/toolkit';

// Try to restore tokens from localStorage on app start
const accessToken = localStorage.getItem('accessToken') || null;
const refreshToken = localStorage.getItem('refreshToken') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken,
    refreshToken,
    user: null,
  },
  reducers: {
    /**
     * Called after a successful login. Stores both tokens in Redux
     * state and localStorage.
     */
    setCredentials(state, action) {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      localStorage.setItem('accessToken', action.payload.access);
      localStorage.setItem('refreshToken', action.payload.refresh);
    },

    /**
     * Called when the /auth/me/ response arrives so we have the full
     * user profile in state.
     */
    setUser(state, action) {
      state.user = action.payload;
    },

    /**
     * Called by the reauth wrapper when a token refresh succeeds.
     */
    tokenRefreshed(state, action) {
      state.accessToken = action.payload.access;
      if (action.payload.refresh) {
        state.refreshToken = action.payload.refresh;
        localStorage.setItem('refreshToken', action.payload.refresh);
      }
      localStorage.setItem('accessToken', action.payload.access);
    },

    /**
     * Clears all auth state and localStorage.
     */
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, setUser, tokenRefreshed, logout } =
  authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;

export default authSlice.reducer;
