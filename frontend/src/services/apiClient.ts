import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://sea-lion-app-y4r7v.ondigitalocean.app/arenius-backend2",//process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default apiClient;
