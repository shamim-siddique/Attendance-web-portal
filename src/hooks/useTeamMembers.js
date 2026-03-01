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

      // Since the backend trims out manager names, roles, and status for /web/team
      // we can accurately infer and compute them here in the frontend instead of changing API routes.
      const enrichedData = res.data.map(member => {
        const manager = res.data.find(m => m.id === member.manager_id)
        const isManager = res.data.some(m => m.manager_id === member.id)

        let inferredRoles = ['employee']
        if (member.manager_id == null) inferredRoles = ['admin']
        else if (isManager) inferredRoles = ['manager', 'employee']

        return {
          ...member,
          manager_name: manager ? manager.username : '—',
          roles: inferredRoles,
          is_active: member.is_active !== undefined ? member.is_active : true
        }
      })

      setData(enrichedData)
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
