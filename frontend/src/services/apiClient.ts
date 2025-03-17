import axios from "axios";

const apiClient = 
axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const status = error.response ? error.response.status : null;
    
    if (status === 401) {
      // Handle unauthorized access
      console.log("Unauthorized access");
      window.location.href = "/";
    } else {
      // Handle other errors
      console.error("An error occurred:", error);
    }
    
    return Promise.reject(error);
  }
);


export default apiClient;
