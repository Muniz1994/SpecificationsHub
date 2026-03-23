import { api } from '@/app/api';

export const tagsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query({
      query: (params = {}) => ({ url: 'tags/', params }),
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({ type: 'Tag', id })),
              { type: 'Tag', id: 'LIST' },
            ]
          : [{ type: 'Tag', id: 'LIST' }],
    }),

    createTag: builder.mutation({
      query: (body) => ({ url: 'tags/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tag', id: 'LIST' }],
    }),

    addTagToIDS: builder.mutation({
      query: ({ idsId, tagId }) => ({
        url: `ids/${idsId}/tags/`,
        method: 'POST',
        body: { tag_id: tagId },
      }),
      invalidatesTags: (result, error, { idsId }) => [{ type: 'IDS', id: idsId }],
    }),

    removeTagFromIDS: builder.mutation({
      query: ({ idsId, tagId }) => ({
        url: `ids/${idsId}/tags/`,
        method: 'DELETE',
        body: { tag_id: tagId },
      }),
      invalidatesTags: (result, error, { idsId }) => [{ type: 'IDS', id: idsId }],
    }),

    addTagToSpecification: builder.mutation({
      query: ({ specId, tagId }) => ({
        url: `specifications/${specId}/tags/`,
        method: 'POST',
        body: { tag_id: tagId },
      }),
      invalidatesTags: (result, error, { specId }) => [{ type: 'Specification', id: specId }],
    }),

    removeTagFromSpecification: builder.mutation({
      query: ({ specId, tagId }) => ({
        url: `specifications/${specId}/tags/`,
        method: 'DELETE',
        body: { tag_id: tagId },
      }),
      invalidatesTags: (result, error, { specId }) => [{ type: 'Specification', id: specId }],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useCreateTagMutation,
  useAddTagToIDSMutation,
  useRemoveTagFromIDSMutation,
  useAddTagToSpecificationMutation,
  useRemoveTagFromSpecificationMutation,
} = tagsApi;
