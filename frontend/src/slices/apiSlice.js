import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL || ''}/api`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const state = api.getState();

  const adminToken = state.adminAuth?.adminInfo?.token;
  const userToken = state.auth?.userInfo?.token;

  const url = typeof args === 'string' ? args : args.url;

  const isAdminRoute = url?.includes('/admin');

  const headers = new Headers(
    typeof args === 'string' ? undefined : args.headers
  );

  if (isAdminRoute && adminToken) {
    headers.set('Authorization', `Bearer ${adminToken}`);
  } else if (!isAdminRoute && userToken) {
    headers.set('Authorization', `Bearer ${userToken}`);
  }

  const modifiedArgs =
    typeof args === 'string'
      ? { url: args, headers }
      : { ...args, headers };

  return rawBaseQuery(modifiedArgs, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Anonymous', 'Talent', 'Admin'],
  endpoints: (builder) => ({}),
});