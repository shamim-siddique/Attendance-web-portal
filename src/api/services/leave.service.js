import api from '../axios'

export const getTeamLeaves = (startDate, endDate, status = null) => {
  const params = { startDate, endDate }
  if (status && status !== 'all') params.status = status
  return api.get('/web/team/leaves', { params })
}

export const approveLeave = (leaveId) =>
  api.put(`/web/team/leaves/${leaveId}/approve`, {})

export const rejectLeave = (leaveId, rejection_reason) =>
  api.put(`/web/team/leaves/${leaveId}/reject`, { rejection_reason })
