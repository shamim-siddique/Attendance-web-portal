import api from '../axios'

export const getTeamMembers = () => {
  console.log('Making API call to /web/team/members')
  return api.get('/web/team/members')
}

export const getTeamAttendance = (startDate, endDate) => {
  console.log('Making API call to /web/team/attendance with params:', { startDate, endDate })
  return api.get('/web/team/attendance', { params: { startDate, endDate } })
}

export const overrideAttendance = (payload) =>
  api.post('/web/team/attendance/override', payload)

export const getTeamAnalytics = (startDate, endDate) => {
  console.log('Making API call to /web/team/analytics with params:', { startDate, endDate })
  return api.get('/web/team/analytics', { params: { startDate, endDate } })
}

export const getDeviceChangeRequests = () =>
  api.get('/web/team/device-change-requests')

export const approveDeviceChangeRequest = (requestId) =>
  api.post(`/web/team/device-change-requests/${requestId}/approve`, {})

export const rejectDeviceChangeRequest = (requestId, reviewComment = '') =>
  api.post(`/web/team/device-change-requests/${requestId}/reject`, { reviewComment })
