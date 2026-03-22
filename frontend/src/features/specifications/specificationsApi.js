import { api } from '@/app/api';

export const specificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // All community specifications
    getSpecifications: builder.query({
      query: (params = {}) => ({
        url: 'specifications/',
        params,
      }),
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({
                type: 'Specification',
                id,
              })),
              { type: 'Specification', id: 'LIST' },
            ]
          : [{ type: 'Specification', id: 'LIST' }],
    }),

    // Single specification detail
    getSpecificationDetail: builder.query({
      query: (id) => `specifications/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Specification', id }],
    }),

    // Current user's specifications
    getMySpecifications: builder.query({
      query: () => 'specifications/mine/',
      providesTags: [{ type: 'Specification', id: 'MINE' }],
    }),
  }),
});

export const {
  useGetSpecificationsQuery,
  useGetSpecificationDetailQuery,
  useGetMySpecificationsQuery,
} = specificationsApi;
