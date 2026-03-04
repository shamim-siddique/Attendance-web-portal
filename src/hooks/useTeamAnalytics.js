import { useState, useEffect } from 'react'
import { getTeamAnalytics } from '../api/services/team.service'

export function useTeamAnalytics(startDate, endDate) {
  const [data, setData] = useState({ members: [], aggregate: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTeamAnalytics(startDate, endDate)
      setData(res.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, []) // Only fetch on initial mount

  return { data, loading, error, refetch: fetch }
}
