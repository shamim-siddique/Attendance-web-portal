import api from "../axios";

export const getHolidays = (params) => api.get("/web/holidays", { params });

export const getHoliday = (holidayId) => api.get(`/web/holidays/${holidayId}`);

export const createHoliday = (payload) => api.post("/web/holidays", payload);

export const updateHoliday = (holidayId, payload) =>
  api.patch(`/web/holidays/${holidayId}`, payload);

export const deleteHoliday = (holidayId, payload) =>
  api.delete(`/web/holidays/${holidayId}`, { data: payload });

export const getHolidayHistory = (holidayId) =>
  api.get(`/web/holidays/${holidayId}/history`);
