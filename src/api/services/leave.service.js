import api from '../axios'

export const getTeamLeaves = (startDate, endDate, status = null) => {
  const params = { startDate, endDate }
  if (status && status !== 'all') params.status = status
  console.log('Making API call to /web/leaves/team-leaves with params:', params)
  return api.get('/web/leaves/team-leaves', { params })
}

export const approveLeave = (leaveId) =>
  api.patch(`/web/leaves/${leaveId}/approve`, {})

export const rejectLeave = (leaveId, rejection_reason) =>
  api.patch(`/web/leaves/${leaveId}/reject`, { rejection_reason })

export const requestLeave = (payload) =>
  api.post('/web/leaves/request', payload)

export const getMyLeaves = () =>
  api.get('/web/leaves/my-leaves')

export const deleteLeave = (leaveId) =>
  api.delete(`/web/leaves/${leaveId}`)
