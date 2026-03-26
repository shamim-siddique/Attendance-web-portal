import api from "../axios";

export const googleLogin = (googleToken) =>
  api.post("/web/auth/google/login", { googleToken });

export const refreshTokens = (refreshToken) =>
  api.post("/web/auth/refresh", { refreshToken });

export const logout = (refreshToken) =>
  api.post("/web/auth/logout", { refreshToken });
