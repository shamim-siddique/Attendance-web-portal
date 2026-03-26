import api from "../axios";

// Users list (replaces getTeamMembers)
export const getTeamMembers = () => api.get("/web/users");

// Alias for backwards compatibility
export const getUsers = getTeamMembers;

// Dashboard overview (includes attendance summary, pending counts)
export const getDashboardOverview = (startDate, endDate) =>
  api.get("/web/dashboard/overview", { params: { startDate, endDate } });

// Row-level attendance records for the attendance table
export const getTeamAttendance = ({
  startDate,
  endDate,
  status,
  page = 1,
  limit = 20,
} = {}) =>
  api.get("/web/attendance/records", {
    params: {
      startDate,
      endDate,
      status: status || undefined,
      page,
      limit,
    },
  });

// User attendance overview
export const getUserAttendanceOverview = (userId, startDate, endDate) =>
  api.get(`/web/users/${userId}/attendance/overview`, {
    params: { startDate, endDate },
  });

// Attendance regularization (replaces overrideAttendance)
export const overrideAttendance = (userId, date, payload) =>
  api.put(`/web/users/${userId}/attendance-regularizations/${date}`, payload);

// Delete attendance regularization
export const deleteRegularization = (userId, date) =>
  api.delete(`/web/users/${userId}/attendance-regularizations/${date}`);

// Team analytics - uses attendance overview since there's no dedicated analytics endpoint
export const getTeamAnalytics = (startDate, endDate) =>
  api.get("/web/attendance/overview", {
    params: { startDate, endDate, limit: 100 },
  });
  

// Device change requests
export const getDeviceChangeRequests = () =>
  api.get("/web/device-change-requests");

export const approveDeviceChangeRequest = (requestId, actionNote = "") =>
  api.patch(`/web/device-change-requests/${requestId}/approve`, { actionNote });

export const rejectDeviceChangeRequest = (requestId, actionNote) =>
  api.patch(`/web/device-change-requests/${requestId}/reject`, { actionNote });
