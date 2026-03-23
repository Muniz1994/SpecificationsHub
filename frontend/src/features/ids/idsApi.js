import { api } from '@/app/api';

export const idsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getIDSList: builder.query({
      query: (params = {}) => ({ url: 'ids/', params }),
      providesTags: (result) =>
        result?.results
          ? [...result.results.map(({ id }) => ({ type: 'IDS', id })), { type: 'IDS', id: 'LIST' }]
          : [{ type: 'IDS', id: 'LIST' }],
    }),

    getIDSDetail: builder.query({
      query: (id) => `ids/${id}/`,
      providesTags: (result, error, id) => [{ type: 'IDS', id }],
    }),

    getMyIDS: builder.query({
      query: () => 'ids/mine/',
      providesTags: [{ type: 'IDS', id: 'MINE' }],
    }),

    createIDS: builder.mutation({
      query: (body) => ({ url: 'ids/', method: 'POST', body }),
      invalidatesTags: [{ type: 'IDS', id: 'LIST' }, { type: 'IDS', id: 'MINE' }],
    }),

    updateIDS: builder.mutation({
      query: ({ id, ...body }) => ({ url: `ids/${id}/`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'IDS', id }, { type: 'IDS', id: 'LIST' }],
    }),

    deleteIDS: builder.mutation({
      query: (id) => ({ url: `ids/${id}/`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'IDS', id: 'LIST' }, { type: 'IDS', id: 'MINE' }],
    }),

    addSpecificationToIDS: builder.mutation({
      query: ({ idsId, specificationId }) => ({
        url: `ids/${idsId}/add_specification/`,
        method: 'POST',
        body: { specification_id: specificationId },
      }),
      invalidatesTags: (result, error, { idsId }) => [{ type: 'IDS', id: idsId }],
    }),

    removeSpecificationFromIDS: builder.mutation({
      query: ({ idsId, specificationId }) => ({
        url: `ids/${idsId}/remove_specification/`,
        method: 'POST',
        body: { specification_id: specificationId },
      }),
      invalidatesTags: (result, error, { idsId }) => [{ type: 'IDS', id: idsId }],
    }),

    search: builder.query({
      query: (q) => ({ url: 'search/', params: { q } }),
    }),

    // Copy IDS to user library
    copyIDSToLibrary: builder.mutation({
      query: (id) => ({
        url: `ids/${id}/copy_to_library/`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'IDS', id: 'MINE' }],
    }),

    // Delete IDS
    deleteIDS: builder.mutation({
      query: (id) => ({
        url: `ids/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'IDS', id: 'MINE' }],
    }),
  }),
});

export const {
  useGetIDSListQuery,
  useGetIDSDetailQuery,
  useGetMyIDSQuery,
  useCreateIDSMutation,
  useUpdateIDSMutation,
  useAddSpecificationToIDSMutation,
  useRemoveSpecificationFromIDSMutation,
  useSearchQuery,
  useCopyIDSToLibraryMutation,
  useDeleteIDSMutation,
} = idsApi;
