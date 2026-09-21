import axios from 'axios'

export const API_ORIGIN = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: API_ORIGIN,
  timeout: 10000,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(', ')
      : (detail ?? error.message ?? 'Something went wrong')
    return Promise.reject(new Error(message))
  },
)

export default api
