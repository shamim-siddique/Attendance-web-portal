import api from "../axios";

// List leave requests with filters
export const getTeamLeaves = (startDate, endDate, status = null) => {
  const params = { startDate, endDate };
  // API expects uppercase status: PENDING, APPROVED, REJECTED, CANCELLED
  if (status && status !== "all") {
    params.status = status.toUpperCase();
  }
  return api.get("/web/leave-requests", { params });
};

// Get single leave request
export const getLeaveRequest = (leaveId) =>
  api.get(`/web/leave-requests/${leaveId}`);

// Approve leave request (actionNote is optional)
export const approveLeave = (leaveId, actionNote = "") =>
  api.patch(`/web/leave-requests/${leaveId}/approve`, { actionNote });

// Reject leave request (actionNote is required)
export const rejectLeave = (leaveId, actionNote) =>
  api.patch(`/web/leave-requests/${leaveId}/reject`, { actionNote });
