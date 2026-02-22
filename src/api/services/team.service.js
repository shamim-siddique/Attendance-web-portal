import api from '../axios'

export const getTeamMembers = () =>
  api.get('/web/team/members')

export const getTeamAttendance = (startDate, endDate) =>
  api.get('/web/team/attendance', { params: { startDate, endDate } })

export const overrideAttendance = (payload) =>
  api.post('/web/team/attendance/override', payload)

export const getTeamAnalytics = (startDate, endDate) =>
  api.get('/web/team/analytics', { params: { startDate, endDate } })
