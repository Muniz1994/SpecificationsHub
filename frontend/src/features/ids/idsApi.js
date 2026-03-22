import { api } from '@/app/api';

export const idsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // All community IDSs
    getIDSList: builder.query({
      query: (params = {}) => ({
        url: 'ids/',
        params,
      }),
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({ type: 'IDS', id })),
              { type: 'IDS', id: 'LIST' },
            ]
          : [{ type: 'IDS', id: 'LIST' }],
    }),

    // Single IDS detail (with nested specifications)
    getIDSDetail: builder.query({
      query: (id) => `ids/${id}/`,
      providesTags: (result, error, id) => [{ type: 'IDS', id }],
    }),

    // Current user's IDSs
    getMyIDS: builder.query({
      query: () => 'ids/mine/',
      providesTags: [{ type: 'IDS', id: 'MINE' }],
    }),

    // Search across IDSs and Specifications
    search: builder.query({
      query: (q) => ({
        url: 'search/',
        params: { q },
      }),
    }),
  }),
});

export const {
  useGetIDSListQuery,
  useGetIDSDetailQuery,
  useGetMyIDSQuery,
  useSearchQuery,
} = idsApi;
