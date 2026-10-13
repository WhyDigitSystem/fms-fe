import axios from "axios";

// Create Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
  let token =
    localStorage.getItem("user.token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    JSON.parse(localStorage.getItem("user") || "{}")?.token;

  if (token) {
    token = token.replace("Bearer ", ""); // remove double Bearer
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

export default apiClient;
