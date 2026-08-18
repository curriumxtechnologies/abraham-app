// src/slices/complaintApiSlice.js
import { apiSlice } from './apiSlice';

const COMPLAINT_URL = '/complaints';

export const complaintApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create a complaint
    createComplaint: builder.mutation({
      query: (data) => ({
        url: `${COMPLAINT_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Complaint'],
    }),

    // Get all complaints (admin: all, user: own)
    getComplaints: builder.query({
      query: () => ({
        url: `${COMPLAINT_URL}`,
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Complaint', id: _id })),
              { type: 'Complaint', id: 'LIST' },
            ]
          : [{ type: 'Complaint', id: 'LIST' }],
    }),

    // Get single complaint by ID
    getComplaintById: builder.query({
      query: (id) => ({
        url: `${COMPLAINT_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Complaint', id }],
    }),

    // Mark as read (admin only)
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `${COMPLAINT_URL}/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Complaint', id }],
    }),

    // Mark as done (owner or admin)
    markAsDone: builder.mutation({
      query: (id) => ({
        url: `${COMPLAINT_URL}/${id}/done`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Complaint', id }],
    }),

    // Delete complaint (owner or admin)
    deleteComplaint: builder.mutation({
      query: (id) => ({
        url: `${COMPLAINT_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Complaint', id }],
    }),
  }),
});

export const {
  useCreateComplaintMutation,
  useGetComplaintsQuery,        // ✅ the hook you need
  useGetComplaintByIdQuery,
  useMarkAsReadMutation,
  useMarkAsDoneMutation,
  useDeleteComplaintMutation,
} = complaintApiSlice;