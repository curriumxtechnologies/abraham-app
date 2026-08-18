import { apiSlice } from './apiSlice';

const HOSTEL_URL = '/hostel';

export const hostelApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get available bunks
    getAvailableBunks: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}/available`,
        method: 'GET',
      }),
      providesTags: ['Bunk'],
    }),

    // Initiate payment for a bunk
    initiatePayment: builder.mutation({
      query: (data) => ({
        url: `${HOSTEL_URL}/initiate-payment`,
        method: 'POST',
        body: data,
      }),
    }),

    // Verify payment status
    verifyPayment: builder.query({
      query: (reference) => ({
        url: `${HOSTEL_URL}/verify-payment/${reference}`,
        method: 'GET',
      }),
    }),

    // Get user's allocation
    getMyAllocation: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}/my-allocation`,
        method: 'GET',
      }),
      providesTags: (result) => [{ type: 'Bunk', id: result?.data?._id || 'ALLOCATION' }],
    }),

    // Get user's transaction history
    getMyTransactions: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}/my-transactions`,
        method: 'GET',
      }),
      providesTags: ['Transaction'],
    }),

    // Admin: Set up rooms
    setupRooms: builder.mutation({
      query: (data) => ({
        url: `${HOSTEL_URL}/admin/setup`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bunk'],
    }),

    // Admin: Get all transactions
    getAllTransactions: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}/admin/transactions`,
        method: 'GET',
      }),
      providesTags: ['Transaction'],
    }),

    // ─── NEW: Get all bunks (admin) ──────────────────────────
    getAllBunks: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}/admin/bunks`,
        method: 'GET',
      }),
      providesTags: ['Bunk'],
    }),
  }),
});

export const {
  useGetAvailableBunksQuery,
  useInitiatePaymentMutation,
  useVerifyPaymentQuery,
  useGetMyAllocationQuery,
  useGetMyTransactionsQuery,
  useSetupRoomsMutation,
  useGetAllTransactionsQuery,
  useGetAllBunksQuery,   // ✅ exported
} = hostelApiSlice;