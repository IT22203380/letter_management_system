import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

let accessToken = "";

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string) => {
  accessToken = token;
};

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log the error for debugging
    console.error('API Error:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      message: error.message,
    });

    // Only handle 401/403 errors for non-retry requests
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { accessToken } = res.data;
        setAccessToken(accessToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Redirect to login or handle token refresh failure
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, reject with the error
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default api;