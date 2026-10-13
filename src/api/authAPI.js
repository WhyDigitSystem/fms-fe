import apiClient from "./apiClient";

export const authAPI = {
  signup: (payload) => apiClient.put("/api/auth/signup", payload),

  verifyOtp: (payload) =>
    apiClient.post("/email/verify-otp", null, {
      params: {
        email: payload.email,
        otp: payload.otp,
      },
    }),

  login: (payload) => apiClient.post("/api/auth/login", payload),

  forgotPassword: (payload) =>
    apiClient.post("/api/auth/forgot-password", null, {
      params: {
        email: payload.email,
      },
    }),

  verifyResetOtp: (payload) =>
    apiClient.post("/api/auth/verify-reset-otp", null, {
      params: {
        email: payload.email,
        otp: payload.otp,
      },
    }),

  resetPassword: (payload) =>
    apiClient.post("/api/auth/reset-password", payload),
};
