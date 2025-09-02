import axios from 'axios';

const axiosInstance = axios.create();

// Interceptor for handling responses
axiosInstance.interceptors.response.use(
  response => {
    // If the response is successful, return it
    
    return response;
  },
  error => {
    const { response } = error;
    
    if (response) {
      // If the response status is 401 (Unauthorized)
      if (response.status === 401) {
        // Redirect to /login and reload the page
        window.location.href = '/login';
        // Optional: If you want to ensure that the page reloads after redirect:
        window.location.reload();
      }
    }

    // For all other errors, reject the error to be handled in .catch
    return Promise.reject(error);
  }
);

export default axiosInstance;