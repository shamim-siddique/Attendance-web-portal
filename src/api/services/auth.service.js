import api from '../axios'

export const googleLogin = (google_token) =>
  api.post('/web/auth/google', { google_token })

export const refreshTokens = (refresh_token) =>
  api.post('/auth/refresh', { refresh_token })
