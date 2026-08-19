import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    return 'http://localhost:8000/api';
  }
  return 'https://abraham-app-api.onrender.com/api';
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers) => {
    return headers;
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const state = api.getState();
  // 👇 Use the same auth slice for all requests
  const token = state.auth?.userInfo?.token;

  const headers = new Headers(
    typeof args === 'string' ? undefined : args.headers
  );

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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
  tagTypes: [
    'User',
    'Hostel',
    'Building',
    'Room',
    'Bunk',
    'CheckIn',
    'QR',
    'Complaint',
    'Transaction',
  ],
  endpoints: (builder) => ({}),
});