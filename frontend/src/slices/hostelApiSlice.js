import { apiSlice } from './apiSlice';

const HOSTEL_URL = '/hostel';

export const hostelApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── User endpoints ──────────────────────────────────────────

    // Get all hostels (with buildings, rooms, bunks)
    getHostels: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}`,
        method: 'GET',
      }),
      providesTags: ['Hostel', 'Building', 'Room', 'Bunk'],
    }),

    // Allocate a bunk to the current user
    allocateBunk: builder.mutation({
      query: (data) => ({
        url: `${HOSTEL_URL}/allocate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bunk', 'User'],
    }),

    // Get current user's allocation (full nested details)
    getMyAllocation: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}/my-allocation`,
        method: 'GET',
      }),
      providesTags: (result) => [{ type: 'Bunk', id: result?.data?._id || 'ALLOCATION' }],
    }),

    // ─── Admin endpoints ──────────────────────────────────────────

    // Create a new hostel (male/female)
    createHostel: builder.mutation({
      query: (data) => ({
        url: `${HOSTEL_URL}/admin/hostel`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Hostel'],
    }),

    // Create a building under a hostel
    createBuilding: builder.mutation({
      query: (data) => ({
        url: `${HOSTEL_URL}/admin/building`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Building'],
    }),

    // Create a room with auto‑generated bunks
    createRoom: builder.mutation({
      query: (data) => ({
        url: `${HOSTEL_URL}/admin/room`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Room', 'Bunk'],
    }),

    // Get all bunks (admin overview)
    getAllBunks: builder.query({
      query: () => ({
        url: `${HOSTEL_URL}/admin/bunks`,
        method: 'GET',
      }),
      providesTags: ['Bunk'],
    }),

    // Delete a hostel (cascade)
    deleteHostel: builder.mutation({
      query: (id) => ({
        url: `${HOSTEL_URL}/admin/hostel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hostel', 'Building', 'Room', 'Bunk'],
    }),
  }),
});

export const {
  // User endpoints
  useGetHostelsQuery,
  useAllocateBunkMutation,
  useGetMyAllocationQuery,

  // Admin endpoints
  useCreateHostelMutation,
  useCreateBuildingMutation,
  useCreateRoomMutation,
  useGetAllBunksQuery,
  useDeleteHostelMutation,
} = hostelApiSlice;