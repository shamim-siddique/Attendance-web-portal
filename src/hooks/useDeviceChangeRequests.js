import { useState, useEffect } from "react";
import { getDeviceChangeRequests } from "../api/services/team.service";

export function useDeviceChangeRequests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDeviceChangeRequests();
      // API returns { success, data: [...], meta: {...} }
      const items = res.data.data || res.data || [];

      // Map to format compatible with the frontend
      const mappedData = items.map((item) => ({
        ...item,
        // Map new field names to legacy names for UI compatibility
        old_device_id: item.currentDeviceIdSnapshot,
        new_device_id: item.requestedDeviceId,
        created_at: item.createdAt,
        // Status is now uppercase (PENDING, APPROVED, REJECTED)
        // Map to lowercase for UI compatibility
        status: item.status?.toLowerCase(),
        reviewComment: item.actionNote || null,
        // Map user info
        user: item.user
          ? {
              ...item.user,
              username: item.user.fullName,
            }
          : null,
      }));

      setData(mappedData);
    } catch (e) {
      setError(
        e.response?.data?.error?.message ||
          e.response?.data?.message ||
          "Failed to load device change requests",
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
