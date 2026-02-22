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
      const res = await getTeamAttendance(startDate, endDate)
      setData(res.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [startDate, endDate])

  return { data, loading, error, refetch: fetch }
}
