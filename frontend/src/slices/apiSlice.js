import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Determine the base URL dynamically
const getBaseUrl = () => {
  // 1. Use environment variable if provided
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }

  // 2. If the app is running on localhost, point to local API
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:8000/api';
  }

  // 3. Production default
  return 'https://abraham-app-api.onrender.com/api';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(), // dynamically set
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