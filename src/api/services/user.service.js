import api from "../axios";

// Create new user
export const createUser = (payload) => api.post("/web/users", payload);

// Get user by ID
export const getUser = (userId) => api.get(`/web/users/${userId}`);

// Update user
export const updateUser = (userId, payload) =>
  api.patch(`/web/users/${userId}`, payload);

// Get user attendance profile (geofence settings)
export const getUserLocation = (userId) =>
  api.get(`/web/users/${userId}/attendance-profile`);

// Update user attendance profile (geofence settings)
export const setUserLocation = (userId, payload) =>
  api.put(`/web/users/${userId}/attendance-profile`, payload);

// Get my profile
export const getMyProfile = () => api.get("/web/me/profile");
