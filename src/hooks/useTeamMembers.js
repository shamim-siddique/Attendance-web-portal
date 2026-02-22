import { useState, useEffect } from 'react'
import { getTeamMembers } from '../api/services/team.service'

export function useTeamMembers() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTeamMembers()
      setData(res.data)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [])

  return { data, loading, error, refetch: fetch }
}
