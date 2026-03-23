/**
 * RTK Query base API definition.
 *
 * Every feature-specific API (auth, ids, specifications, …) injects
 * its endpoints into this single base API so that all network requests
 * go through the same Redux middleware and share a single cache.
 *
 * The `baseQueryWithReauth` wrapper automatically refreshes the JWT
 * access token when a 401 is returned and retries the original request.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/';

// -------------------------------------------------------------------
// Base query – attaches the JWT access token to every request
// -------------------------------------------------------------------
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// -------------------------------------------------------------------
// Wrapper that handles 401 by refreshing the token once
// -------------------------------------------------------------------
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: 'auth/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new tokens
        api.dispatch({
          type: 'auth/tokenRefreshed',
          payload: refreshResult.data,
        });
        // Retry the original request
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed – log the user out
        api.dispatch({ type: 'auth/logout' });
      }
    }
  }

  return result;
};

// -------------------------------------------------------------------
// The single API slice – features inject endpoints into this
// -------------------------------------------------------------------
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['IDS', 'Specification', 'User', 'Tag', 'Library'],
  endpoints: () => ({}), // endpoints are injected by feature slices
});
