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
      providesTags: (result, error, id) => [
        { type: 'IDS', id },
        ...(result?.specifications || []).map((s) => ({ type: 'Specification', id: s.id })),
      ],
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
      invalidatesTags: [
        { type: 'IDS', id: 'MINE' },
        { type: 'Specification', id: 'MINE' },
      ],
    }),

    // Delete IDS
    deleteIDS: builder.mutation({
      query: (id) => ({
        url: `ids/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'IDS', id: 'MINE' }],
    }),

    // Delete IDS and all its owned specifications
    deleteIDSWithSpecifications: builder.mutation({
      query: (id) => ({
        url: `ids/${id}/delete_with_specifications/`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'IDS', id: 'MINE' },
        { type: 'Specification', id: 'MINE' },
      ],
    }),

    // Validate IDS against schema
    validateIDS: builder.query({
      query: (id) => `ids/${id}/validate/`,
    }),

    // Import an .ids (XML) file
    importIDSFile: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: 'ids/import_file/',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: [
        { type: 'IDS', id: 'LIST' },
        { type: 'IDS', id: 'MINE' },
        { type: 'Specification', id: 'MINE' },
      ],
    }),

    endorseIDS: builder.mutation({
      query: (id) => ({ url: `ids/${id}/endorse/`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [
        { type: 'IDS', id },
        { type: 'IDS', id: 'LIST' },
      ],
    }),

    unendorseIDS: builder.mutation({
      query: (id) => ({ url: `ids/${id}/endorse/`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'IDS', id },
        { type: 'IDS', id: 'LIST' },
      ],
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
  useDeleteIDSWithSpecificationsMutation,
  useValidateIDSQuery,
  useImportIDSFileMutation,
  useEndorseIDSMutation,
  useUnendorseIDSMutation,
} = idsApi;

/**
 * Download an IDS as a .ids (XML) file.
 * Uses fetch directly because RTK Query isn't designed for blob downloads.
 */
export async function downloadIDSFile(id, accessToken) {
  const res = await fetch(`http://localhost:8000/api/ids/${id}/download/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.errors?.join(', ') || `Download failed (${res.status})`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : 'ids.ids';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
