import axios from "axios";

// Create the Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // comes from .env
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// // Optional: Request interceptor (we can add auth headers later if needed)
// apiClient.interceptors.request.use(
//   (config) => {
//     // You can add extra logic here later (e.g. tokens)
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Optional: Response interceptor (useful for handling 401 globally later)
// apiClient.interceptors.response.use(
//   (response) => {
//     return response;
//   },
//   (error) => {
//     // Later we can handle 401 → redirect to login
//     return Promise.reject(error);
//   }
// );

export default apiClient;
