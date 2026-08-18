import { apiSlice } from './apiSlice';

const USER_URL = '/users';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ──────────────────────────────────────────────────────────
    // AUTHENTICATION
    // ──────────────────────────────────────────────────────────

    // Register a new user
    register: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/register`,
        method: 'POST',
        body: data,
      }),
    }),

    // Login with email or matric number
    login: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/login`,
        method: 'POST',
        body: data,
      }),
    }),

    // Verify OTP for email verification, 2FA, or password reset
    verifyOTP: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/verify-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    // Forgot password - send OTP
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password with reset token
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USER_URL}/reset-password`,
        method: 'POST',
        body: data,
      }),
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: `${USER_URL}/logout`,
        method: 'POST',
      }),
    }),

    // ──────────────────────────────────────────────────────────
    // USER PROFILE
    // ──────────────────────────────────────────────────────────

    // Get current user info
    getUserInfo: builder.query({
      query: () => ({
        url: `${USER_URL}/me`,
        method: 'GET',
      }),
      providesTags: (result) => [{ type: 'User', id: result?.user?._id || 'ME' }],
    }),

    // Update profile (picture or password)
    updateProfile: builder.mutation({
      query: (formData) => ({
        url: `${USER_URL}/update`,
        method: 'PUT',
        body: formData,
        formData: true, // For file upload
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

    // Toggle two-factor authentication
    toggleTwoFactor: builder.mutation({
      query: () => ({
        url: `${USER_URL}/toggle-2fa`,
        method: 'PUT',
      }),
      invalidatesTags: (result) => [{ type: 'User', id: 'ME' }],
    }),

    // ──────────────────────────────────────────────────────────
    // ADMIN
    // ──────────────────────────────────────────────────────────

    // Get all students (admin only)
    getAllStudents: builder.query({
      query: ({ role = '' } = {}) => {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        return {
          url: `${USER_URL}?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({ type: 'User', id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

// ──────────────────────────────────────────────────────────────
// EXPORTED HOOKS
// ──────────────────────────────────────────────────────────────

export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useVerifyOTPMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,

  // Profile
  useGetUserInfoQuery,
  useUpdateProfileMutation,
  useToggleTwoFactorMutation,

  // Admin
  useGetAllStudentsQuery,
} = userApiSlice;