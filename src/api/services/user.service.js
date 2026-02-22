import api from '../axios'

export const createUser = (payload) =>
  api.post('/web/users/', payload)

export const setUserLocation = (userId, payload) =>
  api.put(`/web/users/${userId}/location`, payload)

export const getUserLocation = (userId) =>
  api.get(`/web/users/${userId}/location`)
