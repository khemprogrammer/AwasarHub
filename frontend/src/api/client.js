import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // If the error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const refreshToken = localStorage.getItem('refresh')
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/api/auth/token/refresh/`, {
            refresh: refreshToken
          })
          
          const { access } = response.data
          localStorage.setItem('access', access)
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and let the error propagate
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
