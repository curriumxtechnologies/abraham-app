import { apiSlice } from './apiSlice';

const CHECKIN_URL = '/checkin';

export const checkInApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ──────────────────────────────────────────────────────────────
    // User-facing endpoints (authenticated)
    // ──────────────────────────────────────────────────────────────

    // Get QR code for the current user
    getQRCode: builder.query({
      query: () => ({
        url: `${CHECKIN_URL}/qr`,
        method: 'GET',
      }),
      providesTags: ['QR'],
    }),

    // Manual checkout (user leaves) – requires expectedReturnTime
    checkout: builder.mutation({
      query: (data) => ({
        url: `${CHECKIN_URL}/checkout`,
        method: 'POST',
        body: data, // { expectedReturnTime }
      }),
      invalidatesTags: ['CheckIn'],
    }),

    // Manual return (user comes back)
    returnCheckin: builder.mutation({
      query: () => ({
        url: `${CHECKIN_URL}/return`,
        method: 'POST',
      }),
      invalidatesTags: ['CheckIn'],
    }),

    // Get user's own check-in/out history
    getMyHistory: builder.query({
      query: () => ({
        url: `${CHECKIN_URL}/history`,
        method: 'GET',
      }),
      providesTags: ['CheckIn'],
    }),

    // ──────────────────────────────────────────────────────────────
    // Scanner endpoints (public – token in request body)
    // These are used by the scanner device to check in/out a user
    // based on a QR code token.
    // ──────────────────────────────────────────────────────────────

    // Scanner checkout – user leaves
    checkoutByToken: builder.mutation({
      query: (data) => ({
        url: `${CHECKIN_URL}/scan/checkout`,
        method: 'POST',
        body: data, // { token, expectedReturnTime }
      }),
      invalidatesTags: ['CheckIn'],
    }),

    // Scanner return – user comes back
    returnByToken: builder.mutation({
      query: (data) => ({
        url: `${CHECKIN_URL}/scan/return`,
        method: 'POST',
        body: data, // { token }
      }),
      invalidatesTags: ['CheckIn'],
    }),

    // ──────────────────────────────────────────────────────────────
    // Admin endpoints
    // ──────────────────────────────────────────────────────────────

    // Admin: get all check-in records
    getAllCheckIns: builder.query({
      query: () => ({
        url: `${CHECKIN_URL}/admin/all`,
        method: 'GET',
      }),
      providesTags: ['CheckIn'],
    }),

    // Admin: reset a user's QR code (invalidates old token)
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
  // User
  useGetQRCodeQuery,
  useCheckoutMutation,
  useReturnCheckinMutation,
  useGetMyHistoryQuery,

  // Scanner
  useCheckoutByTokenMutation,
  useReturnByTokenMutation,

  // Admin
  useGetAllCheckInsQuery,
  useResetQRMutation,
} = checkInApiSlice;