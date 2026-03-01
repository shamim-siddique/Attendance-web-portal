import { useState, useEffect } from 'react'
import { getTeamLeaves } from '../api/services/leave.service'

export function useLeaveRequests(startDate, endDate, statusFilter) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching leave requests with:', { startDate, endDate, statusFilter })
      const res = await getTeamLeaves(startDate, endDate, statusFilter)
      console.log('Leave requests response:', res.data)
      setData(res.data)
    } catch (e) {
      console.error('Leave requests fetch error:', e)
      setError(e.response?.data?.message || 'Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [startDate, endDate, statusFilter])

  return { data, loading, error, refetch: fetch }
}
