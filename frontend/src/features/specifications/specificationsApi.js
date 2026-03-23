import { api } from '@/app/api';

export const specificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSpecifications: builder.query({
      query: (params = {}) => ({ url: 'specifications/', params }),
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({ type: 'Specification', id })),
              { type: 'Specification', id: 'LIST' },
            ]
          : [{ type: 'Specification', id: 'LIST' }],
    }),

    getSpecificationDetail: builder.query({
      query: (id) => `specifications/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Specification', id }],
    }),

    getMySpecifications: builder.query({
      query: () => 'specifications/mine/',
      providesTags: [{ type: 'Specification', id: 'MINE' }],
    }),

    createSpecification: builder.mutation({
      query: (body) => ({ url: 'specifications/', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Specification', id: 'LIST' },
        { type: 'Specification', id: 'MINE' },
      ],
    }),

    updateSpecification: builder.mutation({
      query: ({ id, ...body }) => ({ url: `specifications/${id}/`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Specification', id },
        { type: 'Specification', id: 'LIST' },
        { type: 'Specification', id: 'MINE' },
      ],
    }),

    deleteSpecification: builder.mutation({
      query: (id) => ({ url: `specifications/${id}/`, method: 'DELETE' }),
      invalidatesTags: [
        { type: 'Specification', id: 'LIST' },
        { type: 'Specification', id: 'MINE' },
      ],
    }),

    copySpecificationToLibrary: builder.mutation({
      query: ({ id, name } = {}) => ({
        url: `specifications/${id}/copy_to_library/`,
        method: 'POST',
        body: name ? { name } : undefined,
      }),
      invalidatesTags: [{ type: 'Specification', id: 'MINE' }],
    }),

    endorseSpecification: builder.mutation({
      query: (id) => ({ url: `specifications/${id}/endorse/`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Specification', id },
        { type: 'Specification', id: 'LIST' },
      ],
    }),

    unendorseSpecification: builder.mutation({
      query: (id) => ({ url: `specifications/${id}/endorse/`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Specification', id },
        { type: 'Specification', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSpecificationsQuery,
  useGetSpecificationDetailQuery,
  useGetMySpecificationsQuery,
  useCreateSpecificationMutation,
  useUpdateSpecificationMutation,
  useDeleteSpecificationMutation,
  useCopySpecificationToLibraryMutation,
  useEndorseSpecificationMutation,
  useUnendorseSpecificationMutation,
} = specificationsApi;
