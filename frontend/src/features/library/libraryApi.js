import { api } from '@/app/api';

export const libraryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLibrary: builder.query({
      query: () => 'library/',
      providesTags: [{ type: 'Library', id: 'LIST' }],
    }),

    saveToLibrary: builder.mutation({
      query: (body) => ({ url: 'library/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Library', id: 'LIST' }],
    }),

    removeFromLibrary: builder.mutation({
      query: (id) => ({ url: `library/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Library', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetLibraryQuery,
  useSaveToLibraryMutation,
  useRemoveFromLibraryMutation,
} = libraryApi;
