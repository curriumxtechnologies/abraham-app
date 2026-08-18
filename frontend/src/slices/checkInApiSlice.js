import { apiSlice } from './apiSlice';

const CHECKIN_URL = '/checkin';

export const checkInApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get QR code for check-in/out
    getQRCode: builder.query({
      query: () => ({
        url: `${CHECKIN_URL}/qr`,
        method: 'GET',
      }),
      providesTags: ['QR'],
    }),

    // Checkout (user leaves)
    checkout: builder.mutation({
      query: (data) => ({
        url: `${CHECKIN_URL}/checkout`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CheckIn'],
    }),

    // Return (user comes back)
    returnCheckin: builder.mutation({
      query: () => ({
        url: `${CHECKIN_URL}/return`,
        method: 'POST',
      }),
      invalidatesTags: ['CheckIn'],
    }),

    // Get user's check-in history
    getMyHistory: builder.query({
      query: () => ({
        url: `${CHECKIN_URL}/history`,
        method: 'GET',
      }),
      providesTags: ['CheckIn'],
    }),

    // Admin: Get all check-ins
    getAllCheckIns: builder.query({
      query: () => ({
        url: `${CHECKIN_URL}/admin/all`,
        method: 'GET',
      }),
      providesTags: ['CheckIn'],
    }),

    // Admin: Reset user's QR code
    resetQR: builder.mutation({
      query: (userId) => ({
        url: `${CHECKIN_URL}/admin/reset-qr/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['QR'],
    }),
  }),
});

export const {
  useGetQRCodeQuery,
  useCheckoutMutation,
  useReturnCheckinMutation,
  useGetMyHistoryQuery,
  useGetAllCheckInsQuery,
  useResetQRMutation,
} = checkInApiSlice;