/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL ?? '',
  timeout: 15_000,
})

// ─── Request ───────────────────────────────────────────────
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = token
  const lang = localStorage.getItem('lang') ?? 'en'
  config.headers['accept-language'] = lang
  return config
})

// ─── Response ──────────────────────────────────────────────
// Unwrap API envelope: { code, data, message } → data (or reject)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
http.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res: any) => {
    const data = res.data
    const noMsg = (res.config as Record<string, unknown>).noMsg

    if (data.code === 200) return data.data

    if (data.code === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      return Promise.reject(data)
    }

    if (!noMsg) {
      const msg: string = data.message ?? 'Error'
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: { message: msg, type: data.code === 403 ? 'warning' : 'error' },
        })
      )
    }

    return Promise.reject(data)
  },
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(err)
  }
)

export default http
