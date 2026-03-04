import { useState, useEffect } from 'react'
import { getTeamAttendance } from '../api/services/team.service'

export function useTeamAttendance(startDate, endDate) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching attendance for:', startDate, 'to', endDate)
      const res = await getTeamAttendance(startDate, endDate)
      console.log('Attendance response:', res.data)
      setData(res.data)
    } catch (e) {
      console.error('Attendance fetch error:', e)
      setError(e.response?.data?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, []) // Only fetch on initial mount

  return { data, loading, error, refetch: fetch }
}
