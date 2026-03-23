import { api } from '@/app/api';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (data) => ({
        url: 'auth/register/',
        method: 'POST',
        body: data,
      }),
    }),

    getMe: builder.query({
      query: () => 'auth/me/',
      providesTags: ['User'],
    }),

    updateMe: builder.mutation({
      query: (data) => ({
        url: 'auth/me/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    getAvatars: builder.query({
      query: () => 'auth/avatars/',
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useGetAvatarsQuery,
} = authApi;
