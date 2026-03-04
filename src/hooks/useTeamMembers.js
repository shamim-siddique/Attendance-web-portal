import { useState, useEffect } from 'react'
import { getTeamMembers } from '../api/services/team.service'
import { useAuth } from '../context/AuthContext'

export function useTeamMembers() {
  const { user: currentUser } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getTeamMembers()

      // Since the backend doesn't return manager_id in the team endpoint, 
      // we need to handle manager display appropriately
      const enrichedData = res.data.map(member => {
        // Try to find manager in team data (if manager_id was available)
        let manager = res.data.find(m => m.id === member.manager_id)
        
        // Determine manager name based on available information
        let managerName = '—'
        
        // If manager_id exists but manager not found in team data
        if (member.manager_id && !manager) {
          managerName = 'Manager not in team'
        } else if (manager) {
          managerName = manager.username
        }
        
        // Use actual roles from database, don't infer them
        let actualRoles = member.roles || ['employee']
        
        // If user has no manager_id and no roles, they might be admin
        if (member.manager_id == null && (!member.roles || member.roles.length === 0)) {
          actualRoles = ['admin']
        }

        return {
          ...member,
          manager_name: managerName,
          roles: actualRoles,
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
