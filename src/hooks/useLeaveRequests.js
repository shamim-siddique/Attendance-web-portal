import { useState, useEffect } from "react";
import { getTeamLeaves } from "../api/services/leave.service";

export function useLeaveRequests(startDate, endDate, statusFilter) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeamLeaves(startDate, endDate, statusFilter);
      // API returns { success, data: [...], meta: {...} }
      const items = res.data.data || res.data || [];

      // Map to format compatible with the frontend
      const mappedData = items.map((item) => ({
        ...item,
        // Map new field names to legacy names for UI compatibility
        username: item.user?.fullName,
        email: item.user?.email,
        leave_date: item.startDate, // Use startDate as the primary date display
        created_at: item.createdAt,
        // Status is now uppercase (PENDING, APPROVED, REJECTED, CANCELLED)
        // Map to lowercase for UI compatibility
        status: item.status?.toLowerCase(),
        approved_by_name: item.actionBy?.fullName || null,
        rejection_reason: item.actionNote || null,
      }));

      setData(mappedData);
    } catch (e) {
      setError(
        e.response?.data?.error?.message ||
          e.response?.data?.message ||
          "Failed to load leave requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { data, loading, error, refetch: fetch };
}
