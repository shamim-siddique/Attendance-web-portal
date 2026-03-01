import { useState, useEffect } from 'react'
import { getDeviceChangeRequests } from '../api/services/team.service'

export function useDeviceChangeRequests() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetch = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await getDeviceChangeRequests()
            setData(res.data)
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load device change requests')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetch()
    }, [])

    return { data, loading, error, refetch: fetch }
}
